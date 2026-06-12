#!/usr/bin/env node
/* Content library validator. Run: node validate.js
   Loads every data/*.js file the way the browser would and checks the schema. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const files = [
  "data/modules/01-networking.js",
  "data/modules/02-security-core.js",
  "data/modules/03-frameworks.js",
  "data/modules/04-threats.js",
  "data/modules/05-secops.js",
  "data/modules/06-ai-ot.js",
  "data/modules/07-leadership.js",
  "data/scenarios.js",
  "data/flashcards.js",
  "data/glossary.js",
];

const ctx = { window: {} };
vm.createContext(ctx);
let failed = false;
const err = (msg) => { console.error("  ✗ " + msg); failed = true; };

for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { console.error("✗ MISSING FILE: " + f); failed = true; continue; }
  try {
    vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
    console.log("✓ parsed " + f);
  } catch (e) {
    console.error("✗ PARSE ERROR in " + f + ": " + e.message); failed = true;
  }
}

const D = ctx.window.OTSEC || {};
const modules = D.modules || [], scenarios = D.scenarios || [], flashcards = D.flashcards || [], glossary = D.glossary || [];
const ids = new Set();
const uniq = (id, kind) => { if (ids.has(id)) err("duplicate id " + id + " (" + kind + ")"); ids.add(id); };
const words = (s) => String(s || "").trim().split(/\s+/).length;

console.log("\n--- modules ---");
const wantMods = ["networking", "security-core", "frameworks", "threats", "secops", "ai", "leadership"];
for (const want of wantMods) if (!modules.find(m => m.id === want)) err("missing module: " + want);
let totalLessons = 0, totalQ = 0;
for (const m of modules) {
  uniq(m.id, "module");
  if (!m.title || !m.description) err(m.id + ": missing title/description");
  if (!Array.isArray(m.interviewPrep) || m.interviewPrep.length < 2) err(m.id + ": needs >=2 interviewPrep items");
  if (!Array.isArray(m.lessons) || m.lessons.length < 5) err(m.id + ": needs >=5 lessons, has " + (m.lessons || []).length);
  for (const l of m.lessons || []) {
    uniq(l.id, "lesson");
    totalLessons++;
    const w = words(l.content);
    if (w < 350) err(l.id + ": content too short (" + w + " words)");
    if (w > 1100) err(l.id + ": content too long (" + w + " words)");
    if (!l.bridge || words(l.bridge) < 25) err(l.id + ": bridge note missing/too short");
    if (!Array.isArray(l.quiz) || l.quiz.length < 3 || l.quiz.length > 5) err(l.id + ": needs 3-5 quiz questions, has " + (l.quiz || []).length);
    for (const q of l.quiz || []) {
      uniq(q.id, "question");
      totalQ++;
      if (!Array.isArray(q.options) || q.options.length !== 4) err(q.id + ": needs exactly 4 options");
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err(q.id + ": bad answer index");
      if (!q.explain) err(q.id + ": missing explain");
    }
  }
  console.log("  " + m.id + ": " + (m.lessons || []).length + " lessons, " +
    (m.lessons || []).reduce((a, l) => a + (l.quiz || []).length, 0) + " questions");
}

console.log("\n--- scenarios: " + scenarios.length + " ---");
if (scenarios.length < 8) err("need >=8 scenarios");
for (const s of scenarios) {
  uniq(s.id, "scenario");
  if (!["technical", "leadership"].includes(s.category)) err(s.id + ": bad category " + s.category);
  if (!s.context || !s.debrief) err(s.id + ": missing context/debrief");
  if (!Array.isArray(s.steps) || s.steps.length < 3) err(s.id + ": needs >=3 steps");
  for (const [i, st] of (s.steps || []).entries()) {
    if (!Array.isArray(st.choices) || st.choices.length < 3) err(s.id + " step " + i + ": needs >=3 choices");
    const best = (st.choices || []).filter(c => c.quality === "best").length;
    if (best !== 1) err(s.id + " step " + i + ": needs exactly 1 'best' choice, has " + best);
    for (const c of st.choices || []) {
      if (!["best", "ok", "poor"].includes(c.quality)) err(s.id + " step " + i + ": bad quality " + c.quality);
      if (!c.feedback || words(c.feedback) < 20) err(s.id + " step " + i + ": feedback missing/too short");
    }
  }
}

console.log("--- flashcards: " + flashcards.length + " ---");
if (flashcards.length < 60) err("need >=60 flashcards");
let ivpCards = 0;
for (const c of flashcards) {
  uniq(c.id, "flashcard");
  if (!c.front || !c.back) err(c.id + ": missing front/back");
  if (!wantMods.includes(c.module)) err(c.id + ": bad module " + c.module);
  if ((c.tags || []).includes("interview-prep")) ivpCards++;
}
console.log("  interview-prep tagged: " + ivpCards);
if (ivpCards < 20) err("need >=20 interview-prep cards");

console.log("--- glossary: " + glossary.length + " ---");
if (glossary.length < 50) err("need >=50 glossary terms");
const seenTerms = new Set();
for (const g of glossary) {
  if (!g.term || !g.def) err("glossary entry missing term/def: " + JSON.stringify(g).slice(0, 60));
  if (seenTerms.has(g.term)) err("duplicate glossary term: " + g.term);
  seenTerms.add(g.term);
}

console.log("\nTOTALS: " + modules.length + " modules, " + totalLessons + " lessons, " + totalQ +
  " quiz questions, " + scenarios.length + " scenarios, " + flashcards.length + " flashcards, " + glossary.length + " glossary terms");
if (failed) { console.error("\nVALIDATION FAILED"); process.exit(1); }
console.log("VALIDATION PASSED");
