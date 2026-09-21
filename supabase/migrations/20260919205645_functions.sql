-- אחריות+ · שלב 8 · מיגרציה 3: פונקציות העזר של ה־RLS, הטריגרים והפעולות בשרת (docs/07-data-design.md §6, §7, §10)
-- «הסתרת כפתור היא UX, לא הרשאה»: כל כלל עסקי שנאכף כאן נאכף גם כשמישהו קורא ל־API ישירות.
-- כלל משותף לטריגרי השמירה: שרת (בלי משתמש) ושרשרת של מחיקה (pg_trigger_depth() > 1) לא נבדקים.
-- שגיאות: מזהה באנגלית ב־message (למשל plan_limit_properties); הממשק מתרגם לעברית.

-- ---------- פונקציות עזר ל־RLS (security definer: לא נכנסות ללולאת RLS) ----------

create or replace function private.is_space_member(p_space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.space_members m
    where m.space_id = p_space_id and m.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_full_access(p_space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.space_members m
    where m.space_id = p_space_id and m.user_id = (select auth.uid()) and m.role = 'full'
  );
$$;

create or replace function private.space_owner(p_space_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.owner_id from public.spaces s where s.id = p_space_id;
$$;

create or replace function private.is_space_owner(p_space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.spaces s where s.id = p_space_id and s.owner_id = (select auth.uid())
  );
$$;

-- המרחב של מוצר: לאנשי הקשר, למסמכים ולאחריות המורחבת
create or replace function private.appliance_space(p_appliance_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select a.space_id from public.appliances a where a.id = p_appliance_id;
$$;

-- התוכנית בפועל: מנוי שבוטל חוזר לחינם כשמגיע cancel_at (FR-6.3)
create or replace function private.effective_plan(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select case
        when s.cancel_at is not null and s.cancel_at <= (now() at time zone 'Asia/Jerusalem')::date then 'free'
        else s.plan_id
      end
      from public.subscriptions s
      where s.user_id = p_user_id
    ),
    'free'
  );
$$;

-- המגבלות של מרחב = התוכנית של יוצר המרחב (§10)
create or replace function private.space_plan(p_space_id uuid)
returns public.plans
language sql
stable
security definer
set search_path = ''
as $$
  select p.* from public.plans p where p.id = private.effective_plan(private.space_owner(p_space_id));
$$;

-- ---------- הרשמה: פרופיל ומנוי חינם (§7) ----------

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_full text := btrim(coalesce(v_meta ->> 'full_name', v_meta ->> 'name', ''));
  v_first text;
  v_last text;
begin
  -- מההרשמה באימייל (first_name / last_name), או מ־Google (given_name / family_name / full_name)
  v_first := coalesce(
    nullif(btrim(v_meta ->> 'first_name'), ''),
    nullif(btrim(v_meta ->> 'given_name'), ''),
    split_part(v_full, ' ', 1)
  );
  v_last := coalesce(
    nullif(btrim(v_meta ->> 'last_name'), ''),
    nullif(btrim(v_meta ->> 'family_name'), ''),
    btrim(substr(v_full, char_length(split_part(v_full, ' ', 1)) + 2))
  );

  insert into public.profiles (id, first_name, last_name)
  values (new.id, left(coalesce(v_first, ''), 60), left(coalesce(v_last, ''), 60));

  insert into public.subscriptions (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------- מרחב חדש: היוצר בגישה מלאה, ונכס ראשון בשם המרחב (FR-7.1) ----------

create or replace function private.handle_new_space()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.space_members (space_id, user_id, role) values (new.id, new.owner_id, 'full');
  insert into public.properties (space_id, name) values (new.id, left(btrim(new.name), 40));
  return null;
end;
$$;

create trigger spaces_after_insert
  after insert on public.spaces
  for each row execute function private.handle_new_space();

-- ---------- profiles: מרחב פעיל = מרחב שהמשתמש חבר בו (FR-1.8) ----------

create or replace function private.guard_profiles()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if pg_trigger_depth() > 1 or (select auth.uid()) is null then
    return new;
  end if;
  if new.active_space_id is distinct from old.active_space_id
     and new.active_space_id is not null
     and not private.is_space_member(new.active_space_id) then
    raise exception 'not_a_member' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger profiles_guard
  before update on public.profiles
  for each row execute function private.guard_profiles();

-- ---------- space_members: תפקידים, עזיבה והסרה (FR-1.7) ----------

create or replace function private.guard_space_members()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_owner uuid;
begin
  if pg_trigger_depth() > 1 or v_user is null then
    return coalesce(new, old);
  end if;
  v_owner := private.space_owner(old.space_id);

  if tg_op = 'DELETE' then
    -- את יוצר המרחב אי אפשר להסיר, והוא גם לא עוזב: הוא מוחק את המרחב
    if old.user_id = v_owner then
      raise exception 'owner_cannot_leave' using errcode = 'P0001';
    end if;
    -- כל חבר יכול לעזוב; רק גישה מלאה מסירה אחרים
    if old.user_id <> v_user and not private.has_full_access(old.space_id) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
    return old;
  end if;

  if new.space_id <> old.space_id or new.user_id <> old.user_id or new.joined_at <> old.joined_at then
    raise exception 'immutable_membership' using errcode = 'P0001';
  end if;

  if new.role is distinct from old.role then
    if not private.has_full_access(old.space_id) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
    if old.user_id = v_owner then
      raise exception 'owner_role_locked' using errcode = 'P0001';
    end if;
  end if;

  -- הסינון לפי נכס הוא בחירה אישית (FR-7.4)
  if new.active_property_id is distinct from old.active_property_id and old.user_id <> v_user then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger space_members_guard
  before update or delete on public.space_members
  for each row execute function private.guard_space_members();

-- ---------- properties: מגבלת התוכנית, ולא למחוק את הנכס האחרון (FR-7.1, FR-7.2) ----------
-- נכס עם מוצרים נחסם על ידי המפתח הזר של appliances

create or replace function private.guard_properties()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_plan public.plans;
begin
  if pg_trigger_depth() > 1 or (select auth.uid()) is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    v_plan := private.space_plan(new.space_id);
    if (select count(*) from public.properties p where p.space_id = new.space_id) >= v_plan.max_properties then
      raise exception 'plan_limit_properties' using errcode = 'P0001';
    end if;
    return new;
  end if;

  if (select count(*) from public.properties p where p.space_id = old.space_id) <= 1 then
    raise exception 'last_property' using errcode = 'P0001';
  end if;
  return old;
end;
$$;

create trigger properties_guard
  before insert or delete on public.properties
  for each row execute function private.guard_properties();

-- ---------- invites: מגבלות התוכנית של יוצר המרחב (FR-1.5) ----------

create or replace function private.guard_invites()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_plan public.plans;
  v_used bigint;
begin
  if pg_trigger_depth() > 1 or (select auth.uid()) is null then
    return new;
  end if;

  new.invited_by := (select auth.uid());
  new.expires_at := now() + interval '7 days';
  v_plan := private.space_plan(new.space_id);

  -- בחינם: מוזמן אחד, בצפייה בלבד
  if v_plan.invitees_viewer_only and new.role <> 'viewer' then
    raise exception 'plan_viewer_only' using errcode = 'P0001';
  end if;

  if v_plan.max_invitees is not null then
    select
      (select count(*) from public.space_members m
        where m.space_id = new.space_id and m.user_id <> private.space_owner(new.space_id))
      + (select count(*) from public.invites i
        where i.space_id = new.space_id and i.expires_at > now())
    into v_used;
    if v_used >= v_plan.max_invitees then
      raise exception 'plan_limit_invitees' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

create trigger invites_guard
  before insert on public.invites
  for each row execute function private.guard_invites();

-- ---------- appliances: תאריך רכישה לא בעתיד (FR-2.8), ומי הוסיף ----------

create or replace function private.guard_appliances()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and (select auth.uid()) is not null then
    new.created_by := (select auth.uid());
  end if;
  if new.purchase_date is not null and new.purchase_date > (now() at time zone 'Asia/Jerusalem')::date then
    raise exception 'purchase_date_in_future' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger appliances_guard
  before insert or update on public.appliances
  for each row execute function private.guard_appliances();

-- ---------- documents: הקובץ בתיקייה של המוצר שלו (§8), ומי העלה ----------

create or replace function private.guard_documents()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_space uuid := private.appliance_space(new.appliance_id);
begin
  if v_space is null
     or new.storage_path not like v_space::text || '/' || new.appliance_id::text || '/%' then
    raise exception 'invalid_storage_path' using errcode = 'P0001';
  end if;
  if tg_op = 'INSERT' and (select auth.uid()) is not null then
    new.uploaded_by := (select auth.uid());
  end if;
  return new;
end;
$$;

create trigger documents_guard
  before insert or update on public.documents
  for each row execute function private.guard_documents();

-- ---------- פעולות שהלקוח קורא להן (RPC) ----------

-- הצטרפות עם קוד (FR-1.4): אותה הודעה לקוד שגוי ולקוד שפג תוקפו
create or replace function public.join_space(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_invite public.invites;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_invite
  from public.invites i
  where i.code = upper(replace(btrim(p_code), '-', '')) and i.expires_at > now()
  for update;

  if not found then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.space_members m where m.space_id = v_invite.space_id and m.user_id = v_user) then
    raise exception 'already_member' using errcode = 'P0001';
  end if;

  insert into public.space_members (space_id, user_id, role) values (v_invite.space_id, v_user, v_invite.role);
  delete from public.invites where id = v_invite.id;
  return v_invite.space_id;
end;
$$;

-- חברי המרחב עם השם בלבד (לא טלפון ולא העדפות): profiles עצמה פתוחה רק לבעליה
create or replace function public.get_space_members(p_space_id uuid)
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  role public.member_role,
  joined_at timestamptz,
  is_owner boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_space_member(p_space_id) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
    select m.user_id, p.first_name, p.last_name, m.role, m.joined_at, m.user_id = s.owner_id
    from public.space_members m
    join public.profiles p on p.id = m.user_id
    join public.spaces s on s.id = m.space_id
    where m.space_id = p_space_id
    order by m.joined_at;
end;
$$;

-- ---------- הרשאות הרצה ----------
-- ברירת המחדל של Postgres נותנת EXECUTE ל־public; כאן רק מי שצריך
revoke all on function private.is_space_member(uuid) from public;
revoke all on function private.has_full_access(uuid) from public;
revoke all on function private.space_owner(uuid) from public;
revoke all on function private.is_space_owner(uuid) from public;
revoke all on function private.appliance_space(uuid) from public;
revoke all on function private.effective_plan(uuid) from public;
revoke all on function private.space_plan(uuid) from public;
revoke all on function private.handle_new_user() from public;
revoke all on function private.handle_new_space() from public;
revoke all on function private.guard_profiles() from public;
revoke all on function private.guard_space_members() from public;
revoke all on function private.guard_properties() from public;
revoke all on function private.guard_invites() from public;
revoke all on function private.guard_appliances() from public;
revoke all on function private.guard_documents() from public;

-- המדיניות והטריגרים רצים בהרשאות המשתמש המחובר
grant execute on function private.is_space_member(uuid) to authenticated;
grant execute on function private.has_full_access(uuid) to authenticated;
grant execute on function private.space_owner(uuid) to authenticated;
grant execute on function private.is_space_owner(uuid) to authenticated;
grant execute on function private.appliance_space(uuid) to authenticated;
grant execute on function private.effective_plan(uuid) to authenticated;
grant execute on function private.space_plan(uuid) to authenticated;

revoke all on function public.join_space(text) from public, anon;
revoke all on function public.get_space_members(uuid) from public, anon;
grant execute on function public.join_space(text) to authenticated;
grant execute on function public.get_space_members(uuid) to authenticated;
