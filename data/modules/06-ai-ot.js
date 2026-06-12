window.OTSEC = window.OTSEC || { modules: [], scenarios: [], flashcards: [], glossary: [] };
window.OTSEC.modules.push({
  id: "ai",
  order: 6,
  title: "AI and OT Security (2026)",
  tagline: "What AI actually changes for defending and attacking industrial environments — dated claims, no hype.",
  description: `AI is the fastest-moving variable in security, and OT leaders are being sold "AI-powered" everything while adversaries adopt the same tools. This module covers AI on defense (anomaly detection, LLM-assisted SOC work, vulnerability prioritization), AI on offense (social engineering at scale, lowered skill floors), and the two questions a director actually owns: governing AI use near control systems, and cutting through vendor AI claims. Claims are dated to early 2026; where the picture is genuinely uncertain, the lessons say so.`,
  interviewPrep: [
    {
      question: `How do you see AI changing the OT threat landscape, and what are you doing about it?`,
      answerOutline: `Split offense and defense, and date your claims. Offense, what is proven by 2024-25: AI dramatically scales social engineering — fluent spear-phish in volume, voice cloning and deepfakes used in real fraud (the Arup case, roughly 25M dollars, deepfaked video call). It also accelerates recon and commodity malware development. What it has NOT yet changed: Stage 2 ICS attacks still demand process and controls engineering knowledge — manipulating a specific plant's physics is not a prompt away, though that gap will narrow. Defense: deterministic OT traffic makes ML anomaly detection genuinely useful, and LLM copilots are real productivity gains in triage and reporting. My actions: harden human verification procedures against voice/video impersonation, add AI-lure awareness for engineers, adopt AI-assisted tooling where the FP economics work, and write an AI use policy before someone pastes our network diagrams into a public chatbot.`
    },
    {
      question: `A vendor pitches an AI-powered OT detection platform. How do you evaluate it?`,
      answerOutline: `Structure the diligence: (1) What specifically is AI — ML anomaly models, an LLM assistant, or marketing on top of signatures? Make them decompose the claim. (2) Trained on what data, and does it learn MY environment or ship generic models? (3) False positive economics: alerts per sensor per day in a comparable plant, and who tunes it. (4) Failure modes: what happens when the model is wrong in both directions, and can analysts see WHY it alerted? (5) Inference location — does my traffic or config data leave the plant for cloud processing, and is on-prem inference available? Then a time-boxed POC on one real line with success criteria written in advance: detection of seeded test behaviors, FP rate, analyst time per alert. Fundamentals gate the purchase: if I lack asset inventory and segmentation, those come first.`
    },
    {
      question: `Would you let your team use LLM tools in daily OT security work? Where is the line?`,
      answerOutline: `Yes, governed — banning it outright just creates shadow use. Approved-tools list with enterprise agreements (no training on our data), data classification rules stating plainly what never goes into a prompt: network diagrams, PLC code, credentials, IP addresses, anything export-controlled or FDA-confidential. Human-in-the-loop required for anything consequential — an LLM can draft the incident report; a person verifies it. Hard lines where AI is out of the loop entirely: safety instrumented functions and any direct write/control action toward the process. No agentic tool gets write access in OT networks as of 2026 — the reliability is not there and the consequence asymmetry is brutal. For sensitive analysis, local/on-prem models are now viable. The policy is one page, reviewed quarterly, because this landscape shifts in months.`
    }
  ],
  lessons: [
    {
      id: "ai-01",
      title: "AI for OT Defense: Detection and Baselining",
      minutes: 9,
      content: `### Why OT is good terrain for ML detection

Machine learning anomaly detection has a mixed record in IT security — corporate networks are so noisy and non-stationary that models drown analysts in false positives. OT inverts the problem. Plant traffic is deterministic: the same controllers poll the same I/O at fixed intervals, HMIs request the same tags, the historian subscribes to the same points, year after year. For an ML model, that means a stable distribution to learn and rare, meaningful deviations to flag. This is the honest technical reason "AI-powered OT detection" is more than marketing: the *environment* does half the work. The major OT platforms (Dragos, Claroty, Nozomi, Microsoft Defender for IoT) have shipped ML-based baselining for years — it predates the LLM wave and should not be confused with it.

### What the models actually learn

Typical features: conversation pairs (who talks to whom), protocols and ports, industrial-protocol depth (Modbus function codes, CIP service codes, written tag values), timing and volume patterns, and per-device behavioral fingerprints. The model flags things like: a workstation opening its first-ever connection to a controller, a Modbus master issuing function code 16 (write multiple registers) where history shows only reads, traffic volume spiking on a normally quiet conduit, or polling cadence shifting on a connection that has been metronomic for two years. None of this requires knowing any malware signature — which is the point, since ICS-specific malware is rare and novel by design.

### False positive economics

The metric that decides whether ML detection helps or hurts is not detection rate — it is **analyst minutes per alert times alerts per day**. A model that catches 99 percent of attacks but fires 500 false alarms daily is a net negative in an OT program staffed with two analysts. Questions that matter: how long is the learning period, and what happens when baselining overlaps a commissioning window (the model learns chaos as normal)? How does the system handle *legitimate* change — a maintenance window, a new line — without either alert storms or silent model drift? Can an analyst see *why* the model flagged something (explainability), or is it an opaque score? In practice, well-deployed OT anomaly detection produces tens of alerts per day per site, most triageable in minutes because the baseline context is attached. That is the standard to hold vendors to.

### ML-based asset discovery and fingerprinting

The same traffic analysis powers discovery. Classical fingerprinting is rule-based — parse the CIP identity object, read the Modbus device ID. ML extends it to devices that do not announce themselves: classifying device type from traffic shape and timing characteristics, clustering similar devices to spot the one behaving unlike its peers, and inferring roles (this node behaves like an EWS; why is it in the cell zone?). By 2026 this is table stakes in the visibility platforms; the practical differentiator is accuracy on *your* vendor mix, which only a POC reveals.

### Behavioral baselining vs signature detection

Frame the trade clearly. **Signatures/indicators** detect *known* bad — precise, cheap, explainable, and blind to anything novel; they decay as adversaries retool. **Behavioral baselining** detects *change* — it catches novel tradecraft and insider misuse, but a deviation is not automatically malicious, so every alert needs context and triage; it also misses an attacker whose actions stay inside normal patterns (the nightmare case: using legitimate engineering tools, within normal hours, from a normal workstation — exactly how mature ICS adversaries operate). Mature programs run both, plus the threat-behavior analytics layer from the secops module, and treat ML as one detection input — never the whole strategy.`,
      bridge: `You engineered the determinism these models feed on — you set the RPIs, designed the polling, and know that line 4's traffic looks the same on Christmas as on Tuesday. That gives you a sharper evaluation question than most buyers: does the model understand EtherNet/IP deeply enough to distinguish a CIP read from a write, or is it baselining IP pairs and packet counts? You also know what breaks baselines, because you cause it — commissioning, recipe changeovers, vision retraining pushes. Ask vendors how their model survives the exact maintenance activities your team performs monthly.`,
      quiz: [
        {
          id: "ai-01-q1",
          q: `Why does ML anomaly detection tend to perform better on OT networks than on corporate IT networks?`,
          options: [
            `OT devices have more processing power for running models`,
            `OT traffic is deterministic and stable, giving models a learnable baseline where deviations are rare and meaningful`,
            `OT protocols are encrypted, which improves model accuracy`,
            `IT networks legally prohibit machine learning analysis`
          ],
          answer: 1,
          explain: `Plant traffic repeats the same conversations on fixed cadences for years, so the statistical distribution is stable — the environment itself reduces false positives in a way chaotic IT traffic cannot.`
        },
        {
          id: "ai-01-q2",
          q: `Which metric best determines whether an ML detection system actually helps a small OT security team?`,
          options: [
            `The number of ML models the product contains`,
            `Raw detection rate on a vendor benchmark dataset`,
            `Analyst workload — alerts per day times triage time per alert — in an environment like yours`,
            `The size of the vendor's threat intelligence team`
          ],
          answer: 2,
          explain: `A high-recall model that floods two analysts with false positives is a net negative; false positive economics, not benchmark detection rate, decide operational value.`
        },
        {
          id: "ai-01-q3",
          q: `What is the key failure mode if the ML learning period overlaps a plant commissioning window?`,
          options: [
            `The model learns abnormal commissioning chaos as the baseline, degrading future detection`,
            `The sensors physically overload and drop offline`,
            `The model refuses to complete training`,
            `Commissioning traffic is automatically encrypted and invisible`
          ],
          answer: 0,
          explain: `Baselines are only as good as the period they learned from; training during commissioning, turnarounds, or major maintenance bakes anomalous activity into "normal."`
        },
        {
          id: "ai-01-q4",
          q: `What is the fundamental blind spot of behavioral baselining that signature and threat-behavior detections help cover?`,
          options: [
            `It cannot process industrial protocols`,
            `It only works on wireless networks`,
            `It requires agents on every PLC`,
            `An attacker operating inside normal patterns — legitimate tools, normal hours, expected workstations — generates no deviation to flag`
          ],
          answer: 3,
          explain: `Baselining detects change; a sophisticated adversary mimicking routine engineering activity stays within the baseline, which is why mature programs layer behavioral, signature, and threat-behavior detections.`
        }
      ]
    },
    {
      id: "ai-02",
      title: "LLM-Assisted SOC Operations",
      minutes: 9,
      content: `### The copilot wave, dated

Since roughly 2024, every major security platform has shipped an LLM assistant: Microsoft Security Copilot (GA in April 2024), CrowdStrike Charlotte AI, and in the OT space, copilot-style features in the Dragos, Claroty, and Nozomi platforms and Microsoft Defender for IoT's integration with the broader Defender/Copilot stack. By 2026 this is a standard feature checkbox, not a differentiator. The honest summary of operational experience so far: real productivity gains on language-shaped work (summarizing, drafting, querying, explaining), modest gains on judgment-shaped work, and a new failure mode — confident, fluent, wrong output — that your processes must absorb.

### Where LLMs genuinely help

- **Alert triage and summarization.** An LLM can fuse an alert with asset context, recent related events, and threat intel into a readable paragraph: what fired, on which device, why it might matter, what to check first. For a junior analyst — or an OT engineer pulling SOC duty — this compresses the "what am I even looking at" phase from twenty minutes to two. It is a first-pass explainer, not a verdict.
- **Threat intel summarization.** Feeding a 40-page threat report or a stack of CISA ICS advisories into an LLM and asking "what here applies to a plant running Rockwell ControlLogix and FactoryTalk, and what should we check?" is one of the cleanest use cases — the source material is text, the output is checkable, and the time saved is real.
- **Query copilots.** Natural-language-to-query translation ("show every device that communicated with the EWS in the last 24 hours, grouped by protocol") lowers the skill floor for platform interrogation. This matters in OT, where your best domain experts — controls engineers — are often weakest at query syntax. It is also genuinely useful for hunting: hypotheses become questions, questions become queries, without a SIEM specialist in the loop.
- **Report and documentation drafting.** Incident timelines, post-incident reports, executive summaries, tabletop documentation. LLMs draft these well from structured notes, and drafting was the bottleneck. The human edits and owns the result.

### What still requires a human (2026)

- **Verification of anything consequential.** LLMs hallucinate — they will cite plausible CVEs that do not exist and assert device behavior that is wrong. Every fact in an LLM-drafted incident report gets checked before it reaches an executive or a regulator.
- **Containment and response decisions.** Isolate vs watch vs shutdown is a judgment call weighing process state, safety, and business context. No 2026 LLM holds that context or that accountability. Decision support, yes; decision authority, no.
- **Anything touching the process.** No LLM output flows into a control action. Full stop (governed in detail in ai-06).
- **Novel situations.** LLMs interpolate from training data; a genuinely new attack pattern is exactly where their fluent confidence is most dangerous.

### Leadership view

Treat copilots as a workforce multiplier for the OT-security talent shortage: they let one experienced analyst supervise more work, and they soften the onboarding cliff for controls engineers converting to security. But measure the gain — pilot with defined metrics (triage time per alert, report turnaround) rather than trusting vendor productivity claims. And note the data-governance hook: most copilots are cloud-hosted, so what alert data, asset data, and network detail leaves your environment becomes a contract and policy question before it becomes a feature question. That thread continues in ai-06.`,
      bridge: `You have managed this exact pattern before: a powerful new tool that makes juniors faster and seniors skeptical. Treat LLM copilots the way you treated auto-generated PLC code or vision auto-tune — useful drafts, never unreviewed into production. Your engineering documentation culture (FDA-grade, where every record is verified and owned by a person) is precisely the right posture: the LLM drafts the incident report the way a junior engineer drafts a validation protocol, and a qualified human signs it. Your query-copilot upside is personal — you know plants deeply but not SIEM syntax, and natural-language querying erases that gap on day one.`,
      quiz: [
        {
          id: "ai-02-q1",
          q: `Which category of SOC work do LLM copilots help with most reliably as of 2026?`,
          options: [
            `Making autonomous containment decisions during incidents`,
            `Language-shaped work: summarizing alerts and intel, translating natural language to queries, drafting reports`,
            `Physically isolating compromised network segments`,
            `Replacing detection engines with generative models`
          ],
          answer: 1,
          explain: `Operational experience since the 2024 copilot wave shows solid gains on summarization, querying, and drafting — and much weaker results on judgment, verification, and novel-situation reasoning.`
        },
        {
          id: "ai-02-q2",
          q: `Why are natural-language query copilots particularly valuable in OT security teams specifically?`,
          options: [
            `OT platforms cannot be queried any other way`,
            `Query copilots eliminate the need for asset inventory`,
            `The deepest domain experts — controls engineers — often lack query/SIEM syntax skills, and copilots remove that barrier`,
            `Natural language queries run faster than native queries`
          ],
          answer: 2,
          explain: `OT security depends on people who understand the process; letting them interrogate data in plain language converts engineering knowledge directly into hunting and triage capability.`
        },
        {
          id: "ai-02-q3",
          q: `An LLM-drafted incident summary cites a CVE that turns out not to exist. What failure mode is this, and what is the correct process control?`,
          options: [
            `Model drift; retrain the model on plant traffic`,
            `Data poisoning; disconnect the copilot from the internet`,
            `Prompt injection; sanitize all alert text`,
            `Hallucination; require human verification of every consequential fact before reports reach executives or regulators`
          ],
          answer: 3,
          explain: `LLMs produce fluent, confident fabrications. The mitigation is procedural: a qualified human verifies and owns anything consequential, the same way drafted validation documents get reviewed and signed.`
        },
        {
          id: "ai-02-q4",
          q: `From a leadership perspective, what is the strongest strategic argument for adopting LLM copilots in an OT SOC?`,
          options: [
            `They act as a workforce multiplier against the OT security talent shortage and ease the ramp for engineers converting to security`,
            `They eliminate the need to hire any analysts`,
            `They are typically free additions to existing platforms`,
            `They guarantee faster detection of zero-day ICS malware`
          ],
          answer: 0,
          explain: `The realistic value case is leverage: experienced analysts supervise more work and new converts become productive sooner — measured via pilot metrics, not vendor claims. Copilots do not replace the team.`
        }
      ]
    },
    {
      id: "ai-03",
      title: "AI-Driven Vulnerability Prioritization",
      minutes: 8,
      content: `### The OT patching reality

In IT, vulnerability management is "scan, prioritize by CVSS, patch monthly." In OT it collapses: patching a controller can require a production outage, revalidation (in FDA-regulated plants, potentially formal change control with documentation), vendor approval of the patch, and sometimes hardware that simply has no fix. Meanwhile OT-relevant CVE volume keeps climbing — thousands of ICS advisories a year — and most plants can act on a tiny fraction. So prioritization is not an optimization in OT; it is the entire game. The strategic question is never "what is vulnerable" (nearly everything) but "what must we act on now."

### Beyond CVSS

CVSS scores severity in a vacuum: how bad is this flaw if exploited, ignoring whether anyone exploits it or whether your instance is reachable. Two correctives now standard:

- **EPSS (Exploit Prediction Scoring System)**, from FIRST, is an ML model that estimates the probability a vulnerability will be exploited in the wild within 30 days, trained on real exploitation telemetry, exploit code availability, chatter, and vulnerability characteristics. It is refreshed continually and it reorders the pile dramatically: a large share of CVSS "critical" vulns have negligible exploitation probability, while some mediums are actively hammered. EPSS is one of the longest-running, most validated "AI in security" deployments — useful context when someone says AI in security is all hype.
- **KEV (CISA's Known Exploited Vulnerabilities catalog)** is the non-AI complement: confirmed-exploited vulns. KEV answers "is it being exploited"; EPSS predicts "will it be."

- **Reachability analysis** asks the question only your environment can answer: can an attacker actually get to the vulnerable service? A critical CVE on a PLC in a well-segmented cell zone, reachable only through two firewalls and a jump host, is a different problem than the same CVE on an internet-exposed HMI. OT platforms (Claroty, Dragos, Nozomi, Tenable OT) increasingly compute this from your topology and observed comms — fusing the inventory and baseline data from the secops module. This is where your visibility investment pays a second dividend.

### Now / next / never

Dragos popularized a triage frame that fits OT reality: **Now** (exploited or highly likely, reachable, on a consequential asset — act this cycle, with mitigation if patching is impossible), **Next** (real but not urgent — fold into the next maintenance window or planned refresh), **Never** (unreachable, irrelevant to consequence, or mitigated by architecture — document the rationale and stop tracking it as work). Historically Dragos's own analysis has put only a small minority of ICS advisories in the "now" bucket. The leadership power of "never" is underrated: formally retiring noise is what makes the "now" list credible, and a documented never-rationale is auditable in a way silent ignoring is not.

Note the vocabulary: in OT, "act" usually means **mitigate**, not patch — tighten a firewall rule, disable an unused service, move the asset to a stricter zone, add a detection. AI-assisted prioritization tells you where to spend mitigation effort; it does not create maintenance windows.

### What AI adds, honestly (2026)

EPSS is mature and trustworthy as one input. Vendor "AI prioritization" beyond it typically means: fusing EPSS/KEV with your asset criticality and reachability automatically, LLM summarization of advisories into plant-relevant actions ("this affects your firmware 32.011 ControlLogix fleet; mitigation: block port X at the cell firewall"), and predictive flagging. The fusion and summarization are genuinely useful. Be skeptical of any tool claiming to predict *targeted ICS* exploitation — the historical data is far too sparse to model honestly, and a vendor who claims otherwise has just failed your diligence question from ai-07.`,
      bridge: `You have run this triage your whole career — every Rockwell PSA or vendor bulletin against your machine fleet got the same questions: does it affect our installed versions, can it actually hurt us, and is it worth a line-down to fix? That is now/next/never with different paperwork. Your software-version traceability is the superpower here: accurate firmware inventory is the single input that makes vulnerability matching trustworthy, and you already maintain it to FDA standards. And you know patching economics viscerally — you have priced revalidation after a firmware change. When a vendor pitches AI prioritization, your test question: show me how you handle the vuln I can never patch.`,
      quiz: [
        {
          id: "ai-03-q1",
          q: `What does EPSS estimate that CVSS does not?`,
          options: [
            `The financial cost of remediation per asset`,
            `The probability the vulnerability will actually be exploited in the wild in the near term, based on an ML model trained on exploitation data`,
            `The number of devices in your plant affected by the flaw`,
            `Whether a vendor-approved patch exists`
          ],
          answer: 1,
          explain: `CVSS scores theoretical severity; EPSS predicts real-world exploitation likelihood — and the two disagree often enough to dramatically reorder a remediation queue.`
        },
        {
          id: "ai-03-q2",
          q: `Why does reachability analysis matter so much in OT vulnerability prioritization?`,
          options: [
            `It is the only metric FDA requires manufacturers to report`,
            `It replaces the need for an asset inventory`,
            `Whether an attacker can actually get to the vulnerable service — through your real zones, firewalls, and conduits — changes the practical risk of an identical CVE enormously`,
            `It automatically patches unreachable devices`
          ],
          answer: 2,
          explain: `A critical CVE buried behind segmentation is a different problem from the same CVE on an exposed HMI; reachability fuses your topology and comms data into the triage decision.`
        },
        {
          id: "ai-03-q3",
          q: `In now/next/never triage, what makes the "never" bucket a leadership tool rather than negligence?`,
          options: [
            `Vulnerabilities in "never" are legally exempt from liability`,
            `"Never" items are automatically fixed by vendors eventually`,
            `It hides bad findings from auditors`,
            `Formally documenting why an item needs no action retires noise auditably and makes the "now" list credible and resourced`
          ],
          answer: 3,
          explain: `Most ICS advisories do not warrant action in a given environment; a written never-rationale (unreachable, architecturally mitigated, no consequence path) is defensible, whereas silent ignoring is not.`
        },
        {
          id: "ai-03-q4",
          q: `In OT, what does "acting" on a high-priority vulnerability usually mean in practice?`,
          options: [
            `Mitigation — firewall rules, disabling services, stricter zoning, added detection — because patching often requires outages, revalidation, or is impossible`,
            `Immediate emergency patching regardless of production schedule`,
            `Replacing the affected hardware within 30 days`,
            `Disconnecting the device permanently from the network`
          ],
          answer: 0,
          explain: `OT patch windows are rare and expensive (and may trigger revalidation in regulated plants), so compensating mitigations are the normal first response; the patch lands at the next planned window if ever.`
        }
      ]
    },
    {
      id: "ai-04",
      title: "AI as Attacker: Social Engineering at Scale",
      minutes: 9,
      content: `### The first AI threat that is fully real

Strip away speculation and one AI-attacker capability is unambiguously operational, documented, and already expensive: **social engineering at machine scale and human quality**. This is worth internalizing because social engineering was already the dominant initial access vector for industrial intrusions — most OT incidents start with a phished human on the IT side, not a hacked PLC — and AI just removed the historical defenses.

### Phishing: volume times quality

Pre-LLM, attackers chose: high-quality lures (manual, slow, targeted) or high volume (templated, sloppy, caught by "look for bad grammar" training). LLMs deleted the trade-off. Since 2023-24, commodity phishing has become fluent, contextual, and individually tailored at near-zero marginal cost — drafted in any language, referencing the target's real projects scraped from LinkedIn, vendor sites, and conference talks. Security industry telemetry through 2024-25 consistently reported large jumps in both phishing volume and sophistication attributed to generative AI (exact attribution percentages vary by vendor and should be treated as directional, not precise). The defensive consequence is blunt: **"spot the typo" training is dead.** Detection must shift to verification procedures and technical controls — because the lure itself is now indistinguishable from legitimate mail.

### Voice cloning and deepfakes: proven, not theoretical

Voice synthesis needs seconds of sample audio — and any director who has spoken on an earnings call, a webinar, or a conference panel has donated training data. The marquee real case: in early 2024, engineering firm **Arup** lost about HK$200M (~US$25M) when a Hong Kong finance employee was instructed to transfer funds during a video call where the CFO and colleagues were all deepfakes. Voice-cloning fraud attempts against businesses became routine through 2024-25, and by 2025 deepfake-enabled fraud losses were being measured in the billions globally.

Map it to the plant. The calls to game out: a cloned plant manager phoning the control room to direct an "urgent" change; a cloned **vendor support engineer** calling an automation tech — "we're seeing faults from your line remotely, I need you to enable the remote session / read me the gateway address"; a cloned executive pressuring a night-shift supervisor to bypass a procedure. Plant culture is responsive to authority and to anything framed as preventing downtime — exactly the levers these calls pull.

### Spear-phishing engineers with vendor-specific lures

The OT-specific evolution: lures aimed at *engineers*, wearing *vendor* skin. An LLM can generate a convincing fake Rockwell PSA or Siemens advisory, a "TechConnect case update" with a malicious attachment, a fake integrator quote, or a "firmware update required — see attached bulletin" mail referencing your actual installed product line. Engineers are conditioned to open vendor advisories and act on them — that conditioning is the vulnerability. Watering-hole variants (fake vendor support portals, SEO-poisoned "manual download" sites) target the same population.

### What actually works in 2026

- **Out-of-band verification procedures** for anything consequential: money movement, credential resets, remote access grants, control-system changes. Callback on a known-good number; in-person or known-channel confirmation. Make verification *procedure*, so refusing a convincing voice is compliance, not insubordination — this borrows directly from safety culture, where challenging authority is normalized.
- **Code words / challenge phrases** for executive and vendor phone requests — low-tech, increasingly common post-Arup.
- **Technical rails**: phishing-resistant MFA (FIDO2) so harvested credentials die on use, strict process for vendor remote access (no session enabled on inbound request), email authentication (DMARC), and payment controls that no single phone call can override.
- **Retrained awareness**: stop teaching typo-spotting; teach "any urgent, authority-backed, out-of-pattern request gets verified, no matter how real it sounds or looks." Run a voice-phish drill against your own control room — the result will fund the program.`,
      bridge: `Your rolodex is the attack surface here: after 11 years you trust calls and mails from Rockwell support, your integrators, and your vision and robot vendors, and your team acts fast on anything threatening uptime — that reflex is exactly what these lures exploit. You also have the countermeasure in muscle memory: the Navy and FDA both taught you that verification procedures beat individual judgment under pressure, and that a culture where a junior tech can challenge an urgent order from "authority" is built deliberately. Writing the out-of-band verification SOP for vendor remote-access requests is a one-week, near-zero-dollar project you could mandate in your first month.`,
      quiz: [
        {
          id: "ai-04-q1",
          q: `What trade-off did LLMs eliminate for phishing attackers?`,
          options: [
            `The choice between attacking IT and attacking OT systems`,
            `The historical trade-off between volume and quality — tailored, fluent lures can now be produced at near-zero marginal cost`,
            `The need for any initial access vector at all`,
            `The cost of registering lookalike domains`
          ],
          answer: 1,
          explain: `Attackers used to pick between slow handcrafted spear-phish and sloppy mass templates; generative AI delivers individually tailored, fluent lures at scale, which killed typo-spotting as a defense.`
        },
        {
          id: "ai-04-q2",
          q: `Why is the 2024 Arup incident significant for security leaders?`,
          options: [
            `It was the first ransomware attack on a PLC`,
            `It proved air-gapped networks can be breached acoustically`,
            `It demonstrated that multi-person deepfake video calls could defeat an employee's judgment and cause ~25M dollars in real fraud loss — moving deepfakes from theory to documented practice`,
            `It involved AI writing custom ICS malware`
          ],
          answer: 2,
          explain: `Arup's Hong Kong employee transferred funds after a video call in which the CFO and colleagues were all synthetic — the canonical proof that deepfake fraud is operational, not hypothetical.`
        },
        {
          id: "ai-04-q3",
          q: `Which defense most directly counters voice-cloned calls requesting consequential actions (remote access, payments, control changes)?`,
          options: [
            `Annual phishing-awareness training focused on spotting poor grammar`,
            `Blocking all inbound phone calls to the plant`,
            `Deploying anomaly detection on OT network traffic`,
            `Mandatory out-of-band verification procedures — callback on known-good numbers — so refusing a convincing voice is compliance with procedure, not personal judgment`
          ],
          answer: 3,
          explain: `When the voice and video can be perfect, the defense moves from detection to procedure: independent verification through a known channel before any consequential action, normalized so juniors can refuse "authority."`
        },
        {
          id: "ai-04-q4",
          q: `Why are vendor-themed lures (fake advisories, support-case updates, firmware bulletins) especially dangerous against OT engineers?`,
          options: [
            `Engineers are professionally conditioned to open vendor advisories and act on them quickly, especially anything framed as preventing downtime`,
            `Vendor emails bypass all spam filters by default`,
            `OT engineers do not receive security training of any kind`,
            `Vendor advisories are always sent from compromised accounts`
          ],
          answer: 0,
          explain: `The lure exploits a trained, legitimate behavior — promptly acting on vendor security and support communications — and AI makes producing convincing vendor-skinned content trivial.`
        }
      ]
    },
    {
      id: "ai-05",
      title: "AI as Attacker: Lowering the Skill Floor",
      minutes: 9,
      content: `### The honest threat model, dated early 2026

Strip the hype and ask: what does AI demonstrably do for attackers beyond social engineering? Documented answer so far — it **compresses time and lowers the entry bar on the commodity stages of attack**, while the ICS-specific endgame still demands rare human expertise. Both halves matter, and both have expiration dates.

### What AI demonstrably accelerates

Public reporting from AI providers (OpenAI and Microsoft began publishing disclosures of state-linked actors using their models in February 2024; Anthropic and Google followed with similar threat-intel reporting through 2025) shows real adversary usage concentrated in: reconnaissance and target research, translation and lure-writing, scripting and tool debugging, and vulnerability research assistance. By late 2025, Anthropic publicly reported disrupting what it described as a largely AI-orchestrated espionage campaign attributed to a Chinese state-linked group — indicating the frontier is moving from "AI as a helper" toward "AI executing significant portions of intrusion workflows under human direction." Treat individual claims cautiously, but the trendline is consistent across every provider's reporting.

For malware: LLM guardrails are bypassable and open-weight models run without them, so AI-assisted commodity malware development is real — faster variant generation, faster adaptation of public exploit code, polymorphic evasion. What public evidence does *not* yet show (early 2026): AI autonomously discovering and weaponizing novel exploits end-to-end, or authoring novel ICS-physics attacks. Net effect so far: **more attackers, faster iteration, cheaper operations** — a volume-and-velocity problem more than a new-capability problem.

### Stage 2 still needs engineers — for now

Recall the ICS Cyber Kill Chain: Stage 1 (get in, persist, find the OT environment) uses ordinary enterprise tradecraft — exactly the part AI accelerates. **Stage 2** — developing an attack that manipulates a *specific* physical process — requires understanding that plant's controllers, logic, instrumentation, and physics: what TRISIS needed (Triconex internals) or what PIPEDREAM's developers needed (deep CODESYS and protocol knowledge). A 2026-era LLM can explain ladder logic, summarize a PLC manual, and draft protocol code — useful to an attacker as a *tutor and accelerant* for someone who already thinks like an engineer. It cannot replace knowing how the actual line behaves, what setpoints matter, and what the safety layer will catch. The skill floor for *credible ICS process attacks* has lowered modestly, not collapsed.

Say the caveat out loud, though: that is a perishable assessment. Capabilities are improving fast, threat-intel reporting in 2025 already showed AI handling larger fractions of intrusion work, and a leader should revisit this assumption at least annually rather than carve it in stone.

### Adversarial ML: attacking the detectors

As defenders deploy ML, the models become targets:

- **Evasion**: shaping malicious activity to score "normal" — slow, low-volume, mimicking legitimate engineering patterns. Mature ICS adversaries already did this instinctively (living-off-the-land with real tools); adversarial techniques formalize it.
- **Poisoning**: corrupting the training data. The OT-specific worry: anomaly models that continuously learn from live traffic can be *boiled slowly* — an attacker with a foothold introduces gradual traffic changes the model absorbs as normal, then the real attack arrives pre-baselined. Mitigations: review-gated baseline updates instead of silent continuous learning, and layered non-ML detections (config-change alerts fire regardless of what the traffic model thinks).
- Academic work on both is extensive; *documented* in-the-wild poisoning of OT detection systems remains scarce as of early 2026 — treat it as an architecture-design consideration, not a current-incident pattern.

### Leadership translation

Plan for: more frequent, better-crafted Stage 1 intrusions (volume problem — argues for the boring fundamentals: segmentation, MFA, monitoring, response speed); state actors using AI to scale operations they already ran; and your own ML detections being studied. Do not yet plan for: script kiddies pushing novel TRISIS-class attacks from a chatbot. Re-evaluate that sentence every year.`,
      bridge: `Your Stage 2 instincts are the credential here: you know that damaging a real line requires knowing which servo to stall, which interlock masks the fault, which vision check would catch bad product — knowledge an LLM cannot scrape because it lives in your head and your project files. That is also the defensive insight: protect the artifacts that encode it (PLC projects, P&IDs, network diagrams, HMI screens), because they are exactly what turns an AI-accelerated intruder into a process threat. Treat your EWS file shares the way the Navy taught you to treat classified material — the compilation of individually mundane documents is the secret.`,
      quiz: [
        {
          id: "ai-05-q1",
          q: `Based on public reporting through 2025, what have adversaries demonstrably used AI for?`,
          options: [
            `Autonomously discovering and weaponizing novel ICS zero-days end to end`,
            `Reconnaissance, lure-writing, scripting and tool debugging, and increasingly large portions of intrusion workflows under human direction`,
            `Physically manipulating safety instrumented systems via prompts`,
            `Nothing — no provider has documented adversary AI use`
          ],
          answer: 1,
          explain: `Provider disclosures since February 2024 (OpenAI/Microsoft, later Anthropic and Google) document recon, social engineering, and coding assistance, with late-2025 reporting showing AI orchestrating growing fractions of campaigns — but not autonomous novel ICS attack creation.`
        },
        {
          id: "ai-05-q2",
          q: `Why does Stage 2 of the ICS Cyber Kill Chain remain relatively resistant to AI skill-floor collapse as of early 2026?`,
          options: [
            `Stage 2 tools are export-controlled and unavailable to attackers`,
            `ICS protocols are too obscure for language models to learn`,
            `Manipulating a specific physical process requires plant-specific engineering knowledge — controller logic, instrumentation, physics, safety layers — that an LLM can tutor toward but not substitute for`,
            `Stage 2 attacks are impossible without physical plant access`
          ],
          answer: 2,
          explain: `AI accelerates the generic intrusion stages, but a credible process attack still demands understanding how the actual line behaves — though this is a dated, perishable assessment to revisit annually.`
        },
        {
          id: "ai-05-q3",
          q: `An attacker with a network foothold gradually introduces small traffic changes that a continuously learning anomaly model absorbs as normal, then launches the real attack pre-baselined. What is this technique, and one sound mitigation?`,
          options: [
            `Prompt injection; filter all model inputs`,
            `Model inversion; encrypt the training data`,
            `Evasion via encryption; decrypt all OT traffic`,
            `Data poisoning of the baseline; require human-review-gated baseline updates and keep non-ML detection layers like config-change alerts`
          ],
          answer: 3,
          explain: `Slow-boil poisoning exploits silent continuous learning; gating baseline changes behind review and layering detections that do not depend on the traffic model breaks the technique.`
        },
        {
          id: "ai-05-q4",
          q: `What is the most defensible leadership conclusion about AI's effect on the OT threat landscape in early 2026?`,
          options: [
            `Expect higher volume and quality of conventional intrusions — which argues for fundamentals like segmentation, MFA, and detection — while re-evaluating the "Stage 2 still needs engineers" assumption regularly`,
            `AI has made all existing security controls obsolete`,
            `AI threats are pure hype and require no planning changes`,
            `Only air-gapping can defend against AI-enabled attackers`
          ],
          answer: 0,
          explain: `The documented effect is volume and velocity on commodity stages, best answered by disciplined fundamentals; the honest caveat is that the assessment is dated and the capability curve is steep.`
        }
      ]
    },
    {
      id: "ai-06",
      title: "AI/LLM Governance in OT Environments",
      minutes: 9,
      content: `### The problem arrives by itself

You will not decide whether AI enters your OT environment — it is already arriving: engineers pasting error logs into chatbots, vendors embedding copilots in engineering software, platforms shipping cloud-connected AI features, and somebody on the team experimenting with an agent framework. Ungoverned, each is a quiet incident. The governance job is to channel real productivity gains while keeping three specific failure classes away from the process.

### The three OT-specific risk classes

**1. Data leakage to cloud models.** The prompt is an exfiltration channel. A network diagram pasted in for "help me document this," a PLC program uploaded for debugging, an alert export with internal IPs and asset names — each may transit and persist with a third party, potentially used for training under consumer terms. For OT the stakes are specific: network diagrams, configs, and logic files are precisely the Stage 2 reconnaissance package an ICS attacker needs (ai-05), and in your world some of it is also FDA-confidential or export-controlled. Enterprise agreements with no-training commitments and data residency terms reduce this; they do not excuse classification discipline.

**2. Hallucinated technical content.** An LLM asked for a firewall rule, a controller configuration step, or "the safe way to update this firmware" will sometimes produce confident, wrong, plausible output. In IT that wastes an afternoon; in OT a wrong-but-plausible config change can stop a line or mask a safety issue. Anything LLM-generated that touches a production system goes through the same review and change control as human-authored work — no exceptions for "the AI said."

**3. Agentic tools with write access.** The sharp edge of 2025-26. Agents — LLMs that take actions: run commands, call APIs, modify configs — are genuinely useful in IT operations and are being marketed toward OT. An agent with write access near control systems combines hallucination with execution, and is also a new attack surface: **prompt injection** (hostile instructions embedded in content the agent reads — an alert description, a device banner, a vendor doc) can redirect an agent's actions, and as of early 2026 there is no robust general defense, only mitigations. Position as of 2026: agents may *read* (query platforms, summarize, draft) in OT contexts; agents do not get *write* access to OT systems. Period.

### Policy elements that work

Keep it to a page or two; review quarterly because the landscape moves in months:

- **Approved tools list.** Named tools under enterprise terms (no training on your data, audit logging). Everything else is prohibited by default — and pair the prohibition with a sanctioned alternative, or you breed shadow AI.
- **Data classification rules in plain language.** Never into any external model: credentials, network diagrams and IPs, PLC/robot/vision programs and configs, safety system anything, unreleased product data, FDA-regulated records, export-controlled material. Make the list concrete enough that a technician can apply it at midnight.
- **Human-in-the-loop requirements.** A named, qualified human reviews and owns any AI output that becomes a config change, an incident decision, a report to leadership, or a regulatory artifact.
- **Air-gapped / local model options.** By 2026, capable open-weight models run on-prem at reasonable cost. For sensitive analysis — logic review, incident work on real configs, anything classification rules bar from the cloud — a local model is the pressure valve that makes the rest of the policy livable.
- **Where AI is out of the loop entirely.** Write this as a bright line: no AI in safety instrumented functions (your SIL-rated logic stays deterministic, full stop — this aligns with emerging regulator and standards-body thinking on AI in safety applications), no AI issuing direct control actions to the process, no autonomous AI changes to security controls (firewall rules, access) without human execution.

### Governance hooks

You do not need an AI bureaucracy: fold AI tools into existing change management and vendor risk processes (a copilot feature in your EWS software is a *change*; a cloud AI platform feature is a *vendor risk review*), add AI questions to procurement (ai-07), and assign one owner for the policy. NIST's AI Risk Management Framework (AI RMF 1.0, 2023, plus its 2024 generative-AI profile) is the reference frame auditors increasingly recognize — useful skeleton, but your one-page OT policy is what actually protects the plant.`,
      bridge: `This is FDA change control pointed at a new object class — you have spent years enforcing "no unvalidated change touches production," and the rule "no unreviewed AI output touches production" is the same discipline with a new author. Your version-traceability instinct covers the audit half: if an AI-drafted change ships, the record shows what was generated, who reviewed, who approved. And you already run the vendor-software governance this needs — when Rockwell or your vision vendor embeds an AI assistant in the next software rev, your existing change-control gate is where it gets caught and reviewed, not after it is on every EWS.`,
      quiz: [
        {
          id: "ai-06-q1",
          q: `Why is pasting a network diagram or PLC program into a public cloud LLM a specifically OT-shaped risk, beyond generic confidentiality?`,
          options: [
            `Cloud LLMs automatically publish all uploads publicly`,
            `Those artifacts are exactly the plant-specific knowledge package a Stage 2 ICS attacker needs, and may also be FDA-confidential or export-controlled`,
            `LLMs corrupt PLC files when processing them`,
            `It violates the EtherNet/IP protocol specification`
          ],
          answer: 1,
          explain: `Diagrams, configs, and logic encode the process knowledge that turns an intruder into a process threat; leaking them to third-party systems hands over the hardest-to-obtain attack prerequisite.`
        },
        {
          id: "ai-06-q2",
          q: `What is the correct process control for LLM-generated technical content (configs, procedures, rules) destined for production OT systems?`,
          options: [
            `Apply it immediately if the model expresses high confidence`,
            `Only use it on night shift when production load is lower`,
            `It passes through the same human review and change control as human-authored work — hallucinated-but-plausible output is the failure mode being controlled`,
            `Ban all LLM-generated content from the company entirely`
          ],
          answer: 2,
          explain: `The risk is confident, wrong, plausible output executed near a physical process; existing review and change-control gates are the proven countermeasure, applied without an AI exception.`
        },
        {
          id: "ai-06-q3",
          q: `What is prompt injection, and why does it make agentic AI with write access especially dangerous near control systems?`,
          options: [
            `A SQL attack on the model's training database`,
            `Overclocking a model to degrade its accuracy`,
            `A method for stealing model weights from cloud providers`,
            `Hostile instructions hidden in content the agent reads can redirect its actions, and with write access those redirected actions execute — with no robust general defense as of early 2026`
          ],
          answer: 3,
          explain: `Agents act on text they ingest (alerts, banners, documents); embedded adversarial instructions can hijack the agent, which is why 2026 practice allows read-only agents in OT but no write access to OT systems.`
        },
        {
          id: "ai-06-q4",
          q: `Which placement of AI should an OT AI policy prohibit as a bright line?`,
          options: [
            `AI inside safety instrumented functions and AI issuing direct control actions to the process`,
            `AI summarizing threat intelligence reports`,
            `AI drafting incident report timelines for human review`,
            `AI translating natural-language questions into platform queries`
          ],
          answer: 0,
          explain: `Safety functions must remain deterministic and verifiable, and no AI output should command the process; summarization, drafting, and querying are the appropriate, human-reviewed uses.`
        }
      ]
    },
    {
      id: "ai-07",
      title: "Leadership Lens: Evaluating AI-Powered Vendor Claims",
      minutes: 9,
      content: `### AI-washing is the 2026 buying hazard

Walk any security trade show floor and every booth says AI. Some of it is real (ML baselining with years of production history, mature copilots, EPSS-style prediction); plenty is **AI-washing** — rules engines and signature matching rebranded, or a thin LLM wrapper bolted on for the checkbox. Your procurement experience transfers, but AI claims need a sharper toolkit because the claims are harder to falsify from a datasheet and the field changes quarterly. The general posture: make vendors *decompose* the claim. "AI-powered" is not an answer; it is the start of the interrogation.

### The question set

Take these into every briefing:

- **What, specifically, is the AI?** Supervised classifier, unsupervised anomaly model, an LLM assistant, or rules wearing a costume? Each has different failure modes and different diligence. A vendor who cannot answer at this level has answered.
- **Trained on what?** Generic internet/IT data, the vendor's cross-customer OT telemetry, or your environment after deployment? Does it keep learning in production (then ask about poisoning and drift — ai-05), and does *your* data feed their shared models — and can you opt out contractually?
- **What are the false positive rates in an environment like MINE?** Refuse benchmark numbers; demand alerts-per-sensor-per-day from a reference plant of comparable size and vendor mix, then get the reference on the phone. The deciding number is analyst minutes per day, not model precision.
- **What happens when it is wrong?** Both directions: how do I find what it missed, and how do I see *why* it alerted (explainability), correct it, and suppress recurrence? A model you cannot interrogate or tune is a liability with a dashboard.
- **Where does inference run?** On-prem appliance, your cloud tenant, or vendor cloud? What exactly leaves the plant — packet data, asset inventories, configs, alert content? This is your ai-06 governance applied at procurement: in regulated or sensitive plants, cloud-only inference may be a disqualifier on day one, so ask it first.
- **What does the AI cost over time?** Cloud AI features increasingly carry consumption pricing; model the per-seat or per-query costs at *your* real volumes, not the demo's.

### POC design that produces a decision

Insist on a proof of concept on a real production segment — your traffic, your vendor mix, your weird legacy gear. Mechanics: success criteria written *before* it starts (catch rate on seeded test behaviors your engineers stage during a maintenance window, FP ceiling per day, analyst time per alert, discovery accuracy against your known inventory); long enough to span normal operations *and* at least one maintenance window — AI baselining looks brilliant in steady state and falls over during real plant life; your analysts drive the console, not the vendor SE; and a written exit decision either way. A POC without pre-agreed criteria is a sales process you are paying for with your team's time.

### Budgeting: fundamentals first, AI as multiplier

The financial discipline, stated plainly: **AI features multiply the value of fundamentals; they do not substitute for them.** AI prioritization is noise without an accurate asset inventory. ML baselining cannot see traffic you have no sensors capturing. A copilot summarizing alerts presumes detections and someone to act on them. So sequence spend: inventory and visibility, segmentation, monitoring, response capability, backups — then AI features that multiply each. When a vendor leads with the AI tier, ask what the product does with AI turned off; that is the floor you are actually buying, and often the cheaper tier is the right purchase this year. The converse discipline too: do not penalize a vendor for *honest* modesty about AI — the one who says "our anomaly engine is statistics plus protocol parsing, and here is exactly where it fails" is usually the more trustworthy engineering organization than the one promising autonomous AI defense.

One more 2026 reality: this market moves quarterly. Shortlist evaluations older than a year are stale, contract for flexibility (shorter terms, feature-tier mobility), and assign someone to re-scan the landscape annually rather than treating the platform decision as ten-year infrastructure.`,
      bridge: `You have spent seven years cutting through vendor claims on robots, vision systems, and integrators — and you already know the playbook: never buy from the brochure, run it on your parts, write acceptance criteria into the PO. A detection POC with pre-agreed success criteria is exactly a machine runoff (FAT/SAT) for software: seeded test behaviors are your test parts, FP-rate ceilings are your cycle-time and yield gates. Your vision-system experience is the perfect analogy for ML claims specifically — you have watched "99 percent accurate" inspection demos collapse on real production lighting and part variation. Ask AI-detection vendors the same question you asked vision vendors: show me the failure modes on MY line.`,
      quiz: [
        {
          id: "ai-07-q1",
          q: `What is "AI-washing," and what is the first-line defense against it in procurement?`,
          options: [
            `Training models on sanitized data; defend by auditing datasets`,
            `Marketing conventional rules/signature products as AI; defend by making vendors decompose exactly what the AI is, what it was trained on, and how it fails`,
            `Using AI to clean malware from networks; defend with backups`,
            `Removing AI features after purchase; defend with contract penalties`
          ],
          answer: 1,
          explain: `Much "AI-powered" marketing rebrands rules engines or adds thin LLM wrappers; forcing specific decomposition — model type, training data, failure modes — separates substance from costume.`
        },
        {
          id: "ai-07-q2",
          q: `Why should a leader refuse vendor benchmark false-positive numbers and instead demand reference data from a comparable plant?`,
          options: [
            `Benchmark numbers are illegal to publish in most jurisdictions`,
            `Comparable-plant references are always provided free of charge`,
            `False positives only occur in laboratory environments`,
            `FP economics are environment-dependent — the deciding number is analyst minutes per day in an environment like yours, which curated benchmarks do not predict`
          ],
          answer: 3,
          explain: `Detection value is set by alert volume and triage cost in your actual environment and vendor mix; benchmark precision figures from curated datasets routinely fail to transfer.`
        },
        {
          id: "ai-07-q3",
          q: `Which POC design element most distinguishes a real evaluation from a vendor-driven demo?`,
          options: [
            `Success criteria written before the POC starts, including seeded test behaviors, FP ceilings, and coverage of at least one real maintenance window`,
            `Running the POC in the vendor's cloud lab environment`,
            `Letting the vendor SE operate the console throughout`,
            `Extending the POC indefinitely until the tool performs well`
          ],
          answer: 0,
          explain: `Pre-agreed, measurable criteria on a real production segment — including plant life like maintenance windows that break naive baselines — produce a defensible buy/no-buy decision instead of a paid sales process.`
        },
        {
          id: "ai-07-q4",
          q: `A plant has no asset inventory and minimal network monitoring. A vendor proposes an AI-driven vulnerability prioritization module. What is the fundamentals-first response?`,
          options: [
            `Buy it immediately — AI prioritization compensates for missing inventory`,
            `Reject AI tooling permanently as unproven in OT`,
            `Decline for now: AI prioritization multiplies the value of an accurate inventory and visibility, and is mostly noise without them — fund those foundations first`,
            `Buy it but run it only during maintenance windows`
          ],
          answer: 2,
          explain: `AI features are multipliers on fundamentals, not substitutes — prioritization without trustworthy inventory and reachability data has nothing accurate to prioritize. Sequence: visibility, segmentation, monitoring, then AI layers.`
        }
      ]
    }
  ]
});
