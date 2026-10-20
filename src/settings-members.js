/* ── Settings › Members ──────────────────────────────────────────
   Who is in the workspace and what each person can do. Three roles,
   said in plain words wherever a role is chosen:
     Admin      everything a lawyer can do, plus the workspace's settings
     Lawyer     works on every request, contract, playbook and template
     Requester  the business: asks legal for help and follows their own asks
   People are added by email (Invite). Until they accept, they sit
   under Invited with Resend and Revoke. The last admin can't be removed
   or demoted, so the workspace never locks itself out. */

const ST_ROLES = {
  admin:     { label: 'Admin',     say: 'Everything a lawyer can do, plus settings: connectors, routing rules and members.' },
  lawyer:    { label: 'Lawyer',    say: 'Works on every request, contract, playbook and template. Can’t change settings.' },
  requester: { label: 'Requester', say: 'For the business. Asks legal for help and follows their own requests to done.' },
};
const ST_ROLE_ORDER = ['admin', 'lawyer', 'requester'];
/* one glyph per role, in the house line style: guard of the settings, the scales, the business */
const ST_ROLE_GLYPH = {   /* all three on one 16px box (4–20), same stroke */
  admin:     '<path d="M12 4 5.5 6.5v5c0 3.9 2.7 7.1 6.5 8.5 3.8-1.4 6.5-4.6 6.5-8.5v-5z"/><path d="m9.3 12 1.9 1.9 3.5-3.6"/>',
  lawyer:    '<path d="M12 4.5V19.5"/><path d="M8.5 19.5h7"/><path d="M5.5 7h13"/><path d="M4 13.5 6.5 7 9 13.5"/><path d="M4 13.5a2.5 2.5 0 0 0 5 0"/><path d="M15 13.5 17.5 7l2.5 6.5"/><path d="M15 13.5a2.5 2.5 0 0 0 5 0"/>',
  requester: '<rect x="4" y="7.5" width="16" height="12" rx="2"/><path d="M9.5 7.5V6a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 6v1.5"/><path d="M4 12.5h16"/>',
};
const stRoleGlyph = (k) => h('span', { class: 'sx-rolepop-g', html: MI(ST_ROLE_GLYPH[k]) });

function stMembers() {
  const d = mxData();
  if (!d.members) {
    const day = (n) => new Date(Date.now() - n * 864e5).toISOString();
    const legal = MX_LEGAL.map(p => ({ name: p.name, title: p.role, email: mxEmail(p.name).replace('clavia.app', 'lumen.io'),
      role: ['Roger Bennett', 'Marcus Lee'].includes(p.name) ? 'admin' : 'lawyer', joined: day(200) }));
    const business = [['Priya Shah', 'Head of Partnerships'], ['Daniel Okafor', 'Account Executive'], ['Sofia Marin', 'Account Executive'], ['Tom Becker', 'Procurement Manager'], ['Hannah Lee', 'Marketing Lead']]
      .map(([name, title]) => ({ name, title, email: mxEmail(name).replace('clavia.app', 'lumen.io'), role: 'requester', joined: day(90) }));
    d.members = [...legal, ...business,
      { email: 'liam.oconnor@lumen.io', role: 'lawyer', invited: day(2), by: 'Marcus Lee' },
      { email: 'ana.ruiz@lumen.io', role: 'requester', invited: day(5), by: 'Roger Bennett' }];
    save();
  }
  return d.members;
}
const stAdmins = () => stMembers().filter(m => m.role === 'admin' && !m.invited);
const stWho = (m) => m.name || m.email;

/* the role picker: each role in a sentence, the current one ticked */
function stRolePop(anchor, cur, pick, acts = []) {
  document.querySelector('.mx-fpop')?.remove();
  const TICK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 8.3 2.6 2.6L12 5.4"/></svg>';
  const pop = h('div', { class: 'mx-fpop sx-rolepop', role: 'dialog', 'aria-label': 'Role' },
    h('div', { class: 'sx-rolepop-l' }, ...ST_ROLE_ORDER.map(k => h('button', { class: 'sx-rolepop-o' + (k === cur ? ' is-on' : ''), type: 'button', role: 'menuitemradio', 'aria-checked': String(k === cur),
      onclick: () => { close(); if (k !== cur) pick(k); } },
      stRoleGlyph(k),
      h('span', { class: 'sx-rolepop-m' }, h('span', { class: 'sx-rolepop-t' }, ST_ROLES[k].label), h('span', { class: 'sx-rolepop-s' }, ST_ROLES[k].say)),
      h('span', { class: 'sx-rolepop-tick' + (k === cur ? '' : ' is-off'), html: TICK })))),
    acts.length ? h('div', { class: 'sx-rolepop-a' }, ...acts.map(a => h('button', { class: 'sx-rolepop-x' + (a.danger ? ' is-danger' : ''), type: 'button', onclick: () => { close(); a.run(); } }, a.label))) : null);
  document.body.append(pop);
  const r = anchor.getBoundingClientRect();
  pop.style.top = (r.bottom + 6) + 'px';
  pop.style.left = Math.max(12, Math.min(r.right - pop.offsetWidth, innerWidth - pop.offsetWidth - 12)) + 'px';
  const close = () => { pop.remove(); removeEventListener('mousedown', shut, true); removeEventListener('keydown', shut, true); };
  const shut = (e) => { if (e.type === 'keydown' ? e.key !== 'Escape' : pop.contains(e.target) || anchor.contains(e.target)) return; close(); };
  addEventListener('mousedown', shut, true); addEventListener('keydown', shut, true);
}

function stMembersPage() {
  const all = stMembers();
  const st = MX.settings.members ||= { tab: 'all', find: '' };
  const page = h('div', { class: 'sx-page sx-page--mem' });
  const CHEV = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>';
  const TABS = [['all', 'All', (m) => !m.invited], ['admin', 'Admins', (m) => !m.invited && m.role === 'admin'], ['lawyer', 'Lawyers', (m) => !m.invited && m.role === 'lawyer'],
    ['requester', 'Requesters', (m) => !m.invited && m.role === 'requester'], ['invited', 'Invited', (m) => !!m.invited]];
  const paint = () => page.replaceChildren(...build());
  const toastUndo = (msg, undo) => { save(); paint(); pbToast(msg, { label: 'Undo', run: () => { undo(); save(); paint(); } }); };

  const setRole = (m, k) => {
    if (m.role === 'admin' && k !== 'admin' && !m.invited && stAdmins().length === 1) return pbToast('Make someone else an admin first');
    const go = () => { const was = m.role; m.role = k; toastUndo(`${stWho(m)} is now ${/^[AE]/.test(ST_ROLES[k].label) ? 'an' : 'a'} ${ST_ROLES[k].label.toLowerCase()}`, () => { m.role = was; }); };
    if (m.name === USER.name && m.role === 'admin') return pbConfirm({ title: 'Give up admin?', lead: `You won’t be able to change settings, connectors or members any more. Another admin can give it back.`, action: `Make me ${ST_ROLES[k].label === 'Lawyer' ? 'a lawyer' : 'a requester'}`, run: go });
    go();
  };
  const remove = (m) => {
    if (m.role === 'admin' && !m.invited && stAdmins().length === 1) return pbToast('Make someone else an admin first');
    const i = all.indexOf(m);
    if (m.invited) { all.splice(i, 1); return toastUndo(`Invite to ${m.email} revoked`, () => all.splice(i, 0, m)); }
    pbConfirm({ title: `Remove ${m.name}?`, lead: `${m.name} loses access to Lumen Legal straight away. Requests they sent and work they did stay where they are.`, action: 'Remove',
      run: () => { all.splice(i, 1); toastUndo(`${m.name} removed`, () => all.splice(i, 0, m)); } });
  };

  const row = (m) => {
    const roleBtn = h('button', { class: 'sx-role', type: 'button', 'aria-haspopup': 'dialog', onclick: (e) => { e.stopPropagation(); stRolePop(e.currentTarget, m.role, (k) => setRole(m, k), m.invited ? [
        { label: 'Resend invite', run: () => { m.invited = mxNow(); save(); paint(); pbToast(`Invite sent to ${m.email} again`); } },
        { label: 'Copy invite link', run: () => { navigator.clipboard?.writeText(location.origin + location.pathname + '?invite=' + encodeURIComponent(m.email)).catch(() => {}); pbToast('Invite link copied'); } },
        { label: 'Revoke invite', danger: true, run: () => remove(m) }]
      : m.name === USER.name ? [] : [{ label: 'Remove', danger: true, run: () => remove(m) }]); } },
      ST_ROLES[m.role].label, h('span', { class: 'mx-rule-pick-c', html: CHEV }));
    return h('div', { class: 'sx-row is-static sx-mem' + (m.invited ? ' is-invited' : '') },
      m.invited ? h('span', { class: 'sx-mem-pend', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/></svg>' }) : mxFace(m.name, 'pb-av sx-mem-av'),
      h('span', { class: 'sx-row-m' },
        h('span', { class: 'sx-row-n' }, stWho(m), m.name === USER.name ? h('span', { class: 'sx-pv-faint' }, ' (you)') : null),
        h('span', { class: 'sx-row-s' }, m.invited ? `Invited by ${m.by === USER.name ? 'you' : m.by} · ${pbWhen(m.invited)}` : m.email)),
      h('span', { class: 'sx-mem-r' }, roleBtn));
  };

  function build() {
    const q = st.find.trim().toLowerCase();
    const tab = TABS.find(t => t[0] === st.tab) || TABS[0];
    const list = all.filter(tab[2]).filter(m => !q || [m.name, m.email, m.title].join(' ').toLowerCase().includes(q))
      .sort((a, b) => ST_ROLE_ORDER.indexOf(a.role) - ST_ROLE_ORDER.indexOf(b.role) || stWho(a).localeCompare(stWho(b)));
    const tabs = h('div', { class: 'pb-tabs', role: 'tablist' }, ...TABS.filter(t => t[0] !== 'invited' || all.some(t[2])).map(([k, label, f]) =>
      h('button', { class: 'pb-tab', type: 'button', role: 'tab', 'aria-selected': String(st.tab === k), onclick: () => { st.tab = k; paint(); } }, label, h('span', { class: 'pb-tab-n' }, String(all.filter(f).length)))));
    const qIn = h('input', { type: 'search', placeholder: 'Search', 'aria-label': 'Search members', value: st.find, oninput: (e) => { st.find = e.target.value; const pos = e.target.selectionStart; paint(); const n = page.querySelector('.pb-find input'); n.focus(); n.setSelectionRange(pos, pos); } });
    return [
      stHead('Members', null, h('button', { class: 'btn btn--primary', type: 'button', onclick: () => stInvite(() => paint()) }, icon('plus', 'ico ico-14'), 'Invite')),
      h('div', { class: 'pb-bar-list sx-mem-bar' }, tabs, h('div', { class: 'pb-find pb-list-find is-open' }, h('span', { class: 'pb-find-btn', html: PB_SVG.search }), qIn)),
      h('div', { class: 'sx-list sx-mem-list' }, ...(list.length ? list.map(row) : [h('p', { class: 'sx-flow-s sx-mem-none' }, q ? `No one matches “${st.find.trim()}”.` : 'No one here yet.')])),
    ];
  }
  paint();
  return page;
}

/* Invite People: emails as chips, one role for all of them, an optional note */
function stInvite(done) {
  const ws = mxData().ws || { domain: 'lumen.io', name: 'Lumen Legal' };
  const emails = [];
  let role = 'requester';
  const dim = h('div', { class: 'pb-dim mx-rqf-dim', onclick: (e) => { if (e.target === dim) close(); } });
  const close = () => { dim.classList.add('is-closing'); setTimeout(() => dim.remove(), 150); removeEventListener('keydown', onKey, true); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const chips = h('div', { class: 'sx-chips' });
  const input = h('input', { class: 'sx-chips-in', type: 'text', placeholder: 'Enter email addresses', autocomplete: 'off', 'aria-label': 'Email addresses' });
  const valid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const already = (e) => stMembers().some(m => m.email === e);
  const add = (raw) => { raw.split(/[\s,;]+/).map(x => x.trim().toLowerCase()).filter(Boolean).forEach(e => { if (!emails.includes(e)) emails.push(e); }); input.value = ''; paintChips(); };
  const paintChips = () => {
    input.placeholder = emails.length ? '' : 'Enter email addresses';
    chips.replaceChildren(...emails.map((e, i) => { const bad = !valid(e), dup = already(e), out = valid(e) && !e.endsWith('@' + (ws.domain || 'lumen.io'));
      return h('span', { class: 'sx-chip' + (bad || dup ? ' is-bad' : out ? ' is-out' : ''), 'data-tip': bad ? 'Not an email address' : dup ? 'Already has access' : out ? `Outside ${ws.domain || 'lumen.io'}` : null }, e,
        h('button', { type: 'button', 'aria-label': `Remove ${e}`, html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>', onclick: () => { emails.splice(i, 1); paintChips(); } })); }), input);
    sync();
  };
  input.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ' || e.key === 'Tab') && input.value.trim()) { e.preventDefault(); add(input.value); }
    else if (e.key === 'Backspace' && !input.value && emails.length) { emails.pop(); paintChips(); }
  });
  input.addEventListener('paste', (e) => { const t = e.clipboardData?.getData('text'); if (t && /[\s,;]/.test(t)) { e.preventDefault(); add(t); } });
  input.addEventListener('blur', () => { if (input.value.trim()) add(input.value); });
  chips.addEventListener('click', () => input.focus());
  const roles = h('div', { class: 'mx-rule-how sx-roles', role: 'radiogroup', 'aria-label': 'Role' });
  const paintRoles = () => roles.replaceChildren(...ST_ROLE_ORDER.map(k => h('button', { class: 'mx-rule-opt' + (role === k ? ' is-on' : ''), type: 'button', role: 'radio', 'aria-checked': String(role === k),
    onclick: () => { role = k; paintRoles(); } }, h('span', { class: 'mx-rule-radio' }),
    h('span', { class: 'mx-rqf-pick-t' }, h('span', { class: 'mx-rqf-pick-n' }, ST_ROLES[k].label), h('span', { class: 'mx-rqf-pick-s' }, ST_ROLES[k].say)))));
  const note = h('textarea', { class: 'sx-note', rows: '1', placeholder: 'Add a note to the invite',
    oninput: (e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 2 + 'px'; } });
  const send = h('button', { class: 'pb-btn pb-btn--primary', type: 'button', onclick: () => {
    if (input.value.trim()) add(input.value);
    const ok = emails.filter(e => valid(e) && !already(e));
    if (!ok.length) return;
    const list = stMembers(); ok.forEach(e => list.push({ email: e, role, invited: mxNow(), by: USER.name, note: note.value.trim() || null }));
    save(); close(); Object.assign(MX.settings.members ||= {}, { tab: 'invited', find: '' }); done?.();
    pbToast(`Invite${ok.length > 1 ? 's' : ''} sent to ${ok.length > 1 ? mxPlural(ok.length, 'person', 'people') : ok[0]}`);
  } }, 'Send Invites');
  const hint = h('span', { class: 'sx-field-s' });
  const sync = () => {
    const dom = ws.domain || 'lumen.io', bad = emails.filter(e => !valid(e)).length, dup = emails.filter(e => valid(e) && already(e)).length, out = emails.filter(e => valid(e) && !already(e) && !e.endsWith('@' + dom)).length;
    const says = [bad ? `${mxPlural(bad, 'isn’t an email', 'aren’t emails')}` : null, dup ? `${dup} already ${dup > 1 ? 'have' : 'has'} access` : null].filter(Boolean);
    hint.textContent = says.length ? `${says.join(', ')}, so ${bad + dup > 1 ? 'they’ll' : 'it’ll'} be skipped.${out ? ` ${mxPlural(out, 'address is', 'addresses are')} outside ${dom}.` : ''}` : out ? `${mxPlural(out, 'address is', 'addresses are')} outside ${dom}. Invite only people you trust with legal work.` : 'Paste a list or press Enter after each one.';
    hint.classList.toggle('is-warn', !!(says.length || out)); const ok = emails.filter(e => valid(e) && !already(e)).length + (valid(input.value.trim()) ? 1 : 0);
    send.disabled = !ok; send.textContent = ok > 1 ? `Send ${ok} Invites` : 'Send Invite'; };
  input.addEventListener('input', sync);
  paintChips(); paintRoles();
  dim.append(h('div', { class: 'pb-dlg mx-rqf sx-invite-dlg', role: 'dialog', 'aria-label': 'Invite people' },
    h('header', { class: 'mx-rqf-head' }, h('h2', { class: 'pb-dlg-t' }, 'Invite People')),
    h('div', { class: 'mx-rqf-body' },
      h('div', { class: 'mx-rqf-f' }, h('span', { class: 'mx-rqf-l' }, 'Email addresses'), chips, hint),
      h('div', { class: 'mx-rqf-f' }, h('span', { class: 'mx-rqf-l' }, 'Role'), roles),
      h('label', { class: 'mx-rqf-f' }, h('span', { class: 'mx-rqf-l' }, 'Note ', h('span', { class: 'sx-pv-faint' }, 'Optional')), note)),
    h('footer', { class: 'mx-rqf-foot' }, h('button', { class: 'pb-btn', type: 'button', onclick: close }, 'Cancel'), send)));
  document.body.append(dim); addEventListener('keydown', onKey, true); requestAnimationFrame(() => input.focus());
}
