/* GitHub Gist progress sync — optional cross-device "login".
   The user pastes a GitHub token (fine-grained, Gists read/write only). Progress
   is stored in a secret Gist and merged across devices: per-question/card records
   keep whichever device practiced most recently; activity days and lessons union;
   scenario best scores keep the max. Loaded after app.js (shares its top-level
   state/saveState/blankState/route/todayKey bindings). */
"use strict";

window.OTSYNC = (function () {
  const CFG_KEY = "otsec-sync-v1";
  const GIST_DESC = "OT-SEC Trainer progress sync";
  const GIST_FILE = "otsec-progress.json";
  const API = "https://api.github.com";

  let cfg = loadCfg();
  let status = cfg.token ? "idle" : "off"; // off | idle | syncing | ok | error
  let statusMsg = "";
  let dirty = false;
  let lastPushedJson = null;

  function loadCfg() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveCfg() { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); }

  function gh(path, opts) {
    opts = opts || {};
    return fetch(API + path, {
      method: opts.method || "GET",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + cfg.token,
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(r => {
      if (r.status === 401 || r.status === 403) throw new Error("Token rejected (check scopes/expiry)");
      if (!r.ok) throw new Error("GitHub API " + r.status);
      return r.status === 204 ? null : r.json();
    });
  }

  /* ---- merge: newer practice record wins per item; unions elsewhere ---- */
  function newer(a, b) { return (b && (b.last || 0) > ((a && a.last) || 0)) ? b : (a || b); }
  function mergeStates(a, b) {
    a = Object.assign(blankState(), a || {});
    b = Object.assign(blankState(), b || {});
    const out = blankState();
    ["q", "cards"].forEach(k => {
      new Set([...Object.keys(a[k]), ...Object.keys(b[k])]).forEach(id => {
        out[k][id] = newer(a[k][id], b[k][id]);
      });
    });
    new Set([...Object.keys(a.lessons), ...Object.keys(b.lessons)]).forEach(id => {
      out.lessons[id] = Math.min(a.lessons[id] || Infinity, b.lessons[id] || Infinity);
    });
    new Set([...Object.keys(a.scenarios), ...Object.keys(b.scenarios)]).forEach(id => {
      const ra = a.scenarios[id], rb = b.scenarios[id];
      if (!ra || !rb) { out.scenarios[id] = ra || rb; return; }
      out.scenarios[id] = {
        best: Math.max(ra.best || 0, rb.best || 0),
        max: ra.max || rb.max,
        runs: Math.max(ra.runs || 0, rb.runs || 0),
        last: Math.max(ra.last || 0, rb.last || 0)
      };
    });
    Object.assign(out.activity, a.activity, b.activity);
    return out;
  }

  /* ---- gist find/create, pull, push ---- */
  function findOrCreateGist() {
    if (cfg.gistId) return Promise.resolve(cfg.gistId);
    return gh("/gists?per_page=100").then(list => {
      const hit = (list || []).find(g => g.description === GIST_DESC || (g.files && g.files[GIST_FILE]));
      if (hit) { cfg.gistId = hit.id; saveCfg(); return hit.id; }
      return gh("/gists", {
        method: "POST",
        body: { description: GIST_DESC, public: false, files: { [GIST_FILE]: { content: payload() } } }
      }).then(g => { cfg.gistId = g.id; saveCfg(); return g.id; });
    });
  }
  function payload() {
    return JSON.stringify({ version: 1, updated: Date.now(), state: state }, null, 1);
  }
  function pullRemote(gistId) {
    return gh("/gists/" + gistId).then(g => {
      const f = g.files && g.files[GIST_FILE];
      if (!f) return null;
      const get = f.truncated ? fetch(f.raw_url).then(r => r.text()) : Promise.resolve(f.content);
      return get.then(text => {
        try { return JSON.parse(text).state || null; } catch (e) { return null; }
      });
    });
  }
  function pushRemote(gistId) {
    const body = payload();
    if (body === lastPushedJson) return Promise.resolve();
    return gh("/gists/" + gistId, {
      method: "PATCH",
      body: { files: { [GIST_FILE]: { content: body } } }
    }).then(() => { lastPushedJson = body; });
  }

  let syncing = null;
  function sync() {
    if (!cfg.token) return Promise.resolve();
    if (syncing) return syncing;
    status = "syncing"; statusMsg = ""; refreshUI();
    syncing = findOrCreateGist()
      .then(id => pullRemote(id).then(remote => {
        if (remote) {
          const before = JSON.stringify(state);
          state = mergeStates(state, remote);
          saveState();
          if (JSON.stringify(state) !== before && location.hash.indexOf("dashboard") !== -1) route();
        }
        return pushRemote(cfg.gistId);
      }))
      .then(() => {
        cfg.lastSync = Date.now(); saveCfg();
        status = "ok"; dirty = false;
      })
      .catch(e => { status = "error"; statusMsg = e.message || String(e); })
      .then(() => { syncing = null; refreshUI(); });
    return syncing;
  }

  function connect(token) {
    cfg = { token: token.trim() };
    saveCfg();
    return sync();
  }
  function disconnect() {
    cfg = {}; saveCfg();
    status = "off"; statusMsg = ""; lastPushedJson = null;
    refreshUI();
  }

  /* ---- auto-sync: pull+merge on load, push when state changed ---- */
  let lastSeen = null;
  setInterval(() => {
    if (!cfg.token) return;
    const now = JSON.stringify(state);
    if (lastSeen !== null && now !== lastSeen) dirty = true;
    lastSeen = now;
    if (dirty && !syncing) sync();
  }, 45000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && cfg.token && !syncing) sync();
  });
  if (cfg.token) setTimeout(sync, 500);

  /* ---- dashboard UI ---- */
  let mount = null;
  function refreshUI() { if (mount && document.body.contains(mount)) renderUI(mount); }
  function renderUI(el) {
    mount = el;
    el.innerHTML = "";
    if (!cfg.token) {
      el.appendChild(h(
        '<div><p class="muted">Sync progress across devices via a private GitHub Gist. Create a ' +
        '<a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">fine-grained token</a> ' +
        "with only the <strong>Gists: read and write</strong> account permission, then paste it here on each device.</p>" +
        '<div class="row"><input class="search grow" id="synctoken" type="password" placeholder="GitHub token (gists scope only)" style="margin-bottom:0">' +
        '<button class="btn primary" id="syncconnect">Connect</button></div>' +
        '<div class="syncmsg muted" style="margin-top:6px"></div></div>'
      ));
      el.querySelector("#syncconnect").onclick = () => {
        const t = el.querySelector("#synctoken").value.trim();
        if (!t) { el.querySelector(".syncmsg").textContent = "Paste a token first."; return; }
        el.querySelector(".syncmsg").textContent = "Connecting…";
        connect(t);
      };
      if (status === "error") el.querySelector(".syncmsg").textContent = "⚠ " + statusMsg;
      return;
    }
    const when = cfg.lastSync ? new Date(cfg.lastSync).toLocaleString() : "never";
    const line =
      status === "syncing" ? "⏳ Syncing…" :
      status === "error" ? "⚠ Sync error: " + esc(statusMsg) :
      "✅ Synced via private Gist · last sync " + esc(when);
    el.appendChild(h(
      '<div><p class="muted" style="margin-top:0">' + line + "</p>" +
      '<div class="row"><button class="btn" id="syncnow">↻ Sync now</button>' +
      '<button class="btn" id="syncoff">Disconnect</button></div></div>'
    ));
    el.querySelector("#syncnow").onclick = () => sync();
    el.querySelector("#syncoff").onclick = () => {
      if (confirm("Disconnect sync on this device? Progress stays local; the Gist is not deleted.")) disconnect();
    };
  }

  // app.js renders the initial view before this script runs; attach to it if present
  const early = document.getElementById("syncui");
  if (early) renderUI(early);

  return { renderUI: renderUI, sync: sync, mergeStates: mergeStates, connected: () => !!cfg.token };
})();
