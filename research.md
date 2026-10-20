# Intake: benchmark vs Harvey Intake and Legora Intake (14 Oct 2026)

**Persona:** in-house legal team. Counsel works the queue, the GC watches load and risk, legal ops sets routing, and business requesters ask from Outlook, Teams or Slack.
**Primitive:** a request is an ask from the business, with its documents (one or many), its requester and channel, an owner, and a status. Clavia does the first pass, and a lawyer owns the answer.

## Capability matrix (directional; from marketing pages, film frames and launch posts)
| Capability | Clavia | Harvey | Legora | Notes |
|---|---|---|---|---|
| Ask from Outlook / Teams / Slack | ◐ seeded email + Teams | ✅ many channels | ✅ Slack (others planned) | |
| Follow-up questions in the requester's thread | ❌ (chat-create only) | ✅ | ✅ | instead of forms |
| Answer goes back to the original channel | ❌ | ✅ | ✅ | |
| Routing / assignment rules ("When … then") | ❌ (suggested assignee only) | ✅ rule builder, rule shown in audit trail | ✅ by legal function | |
| Autonomy per request type (Clavia does it / first pass / lawyer) | ◐ self-service NDA only | ✅ approved agents | ✅ autonomous vs human-in-loop | |
| "Waiting on requester" status | ❌ | ✅ | — | whose move it is |
| Group by (due / type / stage), Following tab | ❌ | ✅ | ◐ by function | |
| One message → several requests | ❌ | — | ✅ "Created 3 tasks" | |
| Requester portal without a seat | ❌ | ✅ guest portal | ✅ no licence needed | |
| Multiple documents per request | ✅ | ✅ files | ◐ | keep |
| Playbook review, rounds, compare, versions | ✅ | ◐ via Contract Intelligence | ◐ via Skills | ours is deeper |
| Approvals + signatures on the request | ✅ | ◐ | ❌ | ours |
| Tracked Word comments | ✅ | ❌ | ❌ | ours |
| GC insights (volume, turnaround) | ❌ | ◐ | ◐ | later |

**Where we already lead:** the work happens on the request (playbook review rounds, compare, approvals, signatures, Word comments).
**What we lack:** the front door (channels, follow-ups, replies back, routing rules, autonomy per type, requester view).

---

# Settings → Connectors and Intake channels (14 Oct 2026, directional)

## Persona
Marcus Lee (Legal Ops) sets it up · Roger Bennett (GC) decides what Clavia may touch · an IT admin approves in Microsoft 365 / Google / Slack / the DMS. Roger is not an M365 admin, so "send this to IT" is a main path, not an edge case.

## The primitive
A connector = a system + what Clavia may see in it + what Clavia does with it + who approved it.

## How each connects (from vendor docs)
| Group | System | Connect | Who approves | What it can see |
|---|---|---|---|---|
| Where the business asks | Slack | Sign in (OAuth v2) | Workspace admin if approval on | Only channels it's invited to (#ask-legal), DMs to it |
| | Teams | Sign in + Teams admin center approval (unavoidable) | Global admin + Teams admin | Teams/chats where installed (RSC) |
| | Outlook | Sign in (admin consent) + scope to legal@ (Exchange RBAC, PowerShell) | Global admin + Exchange admin | One mailbox: legal@ |
| | Gmail | Sign in as legal@ (admin marks app Trusted) | Workspace super admin | One mailbox |
| | Jira | Sign in (OAuth 3LO) | Site admin (if user apps blocked) | One project / service desk |
| | ServiceNow | Admin registers OAuth app + integration user + Store app | ServiceNow admin | Legal request table / catalog item |
| | Salesforce | Install package (External Client App) + permission set + Flow | Salesforce admin | Opportunities the integration user can see |
| Where documents live | iManage | Admin adds app in Control Center, then each lawyer signs in | iManage admin | What each lawyer can see (ACLs + ethical walls) |
| | NetDocuments | Registered OAuth client, then each lawyer signs in | ND repository admin | Chosen cabinets, as the lawyer |
| | SharePoint | Sign in (admin consent), Sites.Selected per site | Global / SharePoint admin | Chosen sites only |
| | OneDrive | Each person signs in (delegated) | Admin consent | Their own files |
| | Box | Sign in; admin enables app | Box admin | Folders shared with it |
| | Google Drive | Sign in (drive.file + Picker) | Workspace admin trusts app | Files/folders people pick |
| Where work gets done | Word | Add-in deployed from M365 admin center (24–72h to appear) | M365 admin | The open document |
| | Google Docs | Marketplace admin install | Workspace admin | The open document |
| | Icertis | OAuth via Entra; API is a separate Icertis SKU | Icertis admin + Entra | Agreements, clauses, obligations |
| | Datasite | API key from developer portal (self-serve) | Deal team member | Projects you're on: documents, Q&A |
| | Intralinks | API key via Intralinks support questionnaire | Intralinks | Workspaces you're on |
| Research and data | LexisNexis | Credentials from your LexisNexis account team (contract) | LexisNexis + admin | Case law, Shepard's, Practical Guidance |
| | PitchBook | API key from PitchBook (separate from seats) | Admin | Company, ownership, financing |
| Everything else | MCP | Add server URL → OAuth 2.1 discovered → pick tools | Admin | The tools you allow |
| | API | Workspace keys + webhooks | Admin | Scopes you give the key |

## Constructs worth copying
- Admin turns a connector on for groups; each person connects their own account where access is personal (DMS) — never a shared login for documents, so ethical walls hold.
- Tool policy for MCP: Allow / Ask first / Off, reads and writes separated, a default for new tools.
- Status with a time: "Listening · renewed 2h ago", never a bare green tick.
- Two-place setup checklist when the vendor needs an admin step first (the Snowflake dialog pattern we already have).
- Intake channels as their own section: requesters need no seat; reply goes back in the same channel.

## Traps
Shared service accounts for documents · treating a Lexis/PitchBook login as API access · connectors hidden in two places · a "Connected" that only means a token exists.

---

# Horizon scanning (14 Oct 2026, directional)

## What the reference product does (product page, video watched frame by frame, launch blog)
- **Status:** early access since 1 Sep 2026; no help docs yet.
- **Primitive:** a *scan* = a saved, named watch (plain-language intent + jurisdictions + sources + topics), run hourly. It finds *developments*.
- **Flow seen in the video:**
  1. A list of scans as cards (name, scope counts, flags, star), with Create scan.
  2. "Describe scan": free text, with Improve, then Continue or Create manually.
  3. A form: name, intent, jurisdiction chips with flags, sources, topics.
  4. The scan page: a weekly digest card (a headline, a cited paragraph, the counts "12 new developments · 1 high relevance"), then a table with All / Unread / Starred / Archived tabs. Columns: Development, Relevance, Type, Industries, Topics, Sources, Jurisdictions.
  5. A detail drawer: type, industries, topics, sources, jurisdictions, a cited summary, Effective date, Relevance (High + a one-line reason about the company), and Draft email / Save to Vault.
  6. The assistant opens as a third pane and drafts an email or memo, asking two questions first.
- **Delivery:** email per high-relevance item, plus a daily or weekly digest. No Teams.
- **Gaps (their own 13 Oct post calls these roadmap):**
  - No link to the company's contracts or policies.
  - No owner or status, and no tracking to closure.
  - Deadlines live only in prose.
  - No learning from false positives, no templates, no case law.

## Others doing the same
| | Legora Monitors | CUBE (incl. ex-Thomson Reuters Regulatory Intelligence) | Ascent | LexisNexis Regulatory Compliance | Practical Law alerts |
|---|---|---|---|---|---|
| Setup | jurisdictions + topics, visible sources | entity/business-line mapping | regulatory map → obligations inventory | modules by industry/region | practice areas + schedule |
| Item | summary + source | redline between versions, obligations graded by strength, relevance score | old vs new rule, obligation diffs | obligation, what to do, impact + risk rating | editor summary, key dates |
| After | owner, impact agent, lists with audit trail | obligations → controls, tasks, approvals, GRC | owners notified in GRC | status, ownership, checklists | save to folder |
| For | law firms + in-house | banks / regulated FS | regulated FS | compliance teams | lawyers |

## The empty cell (in-house)
Nobody connects a change to **the company's own legal position** and carries it to closure. The chain is:
1. A change.
2. Our signed contracts it touches (by clause).
3. The template and playbook position to change.
4. What the business must do.
5. An owner and a date.
6. Evidence that it's done.

Clavia already holds the contracts (Vault), templates, playbooks and Intake routing, so it can do this end to end.

## Traps
- Alert fatigue: default to what applies, with low-relevance items findable rather than hidden.
- Summaries you can't check: every sentence needs a source with a pinpoint quote.
- A relevance score with no reason.
- Ten articles about one change shown as ten alerts.
- Items that never close.
