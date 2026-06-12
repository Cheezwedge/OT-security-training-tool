window.OTSEC = window.OTSEC || { modules: [], scenarios: [], flashcards: [], glossary: [] };
window.OTSEC.modules.push({
  id: "secops",
  order: 5,
  title: "OT Security Operations",
  tagline: "Running the day-to-day defense of a plant: visibility, detection, hunting, response, risk, and recovery.",
  description: `This module covers the operational core of an OT security program: building an asset inventory, monitoring deterministic plant traffic, hunting for threats with ATT&CK for ICS, running incident response where safety and uptime constrain your moves, assessing risk the way engineers actually can (consequence-first), and proving you can recover with known-good backups. This is the material a hiring manager will probe hardest for an OT security leadership role.`,
  interviewPrep: [
    {
      question: `Walk me through how you would build OT visibility in a plant that currently has none.`,
      answerOutline: `Start with why: you cannot defend, segment, or even scope risk without an inventory, and most plants discover 20-40 percent more assets than they thought they had. Sequence: (1) passive network monitoring first — SPAN a couple of core OT switches and the IDMZ boundary, deploy a Dragos/Claroty/Nozomi-class sensor, let it watch for 2-4 weeks; (2) layer in safe active queries only for protocols and devices you know tolerate it, validated with engineering during a maintenance window; (3) parse project files and EWS configs to fill gaps passive cannot see (firmware on quiet devices, logic versions). Deliverable: an inventory with make/model/firmware/protocols/comms partners that feeds segmentation design, vuln triage, and detection baselines. Mention you would pilot on one line before scaling — capital project discipline applies.`
    },
    {
      question: `An analyst calls you at 2 a.m.: ransomware is spreading on plant Windows machines and someone wants to shut the line down. What do you do?`,
      answerOutline: `Show you know OT IR is not IT IR. First question is safety and process state: what is the line making, can it be safely paused, what does an abrupt stop do to product and equipment. Get the right people on the bridge — operations leadership, controls engineering, safety, not just the SOC. Decision is shutdown vs isolate vs watch: usually you isolate at zone boundaries (cut the IDMZ conduit, sever IT/OT links) and let the process keep running on local control while you scope. Pull the plug only when safety or critical asset integrity demands it, and let operations execute a controlled stop. Reference a pre-agreed playbook and severity criteria so the 2 a.m. call is executing a plan, not inventing one. Close with recovery: known-good logic and golden images, verified before reconnection.`
    },
    {
      question: `How do you assess cyber risk in an environment where you cannot realistically estimate attack likelihood?`,
      answerOutline: `Concede the premise — likelihood data in OT is thin, and pretending otherwise produces false precision. Pivot to consequence-driven methods: INL's CCE starts by asking which cyber-enabled events would be unacceptable to the business (safety event, week-long line-down, FDA batch integrity loss), then works backward through the systems and access paths that could cause them. Pair that with IEC 62443-3-2: partition into zones and conduits, do an initial risk assessment, set target security levels (SL-T) per zone based on consequence. Engineers are the best consequence estimators in the company — they know what a corrupted recipe or a frozen servo actually does. Use qualitative matrices for breadth, reserve quantitative effort (downtime cost/hour) for the crown jewels that justify it.`
    }
  ],
  lessons: [
    {
      id: "ops-01",
      title: "Asset Inventory and Visibility: Step Zero",
      minutes: 9,
      content: `### Why inventory is step zero

Every OT security framework — IEC 62443, NIST CSF, CISA's Cross-Sector Performance Goals — starts with knowing what you have. The cliche is "you can't protect what you can't see," and concretely it means this: you cannot write a firewall rule for a device you don't know exists, you cannot assess whether CVE-2024-XXXX matters if you don't know which firmware your drives run, and you cannot detect "abnormal" traffic if you never characterized normal. When incident responders show up at a plant, the first hours are usually wasted reconstructing an inventory that should have existed already. Industry experience is consistent: plants that deploy visibility tooling typically find 20-40 percent more connected devices than their documentation claimed — vendor laptops left bridged, forgotten cellular gateways, an HMI someone dual-homed years ago.

### Three ways to build the inventory

**Passive network monitoring.** Mirror traffic from switches (SPAN ports or taps) into a sensor that performs deep packet inspection on industrial protocols. Because EtherNet/IP, Modbus/TCP, PROFINET, S7comm, and the rest carry device identity in their payloads (CIP identity objects literally announce vendor, product code, and firmware revision), a passive sensor can fingerprint devices without sending a single packet. Safe by construction — it cannot disturb a controller. Limitation: it only sees devices that talk through monitored links, and quiet devices (a PLC that only communicates locally, serial-connected gear) stay invisible.

**Active polling.** The sensor sends targeted queries — a CIP List Identity, a Modbus read of device ID registers, SNMP, WMI to Windows boxes. Far more complete and faster than waiting for passive discovery, and it can pull detail passive never sees. The risk is real but manageable: legacy or fragile devices have faulted from unexpected queries (the cautionary tales mostly involve aggressive IT scanners like unconfigured Nmap or Nessus hitting PLCs, not protocol-aware OT queries). Modern practice in 2026: selective, protocol-native active queries, enabled per device class, validated with engineering first.

**Configuration parsing.** Ingest the artifacts you already have — PLC project files, EWS backups, switch configs, historian tag databases. This recovers firmware versions, logic versions, and rack layouts for devices that rarely talk. It is also the only method that captures *intended* state, which you can later diff against observed state.

Mature programs use all three. Passive for continuous coverage, active for depth, parsing for ground truth.

### Attributes that matter

A useful OT inventory record is more than IP and MAC. You want: make/model and hardware series, firmware version (drives vuln matching), serial number, installed protocols and open services, the device's communication baseline — who it talks to, on which protocols, how often — physical location and zone assignment, criticality, and owner. The communications baseline is the sleeper attribute: it is what turns an inventory into a detection foundation, because "new conversation that has never happened before" is one of the highest-value alerts in OT.

### The platform category

This problem created a product category: OT visibility and detection platforms. Dragos, Claroty, Nozomi Networks, and Armis are the names you will see on every shortlist (Microsoft Defender for IoT and Tenable OT Security compete too). They combine passive DPI sensors, optional safe active queries, config ingestion, vulnerability matching, and threat detection in one platform. As a leader, know that the sensor deployment (SPAN access, switch capability, site count) usually costs more effort than the software — budget for the plumbing.`,
      bridge: `You have been on the other side of this for 11 years: you know exactly which EtherNet/IP devices announce identity over CIP because you have browsed them from RSLinx, and your fleet software-version traceability program is literally configuration parsing — you already track logic and firmware versions per machine. The new move is fusing that engineering data with network-observed reality and treating the diff as a security signal. When a vendor demos passive discovery, you are qualified to ask the question most buyers cannot: how do you fingerprint the serial-connected and analog-side gear my Ethernet sensors will never see?`,
      quiz: [
        {
          id: "ops-01-q1",
          q: `Why is asset inventory considered "step zero" of an OT security program rather than just one task among many?`,
          options: [
            `Because regulators fine companies for incomplete inventories before anything else`,
            `Because segmentation, vulnerability triage, and detection baselines all depend on knowing what exists and how it communicates`,
            `Because inventory tools are the cheapest security investment available`,
            `Because insurance policies require a full inventory before coverage begins`
          ],
          answer: 1,
          explain: `Nearly every downstream activity — firewall rules, vuln matching against firmware, anomaly baselines — requires the inventory as input. Without it, those activities run on guesses.`
        },
        {
          id: "ops-01-q2",
          q: `What is the main limitation of purely passive asset discovery?`,
          options: [
            `It can crash fragile legacy controllers`,
            `It cannot identify industrial protocols, only IT protocols`,
            `It only sees devices whose traffic crosses monitored links, missing quiet or serially connected devices`,
            `It requires installing agents on every endpoint`
          ],
          answer: 2,
          explain: `Passive monitoring is safe by construction but blind to devices that do not talk through a SPANned link — locally communicating PLCs, serial gear, and rarely chatty devices stay invisible.`
        },
        {
          id: "ops-01-q3",
          q: `Which discovery method is the only one that captures the INTENDED state of devices (e.g., what logic version should be running)?`,
          options: [
            `Configuration parsing of project files, EWS backups, and switch configs`,
            `Passive deep packet inspection`,
            `Active CIP and Modbus identity queries`,
            `NetFlow analysis at the IDMZ firewall`
          ],
          answer: 0,
          explain: `Passive and active methods observe what is on the wire now; parsing project files and backups captures what engineering intended, letting you diff intended vs observed state.`
        },
        {
          id: "ops-01-q4",
          q: `Why is a device's communications baseline (who it talks to, on what protocol, how often) such a high-value inventory attribute?`,
          options: [
            `It determines the device's purchase price and depreciation schedule`,
            `It is required by IEC 62443 for every certified component`,
            `It lets you bill network costs back to each production line`,
            `It turns the inventory into a detection foundation — a never-before-seen conversation is one of the strongest anomaly signals in OT`
          ],
          answer: 3,
          explain: `OT traffic is highly repetitive, so a brand-new communication pair or protocol is a strong, low-noise alert — but only if you recorded the baseline first.`
        }
      ]
    },
    {
      id: "ops-02",
      title: "OT Network Monitoring and Detection",
      minutes: 9,
      content: `### Your unfair advantage: deterministic traffic

On a corporate IT network, users browse, install apps, and travel; "normal" is a moving target and anomaly detection drowns in noise. A plant network is the opposite. PLCs poll I/O on fixed scan intervals, HMIs request the same tag lists every few hundred milliseconds, the historian subscribes to the same points around the clock. The same devices have the same conversations at the same cadence, often for years. That determinism means baselining actually works in OT: once a sensor has watched a line for a few weeks, it can build a model of every conversation pair, protocol, and even which function codes and tag writes are normal — and deviations are rare enough to be worth a human's attention.

### Four detection types

The Dragos/Claroty/Nozomi-class platforms generally combine four detection approaches, and you should know the vocabulary:

- **Anomaly / modeling detection.** Learn the baseline, alert on deviation: new device, new conversation pair, a Modbus master issuing a function code it never used, an EtherNet/IP write to a controller that only ever saw reads. High sensitivity, but quality depends entirely on baseline hygiene — baselining during a commissioning window poisons the model.
- **Threat behavior analytics.** Codified adversary tradecraft: detections written for known ICS attack behaviors (the way PIPEDREAM/INCONTROLLER abuses CODESYS and OPC UA, how an attacker enumerates CIP devices). These fire on behavior, not specific malware hashes, so they survive tooling changes. Dragos in particular markets this as its core approach.
- **Configuration change detection.** Alerts on controller mode changes (RUN to PROGRAM), logic downloads, firmware updates, new user accounts on an HMI. In OT, a config change outside an approved window is either an unauthorized contractor or an attacker — both are worth a phone call.
- **Indicators (IOCs).** Hashes, IPs, domains from threat intel. Cheap to match, fastest to go stale. Useful as one layer, never the strategy.

### Getting the packets: SPAN ports and taps

Detection requires traffic, and getting it is an engineering project. A **SPAN (mirror) port** is a switch feature that copies traffic to a monitoring port — free if your switches support it, but SPAN can drop packets under load, and many legacy or unmanaged plant-floor switches cannot do it at all. A **network tap** is a passive inline device that copies traffic with full fidelity — more reliable, but installing one means briefly breaking the link, which in OT means a scheduled outage and a change record. Plan tap installs into maintenance windows like any other modification. Where neither works, some sensors accept NetFlow or run as embedded software on capable switches (Cisco IE-series can run sensor software directly).

### Where the sensors go

You will not afford packet capture everywhere, so place sensors where conversations concentrate:

1. **The IDMZ / IT-OT boundary** — first sensor, non-negotiable. Everything entering or leaving the OT environment crosses here, including remote access and the most likely intrusion path.
2. **Level 3 / site operations core** — where EWS, historians, domain controllers, and AV/patch servers talk to everything. Most lateral movement transits this layer.
3. **Level 2 cell/area zones for crown-jewel lines** — the only place you see HMI-to-PLC and controller-to-controller traffic. Prioritize the lines whose downtime hurts most.

A common 2026 deployment pattern: full DPI sensors at the IDMZ and L3, lighter or sampled coverage at L2, expanding as budget allows. Expect the alert volume to be low by IT SOC standards — tens per day, not thousands — which is exactly why an OT analyst can actually investigate each one.`,
      bridge: `You already know plant traffic is deterministic because you engineered it that way — you set the RPI on every EtherNet/IP connection and sized switch loads for the I/O traffic you designed. That instinct transfers directly: when a detection vendor claims they baseline "normal," you can ask whether they model down to CIP service codes and connection RPIs or just IP pairs. And the SPAN/tap plumbing is panel-and-network design work you have done for years — you know which of your IE switches can mirror, and you know a tap install is a line-stop conversation with operations, not an IT ticket.`,
      quiz: [
        {
          id: "ops-02-q1",
          q: `Why does anomaly-based detection work better on OT networks than on typical IT networks?`,
          options: [
            `OT traffic is deterministic and repetitive, so a learned baseline stays valid and deviations are rare and meaningful`,
            `OT networks are smaller, so there is less traffic to analyze`,
            `OT protocols are encrypted, which makes anomalies easier to spot`,
            `IT networks lack switches capable of port mirroring`
          ],
          answer: 0,
          explain: `PLCs, HMIs, and historians repeat the same conversations on fixed cadences for years, so deviations from baseline are rare, high-signal events — unlike IT, where normal constantly shifts.`
        },
        {
          id: "ops-02-q2",
          q: `A detection fires because a controller transitioned from RUN to PROGRAM mode outside any approved maintenance window. Which detection type is this?`,
          options: [
            `Indicator (IOC) matching`,
            `Threat behavior analytics`,
            `Configuration change detection`,
            `Protocol fuzzing detection`
          ],
          answer: 2,
          explain: `Mode changes, logic downloads, and firmware updates are configuration events; flagging them outside change windows catches both attackers and unauthorized contractors.`
        },
        {
          id: "ops-02-q3",
          q: `What is the main operational difference between using a SPAN port and installing a network tap in OT?`,
          options: [
            `Taps only work on wireless networks`,
            `A SPAN port uses existing switch capability with no downtime, while a tap install briefly breaks the link and needs a scheduled maintenance window`,
            `SPAN ports provide higher fidelity than taps under heavy load`,
            `Taps require software agents on the monitored PLCs`
          ],
          answer: 1,
          explain: `SPAN is a switch feature (though it can drop packets under load); a tap is physically inline, so installing one is a change-controlled, scheduled-outage activity in OT.`
        },
        {
          id: "ops-02-q4",
          q: `With budget for only one sensor, where should it go first?`,
          options: [
            `On the safety instrumented system network, since safety matters most`,
            `On the oldest production line, since legacy gear is most vulnerable`,
            `Inside the corporate IT data center to watch for ransomware`,
            `At the IDMZ / IT-OT boundary, where all traffic entering or leaving OT — including the most likely intrusion path — is visible`
          ],
          answer: 3,
          explain: `The IT-OT boundary concentrates remote access, file transfer, and the most common intrusion paths; it gives the most detection coverage per sensor dollar.`
        }
      ]
    },
    {
      id: "ops-03",
      title: "Threat Hunting Basics for OT",
      minutes: 8,
      content: `### Hunting vs monitoring

Monitoring waits for a detection to fire. Hunting assumes your detections have gaps and goes looking. The formal definition: hypothesis-driven, proactive search for adversary activity that existing alerts missed. The key word is *hypothesis* — good hunts start with a falsifiable statement like "if an adversary had stolen VPN credentials, we would see remote logins to the EWS outside change windows," not with aimlessly scrolling logs.

### A hunting loop you can actually run

SANS teaches a hunting cycle and Splunk's PEAK framework (Prepare, Execute, Act with Knowledge) formalizes it; simplified for a small OT team it collapses to four steps:

1. **Hypothesize.** Pick a specific adversary behavior, grounded in threat intel or in your own architecture's weak points. ATT&CK for ICS is your map here.
2. **Gather and look.** Pull the data that would prove or disprove it — sensor baselines, firewall logs, Windows event logs from EWS/HMIs, remote access session records.
3. **Decide.** Found something: pivot to incident response. Found nothing: document that you looked, what data you used, and what your blind spots were.
4. **Improve.** Every hunt should end with an artifact — a new detection rule, a logging gap to fix, a baseline correction. A hunt that produces nothing reusable was a tourist trip.

### ATT&CK for ICS as the map

MITRE ATT&CK for ICS catalogs adversary tactics and techniques specific to control systems — things like Modify Controller Tasking (T0821), Remote System Discovery, and Adversary-in-the-Middle on industrial protocols, drawn from real incidents (Stuxnet, Industroyer/CRASHOVERRIDE, TRISIS, PIPEDREAM). For hunting, use it two ways: pick a technique and ask "could I see this if it happened here?" (a coverage hunt), or take a threat group known to target manufacturing and walk their documented techniques against your environment (an intel-driven hunt). It also gives your team shared vocabulary — "we have no coverage for T0843, Program Download" is a precise statement a budget owner can act on.

### Low-hanging hunts for a new OT program

You do not need a mature SOC to start. These four hunts are high-yield, cheap, and runnable with a visibility platform plus Windows logs:

- **New device appeared.** Diff this week's asset inventory against last week's. Every unexplained addition is either an inventory process failure or an intrusion — both findings are wins.
- **PLC mode changes and logic downloads.** Pull every RUN/PROGRAM transition and program download event from the last 90 days and reconcile against change records. In a well-run plant the list should reconcile perfectly; where it does not, you have either a change-management hole or a problem.
- **EWS talking to the internet.** Engineering workstations hold project files and write-capable software; they have no business reaching the internet directly. Query firewall and DNS logs for any EWS-sourced external connections. Vendor update services and license servers will generate findings — decide deliberately which are sanctioned, then alert on the rest.
- **Remote access outside change windows.** Correlate VPN/jump-host sessions against the maintenance calendar. A vendor account logging in at 0300 Sunday with no ticket is exactly how several real intrusions were eventually found.

Run one hunt a month at first. Cadence and documentation beat heroics: a one-page write-up per hunt (hypothesis, data, findings, gaps, follow-ups) compounds into real institutional knowledge — and it is the evidence trail that shows auditors and leadership the program is alive.`,
      bridge: `Hunting is troubleshooting in reverse, and you have done elite-level plant troubleshooting for a decade: form a hypothesis about the fault, find the data that isolates it, fix the systemic cause. The "reconcile PLC downloads against change records" hunt should feel familiar — it is your FDA-grade software version traceability discipline pointed at security. You already know which engineers downloaded what and when, because your config management system records it. Most plants cannot do that hunt at all; you could run it this quarter with tools you already own.`,
      quiz: [
        {
          id: "ops-03-q1",
          q: `What distinguishes threat hunting from ordinary security monitoring?`,
          options: [
            `Hunting uses AI while monitoring uses human analysts`,
            `Hunting is proactive and hypothesis-driven, searching for activity that existing detections missed; monitoring waits for alerts to fire`,
            `Hunting is performed only by external consultants`,
            `Monitoring covers OT while hunting covers only IT systems`
          ],
          answer: 1,
          explain: `Hunting starts from a falsifiable hypothesis about adversary behavior and goes looking; monitoring is reactive to alerts. Hunts exist precisely because detection coverage has gaps.`
        },
        {
          id: "ops-03-q2",
          q: `What role does MITRE ATT&CK for ICS play in OT threat hunting?`,
          options: [
            `It is a compliance standard plants must certify against annually`,
            `It is a vulnerability scanner tuned for industrial protocols`,
            `It provides a catalog of real-world ICS adversary techniques to hypothesize against and to measure detection coverage with`,
            `It automatically blocks known adversary IP addresses`
          ],
          answer: 2,
          explain: `ATT&CK for ICS is a knowledge base of techniques drawn from real incidents; hunters use it to pick hypotheses and to state coverage gaps precisely (e.g., no visibility into Program Download).`
        },
        {
          id: "ops-03-q3",
          q: `Why is "engineering workstation communicating with the internet" considered a high-yield, low-effort hunt?`,
          options: [
            `EWS hold project files and write-capable software and have no legitimate need for direct internet access, so any hit is either a policy gap or a serious finding`,
            `Engineering workstations generate the most network traffic in a plant`,
            `Internet traffic from an EWS always indicates active malware`,
            `Firewalls cannot block EWS traffic, so hunting is the only control`
          ],
          answer: 0,
          explain: `The query is cheap (firewall/DNS logs) and almost every result matters — sanctioned vendor update channels get documented, everything else gets investigated. Not every hit is malware, but every hit is actionable.`
        },
        {
          id: "ops-03-q4",
          q: `A hunt finds no adversary activity. According to good hunting practice, what should it still produce?`,
          options: [
            `Nothing — a clean hunt requires no documentation`,
            `A mandatory report to CISA`,
            `An immediate re-run of the same hunt with broader scope`,
            `A documented record of the hypothesis, data examined, blind spots found, and improvements such as new detections or logging fixes`
          ],
          answer: 3,
          explain: `Every hunt should end with reusable artifacts — coverage knowledge, detection rules, logging gaps to close. A hunt that leaves nothing behind wasted the effort even if the absence of findings is good news.`
        }
      ]
    },
    {
      id: "ops-04",
      title: "Incident Response in OT vs IT",
      minutes: 10,
      content: `### Why you don't just pull the plug

IT incident response has a reflex: isolate the host, image it, wipe it. In OT that reflex can hurt people. A controller mid-process may be holding a servo against gravity, sequencing an oven, or maintaining sterile-barrier conditions on a medical device line. Yank its network or power and you may create the exact safety or product-integrity event you were trying to prevent — plus scrapped WIP, damaged tooling, and in FDA-regulated production, a batch-record investigation. The first axiom of OT IR: **the process owns the tempo.** Containment options get evaluated against process state, and operations — not the SOC — executes any stop.

### PICERL, adapted to OT

The SANS incident response lifecycle — Preparation, Identification, Containment, Eradication, Recovery, Lessons learned — still applies; each phase just changes meaning:

- **Preparation** is most of the game. Pre-built network diagrams, asset inventory, out-of-band contact lists, spare hardware, *tested* known-good backups of PLC logic and HMI images, and pre-agreed severity criteria with decision authority spelled out: who can order a line stop at 2 a.m.
- **Identification** leans on your OT monitoring, but also on operators — "the HMI is acting weird" has opened more OT incidents than any SIEM. Treat operator reports as sensor data.
- **Containment** is a graded decision, not a binary: **watch** (monitor an attacker who is present but not acting against the process — buys intel and planning time), **isolate** (sever zone conduits, cut the IDMZ links, let the process run on local control — the most common right answer, and exactly what good segmentation was built to enable), or **shutdown** (controlled stop by operations, reserved for active threats to safety or critical equipment). Norsk Hydro's 2019 response is the classic case: they disconnected plants and ran what they could manually rather than pay ransom.
- **Eradication and Recovery** in OT means restoring *known-good logic and configurations* — not just rebuilding Windows boxes. Verify the running PLC program against your golden copy before you trust the process again. Recovery order matters: bring up infrastructure, then servers, then controllers and HMIs, validating at each step.
- **Lessons learned** feeds segmentation, detection, and the playbooks.

### Who's in the room

An OT incident bridge that contains only security people will make dangerous decisions. Minimum roster: **operations leadership** (process state, what a stop costs and how to do one safely), **controls/automation engineering** (what the PLCs are actually doing; how to verify logic), **safety** (any scenario touching protective functions), the **OT security lead** running the technical response, **IT security** (the intrusion usually came through IT), plus comms/legal as severity rises. ICS4ICS — an ISA Global Security Alliance program — adapts FEMA's Incident Command System to ICS incidents, giving you defined roles (incident commander, operations section, planning section) and a shared command vocabulary; it is worth adopting even partially, because role clarity is what collapses at 2 a.m. For playbooks, don't start from a blank page: the open-source Incident Response playbooks published on GitHub (the Counteractive/"collective" style templates) and CISA's ICS-specific advisories give you skeletons to adapt per scenario — ransomware in the IDMZ, compromised EWS, suspicious logic change.

### Evidence capture without making it worse

Forensics on a 20-year-old controller is not laptop forensics. Practical evidence in OT: upload the *running* program from the PLC and diff it against the engineering master (your config management system is the comparison baseline); export HMI/EWS Windows event logs and historian data around the timeline; preserve sensor PCAPs; photograph physical state — key switch positions, indicator LEDs, anything a power cycle would destroy. Capture volatile data before any restart, and have engineering, not the forensic contractor, touch the controllers.`,
      bridge: `You have effectively run OT incident response for years — every line-down event where you triaged, decided stop-vs-run with operations, and restored a known-good program is the same muscle. Your habit of uploading the running program and diffing it against the master copy in version control is, almost verbatim, the PLC evidence-capture procedure. The Navy gave you the other half: watchstanding, casualty procedures, and clear command roles under stress are exactly what ICS4ICS is trying to install in civilian plants. Your job as a leader is to write down what you already do instinctively, assign the roles, and drill it before the real one.`,
      quiz: [
        {
          id: "ops-04-q1",
          q: `Why is immediately disconnecting or powering off an affected controller often the wrong first move in an OT incident?`,
          options: [
            `Because controllers automatically destroy forensic evidence when disconnected`,
            `Because it voids the manufacturer's warranty`,
            `Because OT insurance policies prohibit unplanned shutdowns`,
            `Because an abrupt stop of a running process can itself cause safety events, equipment damage, scrapped product, and regulatory consequences`
          ],
          answer: 3,
          explain: `A controller mid-process may be maintaining physically critical states; in OT, containment must be evaluated against process state, and any stop is a controlled stop executed by operations.`
        },
        {
          id: "ops-04-q2",
          q: `During an active intrusion, the team chooses to sever the IDMZ conduits and let production continue on local control while they investigate. Which containment posture is this?`,
          options: [
            `Watch`,
            `Isolate`,
            `Shutdown`,
            `Eradication`
          ],
          answer: 1,
          explain: `Isolation cuts the attacker's path at zone boundaries while the deterministic local process keeps running — the most common right answer, and the payoff of good segmentation.`
        },
        {
          id: "ops-04-q3",
          q: `Beyond the SOC, who must be on the bridge for an OT incident affecting a production line?`,
          options: [
            `Operations leadership, controls engineering, and safety — the people who know process state and can execute or veto a stop`,
            `Only the CISO and external legal counsel`,
            `The PLC vendor's sales representative`,
            `The full board of directors`
          ],
          answer: 0,
          explain: `OT incident decisions are process decisions. Operations knows what a stop costs and how to do it safely, engineering knows what the controllers are doing, and safety owns scenarios touching protective functions.`
        },
        {
          id: "ops-04-q4",
          q: `What does "recovery" specifically require in OT that a standard IT rebuild process misses?`,
          options: [
            `Re-imaging all Windows machines from the most recent backup`,
            `Resetting all user passwords across the domain`,
            `Restoring and verifying known-good PLC logic and device configurations against engineering masters before trusting the process`,
            `Purchasing replacement controllers from the vendor`
          ],
          answer: 2,
          explain: `An attacker who touched controllers may have altered logic; recovery means restoring golden copies and diffing the running program against the configuration-managed master, not just rebuilding servers.`
        }
      ]
    },
    {
      id: "ops-05",
      title: "Risk Assessment Methodology: Consequence First",
      minutes: 9,
      content: `### The likelihood problem

Classic risk math is likelihood times consequence. In OT, the likelihood term is nearly unknowable: targeted ICS attacks are rare, sparsely reported, and adversary intent shifts faster than any model. Teams that force likelihood estimates produce confident-looking heat maps built on guesses. The mature move — and the reason engineering-led risk programs outperform — is to shift weight onto the term you *can* know. **Consequence is an engineering question**, and engineers answer it well: what happens, physically and commercially, if this controller runs hostile logic? You can compute scrap, downtime cost per hour, equipment damage, safety exposure, and (in regulated production) batch-integrity impact with real numbers.

### CCE: Consequence-driven, Cyber-informed Engineering

Idaho National Laboratory's CCE methodology is the cleanest articulation of consequence-first thinking. Four phases:

1. **Consequence prioritization.** Ask leadership and engineering: which cyber-enabled events would be *unacceptable* — not bad, unacceptable? A safety event. Three weeks of line-down on the constraint line. Shipping product with compromised device records. You typically end with a short list of high-consequence events (HCEs).
2. **System-of-systems analysis.** Map everything that touches each HCE — controllers, networks, vendors, support contracts, the people and procedures. This is where hidden dependencies surface (the "air-gapped" line whose vendor modem nobody mentioned).
3. **Consequence-based targeting.** Think like the adversary's engineer: what would *they* need to access and manipulate to cause the HCE? This produces concrete kill paths, not abstract threat statements.
4. **Mitigations and protections.** Break the kill paths — ideally with engineering controls that remove the consequence entirely (a mechanical interlock, a hardwired limit an attacker cannot reach via network), then with detection and segmentation. CCE's bias toward engineering-out the consequence, rather than only guarding the path, is its signature idea.

### IEC 62443-3-2: zones, conduits, SL-T

Where CCE gives philosophy, 62443-3-2 gives procedure. The flow: define the system under consideration; perform an initial (high-level) risk assessment; **partition the system into zones** (groups of assets with common security requirements) **and conduits** (the communication paths between zones); then do a detailed risk assessment per zone, and select a **target security level (SL-T)** from SL 1 to SL 4 for each zone — SL 1 protecting against casual misuse, up to SL 4 against well-resourced, ICS-skilled adversaries. The SL-T then drives requirements: what 62443-3-3 controls the zone needs, what 62443-4-2 capability you demand from components in it. The output is the design basis for your segmentation architecture, which is why 62443-3-2 risk assessment usually precedes any firewall purchase.

### Qualitative vs quantitative, and crown jewels

Qualitative matrices (5x5, high/medium/low) are fast, communicable, and fine for breadth-first triage across dozens of zones; their weakness is false precision and score-gaming. Quantitative methods (annualized loss expectancy, FAIR-style analysis) cost real effort but speak fluent CFO — and OT is actually *favorable* terrain for them, because downtime cost per hour and scrap cost are known numbers, unlike breach costs in IT. Practical pattern: qualitative across the estate, quantitative for the crown jewels. **Crown jewel analysis** is the prioritization step that makes everything tractable: identify the handful of assets whose compromise produces the HCEs — typically the constraint-line controllers, safety systems, the historian feeding batch records, the EWS that can reprogram everything — and aim your deepest assessment, monitoring, and recovery investment there first. A risk program that treats 400 assets equally protects none of them well.`,
      bridge: `Consequence-first risk is FMEA wearing a security badge, and you have led FMEAs and process risk assessments under FDA design control for years — severity scoring, single-point-of-failure hunting, mitigation by engineering control before procedure. CCE's "engineer out the consequence" bias is the same instinct that made you hardwire a safety interlock instead of trusting code. Your edge in the room: when the team debates what hostile logic in a specific controller could do, you can answer from direct knowledge of the servo loads, the vision rejects, and the batch records — which makes you the most credible consequence estimator your future employer has.`,
      quiz: [
        {
          id: "ops-05-q1",
          q: `Why do consequence-driven approaches dominate serious OT risk assessment?`,
          options: [
            `Because consequence calculations are required by OSHA`,
            `Because attack likelihood in OT is nearly unknowable while consequence is an engineering question that can be answered with real numbers`,
            `Because OT attacks always have identical likelihood`,
            `Because insurance companies refuse to model OT likelihood`
          ],
          answer: 1,
          explain: `Targeted ICS attack frequency data is too sparse to estimate honestly, but engineers can compute downtime cost, scrap, equipment damage, and safety exposure with confidence — so mature methods weight the knowable term.`
        },
        {
          id: "ops-05-q2",
          q: `In INL's CCE methodology, what is the purpose of the consequence prioritization phase?`,
          options: [
            `To rank vulnerabilities by CVSS score across all plant assets`,
            `To estimate the annual probability of each threat group attacking`,
            `To identify the short list of cyber-enabled events the organization considers truly unacceptable, which then scope the rest of the analysis`,
            `To select which firewall vendor to purchase`
          ],
          answer: 2,
          explain: `CCE starts by defining high-consequence events — the outcomes the business cannot accept — and works backward from them through systems analysis, targeting, and mitigation.`
        },
        {
          id: "ops-05-q3",
          q: `In IEC 62443-3-2, what is the relationship between zones and target security levels (SL-T)?`,
          options: [
            `Every zone in a plant must be assigned SL 4`,
            `SL-T applies only to conduits, never to zones`,
            `SL-T is determined solely by the age of the equipment in the zone`,
            `Each zone receives its own SL-T (1 through 4) based on the risk assessment, which then drives the security requirements for that zone and its components`
          ],
          answer: 3,
          explain: `62443-3-2 partitions the system into zones and conduits, assesses risk per zone, and assigns each zone a target security level that determines required countermeasures — different zones legitimately get different SL-Ts.`
        },
        {
          id: "ops-05-q4",
          q: `What is the practical role of crown jewel analysis in an OT risk program?`,
          options: [
            `It concentrates the deepest assessment, monitoring, and recovery investment on the few assets whose compromise causes the worst outcomes`,
            `It identifies which assets can be left completely unprotected`,
            `It calculates the resale value of plant equipment`,
            `It replaces the need for zone-and-conduit segmentation`
          ],
          answer: 0,
          explain: `Treating hundreds of assets equally protects none of them well; crown jewel analysis prioritizes the constraint-line controllers, safety systems, and EWS that map to high-consequence events.`
        }
      ]
    },
    {
      id: "ops-06",
      title: "Backup, Recovery, and Resilience",
      minutes: 9,
      content: `### Resilience is the honest goal

After Colonial Pipeline and a decade of manufacturing ransomware, the mature position is: assume some incident eventually succeeds, and engineer the organization to take the hit and recover fast. For an OT security leader, recovery capability is also your most defensible budget line — "we can restore the plant in 8 hours" is a claim executives understand and auditors can verify.

### Known-good PLC and config backups

The crown jewels of OT recovery are not server images — they are the **controller programs and device configurations**: PLC projects, HMI applications, robot programs and mastering data, vision job files, drive parameter sets, safety controller logic, managed switch configs. "Known-good" carries two requirements: the copy matches what *should* be running (reviewed, version-controlled, tied to a change record), and it is *protected* — at least one copy offline or otherwise unreachable from the network an attacker would own, because ransomware crews deliberately destroy reachable backups first. The widely used pattern is 3-2-1: three copies, two media, one offline/offsite. Automated tools in this space (octoplant, Copia, AssetCentre-class systems) add the killer feature: scheduled uploads from running controllers diffed against the master, so unauthorized logic changes surface as alerts — your backup system doubles as a detection control.

### Golden images for HMIs and EWS

Windows-based HMIs, engineering workstations, and historians die in every plant ransomware event — they are ordinary Windows underneath. Maintain **golden images**: hardened, patched-to-baseline, application-installed images per machine role, refreshed on a schedule and stored offline. The difference between golden images and "we have the install media somewhere" is measured in days of downtime: rebuilding an EWS from scratch — OS, vendor software stacks with license activations, project files — routinely takes days per machine when done from memory.

### Untested backups are hypotheses

The most common recovery failure is discovering at the worst moment that backups are corrupt, stale, missing license dependencies, or won't load on the spare hardware. Test restores on a schedule: load the PLC project onto a bench controller or the engineering simulator; boot the golden image on representative spare hardware; restore a switch config to a spare switch. Track restore tests like preventive maintenance — because that is exactly what they are.

### RTO, RPO, and manual fallback

Two terms you need conversationally: **RTO (Recovery Time Objective)** — how fast a system must be restored; **RPO (Recovery Point Objective)** — how much data loss is acceptable, i.e., how old the last backup may be. For PLC logic, RPO is naturally tied to your change cadence: if logic changes monthly and you back up on every change, your effective RPO is zero. For historians and batch records, RPO is a real engineering decision with regulatory weight. Set RTO per zone with operations, then *engineer to it* — RTO targets drive how many spare controllers you stock, whether golden images live on-site, and how big the recovery team must be.

**Manual operations fallback** is the resilience layer beneath all of it: can the plant run, or at least shut down safely and restart, with degraded automation? Norsk Hydro famously kept aluminum lines alive in 2019 partly on manual procedures and veteran operators. Honest answers vary — some processes simply cannot run manually — but the analysis itself (what can we do by hand, for how long, with which people) belongs in every resilience plan, and the answer is decaying as veteran operators retire.

### Tabletop exercises

A **tabletop** is a discussion-based rehearsal: gather operations, engineering, safety, IT, and leadership; walk a realistic scenario ("ransomware detonated in the IDMZ at 0200, line 3 HMIs are encrypting") in time-phased injects; force real decisions — isolate or shutdown? who authorizes? where are the backups and who can load them? Run at least one OT-specific tabletop a year. CISA offers free CTEP scenario packages to start from. The deliverable is the gap list: every tabletop surfaces missing contacts, untested assumptions, and authority ambiguities far cheaper than a real incident would.`,
      bridge: `This lesson is your home turf weaponized. The fleet software version traceability program you built — every controller program versioned, tied to a change record, restorable on demand — is precisely the "known-good backup" capability most plants lack, and under FDA design control you also learned why the validated master matters more than the latest copy. Your additions for security: get copies truly offline where ransomware cannot reach them, schedule restore tests like PMs, and turn your upload-and-diff discipline into a formal unauthorized-change detection control. When you interview, tell the config-management story in RTO/RPO vocabulary — it lands as instant credibility.`,
      quiz: [
        {
          id: "ops-06-q1",
          q: `What makes a PLC program backup "known-good" rather than merely "recent"?`,
          options: [
            `It was taken within the last 24 hours`,
            `It is stored in at least three cloud regions`,
            `It matches the reviewed, version-controlled program tied to a change record, and a copy is protected offline from network-borne attackers`,
            `It was exported by the PLC vendor rather than plant staff`
          ],
          answer: 2,
          explain: `Known-good means verified-correct (the validated, change-controlled master) and protected — ransomware crews destroy reachable backups, so at least one copy must be offline or otherwise unreachable.`
        },
        {
          id: "ops-06-q2",
          q: `How can an automated PLC backup system double as a security detection control?`,
          options: [
            `By encrypting controller traffic in transit`,
            `By scheduling uploads from running controllers and diffing them against the master copy, so unauthorized logic changes surface as alerts`,
            `By blocking program downloads from unauthorized laptops`,
            `By forcing controllers into RUN mode after each backup`
          ],
          answer: 1,
          explain: `Upload-and-diff against the configuration-managed master detects logic that changed outside change control — whether the cause is an attacker or an undocumented edit.`
        },
        {
          id: "ops-06-q3",
          q: `A plant agrees that line 2 must be producing again within 8 hours of a cyber event, and that losing up to one week of historian data is tolerable. Which terms describe these two decisions?`,
          options: [
            `SL-T of 8 and SL-A of 7`,
            `MTBF of 8 hours and MTTR of one week`,
            `A vulnerability window and a patch cadence`,
            `An RTO of 8 hours and an RPO of one week`
          ],
          answer: 3,
          explain: `RTO is the required restoration time; RPO is the acceptable data loss measured backward from the event. Both are set with operations and then drive spares, image storage, and staffing decisions.`
        },
        {
          id: "ops-06-q4",
          q: `What is the primary deliverable of a well-run tabletop exercise?`,
          options: [
            `A documented gap list — missing contacts, untested assumptions, unclear authorities — found at discussion cost instead of incident cost`,
            `A pass/fail certification for the incident response team`,
            `Proof to insurers that no incident can occur`,
            `A finished set of golden images for all HMIs`
          ],
          answer: 0,
          explain: `Tabletops are discussion-based rehearsals; their value is surfacing the plan's holes — who can authorize a stop, where backups actually are — while it is still cheap to fix them.`
        }
      ]
    }
  ]
});
