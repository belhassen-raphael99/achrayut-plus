-- אחריות+ · צעד 8.5: קריאת החשבונית בשרת (FR-2.3, FR-2.4)
-- הדלי הזמני של הסריקות, בדיקת המכסה ורישום הסריקה.
-- הכתיבה ל־scans נעשית רק דרך service_role, כלומר רק מה־Edge Function: הדפדפן לא יכול לזייף מכסה.

-- ---------- 1. דלי הסריקות (docs/07 §8): פרטי, {user_id}/{scan_id} ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'scans', 'scans', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do nothing;

-- בדלי הזה התיקייה הראשונה בנתיב היא המשתמש עצמו, ולא המרחב
create or replace function private.object_owner(p_name text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select private.object_space(p_name);
$$;

create policy "scans bucket: owner reads" on storage.objects
  for select to authenticated
  using (bucket_id = 'scans' and private.object_owner(name) = (select auth.uid()));
create policy "scans bucket: owner uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'scans' and private.object_owner(name) = (select auth.uid()));
create policy "scans bucket: owner deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'scans' and private.object_owner(name) = (select auth.uid()));

-- ---------- 2. תחילת החודש בשעון ישראל: המכסה מתחדשת ב־1 בחודש (FR-2.3) ----------
create or replace function private.month_start()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select date_trunc('month', now() at time zone 'Asia/Jerusalem') at time zone 'Asia/Jerusalem';
$$;

-- ---------- 3. ההקשר של הקריאה: כמה סריקות נשארו ומה הקטגוריות המותרות (5.6) ----------
create or replace function public.scan_context(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'limit', p.scans_per_month,
    'used', (
      select count(*)
      from public.scans s
      where s.user_id = p_user_id
        and s.status = 'succeeded'
        and s.created_at >= private.month_start()
    ),
    'categories', (
      select jsonb_agg(e.enumlabel order by e.enumsortorder)
      from pg_catalog.pg_enum e
      join pg_catalog.pg_type t on t.oid = e.enumtypid
      where t.typname = 'appliance_category'
    )
  )
  from public.plans p
  where p.id = private.effective_plan(p_user_id);
$$;

-- ---------- 4. רישום הסריקה: רק קריאה מוצלחת נספרת, והמכסה נבדקת שוב כאן (FR-2.3) ----------
create or replace function public.record_scan(
  p_user_id uuid,
  p_scan_id uuid,
  p_space_id uuid,
  p_source public.scan_source,
  p_status public.scan_status,
  p_storage_path text,
  p_result jsonb
)
returns public.scan_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.scan_status := p_status;
  v_limit integer;
  v_used integer;
begin
  -- סורקים רק למרחב שיש בו גישה מלאה (FR-1.6)
  if p_space_id is not null and not exists (
    select 1 from public.space_members m
    where m.space_id = p_space_id and m.user_id = p_user_id and m.role = 'full'
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if v_status = 'succeeded' then
    select p.scans_per_month into v_limit
      from public.plans p
      where p.id = private.effective_plan(p_user_id);

    select count(*) into v_used
      from public.scans s
      where s.user_id = p_user_id
        and s.status = 'succeeded'
        and s.created_at >= private.month_start();

    if v_used >= v_limit then
      v_status := 'quota_exceeded';
    end if;
  end if;

  insert into public.scans (id, user_id, space_id, source, status, storage_path, result)
  values (
    p_scan_id, p_user_id, p_space_id, p_source, v_status, p_storage_path,
    case when v_status = 'succeeded' then p_result end
  )
  on conflict (id) do nothing;

  return v_status;
end;
$$;

-- ---------- 5. הרשאות: הדפדפן לא קורא לפונקציות האלה, רק השרת ----------
revoke all on function private.object_owner(text) from public;
revoke all on function private.month_start() from public;
revoke all on function public.scan_context(uuid) from public;
revoke all on function public.record_scan(uuid, uuid, uuid, public.scan_source, public.scan_status, text, jsonb) from public;

grant execute on function public.scan_context(uuid) to service_role;
grant execute on function public.record_scan(uuid, uuid, uuid, public.scan_source, public.scan_status, text, jsonb) to service_role;
