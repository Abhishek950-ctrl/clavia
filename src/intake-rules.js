/* ── Intake routing rules (INTAKE_FX.rules) ───────────────────────
   Legal ops writes down, once, who takes which kind of work and how far
   Clavia goes on its own: "when a contract review on a deal over £250k
   comes in, Grace has it, Clavia does the first pass, due in 3 days".
   The first rule that fits a request decides; the rest are not read.
   Each rule says three things: who has it, who does the work (Clavia
   end to end, Clavia first then a lawyer, or a lawyer), and how long
   legal has. Activity names the rule that was used, in words, so a
   lawyer can see why a request landed on them. */

const MX_RULE_FIELDS = {
  type:     { label: 'Type',       say: (v) => `type is ${v.join(' or ')}`, options: () => MX_RQ_TYPES },
  team:     { label: 'From',       say: (v) => `from ${v.join(' or ')}`, options: () => ['Sales', 'Partnerships', 'Procurement', 'Marketing', 'Finance', 'People', 'Product'] },
  paper:    { label: 'Paper',      say: (v) => `on ${v[0] === 'theirs' ? 'their' : 'our'} paper`, options: () => ['ours', 'theirs'], name: (v) => v === 'ours' ? 'Our paper' : 'Their paper', one: true },
  value:    { label: 'Deal value', say: (v) => `the deal is over £${Number(v[0]).toLocaleString('en-GB')}`, options: () => ['100000', '250000', '500000', '1000000'], name: (v) => `Over £${Number(v).toLocaleString('en-GB')}`, one: true },
  source:   { label: 'Came in through', say: (v) => `it came in through ${v.join(' or ')}`, options: () => ['Slack', 'Teams', 'Email', 'Jira', 'ServiceNow', 'Salesforce', 'Manual'] },
  where:    { label: 'Channel or mailbox', say: (v) => `it was asked in ${v.join(' or ')}`, text: true },
  mentions: { label: 'Mentions',   say: (v) => `it mentions ${v.map(x => `“${x}”`).join(' or ')}`, text: true },
};
const MX_RULE_HANDLING = {
  clavia: { label: 'Clavia, end to end', say: 'Clavia handles it end to end', sub: 'Clavia drafts and sends. A lawyer sees it only if the other side changes something.' },
  first:  { label: 'Clavia first, then a lawyer', say: 'Clavia does the first pass, then a lawyer reviews', sub: 'Clavia drafts or reviews against the playbook. Nothing goes out until the lawyer has looked.' },
  lawyer: { label: 'A lawyer', say: 'A lawyer handles it', sub: 'It goes straight to whoever it is assigned to.' },
};
const MX_RULES_SEED = [
  { id: 'nda-ours', name: 'NDAs on our paper', on: true, when: [['type', ['NDA']], ['paper', ['ours']]], assign: null, handle: 'clavia', dueIn: 2 },
  { id: 'large', name: 'Large deals', on: true, when: [['type', ['Contract review', 'Privacy']], ['value', ['250000']]], assign: 'Grace Coleman', handle: 'first', dueIn: 3 },
  { id: 'privacy', name: 'Privacy', on: true, when: [['type', ['Privacy']]], assign: 'Aisha Rahman', handle: 'first', dueIn: 3 },
  { id: 'orders', name: 'Order forms', on: true, when: [['type', ['Drafting']], ['mentions', ['order form']]], assign: 'Matt Rivera', handle: 'first', dueIn: 2 },
  { id: 'marketing', name: 'Marketing questions', on: true, when: [['team', ['Marketing']]], assign: 'Matt Rivera', handle: 'lawyer', dueIn: 4 },
  { id: 'people', name: 'Employment', on: false, when: [['mentions', ['contractor', 'employment', 'hire']]], assign: 'James Whitfield', handle: 'lawyer', dueIn: 5 },
];

function mxRules() {
  const d = mxData();
  if (!d.rules) { d.rules = structuredClone(MX_RULES_SEED); save(); }
  /* two rules that route on the channel a request came in through (14 Oct) */
  if (d.rulesChanV !== 1) { const at = d.rules.findIndex(x => x.id === 'marketing');
    d.rules.splice(at < 0 ? d.rules.length : at, 0,
      { id: 'privacy-chan', name: 'Privacy channel', on: true, when: [['source', ['Slack']], ['where', ['#ask-legal-privacy']]], assign: 'Aisha Rahman', handle: 'first', dueIn: 3 },
      { id: 'deal-desk', name: 'Deal desk', on: true, when: [['source', ['Salesforce']], ['type', ['Drafting']]], assign: 'Matt Rivera', handle: 'first', dueIn: 2 });
    d.rulesChanV = 1; save(); }
  return d.rules;
}
const mxRuleWhen = (rule) => { const t = rule.when.map(([f, v]) => MX_RULE_FIELDS[f].say(v)).join(' and ') || 'every request'; return t[0].toUpperCase() + t.slice(1); };
const mxRuleThen = (rule) => [rule.assign ? `${rule.assign} has it` : null, MX_RULE_HANDLING[rule.handle].say, `due in ${mxPlural(rule.dueIn, 'working day')}`].filter(Boolean).join(' · ');

/* what a request looks like to a rule */
function mxRuleFacts(r) {
  const deal = MX_DEALS[r.deal]?.value || r.dealInfo?.value || '';
  return {
    type: r.type, team: r.team,
    paper: r.paper || (r.startsFrom || /(’|')s? paper|their paper/i.test(r.title || '') ? 'theirs' : 'ours'),
    value: +String(deal).replace(/[^0-9]/g, '') || 0,
    text: [r.title, r.detail].join(' ').toLowerCase(),
    source: { slack: 'Slack', teams: 'Teams', outlook: 'Email', gmail: 'Email', jira: 'Jira', servicenow: 'ServiceNow', salesforce: 'Salesforce' }[r.source] || 'Manual',
    where: (r.where || (r.source === 'outlook' || r.source === 'gmail' ? 'legal@lumen.io' : r.source === 'teams' ? 'Legal › Ask Legal' : '')).toLowerCase(),
  };
}
function mxRuleFits(rule, r) {
  const x = mxRuleFacts(r);
  return rule.when.every(([f, v]) => f === 'value' ? x.value > +v[0]
    : f === 'mentions' ? v.some(w => x.text.includes(String(w).toLowerCase()))
    : f === 'where' ? v.some(w => x.where && x.where === String(w).toLowerCase())
    : v.includes(x[f]));
}
/* the first rule that is on and fits */
function mxRuleFor(r) {
  if (!INTAKE_FX.rules) return null;
  return mxRules().find(rule => rule.on && mxRuleFits(rule, r)) || null;
}
/* the NDA self-serve flow asks the rules whether Clavia may finish an NDA on its own */
function mxRuleLetsClaviaFinish(facts) {
  if (!INTAKE_FX.rules) return true;
  const rule = mxRuleFor({ title: '', detail: '', ...facts });
  return !rule || rule.handle === 'clavia';
}

/* a new request meets the rules once, as it arrives */
function mxApplyRules(r) {
  const rule = mxRuleFor(r);
  if (!rule) return;
  mxIntake();                                    // its story so far is written before the rule adds to it
  const due = new Date(); let n = rule.dueIn;
  while (n > 0) { due.setDate(due.getDate() + 1); if (due.getDay() % 6) n--; }
  due.setHours(17, 0, 0, 0);
  r.due = due.toISOString(); r.handling = rule.handle; r.ruleId = rule.id;
  if (rule.assign) r.attorney = rule.assign;
  mxLog(r, { who: 'Clavia', ev: 'clavia', what: rule.assign ? `assigned this to ${rule.assign} using the “${rule.name}” rule` : `took this on using the “${rule.name}” rule`,
    rule: `${mxRuleWhen(rule)} → ${mxRuleThen(rule)}` });
}

/* the seeded requests that a rule placed say so in their history */
function mxRulesSeedStory(list) {
  for (const r of list) {
    if (!r.attorney || !r.activity) continue;
    const rule = mxRules().find(x => x.on && x.assign === r.attorney && mxRuleFits(x, r));
    const had = r.activity.find(a => a.rule && a.who === 'Clavia');
    if (had && rule) { had.rule = `${mxRuleWhen(rule)} → ${mxRuleThen(rule)}`; continue; }
    const i = r.activity.findIndex(a => a.who === 'Roger Bennett' && /^assigned this to /.test(a.what || ''));
    if (!rule || i < 0) continue;
    const at = new Date(new Date(r.created).getTime() + 0.04 * 36e5).toISOString();
    r.activity[i] = { who: 'Clavia', ev: 'clavia', what: `assigned this to ${r.attorney} using the “${rule.name}” rule`,
      rule: `${mxRuleWhen(rule)} → ${mxRuleThen(rule)}`, when: at };
    r.handling = rule.handle; r.ruleId = rule.id;
    r.activity.sort((x, y) => (x.when < y.when ? -1 : 1));
  }
}

/* ── the table of rules, with its New Rule button; it sits in Settings › Routing rules ── */
function mxRulesTable() {
  const rules = mxRules();
  const st = MX.intake.rulesList ||= { tab: 'all', find: '', sort: { key: 'n', dir: 1 } };
  const sw = (rule) => h('button', { class: 'arep-sw mx-rule-sw', type: 'button', role: 'switch', 'aria-checked': String(rule.on),
    'aria-label': rule.on ? `Turn off ${rule.name}` : `Turn on ${rule.name}`, 'data-tip': rule.on ? 'On' : 'Off',
    onclick: (e) => { e.stopPropagation(); rule.on = !rule.on; save(); t.paint();
      pbToast(`${rule.name} is ${rule.on ? 'on' : 'off'}`, { label: 'Undo', run: () => { rule.on = !rule.on; save(); t.paint(); } }); } },
    h('span', { class: 'arep-knob', 'aria-hidden': 'true' }));
  const move = (rule, by) => { const i = rules.indexOf(rule), j = i + by; if (j < 0 || j >= rules.length) return;
    rules.splice(i, 1); rules.splice(j, 0, rule); save(); t.paint(); };
  const t = mxTable({
    label: 'Routing rules', st, allLabel: 'Rules', empty: 'No rules yet. Every request waits in Unassigned until someone picks it up.',
    grid: '34px minmax(120px, 1fr) minmax(200px, 2.2fr) minmax(140px, 1fr) minmax(170px, 1fr) minmax(64px, 1fr) 44px 28px',
    cols: [{ key: 'n', label: '#' }, { key: 'name', label: 'Rule' }, { key: 'when', label: 'When' }, { key: 'assign', label: 'Assign to' },
      { key: 'handle', label: 'Handled by' }, { key: 'due', label: 'Due in' }, { key: 'on', label: 'On' }],
    tabs: [], tabOf: () => 'all',
    items: () => rules,
    text: (x) => [x.name, mxRuleWhen(x), x.assign, MX_RULE_HANDLING[x.handle].label].join(' '),
    val: (x, k) => k === 'n' ? rules.indexOf(x) : k === 'due' ? x.dueIn : k === 'on' ? (x.on ? 0 : 1) : k === 'when' ? mxRuleWhen(x) : k === 'handle' ? x.handle : (x[k] || '~').toLowerCase(),
    cells: (x) => [
      h('span', { class: 'mx-req-id' }, String(rules.indexOf(x) + 1)),
      h('span', { class: 'pb-row-name' + (x.on ? '' : ' is-off') }, x.name),
      h('span', { class: 'mx-rule-when' }, mxRuleWhen(x)),
      x.assign ? h('span', { class: 'mx-rule-who' }, mxFace(x.assign), h('span', { class: 'pb-owner-n' }, x.assign)) : h('span', { class: 'mx-none' }, 'No one'),
      h('span', { class: 'mx-rule-h' }, x.handle !== 'lawyer' ? quillEl('static', { cls: 'mx-rule-q' }) : null, MX_RULE_HANDLING[x.handle].label),
      mxPlural(x.dueIn, 'day'),
      sw(x)],
    open: (x) => mxRuleDialog(x, () => t.paint()),
    menu: (x) => [
      { label: 'Edit', icon: 'rename', run: () => mxRuleDialog(x, () => t.paint()) },
      rules.indexOf(x) > 0 ? { label: 'Move up', run: () => move(x, -1) } : null,
      rules.indexOf(x) < rules.length - 1 ? { label: 'Move down', run: () => move(x, 1) } : null,
      { rule: true },
      { label: 'Delete', icon: 'trash', danger: true, run: () => { const i = rules.indexOf(x); rules.splice(i, 1); save(); t.paint();
        pbToast(`${x.name} deleted`, { label: 'Undo', run: () => { rules.splice(i, 0, x); save(); t.paint(); } }); } },
    ],
  });
  t.el.classList.add('mx-rules');
  return { table: t.el, cta: mxCta('New Rule', () => mxRuleDialog(null, () => t.paint())) };
}
/* the old address, #intake/rules, opens them in Settings */
function mxRulesPage() { MX.intake.open = null; setTimeout(() => stGo('rules'), 0); return h('div', {}); }

/* ── one rule, written or changed ── */
function mxRuleDialog(rule, done) {
  const isNew = !rule;
  const f = rule ? structuredClone(rule) : { id: 'r' + Date.now().toString(36), name: '', on: true, when: [['type', []]], assign: null, handle: 'first', dueIn: 3 };
  const dim = h('div', { class: 'pb-dim mx-rqf-dim', onclick: (e) => { if (e.target === dim) close(); } });
  const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('.menu, .mx-ap')) { e.stopPropagation(); close(); } };
  const close = () => { removeEventListener('keydown', onKey, true); dim.classList.add('is-closing'); setTimeout(() => dim.remove(), 150); };
  const CHEV = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>';
  const X = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>';
  const field = (label, control) => h('div', { class: 'mx-rqf-f' }, h('span', { class: 'mx-rqf-l' }, label), control);
  const pick = (text, run, empty) => h('button', { class: 'mx-rule-pick' + (empty ? ' is-empty' : ''), type: 'button', onclick: (e) => { e.stopPropagation(); run(e.currentTarget); } },
    h('span', { class: 'mx-rule-pick-t' }, text), h('span', { class: 'mx-rule-pick-c', html: CHEV }));

  const name = h('input', { class: 'mx-rqf-in', type: 'text', placeholder: 'e.g. Supplier contracts', value: f.name, oninput: (e) => { f.name = e.target.value; sync(); } });
  const conds = h('div', { class: 'mx-rule-conds' });
  const paintConds = () => {
    conds.replaceChildren(...f.when.map((c, i) => {
      const [k, v] = c, F = MX_RULE_FIELDS[k];
      const fieldBtn = pick(F.label, (a) => menu(a, Object.entries(MX_RULE_FIELDS).map(([kk, FF]) => ({ label: FF.label, tick: kk === k,
        run: () => { if (kk !== k) { f.when[i] = [kk, []]; paintConds(); sync(); } } }))));
      const valueEl = F.text
        ? h('input', { class: 'mx-rqf-in mx-rule-text', type: 'text', placeholder: 'Words, separated by commas', value: v.join(', '),
            oninput: (e) => { c[1] = e.target.value.split(',').map(s => s.trim()).filter(Boolean); sync(); } })
        : pick(v.length ? v.map(x => F.name ? F.name(x) : x).join(' or ') : 'Choose…', (a) => menu(a, F.options().map(o => ({ label: F.name ? F.name(o) : o, tick: v.includes(o),
            run: () => { c[1] = F.one ? [o] : v.includes(o) ? v.filter(x => x !== o) : [...v, o]; paintConds(); sync(); } }))), !v.length);
      return h('div', { class: 'mx-rule-cond' }, h('span', { class: 'mx-rule-and' }, i ? 'and' : 'When'), fieldBtn, valueEl,
        h('button', { class: 'mx-rqf-file-x', type: 'button', 'aria-label': 'Remove this condition', 'data-tip': 'Remove', html: X,
          onclick: () => { f.when.splice(i, 1); paintConds(); sync(); } }));
    }), h('button', { class: 'mx-rule-add', type: 'button', onclick: () => { const free = Object.keys(MX_RULE_FIELDS).find(k => !f.when.some(c => c[0] === k)) || 'mentions';
      f.when.push([free, []]); paintConds(); sync(); } }, f.when.length ? 'Add a condition' : 'Add a condition (with none, every request fits)'));
  };
  const who = h('span', {});
  const paintWho = () => who.replaceChildren(pick(f.assign ? h('span', { class: 'mx-rule-who' }, mxFace(f.assign), f.assign) : 'No one: leave it in Unassigned',
    (a) => mxPersonPicker(a, [{ name: 'No one', role: 'Leave it in Unassigned' }, ...MX_LEGAL], (p) => { f.assign = p.name === 'No one' ? null : p.name; paintWho(); sync(); }), !f.assign));
  const how = h('div', { class: 'mx-rule-how', role: 'radiogroup', 'aria-label': 'Handled by' });
  const paintHow = () => how.replaceChildren(...Object.entries(MX_RULE_HANDLING).map(([k, x]) =>
    h('button', { class: 'mx-rule-opt' + (f.handle === k ? ' is-on' : ''), type: 'button', role: 'radio', 'aria-checked': String(f.handle === k),
      onclick: () => { f.handle = k; paintHow(); sync(); } },
      h('span', { class: 'mx-rule-radio' }), h('span', { class: 'mx-rqf-pick-t' }, h('span', { class: 'mx-rqf-pick-n' }, x.label), h('span', { class: 'mx-rqf-pick-s' }, x.sub)))));
  const due = h('span', {});
  const paintDue = () => due.replaceChildren(pick(`${mxPlural(f.dueIn, 'working day')}`, (a) => menu(a, [1, 2, 3, 5, 10].map(n => ({ label: mxPlural(n, 'working day'), tick: n === f.dueIn,
    run: () => { f.dueIn = n; paintDue(); } })))));

  const ok = h('button', { class: 'pb-btn pb-btn--primary', type: 'button', onclick: () => {
    f.when = f.when.filter(c => c[1].length);
    const rules = mxRules();
    if (isNew) rules.push(f); else Object.assign(rule, f);
    save(); close(); done?.();
    pbToast(isNew ? `${f.name} added` : `${f.name} saved`);
  } }, isNew ? 'Add Rule' : 'Save');
  const sync = () => { ok.disabled = !f.name.trim() || f.when.some(c => !c[1].length); };
  paintConds(); paintWho(); paintHow(); paintDue(); sync();

  dim.append(h('div', { class: 'pb-dlg mx-rqf mx-rule-dlg', role: 'dialog', 'aria-label': isNew ? 'New rule' : rule.name },
    h('header', { class: 'mx-rqf-head' }, h('h2', { class: 'pb-dlg-t' }, isNew ? 'New Rule' : 'Edit Rule'),
      h('button', { class: 'pbv-icon mx-rqf-x', type: 'button', 'aria-label': 'Close', onclick: close, html: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' })),
    h('div', { class: 'mx-rqf-body' },
      field('Name', name),
      field('Requests it applies to', conds),
      field('Assign to', who),
      field('Handled by', how),
      field('Due in', due)),
    h('footer', { class: 'mx-rqf-foot' }, h('button', { class: 'pb-btn', type: 'button', onclick: close }, 'Cancel'), ok)));
  document.body.append(dim); addEventListener('keydown', onKey, true);
  requestAnimationFrame(() => (isNew ? name : ok).focus());
}
