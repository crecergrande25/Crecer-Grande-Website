document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rfq-form');
  const status = document.getElementById('rfq-status');
  if (!form || !status) return;
  const type = form.dataset.formType || 'rfq';
  const fileInput = form.querySelector('[name="reference_file"]');
  const submit = form.querySelector('button[type="submit"]');
  const submitLabel = submit?.textContent || 'Submit Requirement';
  const allowed = new Set(['pdf','jpg','jpeg','png','webp','dxf','dwg','step','stp','ste','stl','3mf','obj','ply','amf','igs','iges','ige','brep','brp','sldprt','sldasm','ipt','iam','idw','ipn','prt','x_t','x_b','sat','sab','catpart','catproduct','jt','3dm','f3d','f3z','zip','xlsx','xls','doc','docx','csv']);
  if (fileInput) fileInput.accept = [...allowed].map(extension => '.' + extension).join(',');
  let pending = false;
  let recorded = false;
  const query = new URLSearchParams(location.search);
  const prefill = { requirement:'requirement_type', message:'message', material:'material', quantity:'quantity', machine_model:'machine_model', dimensions:'dimensions', location:'location', cad_software:'cad_software', deliverables:'deliverables', piping_scope:'piping_scope' };
  for (const [parameter, name] of Object.entries(prefill)) {
    const value = query.get(parameter), field = form.querySelector(`[name="${name}"]`);
    if (!value || !field) continue;
    if (field.tagName === 'SELECT' && ![...field.options].some(option => option.value === value)) field.add(new Option(value, value));
    field.value = value;
  }
  function filesToUpload() {
    const files = [...(fileInput?.files || [])];
    if (files.length > 8) throw new Error('Please upload no more than 8 files at a time.');
    if (files.reduce((size, file) => size + file.size, 0) > 100 * 1024 * 1024) throw new Error('Combined attachments exceed the 100 MB upload limit. Please use a ZIP or split the submission.');
    for (const file of files) {
      if (!allowed.has(file.name.split('.').pop().toLowerCase())) throw new Error(`Unsupported file type: ${file.name}`);
      if (file.size > 50 * 1024 * 1024) throw new Error(`${file.name} exceeds the 50 MB per-file upload limit.`);
    }
    return files;
  }
  function notice(message, error = false) {
    status.className = 'status' + (error ? ' error' : '');
    status.textContent = message;
  }
  function continuation(label, href, external = false) {
    const link = document.createElement('a');
    link.textContent = label;
    link.href = href;
    if (external) { link.target = '_blank'; link.rel = 'noopener'; }
    status.append(document.createTextNode(' '), link);
  }
  async function attach(client, reference, file) {
    const name = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-180);
    const objectPath = `public-rfq/${reference}/${crypto.randomUUID()}-${name}`;
    const upload = await client.storage.from('rfq-files').upload(objectPath, file, { upsert: false, contentType: file.type || 'application/octet-stream' });
    if (upload.error) throw upload.error;
    const registration = await client.rpc('register_enquiry_attachment', { p_enquiry_id: reference, p_object_path: objectPath, p_original_name: file.name, p_mime_type: file.type || null, p_file_size: file.size });
    if (registration.error) throw registration.error;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || recorded) return;
    if (form.querySelector('[name="hp_contact_ref"]')?.value) { notice('Thank you. Your message has been received.'); return; }
    const phone = form.querySelector('[name="phone"]')?.value.trim() || '';
    const email = form.querySelector('[name="email"]')?.value.trim() || '';
    if (!phone && !email) {
      notice('Please provide a phone number or email address so we can reply.', true);
      form.querySelector('[name="email"]')?.focus();
      return;
    }
    let files;
    try { files = filesToUpload(); }
    catch (error) { notice(error.message, true); return; }
    pending = true;
    if (submit) { submit.disabled = true; submit.textContent = 'Submitting…'; }
    notice('Sending your requirement…');
    const data = Object.fromEntries(new FormData(form));
    const requirement = type === 'general' ? 'General Enquiry' : data.requirement_type || 'Other';
    const fields = { material:'Material / Grade', machine_model:'Machine / Model / Part', dimensions:'Dimensions / Specification', target_date:'Target Date', location:'Location', cad_software:'CAD / Input Format', deliverables:'Required Deliverables', piping_scope:'Piping Scope / Standard', revision_scope:'Revision / Existing Drawing Scope' };
    const details = Object.entries(fields).filter(([name]) => data[name]).map(([name, label]) => `${label}: ${data[name]}`);
    const message = [data.subject ? `Subject: ${data.subject}` : '', data.message || '', ...details].filter(Boolean).join('\n');
    const summary = ['Hello Crecer Grande', `Name: ${data.name || ''}`, `Company: ${data.company || ''}`, `Phone: ${phone}`, `Email: ${email}`, `Requirement: ${requirement}`, data.quantity ? `Quantity: ${data.quantity}` : '', message].filter(Boolean).join('\n');
    const whatsapp = 'https://wa.me/916291001781?text=' + encodeURIComponent(summary);
    const mail = 'mailto:crecergrande@outlook.com?subject=' + encodeURIComponent('Website RFQ - ' + requirement) + '&body=' + encodeURIComponent(summary);
    let reference = null, attached = 0, failed = false;
    try {
      const config = window.CG_CONFIG || {};
      const client = window.CG_SUPABASE || (window.supabase && config.supabaseUrl && config.supabasePublishableKey ? window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey) : null);
      if (!client) throw new Error('Service unavailable');
      window.CG_SUPABASE = client;
      const ids = window.CGVisitorIds ? window.CGVisitorIds() : ['', ''];
      const result = await client.rpc('submit_enquiry', { p_name:data.name || null, p_company:data.company || null, p_phone:phone || null, p_email:email || null, p_requirement_type:requirement, p_product_id:null, p_variant_id:null, p_quantity:data.quantity || null, p_message:message || null, p_source:type === 'general' ? 'website-contact' : type === 'design' ? 'website-design-rfq' : 'website-rfq', p_visitor_id:ids[0] || null, p_session_id:ids[1] || null });
      if (result.error || typeof result.data?.enquiry_id !== 'string' || !result.data.enquiry_id.trim() || result.data.ok === false) throw new Error('No confirmation received');
      recorded = true;
      reference = result.data.enquiry_id || null;
      if (files.length && !reference) throw new Error('Attachment reference missing');
      for (const file of files) { await attach(client, reference, file); attached++; }
      window.CGTrack?.(type === 'general' ? 'contact_submit' : type === 'design' ? 'design_rfq_submit' : 'rfq_submit', { requirement_type:requirement, attachments:attached });
    } catch (_) { failed = true; }
    finally {
      pending = false;
      if (submit) { submit.disabled = recorded; submit.textContent = recorded ? 'Requirement recorded' : submitLabel; }
    }
    if (recorded) {
      const identifier = reference ? ` — Ref. ${String(reference).slice(0, 8).toUpperCase()}` : '';
      notice(`Requirement recorded${identifier}.${attached ? ` ${attached} reference file${attached === 1 ? '' : 's'} attached securely.` : ''}${failed ? ` Some reference files may not have been attached (${attached} of ${files.length} uploaded). Please contact us with the missing files; your requirement has already been recorded.` : ''}`, failed);
      continuation('Continue on WhatsApp →', 'https://wa.me/916291001781?text=' + encodeURIComponent(summary + (reference ? '\nEnquiry reference: ' + reference : '')), true);
      const another = document.createElement('button');
      another.type = 'button'; another.className = 'cg-new-enquiry'; another.textContent = 'Start another enquiry';
      another.addEventListener('click', () => { form.reset(); recorded = false; status.replaceChildren(); if (submit) { submit.disabled = false; submit.textContent = submitLabel; } form.querySelector('[name="name"]')?.focus(); });
      status.append(document.createTextNode(' '), another);
    } else {
      notice('We could not confirm that your enquiry was recorded. Please retry or send the requirement directly. Files are not sent automatically by WhatsApp or email.', true);
      continuation('Continue on WhatsApp', whatsapp, true);
      continuation('Email Crecer Grande', mail);
    }
  });
});
