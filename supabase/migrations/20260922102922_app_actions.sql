-- אחריות+ · שלב 8.4 · מיגרציה 7: מה שהאפליקציה צריכה כדי לעבור לנתונים אמיתיים
-- התראות אוטומטיות (FR-5.7) · התוכנית של כל מרחב · פעולות בשרת (כתובת העברה, תוכנית, מחיקת חשבון) · דלי המסמכים (§8)

-- ---------- התראות מרחב (FR-5.7): נוצרות בשרת, ומוצגות לכל החברים חוץ ממי שביצע ----------

create or replace function private.role_label(p_role public.member_role)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_role when 'full' then 'גישה מלאה' else 'צפייה בלבד' end;
$$;

create or replace function private.person_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select nullif(btrim(p.first_name || ' ' || p.last_name), '') from public.profiles p where p.id = p_user_id;
$$;

-- מוצר חדש: «ספה · הרצל 12 נוסף למרחב» (שם הנכס רק כשיש יותר מנכס אחד, FR-7.3)
create or replace function private.notify_appliance_added()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_place text;
begin
  if (select count(*) from public.properties p where p.space_id = new.space_id) > 1 then
    select p.name into v_place from public.properties p where p.id = new.property_id;
  end if;

  insert into public.notifications (space_id, kind, tone, text, target_path, appliance_id, actor_id)
  values (
    new.space_id, 'space', 'added',
    coalesce(new.name || ' · ' || v_place, new.name) || ' נוסף למרחב',
    '/appliances/' || new.id, new.id, new.created_by
  );
  return null;
end;
$$;

create trigger appliances_notify_added
  after insert on public.appliances
  for each row execute function private.notify_appliance_added();

-- הצטרפות (לא יוצר המרחב, שנכנס בטריגר של המרחב החדש). ניסוח ברבים/שם עצם: בלי מין (docs/07 §10)
create or replace function private.notify_member_joined()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id = private.space_owner(new.space_id) then
    return null;
  end if;
  insert into public.notifications (space_id, kind, tone, text, target_path, actor_id)
  values (
    new.space_id, 'space', 'member',
    coalesce(private.person_name(new.user_id), 'חבר חדש') || ' · הצטרפות למרחב עם ' || private.role_label(new.role),
    '/members', new.user_id
  );
  return null;
end;
$$;

create trigger space_members_notify_joined
  after insert on public.space_members
  for each row execute function private.notify_member_joined();

-- עזיבה ביוזמת החבר עצמו (לא הסרה, ולא מחיקת מרחב או חשבון בשרשרת)
create or replace function private.notify_member_left()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if pg_trigger_depth() > 1 or old.user_id is distinct from (select auth.uid()) then
    return null;
  end if;
  insert into public.notifications (space_id, kind, tone, text, target_path, actor_id)
  values (
    old.space_id, 'space', 'member',
    coalesce(private.person_name(old.user_id), 'חבר') || ' · עזיבת המרחב',
    '/members', old.user_id
  );
  return null;
end;
$$;

create trigger space_members_notify_left
  after delete on public.space_members
  for each row execute function private.notify_member_left();

-- ---------- התוכנית של כל מרחב שלי = התוכנית של יוצר המרחב (FR-1.5, FR-7.1, P9) ----------
-- המנוי של אדם אחר פרטי (RLS), ולכן רק מזהה התוכנית חוזר, ורק למרחבים שהמשתמש חבר בהם
create or replace function public.my_space_plans()
returns table (space_id uuid, plan_id text)
language sql
stable
security definer
set search_path = ''
as $$
  select m.space_id, private.effective_plan(s.owner_id)
  from public.space_members m
  join public.spaces s on s.id = m.space_id
  where m.user_id = (select auth.uid());
$$;

-- ---------- «כתובת חדשה» להעברת חשבוניות (FR-9.1): גישה מלאה בלבד ----------
create or replace function public.regenerate_forwarding_address(p_space_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_local text;
begin
  if not private.has_full_access(p_space_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.spaces
    set forwarding_local = private.random_code(8, 'abcdefghjkmnpqrstuvwxyz23456789')
    where id = p_space_id
    returning forwarding_local into v_local;
  return v_local;
end;
$$;

-- ---------- התוכנית שלי (FR-6) ----------
-- ⚠️ תשלום מדומה, כמו בשלב 6: אין עדיין ספק תשלומים. כשיהיה, השינוי יעבור ל־webhook שלו בלבד.
create or replace function public.change_plan(p_plan_id text, p_billing public.billing_period)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Jerusalem')::date;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_plan_id = 'free' or not exists (select 1 from public.plans where id = p_plan_id) then
    raise exception 'invalid_plan' using errcode = 'P0001';
  end if;
  update public.subscriptions set
    plan_id = p_plan_id,
    billing = p_billing,
    renews_at = (case when p_billing = 'annual' then v_today + interval '12 months' else v_today + interval '1 month' end)::date,
    cancel_at = null
  where user_id = (select auth.uid());
end;
$$;

-- ביטול (P12): התוכנית פעילה עוד 3 ימי עסקים (בלי שישי ושבת), ואז חינם. שום דבר לא נמחק
create or replace function public.cancel_subscription()
returns date
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day date := (now() at time zone 'Asia/Jerusalem')::date;
  v_added int := 0;
begin
  while v_added < 3 loop
    v_day := v_day + 1;
    if extract(dow from v_day) not in (5, 6) then
      v_added := v_added + 1;
    end if;
  end loop;
  update public.subscriptions set cancel_at = v_day
    where user_id = (select auth.uid()) and plan_id <> 'free';
  return v_day;
end;
$$;

create or replace function public.resume_subscription()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.subscriptions set cancel_at = null where user_id = (select auth.uid());
$$;

-- ---------- מחיקת החשבון (P6, FR-1.9): הכול נמחק בשרשרת, כולל המרחבים שהמשתמש יצר ----------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  delete from auth.users where id = (select auth.uid());
end;
$$;

-- ---------- דלי המסמכים (§8): פרטי, תמונה או PDF עד 10MB, נתיב {space_id}/{appliance_id}/{document_id} ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents', 'documents', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do nothing;

-- המרחב = התיקייה הראשונה בנתיב
create or replace function private.object_space(p_name text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when split_part(p_name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(p_name, '/', 1)::uuid
  end;
$$;

create policy "documents bucket: members read" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and private.is_space_member(private.object_space(name)));
create policy "documents bucket: full access uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and private.has_full_access(private.object_space(name)));
create policy "documents bucket: full access replaces" on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and private.has_full_access(private.object_space(name)))
  with check (bucket_id = 'documents' and private.has_full_access(private.object_space(name)));
create policy "documents bucket: full access deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and private.has_full_access(private.object_space(name)));

-- ---------- הרשאות הרצה ----------
revoke all on function private.role_label(public.member_role) from public;
revoke all on function private.person_name(uuid) from public;
revoke all on function private.notify_appliance_added() from public;
revoke all on function private.notify_member_joined() from public;
revoke all on function private.notify_member_left() from public;
revoke all on function private.object_space(text) from public;
grant execute on function private.object_space(text) to authenticated, service_role;
grant execute on function private.role_label(public.member_role) to service_role;
grant execute on function private.person_name(uuid) to service_role;

revoke all on function public.my_space_plans() from public, anon;
revoke all on function public.regenerate_forwarding_address(uuid) from public, anon;
revoke all on function public.change_plan(text, public.billing_period) from public, anon;
revoke all on function public.cancel_subscription() from public, anon;
revoke all on function public.resume_subscription() from public, anon;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.my_space_plans() to authenticated;
grant execute on function public.regenerate_forwarding_address(uuid) to authenticated;
grant execute on function public.change_plan(text, public.billing_period) to authenticated;
grant execute on function public.cancel_subscription() to authenticated;
grant execute on function public.resume_subscription() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
