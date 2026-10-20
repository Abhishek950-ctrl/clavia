/* ==================================================================
   A playbook, as an artifact
   Opened from the list it takes the window to be read, with Edit with
   Chat beside its name. Edited, it sits beside a conversation — the
   same panel, versions, publish and full screen every artifact has.

   The page: an index of clauses down the left, and one sheet in the
   middle with every clause laid out as its positions — Starting
   Position, Not acceptable, Fallback, Fallback 2… Nothing folded away;
   a playbook is read top to bottom.

   Versions live on the playbook (pb.versions), so the table's Version
   column and the version menu in the header are the same number. The
   live text is pb itself; each version keeps a snapshot of it.

   Loaded after playbooks.js and before app.js.
================================================================== */

/* ── data: several fallbacks, and a history ──────────────────── */

const pbSnap = (pb) => structuredClone({ name: pb.name, description: pb.description, clauses: pb.clauses });

/* A clause holds a list of fallbacks, in the order you would concede
   them. Older copies held one, in two fields. */
function pbNormClause(c) {
  if (!Array.isArray(c.fallbacks)) {
    c.fallbacks = [];
    if (c.fallback || c.fallback_language) c.fallbacks.push({ text: c.fallback || '', language: c.fallback_language || '' });
    if (c.fallback_2) c.fallbacks.push({ text: c.fallback_2, language: '' });
  }
  delete c.fallback; delete c.fallback_language; delete c.fallback_2; delete c._fallback;
  delete c._preferred_language; delete c._fallback_language;
  c.section ||= 'General';
  return c;
}

/* a clause goes in after the last one of its section, so sections stay whole */
function pbInsertClause(pb, c) {
  let at = -1;
  pb.clauses.forEach((x, i) => { if ((x.section || 'General') === c.section) at = i; });
  at < 0 ? pb.clauses.push(c) : pb.clauses.splice(at + 1, 0, c);
}

/* which section a new clause belongs in, from what it is about */
const PB_SECTION_HINTS = [
  [/secur|breach|incident|encrypt|certif|personnel/i, /secur/i],
  [/subprocessor|transfer|residen|locali|government|cross-border/i, /subprocessor|transfer/i],
  [/audit|complian|regulat|assist|request|record|\bai\b|training|impact/i, /complian|assist/i],
  [/liab|indemn|fine|penalt|insur|cap\b/i, /liab|risk/i],
  [/fee|pay|pric|term\b|renew|terminat/i, /commercial|term/i],
  [/law|venue|assign|notice|preceden/i, /general|preceden/i],
];
function pbGuessSection(pb, topic) {
  const names = [...new Set(pb.clauses.map(c => c.section || 'General'))];
  for (const [about, sec] of PB_SECTION_HINTS) {
    if (about.test(topic)) { const hit = names.find(n => sec.test(n)); if (hit) return hit; }
  }
  return names[names.length - 1] || 'General';
}

/* The standard playbooks ship with a past: each version before this one
   had fewer clauses and fewer fallbacks, the way a playbook actually
   grows through negotiations. */
const PB_HISTORY_NAMES = ['First draft', 'Added fallback positions',
  'Tightened the liability positions', 'Updated after the Q3 negotiations', 'Clause review'];

function pbEnsureVersions(pb) {
  pb.clauses.forEach(pbNormClause);
  if (Array.isArray(pb.versions) && pb.versions.length) return;
  const V = Math.max(1, pb.version || 1);
  const end = new Date(pb.updated);
  pb.versions = [];
  for (let k = 1; k <= V; k++) {
    const snap = pbSnap(pb);
    if (k < V) {
      const drop = (V - k) * 2;
      snap.clauses = snap.clauses.slice(0, Math.max(3, snap.clauses.length - drop));
      if (k === 1) snap.clauses.forEach(c => { c.fallbacks = c.fallbacks.slice(0, 1); });
    }
    const when = new Date(end.getTime() - (V - k) * 19 * 864e5);
    pb.versions.push({
      name: k === V && V > 1 ? PB_HISTORY_NAMES[Math.min(k - 1, PB_HISTORY_NAMES.length - 1)]
        : PB_HISTORY_NAMES[Math.min(k - 1, PB_HISTORY_NAMES.length - 1)],
      when: pbWhen(when.toISOString()),
      by: k % 2 ? pb.owner : 'Assistant',
      snap,
    });
  }
  pb.version = V;
  pb.synced = V;
  if (pb.published == null) pb.published = pb.status === 'draft' ? null : V - 1;
}

/* A new version: the change is made to the live playbook, and the
   version records what it now is. */
function pbBump(pb, meta, change) {
  change?.(pb);
  pbTouch(pb);
  pb.versions.push({ when: 'Just now', by: 'Assistant', ...meta, snap: pbSnap(pb) });
  pb.version = pb.versions.length;
  pb.synced = pb.versions.length;
  save();
  const a = pbArtifact(pb);
  a.vi = pb.versions.length - 1;
  return pb.versions.length;
}

/* Restore is the artifact system's: it adds a copy of an older version
   as the newest. The playbook follows it the next time it is drawn. */
function pbFollowRestore(pb) {
  if ((pb.synced || 0) >= pb.versions.length) return;
  const snap = structuredClone(pb.versions[pb.versions.length - 1].snap);
  pb.name = snap.name; pb.description = snap.description; pb.clauses = snap.clauses;
  pb.versions[pb.versions.length - 1].snap = pbSnap(pb);
  pb.version = pb.synced = pb.versions.length;
  pbTouch(pb); save();
}

/* ── the artifact ─────────────────────────────────────────────── */

const pbArtId = (pb) => 'playbook-' + pb.id;

function pbArtifact(pb) {
  pbEnsureVersions(pb);
  const id = pbArtId(pb);
  let a = ARTIFACTS[id];
  if (!a) {
    a = ARTIFACTS[id] = {
      id, kind: 'playbook', pbId: pb.id, ext: 'playbook',
      get name() { return pbFind(this.pbId)?.name || 'Untitled playbook'; },
      set name(v) { const p = pbFind(this.pbId); if (p) { p.name = v; pbTouch(p); save(); } },
      session: () => pbSession(pbFind(a.pbId)),
      onPublish: (btn, repaint) => pbPublishPop(pbFind(a.pbId), btn, repaint),
      pubInfo: () => pbPubInfo(pbFind(a.pbId)),
      onDelete: () => { const p = pbFind(a.pbId); closeArtifact?.(); if (p) deletePlaybook(p); },
    };
  }
  a.versions = pb.versions;
  if (a.vi != null && a.vi >= pb.versions.length) a.vi = null;
  return a;
}

/* a link to one lands on it, even before the list has been opened */
function pbArtifactById(id) {
  const m = /^playbook-(.+)$/.exec(id);
  const pb = m && pbFind(m[1]);
  return pb ? pbArtifact(pb) : null;
}

/* Read it: the playbook takes the window, over the list. */
function pbView(pb) {
  const a = pbArtifact(pb);
  a.vi = null;
  if (state.view !== 'playbooks' || PB.open) { closePlaybook(); go('playbooks'); }
  openArtifact(a, { full: true });
  setArtifactHash(a);
}

/* Change it: the conversation on the left, the playbook beside it. */
function pbEditInChat(pb, intro) {
  const a = pbArtifact(pb);
  a.vi = null;
  openSession(pbSession(pb, intro));
  queueMicrotask(() => openArtifact(a));
}

/* ── the conversation it is edited in ─────────────────────────── */

const PB_SES = {};

/* #chat/pb-ses-<id> — back to the playbook's conversation after a reload */
function pbSessionRoute(id) {
  const m = /^pb-ses-(.+)$/.exec(id);
  const pb = m && pbFind(m[1]);
  if (!pb) return false;
  pbEditInChat(pb);
  return true;
}

function pbSession(pb, intro) {
  if (!pb) return null;
  pbEnsureVersions(pb);
  const id = 'pb-ses-' + pb.id;
  if (PB_SES[id] && !intro) return PB_SES[id];
  const a = pbArtifact(pb);
  PB_SES[id] = {
    id, artifact: a.id, label: pb.name || 'Untitled playbook', meta: 'now',
    people: [{ name: USER.name, online: true, owner: true }],
    messages: intro || [
      { role: 'user', text: `Let's work on the ${pb.name || 'untitled'} playbook.` },
      { role: 'bot', answer: pbSummary(pb), cites: null,
        steps: [{ source: 'playbook', query: 'Read ' + (pb.name || 'the playbook'),
          count: `${pb.clauses.length} clauses` }],
        suggest: pbSuggest(pb) },
    ],
  };
  return PB_SES[id];
}

function pbSummary(pb) {
  pbEnsureVersions(pb);
  const n = pb.clauses.length;
  const hard = pb.clauses.filter(c => !c.fallbacks.length).length;
  const two = pb.clauses.filter(c => c.fallbacks.length > 1).length;
  const v = 'v' + pb.versions.length;
  const pub = pb.published != null ? `v${pb.published + 1} is the one reviews use` : 'nothing is published yet';
  const secs = new Set(pb.clauses.map(c => c.section || 'General')).size;
  return `It is open beside this chat — ${n} clauses in ${secs} ${secs === 1 ? 'section' : 'sections'}. `
    + (hard ? `${hard} hold one line with nothing to concede` : 'Every clause has somewhere to move to')
    + (two ? `, and ${two} have more than one fallback.` : '.')
    + `\n\nYou are on ${v}; ${pub}. Tell me what to change and I will make it a new version — `
    + 'the one before it stays in the history.';
}

/* the clause a playbook of this kind is most often missing */
const PB_MISSING = {
  nda: 'non-solicitation of employees', dpa: 'AI training on personal data',
  services: 'change requests', supplier: 'business continuity',
};

function pbSuggest(pb) {
  pbEnsureVersions(pb);
  const out = [];
  const firm = pb.clauses.find(c => /governing|law|venue|liab/i.test(c.topic) && c.fallbacks.length)
    || pb.clauses.find(c => c.fallbacks.length);
  if (firm) out.push(`Make ${firm.topic} a hard line, with no fallback`);
  const term = pb.clauses.find(c => /\bterm\b|duration/i.test(c.topic));
  if (term) out.push(`Change ${term.topic} to a shorter 2-year window`);
  else {
    const one = pb.clauses.find(c => c.fallbacks.length === 1);
    if (one) out.push(`Add a second fallback to ${one.topic}`);
  }
  const kind = (PB_KINDS.find(k => k.re.test(pb.name + ' ' + (pb.description || ''))) || {}).id;
  out.push(`Add a clause covering ${PB_MISSING[kind] || 'AI and the use of customer data'}`);
  return out;
}

/* ── asking for a change ──────────────────────────────────────── */

const pbWords = (s) => (s.toLowerCase().match(/[a-z]{4,}/g) || []);
function pbClauseIn(pb, text) {
  const ask = new Set(pbWords(text));
  let best = null, score = 0;
  for (const c of pb.clauses) {
    const hit = pbWords(c.topic).filter(w => ask.has(w)).length;
    if (hit > score) { best = c; score = hit; }
  }
  return best;
}
const pbCap = (s) => s ? s[0].toUpperCase() + s.slice(1) : s;
const PB_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/* What a request does to the playbook. Each returns the change, what the
   version is called, and what to say — or null if it is not this kind. */
const PB_ASKS = [
  { // a hard line
    test: (q) => /hard (red )?line|no fallback|non-?negotiable|red line/.test(q),
    run: (pb, q) => {
      const c = pbClauseIn(pb, q) || pb.clauses.find(x => x.fallbacks.length);
      if (!c) return null;
      return { clause: c, name: `Made ${c.topic} a hard line`,
        change: () => {
          c.walkaway = `Anything short of our starting position on ${c.topic.toLowerCase()}. `
            + 'There is no fallback: escalate rather than concede.';
          c.fallbacks = [];
        },
        say: `${c.topic} is now a hard line — the fallbacks are gone, and Not acceptable says to escalate `
          + 'rather than concede.' };
    } },
  { // a shorter term
    test: (q) => /(\d+|one|two|three|four|five)[- ]year/.test(q),
    run: (pb, q) => {
      const c = pbClauseIn(pb, q) || pb.clauses.find(x => /\bterm\b|duration/i.test(x.topic));
      if (!c) return null;
      const m = /(\d+|one|two|three|four|five)[- ]year/.exec(q);
      const n = isNaN(+m[1]) ? PB_NUM.indexOf(m[1]) : +m[1];
      return { clause: c, name: `${c.topic}: ${n} years`,
        change: () => {
          c.preferred = `Obligations last ${PB_NUM[n] || n} (${n}) years from each disclosure, and trade `
            + 'secrets stay protected for as long as they remain trade secrets.';
        },
        say: `${c.topic} now starts at ${n} years. I left Not acceptable and the fallbacks alone — `
          + 'tell me if the floor should move with it.' };
    } },
  { // another fallback
    test: (q) => /fallback/.test(q),
    run: (pb, q) => {
      const c = pbClauseIn(pb, q) || pb.clauses[0];
      if (!c) return null;
      return { clause: c, name: `Added a fallback to ${c.topic}`,
        change: () => {
          c.fallbacks.push({ text: `As a last step before walking away: accept the counterparty's position on `
            + `${c.topic.toLowerCase()} if it is mutual and capped, with Legal sign-off.`, language: '' });
        },
        say: `${c.topic} has a new last fallback — mutual, capped, and only with Legal's sign-off. `
          + 'It sits after the others, so it is the last thing you concede.' };
    } },
  { // a new clause
    test: (q) => /\b(add|new)\b.*\b(clause|rule|position)\b/.test(q),
    run: (pb, q) => {
      const m = /(?:covering|for|on|about|around)\s+(?:the\s+)?(.+?)[.?!]?$/.exec(q);
      const subject = (m ? m[1] : 'a new subject').replace(/\s+as a (standalone|separate) clause$/, '');
      const topic = pbCap(subject);
      const c = pbNormClause({ id: pbUid('clause'), topic, covers: `Anything on ${subject}`,
        preferred: `${topic} on our standard terms: mutual, limited to what the agreement needs, and `
          + 'written into the agreement rather than a side letter.',
        walkaway: `Terms on ${subject} that apply to us but not to them, or that sit outside the liability cap.`,
        fallbacks: [{ text: `${topic} on the counterparty's wording, if it is mutual and Legal has reviewed it.`,
          language: '' }],
        preferred_language: '', section: pbGuessSection(pb, subject) });
      return { clause: c, name: `Added ${topic}`,
        change: () => { pbInsertClause(pb, c); },
        say: `Added ${topic} under ${c.section}, with a starting position, what we will not `
          + 'accept, and one fallback. Read it before it goes live — it is a first draft.' };
    } },
];

function playbookTurn(a, prompt, given) {
  const pb = pbFind(a.pbId);
  if (!pb) return;
  const q = prompt.toLowerCase();
  /* asked on a passage, the change is already worked out; asked in the
     box, it is read from the words */
  const spec = given ? given.spec : PB_ASKS.find(x => x.test(q))?.run(pb, q) || null;

  const m = { role: 'bot', steps: [], text: '', thinking: true };
  thread.messages.push(m);
  paintThread();

  const step = { source: 'playbook', query: spec ? spec.name : 'Read the request against each clause',
    count: spec ? 'new version' : 'no change' };
  setTimeout(() => { m.steps.push({ ...step, rows: [], running: true }); renderBot(m); }, 320);
  setTimeout(() => { Object.assign(m.steps[0], step, { running: false }); renderBot(m); }, 1200);
  setTimeout(() => {
    m.thinking = false;
    m.cites = null;
    if (m.traceOpen == null) m.traceOpen = false;
    if (!spec) {
      m.text = given?.miss || 'I could not tell which clause that is about. Name the clause and the position — Starting '
        + 'Position, Not acceptable, or a fallback — and I will make the change as a new version.';
      if (!given) m.suggest = pbSuggest(pb);
      renderBot(m);
      return;
    }
    const n = pbBump(pb, { name: spec.name }, spec.change);
    m.steps[0].count = 'Version ' + n;
    m.text = spec.say;
    m.artifact = a.id;
    renderBot(m);
    PB.flashClause = spec.clause.id;
    if (document.getElementById('main')?.dataset.artifact === 'open') openArtifact(a);
    PB.repaintList?.();
  }, 1700);
}

/* ── a change asked for on a passage ──────────────────────────
   Select some words in the playbook, say what should happen to them,
   and it goes to the playbook's conversation as a request about exactly
   those words. No model behind it yet, so three plain kinds of ask are
   carried out — take it out, put other words in its place, change a
   number — and anything else is answered honestly rather than faked. */
function pbAskChange(pb, t) {
  const a = pbArtifact(pb);
  const c = t.c, topic = c ? (c.topic || 'Untitled clause') : t.sec;
  const cur = t.key === 'fallback' ? (c.fallbacks[t.fi]?.text || '') : t.key === 'section' ? t.sec : (c[t.key] || '');
  const set = (v) => {
    if (t.key === 'fallback') c.fallbacks[t.fi].text = v;
    else if (t.key === 'section') { for (const x of pb.clauses) if ((x.section || 'General') === t.sec) x.section = v || t.sec; }
    else c[t.key] = v;
  };
  const tidy = (x) => x.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/^[\s,;:]+/, '').trim();
  const swap = (rep) => tidy(cur.slice(0, t.from) + rep + cur.slice(t.to));
  const picked = cur.slice(t.from, t.to), ask = t.ask.trim();
  let next = null;
  const rep = /(?:replace (?:it|this|that)?\s*with|change (?:it|this|that)?\s*to|(?:make|have) (?:it|this) (?:say|read)|(?:it |this )?should (?:say|read)|reword(?: it| this)? (?:as|to)|^say)[:\s]+["“'‘]?(.+?)["”'’]?\.?$/i.exec(ask);
  const num = /(\d+(?:\.\d+)?)\s*(%|x|×|days?|weeks?|months?|years?|hours?)?/i.exec(ask);
  if (/^(please )?(remove|delete|drop|cut|strike|take (this|it|that) out)\b/i.test(ask)) next = swap('');
  else if (rep) next = swap(rep[1] + (/[.]$/.test(picked.trim()) ? '.' : ''));
  else if (num && /\d/.test(picked)) {
    /* the number moves; its unit moves with it only if a new one was given */
    next = swap(picked.replace(/(\d+(?:\.\d+)?)(\s*)(%|x|×|days?|weeks?|months?|years?|hours?)?/i,
      (_, n, sp, unit) => num[1] + (num[2] ? (/^[%x×]$/i.test(num[2]) ? '' : sp || ' ') + num[2] : sp + (unit || ''))));
  }
  const short = picked.trim().length > 60 ? picked.trim().slice(0, 57) + '…' : picked.trim();
  const spec = next != null && next !== cur && c ? {
    clause: c, name: `${topic}: ${t.label} changed`,
    change: () => set(next),
    say: next ? `Done. ${t.label} in ${topic} now reads:\n\n“${next}”`
      : `Done — ${t.label} in ${topic} is now empty. Tell me what it should say, or write it in directly.`,
  } : null;
  const miss = `I have not changed anything yet. Tell me what “${short}” should say instead — for example `
    + '“change it to …” — or say “remove” to take it out, and I will make it a new version.';
  const send = () => {
    say('user', ask, { context: { where: `“${short}”`, artifact: `${topic} · ${t.label}` } });
    paintThread();
    playbookTurn(a, ask, { spec, miss });
  };
  /* it is answered in the playbook's own conversation, opened beside it if it is not already */
  if (thread?.id === 'pb-ses-' + pb.id && state.view === 'thread') send();
  else { pbEditInChat(pb); setTimeout(send, 120); }
}

/* ── publishing ───────────────────────────────────────────────── */

function pbPubInfo(pb) {
  const last = pb.versions.length - 1;
  if (pb.status === 'live' && pb.published === last) {
    return { state: 'live', label: 'Published', title: `v${last + 1} is the version reviews use` };
  }
  if (pb.status === 'live' && pb.published != null) {
    return { state: 'stale', label: 'Publish',
      title: `v${last + 1} has changes — v${pb.published + 1} is the one reviews use` };
  }
  return { state: 'off', label: 'Publish', title: 'Publish this playbook so reviews can use it' };
}

function pbPublishPop(pb, anchor, repaint) {
  if (!pb) return;
  if (openMenu && openMenu.dataset.for === 'pb-pub') return closeMenu();
  closeMenu();
  const last = pb.versions.length - 1;
  const v = 'v' + (last + 1);
  const already = pb.status === 'live' && pb.published === last;
  const prev = pb.published != null && pb.published !== last ? 'v' + (pb.published + 1) : null;
  const el = h('div', { class: 'menu pb-pub', role: 'dialog', 'data-for': 'pb-pub', 'aria-label': 'Publish' },
    h('div', { class: 'pb-pub-t' }, already ? `${v} is published` : `Publish ${v}`),
    h('p', { class: 'pb-pub-p' }, already
      ? 'Every new review checks contracts against this version. Change it here and publish again when it is ready.'
      : prev
        ? `Reviews use ${prev} today. ${v} replaces it for every new review; ${prev} stays in the history.`
        : `Reviews start checking contracts against ${v} as soon as it is published. Earlier versions stay in the history.`),
    h('div', { class: 'pb-pub-acts' },
      already
        ? h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => {
            closeMenu(); pb.status = 'draft'; pb.published = null; pbTouch(pb); save();
            repaint(); PB.repaintList?.(); pbToast(`Unpublished. Reviews no longer use this playbook.`);
          } }, 'Unpublish')
        : h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => closeMenu() }, 'Cancel'),
      already ? null : h('button', { class: 'btn btn--primary', type: 'button', onclick: () => {
        closeMenu(); pb.status = 'live'; pb.published = last; pbTouch(pb); save();
        repaint(); PB.repaintList?.(); pbToast(`${v} is published.`);
      } }, `Publish ${v}`)));
  document.body.append(el);
  openMenu = el;
  const r = anchor.getBoundingClientRect();
  el.style.top = (r.bottom + 8) + 'px';
  el.style.left = Math.max(12, Math.min(r.right - el.offsetWidth, innerWidth - el.offsetWidth - 12)) + 'px';
  el.classList.add('opening');
  el.addEventListener('click', e => e.stopPropagation());
}

/* ── the page ─────────────────────────────────────────────────── */

/* Starting Position: a green dot with a pale halo. Not acceptable: a red
   triangle. Fallback: an orange triangle, pointing down, on a pale ring. */
/* one family: a pale disc in the position's colour, and its sign on it —
   a dot to start from, a triangle up for what we refuse, the same triangle
   down for where we can fall back to */
const PBV_TRI = 'M8 11.6c-.25 0-.5-.13-.63-.36L4.6 6.5c-.28-.5.08-1.1.64-1.1h5.52c.56 0 .92.6.64 1.1l-2.77 '
  + '4.74c-.13.23-.38.36-.63.36z';
const PBV_MARK = {
  preferred: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.8" fill="#DDF2E3"/>'
    + '<circle cx="8" cy="8" r="3.5" fill="#1A8A3F"/></svg>',
  walkaway:  '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.8" fill="#FBE1DD"/>'
    + `<path d="${PBV_TRI}" transform="matrix(1 0 0 -1 0 16.3)" fill="#D2332B"/></svg>`,
  fallback:  '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.8" fill="#FDEBCF"/>'
    + `<path d="${PBV_TRI}" fill="#F08A12"/></svg>`,
};
const pbvMark = (k) => h('span', { class: 'pbv-mark', 'data-k': k, html: PBV_MARK[k] });

/* The outline around each position card.
     'always' — every card outlined all the time
     'hover'  — no outlines at rest; a clause's cards get theirs while it is
                hovered or being edited. Tried 2026-10-02 and put back: without
                their outlines the positions looked like they were hanging. */
const PBV_CARD_BORDERS = 'always';

const PBV_POS = {
  preferred: { label: 'Starting Position' },
  walkaway:  { label: 'Not acceptable' },
  fallback:  { label: 'Fallback' },
};
const pbvCount = (c) => 2 + c.fallbacks.length;   // the cards a clause shows

function pbRender(a) {
  const pb = pbFind(a.pbId);
  if (!pb) return h('div', { class: 'pbv-gone' }, 'This playbook has been deleted.');
  pbFollowRestore(pb);
  const latest = isCurrentVersion(a);
  const src = latest ? pb : versionOf(a).snap;
  /* the latest version is a document you type into, wherever it is open;
     an older version is a record, and reads only */
  const editable = latest;

  let saveT = 0;
  const commit = () => {
    pbTouch(pb);
    pb.versions[pb.versions.length - 1].snap = pbSnap(pb);
    clearTimeout(saveT);
    saveT = setTimeout(() => { save(); PB.repaintList?.(); }, 400);
  };

  /* ── sections ─────────────────────────────────────────────────
     A playbook of any real size is read by section — Security,
     Compliance, Liability — so its clauses are grouped, in the order
     the sections first appear. Numbering follows: section 2 holds 2.1,
     2.2… */
  const groups = () => {
    const out = [];
    for (const c of src.clauses) {
      const name = c.section || 'General';
      let g = out.find(x => x.name === name);
      if (!g) out.push(g = { name, clauses: [] });
      g.clauses.push(c);
    }
    return out;
  };
  /* ── the index ────────────────────────────────────────────────
     The playbook's outline: every section, numbered, with its clauses
     under it — 1, then 1.1, 1.2. All of it is open to begin with; the
     chevron at the end of a section's row folds it away. */
  const folded = (PB.idxFold[pb.id] ||= new Set());   // sections closed by hand
  let searching = false;    // a search shows every section that has a match
  const hl = { q: '', marks: [], cur: -1, raf: 0 };   // what the search found, and the match you are on
  let held = false;         // you chose a place in the list: it stays there until you scroll the sheet yourself
  let wasOpen = null;
  const isOpen = (name) => searching || !folded.has(name);

  const idxList = h('div', { class: 'pbv-idx-list' });
  let drag = null;        // a clause or a section being carried in the index
  let renaming = false;   // a section's name being typed in the index
  const paintIdx = () => {
    if (drag || renaming) return;
    const nowOpen = new Set();
    idxList.replaceChildren(...groups().map((g, si) => {
      const open = isOpen(g.name);
      if (open) nowOpen.add(g.name);
      /* number (a grip on hover) · name · rename (on hover) · fold */
      const head = h('div', { class: 'pbv-idx-sec', 'data-sec': g.name, 'data-open': String(open) },
        editable && h('span', { class: 'pbv-idx-grip', 'aria-hidden': 'true', 'data-tip': 'Drag to Reorder', html: PBV_GRIP }),
        h('span', { class: 'pbv-idx-no pbv-idx-sec-no' }, `${si + 1}.`),
        h('button', { class: 'pbv-idx-sec-t', type: 'button',
          onclick: () => goSec(g.name),
          ondblclick: editable ? () => renameSec(g.name) : null },
          h('span', { class: 'pbv-idx-sec-name' }, g.name)),
        editable && h('button', { class: 'pbv-idx-ren', type: 'button', 'aria-label': 'Rename ' + g.name,
          'data-tip': 'Rename Section', html: PBV_PENCIL, onclick: (e) => { e.stopPropagation(); renameSec(g.name); } }),
        h('button', { class: 'pbv-idx-fold', type: 'button', 'aria-expanded': String(open),
          'aria-label': (open ? 'Collapse ' : 'Expand ') + g.name, html: PB_SVG.chev,
          'data-tip': open ? 'Collapse Section' : 'Expand Section',
          onclick: (e) => { e.stopPropagation(); toggleSec(g.name); } }));
      const items = h('div', { class: 'pbv-idx-items' + (open && wasOpen && !wasOpen.has(g.name) ? ' is-opening' : ''), hidden: !open },
        ...g.clauses.map((c, ci) => h('button', { class: 'pbv-idx-it', type: 'button', 'data-id': c.id,
          onclick: () => jump(c.id) },
          editable && h('span', { class: 'pbv-idx-grip', 'aria-hidden': 'true', 'data-tip': 'Drag to Reorder', html: PBV_GRIP }),
          h('span', { class: 'pbv-idx-no' }, `${si + 1}.${ci + 1}`),
          h('span', { class: 'pbv-idx-t' }, c.topic || 'Untitled clause'))));
      return h('div', { class: 'pbv-idx-group' }, head, items);
    }));
    wasOpen = nowOpen;
    markCurrent();
    syncIdxFold();
    if (hl.q) queueHits();
  };
  /* one control folds the list to its section names, and opens it again */
  const idxAllFolded = () => { const g = groups(); return g.length > 0 && g.every(x => folded.has(x.name)); };
  const idxFoldBtn = h('button', { class: 'pbv-icon', type: 'button', onclick: () => {
    const all = idxAllFolded();
    folded.clear();
    if (!all) for (const g of groups()) folded.add(g.name);
    wasOpen = all ? new Set() : wasOpen;      // opening them all: each one arrives
    paintIdx();
  } });
  function syncIdxFold() {
    const all = idxAllFolded();
    idxFoldBtn.innerHTML = all ? PBV_EXPAND_ALL : PBV_COLLAPSE_ALL;
    idxFoldBtn.dataset.tip = all ? 'Show All Clauses' : 'Show Sections Only';
    idxFoldBtn.setAttribute('aria-label', idxFoldBtn.dataset.tip);
    idxFoldBtn.setAttribute('aria-pressed', String(all));
  }
  /* The chevron folds a section away or brings it back; its name takes you there. */
  function toggleSec(name) {
    if (!folded.delete(name)) folded.add(name);
    paintIdx();
  }
  function goSec(name) {
    folded.delete(name); curSec = name; held = true;
    paintIdx();
    jumpSec(name);
  }

  /* Renaming a section where you see it listed: the name becomes a field.
     Enter or clicking away keeps it, Escape puts the old one back. */
  function renameSec(name) {
    const head = [...idxList.querySelectorAll('.pbv-idx-sec')].find(x => x.dataset.sec === name);
    const btn = head?.querySelector('.pbv-idx-sec-t');
    if (!btn) return;
    const input = h('input', { class: 'pbv-idx-sec-in', value: name, 'aria-label': 'Section name' });
    let done = false;
    const finish = (keep) => {
      if (done) return;
      done = true; renaming = false;
      const next = input.value.trim();
      if (keep && next && next !== name) {
        if (groups().some(g => g.name === next)) pbToast('A section with that name already exists.');
        else {
          for (const c of pb.clauses) if ((c.section || 'General') === name) c.section = next;
          if (folded.delete(name)) folded.add(next);
          if (PB.secFold?.[pb.id]?.delete(name)) PB.secFold[pb.id].add(next);
          if (curSec === name) curSec = next;
          commit(); paintClauses();
          return;
        }
      }
      paintIdx();
    };
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();            // Escape here is for the field, not the panel
      if (e.key === 'Enter') finish(true);
      if (e.key === 'Escape') finish(false);
    });
    input.addEventListener('blur', () => finish(true));
    head.classList.add('is-renaming');
    btn.replaceWith(input);
    renaming = true;
    input.focus(); input.select();
  }
  const idx = h('aside', { class: 'pbv-idx' + (PB.idxHidden ? ' is-hidden' : '') },
    h('div', { class: 'pbv-idx-head' },
      h('span', { class: 'pbv-cap' }, 'Clauses'),
      h('span', { class: 'pb-grow' }),
      idxFoldBtn,
      h('button', { class: 'pbv-icon', type: 'button', 'aria-label': 'Hide the clause list',
        'data-tip': 'Hide Clause List', html: PBV_PANEL,
        onclick: () => showList(false) })),
    idxList);
  /* ── carrying a clause to a new place ─────────────────────────
     Pointer-driven rather than the browser's own drag, so the row can
     follow the hand, the list can open a slot for it as it goes, and the
     numbers can count themselves again before it is even put down. */
  const indexNumbers = () => idxList.querySelectorAll('.pbv-idx-group').forEach((g, si) => {
    g.querySelector('.pbv-idx-sec-no').textContent = `${si + 1}.`;
    g.querySelectorAll('.pbv-idx-it .pbv-idx-no').forEach((n, ci) => { n.textContent = `${si + 1}.${ci + 1}`; });
  });
  /* move the slot, and let everything it displaces slide rather than jump */
  const moveSlot = (place) => {
    const moved = [...idxList.querySelectorAll('.pbv-idx-it, .pbv-idx-sec')];
    const before = new Map(moved.map(el => [el, el.getBoundingClientRect().top]));
    place();
    for (const el of moved) {
      if (el === drag.it || drag.it.contains(el)) continue;
      const dy = before.get(el) - el.getBoundingClientRect().top;
      if (!dy) continue;
      el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }],
        { duration: 180, easing: 'cubic-bezier(.2,0,0,1)' });
    }
    indexNumbers();
  };
  const dragStep = (e) => {
    const { it, ghost } = drag;
    ghost.style.left = (e.clientX - drag.dx) + 'px';
    ghost.style.top = (e.clientY - drag.dy) + 'px';
    drag.y = e.clientY;
    /* a whole section: it goes before the first heading the pointer is above */
    if (drag.sec) {
      const next = [...idxList.children].filter(g => g !== it).find(g => {
        const r = g.querySelector('.pbv-idx-sec').getBoundingClientRect();
        return e.clientY < r.top + r.height / 2;
      }) || null;
      if (it.nextElementSibling !== next) moveSlot(() => idxList.insertBefore(it, next));
      return;
    }
    /* what the pointer is over decides where the slot goes */
    const stops = [...idxList.querySelectorAll('.pbv-idx-it:not(.is-slot), .pbv-idx-sec')]
      .filter(el => el.offsetParent !== null);
    const next = stops.find(el => { const r = el.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
    let box, ref = null;
    if (next?.classList.contains('pbv-idx-it')) { box = next.parentElement; ref = next; }
    else {
      /* above a section's heading means the end of the section before it;
         past the last row means the end of the last section */
      const group = next ? next.parentElement.previousElementSibling : idxList.lastElementChild;
      box = (group || next.parentElement).querySelector('.pbv-idx-items');
      if (!group) ref = box.firstElementChild === it ? it.nextElementSibling : box.firstElementChild;
    }
    for (const s of idxList.querySelectorAll('.pbv-idx-sec.is-drop')) s.classList.remove('is-drop');
    /* a closed section cannot show the slot, so its heading lights instead —
       and, held there a moment, it springs open to take the clause anywhere */
    if (box.hidden) {
      const head = box.previousElementSibling;
      head.classList.add('is-drop');
      if (drag.spring?.box !== box) {
        clearTimeout(drag.spring?.t);
        drag.spring = { box, t: setTimeout(() => {
          if (!drag) return;
          box.hidden = false; box.classList.add('is-opening');
          head.dataset.open = 'true'; head.classList.remove('is-drop');
        }, 450) };
      }
    } else { clearTimeout(drag.spring?.t); drag.spring = null; }
    if (it.parentElement === box && it.nextElementSibling === ref) return;
    if (ref === it) return;
    moveSlot(() => box.insertBefore(it, ref));
  };
  const dragScroll = () => {
    if (!drag) return;
    const r = idx.getBoundingClientRect();
    if (drag.y < r.top + 44) idx.scrollTop -= 7;
    else if (drag.y > r.bottom - 44) idx.scrollTop += 7;
    drag.raf = requestAnimationFrame(dragScroll);
  };
  const dragEnd = (cancel) => {
    const { it, ghost, order } = drag;
    cancelAnimationFrame(drag.raf);
    clearTimeout(drag.spring?.t);
    root.classList.remove('is-dragging');
    for (const s of idxList.querySelectorAll('.pbv-idx-sec.is-drop')) s.classList.remove('is-drop');
    /* a section put down: its clauses go with it, in the order they were in */
    if (drag.sec) {
      const names = [...idxList.querySelectorAll('.pbv-idx-sec')].map(x => x.dataset.sec);
      const changed = !cancel && names.join('\n') !== order;
      const name = it.querySelector('.pbv-idx-sec').dataset.sec;
      const home = it.querySelector('.pbv-idx-sec').getBoundingClientRect();
      ghost.classList.add('is-landing');
      ghost.style.left = home.left + 'px'; ghost.style.top = home.top + 'px';
      setTimeout(() => {
        ghost.remove();
        idxList.classList.remove('is-sec-drag');
        drag = null;
        if (changed) {
          pb.clauses = names.flatMap(n => pb.clauses.filter(c => (c.section || 'General') === n));
          commit(); paintClauses();
          const sec = [...clausesEl.querySelectorAll('.pbv-sec')].find(x => x.dataset.sec === name);
          sec?.classList.add('is-moved');
          requestAnimationFrame(() => goSec(name));
        } else paintIdx();
        spy();
      }, 200);
      return;
    }
    /* the new order is whatever the index now shows */
    const next = [];
    if (!cancel) {
      for (const g of idxList.querySelectorAll('.pbv-idx-group')) {
        const section = g.querySelector('.pbv-idx-sec').dataset.sec;
        for (const row of g.querySelectorAll('.pbv-idx-it')) {
          const c = pb.clauses.find(x => x.id === row.dataset.id);
          if (c) { c.section = section; next.push(c); }
        }
      }
    }
    const changed = !cancel && next.length === pb.clauses.length
      && next.map(c => c.id + c.section).join() !== order;
    /* the carried row settles into its slot, or into the folded heading */
    const home = (it.offsetParent ? it : it.parentElement.previousElementSibling).getBoundingClientRect();
    ghost.classList.add('is-landing');
    ghost.style.left = home.left + 'px'; ghost.style.top = home.top + 'px';
    if (!it.offsetParent) ghost.style.opacity = '0';
    const id = it.dataset.id;
    setTimeout(() => {
      ghost.remove();
      drag = null;
      if (changed) {
        pb.clauses = next; commit();
        paintClauses(id, 'is-changed');
        requestAnimationFrame(() => jump(id));
      } else paintIdx();
      spy();
    }, 200);
  };
  idxList.addEventListener('pointerdown', (e) => {
    if (!editable || e.button !== 0 || drag || renaming) return;
    const row = e.target.closest('.pbv-idx-it');
    const secHead = !row && !e.target.closest('.pbv-idx-ren, .pbv-idx-fold, input') && e.target.closest('.pbv-idx-sec');
    if (!row && !secHead) return;
    /* a section is carried as its whole group; a clause as its row */
    const it = row || secHead.parentElement;
    const handle = row || secHead;
    const x0 = e.clientX, y0 = e.clientY;
    const move = (ev) => {
      if (!drag) {
        /* a click stays a click until the hand has actually moved */
        if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 5) return;
        const r = handle.getBoundingClientRect();
        const ghost = handle.cloneNode(true);
        ghost.classList.add('pbv-drag-ghost');
        ghost.style.width = r.width + 'px'; ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px';
        document.body.append(ghost);
        drag = { it, ghost, sec: !row, dx: x0 - r.left, dy: y0 - r.top, y: ev.clientY,
          order: row ? pb.clauses.map(c => c.id + c.section).join()
            : groups().map(g => g.name).join('\n') };
        it.classList.add('is-slot');
        /* carrying a section, every section folds to its heading: the list
           becomes just the things being put in order */
        if (!row) idxList.classList.add('is-sec-drag');
        root.classList.add('is-dragging');
        drag.raf = requestAnimationFrame(dragScroll);
      }
      ev.preventDefault();
      dragStep(ev);
    };
    const stop = (cancel) => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', abort);
      removeEventListener('keydown', key, true);
      if (drag) {
        /* the release would otherwise read as a click, and jump. The guard
           lasts only for that release: a drag that ends without a click
           (Escape) must not swallow the next real one. */
        const eat = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
        idxList.addEventListener('click', eat, { capture: true });
        setTimeout(() => idxList.removeEventListener('click', eat, { capture: true }), 0);
        dragEnd(cancel);
      }
    };
    const up = () => stop(false);
    const abort = () => stop(true);
    /* caught first, so the panel's own Escape (leave full screen) never sees it */
    const key = (ev) => { if (ev.key === 'Escape' && drag) { ev.stopPropagation(); ev.preventDefault(); stop(true); } };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', abort);
    addEventListener('keydown', key, true);
  });

  const showIdx = h('button', { class: 'pbv-icon pbv-panel-btn pbv-show-idx', type: 'button', 'aria-label': 'Show the clause list',
    'data-tip': 'Show Clause List', html: PBV_PANEL,
    onclick: () => showList(true) });

  /* ── the sheet ── */
  const count = h('span', { class: 'pbv-count' });
  const paintCount = () => { count.textContent = src.clauses.length; };
  /* Search has no box: the glass, your words after it, and how many
     clauses match. `/` opens it from anywhere on the sheet. */
  const closeFind = () => { qIn.value = ''; filter(); find.classList.remove('is-open'); qIn.blur(); };
  const qIn = h('input', { type: 'search', placeholder: 'Search clauses', 'aria-label': 'Search clauses',
    oninput: () => filter(),
    onkeydown: (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeFind(); }
      /* Enter walks the matches, Shift+Enter walks back */
      if (e.key === 'Enter') { e.preventDefault(); stepHit(e.shiftKey ? -1 : 1); }
    },
    onblur: () => { if (!qIn.value) find.classList.remove('is-open'); } });
  const findCt = h('span', { class: 'pbv-find-ct', 'aria-live': 'polite' });
  const find = h('div', { class: 'pb-find pbv-find' },
    h('button', { class: 'pb-find-btn', type: 'button', 'aria-label': 'Search clauses', 'data-tip': 'Search Clauses  ( / )',
      html: PB_SVG.search, onclick: () => { find.classList.add('is-open'); qIn.focus(); } }),
    qIn, findCt,
    h('button', { class: 'pbv-find-x', type: 'button', 'aria-label': 'Clear search', 'data-tip': 'Clear Search', html: PBV_X,
      onmousedown: (e) => e.preventDefault(),        // the field keeps its focus
      onclick: () => { qIn.value = ''; filter(); qIn.focus(); } }));

  const clausesEl = h('div', { class: 'pbv-cls' });
  const nomatch = h('p', { class: 'pbv-none', hidden: true }, 'No clause matches that search.');
  /* the section being read: the one open in the list, and where a new clause goes */
  let curSec = src.clauses[0] ? (src.clauses[0].section || 'General') : null;

  /* one control folds every clause to its heading, and opens them all again */
  const foldAllBtn = h('button', { class: 'pbv-add pbv-fold-all', type: 'button',
    onclick: () => foldAll(!allFolded()) });
  /* once a section's heading has scrolled away under the bar, its number and
     name come down in a slim second bar of their own, under the first, so
     you still know where you are and nothing crowds the tools above */
  const ctxN = h('span', { class: 'pbv-bar-ctx-n' }), ctxT = h('span', { class: 'pbv-bar-ctx-t' });
  const ctx = h('button', { class: 'pbv-bar-ctx', type: 'button', tabindex: '-1', 'aria-hidden': 'true',
    'data-tip': 'Go to Section Start',
    onclick: () => scrollToEl([...clausesEl.querySelectorAll('.pbv-sec')].find(x => x.dataset.sec === ctx.dataset.sec)) },
    ctxN, ctxT);
  const bar = h('div', { class: 'pbv-bar' },
    h('span', { class: 'pbv-bar-t' }, 'Clauses'), count,
    h('div', { class: 'pbv-bar-sub' }, ctx),
    h('span', { class: 'pb-grow' }),
    find,
    foldAllBtn,
    editable && h('button', { class: 'pbv-add', type: 'button', 'aria-label': 'Add', 'data-tip': 'Add Clause or Section',
      'aria-haspopup': 'menu', 'aria-expanded': 'false',
      onclick: (e) => { e.stopPropagation(); pbWaysMenu(e.currentTarget, 'pbv-add', [
        { key: 'clause', name: 'Add New Clause', icon: () => h('span', { html: PBV_ADD_CLAUSE }) },
        { key: 'section', name: 'Add New Section', icon: () => h('span', { html: PBV_ADD_SECTION }) },
      ], (k) => k === 'clause' ? addClause(curSec) : addSection(), { keyboard: e.detail === 0, small: true }); } },
      icon('plus', 'ico ico-14')));

  /* the name in the header is the same name, so it follows the typing */
  const rename = () => {
    commit();
    for (const n of document.querySelectorAll('.deck-top .deck-title-name')) n.textContent = pb.name || 'Untitled playbook';
  };
  const title = editable
    ? pbField('input', pb, 'name', rename, { class: 'pbv-title', placeholder: 'Untitled playbook' })
    : h('h1', { class: 'pbv-title' }, src.name || 'Untitled playbook');
  const desc = editable
    ? pbField('textarea', pb, 'description', commit, { class: 'pbv-desc',
        placeholder: 'When should this playbook be used? Clavia reads this to pick it for a contract.' })
    : (src.description ? h('p', { class: 'pbv-desc' }, src.description) : null);

  /* what reviews have proposed for this playbook, waiting for its owner (17 Oct) */
  const props = editable ? (state.pbProposals || []).filter(p => p.pb === pb.id) : [];
  const sheet = h('div', { class: 'pbv-sheet' }, bar,
    h('div', { class: 'pbv-body' }, title, desc, props.length ? pbProposalsEl(pb, props, a) : null, clausesEl, nomatch));
  const scroll = h('div', { class: 'pbv-scroll' }, sheet);
  /* The list sits in a column that closes to nothing; it keeps its own
     width inside, so it slides out whole instead of being squeezed. */
  const root = h('div', { class: 'pbv' + (PB.idxHidden ? ' is-idx-hidden' : '') + (editable ? ' is-editable' : '')
      + (PBV_CARD_BORDERS === 'hover' ? ' is-quiet-cards' : '') },
    h('div', { class: 'pbv-idx-wrap' }, idx), scroll, showIdx);   // the button stays put while the sheet scrolls
  idx.inert = !!PB.idxHidden;
  /* `/` anywhere on the sheet (but not while typing) starts a search */
  const slash = (e) => {
    if (!root.isConnected) return removeEventListener('keydown', slash);
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.('input, textarea, [contenteditable]') || document.querySelector('.pb-dim')) return;
    if (!root.offsetParent) return;
    e.preventDefault();
    find.classList.add('is-open'); qIn.focus();
  };
  addEventListener('keydown', slash);
  function showList(on) {
    PB.idxHidden = !on;
    idx.inert = !on;
    root.classList.toggle('is-idx-hidden', !on);
  }

  /* ── reordering on the sheet itself ───────────────────────────
     A clause is far too tall to carry down a page. So the moment one is
     picked up the sheet folds to an outline — every clause a single line,
     the one in hand a line too — and it is put in order like a list. Put
     down, the sheet opens again around the place it landed. A section is
     carried the same way, among section headings only. */
  let sdrag = null;
  /* whatever a change displaces slides to its new place rather than jumping */
  const sheetFlip = (rows, change, skip) => {
    const before = new Map(rows.map(el => [el, el.getBoundingClientRect().top]));
    change();
    for (const el of rows) {
      if (el === skip) continue;
      const now = el.getBoundingClientRect().top;
      if (now < -80 || now > innerHeight + 80) continue;     // only what can be seen
      const dy = before.get(el) - now;
      if (!dy) continue;
      /* far-off rows arrive from a little way, not from across the page */
      const near = Math.max(-140, Math.min(140, dy));
      el.animate([{ transform: `translateY(${near}px)`, opacity: near === dy ? 1 : 0 }, { transform: 'none', opacity: 1 }],
        { duration: 240, easing: 'cubic-bezier(.2,0,0,1)' });
    }
  };
  const sheetRows = () => [...clausesEl.querySelectorAll(sdrag?.isSec ? '.pbv-sec' : '.pbv-cl, .pbv-sec-head')];
  function sheetLift(el, isSec, x0, y0) {
    document.activeElement?.blur?.();
    const head = el.querySelector(isSec ? '.pbv-sec-head' : '.pbv-cl-head');
    const hr = head.getBoundingClientRect(), er = el.getBoundingClientRect();
    const c = !isSec && pb.clauses.find(x => x.id === el.dataset.id);
    const ghost = h('div', { class: 'pbv-drag-ghost pbv-sheet-ghost' + (isSec ? ' is-sec' : '') },
      h('span', { class: 'pbv-grip', html: PBV_GRIP }),
      h('span', { class: 'pbv-ghost-n' }, el.querySelector(isSec ? '.pbv-sec-n' : '.pbv-cl-n').textContent),
      h('span', { class: 'pbv-ghost-t' }, isSec ? el.dataset.sec : (c?.topic || 'Untitled clause')),
      isSec && h('span', { class: 'pbv-ghost-ct' }, ((n) => `${n} ${n === 1 ? 'clause' : 'clauses'}`)(el.querySelectorAll('.pbv-cl').length)));
    /* the carried line sits exactly over the heading it was lifted from */
    const gx = isSec ? er.left - 22 : er.left, gy = hr.top - (isSec ? 10 : 8);
    ghost.style.width = (isSec ? er.width + 36 : er.width) + 'px';
    ghost.style.left = gx + 'px'; ghost.style.top = gy + 'px';
    document.body.append(ghost);
    sdrag = { el, ghost, isSec, dx: x0 - gx, dy: y0 - gy, y: y0, top0: scroll.scrollTop,
      order: pb.clauses.map(x => x.id + (x.section || 'General')).join() };
    sheetFlip(sheetRows(), () => {
      el.classList.add('is-slot');
      clausesEl.classList.add(isSec ? 'is-sec-outline' : 'is-outline');
      root.classList.add('is-dragging', 'is-sheet-drag');
      /* the sheet has just become much shorter: keep the heading under the hand */
      scroll.scrollTop += head.getBoundingClientRect().top - hr.top;
    }, el);
    sdrag.raf = requestAnimationFrame(sheetScroll);
  }
  /* the line in hand counts itself again as it moves, like everything else */
  const sheetRenumber = () => {
    sheetNumbers();
    sdrag.ghost.querySelector('.pbv-ghost-n').textContent =
      sdrag.el.querySelector(sdrag.isSec ? '.pbv-sec-n' : '.pbv-cl-n').textContent;
  };
  /* where the pointer is decides where the slot goes */
  function sheetPlace() {
    const { el, isSec, y } = sdrag;
    const under = (x) => { const r = x.getBoundingClientRect(); return y < r.top + r.height / 2; };
    if (isSec) {
      const next = [...clausesEl.querySelectorAll('.pbv-sec')].filter(x => x !== el).find(under);
      const ref = next || null;
      if (el.nextElementSibling === ref) return;
      sheetFlip(sheetRows(), () => { clausesEl.insertBefore(el, ref); sheetRenumber(); }, el);
      return;
    }
    const next = [...clausesEl.querySelectorAll('.pbv-cl, .pbv-sec-head')].filter(x => x !== el).find(under);
    let box, ref = null;
    if (next?.classList.contains('pbv-cl')) { box = next.parentElement; ref = next; }
    else {
      /* above a section's heading means the end of the section before it;
         past the last row means the end of the last section */
      const secs = [...clausesEl.querySelectorAll('.pbv-sec')];
      const before = next ? secs[secs.indexOf(next.parentElement) - 1] : secs[secs.length - 1];
      box = (before || next.parentElement).querySelector('.pbv-sec-body');
      if (!before) ref = box.firstElementChild === el ? el.nextElementSibling : box.firstElementChild;
    }
    if (ref === el || (el.parentElement === box && el.nextElementSibling === ref)) return;
    sheetFlip(sheetRows(), () => { box.insertBefore(el, ref); sheetRenumber(); }, el);
  }
  function sheetStep(e) {
    sdrag.ghost.style.left = (e.clientX - sdrag.dx) + 'px';
    sdrag.ghost.style.top = (e.clientY - sdrag.dy) + 'px';
    sdrag.y = e.clientY;
    sheetPlace();
  }
  /* near the top or bottom edge the sheet scrolls, faster the nearer */
  function sheetScroll() {
    if (!sdrag) return;
    const r = scroll.getBoundingClientRect(), top = r.top + 110, bottom = r.bottom - 70;
    const v = sdrag.y < top ? -(top - sdrag.y) / 5 : sdrag.y > bottom ? (sdrag.y - bottom) / 5 : 0;
    if (v) {
      const was = scroll.scrollTop;
      scroll.scrollTop += Math.max(-16, Math.min(16, v));
      if (scroll.scrollTop !== was) sheetPlace();
    }
    sdrag.raf = requestAnimationFrame(sheetScroll);
  }
  function sheetDrop(cancel) {
    const { el, ghost, isSec, order, top0 } = sdrag;
    cancelAnimationFrame(sdrag.raf);
    const id = el.dataset.id, name = el.dataset.sec;
    /* the new order is whatever the sheet now shows */
    const next = [];
    if (!cancel) {
      for (const sec of clausesEl.querySelectorAll('.pbv-sec')) {
        for (const row of sec.querySelectorAll('.pbv-cl')) {
          const c = pb.clauses.find(x => x.id === row.dataset.id);
          if (c) next.push([c, sec.dataset.sec]);
        }
      }
    }
    const changed = !cancel && next.length === pb.clauses.length
      && next.map(([c, sec]) => c.id + sec).join() !== order;
    /* the carried line settles into its slot */
    const home = el.querySelector(isSec ? '.pbv-sec-head' : '.pbv-cl-head').getBoundingClientRect();
    ghost.classList.add('is-landing');
    ghost.style.left = (isSec ? home.left - 22 : el.getBoundingClientRect().left) + 'px';
    ghost.style.top = (home.top - (isSec ? 10 : 8)) + 'px';
    setTimeout(() => {
      ghost.remove();
      sdrag = null;
      root.classList.remove('is-dragging', 'is-sheet-drag');
      clausesEl.classList.remove('is-outline', 'is-sec-outline');
      if (changed) {
        for (const [c, sec] of next) c.section = sec;
        pb.clauses = next.map(([c]) => c);
        if (!isSec) secFolded.delete(pb.clauses.find(c => c.id === id)?.section);
        commit();
      }
      paintClauses(changed && !isSec ? id : null, 'is-changed');
      /* the sheet opens again around the thing that was carried: its heading
         stays where it was put down. A cancelled carry goes back where it began. */
      const now = isSec ? [...clausesEl.querySelectorAll('.pbv-sec')].find(x => x.dataset.sec === name)
        : clausesEl.querySelector(`.pbv-cl[data-id="${id}"]`);
      const head = now?.querySelector(isSec ? '.pbv-sec-head' : '.pbv-cl-head');
      if (cancel || !head) scroll.scrollTop = top0;
      else scroll.scrollTop += head.getBoundingClientRect().top - home.top;
      if (changed && isSec) now?.classList.add('is-moved');
      clausesEl.classList.add('is-opening');
      setTimeout(() => clausesEl.classList.remove('is-opening'), 420);
      held = false; spy();
    }, 200);
  }
  clausesEl.addEventListener('pointerdown', (e) => {
    const grip = e.target.closest('.pbv-grip');
    if (!editable || !grip || e.button !== 0 || sdrag || drag || searching) return;
    e.preventDefault();                   // a grip is not text: nothing to select, nothing to focus
    const isSec = grip.parentElement.classList.contains('pbv-sec-head');
    const el = grip.closest(isSec ? '.pbv-sec' : '.pbv-cl');
    const x0 = e.clientX, y0 = e.clientY;
    const move = (ev) => {
      if (!sdrag) {
        if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 4) return;
        sheetLift(el, isSec, x0, y0);
      }
      ev.preventDefault();
      sheetStep(ev);
    };
    const stop = (cancel) => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', abort);
      removeEventListener('keydown', key, true);
      if (sdrag) sheetDrop(cancel);
    };
    const up = () => stop(false);
    const abort = () => stop(true);
    /* caught first, so the panel's own Escape (leave full screen) never sees it */
    const key = (ev) => { if (ev.key === 'Escape' && sdrag) { ev.stopPropagation(); ev.preventDefault(); stop(true); } };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', abort);
    addEventListener('keydown', key, true);
  });

  /* ── the edge between the list and the sheet can be dragged ──────
     Wider for long clause names, narrower to give the sheet the room.
     The width is kept, so it is where you left it next time. */
  const IDX_W = { min: 220, max: 460, base: 280 };
  const setIdxW = (w) => {
    const v = Math.round(Math.max(IDX_W.min, Math.min(IDX_W.max, w)));
    root.style.setProperty('--pbv-idx-w', v + 'px');
    resize.setAttribute('aria-valuenow', String(v));
    return v;
  };
  const resize = h('div', { class: 'pbv-resize', role: 'separator', tabindex: '0',
    'aria-orientation': 'vertical', 'aria-label': 'Resize the clause list',
    'aria-valuemin': String(IDX_W.min), 'aria-valuemax': String(IDX_W.max),
    title: 'Drag to resize · double-click to reset',
    ondblclick: () => { state.pbIdxW = setIdxW(IDX_W.base); save(); },
    onkeydown: (e) => {
      const step = e.key === 'ArrowLeft' ? -16 : e.key === 'ArrowRight' ? 16 : 0;
      if (!step) return;
      e.preventDefault();
      state.pbIdxW = setIdxW((state.pbIdxW || IDX_W.base) + step); save();
    },
    onpointerdown: (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const x0 = e.clientX, w0 = idx.getBoundingClientRect().width;
      let w = w0;
      root.classList.add('is-resizing');
      const move = (ev) => { w = setIdxW(w0 + ev.clientX - x0); };
      const up = () => {
        removeEventListener('pointermove', move);
        removeEventListener('pointerup', up);
        removeEventListener('pointercancel', up);
        root.classList.remove('is-resizing');
        state.pbIdxW = w; save();
      };
      addEventListener('pointermove', move);
      addEventListener('pointerup', up);
      addEventListener('pointercancel', up);
    } });
  root.append(resize);
  setIdxW(state.pbIdxW || IDX_W.base);

  /* numbers and counts are read off the page, so they are right after
     anything is added, removed or moved */
  const sheetNumbers = () => clausesEl.querySelectorAll('.pbv-sec').forEach((sec, si) => {
    const cls = sec.querySelectorAll('.pbv-cl');
    sec.querySelector('.pbv-sec-n').textContent = `${si + 1}.`;       // "1. Service commitments"
    cls.forEach((el, ci) => { el.querySelector('.pbv-cl-n').textContent = `${si + 1}.${ci + 1}`; });
  });
  const renumber = () => { sheetNumbers(); paintIdx(); paintCount(); };

  /* A section folds to its heading on the sheet, from the chevron at the
     end of it — kept while the playbook is open. */
  const secFolded = ((PB.secFold ||= {})[pb.id] ||= new Set());
  function foldSection(sec, on, quiet) {
    const name = sec.dataset.sec;
    if (on) secFolded.add(name); else secFolded.delete(name);
    sec.classList.toggle('is-folded', on);
    sec.querySelector('.pbv-sec-wrap').inert = on;
    const btn = sec.querySelector('.pbv-sec-fold');
    btn.setAttribute('aria-expanded', String(!on));
    btn.dataset.tip = on ? 'Expand Section' : 'Collapse Section';
    btn.setAttribute('aria-label', btn.dataset.tip);
    if (quiet) return;
    /* clipped only while it moves, so hover panels are never cut off at rest */
    sec.classList.add('is-folding');
    setTimeout(() => sec.classList.remove('is-folding'), 300);
  }
  const openSection = (name) => {
    const sec = [...clausesEl.querySelectorAll('.pbv-sec')].find(x => x.dataset.sec === name);
    if (sec?.classList.contains('is-folded')) foldSection(sec, false);
  };
  function sectionEl(g) {
    let name = g.name;
    const sec = h('section', { class: 'pbv-sec', 'data-sec': name });
    const titleEl = editable
      ? h('input', { class: 'pbv-sec-t', value: name, placeholder: 'Untitled section', 'aria-label': 'Section name',
          oninput: (e) => {
            /* a section's name lives on its clauses, so renaming it renames them all */
            const next = e.target.value.trim() || 'Untitled section';
            for (const c of pb.clauses) if ((c.section || 'General') === name) c.section = next;
            if (folded.delete(name)) folded.add(next);
            if (secFolded.delete(name)) secFolded.add(next);
            if (curSec === name) curSec = next;
            name = next; sec.dataset.sec = next;
            commit(); paintIdx();
          } })
      : h('h2', { class: 'pbv-sec-t' }, name);
    const body = h('div', { class: 'pbv-sec-body' }, ...g.clauses.map(clauseEl));
    /* no rule under the heading: its chevron sits at the right corner, in line
       with the clause chevrons; a delete and an add-a-clause-here come up
       beside it under the pointer */
    sec.append(
      h('header', { class: 'pbv-sec-head' },
        editable && h('span', { class: 'pbv-grip', 'aria-hidden': 'true', 'data-tip': 'Drag to Reorder', html: PBV_GRIP }),
        h('span', { class: 'pbv-sec-n' }), titleEl,
        h('button', { class: 'pbv-icon pbv-sec-fold', type: 'button', html: PB_SVG.chev,
          onclick: () => foldSection(sec, !sec.classList.contains('is-folded')) }),
        editable && h('button', { class: 'pbv-icon pbv-sec-tool pbv-sec-del', type: 'button', 'aria-label': 'Delete section',
          'data-tip': 'Delete Section', html: PBV_TRASH, onclick: () => deleteSection(name) }),
        editable && h('button', { class: 'pbv-icon pbv-sec-tool pbv-sec-add', type: 'button', 'aria-label': 'Add a clause to this section',
          'data-tip': 'Add Clause', onclick: () => addClause(name) }, icon('plus', 'ico ico-14'))),
      h('div', { class: 'pbv-sec-wrap' }, body));
    foldSection(sec, secFolded.has(name), true);
    return sec;
  }

  /* A section takes its clauses with it, so it asks first and names them. */
  function deleteSection(name) {
    const si = groups().findIndex(g => g.name === name);
    const gone = pb.clauses.filter(c => (c.section || 'General') === name);
    const n = gone.length, many = n === 1 ? 'clause' : 'clauses';
    pbConfirm({
      title: `Delete “${name}”?`,
      lead: n === 1 ? 'This section and the clause in it will be deleted.'
        : `This section and the ${n} clauses in it will be deleted.`,
      items: gone.map((c, i) => ({ n: `${si + 1}.${i + 1}`, t: c.topic || 'Untitled clause' })),
      action: 'Delete section',
      run: () => {
        const before = pb.clauses.slice();
        pb.clauses = pb.clauses.filter(c => !gone.includes(c));
        folded.delete(name); commit();
        const sec = [...clausesEl.querySelectorAll('.pbv-sec')].find(x => x.dataset.sec === name);
        if (sec) pbLeave(sec, renumber); else paintClauses();
        pbToast(`Deleted “${name}” and its ${n === 1 ? '' : n + ' '}${many}`, { label: 'Undo', run: () => {
          pb.clauses = before; commit(); paintClauses();
          [...clausesEl.querySelectorAll('.pbv-sec')].find(x => x.dataset.sec === name)?.classList.add('is-moved');
        } });
      } });
  }

  /* A clause folds to its heading from the chevron at the end of it —
     remembered while the playbook is open, and undone by going to it. */
  const clFolded = ((PB.clFold ||= {})[pb.id] ||= new Set());
  function foldClause(el, on, many) {
    const id = el.dataset.id;
    if (on) clFolded.add(id); else clFolded.delete(id);
    el.classList.toggle('is-folded', on);
    el.querySelector('.pbv-cl-body').inert = on;
    const btn = el.querySelector('.pbv-cl-fold');
    btn.setAttribute('aria-expanded', String(!on));
    btn.dataset.tip = on ? 'Expand Clause' : 'Collapse Clause';
    btn.setAttribute('aria-label', btn.dataset.tip);
    if (!many) syncFoldAll();
  }
  const allFolded = () => src.clauses.length > 0 && src.clauses.every(c => clFolded.has(c.id));
  function syncFoldAll() {
    const all = allFolded();
    foldAllBtn.innerHTML = all ? PBV_EXPAND_ALL : PBV_COLLAPSE_ALL;
    foldAllBtn.dataset.tip = all ? 'Expand All Clauses' : 'Collapse All Clauses';
    foldAllBtn.setAttribute('aria-label', foldAllBtn.dataset.tip);
    foldAllBtn.setAttribute('aria-pressed', String(all));
  }
  function foldAll(on) {
    const at = clausesEl.querySelector(`.pbv-cl[data-id="${curId}"]`);
    for (const el of clausesEl.querySelectorAll('.pbv-cl')) foldClause(el, on, true);
    syncFoldAll();
    /* the sheet has just changed height under you: stay with the clause you were on */
    setTimeout(() => at?.scrollIntoView({ block: on ? 'center' : 'start', behavior: 'smooth' }), 280);
  }
  function clauseEl(c) {
    const el = h('section', { class: 'pbv-cl', 'data-id': c.id });
    const head = h('div', { class: 'pbv-cl-head' },
      editable && h('span', { class: 'pbv-grip', 'aria-hidden': 'true', 'data-tip': 'Drag to Reorder', html: PBV_GRIP }),
      h('span', { class: 'pbv-cl-n' }),
      editable
        ? pbField('input', c, 'topic', () => { commit(); paintIdx(); }, { class: 'pbv-cl-t', placeholder: 'Untitled clause' })
        : h('h3', { class: 'pbv-cl-t' }, c.topic || 'Untitled clause'),
      editable && h('button', { class: 'pbv-icon pbv-cl-del', type: 'button', 'aria-label': 'Delete clause',
        'data-tip': 'Delete Clause', html: PBV_TRASH, onclick: () => {
          const at = pb.clauses.indexOf(c);
          pb.clauses.splice(at, 1); commit();
          /* the last clause of a section takes the section with it */
          const sec = el.closest('.pbv-sec');
          pbLeave(sec.querySelectorAll('.pbv-cl').length === 1 ? sec : el, renumber);
          pbToast(`Deleted “${c.topic || 'Untitled clause'}”`, { label: 'Undo', run: () => {
            pb.clauses.splice(at, 0, c); commit();
            paintClauses(c.id);
          } });
        } }),
      h('button', { class: 'pbv-icon pbv-cl-fold', type: 'button', html: PB_SVG.chev,
        onclick: () => foldClause(el, !el.classList.contains('is-folded')) }));
    const cards = h('div', { class: 'pbv-cards' });
    const paintCards = () => {
      cards.replaceChildren(
        posCard(c, 'preferred', 'preferred', 'Our ideal position, in plain words.'),
        posCard(c, 'walkaway', 'walkaway', 'What we will not accept.'),
        ...c.fallbacks.map((f, i) => posCard(f, 'fallback', 'text',
          'What we can concede to.', { n: i, list: c.fallbacks, repaint: paintCards })));
      paintIdx();
    };
    /* two plain text links under the cards: another fallback for this
       clause, or a new clause straight after it */
    const add = editable && h('div', { class: 'pbv-cl-acts' },
      h('button', { class: 'pbv-add-fb', type: 'button', onclick: () => {
        c.fallbacks.push({ text: '', language: '' }); commit(); paintCards();
        const last = cards.lastElementChild;
        last.classList.add('is-new');
        last.querySelector('textarea')?.focus();
      } }, 'Add Fallback'),
      h('button', { class: 'pbv-add-fb', type: 'button', onclick: () => addClauseAfter(c, el) }, 'Add Clause'));
    paintCards();
    el.append(head, h('div', { class: 'pbv-cl-body' }, h('div', { class: 'pbv-cl-in' }, cards, add || '')));
    foldClause(el, clFolded.has(c.id), true);
    if (PB.flashClause === c.id) el.classList.add('is-changed');
    return el;
  }

  /* The drafting wording (language) is kept on the playbook but not shown:
     a card is the position in plain words and nothing more. */
  function posCard(obj, kind, key, ph, fb) {
    const label = kind === 'fallback' ? (fb.n ? `Fallback ${fb.n + 1}` : 'Fallback') : PBV_POS[kind].label;
    const text = editable
      ? pbField('textarea', obj, key, commit, { class: 'pbv-pos-t', placeholder: ph })
      : h('p', { class: 'pbv-pos-t' + (obj[key]?.trim() ? '' : ' is-empty') }, obj[key]?.trim() || 'Not set');
    return h('div', { class: 'pbv-pos', 'data-k': kind },
      h('div', { class: 'pbv-pos-head' },
        pbvMark(kind), h('span', { class: 'pbv-pos-l' }, label),
        h('span', { class: 'pb-grow' }),
        editable && fb && h('button', { class: 'pbv-icon pbv-pos-del', type: 'button',
          'aria-label': `Delete ${label}`, 'data-tip': `Delete ${label}`, html: PBV_TRASH,
          onclick: () => { fb.list.splice(fb.n, 1); commit(); fb.repaint(); } })),
      text);
  }

  /* `flash` marks one clause: arrived (an add, an Undo) or moved (a drag) */
  function paintClauses(flash, how = 'is-new') {
    const y = scroll.scrollTop;
    clausesEl.replaceChildren(...groups().map(sectionEl));
    renumber();
    syncFoldAll();
    if (hl.q) filter();                  // a repaint keeps the search that is on
    scroll.scrollTop = y;
    if (flash) clausesEl.querySelector(`.pbv-cl[data-id="${flash}"]`)?.classList.add(how);
  }

  /* a new clause joins the section you are in, after its last clause */
  function addClause(secName) {
    const names = groups().map(g => g.name);
    const section = names.includes(secName) ? secName : (names[names.length - 1] || 'General');
    const c = pbNormClause({ ...pbBlankClause(), section });
    pbInsertClause(pb, c); commit();
    const sec = [...clausesEl.querySelectorAll('.pbv-sec')].find(s => s.dataset.sec === section);
    if (!sec) { paintClauses(c.id); }
    else {
      const el = clauseEl(c);
      el.classList.add('is-new');
      sec.querySelector('.pbv-sec-body').append(el); renumber();
      openSection(section);
    }
    const el = clausesEl.querySelector(`.pbv-cl[data-id="${c.id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el?.querySelector('.pbv-cl-t')?.focus({ preventScroll: true }), 300);
  }

  /* a new clause directly under the one you are on, in the same section */
  function addClauseAfter(c, el) {
    const n = pbNormClause({ ...pbBlankClause(), section: c.section || 'General' });
    pb.clauses.splice(pb.clauses.indexOf(c) + 1, 0, n); commit();
    const nel = clauseEl(n);
    nel.classList.add('is-new');
    el.after(nel); renumber(); syncFoldAll();
    nel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => nel.querySelector('.pbv-cl-t')?.focus({ preventScroll: true }), 300);
  }

  function addSection() {
    const names = new Set(groups().map(g => g.name));
    let name = 'New section', n = 2;
    while (names.has(name)) name = `New section ${n++}`;
    const c = pbNormClause({ ...pbBlankClause(), section: name });
    pb.clauses.push(c); commit();
    paintClauses(c.id);
    const sec = [...clausesEl.querySelectorAll('.pbv-sec')].pop();
    sec?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { const t = sec?.querySelector('.pbv-sec-t'); t?.focus({ preventScroll: true }); t?.select?.(); }, 300);
  }

  /* A search looks at what you can read: a section's name, a clause's
     title, and every position under it. A clause is kept if any of those
     has the words, or if its section's name does. */
  function filter() {
    const q = qIn.value.trim().toLowerCase();
    if (searching !== !!q) { searching = !!q; paintIdx(); }
    const has = (t) => (t || '').toLowerCase().includes(q);
    let shown = 0;
    for (const sec of clausesEl.querySelectorAll('.pbv-sec')) {
      let inSec = 0;
      const secHit = !!q && has(sec.dataset.sec);
      for (const el of sec.querySelectorAll('.pbv-cl')) {
        const c = src.clauses.find(x => x.id === el.dataset.id);
        const hit = !q || secHit || has(c.topic) || has(c.preferred) || has(c.walkaway)
          || (c.fallbacks || []).some(f => has(f.text));
        el.hidden = !hit; inSec += hit;
        /* folded things are opened by the search, so what it found can be seen and used */
        el.querySelector('.pbv-cl-body').inert = !q && el.classList.contains('is-folded');
        idxList.querySelector(`.pbv-idx-it[data-id="${c.id}"]`)?.toggleAttribute('hidden', !hit);
      }
      sec.hidden = !inSec; shown += inSec;
      sec.querySelector('.pbv-sec-wrap').inert = !q && sec.classList.contains('is-folded');
      [...idxList.querySelectorAll('.pbv-idx-sec')].find(s => s.dataset.sec === sec.dataset.sec)
        ?.parentElement.toggleAttribute('hidden', !inSec);
    }
    nomatch.hidden = shown > 0;
    find.classList.toggle('has-q', !!q);
    clausesEl.classList.toggle('is-searching', !!q);
    if (hl.q !== q) { hl.q = q; hl.cur = -1; }
    hl.shown = shown;
    paintHits();
  }

  /* ── marking what was found ───────────────────────────────────
     The words sit in fields, and a field cannot colour part of its text.
     So each field with a match gets a sheet laid exactly over it — same
     type, same wrapping, its own text invisible — carrying only the
     marks, which tint what is underneath. Plain text (the list, and
     versions that are read only) is marked by the browser's own highlight. */
  function paintHits() {
    cancelAnimationFrame(hl.raf); hl.raf = 0;
    for (const m of clausesEl.querySelectorAll('.pbv-hl:not(.pbv-sel)')) m.remove();
    CSS.highlights?.delete('pbv-find');
    const q = hl.q;
    hl.marks = [];
    if (q) {
      for (const f of clausesEl.querySelectorAll('input.pbv-sec-t, input.pbv-cl-t, textarea.pbv-pos-t')) {
        const text = f.value, low = text.toLowerCase();
        if (!low.includes(q) || !f.offsetParent) continue;
        const m = h('div', { class: 'pbv-hl', 'aria-hidden': 'true' });
        let i = 0, at;
        while ((at = low.indexOf(q, i)) >= 0) {
          m.append(text.slice(i, at), h('mark', {}, text.slice(at, at + q.length)));
          i = at + q.length;
        }
        m.append(text.slice(i));
        layMirror(m, f);
      }
      hl.marks = [...clausesEl.querySelectorAll('.pbv-hl mark')]
        .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
      if (window.Highlight && CSS.highlights) {
        const ranges = [];
        const plain = [...idxList.querySelectorAll('.pbv-idx-t, .pbv-idx-sec-name'),
          ...clausesEl.querySelectorAll('h2.pbv-sec-t, h3.pbv-cl-t, p.pbv-pos-t')];
        for (const el of plain) {
          const node = el.firstChild;
          if (!node || node.nodeType !== 3 || !el.offsetParent) continue;
          const low = node.data.toLowerCase();
          let i = 0, at;
          while ((at = low.indexOf(q, i)) >= 0) {
            const r = new Range(); r.setStart(node, at); r.setEnd(node, at + q.length);
            ranges.push(r); i = at + q.length;
          }
        }
        if (ranges.length) CSS.highlights.set('pbv-find', new Highlight(...ranges));
      }
    }
    if (hl.cur >= hl.marks.length) hl.cur = -1;
    hl.marks[hl.cur]?.classList.add('is-cur');
    const n = hl.marks.length;
    findCt.textContent = !q ? '' : !hl.shown ? 'No matches'
      : !n ? `${hl.shown} of ${src.clauses.length}`
      : hl.cur >= 0 ? `${hl.cur + 1} of ${n}` : `${n} ${n === 1 ? 'match' : 'matches'}`;
  }
  /* a sheet laid exactly over a field: the field's own type and wrapping */
  function layMirror(m, f) {
    const cs = getComputedStyle(f);
    Object.assign(m.style, {
      left: f.offsetLeft + 'px', top: f.offsetTop + 'px', width: f.offsetWidth + 'px', height: f.offsetHeight + 'px',
      font: cs.font, letterSpacing: cs.letterSpacing, padding: cs.padding, textAlign: cs.textAlign,
      whiteSpace: f.tagName === 'TEXTAREA' ? 'pre-wrap' : 'pre' });
    f.offsetParent.append(m);
  }

  /* ── select some words, say what should change ────────────────
     Selecting text in the playbook brings up one small field over it:
     what changes do you want to make? Sent, it goes to the playbook's
     conversation as a request about exactly those words. */
  let askPop = null, askMark = null;
  const closeAsk = () => { askPop?.remove(); askPop = null; askMark?.remove(); askMark = null; };
  const placeAsk = () => {
    if (!askPop || !askMark?.isConnected) return closeAsk();
    const r = askMark.querySelector('mark').getBoundingClientRect(), box = scroll.getBoundingClientRect();
    if (r.bottom < box.top + 44 || r.top > box.bottom) return closeAsk();     // scrolled out of sight
    const w = askPop.offsetWidth, hgt = askPop.offsetHeight;
    askPop.style.left = Math.round(Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8))) + 'px';
    const above = r.top - hgt - 10 > box.top + 44;
    askPop.style.top = Math.round(above ? r.top - hgt - 10 : r.bottom + 10) + 'px';
  };
  function openAsk(f, focus) {
    const from = f.selectionStart, to = f.selectionEnd;
    closeAsk();
    if (to - from < 2 || !f.value.slice(from, to).trim()) return;
    /* where the selection is on the page — and, once the caret leaves the
       field for the box, what keeps the words looking selected */
    askMark = h('div', { class: 'pbv-hl pbv-sel', 'aria-hidden': 'true' },
      f.value.slice(0, from), h('mark', {}, f.value.slice(from, to)), f.value.slice(to));
    layMirror(askMark, f);
    const cl = f.closest('.pbv-cl'), pos = f.closest('.pbv-pos');
    const c = cl && pb.clauses.find(x => x.id === cl.dataset.id);
    const t = c && pos ? { c, key: pos.dataset.k, label: pos.querySelector('.pbv-pos-l').textContent,
        fi: [...cl.querySelectorAll('.pbv-pos[data-k="fallback"]')].indexOf(pos) }
      : c ? { c, key: 'topic', label: 'Title' }
      : { sec: f.closest('.pbv-sec')?.dataset.sec, key: 'section', label: 'Section name' };
    const input = h('input', { class: 'doc-ask-in', type: 'text', spellcheck: 'false',
      placeholder: 'What changes do you want to make?', 'aria-label': 'What changes do you want to make?' });
    const send = h('button', { class: 'doc-ask-go', type: 'button', 'aria-label': 'Send', disabled: true,
      html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
        + 'stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 12l6-6 6 6"/></svg>' });
    const run = () => {
      const ask = input.value.trim();
      if (!ask) return input.focus();
      closeAsk();
      pbAskChange(pb, { ...t, from, to, ask });
    };
    input.addEventListener('input', () => { send.disabled = !input.value.trim(); });
    /* the moment the hand goes to the box, the words keep their selection colour */
    for (const ev of ['focus', 'pointerdown']) input.addEventListener(ev, () => askMark?.classList.add('is-held'));
    /* the caret is in the box now, but the words are still yours: Escape
       hands them back selected, and while the box is empty Backspace
       deletes them and Copy copies them, as if you had never left */
    const back = () => { closeAsk(); f.focus({ preventScroll: true }); f.setSelectionRange(from, to); };
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();                 // Escape here closes this, not the panel behind it
      if (e.key === 'Enter') { e.preventDefault(); run(); }
      if (e.key === 'Escape') { e.preventDefault(); back(); }
      if (input.value) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault(); back();
        f.setRangeText('', from, to, 'end');
        f.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') navigator.clipboard?.writeText(f.value.slice(from, to));
    });
    send.addEventListener('click', run);
    askPop = h('div', { class: 'doc-pop pbv-ask-pop', role: 'dialog', 'aria-label': 'Ask for a change',
      /* pressing anywhere on it but the field must not take the selection away */
      onmousedown: (e) => { if (e.target !== input) e.preventDefault(); } },
      h('div', { class: 'doc-ask' }, input, send));
    document.body.append(askPop);
    placeAsk();
    /* selected with the mouse, you are done selecting: the caret goes
       straight to the box. From the keyboard you may still be extending
       it, so the box waits to be clicked. */
    if (focus) { askMark.classList.add('is-held'); input.focus({ preventScroll: true }); }
  }
  const askFromSelection = (focus) => setTimeout(() => {
    const f = document.activeElement;
    if (askPop?.contains(f)) return;
    if (f && clausesEl.contains(f) && f.matches('input.pbv-sec-t, input.pbv-cl-t, textarea.pbv-pos-t')
        && f.selectionEnd - f.selectionStart >= 2) openAsk(f, focus);
    else closeAsk();
  }, 0);
  if (editable) {
    clausesEl.addEventListener('mouseup', () => askFromSelection(true));
    clausesEl.addEventListener('keyup', (e) => { if (e.shiftKey || e.key === 'Shift' || ((e.metaKey || e.ctrlKey) && e.key === 'a')) askFromSelection(false); });
    clausesEl.addEventListener('input', closeAsk);          // typing over the selection is its own answer
    scroll.addEventListener('scroll', placeAsk, { passive: true });
    const away = (e) => {
      if (!root.isConnected) { closeAsk(); return document.removeEventListener('mousedown', away, true); }
      if (askPop && !askPop.contains(e.target) && !clausesEl.contains(e.target)) closeAsk();
    };
    document.addEventListener('mousedown', away, true);
  }

  /* anything that moves or rewraps the text lays the marks again, once a frame */
  function queueHits() { if (!hl.raf) hl.raf = requestAnimationFrame(paintHits); }
  new ResizeObserver(() => { if (hl.q) queueHits(); }).observe(clausesEl);
  clausesEl.addEventListener('input', () => { if (hl.q) queueHits(); });
  function stepHit(d) {
    const n = hl.marks.length;
    if (!n) return;
    hl.marks[hl.cur]?.classList.remove('is-cur');
    hl.cur = (hl.cur + d + n) % n;
    if (hl.cur < 0) hl.cur = 0;
    const m = hl.marks[hl.cur];
    m.classList.add('is-cur');
    const r = m.getBoundingClientRect(), box = scroll.getBoundingClientRect();
    scroll.scrollTo({ top: scroll.scrollTop + r.top - box.top - box.height / 2, behavior: 'smooth' });
    findCt.textContent = `${hl.cur + 1} of ${n}`;
  }

  const scrollToEl = (el) => { if (el) scroll.scrollTo({ top: el.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop - 60, behavior: 'smooth' }); };
  function jump(id) {
    const el = clausesEl.querySelector(`.pbv-cl[data-id="${id}"]`);
    if (!el) return;
    const sec = el.closest('.pbv-sec')?.dataset.sec;
    if (sec) { held = true; curId = id; curSec = sec; if (folded.delete(sec)) paintIdx(); else markCurrent(); }
    if (el.classList.contains('is-folded')) foldClause(el, false);
    openSection(sec);
    scrollToEl(el);
    el.classList.remove('is-pinged'); void el.offsetWidth; el.classList.add('is-pinged');
  }
  function jumpSec(name) {
    scrollToEl([...clausesEl.querySelectorAll('.pbv-sec')].find(s => s.dataset.sec === name));
  }

  /* The index follows the reading: the clause at the top of the sheet is lit. */
  let curId = null;
  function markCurrent() {
    for (const b of idxList.querySelectorAll('.pbv-idx-it')) b.setAttribute('aria-current', String(b.dataset.id === curId));
    for (const x of idxList.querySelectorAll('.pbv-idx-sec')) x.setAttribute('aria-current', String(x.dataset.sec === curSec));
  }
  /* which section's heading is out of sight above, while its clauses are still on the sheet */
  const context = () => {
    const edge = bar.getBoundingClientRect().bottom + 30;   // where the second bar's lower edge sits
    let at = null;
    for (const sec of clausesEl.querySelectorAll('.pbv-sec')) {
      if (sec.hidden) continue;
      const head = sec.querySelector('.pbv-sec-head');
      if (head.getBoundingClientRect().bottom > edge) break;   // this heading, and all after it, can still be read
      at = sec.getBoundingClientRect().bottom > edge + 8 ? sec : null;
    }
    const name = at?.dataset.sec || '';
    if (name && name !== ctx.dataset.sec) {
      const swap = ctx.classList.contains('is-on');
      ctx.dataset.sec = name;
      ctxN.textContent = at.querySelector('.pbv-sec-n')?.textContent || '';
      ctxT.textContent = name;
      if (swap) { ctx.classList.remove('is-swap'); void ctx.offsetWidth; ctx.classList.add('is-swap'); }
    }
    ctx.classList.toggle('is-on', !!name);
    /* the header casts a soft shadow once the page is moving under it */
    bar.classList.toggle('is-stuck', scroll.scrollTop > 24);
    ctx.tabIndex = name ? 0 : -1;
    ctx.setAttribute('aria-hidden', String(!name));
  };
  const spy = () => {
    context();
    const top = scroll.getBoundingClientRect().top + 120;
    let cur = null;
    for (const el of clausesEl.querySelectorAll('.pbv-cl')) {
      if (el.hidden) continue;
      if (!cur || el.getBoundingClientRect().top <= top) cur = el;
    }
    /* a place chosen in the list holds — the last section can never reach
       the top of the sheet, and would otherwise lose to the one before it */
    if (held) return markCurrent();
    curId = cur?.dataset.id || null;
    const sec = cur?.closest('.pbv-sec')?.dataset.sec || null;
    curSec = sec;
    markCurrent();
  };
  scroll.addEventListener('scroll', spy, { passive: true });
  /* scrolling by hand — wheel, touch, keys, the scrollbar — lets the list follow again */
  const release = () => { if (held) { held = false; spy(); } };
  for (const t of ['wheel', 'touchmove', 'pointerdown']) scroll.addEventListener(t, release, { passive: true });
  scroll.addEventListener('keydown', (e) => { if (/^(Arrow|Page|Home|End| )/.test(e.key)) release(); });

  paintClauses();
  requestAnimationFrame(() => {
    spy();
    /* a change made from the chat is shown where it happened */
    if (PB.flashClause) {
      const el = clausesEl.querySelector(`.pbv-cl[data-id="${PB.flashClause}"]`);
      if (el) scroll.scrollTop = el.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop - 68;
      PB.flashClause = null;
    }
  });

  return {
    body: root,
    /* opened from the list, the way out is back to it; beside a chat, the
       playbook keeps its mark and the panel's own close */
    lead: [state.view === 'playbooks'
      ? h('button', { class: 'pbv-back', type: 'button', 'aria-label': 'Back to Playbooks', 'data-tip': 'Back to Playbooks',
          html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" '
            + 'stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>',
          onclick: () => { closeArtifact?.(); if (state.view !== 'playbooks') go('playbooks'); } })
      : h('span', { class: 'pbv-kind', 'aria-hidden': 'true', html: kindMark('playbook') })],
    onClose: () => { PB.repaintList?.(); },
  };
}

const PBV_PANEL = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" '
  + 'stroke-linejoin="round"><rect x="2" y="2.5" width="12" height="11" rx="2"/><path d="M6.2 2.5v11"/></svg>';
const PBV_ADD_CLAUSE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" '
  + 'stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3" width="11" height="10" rx="2"/>'
  + '<path d="M5.3 6.4h5.4M5.3 9.4h3.2"/></svg>';
const PBV_ADD_SECTION = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" '
  + 'stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4h11"/><rect x="2.5" y="7" width="11" height="2.6" rx="1"/>'
  + '<rect x="2.5" y="11.4" width="11" height="2.6" rx="1"/></svg>';
const PBV_COLLAPSE_ALL = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" '
  + 'stroke-linecap="round" stroke-linejoin="round"><path d="M5 2.6 8 5.4l3-2.8M5 13.4 8 10.6l3 2.8"/></svg>';
const PBV_EXPAND_ALL = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" '
  + 'stroke-linecap="round" stroke-linejoin="round"><path d="M5 5.6 8 2.8l3 2.8M5 10.4 8 13.2l3-2.8"/></svg>';
const PBV_GRIP = '<svg viewBox="0 0 12 14" fill="currentColor"><circle cx="3.5" cy="3" r="1.15"/><circle cx="8.5" cy="3" r="1.15"/>'
  + '<circle cx="3.5" cy="7" r="1.15"/><circle cx="8.5" cy="7" r="1.15"/><circle cx="3.5" cy="11" r="1.15"/><circle cx="8.5" cy="11" r="1.15"/></svg>';
const PBV_PENCIL = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" '
  + 'stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 2.9l2.5 2.5L6 12.5 3 13l.5-3z"/></svg>';
const PBV_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
  + 'stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 '
  + '2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';
const PBV_X = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" '
  + 'stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>';

/* ── registering the kind ─────────────────────────────────────── */
RENDER.playbook = pbRender;
/* A playbook, drawn as it is in the Playbooks list: a sheet of paper,
   ruled. One icon for a playbook wherever it appears. */
KIND_ICON.playbook =
    '<rect x="4.6" y="1.9" width="14.8" height="20.2" rx="2.6" fill="#FCFCFB" stroke="#D8D3CC" stroke-width="1"/>'
  + '<path d="M7.8 7.6h8.4M7.8 10.6h8.4M7.8 13.6h8.4" stroke="#DDD8D1" stroke-width="1" stroke-linecap="round"/>';
KIND_LABEL.playbook = 'Playbook';
KIND_SHORT.playbook = 'PLAYBOOK';
NOUN.playbook = 'playbook';
SOURCES.playbook = {
  label: 'the playbook', verb: 'Worked on',
  icon: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8.5 3v18"/><path d="M12 8h4.5M12 12h4.5"/>',
};


/* ── changes proposed from reviews ──────────────────────────────
   A reviewer who chose something other than Clavia's pick, or found a
   clause the playbook lacks, can propose it. The owner sees each one
   here, with where it came from, and adds it (a new version) or lets it
   go. Nothing changes the playbook until they do. */
function pbProposalsEl(pb, props, a) {
  const KIND = { fallback: 'Add as a fallback', accept: 'Their wording as a fallback', rule: 'Add as a new clause' };
  const wrap = h('div', { class: 'pbv-props' });
  const redraw = () => document.querySelector('.pbv')?.replaceWith(pbRender(a));
  const drop = (p) => { state.pbProposals = (state.pbProposals || []).filter(x => x !== p); save(); };
  const same = (x, t) => { const m = (x || '').toLowerCase(), n = t.toLowerCase(); return m === n || m.startsWith(n) || n.startsWith(m) || m.split(/\W+/)[0] === n.split(/\W+/)[0]; };
  const add = (p) => {
    const v = pbBump(pb, { name: p.kind === 'rule' ? `Added ${p.heading}` : `New fallback on ${p.heading}`, by: USER.name }, (x) => {
      const c = x.clauses.find(y => same(y.topic, p.topic));
      if (c && p.kind !== 'rule') (c.fallbacks ||= []).push({ text: p.text, language: p.text });
      else x.clauses.push(pbNormClause({ id: pbUid('clause'), topic: p.heading, preferred: p.text, walkaway: '', fallbacks: [], section: x.clauses[x.clauses.length - 1]?.section || 'General' }));
    });
    drop(p); redraw(); PB.repaintList?.();
    pbToast(`Added to the playbook as version ${v}`);
  };
  const card = (p) => h('div', { class: 'pbv-prop' },
    h('div', { class: 'pbv-prop-h' }, h('b', {}, p.heading), h('span', {}, KIND[p.kind] || 'Proposed change')),
    h('p', { class: 'pbv-prop-t' }, p.text),
    h('div', { class: 'pbv-prop-f' },
      h('span', { class: 'pbv-prop-from' }, `${p.by} · ${p.from}${p.counterparty ? ' · ' + p.counterparty : ''}`),
      h('span', { class: 'pb-grow' }),
      h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => { drop(p); redraw(); pbToast('Dismissed', { label: 'Undo', run: () => { (state.pbProposals ||= []).push(p); save(); redraw(); } }); } }, 'Dismiss'),
      h('button', { class: 'btn btn--primary', type: 'button', onclick: () => add(p) }, 'Add to playbook')));
  const paint = () => {
    const open = !!PB.propsOpen?.[pb.id];
    wrap.replaceChildren(
      h('button', { class: 'pbv-props-line' + (open ? ' is-open' : ''), type: 'button', 'aria-expanded': String(open),
        onclick: () => { (PB.propsOpen ||= {})[pb.id] = !open; paint(); } },
        h('span', { class: 'pbv-props-dot' }),
        `${props.length} ${props.length === 1 ? 'change' : 'changes'} proposed from reviews`,
        h('span', { class: 'pbv-props-chev', html: PB_SVG.chev })),
      open ? h('div', { class: 'pbv-props-list' }, ...props.map(card)) : null);
  };
  paint();
  return wrap;
}
