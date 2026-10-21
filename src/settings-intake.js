/* ── Settings › Intake, General, Members ─────────────────────────
   Channels is the whole journey of an ask, end to end, in the order it
   happens: where people ask, then the five things Clavia does with it
   (acknowledge, make it a request, ask for what's missing, route, keep
   them updated). Request details is what each type needs before it can
   be routed. Routing rules decide who has it and how far Clavia goes. */

const ST_INTAKE_DEFAULT = {
  ack: true, ackText: 'Thanks {first}. This is {id}, with legal now. You can follow it here: {link}',
  split: true, ignore: true, ask: true,
  updates: { picked: true, waiting: true, done: true },
  who: 'Anyone at Lumen',
};
const ST_DETAILS_DEFAULT = {
  'NDA': ['Counterparty', 'Mutual or one-way', 'Who signs for them', 'What it’s for'],
  'Contract review': ['Their document', 'Counterparty', 'Deal value', 'When it’s needed'],
  'Drafting': ['Counterparty', 'The deal', 'What it’s for', 'When it’s needed'],
  'Advice': ['The question', 'When it’s needed'],
  'Termination': ['The contract', 'Why we’re ending it', 'Notice deadline'],
  'Privacy': ['Their DPA or questions', 'What personal data is involved', 'Counterparty'],
  'Signature': ['The final document', 'Who signs on each side'],
};
const ST_DETAIL_OPTIONS = ['Counterparty', 'Their document', 'The deal', 'Deal value', 'When it’s needed', 'What it’s for', 'Mutual or one-way', 'Who signs for them',
  'Who signs on each side', 'The question', 'The contract', 'Why we’re ending it', 'Notice deadline', 'Their DPA or questions', 'What personal data is involved', 'The final document', 'Budget holder'];

const stIntakeCfg = () => { const d = mxData(); d.intakeCfg ||= structuredClone(ST_INTAKE_DEFAULT); return d.intakeCfg; };
const stDetails = () => { const d = mxData(); d.rqDetails ||= structuredClone(ST_DETAILS_DEFAULT); return d.rqDetails; };

const stToggle = (on, label, sub, set) => h('label', { class: 'sx-tg' },
  h('button', { class: 'arep-sw', type: 'button', role: 'switch', 'aria-checked': String(on), 'aria-label': label,
    onclick: (e) => { const v = e.currentTarget.getAttribute('aria-checked') !== 'true'; e.currentTarget.setAttribute('aria-checked', String(v)); set(v); save(); } },
    h('span', { class: 'arep-knob', 'aria-hidden': 'true' })),
  h('span', { class: 'sx-tg-m' }, h('span', { class: 'sx-tg-t' }, label), sub ? h('span', { class: 'sx-tg-s' }, sub) : null));

/* ── Channels: where people ask, and what happens next ── */
function stChannelsPage() {
  const cfg = stIntakeCfg();
  const asks = ST_CONNECTORS.filter(c => c.group === 'asks');
  const count = (c) => mxIntake().filter(r => r.source === c.id).length;
  const rules = typeof mxRules === 'function' ? mxRules().filter(x => x.on).length : 0;
  const step = (n, title, line, ...body) => h('li', { class: 'sx-flowstep' }, h('span', { class: 'sx-flowstep-n' }, String(n)),
    h('div', { class: 'sx-flowstep-m' }, h('h4', {}, title), line ? h('p', { class: 'sx-flowstep-s' }, line) : null, ...body));
  const ack = h('textarea', { class: 'mx-rqf-in sx-ta', rows: '2', oninput: (e) => { cfg.ackText = e.target.value; save(); paintAck(); } }); ack.value = cfg.ackText;
  const ackPv = h('div', { class: 'sx-ackpv' });
  const paintAck = () => ackPv.replaceChildren(h('span', { class: 'sx-pv-q' }, quillEl('static', { cls: 'sx-pv-qi' })),
    h('span', {}, cfg.ackText.replace('{first}', 'Priya').replace('{id}', 'RQ-1039').replace('{link}', 'clavia.app/r/RQ-1039')));
  paintAck();

  return h('div', { class: 'sx-page' },
    stHead('Channels', 'Where the business asks legal, and what Clavia does with every ask, whichever channel it came in on.'),
    h('section', { class: 'sx-sec is-first' }, h('h3', { class: 'sx-sec-t' }, 'Where people ask'),
      h('div', { class: 'sx-list' }, ...asks.map(c => { const x = stConn(c.id), n = count(c);
        return h('button', { class: 'sx-row', type: 'button', onclick: () => stGo('connectors/' + c.id) }, stMark(c),
          h('span', { class: 'sx-row-m' }, h('span', { class: 'sx-row-n' }, c.name),
            h('span', { class: 'sx-row-s' }, x.st === 'on' && x.see?.length ? x.see.join(' · ') : x.st === 'on' ? 'Connected' : c.tagline)),
          h('span', { class: 'sx-row-u' }, n ? `${mxPlural(n, 'open request')}` : ''),
          h('span', { class: 'sx-row-r' }, stState(c) || h('span', { class: 'sx-row-go' }, 'Set up')));
      })),
      h('p', { class: 'sx-flow-s' }, 'People who ask don’t need a Clavia seat. They can also follow their request at the link Clavia sends them.')),
    h('section', { class: 'sx-sec' }, h('h3', { class: 'sx-sec-t' }, 'What happens when someone asks'),
      h('ol', { class: 'sx-flowsteps' },
        step(1, 'Clavia acknowledges it', 'In the same thread or email, within a minute.',
          stToggle(cfg.ack, 'Reply with a link to follow the request', null, (v) => { cfg.ack = v; }), ack, ackPv,
          h('p', { class: 'sx-flowstep-s is-hint' }, 'Use {first}, {id} and {link}.')),
        step(2, 'It becomes a request', 'Clavia reads the message and its attachments and fills in the type, counterparty, deal and due date.',
          stToggle(cfg.split, 'Split an ask for several things into several requests', 'Each one linked to the others, like RQ-1050 and RQ-1051.', (v) => { cfg.split = v; }),
          stToggle(cfg.ignore, 'Ignore what isn’t an ask', 'Out-of-office replies, newsletters and thank-yous don’t become requests.', (v) => { cfg.ignore = v; })),
        step(3, 'Clavia asks for what’s missing', 'In the same thread, one short question at a time, before anyone in legal picks it up.',
          stToggle(cfg.ask, 'Ask the requester for missing details', null, (v) => { cfg.ask = v; }),
          h('button', { class: 'sx-link', type: 'button', onclick: () => stGo('details') }, 'What each type needs →')),
        step(4, 'It’s routed', 'The first routing rule that fits decides who has it, how far Clavia goes on its own, and when it’s due. No rule fits: it waits in Unassigned with Clavia’s suggestion.',
          h('button', { class: 'sx-link', type: 'button', onclick: () => stGo('rules') }, `${mxPlural(rules, 'routing rule')} on →`)),
        step(5, 'The requester hears back where they asked', 'Updates go to the thread or email the ask came from. Internal notes never do.',
          ...[['picked', 'When someone in legal picks it up'], ['waiting', 'When legal is waiting on them'], ['done', 'When it’s done, with the outcome']]
            .map(([k, l]) => stToggle(cfg.updates[k], l, null, (v) => { cfg.updates[k] = v; }))))),
    h('section', { class: 'sx-sec' }, h('h3', { class: 'sx-sec-t' }, 'Who can ask'),
      h('div', { class: 'sx-who' }, ...['Anyone at Lumen', 'Only people in chosen groups'].map(k => h('button', { class: 'sx-who-o' + (cfg.who === k ? ' is-on' : ''), type: 'button',
        onclick: () => { cfg.who = k; save(); go('settings'); } }, h('span', { class: 'mx-rule-radio' }),
        h('span', {}, h('b', {}, k), h('span', {}, k === 'Anyone at Lumen' ? 'Anyone with a lumen.io address, in any connected channel.' : 'Asks from anyone else get a polite reply saying who to go to.')))))));
}

/* ── Request details: what each type needs before it's routed ── */
function stDetailsPage() {
  const det = stDetails();
  const list = h('div', { class: 'sx-list' });
  const paint = () => list.replaceChildren(...MX_RQ_TYPES.map(t => h('button', { class: 'sx-row is-plain', type: 'button', onclick: () => edit(t) },
    h('span', { class: 'sx-row-m' }, h('span', { class: 'sx-row-n' }, t), h('span', { class: 'sx-row-s' }, (det[t] || []).join(' · ') || 'Nothing: route it as it comes')),
    h('span', { class: 'sx-row-r' }, h('span', { class: 'sx-row-go' }, 'Edit')))));
  const edit = (t) => {
    const chosen = new Set(det[t] || []);
    const dim = h('div', { class: 'pb-dim mx-rqf-dim', onclick: (e) => { if (e.target === dim) close(); } });
    const close = () => { dim.classList.add('is-closing'); setTimeout(() => dim.remove(), 150); removeEventListener('keydown', onKey, true); };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    dim.append(h('div', { class: 'pb-dlg mx-rqf sx-det-dlg', role: 'dialog', 'aria-label': t },
      h('header', { class: 'mx-rqf-head' }, h('h2', { class: 'pb-dlg-t' }, t)),
      h('div', { class: 'mx-rqf-body' }, h('p', { class: 'sx-flow-s' }, `Clavia asks for any of these that the ask doesn’t say, before a ${t === 'NDA' ? 'NDA' : t.toLowerCase()} request is routed.`),
        h('div', { class: 'sx-det-grid' }, ...ST_DETAIL_OPTIONS.map(o => h('label', { class: 'sx-check' }, h('input', { type: 'checkbox', checked: chosen.has(o), onchange: (e) => { e.target.checked ? chosen.add(o) : chosen.delete(o); } }), h('span', {}, o))))),
      h('footer', { class: 'mx-rqf-foot' }, h('button', { class: 'pb-btn', type: 'button', onclick: close }, 'Cancel'),
        h('button', { class: 'pb-btn pb-btn--primary', type: 'button', onclick: () => { const was = det[t]; det[t] = ST_DETAIL_OPTIONS.filter(o => chosen.has(o)); save(); close(); paint();
          pbToast(`${t} saved`, { label: 'Undo', run: () => { det[t] = was; save(); paint(); } }); } }, 'Save'))));
    document.body.append(dim); addEventListener('keydown', onKey, true);
  };
  paint();
  return h('div', { class: 'sx-page' },
    stHead('Request details', 'What Clavia needs to know for each kind of request. If the ask doesn’t say, Clavia asks in the same thread before it’s routed.'),
    h('section', { class: 'sx-sec is-first' }, list,
      h('div', { class: 'sx-ex' }, h('div', { class: 'sx-pv-cap' }, 'For example, in Slack'),
        h('div', { class: 'sx-pv-msg' }, mxFace('Priya Shah', 'pb-av'), h('div', {}, h('b', {}, 'Priya Shah'), h('p', {}, 'Can legal do an NDA with Gulf Systems before the workshop?'))),
        h('div', { class: 'sx-pv-msg is-reply' }, h('span', { class: 'sx-pv-q' }, quillEl('static', { cls: 'sx-pv-qi' })),
          h('div', {}, h('b', {}, 'Clavia'), h('p', {}, 'On it, Priya. Two quick things so legal can start: should it be mutual or one-way, and who signs for Gulf Systems?'))))));
}

/* ── Routing rules, now in Settings ── */
function stRulesPage() {
  const { table, cta } = mxRulesTable();
  return h('div', { class: 'sx-page' },
    stHead('Routing rules', 'When a request comes in, from any channel, the first rule that fits decides who has it, how far Clavia goes on its own, and when it’s due.', cta),
    h('section', { class: 'sx-sec is-first' }, table));
}

/* ── Document approvals: who approves a new version before it goes out ──
   Each rule names when it applies and who approves. A version waits for
   everyone whose rule fits; until then it can't be emailed to the other
   side or sent for signature. Any change asks again. */
function stApprovalsPage() {
  const cfg = mxApCfg();
  const people = [...MX_LEGAL, ...MX_STAFF];
  const pick = (rule) => {
    const sel = h('select', { class: 'mx-rqf-in sx-ap-who', 'aria-label': `Who approves when ${rule.when.toLowerCase()}`, onchange: (e) => { rule.who = e.target.value; save(); } },
      h('option', { value: '@lawyer' }, 'The assigned lawyer'), ...people.map(p => h('option', { value: p.name }, `${p.name} · ${p.role.split(' · ')[0]}`)));
    sel.value = rule.who; return sel;
  };
  const list = h('div', { class: 'sx-ap-list' });
  const paint = () => list.replaceChildren(...cfg.rules.map(rule => h('div', { class: 'sx-ap-rule' + (rule.on && cfg.on ? '' : ' is-off') },
    stToggle(rule.on, rule.when, `${rule.role} approves`, (v) => { rule.on = v; paint(); }),
    h('span', { class: 'sx-ap-arrow', 'aria-hidden': 'true' }, '→'), pick(rule))));
  paint();
  const example = h('div', { class: 'sx-ap-eg' },
    h('b', {}, 'For example'), h('p', {}, 'Grace uploads v4 of the Brightwell MSA. Its payment terms are outside the playbook, so v4 waits for Grace (any change) and Roger (outside the playbook). Once both approve, v4 can be emailed to Brightwell or sent for signature. If Roger asks for changes, Grace edits it and it goes to both again.'));
  return h('div', { class: 'sx-page' },
    stHead('Document approvals', 'Before a new version of a document is emailed to the other side or sent for signature, the people these rules name approve it. They approve beside the document, and it shows under My Approvals in Intake.'),
    h('section', { class: 'sx-sec is-first' },
      stToggle(cfg.on, 'Ask for approval on new versions', 'Uploads, drafts from a template, and edits made in Clavia', (v) => { cfg.on = v; paint(); }),
      h('h3', { class: 'sx-ap-h' }, 'Who approves'), list, example));
}

/* ── Members ── */

/* ── General ── */
function stGeneralPage() {
  const d = mxData();
  d.ws ||= { name: 'Lumen Legal', company: 'Lumen Analytics Ltd', domain: 'lumen.io', mailbox: 'legal@lumen.io', tz: 'London (GMT+1)', days: 'Monday to Friday' };
  const f = (k, label, hint) => h('label', { class: 'sx-field' }, h('span', { class: 'sx-field-l' }, label),
    h('input', { class: 'mx-rqf-in sx-in', type: 'text', value: d.ws[k], oninput: (e) => { d.ws[k] = e.target.value; save(); } }), hint ? h('span', { class: 'sx-field-s' }, hint) : null);
  return h('div', { class: 'sx-page' }, stHead('General', null),
    h('section', { class: 'sx-sec is-first sx-fields' },
      f('name', 'Workspace name', 'Shown to requesters on their view of a request.'),
      f('company', 'Company', 'The legal entity on our paper.'),
      f('domain', 'Email domain', 'People with this domain can ask legal.'),
      f('mailbox', 'Legal mailbox', 'Where Clavia sends from when it replies by email.'),
      f('tz', 'Time zone', 'For due dates and reminders.'),
      f('days', 'Working days', 'Routing rules count due dates in working days.')));
}
