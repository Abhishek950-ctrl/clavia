/* ------------------------------------------------------------------
   Which agent should take this? (16 Oct)

   Ask something on the home page that more than one agent could do, and
   Clavia does not guess. It names the two or three that fit, with their
   faces and what each is for, in the tray above the box — the way an
   agent asks its own questions — and runs the one you pick: its working
   step by step, then its answer, signed with its name.

   One finished-quality path is scripted on the Birch Labs NDA (the same
   matter the NDA Reviewer chat and its redline are about); any other ask
   that fits several agents uses each agent's own scripted first answer.
   #ask/agents starts it with that question typed in.
------------------------------------------------------------------ */

/* what each agent answers to, beyond its name */
const AGR_WORDS = {
  nda:        /\bnda|non-?disclosure|confidential/i,
  redline:    /redline|mark ?up|markup|review .*(contract|agreement|msa|nda|order form)|send it back|changes? to/i,
  clause:     /clause|which contracts|across (our|the) contracts|precedent|what (did |do )?we (usually )?agree|compare|review .*\b(nda|msa|contract|agreement)\b/i,
  obligation: /renew|renewal|deadline|notice period|expir/i,
  diligence:  /diligence|data room|acquisition|target/i,
  playbook:   /playbook|our position|fallback/i,
  privacy:    /dpa|privacy|gdpr|personal data|transfer|sub-?processor/i,
  hold:       /litigation|legal hold|preserv/i,
  research:   /\blaw\b|legal question|case law|statute|is it legal|enforceable/i,
  regulatory: /regulat|new rules?|ai act|compliance change/i,
  signature:  /signature|sign(ed|ing)?\b|docusign|countersign/i,
  triage:     /request|intake|route|assign/i,
  summary:    /summar|one[- ]page|brief\b|tl;?dr/i,
  translate:  /translat|in (french|german|spanish|arabic)/i,
  entity:     /entity|subsidiar|filing|company records/i,
  minutes:    /minutes|board|resolution/i,
  trademark:  /trademark|brand name|filing/i,
  policy:     /policy|employee handbook|can staff/i,
  invoice:    /invoice|bill|outside counsel|law firm fees/i,
  employment: /offer letter|employment|hire|contractor/i,
};
function agrMatch(text) {
  const t = String(text || '');
  const pool = (typeof agAll === 'function' ? agAll() : []).filter(a => AGR_WORDS[a.mark || a.id] || AGR_WORDS[a.id]);
  const scored = pool.map(a => {
    const k = a.mark || a.id;
    let n = 0;
    if (AGR_WORDS[k]?.test(t)) n += 2;
    if (new RegExp('\\b' + a.name.split(' ')[0] + '\\b', 'i').test(t)) n += 1;
    if (a.built && /\bnda\b/i.test(t)) n += 3;   // the one you built for this comes first
    return { a, n };
  }).filter(x => x.n > 0).sort((x, y) => y.n - x.n);
  /* one built for the job and one generic one doing the same job are both worth offering */
  const seen = new Set();
  return scored.filter(x => { const k = x.a.id; if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 3).map(x => x.a);
}

/* the scripted path: the Birch Labs NDA, three agents, three different answers */
const AGR_DEMO_Q = 'Review the Birch Labs NDA before I send it back';
const AGR_SCRIPT = {
  nda: {
    steps: [
      { source: 'internal', query: 'Birch Labs – Mutual NDA.docx', rows: [{ source: 'outlook', title: 'Birch Labs – Mutual NDA.docx', meta: 'from Priya Shah · their paper' }] },
      { source: 'playbook', query: 'Checked it against NDA Playbook v7, 14 positions' },
      { source: 'think', query: 'Two clauses are outside the playbook; everything else is standard' },
    ],
    answer: 'Two problems, both fixable before it goes back:\n\n- **Term** is five years, with five years’ survival. The playbook allows three, and two after (position 4).\n- **Exceptions** leave out information we already had. That carve-out is a must-have (position 6).\n\nI have redlined both and kept their wording everywhere else. Nothing here needs a lawyer.',
    file: 'Birch Labs – Mutual NDA (redlined).docx',
    suggest: ['Send the redline to Priya', 'Show me the two changes'],
  },
  redline: {
    steps: [
      { source: 'internal', query: 'Birch Labs – Mutual NDA.docx', rows: [{ source: 'outlook', title: 'Birch Labs – Mutual NDA.docx', meta: '12 clauses' }] },
      { source: 'playbook', query: 'NDA Playbook v7 and our standard mutual NDA' },
      { source: 'think', query: 'Marked up every clause that differs from our paper' },
    ],
    answer: 'Marked up in Word against our own mutual NDA: **four changes**.\n\n- **Term**: five years to three, survival to two.\n- **Exceptions**: added information already known to us.\n- **Purpose**: narrowed from “any business relationship” to the evaluation of the pilot.\n- **Return of information**: added a right to keep one archival copy for legal records.\n\nThe last two are tidy-ups, not playbook breaches, so you can drop them if you want it signed this week.',
    file: 'Birch Labs – Mutual NDA (redlined).docx',
    suggest: ['Keep only the playbook changes', 'Send it to Priya'],
  },
  clause: {
    steps: [
      { source: 'sharepoint', query: 'Signed NDAs in Legal › NDAs', count: '186 NDAs' },
      { source: 'internal', query: 'Term and exceptions in NDAs we signed with similar companies', rows: [
        { source: 'sharepoint', title: 'Northwind Ltd – Mutual NDA', meta: '3 years · signed Sep' },
        { source: 'sharepoint', title: 'Kestrel Freight – Mutual NDA', meta: '3 years · signed Jul' },
        { source: 'sharepoint', title: 'Acme Analytics – NDA', meta: '2 years · signed May' }] },
      { source: 'think', query: 'Compared Birch Labs’ two outlying clauses with what we usually sign' },
    ],
    answer: 'Against the **186 NDAs** we have signed, Birch Labs’ paper is out of line in two places:\n\n- **Term**: we have never signed five years. 158 were three years, 28 were two.\n- **Exceptions**: every signed NDA carries the “already known to us” carve-out; theirs does not.\n\nThe closest precedent is **Northwind (September)**: three years, two years’ survival, all four exceptions. Use it as the ask.',
    suggest: ['Open the Northwind NDA', 'Ask NDA Reviewer to redline it'],
  },
};

/* the step that finds them says what it looked through */
if (typeof SOURCES !== 'undefined') SOURCES.agrAgents = { label: 'your agents', verb: 'Checked', icon: '<path d="M12 4.5c.6 4.2 3.3 6.9 7.5 7.5-4.2.6-6.9 3.3-7.5 7.5-.6-4.2-3.3-6.9-7.5-7.5 4.2-.6 6.9-3.3 7.5-7.5z"/>' };

let AGR = null;   // the ask waiting for a pick: { text, cands, pick, thread }
function agrStart(text, cands) {
  const id = 'route-' + Date.now().toString(36);
  thread = { id, title: titleFor(text), messages: [], live: true };
  LIVE[id] = thread;
  HISTORY.unshift({ id, label: thread.title, meta: 'now' });
  say('user', text);
  mountNav(); mountFolds();
  go('thread');
  AGR = { text, cands, pick: 0, thread };
  const t = thread;
  setTimeout(() => {
    if (thread !== t) return;
    const n = cands.length === 2 ? 'Two' : 'Three';
    say('bot', '', { steps: [{ source: 'agrAgents', query: `Checked your ${typeof agAll === 'function' ? agAll().length : ''} agents for ones that do this`, rows: cands.map(a => ({ source: 'agrAgents', title: a.name, meta: a.say })) }], thinking: false, cites: null, traceOpen: false });
    const m = thread.messages[thread.messages.length - 1];
    m.text = `${n} of your agents can do this. Which one should take it?`;
    paintThread();
    agrPaintTray();
  }, 700);
}

/* the tray above the box: one question, the agents as its answers */
function agrPaintTray() {
  const wrap = document.querySelector('.thread-dock .askwrap');
  if (!wrap) return;
  let tray = wrap.querySelector('.agr-tray');
  if (!AGR || AGR.thread !== thread) { tray?.remove(); return; }
  if (!tray) { tray = h('div', { class: 'agr-tray' }); wrap.querySelector('.ask')?.before(tray); }
  const radio = '<svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.3"/><circle class="agb-radio-dot" cx="8" cy="8" r="3.4" fill="currentColor"/></svg>';
  const opt = (a, i) => h('button', { class: 'agb-opt agr-opt' + (AGR.pick === i ? ' is-on' : ''), type: 'button', role: 'radio', 'aria-checked': String(AGR.pick === i),
      onclick: () => { AGR.pick = i; agrPaintTray(); }, ondblclick: () => { AGR.pick = i; agrRun(); } },
    h('span', { class: 'agb-radio', html: radio }),
    h('span', { class: 'agr-av', html: agIcon(a.mark || a.id) }),
    h('span', { class: 'agr-t' }, h('b', {}, a.name), h('span', {}, a.say)),
    h('span', { class: 'agb-opt-n' }, String(i + 1)));
  tray.replaceChildren(h('div', { class: 'agb-q agr-q', role: 'radiogroup', 'aria-label': 'Which agent should take this?' },
    h('div', { class: 'agb-q-top' }, h('b', {}, 'Which agent should take this?')),
    ...AGR.cands.map(opt),
    h('div', { class: 'agb-q-foot' },
      h('button', { class: 'btn btn--ghost', type: 'button', onclick: agrSkip }, 'Let Clavia answer'),
      h('button', { class: 'btn btn--primary', type: 'button', onclick: agrRun }, 'Run'))));
}
function agrSkip() {
  const r = AGR; if (!r) return;
  AGR = null; agrPaintTray();
  thread.messages.push({ role: 'system', text: 'Clavia is answering this itself' });
  paintThread();
  answer(r.text);
}

/* the pick, then the agent at work, then its answer under its own name */
async function agrRun() {
  const r = AGR; if (!r) return;
  const a = r.cands[r.pick];
  AGR = null; agrPaintTray();
  const t = thread;
  t.messages.push({ role: 'system', text: `${a.name} is taking this` });
  const k = a.mark || a.id;
  const demo = r.text.trim().toLowerCase() === AGR_DEMO_Q.toLowerCase() || /birch labs/i.test(r.text);
  const play = (demo && AGR_SCRIPT[k]) || (typeof AG_PLAY !== 'undefined' && AG_PLAY[k]) || null;
  const steps = (play?.steps || [{ source: 'think', query: `${a.name} read your request` }]).map(x => ({ ...x }));
  const m = say('bot', '', { steps: [], thinking: true, cites: null, by: a });
  paintThread();
  const wait = (ms) => new Promise(res => setTimeout(res, Math.round(ms * (typeof PACE_SCALE === 'number' ? PACE_SCALE : 1))));
  await wait(450); if (thread !== t) return; renderBot(m);
  for (const st of steps) {
    m.steps.push({ ...st, running: true }); renderBot(m); await wait(st.rows ? 1300 : 950);
    m.steps[m.steps.length - 1].running = false; renderBot(m);
  }
  await wait(400);
  m.thinking = false; m.traceOpen = false;
  if (play?.file && typeof acFileArtifact === 'function') m.artifact = acFileArtifact({ name: play.file, meta: 'Word · 2 changes' }, null).id;
  m.text = play?.answer || `${a.name} is on it.`;
  m.suggest = play?.suggest || [];
  renderBot(m);
}

/* an answer an agent gave carries its face and name above it */
(() => {
  const prevMsg = messageEl;
  messageEl = function (m) {
    const el = prevMsg(m);
    if (m.role === 'bot' && m.by) el.prepend(h('div', { class: 'agr-by' },
      h('span', { class: 'agr-by-av', html: agIcon(m.by.mark || m.by.id) }), h('b', {}, m.by.name), h('span', {}, 'Agent')));
    return el;
  };

  /* a new ask that more than one agent fits stops to ask which */
  const prevStart = startThread;
  startThread = function (text) {
    const cands = agrMatch(text);
    if (cands.length >= 2) return agrStart(text, cands);
    return prevStart(text);
  };

  /* the tray follows the thread it belongs to */
  const prevPaint = paintThread;
  paintThread = function (...args) { const r = prevPaint.apply(this, args); queueMicrotask(agrPaintTray); return r; };

  /* keys 1–3 pick, Enter runs, while the tray is up */
  addEventListener('keydown', (e) => {
    if (!AGR || AGR.thread !== thread || state.view !== 'thread') return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea, [contenteditable]')) return;
    const i = { '1': 0, '2': 1, '3': 2 }[e.key];
    if (i != null && AGR.cands[i]) { e.preventDefault(); AGR.pick = i; agrPaintTray(); }
    else if (e.key === 'Enter') { e.preventDefault(); agrRun(); }
  });

  /* #ask/agents: the scripted question, asked */
  const prevHash = openByHash;
  openByHash = function (hash) {
    if (hash === 'ask/agents') { startThread(AGR_DEMO_Q); return true; }
    return prevHash(hash);
  };
  const first = (() => { try { return new URL(performance.getEntriesByType('navigation')[0]?.name || location.href).hash.slice(1); } catch { return ''; } })();
  if (first === 'ask/agents') setTimeout(() => startThread(AGR_DEMO_Q), 50);
})();
