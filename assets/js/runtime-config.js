// Crecer Grande Website V2.6 — public browser configuration.
// Only public/publishable browser values belong here. Never place service-role keys in this file.
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
  const merged = Object.assign({}, defaults);
  [read('cg_v2_supabase_config'), read('cg_runtime_config')].forEach((src) => {
    Object.entries(src || {}).forEach(([k,v]) => {
      if (v !== undefined && v !== null && v !== '') merged[k] = v;
    });
  });
  window.CG_CONFIG = merged;
  window.CG_setConfig = function(partial) {
    const next = Object.assign({}, window.CG_CONFIG || defaults, partial || {});
    window.CG_CONFIG = next;
    try {
      localStorage.setItem('cg_v2_supabase_config', JSON.stringify(next));
      localStorage.setItem('cg_runtime_config', JSON.stringify(next));
    } catch (_) {}
    return next;
  };
  window.CG_clearConfig = function() {
    try {
      localStorage.removeItem('cg_v2_supabase_config');
      localStorage.removeItem('cg_runtime_config');
    } catch (_) {}
    window.CG_CONFIG = Object.assign({}, defaults);
  };
})();