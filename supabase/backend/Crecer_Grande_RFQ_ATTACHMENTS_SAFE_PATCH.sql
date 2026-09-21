-- Crecer Grande RFQ / CAD attachment backend patch
-- Safe, rerunnable patch for the current public RFQ and 3D CAD upload frontend.
-- Uploaded customer files remain private; no public read policy is created.

begin;

create table if not exists public.enquiry_attachments (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  object_path text not null unique,
  original_name text not null,
  mime_type text,
  file_size bigint,
  uploaded_at timestamptz not null default now()
);

alter table public.enquiry_attachments enable row level security;

drop policy if exists cg_v29_enquiry_attachments_admin_read on public.enquiry_attachments;
create policy cg_v29_enquiry_attachments_admin_read
on public.enquiry_attachments for select
to authenticated
using (public.has_permission('enquiries.view'));

drop policy if exists cg_v29_enquiry_attachments_admin_delete on public.enquiry_attachments;
create policy cg_v29_enquiry_attachments_admin_delete
on public.enquiry_attachments for delete
to authenticated
using (public.has_permission('enquiries.manage'));

insert into storage.buckets(id,name,public)
values ('rfq-files','rfq-files',false)
on conflict (id) do update set public=false;

drop policy if exists cg_v29_rfq_files_public_insert on storage.objects;
create policy cg_v29_rfq_files_public_insert
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id='rfq-files'
  and (storage.foldername(name))[1]='public-rfq'
  and coalesce((storage.foldername(name))[2],'') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and exists (
    select 1
    from public.enquiries e
    where e.id::text=(storage.foldername(name))[2]
  )
);

drop policy if exists cg_v29_rfq_files_admin_read on storage.objects;
create policy cg_v29_rfq_files_admin_read
on storage.objects for select
to authenticated
using (bucket_id='rfq-files' and public.has_permission('enquiries.view'));

drop policy if exists cg_v29_rfq_files_admin_delete on storage.objects;
create policy cg_v29_rfq_files_admin_delete
on storage.objects for delete
to authenticated
using (bucket_id='rfq-files' and public.has_permission('enquiries.manage'));

create or replace function public.submit_enquiry(
  p_name text default null,
  p_company text default null,
  p_phone text default null,
  p_email text default null,
  p_requirement_type text default null,
  p_product_id text default null,
  p_variant_id text default null,
  p_quantity text default null,
  p_message text default null,
  p_source text default 'website',
  p_visitor_id text default null,
  p_session_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_id uuid;
begin
  if coalesce(length(trim(p_name)),0) = 0 then
    raise exception 'Name is required';
  end if;
  if coalesce(length(trim(p_phone)),0) = 0
     and coalesce(length(trim(p_email)),0) = 0 then
    raise exception 'Phone or email is required';
  end if;

  insert into public.enquiries(
    submitted_at, name, company, phone, email,
    requirement_type, quantity, message, source,
    visitor_id, session_id, status
  ) values (
    now(),
    left(trim(p_name),150),
    nullif(left(trim(coalesce(p_company,'')),180),''),
    nullif(left(trim(coalesce(p_phone,'')),60),''),
    nullif(left(trim(coalesce(p_email,'')),180),''),
    nullif(left(trim(coalesce(p_requirement_type,'')),120),''),
    nullif(left(trim(coalesce(p_quantity,'')),120),''),
    nullif(left(trim(coalesce(p_message,'')),5000),''),
    nullif(left(trim(coalesce(p_source,'website')),80),''),
    nullif(left(trim(coalesce(p_visitor_id,'')),160),''),
    nullif(left(trim(coalesce(p_session_id,'')),160),''),
    'new'
  )
  returning id into v_id;

  return jsonb_build_object('ok',true,'enquiry_id',v_id);
end;
$$;

revoke all on function public.submit_enquiry(text,text,text,text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_enquiry(text,text,text,text,text,text,text,text,text,text,text,text) to anon, authenticated;

create or replace function public.register_enquiry_attachment(
  p_enquiry_id uuid,
  p_object_path text,
  p_original_name text,
  p_mime_type text default null,
  p_file_size bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, storage, auth, pg_temp
as $$
declare
  v_prefix text;
begin
  if p_enquiry_id is null then raise exception 'Enquiry ID is required'; end if;
  if not exists(select 1 from public.enquiries where id=p_enquiry_id) then
    raise exception 'Enquiry not found';
  end if;

  v_prefix := 'public-rfq/' || p_enquiry_id::text || '/';
  if coalesce(p_object_path,'') not like v_prefix || '%' then
    raise exception 'Attachment path does not match enquiry';
  end if;

  if not exists(
    select 1 from storage.objects
    where bucket_id='rfq-files' and name=p_object_path
  ) then
    raise exception 'Uploaded object not found';
  end if;

  insert into public.enquiry_attachments(
    enquiry_id,object_path,original_name,mime_type,file_size
  ) values (
    p_enquiry_id,
    left(p_object_path,1000),
    left(coalesce(nullif(trim(p_original_name),''),'attachment'),300),
    nullif(left(coalesce(p_mime_type,''),200),''),
    case when p_file_size is not null and p_file_size>=0 then p_file_size else null end
  )
  on conflict(object_path) do update set
    enquiry_id=excluded.enquiry_id,
    original_name=excluded.original_name,
    mime_type=excluded.mime_type,
    file_size=excluded.file_size;

  return jsonb_build_object('ok',true);
end;
$$;

revoke all on function public.register_enquiry_attachment(uuid,text,text,text,bigint) from public;
grant execute on function public.register_enquiry_attachment(uuid,text,text,text,bigint) to anon, authenticated;

commit;
