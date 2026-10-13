# Changelog

All notable changes to this project are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/); this app is
unversioned (continuously deployed from `main` to GitHub Pages).

## 2026-10-13

### Added
- `CLAUDE.md`: architecture decisions and rationale, conventions, gotchas, and
  dead-ends, for future contributors and AI sessions.
- `CHANGELOG.md` (this file).

### Changed
- README: Pages URL documented as live (repo was made public and the first deploy
  succeeded); clarified launch options.

## 2026-06-12

### Added
- **Initial release** of the OT/ICS Security Trainer: single-page vanilla-JS app,
  no backend, runs from `file://` or any static host.
- Content library (`data/`, JS-wrapped JSON, schema in `data/SCHEMA.md`):
  7 modules / 50 lessons / 200 quiz questions covering IT networking fundamentals,
  core security concepts, OT frameworks & standards (IEC 62443, NIST SP 800-82 Rev 3,
  NERC CIP-002–015, Purdue, ATT&CK for ICS, ICS Cyber Kill Chain), threat landscape
  case histories, OT security operations, AI & OT security, and governance/leadership.
  Every lesson includes a controls-background "bridge note"; every module ends with
  interview-prep Q&A.
- Scenario simulator: 10 branching tabletop drills (5 technical, 5 leadership) with
  scored choices, per-choice feedback, and debriefs.
- Flashcards: 90 cards (standards numbers, threat groups, technique IDs) with an
  interview-prep deck; searchable 82-term glossary with bridge notes.
- Quiz engine with Leitner spaced repetition (boxes 1–5, intervals 0/1/3/7/21 days);
  Review queue; Daily 15 mixed session; dashboard with module mastery, streak,
  weakest topics, and IC32 / GICSP / interview readiness estimates.
- Progress persistence to localStorage with JSON export/import.
- Cross-device sync via private GitHub Gist (fine-grained PAT, gists scope only)
  with conflict-safe merging (newest practice record wins; activity/lessons union;
  scenario best-scores keep the max).
- Tooling: `validate.js` content-schema validator; `smoke-test.js` 43-check
  Playwright end-to-end suite (phone + desktop viewports).
- GitHub Pages deployment workflow (`.github/workflows/pages.yml`), deploying repo
  root on every push to `main`.
