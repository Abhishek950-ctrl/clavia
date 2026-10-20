/* ------------------------------------------------------------------
   Agents as conversations (15 Oct).

   X shows a switch at the top of the rail: Workspace, as it is, or Agents,
   where the rail becomes your chats with agents (one each, or a group of
   them with colleagues, the way iMessage does it) and the page is the
   conversation. Without X nothing changes.

   One thread per chat. An agent asks its questions inside the thread as
   cards with an answer to pick, says when it needs you at its computer,
   and shows you what it is doing while it does it. Seeded on legal's own
   matters; whatever you start here lives until a reload.
------------------------------------------------------------------ */

const AC = { on: false, mode: 'work', open: null, prev: null, panel: false, tab: 'details', embed: false, find: '', folds: {} };

/* agents you make here: a name, a shape and a colour */
const AC_MINE = [];
const AC_SHAPES = ['clause', 'nda', 'playbook', 'redline', 'diligence', 'privacy', 'obligation', 'hold', 'research', 'regulatory', 'signature', 'triage', 'summary', 'translate']
  .filter(k => typeof AG_BOT !== 'undefined' && AG_BOT[k]);
const AC_COLORS = ['#2FA57A', '#2FB0A0', '#5BC0EB', '#3D7FE6', '#8B62E0', '#E04FD3', '#E36A8E', '#E25555', '#F0703A', '#E9A23B', '#7A8597'];
const AC_PEOPLE = [['Grace Coleman', 'General Counsel'], ['Matt Rivera', 'Senior Counsel'], ['Rachel Okafor', 'Legal Operations'], ['Dev Anand', 'Commercial Lead'], ['Meera Nair', 'Privacy Counsel']];

/* the colleagues a group can include, each with a real photograph */
Object.assign(PHOTOS, { 'Rachel Okafor': 'assets/people/rachel-okafor.jpg', 'Dev Anand': 'assets/people/dev-anand.jpg', 'Meera Nair': 'assets/people/meera-nair.jpg' });
const acAgent = (id) => AC_MINE.find(x => x.id === id) || (typeof agentById === 'function' ? agentById(id) : null) || LEGAL_AGENTS.find(x => x.id === id);
const acIsP = (m) => typeof m === 'string' && m.startsWith('p:');
const acName = (m) => acIsP(m) ? m.slice(2) : (acAgent(m)?.name || 'Agent');
const acFirst = (n) => n.split(' ')[0];

/* a bot of your own: one of the shapes, in the colour you picked, with the same eyes */
function acBot(a) {
  const [, shape, ex, ey] = AG_BOT[a.shape] || AG_BOT.clause;
  const c = a.color, g = 'acsh-' + a.id;
  return `<svg class="ag-ic ag-ic--bot" data-style="bot" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient></defs>`
    + `<g class="ag-body"><g fill="${c}">${shape.replace(/CURR/g, c)}</g><g fill="url(#${g})">${shape.replace(/stroke="CURR"/g, 'stroke="none"').replace(/CURR/g, c)}</g></g>${agEyes(ex, ey, '#14211B')}</svg>`;
}
/* every copy gets its own gradient ids: two icons sharing one id paint from whichever comes first,
   and if that one is hidden the other draws blank */
let acUid = 0;
const acUniq = (svg) => { const n = ++acUid; return svg.replace(/id="([^"]+)"/g, `id="$1-u${n}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-u${n})`); };
const acIcon = (id) => { const m = AC_MINE.find(x => x.id === id); return acUniq(m ? acBot(m) : agIcon(id)); };
function acAv(m, cls = '') {
  if (acIsP(m)) return faceEl(m.slice(2), 'ac-av ac-av--p' + (cls ? ' ' + cls : ''));
  return h('span', { class: 'ac-av' + (cls ? ' ' + cls : ''), html: acIcon(m) });
}
/* a group shows up to three of its members, the way a group thread does */
function acCluster(members, cls = '') {
  const who = members.slice(0, 3);
  return h('span', { class: 'ac-cl ac-cl--' + who.length + (cls ? ' ' + cls : '') }, ...who.map(m => acAv(m, 'ac-cl-i')));
}
const acChatAv = (c, cls) => c.kind === 'group' ? acCluster(c.members, cls) : acAv(c.agent, cls);
const acTitle = (c) => c.kind === 'group' ? c.name : acName(c.agent);

const acNow = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const acWait = (ms) => new Promise(r => setTimeout(r, Math.round(ms * (typeof PACE_SCALE === 'number' ? PACE_SCALE : 1))));

/* words with a little markdown: paragraphs, "- " lists and **bold** */
function acProse(text) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|\s)@([A-Z][\w’']*(?: [A-Z][\w’']*)*)/g, '$1<span class="ac-at">@$2</span>');
  const html = text.split(/\n\n+/).map(block => {
    const lines = block.split('\n');
    if (lines.every(l => /^- /.test(l))) return '<ul>' + lines.map(l => `<li>${esc(l.slice(2))}</li>`).join('') + '</ul>';
    if (lines.length > 1 && lines.slice(1).every(l => /^- /.test(l))) return `<p>${esc(lines[0])}</p><ul>` + lines.slice(1).map(l => `<li>${esc(l.slice(2))}</li>`).join('') + '</ul>';
    return `<p>${esc(block).replace(/\n/g, '<br>')}</p>`;
  }).join('');
  return h('div', { class: 'ac-prose', html });
}
const acPlain = (t) => (t || '').replace(/\*\*/g, '').replace(/\n+/g, ' ').replace(/^- /, '');

/* ── the chats, seeded on legal's own matters ── */
/* one list, newest first; sections only once you make one */
const AC_SECTIONS = [{ id: 'none', name: 'Unassigned' }];
const W = (name, meta) => ({ name, meta });
const AC_CHATS = [
  { id: 'northwind-room', kind: 'group', name: 'Northwind deal room', section: 'none', when: '9:41 AM', unread: 2,
    members: ['redline', 'clause', 'signature', 'p:Grace Coleman'], made: 'Thu 15 Oct',
    msgs: [
      { t: 'stamp', text: 'Today 9:12 AM' },
      { t: 'sys', ic: 'group', text: 'You made this group with Contract Redliner, Clause Finder, Signature Chaser and Grace Coleman' },
      { t: 'me', text: 'Northwind sent their redline of the MSA last night. What changed, and what can we live with?' },
      { t: 'ag', who: 'redline', work: [['sharepoint', 'Northwind MSA v4 (their redline) against our v3', '38 clauses'], ['playbook', 'MSA Playbook, 22 positions'], ['think', 'Matched each change to our fallbacks']],
        text: 'Four changes matter. The rest is formatting and defined terms.\n\n- **Liability cap** up from 12 months’ fees to 24. The playbook goes to 18.\n- **Indemnity** now covers indirect loss. The playbook says no.\n- **Termination for convenience** cut from 90 days’ notice to 30.\n- **Governing law** moved from New York to Delaware. That one is fine.' },
      { t: 'ag', who: 'clause', work: [['sharepoint', 'Signed MSAs over $1M, last 24 months', '12 contracts']],
        text: 'On the cap: of our last 12 MSAs over $1M, we agreed 18 months four times and 24 never. The closest is **Harbor Retail (March)**: 18 months, with data breach carved out at 2×.' },
      { t: 'pp', who: 'p:Grace Coleman', text: 'Go to 18 with the Harbor carve-out. Hold firm on indirect loss.' },
      { t: 'me', text: '@Contract Redliner update our response to 18 months with the Harbor carve-out, and push back on indirect loss.' },
      { t: 'ag', who: 'redline', text: 'Done. v5 offers **18 months, with data breach at 2×**, strikes indirect loss and cites clause 11.3 of the playbook in a comment.',
        files: [W('Northwind MSA – our response v5.docx', 'Word · 3 changes from v4')] },
      { t: 'ag', who: 'signature', text: 'When Grace approves v5 I will send it to **Dana Whitfield** at Northwind and chase every two days. Should I copy their GC?' },
    ] },
  { id: 'triage', kind: 'agent', agent: 'triage', section: 'none', when: '9:30 AM',
    msgs: [
      { t: 'stamp', text: 'Today 9:30 AM' },
      { t: 'ag', who: 'triage', text: 'Three new requests this morning. Routed:\n\n- **Brightwell order form** to Elena Petrova\n- **Lumen vendor DPA** to Aisha Rahman\n- **Office lease renewal** to you, because it needs a signatory' },
    ] },
  { id: 'obligation', kind: 'agent', agent: 'obligation', section: 'none', when: '8:54 AM', attention: true,
    comp: { app: 'salesforce', state: 'needed' },
    msgs: [
      { t: 'stamp', text: 'Today 8:52 AM' },
      { t: 'me', text: 'Which contracts renew in the next 90 days, and who owns each account?' },
      { t: 'ag', who: 'obligation', work: [['sharepoint', 'Renewal dates in Legal › Executed', '418 contracts'], ['think', 'Worked out each notice deadline']],
        text: 'I found **14 contracts** that renew before 13 January. To tell you who owns each account I need Salesforce.' },
      { t: 'comp', who: 'obligation', app: 'salesforce', text: 'Sign in to Salesforce so I can match each contract to its account owner.', state: 'needed' },
    ] },
  { id: 'regulatory', kind: 'agent', agent: 'regulatory', section: 'none', when: '7:00 AM', unread: 1,
    msgs: [
      { t: 'stamp', text: 'Thu 8 Oct 7:00 AM' },
      { t: 'ag', who: 'regulatory', text: 'Your weekly digest: nothing new that touches our contracts. One reminder: the **vendor AI clause** you asked for is still in draft.' },
      { t: 'stamp', text: 'Today 7:00 AM' },
      { t: 'ag', who: 'regulatory', work: [['web', 'Regulators and official journals in the EU, UK and US', '41 updates'], ['sharepoint', 'Active vendor and customer contracts', '418 files'], ['think', 'Kept the ones that change what we have signed']],
        text: 'Your weekly digest: **three changes this week that touch you.**\n\n- **EU AI Act**: duties for general-purpose AI providers now apply. Six vendor contracts have no AI clause.\n- **UK data rules**: automated decisions now need a way for people to object. Our HR policy does not offer one.\n- **California privacy rules**: risk assessments for automated decision-making. Applies to the Trellis Health contract.\n\nI have drafted the AI clause for the six vendors.',
        files: [W('Vendor AI clause – draft.docx', 'Word · for 6 contracts')] },
    ] },
  { id: 'redline', kind: 'agent', agent: 'redline', section: 'none', when: 'Yesterday',
    msgs: [
      { t: 'stamp', text: 'Yesterday 4:18 PM' },
      { t: 'me', text: 'Mark up the Brightwell order form v3 to our standard positions.' },
      { t: 'ag', who: 'redline', work: [['sharepoint', 'Brightwell – Order Form v3.docx', '14 clauses'], ['playbook', 'Order Form Playbook, 9 positions']],
        text: 'Three edits, all inside the playbook:\n\n- **Payment terms**: 45 days to 30.\n- **Auto-renewal**: added a 60-day opt-out.\n- **Price increases**: capped at 5% a year.\n\nNothing needs a lawyer.',
        files: [W('Brightwell – Order Form v3 (redlined).docx', 'Word · 3 changes')] },
      { t: 'me', text: 'Perfect, send it back to Dev.' },
      { t: 'ag', who: 'redline', text: 'Sent to **Dev Anand** with a two-line note on what changed.' },
    ] },
  { id: 'nda', kind: 'agent', agent: 'nda', section: 'none', when: 'Tue',
    msgs: [
      { t: 'stamp', text: 'Tue 13 Oct 4:10 PM' },
      { t: 'ag', who: 'nda', text: 'Hi Roger, I’m NDA Reviewer. Three quick questions so I work the way you do.' },
      { t: 'answers', rows: [['Which NDAs should I handle?', 'Both mutual and one-way'], ['When an NDA is not standard, what should I do?', 'Redline it and send it to me'], ['Where should signed NDAs go?', 'SharePoint · Legal / NDAs']] },
      { t: 'ag', who: 'nda', text: 'Thanks. I’ll take both kinds; one-way NDAs on their paper go to a lawyer, as your playbook says. You see every redline before it goes out, and signed NDAs go to **SharePoint › Legal / NDAs**.\n\nForward me an NDA, or drop one here.' },
      { t: 'me', text: 'Can you check this one?', files: [W('Birch Labs – Mutual NDA.docx', 'Word · 6 pages')] },
      { t: 'ag', who: 'nda', work: [['sharepoint', 'Birch Labs – Mutual NDA.docx', '12 clauses'], ['playbook', 'NDA Playbook v7, 14 positions']],
        text: 'Two problems, both fixable:\n\n- The **term** is five years. Your playbook says three.\n- There is no carve-out for **information we already had**.\n\nI have redlined both.',
        files: [W('Birch Labs – Mutual NDA (redlined).docx', 'Word · 2 changes')] },
    ] },
  { id: 'board-pack', kind: 'group', name: 'Board pack', section: 'none', when: 'Mon', members: ['minutes', 'summary', 'research'], made: 'Mon 12 Oct',
    msgs: [
      { t: 'stamp', text: 'Mon 12 Oct 5:40 PM' },
      { t: 'sys', ic: 'group', text: 'You made this group with Board Minutes, Contract Summary and Legal Research' },
      { t: 'me', text: 'Draft minutes from the board call, and a one-page brief on the Kestrel licence for the pack.' },
      { t: 'ag', who: 'minutes', text: 'Minutes are drafted: **six resolutions**, including approval of the Kestrel licence and the new signing authority matrix.',
        files: [W('Board minutes – 10 Oct (draft).docx', 'Word · 6 resolutions')] },
      { t: 'ag', who: 'summary', text: 'The Kestrel brief is one page: term, fees, exclusivity and the two termination rights the board asked about.',
        files: [W('Kestrel licence – board brief.docx', 'Word · 1 page')] },
    ] },
  { id: 'privacy', kind: 'agent', agent: 'privacy', section: 'none', when: '9 Oct',
    msgs: [
      { t: 'stamp', text: 'Fri 9 Oct 11:05 AM' },
      { t: 'me', text: 'Does the Acme Analytics DPA let them move our data to India?' },
      { t: 'ag', who: 'privacy', work: [['sharepoint', 'Acme Analytics – DPA (signed).pdf', '22 pages']],
        text: 'Yes, but only for support staff, and only under the **EU standard contractual clauses (Module 2)** in Schedule 3. Bengaluru is listed as a sub-processor location in Annex II.\n\nWhat is missing is a **transfer impact assessment**. I can draft one from our template.' },
      { t: 'me', text: 'Please do.' },
      { t: 'ag', who: 'privacy', text: 'Drafted. Two answers need Acme: how long support staff keep access, and whether logs leave the EU.',
        files: [W('Acme Analytics – Transfer impact assessment.docx', 'Word · 2 questions for Acme')] },
    ] },
  { id: 'hold', kind: 'agent', agent: 'hold', section: 'none', when: '8 Oct',
    msgs: [
      { t: 'stamp', text: 'Thu 8 Oct 9:00 AM' },
      { t: 'ag', who: 'hold', text: 'Hold **LH-2026-07 (Kestrel dispute)**: 18 of 21 people have acknowledged. Still waiting on **Dev Anand, Meera Nair and Tom Becker**. I will remind them tomorrow at 9:00.' },
      { t: 'me', text: 'Copy their managers on tomorrow’s reminder.' },
      { t: 'ag', who: 'hold', text: 'Will do. Their managers are on tomorrow’s reminder.' },
    ] },
];

/* ── the switch: Workspace as it is, or Agents ── */
const AC_IC = {
  /* Cowork: you, with the spark beside you, working on the same thing */
  work: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.4" cy="6" r="2.7"/><path d="M1.6 14.2c.5-2.9 2.4-4.6 4.8-4.6s4.3 1.7 4.8 4.6"/><path d="M12.3 1.6c.22 1.5 1.05 2.33 2.55 2.55-1.5.22-2.33 1.05-2.55 2.55-.22-1.5-1.05-2.33-2.55-2.55 1.5-.22 2.33-1.05 2.55-2.55z"/></svg>',
  agents: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"><path d="M3.2 12.6c-1-1.1-1.6-2.6-1.6-4.2C1.6 4.8 4.5 2 8 2s6.4 2.8 6.4 6.4-2.9 6.4-6.4 6.4c-1 0-2-.2-2.8-.6L2.4 15z"/><path d="M8 5.4c.25 1.6 1.2 2.55 2.8 2.8-1.6.25-2.55 1.2-2.8 2.8-.25-1.6-1.2-2.55-2.8-2.8 1.6-.25 2.55-1.2 2.8-2.8z"/></svg>',
  search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"><circle cx="7" cy="7" r="5"/><path d="m14 14-3.4-3.4"/></svg>',
  plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"><path d="M8 2.5v11M2.5 8h11"/></svg>',
  dots: '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/></svg>',
  chev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>',
  panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M15 4v16"/></svg>',
  monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="2.5"/><path d="M8.5 21h7M12 17v4"/></svg>',
  pencil: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 2.6l2.8 2.8-7.8 7.8-3.3.5.5-3.3z"/></svg>',
  group: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="6" cy="5.5" r="2.4"/><path d="M1.8 13.4c.5-2.4 2.2-3.8 4.2-3.8s3.7 1.4 4.2 3.8"/><circle cx="11.4" cy="6.2" r="1.9"/><path d="M11.2 9.6c1.6.1 2.7 1.3 3 3.2"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>',
  x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
  think: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M8 2.2c.4 3 2.4 5 5.4 5.4-3 .4-5 2.4-5.4 5.4-.4-3-2.4-5-5.4-5.4 3-.4 5-2.4 5.4-5.4z"/></svg>',
  web: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c1.7 1.9 1.7 10.1 0 12M8 2c-1.7 1.9-1.7 10.1 0 12"/></svg>',
  book: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"><path d="M8 4.2C6.8 3 5 2.6 2 2.8v9.8c3-.2 4.8.2 6 1.4 1.2-1.2 3-1.6 6-1.4V2.8c-3-.2-4.8.2-6 1.4zM8 4.2V14"/></svg>',
  folder: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"><path d="M1.8 4.4c0-.8.6-1.4 1.4-1.4h3l1.4 1.6h5.2c.8 0 1.4.6 1.4 1.4v6.6c0 .8-.6 1.4-1.4 1.4H3.2c-.8 0-1.4-.6-1.4-1.4z"/></svg>',
  mute: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M4.2 11.2V7.4a3.8 3.8 0 0 1 7.6 0v3.8l.9 1H3.3z"/><path d="M6.6 13.8a1.5 1.5 0 0 0 2.8 0"/></svg>',
};
const acSvg = (k, cls = 'ac-i') => h('span', { class: cls, 'aria-hidden': 'true', html: AC_IC[k] });

let acSw = null;
function acSwitch() {
  const thumb = h('span', { class: 'mode-sw-thumb', 'aria-hidden': 'true' });
  const seg = (k, label) => h('button', { class: 'mode-sw-b', type: 'button', role: 'tab', 'data-k': k, 'aria-selected': String(AC.mode === k), 'data-tip': label,
    onclick: () => acMode(k) }, acSvg(k, 'mode-sw-ic'), h('span', { class: 'mode-sw-l' }, label));
  const el = h('div', { class: 'mode-sw', role: 'tablist', 'aria-label': 'Cowork or agents' }, thumb, seg('work', 'Cowork'), seg('agents', 'Agents'));
  return h('div', { class: 'mode-sw-wrap', 'aria-hidden': 'true' }, el);
}
function acPaintSwitch() {
  if (!acSw) return;
  acSw.classList.toggle('is-on', AC.on);
  acSw.setAttribute('aria-hidden', String(!AC.on));
  acSw.querySelectorAll('.mode-sw-b').forEach(b => b.setAttribute('aria-selected', String(b.dataset.k === AC.mode)));
  acSw.querySelector('.mode-sw').dataset.k = AC.mode;
}

/* into Agents: the rail becomes your chats, the page the one you were last in */
function acMode(k) {
  if (k === AC.mode && (k === 'work' || state.view === 'bots')) return;
  if (k === 'agents') {
    if (state.view !== 'bots') AC.prev = state.view;
    AC.mode = 'agents'; app.dataset.mode = 'agents';
    acPaintSwitch(); acPaintRail();
    acOpen(AC.open || AC_CHATS[0].id);
  } else {
    AC.mode = 'work'; delete app.dataset.mode;
    acPaintSwitch(); acPaintRail();
    const back = AC.prev && AC.prev !== 'bots' ? AC.prev : 'home';
    goPlain(back);
  }
}

/* ── the rail, as chats ── */
let acRailEl = null;
function acSectionOf(c) { return AC_SECTIONS.some(s => s.id === c.section) ? c.section : 'none'; }
function acPreview(c) {
  if (c.typing) return { text: `${acFirst(acName(c.typing))} is typing…`, typing: true };
  if (c.attention) return { text: 'Needs you: sign in to ' + (c.comp?.app === 'sharepoint' ? 'SharePoint' : 'Salesforce') };
  const m = [...c.msgs].reverse().find(x => ['ag', 'me', 'pp', 'q', 'comp', 'sys'].includes(x.t));
  if (!m) return { text: acAgent(c.agent)?.say || '' };
  const by = c.kind === 'group' && m.who ? acFirst(acName(m.who)) + ': ' : m.t === 'me' ? 'You: ' : '';
  const body = m.t === 'answers' ? 'You answered ' + m.rows.length + ' questions' : m.t === 'q' ? m.q : m.t === 'comp' ? 'Needs you at its computer' : m.files?.length && !m.text ? m.files[0].name : m.text;
  return { text: by + acPlain(body) };
}
function acRow(c) {
  const pv = acPreview(c);
  const more = h('button', { class: 'ac-row-more', type: 'button', 'aria-label': 'More', 'data-tip': 'More', html: AC_IC.dots,
    onclick: (e) => { e.stopPropagation(); acChatMenu(e.currentTarget, c); } });
  return h('div', { class: 'ac-row' + (c.unread ? ' is-unread' : '') + (AC.open === c.id ? ' is-on' : ''), role: 'button', tabindex: '0', 'data-id': c.id,
    onclick: () => acOpen(c.id), onkeydown: (e) => { if (e.key === 'Enter') acOpen(c.id); } },
    h('span', { class: 'ac-row-av' }, acChatAv(c), c.attention ? h('i', { class: 'ac-alert', 'aria-label': 'Needs you' }) : null),
    h('span', { class: 'ac-row-t' },
      h('span', { class: 'ac-row-top' }, h('span', { class: 'ac-row-n' }, acTitle(c)), h('span', { class: 'ac-row-w' }, c.when || ''), more),
      h('span', { class: 'ac-row-p' + (pv.typing ? ' is-typing' : '') }, h('span', { class: 'ac-row-pt' }, pv.text),
        c.unread ? h('span', { class: 'ac-unread' }, String(c.unread)) : null)));
}
function acPaintRail() {
  if (!acRailEl) return;
  /* nothing in the rail while Cowork shows: it is hidden, and hidden copies of the icons are not wanted */
  if (AC.mode !== 'agents') { acRailEl.querySelector('.ac-list').replaceChildren(); return; }
  const q = AC.find.trim().toLowerCase();
  const match = (c) => !q || (acTitle(c) + ' ' + acPreview(c).text + ' ' + (c.members || []).map(acName).join(' ')).toLowerCase().includes(q);
  const list = acRailEl.querySelector('.ac-list');
  const secs = AC_SECTIONS.map(s => {
    const chats = AC_CHATS.filter(c => acSectionOf(c) === s.id && match(c));
    if (!chats.length && (q || s.id === 'none')) return null;
    const flat = s.id === 'none' && AC_SECTIONS.length === 1;
    const folded = !flat && !q && AC.folds[s.id];
    const head = h('div', { class: 'ac-sec-h' },
      h('button', { class: 'ac-sec-t', type: 'button', 'aria-expanded': String(!folded), onclick: () => { AC.folds[s.id] = !folded; acPaintRail(); } },
        h('span', { class: 'ac-sec-n' }, s.name), acSvg('chev', 'ac-sec-chev')),
      s.id !== 'none' ? h('button', { class: 'ac-sec-more', type: 'button', 'aria-label': 'Section options', 'data-tip': 'Section Options', html: AC_IC.dots,
        onclick: (e) => { e.stopPropagation(); acSectionMenu(e.currentTarget, s); } }) : null);
    return h('section', { class: 'ac-sec' + (folded ? ' is-folded' : ''), 'data-sec': s.id }, flat ? null : head,
      folded ? null : h('div', { class: 'ac-sec-l' }, ...chats.map(acRow),
        chats.length ? null : h('p', { class: 'ac-sec-empty' }, 'Move a chat here from its ⋯ menu.')));
  }).filter(Boolean);
  list.replaceChildren(...secs, secs.length ? '' : h('p', { class: 'ac-none' }, `No chats match “${AC.find.trim()}”.`));
}
function acRail() {
  const qIn = h('input', { class: 'ac-find-in', type: 'search', placeholder: 'Search chats', 'aria-label': 'Search chats', value: AC.find,
    oninput: (e) => { AC.find = e.target.value; acPaintRail(); },
    onkeydown: (e) => { if (e.key === 'Escape') { e.target.value = ''; AC.find = ''; acPaintRail(); e.target.blur(); } } });
  const add = h('button', { class: 'icon-btn ac-add', type: 'button', 'aria-label': 'New', 'data-tip': 'New', html: AC_IC.plus,
    onclick: (e) => { e.stopPropagation(); acNewMenu(e.currentTarget); } });
  return h('div', { class: 'ac-rail', id: 'acRail' },
    h('div', { class: 'ac-tools' }, h('label', { class: 'ac-find' }, acSvg('search', 'ac-find-ic'), qIn), add),
    h('div', { class: 'ac-list' }));
}

/* + : a new agent, a group, a chat with one you already have, or a section */
function acNewMenu(btn) {
  const have = new Set(AC_CHATS.filter(c => c.kind === 'agent').map(c => c.agent));
  menu(btn, [
    { label: 'New agent', html: AC_IC.think, run: () => acCreateAgent() },
    { label: 'New group chat', html: AC_IC.group, run: () => acCreateGroup() },
    { label: 'Chat with an agent', html: AC_IC.agents, more: true, run: () => setTimeout(() => menu(btn, [...AC_MINE, ...LEGAL_AGENTS].filter(a => !have.has(a.id)).map(a => ({ label: a.name, html: acIcon(a.id), run: () => acStart(a.id) }))), 0) },
    { rule: true },
    { label: 'New section', html: AC_IC.plus, run: () => acNewSection() },
  ]);
}
function acNewSection() {
  const s = { id: 'sec-' + Date.now(), name: 'New section' };
  AC_SECTIONS.splice(AC_SECTIONS.length - 1, 0, s);
  acPaintRail();
  acRenameSection(s);
}
function acRenameSection(s) {
  const head = acRailEl.querySelector(`[data-sec="${s.id}"] .ac-sec-n`); if (!head) return;
  const inp = h('input', { class: 'ac-sec-in', value: s.name, 'aria-label': 'Section name' });
  const done = () => { s.name = inp.value.trim() || s.name; acPaintRail(); };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = s.name; inp.blur(); } });
  inp.addEventListener('blur', done);
  inp.addEventListener('click', (e) => e.stopPropagation());
  head.replaceWith(inp); inp.focus(); inp.select();
}
function acSectionMenu(btn, s) {
  menu(btn, [
    { label: 'Rename', html: AC_IC.pencil, run: () => acRenameSection(s) },
    { label: 'Delete section', danger: true, run: () => {
      const i = AC_SECTIONS.indexOf(s), moved = AC_CHATS.filter(c => c.section === s.id);
      AC_SECTIONS.splice(i, 1); moved.forEach(c => { c.section = 'none'; });
      acPaintRail();
      pbToast(moved.length ? `Deleted “${s.name}”. ${moved.length} chat${moved.length > 1 ? 's' : ''} moved to Unassigned.` : `Deleted “${s.name}”.`,
        { label: 'Undo', run: () => { AC_SECTIONS.splice(i, 0, s); moved.forEach(c => { c.section = s.id; }); acPaintRail(); } });
    } },
  ]);
}
function acChatMenu(btn, c) {
  menu(btn, [
    { label: 'Rename', html: AC_IC.pencil, run: () => acRename(c) },
    { label: 'Move to', html: AC_IC.folder, more: true, run: () => setTimeout(() => menu(btn, AC_SECTIONS.map(s => ({ label: s.name, tick: acSectionOf(c) === s.id, run: () => { c.section = s.id; acPaintRail(); } }))), 0) },
    { label: c.muted ? 'Unmute' : 'Mute', html: AC_IC.mute, run: () => { c.muted = !c.muted; pbToast(c.muted ? `Muted ${acTitle(c)}.` : `Unmuted ${acTitle(c)}.`); } },
    c.kind === 'group' ? { label: 'Add people or agents', html: AC_IC.plus, run: () => acAddMembers(c) } : null,
    { rule: true },
    { label: c.kind === 'group' ? 'Leave group' : 'Delete chat', danger: true, run: () => acDelete(c) },
  ]);
}
function acDelete(c) {
  const i = AC_CHATS.indexOf(c);
  AC_CHATS.splice(i, 1);
  if (AC.embed && AC.open === c.id) { AC.open = null; mxClose('agents'); go('agents'); }
  else if (AC.open === c.id) acOpen(AC_CHATS[0]?.id); else acPaintRail();
  pbToast(c.kind === 'group' ? `You left ${acTitle(c)}.` : `Deleted your chat with ${acTitle(c)}.`,
    { label: 'Undo', run: () => { AC_CHATS.splice(i, 0, c); acPaintRail(); } });
}
function acRename(c) {
  const before = acTitle(c);
  acAsk(c.kind === 'group' ? 'Rename group' : 'Rename agent', before, 'Rename', (name) => {
    if (!name || name === before) return;
    if (c.kind === 'group') c.name = name; else { const a = acAgent(c.agent); if (a) a.name = name; }
    c.msgs.push({ t: 'sys', ic: 'pencil', text: `Renamed to ${name}` });
    acPaintRail(); if (AC.open === c.id) { acBoxFor = null; acPaint(); }
  });
}
/* one field, in the house dialog: a rename, a label */
function acAsk(title, value, cta, done, placeholder = '') {
  const inp = h('input', { class: 'ac-mk-name', type: 'text', value: value || '', placeholder, 'aria-label': title, maxlength: '48' });
  const ok = h('button', { class: 'btn btn--primary', type: 'button' }, cta);
  const close = acDialog('ac-ask', title, h('div', { class: 'ac-dlg-b' }, inp), (close) => h('footer', { class: 'ac-dlg-f' },
    h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => close() }, 'Cancel'), ok));
  const fire = () => { close(); done(inp.value.trim()); };
  ok.onclick = fire;
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); fire(); } });
  setTimeout(() => { inp.focus(); inp.select(); }, 40);
}

/* ── opening a chat ── */
function acOpen(id) {
  const c = AC_CHATS.find(x => x.id === id) || AC_CHATS[0];
  if (!c) return;
  AC.open = c.id; AC.embed = false;
  if (c.unread) c.unread = 0;
  if (AC.mode !== 'agents') { AC.mode = 'agents'; app.dataset.mode = 'agents'; AC.on = true; acPaintSwitch(); }
  acPaintRail();
  if (state.view === 'bots' && view.querySelector('.ac')) acPaint();
  else goPlain('bots');
  const want = 'bots/' + c.id;
  if (location.hash.slice(1) !== want) history.replaceState(null, '', '#' + want);
}
/* a chat with one agent you have not talked to yet: it says hello, and offers three ways in */
function acNewChat(agentId) {
  const a = acAgent(agentId);
  const starts = (typeof AG_PLAY !== 'undefined' && AG_PLAY[agentId]?.starts) || null;
  return { id: 'c-' + agentId + '-' + Date.now(), kind: 'agent', agent: agentId, section: 'none', when: acNow(),
    msgs: [{ t: 'stamp', text: 'Today ' + acNow() },
      { t: 'ag', who: agentId, text: `Hi ${USER.greeting}, I’m ${a.name}. ${a.say}. ${starts ? 'Ask me anything, or start with one of these.' : 'Ask me anything.'}`, starts }] };
}
function acChatFor(agentId) {
  let c = AC_CHATS.find(x => x.kind === 'agent' && x.agent === agentId);
  if (!c) { c = acNewChat(agentId); AC_CHATS.unshift(c); }
  return c;
}
function acStart(agentId) { acOpen(acChatFor(agentId).id); }
/* an agent opened from the Agents page: the same conversation, in the workspace as it is */
function acEmbed(a) {
  const c = acChatFor(a.id);
  AC.open = c.id; AC.embed = true;
  if (c.unread) c.unread = 0;
  return acView();
}

/* ── the conversation ── */
let acPage = null;
function acChat() { return AC_CHATS.find(x => x.id === AC.open); }

function acWork(steps) {
  const ic = (src) => src === 'sharepoint' || src === 'outlook' || src === 'salesforce' ? h('img', { src: brandSrc(src), alt: '' }) : acSvg(src === 'playbook' ? 'book' : src === 'web' ? 'web' : 'think', 'ac-work-g');
  const det = h('details', { class: 'ac-work' },
    h('summary', {}, h('span', { class: 'ac-work-s' }, `Worked through ${steps.length} step${steps.length > 1 ? 's' : ''}`), acSvg('chev', 'ac-work-chev')),
    h('ol', {}, ...steps.map(([src, q, n]) => h('li', {}, h('span', { class: 'ac-work-ic' }, ic(src)), h('span', { class: 'ac-work-q' }, q), n ? h('span', { class: 'ac-work-n' }, n) : null))));
  return det;
}
/* what the agents' files say when they open: written on the same matters, people and dates as the chats */
const AC_FILE_DOCS = {
  'Northwind MSA – our response v5.docx': [
    { t: 'h1', v: 'Northwind MSA – our response v5' },
    { t: 'meta', v: 'Contract Redliner · Word · 3 changes from v4 · for Grace Coleman to approve' },
    { t: 'p', v: 'Lumen’s response to the redline Northwind Ltd sent on 14 October (their v4 of the Master Services Agreement). Their changes we accept are shown clean; our changes to their v4 are marked, with deletions <del>struck through</del> and insertions <ins>underlined</ins>. Once Grace approves, Signature Chaser sends it to Dana Whitfield at Northwind.' },
    { t: 'h2', v: 'Where we land' },
    { t: 'ul', v: [
      '<b>Liability cap:</b> 18 months’ fees, not the 24 they asked for. We agreed 18 on four of our last twelve MSAs over $1M and 24 on none.',
      '<b>Data breach:</b> a separate cap at 2× the annual fees, as on Harbor Retail in March.',
      '<b>Indirect loss:</b> struck. Neither party is liable for it, as the playbook requires (position 11.3).',
      '<b>Termination for convenience:</b> their 30 days is left open for Grace; the playbook prefers 90.',
      '<b>Governing law:</b> Delaware accepted. It is on the playbook’s approved list.' ] },
    { t: 'h2', v: '11. Limitation of liability' },
    { t: 'p', v: '11.1 Subject to clauses 11.2 to 11.4, each party’s total liability arising out of or in connection with this Agreement in any Contract Year is limited to <del>twenty-four (24)</del> <ins>eighteen (18)</ins> months’ Fees paid or payable in the twelve months before the event giving rise to the claim.' },
    { t: 'p', v: '11.2 <ins>Each party’s total liability for breach of clause 9 (Data Protection) is limited to two (2) times the Fees paid or payable in that Contract Year. This limit is separate from, and in addition to, the limit in clause 11.1.</ins>' },
    { t: 'p', v: '11.3 Neither party is liable for any indirect, special or consequential loss, or for loss of profit, revenue or goodwill<del>, except where such loss arises from a breach of clause 9 (Data Protection) or clause 10 (Confidentiality)</del>.' },
    { t: 'p', v: '11.4 Nothing in this Agreement limits liability for death or personal injury caused by negligence, for fraud, or for any liability that cannot be limited by law.' },
    { t: 'h2', v: '12. Indemnities' },
    { t: 'p', v: '12.1 Lumen will defend Northwind against any third-party claim that the Services infringe that party’s intellectual property rights, and will pay the damages and costs finally awarded <del>, together with any indirect or consequential loss suffered by Northwind</del>.' },
    { t: 'h2', v: '15. Termination' },
    { t: 'p', v: '15.2 Either party may terminate this Agreement for convenience on thirty (30) days’ written notice. <i>[Northwind’s change from 90 days. Open: for Grace to decide.]</i>' },
    { t: 'h2', v: '22. Governing law' },
    { t: 'p', v: '22.1 This Agreement is governed by the laws of the State of Delaware, and the courts of Delaware have exclusive jurisdiction.' },
    { t: 'h2', v: 'Comments for Northwind' },
    { t: 'ul', v: [
      '<b>11.1</b> — We can meet you at 18 months. It is above our standard of 12 and reflects the size of this agreement.',
      '<b>11.2</b> — A dedicated, higher cap for data protection breaches gives you more cover where it matters most.',
      '<b>11.3 and 12.1</b> — We cannot accept liability for indirect or consequential loss on any contract. This is a firm position.' ] },
    { t: 'quote', v: 'Precedent: Harbor Retail MSA, signed 18 March 2026 — clause 11.2, 18 months’ cap with data breach at 2×.' },
  ],

  'Vendor AI clause – draft.docx': [
    { t: 'h1', v: 'Vendor AI clause – draft' },
    { t: 'meta', v: 'Regulatory Watch · Word · for 6 vendor contracts · draft 1' },
    { t: 'p', v: 'Since 2 August 2025, providers of general-purpose AI models in the EU have had transparency and copyright duties under the EU AI Act. Six of our vendor contracts let the vendor use AI on our data and say nothing about it. This clause closes that gap; it is written to go in at renewal or by amendment.' },
    { t: 'h2', v: 'The six contracts' },
    { t: 'ul', v: [
      '<b>Brightline Hosting</b> — managed hosting; AI used for incident triage. Renews 21 Nov.',
      '<b>Trellis Health</b> — benefits platform; AI chat for employee questions. Renews 24 Nov.',
      '<b>Gulf Systems</b> — reseller of our platform in the Gulf; AI translation. Renews 29 Nov.',
      '<b>Acme Analytics</b> — product analytics; AI-written insights from usage data. Renews 31 Dec.',
      '<b>Payroll provider</b> — payroll; AI anomaly detection. Renews 1 Jan.',
      '<b>Cloud hosting – EU</b> — infrastructure; AI support assistant. Renews 13 Jan.' ] },
    { t: 'h2', v: '14A. Use of artificial intelligence' },
    { t: 'p', v: '14A.1 <b>Definitions.</b> “AI System” has the meaning in Article 3(1) of Regulation (EU) 2024/1689. “Customer Data” has the meaning in clause 1.' },
    { t: 'p', v: '14A.2 <b>Disclosure.</b> Within 30 days of the Effective Date, the Supplier will give the Customer a list of every AI System it uses to process Customer Data, with its provider, purpose and the location where it runs, and will keep that list current.' },
    { t: 'p', v: '14A.3 <b>No training.</b> The Supplier will not use Customer Data, or any output derived from it, to train, fine-tune or otherwise improve any AI model that is made available to anyone other than the Customer.' },
    { t: 'p', v: '14A.4 <b>Notice of change.</b> The Supplier will give the Customer at least 30 days’ written notice before it begins using a new AI System, or a new AI provider, to process Customer Data. The Customer may object on reasonable grounds within that period.' },
    { t: 'p', v: '14A.5 <b>Human review.</b> The Supplier will not make any decision that has a legal or similarly significant effect on an individual solely by automated means using Customer Data.' },
    { t: 'p', v: '14A.6 <b>Compliance.</b> The Supplier will comply with all laws that apply to its use of AI Systems, including Regulation (EU) 2024/1689, and will tell the Customer promptly of any serious incident involving an AI System that processes Customer Data.' },
    { t: 'h2', v: 'If they push back' },
    { t: 'ul', v: [
      '<b>14A.3</b> — must-have. Without it, our data can improve a model their other customers use.',
      '<b>14A.4</b> — fallback: notice after the change, within 10 days, with a right to terminate that service.',
      '<b>14A.2</b> — fallback: the list on request rather than proactively.' ] },
    { t: 'p', v: '<b>Next:</b> Aisha Rahman to review 14A.5 against the UK data rules change, then the clause goes into the renewal packs, Brightline first.' },
  ],

  'Brightwell – Order Form v3 (redlined).docx': [
    { t: 'h1', v: 'Brightwell – Order Form v3 (redlined)' },
    { t: 'meta', v: 'Contract Redliner · Word · 3 changes · Order Form Playbook · sent to Dev Anand' },
    { t: 'p', v: 'Order Form under the Master Subscription Agreement between Lumen Ltd (“Lumen”) and Brightwell Group plc (“Customer”), dated 4 March 2025. Brightwell’s v3 with Lumen’s changes marked. All three changes are inside the Order Form Playbook; none needs a lawyer.' },
    { t: 'h2', v: 'Order details' },
    { t: 'ul', v: [
      '<b>Subscription:</b> Lumen Platform, Enterprise edition, 400 named users',
      '<b>Add-ons:</b> Advanced Analytics; EU data residency',
      '<b>Subscription term:</b> 24 months from 1 November 2026',
      '<b>Annual fees:</b> £186,000 (users £164,000; add-ons £22,000), invoiced annually in advance',
      '<b>Customer contact:</b> Joanna Price, Head of Procurement' ] },
    { t: 'h2', v: '4. Payment' },
    { t: 'p', v: '4.1 Customer will pay each undisputed invoice within <del>forty-five (45)</del> <ins>thirty (30)</ins> days of the invoice date.' },
    { t: 'h2', v: '6. Renewal' },
    { t: 'p', v: '6.1 This Order Form renews automatically for successive twelve-month terms <ins>unless either party gives written notice of non-renewal at least sixty (60) days before the end of the then-current term</ins>.' },
    { t: 'h2', v: '7. Fees on renewal' },
    { t: 'p', v: '7.1 Lumen may increase the fees for any renewal term on notice <ins>, provided that any increase does not exceed five percent (5%) of the fees for the previous term</ins>.' },
    { t: 'h2', v: 'Why each change' },
    { t: 'ul', v: [
      '<b>4.1</b> — 30 days is our standard (position 2); 45 is only for public-sector customers.',
      '<b>6.1</b> — every auto-renewal needs an opt-out window (position 5); 60 days is the standard.',
      '<b>7.1</b> — renewal increases are capped at 5% (position 7), which keeps the renewal predictable for both sides.' ] },
  ],

  'Birch Labs – Mutual NDA.docx': [
    { t: 'h1', v: 'Mutual Non-Disclosure Agreement' },
    { t: 'meta', v: 'Birch Labs Inc. · their paper · received from Priya Shah · 6 pages' },
    { t: 'p', v: 'This Agreement is made on 12 October 2026 between <b>Birch Labs Inc.</b>, a Delaware corporation, and <b>Lumen Ltd</b>, a company registered in England and Wales (each a “Party”), so that each can share Confidential Information while they evaluate a possible commercial relationship (the “Purpose”).' },
    { t: 'h2', v: '1. Confidential Information' },
    { t: 'p', v: '1.1 “Confidential Information” means all information, in any form, disclosed by one Party (the “Discloser”) to the other (the “Recipient”) in connection with the Purpose, whether or not marked as confidential.' },
    { t: 'h2', v: '2. Obligations' },
    { t: 'p', v: '2.1 The Recipient will use Confidential Information only for the Purpose, keep it confidential, and disclose it only to its employees and advisers who need to know it for the Purpose and are bound by duties of confidence no less strict than these.' },
    { t: 'h2', v: '3. Exceptions' },
    { t: 'p', v: '3.1 The obligations in clause 2 do not apply to information that: (a) is or becomes public other than through the Recipient’s breach; (b) the Recipient receives from a third party without a duty of confidence; or (c) the Recipient develops independently without use of the Discloser’s information.' },
    { t: 'h2', v: '4. Compelled disclosure' },
    { t: 'p', v: '4.1 The Recipient may disclose Confidential Information where required by law or a regulator, after giving the Discloser prompt notice where lawful.' },
    { t: 'h2', v: '9. Term' },
    { t: 'p', v: '9.1 This Agreement continues for five (5) years from the date above. The obligations in clause 2 survive for five (5) years after it ends.' },
    { t: 'h2', v: '11. Governing law' },
    { t: 'p', v: '11.1 This Agreement is governed by the laws of England and Wales.' },
  ],

  'Birch Labs – Mutual NDA (redlined).docx': [
    { t: 'h1', v: 'Birch Labs – Mutual NDA (redlined)' },
    { t: 'meta', v: 'NDA Reviewer · Word · 2 changes · NDA Playbook v7 · for Roger Bennett' },
    { t: 'p', v: 'Birch Labs’ mutual NDA of 12 October, marked up to our positions. Everything else is acceptable as drafted: it is mutual, limited to the Purpose, and governed by English law.' },
    { t: 'h2', v: 'The two changes' },
    { t: 'ul', v: [
      '<b>Term</b> — five years down to three, with two years’ survival (playbook position 4).',
      '<b>Information we already had</b> — added the standard carve-out, which their paper leaves out (position 6).' ] },
    { t: 'h2', v: '3. Exceptions' },
    { t: 'p', v: '3.1 The obligations in clause 2 do not apply to information that: (a) is or becomes public other than through the Recipient’s breach; (b) the Recipient receives from a third party without a duty of confidence; <del>or</del> (c) the Recipient develops independently without use of the Discloser’s information<ins>; or (d) was lawfully known to the Recipient, without a duty of confidence, before the Discloser disclosed it</ins>.' },
    { t: 'h2', v: '9. Term' },
    { t: 'p', v: '9.1 This Agreement continues for <del>five (5)</del> <ins>three (3)</ins> years from the date above. The obligations in clause 2 survive for <del>five (5)</del> <ins>two (2)</ins> years after it ends.' },
    { t: 'h2', v: 'Note for Birch Labs' },
    { t: 'p', v: 'Three years is the term we use for every mutual NDA, and two years’ survival covers anything shared during it. The carve-out in 3.1(d) is standard and protects both of us, since the NDA is mutual.' },
    { t: 'quote', v: 'NDA Playbook v7 — position 4: term two years preferred, three at most. Position 6: the four standard exceptions are must-haves.' },
  ],

  'Board minutes – 10 Oct (draft).docx': [
    { t: 'h1', v: 'Minutes of a meeting of the Board of Directors' },
    { t: 'meta', v: 'Lumen Ltd · 10 October 2026, 10:00 by video call · draft for the chair' },
    { t: 'h2', v: 'Present and in attendance' },
    { t: 'ul', v: [
      '<b>Present:</b> Helen Marsh (Chair), James Okoro (CEO), Priya Nair (CFO), David Lindqvist, Sarah Chen (non-executive directors)',
      '<b>In attendance:</b> Grace Coleman (General Counsel, Secretary); Roger Bennett (Legal) for item 4',
      '<b>Apologies:</b> none' ] },
    { t: 'h2', v: '1. Quorum and declarations' },
    { t: 'p', v: 'The Chair noted that a quorum was present. No director declared an interest in the business of the meeting.' },
    { t: 'h2', v: '2. Minutes of the previous meeting' },
    { t: 'p', v: '<b>Resolved</b> that the minutes of the meeting held on 12 September 2026 be approved as a true record and signed by the Chair. <i>(Resolution 1)</i>' },
    { t: 'h2', v: '3. Q3 management accounts' },
    { t: 'p', v: 'The CFO presented the Q3 accounts. Revenue was 4% ahead of plan and cash was in line. <b>Resolved</b> that the Q3 management accounts be received. <i>(Resolution 2)</i>' },
    { t: 'h2', v: '4. Kestrel Freight licence' },
    { t: 'p', v: 'Roger Bennett presented the board brief. The board asked about the two termination rights and was told that neither allows Kestrel to leave in the first 24 months without paying the remaining fees for year two. <b>Resolved</b> that the licence to Kestrel Freight Ltd be approved on the terms in the brief, and that the CEO be authorised to sign it. <i>(Resolution 3)</i>' },
    { t: 'h2', v: '5. Signing authority matrix' },
    { t: 'p', v: '<b>Resolved</b> that the revised signing authority matrix be adopted with effect from 1 November 2026, so that contracts up to £250,000 may be signed by the General Counsel and contracts above it by the CEO or CFO. <i>(Resolution 4)</i>' },
    { t: 'h2', v: '6. Data protection officer' },
    { t: 'p', v: '<b>Resolved</b> that Aisha Rahman be appointed as deputy data protection officer. <i>(Resolution 5)</i>' },
    { t: 'h2', v: '7. Next meeting' },
    { t: 'p', v: '<b>Resolved</b> that the next meeting be held on 14 November 2026 at 10:00. <i>(Resolution 6)</i>' },
    { t: 'h2', v: 'Actions' },
    { t: 'ul', v: ['Grace Coleman — circulate the signing authority matrix to all managers by 23 October.', 'James Okoro — sign the Kestrel licence once Kestrel has signed.', 'Priya Nair — update the treasury mandate for the new limits.'] },
    { t: 'p', v: 'There being no further business, the meeting closed at 11:20.<br><br>Chair ____________________ &nbsp;&nbsp; Date ____________' },
  ],

  'Kestrel licence – board brief.docx': [
    { t: 'h1', v: 'Kestrel licence – board brief' },
    { t: 'meta', v: 'Contract Summary · Word · 1 page · board meeting 10 October 2026' },
    { t: 'h2', v: 'The decision' },
    { t: 'p', v: 'Approve a three-year licence of the Lumen routing platform to <b>Kestrel Freight Ltd</b>, worth <b>£1.38M</b> over the term, and authorise the CEO to sign.' },
    { t: 'h2', v: 'Term' },
    { t: 'p', v: 'Three years from 1 November 2026, with no automatic renewal. A renewal needs a new order form.' },
    { t: 'h2', v: 'Fees' },
    { t: 'p', v: '£460,000 a year, fixed for the term and invoiced annually in advance. Implementation of £40,000 is waived.' },
    { t: 'h2', v: 'Exclusivity' },
    { t: 'p', v: 'None. Kestrel asked for UK exclusivity in freight routing; we declined, and they accepted a most-favoured-pricing commitment for UK freight customers of similar size instead.' },
    { t: 'h2', v: 'The two termination rights the board asked about' },
    { t: 'ul', v: [
      '<b>Change of control (clause 18.3):</b> if either party is acquired by a competitor of the other, the other may terminate on 90 days’ notice. No fees are refunded.',
      '<b>Convenience after 24 months (clause 18.4):</b> Kestrel may terminate on 6 months’ notice given no earlier than month 18, so the earliest exit is month 24. It pays 50% of the remaining fees.' ] },
    { t: 'h2', v: 'Risks' },
    { t: 'ul', v: [
      'Liability is capped at 12 months’ fees, with data breach at 2× — inside the playbook.',
      'A separate dispute with Kestrel over the 2024 supply agreement (litigation hold LH-2026-07) is unrelated and is not settled by this licence.' ] },
    { t: 'p', v: '<b>Recommendation:</b> approve.' },
  ],

  'Acme Analytics – Transfer impact assessment.docx': [
    { t: 'h1', v: 'Transfer impact assessment — Acme Analytics (India)' },
    { t: 'meta', v: 'Privacy Reviewer · Word · draft 1 · 2 questions for Acme · owner Aisha Rahman' },
    { t: 'p', v: 'Acme Analytics Ltd processes Lumen’s product usage data under a Data Processing Agreement signed on 2 May 2025. Its support team in Bengaluru, India can access that data remotely. This assessment looks at whether that transfer gives the data essentially equivalent protection to the EU and UK, as required before relying on the standard contractual clauses.' },
    { t: 'h2', v: '1. The transfer' },
    { t: 'ul', v: [
      '<b>Exporter:</b> Lumen Ltd (controller), via Acme Analytics Ltd, Dublin (processor)',
      '<b>Importer:</b> Acme Analytics India Pvt Ltd, Bengaluru — listed as a sub-processor location in Annex II of the DPA',
      '<b>Data:</b> account identifiers, user email addresses, product event logs; no special category data',
      '<b>People:</b> Lumen customers’ users, about 38,000',
      '<b>How:</b> remote, read-only access by support staff to resolve tickets; data stays hosted in Dublin',
      '<b>How often:</b> on demand, about 120 tickets a month' ] },
    { t: 'h2', v: '2. The transfer tool' },
    { t: 'p', v: 'EU standard contractual clauses (Commission Decision 2021/914), <b>Module 2</b>, in Schedule 3 of the DPA, with the UK International Data Transfer Addendum for UK users. Docking clause and Annex III (sub-processors) are complete.' },
    { t: 'h2', v: '3. The law in India' },
    { t: 'ul', v: [
      '<b>Digital Personal Data Protection Act 2023:</b> gives individuals rights and allows government exemptions for security and public order, without independent oversight.',
      '<b>IT Act 2000, section 69:</b> lets the government require access to or decryption of data, on an order from a senior official rather than a court.',
      '<b>CERT-In Directions (April 2022):</b> service providers must keep system logs for 180 days <b>within India</b> and give them to CERT-In on request.' ] },
    { t: 'h2', v: '4. Supplementary measures' },
    { t: 'ul', v: [
      'Access is read-only, through a virtual desktop hosted in Dublin; nothing is stored in India (DPA, Annex II).',
      'Data is encrypted at rest and in transit; keys are held in the EU and never released to the importer.',
      'Support staff see pseudonymised identifiers by default; full email addresses only when a ticket needs them.',
      'Acme commits to challenge any government request and to notify us unless the law forbids it (SCCs clause 15).' ] },
    { t: 'h2', v: '5. Assessment' },
    { t: 'p', v: 'Because the data stays in Dublin and support staff only view it, section 69 orders would reach little that is usable. The open risk is the CERT-In rule: if the virtual desktop’s access logs are kept in India, those logs — which include user identifiers — would be held there for 180 days and available to CERT-In. <b>Provisional conclusion:</b> the transfer can continue with the measures above, subject to the two answers below.' },
    { t: 'h2', v: 'Questions for Acme' },
    { t: 'ul', v: [
      '<b>1. How long do support staff keep access?</b> Is access granted per ticket and removed when it closes, or held standing? We need the maximum period and how it is enforced.',
      '<b>2. Do any logs leave the EU?</b> In particular, are the virtual desktop’s access logs stored in India to meet the CERT-In Directions, and do they contain user identifiers?' ] },
    { t: 'h2', v: '6. Review' },
    { t: 'p', v: 'Re-assess when Acme answers, if Acme adds a new location to Annex II, or on 9 October 2027, whichever is first.' },
  ],
};

const AC_FILE_SHEETS = {
  'Renewals – next 90 days.xlsx': [
    { name: 'Renewals', cols: ['Contract', 'Type', 'Renews', 'Notice', 'Notice by', 'Account owner', 'Annual value', 'What to do'],
      widths: [176, 120, 84, 74, 90, 120, 104, 220], rows: [
      ['Brightline Hosting', 'Vendor', '21 Nov', '30 days', '22 Oct', 'Tom Becker', '£84,000', 'Give notice — Tom asked to stop it'],
      ['Trellis Health', 'Vendor', '24 Nov', '30 days', '25 Oct', 'Rachel Okafor', '£41,500', 'Give notice — moving to new provider'],
      ['Harbor Retail', 'Customer', '27 Dec', '60 days', '28 Oct', 'Dev Anand', '£312,000', 'Notice to renegotiate the cap'],
      ['Gulf Systems', 'Reseller', '29 Nov', '30 days', '30 Oct', 'Meera Nair', '£128,000', 'Give notice — new reseller terms'],
      ['Northwind Ltd', 'Customer', '30 Dec', '60 days', '31 Oct', 'Dev Anand', '£540,000', 'Notice — MSA v5 replaces it'],
      ['Pinewood', 'Customer', '3 Dec', '30 days', '3 Nov', 'Tom Becker', '£110,000', 'Renew as is'],
      ['Brightwell', 'Customer', '6 Jan', '60 days', '7 Nov', 'Dev Anand', '£186,000', 'Renew — order form v3 agreed'],
      ['Vantage Labs', 'Customer', '12 Jan', '60 days', '13 Nov', 'Meera Nair', '£405,000', 'Renew — residency answer sent'],
      ['Cloud hosting – EU', 'Vendor', '13 Jan', '60 days', '14 Nov', 'Meera Nair', '£96,000', 'Renew with AI clause 14A'],
      ['Birch Labs services', 'Vendor', '18 Dec', '30 days', '18 Nov', 'Rachel Okafor', '£22,000', 'Renew'],
      ['Records storage', 'Vendor', '20 Dec', '30 days', '20 Nov', 'Tom Becker', '£9,600', 'Renew'],
      ['Payroll provider', 'Vendor', '1 Jan', '60 days', '2 Nov', 'Rachel Okafor', '£54,000', 'Renew with AI clause 14A'],
      ['Kestrel Freight', 'Vendor', '10 Jan', '30 days', '11 Dec', 'Dev Anand', '£63,000', 'Hold — dispute LH-2026-07 open'],
      ['Acme Analytics', 'Vendor', '31 Dec', '90 days', '2 Oct', 'Rachel Okafor', '£48,000', 'Notice window closed — renews; TIA open'] ] },
    { name: 'Notice this month', cols: ['Contract', 'Notice by', 'Days left', 'Owner', 'Letter'],
      widths: [176, 90, 80, 120, 200], rows: [
      ['Brightline Hosting', '22 Oct', '7', 'Tom Becker', 'Drafted — non-renewal'],
      ['Trellis Health', '25 Oct', '10', 'Rachel Okafor', 'Drafted — non-renewal'],
      ['Harbor Retail', '28 Oct', '13', 'Dev Anand', 'Drafted — renegotiation'],
      ['Gulf Systems', '30 Oct', '15', 'Meera Nair', 'Drafted — non-renewal'],
      ['Northwind Ltd', '31 Oct', '16', 'Dev Anand', 'Not needed if v5 signs first'] ] },
  ],
};
/* a file an agent made opens beside the chat, the way any artifact does: Word as a document,
   Excel as a sheet, written from what the agent said when it shared it */
function acFileArtifact(f, m) {
  const id = 'acf-' + f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  if (ARTIFACTS[id]) return ARTIFACTS[id];
  const sheet = /\.xlsx$/i.test(f.name);
  const title = f.name.replace(/\.[a-z]+$/i, '');
  const bold = (t) => t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const lines = String(m?.text || '').split('\n').map(x => x.trim()).filter(Boolean);
  const who = m?.who && !acIsP(m.who) ? acName(m.who) : (m?.who ? acName(m.who) : 'Agent');
  let body;
  if (AC_FILE_SHEETS[f.name]) body = { sheets: AC_FILE_SHEETS[f.name] };
  else if (AC_FILE_DOCS[f.name]) body = { blocks: AC_FILE_DOCS[f.name] };
  else if (sheet) {
    const rows = lines.filter(l => /^- /.test(l)).map(l => {
      const t = l.slice(2).replace(/\*\*/g, '');
      const i = t.indexOf(':');
      return i > 0 ? [t.slice(0, i).trim(), ...t.slice(i + 1).split('·').map(x => x.trim())] : [t];
    });
    const n = Math.max(2, ...rows.map(r => r.length));
    const cols = ['Item', 'Detail', 'Owner', 'Note'].slice(0, n);
    body = { sheets: [{ name: 'Sheet 1', cols, widths: cols.map((_, i) => i === 0 ? 200 : 220),
      rows: (rows.length ? rows : [[title, f.meta]]).map(r => cols.map((_, i) => r[i] || '')) }] };
  } else {
    const blocks = [{ t: 'h1', v: title }, { t: 'meta', v: `${who} · ${f.meta}` }];
    let ul = null;
    for (const l of lines) {
      if (/^- /.test(l)) { if (!ul) { ul = { t: 'ul', v: [] }; blocks.push(ul); } ul.v.push(bold(l.slice(2))); }
      else { ul = null; blocks.push({ t: 'p', v: bold(l) }); }
    }
    body = { blocks };
  }
  const a = Object.assign({ id, name: title, kind: sheet ? 'sheet' : 'doc', ext: sheet ? 'xlsx' : 'docx', sub: f.meta, vi: 0 }, body);
  a.versions = [Object.assign({ when: 'Just now', by: who }, body)];
  ARTIFACTS[id] = a;
  return a;
}
function acFiles(files, m) {
  return h('div', { class: 'ac-files' }, ...files.map(f => h('button', { class: 'ac-file', type: 'button', onclick: () => { if (AC.panel) { AC.panel = false; acPaint(); } openArtifact(acFileArtifact(f, m)); } },
    h('img', { class: 'ac-file-ic', src: brandSrc(/xlsx$/.test(f.name) ? 'excel' : 'word'), alt: '' }),
    h('span', { class: 'ac-file-t' }, h('span', { class: 'ac-file-n' }, f.name), h('span', { class: 'ac-file-m' }, f.meta)))));
}

/* the agent's computer: a browser window on its own desktop */
const AC_SITES = {
  salesforce: { name: 'Salesforce', url: 'login.salesforce.com', title: 'Login | Salesforce', after: { url: 'lumen.lightning.force.com/lightning/o/Account/list', title: 'Accounts | Salesforce' } },
  sharepoint: { name: 'SharePoint', url: 'login.microsoftonline.com', title: 'Sign in to your account', after: { url: 'lumen.sharepoint.com/sites/Legal', title: 'Legal – Documents' } },
};
function acScreen(c, comp, size = 'sm') {
  const site = AC_SITES[comp?.app] || null;
  const asleep = !site;
  const signed = comp?.state === 'done';
  const body = asleep ? h('div', { class: 'acs-sleep' }, h('span', { class: 'acs-sleep-av', html: acIcon(c.agent || c.members?.find(x => !acIsP(x))) }), h('b', {}, 'Computer is asleep'), h('span', {}, 'It wakes when the agent needs a browser'))
    : signed ? acSiteAfter(comp.app)
    : comp.app === 'salesforce'
      ? h('div', { class: 'acs-login' }, h('img', { class: 'acs-login-logo', src: brandSrc('salesforce'), alt: '' }),
          h('span', { class: 'acs-field' }, 'Username'), h('span', { class: 'acs-field' }, 'Password'), h('span', { class: 'acs-btn acs-btn--sf' }, 'Log In'), h('span', { class: 'acs-link' }, 'Forgot your password?'))
      : h('div', { class: 'acs-login acs-login--ms' }, h('img', { class: 'acs-login-logo is-ms', src: brandSrc('microsoft'), alt: '' }), h('b', {}, 'Sign in'),
          h('span', { class: 'acs-field' }, 'Email, phone or Skype'), h('span', { class: 'acs-btn acs-btn--ms' }, 'Next'));
  const where = site ? (signed ? site.after : site) : null;
  return h('div', { class: 'acs acs--' + size + (asleep ? ' is-asleep' : '') },
    h('span', { class: 'acs-wall', 'aria-hidden': 'true' }),
    asleep ? body : h('div', { class: 'acs-win' },
      h('div', { class: 'acs-bar' }, h('i'), h('i'), h('i'), h('span', { class: 'acs-tab' }, h('img', { src: brandSrc(comp.app), alt: '' }), where.title)),
      h('div', { class: 'acs-url' }, acSvg('lock', 'acs-lock'), where.url),
      h('div', { class: 'acs-body' }, body)),
    h('div', { class: 'acs-dock' }, ...[['chrome', h('img', { src: brandSrc('chrome'), alt: '' })],
      ['terminal', h('span', { html: '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="2" y="3.5" width="20" height="17" rx="4" fill="#1F2430"/><path d="M6.5 9.5l3 2.5-3 2.5M11.5 15h5" fill="none" stroke="#E5E7EB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' })],
      ['files', h('span', { html: '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M2.5 7a2.5 2.5 0 0 1 2.5-2.5h4.2l2 2.2H19A2.5 2.5 0 0 1 21.5 9.2V18a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 18z" fill="#5B9BE6"/><path d="M2.5 10h19v8a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 18z" fill="#7DB3F0"/></svg>' })]]
      .map(([k, el]) => h('span', { class: 'acs-dock-i' + (!asleep && k === 'chrome' ? ' is-on' : '') }, el))));
}
function acSiteAfter(app) {
  if (app === 'salesforce') return h('div', { class: 'acs-table' },
    h('span', { class: 'acs-table-h' }, 'My Accounts'),
    ...[['Northwind Ltd', 'Dev Anand'], ['Brightline Hosting', 'Tom Becker'], ['Trellis Health', 'Rachel Okafor'], ['Harbor Retail', 'Dev Anand'], ['Gulf Systems', 'Meera Nair']]
      .map(([a, o]) => h('span', { class: 'acs-table-r' }, h('b', {}, a), h('span', {}, o))));
  return h('div', { class: 'acs-table' }, h('span', { class: 'acs-table-h' }, 'Documents'),
    ...['Contracts', 'NDAs', 'Playbooks', 'Templates', 'Board'].map(n => h('span', { class: 'acs-table-r' }, h('b', {}, n), h('span', {}, 'Folder'))));
}
function acCompCard(c, m) {
  const site = AC_SITES[m.app];
  const done = m.state === 'done';
  const shot = h('div', { class: 'ac-comp-shot', role: 'button', tabindex: '0', 'data-tip': done ? 'Open Computer' : 'Take Over',
    onclick: () => done ? acPanelTab('computer') : acTakeOver(c, m) }, acScreen(c, m, 'sm'));
  return h('div', { class: 'ac-comp' + (done ? ' is-done' : '') },
    h('div', { class: 'ac-comp-h' }, acSvg('monitor', 'ac-comp-ic'), h('b', {}, 'Computer'),
      h('span', { class: 'ac-comp-st' }, done ? h('span', { class: 'ac-comp-ok', html: AC_IC.check }) : h('i', { class: 'ac-comp-dot' }), done ? `Signed in to ${site.name}` : 'Action needed')),
    h('p', { class: 'ac-comp-t' }, m.text),
    shot,
    done ? null : h('div', { class: 'ac-comp-acts' },
      h('button', { class: 'btn', type: 'button', onclick: () => acTakeOver(c, m) }, 'Take over'),
      h('button', { class: 'btn btn--primary', type: 'button', onclick: () => acCompDone(c, m) }, 'I’m done')));
}
/* you take the controls: the screen, big, and the agent waits */
function acTakeOver(c, m) {
  if (document.querySelector('.acs-over')) return;
  const site = AC_SITES[m.app];
  const close = () => { over.remove(); document.removeEventListener('keydown', esc, true); };
  const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const over = h('div', { class: 'acs-over', onclick: (e) => { if (e.target === over) close(); } },
    h('div', { class: 'acs-over-bar' },
      h('span', { class: 'acs-over-who' }, acAv(m.who, 'ac-av--xs'), h('span', {}, h('b', {}, 'You have control. '), `${acName(m.who)} waits until you are done.`)),
      h('span', { class: 'acs-over-acts' },
        h('button', { class: 'btn', type: 'button', onclick: close }, 'Give it back'),
        h('button', { class: 'btn btn--primary', type: 'button', onclick: () => { close(); acCompDone(c, m); } }, 'I’m done'))),
    acScreen(c, m, 'lg'),
    h('p', { class: 'acs-over-note' }, `Sign in to ${site.name} on this screen. Your password stays with ${site.name}; the agent only keeps the session.`));
  document.body.append(over);
  document.addEventListener('keydown', esc, true);
}
/* just watching: its screen, big, and a way back */
function acWatch(c, m) {
  if (document.querySelector('.acs-over')) return;
  const who = c.agent || c.members?.find(x => !acIsP(x));
  const site = AC_SITES[m?.app];
  const close = () => { over.remove(); document.removeEventListener('keydown', esc, true); };
  const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const over = h('div', { class: 'acs-over', onclick: (e) => { if (e.target === over) close(); } },
    h('div', { class: 'acs-over-bar' },
      h('span', { class: 'acs-over-who' }, acAv(who, 'ac-av--xs'), h('span', {}, h('b', {}, `${acName(who)}’s computer. `), site ? `Signed in to ${site.name}.` : 'Asleep until it needs a browser.')),
      null),
    h('button', { class: 'agc-over-x acs-over-x', type: 'button', 'aria-label': 'Close', 'data-tip': 'Close', html: AC_IC.x, onclick: close }),
    acScreen(c, m, 'lg'));
  document.body.append(over);
  document.addEventListener('keydown', esc, true);
}
async function acCompDone(c, m) {
  m.state = 'done';
  if (c.comp) c.comp.state = 'done';
  c.attention = false;
  acPaint(); acPaintRail();
  const after = AC_AFTER[c.id] || AC_AFTER[m.app];
  if (after) await acSay(c, m.who, after.text, { work: after.work, files: after.files });
  after?.next?.(c);
}
const AC_AFTER = {
  obligation: { work: [['salesforce', 'Account owners for 14 accounts'], ['think', 'Worked out who must give notice, and by when']],
    text: 'Thanks, I’m in. All 14 matched. **Five need notice this month:**\n\n- **Brightline Hosting**: notice by 22 Oct · Tom Becker\n- **Trellis Health**: notice by 25 Oct · Rachel Okafor\n- **Harbor Retail**: notice by 28 Oct · Dev Anand\n- **Gulf Systems**: notice by 30 Oct · Meera Nair\n- **Northwind Ltd**: notice by 31 Oct · Dev Anand\n\nI have put each date in its owner’s calendar.',
    files: [W('Renewals – next 90 days.xlsx', 'Excel · 14 contracts')] },
  sharepoint: { work: [['sharepoint', 'Legal library', '1,240 files']], text: 'Thanks, I can read the Legal library now: **1,240 files** across Contracts, NDAs and Playbooks.' },
  salesforce: { work: [['salesforce', 'Your accounts']], text: 'Thanks, I’m in. I can see the accounts you own now.' },
};

/* the newest conversation sits at the top, as a messages app keeps it */
function acToTop(c) { const i = AC_CHATS.indexOf(c); if (i > 0) { AC_CHATS.splice(i, 1); AC_CHATS.unshift(c); } }
/* an agent says something: typing first, at a human pace */
async function acSay(c, who, text, extra = {}) {
  c.typing = who; acPaint(); acPaintRail();
  await acWait(700 + Math.min(1800, text.length * 9));
  c.typing = null;
  const m = { t: 'ag', who, text, ...extra };
  c.msgs.push(m);
  c.when = acNow(); acToTop(c);
  if (AC.open !== c.id) c.unread = (c.unread || 0) + 1;
  acPaint(); acPaintRail();
  return m;
}

/* who answers in a group: whoever you @mentioned, or the one whose job it is */
function acPickAgent(c, text, mention) {
  const agents = c.members.filter(m => !acIsP(m));
  if (mention) { const hit = agents.find(m => acName(m).toLowerCase() === mention.toLowerCase()); if (hit) return hit; }
  const at = agents.find(m => text.toLowerCase().includes('@' + acName(m).toLowerCase()));
  if (at) return at;
  const words = text.toLowerCase();
  let best = agents[0], score = 0;
  for (const m of agents) {
    const a = acAgent(m);
    const s = (a.name + ' ' + a.say).toLowerCase().split(/\W+/).filter(w => w.length > 3 && words.includes(w)).length;
    if (s > score) { best = m; score = s; }
  }
  return best;
}
function acReplyFor(id, text) {
  const play = typeof AG_PLAY !== 'undefined' && AG_PLAY[id];
  const a = acAgent(id);
  if (play && !play.used) { play.used = true; return { text: play.answer, work: (play.steps || []).map(s => [s.source === 'internal' ? 'think' : s.source, s.query, s.count || (s.rows ? s.rows.length + ' found' : '')]) }; }
  return { text: `On it. I’ll work on “${text.length > 80 ? text.slice(0, 78) + '…' : text}” and reply here when it’s ready.`, work: [['think', `${a.name} read your message`]] };
}
async function acSend(text, pills) {
  const c = acChat(); if (!c) return;
  const mention = pills?.find(p => p.kind === 'who')?.label;
  const lead = pills?.length ? pills.map(p => p.label).join(' · ') + ' — ' : '';
  const body = (lead && (text || '').startsWith(lead) ? text.slice(lead.length) : (text || '')).trim();
  const shown = mention ? `@${mention} ${body}` : body;
  if (!shown.trim()) return;
  if (c.ask) { c.ask.other[c.ask.i] = shown; c.ask.pick[c.ask.i] = -1; acAskNext(c); return; }
  c.msgs.push({ t: 'me', text: shown }); acToTop(c);
  if (c.msgs.filter(m => m.t === 'stamp').length === 0) c.msgs.unshift({ t: 'stamp', text: 'Today ' + acNow() });
  c.when = acNow();
  acPaint(); acPaintRail();
  if (c.onboard && c.onboard.q < AC_ONB.length) return;
  const who = c.kind === 'group' ? acPickAgent(c, shown, mention) : c.agent;
  await acWait(350);
  const r = acReplyFor(who, body);
  await acSay(c, who, r.text, { work: r.work });
}

/* ── a question, asked in the thread, answered in place ── */
function acQCard(c, m, live) {
  const sel = h('button', { class: 'ac-sel' + (m.pick != null ? ' is-set' : ''), type: 'button', 'aria-haspopup': 'menu',
    onclick: (e) => { e.stopPropagation(); menu(e.currentTarget, m.options.map((o, i) => ({ label: o, tick: m.pick === i, run: () => acAnswer(c, m, i) }))); } },
    h('span', { class: 'ac-sel-v' }, m.pick != null ? m.options[m.pick] : 'Choose an answer'),
    m.pick != null ? acSvg('check', 'ac-sel-ok') : acSvg('chev', 'ac-sel-chev'));
  return h('div', { class: 'ac-q' + (live ? ' is-live' : '') }, h('p', { class: 'ac-q-t' }, m.q), sel);
}
function acAnswer(c, m, i) {
  const first = m.pick == null;
  m.pick = i;
  acPaint();
  if (first && c.onboard) acOnboardNext(c, m, i);
}

/* ── a new agent's first conversation: three questions, a name if it had none, its computer ── */
const AC_ONB = [
  { q: 'What should I mainly help with?', options: ['Reviewing contracts', 'Answering legal questions', 'Tracking renewals and deadlines', 'A bit of everything'],
    ack: ['Contracts it is. I’ll check each one against your playbooks.', 'Good. I’ll answer with the clause or the source every time.', 'Got it. I’ll watch dates and tell you before anything closes.', 'A bit of everything, then. I’ll tell you when something needs a lawyer.'],
    names: ['Contract Reviewer', 'Legal Q&A', 'Renewals Desk', 'Legal Assistant'] },
  { q: 'How should I work?', options: ['Draft it, and I review before anything goes out', 'Handle the routine ones, bring me the rest', 'Ask me before every step'],
    ack: ['Nothing leaves without your yes.', 'I’ll handle what the playbook covers and bring you the rest.', 'I’ll check in before each step.'] },
  { q: 'Where do most of your documents live?', options: ['SharePoint', 'OneDrive', 'Outlook attachments', 'A mix of these'],
    ack: ['SharePoint it is. I need you to sign in once.', 'OneDrive it is. I need you to sign in once.', 'I’ll read attachments as they arrive. I need you to sign in once.', 'I’ll look in all three. I need you to sign in to SharePoint once.'] },
];
async function acOnboardDone(c, ans) {
  const a = acAgent(c.agent);
  const idx = ans.map(x => typeof x === 'number' ? x : null);
  c.onboard.q = AC_ONB.length;
  const said = [0, 1, 2].map(k => idx[k] != null ? AC_ONB[k].ack[idx[k]] : null).filter(Boolean);
  await acSay(c, c.agent, said.join(' ') || 'I’ll start with the defaults, and you can change them any time.');
  if (a.unnamed) {
    const n = idx[0] != null ? idx[0] : 3;
    a.name = AC_ONB[0].names[n]; a.unnamed = false; a.say = AC_ONB[0].options[n];
    c.msgs.push({ t: 'sys', ic: 'pencil', text: `Renamed to ${a.name}` });
    acPaint(); acPaintRail();
    await acWait(500);
  }
  c.typing = c.agent; acPaint(); await acWait(900); c.typing = null;
  const comp = { t: 'comp', who: c.agent, app: 'sharepoint', text: 'Sign in to SharePoint so I can read the Legal library.', state: 'needed' };
  c.msgs.push(comp); c.comp = { app: 'sharepoint', state: 'needed' }; c.attention = true;
  acPaint(); acPaintRail();
}
async function acOnboardNext(c, m, i) {
  const step = AC_ONB[c.onboard.q];
  const a = acAgent(c.agent);
  c.onboard.answers.push(i);
  await acSay(c, c.agent, step.ack[i]);
  if (c.onboard.q === 0 && a.unnamed) {
    a.name = step.names[i]; a.unnamed = false; a.say = step.options[i];
    c.msgs.push({ t: 'sys', ic: 'pencil', text: `Renamed to ${a.name}` });
    acPaint(); acPaintRail();
    await acWait(500);
  }
  c.onboard.q += 1;
  if (c.onboard.q < AC_ONB.length) {
    c.typing = c.agent; acPaint(); acPaintRail(); await acWait(800); c.typing = null;
    c.msgs.push({ t: 'q', who: c.agent, q: AC_ONB[c.onboard.q].q, options: AC_ONB[c.onboard.q].options, pick: null });
    acPaint(); acPaintRail();
    return;
  }
  /* the last answer: its computer needs one sign-in */
  c.typing = c.agent; acPaint(); await acWait(900); c.typing = null;
  const comp = { t: 'comp', who: c.agent, app: 'sharepoint', text: 'Sign in to SharePoint so I can read the Legal library.', state: 'needed' };
  c.msgs.push(comp); c.comp = { app: 'sharepoint', state: 'needed' }; c.attention = true;
  acPaint(); acPaintRail();
}
AC_AFTER.sharepoint.next = async (c) => {
  if (!c.onboard) return;
  c.onboard = null;
  await acSay(c, c.agent, 'All set. Send me a contract, or ask me anything.', { starts: ['Review a contract against our playbook', 'What renews in the next 60 days?', 'Summarise an agreement in a page'] });
};

/* one message, in its run: an avatar and a name only where a new speaker starts */
function acMsg(c, m, prev, live) {
  if (m.t === 'stamp') return h('div', { class: 'ac-stamp' }, m.text);
  if (m.t === 'sys') return h('div', { class: 'ac-sys' }, acSvg(m.ic || 'pencil', 'ac-sys-ic'), m.text);
  /* your answers to its questions, as one reply: each question small, your answer under it */
  if (m.t === 'answers' || (m.t === 'q' && m.pick != null)) {
    const rows = m.t === 'answers' ? m.rows : [[m.q, m.options[m.pick]]];
    return h('div', { class: 'ac-m ac-m--me' }, h('div', { class: 'agb-answers ac-answers' },
      ...rows.map(([q, a]) => h('div', { class: 'agb-answers-r' }, h('span', { class: 'agb-answer-q' }, q), h('span', { class: 'agb-answer-a' }, a)))));
  }
  if (m.t === 'q') return null;
  if (m.t === 'me') return h('div', { class: 'ac-m ac-m--me' }, m.files ? acFiles(m.files, m) : null, m.text ? h('div', { class: 'ac-bub' }, acProse(m.text)) : null);
  const who = m.who;
  const lead = !prev || prev.who !== who || !['ag', 'pp', 'q', 'comp'].includes(prev.t);
  const showName = lead && (c.kind === 'group');
  const body = m.t === 'q' ? acQCard(c, m, live) : m.t === 'comp' ? acCompCard(c, m)
    : h('div', { class: 'ac-say' }, m.work ? acWork(m.work) : null, m.text ? acProse(m.text) : null, m.files ? acFiles(m.files, m) : null);
  return h('div', { class: 'ac-m ac-m--them' + (lead ? ' is-lead' : '') },
    h('span', { class: 'ac-m-av' }, lead ? acAv(who) : null),
    h('div', { class: 'ac-m-b' }, showName ? h('span', { class: 'ac-m-n' }, acName(who)) : null, body));
}
function acTyping(c) {
  return h('div', { class: 'ac-m ac-m--them is-lead ac-typing-row' },
    h('span', { class: 'ac-m-av' }, acAv(c.typing)),
    h('div', { class: 'ac-m-b' }, c.kind === 'group' ? h('span', { class: 'ac-m-n' }, acName(c.typing)) : null,
      h('span', { class: 'ac-typing', 'aria-label': acName(c.typing) + ' is typing' }, h('i'), h('i'), h('i'))));
}
function acView() {
  if (!AC.embed && AC.mode !== 'agents') { AC.mode = 'agents'; app.dataset.mode = 'agents'; AC.on = true; acPaintSwitch(); acPaintRail(); }
  acPage = h('div', { class: 'ac' },
    h('div', { class: 'ac-main' },
      h('header', { class: 'ac-top' }),
      h('div', { class: 'ac-scroll' }, h('div', { class: 'ac-thread' })),
      h('div', { class: 'ac-dock' })),
    h('aside', { class: 'ac-panel', 'aria-label': 'Details' }));
  queueMicrotask(() => acPaint(true));
  return acPage;
}
function acPaint(fresh) {
  /* the details and an open file share the right side: showing the details closes the file */
  if (AC.panel && document.getElementById('main')?.dataset.artifact === 'open') closeArtifact?.();
  if (!acPage?.isConnected) return;
  const c = acChat(); if (!c) return;
  const sc = acPage.querySelector('.ac-scroll');
  const nearEnd = fresh || sc.scrollHeight - sc.scrollTop - sc.clientHeight < 120;
  acPage.classList.toggle('has-panel', AC.panel);
  acPage.classList.toggle('is-solo', c.kind === 'agent');
  /* the head: who you are talking to, in the middle; the panel and more at the end */
  acPage.querySelector('.ac-top').replaceChildren(
    h('span', { class: 'ac-top-l' }, AC.embed ? h('button', { class: 'pb-create-back ac-back', type: 'button', onclick: () => { mxClose('agents'); go('agents'); } },
      h('span', { class: 'pb-create-back-ar', html: PB_SVG.chev }), 'Agents') : null),
    h('button', { class: 'ac-pill', type: 'button', 'data-tip': AC.panel ? 'Hide Details' : 'Show Details', onclick: () => { AC.panel = !AC.panel; acPaint(); } },
      acChatAv(c, 'ac-pill-av'), h('span', { class: 'ac-pill-n' }, acTitle(c)),
      c.kind === 'group' ? h('span', { class: 'ac-pill-c' }, `${c.members.length + 1} members`) : null),
    h('span', { class: 'ac-top-r' },
      h('button', { class: 'pb-icon-btn' + (AC.panel ? ' is-on' : ''), type: 'button', 'aria-label': AC.panel ? 'Hide details' : 'Show details', 'data-tip': AC.panel ? 'Hide Details' : 'Show Details', html: AC_IC.panel, onclick: () => { AC.panel = !AC.panel; acPaint(); } }),
      h('button', { class: 'pb-icon-btn', type: 'button', 'aria-label': 'More', 'data-tip': 'More', html: AC_IC.dots, onclick: (e) => { e.stopPropagation(); acChatMenu(e.currentTarget, c); } })));
  const th = acPage.querySelector('.ac-thread');
  const liveQ = [...c.msgs].reverse().find(m => m.t === 'q' && m.pick == null);
  const nodes = [];
  c.msgs.forEach((m, i) => {
    const el = acMsg(c, m, c.msgs[i - 1], m === liveQ);
    if (!el) return;
    /* only what just arrived rises in; a repaint leaves the rest still */
    if (!fresh && !m.seen) el.classList.add('is-new');
    m.seen = true;
    nodes.push(el);
    /* ways in, under the message that offered them, until you say something */
    if (m.starts?.length && !c.typing && !c.msgs.slice(i + 1).some(x => x.t === 'me')) nodes.push(h('div', { class: 'ac-starts' },
      ...m.starts.map(t => h('button', { class: 'ac-start', type: 'button', onclick: () => acSend(t, []) }, t))));
  });
  if (c.typing) nodes.push(acTyping(c));
  th.replaceChildren(...nodes);
  acPaintDock(c);
  acPaintPanel(c);
  if (nearEnd) { const end = () => { sc.scrollTop = sc.scrollHeight; }; requestAnimationFrame(end); setTimeout(end, 80); setTimeout(end, 400); }
}
/* ── its questions rise above the box, as a set, the way an agent being built asks them:
   pick one (or 1–3), Next, and the last Next answers them all together ── */
function acAskSet(c, qs, done) { c.ask = { qs, i: 0, pick: [0], other: [], done }; acPaint(); acPaintRail(); }
function acAskPick(c, i) { const k = c.ask; k.pick[k.i] = i; k.other[k.i] = ''; acPaintTray(c); }
function acAskBack(c) { const k = c.ask; if (k.i > 0) { k.i -= 1; acPaintTray(c); } }
function acAskNext(c, skip) {
  const k = c.ask; if (!k) return;
  if (skip) { k.pick[k.i] = null; k.other[k.i] = ''; }
  if (k.i < k.qs.length - 1) { k.i += 1; if (k.pick[k.i] === undefined) k.pick[k.i] = 0; acPaintTray(c); return; }
  const answers = k.qs.map((q, i) => k.other[i] ? k.other[i] : k.pick[i] == null ? null : k.pick[i]);
  c.msgs.push({ t: 'answers', rows: k.qs.map((q, i) => [q.q, typeof answers[i] === 'string' ? answers[i] : answers[i] == null ? 'Skipped' : q.options[answers[i]]]) });
  c.ask = null; c.when = acNow();
  acPaint(); acPaintRail();
  k.done?.(answers);
}
function acPaintTray(c) {
  const dock = acPage?.querySelector('.ac-dock'); if (!dock) return;
  let tray = dock.querySelector('.ac-tray');
  if (!tray) { tray = h('div', { class: 'ac-tray' }); dock.prepend(tray); }
  const k = c.ask;
  if (!k) { tray.replaceChildren(); return; }
  const q = k.qs[k.i], last = k.i === k.qs.length - 1, pick = k.pick[k.i];
  const radio = '<svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.3"/><circle class="agb-radio-dot" cx="8" cy="8" r="3.4" fill="currentColor"/></svg>';
  const other = h('input', { class: 'jv-aq-in', placeholder: 'Something else', value: k.other[k.i] || '',
    oninput: (e) => { k.other[k.i] = e.target.value; k.pick[k.i] = e.target.value.trim() ? -1 : 0;
      tray.querySelectorAll('.agb-opt').forEach((o, i) => o.classList.toggle('is-on', k.pick[k.i] === i));
      e.target.closest('.agb-opt-other').classList.toggle('is-on', k.pick[k.i] === -1); },
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); acAskNext(c); } } });
  tray.replaceChildren(h('div', { class: 'agb-q', role: 'group', 'aria-label': q.q },
    h('div', { class: 'agb-q-top' },
      k.i > 0 ? h('button', { class: 'agb-q-back', type: 'button', 'aria-label': 'Previous question', 'data-tip': 'Back', html: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>', onclick: () => acAskBack(c) }) : null,
      h('b', {}, q.q),
      h('span', { class: 'agb-q-steps', 'aria-label': `${k.i + 1} of ${k.qs.length}` }, ...k.qs.map((_, i) => h('i', { class: i === k.i ? 'is-on' : i < k.i ? 'is-done' : '' })))),
    ...q.options.map((o, i) => h('button', { class: 'agb-opt' + (pick === i ? ' is-on' : ''), type: 'button', role: 'radio', 'aria-checked': String(pick === i), onclick: () => acAskPick(c, i) },
      h('span', { class: 'agb-radio', html: radio }), h('span', { class: 'agb-opt-l' }, o), h('span', { class: 'agb-opt-n' }, String(i + 1)))),
    h('label', { class: 'agb-opt agb-opt-other' + (pick === -1 ? ' is-on' : '') }, h('span', { class: 'agb-radio', html: radio }), other),
    h('div', { class: 'agb-q-foot' },
      h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => acAskNext(c, true) }, 'Skip'),
      h('button', { class: 'btn btn--primary', type: 'button', onclick: () => acAskNext(c) }, last ? 'Submit' : 'Next'))));
}
/* keys 1–4 pick and Enter goes on, while a question is up */
addEventListener('keydown', (e) => {
  if (typeof state === 'undefined' || state.view !== 'bots') return;
  const c = acChat?.(); if (!c?.ask) return;
  if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea, [contenteditable]')) return;
  const i = { '1': 0, '2': 1, '3': 2, '4': 3 }[e.key];
  if (i != null && c.ask.qs[c.ask.i].options[i]) { e.preventDefault(); acAskPick(c, i); }
  else if (e.key === 'Enter') { e.preventDefault(); acAskNext(c); }
});

/* the house box, one line; in a group @ reaches its members */
let acBoxFor = null;
function acPaintDock(c) {
  const dock = acPage.querySelector('.ac-dock');
  if (acBoxFor === c.id && dock.querySelector('.ask')) {
    const ta = dock.querySelector('textarea'); if (ta) ta.placeholder = `Message ${acTitle(c)}`;
    acPaintTray(c);
    return;
  }
  acBoxFor = c.id;
  const el = h('div', { class: 'ask ask-mini ac-ask',
    html: `<textarea rows="1" aria-label="Message" placeholder="Message ${acTitle(c).replace(/"/g, '&quot;')}"></textarea>`
      + '<div class="askbar"><button class="send" type="button" disabled aria-label="Send">' + ARROW + '</button></div>' });
  dock.replaceChildren(h('div', { class: 'ac-tray' }), h('div', { class: 'askwrap' }, el));
  acPaintTray(c);
  queueMicrotask(() => {
    if (!el.isConnected) return;
    initComposer(el, { noModel: true, noCreate: true, inThread: true,
      people: () => (acChat()?.kind === 'group' ? acChat().members : []).map(m => ({ label: acName(m), mark: acIsP(m) ? faceEl(m.slice(2), 'ac-av ac-av--p ac-av--tok').outerHTML : `<span class="ac-av ac-av--tok">${acIcon(m)}</span>` })),
      onSend: (text, { pills }) => acSend(text, pills) });
  });
}

/* ── the panel: who it is, what it has made, and its computer ── */
function acPanelTab(k) { AC.tab = k; AC.panel = true; acPaint(); }
const AC_ROUT = {
  regulatory: [['Every Thursday, 7:00', 'Weekly digest of rule changes']], obligation: [['Every day, 8:00', 'Deadlines in the next 30 days']],
  hold: [['Weekdays, 9:00', 'Chase unacknowledged holds']], triage: [['When a request arrives', 'Route it to the right lawyer']],
  nda: [['When an NDA arrives in Outlook', 'Review it against the playbook']], signature: [['Every 2 days', 'Chase open signatures']],
};
function acPaintPanel(c) {
  const p = acPage.querySelector('.ac-panel');
  if (!AC.panel) { p.replaceChildren(); return; }
  const isG = c.kind === 'group';
  const a = isG ? null : acAgent(c.agent);
  const TABS = [['details', 'Details'], ['artifacts', 'Artifacts'], ['computer', 'Computer']];
  const sec = (t, ...rows) => h('section', { class: 'ac-p-sec' }, h('h3', { class: 'ac-p-h' }, t), ...rows);
  const row = (lead, k, v, tail) => h('div', { class: 'ac-p-row' }, lead, h('span', { class: 'ac-p-t' }, h('span', { class: 'ac-p-k' }, k), v ? h('span', { class: 'ac-p-v' }, v) : null), tail || null);
  const logo = (id) => h('img', { class: 'ac-p-logo', src: brandSrc(id), alt: '' });
  const files = c.msgs.flatMap(m => (m.files || []).map(f => ({ ...f, who: m.t === 'me' ? 'You' : acName(m.who) }))).reverse();
  let body;
  if (AC.tab === 'artifacts') {
    body = files.length ? [sec('Made and shared here', ...files.map(f => row(h('img', { class: 'ac-p-logo', src: brandSrc(/xlsx$/.test(f.name) ? 'excel' : 'word'), alt: '' }), f.name, `${f.who} · ${f.meta}`)))]
      : [h('div', { class: 'ac-p-empty' }, h('b', {}, 'Nothing here yet'), h('span', {}, 'What it drafts, redlines and sends collects here.'))];
  } else if (AC.tab === 'computer') {
        const m = [...c.msgs].reverse().find(x => x.t === 'comp');
    body = [h('div', { class: 'ac-p-comp' },
      /* the screen always opens big: to take over when it is asking, to watch otherwise */
      h('div', { class: 'ac-p-shot', role: 'button', tabindex: '0', 'data-tip': m && m.state !== 'done' ? 'Take Over' : 'Open Full Screen',
        onclick: () => (m && m.state !== 'done') ? acTakeOver(c, m) : acWatch(c, m || null),
        onkeydown: (e) => { if (e.key === 'Enter') (m && m.state !== 'done') ? acTakeOver(c, m) : acWatch(c, m || null); } }, acScreen(c, m || null, 'md')),
      h('span', { class: 'ac-p-cap' }, `${isG ? acName(c.members.find(x => !acIsP(x))) : a.name}’s screen`),
      m && m.state !== 'done' ? h('div', { class: 'ac-comp-acts' },
        h('button', { class: 'btn', type: 'button', onclick: () => acTakeOver(c, m) }, 'Take over'),
        h('button', { class: 'btn btn--primary', type: 'button', onclick: () => acCompDone(c, m) }, 'I’m done')) : null,
      h('p', { class: 'ac-p-note' }, 'A browser, a terminal and file storage of its own. You can watch, or take over when it asks.'))];
  } else if (isG) {
    body = [
      sec(`Members · ${c.members.length + 1}`,
        row(faceEl(USER.name, 'ac-av ac-av--p'), USER.name, 'You · made this group'),
        ...c.members.map(m => row(acAv(m), acName(m), acIsP(m) ? (AC_PEOPLE.find(x => x[0] === m.slice(2))?.[1] || 'Colleague') : acAgent(m).say,
          h('button', { class: 'ac-p-x', type: 'button', 'aria-label': 'Remove', 'data-tip': 'Remove', html: AC_IC.x, onclick: () => acRemoveMember(c, m) }))),
        h('button', { class: 'ac-p-add', type: 'button', onclick: () => acAddMembers(c) }, acSvg('plus', 'ac-p-add-ic'), 'Add people or agents')),
      sec('How it answers', h('p', { class: 'ac-p-para' }, 'Whoever you @mention answers. Otherwise the agent whose job it is replies, and the others stay quiet.')),
      c.made ? sec('Made', h('p', { class: 'ac-p-para' }, `By you, ${c.made}`)) : null].filter(Boolean);
  } else {
    const rout = AC_ROUT[c.agent] || [];
    const apps = c.agent === 'obligation' ? [['sharepoint', 'SharePoint', 'Legal › Executed'], ['salesforce', 'Salesforce', c.comp?.state === 'done' ? 'Signed in' : 'Waiting for sign-in'], ['outlook', 'Outlook', 'Calendar']]
      : c.comp?.app === 'sharepoint' ? [['sharepoint', 'SharePoint', c.comp.state === 'done' ? 'Legal library' : 'Waiting for sign-in']]
      : [['sharepoint', 'SharePoint', 'Legal library'], ['outlook', 'Outlook', 'Mail and calendar']];
    body = [
      sec('What it does', h('p', { class: 'ac-p-para' }, a.say + '.')),
      sec('Apps', ...apps.map(([id, n, v]) => row(logo(id), n, v))),
      sec('Routines', ...(rout.length ? rout.map(([when, what]) => row(acSvg('think', 'ac-p-g'), what, when))
        : [h('button', { class: 'ac-p-add', type: 'button', onclick: () => pbToast('Tell it in the chat when it should run, and it sets the routine up.') }, acSvg('plus', 'ac-p-add-ic'), 'Add a routine')])),
      sec('Made by', row(a.by && a.by !== 'me' ? (PHOTOS[a.by] ? faceEl(a.by, 'ac-av ac-av--p') : acSvg('group', 'ac-p-g')) : faceEl(USER.name, 'ac-av ac-av--p'), a.by && a.by !== 'me' ? a.by : 'You', a.shared ? 'Shared with you' : null))];
  }
  p.replaceChildren(
    h('div', { class: 'ac-p-id' },
      isG ? acCluster(c.members, 'ac-p-av ac-cl--big') : h('span', { class: 'ac-p-av', html: acIcon(c.agent) }),
      h('h2', { class: 'ac-p-n' }, acTitle(c))),
    h('button', { class: 'pb-icon-btn ac-p-close', type: 'button', 'aria-label': 'Close', 'data-tip': 'Close', html: AC_IC.x, onclick: () => { AC.panel = false; acPaint(); } }),
    h('div', { class: 'ac-p-tabs', role: 'tablist' }, ...TABS.map(([k, t]) => h('button', { class: 'ac-p-tab', type: 'button', role: 'tab', 'aria-selected': String(AC.tab === k), onclick: () => { AC.tab = k; acPaintPanel(c); } }, t))),
    h('div', { class: 'ac-p-body' }, ...body));
}
function acRemoveMember(c, m) {
  if (c.members.length <= 2) return pbToast('A group needs at least two others.');
  const i = c.members.indexOf(m);
  c.members.splice(i, 1);
  c.msgs.push({ t: 'sys', ic: 'group', text: `You removed ${acName(m)}` });
  acPaint(); acPaintRail();
}

/* ── dialogs: a new agent, a new group, adding to one ── */
function acDialog(cls, title, body, foot, onClose) {
  const dim = h('div', { class: 'pb-dim ac-dim', onclick: (e) => { if (e.target === dim) close(); } });
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const close = () => { document.removeEventListener('keydown', onKey); dim.classList.add('is-closing'); setTimeout(() => dim.remove(), 150); onClose?.(); };
  dim.append(h('div', { class: 'ac-dlg ' + cls, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('header', { class: 'ac-dlg-h' }, h('h2', { class: 'ac-dlg-t' }, title),
      h('button', { class: 'pb-icon-btn', type: 'button', 'aria-label': 'Close', 'data-tip': 'Close', html: AC_IC.x, onclick: () => close() })),
    body, foot(close)));
  document.body.append(dim);
  document.addEventListener('keydown', onKey);
  return close;
}
function acCreateAgent() {
  const v = { name: '', shape: AC_SHAPES[Math.floor(Math.random() * AC_SHAPES.length)], color: AC_COLORS[Math.floor(Math.random() * AC_COLORS.length)] };
  const prev = h('span', { class: 'ac-mk-prev' });
  const shapes = h('div', { class: 'ac-mk-shapes', role: 'radiogroup', 'aria-label': 'Shape' });
  const colors = h('div', { class: 'ac-mk-colors', role: 'radiogroup', 'aria-label': 'Colour' });
  const paint = () => {
    prev.innerHTML = acBot({ id: 'mk-prev', ...v });
    shapes.replaceChildren(...AC_SHAPES.map(k => h('button', { class: 'ac-mk-shape', type: 'button', role: 'radio', 'aria-checked': String(v.shape === k), 'aria-label': 'Shape ' + (AC_SHAPES.indexOf(k) + 1),
      html: acBot({ id: 'mk-' + k, shape: k, color: v.color }), onclick: () => { v.shape = k; paint(); } })));
    colors.replaceChildren(...AC_COLORS.map(c => h('button', { class: 'ac-mk-color', type: 'button', role: 'radio', 'aria-checked': String(v.color === c), 'aria-label': 'Colour ' + c,
      style: `--c:${c}`, onclick: () => { v.color = c; paint(); } })));
  };
  paint();
  const name = h('input', { class: 'ac-mk-name', type: 'text', placeholder: 'Name your agent', 'aria-label': 'Name your agent', maxlength: '40', oninput: (e) => { v.name = e.target.value; } });
  const shuffle = h('button', { class: 'ac-mk-shuffle', type: 'button', 'aria-label': 'Shuffle', 'data-tip': 'Shuffle', html: AC_IC.shuffle,
    onclick: () => { v.shape = AC_SHAPES[Math.floor(Math.random() * AC_SHAPES.length)]; v.color = AC_COLORS[Math.floor(Math.random() * AC_COLORS.length)]; paint(); } });
  const body = h('div', { class: 'ac-dlg-b' },
    h('div', { class: 'ac-mk-stage' }, prev, shuffle),
    name,
    h('div', { class: 'ac-mk-k' }, 'Shape'), shapes,
    h('div', { class: 'ac-mk-k' }, 'Colour'), colors);
  acDialog('ac-mk', 'New agent', body, (close) => h('footer', { class: 'ac-dlg-f' },
    h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => close() }, 'Cancel'),
    h('button', { class: 'btn btn--primary', type: 'button', onclick: () => { close(); acMade(v); } }, 'Create')));
  setTimeout(() => name.focus(), 40);
}
/* made: its own chat, and its first three questions */
async function acMade(v) {
  const a = { id: 'mine-' + Date.now(), name: v.name.trim() || 'New agent', unnamed: !v.name.trim(), say: 'Your new agent', by: 'me', shape: v.shape, color: v.color };
  AC_MINE.unshift(a);
  const c = { id: 'c-' + a.id, kind: 'agent', agent: a.id, section: 'none', when: acNow(), msgs: [{ t: 'stamp', text: 'Today ' + acNow() }], onboard: { q: 0, answers: [] } };
  AC_CHATS.unshift(c);
  acOpen(c.id);
  await acWait(400);
  await acSay(c, a.id, `Hi ${USER.greeting}, I’m ${a.unnamed ? 'your new agent' : a.name}. Three quick questions so I work the way you do.`);
  acAskSet(c, AC_ONB, (ans) => acOnboardDone(c, ans));
}

/* people and agents, picked into a list; used to make a group and to add to one */
function acPicker(exclude = []) {
  const pick = new Set();
  const all = [...AC_MINE.map(a => a.id), ...LEGAL_AGENTS.map(a => a.id)].filter(id => !exclude.includes(id))
    .map(id => ({ id, n: acName(id), s: acAgent(id).say, g: 'Agents' }))
    .concat(AC_PEOPLE.filter(([n]) => !exclude.includes('p:' + n)).map(([n, r]) => ({ id: 'p:' + n, n, s: r, g: 'People' })));
  let q = '';
  const chips = h('div', { class: 'ac-pk-chips' });
  const list = h('div', { class: 'ac-pk-list' });
  const inp = h('input', { class: 'ac-pk-in', type: 'text', placeholder: 'Add agents or people', 'aria-label': 'Add agents or people',
    oninput: (e) => { q = e.target.value; paint(); },
    onkeydown: (e) => { if (e.key === 'Backspace' && !inp.value && pick.size) { pick.delete([...pick].pop()); paint(); } } });
  const box = h('label', { class: 'ac-pk-box' }, chips, inp);
  const api = { pick, onChange: null, el: h('div', { class: 'ac-pk' }, box, list) };
  const paint = () => {
    chips.replaceChildren(...[...pick].map(id => h('span', { class: 'ac-pk-chip' }, acAv(id, 'ac-av--xs'), acName(id),
      h('button', { type: 'button', 'aria-label': 'Remove ' + acName(id), html: AC_IC.x, onclick: (e) => { e.preventDefault(); pick.delete(id); paint(); } }))));
    const s = q.trim().toLowerCase();
    const rows = all.filter(x => !s || (x.n + ' ' + x.s).toLowerCase().includes(s));
    const groups = ['Agents', 'People'].map(g => {
      const r = rows.filter(x => x.g === g); if (!r.length) return null;
      return [h('div', { class: 'ac-pk-g' }, g), ...r.map(x => h('button', { class: 'ac-pk-row', type: 'button', role: 'checkbox', 'aria-checked': String(pick.has(x.id)),
        onclick: () => { pick.has(x.id) ? pick.delete(x.id) : pick.add(x.id); paint(); inp.focus(); } },
        acAv(x.id), h('span', { class: 'ac-pk-t' }, h('b', {}, x.n), h('span', {}, x.s)), h('span', { class: 'ac-pk-tick', html: AC_IC.check })))];
    }).filter(Boolean).flat();
    list.replaceChildren(...(groups.length ? groups : [h('p', { class: 'ac-pk-none' }, `Nobody matches “${q.trim()}”.`)]));
    api.onChange?.();
  };
  api.paint = paint; api.focus = () => inp.focus();
  return api;
}
function acCreateGroup() {
  const pk = acPicker();
  const name = h('input', { class: 'ac-mk-name ac-gp-name', type: 'text', placeholder: 'Group name', 'aria-label': 'Group name', maxlength: '48' });
  const go = h('button', { class: 'btn btn--primary', type: 'button', disabled: true }, 'Create group');
  const count = h('span', { class: 'ac-dlg-n' });
  pk.onChange = () => { go.disabled = pk.pick.size < 2; count.textContent = pk.pick.size ? `${pk.pick.size} selected` : 'Pick two or more'; };
  pk.paint();
  const close = acDialog('ac-gp', 'New group chat', h('div', { class: 'ac-dlg-b' }, name, pk.el), (close) => h('footer', { class: 'ac-dlg-f' }, count,
    h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => close() }, 'Cancel'), go));
  go.onclick = () => { close(); acMadeGroup(name.value.trim(), [...pk.pick]); };
  setTimeout(() => name.focus(), 40);
}
const acList = (names) => names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
async function acMadeGroup(name, members) {
  const agents = members.filter(m => !acIsP(m));
  const c = { id: 'g-' + Date.now(), kind: 'group', name: name || acList(members.map(m => acIsP(m) ? acFirst(acName(m)) : acName(m))).slice(0, 48), section: 'none', when: acNow(), members, made: 'today',
    msgs: [{ t: 'stamp', text: 'Today ' + acNow() }, { t: 'sys', ic: 'group', text: `You made this group with ${acList(members.map(acName))}` }] };
  AC_CHATS.unshift(c);
  acOpen(c.id);
  /* each agent says who it is, once, in turn */
  for (const m of agents.slice(0, 4)) {
    await acWait(250);
    await acSay(c, m, `Hi all, I’m ${acName(m)}. ${acAgent(m).say}. @mention me when you need that.`);
  }
}
function acAddMembers(c) {
  const pk = acPicker(c.members);
  const go = h('button', { class: 'btn btn--primary', type: 'button', disabled: true }, 'Add');
  pk.onChange = () => { go.disabled = !pk.pick.size; go.textContent = pk.pick.size > 1 ? `Add ${pk.pick.size}` : 'Add'; };
  pk.paint();
  const close = acDialog('ac-gp', `Add to ${c.name}`, h('div', { class: 'ac-dlg-b' }, pk.el), (close) => h('footer', { class: 'ac-dlg-f' },
    h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => close() }, 'Cancel'), go));
  go.onclick = async () => {
    close();
    const add = [...pk.pick];
    c.members.push(...add);
    c.msgs.push({ t: 'sys', ic: 'group', text: `You added ${acList(add.map(acName))}` });
    acPaint(); acPaintRail();
    for (const m of add.filter(x => !acIsP(x))) await acSay(c, m, `Hi all, I’m ${acName(m)}. ${acAgent(m).say}.`);
  };
  setTimeout(() => pk.focus(), 40);
}

/* ── wiring: the view, its address, the switch and X ── */
let goPlain = go;
(() => {
  register('bots', () => acView());
  /* an agent from the Agents page opens as its conversation, the way Grok's do */
  agentChatPage = (a) => acEmbed(a);
  goPlain = go;
  /* leaving Agents by any road puts the workspace back */
  go = function (id) {
    if (id !== 'bots' && AC.mode === 'agents') { AC.mode = 'work'; delete app.dataset.mode; acPaintSwitch(); acPaintRail(); }
    return goPlain(id);
  };

  const rail = document.querySelector('.rail');
  const head = rail.querySelector('.rail-head');
  acSw = acSwitch();
  /* two icons beside the collapse button, the way Claude switches chat and code */
  (head.querySelector('[data-action="collapse"]') || head.lastElementChild).before(acSw);
  acRailEl = acRail();
  rail.querySelector('.rail-scroll').after(acRailEl);
  acPaintSwitch(); acPaintRail();

  const prevHash = openByHash;
  openByHash = function (hash) {
    const m = /^bots(?:\/(.+))?$/.exec(hash);
    if (!m) return prevHash(hash);
    const id = m[1] ? decodeURIComponent(m[1]) : null;
    if (state.view === 'bots' && view.querySelector('.ac') && (!id || id === AC.open)) return true;
    AC.on = true;
    if (state.view !== 'bots' && !AC.prev) AC.prev = 'home';
    AC.mode = 'agents'; app.dataset.mode = 'agents'; acPaintSwitch(); acPaintRail();
    acOpen(id || AC.open || AC_CHATS[0].id);
    return true;
  };

  /* X: the switch appears, and goes again — taking you back to the workspace */
  addEventListener('keydown', (e) => {
    if (e.key !== 'x' && e.key !== 'X') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
    if (document.querySelector('.br-dock, .pb-dim, .acs-over')) return;
    e.preventDefault();
    AC.on = !AC.on;
    if (!AC.on && AC.mode === 'agents') acMode('work');
    acPaintSwitch();
  });

  /* the I key cycles icon families here too */
  addEventListener('keydown', (e) => {
    if ((e.key !== 'i' && e.key !== 'I') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (state.view !== 'bots' || e.target.closest?.('input, textarea, [contenteditable]')) return;
    const i = AG_STYLES.findIndex(x => x[0] === agStyle());
    state.agIconStyle = AG_STYLES[(i + 1) % AG_STYLES.length][0]; save();
    acPaint(); acPaintRail();
    pbToast(`Icons: ${AG_STYLES.find(x => x[0] === state.agIconStyle)[1]}`);
  });

  /* boot already ran, and rewrote an address it did not know; the one the page was opened at is kept by the browser */
  const first = (() => { try { return new URL(performance.getEntriesByType('navigation')[0]?.name || location.href).hash.slice(1); } catch { return ''; } })();
  if (/^bots(\/|$)/.test(first)) openByHash(first);
})();
