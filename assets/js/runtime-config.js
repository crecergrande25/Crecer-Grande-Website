// Crecer Grande V2.3 — browser-safe runtime configuration.
// Supports the legacy V2.x browser storage key so an existing installation
// remains connected after upgrade. Only PUBLIC Supabase browser values belong here.
(() => {
  const defaults = {
    supabaseUrl: 'https://nznjqglgiezjehutdsbp.supabase.co',
    supabasePublishableKey: 'sb_publishable_4B16fVwvlWYc2J2DDBVbaw_k99IJTgv',
    adminAuthDomain: 'admin.crecergrande.in',
    adminUsersFunctionUrl: ''
  };

  const read = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; }
    catch (_) { return {}; }
  };

  // V2.0–V2.2 used cg_v2_supabase_config. V2.3 also understands cg_runtime_config.
  const legacy = read('cg_v2_supabase_config');
  const current = read('cg_runtime_config');
  const merged = Object.assign({}, defaults);
  [legacy, current].forEach((source) => {
    Object.entries(source || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') merged[key] = value;
    });
  });
  window.CG_CONFIG = merged;

  window.CG_setConfig = function (partial) {
    const next = Object.assign({}, window.CG_CONFIG || defaults, partial || {});
    window.CG_CONFIG = next;
    try {
      // Write both keys so V2.3 and older V2.x admin/public scripts remain compatible.
      localStorage.setItem('cg_v2_supabase_config', JSON.stringify(next));
      localStorage.setItem('cg_runtime_config', JSON.stringify(next));
    } catch (_) {}
    return next;
  };

  window.CG_clearConfig = function () {
    try {
      localStorage.removeItem('cg_v2_supabase_config');
      localStorage.removeItem('cg_runtime_config');
    } catch (_) {}
    window.CG_CONFIG = Object.assign({}, defaults);
  };
})();
