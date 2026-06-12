window.OTSEC = window.OTSEC || { modules: [], scenarios: [], flashcards: [], glossary: [] };
window.OTSEC.modules.push({
  id: "leadership",
  order: 7,
  title: "Governance & OT Security Leadership",
  tagline: "Building and running an OT security program — the director-level view",
  description: `Everything in modules 1-6 is what your team will do. This module is what YOU will do: stand up a program from nothing, navigate IT/OT politics, win budget, brief the board, hire a team, and write the governance documents that make it all stick. This is where your 7 years of engineering leadership convert directly into OT security leadership.`,
  interviewPrep: [
    {
      question: `Walk me through your first 90 days as our OT security manager.`,
      answerOutline: `Structure beats improvisation here. Outline: Days 1-30 — listen and inventory: meet plant managers, IT security, engineering leads; get an asset inventory started (even a spreadsheet beats nothing); review existing policies and past incidents. Days 31-60 — assess and prioritize: map current state against a framework (NIST CSF 2.0 or 62443-2-1), run a consequence-driven look at the top 3 worst-case scenarios, identify quick wins (remote access cleanup, USB policy, backup verification). Days 61-90 — propose the roadmap: phased 18-24 month plan with budget, governance structure (IT/OT steering committee), and 3-5 metrics you'll report quarterly. Emphasize: no big tool purchases in the first 90 days — visibility and relationships first.`
    },
    {
      question: `How would you handle a plant manager who refuses to allow security changes on his line?`,
      answerOutline: `This question tests whether you'll be a cop or a partner. Strong answer: start from his incentives — he's measured on OEE and delivery, and a botched change that drops his line is career damage to him. Acknowledge that explicitly (you've BEEN on his side of the table). Then: bring data, not mandates — show what a ransomware-driven 2-week outage costs versus the 4-hour maintenance window you're asking for. Offer to pilot on a non-constraint line, schedule inside existing shutdown windows, and put your own name on the change-control risk assessment. Escalate only when there's a genuine unaccepted risk, and do it transparently through the governance process, never around him.`
    },
    {
      question: `What metrics would you report to the board for an OT security program?`,
      answerOutline: `Boards want trend lines and business framing, not vulnerability counts. Good set: (1) % of OT assets inventoried and monitored — visibility is the foundation metric; (2) mean time to detect/respond for OT incidents or red-team findings; (3) recovery confidence — % of critical systems with tested, restorable backups (tie to downtime cost/hour); (4) % of remote access through the managed, MFA-enforced path; (5) progress against the roadmap you sold them. Add peer context (incidents in your industry this quarter). One slide, five numbers, same five every quarter so trends are visible.`
    }
  ],
  lessons: [
    {
      id: "ldr-01",
      title: "Building an OT Security Program from Scratch",
      minutes: 9,
      content: `Most OT security manager/director job postings boil down to one sentence: "we have almost nothing — build it." Here's the playbook.

### Start with a framework skeleton, not tools

Vendors will happily sell you a detection platform on day one. Resist. A program needs a skeleton first, and you have two good ones to choose from (use both, actually): **IEC 62443-2-1**, which defines the requirements for an asset owner's cyber security management system (CSMS), and **NIST CSF 2.0**, whose six functions — Govern, Identify, Protect, Detect, Respond, Recover — give you a board-friendly structure. CSF 2.0 added Govern as a first-class function in 2024, which validates what practitioners already knew: programs fail on governance, not technology.

### The first 90 days

- **Days 1-30 — listen and see.** Meet every plant manager, the CISO/IT security lead, engineering, maintenance, HR (for training data), and legal (for incident obligations). Start an asset inventory immediately — even a spreadsheet of PLCs, HMIs, historians, and engineering workstations with firmware versions and network locations. You cannot scope anything else without it.
- **Days 31-60 — assess.** Map current state against CSF or 62443-2-1. Run a lightweight consequence-driven exercise: what are the three scenarios that would genuinely hurt the company (safety event, multi-week line-down, regulated-product integrity)? Walk the attack paths to them.
- **Days 61-90 — propose.** A phased 18-24 month roadmap, a governance structure, and the metrics you'll report. Quick wins go in phase 0: vendor remote access cleanup, removable-media policy, verified backups of critical PLC programs and HMI images.

### Crawl, walk, run

A useful maturity sequencing, consistent with models like **C2M2** (DOE's Cybersecurity Capability Maturity Model):

1. **Crawl:** asset inventory, network architecture documentation, backup/recovery verification, remote access control, basic policies, incident contact list.
2. **Walk:** network segmentation aligned to zones and conduits, passive OT network monitoring, OT-specific incident response plan with exercises, vulnerability management with compensating controls.
3. **Run:** threat hunting, threat-intel-driven detections, integration with enterprise SOC, supplier security requirements in procurement (62443-4-1/4-2 language in contracts), measured SL targets per zone.

The order matters. Monitoring before inventory means alerts about devices nobody can identify. Segmentation before architecture documentation means broken production flows and a credibility crater.

### The political foundation

A program survives on three relationships: the **CISO** (funding and air cover — even if you don't report to them), **plant leadership** (access and operational trust), and **engineering** (the people who will actually implement changes). Your standing meeting structure — typically an IT/OT security steering committee — is where conflicts get resolved before they become escalations. Charter it early, with named members and decision authority, and put a plant operations leader on it, not just IT people.

One honest caveat: there's no consensus "right" first-year sequence — SANS, Dragos, and 62443 each slice it differently. But every credible version starts with visibility and governance, not detection tooling.`,
      bridge: `You've already run this play. Standing up an OT security program is structurally identical to standing up the controls engineering function you've led: inventory the fleet, document the as-built state, establish change control, then improve in phases against a capital plan. Your software version traceability program IS a CSMS component — 62443-2-1 just adds threat scenarios to the change-control logic you built for FDA compliance. When a CISO asks "how would you build the program," you're not learning a new skill; you're translating one you've exercised for 7 years into security vocabulary.`,
      quiz: [
        {
          id: "ldr-01-q1",
          q: `What should an OT security program establish FIRST, before buying detection tooling?`,
          options: [
            `Asset inventory and governance structure`,
            `A 24/7 SOC with OT analysts`,
            `Machine-learning anomaly detection on all network segments`,
            `Penetration testing of all PLCs`
          ],
          answer: 0,
          explain: `Visibility (asset inventory) and governance come first — monitoring before inventory produces alerts about devices nobody can identify, and programs fail on governance, not technology.`
        },
        {
          id: "ldr-01-q2",
          q: `Which standard defines the requirements for an asset owner's cyber security management system (CSMS)?`,
          options: [
            `IEC 62443-2-1`,
            `IEC 62443-4-2`,
            `NERC CIP-005`,
            `NIST SP 800-53`
          ],
          answer: 0,
          explain: `62443-2-1 is the policies-and-procedures part of the series aimed at asset owners; 4-2 covers component technical requirements for product suppliers.`
        },
        {
          id: "ldr-01-q3",
          q: `What did NIST CSF 2.0 (2024) add as a sixth function?`,
          options: [
            `Govern`,
            `Recover`,
            `Hunt`,
            `Segment`
          ],
          answer: 0,
          explain: `CSF 2.0 elevated Govern to a first-class function alongside Identify, Protect, Detect, Respond, and Recover — recognizing that program failures are usually governance failures.`
        },
        {
          id: "ldr-01-q4",
          q: `In the crawl-walk-run sequencing, why does segmentation come AFTER architecture documentation?`,
          options: [
            `Segmenting an undocumented network risks breaking production flows you didn't know existed`,
            `Segmentation requires NERC CIP certification first`,
            `Firewalls cannot be installed until a SOC exists`,
            `Documentation is required by FDA before any network change`
          ],
          answer: 0,
          explain: `OT networks accumulate undocumented dependencies (historian pulls, license servers, OEM links). Segmenting blind takes lines down and destroys the program's credibility.`
        }
      ]
    },
    {
      id: "ldr-02",
      title: "IT/OT Convergence Politics",
      minutes: 8,
      content: `Every OT security leader's hardest problems are organizational, not technical. The IT/OT divide is real, old, and rational on both sides — and your career arc makes you unusually equipped to bridge it.

### Why the distrust is rational

IT optimizes for confidentiality and standardization: patch monthly, reboot freely, retire hardware on a 3-5 year cycle, centralize everything. OT optimizes for availability and safety: a control system runs 15-20 years, changes go through change control with revalidation, and an unplanned reboot can scrap product or trip a safety system. When IT pushed patches to plant systems and broke them — and in most companies this has actually happened at least once — OT learned to keep IT out. When OT ran flat unpatched networks with vendor backdoors, IT learned OT was reckless. Both lessons stuck.

The classic flashpoints: patching cadence, Windows domain membership for HMIs, antivirus agents on engineering workstations, who owns the firewall between Levels 3 and 4, remote access policy, and who gets called at 2 AM.

### Reporting models — and their failure modes

Where should OT security sit? Three common models:

- **Under the CISO.** Pros: funding, tooling, career paths, one risk picture. Cons: IT-centric policies applied blindly to OT; loss of plant trust if the team has no operational empathy.
- **Under engineering/operations.** Pros: operational credibility, access, plant trust. Cons: chronically underfunded, isolated from threat intel and enterprise security capability, "grade your own homework" risk.
- **Hybrid (most common at maturity):** OT security reports to the CISO with a dotted line to operations, or vice versa, plus a chartered **IT/OT steering committee** that owns shared decisions — patching SLAs, remote access standards, incident command roles.

There's no universally right answer; surveys (SANS ICS, Dragos year-in-review) consistently show a mix, with a slow drift toward CISO ownership with embedded OT-native staff. What matters more than the org chart is whether someone with real OT understanding has decision authority.

### Playing the bridge

Practical moves that work:

- **Translate, don't transmit.** When the CISO says "deploy EDR everywhere," translate to: EDR on engineering workstations and historians where supported, application allowlisting on HMIs, network monitoring for the PLCs that can't run agents. You've satisfied the intent without the outage.
- **Joint wins early.** Pick one project that makes both sides look good — replacing the OEM's unmanaged TeamViewer access with a monitored jump host satisfies IT's audit finding AND gives plant engineers a faster, more reliable vendor support path.
- **Respect the change culture.** Run security changes through the plant's existing change control. The moment security bypasses change management "because it's urgent," you've become the thing OT distrusts.
- **Make the steering committee real.** Named members, decision authority, a standing agenda (exceptions, incidents, roadmap), quarterly executive readout. Politics get resolved in committee or they get resolved in escalation wars.

Your advantage: when a plant manager pushes back, you can answer in OEE, scrap, and validation language. Use it openly — "I've run lines; I won't break yours" is the single most disarming sentence in this job.`,
      bridge: `You've sat on the OT side of this table for 11 years — you already know exactly which IT behaviors destroy trust, because they've been done to you. That's not baggage; it's your differentiation. In interviews, tell the story from both directions: a time IT-style change management would have prevented a controls problem, and a time blind IT policy would have stopped production. The candidate pool for these roles is mostly IT security people who've never held a maintenance window; you're the rarer thing — an operator who learned security, not a security person guessing at operations.`,
      quiz: [
        {
          id: "ldr-02-q1",
          q: `What is the core values conflict that drives IT/OT distrust?`,
          options: [
            `IT prioritizes confidentiality and standardization; OT prioritizes availability and safety`,
            `IT staff are better trained than OT staff`,
            `OT systems are newer and change faster than IT systems`,
            `IT and OT use incompatible programming languages`
          ],
          answer: 0,
          explain: `The patch-monthly/reboot-freely IT culture collides with OT's 15-20 year lifecycles, change control, and uptime requirements. Both cultures are rational for their domains.`
        },
        {
          id: "ldr-02-q2",
          q: `What is the main risk of placing OT security entirely under the CISO with no OT-native staff?`,
          options: [
            `IT-centric policies get applied blindly to OT and plant trust is lost`,
            `The program will be overfunded`,
            `NERC CIP prohibits this reporting structure`,
            `The CISO cannot legally own OT risk`
          ],
          answer: 0,
          explain: `CISO ownership brings funding and capability, but without operational empathy the program mandates things that break production and the plants stop cooperating.`
        },
        {
          id: "ldr-02-q3",
          q: `The CISO mandates "EDR on every OT device." What is the best response from an OT security leader?`,
          options: [
            `Translate the intent: EDR where supported (EWS, historians), allowlisting on HMIs, network monitoring for PLCs`,
            `Refuse — no security agents belong anywhere in OT`,
            `Comply fully — install agents on all devices including PLCs`,
            `Escalate to the CEO immediately`
          ],
          answer: 0,
          explain: `PLCs can't run EDR agents at all, and HMIs often can't tolerate them. Meeting the control objective with OT-appropriate mechanisms satisfies the intent without outages.`
        },
        {
          id: "ldr-02-q4",
          q: `Why should security changes go through the plant's existing change control process?`,
          options: [
            `Bypassing change management makes security the unreliable actor OT already distrusts`,
            `Change control is legally required for all security work`,
            `It slows the project down, which reduces spending`,
            `Auditors only review change tickets, not configurations`
          ],
          answer: 0,
          explain: `Credibility is the currency. The moment security bypasses the plant's change discipline "because security is urgent," it confirms every fear OT has about outsiders touching production.`
        }
      ]
    },
    {
      id: "ldr-03",
      title: "Budgeting and Business Cases",
      minutes: 9,
      content: `Security budgets die for a predictable reason: they're pitched as fear, not as risk-managed business investment. You already know how to build a capital justification for a robot cell; an OT security budget is the same artifact with a different threat model.

### Anchor on downtime cost — the number you already know

The most credible single number in any OT security business case is **cost of downtime per hour**, because it's auditable from existing operations data: lost throughput × margin, plus scrap, plus overtime recovery, plus (in regulated industries) potential batch-record and investigation costs. If your plant produces $80K/hour of margin contribution and a ransomware event credibly takes you down for 5-10 days — which is the realistic range seen in manufacturing incidents — the exposure math does itself: 120-240 hours × $80K is $10-19M. Suddenly $500K is 3-5% of one incident's exposure. That's the structure boards understand: insurance logic, not fear logic.

Strengthen it with frequency context, carefully sourced: manufacturing has been the most-attacked ransomware vertical in IBM X-Force and Dragos annual reporting for several consecutive years, and the majority of OT-impacting incidents originate in IT and spread (cite the specific year's report you use — numbers move annually, so quote a source, don't memorize one).

### Structure of the ask

A phased ask beats a monolithic one:

- **Phase 1 (visibility & hygiene):** asset inventory tooling or services, network architecture documentation, backup verification, remote access consolidation. Typically the cheapest phase with the highest risk reduction per dollar.
- **Phase 2 (architecture):** segmentation projects, IDMZ build-out, firewall refresh. Often the most capital-intensive — bundle it with planned network upgrades or machine projects where possible.
- **Phase 3 (operations):** monitoring platform, response retainers, exercises, training.

Each phase gets: cost, the specific risks it reduces (tied to your consequence scenarios), and the metric that proves it worked. Funding visibility before tools-sprawl is also the sequencing every credible framework endorses — you can cite 62443's risk-assessment-first logic (62443-3-2) when challenged.

### Capex vs opex

Use the company's own machinery: segmentation hardware, IDMZ infrastructure, and one-time integration are natural **capex** (and can ride on existing capital projects — adding a properly segmented cell network to a new line's budget is far easier than retrofitting). Monitoring subscriptions, MSSP/OT-watch services, and headcount are **opex**. Splitting the ask this way also splits the approval thresholds, which often makes each piece individually approvable.

### Handling the classic objections

- *"We have firewalls."* Firewalls are one preventive control at one layer; the ask funds visibility, recovery, and response — the controls that matter when prevention fails. NotPetya victims had firewalls.
- *"We've never been hit."* Neither had Colonial Pipeline. Also, without monitoring you don't actually know — absence of detection isn't absence of compromise (Volt Typhoon's whole strategy is being invisible to companies without monitoring).
- *"Can't insurance cover this?"* Premiums and exclusions have tightened sharply since 2020; insurers increasingly require exactly the controls you're proposing, and war-exclusion litigation (Merck/NotPetya) showed coverage isn't guaranteed.

Commit to reporting metrics on what they fund. Boards re-fund programs that show trend lines.`,
      bridge: `This is your strongest module — you've justified capital for robot cells, vision systems, and line upgrades for years, against the same CFO math. The translation: MTBF/OEE logic becomes incident-likelihood logic; the cost-of-quality argument becomes cost-of-downtime; preventive maintenance budgets become monitoring opex. One upgrade: in security, ROI is probabilistic, so frame in exposure reduction and insurance terms rather than payback period. When asked in an interview to "justify a $500K budget," walk the downtime-anchor math out loud — it's the answer almost no IT-background candidate can do with real plant numbers.`,
      quiz: [
        {
          id: "ldr-03-q1",
          q: `What is the most credible anchor number for an OT security business case?`,
          options: [
            `Cost of production downtime per hour, derived from operations data`,
            `The number of CVEs in the plant`,
            `Industry-average security spend as % of revenue`,
            `The price of the most expensive vendor tool`
          ],
          answer: 0,
          explain: `Downtime cost is auditable from existing operational data and converts security risk directly into business exposure — insurance logic instead of fear logic.`
        },
        {
          id: "ldr-03-q2",
          q: `Which phase of OT security spending typically has the highest risk reduction per dollar?`,
          options: [
            `Visibility and hygiene: inventory, backups, remote access cleanup`,
            `A machine-learning detection platform`,
            `Penetration testing retainers`,
            `Physical security upgrades`
          ],
          answer: 0,
          explain: `Foundational hygiene is cheap and addresses the most common real attack paths (remote access, recovery failures), which is why every framework sequences it first.`
        },
        {
          id: "ldr-03-q3",
          q: `Why is splitting the ask into capex and opex tactically useful?`,
          options: [
            `It aligns with existing approval machinery and lets infrastructure ride on planned capital projects`,
            `Capex never requires board approval`,
            `Opex spending is invisible to auditors`,
            `It hides the true cost of the program`
          ],
          answer: 0,
          explain: `Segmentation hardware bundled into a new line's capital budget is far easier to approve than a standalone retrofit, and subscriptions/headcount fit normal opex cycles.`
        },
        {
          id: "ldr-03-q4",
          q: `Best response to the board objection "we already have firewalls"?`,
          options: [
            `Firewalls are one preventive layer; this funds visibility, recovery, and response for when prevention fails`,
            `Agree and reduce the ask to zero`,
            `Explain that firewalls are obsolete and should be removed`,
            `Cite that NERC CIP requires more firewalls`
          ],
          answer: 0,
          explain: `Defense in depth: NotPetya's victims had firewalls. Prevention alone fails; the business case rests on detection and recovery capability.`
        }
      ]
    },
    {
      id: "ldr-04",
      title: "Board and Executive Communication",
      minutes: 8,
      content: `Boards don't buy technology; they manage enterprise risk. Your job in the boardroom is translation: from CVEs and zones to dollars, downtime, and fiduciary duty.

### What boards actually care about

Four questions sit behind every board cyber discussion: *How exposed are we? Compared to whom? Is it getting better? What do you need?* Every slide you present should answer one of them. Context that lands: peer incidents in your industry this quarter (a competitor's ransomware shutdown is worth more than any statistic), regulatory exposure, and customer-contract security obligations.

For US public companies, the **SEC cyber disclosure rules (effective December 2023)** raised the stakes: material cybersecurity incidents must be disclosed on Form 8-K within four business days of materiality determination, and annual filings must describe cyber risk management and board oversight. This means your board has personal reasons to understand OT risk — a multi-week plant shutdown is very plausibly material. Know this rule exists; let legal own the details.

### Metrics that work (and ones that don't)

Bad board metrics: vulnerability counts, alerts processed, phishing click rates in isolation. They're activity, not risk, and they invite micromanagement.

Good board metrics are few, trended, and outcome-shaped:

- **% of OT assets inventoried and monitored** — the visibility foundation, honest about coverage gaps
- **Mean time to detect / respond** for OT incidents or exercise findings
- **Recovery confidence:** % of critical systems with tested restores, and estimated recovery time for the worst credible scenario, expressed against downtime cost
- **% of OT remote access through the managed MFA path** — a proxy for the most common attack vector
- **Roadmap progress** against what they funded

Five numbers, same five every quarter, trend arrows. Resist adding more.

### The one-slide OT risk story

If you get ten minutes a year, the slide is: top 3 consequence scenarios (in business terms: "3-week shutdown of Plant 2," not "PLC compromise"), current exposure rating for each, what was done this year, what's asked for next year, and the peer-incident context. Consequence scenarios are your native strength — you can describe exactly what fails, how long recovery takes, and what it costs, with an engineer's credibility.

### Avoiding FUD — and its opposite

Fear, uncertainty, and doubt gets one budget approved and then destroys your credibility when the apocalypse doesn't arrive on schedule. The opposite failure — "all green" dashboards — is worse: the first incident reveals the dashboards were theater. The professional posture is calibrated honesty: "Here's what we can see, here's what we still can't, here's the trend, here's what changes it." Boards respond well to a leader who says "our recovery confidence for Plant 2 is currently low, and here's the plan" — it signals you know where the bodies are buried, which is exactly what oversight wants from management.

Speak in their cadence: open with the answer, support with at most three numbers, close with the decision you need. Save the architecture diagrams for the appendix.`,
      bridge: `You've presented capital projects and program status to executives for years — this is the same skill with one inversion. Engineering presentations sell certainty ("this robot will hit 12-second cycle time"); risk presentations sell calibrated uncertainty ("this investment moves detection from weeks to hours for our top scenarios"). Your scenario fluency is the differentiator: when you say "a compromised line-3 PLC means a full revalidation cycle, here's the timeline," you're describing a process you've actually lived, with FDA change-control costs you can quote from memory. No pure-IT candidate can do that.`,
      quiz: [
        {
          id: "ldr-04-q1",
          q: `Under the SEC cyber disclosure rules (effective Dec 2023), material incidents must be disclosed on Form 8-K within:`,
          options: [
            `Four business days of determining materiality`,
            `Twenty-four hours of detection`,
            `Thirty days of containment`,
            `One year, in the annual report only`
          ],
          answer: 0,
          explain: `The clock runs from the materiality determination, not detection. A multi-week OT shutdown is very plausibly material, which is why boards now care personally about OT risk.`
        },
        {
          id: "ldr-04-q2",
          q: `Which is the BEST board-level OT security metric?`,
          options: [
            `% of critical systems with tested, restorable backups`,
            `Number of vulnerabilities detected this quarter`,
            `Total alerts processed by the SOC`,
            `Number of firewall rules deployed`
          ],
          answer: 0,
          explain: `Recovery confidence is outcome-shaped and converts directly to downtime exposure. Vulnerability and alert counts measure activity, not risk.`
        },
        {
          id: "ldr-04-q3",
          q: `Why is FUD (fear-based selling) a losing long-term strategy with boards?`,
          options: [
            `It wins one budget cycle, then destroys credibility when the predicted apocalypse doesn't arrive`,
            `Boards are legally prohibited from acting on fear`,
            `It always results in too much funding`,
            `Auditors flag FUD in board minutes`
          ],
          answer: 0,
          explain: `Calibrated honesty — what we can see, what we can't, the trend — builds durable trust. FUD has a one-cycle shelf life.`
        },
        {
          id: "ldr-04-q4",
          q: `How should a top risk be framed on a board slide?`,
          options: [
            `As a business consequence: "3-week shutdown of Plant 2," with exposure and mitigation status`,
            `As a technical finding: "CVE-2024-XXXX on the Level 2 HMI segment"`,
            `As a vendor quote for the tool that fixes it`,
            `As a comparison of firewall throughput specs`
          ],
          answer: 0,
          explain: `Boards manage enterprise risk in business terms. Consequence scenarios with dollar and time dimensions answer "how exposed are we" — the question they're actually asking.`
        }
      ]
    },
    {
      id: "ldr-05",
      title: "Hiring and Building the Team",
      minutes: 8,
      content: `The "OT security unicorn" — deep control systems knowledge plus deep security skills plus communication ability — barely exists on the open market, and when one appears, five companies bid. So team-building in this field is mostly a *development* problem, not a recruiting problem.

### The two conversion paths

You build OT security people from two feedstocks:

- **Controls/automation engineers → security.** They already have the rarer knowledge: how plants actually run, what a VFD fault looks like, why you can't just reboot. Teach them networking and security fundamentals (the exact path you're on now). Risk: some don't want the on-call, adversarial mindset.
- **IT security analysts → OT.** They bring detection, forensics, and tooling fluency. Teach them industrial protocols, change-control culture, and above all operational humility — their first month should include shadowing plant engineers and watching a line changeover. Risk: culture rejection by the plants if introduced badly.

A healthy team mixes both, because each covers the other's blind spots. Evidence from SANS ICS survey data and practitioner consensus consistently favors "hire for curiosity and plant empathy, train the security skills" — security knowledge is more teachable than fifteen years of plant intuition.

### Team shapes by maturity

- **One person (you):** governance, risk assessment, and vendor management; lean on IT security for monitoring and an MSSP/retainer for response. Your job is force-multiplication, not heroics.
- **2-4 people:** add an OT security engineer (architecture, segmentation projects) and an analyst (monitoring triage, asset inventory ownership). Site security champions — a trained controls engineer at each plant, part-time — extend your reach cheaply and build plant buy-in.
- **5+ / mature:** dedicated IR capability, threat hunting, supplier security review, exercise program. Few manufacturers below the Fortune 500 get here in-house.

### Build vs buy for operations

24/7 OT monitoring in-house requires roughly 5+ analysts to staff a single seat around the clock — usually indefensible below very large scale. Managed services (Dragos OT Watch, Claroty/partner SOCs, Rockwell and Honeywell managed offerings, OT-capable MSSPs) cover the watch-floor while your small team keeps the judgment roles: risk decisions, plant relationships, response command. Rule of thumb: **outsource eyes, keep brains.**

### Retention and the pipeline

You're hiring in a market where OT security salaries have climbed steadily and GICSP-certified people get recruited constantly. Retention levers that work: real training budgets (SANS courses are expensive and worth it as retention signals), conference time (S4, SANS ICS Summit), interesting work (rotations between plants and projects), and a visible promotion path. For pipeline, look inside first: the controls engineer who keeps asking the security questions in design reviews is your next hire — fund their GICSP and you've created a loyal specialist for a fraction of market recruiting cost.

When interviewing candidates yourself, test for the trait that can't be trained: how they react to "the plant manager says no." Curiosity and diplomacy beat certifications.`,
      bridge: `You are the conversion path this lesson describes — use your own transition as the case study when interviewers ask about team-building. You've also hired and developed controls engineers for 7 years, so you already know how to spot the curious ones and grow them. Your bench-building instinct (apprentice a tech into a controls role) maps one-to-one onto growing analysts. The new wrinkle is the build-vs-buy SOC decision; anchor it the way you'd anchor a maintenance-contract decision: keep judgment in-house, contract the around-the-clock labor.`,
      quiz: [
        {
          id: "ldr-05-q1",
          q: `Why is "hire for curiosity, train for security skills" the consensus strategy in OT security?`,
          options: [
            `Security skills are more teachable than years of plant/operations intuition, and unicorn hires barely exist`,
            `Curious people accept lower salaries`,
            `Certifications are not available for OT security`,
            `Security training takes only a week`
          ],
          answer: 0,
          explain: `The controls engineer who knows why you can't reboot mid-batch is the scarce asset; networking and security fundamentals can be trained in months.`
        },
        {
          id: "ldr-05-q2",
          q: `What is the biggest onboarding risk when converting an IT security analyst to OT?`,
          options: [
            `Culture rejection by the plants if they arrive without operational humility`,
            `They will be unable to learn Modbus`,
            `Their certifications expire in OT roles`,
            `IT analysts cannot legally enter production areas`
          ],
          answer: 0,
          explain: `Tooling fluency transfers easily; trust doesn't. Early plant shadowing and respect for change-control culture determine whether the plants will work with them.`
        },
        {
          id: "ldr-05-q3",
          q: `Roughly how many analysts does one 24/7 in-house monitoring seat require?`,
          options: [
            `About 5 or more, which is why most manufacturers outsource the watch floor`,
            `One, with good automation`,
            `Two, working 12-hour shifts indefinitely`,
            `Ten per plant by NERC CIP rule`
          ],
          answer: 0,
          explain: `Shift coverage, weekends, vacation, and turnover put a single 24/7 seat at ~5+ FTEs — the math behind "outsource eyes, keep brains."`
        },
        {
          id: "ldr-05-q4",
          q: `Which roles should stay in-house even when monitoring is outsourced?`,
          options: [
            `Risk decisions, plant relationships, and incident command`,
            `Overnight alert triage`,
            `Signature updates and sensor maintenance`,
            `None — full outsourcing is best practice`
          ],
          answer: 0,
          explain: `Managed services scale the labor; judgment about YOUR plants, processes, and risk tolerance can't be rented.`
        }
      ]
    },
    {
      id: "ldr-06",
      title: "Policies, Standards, and Governance Documents",
      minutes: 8,
      content: `Governance documents are how a program outlives its founder and survives an audit. They're also where most programs produce either nothing or a binder nobody reads. The skill is writing few documents, ruthlessly practical, with teeth.

### The hierarchy

Get the vocabulary precise, because auditors and interviewers both use it:

- **Policy** — short, stable, management-signed statement of intent and authority. "Remote access to OT systems shall use the managed access platform with MFA; exceptions require OT security approval." A page or two. Changes rarely.
- **Standard** — the mandatory specifics that implement a policy. "Jump host configuration: session recording enabled, 8-hour maximum session, vendor accounts disabled by default and enabled per ticket." Changes occasionally.
- **Procedure** — step-by-step work instructions for a person. "How to grant OEM remote access for a support call." Changes whenever the tooling does.

Policies answer *why and who says so*; standards answer *what exactly*; procedures answer *how, step by step*. 62443-2-1 essentially audits whether this stack exists and is maintained for each security domain.

### The essential first five

If you write only five documents in year one:

1. **OT remote access policy + standard.** The most-abused attack vector gets the first document. Covers vendors, employees, and emergencies.
2. **Removable media and transient device policy.** USB drives and contractor laptops are the classic Level-bypassing pathway (Stuxnet's entry); define scanning kiosks, approved devices, and exceptions.
3. **OT change management standard.** Usually an *amendment* to the plant's existing change control, adding security review triggers: new network connections, firmware changes, new remote access, new software on Level 2-3 systems.
4. **OT incident response plan.** Roles (including who can authorize a line stop), severity definitions, the IT/OT handoff, vendor and legal contacts, and the decision framework from your IR lessons. Exercised annually or it's fiction.
5. **Backup and recovery standard.** What gets backed up (PLC programs, HMI images, historian configs, firewall configs), how often, where copies live (one offline), and the testing cadence.

### Exceptions: the part everyone gets wrong

A governance system without a usable exception process produces shadow IT — or in plants, shadow OT: the undocumented cell network, the modem nobody mentions. The exception process should be easier than going around it: a short form, a named approver (you), a compensating control, and crucially an **expiration date with re-review**. A standing register of active exceptions is also exactly the risk-acceptance evidence auditors and customers ask for. Track it like you track open deviations.

### Making documents real

Three tests separate living governance from shelfware: (1) Can a new engineer find and follow the procedure without asking anyone? (2) Has each document been *exercised or audited* in the last year? (3) When the document and reality diverge, does someone notice and reconcile? Internal audit — even a self-audit on a checklist — closes the loop. Schedule it like preventive maintenance, because that's what it is.`,
      bridge: `FDA-regulated manufacturing gave you a decade inside exactly this discipline: your quality system's document hierarchy (quality manual → SOPs → work instructions) is the same policy → standard → procedure stack, your deviation/CAPA process is the exceptions register, and your validation mindset is the "exercise it or it's fiction" test. In interviews, say this explicitly: "I've operated under 21 CFR 820 document control for years — 62443-2-1's CSMS requirements are a familiar structure with a threat model attached." It instantly converts your regulatory experience into security governance credibility.`,
      quiz: [
        {
          id: "ldr-06-q1",
          q: `In the governance hierarchy, what distinguishes a policy from a standard?`,
          options: [
            `Policy states management intent and authority; the standard specifies the mandatory technical details`,
            `Policies are technical; standards are management-level`,
            `Standards are optional; policies are mandatory`,
            `They are interchangeable terms`
          ],
          answer: 0,
          explain: `Policy = why and who says so (stable, signed); standard = what exactly (specific, mandatory); procedure = how, step by step.`
        },
        {
          id: "ldr-06-q2",
          q: `Why should OT remote access get the FIRST governance document?`,
          options: [
            `It's the most commonly abused OT attack vector`,
            `It's the cheapest to write`,
            `Regulators only audit remote access`,
            `Vendors require it before selling equipment`
          ],
          answer: 0,
          explain: `Vendor and employee remote access consistently tops the real-world initial-access list for OT incidents, so it gets governed first.`
        },
        {
          id: "ldr-06-q3",
          q: `What is the essential feature of a healthy security exception process?`,
          options: [
            `Easier than going around it, with a named approver, compensating control, and an expiration date`,
            `A six-month approval cycle to discourage exceptions`,
            `Anonymous submissions with no tracking`,
            `Automatic permanent approval for production-critical systems`
          ],
          answer: 0,
          explain: `If the exception path is harder than the workaround, you get shadow OT. Time-boxed, tracked exceptions become your risk-acceptance register.`
        },
        {
          id: "ldr-06-q4",
          q: `What makes an incident response plan "real" rather than shelfware?`,
          options: [
            `It is exercised at least annually and reconciled when reality diverges`,
            `It is longer than 100 pages`,
            `It was written by an external consultant`,
            `It is stored in the document management system`
          ],
          answer: 0,
          explain: `An unexercised IR plan is fiction. Annual tabletops surface stale contacts, wrong assumptions, and missing authorities before a real incident does.`
        }
      ]
    },
    {
      id: "ldr-07",
      title: "Regulators, Auditors, Customers — and Your Own Credentials",
      minutes: 9,
      content: `An OT security leader in manufacturing faces oversight from three directions: regulators, customers auditing up their supply chain, and (if you sell into critical sectors) sector-specific regimes. Plus a fourth obligation: credentialing yourself.

### FDA and medical device manufacturing — know the boundary

Precision matters here, and interviewers in your sector will test it. FDA's headline cybersecurity authority — **Section 524B of the FD&C Act** (added by the 2022 omnibus, enforced from 2023) and the 2023/2025 premarket cybersecurity guidance — applies to **cyber devices**: the products themselves (SBOMs, secure development, vulnerability management plans in premarket submissions). That is *product* security, not *plant-floor* security.

Your domain — securing the manufacturing lines — sits instead under the **Quality System Regulation / QMSR** umbrella: if a cyber incident can affect product quality or data integrity (batch records, device history records, 21 CFR Part 11 electronic records), it's a quality problem, and security controls on production systems become part of protecting validated states. There's no FDA rule that says "implement 62443 on your plant floor" — but a ransomware event that corrupts batch records or interrupts a validated process absolutely becomes an FDA conversation. Framing this boundary crisply ("524B governs the products we ship; quality regulations are why plant-floor security matters to FDA") signals real fluency.

### Customer audits — the growing pressure

The fastest-rising compliance driver in manufacturing isn't government — it's customers. Big pharma and medtech OEMs increasingly send security questionnaires and on-site auditors to suppliers, asking for: asset inventories, segmentation evidence, incident response plans, backup testing records, and sometimes 62443 alignment statements. Treat these like customer quality audits: maintain an evidence binder (your governance docs, exception register, exercise reports), and recognize the commercial upside — demonstrable OT security is becoming a sales differentiator, which is a budget argument too.

NERC CIP, while electric-sector-only, is worth knowing as vocabulary (covered in the frameworks module) because auditors and security hires often come from that world, and its structure (asset categorization → controls → evidence) previews where other sectors are heading.

### Your credential roadmap

For an OT security manager/director track, practitioner consensus orders roughly:

- **GICSP (GIAC Global Industrial Cyber Security Professional)** — the flagship OT security credential, typically via SANS ICS410. Validates exactly the IT/OT bridge profile. Expensive; employers usually pay.
- **ISA/IEC 62443 certificate program** — four certificates (Fundamentals via IC32, then Risk Assessment, Design, Maintenance); completing all four earns the ISA/IEC 62443 Cybersecurity Expert designation. Cheaper than SANS, directly maps to the standard this field runs on. IC32 first is a common and sensible move.
- **CISSP** — the general security management credential. Valuable later for director+ roles and CISO-track credibility (it satisfies HR filters), but it's IT-flavored; in pure OT roles it's a complement, not the core.
- Honorable mentions: SANS ICS456 (NERC CIP) if you go energy; Dragos and ISA training short courses for team development.

### The continuous-improvement cadence

Mature programs run an annual cycle: risk assessment refresh → roadmap update → budget ask → exercises and audits → metrics review → repeat. If that sounds like a management review cycle from your quality system, that's exactly the design lineage — 62443-2-1 borrowed it from ISO management-system standards. You already know how to run this loop; now it has a threat model.`,
      bridge: `Your FDA-regulated background is a genuine differentiator, but only if you articulate the 524B-vs-plant-floor boundary precisely — hiring managers in medtech have heard too many candidates conflate product cybersecurity with manufacturing security. You've also LIVED customer quality audits from the supplier side, so the evidence-binder discipline customers now want for security is muscle memory. For credentials: IC32 then GICSP matches both your budget reality and the readiness scores this app tracks — and your years of change control, validation, and management review give you a head start on every governance question in both exams.`,
      quiz: [
        {
          id: "ldr-07-q1",
          q: `What does FDA Section 524B actually govern?`,
          options: [
            `Cybersecurity of cyber devices (the products), via premarket requirements like SBOMs and vulnerability management plans`,
            `Mandatory IEC 62443 implementation on manufacturing plant floors`,
            `NERC CIP compliance for medical manufacturers`,
            `Encryption of all hospital networks`
          ],
          answer: 0,
          explain: `524B is product security in premarket submissions. Plant-floor security matters to FDA through the quality system: incidents affecting product quality, validated states, or Part 11 records.`
        },
        {
          id: "ldr-07-q2",
          q: `Why does plant-floor cybersecurity still matter to FDA even without a dedicated rule?`,
          options: [
            `A cyber incident affecting batch records, data integrity, or validated processes becomes a quality system problem`,
            `FDA requires firewalls in 21 CFR Part 11`,
            `FDA fines companies for every malware infection`,
            `It doesn't — FDA has no interest in manufacturing systems`
          ],
          answer: 0,
          explain: `Quality regulations (QSR/QMSR, Part 11) make integrity of production systems and records an FDA concern, so OT security becomes quality protection.`
        },
        {
          id: "ldr-07-q3",
          q: `Which credential path is the standard recommendation for an OT security leadership track?`,
          options: [
            `ISA IC32 (62443 Fundamentals) and GICSP as the OT core, with CISSP as a later, complementary management credential`,
            `CISSP first, since OT credentials don't exist`,
            `CCNA only — networking covers everything`,
            `No credentials matter in OT security`
          ],
          answer: 0,
          explain: `GICSP and the ISA 62443 certificates validate the IT/OT bridge profile directly; CISSP adds general security-management credibility for director+ roles later.`
        },
        {
          id: "ldr-07-q4",
          q: `What is the fastest-growing compliance pressure on manufacturing OT security?`,
          options: [
            `Customer security questionnaires and supplier audits up the supply chain`,
            `Mandatory federal OT security law for all manufacturers`,
            `Insurance companies refusing all manufacturing clients`,
            `ISO revoking 9001 certificates over cyber findings`
          ],
          answer: 0,
          explain: `Customers — especially large OEMs and pharma — increasingly audit suppliers' OT security like they audit quality, making demonstrable security a commercial requirement and a sales differentiator.`
        }
      ]
    }
  ]
});
