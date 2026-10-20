# Playbooks: creation and application — competitive research and what to build

17 Oct 2026 · internal · competitor columns are directional (help centres for Harvey, Legora and GC AI are login-walled; Ivo's is public).

**Persona.** In-house counsel reviewing inbound commercial contracts (NDA, MSA, DPA, order forms), and the General Counsel who owns the playbook. Secondary: legal ops (keeps playbooks healthy), the business requester (wants a yes fast).

**The primitive.** A playbook is a set of positions per issue — a starting position, ordered fallbacks and a line we will not cross — plus when it applies, why it exists, and who decides when the contract is outside it. Applying it means reading a contract clause by clause, classifying each against those positions, and proposing the redline, the comment and the escalation.

---

## 1. Where the market is (Oct 2026)

| Player | What they are now, in one line |
|---|---|
| **Harvey** | Most complete. Playbook Builder (Aug 26) drafts rules from your form + executed deals + old playbook, each rule cited to its source; Strict/Permissive runs in Word; "not covered by playbook" bucket; Creator/Manager roles; Contract Review Agents (Sep 26, early access) triage incoming redlines and benchmark against executed deals; Contract Intelligence claims playbooks update from signed deals (waitlist). |
| **Legora** | Platform play (aOS, Agent, Skills, Intake, Portal). Playbooks defined once on web, run in Word with cited tracked changes. Oct 26: playbooks become portable **Skills**, Intake marks up inbound contracts against playbooks with autonomy set per request type, Portal publishes playbook review to clients. Very little public detail on rule anatomy. |
| **Microsoft** | **Copilot for Legal GA 15 Oct 26** — Legal plugin in Word + Cowork plugin with `create-playbook`, `review-contract`, `summarize-redlines`, `check-defined-terms`… Upload a .docx playbook → topics/rules/examples you can edit → Run Review → tracked changes, Accept with Comment. No playbook object, versions, owners, fallback tiers or escalation. Word desktop only. Free-ish for every M365 Copilot tenant: the floor everyone is now measured against. |
| **GC AI** | Best authoring ergonomics. A check = standard / fallback / walk-away + **applies when** (EU only, above $X) + importance + **private steering commentary** + stock comment + example language. Easy Playbooks from 2–3 docs; in-chat editing with an approval card per change; **Smart Check** promotes a finding into the playbook; playbook runs via API priced per check. Thin on negotiation and approvals. |
| **Ivo** | Best judgment in applying. Positions as plain-language blocks; **Triggers** ask deal-context questions that pick the fallback; one agent per topic + a reconciler; stack up to 3 playbooks; **Benchmarks** against your own executed deals as a percentile; **Comment-aware review** replies in comment threads. **Collaborate** (Aug 26, early access): Settle / Counter / Escalate issue cards, turn-based versions, re-review of the returned turn, plain-language routing, auto-approval of clean agreements, DocuSign. |
| **Others** | Ironclad certifies a playbook against hand-redlined agreements before go-live and measures grounding/coverage; Screens (Agiloft) publishes accuracy method and routes unmet standards to approvers; LegalOn: 135+ attorney playbooks, rules shown next to their source text; Spellbook: Compare to Market; Luminance: counterparty memory + autonomous NDA negotiation; Juro: accept/reject/reply/counter per counterparty change; BlackBoiler: every redline explained by past edits + a validator before it lands; Definely: definitions and cross-reference integrity. Robin AI wound down (team to Microsoft Word). |

**Table stakes in 2026:** preferred + fallbacks per rule · AI-drafted first playbook from your documents · Word add-in with native tracked changes and comments · pass / needs-review / fail per clause incl. missing clauses · a reason for every flag with a citation · a starter library.

---

## 2. Capability matrix

✅ has · ◐ partial / early access · ❌ not found · **S** = Clavia has the UI but it is scripted

### Creating a playbook

| Capability | Harvey | Legora | Microsoft | GC AI | Ivo | Best elsewhere | **Clavia** |
|---|---|---|---|---|---|---|---|
| Draft from our template + negotiated deals | ✅ | ◐ (Skills from past work) | ◐ (create-playbook) | ✅ | ✅ (from repository facets) | LegalOn, SpotDraft | **S** (copies a seed) |
| Each generated rule cited to its source doc | ✅ | ❌ | ❌ | ❌ | ✅ | LegalOn | ❌ |
| Import an existing Word/Excel playbook | ✅ | ❌ | ✅ (.docx only) | ◐ | ◐ (migrate) | LegalOn (Excel) | ❌ |
| Conversational build with clarifying questions | ✅ | ✅ (Skill interview) | ◐ | ✅ | ❌ | — | **S** |
| Start / fallbacks / walk-away | ✅ | ✅ | ❌ (rules + examples) | ✅ | ✅ | all | ✅ |
| Why it exists (rationale) + private AI guidance | ✅ guidance | ❌ | ❌ | ✅ | ✅ internal note | Screens AI guidance | ❌ (`covers` stored, hidden) |
| Stock comment to counterparty | ❌ | ❌ | ❌ | ✅ | ✅ default comment | — | ❌ |
| Conditions (region, value, whose paper) | ◐ | ❌ | ❌ | ✅ | ✅ triggers | — | ❌ |
| Importance / severity | ◐ | ❌ | ❌ | ✅ | ✅ | CoCounsel | ❌ |
| Escalation route per rule | ✅ | ❌ | ❌ | ◐ (in text) | ✅ (Collaborate) | Agiloft routing | ❌ |
| Versions + restore | ✅ | ✅ | ❌ | ❌ | ❌ | — | ✅ |
| Roles (creator / manager) + publish | ✅ | ◐ (scopes) | ◐ (admin skills) | ◐ | ◐ | — | ◐ (publish has no effect on reviews) |
| **Approval workflow to change a playbook** | ❌ | ❌ | ❌ | ◐ (approve card) | ❌ | — | ❌ |
| Test against past contracts before publishing | ◐ (testing in Assistant) | ❌ | ❌ | ◐ (advice only) | ❌ | Ironclad (one-off, vendor-run) | ❌ |
| Learn from findings (promote to rule) | ◐ | ❌ | ❌ | ✅ Smart Check | ◐ thumbs-down | — | ❌ |
| Update from signed deals / outcomes | ◐ (waitlist) | ❌ | ❌ | ❌ | ◐ (insights only) | — | ❌ (Playbook Builder agent talks about it) |
| Starter library | ✅ | ✅ (Skills) | ❌ | ✅ (4) | ◐ | LegalOn 135+, CoCounsel | ✅ (5 seeds) |

### Applying a playbook

| Capability | Harvey | Legora | Microsoft | GC AI | Ivo | Best elsewhere | **Clavia** |
|---|---|---|---|---|---|---|---|
| Review any uploaded contract | ✅ | ✅ | ✅ | ✅ | ✅ | all | ❌ (5 precomputed) |
| In Word as native tracked changes | ✅ | ✅ | ✅ | ✅ | ✅ (+ Google Docs) | all | **S** (.doc download) |
| Verdict per clause + reasoning + citation | ✅ | ✅ | ✅ | ✅ | ✅ | all | ✅ |
| Missing clauses | ✅ | — | — | ✅ | ✅ | CoCounsel | ✅ |
| Not covered by playbook | ✅ | — | ❌ | ❌ | ✅ risk flags | — | ✅ |
| Run setup: side / whose paper | ◐ | ❌ | ❌ | ◐ (separate playbooks) | ✅ | Ironclad | ❌ |
| Strict vs permissive | ✅ | ❌ | ❌ | ❌ | ◐ (deal context) | — | ◐ ("How hard should I push?" in Flag) |
| Deal context picks the fallback | ❌ | ◐ | ❌ | ◐ | ✅ | — | ❌ |
| Several playbooks at once (MSA + DPA) | ❌ | ❌ | ❌ | ❌ | ✅ (3) | — | ❌ |
| Apply all / with comment | ✅ | ✅ | ✅ | ✅ | ✅ | all | ✅ |
| Internal vs external comments | ◐ | ❌ | ❌ | ✅ | ◐ | — | ✅ |
| Their redline: only their changes | ◐ (agents) | ❌ | ✅ | ❌ | ✅ | Juro, Robin | ◐ (rounds; uploads get no verdicts) |
| Reply inside their comment threads | ❌ | ◐ | ✅ (Claude for Word) | ◐ | ✅ | — | ❌ |
| Negotiation rounds (accept / keep / counter per point) | ◐ | ❌ | ❌ | ❌ | ✅ (early access) | Juro beta | ✅ **ahead of most** |
| Sign-off per point / escalation as routed approval | ◐ | ◐ (Intake) | ❌ | ❌ | ✅ | Agiloft | ✅ per point · approvals tab hidden |
| Approvals go stale when terms change | ❌ | ❌ | ❌ | ❌ | ❌ | — | ✅ **unique today** |
| Benchmark vs our own executed deals | ✅ (agents) | ❌ | ❌ | ❌ | ✅ percentile | Luminance | ❌ |
| Market benchmark | ❌ | ❌ | ❌ | ❌ | ❌ | Spellbook, Screens | ❌ |
| Playbook across a portfolio (tabular) | ◐ (template as column) | ◐ | ◐ (Cowork) | ◐ | ✅ (1M contracts) | Agiloft dashboards | ❌ (vault review is keyword) |
| Definitions / cross-reference integrity | ❌ | ❌ | ✅ (check-defined-terms) | ◐ tidy-up | ◐ tidy-up | Definely | ❌ |
| Issues list / summary to the business | ✅ | — | ◐ | ✅ email | ✅ memo | — | ◐ (Outlook draft dialog) |
| Auto-approve clean agreements | ❌ | ✅ (per request type) | ❌ | ❌ | ✅ | Luminance | ◐ (NDA Desk agent, scripted) |
| Playbook callable by intake / API / agents | ◐ | ✅ | ✅ (skills) | ✅ API | ◐ Slack | — | ◐ (agents cite it, hardcoded) |

**Where Clavia is genuinely ahead:** the rounds model (per-point accept / keep ours / counter with Clavia's suggestion, sign-off per point, "Our response" built as a new version) only Ivo matches, and Ivo's is early access; approvals that go stale when a later version changes the terms an approver cared about — nobody else mentions it; internal vs for-them comments; Apply tracked / untracked / with comment; Missing and Not-in-playbook buckets.

---

## 3. What to build — the missing table stakes

Ordered by what a buyer evaluating us against Harvey/Microsoft would test first.

### Tier 1 — credibility (without these we lose the bake-off)

1. **Review any contract, for real.** Upload or pick a file → run → per-clause verdicts. Today only 5 precomputed reviews exist; uploaded markups produce an empty round. This is the demo everyone will try first.
2. **Playbook from our documents, with sources.** Template + 3–10 signed deals (+ old playbook if any): standard from the template, fallbacks from what we conceded, outliers flagged for confirmation, every rule citing the document and clause it came from. Review mode before save (confirm / edit / drop each rule). Accept a Word or Excel playbook as input.
3. **A complete rule.** Add the fields every serious competitor has and we hide: *Why* (rationale), *Guidance for Clavia* (private), *Comment to them* (stock, external), *Example language*, *Importance*, *Applies when* (region, value, our paper / theirs), *Escalate to* (role or person). Show `covers` and drafting language that we already store.
4. **Run setup in one line.** Before a run: which side we are, whose paper, Strict / Deal-closing, deal value and region (prefilled from the request), and up to three playbooks (MSA + DPA). The context picks the fallback and marks rules N/A.
5. **Published means published.** Reviews use the published version (show "Reviewed against SaaS v4"); drafts can only be test-run; roles — Author, Owner (publishes), Viewer; archive actually works.
6. **Clavia in Word.** A task pane with the same review list, Apply as tracked change, comments, Ask. Microsoft made this free for every Copilot tenant on 15 Oct; a web-only review now reads as a step backwards. (Prototype: a Word-chrome view of the same `reviewPage`.)

### Tier 2 — parity with the leaders

7. **Their redline, properly.** Re-review only what they changed since our last turn; auto-settle what they accepted; keep disputed points open; read their comment bubbles and draft replies in-thread. Fix the uploaded-markup path so rounds get playbook verdicts.
8. **Benchmark against our own deals.** Per clause: "we agreed 18 months in 4 of the last 12 MSAs over $1M; never 24" with the deals one click away (Ivo percentile, Harvey precedent chart).
9. **Playbook as a Vault column.** Run a playbook across a folder: one row per contract, one column per rule, met / fallback / outside, with counts per rule ("756 unmet confidentiality standards for this vendor").
10. **Smart Check.** From a review finding: "Add to playbook" → drafts the rule into the playbook as a proposed change.
11. **Escalation as an action.** A rule outside the playbook becomes a routed sign-off with the clause, their ask, our fallback and Clavia's view on one card (Teams/Outlook). Unhide Approvals.
12. **Issues list + business summary.** Export the run as an issues list (Word/Excel) and a 5-line note for the requester ("can sign once X; the rest is standard").
13. **Defined-terms check after redlines.** A redline that renames or drops a defined term flags every place it breaks.

### Tier 3 — later

14. Starter library by contract type and side (our paper / theirs), jurisdiction packs.
15. Playbook as a callable skill: intake auto-review, agents, API, with autonomy set per request type ("standard NDAs on our paper go out without a lawyer").
16. Market comparison (needs data partnerships — not now).

---

## 4. Five things nobody has

Each one closes a gap every researcher independently flagged, and each builds on something Clavia already has.

### 1. Playbook test bench — "what would flip?"
**What.** Every playbook has a golden set: 10–30 past contracts with the redlines our lawyers actually made. Any change to a rule (or a whole draft playbook) is run against the set before it can be published, and Clavia shows a diff: *"Changing the cap fallback to 18 months flips 3 past decisions: Harbor (would now accept), Kestrel, Vantage."* Plus accuracy per rule on our own documents: *"Liability cap: matches the lawyer 27/28; Data breach carve-out: 19/28 — guidance is vague."*
**Why nobody has it.** Ironclad validates once, vendor-run, before go-live. Screens published an accuracy method. GC AI only advises "test on 3–5 agreements". No one runs it continuously, per rule, on the customer's own documents, on every change.
**In Clavia.** A *Test* tab on the playbook; the golden set is just a Vault folder; results reuse the review list. The publish button reads "Publish v5 · 2 decisions change".
**Why it wins.** Turns "can we trust the AI?" into a number the GC owns.

### 2. Playbook changes as reviewed proposals, from evidence
**What.** Clavia watches outcomes — what we conceded, on which rule, to whom, and how many turns it cost — and opens a *proposed change* when the playbook and practice diverge: *"We gave the 24-month cap in 5 of the last 7 enterprise deals; Grace approved each. Proposal: make 24 months Fallback 2 for deals over £1M."* The proposal carries the evidence (the deals, the approvals), the test-bench impact (#1), and goes to the playbook owner to approve, edit or reject — a pull request for the playbook. Approved changes become a new version and flow to every review, agent and intake rule that uses it.
**Why nobody has it.** No competitor documents an approval workflow for changing a playbook. Harvey's "deals drifted past your playbook" is waitlist and recommends, Ivo's turn-cost insights are advisory, GC AI's Smart Check is one finding at a time with no evidence trail.
**In Clavia.** Proposals land in the playbook's chat as decision cards (Apply / Edit / Dismiss) and as a "2 proposed changes" chip on the playbook row. Reuses versions, the chat beside the artifact, and approvals.

### 3. Trade-offs across clauses — give / get packages
**What.** Real negotiators don't concede clause by clause; they trade. A playbook gains *packages*: *"Accept a 24-month cap only if indirect loss stays excluded and they carry £5M cyber insurance."* When a counterparty asks for several things, Clavia proposes the counter as a package with one line of reasoning, and the review shows the deal's net exposure, not 12 separate verdicts: *"Their three changes together uncap us for data breach — the cap is meaningless unless indemnity is fixed."*
**Why nobody has it.** Every product checks rules one at a time; the research found no tool that reasons about how indemnity, cap, insurance and definitions interact.
**In Clavia.** A *Trade-offs* section in the playbook (if X then require Y); in rounds, a "Counter as a package" option next to Accept / Keep / Counter; a one-line *Exposure* summary at the top of the review.

### 4. Counterparty memory → a first draft that closes in fewer turns
**What.** Clavia knows each counterparty: what they accepted last time, what they always push on, how many turns it took. Before we send our paper it predicts the fight — *"Northwind has struck our residuals clause in all 3 prior NDAs and asked for 30-day payment twice"* — and offers a **pre-emptive version** that pre-concedes what we'd give anyway (inside the playbook) to close in one turn, with a forecast: *"expected turns 3 → 1, ~6 days faster."*
**Why nobody has it.** Luminance remembers the counterparty and Ivo estimates extra turns per position, but nobody turns that into the draft we send first.
**In Clavia.** On a new request: "Draft for Northwind" shows the forecast and the two pre-concessions as tracked changes; counterparty page shows their history. Reuses rounds data we already keep.

### 5. Law changes ripple into the playbook and the portfolio
**What.** When Horizon sees a rule change (EU AI Act duties, a new transfer mechanism, a court ruling on liability caps), Clavia traces it: which playbook positions it touches, the drafted amendment for each (as a proposal, #2), and which signed contracts now fall short — *"6 vendor agreements have no AI clause; 2 renew before the rule applies"* — with a remediation list that becomes requests or Do List items.
**Why nobody has it.** Legora has Monitors and Harvey has regulatory research, but no one links monitoring to the playbook and the executed portfolio in one chain.
**In Clavia.** Horizon already lists "What it touches" and an "Update the playbook position" step that today does nothing; wire it to playbook proposals and a Vault column.

**How they fit:** 1 makes the playbook measurable, 2 keeps it alive, 3 makes it think like a negotiator, 4 makes it about the counterparty, 5 keeps it legal. Together the story is *a playbook that is tested, current and negotiates like your best lawyer* — where competitors sell *a playbook that is applied*.

---

## 5. Not doing for now
- Market benchmarks (needs data partnerships; Spellbook's is give-to-get).
- Autonomous end-to-end negotiation (Luminance) — keep humans on send; auto-approve only clean NDAs.
- Client portal for law firms (Legora Portal) — we sell to in-house.
- Our own model (Ivo Sage) — not a product decision.

## 6. Suggested build order
1. Tier 1 items 1–5 (one hero contract, any upload, rule anatomy, run setup, published versions).
2. Differentiator #1 Test bench, then #2 Proposals (they share the golden set and versions).
3. Tier 2 items 7–9 (their redline, own-deal benchmark, Vault column).
4. Differentiator #3 Trade-offs, #4 Counterparty memory, #5 Horizon ripple.
5. Word task pane (prototype as a Word-chrome view) whenever a demo needs it.

---

## Sources
Harvey: harvey.ai/blog/playbook-builder-in-harvey · /contract-review-agents-in-harvey · /introducing-contract-intelligence · /platform/contract-intelligence · /blog/harvey-in-practice-build-and-run-playbooks-in-word · /blog/the-brief-november-2025 · /blog/the-brief-may-2026 · /blog/the-brief-july-2026 · /blog/the-new-harvey-for-outlook · /blog/connector-library · /platform/vault · releases.sh/harvey · help.harvey.ai release notes (via search) · artificiallawyer.com 2026/05/21.
Legora: legora.com/product/playbooks · /product/word-add-in · /product/skills · /blog/introducing-skills · /product/agent · /product/portal · /product/intake · /product/tabular-review · /newsroom (integration ecosystem, Intake, Portal) · /blog/your-imanage-in-legora · research.contrary.com/company/legora · sacra.com/c/legora · haqq.ai comparison.
Microsoft: support.microsoft.com legal agent · learn.microsoft.com Cowork plugins · Message Center MC1296877, MC1388706, MC1493223, MC1234661, RM571884 · lawnext.com 2026/10 Copilot for Legal · artificiallawyer.com 2026/10/15 · claude.com/docs/office-agents/word · thomsonreuters.com CoCounsel for Word.
GC AI: gc.ai/blog/how-to-build-a-contract-playbook · /blog/ai-contract-playbook · /features/playbooks · /features/word-integration · /blog/gc-ai-api · /pricing · releasebot.io/updates/gc-ai · sacra.com/c/gc-ai.
Ivo: support.ivo.ai (creating-a-playbook, review-2-0, running-a-review-2-0, benchmarks, comment-aware-review, collaborate, negotiation-lifecycle, admin-configuration) · ivo.ai/blog/introducing-review-2-0 · artificiallawyer.com 2026/08/11 Collaborate.
Others: spellbook.com/blog/introducing-compare-to-market · legalontech.com Playbook Agent · luminance.com · ironcladapp.com jurist-redlining-playbooks · juro.com/product-updates/march-2026 · help.spotdraft.com VerifAI · agiloft.com Screens · artificiallawyer.com 2024/06/25 Screens 97.5% · docusign.com releases March 2026 · lexisnexis.com Create+ · blackboiler.com · definely.com · artificiallawyer.com 2026/01/09 (Robin AI team to Microsoft).

---

## 7. Evolving the review pane (our Word add-in stand-in) — 17 Oct

The third pane on a contract (Playbook · Ask Clavia · Comments) is the shape of the Word add-in. In the order a lawyer meets it:

**Missing — parity**
1. Run setup card (Playbook tab, before the first run; folds to one line after): playbooks (up to 3), our side, whose paper, Strict / Deal-closing, deal value + region from the request → picks fallbacks, marks N/A. Replaces Flag's "How hard should I push?". (Harvey, Ivo, GC AI)
2. "Reviewed against SaaS subscription v4 · Published"; drafts run only as a labelled test. Review history to resume a past run. (Harvey)
3. Progress: Reviewed / Unreviewed filter and "8 of 14 reviewed"; Apply all for the current filter. (Harvey, Microsoft)
4. Clause card: Why (rationale), a prefilled comment to them from the playbook, a Starting / Fallback 1 / Fallback 2 switch that regenerates the redline, Update ("make it softer"), Retry, thumbs-down. (Ivo, GC AI, Ironclad)
5. Their changes: "Only their changes since v3" mode — Accept / Reject / Counter / Reply per change; prior revisions kept separate from ours; read their comment bubbles and draft the reply in-thread; uploaded markups get verdicts. (Ivo, Microsoft, Juro, Claude for Word)
6. Escalate from any clause: a sign-off card (clause, their ask, our fallback, Clavia's view) to the rule's owner; sign-off status inline. (Ivo, Agiloft)
7. Benchmark line per clause: "agreed in 4 of the last 12 MSAs over $1M, never 24", deals one click away. (Ivo, Harvey)
8. After redlines: defined-term and cross-reference check. (Microsoft, Definely)
9. Finish: issues list (Word/Excel), a 5-line summary to the requester, save as a new version on the request. (GC AI, Ivo)
10. Smart Check: "Add to playbook" on a Not-in-playbook item or an override → a proposal to the playbook owner. (GC AI)
11. Ask: "/" for skills — summarise their redlines, check defined terms, extract obligations, compare to our template. (Microsoft, Legora, GC AI)

**Better than parity — the five, inside the pane**
- Exposure line at the top + "Counter as a package" (trade-offs).
- Counterparty strip: their history, what they always push, expected turns; "Close in one turn" pre-concession.
- Per-rule confidence from the test bench ("27/28 against your lawyers"); low-confidence rules marked "check this".
- Law-change badge on a rule ("Updated for the EU AI Act · Horizon").
- Overrides captured as evidence: applying something other than Clavia's pick asks "Make this the rule?" and feeds playbook proposals.
- Stale sign-offs inline (already ours).

**First slice:** 1 · 5 · 4 · 6 · 9 — set up the run, handle their changes, a full clause card, escalate, finish.
