/* ── Settings, as finalised in the design study ──────────────────────
   The window from the Settings design (src/settings-v2.html) opens over
   the app, kept whole in a frame: Fields, Routing rules, Approvals,
   Signing and Vault, then General, Memory, Connectors, Add In and
   Members. The build puts the page in below; the dev server, which
   serves src/ as it is, loads it by its address instead.

   The frame stays once opened, so what was changed in it is still there
   the next time. The app's older Settings pages stay for Horizon, which
   the study does not cover. */

const SETTINGS_V2_HTML = "__SETTINGS_V2_HTML__";
/* the older page addresses, by the study's page for the same thing */
const ST_V2_PAGE = { general: 'general', members: 'members', connectors: 'connectors', channels: 'types', details: 'types',
  rules: 'routing', signing: 'sign', approvals: 'approvals', vault: 'vault', memory: 'memory' };
let stV2Frame = null;

function openSettingsV2(page = 'general') {
  if (!stV2Frame) {
    stV2Frame = h('iframe', { class: 'stv2', title: 'Settings', name: page });
    if (SETTINGS_V2_HTML.startsWith('__')) stV2Frame.src = 'settings-v2.html';
    else stV2Frame.srcdoc = SETTINGS_V2_HTML;
    document.body.append(stV2Frame);
  } else {
    stV2Frame.contentWindow?.postMessage({ clavia: 'settings-page', page }, '*');
    stV2Frame.hidden = false;
  }
  stV2Frame.focus();
}

addEventListener('message', (e) => {
  if (stV2Frame && e.source === stV2Frame.contentWindow && e.data?.clavia === 'settings-close') stV2Frame.hidden = true;
});

/* ── Settings › Signing, as the app reads it ──
   Who signs for our company comes from the Signing rules: the first rule
   that fits the documents being sent decides, else Everything else. The
   rules live in the Settings window; until it has been opened they are the
   ones it starts with, kept the same here. */
const ST_SIGN_AUTO = 'Lumen signs by itself';
const ST_SIGN_DEFAULT = {
  list: [
    { n: 'Standard NDAs', on: 1, cs: [['Type', 'is', 'NDA'], ['Paper', 'is', 'Ours']], ppl: [ST_SIGN_AUTO], jn: [], svc: 'Clavia e-sign' },
    { n: 'Big deals', on: 1, cs: [['Yearly value', 'is more than', '£1,000,000']], ppl: ['Grace Coleman', 'Tom Fisher'], jn: [], svc: 'Clavia e-sign' },
    { n: 'Their paper', on: 1, cs: [['Paper', 'is', 'Theirs'], ['Stage of document', 'is', 'Out for signature']], ppl: ['Grace Coleman', 'Tom Fisher'], jn: [], svc: 'Clavia e-sign' },
    { n: 'Companies in the US', on: 1, cs: [['Counterparty country', 'is', 'United States']], ppl: ['Grace Coleman'], jn: [], svc: 'DocuSign' },
    { n: 'Companies in India', on: 1, cs: [['Counterparty country', 'is', 'India']], ppl: ['Arjun Rao'], jn: [], svc: 'Clavia e-sign' }],
  fall: { n: 'Everything else', ppl: ['Grace Coleman'], svc: 'Clavia e-sign' },
};
function stSignRules() {
  try { const RS = stV2Frame?.contentWindow?.RS; if (RS?.sg?.list) return { list: RS.sg.list, fall: RS.sg.fall }; } catch (e) {}
  try { const kept = JSON.parse(localStorage.getItem('clavia.signRules') || 'null'); if (kept?.list) return kept; } catch (e) {}
  return ST_SIGN_DEFAULT;
}
/* what a rule can ask of a document going out */
function stSignFacts(r, d) {
  const t = (d.title || '').toLowerCase(), v0 = d.versions?.[0];
  const type = /\bnda\b|non-disclosure/.test(t) ? 'NDA' : /\bmsa\b|master services/.test(t) ? 'MSA' : /\bsow\b|statement of work/.test(t) ? 'SOW'
    : /order form/.test(t) ? 'Order form' : /reseller/.test(t) ? 'Reseller agreement' : /supplier/.test(t) ? 'Supplier agreement' : /customer/.test(t) ? 'Customer contract' : '';
  const addr = (r.address || '') + ' ' + (r.counterparty || '');
  const country = /india|mumbai|bengaluru|delhi/i.test(addr) ? 'India' : /singapore/i.test(addr) ? 'Singapore'
    : /\b(usa|united states|new york|ny \d|ca \d|delaware|san francisco)\b/i.test(addr) ? 'United States' : /\b(uk|united kingdom|london|bristol|manchester|[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2})\b/.test(addr) ? 'United Kingdom' : '';
  return { 'Type': type, 'What they need': type, 'Paper': d.source || v0?.by === 'Clavia' ? 'Ours' : 'Theirs', 'Counterparty country': country,
    'Counterparty': r.counterparty || '', 'Stage of document': 'Out for signature', 'Stage of request': 'Out for signature',
    'Yearly value': r.value || '', 'Intake channel': { salesforce: 'Salesforce', slack: 'Slack', email: 'Email', teams: 'Microsoft Teams' }[r.source] || '' };
}
function stSignFits(c, facts) {
  const x = facts[c[0]], v = c[2], num = (s) => parseFloat(String(s).replace(/[^0-9.]/g, ''));
  if (c[1] === 'is not') return x !== v;
  if (c[1] === 'does not include') return !String(v).split(',').some(t => t.trim() && String(x || '').toLowerCase().includes(t.trim().toLowerCase()));
  if (!x || v === '') return false;
  if (c[1] === 'is') return x === v;
  if (c[1] === 'is more than') return num(x) > num(v);
  if (c[1] === 'is less than') return num(x) < num(v);
  if (c[1] === 'includes') return String(v).split(',').some(t => t.trim() && String(x).toLowerCase().includes(t.trim().toLowerCase()));
  return false;
}
/* the rule that decides for these documents, and our side's signers in levels:
   "then" starts a new level, "and" and "or" sign in the same one */
function stSignPlan(r, docs) {
  const R = stSignRules(), facts = docs.map(d => stSignFacts(r, d));
  const rule = R.list.find(x => x.on && x.cs?.length && facts.some(f => x.cs.every(c => stSignFits(c, f)))) || R.fall;
  const auto = rule.ppl.includes(ST_SIGN_AUTO);
  const groups = [];
  if (!auto) rule.ppl.forEach((p, j) => { const how = (rule.jn || [])[j];
    if (j && (how === 'and' || how === 'or')) { const g = groups[groups.length - 1]; g.who.push(p); g.rule = how === 'or' ? 'any' : 'all'; }
    else groups.push({ who: [p], rule: 'all' }); });
  return { rule, auto, groups, svc: rule.svc || 'Clavia e-sign' };
}
