window.OTSEC = window.OTSEC || { modules: [], scenarios: [], flashcards: [], glossary: [] };
window.OTSEC.modules.push({
  id: "security-core",
  order: 2,
  title: "Core Security Concepts",
  tagline: "The vocabulary and mental models every security conversation assumes — translated for OT.",
  description: `CIA triad, defense in depth, zero trust, IAM, PKI, vulnerability management, and the security tooling landscape — the concepts IT security people use as shorthand. This module gives you the standard definitions, then immediately maps each one onto OT reality: why availability and safety outrank confidentiality on a plant floor, why EDR does not go on a PLC, and why patching a validated medical device line is nothing like patching a laptop fleet.`,
  interviewPrep: [
    {
      question: `IT wants to apply enterprise security policy — agents, scanning, 30-day patching — to the plant. How do you respond as the OT security lead?`,
      answerOutline: `Show partnership plus hard constraints. Outline: 1) Agree on the goal (reduce risk), disagree on the method. 2) Explain the constraint stack concretely: PLCs and many HMIs cannot run agents; active scanning has crashed fragile OT stacks; in an FDA-validated line, a patch is a controlled change that can trigger revalidation, so 30-day SLAs are physically impossible. 3) Offer the OT-equivalent control for each: passive network monitoring (Dragos/Claroty/Nozomi class) instead of agents and active scans; risk-ranked patching on maintenance windows with compensating controls (segmentation, protocol-aware firewall rules, allowlisting on Windows boxes) for what cannot be patched; an exception process with documented risk acceptance. 4) Close with governance: a joint IT/OT policy with carve-outs beats OT ignoring corporate policy quietly.`
    },
    {
      question: `Explain the CIA triad and how OT changes the priority order.`,
      answerOutline: `Define confidentiality, integrity, availability in one sentence each. Then the inversion: IT generally protects data first (C-I-A), while OT protects the process — the common ordering is availability and integrity ahead of confidentiality, and many practitioners put safety above all three (sometimes phrased as SAIC: Safety, Availability, Integrity, Confidentiality). Make it concrete: leaking a setpoint is embarrassing; corrupting it can scrap product or hurt someone; losing the line costs measurable dollars per minute. Strong answers add the nuance that integrity quietly matters most in regulated manufacturing — in FDA device production, undetected data or recipe corruption is a recall-class event, so the inversion is a re-ranking, not a dismissal of any leg.`
    },
    {
      question: `A critical CVSS 9.8 CVE drops for the PLC platform across your fleet. Walk me through your response.`,
      answerOutline: `Demonstrate that score does not equal risk, and process beats panic. Outline: 1) Read the actual advisory (vendor plus CISA ICS advisory): what is the attack vector, is it reachable in our architecture? 2) Check exploitation reality — is it in CISA's KEV catalog, is a public exploit out? 3) Map exposure with the asset inventory: which lines, which firmware versions — this is where config management discipline pays off. 4) Compensating controls now: verify the vulnerable service is blocked at zone firewalls, tighten ACLs, watch monitoring for related activity. 5) Schedule remediation through change control on maintenance windows, with validation impact assessed for regulated lines. 6) Document the risk decision and timeline. The punchline: a 9.8 unreachable behind a default-deny boundary may be lower actual risk than a 6.5 on an exposed asset.`
    }
  ],
  lessons: [
    {
      id: "sec-01",
      title: "The CIA Triad and the OT Inversion",
      minutes: 9,
      content: `### The triad, straight

Every security program is organized around three properties:

- **Confidentiality** — only authorized parties can read the data. Controls: encryption, access control, classification.
- **Integrity** — data and systems are accurate and unaltered, and unauthorized changes are detectable. Controls: hashing, digital signatures, change control, audit trails.
- **Availability** — systems and data are usable when needed. Controls: redundancy, backups, capacity, DDoS protection.

In enterprise IT, the de facto priority is C-I-A in that order. The crown jewels are data — customer records, financials, IP — and the nightmare scenario is a breach headline. An email server down for two hours is an annoyance; a leaked customer database is a career-ending, regulator-summoning event.

### The OT inversion

In OT the asset is not data — it is a **physical process**. That flips the ranking. The common OT ordering is **A-I-C**: availability first (the line must run; downtime is measured in dollars per minute and missed shipments), integrity second (the data and logic driving the process must be correct), confidentiality last (most process values are meaningless outside context — the temperature of zone 3 is not a secret worth much).

Many OT practitioners go further and put **safety** explicitly on top, giving the ordering sometimes written as **SAIC: Safety, Availability, Integrity, Confidentiality**. (Terminology honesty: you will see AIC, SAIC, and "safety as a fourth pillar" used loosely across the industry — there is no single canonical acronym, but the concept is universal. In an interview, naming the concept matters more than the letters.)

Safety as the overriding property means: no security control may compromise a safety function, and the worst-case consequence of a cyber event in OT is not data loss — it is injury, death, or environmental release. This is why safety instrumented systems get the strongest isolation, why "just push the patch" is never an acceptable answer for a safety PLC, and why the TRITON/TRISIS malware (which targeted Schneider Triconex safety controllers at a petrochemical plant in 2017) is treated as a watershed: it attacked the layer whose entire job is keeping people alive.

### Integrity deserves a second look in your world

The clean A-I-C story has a wrinkle in regulated manufacturing: **integrity quietly carries consequence rivaling availability**. In FDA-regulated device production, undetected corruption of a recipe, a calibration table, an inspection threshold, or batch record data is a recall-class and patient-harm-class event. A line that is down makes no product; a line with corrupted integrity makes **bad product that ships**. The second one is worse. So when you build your own mental ranking for a medical device plant, treat it as Safety, then Integrity and Availability fighting for second depending on the system, then Confidentiality — and be ready to articulate that nuance, because it shows judgment beyond the textbook.

### Using the triad in practice

The triad is not trivia; it is a triage tool. For any system, ask: which property, if lost, hurts most? A vision inspection system: integrity (a tampered pass/fail threshold ships defects). The historian: integrity and availability (it is the batch record evidence chain). An ERP-to-MES order feed: availability. A controller: safety, then availability. This question-per-system habit drives proportionate controls — and it is exactly the framing used in risk assessments under IEC 62443 and the NIST frameworks you will meet later. It is also the language barrier-breaker with IT: when the CISO says confidentiality and you say availability, the triad gives you a shared vocabulary to negotiate instead of talking past each other.`,
      bridge: `You have run this calculus for years without the vocabulary: every time you refused a mid-run change because it risked scrapping a validated batch, you ranked integrity and availability above convenience. Your e-stop and safety-relay design work is the SAIC ordering in hardware — safety circuits that no software, including security software, is allowed to interfere with. The new layer is simply that cyber events are now a credible cause of the failures your interlocks and validation protocols were built to prevent, and the triad is how security people will expect you to frame it.`,
      quiz: [
        {
          id: "sec-01-q1",
          q: `What is the most commonly cited difference between IT and OT security priorities?`,
          options: [
            `IT prioritizes confidentiality of data first; OT prioritizes availability of the physical process (with safety overriding everything)`,
            `IT cares about integrity; OT does not need integrity`,
            `OT prioritizes confidentiality because process data is classified`,
            `There is no difference; both follow identical C-I-A ordering`
          ],
          answer: 0,
          explain: `Enterprise IT protects data, so confidentiality leads. OT protects a running physical process, so availability leads — and safety, where applicable, sits above the entire triad.`
        },
        {
          id: "sec-01-q2",
          q: `Why is safety treated as the overriding property in OT security rather than just a fourth triad item?`,
          options: [
            `Because the worst-case OT cyber consequence is physical harm to people or the environment, and no security control is acceptable if it compromises a safety function`,
            `Because safety systems are the easiest to patch`,
            `Because regulators only audit safety, never security`,
            `Because safety systems contain the most confidential data`
          ],
          answer: 0,
          explain: `OT failures can injure or kill. Safety instrumented systems therefore get the strongest protection and isolation, and security measures must never interfere with safety functions — TRITON made this threat concrete.`
        },
        {
          id: "sec-01-q3",
          q: `In an FDA-regulated medical device plant, why does integrity deserve special weight in the OT ranking?`,
          options: [
            `Undetected corruption of recipes, inspection thresholds, or batch records can ship defective product — a recall-class and patient-harm event arguably worse than downtime`,
            `Because FDA requires all process data to be encrypted`,
            `Because integrity controls are cheaper than availability controls`,
            `Because availability does not matter in regulated plants`
          ],
          answer: 0,
          explain: `A down line makes nothing; a line with corrupted integrity makes bad product that ships. In device manufacturing the second failure mode carries patient harm and recall consequences.`
        },
        {
          id: "sec-01-q4",
          q: `The TRITON/TRISIS malware is considered a watershed OT event because it targeted what?`,
          options: [
            `Safety instrumented system controllers (Schneider Triconex) — the layer whose purpose is preventing injury and catastrophic failure`,
            `Office email servers at an industrial company`,
            `The Windows domain controllers of a bank`,
            `Consumer smart-home thermostats`
          ],
          answer: 0,
          explain: `TRITON (2017, petrochemical facility) attempted to reprogram Triconex safety controllers. Attacking the safety layer demonstrated adversary intent to create conditions where physical harm becomes possible.`
        }
      ]
    },
    {
      id: "sec-02",
      title: "Defense in Depth and Attack Surface",
      minutes: 9,
      content: `### No single control is the plan

**Defense in depth** is the principle that security comes from independent, overlapping layers, so that any single control failing does not equal compromise. The standard layer stack, outside-in: policies and training; physical security; network perimeter (firewalls, IDMZ); internal network segmentation (zones, VLANs, ACLs); host hardening (patching, allowlisting, local firewalls); application controls (authentication, least privilege); and data protection (encryption, backups, integrity verification). An attacker should have to defeat several unrelated mechanisms — and generate detectable noise doing it — before reaching anything that matters. The mirror-image anti-pattern is the "M&M" network: crunchy shell, soft center. One perimeter firewall protecting a flat internal network means one phished credential or one VPN bug hands over everything. Years of incident reports, including most manufacturing ransomware cases, are variations of this single failure.

### Three jobs every layer can do

Classify controls by function and you can spot the gaps:

- **Preventive** — stops the event: firewall rules, locked panels, MFA, application allowlisting, disabled USB ports.
- **Detective** — sees the event: IDS, log monitoring, SIEM alerts, anomaly detection on OT traffic, the door-forced alarm.
- **Corrective** — recovers from the event: backups, golden images, incident response runbooks, spare hardware, your PLC program archive.

Mature programs hold all three deliberately. The classic OT failure mode is heavy prevention, near-zero detection: plants that are genuinely hard to get into, but where an intruder who does get in operates unobserved for months. Industry incident reporting has repeatedly found OT intrusion dwell times measured in months precisely because nobody was watching the inside. The corrective leg is equally underrated and is where you personally start strong — a tested restore of an HMI image and a trusted, versioned PLC program archive can be the difference between a 4-hour recovery and a multi-week one.

### Attack surface

Your **attack surface** is the sum of every point where an attacker can interact with your systems: open ports and listening services, user accounts, remote access paths, web interfaces on devices, USB ports, wireless, vendor connections, even personnel (phishing). Attack surface reduction is the cheapest security work that exists, because removing a path costs less than defending it forever. OT examples with real teeth:

- Disable the embedded web servers on switches, drives, and controllers that nobody uses (they ship enabled, often with default credentials).
- Close unused switch ports administratively; enable port security on the rest.
- Remove the seventeen dormant vendor VPN accounts from projects past.
- Strip engineering software from HMIs that only need runtime.
- Inventory and eliminate cellular modems and unmanaged remote access in OEM equipment.

### Least privilege and hardening

**Least privilege**: every account, service, and connection gets the minimum access required, nothing more. Operators get operator screens, not Windows admin. The historian service account can read from controllers, not write. The vendor's access reaches their machine, not the plant. Every violation of least privilege is pre-staged lateral movement for an attacker.

**Hardening** is configuring systems to minimize exploitability: remove unused software and services, change every default credential, disable legacy protocols (SMBv1, Telnet, FTP), enable host firewalls, apply vendor security baselines. Benchmarks like CIS Benchmarks and DISA STIGs provide checklists for Windows and network gear; ICS vendors publish hardening guides for their platforms (Rockwell, Siemens, and others all maintain them). In OT, hardening the **Windows layer** — HMI servers, engineering workstations, historians — is the highest-leverage starting point, because that layer is where commodity malware lands and where attackers pivot from IT techniques to process access. Application allowlisting (e.g., Windows Defender Application Control or AppLocker) is particularly well-suited to OT Windows boxes precisely because they should run a fixed, rarely-changing set of software — a static workload is the ideal allowlisting candidate.`,
      bridge: `Defense in depth is machine guarding philosophy applied to networks: you never relied on one interlock — you stacked guards, light curtains, e-stops, and safety-rated logic so no single failure injures anyone. Same doctrine, new domain. Your config management program is already a corrective control: a trusted, versioned archive of every PLC program in the fleet is exactly what incident recovery needs, provided it is stored where ransomware cannot reach it and integrity-checked. And attack surface reduction maps to your panel design instincts — every unused port you leave enabled is an unguarded pinch point.`,
      quiz: [
        {
          id: "sec-02-q1",
          q: `What is the "M&M network" anti-pattern?`,
          options: [
            `A hard perimeter with a soft, flat interior — one breached firewall or phished credential yields access to everything inside`,
            `A network with too many layers of firewalls`,
            `Using two vendors' firewalls back to back`,
            `Encrypting external traffic but not internal traffic`
          ],
          answer: 0,
          explain: `Crunchy shell, soft center: all defense concentrated at the perimeter. Defense in depth exists precisely because perimeters fail — interior segmentation, detection, and hardening must stand on their own.`
        },
        {
          id: "sec-02-q2",
          q: `A tested backup of HMI images and a versioned PLC program archive are examples of which control type?`,
          options: [
            `Corrective — they enable recovery after an incident`,
            `Preventive — they stop attacks from occurring`,
            `Detective — they alert you when an attack happens`,
            `Deterrent — they discourage attackers from trying`
          ],
          answer: 0,
          explain: `Backups and golden images do not stop or detect an attack; they determine how fast you recover from one. Mature programs deliberately balance preventive, detective, and corrective controls.`
        },
        {
          id: "sec-02-q3",
          q: `Which of these is a genuine attack surface reduction action on a plant floor?`,
          options: [
            `Disabling unused embedded web servers on drives and switches and administratively shutting unused switch ports`,
            `Adding more user accounts so no one shares credentials`,
            `Increasing firewall logging verbosity`,
            `Buying a SIEM`
          ],
          answer: 0,
          explain: `Attack surface reduction removes interaction points entirely — services, ports, accounts, access paths. Logging and SIEMs improve detection but do not shrink what an attacker can touch.`
        },
        {
          id: "sec-02-q4",
          q: `Why are OT Windows hosts (HMIs, historians, engineering workstations) especially good candidates for application allowlisting?`,
          options: [
            `They run a fixed, rarely-changing set of software, so a permitted-applications list is practical to build and maintain — unlike general-purpose office PCs`,
            `They have more CPU power than office PCs`,
            `Allowlisting replaces the need for backups`,
            `Windows licenses for OT include allowlisting for free`
          ],
          answer: 0,
          explain: `Allowlisting struggles where software changes constantly. An HMI server should run the same handful of executables for years — a static workload where default-deny execution is both feasible and highly effective.`
        }
      ]
    },
    {
      id: "sec-03",
      title: "Zero Trust, and Why Pure Zero Trust Breaks in OT",
      minutes: 9,
      content: `### The idea

**Zero trust** is a reaction to perimeter thinking. The old model: inside the firewall = trusted, outside = untrusted. Zero trust says network location confers nothing — **never trust, always verify**. Every access request is authenticated, authorized, and ideally encrypted, every time, regardless of where it originates. Core ingredients: strong identity for every user and device; **microsegmentation** (policy enforced per-resource or per-small-group, not per-big-zone); least-privilege, per-session access decisions; continuous verification rather than one-time login; and the working assumption that breach has already happened somewhere. The reference document is NIST SP 800-207. The driver is real: once attackers are inside a perimeter-trust network, they move laterally freely — most major breaches are exactly that story.

### Why pure zero trust collapses on the plant floor

Take the model literally and walk it onto your network:

- **Devices cannot authenticate.** Zero trust assumes every endpoint can prove identity. A 15-year-old PLC, a Modbus RTU flowmeter, a vision camera, most drives — they cannot. Modbus has no concept of a user. Classic CIP has no authentication. The device population simply lacks the machinery the model assumes.
- **Protocols carry no identity.** When a packet arrives at a controller on TCP 502, there is no "who" in it to verify. You can verify which host sent it, but not which human or process intent stands behind it.
- **Per-flow inspection adds latency and failure modes.** Inserting policy enforcement into deterministic cyclic I/O paths risks the process itself. A zero-trust proxy that hiccups inside a motion control loop is an availability incident — and availability outranks the control.
- **Agents do not install.** Continuous device-posture verification assumes an agent or modern OS. Firmware-based controllers run neither.

So a consultant selling "zero trust for OT" as a product drop-in deserves skepticism. But discarding the philosophy entirely is the opposite error.

### The pragmatic OT adaptation

Apply zero trust **where the prerequisites exist**, and approximate it with network controls where they do not:

1. **Humans and the Windows layer first.** Engineering workstations, HMI servers, historians, jump hosts, and every human user CAN do real zero trust: MFA, per-person accounts, device health checks, per-session authorization. Remote access is the highest-value target — the brokered, recorded, just-in-time vendor access model from the networking module is zero trust applied to the front door.
2. **The network vouches for devices that cannot vouch for themselves.** A PLC cannot authenticate, but a protocol-aware firewall can enforce that only the engineering workstation VLAN may send CIP configuration services to it, only during approved windows. Identity is approximated by tightly bound network position plus protocol behavior. This is zones-and-conduits (IEC 62443) doing the verifying on the device's behalf.
3. **Microsegmentation at OT granularity.** Per-cell or per-function zones with default-deny conduits between them — coarser than IT microsegmentation, but the same trajectory: shrink implicit-trust pools from "the plant" to "this cell."
4. **Verify integrity where identity is impossible.** You cannot authenticate a controller's traffic, but you can baseline it and alert on deviation (passive OT monitoring), and you can verify its logic against your config management archive. Detection substitutes for verification.
5. **Buy the capability forward.** New equipment specs can require CIP Security, OPC UA with certificates, or at minimum modern remote access integration — so the population that CAN participate in zero trust grows with every capital project.

The honest summary for an interview: zero trust is a direction, not a binary. In OT you implement it fully for people and IT-class assets, approximate it with segmentation and protocol enforcement for legacy devices, and ratchet forward as the install base turns over — which, at plant equipment lifecycles of 15-30 years, is a long campaign.`,
      bridge: `Your fleet is the proof of the legacy problem: controllers and drives bought over two decades, most of which cannot authenticate anything — and they will not be replaced for security's sake while they make rate. The adaptation playbook leans on what you already do. Zones-and-conduits is your network layout discipline with deny-by-default added. Baselining controller behavior against an archive is your software version traceability program pointed at security. And as the person who writes capital equipment specs and runs vendor selection, you are the mechanism by which the plant's zero-trust-capable population actually grows.`,
      quiz: [
        {
          id: "sec-03-q1",
          q: `What is the core assertion of zero trust?`,
          options: [
            `Network location confers no trust — every access request must be authenticated and authorized regardless of where it originates`,
            `No employee should be trusted with administrative rights`,
            `All traffic must be blocked until a human approves each packet`,
            `Firewalls are unnecessary if endpoints are patched`
          ],
          answer: 0,
          explain: `Zero trust (NIST SP 800-207) replaces "inside = trusted" with per-request verification of identity and authorization, assuming breach has already occurred somewhere on the network.`
        },
        {
          id: "sec-03-q2",
          q: `What is the most fundamental obstacle to literal zero trust on a plant floor?`,
          options: [
            `Legacy controllers and field devices cannot authenticate — protocols like classic CIP and Modbus carry no identity to verify`,
            `Plant networks are too fast for zero trust appliances`,
            `Zero trust requires IPv6, which OT does not support`,
            `Operators refuse to use MFA`
          ],
          answer: 0,
          explain: `Zero trust presumes endpoints that can prove identity. Most installed OT devices and their protocols simply lack authentication machinery, so the model's prerequisite is absent for a large share of the asset base.`
        },
        {
          id: "sec-03-q3",
          q: `How does an OT program approximate zero trust for a PLC that cannot authenticate?`,
          options: [
            `The network vouches for it: tight segmentation plus protocol-aware enforcement so only specific hosts can send specific services to it, with passive monitoring to detect deviation`,
            `Install an EDR agent directly on the PLC firmware`,
            `Require operators to badge in before each tag write`,
            `Replace the PLC immediately regardless of cost`
          ],
          answer: 0,
          explain: `Identity is approximated by bound network position and constrained protocol behavior — zones and conduits with default deny — while baselining and anomaly detection substitute for the verification the device cannot perform.`
        },
        {
          id: "sec-03-q4",
          q: `Where can full, literal zero trust be applied in OT today with the highest payoff?`,
          options: [
            `Human and remote access — MFA, per-person accounts, and brokered, recorded, just-in-time sessions through a jump host`,
            `Inside cyclic I/O connections between PLCs and drives`,
            `On serial Modbus RTU links to flowmeters`,
            `Nowhere; zero trust has no place in OT`
          ],
          answer: 0,
          explain: `People and IT-class assets (workstations, servers, gateways) have the identity machinery zero trust needs, and remote access is the most-abused attack path — so that is where per-session verification lands first and hardest.`
        }
      ]
    },
    {
      id: "sec-04",
      title: "Identity and Access Management: Accounts, AD, and the Shared-Login Problem",
      minutes: 10,
      content: `### Authentication vs authorization

Two words that sound interchangeable and are not. **Authentication (authn)** proves who you are — password, badge, fingerprint, certificate. **Authorization (authz)** decides what the proven identity may do — read this share, write that tag, install software. The login box authenticates; the permission check authorizes. Most access-control failures are authorization failures wearing an authentication costume: the user proved who they were just fine, and who they were had wildly more privilege than their job required.

**Multi-factor authentication (MFA)** requires factors from different categories: something you know (password), something you have (phone app, hardware token like a YubiKey), something you are (biometric). Two passwords is not MFA. Why it matters: passwords leak constantly — phishing, reuse, breach dumps — and MFA makes a stolen password insufficient by itself. Modern attacks adapt (push-fatigue bombing, real-time phishing proxies), which is why phishing-resistant MFA (FIDO2 hardware keys) is the current bar for high-value access. In OT, the non-negotiable MFA placement is **every remote access path into the environment**.

### Active Directory in five minutes

**Active Directory (AD)** is Microsoft's directory service and the identity backbone of nearly every enterprise — and of most OT Windows environments. Core concepts: a **domain** is the management boundary; **domain controllers (DCs)** are the servers holding the identity database and authenticating logins (via the Kerberos protocol); users, computers, and **groups** are directory objects; **Group Policy (GPO)** pushes configuration to every domain-joined machine; permissions are granted to groups, and users inherit by membership.

Two OT-relevant facts. First, AD is the single most valuable target in any Windows environment: own the domain (specifically Domain Admin rights) and you own every joined machine — ransomware crews escalate to Domain Admin and then deploy everywhere at once. Second, the standing OT architecture question: should OT machines join the enterprise domain? Prevailing guidance (reflected in IEC 62443 zoning and most reference architectures) is a **separate OT domain or forest** living at Level 3, with either no trust or a tightly limited one-way trust to enterprise AD — because a flat shared domain means enterprise compromise IS OT compromise through the identity layer, no network bypass required.

### The shared account problem on HMIs

Every plant has it: the HMI logged in as "operator" for nine years, password taped inside the panel door, engineering workstation on a shared "maint" login everyone knows. Why it is a real problem and not security pedantry:

- **No attribution.** When a setpoint changed at 02:14, "operator did it" identifies nobody — useless for incident forensics and a genuine gap for regulated audit trails (21 CFR Part 11 expects actions attributable to individuals).
- **No offboarding.** Departed employees and former contractors still know the password. Rotating it means re-briefing an entire shift, so it never rotates.
- **Maximum standing privilege.** Shared accounts accumulate permissions for the most demanding task anyone uses them for.

The honest constraint: per-operator login at every HMI fights real operational physics — a line stoppage cannot wait for a 20-character password. Workable patterns: badge-tap login at the HMI (proximity card mapped to individual identity), role-tiered access where view/acknowledge is always available but setpoint changes and mode changes require individual elevation, and strict per-person accounts on engineering workstations even where runtime HMIs keep a constrained shared view-only session.

### RBAC and privileged access management

**Role-based access control (RBAC)** assigns permissions to roles (Operator, Process Engineer, Controls Engineer, Vendor), and people to roles — manageable, auditable, and the model both AD groups and modern ICS platforms (e.g., FactoryTalk Security on the Rockwell stack) implement.

**Privileged access management (PAM)** is the discipline (and product category — CyberArk, Delinea, BeyondTrust) for the accounts that can do the most damage: admin credentials live in a vault, are checked out per-use with approval, rotate automatically, and privileged sessions are recorded. The OT mapping is direct: domain admin on the OT domain, local admin on HMI servers, and — treat them with the same seriousness — **controller access**: the ability to download to a PLC or modify safety logic is privileged access, whether or not the platform models it that way.`,
      bridge: `Your FactoryTalk Security or equivalent user setup work was RBAC; this lesson gives you the enterprise vocabulary and the AD machinery behind it. The shared-HMI-account problem is one you have lived from both sides — and your Part 11 audit-trail experience is the strongest argument you own for fixing it, because attribution is a compliance requirement before it is a security nicety. One reframe to carry: a PLC program download is privileged access exactly like a domain admin login. Your version traceability program already treats it that way operationally; PAM is the same instinct applied to credentials.`,
      quiz: [
        {
          id: "sec-04-q1",
          q: `What is the difference between authentication and authorization?`,
          options: [
            `Authentication proves who you are; authorization determines what that proven identity is allowed to do`,
            `Authentication is for users; authorization is for computers`,
            `They are synonyms used by different vendors`,
            `Authorization happens first, then authentication`
          ],
          answer: 0,
          explain: `Authn establishes identity (password, badge, certificate); authz is the permission decision applied to that identity. Most access failures are over-broad authorization, not failed authentication.`
        },
        {
          id: "sec-04-q2",
          q: `Why do most OT reference architectures recommend a separate OT Active Directory domain rather than joining plant machines to the enterprise domain?`,
          options: [
            `A shared domain means enterprise compromise becomes OT compromise through the identity layer — attackers with Domain Admin can reach every joined machine without crossing a network boundary`,
            `OT machines are not allowed to run Kerberos`,
            `Enterprise domains cannot contain more than 1000 computers`,
            `Group Policy does not work on Windows machines in plants`
          ],
          answer: 0,
          explain: `AD is the highest-value target in a Windows environment. Separating the OT domain (with no trust or a tightly limited one) keeps an enterprise Domain Admin compromise from translating directly into control of OT hosts.`
        },
        {
          id: "sec-04-q3",
          q: `Beyond security, why are shared HMI accounts a compliance problem in FDA-regulated manufacturing?`,
          options: [
            `Audit trail requirements (21 CFR Part 11 territory) expect actions to be attributable to individuals — "operator changed the setpoint" identifies no one`,
            `FDA requires all passwords to be at least 30 characters`,
            `Shared accounts consume extra software licenses`,
            `FDA prohibits HMIs from having login screens`
          ],
          answer: 0,
          explain: `Attribution is the issue: shared logins make it impossible to tie a change to a person, which undermines both incident forensics and the data-integrity expectations of regulated audit trails.`
        },
        {
          id: "sec-04-q4",
          q: `Which OT action deserves to be treated as privileged access in the PAM sense?`,
          options: [
            `Downloading a program change to a PLC or modifying safety logic — it can alter the physical process as surely as a domain admin login alters the IT estate`,
            `Viewing a read-only dashboard of line throughput`,
            `Acknowledging a non-critical alarm on an HMI`,
            `Reading the plant cafeteria menu on the intranet`
          ],
          answer: 0,
          explain: `Privileged access is anything with outsized damage potential. Controller download rights change what the process physically does, so they warrant vaulting, approval, attribution, and recording like any admin credential.`
        }
      ]
    },
    {
      id: "sec-05",
      title: "PKI, Certificates, and Encryption — and Why Your Protocols Have None",
      minutes: 11,
      content: `### Symmetric vs asymmetric

**Symmetric encryption** uses one shared key to encrypt and decrypt (AES-256 is the standard). Fast — line-rate fast — but both parties must already possess the secret key, and securely distributing keys at scale is the hard part. **Asymmetric encryption** uses a key pair: data encrypted with the public key only decrypts with the private key, and a signature made with the private key is verifiable by anyone holding the public key (RSA and elliptic-curve algorithms). Asymmetric solves distribution — publish the public key freely — but is orders of magnitude slower. So real systems use both: asymmetric crypto to authenticate the parties and establish a shared secret, then symmetric crypto for the actual data. That hybrid is precisely what TLS does.

### TLS at a useful altitude

When a client connects to a server over **TLS** (the protocol behind HTTPS, and behind OPC UA and CIP Security's TCP transport): the client says hello and offers cipher suites; the server responds with its **certificate**; the client verifies that certificate chains to a CA it trusts and that the name matches; the two perform a key exchange (ephemeral elliptic-curve Diffie-Hellman in modern TLS 1.3) yielding a fresh shared session key; everything after is symmetric encryption. You get three properties at once: **confidentiality** (eavesdroppers see noise), **integrity** (tampering is detected), and **server authentication** (you are talking to who you think). Optionally the client presents a certificate too — **mutual TLS (mTLS)** — which is how machine-to-machine OT communication authenticates both ends.

### Certificates, CAs, and PKI

A certificate binds a public key to an identity, signed by a **Certificate Authority (CA)**. Trust the CA, and you can trust every certificate it signs — that chain of signatures is **PKI** (public key infrastructure). Enterprises run internal CAs (commonly Microsoft AD Certificate Services) for internal systems. The unglamorous truth that matters operationally: PKI is a lifecycle program, not an install. Certificates **expire** — and expired certificates on HMI web interfaces, OPC UA servers, and historians cause real outages that get misdiagnosed as software bugs. If you deploy certificate-based anything in OT (OPC UA deployments hit this constantly), someone must own issuance, renewal, and revocation, with monitoring on expiry dates. An OT environment full of self-signed certificates that everyone clicks through has the ceremony of security with none of the verification.

### Hashing is not encryption

A **hash** (SHA-256) is a one-way fingerprint: any input produces a fixed-size digest, any change to the input changes the digest, and you cannot run it backwards. Encryption hides data and is reversible with the key; hashing fingerprints data irreversibly. Uses you will meet: verifying a firmware download matches the vendor's published SHA-256; storing passwords (systems store hashes, not passwords); and **digital signatures**, which are a hash of the content encrypted with the signer's private key — proving both integrity and origin.

### Code signing, firmware, and your program archive

**Code signing** applies signatures to software: the vendor signs firmware or installers, and devices or operating systems verify the signature before executing. Modern controllers increasingly verify signed firmware before accepting an update — directly countering malicious-firmware attacks. Now the uncomfortable mapping: most installed PLCs accept logic downloads from anyone who can reach them, no signature, no authentication. Your defenses today are network position (segmentation), platform permissions where they exist, and **integrity verification after the fact** — hashing program files in your archive and comparing against what is running. That is exactly what your version traceability program does; security just raises the stakes from "uncontrolled change" to "adversarial change."

### Why industrial protocols are naked, and what is changing

Modbus (1979) and classic CIP/EtherNet/IP were designed for closed, trusted networks: **no authentication, no encryption, no integrity protection**. Anyone with network reach can read tags, write coils, or issue configuration commands — every attack tool in the OT space leans on this. The successors exist: **CIP Security** (ODVA) adds TLS/DTLS transport security — device authentication, integrity, optional confidentiality — to EtherNet/IP on supported hardware (e.g., recent ControlLogix 5580-class systems with appropriate firmware). **Modbus/TCP Security** (officially published by the Modbus Organization in 2018) wraps Modbus in TLS on port 802. **OPC UA** had certificates and signing/encryption designed in from the start, which is a major reason it dominates new northbound integrations. The honest adoption picture as of the mid-2020s: support exists on current-generation hardware, but real-world deployment remains thin — both endpoints must support it, certificates must be managed, legacy fleets dominate, and many sites reasonably conclude segmentation plus protocol-aware firewalls deliver more risk reduction per engineering hour. Expect interviewers to value that nuance over cheerleading.`,
      bridge: `You have flashed firmware onto drives, cameras, and controllers for years — code signing is the vendor guaranteeing cryptographically that the file you flash is theirs and untampered, and checking the published SHA-256 before flashing is a habit worth mandating in your work instructions now. Your version traceability program is already an integrity-verification system; adding hash comparison of running PLC programs against the archive turns it into a tamper-detection control. And when CIP Security shows up as a checkbox on your next ControlLogix platform refresh, you are now the person in the room who knows what the TLS underneath it actually buys.`,
      quiz: [
        {
          id: "sec-05-q1",
          q: `Why do real systems like TLS use both asymmetric and symmetric cryptography?`,
          options: [
            `Asymmetric crypto authenticates parties and establishes a shared secret without prior key distribution; the fast symmetric cipher then encrypts the actual data`,
            `Two kinds of encryption are always twice as strong as one`,
            `Symmetric crypto handles authentication while asymmetric handles speed`,
            `Regulations require at least two algorithms in every connection`
          ],
          answer: 0,
          explain: `Asymmetric solves the key-distribution problem but is slow; symmetric is fast but needs a pre-shared key. The TLS handshake uses asymmetric operations to authenticate and derive a session key, then switches to symmetric encryption for traffic.`
        },
        {
          id: "sec-05-q2",
          q: `What is the difference between hashing and encryption?`,
          options: [
            `Hashing produces an irreversible fixed-size fingerprint for integrity verification; encryption reversibly hides data for whoever holds the key`,
            `Hashing is just faster encryption`,
            `Encryption is one-way; hashing can be reversed with the key`,
            `Hashing only works on passwords; encryption only works on files`
          ],
          answer: 0,
          explain: `A hash like SHA-256 cannot be run backwards and exists to detect any change to the input — e.g., verifying firmware integrity. Encryption is reversible by design for the key holder.`
        },
        {
          id: "sec-05-q3",
          q: `What do classic Modbus TCP and classic CIP/EtherNet/IP have in common from a security standpoint?`,
          options: [
            `Neither has authentication, encryption, or integrity protection — anyone with network reach can read and write to devices`,
            `Both encrypt traffic but skip authentication`,
            `Both require certificates from a public CA`,
            `Both were designed to NIST zero trust specifications`
          ],
          answer: 0,
          explain: `Both protocols predate security being a design requirement and assume a trusted network. CIP Security and Modbus/TCP Security (TLS on port 802) retrofit protection, but installed-base adoption remains thin.`
        },
        {
          id: "sec-05-q4",
          q: `How does code signing relate to PLC program and firmware integrity in practice today?`,
          options: [
            `Vendors sign firmware so devices can verify it before flashing, but most installed PLCs accept unsigned logic downloads — so segmentation plus hash-comparison of running programs against a trusted archive carries the integrity burden`,
            `All PLCs made since 2010 reject unsigned logic automatically`,
            `Code signing encrypts PLC programs so competitors cannot read them`,
            `Signing eliminates the need for configuration management`
          ],
          answer: 0,
          explain: `Signed-firmware verification is increasingly real on modern controllers, but logic downloads on the installed base are mostly unauthenticated. Network controls plus integrity verification against a versioned archive are the practical defense.`
        }
      ]
    },
    {
      id: "sec-06",
      title: "Vulnerability Management in a Validated Plant",
      minutes: 11,
      content: `### The vocabulary: CVE and CVSS

A **CVE** (Common Vulnerabilities and Exposures) is the global catalog entry for a publicly disclosed vulnerability — CVE-2024-XXXXX — managed by MITRE with NVD enrichment. **CVSS** (Common Vulnerability Scoring System) scores severity 0.0-10.0 from metrics like attack vector (network vs physical), complexity, privileges required, user interaction, and C/I/A impact. 9.0+ is Critical. Enterprise programs run on this pipeline: scan, find CVEs, sort by CVSS, patch on SLA (e.g., criticals in 30 days).

### Why CVSS alone misleads in OT

CVSS measures **severity in the abstract**, not **risk in your plant**. Failure modes of score-sorting an OT environment:

- **No reachability context.** A 9.8 network-exploitable flaw on a PLC that sits behind a default-deny zone firewall, reachable only from one engineering VLAN, may be near-zero actual risk. A 6.5 on an internet-exposed remote access gateway is the house fire. Architecture position routinely dominates score.
- **No consequence context.** CVSS's C/I/A impact ratings model the affected component, not your process. "Integrity impact: High" reads very differently on a digital signage player versus the controller running a sterilization cycle.
- **No exploitation reality.** Most CVEs are never exploited in the wild. **CISA's KEV (Known Exploited Vulnerabilities) catalog** lists those confirmed actually exploited — a far stronger prioritization signal than raw score. KEV presence plus reachability should outrank a higher CVSS that has neither. (EPSS, a predicted-exploitation score, serves a similar triage role.)
- **Volume.** A real OT asset inventory surfaces thousands of CVEs across decades of firmware. Sorting by CVSS produces an unactionable wall of 9.x findings. Sorting by exploited + reachable + consequential produces a to-do list.

The mature framing: **risk = vulnerability x exposure x consequence**, and CVSS speaks to only the first factor.

### Patching constraints in FDA-regulated environments

In an office, patching is routine hygiene. On a validated medical device production line, a patch is a **change to a validated system**, which triggers change control: assess the change, determine validation impact, potentially re-execute qualification protocols (IQ/OQ/PQ territory), document everything. Add the operational constraints — patch windows only during scheduled downtime on a 24/5 or 24/7 line; vendor approval matrices (many ICS vendors qualify specific OS patches against their software, and patching outside that matrix can void support); fleets of equipment running OS versions past end-of-support that cannot be upgraded without requalifying the machine — and "patch criticals in 30 days" is not difficult, it is **impossible by design**. This is not OT laziness; the validation regime exists because uncontrolled change on this line can ship product that harms patients. Say it that way to IT leadership.

### Compensating controls: the actual OT playbook

When you cannot patch on enterprise timelines, you reduce exploitability instead:

- **Isolate or constrain reachability** — confirm the vulnerable service is unreachable from anything but the minimum necessary sources; tighten zone-boundary rules to the specific port/service; for the truly unpatchable, a DIN-rail firewall in front of the device.
- **Virtual patching** — IPS signatures at the boundary that detect and block the specific exploit pattern in transit, buying time until a real patch lands in a maintenance window.
- **Disable the vulnerable feature** — if the CVE is in the embedded web server you never use, turning it off IS remediation.
- **Watch it** — targeted detection rules for exploitation indicators on assets you have accepted as temporarily vulnerable.
- **Document the decision** — risk accepted by a named owner, with the compensating controls and a revisit date. This is the audit-defensible artifact, and it is the same discipline as a deviation/CAPA record in your quality system.

### ICS advisories: your actual feed

Enterprise scanning barely sees OT (and active scanning is its own hazard — next lesson). Your primary intelligence sources are **CISA ICS Advisories** (the ongoing advisory stream from what was historically called ICS-CERT) — vendor-coordinated disclosures for industrial products with affected versions and mitigations — plus vendor security bulletins (Rockwell, Siemens ProductCERT, Schneider, GE, etc.). The operational loop that makes any of this work: maintain an accurate asset inventory with firmware/software versions — which is config management, your home turf — match advisories against it, triage by exploited/reachable/consequential, then route through change control or compensating controls. No inventory, no program.`,
      bridge: `You already run the hard half of this program: vulnerability management is your software version traceability discipline with a threat feed attached. The fleet inventory you keep — every machine, every PLC firmware rev, every HMI software version — is precisely the database that turns a CISA advisory from noise into a five-minute impact query. And patch-versus-validation is a fight you have personally refereed for years; the security framing just adds that the deviation-record discipline you use for quality exceptions is the exact same artifact a risk acceptance with compensating controls requires.`,
      quiz: [
        {
          id: "sec-06-q1",
          q: `Why is sorting OT vulnerabilities purely by CVSS score a flawed strategy?`,
          options: [
            `CVSS measures abstract severity, not your risk — it ignores whether the flaw is reachable in your architecture, what process consequence the asset carries, and whether it is actually being exploited`,
            `CVSS scores are only valid for Windows operating systems`,
            `OT vulnerabilities are never assigned CVSS scores`,
            `CVSS scores expire after 90 days`
          ],
          answer: 0,
          explain: `A 9.8 behind a default-deny boundary can be lower real risk than a 6.5 on an exposed gateway. Risk = vulnerability x exposure x consequence, and CVSS only speaks to the first factor.`
        },
        {
          id: "sec-06-q2",
          q: `What does CISA's KEV catalog add to vulnerability prioritization?`,
          options: [
            `It lists vulnerabilities confirmed to be exploited in the wild — a much stronger signal for prioritization than theoretical severity scores`,
            `It lists every CVE ever published, sorted alphabetically`,
            `It provides patches for vulnerabilities that vendors abandoned`,
            `It scores vulnerabilities on a separate 1-5 scale`
          ],
          answer: 0,
          explain: `Most CVEs are never exploited. KEV (Known Exploited Vulnerabilities) flags the ones adversaries actually use, so KEV-listed plus reachable should jump the queue over higher-scored but unexploited findings.`
        },
        {
          id: "sec-06-q3",
          q: `Why can't a validated FDA production line meet a corporate "patch criticals in 30 days" SLA?`,
          options: [
            `A patch is a change to a validated system requiring change control, validation impact assessment, possible requalification, vendor compatibility approval, and a production downtime window — a deliberate regime, not negligence`,
            `FDA explicitly bans all software patches on medical device lines`,
            `Plant networks are too slow to download patches`,
            `Patches only install on computers with internet access`
          ],
          answer: 0,
          explain: `The validation regime exists because uncontrolled change on these lines can ship harmful product. Patching happens, but through change control on maintenance windows — compensating controls cover the gap in between.`
        },
        {
          id: "sec-06-q4",
          q: `A critical CVE affects the embedded web server on a drive you never use, and patching requires a downtime window months away. Which response is the strongest immediate move?`,
          options: [
            `Disable the web server (removing the vulnerable feature), verify boundary rules block the port anyway, and document the decision with a revisit date`,
            `Wait silently for the next scheduled patch window`,
            `Take the production line down immediately to patch`,
            `Ignore it permanently since the feature is unused`
          ],
          answer: 0,
          explain: `Disabling an unused vulnerable feature is genuine remediation, layered rules add depth, and the documented decision creates the audit-defensible record. Neither panic downtime nor silent deferral is justified.`
        }
      ]
    },
    {
      id: "sec-07",
      title: "The Security Tooling Landscape: What Runs Where, and Why Not on PLCs",
      minutes: 11,
      content: `### SIEM: the log brain

A **SIEM** (Security Information and Event Management — Splunk, Microsoft Sentinel, Elastic, QRadar) ingests logs from everything — firewalls, Windows hosts, switches, AD, applications — normalizes them, correlates events across sources, and alerts on patterns: one firewall deny is noise; a port-scan pattern followed by a successful login to a jump host at 03:00 followed by a PLC mode change is a story. The SIEM is where the timeline lives during incident response, which is why the NTP discipline from the networking module is a prerequisite, not a nicety. Staffing reality worth knowing as a leader: a SIEM without people tuning rules and triaging alerts is an expensive log bucket — which is why many mid-size manufacturers buy it as a service (MSSP/MDR) rather than building a 24/7 SOC.

### IDS and IPS

An **IDS** (intrusion detection system) inspects traffic and alerts on malicious patterns; an **IPS** sits inline and blocks them. Same engine, different placement and different failure stakes: a false positive in an IDS is a wasted ticket; a false positive in an inline IPS just blocked production traffic. That asymmetry drives the OT default: **detection-mode-first, passive placement** — feed the sensor from switch SPAN ports or network taps so the monitoring adds zero latency and zero new failure modes to the process path. Inline blocking in OT is reserved for boundaries (it is effectively the IPS function inside the NGFW at the IT/OT edge), not for the cell network.

### EDR — and why it stops at the Windows layer

**EDR** (endpoint detection and response — CrowdStrike Falcon, Microsoft Defender for Endpoint, SentinelOne) is an agent on each host watching behavior: process trees, memory injection, ransomware-like file activity — with remote response actions like host isolation. EDR is the strongest single control on the **OT Windows layer**: HMI servers, engineering workstations, historians, jump hosts. Why it does not go on PLCs and most HMIs-as-devices: controllers run **proprietary real-time firmware, not Windows or a general-purpose Linux** — no OS to install an agent on, no deterministic headroom for one, no vendor support if you somehow did; panel HMIs mostly run locked vendor images or closed embedded OSes. The device layer is an inherent EDR blind spot — exactly the gap the next category fills. (Caveat: vendor support matrices constrain EDR even on OT Windows boxes — deploy the vendor-qualified configuration, and run monitoring mode before enabling blocking on a production HMI server.)

### OT network monitoring: the Dragos/Claroty/Nozomi category

Purpose-built **OT network detection and response** platforms — **Dragos, Claroty, Nozomi Networks** are the names every interviewer knows; Microsoft Defender for IoT and Forescout play here too — work by **passively parsing industrial protocols** from SPAN/tap feeds. Because they speak CIP, Modbus, S7, DNP3, and OPC UA natively, they deliver what generic IT tools cannot:

- **Asset inventory from traffic** — every device that talks reveals its address, vendor, model, and often firmware version, with zero packets sent to fragile equipment.
- **Behavioral baselining** — these networks are blessedly predictable, so "new device appeared," "first-ever CIP write from this host," or "controller went into program mode" are crisp, low-false-positive detections.
- **Threat detection** mapped to known OT attack behaviors and threat-group tradecraft.
- **Vulnerability correlation** — matching observed device/firmware against ICS advisories, feeding exactly the program from the previous lesson.

### Passive vs active: the OT scanning rule

**Passive** monitoring observes copies of traffic; it cannot disturb the process. **Active** scanning (Nessus/Qualys-style probing, or even aggressive ping sweeps) sends packets to elicit responses — and OT history is littered with legacy devices whose fragile IP stacks faulted or crashed when probed in ways their 2003-era firmware never anticipated; there are documented cases of scans stopping production equipment. Hence the rule: **passive by default in OT**. The modern nuance is **targeted, protocol-native active queries** — politely asking a controller its identity using its own protocol (a CIP identity request, the same thing your engineering software does on every browse) is far gentler than a generic port scan, and the major OT platforms now offer this as carefully scoped "smart polling" to enrich passive data. Run it selectively, in maintenance windows where consequence warrants, never as a blanket sweep.

### How the stack composes

The reference picture for a plant: EDR on the Windows layer; passive OT monitoring sensors on SPAN ports at the cell and supervisory levels; firewalls (with IPS) at zone boundaries and the IDMZ; everything — EDR, OT platform, firewalls, AD, jump host session logs — forwarding into the SIEM, where correlation and the incident timeline live. Each tool covers another's blind spot; none replaces the others. When a vendor tells you their box covers everything, you now know the diagram to draw on the whiteboard to test the claim.`,
      bridge: `Passive OT monitoring works because plant traffic is deterministic — the same produced/consumed connections at the same RPIs, the same HMI polls, day after day. You know that rhythm better than any analyst; you configured it. That is why "first CIP write from a new source" is signal, not noise. The SPAN-port dependency also closes the loop on the managed-switch argument from the networking module: no managed switches, no mirror ports, no visibility. And your instinct that you do not point unknown tools at fragile production devices is exactly right — it is formal policy here: passive by default, protocol-native queries only when scoped and scheduled.`,
      quiz: [
        {
          id: "sec-07-q1",
          q: `Why is EDR generally not deployed on PLCs?`,
          options: [
            `PLCs run proprietary real-time firmware with no general-purpose OS to host an agent, no deterministic headroom for one, and no vendor support for it`,
            `EDR licenses are priced per I/O point, making PLCs too expensive`,
            `PLCs are too secure to need any monitoring`,
            `EDR only works over Wi-Fi, which PLCs lack`
          ],
          answer: 0,
          explain: `EDR is an OS agent, and controllers do not run an OS you can install software on. The device layer is covered instead by passive network monitoring that parses industrial protocols off SPAN/tap feeds.`
        },
        {
          id: "sec-07-q2",
          q: `What is the core method of the Dragos/Claroty/Nozomi product category?`,
          options: [
            `Passively parsing industrial protocols from SPAN or tap traffic to build asset inventory, baseline behavior, and detect anomalies — without sending packets to fragile devices`,
            `Installing lightweight agents on every PLC in the fleet`,
            `Replacing plant firewalls with AI-driven appliances`,
            `Scanning every device nightly with Nessus`
          ],
          answer: 0,
          explain: `These platforms speak CIP, Modbus, S7, and DNP3 natively and observe mirrored traffic. Because OT traffic is highly regular, deviations like a first-ever write from a new host are high-confidence detections.`
        },
        {
          id: "sec-07-q3",
          q: `Why is active scanning treated as hazardous in OT environments?`,
          options: [
            `Legacy device IP stacks can fault or crash when probed in unexpected ways — scans have stopped production equipment — so OT defaults to passive monitoring with only carefully scoped protocol-native queries`,
            `Active scanning is illegal in industrial facilities`,
            `Active scans erase PLC programs by design`,
            `Scanning consumes all available IP addresses`
          ],
          answer: 0,
          explain: `Fragile embedded stacks were never built to handle malformed or unexpected probes. Passive is the default; when more data is needed, targeted native queries (like a CIP identity request) in maintenance windows are the safer pattern.`
        },
        {
          id: "sec-07-q4",
          q: `What role does the SIEM play relative to EDR, OT monitoring, and firewalls?`,
          options: [
            `It aggregates and correlates logs from all of them into cross-source detections and the incident timeline — each tool covers a blind spot, and the SIEM is where their signals combine`,
            `It replaces all other tools once installed`,
            `It blocks malicious traffic inline at zone boundaries`,
            `It patches vulnerabilities automatically as they are logged`
          ],
          answer: 0,
          explain: `The SIEM is the correlation and timeline layer: one deny is noise, but a scan-login-PLC-mode-change sequence across three log sources is a story. It detects and records; enforcement stays with the firewalls and endpoints.`
        }
      ]
    }
  ]
});
