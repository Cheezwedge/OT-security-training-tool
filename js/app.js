/* OT/ICS Security Trainer — application engine
   No build step, no backend. State persists to localStorage (export/import as JSON
   from the Dashboard). Content lives in data/*.js — see data/SCHEMA.md to edit. */
"use strict";

const DATA = window.OTSEC || { modules: [], scenarios: [], flashcards: [], glossary: [] };
DATA.modules.sort((a, b) => a.order - b.order);

/* ============ state ============ */
const STORE_KEY = "otsec-state-v1";
const DAY = 24 * 60 * 60 * 1000;
// Leitner box -> review interval in days. Wrong answers drop to box 1 (due immediately).
const BOX_INTERVALS = [0, 1, 3, 7, 21];

function blankState() {
  return { q: {}, cards: {}, lessons: {}, scenarios: {}, activity: {} };
}
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign(blankState(), JSON.parse(raw));
  } catch (e) { console.warn("state load failed", e); }
  return blankState();
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn("state save failed", e); }
}
function todayKey(ts) {
  const d = ts ? new Date(ts) : new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function recordActivity() {
  state.activity[todayKey()] = true;
  saveState();
}
function streak() {
  let n = 0;
  let t = Date.now();
  if (!state.activity[todayKey(t)]) t -= DAY; // streak survives until today is missed
  while (state.activity[todayKey(t)]) { n++; t -= DAY; }
  return n;
}

/* spaced repetition: grade an item in a tracking map (state.q or state.cards) */
function grade(map, id, correct) {
  const rec = map[id] || { box: 0, right: 0, wrong: 0, last: 0, due: 0 };
  if (correct) { rec.box = Math.min(rec.box + 1, 5); rec.right++; }
  else { rec.box = 1; rec.wrong++; }
  rec.last = Date.now();
  rec.due = Date.now() + BOX_INTERVALS[rec.box - 1] * DAY;
  map[id] = rec;
  recordActivity();
}
function isDue(rec) { return rec && rec.box < 5 ? rec.due <= Date.now() : rec ? rec.due <= Date.now() : false; }

/* ============ content indexes ============ */
const allQuestions = []; // {q, lesson, module}
const lessonById = {}, moduleById = {}, questionById = {};
DATA.modules.forEach(m => {
  moduleById[m.id] = m;
  m.lessons.forEach(l => {
    lessonById[l.id] = { lesson: l, module: m };
    l.quiz.forEach(q => {
      questionById[q.id] = { q, lesson: l, module: m };
      allQuestions.push({ q, lesson: l, module: m });
    });
  });
});
const scenarioById = {};
DATA.scenarios.forEach(s => scenarioById[s.id] = s);

/* ============ mastery & readiness ============ */
// question mastery: box 0 (unseen) .. 5 => 0..1
function qMastery(qid) {
  const rec = state.q[qid];
  return rec ? Math.min(rec.box, 5) / 5 : 0;
}
function cardMastery(cid) {
  const rec = state.cards[cid];
  return rec ? Math.min(rec.box, 5) / 5 : 0;
}
function moduleMastery(modId) {
  const m = moduleById[modId];
  if (!m) return 0;
  let sum = 0, n = 0;
  m.lessons.forEach(l => l.quiz.forEach(q => { sum += qMastery(q.id); n++; }));
  return n ? sum / n : 0;
}
function moduleLessonsRead(modId) {
  const m = moduleById[modId];
  return m.lessons.filter(l => state.lessons[l.id]).length;
}
function scenarioAvg() {
  const done = Object.values(state.scenarios).filter(s => s.max > 0);
  if (!done.length) return 0;
  return done.reduce((a, s) => a + s.best / s.max, 0) / done.length;
}
function interviewCardMastery() {
  const cards = DATA.flashcards.filter(c => (c.tags || []).includes("interview-prep"));
  if (!cards.length) return 0;
  return cards.reduce((a, c) => a + cardMastery(c.id), 0) / cards.length;
}
// readiness weights per target
const READINESS = [
  {
    id: "ic32", name: "ISA IC32 / 62443 Fundamentals",
    calc() {
      const w = { frameworks: 0.45, "security-core": 0.20, networking: 0.15, secops: 0.10, threats: 0.05, leadership: 0.05 };
      return Object.entries(w).reduce((a, [m, wt]) => a + moduleMastery(m) * wt, 0);
    }
  },
  {
    id: "gicsp", name: "GICSP Topics",
    calc() {
      const w = { networking: 0.20, "security-core": 0.20, frameworks: 0.20, secops: 0.20, threats: 0.15, leadership: 0.05 };
      return Object.entries(w).reduce((a, [m, wt]) => a + moduleMastery(m) * wt, 0);
    }
  },
  {
    id: "interview", name: "OT Sec Manager Interviews",
    calc() {
      const avg = DATA.modules.reduce((a, m) => a + moduleMastery(m.id), 0) / Math.max(DATA.modules.length, 1);
      return avg * 0.5 + scenarioAvg() * 0.3 + interviewCardMastery() * 0.2;
    }
  }
];

/* ============ tiny markdown renderer ============ */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inlineMd(s) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}
function md(text) {
  const lines = esc(text || "").split("\n");
  let html = "", list = null, para = [];
  const flushPara = () => {
    if (para.length) { html += "<p>" + inlineMd(para.join(" ")) + "</p>"; para = []; }
  };
  const flushList = () => {
    if (list) { html += list.tag === "ul" ? "</ul>" : "</ol>"; list = null; }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    let m;
    if ((m = line.match(/^####\s+(.*)/))) { flushPara(); flushList(); html += "<h4>" + inlineMd(m[1]) + "</h4>"; }
    else if ((m = line.match(/^###\s+(.*)/))) { flushPara(); flushList(); html += "<h3>" + inlineMd(m[1]) + "</h3>"; }
    else if ((m = line.match(/^[-•]\s+(.*)/))) {
      flushPara();
      if (!list || list.tag !== "ul") { flushList(); html += "<ul>"; list = { tag: "ul" }; }
      html += "<li>" + inlineMd(m[1]) + "</li>";
    }
    else if ((m = line.match(/^\d+[.)]\s+(.*)/))) {
      flushPara();
      if (!list || list.tag !== "ol") { flushList(); html += "<ol>"; list = { tag: "ol" }; }
      html += "<li>" + inlineMd(m[1]) + "</li>";
    }
    else { flushList(); para.push(line); }
  }
  flushPara(); flushList();
  return html;
}

/* ============ dom helpers ============ */
const main = document.getElementById("main");
function h(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content; }
function render(html) { main.innerHTML = ""; main.appendChild(typeof html === "string" ? h(html) : html); window.scrollTo(0, 0); }
function pct(x) { return Math.round(x * 100) + "%"; }
function bar(x, thick) {
  return '<div class="bar' + (thick ? " thick" : "") + '"><div style="width:' + Math.round(x * 100) + '%"></div></div>';
}

/* ============ quiz component ============ */
/* Renders a one-question-at-a-time quiz into container. questions: [{q, lesson, module}] */
function runQuiz(container, questions, opts) {
  opts = opts || {};
  let i = 0, right = 0;
  function show() {
    if (i >= questions.length) {
      container.innerHTML = "";
      container.appendChild(h(
        '<div class="card"><h2>' + (right === questions.length ? "💯" : "✅") + " Quiz complete</h2>" +
        "<p>You got <strong>" + right + " / " + questions.length + "</strong> correct." +
        (right < questions.length ? " Missed questions drop back to box 1 and will resurface in <a href='#/review'>Review</a> and Daily 15." : " Each correct answer moves the question up a review box.") +
        "</p></div>"
      ));
      if (opts.onDone) opts.onDone(right, questions.length);
      return;
    }
    const item = questions[i];
    const q = item.q;
    const frag = h(
      '<div class="card">' +
      '<div class="qprogress">Question ' + (i + 1) + " of " + questions.length +
      (item.lesson ? " · " + esc(item.lesson.title) : "") + "</div>" +
      "<p><strong>" + inlineMd(esc(q.q)) + "</strong></p>" +
      '<div class="opts"></div><div class="after"></div></div>'
    );
    const optsEl = frag.querySelector(".opts");
    const after = frag.querySelector(".after");
    q.options.forEach((opt, idx) => {
      const b = document.createElement("button");
      b.className = "quizopt";
      b.innerHTML = String.fromCharCode(65 + idx) + ". " + inlineMd(esc(opt));
      b.onclick = () => {
        const correct = idx === q.answer;
        if (correct) right++;
        grade(state.q, q.id, correct);
        saveState();
        optsEl.querySelectorAll("button").forEach((bb, bi) => {
          bb.disabled = true;
          if (bi === q.answer) bb.classList.add("correct");
          else if (bi === idx && !correct) bb.classList.add("wrong");
        });
        after.appendChild(h(
          '<div class="explain"><strong>' + (correct ? "Correct." : "Not quite.") + "</strong> " + inlineMd(esc(q.explain || "")) + "</div>"
        ));
        const next = document.createElement("button");
        next.className = "btn primary";
        next.style.marginTop = "12px";
        next.textContent = i + 1 < questions.length ? "Next question →" : "Finish";
        next.onclick = () => { i++; show(); };
        after.appendChild(next);
        next.focus();
      };
      optsEl.appendChild(b);
    });
    container.innerHTML = "";
    container.appendChild(frag);
    window.scrollTo(0, 0);
  }
  show();
}

/* ============ flashcard component ============ */
function runCards(container, cards, opts) {
  opts = opts || {};
  let i = 0, knew = 0;
  function show() {
    if (i >= cards.length) {
      container.innerHTML = "";
      container.appendChild(h(
        '<div class="card"><h2>🗂 Deck done</h2><p>Knew <strong>' + knew + " / " + cards.length +
        "</strong>. Missed cards return to box 1 and come back sooner.</p></div>"
      ));
      if (opts.onDone) opts.onDone(knew, cards.length);
      return;
    }
    const c = cards[i];
    let flipped = false;
    const frag = h(
      '<div><div class="qprogress">Card ' + (i + 1) + " of " + cards.length + " · " +
      (c.tags || []).map(t => '<span class="pill">' + esc(t) + "</span>").join("") + "</div>" +
      '<div class="flashcard"><div class="face"><div>' + inlineMd(esc(c.front)) + '</div><div class="hint">tap to flip</div></div></div>' +
      '<div class="gradebtns" style="visibility:hidden">' +
      '<button class="btn missed">✗ Didn\'t know</button>' +
      '<button class="btn knew">✓ Knew it</button></div></div>'
    );
    const cardEl = frag.querySelector(".flashcard");
    const btns = frag.querySelector(".gradebtns");
    cardEl.onclick = () => {
      flipped = !flipped;
      cardEl.querySelector(".face").innerHTML = flipped
        ? '<div class="back-text">' + inlineMd(esc(c.back)) + '</div><div class="hint">tap to flip back</div>'
        : "<div>" + inlineMd(esc(c.front)) + '</div><div class="hint">tap to flip</div>';
      btns.style.visibility = "visible";
    };
    btns.querySelector(".knew").onclick = () => { knew++; grade(state.cards, c.id, true); saveState(); i++; show(); };
    btns.querySelector(".missed").onclick = () => { grade(state.cards, c.id, false); saveState(); i++; show(); };
    container.innerHTML = "";
    container.appendChild(frag);
  }
  show();
}

/* ============ views ============ */
const views = {};

/* ---- dashboard ---- */
views.dashboard = () => {
  const dueQ = allQuestions.filter(x => state.q[x.q.id] && state.q[x.q.id].due <= Date.now() && state.q[x.q.id].box < 5).length;
  const dueC = DATA.flashcards.filter(c => state.cards[c.id] && state.cards[c.id].due <= Date.now() && state.cards[c.id].box < 5).length;
  const lessonsTotal = DATA.modules.reduce((a, m) => a + m.lessons.length, 0);
  const lessonsRead = Object.keys(state.lessons).length;
  const scensDone = Object.keys(state.scenarios).length;

  // weakest topics: lessons with lowest avg question mastery among attempted-or-read material
  const weakest = [];
  DATA.modules.forEach(m => m.lessons.forEach(l => {
    const touched = state.lessons[l.id] || l.quiz.some(q => state.q[q.id]);
    if (!touched) return;
    const avg = l.quiz.reduce((a, q) => a + qMastery(q.id), 0) / Math.max(l.quiz.length, 1);
    weakest.push({ l, m, avg });
  }));
  weakest.sort((a, b) => a.avg - b.avg);

  const frag = h(
    "<div><h1>Dashboard</h1>" +
    '<div class="statgrid">' +
    '<div class="stat"><div class="num">🔥 ' + streak() + '</div><div class="lbl">day streak</div></div>' +
    '<div class="stat"><div class="num">' + lessonsRead + "/" + lessonsTotal + '</div><div class="lbl">lessons read</div></div>' +
    '<div class="stat"><div class="num">' + (dueQ + dueC) + '</div><div class="lbl">items due for review</div></div>' +
    '<div class="stat"><div class="num">' + scensDone + "/" + DATA.scenarios.length + '</div><div class="lbl">scenarios run</div></div>' +
    "</div>" +
    '<a class="btn primary big" href="#/daily">⚡ Daily 15 — start today\'s session</a>' +
    '<div class="card" style="margin-top:14px"><h2>Module mastery</h2><div class="mods"></div></div>' +
    '<div class="card"><h2>Readiness estimates</h2><p class="muted">Driven by quiz mastery, scenario performance, and interview-tagged flashcards. Treat as a study compass, not a guarantee.</p><div class="readiness"></div></div>' +
    '<div class="card weak"><h2>Weakest topics</h2></div>' +
    '<div class="card"><h2>Sync & progress data</h2><div id="syncui"></div>' +
    '<p class="muted">Progress lives in this browser\'s localStorage. Export a JSON backup any time.</p>' +
    '<div class="row"><button class="btn" id="exp">⬇ Export JSON</button><button class="btn" id="imp">⬆ Import JSON</button><button class="btn" id="rst">Reset progress</button></div></div>' +
    "</div>"
  );

  const mods = frag.querySelector(".mods");
  DATA.modules.forEach(m => {
    const ms = moduleMastery(m.id);
    mods.appendChild(h(
      '<div class="modrow"><div class="name"><a href="#/module/' + m.id + '">' + esc(m.title) + "</a>" +
      '<div class="muted">' + moduleLessonsRead(m.id) + "/" + m.lessons.length + " lessons</div></div>" +
      bar(ms) + '<div class="pct">' + pct(ms) + "</div></div>"
    ));
  });

  const rd = frag.querySelector(".readiness");
  READINESS.forEach(r => {
    const v = r.calc();
    rd.appendChild(h('<div class="stat"><div class="num">' + pct(v) + '</div><div class="lbl">' + esc(r.name) + "</div>" + bar(v) + "</div>"));
  });

  const weak = frag.querySelector(".weak");
  if (!weakest.length) weak.appendChild(h('<p class="muted">Start a lesson or quiz and your weak spots will surface here.</p>'));
  else weakest.slice(0, 5).forEach(w => {
    weak.appendChild(h(
      '<div class="modrow"><div class="name"><a href="#/lesson/' + w.l.id + '">' + esc(w.l.title) + '</a><div class="muted">' + esc(w.m.title) + "</div></div>" +
      bar(w.avg) + '<div class="pct">' + pct(w.avg) + "</div></div>"
    ));
  });

  if (window.OTSYNC) window.OTSYNC.renderUI(frag.querySelector("#syncui"));
  frag.querySelector("#exp").onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "otsec-progress-" + todayKey() + ".json";
    a.click();
  };
  frag.querySelector("#imp").onclick = () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return;
      f.text().then(t => {
        try { state = Object.assign(blankState(), JSON.parse(t)); saveState(); route(); }
        catch (e) { alert("Could not parse that file as progress JSON."); }
      });
    };
    inp.click();
  };
  frag.querySelector("#rst").onclick = () => {
    if (confirm("Wipe all progress (quiz history, streak, scenario results)? Export a backup first if unsure.")) {
      state = blankState(); saveState(); route();
    }
  };
  render(frag);
};

/* ---- modules list ---- */
views.modules = () => {
  const frag = h("<div><h1>Learning paths</h1><div class='list'></div></div>");
  const list = frag.querySelector(".list");
  DATA.modules.forEach(m => {
    const ms = moduleMastery(m.id);
    list.appendChild(h(
      '<a class="itemrow" href="#/module/' + m.id + '"><div class="grow"><strong>' + m.order + ". " + esc(m.title) + "</strong>" +
      '<div class="meta">' + esc(m.tagline || "") + "</div>" +
      '<div class="meta">' + moduleLessonsRead(m.id) + "/" + m.lessons.length + " lessons · mastery " + pct(ms) + "</div></div>" +
      '<div style="width:70px">' + bar(ms) + "</div></a>"
    ));
  });
  render(frag);
};

/* ---- module detail ---- */
views.module = (id) => {
  const m = moduleById[id];
  if (!m) return views.modules();
  const frag = h(
    '<div><p><a href="#/modules">← All modules</a></p><h1>' + esc(m.title) + "</h1>" +
    '<div class="card">' + md(m.description) + bar(moduleMastery(m.id), true) +
    '<p class="muted" style="margin-bottom:0">Mastery ' + pct(moduleMastery(m.id)) + " · " + moduleLessonsRead(m.id) + "/" + m.lessons.length + " lessons read</p></div>" +
    "<div class='list'></div><div class='ivpwrap'></div></div>"
  );
  const list = frag.querySelector(".list");
  m.lessons.forEach((l, idx) => {
    const read = !!state.lessons[l.id];
    const avg = l.quiz.reduce((a, q) => a + qMastery(q.id), 0) / Math.max(l.quiz.length, 1);
    list.appendChild(h(
      '<a class="itemrow" href="#/lesson/' + l.id + '">' +
      "<div>" + (read ? '<span class="check">✓</span>' : (idx + 1) + ".") + "</div>" +
      '<div class="grow"><strong>' + esc(l.title) + "</strong>" +
      '<div class="meta">~' + (l.minutes || 8) + " min · " + l.quiz.length + " quiz questions · mastery " + pct(avg) + "</div></div></a>"
    ));
  });
  const ivp = frag.querySelector(".ivpwrap");
  if (m.interviewPrep && m.interviewPrep.length) {
    const card = h('<div class="card"><h2>🎤 How this shows up in interviews</h2></div>').firstElementChild;
    m.interviewPrep.forEach(p => {
      card.appendChild(h(
        '<details class="ivp"><summary>' + esc(p.question) + '</summary><div class="body">' + md(p.answerOutline) + "</div></details>"
      ));
    });
    ivp.appendChild(card);
  }
  render(frag);
};

/* ---- lesson ---- */
views.lesson = (id) => {
  const entry = lessonById[id];
  if (!entry) return views.modules();
  const { lesson: l, module: m } = entry;
  const idx = m.lessons.indexOf(l);
  const next = m.lessons[idx + 1];
  const frag = h(
    '<div><p><a href="#/module/' + m.id + '">← ' + esc(m.title) + "</a></p>" +
    "<h1>" + esc(l.title) + "</h1>" +
    '<div class="card lesson-content">' + md(l.content) +
    '<div class="bridge"><div class="tag">⚙ BRIDGE — FROM YOUR CONTROLS WORLD</div>' + md(l.bridge || "") + "</div></div>" +
    '<div class="quizmount"><button class="btn primary big" id="startq">Take the quiz (' + l.quiz.length + " questions)</button></div>" +
    '<div class="row" style="margin-top:14px">' +
    (next ? '<a class="btn" href="#/lesson/' + next.id + '">Next lesson →</a>' : '<a class="btn" href="#/module/' + m.id + '">Back to module</a>') +
    "</div></div>"
  );
  if (!state.lessons[l.id]) { state.lessons[l.id] = Date.now(); recordActivity(); saveState(); }
  const mount = frag.querySelector(".quizmount");
  frag.querySelector("#startq").onclick = () => {
    runQuiz(mount, l.quiz.map(q => ({ q, lesson: l, module: m })));
  };
  render(frag);
};

/* ---- review (spaced repetition queue) ---- */
views.review = () => {
  const dueQ = allQuestions.filter(x => { const r = state.q[x.q.id]; return r && r.due <= Date.now() && r.box < 5; });
  const dueC = DATA.flashcards.filter(c => { const r = state.cards[c.id]; return r && r.due <= Date.now() && r.box < 5; });
  const frag = h(
    "<div><h1>Review queue</h1>" +
    '<p class="muted">Spaced repetition: wrong answers come back fast (box 1 → today), right answers stretch out (1 → 3 → 7 → 21 days). Box 5 = mastered.</p>' +
    '<div class="statgrid">' +
    '<div class="stat"><div class="num">' + dueQ.length + '</div><div class="lbl">quiz questions due</div></div>' +
    '<div class="stat"><div class="num">' + dueC.length + '</div><div class="lbl">flashcards due</div></div></div>' +
    '<div class="row">' +
    (dueQ.length ? '<button class="btn primary" id="rq">Review questions</button>' : "") +
    (dueC.length ? '<button class="btn primary" id="rc">Review flashcards</button>' : "") +
    "</div><div class='mount' style='margin-top:14px'></div>" +
    (!dueQ.length && !dueC.length ? '<div class="card"><p>Nothing due. 🎉 Read a new <a href="#/modules">lesson</a> or run a <a href="#/scenarios">scenario</a>.</p></div>' : "") +
    "</div>"
  );
  const mount = frag.querySelector(".mount");
  const bq = frag.querySelector("#rq");
  if (bq) bq.onclick = () => runQuiz(mount, shuffle(dueQ).slice(0, 15));
  const bc = frag.querySelector("#rc");
  if (bc) bc.onclick = () => runCards(mount, shuffle(dueC).slice(0, 20));
  render(frag);
};

/* ---- scenarios ---- */
views.scenarios = () => {
  const frag = h(
    "<div><h1>Scenario simulator</h1>" +
    '<p class="muted">Tabletop decision drills. There is usually one best move, some defensible ones, and a few that make the incident worse. Replays update your best score.</p>' +
    "<div class='list'></div></div>"
  );
  const list = frag.querySelector(".list");
  DATA.scenarios.forEach(s => {
    const rec = state.scenarios[s.id];
    list.appendChild(h(
      '<a class="itemrow" href="#/scenario/' + s.id + '"><div class="grow"><strong>' + esc(s.title) + "</strong>" +
      '<div class="meta"><span class="pill ' + (s.category === "leadership" ? "warn" : "accent") + '">' + esc(s.category) + "</span>" +
      (rec ? "best score " + rec.best + "/" + rec.max : "not attempted") + "</div></div>" +
      (rec ? '<span class="check">✓</span>' : "") + "</a>"
    ));
  });
  render(frag);
};

views.scenario = (id) => {
  const s = scenarioById[id];
  if (!s) return views.scenarios();
  let step = 0, score = 0;
  const max = s.steps.length * 2;
  const frag = h(
    '<div><p><a href="#/scenarios">← Scenarios</a></p><h1>' + esc(s.title) + "</h1>" +
    '<div class="card"><span class="pill ' + (s.category === "leadership" ? "warn" : "accent") + '">' + esc(s.category) + "</span>" +
    '<div style="margin-top:8px">' + md(s.context) + "</div></div>" +
    "<div class='mount'></div></div>"
  );
  const mount = frag.querySelector(".mount");
  function showStep() {
    if (step >= s.steps.length) {
      const rec = state.scenarios[s.id] || { best: 0, max, runs: 0 };
      rec.best = Math.max(rec.best, score); rec.max = max; rec.runs = (rec.runs || 0) + 1; rec.last = Date.now();
      state.scenarios[s.id] = rec;
      recordActivity(); saveState();
      mount.innerHTML = "";
      mount.appendChild(h(
        '<div class="card"><h2>Debrief — score ' + score + "/" + max + "</h2>" + md(s.debrief) +
        '<div class="row" style="margin-top:10px"><a class="btn" href="#/scenario/' + s.id + '">Replay</a><a class="btn primary" href="#/scenarios">More scenarios</a></div></div>'
      ));
      return;
    }
    const st = s.steps[step];
    const card = h(
      '<div class="card"><div class="qprogress">Decision ' + (step + 1) + " of " + s.steps.length + "</div>" +
      "<p><strong>" + inlineMd(esc(st.prompt)) + "</strong></p><div class='choices'></div><div class='after'></div></div>"
    ).firstElementChild;
    const choices = card.querySelector(".choices");
    const after = card.querySelector(".after");
    st.choices.forEach(c => {
      const b = document.createElement("button");
      b.className = "choice";
      b.innerHTML = inlineMd(esc(c.text));
      b.onclick = () => {
        choices.querySelectorAll("button").forEach(bb => bb.disabled = true);
        const pts = c.quality === "best" ? 2 : c.quality === "ok" ? 1 : 0;
        score += pts;
        const verdict = c.quality === "best" ? "STRONG MOVE (+2)" : c.quality === "ok" ? "DEFENSIBLE (+1)" : "RISKY (+0)";
        after.appendChild(h(
          '<div class="feedback ' + c.quality + '"><div class="verdict">' + verdict + "</div>" + md(c.feedback) + "</div>"
        ));
        const next = document.createElement("button");
        next.className = "btn primary";
        next.textContent = step + 1 < s.steps.length ? "Next decision →" : "Finish & debrief";
        next.onclick = () => { step++; showStep(); };
        after.appendChild(next);
      };
      choices.appendChild(b);
    });
    mount.innerHTML = "";
    mount.appendChild(card);
    window.scrollTo(0, 0);
  }
  showStep();
  render(frag);
};

/* ---- flashcards ---- */
views.cards = () => {
  const tags = [...new Set(DATA.flashcards.flatMap(c => c.tags || []))].sort();
  const dueCount = DATA.flashcards.filter(c => { const r = state.cards[c.id]; return r && r.due <= Date.now() && r.box < 5; }).length;
  const newCount = DATA.flashcards.filter(c => !state.cards[c.id]).length;
  const frag = h(
    "<div><h1>Flashcards</h1>" +
    '<div class="statgrid">' +
    '<div class="stat"><div class="num">' + DATA.flashcards.length + '</div><div class="lbl">total cards</div></div>' +
    '<div class="stat"><div class="num">' + dueCount + '</div><div class="lbl">due</div></div>' +
    '<div class="stat"><div class="num">' + newCount + '</div><div class="lbl">unseen</div></div></div>' +
    '<div class="card"><h2>Start a session</h2><div class="row">' +
    '<button class="btn primary" data-deck="smart">Smart mix (due + new)</button>' +
    '<button class="btn" data-deck="interview-prep">🎤 Interview prep</button>' +
    '<button class="btn" data-deck="all">Random 20</button></div>' +
    '<p class="muted" style="margin-bottom:4px">By tag:</p><div class="row tagrow"></div>' +
    '<p class="muted" style="margin-bottom:4px">By module:</p><div class="row modrow2"></div></div>' +
    "<div class='mount'></div></div>"
  );
  const tagrow = frag.querySelector(".tagrow");
  tags.filter(t => t !== "interview-prep").forEach(t => {
    const b = document.createElement("button");
    b.className = "btn"; b.textContent = t; b.dataset.deck = "tag:" + t;
    tagrow.appendChild(b);
  });
  const modrow = frag.querySelector(".modrow2");
  DATA.modules.forEach(m => {
    const b = document.createElement("button");
    b.className = "btn"; b.textContent = m.title.split(" ")[0] + "…"; b.title = m.title; b.dataset.deck = "mod:" + m.id;
    modrow.appendChild(b);
  });
  const mount = frag.querySelector(".mount");
  frag.querySelectorAll("[data-deck]").forEach(b => {
    b.onclick = () => {
      const d = b.dataset.deck;
      let cards;
      if (d === "smart") {
        const due = DATA.flashcards.filter(c => { const r = state.cards[c.id]; return r && r.due <= Date.now() && r.box < 5; });
        const fresh = DATA.flashcards.filter(c => !state.cards[c.id]);
        cards = shuffle(due).slice(0, 12).concat(shuffle(fresh).slice(0, Math.max(0, 15 - Math.min(due.length, 12))));
      }
      else if (d === "all") cards = shuffle(DATA.flashcards.slice()).slice(0, 20);
      else if (d === "interview-prep") cards = shuffle(DATA.flashcards.filter(c => (c.tags || []).includes("interview-prep"))).slice(0, 20);
      else if (d.startsWith("tag:")) cards = shuffle(DATA.flashcards.filter(c => (c.tags || []).includes(d.slice(4)))).slice(0, 20);
      else cards = shuffle(DATA.flashcards.filter(c => c.module === d.slice(4))).slice(0, 20);
      if (!cards.length) { mount.innerHTML = '<div class="card"><p>No cards match.</p></div>'; return; }
      runCards(mount, cards);
      mount.scrollIntoView({ behavior: "smooth" });
    };
  });
  render(frag);
};

/* ---- glossary ---- */
views.glossary = () => {
  const frag = h(
    "<div><h1>Glossary</h1>" +
    '<input class="search" id="gsearch" type="search" placeholder="Search terms, acronyms, definitions… (' + DATA.glossary.length + ' terms)">' +
    "<div class='list'></div></div>"
  );
  const list = frag.querySelector(".list");
  const terms = DATA.glossary.slice().sort((a, b) => a.term.localeCompare(b.term));
  function draw(filter) {
    list.innerHTML = "";
    const f = (filter || "").toLowerCase();
    const hits = terms.filter(t =>
      !f || t.term.toLowerCase().includes(f) || (t.def || "").toLowerCase().includes(f) || (t.bridge || "").toLowerCase().includes(f)
    );
    if (!hits.length) { list.innerHTML = '<p class="muted">No matches.</p>'; return; }
    hits.forEach(t => {
      list.appendChild(h(
        '<div class="card"><span class="gloss-term">' + esc(t.term) + "</span> " +
        (t.tags || []).map(x => '<span class="pill">' + esc(x) + "</span>").join("") +
        "<div>" + md(t.def) + "</div>" +
        (t.bridge ? '<div class="bridge"><div class="tag">⚙ BRIDGE</div>' + md(t.bridge) + "</div>" : "") +
        "</div>"
      ));
    });
  }
  frag.querySelector("#gsearch").addEventListener("input", e => draw(e.target.value));
  draw("");
  render(frag);
};

/* ---- Daily 15 ---- */
views.daily = () => {
  // build the session plan: ~5 cards, 1 lesson, ~5 quiz questions
  const dueCards = DATA.flashcards.filter(c => { const r = state.cards[c.id]; return r && r.due <= Date.now() && r.box < 5; });
  const newCards = DATA.flashcards.filter(c => !state.cards[c.id]);
  const cards = shuffle(dueCards).slice(0, 5);
  while (cards.length < 5 && newCards.length) cards.push(newCards.splice(Math.floor(Math.random() * newCards.length), 1)[0]);

  // next unread lesson from the weakest started module, else first unread overall
  let lessonPick = null;
  const orderedMods = DATA.modules.slice().sort((a, b) => moduleMastery(a.id) - moduleMastery(b.id));
  for (const m of [...orderedMods.filter(m => moduleLessonsRead(m.id) > 0), ...DATA.modules]) {
    const unread = m.lessons.find(l => !state.lessons[l.id]);
    if (unread) { lessonPick = { lesson: unread, module: m }; break; }
  }

  const dueQ = allQuestions.filter(x => { const r = state.q[x.q.id]; return r && r.due <= Date.now() && r.box < 5; });
  let quizPick = shuffle(dueQ).slice(0, 5);
  if (quizPick.length < 5 && lessonPick) {
    quizPick = quizPick.concat(lessonPick.lesson.quiz.slice(0, 5 - quizPick.length).map(q => ({ q, lesson: lessonPick.lesson, module: lessonPick.module })));
  }
  if (quizPick.length < 5) {
    const unseen = allQuestions.filter(x => !state.q[x.q.id]);
    quizPick = quizPick.concat(shuffle(unseen).slice(0, 5 - quizPick.length));
  }

  let phase = 0;
  const frag = h(
    "<div><h1>⚡ Daily 15</h1>" +
    '<p class="muted">' + cards.length + " flashcards → 1 lesson → " + quizPick.length + " quiz questions. ~15 minutes. Streak: 🔥 " + streak() + "</p>" +
    "<div class='mount'></div></div>"
  );
  const mount = frag.querySelector(".mount");

  function phaseCards() {
    if (!cards.length) return phaseLesson();
    mount.appendChild(h('<div class="daily-step">STEP 1 / 3 — FLASHCARDS</div>'));
    const cm = document.createElement("div");
    mount.appendChild(cm);
    runCards(cm, cards, { onDone: () => setTimeout(phaseLesson, 600) });
  }
  function phaseLesson() {
    mount.innerHTML = "";
    if (!lessonPick) return phaseQuiz();
    const { lesson: l, module: m } = lessonPick;
    mount.appendChild(h(
      '<div class="daily-step">STEP 2 / 3 — LESSON</div>' +
      "<h2>" + esc(l.title) + '</h2><p class="muted">' + esc(m.title) + " · ~" + (l.minutes || 8) + " min</p>" +
      '<div class="card lesson-content">' + md(l.content) +
      '<div class="bridge"><div class="tag">⚙ BRIDGE — FROM YOUR CONTROLS WORLD</div>' + md(l.bridge || "") + "</div></div>" +
      '<button class="btn primary big" id="dl-next">Done reading → quiz</button>'
    ));
    if (!state.lessons[l.id]) { state.lessons[l.id] = Date.now(); recordActivity(); saveState(); }
    mount.querySelector("#dl-next").onclick = phaseQuiz;
    window.scrollTo(0, 0);
  }
  function phaseQuiz() {
    mount.innerHTML = "";
    if (!quizPick.length) return phaseDone(0, 0);
    mount.appendChild(h('<div class="daily-step">STEP 3 / 3 — QUIZ</div>'));
    const qm = document.createElement("div");
    mount.appendChild(qm);
    runQuiz(qm, quizPick, { onDone: (r, n) => phaseDone(r, n) });
  }
  function phaseDone(r, n) {
    recordActivity(); saveState();
    mount.appendChild(h(
      '<div class="card"><h2>✅ Daily 15 complete</h2><p>Streak: 🔥 <strong>' + streak() + " days</strong>." +
      (n ? " Quiz: " + r + "/" + n + "." : "") +
      ' Same time tomorrow.</p><a class="btn primary" href="#/dashboard">Back to dashboard</a></div>'
    ));
  }
  phaseCards();
  render(frag);
};

/* ============ utils & router ============ */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function route() {
  const hash = location.hash.replace(/^#\//, "") || "dashboard";
  const [view, arg] = hash.split("/");
  document.querySelectorAll("[data-nav]").forEach(a => {
    a.classList.toggle("active", a.dataset.nav === view ||
      (a.dataset.nav === "modules" && ["module", "lesson"].includes(view)) ||
      (a.dataset.nav === "scenarios" && view === "scenario"));
  });
  (views[view] || views.dashboard)(arg);
}
window.addEventListener("hashchange", route);

if (!DATA.modules.length) {
  render('<div class="card"><h2>No content loaded</h2><p>The data files in <code>data/</code> did not load. If you opened this over a server, check the console; data files must be present.</p></div>');
} else {
  route();
}
