# Clavia Requests · build log

**Mode:** guided (approved "build all these capabilities")   **Phase:** 6 · Hand-off
**Started:** 9 Oct 2026   **Project:** ~/Experiments/clavia   **Launch:** clavia → http://localhost:4325/ (or the autoPort it picks)

## Brief
- **Ambition:** make Requests the best business-to-legal front door, "better than all of them in terms of capabilities".
- **Persona:** general counsel / in-house lawyer working requests; business requester submitting them.
- **Anchors:** Streamline AI, Tonkean LegalWorks, Checkbox, Ironclad, LawVu.
- **Primitive:** a request is an ask from the business with its paper, its people and its history; legal works it to signature.
- **Differentiator (the empty cell):** an Issues list Clavia builds from the versions — where each negotiated point stands across rounds.

## Locked decisions
- 9 Oct · Approvals (after /think, approved "yes use /build-product"): an approval is a role + the rule that requires it + who can give it + the version it was given on. Rows = role · who · one status (Not requested · Pending · Approved · Rejected · Approved on vN). Heading: Request approval, then Remind. Approve opens a brief of only that role's terms. A new version re-asks only roles whose terms changed. "No approvals needed" when standard. Gone: nested people, reminded/waiting text, per-clause rows, stepper, N of M on the surface.
- 9 Oct · Build: Issues list, self-service NDA, requests from Outlook/Teams, suggested assignee, approvals as a gate, send for signature.
- Standing: no boxes on lists; plain names; no invented metrics; scripted integrations labelled honestly; reuse house constructs.

## His requests
- [x] Issues list (differentiator)
- [x] Self-service standard NDA → Send for signature, "Resolved by Clavia"
- [x] Requests from Outlook and Teams
- [x] Suggested assignee for unassigned requests
- [x] Approvals back on, as a gate before Signing
- [x] Send for signature at the Signing stage

- [x] 9 Oct · Issues rethink: "haven't thought through how it works with multiple documents", "the open state doesn't make sense" — concept good, model wrong (proposal in chat, awaiting go)

- [x] 9 Oct · "Send for signature" button intrusive → quiet word in the Signatures heading; pencil icon removed
- [x] 9 Oct · Approvals as stepper cards (his reference)

- [x] 9 Oct · Issues "too kiddish … production grade" → real issues-list table (Point | Our position | Their position | Clause), history aligned under the side that moved

- [x] 9 Oct · Tab underline sat under the wrong tab after the pane changed width → follows the pane (ResizeObserver)
- [x] 9 Oct · Issues at document level: rounds per document (their version vs our last), triggered by upload marked "theirs" or "Review vN as their changes"; Accept / Keep ours / Counter; "Create our response" writes the next version; Issues tab off (SHOW_ISSUES=false)
- [x] 9 Oct · Approvals properly: stages (all / any one of), person or team, why, waiting since, Remind / Remind all / every 2 days, Request changes, record email approval, reassign, add approver, re-approval on new version; signatures in order / any order, copy, viewed, declined, expiry, cancel

- [x] 9 Oct · Round points rendered as playbook clauses (number, name, cards: their change · playbook position · our answer)

- [x] 9 Oct · A round opens as the playbook review workspace (reviewPage fed by mxRoundReview); Apply = our answer; "Create our response" in the bar
- [x] 9 Oct · Approvals as steps with rules (Any one of N / All N) and approvers under each; one thing per right edge; signer text no longer cut

- [x] 9 Oct · Approvals: no right column (status inline), teams listed as people, no job titles, steps need N of M (Needs any one / 2 of 3 / all)

- [x] 9 Oct · /think approvals → brief behind Approve (terms that matter to the step), step reasons, "Needs My Approval" list tab, plain legal numbers

- [x] 9 Oct · Built the approvals model (rules → role rows, Request approval / Remind, brief per role, version-aware re-ask, no-approvals state)

- [x] 9 Oct · Compare asks "Save as a new version?" — Yes: the comparison becomes the next working version; No: a reference document outside the version sequence
- [x] 9 Oct · Tagged comments from the Word plugin in the app: Comments column (active count) on the Requests list; clickable Tagged Comments section routing to the comment in the document
- [x] 9 Oct · Comment status: Open (assigned to you) → Replied (onus on the other party) → Closed
- [x] 9 Oct · Drag-and-drop upload alongside browse

- [x] 9 Oct · Comments at document level: Word-style Comments pane beside the page (text order, click → words highlighted, thread, reply/close); Overview and Documents show comments per document

- [x] 13 Oct · Comments tab on the request (Open · On you · Closed, grouped by document, Word-style cards with @mentions, threads in place, Hand to…, Show in document)

- [x] 14 Oct · Benchmark Harvey + Legora Intake, add what we lack, better UX constructs, keep multiple documents, rename Requests → Intake (research.md written; 7-item plan approved)
- [x] 14 Oct · "For 4th just add a column instead of group by so we can filter … make sure if I want to revert anything it's easy" → Due column + Due / Waiting on filters; every addition behind `INTAKE_FX` in modules-work.js
- [x] 14 Oct · /build-product Settings → Connectors for every use case (his map: where the business asks · where documents live · where work gets done · research and data · everything else). Connect per vendor docs, OAuth wherever possible, "extremely simple", and help legal see where each is used
- [x] 14 Oct · Intake: define how routing works when a request arrives from Slack / Teams / email / Jira / ServiceNow / Salesforce — think through end-to-end flows
- [x] 14 Oct · Gate A answer: "We need to have a connector landing page, the modal doesn't do justice" → full page per connector
- [x] 14 Oct · "sure move routing rules to settings"
- [x] 14 Oct · "improvise Settings with a side bar where we can have all the new settings we are going to work as well"
- [x] 14 Oct · "before connecting I don't know why I am connecting it" → why first, on the landing page
- [x] 14 Oct · "where all these things surface out" → each connector shows where it appears in Clavia, with a way to go there
- [ ] Logos: asked twice whether to download the ~9 missing marks; unanswered → neutral tiles until he says
- [x] 14 Oct · /build-product Horizon scanning: go through harvey.ai/platform/horizon-scanning in detail, build the module, and say how we improve on it
- [x] 14 Oct · "WATCH VIDEOS AS WELL" → watched the product video frame by frame (scan list · describe scan · create form · scan dashboard with weekly digest · development panel · draft email/memo in side chat)
- [x] 14 Oct · "And are there other companies doing the same?" → benchmark agent covering Legora, CUBE, Thomson Reuters, LexisNexis, Norm Ai, Ascent etc.
- [x] 14 Oct · Gate A: "Call Horizon. Build all 6" → updates list + key dates · new watch in chat · update page · what it touches + next steps to closure · Settings › Company profile + Delivery
- [x] 14 Oct · "Remove the boxiness" (screenshot of the Intake table) → every list table loses its card frame and grey column band; Settings lists and Horizon sections the same. Reversible: delete the "Unboxed tables" block at the end of playbooks.css
- [x] 14 Oct · "Remove line below Open" → no ink bar under the selected list tab
- [x] 14 Oct · "WHY IS THIS NOT CENTER ALIGNED … update design skill and build product" → .hz-page and .sx-page centred (margin-inline: auto); rule added to product-design (principle 5), design-review (C4b) and build-product (2b)
- [x] 14 Oct · "Why did you not create like this man?" + "our detail page" → Horizon rebuilt on the reference's composition: top bar (back · breadcrumb · checked · star · Share · Settings), title with scope inline, weekly digest panel (‹ week ›, headline, cited paragraph, two counts, collapsible), rich rows (title, 2-line summary, time · source domain · watch · owner, relevance bars, type and topic tags, flag + jurisdiction), Starred tab
- [x] 14 Oct · "Remove the line below Open and Unassigned" → no rule under the tab strip
- [x] 14 Oct · "What did you change in the skills, show me?" → listed in chat
- [x] 14 Oct · "Remove weekly digest from here please" (main Horizon page) → digest only on watch pages; collapsed digest no longer prints "null"
- [x] 14 Oct · "Remove this" (scope line beside the Horizon title) → removed on the main page; kept on watch pages, where it opens the coverage
- [x] 14 Oct · "Remove the star icon" → no star on Horizon rows, no Starred tab, no star in the update/watch top bars
- [x] 14 Oct · "Can we make the tabs in our tables like this" → soft-pill tabs, open search field pinned right, bordered square filter (all list tables; block at end of playbooks.css)
- [x] 14 Oct · "The lines should left align with the tab" → row and header rules inset to the content edge (tab left 96 = line left 96; line right = filter right)
- [x] 14 Oct · "Equally space the columns and update the skills" → every table: lead column 2.2fr, all other data columns minmax(content-min, 1fr), only controls fixed (Playbooks gaps now 178px each at 1440). Rule in product-design components §9, design-review C2b, build-product 2b
- [x] 14 Oct · "Need a better logo for Intake please" / "I don't like the icon of Intake" → swapped to option 2 (message with a question mark), my recommendation; old ticket icon kept as assets/icon-intake-ticket.svg
- [ ] 14 Oct · "Better logo" → round 2 shown: A front door · B ask and answer · C routed (recommended) · D funnel; waiting for his pick
- [ ] 14 Oct · "More options for Intake" → round 3 shown: E front-desk bell (recommended) · F sent to legal · G arriving · H signpost · I help · J scales; waiting for his pick
- [x] 14 Oct · "run localhost" → dev server restarted on :4325
- [x] 14 Oct · "Can we make all the columns equally spaced please?" (Intake) → pbFit(): columns sized to content, leftover shared equally as the gap (24–120px), lead column truncates first; on every table; skills rewritten (equal gaps, not equal widths)
- [x] 14 Oct · "Why does it show null here" (AI Summary on RQ-1054) → an empty section printed "null"; request tabs now drop empty sections
- [x] 14 Oct · "Columns for Intake can be like this … with Request number and Request" → Request # · Request · Status · Assigned to · Delegated to (Clavia when a rule hands it over or its first pass is out) · Created on · Due date · Source (channel logo, or Clavia). Counterparty, Type, Submitter, Comments stay as filters. Switch: INTAKE_FX.columns ('v1' restores the old set)
- [x] 14 Oct · "left of the new request button … a toggle between … list and the inbox kinda view" → intake-inbox.js (INTAKE_FX.inbox): list ⇄ inbox toggle; inbox = rows left, request on the right (summary, activity with the original message and rule, Details, Files, Requester, Contact Requester, open full page); ↑/↓ move, Enter opens; choice remembered
- [x] 14 Oct · "You can use /design-review" → reviewed the inbox; fixed: row text on the tab text edge (110→108), pane header on the body edge (537→541), detail 14.5→14px
- [x] 14 Oct · "Too many patches, I would remove this week, earlier etc" → no group bands; selected row is the only tint (lighter)
- [x] 14 Oct · "Can we remove the icons and tags and have in the description" → inbox rows: title, then one grey line: requester · RQ · channel · date · status (waiting on requester in muted red)
- [x] 14 Oct · "Can we use our constructs so that we cover everything" → the inbox reader is the request page itself (intakePage(r, { embed: true })): tabs, stages, assignee, AI summary, Ask; document opens on the full page; INTAKE_FX.inboxLite brings back the light reader
- [x] 14 Oct · "Remove suggested piece either it is assigned or not" → INTAKE_FX.suggest = false (no faded suggestion, no Suggested row in the picker, no Assign shortcut)
- [x] 14 Oct · "Remove Delegate to, but you can also have Submitted by" → column swapped
- [x] 14 Oct · "Have a few on Slack, Teams etc. and instead of Clavia … Clavia logo but Manual" → RQ-1046 Slack, RQ-1043/1044 Teams, RQ-1047/1042 Salesforce, RQ-1040 Outlook (activity rewritten to match); in-app requests read "Manual" with the quill
- [x] 14 Oct · "Can these be like dropdown for different critical fields like status, assigned to, submitter" + "still keep it clean" → INTAKE_FX.drops: view dropdown (Open/Unassigned/Assigned to me/Following/Needs my approval) then Status · Assigned to · Submitted by · Source · Due, each a checklist; shared mxFilterPop; same in table and inbox
- [x] 14 Oct · "Remove comments section from Overview" → gone from Overview (Comments tab stays)
- [x] 14 Oct · "The divider needs to just have curves" (inbox) → straight inset hairlines, not the rounded row edge
- [x] 14 Oct · "The columns should be equally spaced" (Playbooks, wide screen) → pbFit gap cap removed; every gap grows equally (193px at 2000)
- [x] 14 Oct · "Use the view logo here" → View in the playbook row menu uses the eye glyph
- [x] 14 Oct · Field dropdowns: Unassigned first, then you "(You)"; narrower (232px); no divider after the view; view dropdown without a resting fill, its text on the title edge; Source shows logos
- [x] 14 Oct · "Design this properly" (Due dropdown) → fixed buckets Overdue · Today · This week · Next week · Later (empty ones dimmed, still selectable), Custom dates (from/to) → "Due: 14–31 Oct"; search only when a list is longer than 7
- [x] 14 Oct · "Remove the filter icon" → hidden wherever the field dropdowns are (Intake)
- [x] 14 Oct · "We should have All status" → view dropdown: Open (default) · Unassigned · Assigned to Me · Following · Needs My Approval · All (includes done); same in the inbox
- [x] 14 Oct · "This looks cheap man" (native date inputs) → "Custom range…" row opens a calendar in the same panel: month view, click start and end, range shaded, today ringed, "14 Oct – 28 Oct" with Back and Apply
- [x] 15 Oct · "Put intake right after Playbooks" → nav order New Chat · Playbooks · Intake · Vault · Templates · Skills · Contracts · Horizon · Projects
- [x] 15 Oct · "give me a better icon, maybe inbox kind of icon" → Intake icon: inbox with an arrow coming in (assets/icon-intake.svg); the bubble kept as icon-intake-bubble.svg, the ticket as icon-intake-ticket.svg
- [x] 15 Oct · "The dropdown for Open … should be exactly like how we have worked with status, with checkboxes" → view dropdown is the same panel (box · name · count, 232px), one view at a time (mxViewPop)
- [x] 15 Oct · "For now delete the Skills module" → SHOW_SKILLS = false in app.js: out of the rail, #skills goes home; code kept
- [x] 15 Oct · "Make Templates after Playbooks" → rail: New Chat · Playbooks · Templates · Intake · Vault · Contracts · Horizon · Projects
- [x] 15 Oct · "I want the background to be pure white no gradient" → --bg-grad is #FFFFFF (styles.css); the sand fade at the foot is gone everywhere
- [x] 15 Oct · "Can you suggest better icons for Templates?" → 4 options; he picked A (page with blanks); old grid kept as assets/icon-templates-grid.svg
- [x] 15 Oct · "Better icons for playbook" → 4 options; he chose A (open book)
- [x] 15 Oct · "Different variants of option A" → 6 variants; "use option A2" → plain open book in assets/icon-playbooks.svg; old closed book kept as icon-playbooks-closed.svg
- [x] 15 Oct · "we should only scroll below the table header" → list pages (Intake table, Horizon, Playbooks, Templates, Vault, Projects): title, dropdowns/tabs and column names fixed; only rows scroll (end of playbooks.css); scrollbar gutter matched under the column names
- [x] 15 Oct · "This scroll should go towards the end of the screen" → the page scrolls (scrollbar at the window edge); title, filters and column names are sticky, stacked by --stk1/--stk2 measured in pbFit

- [x] 15 Oct · Templates icon simpler: T5, page with fold only (old blanks kept as assets/icon-templates-blanks.svg)
- [x] 15 Oct · Members as a working module (src/settings-members.js): no subtitle; Invite People by email (chips, paste a list, flags bad/duplicate/off-domain, role cards, optional note); roles Admin · Lawyer · Requester said in plain words in the role picker; tabs All · Admins · Lawyers · Requesters · Invited + search; Undo on role change; last admin guarded; confirm before giving up your own admin
- [x] 15 Oct · Show only the email under the name, not the title
- [x] 15 Oct · Remove lives in the role dropdown (no ⋯); invited rows get Resend · Copy invite link · Revoke there too
- [x] 15 Oct · Invite dialog: Note field rebuilt (one line, grows as you type, no resize grip, same padding as the email box, “Optional” in the label); plain placeholders “Enter email addresses” / “Add a note to the invite”
- [x] 15 Oct · Members button just “Invite” (dialog keeps the title Invite People)
- [x] 15 Oct · No “workspace” on Members: Remove (was Remove from workspace), Lawyer “Can’t change settings.”, chip tip “Already has access”
- [x] 15 Oct · Members search placeholder just “Search”
- [x] 15 Oct · Role picker character: option A, outline glyph tiles (no fill): Admin = gear sliders, Lawyer = Intake inbox, Requester = Ask bubble; one-line descriptions; tick on the right; Remove aligned to the tiles
- [x] 15 Oct · Role picker: full descriptions back, no boxes round the icons, relevant glyphs (shield = Admin, scales = Lawyer, briefcase = Requester)
- [x] 15 Oct · Members column narrower: 720px (was 940)
- [x] 15 Oct · Role picker: every description exactly two lines (rewritten to ~80 chars, tick room kept on every row, 344px); shield, scales, briefcase redrawn on one 16px box, same stroke
- [x] 15 Oct · Documents rows: “With Brightwell” / “3 to answer” removed (DOC_ROUND_CHIP = false in modules-work.js); comment count is a round button, number only, no icon (amber when one is addressed to you); click opens the document with its comments
- [x] 15 Oct · Compare dialog: “Save as a new version? No / Yes” footer toggle replaced by “Save the comparison as” in the body: two cards, A new document (default) or Version N (next working version, changes tracked; disabled across two documents)
- [x] 15 Oct · Overview › Recent Documents rows are now the Documents row itself (one docRow in modules-work.js): comment circle, clickable version menu, ⋯
- [x] 15 Oct · Row version menu is now the document header's version list (listFrom): v-badge, name · Latest, date · by · comments, then Upload a New Version, Compare, and Review vN as their changes when it applies
- [x] 15 Oct · Compare redesigned: the two documents lead, stacked full width, names without the counterparty prefix (no more cut-off); “Save as” is a quiet question under a hairline, nothing chosen by default, Compare off until you choose; A new document reveals Name (suggested, editable), Version N reveals an optional Note (kept on the version)
- [x] 15 Oct · Stuck tabs show the request’s name, small and grey, in the band above the tab words (fades in; band grows 14px while stuck with an equal negative margin so nothing jumps)
- [x] 15 Oct · Compare › Save as with character: each choice leads with what it makes (doc tile / green next-version chip like the v-chips above), title over a one-line description (no floating side text), the revealed Name / Note aligned to the text; “where the comparison is kept” removed
- [x] 15 Oct · Compare › Save as: lead icons (doc tile / v-chip) removed; “Version 5” → “New version”; radio + title over its line, revealed field aligned to the text
- [x] 15 Oct · Compare: divider above Save as removed
- [x] 15 Oct · Compare labels “Old document” / “New document” (no “what it said” side text); save option renamed “A separate document” so it doesn’t clash; top gets an old → new line in the left gutter (red-ringed dot, green-ringed dot, matching the v-chips), aligned under the dialog title
- [x] 15 Oct · Compare top as one composite card: Old row over New row, red and green ringed dots joined by a line inside the card, short labels Old / New, the document as a borderless picker, version chip at the row end; left gutter gone
- [x] 15 Oct · Save as first option is “New document” (top labels are now Old / New, so no clash)
- [x] 15 Oct · Compare: both document lists end with “Upload a document” (dashed upload mark, “Word, PDF or text, from your computer”) under a hairline; the file is added to the request and becomes that side, dialog stays open
- [x] 15 Oct · Comments focus: opening comments (row circle or header) folds the request away, document left + comments right; “← RQ-1049” in the document bar (and closing comments) brings it back (CMT_FOCUS in modules-work.js)
- [x] 15 Oct · Comments pane, playbook-analysis way: summary bar (Waiting on you amber · Open grey · Closed green; click a part to filter), Search, one filter (Not closed / Waiting on you / Open / Replied / Closed / All, with counts)
- [x] 15 Oct · Comments pane same width as the playbook pane (clamp 380–480px); decluttered: unboxed list with hairlines, open one tinted, reply box one line that grows
- [x] 15 Oct · Comments pane: “null” fixed (null children filtered); empty state “No comments yet · Write one in the box below…”; per-filter empty lines
- [x] 15 Oct · Compare descriptions say what gets created: New document “Creates a new document with the redline…”, New version “Creates v5 of Master Services Agreement, with the changes tracked. It becomes the working version.”; New version gets a Version name field (auto-filled “Redline of v3 and v4”) with the v5 chip beside it, then the optional Note
- [x] 15 Oct · Empty comments: a dashed box, centred, with a comment mark
- [x] 15 Oct · Comments pane runs full height (document bar over the document only), like the playbook pane
- [x] 15 Oct · Comment filter dropdown opens (click no longer bubbles to the page and closes it); search and filters both 36px, centred
- [x] 15 Oct · Two filters like the playbook review: Status (Not closed / Open / Replied / Closed / All statuses, coloured marks, plain counts, tick) and Assignee (Anyone / You / each person with face / No one); summary-bar parts set them
- [x] 15 Oct · The latest version edits inline (contenteditable, saves 0.7s after typing, logs “edited vN” once); older versions and comparisons read only
- [x] 15 Oct · Select any words → a Comment pill over the selection → the pane opens with the quote above the box; the comment is a Word comment (@mention sets who it's for), highlighted in the document, “It’s in the Word document too.”
- [x] 15 Oct · “Comments in Clavia” section removed from the pane; header count matches the pane
- [x] 15 Oct · Pane tabs at the bottom: Playbook · Ask · Comments (Contracts icons); Playbook and Ask open the playbook review of the document with a third Comments tab back (review.js: req.tab, req.extraTab); off when the document has no review yet
- [x] 15 Oct · Compare › New version: optional Note removed (kept in code)
- [x] 15 Oct · Comment status as a mark + word, the Status filter's marks (open amber dot, replied blue arrow, closed green tick), in the pane and the Comments tab (mxStMark)
- [x] 15 Oct · Hairlines between comments stay on hover and around the open one
- [x] 15 Oct · Open (expanded) comment stays white; dividers above and below stay
- [x] 15 Oct · Reply is one composer, like the applied-redline card: text, a hairline, Close + Reply inside on the right; Open in Word removed; a pre-filled draft sizes to its text
- [x] 15 Oct · Replies hang off the comment: a thread line from the commenter's face curves into each reply's face (height measured per comment); the flat rule above replies removed
- [x] 15 Oct · Reply box is one more line of the thread: your face, a one-line rounded box with a send arrow inside (Enter sends, grows for a long draft), Close beside it; the thread line curves into it like a reply
- [x] 15 Oct · Close removed from the reply row; the box runs full width to the right edge; closing/reopening moved to the status on the open comment (click → Close comment / Reopen)
- [x] 15 Oct · Reply boxes start empty: the seeded drafts are no longer put in (pane and Comments tab)
- [x] 15 Oct · More room between a comment and its replies / reply box (12px above, 14px between); thread line follows
- [x] 15 Oct · Your own comments and replies: ⋯ on hover at the right → Edit (in place, Save/Cancel, Enter saves, “· edited”) or Delete (toast with Undo; status restored)
- [x] 15 Oct · Thread line rebuilt as one trunk from the commenter's face to the last reply, a curve per reply off it — measured positions, no seams
- [x] 15 Oct · Parent comment ⋯ (on hover, every comment), as in Word: Edit comment (yours), Resolve thread / Reopen thread, Delete thread (Undo); the status is no longer a button
- [x] 15 Oct · @mentions: typing @ opens a people list (faces; arrows, Enter/Tab, click) in reply and new-comment boxes
- [x] 15 Oct · Assign to, as in Word: once a reply @mentions someone, “☐ Assign to [name ⌄]” appears (choose among those mentioned); sending with it ticked hands the thread to them (Active, “You assigned this to …”, toast)
- [x] 15 Oct · Word's nomenclature: status at the top right is Resolved (green tick) / Assigned to you (amber) / Assigned to Elena or Active (grey); filters Active · Resolved · All threads, Assignee Anyone · Assigned to you · people · Not assigned; summary bar Assigned to you · Active · Resolved; placeholders “@mention or reply” and “Start a conversation”; menu Edit comment · Resolve thread / Reopen thread · Delete thread; the Comments tab uses the same words
- [x] 15 Oct · Reply box always full width to the card's right edge (width pinned; his tab had loaded between the JS and CSS change)
- [x] 15 Oct · Statuses are Open · Replied · Resolved, shown as tags with icons (amber dot, blue reply arrow, green tick) on each comment; Status filter All statuses / Open / Replied / Resolved (default All); summary bar Open · Replied · Resolved (click to filter); assignment stays in the Assignee filter and the @name
- [x] 15 Oct · Reply box with Assign to as one composite: single line until an @mention, then the text on top, a hairline, and inside the bottom bar an “✓ Assign to · face Grace ⌄” toggle (green when on; ⌄ only with two or more mentions) and send
- [x] 15 Oct · No divider inside the reply box between the text and Assign to / send
- [x] 15 Oct · Once Assign to shows, the reply box holds at least two lines of text (min 58px, 20px lines)
- [x] 15 Oct · Assignment note in the thread: aligned to the replies' words, a small green assign mark, “You assigned this to [face] Matt Rivera” (one line); assigning no longer rewrites the comment's own @mention (kept as c.at)
- [x] 15 Oct · Assignment note is a quiet light box “You assigned this to **Matt Rivera**”: no icon, no face, no time
- [x] 15 Oct · Assigning gives the whole thread an assignee (c.assignee): a band at the top of the thread, as in Word — ◯ circle to mark done (resolves; green tick, struck through) and “Assigned to you / [face] Matt Rivera” — on the collapsed and open card
- [x] 15 Oct · Assignment note sits close under its reply (6px) with more room before the next row (18px)
- [x] 15 Oct · Deleting a reply takes its assignment with it: the “assigned this to” notes after it go, the thread falls back to the previous assignee (or none, the band goes), the comment's @mention is restored; Undo puts it all back
- [x] 15 Oct · Status tag flush right on every comment and clickable (Open / Replied / Resolved, ticked; toast with Undo that repaints the pane); ⋯ sits just left of it on hover
- [x] 15 Oct · Assigned band anchored, open and collapsed: a soft header strip across the thread with a hairline under it; the circle centred over the faces, “Assigned to” on the names' line
- [x] 15 Oct · An assigned thread is one framed card (soft rounded outline, the Assigned band as its header), so it's plain which comment is assigned; text stays on the same lines as the others
- [x] 15 Oct · Every comment thread is a subtle card (soft outline, 12px radius, 8px apart; hairlines gone), the open one a shade stronger; the assigned one only adds its header band
- [x] 15 Oct · Comment cards use the playbook suggestion card's edge exactly: 1px #ECE9E3 ring + soft lift (no border); hover and open a shade stronger
- [x] 15 Oct · Unselected comment cards: ring + a breath of lift only; the open one keeps its shadow
- [x] 15 Oct · Showcase MSA (RQ-1049, v4) seeded with 8 threads, one per case: waiting on you (Elena), mentions someone else (Fiona→Elena), replied (Sarah), your own (you→Marcus, editable), assigned to Matt (Daniel, with “You assigned this to”), assigned to you (Grace), resolved after a back-and-forth (Marcus), longer thread (James↔Elena); wcomments v2 reseeds; seeds carry assignee and system lines; Assignee filter reads the assignee
- [x] 15 Oct · Deep link #intake/RQ-1049/comments opens the request on the MSA with the comments pane open
- [x] 15 Oct · Comment on a selection opens a draft card at the top of the pane: you, “New comment”, the quoted words, and the reply composer (@mention, Assign to, send; Enter sends, Esc / × discards); the bottom box no longer carries the quote
- [x] 15 Oct · Deep link that works in any browser's data: #intake/showcase/comments (finds the Brightwell request and its Master Services Agreement by title)
- [x] 15 Oct · Upload a new version: Comment field replaced by Version name, as in Compare — v-chip + a name you can change, filled from Whose version (“Brightwell’s markup” / “Our revision”); the name becomes the version's name. New documents keep the optional comment
- [x] 15 Oct · “Start a conversation” box removed from the comments pane; comments start from a selection; empty state says so
- [x] 15 Oct · More air between comment cards: 14px apart (was 8), list padding 16/14/20
- [x] 15 Oct · Comment status as an icon only in a 22px tinted circle (word in the tooltip, click to change); Open shows nothing (Resolve/Reopen stay in ⋯)
- [x] 15 Oct · Assigned band: no face; the name is a button (hover tint + ⌄) → You / each person (ticked) / Remove assignment; a note in the thread, toast with Undo
- [x] 15 Oct · Status circles solid: Replied blue #3A6AA8, Resolved green #1A8A3F, white 12px icon in a 20px circle
- [x] 15 Oct · Ask tab wears the Clavia quill instead of a speech bubble, in the comments pane and the playbook review tabs (dimmed when not selected)
- [x] 15 Oct · Status filter uses the comments' marks: solid circles with white icons (Open amber dot, Replied blue arrow, Resolved green tick), in the list and on the button
- [x] 15 Oct · The Ask tab reads “Ask Clavia” (comments pane and playbook review)
- [x] 15 Oct · Switching Comments ↔ Playbook / Ask Clavia no longer glitches: the comments view is laid out folded from the first frame (no 340ms collapse), no entrance animation on the swap; the pane holds the same place (961px, 479 wide at 1440) in every direction. (Playbook / Ask still show the review of their v3 changes — a different page by design)
- [x] 15 Oct · Back to no boxes for comment threads: hairlines between threads; the assignment is a quiet line inside its thread under the comment (◯ Assigned to Matt Rivera, on the text's line), so it can only belong to that comment
- [x] 15 Oct · Scrollbars hidden on the document and the comments list (and the review's panes); wheel and trackpad still scroll
- [x] 15 Oct · Ask Clavia tab: grey quill when not chosen, the real quill when it is
- [x] 15 Oct · Empty-comments dashed box inset 20px from the pane's edges (was touching)
- [x] 15 Oct · Resolved comments no longer faded (opacity 1); the green tick carries it
- [x] 15 Oct · Comments tab icon: the round speech bubble (option D), in the pane and the review
- [x] 15 Oct · Assignment back on top of its thread, no strip or divider: a small line (12px, faint) with the circle centred over the face and “Assigned to Matt Rivera” on the name's line, 6px above the name, 16px below the hairline
- [x] 15 Oct · Assignment held in a very soft full-width box (#F7F5F1, 9px radius) at the top of its thread: 20px below the hairline, 10px above the name; circle still centred over the face, words on the name's line
- [x] 15 Oct · Assignment box: edges on the hairlines and the face's left edge (was 8px past them), slimmer (30px), and white with a 1px #ECE9E3 edge instead of a grey fill (“patch”)
- [x] 15 Oct · Assigned thread no longer changes height on hover or when opened (a broader hover rule reset its 20px top padding to 16px; pinned for every state, measured 176px both ways)
- [x] 15 Oct · Assignment with character, no box: the task circle stands centred over the commenter's face, a dotted line ties circle to face (2px clear each end), “Assigned to [face] Matt Rivera” on the name's line; circle marks done (green), name changes the assignee
- [x] 15 Oct · 8px between “Assigned to” and the assignee's photo (was touching)
- [x] 15 Oct · Assignee menu opens with “Unassign” at the top (above a divider, not lost at the bottom of a long list); thread note “You unassigned this”, toast with Undo
- [x] 15 Oct · Thread line quieter: 1px, #E7E3DC, 12px curve radius, curve stops 15px out (short of the face)
- [x] 15 Oct · Thread line branches only into the last row (the reply box, or the last reply when resolved); earlier replies sit along the line without a curve
- [x] 15 Oct · “You assigned this to Matt Rivera” is a system note: grey italic text in the thread (name grey too), no box
- [x] 15 Oct · Hovering a comment's or reply's date shows the exact moment (“Thursday, 15 October 2026 at 07:38”), plus when it was edited (mxFullWhen / mxWhenTip)
- [x] 15 Oct · The request's Comments tab is the comments pane itself (paintCPanel in tab mode): one document at a time with a switcher at the top (open counts per document, “Open in document”), the same bar, search, Status and Assignee filters, threads, assignment, reply composer, ⋯ menus; no close or bottom tabs
- [x] 15 Oct · No line under the comments tools; a soft shadow appears only once the list scrolls under them
- [x] 15 Oct · Playbook panel: no line under its search; its own scroll shadow separates once the clauses scroll
- [x] 15 Oct · Comments tab (left pane): summary bar removed; the pane beside the document keeps it
- [x] 15 Oct · Comments tab: “Open in document” removed from beside the switcher
- [x] 15 Oct · Comments tab: one row — the document switcher as an outlined dropdown button (tile, name truncating, version, ⌄) leading search, Status and Assignee, all 36px; the switcher stays when a document has no comments
- [x] 15 Oct · Assignee filter's default reads “All assignees” (was Anyone)
- [x] 15 Oct · Comments tab: no search; the row is document switcher on the left, Status and Assignee on the right (the pane keeps its search)
- [x] 15 Oct · Comments tab: the document switcher reads as the row's title (no outline, 15px medium, full tile, version + ⌄, hover tint); the two filters stay outlined, grouped on the right, and drop to a second line together when the column is narrow
- [x] 15 Oct · Search removed from the comments pane too; Status and Assignee share the row evenly (chevron at the right of each)
- [x] 15 Oct · Status and Assignee filters without outlines (words + ⌄, hover tint), in the pane and the Comments tab; in the pane they sit at natural width, their ink on the faces' line
- [x] 15 Oct · Comments tab switcher: no document icon — just the name, version and ⌄, the name on the faces' line
- [x] 15 Oct · Comments status as tabs (house pills): All 8 · [open] 5 · [replied] 2 · [resolved] 1 — marks and counts only, names in tooltips; “All assignees” dropdown at the row's end; summary bar removed (pane and Comments tab)
- [x] 15 Oct · Assignee filter is multi-select with search, as the publish flow's people picker: Search people on top, All assignees (clears), checkbox rows with face, name and count; stays open while choosing; the button shows stacked faces + “You, Matt” / “+N”
- [x] 15 Oct · Assignee picker: first row just “All” (no icon), no divider under it
- [x] 15 Oct · Assignee button with nobody chosen is a people icon + ⌄ (“All assignees” in the tooltip); with people chosen, their faces and names
- [x] 15 Oct · Assignee button (nobody chosen): a person in a 24px dashed circle + ⌄; on hover the circle turns solid and darker
- [x] 15 Oct · Assignee picker: search reads “Search assignees”; first row “All assignees”; your row is your name with a grey “(you)”
- [x] 15 Oct · Status tabs show mark + word + count (All 8 · Open 5 · Replied 2 · Resolved 1); when the pane is under ~430px the words drop to fit (container query), names in tooltips. Tested: pane at 480 and 380, Comments tab at 573 — one line, no overlap; each tab filters to its count
- [x] 15 Oct · Status tabs back to marks + counts only (All keeps its word); the names are tooltips
- [x] 15 Oct · Comments title in the playbook title's type (15.5px semibold) and top (18px)
- [x] 15 Oct · The pane's × replaced by a subtle “+ Comment”: opens a new-comment card at the foot of the list (you, “New comment”, the reply composer with @mention, Assign to and send; Esc / × discards), scrolled into view; a comment from a selection still opens at the top with its quote
- [x] 15 Oct · No count next to the Comments title (the tabs carry the counts)
- [x] 15 Oct · Comment from a selection: no quote and no “New comment” in the card — just you and the box; the selected words stay highlighted in the document while you write (cleared on discard or send)
- [x] 15 Oct · Resolved threads have no “Reopen” link; reopen from ⋯ (Reopen thread) or the green tick (Open / Replied / Resolved)
- [x] 15 Oct · Empty comments line trimmed to “Select any words in the document and choose Comment.”
- [x] 15 Oct · Deployed to Vercel → https://clavia-ten.vercel.app (comments showcase: /#intake/showcase/comments)
- [x] 15 Oct · Document rows' open-comment count: the pane's round bubble + number in grey (no amber circle), hover tint, “7 open comments” tooltip
- [x] 15 Oct · Comments tab header tightened into one block: document title and the assignee button on one row (assignee on the list's right edge), status tabs 6px under it, list 10px below — nothing left hanging
- [x] 15 Oct · Redeployed to https://clavia-ten.vercel.app (grey comment counts, compact Comments tab header)
- [x] 15 Oct · Comments tab header on one line: document · status tabs · assignee at the right edge (wraps only in a narrow column)
- [x] 15 Oct · Redeployed (one-line Comments tab header) → https://clavia-ten.vercel.app
- [x] 15 Oct · Comments tab header as one unit: document on the left; Status (dropdown with the solid marks and counts) and Assignee grouped on the right, matched and borderless, ending on the list's right edge; no centred tabs
- [x] 15 Oct · Comments tab header as a modern toolbar: one white bar (soft ring + lift, 12px radius, 48px) — the document on the left, Status and Assignee as small filled chips on the right; no list icon on All statuses
- [x] 15 Oct · 32px between the Comments toolbar and the first comment (was ~18)
- [x] 15 Oct · Comments toolbar leads with the document's file tile before its name
- [x] 15 Oct · Toolbar chips lose their grey fill (“patchy”): plain words + ⌄ inside the bar, tint on hover only; assignee keeps its dashed circle
- [ ] 15 Oct · “The divider vertical line has gone” — couldn't reproduce (left border and pane border both present in my tab); asked which line
- [ ] 15 Oct · Save as character: options A segmented / B show what you get / C tinted panel shown; recommended B, waiting on his pick
- [x] 15 Oct · Comments tab: clicking a thread highlights its words in the document and scrolls to them, as in full screen. Clicking it again clears the highlight. The fix uses a short timeout instead of an animation frame, so it fires reliably.
- [x] 15 Oct · Comments tab: hovering the first thread no longer glitches (tab cards have no hover fill).

- [x] 15 Oct · Close (×) in the document header works after full screen: it closed the comments through the view transition, which landed after the fold and put the columns back (half-open page: no divider, “Show document” icon). Close now closes comments at once; folded state also wins over a dragged split width
- [x] 15 Oct · Request status as task statuses: New · In progress · Waiting · Completed · Cancelled (MX_ST.req; `mxReqStatusBtn`/`mxReqStatusMenu`). Shown in the list, the Status filter, the request header and Details; Completed/Cancelled leave the Open view with Undo. The stage path still runs underneath for approvals/signing
- [ ] 15 Oct · Top three requests demo-complete: multiple full-length documents, versions, 5–8 comment threads, activity (background agent)
- [x] 15 Oct · Inbox ⇄ list: header no longer jumps (scrollbar room kept, same 280px search) — then the toggle and inbox view were removed (`INTAKE_FX.inbox = false`); the table is the one view
- [x] 15 Oct · Opening a request: the AI summary is expanded by default (folding lasts only while on that request)

- [x] 15 Oct · Sticky tabs no longer show the request's name above them
- [x] 15 Oct · No “Show document” icon on a folded request
- [x] 15 Oct · Agents in the nav after Intake (spark-in-a-ring line icon, option B, assets/icon-agents.svg); empty page for now — details to come

- [x] 15 Oct · Agents icon redrawn on Horizon's 17px grid (r 7.5 circle) so both circles render 15px
- [x] 15 Oct · Redeployed (task statuses, Close fix, inbox toggle removed, summary open, Agents nav; demo data part-way) → https://clavia-ten.vercel.app
- [x] 15 Oct · Demo data: Gulf Systems NDA told in full (src/intake-demo.js): NDA v1 Clavia draft / v2 sent / v3 Gulf Systems’ redline (DIFC law, residuals, oral-disclosure summaries, affiliates, two years), v2 vs v3 comparison, Schedule 1 (attendees and information shared) in two versions, a playbook round with DIFC waiting on Roger’s sign-off, 8 comment threads, 6 days of activity; Grace Coleman, Negotiation
- [x] 15 Oct · Demo data: Gulf Systems reseller letter told in full: Letter of Authorisation for Al Noor Technology (Riyadh) v1 Clavia / v2 Matt / v3 Priya’s tracked edits, v2 vs v3 comparison, Al Noor’s commercial registration (certified translation), Schedule of territory, products and excluded customers, 7 threads, activity; Matt Rivera, Drafting
- [x] 15 Oct · Demo data: Brightwell MSA, DPA and Order Form lengthened to full clauses (no existing sentence changed, so every quote, round and comparison still holds); v4 now carries the trade-secret carve-out its comment thread says was added
- [x] 15 Oct · Demo data reaches saved browsers: `mxDemoSeed` runs from mxIntake behind `d.demoV = 2`, matches the Gulf requests by title, rebuilds only those two, and swaps Brightwell's blocks only where a version is still as seeded

- [x] 15 Oct · Agents page (src/agents.js): 20 legal agents as cards, three across in a 1000px column — mark, name, 5–6 word line; card shadow from the review pane's suggestion card
- [x] 15 Oct · Agent marks engraved like the quill: green hatch body + contour, deep-green defining part, one gold detail, white slits, ground shadow; on a soft grey tile
- [x] 15 Oct · Agents tabs as on Vault: All · Starred · Yours · Shared with you, counts, Search agents on the right
- [x] 15 Oct · New Agent opens “Create New Agent” (the playbook create screen: quill, composer, attach); sending opens a chat where Clavia asks three setup questions
- [x] 15 Oct · Brand logos built from a run-time path (Outlook etc.) 404'd on Vercel: BRAND_SRC map of plain paths so the build inlines them; brandSrc(id) everywhere
- [x] 15 Oct · Back to the request (comments full screen) is the arrow alone, no RQ number
- [x] 15 Oct · Gulf document names shortened (Al Noor — Reseller Letter, Al Noor — Commercial Registration, Territory Schedule, Schedule 1 — Workshop Attendees); demo seed reruns once (demoV 3)

- [x] 15 Oct · Agent marks flat, two tones (hatching rejected: “I don't like those striking lines”): the object filled green #0E5B45, what it does in gold #B08A4E cut out by a hairline of the tile colour, white lines; no contour, no ground shadow
- [x] 15 Oct · Star at each agent card's top right: gold and always shown once starred, on hover otherwise; drives the Starred tab (state.agStar)

- [x] 15 Oct · Agent marks: one green silhouette + one gold accent at one weight (2.8 stroke/bar or a small solid); no grey tile, no white/tint accents (“cohesive, very similar-looking”)
- [x] 15 Oct · Agent cards all one height: description clamped to two lines
- [x] 15 Oct · Each mark animates once on card hover (pen writes, arrow drops, tick/signature/question draw, star turns, others pulse or lift) and loops with rests on the agent's screen
- [x] 15 Oct · Clicking an agent opens its own screen (as New Agent / Create New Playbook): its animated mark, its name as the title, the composer; sending opens a chat with that agent

- [x] 15 Oct · Agent marks: details inside the green are white; gold only where the accent stands outside the green (pen nib, inbox arrow, entity connectors, clipboard clip, employment badge, the lens line). “Gold inside green doesn't look great”

- [x] 15 Oct · Agent marks animate as stories, not bobs (“go deep … like the Clavia animations”): moving parts with pivots in the SVG, motions in agents.css (56 parts, 51 keyframes) — lock opens and snaps shut, pen writes a gold ink line that fades, magnifier searches and finds, hourglass flips and sand runs, folder squashes and the tick redraws, bookmark drops, sheen sweeps the shield, hold tag swings on its string, a page turns, bell rings with clapper lag and signal arcs, signature writes and drops an ink dot, arrow falls into the tray, lines write in turn, bubble flips and rewrites, org nodes drop and pop, minutes write on the clipboard, star turns with a ripple, question draws and its dot drops, receipt prints, briefcase slides in and the person nods. Once on hover; on the agent's screen it plays, rests (second half of each run is still) and plays again
- [x] 15 Oct · Re-drawn marks: Clause Finder = document + gold magnifier lifted off it; Obligation Tracker = hourglass; Litigation Hold = hold tag on a gold string; Regulatory Watch = bell with gold clapper (the columns didn't sit with the set)

- [x] 15 Oct · Agent marks: no motion on the cards (only on the agent's screen); every motion halved, eased, no jitter (Redliner glides, Clause Finder drifts in a small arc)
- [x] 15 Oct · Agent creation journey (src/agents-build.js), scripted to NDA Desk: brief → Clavia reads (playbook, last quarter's 42 NDAs) with its reasoning shown → three questions rise above the box (Ask Clavia's .jv-aq; 1 of 3; keys 1–3, Enter, Skip, Something else) → reasoning on the answers → app cards (Outlook, Salesforce, SharePoint connected; Connect Teams) → Build agent (instructions, guardrails from the playbook's red lines, triggers/routines, dry run on 3 real NDAs) → agent card → Publish → live line + profile panel (Muse-style: mark, name, status, four icon tabs: Instructions · Approvals · Triggers and routines · Access) → NDA Desk joins Agents › Yours
- [x] 15 Oct · Agents screens have addresses via mxRoute: #agents/new, #agents/build (brief filled in), #agents/build/done (finished, profile open), #agents/<id>
- [x] 15 Oct · Fixed: New Agent crashed when sent without files (null trace steps)

- [x] 15 Oct · Agent builder: the apps are one card with four sections across (hairlines between; Connect on the one not linked); question options reset to plain rows outside the contract screen

- [x] 15 Oct · Agent builder apps: one card, a row per app stacked (logo · name + what it does · Trigger/Action · Connected or Connect on the right)

- [x] 15 Oct · Agent builder apps: removed the Trigger/Action label from each row

- [x] 15 Oct · Agent builder: no Build agent button or “Connect Teams to go on” hint; connecting the last app starts the build

- [x] 15 Oct · Agent builder working reads true: its own trace sources, so folded lines say what happened (“Read NDA Playbook v7 · Looked at last quarter’s NDAs”, “Thought it through · Checked connected apps”, “Wrote the instructions · Set guardrails”); no right-hand counts/labels — numbers that matter are in the line (“31 sent back on our paper, unchanged”)

- [x] 15 Oct · Agent builder working: rows carry the real source logo (playbook positions and past NDAs from SharePoint, escalations from Outlook, apps by their own logo, dry-run NDAs from Outlook / Salesforce)
- [x] 15 Oct · “Where are we calling skills”: the build shows it choosing four of legal’s skills (Triage an Inbound NDA, Draft an NDA from Our Template, Summarise Their Redline, Write an Escalation Note) and when each is called; the profile’s Instructions tab lists them under Skills it calls

- [x] 15 Oct · Agent builder working made real (“feels superficial”): 19 steps grounded in the workspace — where the playbook lives and who changed it, the four positions that matter by number, the template (12 clauses, used 48 times), last quarter's 42 NDAs by outcome and by where they came in, conclusions that follow from them; exact trigger conditions, the clause-for-clause send rule, Grace's leave with Roger as backup, app permissions; instructions tied to positions, skills chosen instead of rewriting steps, guardrails from must-haves, routines, and a dry run checked against what legal actually did. Rows wrap
- [x] 15 Oct · Removed the “NDA Desk is live…” line and the “Watching legal@lumen.io” status; the profile's mark no longer animates

- [x] 15 Oct · Agent icons in three families, I cycles them (kept in state.agIconStyle): Marks (the green set) · Bots, after Reason's multiplayer agents — one rounded hexagon with two upright eyes, a colour each, a white badge at the corner with what it does (pen, lock, magnifier, hourglass…) · Buddies, after Grok's companions — a round face with dot eyes and a smile, a colour each, holding its thing. On the agent's screen the families blink and the badge nudges; still on the cards
- [x] 15 Oct · Agent builder questions are a stepper: pick (radio; recommended pre-picked), Next is primary, Skip secondary, Back to the one before, the last says Submit; all three answers go in together as one reply. Fixed two options looking selected (first-of-type caught the “Something else” label)
- [x] 15 Oct · Agent builder's message box is the chat's own one-line pill (+, Auto, send), as in New Chat

- [x] 15 Oct · Bots redrawn after Grok Bot (x.ai/bot): a character each — its own shape that hints at the job (padlock, ink drop, lens, hourglass, folder, book, shield, tag, cloud, bell, pill, triangle, folded page, speech bubble, a crew of three, clipboard, star, diamond, receipt, person), flat colour, two slanted eyes up and right; no badges. Instead of a dot on every one, a small prop of its trade on the shoulder (mini red pencil, key, magnifier, flag, ribbon, padlock, pin, bulb, nib, arrow, sparkle, bubble, gavel, book, coin, briefcase); the bell keeps its red dot. Blink + bob + prop nudge on the agent's screen only
- [x] 15 Oct · Agent's Computer tab (after Grok Bot's own computer): a desktop with a wallpaper in house tones, a dock (Outlook, Word, Teams, SharePoint, the open one marked), asleep until published, “Waking up… Just a moment”, then it works through scenes — opens Priya's email, redlines Birch Labs' clause 9 from five years to three, asks Grace in #legal-approvals — with a one-line “now”. Click for full screen with Watching / Take control
- [x] 15 Oct · Agents as first-class in the journey: the build sets up its computer (step), and the agent card lists its parts — Instructions, Skills, Approvals, Triggers and routines, Computer, Access — each opening its profile tab
- [x] 15 Oct · Opening any agent: its screen offers three ways in (the chat's Suggestions rows, “Try”), and asking opens the house chat with a reply that streams like New Chat — working step by step on real sources, then a real answer and next steps (src/agents-play.js, all 20 agents)

- [x] 15 Oct · Bots refined (“finesse is missing”): fuller rounded-pill eyes at a calmer tilt; soft light from the top and depth at the base on every body; props redrawn on a shared 16px grid with real detail (eraser band, glass in the lens, key teeth, lit bulb, coin highlight), set on the shoulder with a white outline drawn behind; props only where the shape doesn't already say it (none on NDA, Privacy, Hold, Translator, Invoices, Obligations, Trademark, the crew)

- [x] 15 Oct · Bot props simplified to the bell-dot / bulb level (“too detailed”): one or two flat shapes in one colour, slightly smaller — red pencil stick, plain lens, pennant, ribbon, solid nib, curved arrow, single sparkle, gavel, book, briefcase

- [x] 15 Oct · Upload a new version: a Comment field (optional) after Version name — “What changed in this version?”; it is kept on the version and posted to Activity

- [x] 15 Oct · Email with Outlook redesigned as compose → review → Outlook: To as people chips (+ Add from the deal team), subject drafted, Attach any of the request's documents each at a chosen version (forest checkboxes, version picker), “What changed, for them” written by Clavia from the round (we accept / we propose / we kept ours), the message drafted around it; Review shows exactly what goes (from, to, subject, body, attachments at versions); Open in Outlook logs each document emailed
- [x] 15 Oct · Upload a new version: “Whose version” removed (guessed from the file name)
- [x] 15 Oct · Text boxes: even padding (text no longer flush to the top)
- [x] 15 Oct · Activity comment box: a pill like the chat's; + attaches (upload from your computer, or one of the request's documents at its latest version — the version picker's list with tiles), @ tags someone (or type @); files sit as chips in the box and on the posted comment; tagged names highlighted

- [x] 15 Oct · Fourth icon style, Characters (I cycles Marks → Bots → Buddies → Characters; none removed): clay-lit bodies peeking up from the ground (dome, cloud, scallop, triangle, heart, tuft, tall), glossy eyes, and an accessory for the job — beret (Redliner), monocle (Clause Finder), fedora (NDA), coach cap (Obligations), deerstalker (Due Diligence), mortarboard (Playbook), shades (Privacy), pompom beanie (Hold), round glasses (Research), headphones (Regulatory), top hat (Signature), headset (Triage), bow (Summary), goggles (Translator), bowler (Minutes), crown (Trademark), half-moon glasses (Policy), green eyeshade (Invoices), bow tie (Employment); Entity a crew of three
- [x] 15 Oct · Agent computer dock: only Chrome, Terminal and File Storage; scenes are web apps in Chrome (a tab with the site's logo and title, the address bar: outlook.office.com, lumen.sharepoint.com, teams.microsoft.com)

- [x] 15 Oct · Agent builder apps card compact: one 38px line per app — logo, name and what it does side by side, state on the right

- [x] 15 Oct · Characters' accessories made legal-specific (“too casual … can't have generic things”): quill tucked behind (Redliner), red wax seal (NDA), pocket watch on a chain (Obligations), case files in red tape (Diligence), bound law book (Playbook), shield lapel pin (Privacy), barrister's wig (Litigation Hold), scales of justice (Regulatory), fountain pen (Signature), filing stamp (Triage), legal pad (Summary), globe (Translator), gavel (Minutes), registration rosette (Trademark), briefcase (Employment); monocle, reading glasses and eyeshade kept

- [x] 15 Oct · NDA Reviewer Character: the wax seal on its face read like a dummy; now it holds a sealed envelope (cream, red wax seal on the flap)

- [x] 15 Oct · Characters all legal (“the ones that are legal kind of”): Redliner holds a redlined page and red pen (dome body, no leaf-like quill); Clause Finder a magnifier over a contract; Research a stack of law reports; Policy a ring-bound handbook; Invoices a fee invoice and coin; Obligations a desk calendar with a date ringed in red

- [x] 15 Oct · Characters as a fair mix (“a couple need not have icons”): 11 with a legal object; 3 in glasses only (Research round, Summary slim rectangular, Policy half-moon); 5 plain (Privacy, Triage, Translator, Invoices, Employment), plain ones on varied bodies; the crew

- [x] 15 Oct · Characters: fedora back on NDA Reviewer, mortarboard on Playbook Builder, headset on Intake Triage (he liked them); mix now 10 objects/hats · 3 glasses · 4 plain · crew

- [x] 15 Oct · Agents as conversations (Grok Bots + iMessage groups): X shows a Workspace ⇄ Agents switch at the top of the rail (hidden by default; X again hides it and returns). Agents mode = rail of chats (flat, newest first, sections only once made), group chats with agents + colleagues, New agent dialog (shape + colour), onboarding with question cards and auto-rename, Computer "Action needed" card with Take over / I'm done, panel Details / Artifacts / Computer. `src/agents-chats.js/.css`, `#bots/<id>`
- [x] 15 Oct · Agent landing from the Agents page is the Grok chat: name pill, it greets you with three starters, composer at the bottom
- [x] 15 Oct · Computer dock icons all one height
- [x] 15 Oct · Agent profile: Artifacts tab (what it made; dry-run documents once published)
- [x] 15 Oct · Removed Connect apps; removed the "Agent" tag by names; group avatar overlap fixed

- [x] 16 Oct · Demo link for a playbook made from uploaded documents: #playbooks/new/upload (brief + 3 SharePoint files + 1 upload, build starts itself) → #chat/pb-ses-pb-reseller-upload (fixed address, rebuilds on any machine). Files now show above the message that sent them. `src/playbook-demo.js`

- [x] 16 Oct · Horizon hidden from the rail for now (view and #horizon kept); published to clavia-ten.vercel.app (fixes broken Source logos there)

- [x] 17 Oct · /build-product: evolve the contract review pane (our Word add-in stand-in) with every feature from PLAYBOOK-RESEARCH.md §7 — parity items 1–11 and the "better" list; builds on what we have, neat and clean; then a /design-review loop; then a final PDF of what we built and what it makes better
- [x] 17 Oct · Remove the "Their position" card from the clause detail (not helpful)

- [x] 17 Oct · Review pane (review.js + review-plus-data.js): run setup line + card (side, paper, Strict/Deal-closing, stack up to 3 playbooks), "N of M reviewed", ⋯ finish menu (apply all, mark all, issues list .doc, summary for requester, save as vN), deal lines (exposure → Counter as a package; counterparty → Close in one turn), clause facts (why, our deals + See deals sheet, low-confidence warning, Horizon badge), View in playbook (openRuleSheet, now reachable), their Word comments answered in place (chip, box starts empty), Accept their change, Ask <owner> sign-off with stale state, Not right?, Make this the playbook's answer → proposals on the playbook page → Add to playbook = new version, "/" skills in Ask (their changes, defined terms, obligations, issues list), filters Their changes / Not reviewed
- [x] 17 Oct · Design review: 2 rounds, P1 0 · P2 0 (class collisions, type sizes 12/13/14, deal-line ink edge = clause names, tooltips, duplicate tick, sign-off only outside playbook, setup guessed from the contract)
- [x] 17 Oct · PDF: report/Clavia-review-pane.pdf (17 features, before/after table, real vs scripted)

- [x] 17 Oct · Ask Clavia (review pane): + at the left of the box — Upload from your computer, or a file from SharePoint, OneDrive, Google Drive, iManage, Dropbox, Box (house source picker); files ride above the box as chips with ×, go with the message, show above your bubble; a file alone can be sent; replies say what was read

- [x] 20 Oct · Review pane empty states: dotted placeholder (icon, what happened, tertiary actions). Playbook covers nothing → "This playbook doesn’t cover this contract" + Run <best match> playbook · Choose another; filter/search with no results → "No <filter> clauses" / "Nothing is missing" / "Nothing matches “x”" + Show all clauses · Clear search. Addresses: ?review=unmatched#requests/REQ-149 · ?review=filtered#requests/REQ-149

## Surface plan
- [x] 1 Research (product-research answer, 9 Oct)
- [x] 2.1 Issues tab — #intake/<Brightwell id> → Issues
- [x] 15 Oct · Comments tab: dividers all run the list's full width (the line after an assigned thread was inset 20px); hover returns as a soft #FAF9F6 fill that extends 12px past the text, hides the two adjacent lines and changes no height
- [x] 15 Oct · Comments tab: an assigned thread at the top of the list no longer jumps on hover (its top padding went 12 → 20px; now 12px in every state)
- [x] 15 Oct · Removed the “or drop it here” hint next to Upload a document (dropping still works)
- [x] 15 Oct · Comments: opening or closing a thread grows/shrinks to its new height (280ms, house ease) and its replies + reply box fade in; switching threads animates both (`wdMorph`). Rest of his message was cut off (“and when something is…”) — asked
- [x] 2.2 Approvals gate — Approvals tab + stage gate
- [x] 15 Oct · Comments tab: the “Ask about RQ-…” bar is hidden there (still on other tabs)
- [x] 15 Oct · Approvals / Signatures tab hidden for now (`INTAKE_FX.approvals = false`; old links fall back to Overview)
- [x] 15 Oct · Clicking a thread no longer redraws + flashes the document when it is already the one showing (that was the click glitch at desktop width)
- [x] 15 Oct · Comments icon in the document header: opening/closing comments is a view transition (340ms): the request fades off left, the one final page glides into place (no cross-fade, which ghosted the text), comments slide in from the right
- [x] 2.3 Send for signature — Approvals → Signatures
- [x] 15 Oct · Redeployed (comments animation, hover/divider fixes, click-to-highlight, Approvals hidden, Ask bar off Comments) → https://clavia-ten.vercel.app
- [x] 15 Oct · Comments pane: “No comments yet” hides while + Comment's box is open; it comes back only on cancel with nothing added
- [x] 2.4 Suggested assignee — list + detail header
- [x] 2.5 Outlook / Teams intake — seeded requests + email in Activity
- [x] 2.6 Self-service NDA — request chat
- [x] 5 Final review · 6 Hand-off

## Intake switches (14 Oct) — `INTAKE_FX` at the top of src/modules-work.js
Set any one to `false` to take that piece out. Nothing else depends on it.
| switch | what it adds | where |
|---|---|---|
| `rename` | module called Intake (false: Requests) | nav, list title, back button |
| `dueCol` | Due column; Due (Overdue / Today / This week / Later) and Waiting on (Legal / Requester / Counterparty) filters | list |
| `following` | Following tab; Follow / Unfollow in the row ⋯ | list |
| `rules` | Routing rules page (gear beside New Request, #intake/rules); suggested assignee and new requests use the first rule that fits; Activity names the rule in words; NDA self-serve only while the NDA rule says "Clavia, end to end" | src/intake-rules.js |
| `channel` | "Message Tom" in the request ⋯, sent in Outlook or Teams; "Waiting on Tom" in the header; Clavia's follow-ups seeded on RQ-1045 (answered) and RQ-1041 (waiting); replies scripted | modules-work.js |
| `split` | Priya's one email became RQ-1050 + RQ-1051, linked in Activity | modules-work.js `mxSplitSeed` |
| `portal` | Requester view (#intake/RQ-1043/requester): status, who has it, "Legal needs something from you" with an answer box, documents, messages; no notes. Linked from the acknowledgement line in Activity and the request ⋯ | src/intake-portal.js |
| `firstPass` | "Clavia finished the first pass on v2 of the DPA" with Review First Pass in Activity, opening the round | modules-work.js |

## Brief · Settings → Connectors + Intake channels (14 Oct)
- **Reframe:** for a legal team, a connector is not plumbing; it's a question of trust: *what can Clavia see, where does it act, and who said so.* The page has to answer that before it asks anyone to click Connect.
- **Persona:** Marcus Lee (Legal Operations) sets it up; Roger Bennett (GC) decides what Clavia may touch; an IT admin (Microsoft 365 / Google / Slack) has to approve. Viewer by default is Roger, who is *not* the M365 admin, so "ask your admin" has to be a first-class path.
- **Principle:** one row per system, in his five groups. Each says what it's used for in Clavia, what it can see, and its state. Connect is one button wherever the vendor allows OAuth. Where an admin must register an app first, we hand them the exact values (the Snowflake dialog pattern).
- **Intake, end to end:** a message arrives (Slack / Teams / email / Jira / ServiceNow / Salesforce) → Clavia acknowledges in the same thread with a link → reads it into a request (splits multi-asks) → asks for what's missing, in the same thread → routing rules decide who and how → status updates go back to that thread → closes the loop there.

## Review log
| Surface | Round | P1 | P2 | What changed |
|---|---|---|---|---|
| Comments + compare + drop | 1 | 1 | 1 | Comments column broke the narrow-width grid (⋯ wrapped) → container-query grids include it; thread card sat at the pane top → level with the highlighted words |
| Approvals sheet | 1 | 1 | 1 | duplicate SIGN_EXPIRES_DAYS blanked the app → removed; GC brief listed kept terms → only terms standing outside |
| Approvals brief | 1 | 2 | 2 | tab counted team membership (6 → 4); repeated "Fees and Payment" labels → term names; "outside the playbook" on kept wording → "our wording kept"; "sixty (60) days’" → "60 days" |
| Approvals v3 | 1 | 2 | 4 | one right edge (all at 603); team avatars + initials removed; signatures ⋯ moved into signer menus; names in ink; step keeps waiting time when reminded |
| 2.1 Issues | 1 | 1 | 3 | "Show clause" did not scroll (scroll the pane, not scrollIntoView); vague "Struck / Put back" lines rewritten; rows 2px off the headings; Undo left the activity line |
| 2.1 Issues | 2 | 0 | 1 | "Show clause N" wrapped onto its own line → removed; each round opens that version at the clause; "Open" word repeated → says whose move it is |
| 2.2–2.3 Approvals + signing | 1 | 1 | 2 | 7 tabs clipped Activity at narrow split → 12px gap with 7 tabs; "Approved 7 oct" casing; stray "null" after the sent line |
| 2.4 Suggested assignee | 1 | 1 | 1 | "renewal call" matched procurement → match on title only; name wrapped in the cell |
| 2.5 Outlook / Teams | 1 | 0 | 2 | submitter name 4.7px below the row baseline; "Teams" said twice |
| Horizon | 1 | 1 | 3 | "Open" link took the reused .sx-show-go grid placement and crushed the clause column; native prompt() for Add a step → inline field; "No one yet" repeated → quiet dash; "0 min ago" → just now |
| Settings shell + Connectors | 1 | 2 | 3 | `.st-head`/`.st-title` already taken → prefix `sx-`; sidebar scrolled away with the page → own scroll areas; mxTable broke function-style tabs (Templates, Skills, Projects, Vault) — regression from the "in" tabs change, fixed via tabList() |
| Connector pages | 1 | 1 | 3 | Teams "waiting on IT" while RQ-1041 came through Teams → Teams on, ServiceNow waiting; previews asked for logos we don't have (404) → plain tile; "Used in" column ragged → fixed 190px; rules table overflowed Settings width |
| Intake list (Due col) | 1 | 1 | 1 | attorney names truncated after adding Due → rebalanced grid; Due-aware container breakpoints (`.has-due`) |
| Routing rules | 1 | 1 | 1 | editor did not open (ICON not in scope) → inline SVG; "and On our paper" casing → sentence built lower-case, first letter raised |
| Channel + requester view | 1 | 2 | 1 | Clavia's own message read "Clavia replied" → legal side; `.rqg-`/`.rqv-` class clashes → `.rqo-`; RQ-1046 said waiting when Hannah had answered → last word decides |
| 2.6 Self-service NDA | 1 | 0 | 2 | "Resolved by Clavia" wrapped → "Clavia" + tooltip; counted under Unassigned; tab says Signatures when there are no approvals |

## Proposals
1. Issues as its own tab vs top of Overview — built as a tab (flag `SHOW_ISSUES`).
2. Seven tabs on the request page (Overview, Documents, Issues, Approvals, Details, Deal Team, Activity) — recommend folding Details into Overview's bottom if it feels crowded.
3. Add one Overview bullet: "**Open** 5 points, all with Brightwell — liability cap, …" linking to Issues.
4. The list shows a suggested lawyer faded in the Attorney cell; if it reads as already assigned, fall back to "Unassigned" and keep the suggestion in the picker and header only.

## Not doing for now
- Reporting dashboard, bulk actions, duplicate detection, notifications centre, Jira / ServiceNow / Slack, real Outlook/Teams sync — later round.
- Live recompute of issues from an uploaded Word file — issues are seeded for the hero records; uploads log "Clavia updated the issues" only.

## Links
- Issues — #intake/RQ-1049 → Issues (Brightwell) · #intake/RQ-1048 → Issues (Northwind)
- Approvals + Send for signature — #intake/RQ-1049 → Approvals
- Suggested assignee — #intake (Unassigned tab) · #intake/RQ-1039
- From Outlook — #intake/RQ-1045 · from Teams — #intake/RQ-1041
- Self-service NDA, finished session — #intake/selfserve · live: #intake/new
- Routing rules — #intake/rules · rule in Activity: #intake/RQ-1047
- Message the requester — #intake/RQ-1041 (⋯ → Message Sofia; scripted reply after ~5s)
- One email, two requests — #intake/RQ-1050 · #intake/RQ-1051
- Requester view — #intake/RQ-1043/requester (waiting on them) · #intake/RQ-1041/requester
- First pass ready — #intake/RQ-1049 → Activity
- Settings — #settings/connectors · a connected one #settings/connectors/slack · needs reconnecting #settings/connectors/jira · waiting on IT #settings/connectors/servicenow · not connected #settings/connectors/gmail (sign in) · #settings/connectors/lexis (key) · #settings/connectors/mcp · #settings/connectors/api
- Horizon — #horizon (To review · In progress · Done · Archived · Key dates) · hero #horizon/HZ-231 (Data Act switching charges) · #horizon/watches · #horizon/watch/eu-data · #horizon/new · #settings/profile · #settings/delivery
- Settings › Intake — #settings/channels (the five-step journey) · #settings/details · #settings/rules (moved; #intake/rules redirects; ⚙ on Intake opens Channels)
- Members — #settings/members (Invited tab: two pending invites)
- Comments, every case — #intake/showcase/comments
