# OT/ICS Security Trainer

A personalized, offline, single-page training app for an automation controls director
moving into OT security leadership. No backend, no build step, no dependencies.
Progress persists to your browser's localStorage (export/import JSON from the Dashboard).

## Launch

**Option A — phone/anywhere via GitHub Pages:**
once the repo is public and Pages is deployed, open
`https://cheezwedge.github.io/OT-security-training-tool/` and add it to your
phone's home screen. (Deploys automatically from `main` via
`.github/workflows/pages.yml`.)

**Option B — just open it locally (works offline):**
double-click `index.html` or open it with your browser (`file://` works; all data
loads via plain `<script>` tags, so no CORS issues).

**Option C — local server (phone over home Wi-Fi, no hosting):**

```bash
cd OT-security-training-tool
python3 -m http.server 8080
# then visit http://localhost:8080  (or http://<your-pc-ip>:8080 from your phone)
```

> Progress is per-browser by default. Use Dashboard → Export JSON for manual backups,
> or set up cross-device sync (below).

## Cross-device sync ("login")

The app can sync progress across devices through a **private GitHub Gist** — no
backend needed. Setup (once per device):

1. Create a token at <https://github.com/settings/personal-access-tokens/new>
   — give it ONLY the **Gists: read and write** account permission (set a long expiry).
2. On the Dashboard → **Sync & progress data**, paste the token and hit Connect.
3. Repeat on each device with the same token. The first device creates the Gist;
   the rest find and merge into it.

Sync runs on app load, every 45 s while studying, and when you leave the tab.
Merging is per-item: the device that practiced a question/card most recently wins,
lesson reads and streak days are unioned, scenario best-scores keep the max — so
studying on two devices the same day loses nothing.

Notes: the token is stored in each device's localStorage, so only use a
gists-only token. Secret Gists are unlisted but technically readable by anyone
who has their URL — fine for study progress; don't put anything sensitive in it.

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
