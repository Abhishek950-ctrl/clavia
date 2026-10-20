/* ── Horizon ──────────────────────────────────────────────────────
   Legal's standing watch on the law. The list is every update across
   every watch, newest first, in four states (to review, in progress,
   done, archived), plus the key dates they carry. An update reads like a
   brief: what changed (every sentence cited), whether it applies to
   Lumen and why, what it touches in our own contracts, templates,
   playbook and open requests, and the steps that fix them, each with an
   owner, until it can be closed. Watches are made in plain words.
   Addresses: #horizon · #horizon/HZ-231 · #horizon/watches ·
   #horizon/watch/eu-data · #horizon/new · #settings/profile · #settings/delivery */

MX.horizon = { open: null, list: { tab: 'review', find: '', sort: { key: null, dir: 1 } } };

function hzData() {
  const d = mxData();
  if (!d.hz || d.hzV !== 1) {
    d.hz = { watches: structuredClone(HZ_WATCHES_SEED), updates: structuredClone(HZ_UPDATES_SEED), profile: structuredClone(HZ_PROFILE_SEED), delivery: structuredClone(HZ_DELIVERY_SEED) };
    d.hzV = 1; save();
  }
  return d.hz;
}
const hzWatch = (id) => hzData().watches.find(w => w.id === id);
const hzUpdate = (id) => hzData().updates.find(u => u.id === id);
const HZ_APPLIES = { yes: 'Applies', maybe: 'May apply', no: 'Doesn’t apply' };
const HZ_STATE = { review: 'To review', progress: 'In progress', done: 'Done', archived: 'Archived' };
const hzDay = (iso, yr = true) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(yr ? { year: 'numeric' } : {}) });
const hzDaysTo = (iso) => Math.round((new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')) - Date.now()) / 864e5);
const hzNext = (u) => (u.dates || []).filter(([d]) => hzDaysTo(d) >= 0).sort((a, b) => a[0] < b[0] ? -1 : 1)[0] || null;
const hzChecked = (m) => m <= 0 ? 'just now' : `${m} min ago`;
const hzAgoSay = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 6e4); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} hr ago` : pbWhen(iso); };
const hzStepsDone = (u) => u.steps.filter(s => s.status === 'done').length;
const hzLog = (u, what, who = USER.name) => { (u.log ||= []).push({ who, what, at: mxNow() }); save(); };
const hzApplies = (k) => h('span', { class: 'hz-ap is-' + k }, h('span', { class: 'hz-ap-dot' }), HZ_APPLIES[k]);
const hzOwner = (name, team) => name ? h('span', { class: 'hz-who' }, mxFace(name), h('span', {}, name)) : team ? h('span', { class: 'hz-who is-team' }, team) : h('span', { class: 'mx-none' }, '—');

function horizonView() {
  const o = MX.horizon.open;
  if (o === 'new') return hzCreatePage();
  if (o === 'watches') return hzWatchesPage();
  if (o && o.startsWith('watch/')) { const w = hzWatch(o.slice(6)); if (w) return hzWatchPage(w); }
  if (o && hzUpdate(o)) return hzUpdatePage(hzUpdate(o));
  MX.horizon.open = null;
  return hzListPage();
}

/* ── the list: every update, newest first ── */
const HZ_FLAG = { 'EU': '🇪🇺', 'UK': '🇬🇧', 'Ireland': '🇮🇪', 'Germany': '🇩🇪', 'France': '🇫🇷', 'California': '🇺🇸', 'Colorado': '🇺🇸', 'Virginia': '🇺🇸', 'Texas': '🇺🇸',
  'Connecticut': '🇺🇸', 'US': '🇺🇸', 'United Arab Emirates': '🇦🇪', 'Saudi Arabia': '🇸🇦', 'Qatar': '🇶🇦' };
const HZ_TOPIC = { 'HZ-231': 'Cloud contracts', 'HZ-238': 'Data protection', 'HZ-237': 'AI transparency', 'HZ-236': 'Transfers', 'HZ-235': 'Cybersecurity',
  'HZ-234': 'Automated decisions', 'HZ-233': 'Transfers', 'HZ-229': 'Financial services', 'HZ-230': 'Data protection', 'HZ-228': 'Cybersecurity' };
const hzTopic = (u) => u.topic || HZ_TOPIC[u.id] || hzWatch(u.watch)?.topics[0] || '';
const hzFlag = (j) => h('span', { class: 'hz-flag' }, h('span', { class: 'hz-flag-e', 'aria-hidden': 'true' }, HZ_FLAG[j] || '🌐'), j);
/* applies, drawn the way relevance is read at a glance: three bars, filled by how much it touches us */
const hzBars = (k) => h('span', { class: 'hz-bars is-' + k }, h('span', { class: 'hz-bars-i', 'aria-hidden': 'true' },
  ...[1, 2, 3].map(i => h('i', { class: i <= ({ yes: 3, maybe: 2, no: 1 })[k] ? 'is-on' : '' }))), HZ_APPLIES[k]);
const hzTag = (t) => h('span', { class: 'hz-tag' }, t);

function hzList(items, opts = {}) {
  const st = opts.st || MX.horizon.list;
  const t = mxTable({
    label: 'Updates', st, allLabel: 'All', empty: opts.empty || 'Nothing here. Horizon checks every hour.',
    grid: 'minmax(320px, 2.5fr) minmax(112px, 1fr) minmax(110px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(104px, 1fr) 28px',
    cols: [{ key: 'title', label: 'Update' }, { key: 'applies', label: 'Applies' }, { key: 'type', label: 'Type' }, { key: 'topic', label: 'Topic' },
      { key: 'juris', label: 'Jurisdiction' }, { key: 'date', label: 'Next date' }],
    tabs: opts.tabs === false ? [] : [{ k: 'review', label: 'To review' }, { k: 'progress', label: 'In progress' }, { k: 'done', label: 'Done' },
      { k: 'archived', label: 'Archived' },
      ...(opts.dates === false ? [] : [{ k: 'dates', label: 'Key dates', body: (q) => hzDates(items(), q) }])],
    tabOf: (u) => u.state,
    items, text: (u) => [u.id, u.title, u.lede, hzWatch(u.watch)?.name, u.juris, u.type, u.owner, hzTopic(u)].join(' '),
    filters: [
      { key: 'watch', label: 'Watch', of: (u) => hzWatch(u.watch)?.name || '' },
      { key: 'applies', label: 'Applies', of: (u) => HZ_APPLIES[u.applies], order: (v) => Object.values(HZ_APPLIES).indexOf(v) },
      { key: 'juris', label: 'Jurisdiction', of: (u) => u.juris },
      { key: 'type', label: 'Type', of: (u) => u.type },
      { key: 'owner', label: 'Owner', of: (u) => u.owner || '', none: 'No one yet' },
    ],
    val: (u, k) => k === 'title' ? -new Date(u.found) : k === 'applies' ? ['yes', 'maybe', 'no'].indexOf(u.applies) : k === 'date' ? (hzNext(u)?.[0] || '9') 
      : k === 'topic' ? hzTopic(u) : k === 'juris' ? u.juris : k === 'type' ? u.type : '',
    cells: (u) => { const n = hzNext(u), dd = n && hzDaysTo(n[0]);
      return [
        h('span', { class: 'hz-cell-u' }, h('span', { class: 'hz-cell-t' }, u.title), h('span', { class: 'hz-cell-l' }, u.lede),
          h('span', { class: 'hz-cell-s' }, hzAgoSay(u.found), h('span', { class: 'hz-cell-src' }, h('span', { class: 'hz-globe', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.5 2.6 14.5 0 17M12 3.5c-2.6 2.5-2.6 14.5 0 17"/></svg>' }), u.source[1]),
            opts.watch !== false ? h('span', { class: 'hz-cell-w' }, hzWatch(u.watch)?.name) : null,
            u.owner ? h('span', { class: 'hz-cell-o' }, mxFace(u.owner), u.owner) : null)),
        hzBars(u.applies), hzTag(u.type), hzTag(hzTopic(u)), hzFlag(u.juris),
        n ? h('span', { class: 'hz-date' + (dd <= 90 ? ' is-soon' : ''), 'data-tip': n[1] }, hzDay(n[0]), h('span', { class: 'hz-date-s' }, dd === 0 ? 'today' : `in ${dd} days`)) : h('span', { class: 'mx-none' }, '—')];
    },
    open: (u) => mxOpen('horizon', u.id),
    menu: (u) => [
      { label: 'Open', icon: 'files', run: () => mxOpen('horizon', u.id) },
      u.state === 'review' ? { label: 'Take this on', icon: 'person', run: () => { const was = [u.state, u.owner]; u.state = 'progress'; u.owner = USER.name; hzLog(u, 'took this on'); t.paint();
        pbToast(`${u.id} is yours`, { label: 'Undo', run: () => { [u.state, u.owner] = was; save(); t.paint(); } }); } } : null,
      u.state !== 'archived' ? { label: 'Archive', icon: 'archive', run: () => hzArchive(u, () => t.paint()) }
        : { label: 'Restore', icon: 'retry', run: () => { u.state = 'review'; u.dismissed = null; hzLog(u, 'restored this'); t.paint(); } },
    ],
  });
  t.el.classList.add('hz-table');
  return t;
}

/* ── the weekly digest: what moved, said as a brief, with its sources ── */
const HZ_DIGESTS = {
  all: [
    { head: 'Three signed EU contracts still charge customers to leave us, and that becomes unlawful on 12 January.',
      body: [['The Data Act ends switching charges on 12 January 2027; Vantage, Harbor Retail and Ostrava Bank still have the exit fee in clause 14.3.', 'HZ-231'],
        ['The UAE’s new transfer guidance lands while the Gulf reseller terms are still in draft, so they can be fixed before anyone signs.', 'HZ-236'],
        ['Two consultations close in November: the AI Act transparency guidelines and the ICO’s transfer guidance.', 'HZ-237']] },
    { head: 'California’s automated decision-making rules are final. Our part is telling customers what we do and don’t provide.',
      body: [['The CPPA’s rules phase in from January 2027; two US customers use our forecasts in credit decisions.', 'HZ-234'], ['DORA work is closed: the addendum is live and Sales has the register pack.', 'HZ-229']] },
  ],
  'eu-data': [
    { head: 'The exit fee in our MSA has 90 days left.', body: [['From 12 January 2027 we can’t charge EU customers for switching or taking their data out; three signed MSAs still do.', 'HZ-231'],
      ['The Commission’s Cyber Resilience Act guidance matters only if our connector agent counts as a product.', 'HZ-235']] },
    { head: 'DORA is done.', body: [['The financial-services addendum is live and Ostrava Bank has signed it.', 'HZ-229']] },
  ],
  ai: [
    { head: 'The AI Act transparency guidelines are open for comment until 21 November.', body: [['If customers see our forecast summaries unedited, Article 50 marking may apply to us.', 'HZ-237']] },
    { head: 'California’s automated decision-making rules are final.', body: [['They phase in from January 2027; we provide forecasts, not decisions, but customers will ask.', 'HZ-234']] },
  ],
  'uk-data': [
    { head: 'More of the Data (Use and Access) Act is in force from 1 December.', body: [['Recognised legitimate interests and the new complaints duty start on 1 December 2026.', 'HZ-238'], ['The ICO is consulting on a simpler transfer risk assessment until 28 November.', 'HZ-233']] },
    { head: 'Nothing new that applies to Lumen.', body: [] },
  ],
  gulf: [
    { head: 'The UAE has said what a transfer contract must contain, and the Gulf reseller terms need it.', body: [['Resellers passing customer data to a foreign platform are the guidance’s own example.', 'HZ-236']] },
    { head: 'Nothing new that applies to Lumen.', body: [] },
  ],
};
function hzDigest(key, scope) {
  const weeks = HZ_DIGESTS[key] || [];
  if (!weeks.length) return null;
  MX.horizon.digest ||= {};
  let wk = 0;
  const el = h('section', { class: 'hz-dg' + (MX.horizon.digest[key] === false ? ' is-shut' : '') });
  const label = (i) => i === 0 ? 'This week' : 'Last week';
  const paint = () => {
    const d = weeks[wk], from = Date.now() - (wk + 1) * 7 * 864e5, to = Date.now() - wk * 7 * 864e5;
    const found = scope().filter(u => { const t = new Date(u.found); return t >= from && t < to; });
    const shut = MX.horizon.digest[key] === false;
    const cites = []; const cite = (id) => { let n = cites.indexOf(id) + 1; if (!n) { cites.push(id); n = cites.length; } return n; };
    el.classList.toggle('is-shut', shut);
    el.replaceChildren(
      h('header', { class: 'hz-dg-h' }, h('span', { class: 'hz-dg-q' }, quillEl('static', { cls: 'sx-pv-qi' })), h('span', { class: 'hz-dg-t' }, 'Weekly digest'),
        h('span', { class: 'hz-dg-wk' },
          h('button', { class: 'hz-dg-nav', type: 'button', disabled: wk >= weeks.length - 1, 'aria-label': 'Earlier week', 'data-tip': 'Earlier Week', onclick: () => { wk++; paint(); },
            html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>' }),
          h('span', {}, label(wk)),
          h('button', { class: 'hz-dg-nav', type: 'button', disabled: wk === 0, 'aria-label': 'Later week', 'data-tip': 'Later Week', onclick: () => { wk--; paint(); },
            html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5 10.5 8 6 12.5"/></svg>' })),
        h('button', { class: 'hz-dg-fold', type: 'button', 'aria-label': shut ? 'Show digest' : 'Hide digest', 'data-tip': shut ? 'Show Digest' : 'Hide Digest', onclick: () => { MX.horizon.digest[key] = shut ? true : false; paint(); },
          html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10 8 6l4 4"/></svg>' })),
      ...(shut ? [] : [h('div', { class: 'hz-dg-b' },
        h('div', { class: 'hz-dg-m' }, h('p', { class: 'hz-dg-head' }, d.head),
          d.body.length ? h('p', { class: 'hz-dg-p' }, ...d.body.flatMap(([t, id]) => [t, ' ', h('button', { class: 'hz-cite', type: 'button', 'data-tip': hzUpdate(id)?.title, onclick: () => mxOpen('horizon', id) }, String(cite(id))), ' '])) : null),
        h('div', { class: 'hz-dg-stats' },
          h('div', { class: 'hz-dg-stat' }, h('b', {}, String(found.length)), h('span', {}, found.length === 1 ? 'New update' : 'New updates')),
          h('div', { class: 'hz-dg-stat' }, h('b', {}, String(found.filter(u => u.applies === 'yes').length)), h('span', {}, 'Apply to Lumen'))))]));
  };
  paint();
  return el;
}

function hzListPage() {
  const hz = hzData();
  const t = hzList(() => hz.updates);
  const gear = h('button', { class: 'pbv-icon mx-rules-btn', type: 'button', 'aria-label': 'Horizon settings', 'data-tip': 'Horizon Settings', html: MI(GLYPHS.gear), onclick: () => stGo('profile') });
  const page = mxListPage('Horizon', h('div', { class: 'mx-head-ctas' }, gear,
    h('button', { class: 'pb-btn hz-watches-btn', type: 'button', onclick: () => mxOpen('horizon', 'watches') }, `Watches · ${hz.watches.length}`),
    mxCta('New Watch', () => mxOpen('horizon', 'new'))), t.el);
  page.classList.add('hz-list-page');
  return page;
}

/* the key dates every update carries, by month */
function hzDates(list, q) {
  const rows = list.filter(u => u.state !== 'archived' && u.applies !== 'no').flatMap(u => (u.dates || []).map(([d, what]) => ({ u, d, what })))
    .filter(x => hzDaysTo(x.d) >= -30).filter(x => !q || (x.what + ' ' + x.u.title).toLowerCase().includes(q)).sort((a, b) => a.d < b.d ? -1 : 1);
  if (!rows.length) return h('div', { class: 'pb-empty' }, 'No dates coming up.');
  let month = null;
  return h('div', { class: 'hz-dates' }, ...rows.flatMap(x => {
    const m = new Date(x.d).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), dd = hzDaysTo(x.d);
    const head = m !== month ? (month = m, [h('div', { class: 'hz-dates-m' }, m)]) : [];
    return [...head, h('button', { class: 'hz-dates-r', type: 'button', onclick: () => mxOpen('horizon', x.u.id) },
      h('span', { class: 'hz-dates-d' }, new Date(x.d).getDate()), h('span', { class: 'hz-dates-t' }, h('b', {}, x.what), h('span', {}, x.u.title)),
      hzOwner(x.u.owner), h('span', { class: 'hz-date-s' + (dd >= 0 && dd <= 90 ? ' is-soon' : '') }, dd < 0 ? 'passed' : dd === 0 ? 'today' : `in ${dd} days`))];
  }), h('p', { class: 'hz-dates-foot' }, 'Owners get a reminder 30 days before each date.'));
}

/* archiving says why, and keeps it: counsel decided this doesn't apply */
function hzArchive(u, then) {
  const ta = h('textarea', { class: 'mx-rqf-in mx-rqf-ta', rows: '3', placeholder: 'e.g. We have no customers or processing in Qatar.' });
  const dim = h('div', { class: 'pb-dim mx-rqf-dim', onclick: (e) => { if (e.target === dim) close(); } });
  const close = () => { dim.classList.add('is-closing'); setTimeout(() => dim.remove(), 150); removeEventListener('keydown', onKey, true); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  dim.append(h('div', { class: 'pb-dlg mx-rqf mx-upn', role: 'dialog', 'aria-label': 'Archive' },
    h('header', { class: 'mx-rqf-head' }, h('h2', { class: 'pb-dlg-t' }, 'Doesn’t apply to us')),
    h('div', { class: 'mx-rqf-body' }, h('label', { class: 'mx-rqf-f' }, h('span', { class: 'mx-rqf-l' }, 'Why not? Horizon keeps this with the update.'), ta)),
    h('footer', { class: 'mx-rqf-foot' }, h('button', { class: 'pb-btn', type: 'button', onclick: close }, 'Cancel'),
      h('button', { class: 'pb-btn pb-btn--primary', type: 'button', onclick: () => { const why = ta.value.trim(); if (!why) return ta.focus();
        const was = [u.state, u.applies, u.dismissed]; u.state = 'archived'; u.applies = 'no'; u.dismissed = [USER.name, why]; hzLog(u, `archived this: ${why}`); close(); then?.();
        pbToast(`${u.id} archived`, { label: 'Undo', run: () => { [u.state, u.applies, u.dismissed] = was; save(); then?.(); } }); } }, 'Archive'))));
  document.body.append(dim); addEventListener('keydown', onKey, true); requestAnimationFrame(() => ta.focus());
}

/* ── one update ── */
function hzUpdatePage(u) {
  const w = hzWatch(u.watch);
  const page = h('div', { class: 'pb mx hz-page' });
  let adding = false;
  const paint = () => page.replaceChildren(...build());
  const ctaFor = () => {
    if (u.state === 'review') return h('button', { class: 'btn btn--primary', type: 'button', onclick: () => { u.state = 'progress'; u.owner ||= USER.name; hzLog(u, 'took this on'); paint(); pbToast(`${u.id} is yours`); } }, 'Take This On');
    if (u.state === 'progress') { const left = u.steps.length - hzStepsDone(u);
      return h('button', { class: 'btn btn--primary', type: 'button', disabled: left > 0, 'data-tip': left ? `${mxPlural(left, 'step')} still open` : null,
        onclick: () => { u.state = 'done'; u.closed = mxNow(); hzLog(u, 'closed this, with every step done'); paint(); pbToast(`${u.id} is done`, { label: 'Undo', run: () => { u.state = 'progress'; save(); paint(); } }); } }, 'Mark as Done'); }
    if (u.state === 'archived') return h('button', { class: 'pb-btn', type: 'button', onclick: () => { u.state = 'review'; u.applies = 'maybe'; u.dismissed = null; hzLog(u, 'restored this'); paint(); } }, 'Restore');
    return null;
  };
  const more = h('button', { class: 'br-dots', type: 'button', 'aria-label': 'More actions', 'data-tip': 'More Actions', html: PB_SVG.dots,
    onclick: (e) => { e.stopPropagation(); mxGlyphs(); menu(more, [
      { label: 'Draft a note to the business', icon: 'ask', run: () => hzDraft(u, null, paint) },
      { label: 'Copy link', icon: 'copy', run: () => { navigator.clipboard?.writeText(location.href).catch(() => {}); pbToast('Link copied'); } },
      u.state !== 'archived' ? { rule: true } : null,
      u.state !== 'archived' ? { label: 'Doesn’t apply · Archive', icon: 'archive', run: () => hzArchive(u, paint) } : null,
    ]); } });

  /* applies, and why; counsel can change it, and the change is kept */
  const applies = () => h('section', { class: 'hz-sec hz-applies is-' + u.applies },
    h('div', { class: 'hz-applies-h' }, hzApplies(u.applies), h('span', { class: 'hz-applies-l' }, u.applies === 'no' ? 'to Lumen' : 'to Lumen because'),
      h('button', { class: 'sx-link hz-applies-c', type: 'button', onclick: (e) => menu(e.currentTarget, Object.entries(HZ_APPLIES).map(([k, l]) => ({ label: l, tick: u.applies === k,
        run: () => { if (k === u.applies) return; if (k === 'no') return hzArchive(u, paint); const was = u.applies; u.applies = k; hzLog(u, `changed this to “${l}”`); paint();
          pbToast(`Marked “${l}”`, { label: 'Undo', run: () => { u.applies = was; save(); paint(); } }); } }))) }, 'Change')),
    h('p', {}, u.dismissed ? `${u.dismissed[0] === USER.name ? 'You' : u.dismissed[0]}: ${u.dismissed[1]}` : u.why),
    !u.dismissed ? h('button', { class: 'hz-profile-link', type: 'button', onclick: () => stGo('profile') }, 'From Lumen’s company profile') : null);

  const summary = () => h('section', { class: 'hz-sec' }, h('h3', { class: 'hz-sec-t' }, 'What changed'),
    h('ul', { class: 'hz-sum' }, ...u.summary.map(([t, n]) => h('li', {}, t, ' ', h('span', { class: 'hz-cite', tabindex: '0', 'data-tip': u.cites[n - 1]?.join(' · ') }, String(n))))),
    h('ol', { class: 'hz-cites' }, ...u.cites.map(([ref, what]) => h('li', {}, h('a', { href: `https://${u.source[1]}`, target: '_blank', rel: 'noopener' }, ref), h('span', {}, what)))));

  /* the empty cell: our own documents this touches */
  const touches = () => {
    const T = u.touches, groups = [['Signed contracts', T.contracts, (c) => [c[0], c[1], c[2], c[3]]], ['Templates', T.templates, (c) => [c[0], null, c[1], c[2]]],
      ['Playbook', T.playbook, (c) => [c[0], null, c[1], c[2]]], ['Open requests', T.requests, (c) => [c[0], c[1], null, c[2]]]].filter(g => g[1].length);
    if (!groups.length) return h('section', { class: 'hz-sec' }, h('h3', { class: 'hz-sec-t' }, 'What it touches'), h('p', { class: 'hz-none' }, 'Nothing in our contracts, templates, playbook or open requests.'));
    return h('section', { class: 'hz-sec' }, h('h3', { class: 'hz-sec-t' }, 'What it touches'),
      h('div', { class: 'hz-touch' }, ...groups.map(([label, list, f]) => h('div', { class: 'hz-touch-g' }, h('div', { class: 'hz-touch-l' }, label, h('span', {}, String(list.length))),
        ...list.map(c => { const [name, sub, clause, go] = f(c);
          return h('div', { class: 'hz-touch-r' }, h('span', { class: 'hz-touch-n' }, name, sub ? h('span', {}, sub) : null), clause ? h('span', { class: 'hz-touch-c' }, clause) : h('span', {}),
            go ? h('button', { class: 'sx-show-go', type: 'button', onclick: () => { location.hash = '#' + go; } }, 'Open') : null); })))));
  };

  /* next steps, each with an owner and a state; the one thing to do next sits on the row */
  const STEP_IC = { done: '<path d="m7.5 12.5 3 3 6-7"/>', review: '<path d="M12 7v5l3 2"/>', waiting: '<path d="M9 9.5v5M15 9.5v5"/>', todo: '', progress: '<path d="M12 7v5"/>' };
  const setStep = (s, status, note, logWhat) => { const was = [s.status, s.note]; s.status = status; s.note = note; hzLog(u, logWhat); paint();
    pbToast(logWhat[0].toUpperCase() + logWhat.slice(1), { label: 'Undo', run: () => { [s.status, s.note] = was; save(); paint(); } }); };
  const today = () => `Done · ${hzDay(mxNow(), false)}`;
  const stepAct = (s) => {
    if (s.status === 'done') return s.ref ? h('button', { class: 'sx-link', type: 'button', onclick: () => mxOpen('intake', s.ref) }, s.ref) : null;
    if (s.kind === 'redline') return h('button', { class: 'pb-btn hz-step-b', type: 'button', onclick: () => hzRedline(u, s, () => setStep(s, 'done', today(), `approved: ${s.what.toLowerCase()}`)) }, s.status === 'review' ? 'Review Redline' : 'Draft Redline');
    if (s.kind === 'note') return h('button', { class: 'pb-btn hz-step-b', type: 'button', onclick: () => hzDraft(u, s, paint) }, s.status === 'review' ? 'Review Draft' : 'Draft');
    if (s.kind === 'intake' || (s.kind === 'request' && !s.ref)) return h('button', { class: 'pb-btn hz-step-b', type: 'button', onclick: () => {
      const r = { id: mxNextRq(), title: s.what.replace(/^Amend/, 'Amend'), type: 'Drafting', counterparty: null, deal: null, team: 'Legal', submitter: USER.name, attorney: s.owner, status: 'new',
        detail: `From Horizon ${u.id}: ${u.title}. ${u.touches.contracts.filter(c => c[3] === 'vault').map(c => `${c[0]} (${c[2]})`).join('; ')}`,
        due: new Date(hzNext(u)?.[0] || Date.now() + 30 * 864e5).toISOString(), urgent: false, updated: mxNow(), created: mxNow(), triaged: false, horizon: u.id };
      mxIntake().unshift(r); save(); s.ref = r.id;
      setStep(s, 'progress', `${r.id} · with ${s.owner || 'Legal'}`, `opened ${r.id} in Intake for ${s.owner || 'Legal'}`); } }, 'Open as Request');
    if (s.kind === 'ask' || s.status === 'waiting') return h('button', { class: 'pb-btn hz-step-b', type: 'button', onclick: () => { s.status = 'waiting'; s.note = `Reminded ${hzDay(mxNow(), false)}`; hzLog(u, `reminded ${s.team || s.owner}`); paint(); pbToast(`Reminded ${s.team || s.owner} in Teams`); } }, s.status === 'waiting' ? 'Remind' : 'Ask');
    return h('button', { class: 'pb-btn hz-step-b', type: 'button', onclick: () => setStep(s, 'done', today(), `marked done: ${s.what.toLowerCase()}`) }, 'Mark Done');
  };
  const steps = () => h('section', { class: 'hz-sec' }, h('h3', { class: 'hz-sec-t' }, 'Next steps', u.steps.length ? h('span', { class: 'hz-sec-n' }, `${hzStepsDone(u)} of ${u.steps.length} done`) : null),
    h('div', { class: 'hz-steps' }, ...u.steps.map(s => h('div', { class: 'hz-step is-' + s.status },
      h('button', { class: 'hz-step-ic', type: 'button', 'aria-label': s.status === 'done' ? 'Mark not done' : 'Mark done', 'data-tip': s.status === 'done' ? 'Mark Not Done' : 'Mark Done',
        html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${STEP_IC[s.status] || ''}</svg>`,
        onclick: () => s.status === 'done' ? setStep(s, 'todo', 'Not started', `reopened: ${s.what.toLowerCase()}`) : setStep(s, 'done', today(), `marked done: ${s.what.toLowerCase()}`) }),
      h('div', { class: 'hz-step-m' }, h('span', { class: 'hz-step-t' }, s.what), h('span', { class: 'hz-step-s' }, s.note)),
      hzOwner(s.owner, s.team), h('span', { class: 'hz-step-a' }, stepAct(s)))),
      adding ? h('div', { class: 'hz-step-new' }, h('input', { class: 'mx-rqf-in sx-in', type: 'text', placeholder: 'What needs doing, and by whom?', autofocus: true,
          onkeydown: (e) => { if (e.key === 'Escape') { adding = false; paint(); } if (e.key !== 'Enter' || !e.target.value.trim()) return; const what = e.target.value.trim();
            u.steps.push({ id: 's' + Date.now(), what, owner: USER.name, status: 'todo', kind: 'decide', note: 'Not started' }); adding = false; hzLog(u, `added a step: ${what}`); paint(); } }))
        : h('button', { class: 'mx-rqf-add-b hz-step-add', type: 'button', onclick: () => { adding = true; paint(); setTimeout(() => page.querySelector('.hz-step-new input')?.focus(), 0); } }, '+ Add a step')));

  const activity = () => h('section', { class: 'hz-sec' }, h('h3', { class: 'hz-sec-t' }, 'Activity'),
    h('div', { class: 'sx-log' }, ...[...(u.log || []).slice().reverse().map(l => [l.who, l.what, l.at]), ...(u.activity || []).slice().reverse().map(([who, what, d]) => [who, what, hzAgo(d)])]
      .map(([who, what, at]) => h('div', { class: 'sx-log-r' }, who === 'Clavia' ? h('span', { class: 'sx-pv-q hz-q' }, quillEl('static', { cls: 'sx-pv-qi' })) : mxFace(who),
        h('span', {}, h('b', {}, who === USER.name ? 'You' : who), ' ', what), h('span', { class: 'sx-log-t' }, hzAgoSay(at))))));

  const side = () => h('aside', { class: 'hz-side' },
    ...[['Owner', h('button', { class: 'mx-atty hz-owner-b', type: 'button', onclick: (e) => mxPersonPicker(e.currentTarget, MX_LEGAL, (p) => { const was = u.owner; u.owner = p.name; if (u.state === 'review') u.state = 'progress'; hzLog(u, `gave this to ${p.name}`); paint();
        pbToast(`${u.id} is with ${p.name}`, { label: 'Undo', run: () => { u.owner = was; save(); paint(); } }); }) }, u.owner ? [mxFace(u.owner), h('span', {}, u.owner)] : h('span', { class: 'mx-atty-t' }, 'Assign'))],
      ['Status', HZ_STATE[u.state]],
      ['Watch', h('button', { class: 'sx-link', type: 'button', onclick: () => mxOpen('horizon', 'watch/' + u.watch) }, w?.name)],
      ['Source', h('a', { class: 'hz-src', href: `https://${u.source[1]}`, target: '_blank', rel: 'noopener' }, u.source[0])],
      ['Type', `${u.type} · ${u.stage}`], ['Jurisdiction', u.juris], ['Found', hzAgoSay(u.found)]]
      .map(([k, v]) => h('div', { class: 'hz-side-r' }, h('span', { class: 'hz-side-k' }, k), h('span', { class: 'hz-side-v' }, v))),
    (u.dates || []).length ? h('div', { class: 'hz-side-dates' }, h('div', { class: 'hz-side-k' }, 'Key dates'),
      ...u.dates.map(([d, what, past]) => h('div', { class: 'hz-kd' + (hzDaysTo(d) < 0 ? ' is-past' : '') }, h('b', {}, hzDay(d)), h('span', {}, what), hzDaysTo(d) >= 0 ? h('span', { class: 'hz-date-s' }, `in ${hzDaysTo(d)} days`) : null))) : null);

  function build() {
    return [
      hzTopbar([['Horizon', () => { mxClose('horizon'); go('horizon'); }], [w?.name, () => mxOpen('horizon', 'watch/' + u.watch)], [u.id]],
        [h('span', { class: 'hz-bar-s' }, `Found ${hzAgoSay(u.found)}`), hzShare(), more]),
      h('header', { class: 'hz-head' }, h('div', { class: 'hz-head-m' }, h('div', { class: 'hz-meta' }, u.source[0], h('span', { class: 'mt-sep' }, '·'), `${u.type} · ${u.stage}`, h('span', { class: 'mt-sep' }, '·'), u.juris),
        h('h1', { class: 'hz-title' }, u.title), h('p', { class: 'hz-lede' }, u.lede)), h('div', { class: 'hz-head-a' }, ctaFor())),
      h('div', { class: 'hz-body' }, h('div', { class: 'hz-main' }, applies(), summary(), u.applies !== 'no' ? touches() : null, u.applies !== 'no' ? steps() : null, activity()), side()),
    ];
  }
  paint();
  return page;
}

/* the redline a template step proposes: what the clause says now, and what it should say */
function hzRedline(u, s, approve) {
  const dim = h('div', { class: 'pb-dim mx-rqf-dim', onclick: (e) => { if (e.target === dim) close(); } });
  const close = () => { dim.classList.add('is-closing'); setTimeout(() => dim.remove(), 150); removeEventListener('keydown', onKey, true); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const tpl = u.touches.templates[0];
  const body = u.id === 'HZ-231'
    ? [h('b', {}, '14.3 Exit assistance. '), 'On termination, Lumen will provide the Customer with an export of Customer Data in a commonly used machine-readable format', h('del', {}, ' and reasonable exit assistance, charged at Lumen’s then-current professional services rates'),
      h('ins', {}, ', and will give the Customer the assistance it reasonably needs to switch to another provider, within the notice and transition periods in clause 14.4, at no charge'), '.']
    : [h('b', {}, (tpl?.[1] || 'The clause') + '. '), 'Clavia’s proposed wording appears here as tracked changes against the current template.'];
  dim.append(h('div', { class: 'pb-dlg mx-rqf hz-rl-dlg', role: 'dialog', 'aria-label': 'Redline' },
    h('header', { class: 'mx-rqf-head' }, h('h2', { class: 'pb-dlg-t' }, tpl ? tpl[0] : 'Redline')),
    h('div', { class: 'mx-rqf-body' }, h('div', { class: 'hz-rl' }, ...body), h('p', { class: 'sx-flow-s' }, `Approving saves this as the next version of the template, and the playbook’s fallback wording follows it. From ${u.id}.`)),
    h('footer', { class: 'mx-rqf-foot' }, h('button', { class: 'pb-btn', type: 'button', onclick: close }, 'Not Yet'), h('button', { class: 'pb-btn pb-btn--primary', type: 'button', onclick: () => { close(); approve(); } }, 'Approve and Save'))));
  document.body.append(dim); addEventListener('keydown', onKey, true);
}

/* a note to the business, drafted from the update; it goes out where they read it */
function hzDraft(u, s, then) {
  const dim = h('div', { class: 'pb-dim mx-rqf-dim', onclick: (e) => { if (e.target === dim) close(); } });
  const close = () => { dim.classList.add('is-closing'); setTimeout(() => dim.remove(), 150); removeEventListener('keydown', onKey, true); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const to = u.id === 'HZ-231' ? 'Sales leadership' : 'The business';
  const n = hzNext(u);
  const ta = h('textarea', { class: 'mx-rqf-in mx-rqf-ta hz-draft', rows: '9' });
  ta.value = u.id === 'HZ-231'
    ? `Hi all,\n\nFrom 12 January 2027 EU law stops cloud providers charging customers for switching away or taking their data out. Two things for Sales, starting now:\n\n• Don’t quote exit or data-export fees to customers with EU entities. Clause 14.3 of our MSA is changing to match.\n• If a customer asks how they would leave us, the answer is: two months’ notice, a 30-day handover, and their data in a standard format at no charge.\n\nLegal is amending the three signed EU contracts that still have the fee. Questions to Grace.\n\nRoger`
    : `Hi all,\n\n${u.lede}${n ? ` The date to know is ${hzDay(n[0])} (${n[1].toLowerCase()}).` : ''}\n\nWhat it means for us: ${u.why}\n\nLegal is on it. Questions to ${u.owner || 'Legal'}.\n\n${USER.greeting}`;
  const where = h('span', { class: 'hz-draft-to' }, h('img', { src: 'assets/brand/outlook.svg', alt: '' }), `To ${to} · by email from you`);
  dim.append(h('div', { class: 'pb-dlg mx-rqf hz-draft-dlg', role: 'dialog', 'aria-label': 'Draft note' },
    h('header', { class: 'mx-rqf-head' }, h('h2', { class: 'pb-dlg-t' }, 'Note to the business'), where),
    h('div', { class: 'mx-rqf-body' }, ta),
    h('footer', { class: 'mx-rqf-foot' }, h('button', { class: 'pb-btn', type: 'button', onclick: close }, 'Cancel'),
      h('button', { class: 'pb-btn pb-btn--primary', type: 'button', onclick: () => { close();
        if (s) { s.status = 'done'; s.note = `Sent · ${hzDay(mxNow(), false)}`; }
        hzLog(u, `sent a note to ${to.toLowerCase()}`); then?.(); pbToast(`Sent to ${to}`); } }, 'Send'))));
  document.body.append(dim); addEventListener('keydown', onKey, true); requestAnimationFrame(() => ta.focus());
}

/* ── watches ── */
function hzWatchesPage() {
  const hz = hzData();
  const st = MX.horizon.watchList ||= { tab: 'all', find: '', sort: { key: null, dir: 1 } };
  const t = mxTable({
    label: 'Watches', st, allLabel: 'Watches', empty: 'No watches yet.',
    grid: 'minmax(220px, 2.2fr) minmax(200px, 1fr) minmax(140px, 1fr) minmax(96px, 1fr) minmax(72px, 1fr) 28px',
    cols: [{ key: 'name', label: 'Watch' }, { key: 'cover', label: 'Coverage' }, { key: 'owner', label: 'Owner' }, { key: 'checked', label: 'Checked' }, { key: 'n', label: 'Updates' }],
    tabs: [], tabOf: () => 'all', items: () => hz.watches, text: (w) => [w.name, w.intent, w.juris.join(' ')].join(' '),
    val: (w, k) => k === 'n' ? hz.updates.filter(u => u.watch === w.id).length : k === 'checked' ? w.checked : (w[k] || '~').toString().toLowerCase(),
    cells: (w) => [h('span', { class: 'pb-row-name' }, w.name), h('span', { class: 'hz-cell-w' }, `${mxPlural(w.juris.length, 'jurisdiction')} · ${mxPlural(w.sources.length, 'source')} · ${mxPlural(w.topics.length, 'topic')}`),
      hzOwner(w.owner), h('span', { class: 'hz-cell-w' }, w.paused ? 'Paused' : hzChecked(w.checked)), String(hz.updates.filter(u => u.watch === w.id && u.state !== 'archived').length)],
    open: (w) => mxOpen('horizon', 'watch/' + w.id),
    menu: (w) => [{ label: 'Open', icon: 'files', run: () => mxOpen('horizon', 'watch/' + w.id) }, { label: w.paused ? 'Resume' : 'Pause', icon: 'retry', run: () => { w.paused = !w.paused; save(); t.paint(); } }],
  });
  const page = mxListPage('Watches', mxCta('New Watch', () => mxOpen('horizon', 'new')), t.el);
  page.prepend(h('button', { class: 'mx-back', type: 'button', onclick: () => { mxClose('horizon'); go('horizon'); } }, h('span', { class: 'mx-back-ar', html: PB_SVG.chev }), 'Horizon'));
  return page;
}

/* the bar every Horizon page shares: where you are, and what you can do to the thing you're on */
function hzTopbar(crumbs, right) {
  return h('div', { class: 'hz-bar' },
    h('button', { class: 'hz-bar-back', type: 'button', 'aria-label': 'Back', 'data-tip': 'Back', onclick: crumbs[crumbs.length - 2]?.[1],
      html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>' }),
    h('nav', { class: 'hz-crumbs', 'aria-label': 'Breadcrumb' }, ...crumbs.flatMap(([label, go], i) => [i ? h('span', { class: 'hz-crumbs-sep', html: PB_SVG.chev }) : '',
      go && i < crumbs.length - 1 ? h('button', { class: 'hz-crumb', type: 'button', onclick: go }, label) : h('span', { class: 'hz-crumb is-here' }, label)])),
    h('div', { class: 'hz-bar-r' }, ...right));
}
const hzShare = () => h('button', { class: 'pb-btn hz-bar-b', type: 'button', onclick: () => { navigator.clipboard?.writeText(location.href).catch(() => {}); pbToast('Link copied. Anyone in Legal can open it.'); } },
  h('span', { class: 'hz-bar-ic', html: MI(GLYPHS.share) }), 'Share');

function hzWatchPage(w) {
  const hz = hzData();
  const fresh = MX.horizon.fresh === w.id; MX.horizon.fresh = null;
  let open = fresh;
  const chips = (list) => h('span', { class: 'hz-chips' }, ...list.map(x => h('span', { class: 'hz-chip' }, x)));
  const st = MX.horizon['w-' + w.id] ||= { tab: 'all', find: '', sort: { key: null, dir: 1 } };
  const scope = () => hz.updates.filter(u => u.watch === w.id);
  const t = hzList(scope, { st, dates: false, watch: false, empty: fresh ? 'Nothing from the last 90 days that applies. Horizon checks every hour from now on.' : 'Nothing found yet.' });
  const cover = h('section', { class: 'hz-cover' + (open ? '' : ' is-shut') },
    h('div', { class: 'hz-cover-r' }, h('span', { class: 'hz-side-k' }, 'Jurisdictions'), h('span', { class: 'hz-chips' }, ...w.juris.map(j => h('span', { class: 'hz-chip' }, HZ_FLAG[j] ? HZ_FLAG[j] + ' ' : '', j)))),
    h('div', { class: 'hz-cover-r' }, h('span', { class: 'hz-side-k' }, 'Topics'), chips(w.topics)),
    h('div', { class: 'hz-cover-r is-src' }, h('span', { class: 'hz-side-k' }, 'Sources it reads'),
      h('div', { class: 'hz-srcs' }, ...w.sources.map(([n, d], i) => h('div', { class: 'hz-srcs-r' }, h('span', {}, n), h('a', { href: `https://${d}`, target: '_blank', rel: 'noopener' }, d), h('span', { class: 'hz-date-s' }, `checked ${hzChecked(w.checked ? w.checked + i * 3 : 0)}`))))),
    h('div', { class: 'hz-cover-r' }, h('span', { class: 'hz-side-k' }, 'What it watches for'), h('span', { class: 'hz-cover-i' }, w.intent)));
  const scopeBtn = h('button', { class: 'hz-scope hz-scope-b', type: 'button', 'aria-expanded': String(open), 'data-tip': 'Show Coverage',
    onclick: () => { open = !open; cover.classList.toggle('is-shut', !open); scopeBtn.setAttribute('aria-expanded', String(open)); } },
    `${mxPlural(w.topics.length, 'topic')} · ${mxPlural(w.sources.length, 'source')} · `, h('span', { class: 'hz-scope-f' }, ...w.juris.slice(0, 4).map(j => h('span', {}, HZ_FLAG[j] || ''))), mxPlural(w.juris.length, 'jurisdiction'));
  return h('div', { class: 'pb mx hz-page hz-wpage' },
    hzTopbar([['Horizon', () => { mxClose('horizon'); go('horizon'); }], ['Watches', () => mxOpen('horizon', 'watches')], [w.name]],
      [h('span', { class: 'hz-bar-s' }, w.paused ? 'Paused' : `Checked ${hzChecked(w.checked)}`),
        hzShare(), h('button', { class: 'pb-btn hz-bar-b', type: 'button', onclick: () => hzWatchForm(w) }, h('span', { class: 'hz-bar-ic', html: MI(GLYPHS.gear) }), 'Settings')]),
    h('header', { class: 'hz-whead' }, h('h1', { class: 'hz-title' }, w.name), scopeBtn),
    fresh ? h('div', { class: 'hz-fresh' }, quillEl('static', { cls: 'sx-pv-qi' }), 'Clavia chose this coverage from what you wrote. Change anything that’s wrong in Settings; it takes effect on the next check.') : null,
    cover,
    hzDigest(w.id, scope),
    t.el);
}

/* the coverage, as a form; the same one "Set up manually" opens */
function hzWatchForm(w) {
  const isNew = !w;
  const f = w ? { ...w, juris: w.juris.join(', '), topics: w.topics.join(', '), sources: w.sources.map(s => s[0]).join(', ') } : { name: '', intent: '', juris: '', topics: '', sources: '' };
  const dim = h('div', { class: 'pb-dim mx-rqf-dim', onclick: (e) => { if (e.target === dim) close(); } });
  const close = () => { dim.classList.add('is-closing'); setTimeout(() => dim.remove(), 150); removeEventListener('keydown', onKey, true); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const field = (k, label, ph, ta) => h('label', { class: 'mx-rqf-f' }, h('span', { class: 'mx-rqf-l' }, label),
    h(ta ? 'textarea' : 'input', { class: 'mx-rqf-in' + (ta ? ' mx-rqf-ta' : ' sx-in'), rows: ta ? '3' : null, placeholder: ph, value: ta ? undefined : f[k], oninput: (e) => { f[k] = e.target.value; } }, ta ? f[k] : null));
  dim.append(h('div', { class: 'pb-dlg mx-rqf sx-det-dlg', role: 'dialog', 'aria-label': isNew ? 'New watch' : w.name },
    h('header', { class: 'mx-rqf-head' }, h('h2', { class: 'pb-dlg-t' }, isNew ? 'New Watch' : 'Edit Coverage')),
    h('div', { class: 'mx-rqf-body' }, field('name', 'Name', 'e.g. US state privacy'), field('intent', 'What it watches for', 'In plain words, what change would matter to us', true),
      field('juris', 'Jurisdictions', 'Separated by commas'), field('sources', 'Sources', 'Regulators, registers, consultation pages'), field('topics', 'Topics', 'Separated by commas')),
    h('footer', { class: 'mx-rqf-foot' }, h('button', { class: 'pb-btn', type: 'button', onclick: close }, 'Cancel'),
      h('button', { class: 'pb-btn pb-btn--primary', type: 'button', onclick: () => {
        if (!f.name.trim()) return pbToast('Give the watch a name');
        const split = (x) => x.split(',').map(s => s.trim()).filter(Boolean);
        const out = { name: f.name.trim(), intent: f.intent.trim(), juris: split(f.juris), topics: split(f.topics),
          sources: split(f.sources).map(n => (w?.sources || []).find(s => s[0] === n) || [n, n.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.gov']) };
        if (isNew) { const nw = { id: 'w' + Date.now().toString(36), owner: USER.name, created: mxNow(), checked: 0, ...out }; hzData().watches.push(nw); save(); close(); MX.horizon.fresh = null; mxOpen('horizon', 'watch/' + nw.id); }
        else { Object.assign(w, out); save(); close(); go('horizon'); pbToast('Coverage saved'); }
      } }, isNew ? 'Create Watch' : 'Save'))));
  document.body.append(dim); addEventListener('keydown', onKey, true);
}

/* ── a new watch, said in plain words ── */
function hzCreatePage() {
  const page = mxCreatePage({ view: 'horizon', back: 'Horizon', title: 'What should Horizon watch?',
    placeholder: 'e.g. Changes to US state privacy law that affect a B2B SaaS company selling to retailers', run: hzBuildWatch });
  page.querySelector('.askwrap')?.append(h('button', { class: 'sx-link hz-manual', type: 'button', onclick: () => hzWatchForm(null) }, 'Or set it up yourself'));
  return page;
}
function hzBuildWatch(text, files, step) {
  const t = text.toLowerCase();
  const pick = /us|state|california|texas|virginia|colorado/.test(t) ? { name: 'US state privacy', juris: ['California', 'Colorado', 'Virginia', 'Texas', 'Connecticut'], topics: ['Consumer privacy', 'Automated decisions', 'Children’s data'],
      sources: [['California Privacy Protection Agency', 'cppa.ca.gov'], ['Colorado AG', 'coag.gov'], ['Virginia General Assembly', 'lis.virginia.gov'], ['Texas Legislature', 'capitol.texas.gov'], ['Connecticut AG', 'portal.ct.gov']] }
    : /employ|hr|worker|pay/.test(t) ? { name: 'Employment law', juris: ['UK', 'Ireland'], topics: ['Employment rights', 'Pay transparency'], sources: [['legislation.gov.uk', 'legislation.gov.uk'], ['ACAS', 'acas.org.uk'], ['Irish Statute Book', 'irishstatutebook.ie']] }
    : /sanction|export/.test(t) ? { name: 'Sanctions and export controls', juris: ['UK', 'EU', 'US'], topics: ['Sanctions', 'Export controls'], sources: [['OFSI', 'gov.uk'], ['EUR-Lex', 'eur-lex.europa.eu'], ['OFAC', 'ofac.treasury.gov']] }
    : { name: text.split(/[.,;]/)[0].slice(0, 48) || 'New watch', juris: ['UK', 'EU'], topics: ['Regulatory change'], sources: [['legislation.gov.uk', 'legislation.gov.uk'], ['EUR-Lex', 'eur-lex.europa.eu']] };
  step('Reading what you want to watch');
  setTimeout(() => step(`Choosing sources: ${pick.sources.slice(0, 3).map(s => s[0]).join(', ')}${pick.sources.length > 3 ? ` and ${pick.sources.length - 3} more` : ''}`), 1100);
  setTimeout(() => step('Looking back over the last 90 days'), 2400);
  setTimeout(() => {
    const w = { id: 'w' + Date.now().toString(36), owner: USER.name, created: mxNow(), checked: 0, intent: text, ...pick };
    hzData().watches.push(w); save();
    MX.horizon.fresh = w.id; mxOpen('horizon', 'watch/' + w.id);
    pbToast(`${w.name} is watching`);
  }, 3600);
}

/* ── Settings › Horizon ── */
function hzProfilePage() {
  const p = hzData().profile;
  const f = (k, label, hint, list) => h('label', { class: 'sx-field' }, h('span', { class: 'sx-field-l' }, label),
    h(list ? 'textarea' : 'input', { class: 'mx-rqf-in sx-in' + (list ? ' sx-ta' : ''), rows: list ? '2' : null, type: list ? null : 'text', value: list ? undefined : p[k],
      oninput: (e) => { p[k] = list ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : e.target.value; save(); } }, list ? p[k].join(', ') : null),
    hint ? h('span', { class: 'sx-field-s' }, hint) : null);
  return h('div', { class: 'sx-page' }, stHead('Company profile', 'Horizon reads every update against this to decide whether it applies to Lumen, and says why. Keep it current; a wrong line here means a wrong answer there.'),
    h('section', { class: 'sx-sec is-first sx-fields hz-prof' },
      f('sells', 'What we sell'), f('hosted', 'Where it’s hosted'), f('markets', 'Where we sell', 'Separated by commas', true), f('customers', 'Who we sell to', 'Sectors, separated by commas', true),
      f('data', 'Personal data we handle', 'And in what role: controller or processor', true), f('ai', 'AI in the product'), f('entities', 'Our companies', 'Separated by commas', true)));
}
function hzDeliveryPage() {
  const dv = hzData().delivery;
  const conn = (id) => typeof stConn === 'function' ? stConn(id).st : 'off';
  return h('div', { class: 'sx-page' }, stHead('Delivery', 'How Horizon tells people. Everything also stays in Horizon.'),
    h('section', { class: 'sx-sec is-first' }, h('h3', { class: 'sx-sec-t' }, 'Weekly digest'),
      stToggle(dv.digest.on, `Every ${dv.digest.day} at ${dv.digest.time}, by email`, 'What was found, what applies, and the dates coming up in the next 90 days.', (v) => { dv.digest.on = v; }),
      h('div', { class: 'hz-to' }, h('span', { class: 'sx-field-s' }, 'To'), ...dv.digest.to.map(n => hzOwner(n)))),
    h('section', { class: 'sx-sec' }, h('h3', { class: 'sx-sec-t' }, 'Straight away'),
      stToggle(dv.urgent.on, 'When an update applies and something takes effect within 90 days', null, (v) => { dv.urgent.on = v; }),
      h('div', { class: 'sx-list hz-deliv' }, ...[['teams', 'Teams', 'Legal › Horizon'], ['slack', 'Slack', '#legal-team'], ['outlook', 'Email', 'The watch’s owner']].map(([id, n, where]) =>
        h('div', { class: 'sx-row is-static' }, h('span', { class: 'sx-mk' }, h('img', { src: brandSrc(id), alt: '' })),
          h('span', { class: 'sx-row-m' }, h('span', { class: 'sx-row-n' }, n), h('span', { class: 'sx-row-s' }, where)),
          h('span', { class: 'sx-row-r' }, conn(id) === 'on' ? (dv.urgent.where.some(x => x.startsWith(n)) || id === 'outlook' ? h('span', { class: 'sx-state is-on' }, h('span', { class: 'sx-dot' }), 'On') : h('span', { class: 'sx-row-go' }, 'Off'))
            : h('button', { class: 'sx-link', type: 'button', onclick: () => stGo('connectors/' + id) }, 'Connect'))))),
      stToggle(dv.owner.on, 'Tell each step’s owner when it’s given to them', null, (v) => { dv.owner.on = v; })),
    h('section', { class: 'sx-sec' }, h('h3', { class: 'sx-sec-t' }, 'This Monday’s digest'),
      h('div', { class: 'sx-pv hz-digest' }, h('div', { class: 'sx-pv-cap' }, 'Horizon · week of 12 October'),
        h('p', {}, h('b', {}, '6 new updates, 3 that apply to Lumen.'), ' The UAE published transfer guidance that affects the Gulf reseller terms. Two consultations close in November.'),
        ...hzData().updates.filter(u => u.applies === 'yes').slice(0, 3).map(u => h('div', { class: 'sx-pv-fact' }, h('span', {}, u.title), h('b', {}, HZ_STATE[u.state]))))));
}
