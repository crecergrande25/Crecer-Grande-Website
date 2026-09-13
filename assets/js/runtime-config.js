// Crecer Grande V2.0 — browser-safe runtime configuration.
// The Website Manager can save the Project URL + publishable key in this browser
// for immediate use. For permanent deployment, place those same PUBLIC values below.
// NEVER put a Supabase secret key, service_role key, database password or admin password here.
(() => {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('cg_v2_supabase_config') || '{}') || {}; } catch (_) {}
  window.CG_CONFIG = {
    supabaseUrl: saved.supabaseUrl || "",
    supabasePublishableKey: saved.supabasePublishableKey || "",
    adminAuthDomain: "admin.crecergrande.in",
    adminUsersFunctionUrl: saved.adminUsersFunctionUrl || ""
  };
})();
