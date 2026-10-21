document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset');
  const status = document.getElementById('reset-status');
  const button = form.querySelector('button');
  const config = window.CG_CONFIG || {};
  const client = window.supabase && config.supabaseUrl && config.supabasePublishableKey ? window.supabase.createClient(config.supabaseUrl,config.supabasePublishableKey) : null;
  let pending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    status.hidden = false;
    const password = document.getElementById('p1').value;
    if (password !== document.getElementById('p2').value) { status.textContent = 'Passwords do not match.'; return; }
    if (!client) { status.textContent = 'Password reset is temporarily unavailable. Please return to sign in and try again.'; return; }
    pending = true; button.disabled = true; status.textContent = 'Checking the recovery link…';
    let updated = false;
    try {
      const { data, error } = await client.auth.getSession();
      if (error || !data.session) { status.textContent = 'This recovery link is missing or has expired. Request a new password recovery link from your administrator.'; return; }
      const result = await client.auth.updateUser({ password });
      if (result.error) { status.textContent = 'The password could not be updated. Check your recovery link and try again.'; return; }
      updated = true;
      const completion = await client.rpc('complete_password_change');
      status.textContent = completion.error ? 'Your password was updated, but account confirmation could not finish. Contact your administrator if sign in still requests a password change.' : 'Password updated. You can return to administrator sign in.';
      form.querySelectorAll('input').forEach(input => { input.value = ''; input.disabled = true; });
    } catch (_) { status.textContent = updated ? 'Your password was updated, but account confirmation could not finish. Contact your administrator if necessary.' : 'The password service could not be reached. Please try again.'; }
    finally { pending = false; button.disabled = updated; }
  });
});
