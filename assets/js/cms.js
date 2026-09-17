(() => {
  async function boot() {
    const cfg = window.CG_CONFIG || {};
    if (!window.supabase || !cfg.supabaseUrl || !cfg.supabasePublishableKey) return;
    try {
      const client = window.CG_SUPABASE || window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
      window.CG_SUPABASE = client;
      const { data, error } = await client.from('site_settings').select('*').eq('id','main').maybeSingle();
      if (error || !data) return;
      const navy = data.color_navy || data.theme_navy;
      const gold = data.color_gold || data.theme_gold;
      if (navy) document.documentElement.style.setProperty('--navy', navy);
      if (gold) document.documentElement.style.setProperty('--gold', gold);
      document.querySelectorAll('[data-site-field]').forEach((el) => {
        const key = el.dataset.siteField, value = data[key];
        if (value == null || value === '') return;
        el.textContent = (el.dataset.sitePrefix || '') + value;
        if (el.dataset.siteLink === 'tel') el.href = 'tel:' + String(value).replace(/[^\d+]/g,'');
        if (el.dataset.siteLink === 'mailto') el.href = 'mailto:' + value;
        if (el.dataset.siteLink === 'instagram') el.href = data.instagram_url || String(value);
        if (el.dataset.siteLink === 'whatsapp') el.href = 'https://wa.me/' + String(value).replace(/\D/g,'');
      });
      if (data.logo_url) {
        document.querySelectorAll('[data-site-src="logo_url"]').forEach((img) => img.src = data.logo_url);
      }
    } catch (_) {}
  }
  document.addEventListener('DOMContentLoaded', boot);
})();