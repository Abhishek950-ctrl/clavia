/* ── Intake, as an inbox (INTAKE_FX.inbox) ────────────────────────
   The same requests as the list, read the way a shared mailbox is read:
   on the left, one row per request (what it is, where it came from, where
   it stands); on the right, the one you're on (what was asked, what has
   happened, and the facts that decide the next step). Arrow keys move,
   Enter opens the full request. The toggle beside New Request switches
   between this and the table, and the choice is remembered. */

const mxIntakeView = () => (INTAKE_FX.inbox && state.intakeView === 'inbox') ? 'inbox' : 'list';

/* list ⇄ inbox, the way a mail client switches layouts */
function mxViewToggle() {
  if (!INTAKE_FX.inbox) return null;
  const on = mxIntakeView();
  const b = (k, tip, svg) => h('button', { class: 'mx-vt-b' + (on === k ? ' is-on' : ''), type: 'button', 'aria-pressed': String(on === k), 'aria-label': tip, 'data-tip': tip,
    html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`,
    onclick: () => { if (on === k) return; state.intakeView = k; save(); go('intake'); } });
  return h('div', { class: 'mx-vt', role: 'group', 'aria-label': 'View' },
    b('list', 'Table View', '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>'),
    b('inbox', 'Inbox View', '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M10 4.5v15"/>'));
}

/* where a request stands, as a soft pill the eye can sort by */
function mxStatusPill(r) {
  const st = mxStages(r), at = mxStage(r), name = st[at];
  const k = mxWhoseMove(r) === 'Requester' && at < st.length - 1 ? 'wait'
    : at === st.length - 1 ? 'done' : at === 0 ? 'new' : /sign/i.test(name) ? 'sign' : 'work';
  const say = k === 'wait' ? 'Waiting on requester' : k === 'new' ? 'Not started' : name;
  return h('span', { class: 'mx-pill is-' + k }, say);
}

function mxInboxPage(list, tabsCfg, tabOf, header, filters = []) {
  const st = MX.intake.list;
  const q = () => (st.find || '').trim().toLowerCase();
  const tabs = [...tabsCfg, { k: 'all', label: 'All' }];
  const inTab = (r, k) => k === 'all' || (tabsCfg.find(t => t.k === k)?.in ? tabsCfg.find(t => t.k === k).in(r) : tabOf(r) === k);
  st.filters ||= {};
  const passes = (r) => filters.every(f => !(st.filters[f.key]?.length) || (f.test ? st.filters[f.key].some(v => f.test(v, r)) : st.filters[f.key].includes(f.of(r) ?? '')));
  const items = () => list().filter(passes).filter(r => inTab(r, st.tab)).filter(r => !q() || [r.id, r.title, r.counterparty, r.submitter, r.attorney, r.type].join(' ').toLowerCase().includes(q()))
    .sort((a, b) => (b.created || '') < (a.created || '') ? -1 : 1);

  const tabRow = h('div', { class: 'pb-tabs', role: 'tablist' });
  /* the same dropdowns as the table: a view, then the critical fields */
  const CHEV = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>';
  const drops = h('div', { class: 'mx-drops' });
  const nameOf = (f, v) => (f.label_of ? f.label_of(v) : v) || f.none || '—';
  const paintDrops = () => {
    const base = list().filter(passes), cur = tabs.find(t => t.k === st.tab) || tabs[0];
    const count = (t) => base.filter(r => inTab(r, t.k)).length;
    drops.replaceChildren(
      h('button', { class: 'mx-dd is-view', type: 'button', 'aria-haspopup': 'menu', onclick: (e) => { e.stopPropagation(); mxViewPop({ anchor: e.currentTarget, views: tabs.map(t => ({ label: t.label, n: count(t), on: t.k === st.tab, run: () => { st.tab = t.k; paint(); } })) }); } },
        cur.label, h('span', { class: 'mx-dd-n' }, String(count(cur))), h('span', { class: 'mx-dd-c', html: CHEV })),
      h('span', { class: 'mx-drops-sep' }),
      ...['stage', 'attorney', 'submitter', 'source', 'due'].map(k => filters.find(f => f.key === k)).filter(Boolean).map(f => {
        const on = st.filters[f.key] || [];
        const btn = h('button', { class: 'mx-dd' + (on.length ? ' is-on' : ''), type: 'button', 'aria-haspopup': 'true',
          onclick: (e) => { e.stopPropagation(); mxFilterPop({ anchor: btn, filters, items: list(), st, only: f.key, onChange: paint }); } },
          on.length ? `${f.label}: ${nameOf(f, on[0])}${on.length > 1 ? ' +' + (on.length - 1) : ''}` : f.label, h('span', { class: 'mx-dd-c', html: CHEV }));
        return btn;
      }));
  };
  const paintTabs = () => INTAKE_FX.drops ? paintDrops() : tabRow.replaceChildren(...tabs.map(t => h('button', { class: 'pb-tab', type: 'button', role: 'tab', 'aria-selected': String(st.tab === t.k),
    onclick: () => { st.tab = t.k; paint(); } }, t.label, h('span', { class: 'pb-tab-n' }, String(list().filter(r => inTab(r, t.k)).length)))));
  const qIn = h('input', { type: 'search', placeholder: 'Search intake', 'aria-label': 'Search intake', value: st.find || '', oninput: (e) => { st.find = e.target.value; paint(); } });
  const search = h('div', { class: 'pb-find pb-list-find is-open' }, h('span', { class: 'pb-find-btn', html: PB_SVG.search }), qIn);

  const rows = h('div', { class: 'mx-ibx-rows', role: 'listbox', 'aria-label': 'Requests', tabindex: '0' });
  const pane = h('section', { class: 'mx-ibx-pane' });
  const day = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const row = (r) => h('button', { class: 'mx-ibx-row' + (MX.intake.sel === r.id ? ' is-on' : ''), type: 'button', role: 'option', 'aria-selected': String(MX.intake.sel === r.id),
    onclick: () => select(r.id), ondblclick: () => mxOpen('intake', r.id) },
    h('span', { class: 'mx-ibx-t' }, r.title),
    /* who, which, where from, when, and where it stands: one quiet line, no icons or tags */
    h('span', { class: 'mx-ibx-meta' }, r.submitter, h('i', {}, '·'), r.id, h('i', {}, '·'), r.source ? mxChannel(r).name : 'Manual', h('i', {}, '·'), day(r.created),
      h('i', {}, '·'), h('span', { class: 'mx-ibx-st' + (mxWhoseMove(r) === 'Requester' ? ' is-wait' : '') }, mxStatusPill(r).textContent)));

  const paintRows = () => {
    const xs = items();
    if (!xs.find(r => r.id === MX.intake.sel)) MX.intake.sel = xs[0]?.id || null;
    /* one plain list, newest first: no bands ("Too many patches") */
    rows.replaceChildren(...(xs.length ? xs.map(row)
      : [h('p', { class: 'mx-ibx-none' }, q() ? `Nothing matches “${st.find.trim()}”.` : 'Nothing here.')]));
  };
  const select = (id) => { MX.intake.sel = id; paintRows(); paintPane(); rows.querySelector('.is-on')?.scrollIntoView({ block: 'nearest' }); };
  rows.addEventListener('keydown', (e) => {
    const xs = items(), i = xs.findIndex(r => r.id === MX.intake.sel);
    if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); if (xs[i + 1]) select(xs[i + 1].id); }
    if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); if (xs[i - 1]) select(xs[i - 1].id); }
    if (e.key === 'Enter' && MX.intake.sel) mxOpen('intake', MX.intake.sel);
  });

  /* the request on the right: what was asked, what happened, and the facts */
  const paintPane = () => {
    const r = list().find(x => x.id === MX.intake.sel) || mxIntake().find(x => x.id === MX.intake.sel);
    if (!r) { pane.replaceChildren(h('p', { class: 'mx-ibx-none' }, 'Pick a request on the left.')); return; }
    /* "use our constructs so that we cover everything": the request page itself, in the reader */
    if (!INTAKE_FX.inboxLite) { pane.classList.add('is-page'); pane.replaceChildren(intakePage(r, { embed: true })); return; }
    const ask = (r.activity || []).find(a => a.ev === 'submit');
    const story = (r.activity || []).filter(a => a !== ask).slice(-6);
    const docs = mxDocuments(r);
    const actRow = (a) => {
      const clavia = a.who === 'Clavia';
      const said = a.kind === 'reply' || a.kind === 'note';
      return h('div', { class: 'mx-ibx-ev' + (said ? ' is-said' : '') },
        h('div', { class: 'mx-ibx-ev-h' }, clavia ? h('span', { class: 'mx-dlg-q' }, quillEl('static', { cls: 'mx-dlg-qi' })) : mxFace(a.who, 'pb-av mx-ibx-av'),
          h('span', {}, h('b', {}, a.who === USER.name ? 'You' : a.who), ' ', said ? (a.kind === 'note' ? 'commented' : (MX_LEGAL.some(p => p.name === a.who) || clavia ? `wrote to ${r.submitter.split(' ')[0]}` : 'replied')) : a.what),
          h('span', { class: 'mx-ibx-when' }, pbWhen(a.when))),
        said ? h('p', { class: 'mx-ibx-said' }, a.what) : null,
        a.rule ? h('p', { class: 'mx-ibx-rule' }, a.rule) : null);
    };
    const fact = (k, v) => h('div', { class: 'mx-ibx-f' }, h('span', { class: 'mx-ibx-k' }, k), h('span', { class: 'mx-ibx-v' }, v));
    const stageBtn = mxStageBtn(r, () => setTimeout(() => { paintRows(); paintPane(); }, 420)); stageBtn._paint?.();
    pane.replaceChildren(
      h('header', { class: 'mx-ibx-ph' },
        h('span', { class: 'mx-ibx-pid' }, r.id), h('span', { class: 'mx-ibx-pt' }, r.title),
        h('span', { class: 'mx-ibx-pa' },
          INTAKE_FX.channel && r.submitter !== USER.name ? h('button', { class: 'pb-btn mx-ibx-contact', type: 'button', onclick: () => { MX.intake.contact = true; MX.intake.tab = 'activity'; mxOpen('intake', r.id); } },
            h('span', { class: 'mx-ibx-ic', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/></svg>' }), 'Contact Requester') : null,
          h('button', { class: 'pbv-icon', type: 'button', 'aria-label': 'Open request', 'data-tip': 'Open Request', onclick: () => mxOpen('intake', r.id),
            html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/></svg>' }))),
      h('div', { class: 'mx-ibx-body' },
        h('div', { class: 'mx-ibx-main' },
          h('h2', { class: 'mx-ibx-title' }, r.title),
          r.detail ? h('p', { class: 'mx-ibx-detail' }, r.detail) : null,
          h('h3', { class: 'mx-ibx-sec' }, 'Activity'),
          ask ? h('div', { class: 'mx-ibx-ev' }, h('div', { class: 'mx-ibx-ev-h' }, mxFace(ask.who, 'pb-av mx-ibx-av'), h('span', {}, h('b', {}, ask.who), ' ', ask.via ? `asked in ${mxChannel(r).name}` : ask.what),
              h('span', { class: 'mx-ibx-when' }, pbWhen(ask.when)))) : null,
          ask?.msg ? h('div', { class: 'mx-ibx-msg' }, h('div', { class: 'mx-ibx-ev-h' }, h('b', {}, ask.who), h('span', { class: 'mx-ibx-when' }, pbWhen(ask.when))),
            ask.msg.subject ? h('p', { class: 'mx-ibx-msg-s' }, ask.msg.subject) : null, h('p', {}, ask.msg.body)) : null,
          ...story.map(actRow),
          h('button', { class: 'st-more mx-ibx-all sx-link', type: 'button', onclick: () => { MX.intake.tab = 'activity'; mxOpen('intake', r.id); } }, `All activity on ${r.id}`)),
        h('aside', { class: 'mx-ibx-side' },
          h('h3', { class: 'mx-ibx-sec' }, 'Details'),
          fact('Status', mxStatusPill(r)),
          fact('Assignee', mxAttorneyBtn(r, () => setTimeout(() => { paintRows(); paintPane(); }, 420))),
          fact('Delegated to', ((d) => d ? h('span', { class: 'mx-dlg' }, h('span', { class: 'mx-dlg-q' }, quillEl('static', { cls: 'mx-dlg-qi' })), d) : h('span', { class: 'mx-none' }, 'None'))(mxDelegate(r))),
          fact('Created on', day(r.created)),
          fact('Due date', mxDue(r.due, mxStage(r) === mxStages(r).length - 1)),
          fact('Source', h('span', { class: 'mx-srcc' }, r.source ? h('img', { src: brandSrc(r.source), alt: '' }) : h('span', { class: 'mx-dlg-q' }, quillEl('static', { cls: 'mx-dlg-qi' })), r.source ? mxChannel(r).name : 'Manual')),
          fact('Request ID', r.id),
          h('h3', { class: 'mx-ibx-sec is-gap' }, 'Files'),
          docs.length ? h('div', { class: 'mx-ibx-files' }, ...docs.map(d => h('button', { class: 'mx-ibx-file', type: 'button', onclick: () => { MX.intake.tab = 'docs'; mxOpen('intake', r.id); } },
            mxTile('file', mxExt(d.title)), h('span', {}, d.title.replace(/\.docx?$/i, ''), h('i', {}, `v${d.versions.length}`)))))
            : h('p', { class: 'mx-none mx-ibx-nofile' }, 'No files yet'),
          h('h3', { class: 'mx-ibx-sec is-gap' }, 'Requester'),
          fact('Creator', h('span', { class: 'mx-dlg' }, mxFace(r.submitter, 'pb-av mx-ibx-av'), r.submitter)),
          r.team ? fact('Team', r.team) : null,
          r.counterparty ? fact('Counterparty', r.counterparty) : null)));
  };

  const paint = () => { paintTabs(); paintRows(); paintPane(); };
  paint();
  setTimeout(() => rows.focus({ preventScroll: true }), 0);
  const page = mxListPage(INTAKE_NAME, header, h('div', { class: 'mx-ibx-wrap' },
    h('div', { class: 'pb-bar-list mx-ibx-bar' + (INTAKE_FX.drops ? ' has-drops' : '') }, INTAKE_FX.drops ? drops : tabRow, search),
    h('div', { class: 'mx-ibx' }, rows, pane)));
  page.classList.add('mx-ibx-page');
  return page;
}
