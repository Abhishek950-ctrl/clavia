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
