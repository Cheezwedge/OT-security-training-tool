# Content Schema

All content lives in plain JS files under `data/`. Each file pushes JSON-style object
literals onto `window.OTSEC`. Long text uses backtick template literals so you can write
multi-line prose naturally. **Rules for all text fields:**

- No backticks (`) and no `${` inside text — they break the template literal.
- Markdown subset supported in `content`, `feedback`, `debrief`, `def`, `answerOutline`:
  `### Heading`, `**bold**`, `*italic*`, `- bullet`, `1. numbered`, blank-line paragraphs.
- Tone: peer-to-peer, technical, concrete numbers and standard references. No fluff.

Every data file starts with this exact boilerplate line:

```js
window.OTSEC = window.OTSEC || { modules: [], scenarios: [], flashcards: [], glossary: [] };
```

## Module file (`data/modules/NN-id.js`)

```js
window.OTSEC = window.OTSEC || { modules: [], scenarios: [], flashcards: [], glossary: [] };
window.OTSEC.modules.push({
  id: "networking",            // one of: networking, security-core, frameworks, threats, secops, ai, leadership
  order: 1,                    // 1..7
  title: "IT Networking Fundamentals",
  tagline: "One-line summary",
  description: `2-3 sentence module description.`,
  interviewPrep: [             // 2-3 items: "How this shows up in interviews"
    { question: `Hiring-manager question`, answerOutline: `Strong answer outline, 80-150 words, markdown ok` }
  ],
  lessons: [
    {
      id: "net-01",            // module prefix + 2-digit number, unique across the app
      title: "Lesson title",
      minutes: 8,              // realistic read time
      content: `500-800 words of markdown lesson content`,
      bridge: `60-130 word bridge note connecting to the learner's controls background`,
      quiz: [
        {
          id: "net-01-q1",     // lesson id + -qN
          q: `Question text`,
          options: [`A`, `B`, `C`, `D`],   // 4 options
          answer: 0,           // index of correct option
          explain: `1-3 sentence explanation of the right answer`
        }
        // 3-5 questions per lesson
      ]
    }
  ]
});
```

## Scenarios (`data/scenarios.js`)

```js
window.OTSEC.scenarios.push({
  id: "ransomware-historian",
  title: "Ransomware on the Plant Historian",
  category: "technical",       // "technical" | "leadership"
  module: "secops",            // related module id
  context: `100-200 word setup`,
  steps: [
    {
      prompt: `Decision point question`,
      choices: [               // 3-4 choices, exactly one "best"
        { text: `Choice text`, quality: "best", feedback: `60-150 words on why` },
        { text: `...`, quality: "ok", feedback: `...` },
        { text: `...`, quality: "poor", feedback: `...` }
      ]
    }
    // 3-5 steps per scenario
  ],
  debrief: `100-200 word wrap-up: key lessons, what frameworks/standards apply`
});
```

## Flashcards (`data/flashcards.js`)

```js
window.OTSEC.flashcards.push({
  id: "fc-001",                // fc-NNN, unique
  front: `Term / acronym / question`,
  back: `Concise answer, 1-3 sentences`,
  module: "frameworks",        // related module id
  tags: ["interview-prep", "standards"]  // from: interview-prep, standards, threat-groups, acronyms, protocols, tools, concepts
});
```

## Glossary (`data/glossary.js`)

```js
window.OTSEC.glossary.push({
  term: "DMZ",
  def: `Plain-English definition, 1-3 sentences.`,
  bridge: `Optional bridge to controls background. Empty string if none.`,
  tags: ["networking"]         // related module id(s)
});
```
