window.OTSEC = window.OTSEC || { modules: [], scenarios: [], flashcards: [], glossary: [] };
window.OTSEC.modules.push({
  id: "networking",
  order: 1,
  title: "IT Networking Fundamentals",
  tagline: "The layers underneath the protocols you already program every day.",
  description: `You already run EtherNet/IP, Modbus TCP, and serial links in production. This module fills in what sits underneath and around them: the TCP/IP stack, addressing and subnetting, VLANs, routing, firewalls, the IDMZ, and the network services (DNS, DHCP, NTP, VPN) that every security conversation assumes you know. The goal is fluency in IT vocabulary so you can design and defend segmented plant networks, not just live on them.`,
  interviewPrep: [
    {
      question: `Walk me through how you would segment a flat plant network without taking down production.`,
      answerOutline: `Strong answers show a phased plan, not a forklift. Outline: 1) Passive asset inventory first — you cannot segment what you have not mapped; use existing managed-switch port data, SPAN captures, and your own config-management records. 2) Group assets into zones by function and criticality (line, cell, supervisory, IDMZ) per the Purdue model and IEC 62443 zones/conduits. 3) Introduce VLANs on managed switches during planned downtime windows, one cell at a time, with rollback plans — exactly like a controls commissioning cutover. 4) Put an industrial firewall or L3 switch with ACLs between zones, start in monitor/alert-only mode, then enforce default deny. 5) Build the IDMZ so historians and patch servers broker IT/OT traffic. Emphasize change control and validation evidence — your FDA background is a differentiator here.`
    },
    {
      question: `What belongs in an industrial DMZ, and why can't the MES just talk directly to the PLCs?`,
      answerOutline: `Define the IDMZ as the broker layer between IT (Level 4/5) and OT (Level 3 and below): no session originates on one side and terminates on the other. Belongs in it: historian replicas or data concentrators, patch/WSUS and AV update replicas, jump servers for remote access, file-transfer brokers, sometimes a reverse proxy for MES-to-OT interfaces. Direct IT-to-OT connections mean one phished office laptop can reach a controller — the historian replica pattern means IT reads from a copy, never from the Level 2/3 source. Mention that legacy MES integrations are the usual exception fight, and that you handle them with tightly scoped, protocol-aware firewall rules and a documented risk acceptance, not an open conduit.`
    },
    {
      question: `Coming from controls, what's the biggest networking blind spot you've had to close?`,
      answerOutline: `Honest self-aware answers land well. Good shape: in controls you treat the network as plumbing — set a static IP on the PLC NIC, match the mask, done. The blind spots are everything above and around that: how broadcast domains and VLAN design determine blast radius, how stateful firewalls and NAT actually behave, why DNS and NTP matter for security operations, and the discipline of default-deny rule design. Then flip it: your advantage is that you know what the traffic IS — you can read a CIP or Modbus capture and say whether that write to a coil is a normal HMI action or an anomaly, which most IT network engineers cannot.`
    }
  ],
  lessons: [
    {
      id: "net-01",
      title: "The TCP/IP Stack: What's Under Your CIP Packets",
      minutes: 10,
      content: `### Two models, one reality

You will hear two layer models used interchangeably. The OSI model has 7 layers (Physical, Data Link, Network, Transport, Session, Presentation, Application). The TCP/IP model collapses that to 4: Link, Internet, Transport, Application. In practice, people speak OSI numbers — "L2 switch," "L3 routing," "L7 firewall" — while the actual protocols follow the TCP/IP model. Memorize the mapping: L2 = Ethernet/MAC, L3 = IP, L4 = TCP/UDP, L7 = the application protocol (CIP, Modbus, HTTP).

### Encapsulation: the nesting dolls

Every message a device sends gets wrapped layer by layer on the way down, and unwrapped on the way up. Take a CIP read you program every day:

- Your CIP request (service code, class/instance/attribute path) is the **application payload**.
- EtherNet/IP wraps it in an **encapsulation header** and hands it to the transport layer. Explicit messaging (configuration, MSG instructions, tag reads) rides **TCP port 44818**. Implicit I/O (your cyclic produced/consumed data) rides **UDP port 2222**, because cyclic I/O cares about freshness, not retransmission — a retransmitted stale I/O packet is worse than a dropped one.
- TCP or UDP adds a header with **source and destination ports**. Ports are how one IP address multiplexes many conversations.
- IP adds a header with **source and destination IP addresses** and a TTL. This is the layer routers act on.
- Ethernet adds a frame header with **source and destination MAC addresses** plus a CRC. This is the layer switches act on.

So one implicit I/O packet on the wire is: Ethernet frame containing an IP packet containing a UDP datagram containing an EtherNet/IP encapsulation containing CIP I/O data. A protocol analyzer like Wireshark shows you exactly this nesting, and learning to read it is the single highest-leverage skill from this lesson.

### MAC vs IP: two addresses, two jobs

Every NIC has a burned-in (but spoofable) 48-bit MAC address like 00:1D:9C:xx:xx:xx — that Rockwell OUI prefix you have seen on every 1756-EN2T. MACs only matter within the local L2 segment. IP addresses are logical, assigned by you or DHCP, and are what routing uses to move packets between networks. A frame's MAC addresses get rewritten at every router hop; the IP addresses stay the same end to end (NAT excepted, covered in lesson 4).

### ARP: the glue between L2 and L3

When a device wants to send to an IP on its own subnet, it must learn the MAC behind that IP. It broadcasts an ARP request — "who has 192.168.1.20?" — and the owner replies with its MAC. The result is cached in an ARP table. Security relevance: ARP has zero authentication. Anyone on the segment can answer with a lie (**ARP spoofing/poisoning**) and become a man-in-the-middle between an HMI and a PLC. On a flat plant network, that means one compromised laptop can silently intercept or alter traffic. This is one concrete reason segmentation and managed-switch features like dynamic ARP inspection matter.

### TCP vs UDP behavior

TCP is connection-oriented: three-way handshake (SYN, SYN-ACK, ACK), sequence numbers, retransmission, ordered delivery. UDP is fire-and-forget. This is why a momentary network hiccup stalls an explicit message but just drops an I/O packet and increments your connection fault counter. When IT people talk about "open ports," they mean a service listening for TCP connections or UDP datagrams on a given port number — a port scan is just asking every port whether anyone answers.`,
      bridge: `You have configured RPI values and watched connection timeouts fault an EtherNet/IP I/O tree for 11 years — now you know why implicit I/O is UDP 2222 and explicit messaging is TCP 44818, and what the retry behavior difference actually is. Setting an IP and mask on a 1756-EN2T was operating at L3 without the vocabulary; the unicast/multicast choice on a produced tag was an L2/L3 decision. Next time a connection times out, you can pull a Wireshark capture and read the encapsulation yourself instead of cycling power and hoping.`,
      quiz: [
        {
          id: "net-01-q1",
          q: `EtherNet/IP implicit (cyclic I/O) traffic typically uses which transport, and why?`,
          options: [
            `UDP port 2222, because cyclic data values freshness over guaranteed delivery — a retransmitted stale sample is worthless`,
            `TCP port 44818, because I/O data must never be lost`,
            `UDP port 44818, because UDP is faster and EtherNet/IP only uses one port`,
            `TCP port 502, the standard industrial automation port`
          ],
          answer: 0,
          explain: `Implicit I/O rides UDP 2222: the next RPI cycle supersedes any lost packet, so TCP retransmission would only deliver stale data late. Explicit messaging uses TCP 44818; port 502 is Modbus TCP.`
        },
        {
          id: "net-01-q2",
          q: `As a packet crosses a router from one subnet to another, what happens to its addresses?`,
          options: [
            `The MAC addresses are rewritten at each hop; the source and destination IP addresses stay the same end to end (absent NAT)`,
            `Both the MAC and IP addresses are rewritten at each hop`,
            `The IP addresses are rewritten at each hop; the MAC addresses stay constant end to end`,
            `Nothing changes; routers forward frames untouched`
          ],
          answer: 0,
          explain: `Ethernet/MAC addressing is local to each L2 segment, so each router hop strips and rebuilds the frame. IP addresses are end-to-end logical identifiers and are only altered by NAT.`
        },
        {
          id: "net-01-q3",
          q: `Why is ARP a security concern on a flat plant network?`,
          options: [
            `ARP replies are unauthenticated, so any host on the segment can claim another device's IP and man-in-the-middle HMI-to-PLC traffic`,
            `ARP packets are encrypted, so firewalls cannot inspect them`,
            `ARP consumes so much bandwidth it can starve cyclic I/O`,
            `ARP only works through routers, forcing all traffic off the local segment`
          ],
          answer: 0,
          explain: `ARP has no authentication: a malicious host answers "who has this IP" with its own MAC and intercepts traffic (ARP poisoning). Segmentation and dynamic ARP inspection on managed switches are the mitigations.`
        },
        {
          id: "net-01-q4",
          q: `In common usage, what do the labels L2, L3, L4, and L7 refer to?`,
          options: [
            `Ethernet/MAC switching, IP routing, TCP/UDP ports, and the application protocol (CIP, Modbus, HTTP)`,
            `Cable type, switch model, router model, and firewall model`,
            `Physical wiring, VLANs, encryption, and antivirus`,
            `The four layers of the OSI model`
          ],
          answer: 0,
          explain: `These are OSI layer numbers applied to the TCP/IP reality: L2 is Ethernet frames and MACs, L3 is IP, L4 is TCP/UDP with port numbers, and L7 is the application protocol itself.`
        }
      ]
    },
    {
      id: "net-02",
      title: "IP Addressing and Subnetting Without Tears",
      minutes: 11,
      content: `### IPv4 mechanics

An IPv4 address is 32 bits written as four octets: 192.168.10.55. The subnet mask splits those bits into a **network portion** and a **host portion**. CIDR notation expresses the mask as a count of network bits: /24 means the first 24 bits are network, equivalent to 255.255.255.0. Two addresses are on the same subnet if and only if their network bits match — that is the entire test a device performs to decide "send direct via ARP" versus "send to my default gateway."

### RFC 1918 private ranges

Three blocks are reserved for private networks and are never routed on the public internet:

- 10.0.0.0/8 — 16.7 million addresses, common in large enterprises and plant-wide schemes
- 172.16.0.0/12 — 172.16.0.0 through 172.31.255.255, often used for IDMZ and infrastructure
- 192.168.0.0/16 — the range on practically every machine OEM panel ever shipped

Nearly every OT network you will touch uses these. The classic plant problem: every OEM ships machines on 192.168.1.0/24, so you get 40 machines with identical, overlapping address spaces, glued to the plant network through NAT appliances or, worse, dual-NIC HMIs.

### Worked examples

**A /24:** 192.168.10.0/24. Network address 192.168.10.0, broadcast 192.168.10.255, usable hosts .1 through .254 — 254 hosts. This is the default everyone uses without thinking.

**A /27:** 192.168.10.0/27. The mask is 255.255.255.224; the last octet contributes 3 network bits, leaving 5 host bits = 32 addresses per block, 30 usable. The /27 blocks fall on multiples of 32: .0-.31, .32-.63, .64-.95, and so on. So 192.168.10.33/27 and 192.168.10.62/27 can talk directly (both in the .32-.63 block), but 192.168.10.33/27 and 192.168.10.70/27 cannot — .70 lives in the .64-.95 block and needs a router.

Quick method for any mask: 256 minus the interesting octet's mask value gives the block size. Mask .224 means block size 32. Mask .240 (/28) means block size 16, 14 usable hosts.

### Why boundaries matter for security

A subnet boundary is a natural enforcement point. Traffic within a subnet flows host-to-host through switches with nothing in the path to filter it. Traffic **between** subnets must pass a router or L3 switch — and anywhere there is a routing hop, you can put an ACL or firewall. Carving a plant into one subnet per cell or line means cell-to-cell traffic becomes inspectable and blockable. One giant /16 means a compromised host can reach everything with zero checkpoints.

### Broadcast domains

A broadcast (destination 255.255.255.255 or the subnet broadcast address) reaches every host in the L2 segment. ARP, DHCP discovery, and several industrial discovery mechanisms (including some legacy device-browse functions) are broadcast-based. Broadcast domains scale badly: hundreds of chatty devices in one domain means every NIC processes every broadcast. A misbehaving device emitting a broadcast storm can stall an entire flat network — there are well-documented plant outages from exactly this, where one faulted device's broadcast storm knocked out an entire production area. Smaller subnets = smaller broadcast domains = smaller blast radius for both faults and attacks.

### Common mismatch failure

The classic field bug: device has the right IP but the wrong mask. With a /16 mask on a /24 network, the device believes far-away addresses are local, ARPs for them instead of using its gateway, gets no answer, and the connection silently fails — while pings within the subnet work fine. You have almost certainly chased this without having the vocabulary for it.`,
      bridge: `You have typed IP/mask/gateway into hundreds of PLC and HMI network setup screens — but in controls, the mask is a value you copy from a spec sheet. Subnetting is knowing why it is that value: the mask defines who is ARP-reachable versus who needs the gateway, where the broadcast domain ends, and where a firewall can be inserted. The overlapping-192.168.1.x-OEM-machine problem you have lived with is an addressing-plan failure, and the NAT glue boxes around it are the symptom. Lesson 4 covers that NAT layer properly.`,
      quiz: [
        {
          id: "net-02-q1",
          q: `In 192.168.10.0/27 subnets, can hosts 192.168.10.33/27 and 192.168.10.70/27 communicate directly without a router?`,
          options: [
            `No — /27 blocks are 32 addresses wide, so .33 is in the .32-.63 subnet and .70 is in the .64-.95 subnet`,
            `Yes — both are in 192.168.10.0, so they are on the same network`,
            `Yes — any addresses sharing the first three octets are always on the same subnet`,
            `No — odd and even final octets are always on different subnets`
          ],
          answer: 0,
          explain: `A /27 leaves 5 host bits, so subnets fall on multiples of 32 in the last octet. The hosts are in different blocks and must route through a gateway.`
        },
        {
          id: "net-02-q2",
          q: `Which of these is NOT an RFC 1918 private address range?`,
          options: [
            `172.32.0.0/16`,
            `10.0.0.0/8`,
            `172.16.0.0/12`,
            `192.168.0.0/16`
          ],
          answer: 0,
          explain: `The 172 private block is 172.16.0.0/12, covering only 172.16.x.x through 172.31.x.x. Anything at 172.32 or above is public address space.`
        },
        {
          id: "net-02-q3",
          q: `From a security standpoint, why does carving a plant into multiple subnets matter?`,
          options: [
            `Inter-subnet traffic must cross a routing hop, which creates an enforcement point where ACLs or firewalls can filter traffic`,
            `Smaller subnets encrypt traffic automatically`,
            `Subnetting hides device MAC addresses from attackers`,
            `Multiple subnets increase total available bandwidth`
          ],
          answer: 0,
          explain: `Within a subnet, traffic flows switch-to-switch with nothing filtering it. Between subnets there is always a router or L3 switch in the path — and that is where you enforce policy.`
        },
        {
          id: "net-02-q4",
          q: `A PLC has the correct IP for its /24 network but is misconfigured with a /16 mask. What is the likely symptom?`,
          options: [
            `It can reach local subnet devices but silently fails to reach remote subnets, because it ARPs for far addresses it wrongly believes are local instead of using its gateway`,
            `It cannot communicate with anything at all`,
            `It works normally, since the mask only affects broadcast traffic`,
            `It floods the network with DHCP requests`
          ],
          answer: 0,
          explain: `An oversized mask makes the device treat remote addresses as on-link. It ARPs for them directly, no one answers, and the traffic never goes to the gateway — local comms keep working, which makes it a maddening field bug.`
        }
      ]
    },
    {
      id: "net-03",
      title: "Switching, VLANs, and the Problem with Flat Plant Networks",
      minutes: 10,
      content: `### What a switch actually does

An Ethernet switch is an L2 device. It learns which MAC addresses live on which physical ports by reading source MACs from incoming frames, builds a MAC address table, and forwards each frame only out the port where the destination MAC lives. Unknown destinations and broadcasts get flooded to all ports. That MAC learning is automatic and unauthenticated — which enables attacks like MAC flooding (overflow the table so the switch floods everything like a hub) and lets a quietly plugged-in laptop see flooded traffic.

### VLANs: virtual segmentation on shared hardware

A VLAN (Virtual LAN) splits one physical switch into multiple logical switches. Ports assigned to VLAN 10 cannot exchange frames with ports in VLAN 20 — to the devices, they are separate networks, even on the same chassis. Each VLAN is its own broadcast domain and, by convention, maps to its own IP subnet (VLAN 10 = 192.168.10.0/24, VLAN 20 = 192.168.20.0/24). Crossing VLANs requires routing (lesson 4), which is exactly the point: VLANs create the boundaries, routing creates the controlled crossings.

### 802.1Q tagging, access ports, trunk ports

How do VLANs survive across multiple switches? **802.1Q tagging** inserts a 4-byte tag into the Ethernet frame header carrying the VLAN ID (1-4094) and a priority field.

- An **access port** belongs to one VLAN. Frames in and out are untagged; the end device (PLC, HMI, drive) never knows VLANs exist. Your devices plug into access ports.
- A **trunk port** carries multiple VLANs simultaneously, with each frame tagged so the far switch knows which VLAN it belongs to. Switch-to-switch uplinks are trunks.
- The **native VLAN** on a trunk is the one VLAN carried untagged. Misconfigured native VLANs enable VLAN-hopping tricks, which is why hardening guides say to set the native VLAN to an unused ID and never use VLAN 1 for anything.

One critical honesty point: a VLAN is a logical control enforced by switch configuration, not a physical barrier. VLAN misconfiguration, VLAN hopping, or a compromised switch defeats it. For high-consequence separation (safety systems, for example), standards and common practice push toward physically separate infrastructure or at least firewalled boundaries, not VLANs alone.

### Why flat plant networks are a problem

The typical brownfield plant network grew organically: one big /16, unmanaged switches daisy-chained inside panels, everything reachable from everything. The consequences:

- **No blast radius control.** Malware that lands on one engineering workstation can reach every PLC in the facility. Ransomware events repeatedly demonstrate this — a flat network turns one infected host into a plant-wide incident.
- **One giant broadcast domain.** A faulted NIC or misconfigured device broadcasting at line rate degrades everything. Real outages have happened this way.
- **No visibility.** With unmanaged switches, you cannot mirror traffic to an IDS, see port-level statistics, or even know what is plugged in where.
- **No enforcement points.** There is nowhere to put a rule that says the vision system network has no business writing to safety PLCs.

### Managed vs unmanaged switches on the plant floor

Unmanaged switches are cheap, configuration-free, and invisible — no VLANs, no diagnostics, no port mirroring, no security features. Managed switches (industrial lines like Cisco IE series, Rockwell Stratix — which is Cisco inside — Hirschmann, Moxa, Siemens Scalance) give you VLANs, SNMP monitoring, port security (limit which MACs may use a port), SPAN/mirror ports for passive monitoring, IGMP snooping (essential for constraining EtherNet/IP multicast I/O), QoS for prioritizing motion traffic, and login auditing. The unglamorous reality of OT security programs: a large early line item is replacing in-panel unmanaged switches with managed ones, because almost every monitoring and segmentation capability depends on it.`,
      bridge: `You have specified Stratix switches in panel designs and configured IGMP snooping so multicast produced/consumed traffic does not flood the cell — that was VLAN-era engineering even if nobody called it security. The daisy-chained unmanaged switches inside OEM panels you have inherited are exactly the visibility gap this lesson describes: no SPAN port means no passive monitoring, period. Your panel-design role gives you a lever most security people lack — you can put managed switches and a sane VLAN plan into the build spec before the machine ever ships.`,
      quiz: [
        {
          id: "net-03-q1",
          q: `What is the difference between an access port and a trunk port?`,
          options: [
            `An access port carries one VLAN untagged for an end device; a trunk port carries multiple VLANs using 802.1Q tags, typically between switches`,
            `An access port is for administrators; a trunk port is for regular users`,
            `A trunk port is any port faster than 1 Gbps`,
            `Access ports use fiber; trunk ports use copper`
          ],
          answer: 0,
          explain: `End devices plug into access ports and never see VLAN tags. Trunks carry many VLANs between switches, with each frame tagged so the receiving switch can sort it into the right VLAN.`
        },
        {
          id: "net-03-q2",
          q: `Which is a genuine security consequence of a flat plant network?`,
          options: [
            `Any single compromised host can reach every device in the facility, with no enforcement points in between to block or detect lateral movement`,
            `IP addresses expire faster on flat networks`,
            `Flat networks prevent the use of static IP addresses`,
            `PLC scan times increase because routers are absent`
          ],
          answer: 0,
          explain: `Flat means no boundaries: no routing hops, so nowhere to enforce policy and no containment. One infected engineering laptop becomes a plant-wide exposure — the recurring pattern in OT ransomware incidents.`
        },
        {
          id: "net-03-q3",
          q: `Why do OT security programs push to replace unmanaged switches with managed ones?`,
          options: [
            `Managed switches provide the foundations security depends on: VLANs, port security, SPAN ports for passive monitoring, and diagnostics`,
            `Unmanaged switches cannot pass EtherNet/IP traffic`,
            `Managed switches encrypt all traffic by default`,
            `Unmanaged switches are illegal under IEC 62443`
          ],
          answer: 0,
          explain: `Almost every segmentation and visibility capability — VLANs, mirroring traffic to an IDS, knowing what is plugged in where — requires a managed switch. Unmanaged switches are blind spots.`
        },
        {
          id: "net-03-q4",
          q: `Is a VLAN by itself a sufficient barrier for separating a safety system from the rest of the plant network?`,
          options: [
            `No — a VLAN is a logical control defeated by misconfiguration, VLAN hopping, or switch compromise; high-consequence separation calls for firewalled boundaries or physically separate infrastructure`,
            `Yes — VLAN separation is physically equivalent to separate cables`,
            `Yes — as long as the VLAN ID is kept secret`,
            `No — because VLANs only work on unmanaged switches`
          ],
          answer: 0,
          explain: `VLANs are enforced in switch software and configuration. They are a good segmentation tool but not a physical barrier, so safety and other high-consequence systems warrant stronger separation.`
        }
      ]
    },
    {
      id: "net-04",
      title: "Routing, L3 Switches, and NAT",
      minutes: 10,
      content: `### The default gateway, properly understood

Every IP device makes one decision per packet: is the destination on my subnet (per my mask) or not? On-subnet means ARP for the MAC and send direct. Off-subnet means send the frame to the **default gateway's** MAC, with the final destination still in the IP header. The gateway — a router or L3 switch interface — looks up the destination in its routing table and forwards. That gateway field you have filled in on a thousand device config screens is simply "the router I hand off-subnet traffic to."

### Routing tables and static routes

A routing table maps destination networks to next hops: "to reach 192.168.30.0/24, send to 10.1.1.1." Routes get there three ways: **connected** routes (subnets on the router's own interfaces), **static** routes (typed in by an admin), and **dynamic** routes (learned via protocols like OSPF or BGP). OT networks are small and stable enough that static routing is common and often preferable — predictable, auditable, no protocol chatter to spoof. A **default route** (0.0.0.0/0) is the catch-all "everything else goes here." Routers choose the **most specific match**: a /24 route beats the default route for addresses it covers. Security angle: in OT, deliberately NOT having a default route toward the internet on cell-zone routers is a control — devices physically cannot reach addresses nobody defined a path to.

### Inter-VLAN routing and L3 switches

VLANs isolate; routing reconnects on your terms. Two patterns:

- **Router-on-a-stick:** one router interface trunked to the switch, with a logical subinterface per VLAN. Fine for small sites, bottlenecked by that one link.
- **L3 switch:** a switch with routing capability. You create an **SVI** (switched virtual interface) per VLAN — VLAN 10 gets interface 192.168.10.1, which is the default gateway for everything in VLAN 10 — and the switch routes between VLANs in hardware at wire speed.

L3 switches are the workhorse of plant network design. Crucially, most support **ACLs** (access control lists) applied to SVIs, so the same box that routes between the line VLAN and the supervisory VLAN can also enforce "only the SCADA server may initiate connections to the PLC VLAN, only on TCP 44818." That is segmentation with teeth, one lesson before we get to real firewalls.

### NAT basics

**Network Address Translation** rewrites IP addresses (and usually ports) as traffic crosses a boundary. Variants you will meet:

- **Source NAT / PAT (port address translation):** many inside hosts share one outside address, distinguished by port — how your home router works, and how plant networks reach enterprise services without exposing internal addressing.
- **Static NAT / 1:1 NAT:** a fixed mapping, one outside address per inside host. This is what those machine-mounted NAT appliances do: every OEM cell can stay at its shipped 192.168.1.x addressing internally, while the plant sees each machine at a unique 10.x address. It solves the overlapping-OEM-subnet problem without retagging every device in the machine.

NAT trade-offs matter in OT. It breaks protocols that embed IP addresses in their payload unless the NAT device understands them, complicates troubleshooting (the address in your Wireshark capture depends on which side you captured), and wrecks asset inventory accuracy — your monitoring tool sees the NAT address, not the real device. And a hard truth worth internalizing: **NAT is not a security control.** It hides addressing, but a permitted inbound mapping is a path in, and hiding is not filtering. Treat NAT as an addressing tool; use ACLs and firewalls for enforcement.

### Reading a path end to end

Tie it together: HMI in VLAN 20 writes a setpoint to a PLC in VLAN 10. HMI checks its mask — PLC is off-subnet — sends the frame to its gateway SVI on the L3 switch. The switch checks the ACL on the SVI, permits TCP 44818 from this HMI, routes the packet, ARPs for the PLC in VLAN 10, rewrites the frame, and delivers it. Every step is now a place where you can enforce, log, or fail — and that path-level understanding is what lets you troubleshoot and secure the same network.`,
      bridge: `Those machine-level NAT boxes you have deployed to make duplicate OEM 192.168.1.x cells coexist on one plant network — that is static 1:1 NAT, and now you can name the costs: broken asset visibility, capture-point-dependent addresses, and zero actual filtering. The gateway field on a PLC NIC config is the routing handoff. The design move to internalize as you go from machine-level to plant-level thinking: an L3 switch with one SVI per cell VLAN, ACLs on each SVI, and static routes only where traffic genuinely needs to go.`,
      quiz: [
        {
          id: "net-04-q1",
          q: `What does the default gateway setting on a PLC actually do?`,
          options: [
            `It is the router interface where the PLC sends any traffic destined outside its own subnet, as determined by its subnet mask`,
            `It is the address of the DNS server the PLC uses for name lookups`,
            `It encrypts traffic leaving the local subnet`,
            `It is the switch port the PLC is physically connected to`
          ],
          answer: 0,
          explain: `The device makes one decision per packet: on-subnet traffic is ARPed and sent direct; everything else is handed to the default gateway, which routes it onward via its routing table.`
        },
        {
          id: "net-04-q2",
          q: `What is an SVI on an L3 switch?`,
          options: [
            `A virtual routed interface assigned to a VLAN — it serves as that VLAN's default gateway and is where inter-VLAN routing and ACLs are applied`,
            `A dedicated fiber uplink port`,
            `A backup power module for the switch`,
            `A protocol for synchronizing switch clocks`
          ],
          answer: 0,
          explain: `A switched virtual interface gives a VLAN an IP gateway on the switch itself, enabling wire-speed inter-VLAN routing and a natural attachment point for access control lists.`
        },
        {
          id: "net-04-q3",
          q: `Why do plants deploy 1:1 static NAT appliances on OEM machines, and what is the main security caveat?`,
          options: [
            `They let identically addressed 192.168.1.x machines coexist on one plant network — but NAT only hides addressing; it does not filter traffic, so it is not a security control`,
            `They encrypt machine traffic — the caveat is the performance cost`,
            `They are required for EtherNet/IP to function across switches — no caveat`,
            `They block all inbound traffic permanently — the caveat is no remote access is ever possible`
          ],
          answer: 0,
          explain: `Static NAT maps each machine's shipped internal addressing to unique plant addresses, avoiding a full re-IP of every device. But a permitted NAT mapping is a path in; enforcement still requires ACLs or a firewall.`
        },
        {
          id: "net-04-q4",
          q: `Why is deliberately omitting a default route from a cell-zone router considered a security control in OT?`,
          options: [
            `Devices in that zone cannot reach any network without an explicitly defined route, so internet-bound or unexpected traffic has no path and is dropped`,
            `It makes the router consume less power`,
            `It forces all traffic to use IPv6 instead`,
            `It prevents ARP poisoning within the cell`
          ],
          answer: 0,
          explain: `No default route means "everything else" has nowhere to go. Combined with specific static routes for sanctioned destinations, the network topology itself enforces that controllers cannot call out to arbitrary addresses.`
        }
      ]
    },
    {
      id: "net-05",
      title: "Firewalls and ACLs: Default Deny as a Way of Life",
      minutes: 11,
      content: `### Stateless filtering: ACLs

The simplest filter is a **stateless ACL**: a list of rules matching on source/destination IP, protocol, and port, evaluated top-down, first match wins. "Permit 192.168.20.10 to 192.168.10.0/24 TCP 44818; deny all." Stateless means each packet is judged alone, with no memory of the conversation — so you have to write rules for return traffic too, and crafted packets that look like replies can slip through. ACLs on L3 switches are fast and great for coarse inter-VLAN policy, but they are a blunt instrument.

### Stateful firewalls

A **stateful firewall** tracks connections. When an HMI opens TCP 44818 to a PLC, the firewall records the session in a state table and automatically permits the return traffic for that session only. Unsolicited inbound packets matching no session are dropped regardless. This collapses rule complexity (you write rules for who may **initiate**, and replies take care of themselves) and defeats the spoofed-reply problem. Stateful inspection is the baseline for anything called a firewall today.

### Next-generation firewalls and DPI

**NGFWs** (Palo Alto, Fortinet FortiGate, Cisco Firepower, Check Point) add application awareness via **deep packet inspection** — examining payloads, not just headers. An NGFW can tell HTTP from SSH-over-port-80, enforce policy per application and per user identity, and run intrusion prevention signatures inline.

The OT-relevant evolution is **industrial protocol-aware DPI**. Products in this space (Fortinet and Palo Alto with OT-aware app signatures; dedicated industrial firewalls like Cisco ISA-3000, Hirschmann EAGLE, Phoenix Contact mGuard; Tofino historically as the category-defining example) parse Modbus, CIP, DNP3, S7, and OPC UA at the function level. The difference is profound. A port-level rule says "permit TCP 502" — which permits **everything** Modbus can do, including writes and firmware-level commands. Protocol-aware DPI can say: permit Modbus **function code 3 (read holding registers)** from the historian, deny function codes 5, 6, 15, 16 (writes) entirely from that source. For CIP, the analogous policy is permitting read services while denying writes, configuration services, and the unauthenticated stop/reset services that tools like the ones abused by the INDUSTROYER and Pipedream/INCONTROLLER malware families weaponize. Read-only enforcement at the protocol level is one of the few controls that can protect a controller that itself has zero authentication.

### Rule design: default deny

The discipline that separates real firewall policy from theater:

1. **Default deny.** The last rule is deny-all-log-all. Everything permitted is an explicit, documented exception.
2. **Specific rules.** Source, destination, protocol, port — narrow. "Any" in a field is a finding, not a rule.
3. **Document intent.** Every rule carries a comment: what it is for, who owns it, review date. Firewall configs rot exactly like uncommented PLC code.
4. **Log denies (and sensitive permits).** Denied traffic at an OT boundary is free threat intelligence: something tried to go where it should not.
5. **Review periodically.** Rules outlive the projects that created them. Annual rule review is a standard audit expectation.

The honest caveat: default deny is the goal state. Brownfield reality is that you often start a new firewall in **monitor/learn mode** — permit and log everything, baseline the real flows for a few weeks, then ratchet down. Dropping a default-deny firewall into a live production network without baselining is how security teams cause the outage they were hired to prevent.

### Where firewalls go in OT

Standard placements, roughly in order of value: (1) the **IT/OT boundary** — the big one, anchoring the IDMZ (next lesson); (2) **between OT zones** — supervisory to cell, cell to cell, wherever consequence justifies it; (3) **in front of high-consequence equipment** — a palm-sized DIN-rail industrial firewall inside the panel ahead of a safety PLC or a legacy unpatchable system, often run in transparent (bridging) mode so it filters without re-addressing anything; (4) wrapping **third-party/OEM equipment** you do not fully control. What you generally do NOT do is put a firewall inside a motion control loop — latency-critical implicit I/O within a cell stays inside its zone, and the firewall sits at the zone edge.`,
      bridge: `You know that a Modbus write to the wrong holding register or an out-of-sequence CIP service can wreck a process — that intuition is exactly what protocol-aware DPI encodes into policy. Where IT firewall admins see "TCP 502, permit or deny," you can specify which function codes the historian legitimately needs (read-only: FC 3, FC 4) and deny the write codes outright. Transparent-mode DIN-rail firewalls also fit your world mechanically: they mount in the panel you design, ahead of the controller, with no re-addressing — a line item you can put on a panel BOM today.`,
      quiz: [
        {
          id: "net-05-q1",
          q: `What does a stateful firewall do that a stateless ACL does not?`,
          options: [
            `It tracks connection state, automatically permitting return traffic for established sessions and dropping unsolicited packets that match no session`,
            `It inspects the application payload of every packet`,
            `It encrypts traffic between zones`,
            `It assigns IP addresses to protected devices`
          ],
          answer: 0,
          explain: `Stateful inspection keeps a session table: you write rules for who may initiate, replies are matched to sessions automatically, and spoofed "reply" packets with no session are dropped. Payload inspection is DPI, a further step.`
        },
        {
          id: "net-05-q2",
          q: `Why is industrial protocol-aware DPI more useful at an OT boundary than a port-based rule like "permit TCP 502"?`,
          options: [
            `A port-based rule permits everything the protocol can do, including writes; protocol-aware DPI can permit read function codes while denying write and configuration commands`,
            `Port-based rules cannot match Modbus traffic at all`,
            `DPI makes the traffic faster by compressing it`,
            `Port 502 is reserved for EtherNet/IP, so the rule would be wrong`
          ],
          answer: 0,
          explain: `Permitting TCP 502 permits reads, writes, and diagnostics alike. Function-code-level filtering (e.g., allow FC 3 reads, deny FC 6/16 writes) enforces read-only access to controllers that have no authentication of their own.`
        },
        {
          id: "net-05-q3",
          q: `What is the correct posture for the final rule in an OT boundary firewall policy?`,
          options: [
            `Deny all and log it — every permitted flow above it should be an explicit, documented exception`,
            `Permit all, so production traffic is never accidentally blocked`,
            `Deny all without logging, to save disk space`,
            `Permit all traffic from RFC 1918 addresses, since those are internal`
          ],
          answer: 0,
          explain: `Default deny with logging is the foundation of real firewall policy. Logged denies at an OT boundary double as detection — something attempted a path it should not have.`
        },
        {
          id: "net-05-q4",
          q: `Why do teams typically run a newly installed OT firewall in monitor/learn mode before enforcing default deny?`,
          options: [
            `Brownfield plants have undocumented legitimate flows; baselining real traffic for weeks prevents the firewall cutover itself from causing a production outage`,
            `Firewalls legally require a 30-day burn-in period`,
            `Monitor mode is needed to charge the firewall's internal battery`,
            `Default deny cannot be configured until the firewall has seen at least one attack`
          ],
          answer: 0,
          explain: `Years of organic growth mean nobody knows every flow the process depends on. Permit-and-log first, build the rule set from observed reality, then ratchet to default deny during a controlled window.`
        }
      ]
    },
    {
      id: "net-06",
      title: "The IDMZ: Brokering IT and OT Without Direct Connections",
      minutes: 11,
      content: `### The core rule

A DMZ (demilitarized zone) is a buffer network between two trust zones. The **industrial DMZ (IDMZ)** sits between the enterprise network (Purdue Levels 4-5) and the OT network (Levels 3 and below), and it exists to enforce one rule worth tattooing on every architecture diagram: **no session originates in IT and terminates in OT, or vice versa.** Everything is brokered. IT talks to a system in the IDMZ; that system talks to OT. Two firewall policy legs (or two physical firewalls from different vendors, in higher-assurance designs), and the IDMZ host in the middle is the only thing exposed to both sides.

Why so absolute? Because the IT network is assumed compromised — phishing, commodity malware, ransomware all land there first. If the MES, the historian clients, and the ERP all have direct TCP sessions into Level 2/3, then IT compromise IS OT compromise, immediately. The IDMZ converts "attacker on the office network" from a plant-down event into a contained one. Ransomware case studies across manufacturing keep validating this: companies with a real IDMZ shut the conduits and kept producing; companies without one shut the plant.

### What lives in an IDMZ

- **Historian replica / data concentrator.** The pattern that matters most. The Level 3 historian collects from OT; a replica in the IDMZ mirrors it (historian-to-historian replication, initiated from the OT side outward); enterprise users and MES dashboards read the replica. Nobody from IT ever touches the source.
- **Patch and update staging — WSUS/SUP replicas, AV/EDR signature mirrors.** OT Windows boxes (HMI servers, engineering workstations, historians) must get updates without reaching out to the internet or to enterprise infrastructure. A downstream WSUS replica in the IDMZ pulls from upstream; OT pulls from it, on OT's validation schedule.
- **Jump servers / remote access gateways.** Covered fully next lesson: remote users land on a hardened intermediary in the IDMZ, never directly on OT assets.
- **Secure file transfer.** A managed transfer server or one-way drop so recipes, PLC program files, and reports cross the boundary through a scanned, logged, audited channel — the alternative is USB sticks and email, which is how plenty of OT malware historically arrived.
- **Reverse proxies / protocol brokers** for unavoidable application integrations (MES connectors, OPC UA gateways), so the OT-side service is never directly exposed.

What does NOT belong in the IDMZ: anything that controls the process, any PLC/controller comms, safety systems, domain controllers for the OT domain (those live in Level 3), and anything nobody can name an owner for. The IDMZ is a broker layer, not a junk drawer.

### Data diodes

When policy or consequence demands that data flow out of OT but nothing — no packet, no ACK, ever — flows in, a **data diode** (unidirectional gateway; vendors include Owl Cyber Defense and Waterfall Security) enforces one-way transfer physically, classically via an optical link with a transmitter on one side and only a receiver on the other. Software proxies on each side rebuild the protocol conversation, since TCP cannot work without return traffic. Diodes are common in nuclear, power, and defense; in manufacturing they appear where IP protection or regulatory posture justifies the cost and the operational friction (one-way means no remote anything through that path). Honest framing: for most medical device manufacturing, a well-built brokered IDMZ is the practical standard, and a diode is a deliberate high-assurance upgrade for specific flows, not the default.

### Failure modes to watch for

The IDMZ fails in predictable ways: **bypass paths** (a dual-NIC engineering workstation bridging both sides, an LTE modem in a vendor panel, an old site-to-site rule from a forgotten project); **scope creep** (the IDMZ accumulating direct pass-through rules until it is decoration); and **soft middles** (a hard boundary but a flat Level 3 behind it). When you assess a plant, the architecture diagram shows the IDMZ; the switch configs and firewall rule bases show the truth.`,
      bridge: `You have lived the demand side of this: MES wants OEE data off your lines, quality wants batch records, and the path of least resistance was always a direct SQL connection from an enterprise box to the Level 3 historian or even an HMI runtime. The historian-replica pattern is the disciplined answer — and your software version traceability program is a head start, because brokered file transfer for PLC programs needs exactly the artifact control you already run. Watch for the bypasses you have personally created as an integrator: the dual-homed engineering laptop and the vendor cell modem are the classic IDMZ end-runs.`,
      quiz: [
        {
          id: "net-06-q1",
          q: `What is the defining traffic rule of a properly built IDMZ?`,
          options: [
            `No session originates on one side (IT or OT) and terminates on the other — all cross-boundary exchange is brokered by hosts inside the IDMZ`,
            `All IT-to-OT traffic must use encrypted protocols`,
            `Only traffic on ports above 1024 may cross the boundary`,
            `OT may initiate sessions into IT, but never the reverse`
          ],
          answer: 0,
          explain: `The IDMZ is a broker layer: IT talks to IDMZ hosts, IDMZ hosts talk to OT. Encryption is good practice but does not address the core problem — direct sessions make IT compromise equal OT compromise.`
        },
        {
          id: "net-06-q2",
          q: `How does the historian replica pattern protect the OT network?`,
          options: [
            `Enterprise users read from a replica in the IDMZ, fed by replication initiated from the OT side, so no enterprise system ever opens a connection to the Level 3 source historian`,
            `It encrypts the historian database at rest`,
            `It deletes process data after 24 hours so attackers find nothing`,
            `It moves the only historian into the enterprise network where IT can patch it`
          ],
          answer: 0,
          explain: `The replica gives IT and MES all the data they need while keeping every inbound path to Level 3 closed. The replication session originates from OT outward, preserving the no-inbound rule.`
        },
        {
          id: "net-06-q3",
          q: `What does a data diode provide that a firewall cannot?`,
          options: [
            `Physically enforced one-way data flow — there is no hardware path for any packet to travel back into the protected network, independent of configuration or compromise`,
            `Faster throughput than any firewall`,
            `Inspection of Modbus function codes`,
            `Automatic patching of devices behind it`
          ],
          answer: 0,
          explain: `A firewall's one-way rule is software that can be misconfigured or subverted; a diode's transmit-only optical hardware cannot pass return traffic at all. The cost is operational: nothing interactive works across it.`
        },
        {
          id: "net-06-q4",
          q: `Which of these is a classic real-world bypass that quietly defeats an IDMZ?`,
          options: [
            `A dual-NIC engineering workstation connected to both the OT network and the enterprise network at the same time`,
            `A historian replica receiving one-way replication`,
            `A WSUS replica serving patches to OT Windows hosts`,
            `A jump server requiring MFA in the IDMZ`
          ],
          answer: 0,
          explain: `A dual-homed machine is a routable bridge around every boundary control. The other three options are exactly what an IDMZ is supposed to contain.`
        }
      ]
    },
    {
      id: "net-07",
      title: "DNS, DHCP, NTP, and Secure Remote Access",
      minutes: 11,
      content: `### DNS: names to addresses

DNS resolves names (historian01.plant.example.com) to IP addresses, via a hierarchy of resolvers and authoritative servers, over UDP/TCP 53. Plant-floor devices mostly bypass it — your PLC comms are static-IP for determinism, and that is correct. But the Windows layer of OT (HMI servers, historians, engineering workstations, the OT domain) depends on DNS, and it matters to security twice over. First, **DNS as detection**: malware has to find its command-and-control somehow, and a Level 3 historian suddenly resolving random external domains is a screaming indicator — OT DNS logs are cheap, high-signal telemetry. Second, **DNS as control**: OT hosts should resolve only against a designated internal DNS (typically the OT domain controllers at Level 3), with no path to external resolvers. A device on the controls network querying 8.8.8.8 directly is either misconfigured or compromised; the boundary firewall should block and log outbound 53 from OT regardless.

### DHCP: automatic addressing

DHCP hands out IP configuration via a broadcast DORA exchange (Discover, Offer, Request, Acknowledge — UDP 67/68). Controls practice is static addressing for anything a controller talks to, and that holds. DHCP in OT is legitimately useful for transient things like vendor laptops in a maintenance VLAN. Two security notes: a **rogue DHCP server** (a misconfigured or malicious device answering Discovers first) can hand out a poisoned gateway or DNS server and silently man-in-the-middle a whole segment — managed switches counter this with **DHCP snooping**, which only trusts Offers from designated ports. And DHCP **reservations** (fixed IP by MAC) give you central records with static behavior — useful for the printers-and-laptops tier of OT, never a substitute for true static config on controllers.

### NTP: why time sync is a security control

Network Time Protocol (UDP 123) synchronizes clocks against a hierarchy of sources (stratum levels, GPS at the top of an isolated plant's hierarchy). You already care for sequence-of-events and batch records. Security adds the forensic argument: incident investigation is the act of correlating logs from firewalls, Windows hosts, switches, and historians into one timeline. If clocks are minutes apart — or one HMI is still on local time with no sync — you cannot establish what happened in what order, and in a regulated environment your audit trail integrity (21 CFR Part 11 territory you know well) is questionable too. Architecture: one or two NTP sources for the OT zone (commonly a GPS-disciplined appliance or the OT domain controllers), everything syncs to them, and the boundary blocks OT devices from reaching arbitrary internet time servers.

### VPNs and the remote access problem

A **VPN** builds an encrypted tunnel over an untrusted network — IPsec or TLS-based — so a remote user or site appears logically inside. The hard lesson of OT security: a VPN authenticates and encrypts the pipe, but it says nothing about what the far end does once inside. A vendor VPN that lands users directly on the controls VLAN is a hole with extra steps — if the vendor's laptop is compromised, the tunnel delivers the attacker politely and encrypted. Real incidents, including the widely reported 2021 Oldsmar water treatment intrusion, have centered on poorly controlled remote access software like shared-credential TeamViewer.

The pattern that works — **jump server / bastion in the IDMZ**:

1. Remote user authenticates to a VPN or remote-access gateway with **MFA**, landing only in the IDMZ.
2. They get an interactive session (RDP or vendor-specific) on a hardened **jump host**, which is the only machine allowed through the OT firewall — and only to the specific cell, specific ports, specific time window.
3. Sessions are **recorded**, access is **time-boxed and per-person** (no shared "vendor1" logins), and ideally **operations approves activation** per session — nobody touches a line remotely without the plant knowing.

Purpose-built OT remote access products (Claroty xDome Secure Access, Cyolo, Dispel, and similar) package this brokered, recorded, just-in-time model. The cellular modems OEMs ship inside panels for warranty support are the anti-pattern: an unmanaged boundary bypass invisible to every firewall you own. Contract language and acceptance testing should require OEM remote access to terminate at YOUR gateway, on your identity, your MFA, your recording — or not exist.`,
      bridge: `You have been on the OEM side of this pain: machine down, customer screaming, and you needed remote access through whatever the plant allowed — or you shipped panels with a cell modem because the plant's process took three weeks. Now you set the policy you used to work around. Your move as a leader: bake brokered remote access into vendor contracts and machine acceptance specs, the same way you spec panel wiring standards. And the NTP point lands directly on your FDA world — log timeline integrity is the security twin of the audit-trail requirements you already enforce for batch records.`,
      quiz: [
        {
          id: "net-07-q1",
          q: `Why are DNS logs from the OT environment valuable for security monitoring?`,
          options: [
            `Malware must locate its command-and-control infrastructure, so an OT host resolving unexpected external domains is a high-signal compromise indicator`,
            `DNS logs record every PLC tag write with its value`,
            `DNS traffic contains the passwords of users who log in`,
            `DNS logs prove that NTP is working correctly`
          ],
          answer: 0,
          explain: `OT hosts have a small, predictable set of legitimate name lookups. External or algorithmically generated domain queries from a historian or HMI server stand out immediately — cheap telemetry, high signal.`
        },
        {
          id: "net-07-q2",
          q: `What attack does DHCP snooping on managed switches mitigate?`,
          options: [
            `A rogue DHCP server answering clients with a malicious gateway or DNS server, enabling man-in-the-middle of the segment`,
            `Brute-force password guessing against the switch console`,
            `ARP requests being dropped during broadcast storms`,
            `Exhaustion of the NTP stratum hierarchy`
          ],
          answer: 0,
          explain: `DHCP snooping only trusts DHCP server responses arriving on designated uplink ports, so an unauthorized device answering Discover broadcasts cannot poison clients' gateway or DNS settings.`
        },
        {
          id: "net-07-q3",
          q: `Why is accurate NTP synchronization considered a security control, not just an operations nicety?`,
          options: [
            `Incident forensics requires correlating logs from many systems into one ordered timeline, which is impossible when clocks disagree — and audit trail integrity depends on trustworthy timestamps`,
            `NTP encrypts log files in transit`,
            `Attackers cannot connect to devices whose clocks are synchronized`,
            `NTP automatically rotates passwords on schedule`
          ],
          answer: 0,
          explain: `Reconstructing an incident means lining up firewall, host, switch, and historian logs by time. Skewed clocks make sequence-of-events unprovable — a forensic failure and, in regulated environments, an audit-trail problem.`
        },
        {
          id: "net-07-q4",
          q: `What is wrong with a vendor VPN that terminates directly on the controls VLAN?`,
          options: [
            `The VPN only secures the pipe — a compromised vendor laptop arrives encrypted and authenticated with direct reach to controllers; access should instead land on a monitored jump host in the IDMZ with MFA, per-person accounts, and session recording`,
            `Nothing, as long as the VPN uses strong encryption`,
            `VPN encryption corrupts EtherNet/IP packets`,
            `Vendors are legally prohibited from using VPNs`
          ],
          answer: 0,
          explain: `Encryption and authentication of the tunnel say nothing about the endpoint's integrity or what it does inside. Brokered access through a recorded, time-boxed jump host limits and watches what the remote session can touch.`
        }
      ]
    }
  ]
});
