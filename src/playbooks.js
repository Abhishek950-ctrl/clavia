/* ==================================================================
   Playbooks
   How a team negotiates each kind of agreement, clause by clause.
   Brought over from the Jev experiment and set in this app's hand.

   Two pages behind one rail item: the list (#playbooks) and a playbook
   (#playbooks/<id>). Each is one step deeper than the last, and so is
   everything inside a playbook:

     the playbook   clauses as rows — a title, the starting position in
                    a line, and three marks for which positions are set
     a clause       opens in place: the three positions in plain words
     the wording    the drafting language, a preview until you click it

   A clause carries three positions and no others — Starting position,
   Not acceptable, and an optional Fallback. The word is "clause",
   never "rule".

   Loaded before app.js, so everything here runs at call time: h(),
   icon(), menu(), go(), state and save() all live there.
================================================================== */

const PB = {
  open: null,         // 'new' while the Build with AI page is showing
  prompt: '', refs: [],
  flash: null,        // a row that just appeared on the list
  flashClause: null,  // a clause the chat just changed, shown where it is
  idxHidden: false,   // the clause list beside a playbook, folded away
  idxFold: {},        // sections folded in a playbook's clause list, by playbook
  status: 'all', find: '', sort: { key: 'updated', dir: -1 },
};

/* Seeded once, then the saved copy is the only copy: edits, new
   playbooks and deletions all live in the same list. */
function pbList() {
  if (!state.playbooks) { state.playbooks = structuredClone(PLAYBOOK_SEED); state.pbSeedV = PLAYBOOK_SEED_V; }
  /* The shipped playbooks changed (sections, a fuller DPA): a saved copy of
     them is replaced by the new ones. Playbooks you made yourself are kept. */
  if (state.pbSeedV !== PLAYBOOK_SEED_V) {
    const mine = state.playbooks.filter(p => !PLAYBOOK_SEED.some(x => x.id === p.id));
    state.playbooks = mine.concat(structuredClone(PLAYBOOK_SEED));
    state.pbSeedV = PLAYBOOK_SEED_V;
    for (const k of Object.keys(ARTIFACTS)) if (k.startsWith('playbook-')) delete ARTIFACTS[k];
  }
  /* a copy saved before playbooks had a status, an owner and a date
     takes them from the seed, or starts as yours, a draft, from now */
  for (const pb of state.playbooks) {
    if (pb.status && pb.owner && pb.updated && pb.version) continue;
    const seed = PLAYBOOK_SEED.find(x => x.id === pb.id);
    pb.status ||= seed?.status || 'draft';
    pb.owner ||= seed?.owner || USER.name;
    pb.updated ||= seed?.updated || new Date().toISOString();
    pb.version ||= seed?.version || 1;
  }
  /* several fallbacks per clause, and a version history (playbook-view.js) */
  for (const pb of state.playbooks) pbEnsureVersions(pb);
  return state.playbooks;
}
const pbNew = (fields) => ({ id: pbUid('playbook'), status: 'draft', owner: USER.name, version: 1,
  updated: new Date().toISOString(), ...fields });
const pbTouch = (pb) => { pb.updated = new Date().toISOString(); };
const pbFind = (id) => pbList().find(p => p.id === id) || null;
const pbUid = (pre) => pre + '-' + Math.random().toString(36).slice(2, 7);
const pbBlankClause = () => ({ id: pbUid('clause'), topic: '', covers: '', preferred: '',
  walkaway: '', fallbacks: [], preferred_language: '' });

const PB_FIELDS = ['topic', 'covers', 'preferred', 'walkaway', 'preferred_language'];
const pbEmpty = (pb) => !pb.name?.trim() && !pb.description?.trim()
  && pb.clauses.every(c => !PB_FIELDS.some(k => c[k]?.trim())
    && !(c.fallbacks || []).some(f => f.text?.trim()));

/* ── routing ──────────────────────────────────────────────────
   #playbooks is the list and #playbooks/new the Build with AI page. A
   playbook itself is an artifact, at #artifact/playbook-<id>; an older
   #playbooks/<id> link still lands on it. */
function playbookRoute(hash) {
  const m = /^playbooks\/(.+)$/.exec(hash);
  if (m) {
    const id = decodeURIComponent(m[1]);
    if (id === 'new') {
      if (PB.open === 'new' && state.view === 'playbooks') return true;
      PB.open = 'new'; go('playbooks'); return true;
    }
    const pb = pbFind(id);
    closePlaybook(); go('playbooks');
    if (pb) queueMicrotask(() => pbView(pb));
    return true;
  }
  if (hash === 'playbooks' && PB.open) { PB.open = null; go('playbooks'); return true; }
  return false;
}
/* read it full screen, or change it beside a conversation */
function openPlaybook(id, mode = 'view') {
  const pb = pbFind(id);
  if (!pb) return;
  mode === 'edit' ? pbEditInChat(pb) : pbView(pb);
}
function closePlaybook() { PB.open = null; }

function playbooksView() {
  return PB.open === 'new' ? pbCreatePage() : playbookIndex();
}

/* ── small shared pieces ── */

let pbToastEl = null, pbToastT = 0;
/* The composer's toast only says; deleting needs Undo. */
function pbToast(msg, act) {
  pbToastEl?.remove(); clearTimeout(pbToastT);
  pbToastEl = h('div', { class: 'toast pb-toast', role: 'status' },
    h('span', {}, msg),
    act && h('button', { class: 'pb-toast-act', type: 'button',
      onclick: () => { pbToastEl?.remove(); pbToastEl = null; act.run(); } }, act.label));
  document.body.append(pbToastEl);
  pbToastT = setTimeout(() => { pbToastEl?.remove(); pbToastEl = null; }, act ? 6000 : 3200);
}

/* Collapse an element to nothing, then take it out. Height is pinned
   first, because `auto` will not transition. */
function pbLeave(el, done) {
  el.style.height = el.offsetHeight + 'px';
  el.classList.add('is-leaving');
  void el.offsetHeight;
  el.style.height = '0px';
  setTimeout(() => { el.remove(); done?.(); }, 260);
}

/* Asking before something that takes other things with it: what will go,
   listed, and one button that says exactly what it does. Escape or a click
   outside is "no". */
function pbConfirm({ title, lead, items = [], action, run }) {
  const dim = h('div', { class: 'pb-dim', onclick: (e) => { if (e.target === dim) close(); } });
  /* caught first, so nothing behind the dialog also acts on the key */
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } };
  const close = () => {
    removeEventListener('keydown', onKey, true);
    dim.classList.add('is-closing');
    setTimeout(() => dim.remove(), 150);
  };
  dim.append(h('div', { class: 'pb-dlg pb-confirm', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': title },
    h('h2', { class: 'pb-dlg-t' }, title),
    h('p', { class: 'pb-confirm-lead' }, lead),
    items.length ? h('ul', { class: 'pb-confirm-list' },
      ...items.map(it => h('li', {}, h('span', { class: 'pb-confirm-n' }, it.n), h('span', { class: 'pb-confirm-t' }, it.t)))) : null,
    h('footer', { class: 'pb-confirm-foot' },
      h('button', { class: 'pb-btn', type: 'button', onclick: close }, 'Cancel'),
      h('button', { class: 'pb-btn pb-btn--danger', type: 'button', onclick: () => { close(); run(); } }, action))));
  document.body.append(dim);
  addEventListener('keydown', onKey, true);
  requestAnimationFrame(() => dim.querySelector('.pb-btn')?.focus());
}

const PB_SVG = {
  clip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
    + 'stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5 12.5 20a5 5 0 0 1-7-7L14 '
    + '4.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L15.5 7.6"/></svg>',
  dots: '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.2"/>'
    + '<circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/></svg>',
  chev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" '
    + 'stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5 10.5 8 6 12.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
    + 'stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-5.2-5.2"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" '
    + 'stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>',
};

/* the three positions, drawn the same everywhere they appear */
const PB_POS = {
  preferred: { label: 'Starting position', svg: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="3.2" fill="currentColor"/></svg>' },
  walkaway:  { label: 'Not acceptable',    svg: '<svg viewBox="0 0 16 16"><path d="M8 4.6 11.4 10.8H4.6Z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/></svg>' },
  fallback:  { label: 'Fallback',          svg: '<svg viewBox="0 0 16 16"><path d="M5 6.6 8 10l3-3.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
};
const pbMark = (k, set = true) => h('span', { class: 'pb-mark' + (set ? '' : ' is-unset'),
  'data-k': k, html: PB_POS[k].svg });

/* ==================================================================
   The list
   The whole width of the page: a title and the one thing you came to
   do, then every playbook as a row you can scan — what it is, whether
   it is in use, whose it is, and when it last moved.
================================================================== */

/* live, draft, archived — each with a mark that says it before the word */
const PB_STATUS = {
  /* Linear's circles: a ring filling up while it is being written, full
     with a tick once it is in use, grey and closed once it is put away */
  live:     { label: 'Published',
    svg: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="currentColor"/>'
      + '<path d="M5.4 8.2l1.8 1.8 3.5-3.7" fill="none" stroke="#fff" stroke-width="1.5" '
      + 'stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  draft:    { label: 'Draft',
    svg: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.9" fill="none" stroke="currentColor" '
      + 'stroke-width="1.5"/><path d="M8 4.6a3.4 3.4 0 0 1 0 6.8z" fill="currentColor"/></svg>' },
  archived: { label: 'Archived',
    svg: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="currentColor"/>'
      + '<path d="M5.3 8h5.4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>' },
};
const pbStatus = (k) => h('span', { class: 'pb-st', 'data-st': k },
  h('span', { class: 'pb-st-ic', html: PB_STATUS[k].svg }), PB_STATUS[k].label);

/* Today and yesterday by name; anything older as a date, with the year
   only once it is not this one. */
function pbWhen(iso) {
  const d = new Date(iso), now = new Date();
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 864e5);
  const hm = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return `Today, ${hm}`;
  if (diff === 1) return `Yesterday, ${hm}`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short',
    ...(d.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }) });
}

const PB_COLS = [
  { key: 'name',    label: 'Name' },
  { key: 'status',  label: 'Status' },
  { key: 'clauses', label: 'Clauses', num: true },
  { key: 'version', label: 'Version', num: true },
  { key: 'owner',   label: 'Owner' },
  { key: 'updated', label: 'Last updated' },
];
const PB_ORDER = { live: 0, draft: 1, archived: 2 };
const pbSortVal = (pb, key) => key === 'updated' ? pb.updated
  : key === 'status' ? PB_ORDER[pb.status]
  : key === 'clauses' ? pb.clauses.length
  : key === 'version' ? pb.version
  : (pb[key] || '').toLowerCase();

function playbookIndex() {
  /* a playbook started and never written in is not worth keeping */
  const kept = pbList().filter(pb => !pbEmpty(pb));
  if (kept.length !== pbList().length) { state.playbooks = kept; save(); }

  const rows = h('div', { class: 'pb-tbody', role: 'rowgroup' });
  const empty = h('div', { class: 'pb-empty' });
  const head = h('div', { class: 'pb-tr pb-thead', role: 'row' });

  const paintHead = () => head.replaceChildren(
    ...PB_COLS.map(c => {
      const on = PB.sort.key === c.key;
      return h('button', { class: 'pb-th' + (on ? ' is-on' : '') + (c.num ? ' pb-th-num' : ''), type: 'button', role: 'columnheader',
        'aria-sort': on ? (PB.sort.dir < 0 ? 'descending' : 'ascending') : 'none',
        onclick: () => {
          PB.sort = on ? { key: c.key, dir: -PB.sort.dir }
            : { key: c.key, dir: c.key === 'updated' || c.num ? -1 : 1 };
          paint();
        } },
        c.label,
        h('span', { class: 'pb-th-ar', 'data-dir': on ? PB.sort.dir : 0, html: PB_SVG.chev }));
    }),
    h('span', { class: 'pb-th pb-th-act', role: 'columnheader', 'aria-label': 'Actions' }));

  const counts = () => {
    const n = { all: 0, live: 0, draft: 0, archived: 0 };
    for (const pb of pbList()) { n.all++; n[pb.status]++; }
    return n;
  };
  /* Words, not pills: the one you are on is ink, underlined, and the
     line moves to the next one rather than jumping. */
  const bar = h('span', { class: 'pb-tab-bar', 'aria-hidden': 'true' });
  const tabBtns = ['all', 'live', 'draft', 'archived'].map(k =>
    h('button', { class: 'pb-tab', type: 'button', role: 'tab', 'data-k': k,
      onclick: () => { PB.status = k; paint(); } },
      k === 'all' ? 'All' : PB_STATUS[k].label,
      h('span', { class: 'pb-tab-n' })));
  const tabs = h('div', { class: 'pb-tabs', role: 'tablist' }, ...tabBtns, bar);
  const placeBar = () => {
    const on = tabBtns.find(b => b.dataset.k === PB.status);
    if (!on?.offsetWidth) return;
    bar.style.width = on.offsetWidth + 'px';
    bar.style.transform = `translateX(${on.offsetLeft}px)`;
    bar.classList.add('is-placed');
  };
  const paintTabs = () => {
    const n = counts();
    for (const b of tabBtns) {
      b.setAttribute('aria-selected', String(b.dataset.k === PB.status));
      b.querySelector('.pb-tab-n').textContent = n[b.dataset.k];
    }
    placeBar();
    if (!bar.classList.contains('is-placed')) requestAnimationFrame(placeBar);
  };

  const paint = () => {
    const q = PB.find.trim().toLowerCase();
    const { key, dir } = PB.sort;
    const list = pbList()
      .filter(pb => PB.status === 'all' || pb.status === PB.status)
      .filter(pb => !q || (pb.name + ' ' + pb.owner + ' ' + (pb.description || '')).toLowerCase().includes(q))
      .sort((a, b) => {
        const x = pbSortVal(a, key), y = pbSortVal(b, key);
        return (x < y ? -1 : x > y ? 1 : 0) * dir;
      });
    rows.replaceChildren(...list.map(pbRow));
    empty.textContent = q ? 'No playbook matches that search.'
      : PB.status === 'all' ? 'No playbooks yet.' : `No ${PB_STATUS[PB.status].label.toLowerCase()} playbooks.`;
    empty.hidden = list.length > 0;
    paintHead(); paintTabs();
    PB.flash = null;
    setTimeout(() => { const t = rows.closest('.pb-table'); if (t) pbFitWatch(t); }, 0);
  };
  PB.repaintList = paint;

  /* search is a glass until it is wanted, as it is inside a playbook */
  const qIn = h('input', { type: 'search', placeholder: 'Search playbooks', 'aria-label': 'Search playbooks',
    value: PB.find, oninput: (e) => { PB.find = e.target.value; paint(); },
    onkeydown: (e) => {
      if (e.key !== 'Escape') return;
      e.target.value = ''; PB.find = ''; paint(); search.classList.remove('is-open'); e.target.blur();
    },
    onblur: () => { if (!PB.find) search.classList.remove('is-open'); } });
  const search = h('div', { class: 'pb-find pb-list-find' + (PB.find ? ' is-open' : '') },
    h('button', { class: 'pb-find-btn', type: 'button', 'aria-label': 'Search playbooks', 'data-tip': 'Search Playbooks', html: PB_SVG.search,
      onclick: () => { search.classList.add('is-open'); qIn.focus(); } }),
    qIn);

  paint();
  return h('div', { class: 'pb' },
    h('header', { class: 'lib-head pb-head' },
      h('h1', { class: 'view-title' }, 'Playbooks'),
      h('button', { class: 'btn btn--primary pb-new', type: 'button', 'aria-haspopup': 'menu',
        'aria-expanded': 'false',
        onclick: (e) => { e.stopPropagation(); newPlaybookMenu(e.currentTarget, { keyboard: e.detail === 0 }); } },
        icon('plus', 'ico ico-14'), 'New Playbook')),
    /* one object: the filter is the table's own top edge, the column
       names a band under it, and the rows inside the same border */
    h('div', { class: 'pb-card' },
      h('div', { class: 'pb-bar-list' }, tabs, search),
      h('div', { class: 'pb-table', role: 'table', 'aria-label': 'Playbooks' }, head, rows, empty)));
}

function pbRow(pb) {
  const more = h('button', { class: 'pb-row-more', type: 'button', 'aria-label': `Actions for ${pb.name}`, 'data-tip': 'More Actions',
    html: PB_SVG.dots,
    onclick: (e) => { e.stopPropagation(); pbMenu(more, pb, row); } });
  const row = h('div', { class: 'pb-tr pb-row' + (PB.flash === pb.id ? ' is-new' : ''),
    role: 'row', tabindex: '0',
    onclick: () => openPlaybook(pb.id, 'view'),
    onkeydown: (e) => { if (e.key === 'Enter' && e.target === row) openPlaybook(pb.id, 'view'); } },
    h('span', { class: 'pb-td pb-td-name', role: 'cell' },
      h('span', { class: 'pb-doc-ic', 'aria-hidden': 'true' }),
      h('span', { class: 'pb-row-name' }, pb.name || 'Untitled playbook')),
    h('span', { class: 'pb-td', role: 'cell' }, pbStatus(pb.status)),
    h('span', { class: 'pb-td pb-td-num', role: 'cell' }, String(pb.clauses.length)),
    h('span', { class: 'pb-td pb-td-num', role: 'cell' }, 'v' + pb.version),
    h('span', { class: 'pb-td pb-td-owner', role: 'cell' },
      faceEl(pb.owner, 'pb-av'), h('span', { class: 'pb-owner-n' }, pb.owner)),
    h('span', { class: 'pb-td pb-td-when', role: 'cell' }, pbWhen(pb.updated)),
    h('span', { class: 'pb-td pb-td-act', role: 'cell' }, more));
  return row;
}

/* the same four things wherever a playbook is, the destructive one last */
function pbMenu(anchor, pb, row) {
  if (typeof mxGlyphs === 'function') mxGlyphs();   // the eye for View lives with the module glyphs
  GLYPHS.retitle ||= '<path d="M5.5 7V5.5h13V7"/><path d="M12 5.5v13"/><path d="M9.5 18.5h5"/>';
  menu(anchor, [
    { label: 'View', icon: 'look', run: () => openPlaybook(pb.id, 'view') },
    { label: 'Edit with Chat', icon: 'rename', run: () => openPlaybook(pb.id, 'edit') },
    { label: 'Rename', icon: 'retitle', run: () => renamePlaybook(pb) },
    { label: 'Share', icon: 'share', run: () => sharePlaybook(pb) },
    { label: 'Duplicate', icon: 'copy', run: () => duplicatePlaybook(pb) },
    { rule: true },
    { label: 'Delete', icon: 'trash', danger: true, run: () => deletePlaybook(pb, row) },
  ]);
}

/* Renaming from the list: a small dialog with the name selected, so typing
   replaces it. Enter keeps it, Escape or a click outside leaves it as it was. */
function renamePlaybook(pb) {
  const dim = h('div', { class: 'pb-dim', onclick: (e) => { if (e.target === dim) close(); } });
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } };
  const close = () => { removeEventListener('keydown', onKey, true); dim.classList.add('is-closing'); setTimeout(() => dim.remove(), 150); };
  const input = h('input', { class: 'pb-rename-in', type: 'text', value: pb.name || '', placeholder: 'Untitled playbook',
    'aria-label': 'Playbook name', spellcheck: 'false',
    oninput: () => { ok.disabled = !input.value.trim() || input.value.trim() === (pb.name || ''); },
    onkeydown: (e) => { if (e.key === 'Enter' && !ok.disabled) keep(); } });
  const keep = () => {
    const was = pb.name;
    pb.name = input.value.trim(); pbTouch(pb); save();
    close();
    PB.flash = pb.id; PB.repaintList?.();
    pbToast(`Renamed to “${pb.name}”`, { label: 'Undo', run: () => { pb.name = was; save(); PB.flash = pb.id; PB.repaintList?.(); } });
  };
  const ok = h('button', { class: 'pb-btn pb-btn--primary', type: 'button', disabled: true, onclick: keep }, 'Rename');
  dim.append(h('div', { class: 'pb-dlg pb-confirm pb-rename', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Rename playbook' },
    h('h2', { class: 'pb-dlg-t' }, 'Rename Playbook'),
    input,
    h('footer', { class: 'pb-confirm-foot' },
      h('button', { class: 'pb-btn', type: 'button', onclick: close }, 'Cancel'), ok)));
  document.body.append(dim);
  addEventListener('keydown', onKey, true);
  requestAnimationFrame(() => { input.focus(); input.select(); });
}

/* the share dialog the rest of the app uses, pointed at a playbook */
function sharePlaybook(pb) {
  pb.share ||= { people: [{ name: pb.owner, role: 'owner' }], general: 'me',
    generalRole: 'view', published: false };
  publishDialog({ id: 'playbook:' + pb.id, name: pb.name || 'Untitled playbook', kind: 'chat',
    url: `clavia.app/playbooks/${pb.id}`, publish: pb.share }, save);
}

function duplicatePlaybook(pb) {
  const copy = structuredClone(pb);
  Object.assign(copy, pbNew({ name: (pb.name || 'Untitled playbook') + ' copy' }));
  /* a copy starts its own history */
  delete copy.share; delete copy.versions; delete copy.published; delete copy.synced;
  copy.clauses.forEach(c => { c.id = pbUid('clause'); });
  const list = pbList();
  list.splice(list.indexOf(pb) + 1, 0, copy);
  save();
  PB.flash = copy.id;
  closePlaybook(); go('playbooks');
}

function deletePlaybook(pb, row) {
  const list = pbList();
  const at = list.indexOf(pb);
  list.splice(at, 1); save();
  const undo = { label: 'Undo', run: () => {
    pbList().splice(at, 0, pb); save();
    PB.flash = pb.id;
    closePlaybook(); go('playbooks');
  } };
  if (row?.isConnected) pbLeave(row, () => PB.repaintList?.());
  else { closeArtifact?.(); closePlaybook(); go('playbooks'); }
  pbToast(`Deleted “${pb.name || 'Untitled playbook'}”`, undo);
}

/* ── New playbook ─────────────────────────────────────────────
   Three ways in, each said in a line: let Clavia draft it, start from a
   standard one, or write it yourself. */
const PB_WAYS = [
  { key: 'ai', name: 'Build with AI',
    desc: 'Describe it or hand over reference files, and Clavia drafts every clause.',
    icon: () => quillEl('static', { cls: 'pb-way-quill' }) },
  { key: 'template', name: 'Choose from template',
    desc: 'Start from a standard playbook and make it yours.',
    icon: () => icon('templates', 'ico') },
  { key: 'manual', name: 'Build manually',
    desc: 'A blank playbook. Write each clause and position yourself.',
    icon: () => h('span', { html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" '
      + 'stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 2.9l2.5 2.5L6 12.5 '
      + '3 13l.5-3z"/><path d="M9.2 4.3l2.5 2.5"/></svg>' }) },
];

function newPlaybookMenu(anchor, { keyboard = false } = {}) {
  pbWaysMenu(anchor, 'pb-new', PB_WAYS, (k) => {
    if (k === 'ai') { PB.open = 'new'; PB.prompt = ''; PB.refs = []; go('playbooks'); }
    else if (k === 'template') templatePicker();
    else startBlankPlaybook();
  }, { keyboard });
}

/* A menu of a few ways to do something, each with an icon, a name and a
   line saying what it does. Opens under its button, right edges aligned. */
function pbWaysMenu(anchor, id, ways, pick, { keyboard = false, small = false } = {}) {
  if (openMenu && openMenu.dataset.for === id) return closeMenu();
  closeMenu();
  const el = h('div', { class: 'menu pb-ways' + (small ? ' pb-ways--sm' : ''), role: 'menu', 'data-for': id,
    onkeydown: (e) => {
      const items = [...el.querySelectorAll('.pb-way')];
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    } },
    /* a row is a way to do it; `sec` is a label over the rows that follow,
       and `on` ticks the one already chosen */
    ...ways.map(w => w.sec ? h('div', { class: 'pb-way-sec' }, w.sec)
      : h('button', { class: 'pb-way' + (w.on ? ' is-on' : ''), type: 'button', role: 'menuitem',
      'data-way': w.key, onclick: () => { closeMenu(); pick(w.key); } },
      h('span', { class: 'pb-way-ic' }, w.icon()),
      h('span', { class: 'pb-way-t' },
        h('span', { class: 'pb-way-n' }, w.name),
        w.desc ? h('span', { class: 'pb-way-d' }, w.desc) : null),
      w.on ? h('span', { class: 'pb-way-tick', html: PB_SVG.check }) : null)));
  document.body.append(el);
  openMenu = el;
  anchor.setAttribute('aria-expanded', 'true');
  const r = anchor.getBoundingClientRect();
  el.style.top = (r.bottom + 6) + 'px';
  el.style.left = Math.max(12, Math.min(r.right - el.offsetWidth, innerWidth - el.offsetWidth - 12)) + 'px';
  el.classList.add('opening');
  el.addEventListener('click', e => e.stopPropagation());
  /* the button forgets it was open whenever the menu goes, however it goes */
  new MutationObserver((_, obs) => {
    if (!el.isConnected) { anchor.setAttribute('aria-expanded', 'false'); obs.disconnect(); }
  }).observe(document.body, { childList: true });
  /* from the keyboard, focus goes into the menu; with a pointer it stays
     put, so the only lit row is the one under the cursor */
  if (keyboard) requestAnimationFrame(() => el.querySelector('.pb-way')?.focus({ preventScroll: true }));
}

/* ── from a template ──────────────────────────────────────────
   The standard playbooks, as they ship. Picking one makes a draft copy
   that is yours; the template stays as it was. */
function templatePicker() {
  const dim = h('div', { class: 'pb-dim', onclick: (e) => { if (e.target === dim) close(); } });
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const close = (now) => {
    document.removeEventListener('keydown', onKey);
    if (now) return dim.remove();
    dim.classList.add('is-closing');
    setTimeout(() => dim.remove(), 150);
  };
  const use = (t) => {
    close(true);
    const pb = pbNew({ name: t.name, description: t.description,
      clauses: structuredClone(t.clauses).map(c => pbNormClause({ ...c, id: pbUid('clause') })) });
    pbList().unshift(pb); save();
    pbEditInChat(pb, [
      { role: 'user', text: `Start a playbook from the ${t.name} template.` },
      { role: 'bot', cites: null,
        answer: `Here is your copy of ${t.name} — ${pb.clauses.length} clauses, as the template has them. `
          + 'It is a draft and it is yours: the template itself stays as it was.\n\n'
          + 'Tell me what is different about how you negotiate, and I will change it clause by clause.',
        steps: [{ source: 'playbook', query: 'Copied the ' + t.name + ' template', count: 'v1' }],
        suggest: pbSuggest(pb) },
    ]);
  };
  dim.append(h('div', { class: 'pb-dlg', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Choose a template' },
    h('header', { class: 'pb-dlg-head' },
      h('h2', { class: 'pb-dlg-t' }, 'Choose a template'),
      h('button', { class: 'pb-icon-btn', type: 'button', 'aria-label': 'Close', 'data-tip': 'Close', onclick: () => close(),
        html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" '
          + 'stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>' })),
    h('div', { class: 'pb-tpls' },
      ...PLAYBOOK_SEED.map(t => h('button', { class: 'pb-tpl', type: 'button', onclick: () => use(t) },
        icon('playbooks', 'ico pb-tpl-ic'),
        h('span', { class: 'pb-tpl-t' },
          h('span', { class: 'pb-tpl-n' }, t.name),
          h('span', { class: 'pb-tpl-d' }, t.description)),
        h('span', { class: 'pb-tpl-ct' }, `${t.clauses.length} clauses`))))));
  document.body.append(dim);
  document.addEventListener('keydown', onKey);
  requestAnimationFrame(() => dim.querySelector('.pb-tpl')?.focus());
}

function startBlankPlaybook() {
  const pb = pbNew({ name: '', description: '', clauses: [pbBlankClause()] });
  pbList().unshift(pb); save();
  pbEditInChat(pb, [
    { role: 'user', text: 'Start a blank playbook.' },
    { role: 'bot', cites: null,
      answer: 'A blank playbook is open beside this chat, with one empty clause. Name it and write the '
        + 'positions yourself — or tell me the kind of agreement and I will draft the clauses for you.',
      steps: [{ source: 'playbook', query: 'Started a blank playbook', count: 'v1' }] },
  ]);
  setTimeout(() => document.querySelector('.pbv-title')?.focus(), 400);
}

/* ── Build with AI ────────────────────────────────────────────
   The same page as New Chat, asked a different question: the quill,
   the heading, one box — the New Chat composer itself, with a + that
   only brings in reference material: a file from this computer, or one
   from where the team keeps them. */
const PB_SOURCES = {
  sharepoint: { name: 'SharePoint', where: 'Legal · Contracts', files: [
    'Reseller Agreement – Standard Terms v3.docx', 'Commercial Contracting Playbook 2025.docx',
    'Fallback Clause Library.xlsx', 'Northwind MSA – Executed.pdf'] },
  onedrive: { name: 'OneDrive', where: 'My files · Contracts', files: [
    'Reseller agreement (our paper) v2.docx', 'Payment terms guidance.docx',
    'Signed reseller agreements FY25.pdf'] },
  drive: { name: 'Google Drive', where: 'Shared drives · Legal', files: [
    'Partner agreement redlines – Acme.docx', 'Negotiation notes – Q3', 'Exclusivity and territory positions',
    'Channel program term sheet.pdf'] },
  imanage: { name: 'iManage', where: 'Workspaces · Commercial Contracts', files: [
    'MSA – Reseller Program (Final).docx', 'Reseller Agreement – Clause Bank.docx',
    'Harbor Retail – Signed Distribution Agreement.pdf', 'Negotiation memo – territory carve-outs.docx'] },
  dropbox: { name: 'Dropbox', where: 'Team folders · Legal', files: [
    'Reseller agreement – redline from Acme.docx', 'Territory and exclusivity – precedent.pdf',
    'Channel partner FAQ.docx'] },
  box: { name: 'Box', where: 'Legal · Templates', files: [
    'Reseller Agreement.docx', 'Distribution Agreement – Harbor.pdf', 'Legacy reseller playbook.pdf'] },
};
/* ── Equal spacing between columns (14 Oct, "make all the columns equally spaced").
   Every column is as wide as its widest content (header included); the widest one,
   the name, gives way first when space is short; whatever is left over is shared
   equally between the columns, so the white space between any two is the same.
   Hidden columns (container queries) are left out. No cap: on a wide screen every gap
   grows by the same amount ("The columns should be equally spaced"). ── */
function pbFit(table) {
  if (!table || !table.isConnected || table.hidden) return;
  const head = table.querySelector('.pb-thead');
  if (!head || !head.offsetWidth) return;
  const vis = (el) => getComputedStyle(el).display !== 'none';
  const lines = [head, ...table.querySelectorAll('.pb-row')];
  const n = [...head.children].filter(vis).length;
  if (n < 2) return;
  table.style.setProperty('--pb-fit', `repeat(${n}, max-content)`);
  table.classList.add('is-measuring'); table.classList.remove('is-fit');
  const w = new Array(n).fill(0);
  for (const line of lines) [...line.children].filter(vis).forEach((c, i) => { if (i < n) w[i] = Math.max(w[i], Math.ceil(c.getBoundingClientRect().width)); });
  table.classList.remove('is-measuring');
  const cs = getComputedStyle(head);
  const avail = head.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  let lead = 0; w.forEach((x, i) => { if (i < n - 1 && x > w[lead]) lead = i; });
  const MIN = 24, sum = w.reduce((a, b) => a + b, 0);
  let gap = (avail - sum) / (n - 1);
  if (gap < MIN) { gap = MIN; w[lead] = Math.max(160, w[lead] - (sum + MIN * (n - 1) - avail)); }
  table.style.setProperty('--pb-fit', w.map((x, i) => i === lead ? `minmax(0, ${x}px)` : `${x}px`).join(' '));
  table.style.setProperty('--pb-gap', gap.toFixed(1) + 'px');
  table.classList.add('is-fit');
  /* on a list page the title, the filters and the column names stick; each sits under the one above */
  const page = table.closest('.view > .pb'), lh = page?.querySelector(':scope > .lib-head'), card = table.closest('.pb-card');
  if (page && lh && card && card.parentElement === page) {
    page.classList.add('is-list');
    const bar = card.querySelector(':scope > .pb-bar-list');
    page.style.setProperty('--stk1', lh.offsetHeight + 'px');
    page.style.setProperty('--stk2', lh.offsetHeight + (bar ? bar.offsetHeight : 0) + 'px');
  }
}
/* fit now, and again whenever the table changes width */
function pbFitWatch(table) {
  setTimeout(() => pbFit(table), 0);
  if (table._fitRO) return;
  let raf = 0;
  table._fitRO = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => pbFit(table)); });
  table._fitRO.observe(table);
  document.fonts?.ready.then(() => pbFit(table));
}

const pbBrand = (id, size = 16) => `<svg class="ic ic-brand" width="${size}" height="${size}" `
  + `viewBox="0 0 24 24"><use href="#b-${id}"></use></svg>`;
/* a paperclip in ink, so it holds its own next to the full-colour logos below it */
const PB_UPLOAD = '<svg class="ic ic-clip" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
  + 'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'
  + '<path d="M20.5 11.2l-8.3 8.3a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9"/></svg>';

function pbCreatePage() {
  const glyph = quillEl('greet', { cls: 'home-glyph', then: 'idle' });
  const ta = h('textarea', { rows: '2', 'aria-label': 'Describe the playbook',
    placeholder: 'Describe what the playbook should cover, or add relevant files' });
  ta.value = PB.prompt;
  ta.addEventListener('input', () => { PB.prompt = ta.value; });

  const send = h('button', { class: 'send', type: 'button', disabled: true, 'aria-label': 'Create playbook', html: ARROW });
  const box = h('div', { class: 'ask pb-create-ask' }, ta, h('div', { class: 'askbar' }, send));
  const status = h('div', { class: 'pb-create-status', 'aria-live': 'polite' });

  let composer = null;
  const addFile = (name, mark) => composer?.addPill({ kind: 'file', label: name, mark });
  const file = h('input', { type: 'file', multiple: true, hidden: true,
    accept: '.docx,.doc,.pdf,.txt,.md,.rtf,.odt,.xlsx',
    onchange: (e) => { for (const f of e.target.files) addFile(f.name, PB_UPLOAD); e.target.value = ''; } });
  box.append(file);

  /* the + menu: this computer first, then the places files live */
  const attach = [
    { label: 'Upload files', mark: PB_UPLOAD, run: () => file.click() },
    ...Object.entries(PB_SOURCES).map(([id, src]) => ({
      label: src.name, mark: pbBrand(id),
      run: () => sourcePicker(id, (names) => names.forEach(n => addFile(n, pbBrand(id)))),
    })),
    /* then what the drafter may look up beyond the files: standards, ISO
       texts, market practice. Toggles, so the menu stays open */
    { sep: true },
    { src: 'web' },
    { src: 'deep' },
  ];

  for (const t of ['dragenter', 'dragover']) {
    box.addEventListener(t, (e) => { e.preventDefault(); box.classList.add('is-over'); });
  }
  box.addEventListener('dragleave', () => box.classList.remove('is-over'));
  box.addEventListener('drop', (e) => {
    e.preventDefault(); box.classList.remove('is-over');
    for (const f of e.dataTransfer.files) addFile(f.name, PB_UPLOAD);
  });

  /* a file on its own is enough to go on, so it counts as something to send */
  const syncSend = () => { send.disabled = !(ta.value.trim() || composer?.pills.some(p => p.kind === 'file')) || box.classList.contains('is-busy'); };
  ta.addEventListener('input', syncSend);
  new MutationObserver(syncSend).observe(box, { childList: true, subtree: true });

  const run = (text, pills) => {
    const files = pills.filter(p => p.kind === 'file').map(p => ({ name: p.label, src: /#b-([\w-]+)/.exec(p.mark || '')?.[1] }));
    box.classList.add('is-busy'); ta.disabled = true;
    /* the composer empties the box once it has sent; put the brief and its
       files back, so they stay in view while the playbook is written */
    setTimeout(() => { ta.value = text; pills.forEach(p => composer.addPill(p)); syncSend(); }, 0);
    quillState(glyph, 'work');
    buildPlaybook(text, files, (step) => status.replaceChildren(h('span', { class: 'pb-step' }, step)));
  };

  const page = h('div', { class: 'home pb-create' },
    h('button', { class: 'pb-create-back', type: 'button',
      onclick: () => { closePlaybook(); go('playbooks'); } },
      h('span', { class: 'pb-create-back-ar', html: PB_SVG.chev }), 'Playbooks'),
    h('div', { class: 'home-head' }, glyph, h('h1', { class: 'display' }, 'Create New Playbook')),
    h('div', { class: 'askwrap' }, box, status));

  /* wired once it is in the document, as the composer on Home is — it
     measures its own menu to decide which way it opens */
  queueMicrotask(() => {
    composer = initComposer(box, {
      noModel: true, noTokens: true, attach,
      onSend: (_, { pills }) => run(ta.value.trim() || PB.prompt.trim(), pills),
    });
    syncSend();
    /* a demo arrives with its files already added, and starts on its own */
    if (PB.demo) {
      const d = PB.demo; PB.demo = null;
      d.files.forEach(f => addFile(f.name, f.src ? pbBrand(f.src) : PB_UPLOAD));
      if (d.go) setTimeout(() => { if (page.isConnected && !send.disabled) send.click(); }, d.go);
    }
  });
  /* you came here to type: the box has the caret the moment you land */
  const focus = () => { if (page.isConnected && !ta.disabled) ta.focus({ preventScroll: true }); };
  setTimeout(focus, 0); setTimeout(focus, 120);
  return page;
}

/* A small picker for a connected source: its recent files, tick the ones
   you want, add them. */
function sourcePicker(id, onPick) {
  const src = PB_SOURCES[id];
  const chosen = new Set();
  const dim = h('div', { class: 'pb-dim', onclick: (e) => { if (e.target === dim) close(); } });
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const close = () => {
    document.removeEventListener('keydown', onKey);
    dim.classList.add('is-closing'); setTimeout(() => dim.remove(), 150);
  };
  const add = h('button', { class: 'btn btn--primary', type: 'button', disabled: true,
    onclick: () => { onPick([...chosen]); close(); } }, 'Add');
  const paintAdd = () => {
    add.disabled = !chosen.size;
    add.textContent = chosen.size > 1 ? `Add ${chosen.size} files` : 'Add';
  };
  const rows = src.files.map(n => {
    const b = h('button', { class: 'pb-src-f', type: 'button', role: 'checkbox', 'aria-checked': 'false',
      onclick: () => {
        chosen.has(n) ? chosen.delete(n) : chosen.add(n);
        b.setAttribute('aria-checked', String(chosen.has(n)));
        paintAdd();
      } },
      h('span', { class: 'pb-src-box', html: PB_SVG.check }),
      h('span', { class: 'pb-src-n' }, n));
    return b;
  });
  dim.append(h('div', { class: 'pb-dlg pb-src', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'From ' + src.name },
    h('header', { class: 'pb-dlg-head' },
      h('div', { class: 'pb-src-head' },
        h('span', { class: 'pb-src-logo', html: pbBrand(id, 22) }),
        h('span', {},
          h('h2', { class: 'pb-dlg-t pb-src-t' }, src.name),
          h('span', { class: 'pb-src-where' }, src.where))),
      h('button', { class: 'pb-icon-btn', type: 'button', 'aria-label': 'Close', 'data-tip': 'Close', onclick: () => close(),
        html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" '
          + 'stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>' })),
    h('div', { class: 'pb-src-list' }, ...rows),
    h('footer', { class: 'pb-src-foot' },
      h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => close() }, 'Cancel'), add)));
  document.body.append(dim);
  document.addEventListener('keydown', onKey);
  requestAnimationFrame(() => rows[0]?.focus());
}

/* Scripted for now: the description (or the attached files' names)
   picks the closest standard playbook, and the draft starts from its
   clauses under the name you gave it. The seam for a real drafter. */
const PB_KINDS = [
  { id: 'nda',      re: /\b(nda|non-?disclosure|confidential)/i },
  { id: 'dpa',      re: /\b(dpa|data processing|gdpr|privacy|personal data)/i },
  { id: 'services', re: /\b(sow|statement of work|services|consult|implementation)/i },
  { id: 'supplier', re: /\b(supplier|procure|purchas|we are the (buyer|customer))/i },
  { id: 'saas',     re: /\b(saas|subscription|software|msa|licen|reseller|platform)/i },
];

function draftName(text) {
  const head = text.split(/\s+(?:where|in which|for when|when|that|with)\s+|[.,;:\n]/i)[0].trim();
  const words = head.split(/\s+/).filter(Boolean).slice(0, 6).join(' ');
  return words ? words[0].toUpperCase() + words.slice(1) : '';
}

/* the conversation a new playbook opens in: what you asked for, with the
   files you gave it, and the draft */
function pbBuiltIntro(pb, text, refs) {
  const fb = pb.clauses.filter(c => c.fallbacks.length).length;
  return [
    { role: 'user', text: text || `Build a playbook from ${refs.map(f => f.name).join(', ')}.`, files: refs.length ? refs : null },
    { role: 'bot', cites: null,
      answer: `Drafted ${pb.name} — ${pb.clauses.length} clauses, each with a starting position and what `
        + `we will not accept; ${fb} have a fallback.\n\n`
        + 'It is a draft: read each clause before you publish it. Tell me where you would hold firmer '
        + 'or give more, and I will change it as a new version.',
      steps: [
        refs.length
          ? { source: 'internal', query: 'Read the reference files', rows: refs.map(f => ({ title: f.name, meta: 'reference', source: typeof SOURCES !== 'undefined' && SOURCES[f.src] ? f.src : undefined })) }
          : { source: 'think', query: 'Read what the playbook is for' },
        { source: 'playbook', query: `Drafted ${pb.clauses.length} clauses`, count: 'v1' },
      ],
      suggest: pbSuggest(pb) },
  ];
}

function buildPlaybook(text, refs, onStep) {
  const refNames = refs.map(f => f.name.replace(/\.[^.]+$/, '')).join(' ');
  const hay = text + ' ' + refNames;
  const base = PLAYBOOK_SEED.find(p => p.id === (PB_KINDS.find(k => k.re.test(hay)) || { id: 'saas' }).id);
  const steps = [
    refs.length ? `Reading ${refs.length === 1 ? refs[0].name : refs.length + ' files'}` : 'Reading your description',
    `Choosing ${base.clauses.length} clauses`,
    'Writing each position',
  ];
  let i = 0;
  const tick = () => {
    onStep(steps[i]);
    if (++i < steps.length) return setTimeout(tick, 800);
    setTimeout(() => {
      if (state.view !== 'playbooks' || PB.open !== 'new') return;   // left while it was writing
      const pb = pbNew({
        name: draftName(text) || draftName(refNames) || base.name,
        description: text || base.description,
        clauses: structuredClone(base.clauses).map(c => pbNormClause({ ...c, id: pbUid('clause') })),
      });
      /* a demo's playbook keeps one address, so its conversation has a link that lasts */
      if (PB.fixedId) { pb.id = PB.fixedId; PB.fixedId = null; }
      pbList().unshift(pb); save();
      PB.prompt = ''; PB.refs = [];
      closePlaybook();
      pbEditInChat(pb, pbBuiltIntro(pb, text, refs));
    }, 800);
  };
  tick();
}

/* A field that writes straight into the playbook. Text areas size to
   what they hold, so a position reads as a paragraph, not a box. */
function pbField(tag, obj, key, commit, props = {}) {
  const f = h(tag, props);
  f.value = obj[key] || '';
  const native = CSS.supports('field-sizing', 'content');
  const grow = () => { if (native) return; f.style.height = 'auto'; f.style.height = f.scrollHeight + 'px'; };
  f.addEventListener('input', () => { obj[key] = f.value; if (tag === 'textarea') grow(); commit(); });
  if (tag === 'textarea') { f.rows = 1; requestAnimationFrame(grow); }
  return f;
}
