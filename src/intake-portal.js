/* ── the requester's view of a request (INTAKE_FX.portal) ──────────
   What the person who asked sees when they follow the link in legal's
   acknowledgement email: where it stands, who has it, what legal is
   waiting on them for, the documents shared with them, and the messages
   between them and legal. No seat, no internal notes, no playbook, no
   approvals. They answer here or by replying to the email; either way it
   lands in the request's Activity. Address: #intake/RQ-1041/requester */

function mxRequesterPage(r) {
  const first = r.submitter.split(' ')[0];
  const ch = mxChannel(r);
  const at = mxStage(r);
  const day = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const when = (iso) => { const d = new Date(iso); return `${day(iso)}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`; };
  const legalSide = (who) => who === 'Clavia' || MX_LEGAL.some(p => p.name === who);
  const exit = () => { MX.intake.open = r.id; go('intake'); };

  /* only what was said to them or by them */
  const said = () => (r.activity || []).filter(a => a.ev === 'submit' || a.kind === 'reply');
  const waiting = () => mxWhoseMove(r) === 'Requester';
  const lastAsk = () => [...said()].reverse().find(a => a.kind === 'reply' && legalSide(a.who));

  /* the path in the request's own statuses (21 Oct). Waiting is a pause on
     the way, not a step: it shows where the work stopped; Cancelled ends it */
  const PATH = ['new', 'drafting', 'negotiation', 'signature', 'done'].filter(k => mxStKeys(r).includes(k));
  const nowK = r.status === 'waiting' ? mxStatusAt(r, at) : r.status;
  const now = PATH.indexOf(nowK);
  const steps = r.status === 'cancelled'
    ? h('p', { class: 'rqo-cancel' }, h('span', { class: 'mx-st-mi', style: `color:${MX_ST.req.cancelled.color}`, html: MX_ST.req.cancelled.svg }), 'Legal has cancelled this request.')
    : h('ol', { class: 'rqo-steps' }, ...PATH.map((k, i) => h('li', { class: 'rqo-step' + (i < now || (i === now && k === 'done') ? ' is-past' : i === now ? ' is-now' : '') },
        h('span', { class: 'rqo-step-dot' }), h('span', { class: 'rqo-step-t' }, mxStLabel(r, k), i === now && r.status === 'waiting' ? h('span', { class: 'rqo-step-w' }, ' · Waiting') : null))));

  const ask = h('section', { class: 'rqo-ask' });
  const paintAsk = () => {
    ask.hidden = !waiting();
    if (ask.hidden) return;
    const q = lastAsk();
    const box = h('textarea', { class: 'mx-rqf-in mx-rqf-ta rqo-box', rows: '3', placeholder: 'Your answer', 'aria-label': 'Your answer' });
    const send = h('button', { class: 'pb-btn pb-btn--primary', type: 'button', disabled: true, onclick: () => {
      const text = box.value.trim(); if (!text) return;
      mxLog(r, { who: r.submitter, kind: 'reply', what: text[0].toUpperCase() + text.slice(1) });
      r.waitingOn = 'legal'; save();
      paintAsk(); paintTalk(); paintHead();
      pbToast(`Sent to ${r.attorney ? r.attorney.split(' ')[0] : 'legal'}`);
    } }, 'Send Answer');
    box.oninput = () => { send.disabled = !box.value.trim(); };
    ask.replaceChildren(
      h('h2', { class: 'rqo-h' }, 'Legal needs something from you'),
      q ? h('div', { class: 'rqo-askq' }, h('span', { class: 'rqo-askq-who' }, q.who === 'Clavia' ? 'Legal' : q.who, ' · ', when(q.when)), h('p', {}, q.what)) : null,
      box,
      h('div', { class: 'rqo-ask-foot' }, h('span', { class: 'rqo-or' }, `Or reply to the ${ch.key === 'teams' ? 'message in Teams' : 'email'}; it lands here too.`), send));
  };

  const talk = h('div', { class: 'rqo-talk' });
  const paintTalk = () => talk.replaceChildren(...[...said()].reverse().map(a => {
    const ours = legalSide(a.who);
    return h('div', { class: 'rqo-msg' + (ours ? ' is-legal' : ' is-you') },
      h('div', { class: 'rqo-msg-h' }, h('span', { class: 'rqo-msg-who' }, a.who === r.submitter ? 'You' : a.who === 'Clavia' ? 'Legal' : a.who),
        h('span', { class: 'rqo-msg-at' }, when(a.when))),
      a.msg ? h('div', { class: 'rqo-msg-t' }, a.msg.subject ? h('div', { class: 'rqo-msg-s' }, a.msg.subject) : null, a.msg.body)
        : h('div', { class: 'rqo-msg-t' }, a.ev === 'submit' ? (r.detail || 'Submitted the request') : a.what));
  }));

  /* a signed document shows as signed */
  const docs = mxDocuments(r);
  const live = mxEnvelopes(r).filter(e => ['out', 'partial', 'expired'].includes(mxEnvState(e)));
  const signLine = live.length ? h('p', { class: 'rqo-signing' }, h('span', { class: 'mx-st-mi', style: `color:${MX_ST.req.signature.color}`, html: MX_ST.req.signature.svg }),
      `Out for signature with ${[...new Set(live.flatMap(e => e.signers.filter(x => x.side === 'them').map(x => x.who)))].join(' and ') || 'the signers'}. The signed copy will appear here.`)
    : mxSignCount(r)?.n && mxSignCount(r).signed === mxSignCount(r).n ? h('p', { class: 'rqo-signing is-done' }, h('span', { class: 'mx-st-mi', style: `color:${MX_ST.req.done.color}`, html: MX_ST.req.done.svg }), 'Signed by everyone. The signed copies are below.') : null;
  const docList = h('div', { class: 'rqo-docs' }, ...(docs.length ? docs.map(d => { const v = d.versions[d.versions.length - 1], x = mxDocSign(r, d);
    const tag = x && ['out', 'partial', 'expired', 'signed'].includes(x.st) ? mxDocChip(r, d) : null;
    return h('div', { class: 'rqo-doc' }, mxTile('file', mxExt(v?.file || d.title)),
      h('span', { class: 'rqo-doc-n' }, d.title.replace(/\.docx?$/i, '')), tag,
      h('span', { class: 'rqo-doc-v' }, x?.st === 'signed' ? `Signed copy · ${day(v.when)}` : `v${d.versions.length}${v?.when ? ' · ' + day(v.when) : ''}`)); })
    : [h('p', { class: 'rqo-none' }, 'Nothing shared yet. Legal will add documents here as they are ready.')]));

  const head = h('div', { class: 'rqo-head' });
  const paintHead = () => head.replaceChildren(
    h('div', { class: 'rqo-meta' }, r.id, h('span', { class: 'mt-sep' }, '·'), `Sent ${day(r.created)}`, h('span', { class: 'mt-sep' }, '·'), `Due ${day(r.due)}`),
    h('h1', { class: 'rqo-title' }, r.title),
    h('div', { class: 'rqo-who' }, r.attorney ? [mxFace(r.attorney, 'pb-av'), h('span', {}, `${r.attorney} has this`)] : h('span', { class: 'rqo-faint' }, 'Waiting to be picked up by legal'),
      h('span', { class: 'mt-sep' }, '·'), waiting() ? h('b', {}, 'Waiting on you') : h('span', {}, 'With legal')),
    steps, signLine);

  paintHead(); paintAsk(); paintTalk();
  return h('div', { class: 'rqo' },
    h('header', { class: 'rqo-bar' },
      h('span', { class: 'rqo-brand' }, quillEl('static', { cls: 'rqo-q' }), h('span', {}, 'Lumen Legal')),
      h('span', { class: 'rqo-as' }, `Signed in as ${r.submitter}`),
      h('button', { class: 'rqo-exit', type: 'button', 'data-tip': 'Back to the request in Clavia', onclick: exit }, 'Exit requester view')),
    h('main', { class: 'rqo-page' },
      head, ask,
      h('section', {}, h('h2', { class: 'rqo-h' }, 'Documents'), docList),
      h('section', {}, h('h2', { class: 'rqo-h' }, 'Messages'), talk)));
}
