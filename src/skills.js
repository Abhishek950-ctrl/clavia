/* ==================================================================
   Skills
   How we do one piece of legal work, written down once so Clavia does it
   the same way every time: when to use it, what it needs from you, the
   steps in plain English, the playbooks and templates it follows, and
   what it hands back. One object, not a prompt library beside a workflow
   builder beside an agent store.

   The list is every skill the team keeps. A skill opens onto its page:
   the skill itself (edited in place, like a playbook), who ran it on
   what, and every published version with who changed what. Publishing
   is a deliberate act; editing a published skill leaves the published
   one running until you publish the changes.

   Run Skill is New Chat with the skill already in the box, and `/` finds
   it from any chat. Build with AI is the standard chat with the skill as
   its artifact — the same construct the request uses.

   Loaded after modules.js and before app.js, so everything here runs at
   call time.
================================================================== */

MX.skills = { open: null, list: { tab: 'all', find: '', sort: { key: 'updated', dir: -1 } } };

/* Seeded once into the shared saved copy, then that copy is the only one. */
function skAll() {
  const d = mxData();
  if (!d.skills || d.skillsV !== SK_SEED_V) {
    d.skills = structuredClone(SK_SEED);
    d.skillsV = SK_SEED_V;
    for (const s of d.skills) skSeedSnaps(s);
    save();
  }
  return d.skills;
}
const skFind = (id) => skAll().find(s => s.id === id) || null;
const skVer = (s) => s.versions?.[0]?.v || 0;
const skSnap = (s) => structuredClone({ name: s.name, about: s.about, asks: s.asks, steps: s.steps, uses: s.uses, output: s.output, access: s.access, area: s.area });

/* Every published version keeps what it said, so it can be restored. The
   NDA skill's history is real, step by step; elsewhere an older version
   is kept as the one after it. */
function skSeedSnaps(s) {
  const now = skSnap(s);
  s.versions.forEach((v, i) => { v.snap = structuredClone(now); });
  if (s.id === 'sk-nda') {
    const [, v3, v2, v1] = s.versions;
    v3.snap.steps = now.steps.filter(t => !/non-solicitation/.test(t));
    v2.snap = structuredClone(v3.snap); v2.snap.access = 'legal';
    v1.snap = structuredClone(v2.snap);
    v1.snap.steps = v1.snap.steps.map(t => /^For red/.test(t) ? 'For red, redline what you can and list the clauses that need a lawyer.' : t);
  }
}

/* the `/` list in every composer: the published skills, by name. The
   composer holds on to the array, so it is refilled in place. */
function skSync() {
  if (typeof SKILL_LIST === 'undefined') return;
  SKILL_LIST.splice(0, SKILL_LIST.length, ...skAll().filter(s => s.status === 'live').map(s => s.name));
}

/* ── the things a skill can lean on ── */
const SK_KIND = { playbook: 'Playbook', template: 'Template', vault: 'Vault' };
function skRef(u) {
  if (u.kind === 'playbook') { const p = pbFind(u.id); return p && { name: p.name, open: () => openPlaybook(p.id) }; }
  if (u.kind === 'template') { const t = mxTemplate(u.id); return t && { name: t.name, open: () => mxOpen('templates', t.id) }; }
  if (u.kind === 'vault') { const v = mxVault(u.id); return v && { name: v.name, open: () => mxOpen('vault', v.id) }; }
  return null;
}
const skRefTile = (kind) => kind === 'vault' ? mxTile('vault') : kind === 'template' ? mxTile('tpl') : h('span', { class: 'pb-doc-ic', 'aria-hidden': 'true' });

/* the mark: two sparks, the rail's own icon at row size */
const SK_MARK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">'
  + '<path d="M6.5 3c.4 3.2 1.3 4.1 4.5 4.5-3.2.4-4.1 1.3-4.5 4.5-.4-3.2-1.3-4.1-4.5-4.5 3.2-.4 4.1-1.3 4.5-4.5z"/>'
  + '<path d="M12 9.75c.2 1.55.7 2.05 2.25 2.25-1.55.2-2.05.7-2.25 2.25-.2-1.55-.7-2.05-2.25-2.25 1.55-.2 2.05-.7 2.25-2.25z"/></svg>';
const skTile = () => h('span', { class: 'mx-tile mx-tile--skill', 'aria-hidden': 'true', html: SK_MARK });
const SK_IC = (p, w = 14) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const SK_TRASH = SK_IC('<path d="M4.5 7h15M9.5 7V5.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M6.5 7l.8 11.6a1.6 1.6 0 0 0 1.6 1.4h6.2a1.6 1.6 0 0 0 1.6-1.4L17.5 7"/>');
const SK_CHEV = SK_IC('<path d="m7 10 5 5 5-5"/>', 13);

function skGlyphs() {
  mxGlyphs();
  GLYPHS.run ||= '<path d="M8 5.5v13l10.5-6.5z"/>';
  GLYPHS.md ||= '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 17v1.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V17"/>';
}

/* ── routing ── */
function skillsView() {
  const o = MX.skills.open;
  /* Build with AI is a conversation, so its address hands over to the chat */
  if (o === 'new' || o === 'demo') { MX.skills.open = null; setTimeout(o === 'new' ? skStartChat : skDemo, 0); }
  const s = o && skFind(o);
  if (o && !s) MX.skills.open = null;
  skSync();
  return s ? skillPage(s) : skillList();
}

/* ==================================================================
   The list
================================================================== */
const SK_WAYS = [
  { key: 'ai', name: 'Build with AI', desc: 'Describe the work the way you would brief a colleague, and Clavia writes the steps.',
    icon: () => quillEl('static', { cls: 'pb-way-quill' }) },
  { key: 'library', name: 'Choose from Library', desc: 'Start from a skill Clavia ships with, and make it yours.',
    icon: () => icon('templates', 'ico') },
  { key: 'manual', name: 'Build Manually', desc: 'A blank skill. Write the steps yourself.', icon: () => PB_WAYS[2].icon() },
];

function skillList() {
  const all = skAll();
  /* a skill started and never written in is not worth keeping */
  for (const s of [...all]) if (!s.versions.length && !s.name?.trim() && !s.about?.trim() && !s.steps.some(t => t.trim())) all.splice(all.indexOf(s), 1);
  skGlyphs();
  const t = mxTable({
    label: 'Skills', st: MX.skills.list, empty: 'No skills yet.',
    grid: 'minmax(220px, 2.2fr) minmax(80px, 1fr) minmax(104px, 1fr) minmax(52px, 1fr) minmax(132px, 1fr) minmax(112px, 1fr) 32px',
    cols: [{ key: 'name', label: 'Name' }, { key: 'output', label: 'Output' }, { key: 'status', label: 'Status' },
      { key: 'runs', label: 'Runs', num: true }, { key: 'owner', label: 'Owner' },
      { key: 'updated', label: 'Last updated', desc: true, cls: 'pb-td-when' }],
    tabs: () => SK_AREAS.filter(a => all.some(s => s.area === a)).map(a => ({ k: a, label: a })),
    tabOf: (s) => s.area,
    items: () => all,
    filters: [
      { key: 'status', label: 'Status', of: (s) => s.status, label_of: (k) => PB_STATUS[k]?.label, order: (k) => PB_ORDER[k] },
      { key: 'output', label: 'Output', of: (s) => s.output, order: (k) => SK_OUTPUTS.indexOf(k) },
      { key: 'access', label: 'Who can use it', of: (s) => s.access, label_of: (k) => SK_ACCESS[k]?.label, order: (k) => Object.keys(SK_ACCESS).indexOf(k) },
      { key: 'owner', label: 'Owner', of: (s) => s.owner },
    ],
    text: (s) => [s.name, s.about, s.owner, s.output, s.area, ...s.steps].join(' '),
    val: (s, k) => k === 'runs' ? s.runs.length : k === 'updated' ? s.updated : k === 'status' ? PB_ORDER[s.status] : (s[k] || '').toLowerCase(),
    cells: (s) => [[skTile(), h('span', { class: 'pb-row-name' }, s.name || 'Untitled skill')], s.output || '', pbStatus(s.status),
      String(s.runs.length), mxPerson(s.owner), pbWhen(s.updated)],
    open: (s) => mxOpen('skills', s.id),
    menu: (s, row) => [
      { label: s.status === 'live' ? 'Run Skill' : 'Try Skill', icon: 'run', run: () => skRun(s) },
      { label: 'Open', icon: 'files', run: () => mxOpen('skills', s.id) },
      { label: 'Duplicate', icon: 'copy', run: () => { const c = skCopy(s); MX.flash = c.id; t.paint(); } },
      { rule: true },
      { label: 'Delete', icon: 'trash', danger: true, run: () => mxRemove(all, s, row, 'skill', () => { skSync(); t.paint(); }) },
    ],
  });
  return mxListPage('Skills', mxCta('New Skill', (btn, keyboard) => pbWaysMenu(btn, 'sk-new', SK_WAYS, (k) => {
    if (k === 'ai') return skStartChat();
    if (k === 'library') return skLibrary(() => t.paint());
    skOpenNew({ name: '', about: '', area: 'Commercial', output: 'Redline', access: 'me', asks: [], steps: [''], uses: [] });
  }, { keyboard }), true), t.el);
}

/* a skill of your own: a draft, yours, nothing published yet */
function skNew(fields) {
  const s = { id: pbUid('sk'), status: 'draft', owner: USER.name, updated: mxNow(), versions: [], runs: [], ...structuredClone(fields) };
  skAll().unshift(s); save();
  return s;
}
function skOpenNew(fields) { const s = skNew(fields); MX.flash = s.id; mxOpen('skills', s.id); return s; }
function skCopy(s) {
  const all = skAll();
  const c = { ...skSnap(s), id: pbUid('sk'), name: (s.name || 'Untitled skill') + ' copy', status: 'draft', owner: USER.name, updated: mxNow(), versions: [], runs: [] };
  all.splice(all.indexOf(s) + 1, 0, c); save();
  return c;
}

/* the library: Clavia's own skills, each added as your draft */
function skLibrary(after) {
  const all = skAll();
  mxPick({
    title: 'Choose from Library', action: 'Add',
    groups: SK_AREAS.map(a => ({ label: a, items: SK_LIBRARY.filter(l => l.area === a && !all.some(s => s.from === l.id))
      .map(l => ({ id: l.id, label: l.name, sub: l.output })) })),
    onDone: (ids) => {
      const made = ids.map(id => {
        const l = SK_LIBRARY.find(x => x.id === id);
        return skNew({ name: l.name, about: l.about, area: l.area, output: l.output, access: 'legal', asks: l.asks, steps: l.steps, uses: [], from: l.id });
      });
      if (made.length === 1) { mxOpen('skills', made[0].id); return; }
      MX.flash = made[0]?.id; after?.();
      pbToast(`Added ${mxPlural(made.length, 'skill')} as drafts`);
    },
  });
}

/* Run Skill: New Chat with the skill already in the box */
function skRun(s) {
  MX.pills = [{ kind: 'skill', icon: 'skills', label: s.name, hint: s.asks.some(a => a.kind === 'Document') ? 'On what? Attach the document, or name it.' : 'What is it about?' }];
  go('home');
}

/* ==================================================================
   One skill
================================================================== */
const SK_WHAT = { name: 'Renamed it', about: 'Changed when to use it', asks: 'Changed what it asks for', steps: 'Changed the steps',
  uses: 'Changed what it follows', output: 'Changed what it hands back', access: 'Changed who can use it', area: 'Moved it to another area' };

/* an edit: a draft just changes; a published skill keeps running as
   published until the changes are published too */
function skTouch(s, what) {
  s.updated = mxNow();
  if (s.status === 'live' && what) { s.changes ||= []; if (!s.changes.includes(what)) s.changes.push(what); }
  save();
}
function skPublish(s) {
  const v = skVer(s) + 1;
  const note = !s.versions.length ? 'First version'
    : s.restored ? `Restored version ${s.restored}`
    : (s.changes || []).map((k, i) => i ? SK_WHAT[k].replace(/^Changed /, '').replace(/^\w/, c => c.toLowerCase()) : SK_WHAT[k]).join(', ') || 'Published again';
  s.versions.unshift({ v, by: USER.name, at: mxNow(), note, snap: skSnap(s) });
  s.status = 'live'; s.changes = null; s.restored = null; s.updated = mxNow();
  save(); skSync();
  pbToast(`Published version ${v} of “${s.name || 'Untitled skill'}”`);
}

/* The page reads as the brief it is: when to use it, then the steps, with
   the playbooks and templates named where a step uses them. Everything
   that is not the instructions sits in a details panel on the right, and
   the panel opens onto the skill's runs and versions in place. */
function skillPage(s) {
  skGlyphs();
  let side = 'details';
  const repaint = () => { const n = skillPage(s); page.replaceWith(n); };
  const changed = (what) => { skTouch(s, what); paintPub(); paintSide(); };

  const title = h('input', { class: 'mx-title', value: s.name || '', placeholder: 'Untitled skill', 'aria-label': 'Skill name',
    oninput: (e) => { s.name = e.target.value; changed('name'); },
    onkeydown: (e) => { if (e.key === 'Enter') about.focus(); } });

  /* Publish is in the header only while there is something to publish */
  const pub = h('button', { class: 'sk-pub', type: 'button', onclick: () => { skPublish(s); repaint(); } });
  const paintPub = () => {
    const k = s.status !== 'live' ? 'draft' : s.changes?.length ? 'changed' : null;
    pub.hidden = !k;
    if (!k) return;
    pub.replaceChildren(h('span', { class: 'sk-pub-dot' }), k === 'changed' ? 'Publish Changes' : 'Publish');
    pub.disabled = !(s.name?.trim() && s.steps.some(t => t.trim()));
    pub.setAttribute('data-tip', k === 'changed' ? `Version ${skVer(s)} stays live until you publish` : 'Make It Available to Run');
  };
  paintPub();
  const runBtn = h('button', { class: 'btn btn--primary', type: 'button', onclick: () => skRun(s) },
    h('span', { class: 'sk-run-ic', html: SK_IC('<path d="M8 5.5v13l10.5-6.5z"/>', 12) }), s.status === 'live' ? 'Run Skill' : 'Try Skill');
  const dots = h('button', { class: 'br-dots', type: 'button', 'aria-label': 'More actions', 'data-tip': 'More Actions', html: PB_SVG.dots,
    onclick: (e) => { e.stopPropagation(); menu(dots, [
      { label: 'Duplicate', icon: 'copy', run: () => { const c = skCopy(s); MX.flash = c.id; mxOpen('skills', c.id); } },
      { label: 'Download as Markdown', icon: 'md', run: () => skDownload(s) },
      s.status === 'live' && { label: 'Unpublish', icon: 'archive', run: () => {
        s.status = 'draft'; save(); skSync(); repaint();
        pbToast(`“${s.name}” is unpublished`, { label: 'Undo', run: () => { s.status = 'live'; save(); skSync(); repaint(); } });
      } },
      { rule: true },
      { label: 'Delete', icon: 'trash', danger: true, run: () => { mxClose('skills'); go('skills'); mxRemove(skAll(), s, document.querySelector(`.pb-row[data-id="${s.id}"]`), 'skill', () => { skSync(); go('skills'); }); } },
    ]); } });

  /* the brief */
  const about = h('textarea', { class: 'sk-when', rows: '1', 'aria-label': 'When to use it', placeholder: 'When should it be used?',
    oninput: (e) => { s.about = e.target.value; changed('about'); } });
  about.value = s.about || '';

  /* the panel, and what it opens onto */
  const panel = h('aside', { class: 'sk-side' });
  const toDetails = () => { side = 'details'; paintSide(); };
  const paintSide = () => panel.replaceChildren(...[].concat(
    side === 'runs' ? skRunsPane(s, toDetails)
      : side === 'versions' ? skVersionsPane(s, toDetails, repaint)
      : skDetails(s, { onChange: changed, open: (k) => { side = k; paintSide(); } })));
  paintSide();

  const page = h('div', { class: 'pb mx mx-page sk-page' },
    h('button', { class: 'mx-back', type: 'button', onclick: () => { mxClose('skills'); go('skills'); } },
      h('span', { class: 'mx-back-ar', html: PB_SVG.chev }), 'Skills'),
    h('header', { class: 'mx-head' },
      h('div', { class: 'mx-head-main' }, title),
      h('div', { class: 'mx-head-acts' }, pub, runBtn, dots)),
    h('div', { class: 'sk-grid' },
      h('div', { class: 'sk-brief' }, about, skSteps(s, { onChange: changed })),
      panel));
  if (!s.name) setTimeout(() => title.focus(), 60);
  return page;
}

/* ── the steps: numbered lines typed like a document; a playbook, template
   or vault named in a step is a link to it ── */
function skSteps(s, { edit = true, onChange = () => {} } = {}) {
  const list = h('ol', { class: 'sk-steps' });
  const linkify = (el, text) => {
    const refs = s.uses.map(u => ({ u, r: skRef(u) })).filter(x => x.r);
    if (!refs.length || !text) { el.textContent = text || ''; return; }
    /* "Mutual NDA playbook" before "Mutual NDA": a template can share a playbook's name */
    const pats = refs.flatMap(x => [{ x, p: `${x.r.name} ${x.u.kind}` }, { x, p: x.r.name }]).sort((a, b) => b.p.length - a.p.length);
    const re = new RegExp(pats.map(q => q.p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
    const nodes = [];
    let last = 0;
    text.replace(re, (m, at) => {
      const q = pats.find(q => q.p.toLowerCase() === m.toLowerCase());
      nodes.push(text.slice(last, at), h('a', { class: 'sk-ref', 'data-tip': `Open ${SK_KIND[q.x.u.kind]}`,
        onmousedown: (e) => { if (edit && document.activeElement === el) return; e.preventDefault(); q.x.r.open(); } }, m));
      last = at + m.length;
      return m;
    });
    nodes.push(text.slice(last));
    el.replaceChildren(...nodes);
  };
  const stepEl = (i) => {
    const txt = h('div', { class: 'sk-step-t', 'data-ph': 'Write the step in plain English',
      ...(edit ? { contenteditable: 'plaintext-only', spellcheck: 'false' } : {}),
      oninput: (e) => { s.steps[at()] = e.target.textContent; onChange('steps'); },
      onblur: (e) => linkify(e.target, s.steps[at()]),
      onkeydown: (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault(); s.steps.splice(at() + 1, 0, ''); onChange('steps'); paint(at() + 1);
        } else if (e.key === 'Backspace' && !e.target.textContent && s.steps.length > 1) {
          e.preventDefault(); const i = at(); s.steps.splice(i, 1); onChange('steps'); paint(Math.max(0, i - 1), true);
        }
      } });
    linkify(txt, s.steps[i]);
    const li = h('li', { class: 'sk-step' }, h('span', { class: 'sk-n' }, `${i + 1}.`), txt,
      edit ? h('button', { class: 'pbv-icon sk-del', type: 'button', 'aria-label': 'Delete step', 'data-tip': 'Delete Step', html: SK_TRASH,
        onclick: () => { s.steps.splice(at(), 1); onChange('steps'); paint(); } }) : null);
    const at = () => [...list.children].indexOf(li);
    return li;
  };
  const paint = (focus, toEnd) => {
    list.replaceChildren(...s.steps.map((_, i) => stepEl(i)));
    const t = focus != null && list.children[focus]?.querySelector('.sk-step-t');
    if (!t) return;
    t.focus();
    if (toEnd) { const r = document.createRange(); r.selectNodeContents(t); r.collapse(false); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); }
  };
  paint();
  return h('div', { class: 'sk-steps-wrap' }, list,
    edit ? h('button', { class: 'sk-add', type: 'button', onclick: () => { s.steps.push(''); onChange('steps'); paint(s.steps.length - 1); } }, 'Add Step') : null);
}

/* ── details: everything about the skill that is not the instructions ──
   `open` is how the page's panel turns to runs or versions; beside a
   Build with AI chat there is neither, and only what the draft decides. */
function skDetails(s, { edit = true, onChange = () => {}, open = null } = {}) {
  const row = (label, ...v) => h('div', { class: 'sk-d' }, h('span', { class: 'sk-d-l' }, label), h('div', { class: 'sk-d-v' }, ...v));
  const pick = (value, items) => {
    const b = h('button', { class: 'sk-val', type: 'button', disabled: !edit, onclick: (e) => { e.stopPropagation(); menu(b, items()); } },
      ...[].concat(value), edit ? h('span', { class: 'sk-val-ar', html: SK_CHEV }) : null);
    return b;
  };
  const acc = SK_ACCESS[s.access] || SK_ACCESS.legal;
  const rows = [];
  if (open) {
    const live = s.status === 'live';
    const say = live ? (s.changes?.length ? `Version ${skVer(s)} · changes not published` : `Version ${skVer(s)}`) : s.versions.length ? `Unpublished · was version ${skVer(s)}` : 'Not published yet';
    rows.push(row('Status', h('button', { class: 'sk-val sk-state' + (live ? ' is-live' : ''), type: 'button', disabled: !s.versions.length,
      'data-tip': s.versions.length ? 'Version History' : null, onclick: () => open('versions') },
      h('span', { class: 'sk-state-dot' }), live ? 'Published' : 'Draft', h('span', { class: 'sk-faint' }, say),
      s.versions.length ? h('span', { class: 'sk-val-ar', html: SK_CHEV }) : null)));
  }
  rows.push(
    row('Who can use it', pick([acc.label], () => Object.entries(SK_ACCESS).map(([k, a]) => ({ label: a.label, tick: s.access === k, run: () => { s.access = k; onChange('access'); } })))),
    acc.note ? h('p', { class: 'sk-d-note' }, 'Run only. The steps stay with legal.') : null,
    row('Hands back', pick(s.output || 'Choose', () => SK_OUTPUTS.map(o => ({ label: o, tick: s.output === o, run: () => { s.output = o; onChange('output'); } })))),
    (() => {
      const add = () => {
        const has = (k, id) => s.uses.some(u => u.kind === k && u.id === id);
        mxPick({ title: 'What should it use?', action: 'Add',
          groups: [
            { label: 'Playbooks', items: pbList().filter(p => p.status !== 'archived' && !has('playbook', p.id)).map(p => ({ id: 'playbook:' + p.id, label: p.name })) },
            { label: 'Templates', items: mxData().templates.filter(t => !has('template', t.id)).map(t => ({ id: 'template:' + t.id, label: t.name })) },
            { label: 'Vaults', items: mxData().vaults.filter(v => v.name && !has('vault', v.id)).map(v => ({ id: 'vault:' + v.id, label: v.name })) },
          ],
          onDone: (ids) => { for (const x of ids) { const [kind, id] = x.split(':'); s.uses.push({ kind, id }); } onChange('uses'); } });
      };
      const uses = s.uses.map((u, i) => {
        const r = skRef(u);
        return r && h('span', { class: 'sk-use' },
          h('button', { class: 'sk-use-n', type: 'button', 'data-tip': `Open ${SK_KIND[u.kind]}`, onclick: () => r.open() }, r.name),
          h('span', { class: 'sk-faint' }, u.kind),
          edit ? h('button', { class: 'pbv-icon sk-use-x', type: 'button', 'aria-label': 'Remove', 'data-tip': 'Remove',
            html: SK_IC('<path d="M7 7l10 10M17 7 7 17"/>', 12), onclick: () => { s.uses.splice(i, 1); onChange('uses'); } }) : null);
      }).filter(Boolean);
      /* the add is a + beside the label, so it holds no line of its own */
      return h('div', { class: 'sk-d' },
        h('span', { class: 'sk-d-l' }, 'Uses', edit && uses.length ? h('button', { class: 'pbv-icon sk-d-add', type: 'button', 'aria-label': 'Add playbook, template or vault',
          'data-tip': 'Add Playbook, Template or Vault', html: SK_IC('<path d="M12 5.5v13M5.5 12h13"/>', 12), onclick: add }) : null),
        h('div', { class: 'sk-d-v' }, ...uses,
          !uses.length ? (edit ? h('button', { class: 'sk-add is-on sk-add--d', type: 'button', onclick: add }, 'Add a playbook, template or vault') : h('span', { class: 'sk-faint' }, 'Nothing')) : null));
    })(),
    row('Area', pick(s.area, () => SK_AREAS.map(a => ({ label: a, tick: s.area === a, run: () => { s.area = a; onChange('area'); } })))));
  if (open) rows.push(
    row('Owner', h('span', { class: 'sk-who' }, mxFace(s.owner, 'pb-av sk-av'), s.owner)),
    row('Runs', s.runs.length
      ? h('button', { class: 'sk-val', type: 'button', onclick: () => open('runs') }, mxPlural(s.runs.length, 'run'), h('span', { class: 'sk-val-ar sk-val-ar--r', html: SK_CHEV }))
      : h('span', { class: 'sk-faint' }, 'Not run yet')));
  return h('div', { class: 'sk-details' }, ...rows.filter(Boolean));
}

/* the panel turned to one list, with the way back at its head */
const skPaneHead = (title, back) => h('button', { class: 'sk-pane-head', type: 'button', onclick: back },
  h('span', { class: 'sk-pane-ar', html: PB_SVG.chev }), title);

/* ── Runs: who ran it, on what, from where ── */
function skRunsPane(s, back) {
  return [skPaneHead('Runs', back), h('div', { class: 'sk-log' }, ...s.runs.map(r => {
    const rq = /^RQ-\d+/.exec(r.from)?.[0];
    return h('div', { class: 'sk-ev' }, mxFace(r.by, 'pb-av sk-av'),
      h('div', { class: 'sk-ev-t' },
        h('div', { class: 'sk-ev-a' }, h('b', {}, r.by), ' ran it on ', h('span', { class: 'sk-ev-on' }, r.on)),
        h('div', { class: 'sk-ev-m' },
          rq ? h('button', { class: 'sk-from', type: 'button', onclick: () => mxOpen('intake', rq) }, `From ${rq}`)
            : h('span', {}, r.from === 'Test' ? 'Tried before publishing' : `From ${r.from}`),
          h('span', {}, ' · ', pbWhen(r.at)))));
  }))];
}

/* ── Versions: what was published, by whom, and why; any of it can come back ── */
function skVersionsPane(s, back, repaint) {
  const rows = [];
  if (s.changes?.length) rows.push(h('div', { class: 'sk-ver is-pending' },
    h('b', {}, s.restored ? `Restored version ${s.restored}` : 'Changes not published'),
    h('span', {}, s.changes.map(k => SK_WHAT[k]).join(' · '))));
  s.versions.forEach((v, i) => {
    rows.push(h('div', { class: 'sk-ver' },
      h('div', { class: 'sk-ver-top' }, h('b', {}, `Version ${v.v}`),
        i === 0 && s.status === 'live' ? h('span', { class: 'sk-ver-tag' }, 'Live')
          : i > 0 && v.snap ? h('button', { class: 'sk-restore', type: 'button', onclick: () => {
            const was = skSnap(s);
            Object.assign(s, structuredClone(v.snap));
            s.restored = v.v; s.changes = s.status === 'live' ? ['steps'] : null;
            skTouch(s); repaint();
            pbToast(`Restored version ${v.v}. Publish it to make it live.`, { label: 'Undo', run: () => { Object.assign(s, was); s.restored = null; s.changes = null; save(); repaint(); } });
          } }, 'Restore') : null),
      h('span', { class: 'sk-ver-note' }, v.note),
      h('span', { class: 'sk-faint' }, `${v.by} · ${pbWhen(v.at)}`)));
  });
  return [skPaneHead('Versions', back), h('div', { class: 'sk-vers' }, ...rows)];
}

/* a skill is a document you can take with you: the open SKILL.md shape */
function skDownload(s) {
  const lines = ['---', `name: ${s.name}`, `description: ${s.about}`, '---', '', `# ${s.name}`, '', s.about, ''];
  if (s.asks.length) lines.push('## Asks for', '', ...s.asks.map(a => `- ${a.label} (${a.kind.toLowerCase()}${a.optional ? ', optional' : ''})`), '');
  lines.push('## Steps', '', ...s.steps.filter(Boolean).map((t, i) => `${i + 1}. ${t}`), '');
  const refs = s.uses.map(skRef).filter(Boolean);
  if (refs.length) lines.push('## Follows', '', ...s.uses.map(u => { const r = skRef(u); return r && `- ${SK_KIND[u.kind]}: ${r.name}`; }).filter(Boolean), '');
  lines.push('## Hands back', '', s.output || '', '');
  const a = h('a', { href: URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown' })),
    download: (s.name || 'skill').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.md' });
  document.body.append(a); a.click(); a.remove();
}

/* ==================================================================
   Running a skill in chat
   The composer sends "Skill name · file — what you typed". A skill that
   needs a document asks for it first; then the trace shows what it read,
   the skill and the playbooks it followed, and the answer is the skill's.
   Every run lands on the skill's Runs tab.
================================================================== */
const SK_TRY = {
  'sk-nda': ['Northwind NDA – their draft.docx', 'Halden Mutual NDA.pdf'],
  'sk-redline': ['Acme redline – MSA v3.docx', 'Brightwell MSA – their redline v3.docx'],
  'sk-dpa': ['Brightwell DPA v1.docx'],
  'sk-question': ['Can we use a customer’s logo on our website?', 'Do we need an NDA for a demo call?'],
  'sk-draft-nda': ['Northwind Ltd, for partnership talks', 'Oakridge Labs, only we share'],
  'sk-renewal': ['Zendesk order form 2024.pdf'],
  'sk-terms': ['Customer DPAs (21 files)'],
  'sk-escalate': ['RQ-1047 · Acme MSA'],
};

function skillFromPrompt(prompt) {
  const [head, ...rest] = prompt.split(' — ');
  const labels = head.split(' · ').map(x => x.trim());
  const s = skAll().find(x => labels.includes(x.name));
  if (!s) return null;
  return { s, files: labels.filter(l => l !== s.name && !skAll().some(x => x.name === l)), text: rest.join(' — ').trim() };
}

/* the answer() seam: a prompt carrying a skill, a reply to one that asked
   for its document, or a link out of one */
function skillAnswer(prompt) {
  const open = /^open (rq-\d+)/i.exec(prompt.trim());
  if (open && thread?.skLast) { mxOpen('intake', open[1].toUpperCase()); return true; }
  const got = skillFromPrompt(prompt);
  if (got) { skillTurn(got.s, got); return true; }
  const wait = thread?.skWait && skFind(thread.skWait);
  if (wait) { skillTurn(wait, { files: [], text: prompt.trim(), reply: true }); return true; }
  return false;
}

function skillTurn(s, got) {
  const m = { role: 'bot', steps: [], text: '', thinking: true };
  thread.messages.push(m); paintThread();
  const needsDoc = s.asks.some(a => a.kind === 'Document' && !a.optional);
  const needsText = !needsDoc && s.asks.some(a => a.kind === 'Answer' && !a.optional);
  const on = got.files[0] || (got.text && (got.reply || /\.(docx?|pdf|msg|xlsx)\b|\(\d+ files\)|^RQ-\d+/i.test(got.text) || needsText) ? got.text : null);
  const finish = (fn, ms) => setTimeout(() => { m.thinking = false; if (m.traceOpen == null) m.traceOpen = false; fn(); renderBot(m); }, ms);

  if ((needsDoc || needsText) && !on) {
    thread.skWait = s.id;
    const first = s.asks.find(a => !a.optional);
    finish(() => {
      m.text = needsDoc ? `I will run **${s.name}**. Attach ${first.label.replace(/^their/i, 'their').replace(/^The /, 'the ').replace(/^(\w)/, c => c.toLowerCase())} to start, or pick one below.`
        : `I will run **${s.name}**. ${first.label.replace(/^The /, 'What is the ')}?`;
      m.suggest = SK_TRY[s.id] || null;
    }, 600);
    return;
  }
  thread.skWait = null; thread.skLast = s.id;
  const steps = [];
  if (needsDoc || got.files.length) steps.push({ source: 'document', query: on, count: 'read' });
  steps.push({ source: 'skill', query: s.name, count: s.status === 'live' ? `version ${skVer(s)}` : 'draft' });
  for (const u of s.uses) {
    const r = skRef(u);
    if (r) steps.push(u.kind === 'vault' ? { source: 'internal', query: r.name, count: 'searched' } : { source: u.kind, query: r.name, count: u.kind === 'playbook' ? 'checked against' : 'used' });
  }
  steps.forEach((st, i) => {
    setTimeout(() => { m.steps.push({ ...st, rows: [], running: true }); renderBot(m); }, 300 + i * 750);
    setTimeout(() => { Object.assign(m.steps[i], st, { running: false }); renderBot(m); }, 300 + i * 750 + 600);
  });
  finish(() => {
    const out = (SK_RESULTS[s.id] || skGeneric)(s, on || 'it', got.text);
    /* a list is its own block in the chat, so the line that leads into it stands apart */
    m.text = out.text.replace(/(^|\n)([^-\n][^\n]*)\n(?=- )/g, '$1$2\n\n'); m.suggest = out.suggest || null;
    s.runs.unshift({ by: USER.name, on: on || 'a question', from: s.status === 'live' ? 'Chat' : 'Test', at: mxNow() });
    save();
  }, 300 + steps.length * 750 + 400);
}

SOURCES.skillsave = { label: 'Skills', verb: 'Saved to', icon: '<path d="M9.75 4.5c.6 4.8 1.95 6.15 6.75 6.75-4.8.6-6.15 1.95-6.75 6.75-.6-4.8-1.95-6.15-6.75-6.75 4.8-.6 6.15-1.95 6.75-6.75z"/>' };
SOURCES.document = { label: 'the document', verb: 'Read',
  icon: '<path d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V7.5z"/><path d="M14 3.5v4h4M9 12.5h6M9 16h4"/>' };

const skIs = (on, re) => re.test(on || '');
function skGeneric(s, on) {
  const refs = s.uses.map(skRef).filter(Boolean).map(r => r.name);
  return { text: `I ran **${s.name}** on ${on}${refs.length ? `, following ${refs.join(' and ')}` : ''}. `
    + `The ${(s.output || 'result').toLowerCase()} is ready for you to check; nothing has been sent.` };
}
const SK_RESULTS = {
  'sk-nda': (s, on) => skIs(on, /northwind/i) ? {
    text: '**Red — this one needs legal.** Clause 9 of Northwind’s NDA stops us hiring their staff for 12 months. A non-solicitation clause does not belong in an NDA, and our playbook has no fallback for it.\n\n'
      + 'Two more points would have been amber on their own:\n'
      + '- **Term** — one year. Our playbook needs two.\n'
      + '- **Governing law** — Scots law. We accept England and Wales only.\n\n'
      + 'As the skill says, I have not redlined it. Legal already has this NDA as **RQ-1048**, with Grace Coleman. Nothing has been sent.',
    suggest: ['Open RQ-1048'] } : {
    text: `**Amber — it can be signed once two points change.** Our fallbacks cover both, so it does not need a lawyer.\n\n`
      + '- **Term** — three years, but confidentiality ends with it. Our playbook keeps trade secrets confidential for as long as they stay secret; I have added that.\n'
      + '- **Residuals** — clause 7 lets them use anything their staff remember. Not acceptable as written; I have struck it, which is our fallback.\n\n'
      + `Everything else is within our positions. The redline of ${on} is ready to send back. Nothing has been sent.` },
  'sk-redline': (s, on) => ({
    text: `${skIs(on, /brightwell/i) ? 'Brightwell' : 'Acme'} changed six things that matter, plus 14 formatting and numbering edits I have left out.\n\n`
      + '- **Liability cap** — raised from 12 months of fees to 3× annual fees. Our playbook’s fallback is 2×; reject 3×.\n'
      + '- **Data breach** — uncapped. Not acceptable; offer a £3m super-cap, which is our fallback.\n'
      + '- **Termination for convenience** — on 30 days’ notice. Not acceptable in the first 12 months.\n'
      + '- **Payment** — 60 days. Our fallback is 45; accept 45.\n'
      + '- **Governing law** — New York. Accept only with English courts for anything about our IP.\n'
      + '- **Service credits** — capped at 15%, up from 10%. Within our fallback; accept.\n\n'
      + 'Worth a call rather than an email: the cap, the data breach super-cap and termination for convenience.' }),
  'sk-dpa': (s, on) => ({
    text: `I checked ${on} against our Data processing addendum playbook. Three changes, one for the security team:\n\n`
      + '- **Breach notice** — they ask for 24 hours. Redlined to 48, with an initial notice at 24 if they push back.\n'
      + '- **Audits** — on-site, on 10 days’ notice. Redlined to our SOC 2 report and one remote audit a year.\n'
      + '- **Sub-processors** — a right to object that ends the contract. Redlined to 30 days’ notice and a right to object; **the security team should confirm we can meet it.**\n\n'
      + 'Transfers and liability already match our positions. The redline is ready; nothing has been sent.' }),
  'sk-question': (s, on) => skIs(on, /logo/i) ? {
    text: 'Only with their written permission. Our customer agreement (clause 14.3, Publicity) lets either side use the other’s name and logo only with prior written consent, and most of our larger customers have struck even that.\n\n'
      + 'If the customer is happy, an email from someone senior on their side is enough. Send it to legal and we will file it with the contract.' } : {
    text: 'For a demo of the product alone, no. Nothing confidential is shared, and our standard terms of use cover the trial.\n\n'
      + 'If you will show the roadmap, pricing that is not public, or anything about other customers, yes — use **Draft an NDA from Our Template**; it takes about two minutes.' },
  'sk-draft-nda': (s, on) => ({
    text: `Drafted a ${/only we/i.test(on) ? 'one-way' : 'mutual'} NDA with **${/oakridge/i.test(on) ? 'Oakridge Labs Ltd' : 'Northwind Ltd'}** from our ${/only we/i.test(on) ? 'One-way' : 'Mutual'} NDA template, version 4.\n\n`
      + '- Registered name and office from the public register\n- Purpose: ' + (/partnership/i.test(on) ? 'partnership discussions' : 'evaluating a possible business relationship') + '\n- Term two years, England and Wales\n\n'
      + 'The Word document is ready to send. Nothing has been sent.' }),
  'sk-renewal': (s, on) => ({
    text: `${on} renews automatically on 1 December for another 12 months. Notice must be given **60 days before**, so the last day is **2 October** — which has passed.\n\n`
      + 'As the skill says, I have not drafted a notice. The next window closes on 2 October next year; I would set a reminder for August.' }),
  'sk-terms': (s, on) => ({
    text: `Built a review table from ${on}: one row per contract, with parties, term, renewal, notice period, liability cap and governing law, each value quoted from its clause.\n\n`
      + 'Four contracts are silent on the liability cap and say “Not stated”. It is in Vault under Customer DPAs.' }),
  'sk-escalate': (s, on) => ({
    text: '**Decision needed by Friday:** do we accept a £3m super-cap for data breach on the Acme MSA?\n\n'
      + 'Acme asked for unlimited liability for data breach and a general cap of 3× annual fees. We offered 2× and a £2m super-cap. The deal is £840k a year over 36 months.\n\n'
      + 'Grace recommends £3m — about 3.5× annual fees, and below our insurance limit — with the general cap held at 2×. If you say no, the fallback is £2.5m with a mutual cap on indirect loss.' }),
};

/* ==================================================================
   Build with AI: the standard chat, with the skill as its artifact
================================================================== */
const SKB_STARTS = [
  'When a supplier sends their NDA, check it against our playbook and tell the business if they can sign',
  'Summarise what changed when a customer returns our MSA with their redline',
  'Answer privacy questions from the sales team from our DPA and past answers',
];
const SKB_MATCH = [[/\bnda|confidential/i, 'sk-nda'], [/redline|what changed|marked[- ]?up|returns? our/i, 'sk-redline'], [/\bdpa\b|data processing|gdpr|privacy/i, 'sk-dpa'],
  [/renew|stop .*contract|notice/i, 'sk-renewal'], [/key terms|extract|many contracts|table/i, 'sk-terms'], [/board|minutes/i, 'sk-board'],
  [/offer letter|employment|hire|hiring/i, 'sk-offer'], [/\bsow\b|statement of work|services/i, 'sk-sow'], [/supplier|vendor|procurement/i, 'lib-supplier'],
  [/security|questionnaire/i, 'lib-security'], [/escalat|general counsel|\bgc\b/i, 'sk-escalate'], [/question|ask legal|advice/i, 'sk-question']];

let SK_N = 0;
function skArtifact(d) {
  const id = 'skill-draft-' + Date.now().toString(36) + (++SK_N);
  return ARTIFACTS[id] = { id, kind: 'skill', ext: 'skill', q: null, done: null,
    d: d || { name: '', about: '', area: 'Commercial', output: null, access: 'legal', asks: [], steps: [], uses: [] },
    get name() { return this.d.name || 'New skill'; }, set name(v) { this.d.name = v; } };
}

function skStartChat() {
  const a = skArtifact();
  openSession({ id: 'sk-ses-' + a.id, label: 'New skill', artifact: a.id, people: [{ name: USER.name, online: true, owner: true }],
    messages: [{ role: 'bot', steps: [], cites: null, artifact: null,
      answer: 'Describe the piece of work the way you would brief a new colleague: when it comes up, what you do, and what you hand back. Attach an example of the finished work if you have one. I will write the skill beside this chat.',
      suggest: SKB_STARTS }] });
  setTimeout(() => openArtifact(a), 80);
}

/* a turn in the conversation that builds a skill */
function skBuildTurn(a, prompt) {
  const d = a.d, t = prompt.trim();
  const m = { role: 'bot', steps: [], text: '', thinking: true };
  for (const x of thread.messages) if (x.suggest) { x.suggest = null; x.el?.querySelector('.sugg')?.remove(); }
  if (/^open the skill/i.test(t) && a.done) { mxOpen('skills', a.done); return; }
  thread.messages.push(m); paintThread();
  const finish = (fn, ms) => setTimeout(() => { m.thinking = false; if (m.traceOpen == null) m.traceOpen = false; fn(); renderBot(m); skRefresh(a); }, ms);

  if (a.done) return finish(() => { m.text = `This one is saved in Skills as **${d.name}**. Start another from New Skill.`; m.suggest = ['Open the skill']; }, 500);
  if (/^save/i.test(t)) return skBuildSave(a, m);

  /* the first description becomes a whole draft: the nearest skill we know, renamed to what was asked */
  if (!d.steps.length) {
    const base = [...SK_SEED, ...SK_LIBRARY].find(x => x.id === (SKB_MATCH.find(([re]) => re.test(t)) || [, 'sk-question'])[1]);
    Object.assign(d, structuredClone({ name: base.name, about: base.about, area: base.area, output: base.output, asks: base.asks, steps: base.steps, uses: base.uses || [] }));
    if (/tell the business|for the business|sales team|self-?serve/i.test(t)) d.access = 'company';
    /* named for what was asked: a supplier's NDA is not any inbound one */
    const who = /\b(supplier|vendor|customer|partner)s?\b/i.exec(t)?.[1];
    if (who && /Inbound|Customer|Supplier/.test(d.name)) {
      const W = who.replace(/^\w/, c => c.toUpperCase());
      d.name = d.name.replace(/Inbound|Customer|Supplier/, W).replace(/\ban (?=[^aeiou])/i, 'a ');
      d.about = d.about.replace(/a counterparty|a customer|procurement/i, 'a ' + who.toLowerCase());
    }
    const refs = d.uses.map(u => ({ u, r: skRef(u) })).filter(x => x.r);
    const steps = [{ source: 'think', query: 'Worked out the steps from what you described' },
      ...refs.map(({ u, r }) => ({ source: u.kind === 'vault' ? 'internal' : u.kind, query: r.name, count: 'found' }))];
    steps.forEach((st, i) => {
      setTimeout(() => { m.steps.push({ ...st, rows: [], running: true }); renderBot(m); }, 300 + i * 700);
      setTimeout(() => { Object.assign(m.steps[i], st, { running: false }); renderBot(m); }, 300 + i * 700 + 550);
    });
    a.q = 'access';
    return finish(() => {
      m.text = `Here is a first draft: ${mxPlural(d.steps.length, 'step')}${refs.length ? `, following our ${refs.map(x => `${x.r.name} ${x.u.kind}`).join(' and ')}` : ''}, handing back a ${d.output.toLowerCase()}. `
        + 'Change anything in it directly, or tell me here. Who should be able to use it?';
      m.suggest = Object.values(SK_ACCESS).map(x => x.label);
      m.artifact = a.id;
      skRetitle(d.name);
    }, 300 + steps.length * 700 + 300);
  }

  if (a.q === 'access') {
    const k = Object.entries(SK_ACCESS).find(([, x]) => x.label.toLowerCase() === t.toLowerCase())?.[0] || (/everyone|company|business/i.test(t) ? 'company' : /me\b|myself/i.test(t) ? 'me' : 'legal');
    d.access = k; a.q = 'never';
    return finish(() => {
      m.text = (k === 'company' ? 'Everyone at the company can run it; only legal can read the steps. ' : k === 'me' ? 'Only you, for now. ' : 'The legal team can run it. ')
        + 'Is there anything it should never do? Optional.';
      m.suggest = ['Never send anything without a lawyer seeing it first', 'Skip'];
    }, 600);
  }
  if (a.q === 'never') {
    a.q = null;
    if (!/^skip$/i.test(t)) d.steps.push(t.replace(/^\w/, c => c.toUpperCase()).replace(/([^.])$/, '$1.'));
    return finish(() => {
      m.text = (/^skip$/i.test(t) ? '' : `Added it as step ${d.steps.length}. `) + 'That is everything. Save it, and it goes into Skills as a draft, so you can try it on a real document before you publish it.';
      m.suggest = ['Save the skill'];
    }, 600);
  }
  /* anything else said along the way is another step */
  d.steps.push(t.replace(/^(also|and|please)\s+/i, '').replace(/^\w/, c => c.toUpperCase()).replace(/([^.])$/, '$1.'));
  finish(() => { m.text = `Added it as step ${d.steps.length}.`; m.suggest = ['Save the skill']; }, 600);
}

function skRetitle(name) {
  if (!name || thread.title === name) return;
  thread.title = name;
  const t1 = document.querySelector('.thread-title .thread-title-text'); if (t1) t1.textContent = name;
  const hi = HISTORY.find(x => x.id === thread.id); if (hi) { hi.label = name; mountNav?.(); }
}
function skBuildSave(a, m) {
  const d = a.d;
  if (!m) { m = { role: 'bot', steps: [], text: '', thinking: true }; thread.messages.push(m); paintThread(); }
  if (!d.steps.length) { setTimeout(() => { m.thinking = false; m.text = 'Tell me what the skill is for first, and I will draft it.'; renderBot(m); }, 400); return; }
  const st = { source: 'skillsave', query: d.name, count: 'draft' };
  setTimeout(() => { m.steps.push({ ...st, running: true }); renderBot(m); }, 300);
  setTimeout(() => {
    const s = skNew({ ...structuredClone(d), steps: d.steps.filter(Boolean) });
    a.done = s.id; MX.flash = s.id;
    Object.assign(m.steps[0], st, { running: false });
    m.thinking = false; m.traceOpen = false;
    m.text = `Saved. **${s.name}** is in Skills as a draft. Try it on a real document, then publish it when it does what you expect.`;
    m.artifact = a.id; m.suggest = ['Open the skill'];
    renderBot(m); skRefresh(a);
    pbToast(`“${s.name}” is saved as a draft`);
  }, 1100);
}
function skRefresh(a) {
  const main = document.getElementById('main');
  if (main?.dataset.artifact === 'open' && document.querySelector('.deck-view[data-kind="skill"]')) openArtifact(a);
}

/* how the skill reads beside the chat */
function skRender(a) {
  const d = a.d;
  const saveBtn = h('button', { class: 'xp-btn rqa-submit' + (a.done ? ' is-done' : ''), type: 'button', disabled: !a.done && !d.steps.length,
    onclick: () => { if (a.done) { mxOpen('skills', a.done); return; } say('user', 'Save the skill'); paintThread(); skBuildSave(a); } },
    a.done ? h('span', { class: 'rqa-submit-ic', html: SK_IC('<path d="m5.5 12.5 4 4 9-9.5"/>', 13) }) : null, a.done ? 'Open Skill' : 'Save Skill');
  if (!d.steps.length) {
    return { body: h('div', { class: 'rqart' }, h('div', { class: 'rqb-empty' },
      h('div', { class: 'rqb-ghost' }, h('i', { class: 'w60' }), h('i', { class: 'w90' }), h('i', { class: 'w75' }), h('i', { class: 'w40' }), h('i', { class: 'w85' }), h('i', { class: 'w55' })),
      h('b', {}, 'Your skill takes shape here'),
      h('p', {}, 'As you describe the work, the steps, what it asks for and what it follows fill in.'))), extras: [saveBtn] };
  }
  const about = h('p', { class: 'sk-art-about', contenteditable: a.done ? 'false' : 'plaintext-only', spellcheck: 'false',
    oninput: (e) => { d.about = e.target.textContent; } }, d.about);
  return { body: h('div', { class: 'rqart' }, h('article', { class: 'rqb-page sk-art' },
    a.done ? h('div', { class: 'rqa-status' }, h('span', { class: 'rqa-status-dot' }), 'Saved in Skills · draft')
      : h('div', { class: 'rqa-status is-draft' }, h('span', { class: 'rqa-status-dot' }), 'Not saved yet'),
    h('h2', { class: 'rqb-title' }, d.name), about,
    skSteps(d, { edit: !a.done }),
    skDetails(d, { edit: !a.done, onChange: () => skRefresh(a) }))), extras: [saveBtn] };
}

RENDER.skill = skRender;
KIND_ICON.skill = '<rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.6" fill="#FCFCFB" stroke="#D8D3CC" stroke-width="1"/>'
  + '<path d="M10.5 8.2c.3 2.3.9 2.9 3.2 3.2-2.3.3-2.9.9-3.2 3.2-.3-2.3-.9-2.9-3.2-3.2 2.3-.3 2.9-.9 3.2-3.2z" fill="none" stroke="#B9B2A7" stroke-width="1"/>';
KIND_LABEL.skill = 'Skill';
KIND_SHORT.skill = 'SKILL';
NOUN.skill = 'skill';

/* a finished one, to show the whole journey at once */
function skDemo() {
  const said = 'When a supplier sends their NDA, check it against our playbook and tell the business if they can sign. If it needs a lawyer, send it to legal.';
  const base = SK_SEED.find(x => x.id === 'sk-nda');
  const d = { ...structuredClone({ name: 'Triage a Supplier NDA', about: 'When a supplier sends us their NDA. Checks it against our Mutual NDA playbook and says whether the business can sign it.',
    area: 'Commercial', output: 'Redline', asks: base.asks, steps: base.steps.slice(0, 6), uses: base.uses }), access: 'company' };
  d.steps.push('Never send anything to the supplier without a lawyer seeing it first.');
  const a = skArtifact(d);
  const pb = pbFind('nda'), tpl = mxTemplate('mutual-nda');
  openSession({ id: 'sk-ses-' + a.id, label: d.name, meta: 'now', artifact: a.id, people: [{ name: USER.name, online: true, owner: true }],
    messages: [
      { role: 'user', text: said },
      { role: 'bot', cites: null, artifact: a.id,
        steps: [{ source: 'think', query: 'Worked out the steps from what you described' }, { source: 'playbook', query: pb.name, count: 'found' }, { source: 'template', query: tpl.name, count: 'found' }],
        answer: `Here is a first draft: 6 steps, following our ${pb.name} playbook and ${tpl.name} template, handing back a redline. Change anything in it directly, or tell me here. Who should be able to use it?` },
      { role: 'user', text: 'Everyone at the company' },
      { role: 'bot', steps: [], cites: null, artifact: null, answer: 'Everyone at the company can run it; only legal can read the steps. Is there anything it should never do? Optional.' },
      { role: 'user', text: 'Never send anything to the supplier without a lawyer seeing it first' },
      { role: 'bot', steps: [], cites: null, artifact: null, answer: 'Added it as step 7. That is everything. Save it, and it goes into Skills as a draft, so you can try it on a real document before you publish it.',
        suggest: ['Save the skill'] },
    ] });
  setTimeout(() => openArtifact(a), 80);
}
