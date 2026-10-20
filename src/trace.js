/* ------------------------------------------------------------------
   Trace — what the assistant did before it answered.

   One shape covers every connector: a step names its source, says what
   it looked for, and carries rows of what came back. A web search, a
   Drive lookup and a Salesforce query differ only in the source and in
   what a row means; a Gmail draft is the same step with one row and an
   action label. Adding a connector is a SOURCES entry, nothing else.

   Deliberately monochrome. Source colour would put five brand palettes
   into the middle of a reading column and turn evidence into decoration;
   the glyph already says which system answered.
------------------------------------------------------------------ */

const SOURCES = {
  /* One search, many systems. Enterprise search does not query Drive, then
     SharePoint, then the CRM as separate acts — it answers one question and
     the answers come back from wherever they live. The step is the question;
     each row carries the logo of the system it actually came from. */
  internal: {
    label: 'internal knowledge', verb: 'Searched',
    icon: '<circle cx="11" cy="11" r="7"/><path d="m21 21-5.2-5.2"/>',
  },
  web: {
    label: 'the web', verb: 'Searched',
    icon: '<circle cx="12" cy="12" r="10"/>'
        + '<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  },
  drive: {
    brand: 'drive',
    label: 'Google Drive', verb: 'Searched',
    icon: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  },
  sharepoint: {
    brand: 'sharepoint',
    label: 'SharePoint', verb: 'Searched',
    icon: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>'
        + '<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  },
  outlook: {
    brand: 'outlook',
    label: 'Outlook', verb: 'Drafted in',
    icon: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M3 7l9 6.5L21 7"/>',
  },
  gmail: {
    brand: 'gmail',
    label: 'Gmail', verb: 'Drafted in',
    icon: '<rect width="20" height="16" x="2" y="4" rx="2"/>'
        + '<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  },
  /* not every step is a search. Reading one thing, or reasoning over what came
     back, is a step with no result set — it stands as its own line. */
  read: {
    label: 'a page', verb: 'Read',
    icon: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/>'
        + '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  },
  think: {
    label: 'the results', verb: 'Reasoned over',
    icon: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  },
  /* The last thing before an artifact exists is the skill that shapes it —
     the house rules for what a board deck or a position brief has to
     contain. It earns its own step because it explains why the output
     looks the way it does. */
  skill: {
    label: 'a skill', verb: 'Applied',
    icon: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/>'
        + '<path d="M8 9.5h8M8 13h5"/>',
  },

  /* making something is its own kind of step, and the glyph should say which
     thing is being made — not fall through to the search icon */
  deck: {
    label: 'a deck', verb: 'Built',
    icon: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M12 17v3M9 20h6"/>',
  },
  sheet: {
    label: 'a sheet', verb: 'Built',
    icon: '<rect x="3" y="3.5" width="18" height="17" rx="2"/>'
        + '<path d="M3 9h18M9 9v11.5M15 9v11.5"/>',
  },
  doc: {
    label: 'a document', verb: 'Wrote',
    icon: '<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M13.5 5.5l3 3"/>',
  },
  app: {
    label: 'an interactive view', verb: 'Built',
    icon: '<rect x="2.5" y="4" width="19" height="16" rx="2"/>'
        + '<path d="M7 16v-3.5M11.5 16V9M16 16v-2.5"/>',
  },
  /* Changing a heading is not research. It gets a step so the edit is on
     the record, and one line is the whole of it. */
  edit: {
    label: 'the text', verb: 'Edited',
    icon: '<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M13.5 5.5l3 3"/>',
  },
  salesforce: {
    brand: 'salesforce',
    label: 'Salesforce', verb: 'Pulled from',
    icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/>'
        + '<path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  },
};

const EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
  + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<path d="M15 3h6v6"/><path d="M10 14 21 3"/>'
  + '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';

const glyph = (key, cls = 'step-ico') => {
  const s = SOURCES[key] || SOURCES.web;
  /* a connector shows its own logo — that is what makes the row scannable;
     web and the reasoning steps have no product behind them, so they keep
     the line glyph */
  if (s.brand) return `<svg class="${cls} ${cls}-brand" aria-hidden="true"><use href="#b-${s.brand}"></use></svg>`;
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
         `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s.icon}</svg>`;
};

/* a row is a thing that came back: a page, a file, a record, a draft */
const rowEl = (r) => h('div', { class: 'trow' },
  h('span', { class: 'trow-ico', html: glyph(r.source, 'row-ico') }),
  h('span', { class: 'trow-title' }, r.title),
  r.meta && h('span', { class: 'trow-meta' }, r.meta),
);

/* one step of work, as it runs and after it lands */
function stepEl(step) {
  const rows = step.rows || [];
  const count = step.running ? null
    : step.count != null ? step.count
    : rows.length > 1 ? `${rows.length} results`
    : null;

  const el = h('div', {
    class: 'step'
      + (step.running ? ' step-running' : '')
      + (rows.length ? '' : ' step-line')
      + (step.seen ? '' : ' step-new'),
  },
    h('div', { class: 'step-head' },
      h('span', { class: 'step-mark', html: glyph(step.source) }),
      h('span', { class: 'step-query' }, step.query),
      count && h('span', { class: 'step-count' }, count),
      step.link && h('span', { class: 'step-link', html: EXT }),
    ),
    /* one result is a fact, not a list — a card around it is packaging */
    rows.length === 1
      ? h('div', { class: 'step-one' },
          h('span', { class: 'trow-ico', html: glyph(step.source, 'row-ico') }),
          h('span', { class: 'trow-title' }, rows[0].title),
          rows[0].meta && h('span', { class: 'trow-meta' }, rows[0].meta))
      : rows.length
      /* a row inherits the step's source unless it names its own, so a Drive
         result carries the Drive mark rather than the generic glyph */
      ? h('div', { class: 'step-rows' },
          rows.map(r => rowEl({ ...r, source: r.source || step.source })))
      : null,
  );
  step.seen = true;
  return el;
}

/* once the answer lands the working is folded away behind one line,
   because it is evidence, not the reply */
/* While a step is in flight the summary should be in the tense it is
   actually in. English will not derive these — "Read" and "Searched"
   go different ways — so each verb names its own. */
const DOING = {
  'Searched': 'Searching', 'Read': 'Reading', 'Applied': 'Applying',
  'Built': 'Building', 'Wrote': 'Writing', 'Edited': 'Editing',
  'Drafted in': 'Drafting in', 'Pulled from': 'Pulling from',
  'Reasoned over': 'Reasoning over',
};

function traceEl(steps, { open = true, onToggle, busy = false } = {}) {
  /* Busy is the whole turn, not the step. Reading it off the steps meant
     the mark blinked out in every gap between them, and again while the
     answer was being written — which is the longest part and the part
     somebody is most likely to be waiting through. It runs until the
     working folds itself away. */
  const seen = [];
  for (const s of steps) {
    const src = SOURCES[s.source] || SOURCES.web;
    const verb = (busy && s.running && DOING[src.verb]) || src.verb;
    const k = `${verb} ${src.label}`;
    if (!seen.includes(k)) seen.push(k);
  }
  /* the summary is a label, not an inventory — past two it says how many more */
  const summary = seen.length <= 2
    ? seen.join(' · ')
    : `${seen.slice(0, 2).join(' · ')} · +${seen.length - 2} more`;

  const body = h('div', { class: 'trace-body' }, steps.map(stepEl));
  const head = h('button', {
    class: 'trace-head', type: 'button', 'aria-expanded': String(open),
    onclick: () => {
      const now = head.getAttribute('aria-expanded') !== 'true';
      head.setAttribute('aria-expanded', String(now));
      wrap.dataset.open = String(now);
      body.style.height = now ? body.scrollHeight + 'px' : '0px';
      onToggle?.(now);
    },
  },
    /* the mark from the home screen, doing the same job it does there:
       saying that something is happening, in the one place you are
       already looking to find out what */
    busy ? quillEl('work', { cls: 'trace-load' }) : null,
    summary,
    h('span', { class: 'caret', 'aria-hidden': 'true' }));

  const wrap = h('div', { class: 'trace', 'data-open': String(open) }, head, body);
  /* height is animated, so it has to be a number — measured once the node is
     actually in the document and laid out, not in the frame it was built */
  requestAnimationFrame(() => {
    body.style.height = open ? body.scrollHeight + 'px' : '0px';
  });
  return wrap;
}
