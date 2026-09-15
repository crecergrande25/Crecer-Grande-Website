-- Crecer Grande Website V2.3 — SAFE PATCH
-- Purpose: align the existing R4 backend content/settings with V2.3.
-- No tables are dropped. No auth users are changed. No passwords are touched.

begin;

-- Contact settings requested for V2.3.
update public.site_settings
set phone_primary = '7003301781',
    phone_secondary = '6291001781',
    phone_tertiary = null,
    whatsapp = '916291001781',
    email_primary = 'crecergrande@outlook.com',
    instagram_handle = 'crecer_grande',
    website_url = 'https://crecergrande.in/',
    updated_at = now();

-- Contact is now a general-contact page, separate from RFQ.
insert into public.page_content(
  page_slug, page_name, title, intro, body,
  seo_title, seo_description, canonical_url, published
) values (
  'contact','Contact','Talk to Crecer Grande.',
  'Use this page for general enquiries, contact details and direct communication. For commercial or technical job review, use the dedicated Request a Quote page.',
  '{}'::jsonb,
  'Contact Crecer Grande | Enquiries & Contact Details',
  'Contact Crecer Grande for general enquiries, company contact details, engineering support and industrial-services communication.',
  'https://crecergrande.in/contact.html',true
)
on conflict(page_slug) do update set
  page_name=excluded.page_name,
  title=excluded.title,
  intro=excluded.intro,
  seo_title=excluded.seo_title,
  seo_description=excluded.seo_description,
  canonical_url=excluded.canonical_url,
  published=true,
  updated_at=now();

-- Dedicated RFQ page.
insert into public.page_content(
  page_slug, page_name, title, intro, body,
  seo_title, seo_description, canonical_url, published
) values (
  'request-quote','Request a Quote','Share your requirement and we will route it correctly.',
  'Send a drawing, sample, photograph, machine issue, BOM, dimensions or simply the outcome you need. Crecer Grande will review the information and respond through the appropriate technical or commercial route.',
  '{}'::jsonb,
  'Request a Quote | Crecer Grande',
  'Request a quote from Crecer Grande for manufacturing, engineering design, machine maintenance, automation, industrial spares, inspection, ISO, laser services and tender support.',
  'https://crecergrande.in/request-quote.html',true
)
on conflict(page_slug) do update set
  page_name=excluded.page_name,
  title=excluded.title,
  intro=excluded.intro,
  seo_title=excluded.seo_title,
  seo_description=excluded.seo_description,
  canonical_url=excluded.canonical_url,
  published=true,
  updated_at=now();

-- Estimate page copy updated to the expanded V2.3 toolset. GST-total calculator is not part of V2.3.
insert into public.page_content(
  page_slug, page_name, title, intro, body,
  seo_title, seo_description, canonical_url, published
) values (
  'estimate','Estimate Tools','Industrial engineering calculators for quick planning.',
  'Use theoretical material-weight, nesting, bend, 3D-print, engineering unit-conversion and live currency-reference tools before sending an RFQ. Final drawings, process review and quotation prevail.',
  '{}'::jsonb,
  'Industrial Engineering Calculators | Crecer Grande',
  'Free industrial engineering calculators from Crecer Grande for material weight, nesting, bend allowance, 3D-print material, engineering unit conversion and live currency reference conversion.',
  'https://crecergrande.in/estimate.html',true
)
on conflict(page_slug) do update set
  page_name=excluded.page_name,
  title=excluded.title,
  intro=excluded.intro,
  seo_title=excluded.seo_title,
  seo_description=excluded.seo_description,
  canonical_url=excluded.canonical_url,
  published=true,
  updated_at=now();

commit;
