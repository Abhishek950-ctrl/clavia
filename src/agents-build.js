/* ── Building an agent, in conversation ─────────────────────────
   You say what the agent is for. Clavia reads what it needs to, asks at
   most three questions (they rise above the box, as on a contract's Ask
   Clavia), shows the apps it will use as cards, builds it, and you
   publish it. The agent then has a profile: what it does, what needs a
   lawyer's yes, when it runs, and what it can reach.

   Scripted for the demo: whatever you type, the agent built is NDA Desk.
   #agents/build starts it with the brief filled in; #agents/build/done is
   the finished conversation with the profile open. */

const AGB_AGENT = { id: 'nda-desk', name: 'NDA Desk', say: 'Handles inbound NDAs end to end', by: 'me', mark: 'nda', built: true };

const AGB_BRIEF = 'An agent that handles the NDAs sales sends us: review each one against our NDA playbook, send back the standard ones, and bring anything unusual to a lawyer.';

const AGB_QS = [
  { title: 'Where do the NDAs come from?', options: [
    { k: 'both', label: 'Both: emails to legal@lumen.io and Salesforce' },
    { k: 'mail', label: 'Emails to legal@lumen.io' },
    { k: 'crm', label: 'Salesforce, when a deal needs an NDA' } ] },
  { title: 'What can it send without a lawyer?', options: [
    { k: 'std', label: 'Standard NDAs on our paper' },
    { k: 'none', label: 'Nothing: it drafts, a lawyer sends' },
    { k: 'minor', label: 'Standard NDAs, and their minor edits' } ] },
  { title: 'Who approves anything outside the playbook?', options: [
    { k: 'grace', label: 'Grace Coleman' },
    { k: 'deal', label: 'The lawyer on the deal' },
    { k: 'legal', label: 'Anyone in Legal' } ] },
];

/* the apps it needs, and what for: a trigger starts it, an action is something it does */
const AGB_CONNS = [
  { id: 'outlook', name: 'Outlook', role: 'Trigger · Action', say: 'Reads legal@lumen.io; replies from it', on: true },
  { id: 'salesforce', name: 'Salesforce', role: 'Trigger', say: 'Starts when a deal moves to Needs NDA', on: true },
  { id: 'sharepoint', name: 'SharePoint', role: 'Action', say: 'Saves each draft to Legal › NDAs', on: true },
  { id: 'teams', name: 'Teams', role: 'Action', say: 'Asks for approvals in #legal-approvals', on: false },
];

/* the agent's profile, tab by tab */
const AGB_PROFILE = {
  instructions: [
    'Open every NDA that arrives, from email or a Salesforce deal, and read it against NDA Playbook v7.',
    'If it is our paper and unchanged, fill in the counterparty’s details and send it back for signature.',
    'If they changed it, redline it to our positions and keep their wording where the playbook allows.',
    'Anything outside the playbook goes to the approver with a one-line reason before it is sent.',
    'Log every NDA in Intake as a request, with the final version saved to SharePoint.',
  ],
  works: [['NDA Playbook v7', 'playbook'], ['Mutual NDA · our paper', 'template']],
  skills: [['Triage an Inbound NDA', 'Every NDA that arrives'], ['Draft an NDA from Our Template', 'When sales asks for our paper'],
    ['Summarise Their Redline', 'When they send changes'], ['Write an Escalation Note', 'Before anything goes to Grace']],
  guardrails: [
    ['Never signs', 'It prepares NDAs for signature; people sign.'],
    ['Outside the playbook', 'Grace Coleman approves before anything is sent.'],
    ['Liability, term or governing law changed', 'Always goes to a lawyer, even if the playbook allows it.'],
    ['Sends on its own', 'Only standard NDAs on our paper.'],
  ],
  triggers: [
    ['outlook', 'An email with an NDA arrives at legal@lumen.io'],
    ['salesforce', 'A Salesforce deal moves to Needs NDA'],
  ],
  routines: [
    ['Every Monday · 9:00', 'Weekly NDA digest to Roger Bennett'],
    ['Weekdays · 17:00', 'Chases approvals waiting more than a day'],
  ],
  access: [
    ['outlook', 'Outlook', 'Read and reply as legal@lumen.io'],
    ['salesforce', 'Salesforce', 'Read opportunities and contacts'],
    ['sharepoint', 'SharePoint', 'Write to Legal › NDAs'],
    ['teams', 'Teams', 'Post in #legal-approvals'],
  ],
  who: [['Legal team', 'Can change it'], ['Sales', 'Can send it NDAs']],
};

/* the brief it works to: who it is, when it runs, how it works step by step, the rules it decides by,
   how it writes, and what it never does — the instructions a person would give a new colleague */
const AGB_BRIEF_FULL = {
  role: 'You are NDA Desk, the legal team’s agent for non-disclosure agreements at Lumen. You handle every NDA that sales and the business send to legal, from the first read to a signed copy on file, and bring a lawyer in only where NDA Playbook v7 says one is needed.',
  runs: [
    ['An email to legal@lumen.io arrives with a .docx or .pdf that reads as an NDA', 'outlook'],
    ['A Salesforce opportunity moves to the stage Needs NDA', 'salesforce'],
    ['Someone asks you in chat or forwards you an NDA', 'chat'],
  ],
  steps: [
    ['Pick it up', 'Open a request in Intake. Note who asked, the counterparty, the deal it belongs to and when they need it back.'],
    ['Read it against the playbook', 'Compare every clause with the 14 positions in NDA Playbook v7. Note what is on our paper, what they changed, and what is missing.'],
    ['Decide the route', 'Use the rules below. When two rules apply, follow the stricter one.'],
    ['Prepare it', 'On our paper, fill in the counterparty’s registered name and address from Salesforce and the purpose from the deal. On their paper or with their changes, redline in Word to our positions, keep their wording wherever the playbook allows, and add a one-line comment to each change.'],
    ['Get a yes when one is needed', 'Post in #legal-approvals with the redline, a one-line reason for each change and the date they need it. If Grace Coleman has not answered within one working day, ask Roger Bennett.'],
    ['Send it and chase', 'Send from legal@lumen.io to the person who sent it. Chase every two working days until it is signed, and copy the deal owner on the second chase.'],
    ['File it', 'Save the signed copy to SharePoint › Legal › NDAs, close the request in Intake and mark the Salesforce opportunity as NDA signed.'],
  ],
  rules: [
    ['Our paper, unchanged', 'Send it for signature. No approval needed.'],
    ['Missing one of the four standard exceptions', 'Add it back. No approval needed.'],
    ['Term up to three years, survival up to two', 'Accept it.'],
    ['Term over three years', 'Redline to three years and ask Grace.'],
    ['A one-way NDA on their paper', 'Do not redline it. Send it to a lawyer with a short summary.'],
    ['A non-solicit, non-compete or residuals clause', 'Strike it and ask Grace.'],
    ['Governing law other than England and Wales', 'Hold it for Roger Bennett’s sign-off.'],
    ['Anything the playbook does not cover', 'Stop and ask Grace, with the clause and what you would do.'],
  ],
  style: 'Write to counterparties as Lumen Legal: plainly, briefly and politely. Give our position and one reason; never quote the playbook or explain how we decide. Write to colleagues in one or two lines, with the link to the document.',
  never: [
    'Sign anything, or send anything for signature in someone’s name.',
    'Send a redline before it has a yes, when the rules ask for one.',
    'Accept liability, indemnity or penalty wording in an NDA.',
    'Share a counterparty’s NDA outside Legal and the deal owner.',
  ],
};

/* where the conversation is; one at a time, kept until you start again */
let AGB = null;
const agbNew = (brief) => ({ msgs: [{ who: 'you', text: brief || AGB_BRIEF }], q: -1, answers: [], pick: [], other: [], conns: Object.fromEntries(AGB_CONNS.map(c => [c.id, c.on ? 'on' : 'off'])),
  phase: 'reading', published: false, panel: false, tab: 'instructions', busy: true });
const agbWait = (ms) => new Promise(r => setTimeout(r, Math.round(ms * (typeof PACE_SCALE === 'number' ? PACE_SCALE : 1))));

function agentBuildStart(text, files) {
  AGB = agbNew(text || (files?.length ? `An agent that works from ${files.join(', ')}` : ''));
  mxOpen('agents', 'build');
  agbRun();
}

/* the finished conversation, for a demo that lands on the end */
function agbFinished() {
  const s = agbNew(AGB_BRIEF);
  s.msgs.push({ who: 'clavia', steps: agbReadSteps(), text: 'I can build this. Three questions first, so it works the way your team does.' });
  s.msgs.push({ who: 'answers', rows: AGB_QS.map(q => [q.title, q.options[0].label]) });
  s.conns.teams = 'on';
  s.msgs.push({ who: 'clavia', steps: agbPlanSteps(AGB_QS.map(q => q.options[0].label)), text: 'It needs four apps. Three are connected already; Teams needed you.', conns: true });
  s.msgs.push({ who: 'clavia', steps: agbBuildSteps(), text: 'NDA Desk is ready. Review it, then publish.', agent: true });
  Object.assign(s, { phase: 'done', published: true, panel: true, busy: false });
  return s;
}

/* the working, shown in full: what it read, what it concluded, why it asks; then how it set the
   agent up and a dry run on real NDAs. Its own sources, so the folded line says what really happened
   ("Read NDA Playbook v7 · Looked at last quarter's NDAs"), and no right-hand column: a number that
   matters is in the line itself (15 Oct) */
const AGB_IC = {
  book: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8.5 3v18"/><path d="M12 8h4.5M12 12h4.5"/>',
  tray: '<path d="M4 13.5 6 5h12l2 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z"/><path d="M4 13.5h4.5l1 2h5l1-2H20"/>',
  think: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  plug: '<path d="M9 3v5M15 3v5M6.5 8h11v3a5.5 5.5 0 0 1-11 0z"/><path d="M12 16.5V21"/>',
  pen: '<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4z"/>',
  shield: '<path d="M12 3l8 3v6c0 4.6-3.3 8-8 9-4.7-1-8-4.4-8-9V6z"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>',
};
Object.assign(SOURCES, {
  agbPlaybook: { label: 'NDA Playbook v7', verb: 'Read', icon: AGB_IC.book },
  agbPast: { label: 'last quarter’s NDAs', verb: 'Looked at', icon: AGB_IC.tray },
  agbThink: { label: 'it through', verb: 'Thought', icon: AGB_IC.think },
  agbApps: { label: 'connected apps', verb: 'Checked', icon: AGB_IC.plug },
  agbWrite: { label: 'the instructions', verb: 'Wrote', icon: AGB_IC.pen },
  agbGuard: { label: 'guardrails', verb: 'Set', icon: AGB_IC.shield },
  agbTry: { label: 'past NDAs', verb: 'Tried it on', icon: AGB_IC.play },
  agbComputer: { label: 'its computer', verb: 'Set up', icon: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9 20h6M12 16.5V20"/>' },
  agbSkill: { label: 'skills', verb: 'Chose', icon: '<path d="M12 4.5c.6 4.2 3.3 6.9 7.5 7.5-4.2.6-6.9 3.3-7.5 7.5-.6-4.2-3.3-6.9-7.5-7.5 4.2-.6 6.9-3.3 7.5-7.5z"/>' },
  /* where a row came from, by its own logo */
  agbSF: { brand: 'salesforce', label: 'Salesforce', verb: 'Searched', icon: AGB_IC.plug },
  agbTeams: { brand: 'teams', label: 'Teams', verb: 'Searched', icon: AGB_IC.plug },
});
Object.assign(DOING, { 'Set up': 'Setting up', 'Chose': 'Choosing', 'Looked at': 'Looking at', 'Thought': 'Thinking', 'Checked': 'Checking', 'Set': 'Setting', 'Tried it on': 'Trying it on' });

const agbReadSteps = () => [
  { source: 'agbPlaybook', query: 'Read NDA Playbook v7 in Legal › Playbooks, last changed by Grace Coleman on 2 September: 14 positions, 6 of them must-haves', rows: [
    { title: 'Term: two years preferred, three at most (position 4)', source: 'sharepoint' },
    { title: 'Obligations must run both ways; a one-way NDA goes to a lawyer (position 1)', source: 'sharepoint' },
    { title: 'Governing law: England and Wales; DIFC only with Roger’s sign-off (position 11)', source: 'sharepoint' },
    { title: 'No non-solicit in an NDA: strike it (position 13)', source: 'sharepoint' } ] },
  { source: 'agbPlaybook', query: 'Read the Mutual NDA template, our paper: 12 clauses, used 48 times; only the counterparty’s name, address and the purpose change', rows: [
    { title: 'Mutual NDA.docx · v4 · Legal › Templates', source: 'sharepoint' } ] },
  { source: 'agbPast', query: 'Looked at the 42 NDAs legal closed between 1 July and 30 September', rows: [
    { title: '31 on our paper, sent back unchanged: two days each on average, waiting for a lawyer', source: 'sharepoint' },
    { title: '8 redlined: term in 5, a residuals clause in 2, governing law in 1', source: 'sharepoint' },
    { title: '3 escalated to Roger: one-way NDAs from Acme and Vantage, a non-solicit from Kestrel', source: 'outlook' } ] },
  { source: 'agbPast', query: 'Checked where they came in', rows: [
    { title: '29 by email to legal@lumen.io', source: 'outlook' }, { title: '11 from Salesforce deals at Needs NDA', source: 'agbSF' },
    { title: '2 forwarded in Teams', source: 'agbTeams' } ] },
  { source: 'agbThink', query: 'The 31 unchanged ones are safe to send without a lawyer: same template, only the counterparty block differs. That alone takes about two days off every routine NDA.' },
  { source: 'agbThink', query: 'The redlines follow the playbook closely (five of eight were term), so it can draft them. A lawyer should still see each one before it goes, because the playbook allows a three-year term only with a reason.' },
  { source: 'agbThink', query: 'It should never decide governing law, a one-way NDA or a non-solicit. Roger made those calls every time last quarter.' },
  { source: 'agbThink', query: 'Three things I can’t settle from the files: where NDAs should be picked up, how much it may send on its own, and who says yes to an exception.' },
];
const agbPlanSteps = (ans) => {
  const both = /both/i.test(ans[0] || ''), who = ans[2] || 'Grace Coleman';
  return [
    { source: 'agbThink', query: both
      ? 'Two triggers. Outlook: a new message to legal@lumen.io with a .docx or .pdf that reads as an NDA. Salesforce: an opportunity’s stage changes to Needs NDA; it takes the account’s registered name and address and the account executive from the deal.'
      : `One trigger: ${ans[0] || 'emails to legal@lumen.io'}.` },
    { source: 'agbThink', query: /nothing/i.test(ans[1] || '')
      ? 'It drafts everything and sends nothing; a lawyer presses send.'
      : 'It sends on its own only when the NDA matches our template clause for clause, with just the counterparty block filled in. Any other change, even a typo, is a redline, and a redline is never sent without a yes.' },
    { source: 'agbThink', query: `${who} approves the exceptions. Their calendar shows leave from 24 to 28 October, so if nobody answers within a day it asks Roger Bennett instead of waiting.` },
    { source: 'agbApps', query: 'Checked what Clavia can reach, and with which permissions', rows: [
      { title: 'Outlook: read and send as legal@lumen.io, granted by IT on 12 August', source: 'outlook' },
      { title: 'Salesforce: read opportunities and accounts', source: 'agbSF' },
      { title: 'SharePoint: write to Legal › NDAs', source: 'sharepoint' },
      { title: 'Teams: not connected', source: 'agbTeams' } ] },
    { source: 'agbThink', query: `Approvals have to reach ${who.split(' ')[0]} where she answers them, in #legal-approvals, so Teams must be connected before it goes live.` },
  ];
};
const agbBuildSteps = () => [
  { source: 'agbWrite', query: 'Wrote five instructions, each tied to a playbook position or one of your answers', rows: [
    { title: 'Read every NDA against NDA Playbook v7 before doing anything else', source: 'agbWrite' },
    { title: 'Send back only clause-for-clause matches of the Mutual NDA', source: 'agbWrite' },
    { title: 'Redline everything else to our positions, then ask Grace', source: 'agbWrite' } ] },
  { source: 'agbSkill', query: 'Chose four of legal’s skills for it to call, rather than writing the steps again', rows: [
    { title: 'Triage an Inbound NDA: on every NDA that arrives', source: 'agbSkill' },
    { title: 'Draft an NDA from Our Template: when a Salesforce deal needs our paper', source: 'agbSkill' },
    { title: 'Summarise Their Redline: when they send changes', source: 'agbSkill' },
    { title: 'Write an Escalation Note: before anything goes to Grace', source: 'agbSkill' } ] },
  { source: 'agbGuard', query: 'Set four guardrails from the playbook’s must-haves and your answers', rows: [
    { title: 'Never signs; people sign', source: 'agbGuard' },
    { title: 'Term over three years, a one-way NDA or a non-solicit: always a lawyer', source: 'agbGuard' },
    { title: 'Governing law other than England and Wales: Roger’s sign-off', source: 'agbGuard' },
    { title: 'Sends alone only clause-for-clause matches of our template', source: 'agbGuard' } ] },
  { source: 'agbComputer', query: 'Gave it a computer of its own: a sandbox with Outlook, Word, Teams and SharePoint. It works there, so you can watch what it does, or take the controls', rows: [
    { title: 'Signed in as nda-desk@lumen.io, not as a person', source: 'outlook' },
    { title: 'Drafts in Word, saved to Legal › NDAs', source: 'sharepoint' } ] },
  { source: 'agbThink', query: 'Added two routines: a Monday 9:00 digest for Roger (NDAs in, sent, waiting), and at 17:00 on weekdays a chase for any approval older than a day' },
  { source: 'agbTry', query: 'Tried it on the three NDAs legal handled last week, and compared what it would do with what legal did', rows: [
    { title: 'Northwind Ltd: our paper, unchanged. Would send it back, as Grace did', source: 'outlook' },
    { title: 'Birch Labs: their redline asks for five years. Would redline to three and ask Grace, as she did', source: 'agbSF' },
    { title: 'Gulf Systems: moves governing law to DIFC. Would hold it for Roger’s sign-off, as legal did', source: 'outlook' } ] },
  { source: 'agbThink', query: 'All three match what legal actually did, so it is ready for you to review.' },
];

/* the script: read, ask, connect, build */
async function agbRun() {
  const s = AGB;
  const paint = () => { if (AGB === s) agbPaint?.(); };
  await agbWait(500);
  const m = { who: 'clavia', steps: [], text: '' };
  s.msgs.push(m); paint();
  for (const st of agbReadSteps()) { m.steps.push({ ...st, running: true }); paint(); await agbWait(st.source === 'agbThink' ? 1300 : 1100); m.steps[m.steps.length - 1].running = false; paint(); }
  await agbWait(300);
  m.text = 'I can build this. Three questions first, so it works the way your team does.';
  s.busy = false; s.phase = 'asking'; s.q = 0; s.pick[0] = 0; paint();
}

/* the questions are answered as a set: pick, Next, and the last Next submits all three together */
function agbPick(i) { const s = AGB; s.pick[s.q] = i; s.other[s.q] = ''; agbPaint?.(); }
function agbNext(skip) {
  const s = AGB; if (!s || s.phase !== 'asking') return;
  if (skip) { s.pick[s.q] = null; s.other[s.q] = ''; }
  if (s.q < AGB_QS.length - 1) { s.q += 1; if (s.pick[s.q] === undefined) s.pick[s.q] = 0; agbPaint?.(); return; }
  const rows = AGB_QS.map((q, i) => [q.title, s.other[i] || (s.pick[i] == null ? 'Skipped' : q.options[s.pick[i]].label)]);
  s.msgs.push({ who: 'answers', rows });
  s.answers = AGB_QS.map((q, i) => s.pick[i] == null ? null : q.options[s.pick[i]].k);
  s.phase = 'connecting'; s.q = -1; agbAfterQuestions();
  agbPaint?.();
}
function agbBack() { const s = AGB; if (s.q > 0) { s.q -= 1; agbPaint?.(); } }
async function agbAfterQuestions() {
  const s = AGB;
  s.busy = true;
  const labels = (s.msgs.find(m => m.who === 'answers')?.rows || []).map(r => r[1]);
  const m = { who: 'clavia', steps: [], text: '' };
  s.msgs.push(m); agbPaint?.();
  for (const st of agbPlanSteps(labels)) { m.steps.push({ ...st, running: true }); agbPaint?.(); await agbWait(850); m.steps[m.steps.length - 1].running = false; agbPaint?.(); }
  await agbWait(300);
  s.busy = false;
  m.text = 'It needs four apps. Three are connected already; Teams needs you, so it can ask for approvals.'; m.conns = true;
  agbPaint?.();
}
async function agbConnect(id) {
  const s = AGB; s.conns[id] = 'wait'; agbPaint?.();
  await agbWait(1300);
  s.conns[id] = 'on'; agbPaint?.();
  if (AGB_CONNS.every(c => s.conns[c.id] === 'on')) { await agbWait(600); agbBuild(); }
}
async function agbBuild() {
  const s = AGB; if (s.phase !== 'connecting') return;
  s.phase = 'building'; s.busy = true;
  const m = { who: 'clavia', steps: [], text: '' };
  s.msgs.push(m); agbPaint?.();
  for (const st of agbBuildSteps()) { m.steps.push({ ...st, running: true }); agbPaint?.(); await agbWait(st.rows ? 1100 : 850); m.steps[m.steps.length - 1].running = false; agbPaint?.(); }
  await agbWait(300);
  m.text = 'NDA Desk is ready. Review it, then publish.'; m.agent = true;
  s.phase = 'ready'; s.busy = false; agbPaint?.();
}
function agbPublish() {
  const s = AGB; if (s.published) return;
  s.published = true; s.phase = 'done';
  state.agBuilt = true; save();
  s.panel = true;
  agbPaint?.();
  pbToast('NDA Desk is live', { label: 'View in Agents', run: () => { mxClose('agents'); AG_ST.tab = 'mine'; go('agents'); } });
}

let agbPaint = null;
let AGB_ART = null;
/* an agent is a kind of artifact: it opens in the artifact panel and draws itself */
if (typeof RENDER !== 'undefined') RENDER.agent = (a) => a.make();
if (typeof NOUN !== 'undefined') NOUN.agent = 'agent';

/* ── the screen ── */
function agentBuildView(open) {
  if (open === 'build/done' || (open === 'build' && !AGB)) AGB = open === 'build/done' ? agbFinished() : null;
  if (!AGB) return agentCreatePage(AGB_BRIEF);
  const s = AGB;
  const thread = h('div', { class: 'agb-thread' });
  const dock = h('div', { class: 'agb-dock' });
  const panel = h('aside', { class: 'agb-panel', 'aria-label': 'Agent' });
  const page = h('div', { class: 'agb' },
    h('div', { class: 'agb-main' },
      h('header', { class: 'agb-head' },
        h('button', { class: 'pb-create-back', type: 'button', onclick: () => { mxClose('agents'); go('agents'); } },
          h('span', { class: 'pb-create-back-ar', html: PB_SVG.chev }), 'Agents'),
        h('span', { class: 'agb-title' }, s.published ? 'NDA Desk' : '')),
      h('div', { class: 'agb-scroll' }, thread), dock),
    panel);

  const TABS = [
    ['instructions', 'Instructions', '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'],
    ['approvals', 'Approvals', '<path d="M12 3l8 3v6c0 4.6-3.3 8-8 9-4.7-1-8-4.4-8-9V6z"/><path d="M8.5 12l2.4 2.4 4.6-4.8"/>'],
    ['routines', 'Triggers and routines', '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'],
    ['artifacts', 'Artifacts', '<path d="M12 3.2 20 7.6v8.8L12 20.8 4 16.4V7.6z"/><path d="M4 7.6l8 4.4 8-4.4M12 12v8.8"/>'],
    ['computer', 'Computer', '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9 20h6M12 16.5V20"/>'],
    ['access', 'Access', '<path d="M12 11v4M8.5 8.5a5 5 0 0 1 8.5 3.5c0 3-.8 5.6-2.2 7.5M6.6 11.5c0 3-.6 5-1.6 6.5M12 4a8 8 0 0 1 8 8c0 1.4-.1 2.8-.4 4M4 12a8 8 0 0 1 3-6.2M9.3 20.5c1.3-1.9 2.1-4.5 2.4-7"/>'],
  ];
  const msgEl = (m) => {
    if (m.who === 'you') return h('div', { class: 'agb-msg is-you' }, h('div', { class: 'agb-bubble' }, m.text));
    if (m.who === 'answers') return h('div', { class: 'agb-msg is-you' }, h('div', { class: 'agb-answers' },
      ...m.rows.map(([q, a]) => h('div', { class: 'agb-answers-r' }, h('span', { class: 'agb-answer-q' }, q), h('span', { class: 'agb-answer-a' }, a)))));
    if (m.who === 'sys') return h('div', { class: 'agb-sys' }, h('span', { class: 'agb-live' }), m.text);
    const parts = [];
    if (m.steps?.length) parts.push(traceEl(m.steps, { open: m.open !== false, busy: s.busy && m === s.msgs[s.msgs.length - 1] && !m.text, onToggle: (o) => { m.open = o; } }));
    if (m.text) parts.push(h('p', { class: 'agb-text' }, m.text));
    if (m.conns) parts.push(connCards());
    if (m.agent) parts.push(agentCard());
    return h('div', { class: 'agb-msg is-clavia' }, ...parts);
  };

  const connCards = () => {
    return h('div', { class: 'agb-conns' },
      h('div', { class: 'agb-conn-grid' }, ...AGB_CONNS.map(c => {
        const st = s.conns[c.id];
        /* one row each, across: the app, what it does for the agent, whether it is a trigger or an action, and its state */
        return h('div', { class: 'agb-conn' + (st === 'on' ? ' is-on' : '') },
          h('img', { class: 'agb-conn-logo', src: brandSrc(c.id), alt: '' }),
          h('span', { class: 'agb-conn-t' }, h('span', { class: 'agb-conn-n' }, c.name), h('span', { class: 'agb-conn-s' }, c.say)),
          st === 'on' ? h('span', { class: 'agb-conn-state' }, h('span', { class: 'agb-dot' }), 'Connected')
          : st === 'wait' ? h('span', { class: 'agb-conn-state is-wait' }, h('span', { class: 'agb-spin' }), 'Connecting…')
          : h('button', { class: 'agb-conn-go', type: 'button', onclick: () => agbConnect(c.id) }, 'Connect'));
      })),
      /* no Build button: once every app is connected, it builds */
      null);
  };

  /* the agent, with everything it is made of: each part is a row that opens its tab on the profile */
  const PARTS = [
    ['instructions', 'Instructions', '5 steps, from NDA Playbook v7'],
    ['instructions', 'Skills', 'Triage, Draft from template, Summarise redline, Escalation note'],
    ['approvals', 'Approvals', '4 guardrails; Grace Coleman says yes'],
    ['routines', 'Triggers and routines', 'Outlook and Salesforce; Monday digest, daily chase'],
    ['computer', 'Computer', 'Its own sandbox with Outlook, Word, Teams, SharePoint'],
    ['access', 'Access', '4 apps; the legal team can change it'],
  ];
  const agentCard = () => h('div', { class: 'agb-card' + (s.published ? ' is-live' : '') },
    h('div', { class: 'agb-card-head' },
      h('span', { class: 'agb-card-mark', html: agIcon(AGB_AGENT.mark) }),
      h('span', { class: 'agb-card-t' }, h('span', { class: 'agb-card-n' }, AGB_AGENT.name),
        h('span', { class: 'agb-card-s' }, s.published ? h('span', { class: 'agb-dot' }) : null, s.published ? 'Agent · Live' : 'Agent · Ready to publish')),
      h('button', { class: 'btn btn--ghost agb-card-open', type: 'button', onclick: () => { s.panel = true; s.tab = 'instructions'; agbPaint(); } }, 'Open'),
      s.published ? null : h('button', { class: 'btn btn--primary', type: 'button', onclick: agbPublish }, 'Publish')),
    h('div', { class: 'agb-parts' }, ...PARTS.map(([tab, k, v]) => h('button', { class: 'agb-part', type: 'button', onclick: () => { s.panel = true; s.tab = tab; agbPaint(); } },
      h('span', { class: 'agb-part-ic', html: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${k === 'Skills' ? '<path d="M12 4.5c.6 4.2 3.3 6.9 7.5 7.5-4.2.6-6.9 3.3-7.5 7.5-.6-4.2-3.3-6.9-7.5-7.5 4.2-.6 6.9-3.3 7.5-7.5z"/>' : (TABS.find(t => t[0] === tab) || TABS[0])[2]}</svg>` }),
      h('span', { class: 'agb-part-k' }, k), h('span', { class: 'agb-part-v' }, v),
      h('span', { class: 'agb-part-go', html: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>' })))));

  /* the question rises above the box, as on a contract's Ask Clavia: three at most, numbered */
  const questionEl = () => {
    const q = AGB_QS[s.q], last = s.q === AGB_QS.length - 1, pick = s.pick[s.q];
    const other = h('input', { class: 'jv-aq-in', placeholder: 'Something else', value: s.other[s.q] || '',
      oninput: (e) => { s.other[s.q] = e.target.value; s.pick[s.q] = e.target.value.trim() ? -1 : 0; e.target.closest('.agb-q').querySelectorAll('.agb-opt').forEach((o, i) => o.classList.toggle('is-on', s.pick[s.q] === i)); e.target.closest('.agb-opt-other').classList.toggle('is-on', s.pick[s.q] === -1); },
      onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); agbNext(); } } });
    const radio = '<svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.3"/><circle class="agb-radio-dot" cx="8" cy="8" r="3.4" fill="currentColor"/></svg>';
    return h('div', { class: 'agb-q', role: 'group', 'aria-label': q.title },
      h('div', { class: 'agb-q-top' },
        s.q > 0 ? h('button', { class: 'agb-q-back', type: 'button', 'aria-label': 'Previous question', 'data-tip': 'Back', html: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>', onclick: agbBack }) : null,
        h('b', {}, q.title),
        h('span', { class: 'agb-q-steps', 'aria-label': `${s.q + 1} of ${AGB_QS.length}` }, ...AGB_QS.map((_, i) => h('i', { class: i === s.q ? 'is-on' : i < s.q ? 'is-done' : '' })))),
      ...q.options.map((o, i) => h('button', { class: 'agb-opt' + (pick === i ? ' is-on' : ''), type: 'button', role: 'radio', 'aria-checked': String(pick === i), onclick: () => agbPick(i) },
        h('span', { class: 'agb-radio', html: radio }), h('span', { class: 'agb-opt-l' }, o.label), h('span', { class: 'agb-opt-n' }, String(i + 1)))),
      h('label', { class: 'agb-opt agb-opt-other' + (pick === -1 ? ' is-on' : '') }, h('span', { class: 'agb-radio', html: radio }), other),
      h('div', { class: 'agb-q-foot' },
        h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => agbNext(true) }, 'Skip'),
        h('button', { class: 'btn btn--primary', type: 'button', onclick: () => agbNext() }, last ? 'Submit' : 'Next')));
  };

  /* the box at the foot is the chat's own: one line, + and the model at the ends */
  const box = () => {
    const el = h('div', { class: 'ask ask-mini agb-ask',
      html: `<textarea rows="1" aria-label="Message" placeholder="${s.published ? 'Ask NDA Desk to change something…' : 'Write a message…'}"></textarea>`
        + '<div class="askbar"><button class="send" type="button" disabled aria-label="Send">' + ARROW + '</button></div>' });
    queueMicrotask(() => { if (el.isConnected && typeof initComposer === 'function') initComposer(el, { noTokens: true, onSend: () => {} }); });
    return el;
  };

  /* the profile, as an agent's page: its mark, its name, what it is doing, and four tabs */
  const row = (k, v, lead) => h('div', { class: 'agb-row' }, lead || null, h('div', { class: 'agb-row-t' }, h('span', { class: 'agb-row-k' }, k), v ? h('span', { class: 'agb-row-v' }, v) : null));
  const logo = (id) => h('img', { class: 'agb-row-logo', src: brandSrc(id), alt: '' });
  const sec = (title, ...rows) => h('section', { class: 'agb-sec' }, h('h3', { class: 'agb-sec-h' }, title), ...rows);
  /* its own computer: a sandbox screen you can watch. Asleep until it is published; then it wakes and
     goes about its work — the inbox, the NDA, Teams — one scene after another */
  const SCENES = [
    { app: 'chrome', site: 'outlook', where: 'outlook.office.com/mail', title: 'Inbox · legal@lumen.io', now: 'Opening Priya’s email with Birch Labs’ NDA', body: () => h('div', { class: 'agc-mail' },
      ...[['Priya Shah', 'NDA for Birch Labs before Thursday', true], ['Omar Haddad', 'RE: Mutual NDA, signed copy', false], ['Daniel Okafor', 'Brightwell: order form v3', false], ['Tom Becker', 'Brightline renewal notice', false]]
        .map(([who, subj, on]) => h('div', { class: 'agc-mail-r' + (on ? ' is-on' : '') }, h('b', {}, who), h('span', {}, subj)))) },
    { app: 'chrome', site: 'word', where: 'lumen.sharepoint.com/Legal/NDAs', title: 'Birch Labs — Mutual NDA.docx', now: 'Redlining clause 9: a five-year term down to three', body: () => h('div', { class: 'agc-doc' },
      h('span', { class: 'agc-doc-h' }, '9. Term'),
      h('p', {}, 'This Agreement continues for ', h('del', {}, 'five (5)'), h('ins', {}, 'three (3)'), ' years from the Effective Date, and the duty of confidence survives for two years after.'),
      h('i', { class: 'agc-line' }), h('i', { class: 'agc-line' }), h('i', { class: 'agc-line is-short' })) },
    { app: 'chrome', site: 'teams', where: 'teams.microsoft.com', title: '#legal-approvals', now: 'Asking Grace Coleman for a yes', body: () => h('div', { class: 'agc-chat' },
      h('div', { class: 'agc-chat-m' }, h('b', {}, 'NDA Desk'), h('span', {}, 'Birch Labs want a five-year term. I have redlined it to three, as the playbook says. OK to send?')),
      h('div', { class: 'agc-chat-a' }, h('span', { class: 'agc-btn is-on' }, 'Approve'), h('span', { class: 'agc-btn' }, 'Change it'))) },
  ];
  const computerEl = () => {
    clearTimeout(s.compTimer);
    const stage = h('div', { class: 'agc-stage' });
    /* its computer has three things: a browser, a terminal and its file storage (15 Oct) */
    const DOCK = [['chrome', h('img', { src: brandSrc('chrome'), alt: '' })],
      ['terminal', h('span', { class: 'agc-dock-svg', html: '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="2" y="3.5" width="20" height="17" rx="4" fill="#1F2430"/><path d="M6.5 9.5l3 2.5-3 2.5M11.5 15h5" fill="none" stroke="#E5E7EB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' })],
      ['files', h('span', { class: 'agc-dock-svg', html: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M2.5 7a2.5 2.5 0 0 1 2.5-2.5h4.2l2 2.2H19A2.5 2.5 0 0 1 21.5 9.2V18a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 18z" fill="#5B9BE6"/><path d="M2.5 10h19v8a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 18z" fill="#7DB3F0"/></svg>' })]];
    const dock = h('div', { class: 'agc-dock' }, ...DOCK.map(([id, el]) => h('span', { class: 'agc-dock-i', 'data-app': id, 'data-tip': id === 'files' ? 'File Storage' : id[0].toUpperCase() + id.slice(1) }, el)));
    /* a desktop of its own: a wallpaper, a dock with the apps it uses, and whatever it has open */
    const screen = h('div', { class: 'agc-screen', role: 'button', tabindex: '0', 'aria-label': 'Watch full screen', 'data-tip': 'Watch Full Screen',
      onclick: () => agcBig(screen), onkeydown: (e) => { if (e.key === 'Enter') agcBig(screen); } },
      h('span', { class: 'agc-wall', 'aria-hidden': 'true', html: '<svg viewBox="0 0 400 260" preserveAspectRatio="none"><defs><linearGradient id="agcRib" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0E5B45" stop-opacity="0"/><stop offset=".45" stop-color="#0E5B45" stop-opacity=".22"/><stop offset="1" stop-color="#0E5B45" stop-opacity="0"/></linearGradient></defs><path d="M-20 20C80 40 140 120 200 170S330 250 430 230" fill="none" stroke="url(#agcRib)" stroke-width="46" stroke-linecap="round"/><path d="M-20 30C90 52 150 128 205 176S335 254 430 238" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/></svg>' }),
      stage, dock);
    const now = h('span', { class: 'agc-now' });
    const wrap = h('div', { class: 'agc' }, screen, h('span', { class: 'agc-cap' }, `${AGB_AGENT.name}’s screen`), now);
    const sleep = (t, sub) => stage.replaceChildren(h('div', { class: 'agc-wake' }, h('span', { class: 'agc-wake-ic', html: agIcon(AGB_AGENT.mark) }), h('b', {}, t), h('span', {}, sub)));
    if (!s.published) { sleep('Asleep', 'It wakes once it is published'); return wrap; }
    let i = 0;
    const show = () => {
      if (!wrap.isConnected || s.tab !== 'computer') return;
      const sc = SCENES[i % SCENES.length]; i++;
      dock.querySelectorAll('.agc-dock-i').forEach(d => d.classList.toggle('is-on', d.dataset.app === sc.app));
      stage.replaceChildren(h('div', { class: 'agc-win' },
        h('div', { class: 'agc-bar' }, h('i'), h('i'), h('i'), h('span', { class: 'agc-tab' }, h('img', { class: 'agc-app', src: brandSrc(sc.site), alt: '' }), sc.title)),
        h('div', { class: 'agc-url' }, h('span', { html: '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>' }), sc.where),
        h('div', { class: 'agc-body' }, sc.body(), h('span', { class: 'agc-cursor', html: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 3l14 8-6 1.6L10 19z" fill="#1F1F1D" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>' }))));
      now.replaceChildren(h('span', { class: 'agb-dot' }), sc.now);
      s.compTimer = setTimeout(show, 4200);
    };
    sleep('Waking up…', 'Just a moment');
    now.textContent = '';
    s.compTimer = setTimeout(show, 1600);
    return wrap;
  };
  const tabBody = () => {
    const P = AGB_PROFILE;
    if (s.tab === 'computer') return [computerEl()];
    /* everything it makes, kept in one place: what it drafted, redlined and sent (15 Oct) */
    if (s.tab === 'artifacts') return s.published ? [
      sec('Made in the dry run',
        ...[['Birch Labs — Mutual NDA (redlined).docx', 'Three years, not five · waiting for Grace'], ['Escalation note — Birch Labs.docx', 'One-line reason for Grace Coleman'], ['Gulf Systems — NDA (held).docx', 'Governing law to DIFC · for Roger to sign off']]
          .map(([n, v]) => row(n, v, h('img', { class: 'agb-row-logo', src: brandSrc('word'), alt: '' })))),
      sec('From now on', h('div', { class: 'agb-empty' }, h('span', {}, 'Every NDA it drafts, redlines or sends lands here, saved to Legal › NDAs.')))]
      : [sec('Made by this agent', h('div', { class: 'agb-empty' }, h('b', {}, 'Nothing yet'), h('span', {}, 'What it drafts, redlines and sends collects here once it is published.')))];
    if (s.tab === 'instructions') {
      const SPARK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 4.5c.6 4.2 3.3 6.9 7.5 7.5-4.2.6-6.9 3.3-7.5 7.5-.6-4.2-3.3-6.9-7.5-7.5 4.2-.6 6.9-3.3 7.5-7.5z"/></svg>';
      const CHAT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6.8 4.8h10.4a3 3 0 0 1 3 3v5.9a3 3 0 0 1-3 3h-5.1L8 20.2v-3.5H6.8a3 3 0 0 1-3-3V7.8a3 3 0 0 1 3-3z"/></svg>';
      return [
        sec('Role', h('p', { class: 'aga-lede' }, AGB_BRIEF_FULL.role)),
        sec('When it runs', ...AGB_BRIEF_FULL.runs.map(([t, src]) => row(t, null, src === 'chat' ? h('span', { class: 'agb-row-ic', html: CHAT }) : logo(src)))),
        sec('How it works', h('ol', { class: 'aga-steps' }, ...AGB_BRIEF_FULL.steps.map(([k, v]) => h('li', {}, h('b', {}, k), h('span', {}, v))))),
        sec('How it decides', h('div', { class: 'aga-rules' },
          h('div', { class: 'aga-rule aga-rule--h' }, h('span', {}, 'If the NDA has'), h('span', {}, 'It will')),
          ...AGB_BRIEF_FULL.rules.map(([k, v]) => h('div', { class: 'aga-rule' }, h('span', {}, k), h('span', {}, v))))),
        sec('How it writes', h('p', { class: 'agb-para' }, AGB_BRIEF_FULL.style)),
        sec('It never', h('ul', { class: 'aga-never' }, ...AGB_BRIEF_FULL.never.map(t => h('li', {}, t)))),
        sec('Skills it calls', ...P.skills.map(([k, v]) => row(k, v, h('span', { class: 'agb-row-ic', html: SPARK })))),
        sec('Works from', ...P.works.map(([t, kind]) => row(t, kind === 'playbook' ? 'Playbook' : 'Template', h('span', { class: 'agb-row-ic', html: kind === 'playbook' ? icon('playbooks', 'ico').outerHTML : icon('templates', 'ico').outerHTML }))))];
    }
    if (s.tab === 'approvals') return [
      sec('Needs a lawyer’s yes', ...P.guardrails.map(([k, v]) => row(k, v, h('span', { class: 'agb-row-ic', html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.6-3.3 8-8 9-4.7-1-8-4.4-8-9V6z"/></svg>' })))),
      sec('Waiting for approval', h('div', { class: 'agb-empty' }, h('b', {}, 'No approvals yet'), h('span', {}, s.published ? 'When it needs a yes, it asks Grace in Teams and lists it here.' : 'Publish it to start.')))];
    if (s.tab === 'routines') return [
      sec('Starts when', ...P.triggers.map(([id, t]) => row(t, null, logo(id)))),
      sec('Routines', ...P.routines.map(([when, t]) => row(t, when, h('span', { class: 'agb-row-ic', html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>' }))))];
    return [
      sec('Connections', ...P.access.map(([id, n, v]) => row(n, v, logo(id)))),
      sec('Who can use it', ...P.who.map(([k, v]) => row(k, v, h('span', { class: 'agb-row-ic', html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/></svg>' })))),
      sec('Runs as', row('NDA Desk', 'nda-desk@lumen.io'))];
  };
  /* the agent is opened the way any artifact is: in the artifact panel, with its header (version,
     comments, full screen, close), on a page of its own with named tabs (16 Oct) */
  const profile = () => {
    const hero = h('header', { class: 'aga-hero' });
    const tabs = h('nav', { class: 'aga-tabs', role: 'tablist' });
    const body = h('div', { class: 'aga-body' });
    const paint = () => {
      hero.replaceChildren(...[
        h('span', { class: 'aga-avatar', html: agIcon(AGB_AGENT.mark) }),
        h('div', { class: 'aga-hero-t' },
          h('h1', { class: 'aga-name' }, AGB_AGENT.name),
          h('p', { class: 'aga-say' }, AGB_AGENT.say),
          h('span', { class: 'aga-status' + (s.published ? ' is-live' : '') }, h('i'), s.published ? 'Live · runs as nda-desk@lumen.io' : 'Ready to publish')),
        s.published ? null : h('button', { class: 'btn btn--primary aga-pub', type: 'button', onclick: agbPublish }, 'Publish')].filter(Boolean));
      /* tabs by name, short enough that all six sit on one line beside a conversation */
      const SHORT = { routines: 'Triggers' };
      tabs.replaceChildren(...TABS.map(([k, label, svg]) => h('button', { class: 'aga-tab', type: 'button', role: 'tab', 'aria-selected': String(s.tab === k), title: label,
        onclick: () => { s.tab = k; paint(); } },
        h('span', { class: 'aga-tab-ic', html: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>` }),
        SHORT[k] || label)));
      body.replaceChildren(...tabBody());
    };
    paint();
    return { node: h('div', { class: 'aga-scroll' }, h('div', { class: 'aga-page' }, hero, tabs, body)), paint };
  };
  const paintPanel = () => {
    panel.replaceChildren();
    const main = document.getElementById('main');
    const showing = main?.dataset.artifact === 'open' && document.querySelector('#artifactPanel .deck-view[data-kind="agent"]');
    if (!s.panel) { if (showing) closeArtifact(); return; }
    if (showing && AGB_ART) { AGB_ART.paint(); return; }
    const a = ARTIFACTS['agent-nda-desk'] || (ARTIFACTS['agent-nda-desk'] = { id: 'agent-nda-desk', kind: 'agent', name: AGB_AGENT.name, vi: 0, versions: [{ when: 'Today', by: 'Brain' }] });
    a.make = () => { const p = profile(); AGB_ART = p; return { body: p.node, onClose: () => { AGB_ART = null; if (AGB === s && s.panel) { s.panel = false; agbPaint(); } } }; };
    openArtifact(a);
  };

  agbPaint = () => {
    if (!page.isConnected && agbPaint.ready) return;
    agbPaint.ready = true;
    page.classList.remove('has-panel');
    page.querySelector('.agb-title').textContent = s.published ? 'NDA Desk' : '';
    thread.replaceChildren(...s.msgs.map(msgEl), s.busy && !s.msgs[s.msgs.length - 1]?.steps ? h('div', { class: 'agb-msg is-clavia' }, h('span', { class: 'agb-typing' }, h('i'), h('i'), h('i'))) : '');
    dock.replaceChildren(...[s.phase === 'asking' && s.q >= 0 ? questionEl() : null, box()].filter(Boolean));
    paintPanel();
    const sc = page.querySelector('.agb-scroll'); requestAnimationFrame(() => { sc.scrollTop = sc.scrollHeight; });
  };
  agbPaint();
  return page;
}

/* keys 1–3 pick, Enter goes on, while a question is up */
document.addEventListener('keydown', (e) => {
  if (!AGB || AGB.phase !== 'asking' || state.view !== 'agents' || !/^build/.test(MX.agents.open || '')) return;
  if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return;
  const q = AGB_QS[AGB.q]; if (!q) return;
  const i = { '1': 0, '2': 1, '3': 2 }[e.key];
  if (i != null && q.options[i]) { e.preventDefault(); agbPick(i); }
  else if (e.key === 'Enter') { e.preventDefault(); agbNext(); }
});

/* the agent's screen, full size: watch it work, or take the controls for a moment */
function agcBig(screen) {
  if (document.querySelector('.agc-over')) return;
  const home = screen.parentElement, next = screen.nextSibling;
  let mine = false;
  const seg = h('div', { class: 'agc-seg', role: 'radiogroup' });
  const paintSeg = () => seg.replaceChildren(
    h('button', { type: 'button', role: 'radio', 'aria-checked': String(!mine), class: !mine ? 'is-on' : '', onclick: () => { mine = false; paintSeg(); over.classList.remove('is-mine'); } },
      h('span', { html: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></svg>' }), 'Watching'),
    h('button', { type: 'button', role: 'radio', 'aria-checked': String(mine), class: mine ? 'is-on' : '', onclick: () => { mine = true; paintSeg(); over.classList.add('is-mine'); pbToast('You have the controls. NDA Desk waits until you give them back.'); } }, 'Take control'));
  const close = () => { document.removeEventListener('keydown', esc, true); home.insertBefore(screen, next); screen.classList.remove('is-big'); over.remove(); };
  const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const over = h('div', { class: 'agc-over', onclick: (e) => { if (e.target === over) close(); } },
    h('button', { class: 'agc-over-x', type: 'button', 'aria-label': 'Close', 'data-tip': 'Close', html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>', onclick: close }),
    screen, seg);
  screen.classList.add('is-big');
  paintSeg();
  document.body.append(over);
  document.addEventListener('keydown', esc, true);
}
