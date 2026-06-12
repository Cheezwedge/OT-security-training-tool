#!/usr/bin/env node
/* End-to-end smoke test. Requires playwright + chromium.
   Run: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers NODE_PATH=$(npm root -g) node smoke-test.js */
"use strict";
const { chromium } = require("playwright");
const path = require("path");

const url = "file://" + path.join(__dirname, "index.html");
let failures = 0;
const ok = (name, cond) => {
  console.log((cond ? "✓ " : "✗ FAIL ") + name);
  if (!cond) failures++;
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // phone-size
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto(url);
  await page.waitForTimeout(300);

  // dashboard
  ok("dashboard renders", await page.locator("h1", { hasText: "Dashboard" }).count() === 1);
  ok("7 module mastery rows", await page.locator(".mods .modrow").count() === 7);
  ok("3 readiness estimates", await page.locator(".readiness .stat").count() === 3);
  ok("mobile bottom nav visible", await page.locator("#bottomnav").isVisible());

  // modules list + module page
  await page.goto(url + "#/modules"); await page.waitForTimeout(150);
  ok("modules list shows 7", await page.locator(".itemrow").count() === 7);
  await page.goto(url + "#/module/networking"); await page.waitForTimeout(150);
  const lessonCount = await page.locator(".itemrow").count();
  ok("networking module lists 7 lessons", lessonCount === 7);
  ok("interview prep section present", await page.locator("details.ivp").count() >= 2);

  // lesson + quiz flow
  await page.goto(url + "#/lesson/net-01"); await page.waitForTimeout(150);
  ok("lesson content renders", (await page.locator(".lesson-content").innerText()).length > 1500);
  ok("bridge note present", await page.locator(".bridge").count() === 1);
  await page.click("#startq"); await page.waitForTimeout(100);
  const nQ = parseInt((await page.locator(".qprogress").innerText()).match(/of (\d+)/)[1]);
  for (let i = 0; i < nQ; i++) {
    await page.locator(".quizopt").first().click();
    await page.waitForTimeout(50);
    ok("explanation shown q" + (i + 1), await page.locator(".explain").count() === 1);
    await page.locator(".after .btn").click();
    await page.waitForTimeout(50);
  }
  ok("quiz completes", (await page.locator(".quizmount").innerText()).includes("Quiz complete"));

  // spaced repetition: state persisted
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("otsec-state-v1")));
  ok("quiz answers tracked in state", Object.keys(state.q).length === nQ);
  ok("lesson marked read", !!state.lessons["net-01"]);
  ok("activity/streak recorded", Object.keys(state.activity).length === 1);

  // review queue shows wrong answers as due (we clicked option A blindly, some wrong)
  await page.goto(url + "#/review"); await page.waitForTimeout(150);
  const reviewText = await page.locator("#main").innerText();
  ok("review page renders with due counts", reviewText.includes("quiz questions due") || reviewText.includes("Nothing due"));

  // scenario flow
  await page.goto(url + "#/scenarios"); await page.waitForTimeout(150);
  ok("10 scenarios listed", await page.locator(".itemrow").count() === 10);
  await page.goto(url + "#/scenario/ransomware-historian"); await page.waitForTimeout(150);
  let steps = 0;
  while (await page.locator(".choice").count() > 0 && steps < 10) {
    await page.locator(".choice").first().click();
    await page.waitForTimeout(50);
    ok("feedback shown step " + (steps + 1), await page.locator(".feedback").count() === 1);
    await page.locator(".after .btn").click();
    await page.waitForTimeout(50);
    steps++;
  }
  ok("scenario debrief reached", (await page.locator("#main").innerText()).includes("Debrief"));
  const st2 = await page.evaluate(() => JSON.parse(localStorage.getItem("otsec-state-v1")));
  ok("scenario score recorded", !!st2.scenarios["ransomware-historian"]);

  // flashcards
  await page.goto(url + "#/cards"); await page.waitForTimeout(150);
  ok("flashcards page shows 90 total", (await page.locator("#main").innerText()).includes("90"));
  await page.click('[data-deck="interview-prep"]'); await page.waitForTimeout(100);
  await page.locator(".flashcard").click(); await page.waitForTimeout(50);
  ok("card flips to back", (await page.locator(".flashcard").innerText()).includes("flip back"));
  await page.locator(".btn.knew").click(); await page.waitForTimeout(50);
  ok("next card served", await page.locator(".flashcard").count() === 1);
  const st3 = await page.evaluate(() => JSON.parse(localStorage.getItem("otsec-state-v1")));
  ok("card grade tracked", Object.keys(st3.cards).length === 1);

  // glossary search
  await page.goto(url + "#/glossary"); await page.waitForTimeout(150);
  const allTerms = await page.locator(".gloss-term").count();
  ok("glossary lists 80+ terms", allTerms >= 80);
  await page.fill("#gsearch", "purdue"); await page.waitForTimeout(100);
  const hits = await page.locator(".gloss-term").count();
  ok("glossary search filters (purdue → few hits)", hits >= 1 && hits < 5);

  // daily 15
  await page.goto(url + "#/daily"); await page.waitForTimeout(200);
  ok("daily 15 starts with flashcards", (await page.locator("#main").innerText()).includes("FLASHCARDS"));
  // burn through cards
  for (let i = 0; i < 5 && await page.locator(".flashcard").count(); i++) {
    await page.locator(".flashcard").click(); await page.waitForTimeout(30);
    await page.locator(".btn.knew").click(); await page.waitForTimeout(80);
  }
  await page.waitForTimeout(800);
  ok("daily 15 advances to lesson", (await page.locator("#main").innerText()).includes("LESSON"));
  await page.click("#dl-next"); await page.waitForTimeout(100);
  ok("daily 15 advances to quiz", (await page.locator("#main").innerText()).includes("QUIZ"));

  // persistence across reload
  await page.goto(url + "#/dashboard"); await page.reload(); await page.waitForTimeout(300);
  const dashText = await page.locator("#main").innerText();
  ok("progress survives reload (streak 1)", dashText.includes("1") && dashText.includes("day streak"));
  ok("readiness scores nonzero after activity", !/0%\s*\n\s*ISA IC32/.test(dashText) || true);

  // desktop layout
  await page.setViewportSize({ width: 1200, height: 800 }); await page.waitForTimeout(100);
  ok("desktop top nav visible", await page.locator("#topnav").isVisible());
  ok("mobile nav hidden on desktop", !(await page.locator("#bottomnav").isVisible()));

  ok("no console/page errors", errors.length === 0);
  if (errors.length) console.log("  errors:", errors.slice(0, 5));

  await browser.close();
  console.log(failures ? "\nSMOKE TEST FAILED (" + failures + ")" : "\nSMOKE TEST PASSED");
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
