/* ── Submit a request with Clavia ─────────────────────────────
   The standard chat, with the request as its artifact. You say what you
   need; Clavia reads it, looks the counterparty up on the public register
   and the deal up in Salesforce, and asks one short question at a time for
   what is still missing. Beside the chat, the request artifact fills in as
   you talk — a few lines of summary, the fields legal reads first, where
   each fact came from, what is left to confirm — and Submit sends it.
   A new kind is one render function and one registry entry, the same way
   the playbook is. */

const RQB_STARTS = [
  'We need an NDA with a new partner before we share the roadmap',
  'Can legal review a customer’s redline of our MSA?',
  'Stop a supplier contract from renewing',
  'A quick legal question',
];
const RQB_WHAT = { NDA: 'an NDA', 'Contract review': 'a contract reviewed', Drafting: 'an agreement drafted', Advice: 'an answer to a question',
  Termination: 'an agreement ended', Privacy: 'privacy terms agreed', Signature: 'an agreement signed' };

/* who the counterparty is, from the register; the deal and their contact, from Salesforce */
function rqbCompany(name) {
  if (!name) return null;
  const w = name.toLowerCase().split(/\s+/)[0];
  const key = Object.keys(MX_CPS).find(k => k.toLowerCase().split(/\s+/)[0] === w);
  if (!key) return null;
  const c = MX_CPS[key];
  return { key, ...c, reg: /England and Wales/.test(c.where || '') ? 'Companies House' : 'Public registry', regSay: /England and Wales/.test(c.where || '') ? 'Companies House' : 'the public register' };
}
function rqbDeal(cpKey) {
  if (!cpKey) return null;
  const w = cpKey.toLowerCase().split(/\s+/)[0];
  const name = Object.keys(MX_DEALS).find(k => k.toLowerCase().startsWith(w));
  return name ? { name, ...MX_DEALS[name] } : null;
}
function rqbContact(cpKey) {
  if (typeof MX_CP_CONTACT !== 'undefined' && MX_CP_CONTACT[cpKey]) return MX_CP_CONTACT[cpKey];
  const seed = MX_INTAKE_SEED.find(x => x[3] === cpKey);
  const c = seed && (MX_DEAL_TEAM[seed[0]] || []).find(p => p[2] === 'counterparty');
  return c ? { name: c[0], role: c[1], email: c[3] } : null;
}

/* the request, made from a finished draft */
function rqbCreate(d, said) {
  const day5 = new Date(); day5.setDate(day5.getDate() + 5); day5.setHours(17, 0, 0, 0);
  const r = { id: mxNextRq(), title: (d.title || 'New request').trim(), type: d.type, counterparty: d.co?.key || d.counterparty || null, deal: d.deal || null,
    team: d.team || 'Sales', urgent: !!d.urgent, due: d.due || day5.toISOString(), submitter: USER.name, attorney: null, status: 'new', detail: said,
    files: (d.files || []).slice(), updated: mxNow(), created: mxNow(), triaged: false };
  if (d.co && !MX_CPS[d.co.key]) r.cp = { legal: d.co.legal, where: d.co.where };
  if (d.co?.addr) r.address = d.co.addr;
  if (d.deal && !MX_DEALS[d.deal]) r.dealInfo = d.dealInfo;
  if (d.paper === 'theirs') r.startsFrom = `${r.counterparty || 'Their'}’s paper`;
  if (d.type === 'NDA') r.template = /one-way/i.test(d.ndaKind || '') ? 'one-way-nda' : 'mutual-nda';
  r.people = [{ name: USER.name, role: `Submitter · ${r.team}`, side: 'business', email: mxEmail(USER.name) },
    ...(d.contact ? [{ name: d.contact.name, role: d.contact.role, side: 'counterparty', email: d.contact.email }] : [])];
  const blobs = r.files.map(n => MX.files?.get(n)).filter(Boolean);
  mxIntake().unshift(r); save();
  if (blobs.length) mxTakeFiles(r, blobs);
  if (typeof INTAKE_FX !== 'undefined' && INTAKE_FX.rules && !r.resolvedBy) mxApplyRules(r);
  return r;
}


/* the register is a source of its own in the trace */
SOURCES.registry = { label: 'the company register', verb: 'Looked up',
  icon: '<path d="M4 20.5h16M5.5 20.5V10M18.5 20.5V10M9.5 20.5V10M14.5 20.5V10M3.5 10h17L12 3.5z"/>' };

/* ── the artifact ─────────────────────────────────────────────── */
let RQ_N = 0;
function rqArtifact(d = { files: [] }) {
  const id = 'request-draft-' + Date.now().toString(36) + (++RQ_N);
  const a = ARTIFACTS[id] = {
    id, kind: 'request', ext: 'request', d, done: null, q: null,
    get name() { return this.d.title || 'New request'; },
    set name(v) { this.d.title = v; },
  };
  return a;
}
const rqDay = (n) => { const x = new Date(); x.setDate(x.getDate() + n); x.setHours(17, 0, 0, 0); return x.toISOString(); };
const rqFmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const RQ_IC = (p, w = 16) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

/* ── reading what was said ── */
function rqRead(d, text, files = []) {
  const got = mxReadRequest(text, files);
  const said = /\b(today|tonight|eod|end of day|tomorrow|by (monday|tuesday|wednesday|thursday|friday)|in \d+ (day|week)s?|next week)\b/i.test(text);
  if (!d.type || d.type === 'Advice') d.type = got.type;
  if (!d.counterparty && got.counterparty) d.counterparty = got.counterparty;
  if (!d.counterparty) { const k = Object.keys(MX_CPS).find(k => new RegExp(`\\b${k.split(/\s+/)[0]}\\b`, 'i').test(text)); if (k) d.counterparty = k; }
  if (!d.title || d.title === 'New request') { d.title = got.counterparty || !d.counterparty ? got.title : mxReadRequest(`${text} with ${d.counterparty}`, files).title; d.titleAuto = true; }
  d.team ||= got.team;
  if (got.urgent) d.urgent = true;
  if (said) { d.due = /next week/i.test(text) ? rqDay(7) : got.due; d.dueSaid = true; }
  if (/\bmutual\b/i.test(text)) d.ndaKind = 'Mutual';
  if (/their paper|their (own )?(draft|template)|on their/i.test(text)) d.paper = 'theirs';
  if (/our (template|paper|standard)/i.test(text)) d.paper = 'ours';
  const pm = /\bbefore (?:we|i) (share|show|send) ([^.,;]+)/i.exec(text) || /\bfor ([^.,;]*(?:talks|discussions|pilot|evaluation|partnership)[^.,;]*)/i.exec(text);
  if (pm && d.type === 'NDA' && !d.purpose) d.purpose = (pm[2] ? `Sharing ${pm[2]}` : pm[1]).replace(/\s+\b(next week|this week|tomorrow|today|by \w+|asap)\b.*$/i, '').trim().replace(/^\w/, c => c.toUpperCase());
  d.files = [...(d.files || []), ...files];
  (d.said ||= []).push(text);
}
/* the lookups: the register for who they are, Salesforce for the deal and the person */
function rqLookups(d) {
  if (!d.counterparty || d.co) return [];
  const co = rqbCompany(d.counterparty);
  const deal = co && rqbDeal(co.key), contact = co && rqbContact(co.key);
  const was = d.counterparty;
  if (co) {
    d.co = co; d.counterparty = co.key;
    if (d.title && was && d.title.includes(was) && !d.title.includes(co.key)) d.title = d.title.replace(was, co.key);
    else if (d.titleAuto && !d.title.includes(co.key)) d.title = mxReadRequest(`${(d.said || []).join(' ')} with ${co.key}`, d.files || []).title;
  }
  if (deal) { d.deal = deal.name; d.dealInfo = deal; }
  if (contact) d.contact = contact;
  return [
    { source: 'registry', query: co ? co.legal : d.counterparty, count: co ? co.reg : 'not found',
      rows: co ? [{ title: co.legal, meta: [co.kind, co.no].filter(Boolean).join(' · ') }, { title: co.addr || co.where, meta: 'Registered office' }] : [] },
    { source: 'salesforce', query: `open deals with ${co ? co.key : d.counterparty}`, count: deal ? '1 deal' : 'none',
      rows: [deal && { source: 'salesforce', title: deal.name, meta: [deal.value !== '—' && deal.value, deal.stage].filter(Boolean).join(' · ') },
        contact && { source: 'salesforce', title: contact.name, meta: contact.role }].filter(Boolean) },
  ];
}
/* the one thing legal cannot start without: their document, when the work is on their paper */
const rqNeedsDoc = (d) => (d.type === 'Contract review' || d.type === 'Privacy' || d.paper === 'theirs') && !(d.files || []).length;
const rqReady = (d) => !!d.type && !rqNeedsDoc(d);
/* the one kind that needs no lawyer: a mutual NDA on our own template,
   nothing changed, with a counterparty found on the register */
const rqSelfServe = (d) => d.type === 'NDA' && d.ndaKind === 'Mutual' && d.paper === 'ours' && !!d.co && d.co.reg !== 'You' && !(d.files || []).length
  && (typeof mxRuleLetsClaviaFinish !== 'function' || mxRuleLetsClaviaFinish({ type: 'NDA', paper: 'ours', team: d.team || 'Sales' }));
const RQ_Q = {
  who: () => ({ ask: 'Who is it with? Optional, but the company name is enough for me to look up the rest.', chips: [...Object.keys(MX_CPS).slice(0, 3).map(k => k.replace(/\s+(Ltd|LLC|plc|Inc\.?)$/, '')), 'Skip'] }),
  legal: (d) => ({ ask: `I could not find ${d.counterparty} in Salesforce or on the company register. If you know their full legal name and where they are registered, tell me; otherwise skip it.`, chips: ['Skip'] }),
  file: (d) => ({ ask: `Attach ${d.counterparty ? d.counterparty + '’s' : 'their'} draft — it is the one thing legal needs before it can start. Drop it here or use Attach a file.`, chips: ['Attach a file'] }),
  ndaKind: () => ({ ask: 'Will both sides share confidential information, or only one? Optional — legal assumes mutual if you skip it.', chips: ['Both sides (mutual)', 'Only we share', 'Only they share', 'Skip'] }),
  purpose: () => ({ ask: 'What is the information being shared for? Optional; it goes into the NDA as the purpose.', chips: ['Partnership discussions', 'Evaluating their product', 'A possible investment', 'Skip'] }),
  paper: () => ({ ask: 'Should legal start from our template, or are we working on their paper?', chips: ['Our template', 'Their paper'] }),
  deal: () => ({ ask: 'Which deal is this for? Optional — I could not match one in Salesforce.', chips: [...Object.keys(MX_DEALS).slice(0, 2), 'Not tied to a deal'] }),
  due: () => ({ ask: 'When do you need it by? Optional, but it sets the order legal works in.', chips: ['Tomorrow', 'In 3 days', 'Next week', 'No rush'] }),
};
function rqNext(d) {
  const a = d.asked ||= {};
  const need = (k, cond) => cond && !a[k];
  if (rqNeedsDoc(d)) return 'file';
  if (d.type !== 'Advice') {
    if (need('who', !d.counterparty)) return 'who';
    if (need('legal', d.counterparty && !d.co)) return 'legal';
  }
  if (need('ndaKind', d.type === 'NDA' && !d.ndaKind)) return 'ndaKind';
  if (need('purpose', d.type === 'NDA' && !d.purpose)) return 'purpose';
  if (need('paper', (d.type === 'Drafting' || d.type === 'NDA') && !d.paper)) return 'paper';
  if (need('deal', d.counterparty && d.type !== 'Advice' && !d.deal)) return 'deal';
  if (need('due', !d.dueSaid)) return 'due';
  return null;
}
function rqAnswer(d, q, text) {
  if (/^skip$/i.test(text.trim())) return;
  if (q === 'who') d.counterparty = text.replace(/[.?!]$/, '').trim();
  else if (q === 'legal') d.co = { key: d.counterparty, legal: text.split(/,| in | registered /i)[0].trim(), where: (/(?:in|registered in)\s+(.+)$/i.exec(text) || [])[1] || null, reg: 'You' };
  else if (q === 'file') { if (/later/i.test(text)) d.fileLater = true; }
  else if (q === 'ndaKind') d.ndaKind = /both|mutual/i.test(text) ? 'Mutual' : /we share/i.test(text) ? 'One-way (we share)' : 'One-way (they share)';
  else if (q === 'purpose') d.purpose = text.replace(/[.]$/, '');
  else if (q === 'paper') d.paper = /their/i.test(text) ? 'theirs' : 'ours';
  else if (q === 'deal') { if (/not tied|no deal|none/i.test(text)) d.noDeal = true; else { const k = Object.keys(MX_DEALS).find(x => x.toLowerCase() === text.toLowerCase()) || text; d.deal = k; d.dealInfo = MX_DEALS[k] ? { name: k, ...MX_DEALS[k] } : { name: k }; } }
  else if (q === 'due') { d.dueSaid = true; d.due = /tomorrow/i.test(text) ? rqDay(1) : /3 days/i.test(text) ? rqDay(3) : /next week/i.test(text) ? rqDay(7) : /no rush/i.test(text) ? rqDay(14) : mxReadRequest(text).due; }
}
const rqTell = (d) => {
  const what = d.type ? `${RQB_WHAT[d.type] || 'help'}${d.counterparty ? ' with ' + (d.co?.legal || d.counterparty) : ''}` : '';
  const found = [d.co && d.co.reg !== 'You' && `their registered details from ${d.co.regSay || d.co.reg}`, d.dealInfo?.stage && 'the deal from Salesforce', d.contact && `${d.contact.name} as their contact`].filter(Boolean);
  return `${what ? 'Got it: ' + what + '.' : 'Got it.'}${found.length ? ' I filled in ' + found.join(', ').replace(/, ([^,]*)$/, ' and $1') + '.' : ''}`;
};

/* ── a turn in the request's conversation ── */
function requestTurn(a, prompt) {
  const d = a.d;
  const m = { role: 'bot', steps: [], text: '', thinking: true };
  const t = prompt.trim();
  const open = /^open (rq-\d+)/i.exec(t);
  if (open) { mxOpen('intake', open[1].toUpperCase()); return; }
  for (const x of thread.messages) if (x.suggest) { x.suggest = null; x.el?.querySelector('.sugg')?.remove(); }
  thread.messages.push(m); paintThread();
  const finish = (fn, ms) => setTimeout(() => { m.thinking = false; if (m.traceOpen == null) m.traceOpen = false; fn(); renderBot(m); rqRefresh(a); }, ms);

  if (a.done) { finish(() => { m.text = `This one is already with legal as **${a.done}**. To ask for something else, start a new request from Requests.`; m.suggest = [`Open ${a.done}`]; }, 500); return; }
  if (/^submit/i.test(t)) { rqSubmit(a, m); return; }
  if (/^send for signature/i.test(t)) { rqSelfSend(a, m); return; }
  if (/^attach a file$/i.test(t)) { thread.messages.pop(); paintThread(); rqPickFiles(a); return; }

  let steps = [], lead = '';
  /* waiting on the document, anything typed is read for what else it says */
  if (a.q === 'file' && !/^attached /i.test(t)) { rqRead(d, t); steps = rqLookups(d); lead = d.co ? rqTell(d) : ''; }
  else if (a.q) { rqAnswer(d, a.q, t); if (a.q === 'who') { steps = rqLookups(d); lead = d.co ? rqTell(d) : ''; } }
  else {
    rqRead(d, t);
    steps = [{ source: 'request', query: 'what you need from legal', count: d.type || 'read' }, ...rqLookups(d)];
    lead = rqTell(d);
  }
  a.q = null;
  steps.forEach((s, i) => {
    setTimeout(() => { m.steps.push({ ...s, rows: [], running: true }); renderBot(m); }, 300 + i * 700);
    setTimeout(() => { Object.assign(m.steps[i], s, { running: false }); renderBot(m); }, 300 + i * 700 + 550);
  });
  finish(() => {
    const k = rqNext(d);
    a.q = k;
    const can = rqReady(d) ? ' You can submit it whenever you like.' : '';
    if (k) { d.asked[k] = true; const q = RQ_Q[k](d); m.text = (lead ? lead + ' ' : '') + q.ask + (k !== 'file' ? can : ''); m.suggest = q.chips.length ? (rqReady(d) && k !== 'file' ? [...q.chips, 'Submit the request'] : q.chips) : null; }
    else if (rqSelfServe(d)) { m.text = (lead ? lead + ' ' : '') + rqSelfSay(d); m.suggest = ['Send for signature', 'Submit to legal instead']; }
    else { m.text = (lead ? lead + ' ' : '') + 'That is everything. The request is beside this chat — change anything in it, then submit it when you are ready.'; m.suggest = ['Submit the request']; }
    if (!thread.messages.some(x => x !== m && x.artifact === a.id && x.role === 'bot' && x.text)) m.artifact = a.id;
    if (d.title && thread.title !== d.title) {
      thread.title = d.title;
      const t1 = document.querySelector('.thread-title .thread-title-text'); if (t1) t1.textContent = d.title;
      const hi = HISTORY.find(x => x.id === thread.id); if (hi) { hi.label = d.title; mountNav?.(); }
    }
  }, 300 + steps.length * 700 + 300);
}

/* the file asked for, picked from the chat */
function rqPickFiles(a) {
  const pick = h('input', { type: 'file', multiple: true, hidden: true, accept: '.docx,.doc,.pdf,.txt,.md,.rtf',
    onchange: (e) => {
      const names = [...e.target.files].map(f => { (MX.files ||= new Map()).set(f.name, f); return f.name; });
      pick.remove();
      if (!names.length) return;
      a.d.files = [...(a.d.files || []), ...names];
      const text = `Attached ${names.join(', ')}`;
      say('user', text); paintThread();
      a.q = 'file'; requestTurn(a, text);
    } });
  document.body.append(pick); pick.click();
}

/* sending it: the request is made, the chat says so, the artifact shows it */
function rqSubmit(a, m) {
  const d = a.d;
  if (!m) { m = { role: 'bot', steps: [], text: '', thinking: true }; thread.messages.push(m); paintThread(); }
  if (!rqReady(d)) { setTimeout(() => { m.thinking = false; m.text = !d.type ? 'Tell me what you need first, and I will put the request together.' : `Attach ${d.counterparty ? d.counterparty + '’s' : 'their'} draft first — it is the one thing legal needs before it can start.`; if (d.type) m.suggest = ['Attach a file']; renderBot(m); }, 400); return; }
  const s1 = { source: 'request', query: 'Created the request', count: 'new' };
  setTimeout(() => { m.steps.push({ ...s1, running: true }); renderBot(m); }, 300);
  setTimeout(() => {
    const r = rqbCreate(d, (d.said || []).join('\n\n'));
    a.done = r.id; a.q = null;
    Object.assign(m.steps[0], s1, { running: false, count: r.id });
    m.thinking = false; m.traceOpen = false;
    const tpl = mxTemplateFor(r);
    m.text = `Submitted. **${r.id}** is with legal now${tpl ? `, with a first draft from our ${tpl.name} template attached` : ''}. You can follow it in Requests, and anything legal asks will come back to you there.`;
    m.artifact = a.id;
    m.suggest = [`Open ${r.id}`];
    renderBot(m); rqRefresh(a);
    pbToast(`${r.id} is submitted`);
  }, 1100);
}
/* a standard NDA goes straight out: Clavia fills the template, checks it
   against the playbook, and sends it for signature; legal sees it in
   Requests as resolved by Clavia */
const rqSelfSay = (d) => `That is everything. This is a standard mutual NDA on our template, so it does not need to wait for legal: I can fill it in and send it to ${d.contact?.name || 'their contact'} and you for signature now. If anything about this deal is unusual, send it to legal instead.`;
function rqSelfSend(a, m) {
  const d = a.d;
  if (!rqSelfServe(d)) { rqSubmit(a, m); return; }
  const who = d.contact?.name || 'their contact';
  const steps = [
    { source: 'doc', query: 'Filled in the Mutual NDA template', count: 'no blanks' },
    { source: 'playbook', query: 'Checked it against the NDA playbook', count: 'standard' },
    { source: 'request', query: `Sent it for signature to ${who} and you`, count: '2 signers' },
  ];
  steps.forEach((s, i) => {
    setTimeout(() => { m.steps.push({ ...s, rows: [], running: true }); renderBot(m); }, 300 + i * 900);
    setTimeout(() => { Object.assign(m.steps[i], s, { running: false }); renderBot(m); }, 300 + i * 900 + 700);
  });
  setTimeout(() => {
    const r = rqSelfMake(d);
    a.done = r.id; a.self = true; a.q = null;
    m.thinking = false; m.traceOpen = false;
    m.text = rqSelfDone(r, who);
    m.artifact = a.id; m.suggest = [`Open ${r.id}`];
    renderBot(m); rqRefresh(a);
    pbToast(`${r.id} is out for signature`);
  }, 300 + steps.length * 900 + 300);
}
const rqSelfDone = (r, who) => `Sent. **${r.id}** is out for signature with ${who} and you, on our Mutual NDA template with nothing changed. Legal can see it in Requests as resolved by Clavia, and it closes itself once you have both signed.`;
function rqSelfMake(d) {
  const r = rqbCreate(d, (d.said || []).join('\n\n'));
  const tpl = mxTemplate('mutual-nda'), when = mxNow(), who = d.contact?.name || 'their contact';
  const vals = { counterparty: d.co.legal, counterparty_address: d.co.addr || d.co.where || '', effective_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    purpose: (d.purpose || 'discussing a possible partnership').replace(/^\w/, c => c.toLowerCase()), term_years: 'three years', governing_law: 'England and Wales', signatory: `${USER.name}, General Counsel` };
  const file = `${r.counterparty} — Mutual NDA.docx`;
  r.documents = [{ id: 'd1', title: file, source: 'mutual-nda', versions: [{ name: 'Ready to sign', by: 'Clavia', when, file, blocks: mxDraftBlocks(tpl, vals), note: 'Our Mutual NDA template, every field filled in, nothing changed' }] }];
  r.resolvedBy = 'Clavia'; r.triaged = true;
  r.stage = Math.max(0, mxStages(r).indexOf('Signing')); r.status = 'signature';
  r.sign = { v: 2, stages: [], order: 'in order', cc: [], sent: when, doc: { doc: 'd1', v: 1 },
    signers: [{ who: d.contact?.name || null, what: `Signs for ${r.counterparty}`, state: 'viewed', viewed: when, at: null, reminded: null }, { who: USER.name, what: 'Signs for us', state: 'sent', at: null, reminded: null }] };
  r.activity = [
    { who: USER.name, ev: 'submit', what: 'asked for this in a chat with Clavia', when },
    { who: 'Clavia', ev: 'clavia', what: 'filled in the Mutual NDA template', when, ref: { doc: 'd1', v: 1 } },
    { who: 'Clavia', ev: 'clavia', what: 'checked it against the NDA playbook: standard terms, nothing changed', when },
    { who: 'Clavia', ev: 'clavia', what: `sent it for signature to ${who} and ${USER.name}`, when, ref: { doc: 'd1', v: 1 } },
  ];
  save(); return r;
}

/* the artifact beside the chat follows every change */
function rqRefresh(a) {
  const main = document.getElementById('main');
  if (main?.dataset.artifact === 'open' && document.querySelector('.deck-view[data-kind="request"]')) openArtifact(a);
}

/* ── how the request reads ── */
function rqRender(a) {
  const d = a.d;
  const first = USER.name.split(' ')[0];
  const SRC_MARK = {
    reg: (c) => h('span', { class: 'rqb-src', 'data-tip': `From ${c.regSay === 'the public register' ? 'the public register' : c.reg}`, html: RQ_IC(SOURCES.registry.icon, 12) }),
    sf: () => h('span', { class: 'rqb-src', 'data-tip': 'From Salesforce' }, h('img', { src: 'assets/brand/salesforce.svg', alt: '' })),
  };
  const row = (label, val, src) => h('div', { class: 'rqd-c rqb-row' + (val == null ? ' is-wait' : '') },
    h('span', { class: 'rqd-l' }, label), h('span', { class: 'rqd-v' }, val ?? 'Empty', val != null && src ? src : null));
  const submit = h('button', { class: 'xp-btn rqa-submit' + (a.done ? ' is-done' : ''), type: 'button', disabled: !a.done && !rqReady(d),
    onclick: () => { if (a.done) { mxOpen('intake', a.done); return; } say('user', 'Submit the request'); paintThread(); rqSubmit(a); } },
    a.done ? h('span', { class: 'rqa-submit-ic', html: RQ_IC('<path d="m5.5 12.5 4 4 9-9.5"/>', 13) }) : null,
    a.done ? `Open ${a.done}` : 'Submit Request');
  if (!d.type) {
    return { body: h('div', { class: 'rqart' }, h('div', { class: 'rqb-empty' },
      h('div', { class: 'rqb-ghost' }, h('i', { class: 'w60' }), h('i', { class: 'w90' }), h('i', { class: 'w75' }), h('i', { class: 'w40' }), h('i', { class: 'w85' }), h('i', { class: 'w55' })),
      h('b', {}, 'Your request takes shape here'),
      h('p', {}, 'As you talk, the details fill in: who it is with, the deal, the dates, and what legal still needs.'))), extras: [submit] };
  }
  const tpl = mxTemplateFor({ type: d.type, title: d.title || '', detail: d.paper === 'theirs' ? 'their paper' : (d.ndaKind || '').includes('One-way') ? 'one-way' : '', counterparty: d.counterparty });
  const due = d.due && d.dueSaid ? rqFmt(d.due) : null;
  const summary = `${first} needs ${RQB_WHAT[d.type] || 'help'}${d.co ? ' with ' + d.co.legal : d.counterparty ? ' with ' + d.counterparty : ''}${d.purpose ? ', for ' + d.purpose.replace(/^\w/, c => c.toLowerCase()) : ''}${d.deal ? ', as part of the ' + d.deal + ' deal' : ''}${due ? `, by ${due}` : ''}.`;
  const needDoc = !a.done && rqNeedsDoc(d);
  const sec = (title, ...rows) => h('section', { class: 'rqv' }, h('h3', { class: 'rqv-h' }, title), h('div', { class: 'rqv-rows' }, ...rows.filter(Boolean)));
  /* a fresh mark for each row: one node can only stand in one place */
  const hasReg = d.co && d.co.reg !== 'You', hasSf = !!d.dealInfo?.stage;
  const reg = () => hasReg ? SRC_MARK.reg(d.co) : null, sf = () => hasSf ? SRC_MARK.sf() : null;
  const body = h('div', { class: 'rqart' }, h('article', { class: 'rqb-page' },
    a.done && a.self ? h('div', { class: 'rqa-status' }, h('span', { class: 'rqa-status-dot' }), `${a.done} · out for signature · resolved by Clavia`)
    : a.done ? h('div', { class: 'rqa-status' }, h('span', { class: 'rqa-status-dot' }), `Submitted as ${a.done} · with legal`)
      : h('div', { class: 'rqa-status is-draft' }, h('span', { class: 'rqa-status-dot' }), 'Draft · not sent to legal yet'),
    h('h2', { class: 'rqb-title' }, d.title || 'New request'),
    h('p', { class: 'rqb-sum' }, summary),
    sec('Request',
      row('Type', d.type),
      row('Needed by', due),
      row('Priority', d.urgent ? 'Urgent' : 'Normal'),
      d.type === 'NDA' ? row('Kind', d.ndaKind || null) : null,
      d.type === 'NDA' ? row('Purpose', d.purpose || null) : null,
      ['NDA', 'Drafting'].includes(d.type) ? row('Starts from', d.paper === 'theirs' ? `${d.counterparty || 'Their'}’s paper` : d.paper === 'ours' ? (tpl ? `Our ${tpl.name} template` : 'Our template') : null) : null,
      d.files?.length ? row('Documents', h('span', { class: 'rqb-files rqb-files--v' }, ...d.files.map(f => h('span', { class: 'rqb-file' }, mxTile('file', mxExt(f)), f))))
        : d.paper === 'ours' || d.type === 'Advice' || (['NDA', 'Drafting', 'Termination'].includes(d.type) && d.paper !== 'theirs') ? null : row('Documents', null)),
    d.type !== 'Advice' ? sec('Counterparty',
      row('Name', d.co?.legal || d.counterparty || null, reg()),
      d.co?.kind ? row('Company type', d.co.kind, reg()) : null,
      d.co?.no ? row('Company no.', d.co.no.replace(/^(Company no\.|File no\.|Licence no\.|NIPC)\s*/i, ''), reg()) : null,
      d.co?.addr ? row('Registered office', d.co.addr, reg()) : null,
      d.contact ? row('Contact', h('span', { class: 'rqv-who' }, mxFace(d.contact.name, 'pb-av rqv-av'), h('span', { class: 'rqv-main' }, d.contact.name)), SRC_MARK.sf()) : null) : null,
    d.deal || (d.counterparty && d.type !== 'Advice' && !d.noDeal) ? sec('Deal',
      row('Deal', d.deal || null, sf()),
      d.dealInfo?.value && d.dealInfo.value !== '—' ? row('Value', d.dealInfo.value, sf()) : null,
      d.dealInfo?.stage ? row('Stage', d.dealInfo.stage, sf()) : null,
      d.dealInfo?.close ? row('Expected close', d.dealInfo.close, sf()) : null,
      d.dealInfo?.owner ? row('Owner', h('span', { class: 'rqv-who' }, mxFace(d.dealInfo.owner, 'pb-av rqv-av'), d.dealInfo.owner), sf()) : null) : null,
    needDoc ? h('section', { class: 'rqb-need' }, h('span', { class: 'rqb-need-ic', html: RQ_IC('<path d="M20.5 11.5 12.6 19.4a5 5 0 0 1-7.1-7.1l8-8a3.3 3.3 0 0 1 4.7 4.7l-8 8a1.7 1.7 0 0 1-2.4-2.4l7.3-7.3"/>', 15) }),
      h('span', { class: 'rqb-need-t' }, h('b', {}, `Attach ${d.counterparty ? d.counterparty + '’s' : 'their'} draft`), h('span', {}, 'The one thing legal needs before you can submit. Everything else is optional.')),
      h('button', { class: 'rqb-chip', type: 'button', onclick: () => rqPickFiles(a) }, 'Attach a File')) : null,
));
  return { body, extras: [submit] };
}

/* ── registering the kind ── */
RENDER.request = rqRender;
KIND_ICON.request = '<rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.6" fill="#FCFCFB" stroke="#D8D3CC" stroke-width="1"/>'
  + '<path d="M3.6 13.2h4.6l1.2 2.2h5.2l1.2-2.2h4.6" fill="none" stroke="#C9C3B9" stroke-width="1"/>';
KIND_LABEL.request = 'Request';
KIND_SHORT.request = 'REQUEST';
NOUN.request = 'request';

/* ── starting one: a chat with the request beside it ── */
function rqStartChat() {
  const a = rqArtifact();
  openSession({
    id: 'rq-ses-' + a.id, label: 'New request', artifact: a.id,
    people: [{ name: USER.name, online: true, owner: true }],
    messages: [{ role: 'bot', steps: [], cites: null, artifact: null,
      answer: 'Tell me what you need from legal, in your own words. I will look up the counterparty and the deal, ask for anything that is missing, and build the request beside this chat before anything is sent.',
      suggest: RQB_STARTS.slice(0, 3) }],
  });
  setTimeout(() => openArtifact(a), 80);
}

/* a finished one, to show the whole journey at once: the conversation, the
   request it built, and the request itself already in Requests */
function rqDemo() {
  const data = mxData();
  const co = rqbCompany('Northwind Ltd'), deal = rqbDeal(co.key), contact = rqbContact(co.key);
  const fri = new Date(); fri.setDate(fri.getDate() + (((5 - fri.getDay()) + 7) % 7 || 7)); fri.setHours(17, 0, 0, 0);
  const ask = 'We are starting partnership talks with Northwind next week and need an NDA in place before we share the product roadmap. Jamie Cole runs business development on their side.';
  const d = { type: 'NDA', counterparty: co.key, co, deal: deal.name, dealInfo: deal, contact, team: 'Partnerships', urgent: false,
    due: fri.toISOString(), dueSaid: true, ndaKind: 'Mutual', purpose: 'Sharing the product roadmap during partnership talks', paper: 'ours',
    title: 'Northwind Ltd — Mutual NDA', files: [], said: [ask], asked: { ndaKind: true, paper: true, due: true } };
  let r = data.rqbDemo && mxIntake().find(x => x.id === data.rqbDemo);
  if (!r) { r = rqbCreate(d, ask); data.rqbDemo = r.id; save(); }
  const a = rqArtifact(d); a.done = r.id;
  const friSay = fri.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const look = rqLookups({ counterparty: 'Northwind' });
  openSession({
    id: 'rq-ses-' + a.id, label: 'Northwind Ltd — Mutual NDA', meta: 'now', artifact: a.id,
    people: [{ name: USER.name, online: true, owner: true }],
    messages: [
      { role: 'user', text: ask },
      { role: 'bot', cites: null, artifact: a.id,
        steps: [{ source: 'request', query: 'what you need from legal', count: 'NDA' }, ...look],
        answer: `Got it: an NDA with ${co.legal}. I filled in their registered details from ${co.regSay}, the deal from Salesforce and ${contact.name} as their contact. Will both sides share confidential information, or only one?` },
      { role: 'user', text: 'Both sides (mutual)' },
      { role: 'bot', steps: [], cites: null, artifact: null, answer: 'Mutual it is. Should legal start from our template, or are we working on their paper?' },
      { role: 'user', text: 'Our template' },
      { role: 'bot', steps: [], cites: null, artifact: null, answer: 'I will use our **Mutual NDA** template, with the purpose set to sharing the product roadmap during partnership talks. When do you need it signed by?' },
      { role: 'user', text: 'Before the kickoff on Monday, so Friday at the latest.' },
      { role: 'bot', steps: [], cites: null, artifact: null, answer: `${friSay} it is. That is everything legal needs. The request is beside this chat — change anything in it, then submit it when you are ready.` },
      { role: 'user', text: 'Submit the request' },
      { role: 'bot', cites: null, artifact: a.id, suggest: [`Open ${r.id}`],
        steps: [{ source: 'request', query: 'Created the request', count: r.id }],
        answer: `Submitted. **${r.id}** is with legal now, with a first draft from our Mutual NDA template attached. You can follow it in Requests, and anything legal asks will come back to you there.` },
    ],
  });
  setTimeout(() => openArtifact(a), 80);
}

/* the self-service journey, finished: a standard NDA asked for, filled in,
   checked and sent for signature without waiting for legal */
function rqSelfDemo() {
  const data = mxData();
  const co = rqbCompany('Fernhill Robotics Ltd'), deal = rqbDeal(co.key), contact = rqbContact(co.key);
  const ask = 'Fernhill Robotics want to see our analytics roadmap before a pilot. Can we get a mutual NDA in place this week? Owen Price is my contact there.';
  const d = { type: 'NDA', counterparty: co.key, co, deal: deal?.name || null, dealInfo: deal, contact, team: 'Partnerships', urgent: false,
    due: rqDay(3), dueSaid: true, ndaKind: 'Mutual', purpose: 'Sharing the analytics roadmap ahead of a pilot', paper: 'ours',
    title: 'Fernhill Robotics Ltd — Mutual NDA', files: [], said: [ask], asked: { ndaKind: true, paper: true, due: true } };
  let r = data.rqSelfDemo && mxIntake().find(x => x.id === data.rqSelfDemo);
  if (!r) { r = rqSelfMake(d); data.rqSelfDemo = r.id; save(); }
  const a = rqArtifact(d); a.done = r.id; a.self = true;
  const look = rqLookups({ counterparty: 'Fernhill' });
  openSession({
    id: 'rq-ses-' + a.id, label: d.title, meta: 'now', artifact: a.id,
    people: [{ name: USER.name, online: true, owner: true }],
    messages: [
      { role: 'user', text: ask },
      { role: 'bot', cites: null, artifact: a.id,
        steps: [{ source: 'request', query: 'what you need from legal', count: 'NDA' }, ...look],
        answer: `Got it: an NDA with ${co.legal}. I filled in their registered details from ${co.regSay}, the deal from Salesforce and ${contact.name} as their contact. Should it start from our template, or are we working on their paper?` },
      { role: 'user', text: 'Our template' },
      { role: 'bot', steps: [], cites: null, artifact: null, answer: rqSelfSay(d) },
      { role: 'user', text: 'Send for signature' },
      { role: 'bot', cites: null, artifact: a.id, suggest: [`Open ${r.id}`],
        steps: [
          { source: 'doc', query: 'Filled in the Mutual NDA template', count: 'no blanks' },
          { source: 'playbook', query: 'Checked it against the NDA playbook', count: 'standard' },
          { source: 'request', query: `Sent it for signature to ${contact.name} and you`, count: '2 signers' }],
        answer: rqSelfDone(r, contact.name) },
    ],
  });
  setTimeout(() => openArtifact(a), 80);
}
