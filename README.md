# OT/ICS Security Trainer

A personalized, offline, single-page training app for an automation controls director
moving into OT security leadership. No backend, no build step, no dependencies.
Progress persists to your browser's localStorage (export/import JSON from the Dashboard).

## Launch

**Option A — just open it (works offline):**
double-click `index.html` or open it with your browser (`file://` works; all data
loads via plain `<script>` tags, so no CORS issues).

**Option B — local server (nicer URLs, works great on your phone over Wi-Fi):**

```bash
cd OT-security-training-tool
python3 -m http.server 8080
# then visit http://localhost:8080  (or http://<your-pc-ip>:8080 from your phone)
```

> Progress is per-browser. Use Dashboard → Export JSON to back up or move devices.

## What's inside

| Feature | Where |
|---|---|
| 7 learning-path modules (50 lessons, ~200 quiz questions) | **Learn** |
| Spaced-repetition quiz engine (Leitner boxes, wrong answers resurface) | **Review** |
| 10 tabletop scenarios (technical + leadership) | **Scenarios** |
| 90 flashcards incl. `interview-prep` deck | **Cards** |
| 75-term searchable glossary with controls-background bridge notes | **Glossary** |
| Mastery %, streak, weakest topics, IC32/GICSP/interview readiness | **Dashboard** |
| Daily 15: flashcards → lesson → quiz in ~15 min | **Daily 15** |

## Editing / adding content

All content is human-editable JS-wrapped JSON in `data/`:

- `data/modules/*.js` — lessons, bridge notes, quizzes, interview-prep Q&A
- `data/scenarios.js`, `data/flashcards.js`, `data/glossary.js`

The format is documented in **`data/SCHEMA.md`**. After editing, sanity-check with:

```bash
node validate.js
```

## How the spaced repetition works

Each quiz question and flashcard sits in a Leitner box (1–5). Correct → up one box;
wrong → back to box 1. Review intervals: box 1 = same day, then 1, 3, 7, 21 days.
Module mastery = average box level across the module's questions. Readiness scores are
weighted blends of module mastery (IC32 weights the frameworks module heaviest; GICSP
is spread evenly across technical modules; interview readiness also counts scenario
scores and interview-tagged flashcards).
