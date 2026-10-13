# CLAUDE.md — project guide for AI assistants and future contributors

Personalized OT/ICS security training app for a controls-engineering director moving
into OT security leadership. Single-page vanilla-JS app, no build step, no backend,
no dependencies. Read this before changing anything.

## Commands

```bash
node validate.js      # schema-validate the whole content library (run after ANY data/ edit)
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers NODE_PATH=$(npm root -g) node smoke-test.js
                      # 43-check end-to-end browser test (run after ANY js/ or index.html edit)
python3 -m http.server 8080   # optional local server; file:// also works
```

There is no package.json on purpose — nothing to install. Smoke test uses the
globally installed playwright + chromium (paths above are for the CI/dev container;
locally, any playwright install works).

## Architecture and the WHY behind it

- **Plain HTML/JS, no framework, no build.** Requirement was "runs locally with no
  backend." Everything loads via `<script>` tags so the app works from `file://`
  (double-click index.html) — `fetch()` of local JSON would fail CORS on `file://`,
  which is why content files are **JS-wrapped JSON** (`window.OTSEC.modules.push({...})`)
  instead of pure `.json` files. Do not "clean this up" into .json files or ES modules;
  it would break file:// usage.
- **Content = data, UI = engine.** All training content lives in `data/` (schema
  documented in `data/SCHEMA.md`); `js/app.js` renders whatever it finds in
  `window.OTSEC`. Adding content never requires touching app code.
- **Long text uses backtick template literals** so lesson prose is human-editable.
  Consequence: content text must never contain a backtick or `${`. `validate.js`
  catches parse failures this causes.
- **State**: localStorage key `otsec-state-v1` — shape in `blankState()` in app.js:
  `{ q, cards, lessons, scenarios, activity }`. Quiz questions and flashcards use a
  Leitner system: box 1–5, intervals [0, 1, 3, 7, 21] days, wrong answer → box 1.
  Module mastery = avg(box/5) over the module's questions. Readiness scores are
  weighted blends defined in the `READINESS` array in app.js (IC32 weights the
  frameworks module 45%; interview readiness mixes mastery 50% / scenario best-scores
  30% / interview-tagged flashcards 20%).
- **Routing**: hash-based (`#/lesson/net-01`), views in the `views` object in app.js.
  Hash routing is deliberate — works on file:// and on GitHub Pages' subpath without
  server rewrites.
- **Markdown**: lessons use a tiny renderer (`md()` in app.js) supporting only
  `###`/`####`, `**bold**`, `*italic*`, `-` bullets, `1.` lists, and blank-line
  paragraphs. Everything is HTML-escaped first (`esc()`), then inline-formatted —
  keep that order or you get XSS from content files.
- **Sync (js/sync.js)**: optional cross-device sync via a **private GitHub Gist**,
  authenticated with a user-supplied fine-grained PAT (gists scope only), stored in
  localStorage key `otsec-sync-v1`. Chosen over Firebase/Supabase because it needs
  no third-party account, no API keys in the repo, and no backend. Merge semantics
  (in `mergeStates`): per question/card the record with the newer `last` timestamp
  wins; lessons/activity are unioned; scenario `best` takes the max. Merge is
  symmetric — there's a node unit test for it in git history (commit 8147a2c message)
  and assertions can be re-run by extracting `mergeStates`.
- **Deploy**: `.github/workflows/pages.yml` deploys repo root to GitHub Pages on
  every push to `main`. The site is https://cheezwedge.github.io/OT-security-training-tool/.
  Development happens on `claude/ot-ics-training-app-482j14`; merging to `main`
  publishes.

## Conventions

- Content IDs: lessons `<prefix>-NN` (net-, sec-, fw-, thr-, ops-, ai-, ldr-),
  questions `<lesson-id>-qN`, flashcards `fc-NNN`. IDs are referenced by stored
  progress — **never rename an existing ID** (it orphans the user's spaced-repetition
  history for that item); add new ones instead.
- Module ids are fixed: `networking, security-core, frameworks, threats, secops, ai,
  leadership`. The `READINESS` weights and flashcard/glossary `module`/`tags` fields
  reference them.
- Every lesson needs a `bridge` note tying the concept to the learner's controls
  background (PLCs, EtherNet/IP, FDA change control, team leadership). That's the
  product's core feature — don't write generic content.
- Quiz questions: exactly 4 options; scenario steps: 3–4 choices with exactly one
  `quality: "best"`. `validate.js` enforces both.
- Content accuracy bar: cite current standards (NIST SP 800-82 **Rev 3**, CIP-002
  through CIP-015, CSF 2.0, 62443 part numbers, ATT&CK ICS T08xx IDs). Where facts
  are fast-moving or uncertain, the content says so explicitly rather than guessing —
  keep that practice.
- Commit style: conventional-ish, imperative subject lines.

## Gotchas

- **Script load order**: index.html loads data files → app.js → sync.js. app.js
  renders the first view immediately, so sync.js self-attaches to `#syncui` at the
  end of its IIFE if the dashboard is already mounted. (This was an actual bug —
  the sync UI silently didn't render until that self-attach was added.)
- app.js and sync.js are classic scripts sharing top-level bindings (`state`,
  `saveState`, `blankState`, `route`, `h`, `esc`). Converting either to a module
  breaks that.
- `smoke-test.js` answers quizzes by always clicking option A, so some answers are
  wrong by design — that's what exercises the spaced-repetition "due" path.
- `df`-style thinking about localStorage: progress is per-browser/per-device unless
  Gist sync is connected. Export/Import JSON buttons on the Dashboard are the manual
  fallback.
- The Pages site is public. Nothing personal belongs in `data/` files, and no tokens
  ever go in the repo (the sync PAT lives only in each device's localStorage).

## Things tried that did NOT work (don't repeat)

- **Parallel content-generation via subagents**: 4 agents were launched to write the
  content library; 2 died mid-task (session limits / stream timeout) after writing
  most module files. Module 07, scenarios, flashcards, and glossary were written
  directly instead. If regenerating content at scale, budget for agent failures and
  validate every file with `validate.js` — a half-written JS file fails loudly, which
  is why per-file parse checks exist there.
- **Pure `.json` content files**: rejected (file:// CORS, see above).
- **GitHub OAuth "login" for sync**: not possible from a pure static site (the token
  endpoint blocks CORS; device flow needs a proxy). Hence the paste-a-PAT design.
- **actions/configure-pages enablement on a private repo**: Pages deploy 403s until
  the repo is public (free plan). The workflow has `enablement: true` +
  `workflow_dispatch` so it can be re-run manually after visibility changes.
