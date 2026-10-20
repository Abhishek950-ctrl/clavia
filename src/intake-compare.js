/* ── Compare: a redline between any two versions ─────────────────
   What a lawyer does with "Compare" in Word or Litera: pick the original
   and the revised, and read every change marked — struck through where
   words went, underlined where they came in. The two are lined up
   paragraph by paragraph first (a clause that did not change is matched
   to itself, however far it moved), then each changed paragraph is
   compared word by word, so a changed number reads as one changed number
   and not a rewritten clause. */

/* a version, as plain paragraphs: their marks accepted, our highlights dropped */
function mxPlainBlocks(v) {
  const box = document.createElement('div');
  const clean = (html) => {
    box.innerHTML = html;
    box.querySelectorAll('del').forEach(n => n.remove());
    return box.textContent.replace(/\s+/g, ' ').trim();
  };
  if (v.blocks?.length) return v.blocks.map(b => ({ t: b.t === 'h1' || b.t === 'h2' ? b.t : 'p', text: clean(b.v) })).filter(b => b.text);
  if (v.html) {
    const doc = new DOMParser().parseFromString(v.html, 'text/html');
    return [...doc.body.querySelectorAll('h1, h2, h3, p, li')].map(n => ({ t: n.tagName === 'H1' ? 'h1' : /^H[23]$/.test(n.tagName) ? 'h2' : 'p', text: n.textContent.replace(/\s+/g, ' ').trim() })).filter(b => b.text);
  }
  return null;
}

/* longest common subsequence over two lists, as pairs of matched indexes */
function mxLcs(a, b, eq = (x, y) => x === y) {
  const n = a.length, m = b.length;
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i][j] = eq(a[i], b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (eq(a[i], b[j])) { out.push([i, j]); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  return out;
}

/* two paragraphs, word by word: runs of same, gone and new */
function mxWordDiff(x, y) {
  const A = x.match(/\s+|[^\s]+/g) || [], B = y.match(/\s+|[^\s]+/g) || [];
  if (A.length * B.length > 160000) return [['del', x], ['ins', y]];
  const pairs = mxLcs(A, B);
  const ops = [];
  const push = (k, s) => { if (!s) return; const last = ops[ops.length - 1]; if (last && last[0] === k) last[1] += s; else ops.push([k, s]); };
  let i = 0, j = 0;
  for (const [pi, pj] of [...pairs, [A.length, B.length]]) {
    push('del', A.slice(i, pi).join('')); push('ins', B.slice(j, pj).join(''));
    if (pi < A.length) push('eq', A[pi]);
    i = pi + 1; j = pj + 1;
  }
  /* a phrase replaced reads as the old phrase struck, then the new one —
     "thirty (30)" for "forty-five (45)", not the two words interleaved —
     so changes kept apart only by spaces are joined into one */
  const out = [];
  for (let n = 0; n < ops.length; n++) {
    const [k, x] = ops[n];
    const joinable = k === 'eq' && /^\s+$/.test(x) && out.length && out[out.length - 1][0] !== 'eq' && ops[n + 1] && ops[n + 1][0] !== 'eq';
    if (k !== 'eq' || joinable) {
      let g = out[out.length - 1]?.[0] === 'grp' ? out[out.length - 1] : null;
      if (!g) { g = ['grp', '', '']; out.push(g); }
      if (joinable) { if (g[1]) g[1] += x; if (g[2]) g[2] += x; }
      else if (k === 'del') g[1] += x; else g[2] += x;
    } else out.push([k, x]);
  }
  /* the space after a change belongs to the text that follows it */
  return out.flatMap(o => {
    if (o[0] !== 'grp') return [o];
    const tail = ((o[2] || o[1]).match(/\s*$/) || [''])[0];
    return [o[1] && ['del', o[1].trimEnd()], o[1] && o[2] && ['eq', ' '], o[2] && ['ins', o[2].trimEnd()], tail && ['eq', tail]].filter(Boolean);
  });
}

/* the comparison: one row per paragraph, matched across, with its changes */
function mxCompare(va, vb) {
  const A = mxPlainBlocks(va), B = mxPlainBlocks(vb);
  if (!A || !B) return null;
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const pairs = mxLcs(A.map(x => norm(x.text)), B.map(x => norm(x.text)));
  const rows = [];
  let i = 0, j = 0;
  const gap = (i1, j1) => {
    const as = A.slice(i, i1), bs = B.slice(j, j1);
    const k = Math.min(as.length, bs.length);
    for (let n = 0; n < k; n++) rows.push({ t: bs[n].t, ops: mxWordDiff(as[n].text, bs[n].text) });
    for (const x of as.slice(k)) rows.push({ t: x.t, ops: [['del', x.text]] });
    for (const y of bs.slice(k)) rows.push({ t: y.t, ops: [['ins', y.text]] });
  };
  for (const [pi, pj] of [...pairs, [A.length, B.length]]) {
    gap(pi, pj);
    if (pi < A.length) rows.push({ t: B[pj].t, ops: A[pi].text === B[pj].text ? [['eq', B[pj].text]] : mxWordDiff(A[pi].text, B[pj].text) });
    i = pi + 1; j = pj + 1;
  }
  /* a change is one run of struck and new words together, numbered for stepping through */
  let n = 0, ins = 0, del = 0;
  for (const r of rows) {
    r.changed = r.ops.some(([k]) => k !== 'eq');
    let open = false;
    r.ops = r.ops.map(([k, s]) => {
      if (k === 'eq') { if (s.trim()) open = false; return [k, s, null]; }
      if (!open) { n++; open = true; }
      if (k === 'ins') ins++; else del++;
      return [k, s, n];
    });
  }
  return { rows, changes: n, ins, del };
}

/* the comparison as HTML: inline (both marks in one text) or one side of a side-by-side */
function mxCompareHtml(row, side = 'both') {
  return row.ops.map(([k, s, c]) => {
    const t = mxEsc(s);
    if (k === 'eq') return t;
    if (k === 'del') return side === 'new' ? '' : `<del data-c="${c}">${t}</del>`;
    return side === 'old' ? '' : `<ins data-c="${c}">${t}</ins>`;
  }).join('');
}

/* What changed, clause by clause: for each clause with changes, how many and
   the first of them in a line — what a general counsel reads before the
   redline itself. */
function mxCompareSummary(res) {
  const out = [];
  let head = null;
  const clip = (s, n = 70) => { s = s.replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
  for (const row of res.rows) {
    const text = row.ops.filter(([k]) => k !== 'del').map(([, x]) => x).join('');
    if (row.t === 'h2' || row.t === 'h1') head = text.trim() || head;
    if (!row.changed || row.t === 'h1') continue;
    const key = row.t === 'p' ? (head || 'Opening') : text.trim();
    let g = out.find(x => x.head === key);
    if (!g) { g = { head: key, c: null, ids: new Set(), del: '', ins: '' }; out.push(g); }
    for (const [k, x, c] of row.ops) {
      if (k === 'eq') continue;
      g.ids.add(c); if (g.c == null) g.c = c;
      if (c === g.c) { if (k === 'del') g.del += x; else g.ins += x; }
    }
  }
  return out.map(g => ({ head: g.head, c: g.c, n: g.ids.size, del: clip(g.del), ins: clip(g.ins) }));
}
