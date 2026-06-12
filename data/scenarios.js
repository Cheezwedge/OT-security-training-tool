window.OTSEC = window.OTSEC || { modules: [], scenarios: [], flashcards: [], glossary: [] };

window.OTSEC.scenarios.push({
  id: "ransomware-historian",
  title: "Ransomware on the Plant Historian",
  category: "technical",
  module: "secops",
  context: `Tuesday, 06:40. The night-shift supervisor calls: the plant historian (Level 3, Windows Server) is showing a ransom note, and the MES quality dashboards that pull from it are blank. Production lines are still running normally — PLCs and HMIs at Levels 1-2 are unaffected so far. The historian has connections to the IDMZ (replicating to the enterprise copy) and to several Level 2 HMI/SCADA nodes it polls. Your OT monitoring platform shows the historian made unusual SMB connections to two engineering workstations overnight. The IT SOC has just confirmed the same ransomware family hit three IT file servers around 02:00. You are the OT security manager and the incident commander for the OT side.`,
  steps: [
    {
      prompt: `Your first move for the historian itself?`,
      choices: [
        {
          text: `Isolate it at the network level (disable switch ports / firewall deny) but leave it powered on`,
          quality: "best",
          feedback: `Right call. Network isolation stops lateral movement and command-and-control while preserving volatile evidence (memory, running processes) for forensics — and the lines keep running, since L1/L2 control doesn't depend on the historian in real time. This is the OT IR principle: contain without destroying evidence or process. Pulling power destroys memory-resident artifacts and can corrupt the database beyond what the ransomware already did.`
        },
        {
          text: `Power it off immediately to stop the encryption`,
          quality: "ok",
          feedback: `Defensible instinct — it may stop encryption mid-run — but you destroy volatile memory (process list, injected code, possible decryption keys) that forensics needs, and an abrupt power cut can corrupt the historian database further. Network isolation achieves the same containment while preserving evidence. In OT IR, "pull the plug" is rarely the first move for exactly this reason.`
        },
        {
          text: `Leave it connected and watch what it does so you can learn the attacker's behavior`,
          quality: "poor",
          feedback: `Too risky here. Monitoring an active adversary has its place in mature threat operations, but this box has live paths to Level 2 HMI/SCADA nodes and already made suspicious SMB connections to engineering workstations. Every minute connected is lateral-movement opportunity toward systems that actually run production. Contain first; hunt from the telemetry you already collected.`
        },
        {
          text: `Start restoring last night's backup onto the same machine right away`,
          quality: "poor",
          feedback: `Premature. You haven't scoped the intrusion — restoring onto a compromised host (or from a backup taken after initial compromise) just re-infects, and you overwrite forensic evidence. Recovery comes after containment and scoping. Verify backup integrity and rebuild on clean infrastructure when the time comes.`
        }
      ]
    },
    {
      prompt: `Who needs to be engaged in the first hour?`,
      choices: [
        {
          text: `Plant operations leadership, IT SOC/CISO, and the site safety/quality leads — activate the joint IR plan`,
          quality: "best",
          feedback: `OT incident response is a team sport with a different roster than IT IR: operations decides what the process can tolerate, quality matters because historian data feeds batch records in a regulated plant, and the IT SOC is already working the same adversary from the other side. NIST SP 800-82r3 and every credible OT IR playbook emphasize unified command across IT/OT. One incident, one command structure.`
        },
        {
          text: `Just the IT SOC — it's their ransomware case now`,
          quality: "poor",
          feedback: `The IT SOC can't make plant decisions: they don't know what the historian feeds, what quality implications stale data has, or whether isolating Level 2 connections is safe. Handing an OT-side incident to IT alone is how containment actions break production. Joint command, with OT holding authority over actions that touch production systems.`
        },
        {
          text: `Call the historian vendor's support line first for recovery guidance`,
          quality: "ok",
          feedback: `The vendor will matter for clean reinstallation and database integrity checks, but they're not first-hour critical. Incident command, scoping, and containment decisions come before recovery logistics. Loop the vendor in once you know the recovery path — and remember their remote access stays disabled until you've verified it wasn't the entry vector.`
        },
        {
          text: `Nobody yet — investigate quietly for a few hours to avoid causing panic`,
          quality: "poor",
          feedback: `Concealment burns the hours that matter most and may violate your own IR plan, customer contracts, insurance conditions, and (for public companies) the SEC materiality-assessment clock. Calm, structured notification isn't panic — it's what the plan you wrote is for. Quiet solo investigation is how a one-server incident becomes a plant-wide one.`
        }
      ]
    },
    {
      prompt: `The monitoring platform shows those two engineering workstations made authenticated connections to the historian overnight. The lines are still running. What's your scoping/containment posture for Level 2?`,
      choices: [
        {
          text: `Treat both EWS as suspect: isolate them, check PLC program integrity against your known-good baselines, tighten the L2/L3 conduit to essential traffic only`,
          quality: "best",
          feedback: `This is consequence-driven scoping. Engineering workstations are the crown-jewel pivot in ICS attacks (the ICS Cyber Kill Chain Stage 2 path runs through them — they hold the project files and write access to controllers). Isolating them, verifying PLC logic against your configuration-management baselines, and clamping the conduit addresses the worst credible consequence without stopping production. This is exactly why you keep golden copies of PLC programs.`
        },
        {
          text: `Run antivirus scans on the EWS while leaving them connected — you need them available for production support`,
          quality: "poor",
          feedback: `AV scans on a live, possibly-compromised EWS prove little (modern ransomware operators disable or evade endpoint AV) and leaving write-capable engineering stations connected to controllers during an active intrusion is the riskiest possible posture. Production support can survive a day of isolated EWS; it might not survive tampered controller logic.`
        },
        {
          text: `Shut down production as a precaution until everything is verified clean`,
          quality: "ok",
          feedback: `Conservative and sometimes right — but disproportionate at this point. Levels 1-2 show no compromise indicators, controllers are running normally, and you have containment options short of shutdown. A controlled shutdown remains your fallback if EWS forensics show controller access or you find logic changes. Jumping straight to shutdown also costs credibility you'll need for future incidents: ops will remember whether your judgment was calibrated.`
        },
        {
          text: `Focus only on the historian — the EWS connections were probably routine maintenance`,
          quality: "poor",
          feedback: `"Probably routine" is an assumption, not a finding — and it's contradicted by your own monitoring flagging them as unusual SMB connections during the attack window. Unverified assumptions during active incidents are how scoping fails. Check the change records: if there was no scheduled work, those connections are your top investigation priority.`
        }
      ]
    },
    {
      prompt: `Day 2. Historian forensics confirm the entry came from IT via the IDMZ replication account, whose password was reused from a compromised IT service account. EWS check out clean; PLC baselines verified. The CFO asks: "Can we pay the ransom to get the historian data back faster?" Your recommendation?`,
      choices: [
        {
          text: `Recommend against: you have verified backups, rebuild is the reliable path, and paying funds the adversary with no integrity guarantee — but route the final call through legal/executive process`,
          quality: "best",
          feedback: `The decision is ultimately executive/legal (sanctions exposure via OFAC, insurance conditions, disclosure), but your technical recommendation is clear: backups verified, recovery path known, so payment buys little except adversary funding and a decryptor of unknown quality. Note you can quantify recovery time from your tested restore process — which is exactly the "recovery confidence" metric that justified those backup investments.`
        },
        {
          text: `Yes, pay — it's fastest and the data matters for compliance`,
          quality: "poor",
          feedback: `With verified backups in hand, payment is nearly all downside: OFAC sanctions risk, no guarantee the decryptor works (they often run slower than restores and corrupt data), marks you as a payer for repeat targeting, and possible insurance complications. Payment debates are for situations with no recovery path — you have one.`
        },
        {
          text: `Refuse to discuss it — paying ransoms is unethical, end of conversation`,
          quality: "ok",
          feedback: `Right conclusion, wrong execution. The CFO asked a legitimate business question; answering with moral absolutism instead of analysis wastes a credibility-building moment. Walk the math: restore time vs. decryptor risk, sanctions exposure, insurer position. Leaders who show their reasoning get invited back into the room.`
        },
        {
          text: `Pay quietly without involving legal to keep it out of records`,
          quality: "poor",
          feedback: `This compounds an incident into potential corporate misconduct: sanctions violations carry strict liability, concealment can breach insurance conditions and securities disclosure obligations, and "quietly" never stays quiet. No security leader survives advising this.`
        }
      ]
    },
    {
      prompt: `Recovery is done. What's the highest-value corrective action to take from this incident?`,
      choices: [
        {
          text: `Kill the shared/reused service account pattern: unique credentials per IDMZ broker account, monitored, with the conduit restricted to one-way replication`,
          quality: "best",
          feedback: `Root cause first. The entry path was credential reuse across the IT/OT boundary — exactly what IEC 62443's zone-and-conduit model and FR1 (identification and authentication control) exist to prevent. Unique, vaulted, monitored service accounts and a tightened conduit close the actual hole. Pair it with a lessons-learned review and an updated detection rule (you now know what historian-to-EWS lateral movement looks like in your own telemetry).`
        },
        {
          text: `Buy an additional detection platform for the IT network`,
          quality: "ok",
          feedback: `More IT detection isn't wrong, but it's not this incident's lesson — your OT monitoring actually caught the lateral movement. Spending the post-incident budget moment on a tool instead of the credential architecture that caused the breach is fighting the next war with the wrong weapon. Fix the root cause; then evaluate detection gaps with a clear head.`
        },
        {
          text: `Air-gap the historian permanently — no more IDMZ replication`,
          quality: "poor",
          feedback: `Overcorrection that punishes the business: enterprise systems legitimately need historian data, and "air gaps" that block sanctioned paths breed unsanctioned ones (USB sneakernet, rogue cellular modems — the exact pattern that makes plants less secure). The IDMZ broker pattern was right; the credential hygiene was wrong. Fix the actual failure.`
        },
        {
          text: `Discipline the night-shift supervisor for not catching it sooner`,
          quality: "poor",
          feedback: `The supervisor reported promptly and correctly — punishing the messenger teaches the whole plant to stop reporting, which is the single most damaging cultural outcome an OT security program can produce. Blameless post-incident review is the standard for the same reason it is in safety investigations.`
        }
      ]
    }
  ],
  debrief: `This scenario rehearses the core OT IR doctrine: contain at the network layer while preserving evidence and production; run unified IT/OT incident command; scope by consequence (engineering workstations and controller integrity outrank data recovery); recover from verified backups onto clean infrastructure; and fix root cause rather than buying tools or assigning blame. Frameworks in play: NIST SP 800-82r3 incident response guidance, IEC 62443 zones/conduits and FR1 (the credential-reuse entry), and your own configuration-management baselines as the PLC integrity check. Notice how much of the "security" response was actually operations judgment — that's the OT IR difference, and it's where your background carries the room.`
});

window.OTSEC.scenarios.push({
  id: "ciso-patching",
  title: "The CISO Wants Patch Tuesday on Your PLCs",
  category: "leadership",
  module: "leadership",
  context: `New CISO, ex-financial-services, 90 days in. Her internal audit flagged "unpatched OT assets" as a top enterprise risk: hundreds of plant-floor Windows boxes and controllers showing years-old firmware. Her directive, announced in the IT steering meeting: extend the corporate patch management system to all OT assets — monthly Patch Tuesday cycle, automated deployment, compliance dashboards. Plant engineering is furious; one site lead is threatening to physically disconnect plant networks from corporate. You're the OT security manager, you report to engineering, and the CISO controls 80% of the security budget you'd like to tap next year. She's asked for your "implementation plan" by Friday.`,
  steps: [
    {
      prompt: `Your opening move?`,
      choices: [
        {
          text: `Book a working session with the CISO to align on the risk goal, and bring an OT-appropriate way to meet it — not a refusal`,
          quality: "best",
          feedback: `She's right about the risk and wrong about the mechanism — so engage the goal, not the directive. Coming with "here's how we achieve your audit objective in OT" makes you the expert partner who solves her problem, not the next plant obstacle. This framing also protects the budget relationship. You need her air cover for years; this meeting is where that alliance starts or dies.`
        },
        {
          text: `Send a detailed memo explaining why automated patching will break production, copying plant leadership`,
          quality: "ok",
          feedback: `The content may be right but the channel is wrong: a broadcast memo with plant leadership copied reads as building a coalition against her in writing, 90 days into her tenure. You'll win the battle and lose the budget war. Same facts, delivered in a working session first, land as expertise instead of resistance.`
        },
        {
          text: `Quietly tell the plants to slow-roll it — the initiative will die on its own`,
          quality: "poor",
          feedback: `Passive resistance is the most corrosive option: it confirms every stereotype the CISO has about OT obstruction, leaves the genuine vulnerability problem unsolved, and when (not if) it surfaces, your credibility as a leader is gone. Sandbagging is what middle managers do; you're auditioning for director.`
        },
        {
          text: `Comply fully — push the corporate patch agent to all OT Windows systems and schedule PLC firmware updates monthly`,
          quality: "poor",
          feedback: `This will hurt people's production and possibly people. Automated reboots on HMI/SCADA servers mid-batch, untested patches breaking vendor-validated applications, firmware updates without commissioning checks — this is how security teams cause the outages they're supposed to prevent. Compliance theater that damages the plant also destroys the OT security program's standing permanently.`
        }
      ]
    },
    {
      prompt: `In the working session, she pushes back: "Unpatched is unpatched. Why should OT get a pass?" Your response?`,
      choices: [
        {
          text: `OT doesn't get a pass — it gets a different mechanism: risk-based patching in maintenance windows, compensating controls between cycles, and a dashboard she can show audit`,
          quality: "best",
          feedback: `This reframes from "exemption" to "equivalent control, different cadence" — the language auditors and 62443/800-82r3 both support. Concretely: critical+exploited (KEV-listed) patches get expedited risk review; the rest batch into scheduled maintenance windows with pre-test on spares; what can't be patched gets compensating controls (segmentation, allowlisting, monitoring) documented per asset. She gets her audit answer: every asset has a documented disposition. Nobody gets a pass.`
        },
        {
          text: `Explain that OT availability requirements mean patching is simply impossible`,
          quality: "poor",
          feedback: `"Impossible" is both false and fatal: plenty of plants patch Windows OT assets in planned windows, and an absolute refusal hands her the narrative that OT is unmanageable risk requiring her intervention. Worse, it leaves you defending the indefensible 8-year-old unpatched HMI when the auditors come back. Never argue impossibility when you mean "different process."`
        },
        {
          text: `Point out that her financial-services background doesn't apply to manufacturing`,
          quality: "poor",
          feedback: `Even if partially true, making it personal converts a solvable technical disagreement into a status fight you cannot win against the person controlling the security budget. Attack the mechanism, never the person's background. Your operational credibility shows through your proposal's quality, not through credential comparison.`
        },
        {
          text: `Offer to pilot the corporate patching tool on a non-production OT test bench first`,
          quality: "ok",
          feedback: `Constructive, and pilots build trust — but as a complete answer it's too narrow: it implicitly accepts the corporate tool/cadence as the destination and just delays it. The structural issues (reboot windows, vendor validation, devices that can't run agents, firmware vs. OS patching) need the full risk-based framework. Use the pilot as one element inside the bigger proposal.`
        }
      ]
    },
    {
      prompt: `She accepts the framework in principle but wants numbers: "What does risk-based actually mean? Show me the policy." What do you propose?`,
      choices: [
        {
          text: `A written OT patch standard: KEV/critical-with-exposure within 30 days via emergency change; high in next maintenance window; medium/low annually or at overhaul; can't-patch gets documented compensating controls and an exception with expiry`,
          quality: "best",
          feedback: `Specific, auditable, defensible. Tiering by exploitability and exposure (KEV catalog, internet-reachable, conduit-adjacent) rather than raw CVSS reflects how OT risk actually works — a CVSS 9.8 on a segmented, monitored, non-routable controller is less urgent than a 7.5 on the IDMZ jump host. The exception-with-expiry register converts your unpatchable legacy fleet from "audit finding" to "managed risk acceptance," which is the deliverable audit actually needs.`
        },
        {
          text: `Commit to patching everything within 90 days of release across all OT assets`,
          quality: "poor",
          feedback: `An aggressive blanket SLA you cannot keep is worse than no policy: the first missed quarter creates a compliance failure of your own authorship. OT fleets always contain assets that cannot be patched (vendor-locked, end-of-life, validation-frozen) — a policy that ignores them is fiction, and auditors treat broken fiction harshly.`
        },
        {
          text: `Propose compensating controls only — segmentation and monitoring instead of patching, across the board`,
          quality: "ok",
          feedback: `Compensating controls are legitimate (62443 explicitly supports them toward target security levels), but "never patch, only compensate" is an overcorrection that accumulates technical debt and ignores the genuinely patchable majority of Windows-based OT assets. The defensible position is patch-where-feasible plus compensate-where-not, with the boundary documented per asset.`
        },
        {
          text: `Suggest deferring the policy until a full asset inventory is complete next year`,
          quality: "poor",
          feedback: `Inventory matters, but a year of policy vacuum means a year of the CISO's original directive standing unopposed — or a year of nothing, which audit flags again. Ship the policy now and let the inventory progressively improve its coverage. Programs that wait for perfect data ship nothing.`
        }
      ]
    },
    {
      prompt: `Two months in, the new process works — but the site lead who threatened to disconnect from corporate now refuses even the agreed maintenance-window patching on his lines: "Nothing changes on my floor." How do you handle him?`,
      choices: [
        {
          text: `Meet him on his floor, walk one line's actual exposure with him, and put his own engineer in charge of the pilot window — escalate only if he still refuses an unaccepted risk`,
          quality: "best",
          feedback: `He's defending uptime, which is rational; your move is to make the change his rather than yours. Walking the exposure (this HMI runs the same SMB version NotPetya exploited; here's its path to the IDMZ) converts abstraction into engineering fact, and giving his team ownership of the window respects plant authority. If he still refuses, the documented governance process — risk acceptance signed at the right level — handles it without ambush. Most refusers fold when the alternative is signing their name to the risk.`
        },
        {
          text: `Escalate immediately to the COO with the CISO's backing`,
          quality: "ok",
          feedback: `Escalation is in your toolkit and the governance process exists for genuine impasses — but as a first move it spends executive capital on a fight you haven't tried to win directly, and it makes a public example of a plant leader, teaching every other site that OT security means head-office force. Try the floor visit first; escalate with documentation if needed.`
        },
        {
          text: `Let his site skip the program — one plant's exception isn't worth the fight`,
          quality: "poor",
          feedback: `One visible exception unravels the program: every other site lead now knows refusal works, and the unpatched site remains the soft entry point that lateral movement loves (ask anyone who's watched ransomware cross between "segmented" plants). Exceptions exist in your framework — but as documented, risk-accepted, compensated decisions, not as rewards for the loudest refusal.`
        },
        {
          text: `Have the patches pushed to his site remotely without telling him — the steering committee approved the policy`,
          quality: "poor",
          feedback: `Pushing changes to production systems behind a plant leader's back is the cardinal sin of OT security: if anything hiccups — and something always hiccups — you own an outage, a furious site, and a story that will follow the program for a decade. Policy authority never substitutes for change-control consent on the plant floor.`
        }
      ]
    }
  ],
  debrief: `This scenario is the IT/OT convergence conflict in miniature, and it's a near-certain interview question. The pattern to internalize: validate the risk goal, replace the mechanism (risk-based patching per 62443/800-82r3 instead of IT cadence), make it auditable (tiered SLAs, KEV-driven urgency, exception register with expiry), and win the plant floor through ownership rather than authority. Note the political throughline — every choice balanced the technical answer against the CISO budget relationship and plant trust, because an OT security leader's effectiveness is exactly the product of those two relationships. The strongest sentence in your interview vocabulary: "Nobody gets a pass; OT gets an equivalent control with a different mechanism."`
});

window.OTSEC.scenarios.push({
  id: "budget-board",
  title: "Justify the $500K to the Board",
  category: "leadership",
  module: "leadership",
  context: `Your OT security roadmap needs $500K next fiscal year: $180K for an OT network monitoring platform and sensors, $120K of segmentation work on two older plants, $90K for a managed OT watch service, $60K for backup/recovery hardening, and $50K for training and exercises. The CFO is skeptical ("we just spent on IT security tools"), and you've been given 15 minutes at the next board meeting. A board member ran operations at an automotive supplier that was down 11 days from ransomware in 2023 — potentially an ally. The CEO has hinted the easiest path is to ask for half. You get one shot at the framing.`,
  steps: [
    {
      prompt: `How do you open the 15 minutes?`,
      choices: [
        {
          text: `With the business exposure: "An OT cyber event at Plant 2 stops $1.9M/day of shipments; current detection for that scenario is near zero. This proposal cuts that exposure for 1.5% of one incident's cost."`,
          quality: "best",
          feedback: `Numbers the board can audit, anchored to downtime cost — the figure operations leaders trust because it comes from their own data. Opening with exposure-versus-ask ratio frames $500K as insurance math, not a tech wishlist. You've also implicitly answered the board's four standing questions (how exposed, versus what, trend, ask) in two sentences, leaving 14 minutes for substance instead of throat-clearing.`
        },
        {
          text: `With the threat landscape: Volt Typhoon, PIPEDREAM, and manufacturing as the #1 ransomware vertical`,
          quality: "ok",
          feedback: `Credible content, wrong opening. Threat-first framing reads as FUD until it's connected to YOUR exposure, and boards have heard a hundred scary-actor briefings. The threat data belongs in the middle, as evidence that the exposure is real and current — one slide, sourced (Dragos/IBM annual reporting), after the business framing has earned attention.`
        },
        {
          text: `With the technology: a walkthrough of the monitoring platform's capabilities and the segmentation architecture`,
          quality: "poor",
          feedback: `The board doesn't buy sensors; it buys risk reduction. Leading with product capabilities invites the two killer responses: "sounds like IT's job" and "can we do it cheaper?" Architecture diagrams go in the appendix for the one director who asks. Fifteen minutes of executive attention is too expensive to spend below the risk layer.`
        },
        {
          text: `With a live demo of how easily a plant PLC can be accessed from the corporate network`,
          quality: "poor",
          feedback: `Theatrical, risky (live demos fail, and "we hacked ourselves in the boardroom" stories travel badly), and it spends your time proving a vulnerability exists rather than selling the remediation. Red-team evidence is powerful WHEN summarized in one sentence with the report available — not performed live to an audience that needed the business case.`
        }
      ]
    },
    {
      prompt: `The CFO interjects: "We spent $2M on cybersecurity tools last year. Why isn't OT covered by that?" Your answer?`,
      choices: [
        {
          text: `"That investment protects our information systems, and it's working. But the plant networks run different equipment with different failure modes — the IT tools can't see industrial protocols, and the cost of failure there is measured in shipping days, not data records."`,
          quality: "best",
          feedback: `Respectful of the prior spend (never trash the IT investment — the CISO is in the room), technically accurate (EDR and IT scanners are blind to controller protocols and can't deploy on OT endpoints), and it lands the differentiation in business terms: different asset class, different consequence currency. This is the two-sentence version of the IT/OT distinction every OT leader needs on tap.`
        },
        {
          text: `"IT security and OT security are completely different fields — that money is irrelevant here."`,
          quality: "poor",
          feedback: `Technically half-true, politically self-destructive: it dismisses the CFO's legitimate question, antagonizes the CISO whose budget you just called irrelevant, and signals silo thinking when convergence leadership is the job. The skill being tested is connecting the investments into one coherent risk story, not separating them.`
        },
        {
          text: `"Good question — much of the IT investment does help, since most OT incidents start in IT. This $500K covers the last mile the IT tools physically can't reach."`,
          quality: "ok",
          feedback: `Solid and collegial — acknowledging that IT controls reduce OT risk (true: most OT-impacting incidents enter via IT) builds rather than burns the CISO alliance. Slightly weaker than the best answer only because it undersells the distinct consequence story (downtime economics) that justifies OT-specific spend on its own merits, leaving room for "so finish the IT rollout first" as a rebuttal.`
        },
        {
          text: `"The IT tools were the wrong purchase — this should have been funded first."`,
          quality: "poor",
          feedback: `Even if you believe the sequencing was wrong, prosecuting last year's decision in front of the board attacks the CEO and CISO who made it and converts your funding pitch into a blame hearing. Forward-looking framing only: what the next dollar buys, not what the last dollar should have bought.`
        }
      ]
    },
    {
      prompt: `The ex-automotive board member shares her 11-day shutdown story, then asks: "If you get the $500K, what does it actually change? Walk me through the ransomware scenario at our plants."`,
      choices: [
        {
          text: `Walk the kill chain against the spend: monitoring catches the IT-to-OT lateral movement in hours instead of weeks, segmentation contains it to one zone, tested recovery means 2-3 days for one plant instead of 11 for all three`,
          quality: "best",
          feedback: `This is the gift question and this answer maximizes it: her lived 11-day experience becomes your before picture, and each budget line maps to a specific break in the attack sequence (detect earlier, contain smaller, recover faster). Quantified deltas — hours vs. weeks, one zone vs. three plants, 2-3 days vs. 11 — make the $500K's mechanism legible. Always convert allies' war stories into your evidence.`
        },
        {
          text: `"It significantly reduces the likelihood of that happening to us."`,
          quality: "poor",
          feedback: `Vague, and subtly wrong: most of this spend reduces IMPACT (containment, recovery) more than likelihood, and boards notice when the mechanism is hand-waved. She asked for the scenario walkthrough — a concrete question deserves a concrete answer, and you just declined the best assist you'll ever get in a boardroom.`
        },
        {
          text: `"Honestly, nothing can prevent a determined attacker — this is about resilience."`,
          quality: "ok",
          feedback: `The resilience framing is mature and the honesty is creditable, but stopping there leaves "so why spend at all?" hanging. Complete the thought with the specific resilience deltas the money buys (detection time, blast radius, recovery time). Calibrated honesty plus quantified improvement is the winning combination; calibrated honesty alone is a shrug.`
        },
        {
          text: `Promise that with this investment, an event like hers couldn't happen here`,
          quality: "poor",
          feedback: `Overpromising to a board member who has personally lived the failure mode is the fastest credibility destruction available in that room — she knows better, and the first incident after your guarantee ends your tenure. Security leaders sell exposure reduction with trend lines, never immunity.`
        }
      ]
    },
    {
      prompt: `The CEO makes his move: "Compelling, but budgets are tight. What does the $250K version look like?" How do you respond?`,
      choices: [
        {
          text: `Give a real answer with the risk made explicit: fund visibility, recovery, and the watch service now ($250K); defer segmentation to next year's capital cycle — and state plainly which exposure stays open in the gap`,
          quality: "best",
          feedback: `Leaders who can't prioritize their own ask lose the room; leaders who pretend half-funding has no cost lose it later. This answer shows you know which dollars carry the most risk reduction (visibility and recovery before architecture — consistent with every maturity model), exploits the capital-cycle trick for segmentation (ride it on planned line upgrades), and puts the residual risk on the record so the haircut is the board's documented decision, not your hidden failure.`
        },
        {
          text: `Hold firm: "$500K is the number — cutting it makes the whole program pointless."`,
          quality: "poor",
          feedback: `All-or-nothing is almost never true (the phases have wildly different risk-reduction-per-dollar) and the board reads rigidity as inexperience. You'll likely get nothing, and you've shown you can't manage to a constraint — a disqualifying signal for someone asking to manage a program.`
        },
        {
          text: `Accept $250K instantly and thank them for the support`,
          quality: "poor",
          feedback: `Folding without articulating the cost of the cut signals the original ask was padded, and it silently transfers the deferred risk from the board's ledger to yours — when the unsegmented plant has its incident, "you accepted the budget" is the first sentence of the post-mortem. Negotiate the scope, document the residual.`
        },
        {
          text: `Suggest deferring the whole program a year until the budget environment improves`,
          quality: "ok",
          feedback: `At least it's honest about not wanting to do it badly — but it abandons the high-value cheap items (backup hardening, monitoring of the crown-jewel plant) that fit in any budget, and momentum lost in a board cycle takes years to rebuild. There is always a defensible partial scope; find it before the meeting so this question can't catch you flat.`
        }
      ]
    }
  ],
  debrief: `The budget scenario is won before the meeting: know your downtime number, map every line item to a break in a specific attack scenario, pre-build the $250K fallback, and identify your board allies. Rhetorical rules that recurred: open with exposure math, never FUD-first; respect prior IT spend while differentiating the consequence currency (shipping days vs. data); convert allies' war stories into evidence; and when cut, re-scope by risk-reduction-per-dollar and put the residual risk explicitly on the board's record. That last move — making risk acceptance a documented executive decision — is the signature of a security leader versus a security requester, and it's precisely the governance behavior IEC 62443-2-1 and NIST CSF's Govern function institutionalize.`
});

window.OTSEC.scenarios.push({
  id: "phantom-engineering-workstation",
  title: "The 2 AM Engineering Workstation",
  category: "technical",
  module: "secops",
  context: `Your OT monitoring platform raises a medium-severity alert: last night at 02:13, engineering workstation EWS-04 opened an EtherNet/IP session to the Line 5 PLC and issued what the sensor classifies as configuration-read traffic, followed by a brief program-mode interaction. There is no change ticket, no scheduled maintenance, and Line 5 ran normally overnight. EWS-04 sits in the Level 3 engineering subnet; its assigned owner is a senior controls engineer who was, by all accounts, asleep. Your plant uses an integrator for ongoing Line 5 commissioning work, and they have remote access via the IDMZ jump host. It's 7:30 AM and the alert is 5 hours old.`,
  steps: [
    {
      prompt: `First move?`,
      choices: [
        {
          text: `Triage before touching: pull jump-host session logs, EWS-04 login history, and the sensor's packet capture for the 02:13 window, and compare the PLC's current program against your baseline`,
          quality: "best",
          feedback: `Classic hypothesis-driven triage: the three innocent explanations (integrator remote session, scheduled task, engineer working late remotely) and the hostile one all leave different evidence, and these four sources discriminate between them quickly. Checking PLC program integrity against your configuration-management baseline addresses the highest-consequence possibility first. Total elapsed time: maybe 30 minutes, no production impact, no tipped hand.`
        },
        {
          text: `Immediately isolate EWS-04 and force a Line 5 shutdown for inspection`,
          quality: "poor",
          feedback: `A medium-severity alert with multiple innocent explanations doesn't justify stopping production — react like this weekly and operations will lobby to have your sensors removed. Worse, a line stop announces the investigation to any actual adversary. Isolating EWS-04 alone might be defensible if evidence firms up; the shutdown is wildly premature.`
        },
        {
          text: `Call the senior controls engineer at home and ask if it was him`,
          quality: "ok",
          feedback: `You'll want to talk to him, but calling first is weak triage: if his credentials were stolen he can only say "wasn't me" (which the logs already imply), and if he was somehow involved you've tipped him before evidence is preserved. Pull the technical evidence first; the human conversation is more useful when you can ask specific questions.`
        },
        {
          text: `Snooze the alert — Line 5 ran fine, so whatever happened was harmless`,
          quality: "poor",
          feedback: `"Production didn't break" is precisely zero evidence of benignity — ICS Cyber Kill Chain Stage 2 preparation looks exactly like this: quiet configuration reads and program access that change nothing yet. Unauthorized controller access (ATT&CK for ICS would classify the program access under techniques like T0845 Program Upload) is the highest-signal alert class an OT sensor produces. This is the alert the platform exists for.`
        }
      ]
    },
    {
      prompt: `Findings: jump-host logs show an integrator account session 01:55-02:30, but the integrator's PM says their work order ended last week and nobody should have connected. The PLC program matches baseline. EWS-04 shows an interactive login via the integrator's account. What now?`,
      choices: [
        {
          text: `Treat it as an active incident: disable the integrator account, isolate EWS-04 for forensics, snapshot the jump host, and open a formal incident with the integrator's security contact`,
          quality: "best",
          feedback: `An access vendor's account used outside any work order, denied by the vendor, reaching controller program functions — that's a compromised-credential working hypothesis until proven otherwise. Disabling the account and isolating the touched workstation contains it; engaging the integrator's security team formally (not just the PM) starts the cross-organization investigation, since the compromise may live on THEIR side. The clean PLC baseline lowers urgency but not severity: reconnaissance precedes manipulation.`
        },
        {
          text: `Ask the integrator to investigate internally and get back to you next week`,
          quality: "poor",
          feedback: `You've just outsourced your incident response to the organization that may be the compromise source, on their timeline, with your account still enabled. Supply-chain access compromises (a staple of real OT intrusions) demand you contain on YOUR side immediately and run the investigation jointly with defined urgency — not a courtesy referral.`
        },
        {
          text: `Disable the account but skip the forensics — the PLC is clean, so no harm done`,
          quality: "ok",
          feedback: `Containment without investigation leaves the questions that matter: how were the credentials obtained, what else did the session touch, were other vendor accounts taken, is there persistence on EWS-04? "Program matches baseline" rules out one outcome, not the intrusion. You'll regret the skipped disk image when the account's twin shows up next month.`
        },
        {
          text: `Reset all plant passwords and force MFA enrollment across OT today`,
          quality: "poor",
          feedback: `A plant-wide credential fire drill for a single-account compromise is disproportionate, operationally disruptive (HMI shared accounts, service accounts, vendor accounts all break at once), and destroys the calm, scoped-response credibility your program needs. Scope first, then remediate the affected credential class — and pursue MFA as the planned project it already should be.`
        }
      ]
    },
    {
      prompt: `Forensics: the integrator's VPN credentials were phished two weeks ago (their side confirms a successful credential-harvesting campaign). The session on EWS-04 ran a directory listing of PLC project files and copied three of them out through the jump host. How do you assess what you're dealing with?`,
      choices: [
        {
          text: `Likely Stage 1-to-Stage 2 transition: someone is collecting the engineering knowledge needed to build an ICS-capable attack — assess as targeted, brief leadership, hunt for related activity, and report to CISA/sector ISAC`,
          quality: "best",
          feedback: `Exfiltrating PLC project files is the textbook ICS Cyber Kill Chain bridge: Stage 2 attack development requires exactly this material (logic, I/O maps, network details). Random criminals encrypt and extort; collecting controller project files implies intent and capability development. Reporting matters — this TTP pattern at one manufacturer is intelligence the whole sector needs, and CISA/ISAC reporting is how the community detected campaigns like this historically.`
        },
        {
          text: `Routine criminal activity — they grabbed whatever files were lying around`,
          quality: "ok",
          feedback: `Possible — opportunistic actors do bulk-grab files for extortion leverage — but the pattern argues against it: a quiet, single-purpose session that navigated to controller project files specifically, with no encryption, no ransom note, no mass collection. When evidence is ambiguous between "opportunistic" and "targeted," OT defenders plan against the worse hypothesis while gathering more. Underestimating intent is the more expensive error here.`
        },
        {
          text: `Insider threat — the integrator's engineer is probably lying about the phishing`,
          quality: "poor",
          feedback: `The integrator's security team CONFIRMED the phishing campaign with their own evidence; leaping to accusing their staff without supporting indicators poisons a relationship you need for the joint investigation (and for Line 5 support forever after). Keep insider scenarios on the hypothesis list, but follow evidence, not suspicion.`
        },
        {
          text: `No real damage — project files are useless without physical plant access`,
          quality: "poor",
          feedback: `Dangerously wrong: PLC project files are the crown jewels for remote attack development — Stuxnet's authors needed exactly this class of material, and PIPEDREAM's value is precisely that it weaponizes protocol/controller knowledge remotely. The adversary just acquired the blueprint for manipulating Line 5 from anywhere they can re-establish access.`
        }
      ]
    },
    {
      prompt: `Closing the incident: which corrective package do you push hardest?`,
      choices: [
        {
          text: `Vendor access redesign: per-engagement time-boxed accounts, MFA at the jump host, session recording reviewed against work orders, and detections for engineering-protocol activity outside change windows`,
          quality: "best",
          feedback: `Every fix addresses an exploited link: standing credentials became phishable (time-box them), single-factor VPN fell to harvesting (MFA), the unauthorized session ran unnoticed for 5 hours (recorded sessions reconciled to work orders, plus the after-hours engineering-traffic detection that actually caught this — promote it from medium to high severity). This converts one incident into structural improvement of your most common OT attack vector, and it's a clean 62443 FR1/FR5 story for the after-action report.`
        },
        {
          text: `Terminate the integrator relationship for cause`,
          quality: "poor",
          feedback: `They were phished — as your own staff could be — they cooperated fully, and they hold irreplaceable Line 5 knowledge mid-commissioning. Firing cooperative partners after compromise teaches every vendor to hide the next one. The contract fix is security requirements (MFA, notification SLAs, 62443-2-4-style obligations), not the guillotine.`
        },
        {
          text: `Block all vendor remote access permanently — on-site visits only from now on`,
          quality: "ok",
          feedback: `It would prevent recurrence, but at brutal cost: support response times collapse from hours to days, travel charges soar, and operations will revolt — then quietly re-enable something worse (the OEM's cellular modem). Remote access isn't the flaw; UNGOVERNED remote access is. Secure the pattern rather than banning it, or the ban breeds shadow access.`
        },
        {
          text: `Buy a second monitoring platform for redundant detection coverage`,
          quality: "poor",
          feedback: `Your existing platform DID detect the activity — the gaps were credential architecture and alert triage speed, not sensing. A redundant sensor grid spends the post-incident budget on the part of the chain that worked. Root-cause discipline: fix what failed.`
        }
      ]
    }
  ],
  debrief: `This is the supply-chain remote-access intrusion — statistically one of the most common real OT attack patterns, and a favorite interview scenario. The craft on display: hypothesis-driven triage that checks the highest-consequence item (PLC integrity vs. baseline) early; treating vendor-denied access as compromise until proven otherwise; reading exfiltrated PLC project files as ICS Kill Chain Stage 2 preparation rather than petty theft; and corrective actions aimed at the exploited links (standing credentials, single-factor access, slow triage) instead of punitive theater. Note what made detection possible at all: an OT monitoring sensor that understands engineering protocols, and a configuration-management baseline to verify controller integrity — the two investments your budget scenario fought for.`
});

window.OTSEC.scenarios.push({
  id: "vendor-remote-access",
  title: "The OEM Wants Always-On TeamViewer",
  category: "technical",
  module: "networking",
  context: `You're commissioning two new robotic assembly cells. The robot OEM's support contract includes a 4-hour response SLA — but their standard terms require "persistent remote access to the robot controllers and cell HMI via our TeamViewer-based support platform." Their field engineer has already installed it on one cell HMI "to get ahead of schedule," connected through a cellular USB dongle he brought, bypassing your network entirely. Operations loves the SLA; the plant manager signed the support contract before you saw it. The OEM says every other customer accepts this setup. You have to fix the immediate violation, design something sustainable, and keep the SLA that operations is counting on.`,
  steps: [
    {
      prompt: `The cellular dongle is live right now. What do you do about it today?`,
      choices: [
        {
          text: `Remove it today with the plant manager informed — explain it's an unmanaged internet path directly into a production cell — and give the OEM engineer a sanctioned interim path`,
          quality: "best",
          feedback: `A cellular modem on a production HMI is a textbook rogue access point: it bypasses every boundary control you have, is invisible to your monitoring, and is exactly the device class that turns "segmented" plants into flat ones. But pair removal with an interim alternative (supervised sessions through IT's VPN, or scheduled on-site time) so commissioning doesn't stall — security that stops the project becomes the enemy, and you need the plant manager seeing you solve, not just forbid.`
        },
        {
          text: `Leave it during commissioning — removing it now delays the project — and deal with it at handover`,
          quality: "poor",
          feedback: `"Temporary" rogue access has a way of becoming permanent infrastructure, and commissioning is when the cell is MOST exposed (default credentials, test configurations, frequent changes). Worse, tolerating it signals that schedule pressure overrides security policy, a precedent every future project will cite. The interim-path option makes this delay-free; there's no excuse to accept the dongle.`
        },
        {
          text: `Rip it out immediately and report the OEM engineer to his company for a security violation`,
          quality: "ok",
          feedback: `The removal is right; the escalation tone is costly. The engineer did what his standard playbook says — your plant simply hadn't communicated requirements (because the contract got signed around you). A formal violation report poisons the daily working relationship you need for two more months of commissioning. Remove it, explain why, and fix the root cause at the contract level where it actually lives.`
        },
        {
          text: `Leave the dongle but install endpoint monitoring on that HMI to watch what the OEM does`,
          quality: "poor",
          feedback: `Monitoring an unmanaged internet connection doesn't make it managed — you'd be watching the breach happen in slightly better resolution. The dongle also sits outside your network path, so most of your visibility tooling can't even see its traffic. Containment first; there's no compensating control for a bypass of every control.`
        }
      ]
    },
    {
      prompt: `Now the sustainable design. What's your target architecture for OEM support access?`,
      choices: [
        {
          text: `Jump host in the IDMZ: OEM connects via MFA to the broker, sessions are recorded and time-boxed, vendor accounts disabled by default and enabled per support ticket, with access scoped to only their cells' zone`,
          quality: "best",
          feedback: `This is the reference pattern (NIST 800-82r3 and 62443 both point here): no direct external path to Level 2; a single brokered, authenticated, recorded chokepoint; least-privilege scoping to the vendor's own equipment zone; and enable-on-ticket so "persistent capability" never means "persistent connection." It satisfies the SLA — enabling an account takes a minute — while keeping every session attributable and reviewable. Most major OEMs accept this once it's framed as their session quality staying the same.`
        },
        {
          text: `Accept their TeamViewer platform but require them to use strong passwords and enable its built-in logging`,
          quality: "poor",
          feedback: `This keeps the fundamental flaw: an outbound channel from production equipment to a third-party cloud relay you don't control, with security settings governed by the vendor's tenant, invisible to your boundary monitoring. Hardening the wrong architecture is still the wrong architecture — commercial remote-support clouds on OT equipment have repeatedly been the initial access vector in real incidents.`
        },
        {
          text: `Require all support to happen on-site — no remote access of any kind to the robot cells`,
          quality: "ok",
          feedback: `Secure but probably unsustainable: the 4-hour SLA operations signed for becomes a next-day flight, support costs climb, and the practical result is pressure that eventually re-opens remote access — possibly informally (another dongle). A brokered remote path you control is more secure than a ban you can't hold. Reserve the on-site-only stance for equipment whose consequence genuinely justifies it.`
        },
        {
          text: `Give the OEM VPN credentials into the Level 3 network so they can reach their cells directly`,
          quality: "poor",
          feedback: `A flat VPN drop into Level 3 grants the vendor (and anyone who phishes them — see how that goes) reachability to your entire site operations network, not just their cells. No session recording, no per-ticket gating, no zone scoping. This is the architecture behind a large fraction of real OT intrusions; the phantom-EWS scenario in this app is literally this design failing.`
        }
      ]
    },
    {
      prompt: `The OEM pushes back: "Our platform is how we deliver the SLA. Your jump host adds friction, and we can't guarantee 4-hour response through it. Every other customer accepts our standard setup." How do you respond?`,
      choices: [
        {
          text: `Hold the architecture, negotiate the workflow: walk their engineer through the broker (it's one MFA hop), commit to a 15-minute account-enable SLA on your side, and put both companies' obligations in a security addendum to the contract`,
          quality: "best",
          feedback: `Most vendor resistance is workflow anxiety, not policy — demo that their session experience is nearly identical and the objection usually dissolves. The mutual-SLA move is the masterstroke: you commit to enable-on-ticket within 15 minutes, they keep their 4-hour response, both auditable. The addendum (aligned with 62443-2-4 service-provider requirements) survives personnel changes on both sides. "Every other customer accepts it" gets the polite reply: increasingly, regulated customers don't — and your requirements are becoming their other customers' requirements too.`
        },
        {
          text: `Cave — the contract is signed, the SLA matters, and the OEM has the leverage`,
          quality: "poor",
          feedback: `The contract bought a response time, not an architecture — that's exactly the ambiguity the addendum fixes. Caving here also sets your precedent for every future OEM negotiation at the plant: word travels through the integrator community fast. The leverage is more balanced than it looks; they want the equipment sale and reference customer more than they want their default tooling.`
        },
        {
          text: `Threaten to return the robots and cancel the project unless they comply immediately`,
          quality: "poor",
          feedback: `An empty threat (operations would never let you, the OEM knows it) that converts a solvable workflow negotiation into a relationship rupture mid-commissioning. You also still need their engineers, daily, for months. Escalation belongs at the contract/legal table with the plant manager aligned — not as a personal ultimatum you can't execute.`
        },
        {
          text: `Compromise: their platform for commissioning, your jump host after handover`,
          quality: "ok",
          feedback: `Pragmatic-sounding, but commissioning is the period of maximum change and exposure, and "we'll fix the access later" historically means never — handover day arrives with their platform entrenched and operations dependent on it. If you must phase, invert it: your broker now with generous session availability during commissioning, tightening to ticket-gated mode at handover.`
        }
      ]
    },
    {
      prompt: `Six months later it's working well. The plant manager asks you to "do whatever you did" for the other 14 vendors with some form of remote access across the site. What's your move?`,
      choices: [
        {
          text: `Make it a program: inventory all vendor access paths, migrate them to the broker in risk order, write the policy/standard so procurement bakes it into every future contract, and report the closure metric quarterly`,
          quality: "best",
          feedback: `The request is your mandate moment — convert a one-off win into governance. The inventory will be the scary part (expect to find modems, forgotten VPNs, and "temporary" tunnels old enough to vote); risk-ordering the migration keeps it tractable. The procurement hook is the leverage that prevents regression: security requirements at contract time cost nothing, retrofits cost negotiations like the one you just survived. The "% of vendor access through the managed path" metric is board-ready.`
        },
        {
          text: `Clone the same jump-host config for each vendor as fast as possible`,
          quality: "ok",
          feedback: `Speed is good but skipping the inventory and policy steps leaves you solving 14 visible cases while unknown access paths persist, and without the procurement standard, vendor #15 arrives next quarter with a fresh cellular dongle. Engineering the instances is the easy half; institutionalizing the pattern is what the plant manager actually asked for, whether he knows it or not.`
        },
        {
          text: `Decline — each vendor relationship is the equipment owner's responsibility, not security's`,
          quality: "poor",
          feedback: `Distributed ownership of remote access is how the site got 14 inconsistent paths in the first place. Vendor access is a shared attack surface that demands a single standard and chokepoint; handing it back to individual equipment owners abandons the program's clearest success and the plant manager's explicit sponsorship. Take yes for an answer.`
        },
        {
          text: `Hire a consultant to study site-wide vendor access for six months first`,
          quality: "poor",
          feedback: `You already have the validated pattern, the sponsor, and the momentum — a six-month study buys delay and a report that says what you already know. Consultants make sense for capabilities you lack; this one you just demonstrated. Run the inventory with your own team and spend the consultant money on migration labor if needed.`
        }
      ]
    }
  ],
  debrief: `Vendor remote access is the most common OT attack vector and the most common OT security interview scenario — this drill is the canonical answer. The architecture: brokered access through an IDMZ jump host, MFA, session recording, least-privilege zone scoping, accounts disabled-by-default and enabled per ticket. The negotiation: pair every removal with a sanctioned alternative, convert vendor SLA objections into mutual SLAs, and fix root cause in the contract (62443-2-4 language) where it survives personnel churn. The leadership arc: one secured cell became a site-wide program with a procurement hook and a board metric. You've lived the OEM side of this negotiation — in interviews, tell it from both chairs; nobody else in the candidate pool can.`
});

window.OTSEC.scenarios.push({
  id: "usb-malware-line3",
  title: "Contractor USB on a Validated Line",
  category: "technical",
  module: "threats",
  context: `A vibration-analysis contractor plugged his USB drive into the Line 3 HMI to copy trend data. Twenty minutes later the HMI's application whitelisting alert fired: blocked execution of an unsigned binary matching a known USB-propagating malware family. Line 3 is a validated line producing a Class II medical device; its HMI configuration is under formal change control, and the batch currently in process is worth roughly $400K. The HMI appears to be functioning normally — the allowlisting blocked the payload — but the malware files are present on disk, the USB drive also touched the contractor's laptop and possibly the Line 4 HMI (he isn't sure), and your quality director is now standing at your desk asking whether the batch record integrity is affected.`,
  steps: [
    {
      prompt: `What's your immediate technical response?`,
      choices: [
        {
          text: `Quarantine the USB and contractor laptop, isolate the Line 3 HMI from the network while leaving the line running locally, and pull the allowlisting and sensor logs to confirm the block held and check Line 4`,
          quality: "best",
          feedback: `Proportionate containment: the allowlisting evidence says the payload never executed, the PLC keeps running the process standalone (local control doesn't depend on the HMI's network connection), and the $400K batch continues while you verify. The Line 4 question is the live scoping risk — "he isn't sure" means you check its allowlisting logs and disk now, not later. Seize the USB and laptop before the contractor leaves site; they're your evidence and your scope map.`
        },
        {
          text: `Stop Line 3 immediately and scrap the batch as potentially compromised`,
          quality: "poor",
          feedback: `A $400K overreaction unsupported by evidence: the malware was BLOCKED from executing, the process is PLC-controlled, and nothing indicates process or record manipulation. Quality decisions need an evidence-based impact assessment, not reflexive scrapping — and a security function that destroys product on weak evidence will never be invited into a quality conversation again.`
        },
        {
          text: `Delete the malware files from the HMI right away so the line is clean`,
          quality: "ok",
          feedback: `Understandable hygiene instinct, but premature deletion destroys forensic evidence (hashes, timestamps, variant identification) and — on a validated system — IS itself an uncontrolled change to a controlled configuration. The files are inert (blocked, not executed); isolation contains the risk. Removal happens inside a change-controlled remediation with evidence preserved first.`
        },
        {
          text: `Have the contractor finish his work first since the malware was blocked anyway`,
          quality: "poor",
          feedback: `The contractor's equipment is the infection vector and its full scope is unknown — letting it keep touching production systems while you investigate is the one move guaranteed to widen the incident. The block on Line 3's HMI tells you nothing about what his laptop would do to a less-protected device. His workday is over; his USB drive's day in the lab is starting.`
        }
      ]
    },
    {
      prompt: `The quality director needs an answer: "Is the batch record affected? Do I need to open a deviation?" What do you tell her?`,
      choices: [
        {
          text: `"Evidence so far says no execution, so no data impact — but yes, open the deviation now: it documents the assessment either way, and the investigation rigor protects the batch disposition decision"`,
          quality: "best",
          feedback: `Exactly right on both counts. The technical evidence (allowlisting block, intact hashes on record files, normal PLC operation) supports batch integrity — but in a validated environment, an uncontrolled event touching a GxP system is deviation-worthy by definition, and the deviation file is what makes the "batch is fine" conclusion DEFENSIBLE to an auditor or FDA investigator later. Security evidence feeding a quality deviation is IT/OT/quality convergence done properly; offering it proactively makes quality your permanent ally.`
        },
        {
          text: `"This is a security matter, not a quality matter — no deviation needed"`,
          quality: "poor",
          feedback: `In FDA-regulated manufacturing there is no such boundary: an unauthorized binary on a validated system that generates batch records is squarely a quality event, whatever blocked it. Telling the quality director to stand down is both wrong on regulation and politically self-immolating — she owns the decision and outranks your opinion on it.`
        },
        {
          text: `"Scrap the batch to be safe — it's not worth the regulatory risk"`,
          quality: "poor",
          feedback: `Recommending $400K of destruction against the evidence isn't conservatism, it's an inability to do impact assessment — and it teaches the organization that involving security in quality events costs money for nothing. The regulatory system explicitly provides for investigate-and-disposition; use it.`
        },
        {
          text: `"Give me a week to complete forensics before any quality paperwork starts"`,
          quality: "ok",
          feedback: `The forensics will indeed take time, but delaying the deviation OPENING delays nothing useful and creates a documentation gap an auditor will read as concealment ("you knew Tuesday and documented Friday?"). Open the deviation immediately with facts-as-known; feed it findings as they land. Parallel, not serial — your CAPA experience already knows this rhythm.`
        }
      ]
    },
    {
      prompt: `Line 4's HMI shows the same malware files — but it has no application allowlisting (it was scheduled for the hardening rollout next quarter) and its AV logs show a process launch you can't account for. Now what?`,
      choices: [
        {
          text: `Escalate: treat Line 4 as compromised-until-proven-otherwise — isolate the HMI, verify the PLC program and recent setpoint history against baselines with engineering, image the HMI, and prepare its line for controlled HMI rebuild from the golden image`,
          quality: "best",
          feedback: `The unaccounted execution flips Line 4 into a different incident class: assume compromise and work the consequence question (did anything touch the process?). PLC program verification and setpoint history review answer the question quality will ask next. The golden-image rebuild — through change control with revalidation per your procedures — is the recovery path that the backup standard existed for. Note the program lesson writing itself: the hardened line shrugged the attack off; the unhardened one is now a multi-day remediation.`
        },
        {
          text: `Run a full AV scan on Line 4's HMI and trust the result`,
          quality: "poor",
          feedback: `The AV already failed once on this machine (the files arrived and something executed); asking it to now certify the system clean is asking the failed control to grade its own work. USB-borne ICS-aware malware families routinely disable or evade consumer AV. Disk imaging and offline analysis, integrity verification, and rebuild-from-known-good is the credible path.`
        },
        {
          text: `Rebuild both HMIs tonight outside change control — speed matters more than paperwork in an incident`,
          quality: "ok",
          feedback: `The rebuild instinct is right and speed has value, but on validated lines an out-of-control-process rebuild creates a SECOND quality event (uncontrolled change to a GxP system) layered on the first, potentially jeopardizing more product than the malware did. Your change control almost certainly has an expedited/emergency pathway — use it. Fast and controlled aren't opposites; that's what the emergency change procedure is for.`
        },
        {
          text: `Leave Line 4 running as-is until the scheduled hardening next quarter, but watch it closely`,
          quality: "poor",
          feedback: `"Monitor the known-compromised HMI for a quarter" is not a containment strategy — it's a decision to let an adversary process run on a validated line with a $400K-class batch cadence. The unexplained execution demands resolution now. Whatever the hardening schedule said last month, Line 4 just promoted itself to the front of it.`
        }
      ]
    },
    {
      prompt: `Incident closed: Line 3 batch dispositioned clean, Line 4 rebuilt and revalidated, contractor's company notified. Pick the corrective-action package you'll actually drive to completion.`,
      choices: [
        {
          text: `Transient-device program: scanning kiosk at the gate, plant-owned transfer media, contractor device policy in every service contract — plus pull the allowlisting rollout forward and report the Line3-vs-Line4 cost delta to leadership`,
          quality: "best",
          feedback: `Each element maps to a failure: ungoverned contractor media (kiosk + owned-media policy, the standard transient-device answer in 62443-2-1 territory and the post-Stuxnet hygiene baseline), the contract gap (procurement hook, same lesson as the vendor-access scenario), and the hardening schedule that left Line 4 naked (accelerate it). The cost-delta story — hardened line: one deviation and an afternoon; unhardened: multi-day rebuild and revalidation — is the most persuasive security ROI slide you will ever present, because it's YOUR data.`
        },
        {
          text: `Ban all USB devices site-wide, permanently, no exceptions`,
          quality: "ok",
          feedback: `Tempting and directionally right, but absolute bans without sanctioned alternatives fail in practice — plants need data moved (vibration data, PLC programs, vendor firmware), and a ban with no path breeds covert workarounds you'll never see. The kiosk-plus-owned-media model achieves the control with a usable path. Policy that survives contact with operations beats policy that sounds strong.`
        },
        {
          text: `Bill the contractor's company for the incident costs and move on`,
          quality: "poor",
          feedback: `Cost recovery is a legal/commercial question worth raising, but as the CENTERPIECE corrective action it fixes nothing: your gate still admits unscanned media, your contracts still don't require device hygiene, and Line 4-class machines are still soft. Recovery without prevention is an invitation for the sequel.`
        },
        {
          text: `Mandatory annual security-awareness training for all contractors`,
          quality: "poor",
          feedback: `Awareness training as the primary fix for a technical-control gap is the classic weak close-out — the contractor didn't lack awareness, he lacked a scanning kiosk and a policy with teeth. Training has a place in the package, but engineered controls (kiosk, owned media, allowlisting) do the actual work. Audit findings that close with "we trained people" tend to reopen.`
        }
      ]
    }
  ],
  debrief: `This scenario lives at the intersection you know better than almost any candidate: security incident response inside FDA change control. The doctrine: containment proportionate to evidence (blocked payload + local PLC control = keep producing while verifying); security evidence feeding the quality deviation rather than dodging it; assume-compromise the moment execution is unexplained; recovery through expedited change control, never around it; and corrective actions that are engineered controls with procurement hooks, not training theater. The strategic gold is the natural experiment — Line 3 hardened versus Line 4 not — which converts this incident into the budget argument for finishing the hardening rollout. USB/transient media has been a top OT infection vector since Stuxnet made it famous; every OT security program needs this playbook on the shelf.`
});

window.OTSEC.scenarios.push({
  id: "deepfake-cfo",
  title: "The Deepfake CFO and the Helpful Auditor",
  category: "leadership",
  module: "ai",
  context: `Two incidents land the same week. Monday: your plant controller (finance) receives a phone call — the CFO's voice, slightly hurried, referencing a real acquisition rumor — instructing her to expedite a $240K wire to a "new equipment vendor." She starts the process but a duplicate-invoice check flags it; the real CFO knew nothing. The voice was almost certainly AI-cloned from the CFO's earnings-call recordings. Thursday: a "compliance auditor" emails plant engineering, name-dropping your actual ERP vendor and citing a plausible audit reference number, requesting "current OT network topology diagrams and asset lists for the segmentation review." A helpful junior engineer has already replied with a five-year-old network diagram before anyone questions it. You own OT security; the CISO owns enterprise. Both threads are now yours to pull.`,
  steps: [
    {
      prompt: `Are these two events connected, and how do you treat them?`,
      choices: [
        {
          text: `Treat them as one campaign until proven otherwise: open a joint incident with the CISO, preserve both message trails, and task someone with finding what ELSE was attempted this week across mail, phone, and vendor portals`,
          quality: "best",
          feedback: `Two social-engineering hits in one week, both professionally tailored (acquisition rumor, real vendor name, plausible audit framing), targeting money AND network intelligence — that pattern says coordinated targeting, not coincidence. The "what else" sweep matters most: campaigns are volleys, and the attempts you haven't found yet (other engineers emailed, other executives called) define the real scope. Wrong-guessing "connected" costs you a joint investigation; wrong-guessing "coincidence" costs you the next, better-aimed attempt.`
        },
        {
          text: `Handle separately — the wire fraud is finance's problem, the diagram leak is yours`,
          quality: "ok",
          feedback: `The org chart does split them, and separate handling is how most companies would default — but that default is exactly what coordinated attackers exploit. Reconnaissance (network diagrams) plus financial pressure plus voice cloning of YOUR executives is the profile of a capable adversary studying the whole organization. At minimum, force the two investigations to share indicators and timeline. The unified view is cheap; the blind spot isn't.`
        },
        {
          text: `The wire was stopped and the diagram was old — log both and move on`,
          quality: "poor",
          feedback: `The wire was stopped by ONE control firing late in the chain (a duplicate-invoice check, not anything designed for this), and "old diagram" is cold comfort — five-year-old topology still reveals naming conventions, vendor choices, address schemes, and architecture patterns that probably persist. You've also learned an adversary considers your plant worth a multi-pronged effort. That's intelligence, and discarding it is the error.`
        },
        {
          text: `Immediately email the whole company about deepfake scams with both incidents as examples`,
          quality: "poor",
          feedback: `Mass disclosure mid-investigation tips the adversary that they're burned, contaminates the evidence trail with a thousand "I think I got one too!" reports before triage exists, and — naming the engineer's mistake company-wide — guarantees the next victim hides their mistake instead of reporting it. Awareness comms come after scoping, anonymized, with a clear report-don't-fear message.`
        }
      ]
    },
    {
      prompt: `The junior engineer who sent the diagram is in your office, visibly shaken, expecting to be fired. How do you handle the conversation?`,
      choices: [
        {
          text: `Thank him for coming forward fast, debrief exactly what was asked and sent (he's your best intelligence source), and make him the case study hero of the eventual awareness push — anonymized unless he volunteers`,
          quality: "best",
          feedback: `The reporting culture you build in this conversation is worth more than any tool you'll ever buy. He fell for a lure designed by professionals to be fallen for; his fast self-report is the behavior you need repeated across the plant. Debriefed properly, he can reconstruct the pretext's details (phrasing, timing, what they knew) that no log captures. Punish him and you've taught the whole site that the smart move is silence — which is how the NEXT diagram leak goes unreported for a month.`
        },
        {
          text: `Formal written warning — sending network documentation externally without verification has to have consequences`,
          quality: "poor",
          feedback: `Consequences for what, exactly? There was no policy requiring verification of document requests, no classification marking the diagram, no process he skipped — you're punishing the absence of YOUR program. The warning's real effect is one prompt reporter converted into a warning to others: handle your mistakes quietly. Fix the system; recruit the human.`
        },
        {
          text: `Reassure him briefly, but have HR handle the formal follow-up to keep it consistent`,
          quality: "ok",
          feedback: `Better than punishment, but routing it to HR formalizes what should be an intelligence debrief and a culture moment — HR's involvement signals "disciplinary matter" no matter how gently it's run, and you lose the direct conversation where the pretext details live. Keep it in the security lane: this was a successful attack on an unprotected process, and he's a witness, not a suspect.`
        },
        {
          text: `Quietly move him away from roles with access to sensitive documentation`,
          quality: "poor",
          feedback: `A stealth demotion reads loud and clear to everyone watching, and it selects for exactly the wrong trait — he's now the most phishing-aware engineer on your staff, the one person guaranteed to verify the next odd request. Social engineering victims who report fast are assets; the dangerous people are the confident ones who'd never admit it happened.`
        }
      ]
    },
    {
      prompt: `Scoping reveals the campaign hit three more employees (all reported or ignored it). The CEO, rattled by the CFO voice clone, asks: "How do we make sure AI fakes never fool us again?" What's your honest program answer?`,
      choices: [
        {
          text: `"We can't make detection reliable — voices and video will keep getting better. We make verification cheap and mandatory instead: out-of-band callback rules for money and access, dual control on wires, data-request authentication — controls that don't care how good the fake is"`,
          quality: "best",
          feedback: `The architecturally honest answer: synthetic media quality is improving faster than human (or automated) detection, so any program premised on "spotting fakes" decays continuously. Process controls are fake-agnostic — a callback to a known number defeats a perfect voice clone, dual authorization defeats a perfect pretext. This mirrors OT thinking you already use: don't rely on detecting the bad command, engineer the system so one bad command can't cause the consequence. The CEO gets durable controls instead of a subscription to an arms race.`
        },
        {
          text: `"We'll deploy AI-based deepfake detection on email and phone systems"`,
          quality: "poor",
          feedback: `Detection tooling for synthetic media exists but loses the arms race structurally — you'd be promising the CEO a control whose effectiveness degrades every quarter as generation models improve, against an adversary who tests against public detectors before calling. Worse, the promise itself creates false confidence that erodes the verification discipline that actually works. Fine as a layer; fraudulent as the answer.`
        },
        {
          text: `"Quarterly deepfake awareness training for everyone who handles money or sensitive data"`,
          quality: "ok",
          feedback: `Worth doing — people who know voice cloning exists pause more readily — but training alone asks humans to win a perception contest against tools engineered to defeat perception, under time pressure, on a bad phone line. The plant controller already proved the point: she's experienced and careful, and the voice still got her moving. Training supports the verification procedures; it can't substitute for them.`
        },
        {
          text: `"Restrict the CFO's public audio exposure — fewer earnings calls and recorded appearances"`,
          quality: "poor",
          feedback: `Seconds of audio now suffice for a usable clone, public-company executives legally must speak publicly (earnings calls aren't optional), and the adversary needs only one sample ever published. This control is unachievable, irrelevant at current cloning thresholds, and asks the business to harm itself for no risk reduction. It also misses that the next clone might be the plant manager, whose voice is in every all-hands recording.`
        }
      ]
    },
    {
      prompt: `Final piece: the leaked (old) network diagram. Anything actually worth doing about it?`,
      choices: [
        {
          text: `Yes — assess what it still reveals (persistent naming, addressing, vendor patterns), brief detection teams to watch for its use, fold "adversary may hold topology intel" into your threat model, and fix document handling: classification, channel rules, and a verification procedure for external data requests`,
          quality: "best",
          feedback: `Right weight on both halves. The intel half: old diagrams age well for attackers — address schemes and architecture conventions rarely change wholesale, so your monitoring team should treat reconnaissance touching those specific subnets as elevated signal. The prevention half: the engineer had no policy to follow because none existed — classification markings, approved transmission channels, and a callback-verification rule for any external request for security-relevant documents close the actual gap. Note this is governance work, not tooling work.`
        },
        {
          text: `Re-architect the network so the leaked diagram becomes obsolete`,
          quality: "poor",
          feedback: `Re-IP-ing and re-architecting a production plant to invalidate one stale document is a multi-month, outage-laden project aimed at the wrong target — the adversary's advantage was mostly conventions and structure, which survive renumbering, and your segmentation roadmap should be driven by risk assessment, not by document-leak embarrassment. If the architecture needed changing, it needed changing before the leak.`
        },
        {
          text: `Nothing — it was five years old and the network has changed since`,
          quality: "ok",
          feedback: `Tempting, and the staleness genuinely reduces the leak's value — but "changed since" usually means devices were added, not that addressing schemes, naming conventions, firewall vendors, or zone structure rotated. More importantly, doing nothing leaves the process gap open: the next request hits an engineer with the CURRENT diagram and the same absent policy. The cheap fix is the document-handling procedure, leak or no leak.`
        },
        {
          text: `Have legal send the requester a cease-and-desist and report the email address to the FBI`,
          quality: "poor",
          feedback: `A cease-and-desist to a disposable pretext mailbox is theater — the address was burned the moment the campaign ended. Law-enforcement reporting (IC3, your FBI field office, CISA) IS worth doing as part of the incident close-out, but as the COMPLETE response it does nothing about your exposed process gap or the intelligence now in adversary hands. Report and also fix.`
        }
      ]
    }
  ],
  debrief: `AI-enabled social engineering is the threat vector where 2026 looks most different from 2020: voice cloning is commodity, pretexts are researched at machine speed, and campaigns hit finance and engineering in the same week — as real cases (the Arup deepfake fraud among them) demonstrated. The doctrine: treat clustered social engineering as one campaign and sweep for the unreported volleys; protect reporters fiercely because reporting culture is your real detection layer; answer "stop the fakes" with fake-agnostic process controls (out-of-band verification, dual control) rather than a detection arms race; and treat leaked technical documentation as live adversary intelligence plus a governance gap. The transferable insight for interviews: the engineering mindset — make the system safe against the bad input rather than trying to catch every bad input — is exactly how to lead on AI-era social engineering.`
});

window.OTSEC.scenarios.push({
  id: "it-ot-merger",
  title: "IT Absorbs OT — Managing the Merger",
  category: "leadership",
  module: "leadership",
  context: `The new CIO announces at the quarterly leadership meeting: effective in 90 days, all plant network infrastructure — switches, firewalls, wireless, the works — moves under corporate IT's network team, "to standardize, cut cost, and close audit findings." The OT networks at your three plants were built and are maintained by controls engineers; they are admittedly inconsistent, partially undocumented, and running gear IT considers ancient. Two plant managers have already called the COO demanding an exemption; one controls engineer half-jokingly mentioned setting switch passwords IT won't have. The CIO's deputy asks you — the person with credibility in both camps — to "make this landing smooth." You suspect the decision itself isn't reversible, but its execution is very much unwritten.`,
  steps: [
    {
      prompt: `What's your opening position?`,
      choices: [
        {
          text: `Accept the consolidation direction, but make your support conditional on an OT-specific operating model: change windows, OT-trained staff, plant veto on outage timing, and a phased migration starting with the least critical site`,
          quality: "best",
          feedback: `Reading the politics correctly: a CIO's flagship initiative announced at leadership level won't reverse, so spending capital fighting WHETHER wastes what you need for HOW. The conditions you've named are where every real risk lives — IT default change behavior (patch and reboot at will) applied to control networks is the actual disaster scenario, not the org chart. Being the person who made it work also positions you as the obvious leader for the converged OT security function the merger implies.`
        },
        {
          text: `Back the plant managers' exemption campaign — OT networks under IT is fundamentally unsafe`,
          quality: "poor",
          feedback: `"Fundamentally unsafe" is wrong on the merits (plenty of mature companies run converged network teams safely, WITH the right operating model) and joining a rebellion against an announced executive decision marks you as a faction leader rather than an enterprise leader, in front of the CIO whose budget and partnership your security program needs. The plant managers' concerns are valid inputs for the operating model — channel them there.`
        },
        {
          text: `Stay neutral — facilitate meetings between IT and the plants but take no position`,
          quality: "ok",
          feedback: `Neutrality keeps you safe and wastes you. You were asked to make the landing smooth precisely because you hold technical judgment both sides trust — withholding that judgment means the operating model gets written by whoever talks loudest, which will be corporate IT by default. A facilitator with no position gets a seat; an honest broker with a documented position gets the pen.`
        },
        {
          text: `Quietly support the engineers' password-withholding idea as leverage for better terms`,
          quality: "poor",
          feedback: `Sabotage-as-negotiation destroys you twice: when it works it confirms IT's worst caricature of plant engineering and invites a forced, hostile takeover with zero accommodations; when it's discovered (it will be — config audits are step one of any migration) the people you encouraged take the fall. Also worth saying plainly: deliberately withholding infrastructure credentials from your employer is a firing offense you'd be co-signing.`
        }
      ]
    },
    {
      prompt: `You get a seat designing the operating model. Which single provision do you fight hardest for?`,
      choices: [
        {
          text: `Change management authority: no modification to OT network infrastructure outside plant-approved windows, with documented rollback and a plant-side approval gate — written into the RACI, not a handshake`,
          quality: "best",
          feedback: `This is the provision that prevents the catastrophe scenario, because the way IT-run OT networks actually cause outages is routine: an automated IOS update, a VLAN cleanup, a spanning-tree change at 2 PM on a production day. Everything else (staffing, tooling, inventory) is recoverable if change authority is nailed down; nothing else matters if it isn't. Anchor it to precedent IT already accepts — they don't patch the trading floor mid-session either — and to 62443's zone/conduit change discipline so it reads as standard, not special pleading.`
        },
        {
          text: `Headcount: the controls engineers who built these networks must transfer into the IT network team`,
          quality: "ok",
          feedback: `Valuable — embedded OT-fluent staff inside the IT team is a genuinely good pattern, and you should propose it — but as your TOP fight it's the wrong hill: people decisions get renegotiated every reorg, and the engineers may not want to move. Process authority outlives personnel. Get the change-management gate in writing first; staff the team second.`
        },
        {
          text: `Budget: plant cost centers must keep paying for their own network gear so plants retain leverage`,
          quality: "poor",
          feedback: `Funding-as-leverage institutionalizes the IT/OT fight you're supposed to be ending — every refresh becomes a hostage negotiation, and shared-services consolidation almost always centralizes budget anyway (it's half the CIO's stated rationale). You'd spend your one hard fight on an accounting structure that doesn't protect a single production hour.`
        },
        {
          text: `Tooling: IT must adopt the network monitoring platform the plants already use`,
          quality: "poor",
          feedback: `A tooling mandate is the most negotiable, least durable provision available — platforms get swapped at renewal time regardless of what the operating model said, and IT teams forced onto unfamiliar tools work around them. Specify the OUTCOMES (OT protocol visibility, change detection on control-network gear) and let the platform fight happen on its own merits later.`
        }
      ]
    },
    {
      prompt: `Migration of Plant 1 (your pilot, the least critical site) goes well — until week 6, when an IT engineer following the standard hardening checklist enables 802.1X port authentication on a cell switch and knocks a packaging line's devices off the network for 3 hours. The plants' "we told you so" chorus is instant. How do you play it?`,
      choices: [
        {
          text: `Run it as a blameless post-incident review in front of both camps: the checklist lacked an OT exception path and the change skipped the agreed window — fix the checklist, tighten the gate, publish the lessons, and keep the migration on schedule`,
          quality: "best",
          feedback: `This incident is your operating model's first real test, and the verdict you want is "the process catches and corrects" — not "the merger was a mistake." Blameless review keeps the IT engineer (who followed his own org's standard checklist in good faith) from becoming a scapegoat, the root-cause findings validate exactly the change-gate you fought for, and continuing the schedule denies the rejectionists their stall. One 3-hour outage on the least critical site IS the pilot working: that's why you sequenced it this way, and saying so out loud is leadership.`
        },
        {
          text: `Pause the migration program indefinitely until IT demonstrates OT competence`,
          quality: "poor",
          feedback: `An indefinite pause converts a contained, instructive failure into a political defeat for the program you committed to land — the CIO reads it as you switching sides, the plants read it as victory through resistance, and "demonstrates competence" has no finish line. The failure mode was specific and fixable; fix it specifically. Pausing everything because one checklist lacked one exception is the overreaction that kills convergence programs.`
        },
        {
          text: `Insist the IT engineer be removed from the OT migration team as accountability`,
          quality: "poor",
          feedback: `He followed his organization's standard checklist — the gap was in the checklist and the skipped change window, both process failures the post-incident review should own. Demanding a head delivers the message that touching OT ends IT careers, which guarantees the remaining IT staff approach plant work with cover-your-tracks caution or avoid it entirely. You need IT engineers who WANT plant fluency; don't execute the first volunteer.`
        },
        {
          text: `Downplay it publicly — 3 hours on a packaging line is minor, and dwelling on it feeds the resistance`,
          quality: "ok",
          feedback: `The instinct to deny the rejectionists ammunition is sound, but suppression costs more than it saves: the plants already know, minimizing reads as IT-camp spin from the one person both sides trusted, and you forfeit the chance to demonstrate the governance working in daylight. The stronger play is the opposite — examine it loudly and well. Transparent competence beats quiet damage control in a trust-building phase.`
        }
      ]
    },
    {
      prompt: `A year in, the converged model is stable. The CIO, citing the success, now proposes folding OT SECURITY (your function) into the enterprise SOC and security organization wholesale. Your move?`,
      choices: [
        {
          text: `Negotiate the hybrid: monitoring and tooling integrate with the enterprise SOC, but OT risk decisions, plant relationships, and incident command authority for production systems stay with an OT-native security lead — and make the case that this role is yours`,
          quality: "best",
          feedback: `The same logic you applied to the network merger applies to your own function: integration where scale helps (24/7 eyes, shared intel, tooling budgets), preserved authority where domain judgment is irreplaceable (what can be isolated mid-batch, when a line stops, which plant promises are keepable). This hybrid is also where the industry has actually been drifting — CISO-aligned OT security with OT-native leadership embedded. Arguing structure-from-principle rather than turf-from-fear is what distinguishes the director the CIO promotes from the manager the CIO absorbs.`
        },
        {
          text: `Resist absorption entirely — OT security must remain independent under engineering`,
          quality: "ok",
          feedback: `There's a defensible version of this position (operational credibility, the grade-your-own-homework counterargument cuts both ways), but after a year of successful convergence, absolute resistance reads as turf defense — and structurally, isolation from the enterprise SOC's intel, tooling, and after-hours coverage genuinely weakens OT detection. The pure-independence model is increasingly the minority pattern. If you hold this line, hold it with the hybrid as your fallback, not as a refusal.`
        },
        {
          text: `Accept wholesale absorption — resisting after championing convergence would be hypocritical`,
          quality: "poor",
          feedback: `False consistency. You championed converged INFRASTRUCTURE with domain safeguards — the safeguards were the point, and wholesale absorption of OT security removes exactly the safeguard layer (OT-native judgment with authority) that made the first merger safe. An enterprise SOC running plant incident response by IT playbook is the patch-Tuesday scenario with higher stakes. Champion the same principle both times: integrate capability, preserve domain authority.`
        },
        {
          text: `Use the moment to demand a CISO-peer title and direct board access as your price`,
          quality: "poor",
          feedback: `Opening with personal elevation converts an organizational design question into a compensation negotiation, and CIOs remember who did that. The title question is real (OT security leadership DOES need standing and escalation paths) but it's the outcome of winning the structural argument, not the opening bid. Design the right model first; the role that model requires tends to find its level — and its occupant.`
        }
      ]
    }
  ],
  debrief: `IT/OT convergence politics in full: the meta-lesson is that organizational mergers, like network mergers, succeed or fail on operating models rather than org charts. The recurring moves: don't fight irreversible decisions, fight for their execution terms; spend your hardest negotiation on change-management authority because routine IT behavior (not malice) is what breaks plants; sequence pilots so failures are cheap and instructive, then examine failures loudly and blamelessly; and when your own function faces absorption, apply your own principle — integrate capability, preserve domain authority. Interviewers probing "how would you handle IT/OT conflict" are really asking whether you'll be a faction leader or an enterprise leader; this scenario is the rehearsal for answering as the latter while protecting what actually matters.`
});

window.OTSEC.scenarios.push({
  id: "volt-typhoon-advisory",
  title: "The Volt Typhoon Question",
  category: "technical",
  module: "threats",
  context: `CISA publishes an advisory: Volt Typhoon-style activity confirmed at several manufacturers in your sector — living-off-the-land techniques, no malware, persistence via valid accounts and edge network devices (VPN concentrators, firewalls, routers), with assessed intent to pre-position for future disruption rather than immediate impact. Your CEO forwards it with one line: "Are we exposed? Need an answer for the board Friday." It's Tuesday. You have a competent but small team, decent OT network monitoring at two of three plants, an enterprise SIEM run by IT, and a known pile of aging edge devices including two VPN appliances past end-of-support. The honest answer today is "we don't fully know" — your job this week is to shrink that uncertainty and report it credibly.`,
  steps: [
    {
      prompt: `How do you structure the week's assessment?`,
      choices: [
        {
          text: `Scope to the advisory's TTPs: audit edge devices (versions, known CVEs, config changes, admin account inventory), hunt the SIEM and OT monitoring for LOTL patterns (anomalous valid-account use, unusual admin tool activity), and map which findings you can and can't see with current coverage`,
          quality: "best",
          feedback: `Threat-informed assessment: the advisory hands you the adversary's playbook (ATT&CK-mapped TTPs — valid accounts, edge device persistence, LOTL execution), so you hunt those specifics rather than boiling the ocean. The coverage-mapping piece is what makes Friday's answer honest — "here's what we checked and found, here's what we structurally cannot see yet" is a credible posture; "we scanned and found nothing" without coverage caveats is false assurance. One week is enough for exactly this scope.`
        },
        {
          text: `Commission an emergency full penetration test of all three plants`,
          quality: "poor",
          feedback: `Wrong tool, wrong timeline: a pentest answers "can someone get in?" while the advisory asks "is someone already here?" — those are different investigations (offense simulation vs. compromise assessment/hunt). No credible firm scopes and executes a three-site engagement in four days anyway, and an emergency-priced pentest burns budget the follow-up remediations will need. If you bring in outside help this week, it's a compromise-assessment team, not a red team.`
        },
        {
          text: `Run vulnerability scans everywhere and report the patch status of all systems`,
          quality: "ok",
          feedback: `Patch posture on edge devices IS relevant (initial access in these campaigns often exploits exactly those CVEs), so a slice of this belongs in the week. But Volt Typhoon's signature is operating WITHOUT malware or new exploits once inside — valid credentials and built-in admin tools — so a clean vulnerability scan says little about presence. Scans answer "how hard to get in"; the CEO asked "are they in." Don't confuse exposure with compromise.`
        },
        {
          text: `Reply that with no malware to scan for, this actor is effectively undetectable, and recommend accepting the risk`,
          quality: "poor",
          feedback: `LOTL is harder to detect, not undetectable — that's the entire point of behavioral hunting: valid accounts logging in from wrong places at wrong times, edge devices with config changes outside change windows, admin tools running where admins don't work. Declaring defeat before looking is both technically wrong and politically fatal; "undetectable, accept it" is the answer that gets a new OT security manager hired.`
        }
      ]
    },
    {
      prompt: `Wednesday's findings: the two end-of-support VPN appliances are running firmware with publicly exploited CVEs, and one shows three admin logins over the past quarter from a service account nobody on the team recognizes, at hours with no change tickets. What's the immediate handling?`,
      choices: [
        {
          text: `Treat the unexplained admin access as a potential active compromise: preserve the appliance configs and logs, disable the mystery account, monitor for re-entry attempts, expedite replacement of both appliances, and bring in IR support to assess depth`,
          quality: "best",
          feedback: `Unrecognized admin access on an exploitable edge device, matching the advisory's exact pattern, gets assumed hostile until disproven — the alternative assumption costs too much when wrong. Evidence preservation before remediation matters because edge devices are where this actor lives, and wiping the appliance during a panicked replacement destroys your only record of what they did. The IR depth-assessment question is the critical one: edge access is a foothold; what you actually fear is what it reached.`
        },
        {
          text: `Replace both appliances this weekend and consider the matter closed`,
          quality: "ok",
          feedback: `The replacement urgency is right, but rip-and-replace as the COMPLETE response has two holes: the appliance evidence (what did that account do, when, from where?) gets destroyed uninvestigated, and if the access was real, the actor likely established persistence BEYOND the appliance — credentials harvested, accounts created downstream — that survives the hardware swap. Swap the hardware AND run the investigation; pre-positioning actors plan for exactly the defender who fixes the door without checking the house.`
        },
        {
          text: `The service account is probably a forgotten vendor or IT artifact — ask around informally before escalating`,
          quality: "poor",
          feedback: `It may well be a forgotten artifact — most mystery accounts are — but "ask around informally" leaves a possibly-live adversary credential active on an exploitable edge device for however long the asking takes, with no evidence preserved meanwhile. The cost asymmetry rules: disabling a forgotten legit account inconveniences someone into filing a ticket (which itself answers the question); leaving a hostile one active during your slow inquiry is the scenario the advisory warned about.`
        },
        {
          text: `Block all VPN access company-wide until the investigation completes`,
          quality: "poor",
          feedback: `Cutting every remote worker, vendor, and site-to-site link to chase three suspect logins on one appliance is a self-inflicted denial of service — and operations will force it back open within a day, with your judgment as the casualty. Worse, a sudden total cutoff tips any actual adversary that they're discovered. Scoped containment (the account, the device, heightened monitoring) achieves the security outcome without making the response the incident.`
        }
      ]
    },
    {
      prompt: `Friday. Forensics are preliminary: the account's logins came from a residential ISP address, depth of access still under investigation, no impact to production so far. What do you tell the CEO and board?`,
      choices: [
        {
          text: `Calibrated truth: "We found indicators consistent with the advisory on one edge device — investigation ongoing with external IR support. Production is unaffected; containment is in place. Here's what we know, don't know, are doing, and need." Plus the materiality heads-up to legal`,
          quality: "best",
          feedback: `Exactly the structure boards need in ambiguity: facts/unknowns/actions/asks, no premature conclusions in either direction. The legal heads-up is the easily-missed move — a possible state-actor presence at a public company starts the SEC materiality-assessment conversation NOW, not after forensics finish, and boards increasingly know to ask. Delivering unwelcome preliminary findings calmly, with containment already in place and a resourced plan, is the single most career-defining performance an OT security leader gives.`
        },
        {
          text: `"We're likely compromised by Chinese state actors" — maximum urgency gets maximum resources`,
          quality: "poor",
          feedback: `The evidence says "indicators consistent with"; attribution to a state actor is an intelligence-community-grade conclusion you don't have. Overclaiming triggers disproportionate responses (panicked disclosure, premature customer notification, possible trading implications) that can't be walked back when forensics come home ambiguous — and your calibration is permanently discounted afterward. The advisory's seriousness argues for precision, not volume.`
        },
        {
          text: `"Nothing confirmed yet — let me finish the investigation before briefing the board"`,
          quality: "poor",
          feedback: `Declining the Friday answer the CEO explicitly requested, while sitting on preliminary findings of unexplained edge-device access matching a CISA advisory, is the move that ends in "what did you know and when" — investigations take weeks, the board meets Friday, and silence reads as either concealment or paralysis. Boards handle uncertainty fine when it's structured; what they don't forgive is learning later that management had findings and chose quiet.`
        },
        {
          text: `"We found an old misconfigured account and cleaned it up — no board action needed"`,
          quality: "ok",
          feedback: `This stays within the technical facts and avoids alarm — but it buries the lede: the finding matches an active national advisory, forensics are incomplete, and the "cleanup" framing forecloses the materiality assessment and resource conversation the situation may require. If depth-of-access findings worsen next month, this Friday's reassurance becomes Exhibit A. Under-claiming is safer than over-claiming, but calibrated truth beats both.`
        }
      ]
    },
    {
      prompt: `The investigation concludes: access confirmed but apparently shallow — appliance-level only, no lateral movement found (with moderate confidence, given log gaps at the unmonitored third plant). What's the lasting program change you drive?`,
      choices: [
        {
          text: `Close the structural gaps the incident exposed: monitoring coverage for the third plant, edge-device lifecycle management (no more end-of-support appliances facing the internet), centralized logging with retention to support future hunts, and a recurring LOTL hunt cadence — packaged as the board follow-up with the incident as evidence`,
          quality: "best",
          feedback: `Each item maps to a wall you hit during the week: the third plant was unhuntable (coverage), the appliances were unpatchable (lifecycle), the log gaps capped your confidence (retention), and the whole exercise was improvised (cadence). Pre-positioning campaigns are recurring weather, not one storms — CISA has been explicit that this actor class returns. The board just watched you handle ambiguity well; the follow-up ask while their attention holds is the budget moment of the year. "Moderate confidence" should appear in the proposal verbatim — it's the honest phrase that funds log retention.`
        },
        {
          text: `Subscribe to premium threat intelligence so you get earlier warning of campaigns like this`,
          quality: "ok",
          feedback: `Earlier and richer intel has value — Dragos/sector-ISAC feeds would have given you TTPs and context days before the public advisory — but intel was not this week's constraint: the free CISA advisory told you exactly what to hunt, and you still couldn't hunt it at plant three. Intelligence multiplies a hunting capability; it doesn't substitute for one. Fund the eyes first, then the early warning.`
        },
        {
          text: `Declare victory — the investigation found only shallow access, validating current defenses`,
          quality: "poor",
          feedback: `The investigation found shallow access WITH MODERATE CONFIDENCE AND ACKNOWLEDGED LOG GAPS — "we couldn't fully see, and what we saw was contained" is survival, not validation. Worse, the access happened at all because end-of-support appliances sat internet-facing for years. Declaring victory converts your hard-won credibility into complacency, and forfeits the corrective-action window the incident opened.`
        },
        {
          text: `Mandate quarterly password rotation for all accounts as the key lesson`,
          quality: "poor",
          feedback: `Rotation theater: the suspect account wasn't cracked on a schedule that rotation would beat — it was either harvested or pre-existing, and the actor class adapts to rotation trivially while your plant staff drowns in expiring credentials (NIST guidance moved away from forced periodic rotation years ago for exactly this reason). The credential lessons that matter here are inventory (nobody recognized the account), MFA on edge-device admin, and logging that would have caught the logins in week one, not quarter three.`
        }
      ]
    }
  ],
  debrief: `The pre-positioning threat inverts traditional incident response: no malware, no impact, no ransom note — just an adversary quietly holding access for a future decision you don't control. The doctrine this drill rehearses: hunt the advisory's specific TTPs and map your coverage gaps honestly; treat unexplained admin access on edge devices as hostile until disproven, preserving evidence before remediating; brief executives in the facts/unknowns/actions/asks structure with the materiality conversation started early; and convert the incident into structural fixes (coverage, edge lifecycle, log retention, hunt cadence) while board attention holds. Volt Typhoon-class campaigns made "assume breach, hunt behaviors" the operating posture for critical manufacturing — and made the ability to say "moderate confidence" out loud a leadership credential.`
});

window.OTSEC.scenarios.push({
  id: "ai-copilot-procurement",
  title: "The AI-Powered Platform Demo",
  category: "leadership",
  module: "ai",
  context: `Your team wants an OT detection platform, and the front-runner's demo dazzled: an "AI-driven analyst copilot" that triages alerts in natural language, "self-learning anomaly detection" that claims to eliminate baseline tuning, and "predictive threat identification." Your senior analyst is sold. The vendor offers a 20% discount to sign by quarter-end, and their AE mentions your competitor is already a customer. The platform's core (passive OT protocol monitoring, asset inventory) genuinely fits your roadmap need — the question is how much the AI layer is worth and whether the claims survive contact with reality. You have budget for this purchase but it competes with the segmentation work also on your roadmap. The board approved "AI-forward security" in last year's strategy, so there's top-down enthusiasm too.`,
  steps: [
    {
      prompt: `How do you respond to the demo enthusiasm and the quarter-end discount?`,
      choices: [
        {
          text: `Separate the decision layers: evaluate the core platform (monitoring, inventory) on your existing requirements, and subject the AI claims to a structured POC in YOUR environment — the discount deadline doesn't move your process`,
          quality: "best",
          feedback: `Demo-floor AI performs on curated data; the only evidence that matters is performance on your traffic, your alerts, your analysts. Splitting core value from AI garnish also prevents the classic procurement error — paying a premium for features that influence the decision but not the outcome. Quarter-end discounts regenerate (every vendor finds budget flexibility for a serious buyer at THEIR quarter-end too); evaluation rigor doesn't. "We buy on evidence" is also the precedent your team needs to see set the first time AI-washing walks in the door.`
        },
        {
          text: `Take the discount — the core platform fits the roadmap, and the AI features are a bonus either way`,
          quality: "ok",
          feedback: `There's a defensible kernel here: IF the core platform independently justifies the price, AI-as-free-garnish is harmless. But unvalidated purchases of "self-learning, no tuning needed" claims have a pattern: deployment assumptions get built on marketing promises (lean staffing because "the AI triages"), and when the claims deflate, the gap lands on your analysts. You're also skipping the leverage moment — POC findings are how you negotiate price and contractual performance commitments. The discount math rarely beats the POC math.`
        },
        {
          text: `Reject it — "AI-powered" claims in security are marketing noise, buy a traditional platform instead`,
          quality: "poor",
          feedback: `Reflexive AI-skepticism is the same epistemic error as reflexive AI-enthusiasm: some of these capabilities are real and useful (ML anomaly detection on deterministic OT traffic genuinely works; LLM triage assistance measurably speeds analysts in credible studies). Dismissing without testing forfeits real capability, contradicts the board's stated strategy without evidence in hand, and tells your team their technical enthusiasm gets vetoed by ideology. Test, don't presume — in either direction.`
        },
        {
          text: `Let the senior analyst make the call — he's closest to the tooling and he's convinced`,
          quality: "poor",
          feedback: `His conviction is data, but delegating a six-figure platform decision to the person most captivated by the demo skips the function you're paid for: he evaluated what the tool does in an hour of vendor-driven demo; the leadership questions (claims validation, total cost including tuning labor, data governance, roadmap tradeoff against segmentation) haven't been asked yet. Involve him deeply — running the POC, owning the test plan — but the decision framework is yours to set.`
        }
      ]
    },
    {
      prompt: `Designing the POC: what's the test plan that actually validates "AI-driven detection and triage"?`,
      choices: [
        {
          text: `30-60 days on your real traffic at one plant: measure detection against known-answer tests (replayed attack traffic, red-team activity, simulated misconfigurations), count false positives per analyst-hour at YOUR baseline, and have analysts grade copilot triage output against ground truth they establish`,
          quality: "best",
          feedback: `Each element kills a specific bluff: known-answer tests measure detection rather than demo theater ("self-learning" systems that can't catch a replayed Modbus write-to-wrong-register aren't learning much); FP-per-analyst-hour converts "reduces noise" into a number you can hold them to contractually; and grading copilot summaries against analyst-established ground truth catches the LLM failure mode that matters — confident, fluent, wrong. Insist the vendor NOT have remote tuning access during the test window; you're evaluating the product, not their sales engineers' overnight adjustments.`
        },
        {
          text: `Run it alongside the incumbent tools for two weeks and see which one the analysts prefer`,
          quality: "ok",
          feedback: `Analyst preference matters (tools nobody likes go unused) and side-by-side is a reasonable structure, but two weeks is too short for anomaly-detection baselines to stabilize on plant traffic (you know the production cycle: weekly changeovers, monthly maintenance — the model hasn't seen a full rhythm), and "preference" without known-answer ground truth measures UI charm, not detection. The copilot's fluency will win the popularity contest regardless of its accuracy. Extend the window and add the objective layer.`
        },
        {
          text: `Ask the vendor for their accuracy benchmarks, customer references, and third-party test results instead of running your own POC`,
          quality: "poor",
          feedback: `Vendor benchmarks are run on data chosen to flatter; references are customers chosen for satisfaction; and third-party AI-detection testing in OT is too immature to lean on. None of it answers the only question that prices the AI premium: performance on YOUR protocols, YOUR network weirdness, YOUR alert volume. Paper diligence is the procurement equivalent of accepting the FAT report without witnessing the FAT — you already know how that goes.`
        },
        {
          text: `Have the vendor run the POC on their cloud with a sample of your exported traffic data`,
          quality: "poor",
          feedback: `You'd be shipping OT network captures — device inventories, protocol patterns, addressing, the reconnaissance package an adversary dreams of — to a third-party cloud before any contract, DPA, or security review exists, to be processed in a vendor-controlled environment where the results are unauditable anyway. This fails your own data-governance standards AND produces evidence you can't trust. If the platform can't POC on-prem or in your enclave, that itself is a finding about the product's deployment model.`
        }
      ]
    },
    {
      prompt: `POC results: core monitoring is solid — best-in-class protocol coverage, asset inventory found 40 devices you didn't know about. The AI layer is mixed: anomaly detection caught 7 of 9 known-answer tests but generated significant false positives during a product changeover; the copilot's summaries were genuinely useful for routine alerts but confidently misattributed two OT protocol events. The "predictive threat identification" produced nothing evaluable. Decision time — and the vendor wants an answer.`,
      choices: [
        {
          text: `Buy the core platform; pay for the AI layer only at a price reflecting measured performance, with contractual FP-rate commitments and copilot-output disclaimers in your SOC procedures; decline to pay anything for "predictive" — and document the changeover-FP and misattribution findings as known limitations in your operating procedures`,
          quality: "best",
          feedback: `Evidence-shaped purchasing: the inventory finding alone (40 unknown devices) likely justifies the core platform — that's your asset-visibility roadmap item delivering early. The AI pricing move uses your POC data as negotiating leverage, converts marketing claims into contract terms (FP commitments with remedies), and the procedural disclaimers institutionalize the right analyst posture: copilot as drafting assistant, never as authority on OT protocol interpretation. Paying zero for unevaluable "predictive" features sets the precedent that claims without evidence have a price of zero.`
        },
        {
          text: `The misattributions are disqualifying — an AI that's confidently wrong about OT protocols is dangerous; walk away entirely`,
          quality: "ok",
          feedback: `The instinct deserves respect — confident misattribution IS the dangerous LLM failure mode, and in a less mature team it could propagate into bad response decisions. But walking away from a best-in-core platform over a flawed optional layer throws out the measured win (the monitoring and the 40 devices) to punish the garnish. The proportionate response is procedural containment of the AI layer (human verification on protocol-level claims) or buying core-only. Perfect-or-nothing standards leave you with nothing, and your analysts with no visibility.`
        },
        {
          text: `Buy the full bundle as demoed — 7 of 9 is strong, and the issues will improve with vendor updates`,
          quality: "poor",
          feedback: `"It will improve with updates" is hope priced as fact — you'd pay today's premium for tomorrow's promised performance with no contractual mechanism when it doesn't arrive. The changeover false-positive flood is not a footnote: changeovers are when your plant is busiest and alert fatigue costs most, and 7-of-9 means two known attack patterns sailed through. Buying the bundle as-is also teaches this vendor (and the market — AEs talk) that your POCs are theater. The evidence earned you leverage; spend it.`
        },
        {
          text: `Delay the decision a year — the AI capabilities are too immature across the whole market`,
          quality: "poor",
          feedback: `The POC showed the CORE capability is mature and immediately valuable — the asset inventory found 40 unknown devices in 60 days, which means your current visibility gap is measurable and live. Deferring everything because the optional AI layer is uneven leaves that gap open for a year to avoid a pricing negotiation you've already won. Market immaturity in one feature tier is an argument for buying carefully, not for not buying. Visibility now, AI features as they prove out.`
        }
      ]
    },
    {
      prompt: `Post-purchase, the CEO mentions the board wants a slide on "our AI-forward security strategy" featuring the new platform. What do you give them?`,
      choices: [
        {
          text: `An honest capability framing: AI where it measurably helps today (triage drafting, anomaly detection with stated FP costs, the asset-discovery win), human authority retained on OT response decisions, governance rules for AI tools near production — and the evaluation methodology itself as the strategy`,
          quality: "best",
          feedback: `This slide does double duty: it satisfies the board's AI-forward appetite with real substance (the 40-device discovery is a concrete AI-era win they'll remember) while installing the governance frame — measured adoption, human-in-the-loop for OT decisions, claims-testing as standing policy — that protects you when the next vendor demo dazzles someone above you. Making the EVALUATION METHODOLOGY the centerpiece is the senior move: "we have a process that converts AI hype into priced, governed capability" is a strategy; a tool logo on a slide is not.`
        },
        {
          text: `Showcase the platform's full AI feature list as deployed strategy — the board wants wins, give them wins`,
          quality: "poor",
          feedback: `You'd be presenting the vendor's marketing deck as your strategy — including the predictive features you declined to pay for and the copilot limitations your own procedures now disclaim. Boards repeat what they're told: this version becomes "we have AI threat prediction" in next year's investor materials, and the gap between the slide and the SOC's reality becomes your personal liability when an incident exposes it. The board deserves the version that survives an incident post-mortem.`
        },
        {
          text: `Push back on the framing — tell the CEO that AI-forward is the wrong strategy for OT security`,
          quality: "ok",
          feedback: `There's integrity in resisting hype-driven strategy, and pieces of your message (AI doesn't belong in safety-critical control loops) genuinely need saying. But wholesale rejection of the board's stated direction misreads the moment: they're asking you to FILL the AI-forward frame, which is the influence opportunity — the leader who answers "here's what AI-forward responsibly means in OT" shapes policy; the one who answers "wrong question" gets routed around, and someone less careful fills the frame instead. Redirect the energy; don't refuse it.`
        },
        {
          text: `Keep it minimal — a brief mention that AI features are being piloted, details to follow`,
          quality: "poor",
          feedback: `Underselling a genuine evaluation win wastes the visibility moment your program needs for the segmentation budget still on the roadmap, and the vacuum gets filled anyway — by the vendor's AE presenting to your CIO, by the competitor's case study, by whoever speaks up. You did rigorous, board-worthy work; a leader reports it. Modesty about real results is indistinguishable, from the boardroom, from having no results.`
        }
      ]
    }
  ],
  debrief: `The AI procurement discipline in one scenario: separate core value from AI garnish and price each on evidence; POC on your own traffic with known-answer tests, FP economics, and ground-truth grading of LLM output; never ship OT network data to vendor clouds for evaluation; convert POC findings into contractual performance terms; and contain LLM limitations procedurally (drafting assistant, never protocol authority). The leadership layer matters as much: vendor deadline pressure never moves a disciplined process, analyst enthusiasm is input rather than decision, and board AI-appetite is an influence opportunity to install governance, not a mandate to relay marketing. The portable one-liner for interviews: "AI-powered claims get the same treatment as any vendor claim — a witnessed acceptance test in my environment, and a price that reflects what the test showed."`
});
