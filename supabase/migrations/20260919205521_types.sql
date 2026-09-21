-- אחריות+ · שלב 8 · מיגרציה 1: סכמה פרטית, 16 ה־enum ופונקציות בסיס (docs/07-data-design.md §2)
-- הרשימות הסגורות של PRD §5.6. התוויות בעברית נשארות בקוד (src/data/lists.js);
-- בקוד המזהים עם מקף (small-kitchen), במסד עם קו תחתון (small_kitchen).

-- פונקציות העזר של ה־RLS והטריגרים גרות בסכמה שלא נחשפת ב־API
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create type public.space_type as enum ('family', 'business');
create type public.member_role as enum ('full', 'viewer');

-- 19/09/2026 (PRD 1.1): כל קנייה עם אחריות. «אחר» אחרון
create type public.appliance_category as enum (
  'fridge', 'laundry', 'dishwasher', 'oven', 'small_kitchen', 'ac', 'tv', 'computer', 'vacuum',
  'home_systems', 'furniture', 'car', 'e_mobility', 'camera', 'tools', 'baby', 'sport', 'other'
);

-- בממשק: «מיקום»
create type public.room as enum (
  'kitchen', 'living', 'bedroom', 'laundry_room', 'bathroom', 'office', 'kids_room', 'outdoor', 'parking', 'other'
);

create type public.date_source as enum ('invoice', 'certificate', 'manual', 'estimated');
create type public.contact_type as enum ('seller', 'importer', 'installer');
create type public.document_type as enum ('invoice', 'warranty', 'installation', 'other');
create type public.billing_period as enum ('monthly', 'annual');
create type public.notification_kind as enum ('warranty', 'space');
create type public.notification_tone as enum ('soon', 'member', 'added', 'error', 'inbox');
create type public.scan_source as enum ('photo', 'pdf', 'label', 'email');
create type public.scan_status as enum ('succeeded', 'unreadable', 'unavailable', 'quota_exceeded');
create type public.inbox_status as enum ('ready', 'unreadable', 'waiting');
create type public.delivery_status as enum ('sent', 'failed');
create type public.contact_subject as enum ('account', 'bug', 'billing', 'privacy', 'other');
create type public.request_status as enum ('received', 'processed');

-- updated_at מתעדכן בכל עדכון, גם כשהלקוח לא שולח אותו
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- קוד אקראי חזק (pgcrypto): קוד הזמנה (FR-1.5) וכתובת העברת החשבוניות (FR-9.1).
-- אלפבית של 32 תווים = בלי הטיה במודולו. security definer: ברירת מחדל של עמודה רצה בהרשאות המשתמש
create or replace function private.random_code(p_length integer, p_alphabet text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_bytes bytea := extensions.gen_random_bytes(p_length);
  v_size integer := char_length(p_alphabet);
  v_code text := '';
begin
  for i in 0 .. p_length - 1 loop
    v_code := v_code || substr(p_alphabet, (get_byte(v_bytes, i) % v_size) + 1, 1);
  end loop;
  return v_code;
end;
$$;

revoke all on function private.set_updated_at() from public;
revoke all on function private.random_code(integer, text) from public;
grant execute on function private.random_code(integer, text) to authenticated;
