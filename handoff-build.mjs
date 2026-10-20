/* Builds clavia/handoff/ from the app's own source, so the hand-off never drifts from what ships:
   the quill mark as SVG (static, per tone, app icon, lockup), each animated state as a
   self-contained SVG, the source JS/CSS, and every UI animation with its tokens and usage. */
import fs from 'node:fs';
import path from 'node:path';
const SRC = new URL('./src/', import.meta.url).pathname, OUT = new URL('./handoff/', import.meta.url).pathname;
const w = (p, s) => { fs.mkdirSync(path.dirname(OUT + p), { recursive: true }); fs.writeFileSync(OUT + p, s); };

/* ── the quill generator, lifted out of quill.js (it is a pure string builder) ── */
const qjs = fs.readFileSync(SRC + 'quill.js', 'utf8');
const grab = (name) => { const i = qjs.indexOf(name); let d = 0, j = qjs.indexOf('{', i); for (let k = j; k < qjs.length; k++) { if (qjs[k] === '{') d++; if (qjs[k] === '}') { d--; if (!d) return qjs.slice(i, k + 1); } } };
const tonesSrc = qjs.slice(qjs.indexOf('const QUILL_TONES'), qjs.indexOf('};', qjs.indexOf('const QUILL_TONES')) + 2);
const { QUILL_TONES, quillSVG } = new Function(`${tonesSrc}\n${grab('function quillSVG')}\nreturn { QUILL_TONES, quillSVG };`)();
const qcss = fs.readFileSync(SRC + 'quill.css', 'utf8');

const XML = '<?xml version="1.0" encoding="UTF-8"?>\n';
const NS = 'xmlns="http://www.w3.org/2000/svg"';
/* static, painted mark */
const stat = (tone, extra = '') => `${XML}<svg ${NS} viewBox="0 0 48 48" width="48" height="48">${extra}${quillSVG(QUILL_TONES[tone])}</svg>\n`;
w('svg/clavia-quill.svg', stat('paper'));
w('svg/clavia-quill-on-forest.svg', stat('rail'));
w('svg/clavia-quill-on-forest-filled.svg', stat('rail', `<rect width="48" height="48" fill="${QUILL_TONES.rail.bg}"/>`));
/* the app icon / favicon exactly as the tab shows it */
const icon = `${XML}<svg ${NS} viewBox="0 0 48 48" width="48" height="48"><rect width="48" height="48" rx="11" fill="${QUILL_TONES.rail.bg}"/><g transform="translate(7 5) scale(.74)">${quillSVG(QUILL_TONES.rail)}</g></svg>\n`;
w('svg/clavia-app-icon.svg', icon);
/* lockups: the quill beside the wordmark, as the rail shows it (28px mark, 86×28 word, 9px gap) */
const lock = (tone, bg) => `${XML}<svg ${NS} viewBox="0 0 124 28" width="248" height="56">${bg ? `<rect width="124" height="28" fill="${bg}"/>` : ''}`
  + `<g transform="scale(${28 / 48})">${quillSVG(QUILL_TONES[tone])}</g>`
  + `<text x="38" y="20.5" font-family="'Cormorant Garamond', serif" font-size="25" font-weight="600" fill="${tone === 'rail' ? '#F1ECDF' : '#0D1F16'}">Clavia</text></svg>\n`;
w('svg/clavia-lockup.svg', lock('paper'));
w('svg/clavia-lockup-on-forest.svg', lock('rail', QUILL_TONES.rail.bg));

/* ── animated: each state as one self-contained SVG, styles inside ── */
const inner = quillSVG().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const css = qcss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n{2,}/g, '\n');
const anim = (state, tone, loop) => {
  /* one-offs (greet, done) loop here so they can be watched; in the app they run once and settle */
  const again = loop ? `\n.cq-s-${state} * { animation-iteration-count: infinite !important; animation-duration: ${state === 'greet' ? '2.8s' : '1.4s'} !important; }` : '';
  return `${XML}<svg ${NS} class="cq cq-svg cq-t-${tone} cq-s-${state}" viewBox="0 0 48 48" width="96" height="96" style="overflow:visible">`
    + `<style>${css}${again}</style>${tone === 'rail' ? `<rect x="-6" y="-6" width="60" height="60" rx="12" fill="${QUILL_TONES.rail.bg}"/>` : ''}${inner}</svg>\n`;
};
for (const st of ['idle', 'greet', 'work', 'done']) {
  w(`animated/clavia-quill-${st}.svg`, anim(st, 'paper'));
  w(`animated/clavia-quill-${st}-on-forest.svg`, anim(st, 'rail'));
}
w('animated/clavia-quill-greet-loop.svg', anim('greet', 'paper', true));
w('animated/clavia-quill-done-loop.svg', anim('done', 'paper', true));

/* ── source of truth ── */
w('source/quill.js', qjs);
w('source/quill.css', qcss);

/* ── the motion system: every @keyframes in the app, where it is used, and how ── */
const files = fs.readdirSync(SRC).filter(f => f.endsWith('.css'));
const kf = new Map(), uses = new Map();
const scan = (text, file) => {
  /* walk rules with a brace counter so nested @media / @container rules are read too */
  let i = 0;
  const walk = (s, base) => {
    let k = 0;
    while (k < s.length) {
      const open = s.indexOf('{', k); if (open < 0) break;
      const head = s.slice(k, open).replace(/\/\*[\s\S]*?\*\//g, '').trim();
      let d = 0, j = open;
      for (; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (!d) break; } }
      const body = s.slice(open + 1, j);
      if (/^@keyframes\s+/.test(head)) { const n = head.replace(/^@keyframes\s+/, ''); if (!kf.has(n)) kf.set(n, { file, body: body.trim() }); }
      else if (/^@(media|container|supports)/.test(head)) walk(body, file);
      else {
        for (const m of body.matchAll(/animation(?:-name)?\s*:\s*([^;]+)/g)) {
          for (const part of m[1].split(/,(?![^(]*\))/)) {
            const name = part.trim().split(/\s+/).find(t => kf.has(t) || /^[a-zA-Z][\w-]*$/.test(t) && !/^(ease|linear|infinite|alternate|both|forwards|backwards|none|reverse|paused|running|normal|ease-in|ease-out|ease-in-out)$/.test(t) && !/^\d/.test(t) && !/^var\(/.test(t) && !/^cubic/.test(t) && !/^steps/.test(t));
            if (!name) continue;
            (uses.get(name) || uses.set(name, []).get(name)).push({ sel: head.replace(/\s+/g, ' ').slice(0, 120), how: part.trim(), file });
          }
        }
      }
      k = j + 1;
    }
  };
  walk(text, file);
};
for (const f of files) scan(fs.readFileSync(SRC + f, 'utf8'), f);
const root = fs.readFileSync(SRC + 'styles.css', 'utf8');
const tokens = (root.match(/--(ease|ease-out|fast|base|slow|pb-open)\s*:[^;]+;/g) || []).concat((fs.readFileSync(SRC + 'playbooks.css', 'utf8').match(/--pb-open\s*:[^;]+;/g) || []));
w('motion/tokens.css', `/* Clavia motion tokens — from src/styles.css */\n:root {\n${[...new Set(tokens)].map(t => '  ' + t).join('\n')}\n}\n`);
w('motion/keyframes.css', `/* Every @keyframes in the Clavia app, as shipped (${kf.size}). Grouped by the file they live in. */\n\n`
  + [...kf].sort((a, b) => a[1].file.localeCompare(b[1].file) || a[0].localeCompare(b[0])).map(([n, { file, body }]) => `/* ${file} */\n@keyframes ${n} {\n  ${body.replace(/\n\s*/g, '\n  ')}\n}`).join('\n\n') + '\n');
const rows = [...kf.keys()].sort().map(n => {
  const u = uses.get(n) || [];
  const how = [...new Set(u.map(x => x.how))].slice(0, 2).join(' · ') || '—';
  const where = [...new Set(u.map(x => x.sel))].slice(0, 2).join(' · ') || '(defined, not referenced in CSS: set from JS)';
  return `| \`${n}\` | ${kf.get(n).file} | ${where.replace(/\|/g, '\\|')} | \`${how.replace(/\|/g, '\\|')}\` |`;
});
w('motion/MOTION.md', `# Clavia motion — every animation in the app\n\nGenerated from \`src/*.css\`. ${kf.size} keyframes. Tokens are in \`tokens.css\`, the keyframes themselves in \`keyframes.css\`.\n\n`
  + `## Rules the product follows\n- Hovers change colour only; nothing moves on hover.\n- Entrances use transform + opacity, 120–340ms, on \`--ease\` (cubic-bezier(.2,0,0,1)) or \`--ease-out\` (cubic-bezier(.16,1,.3,1)).\n- No layout shift: things grow from where they are, rows slide rather than jump.\n- Loaders take 1.5–4s and are a plain ring or the quill writing; no step text under them.\n- \`prefers-reduced-motion: reduce\` turns the quill's animation off.\n\n`
  + `| Keyframes | File | Used on (selector) | Animation |\n|---|---|---|---|\n${rows.join('\n')}\n`);
console.log(`quill svgs ✓  animated ✓  keyframes ${kf.size}  tokens ${tokens.length}`);
