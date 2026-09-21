-- אחריות+ · שלב 8 · מיגרציה 2: 19 הטבלאות, הקשרים והאינדקסים (docs/07-data-design.md §3, §4, §10)
-- השמות הטכניים לא השתנו ב־PRD 1.1: הטבלה appliances והעמודה room; בממשק «מוצר» ו«מיקום».

-- ---------- 2. plans (טבלת עזר, נכתבת במיגרציה) ----------
create table public.plans (
  id text primary key,
  name text not null,
  rank smallint not null unique,
  price_monthly integer not null check (price_monthly >= 0),
  price_annual integer not null check (price_annual >= 0),
  scans_per_month integer not null check (scans_per_month >= 0),
  max_properties integer not null check (max_properties >= 1),
  max_invitees integer check (max_invitees >= 0),           -- ריק = ללא הגבלה
  invitees_viewer_only boolean not null,
  service_message boolean not null
);

-- ---------- 1. profiles ----------
-- האימייל, הסיסמה, Google, האימות וההשבתה ב־auth.users (§7)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 60),
  last_name text not null default '' check (char_length(last_name) <= 60),
  phone text check (char_length(phone) <= 30),
  reminder_90 boolean not null default true,
  reminder_30 boolean not null default true,
  reminder_7 boolean not null default true,
  active_space_id uuid,                                      -- המפתח הזר נוסף אחרי spaces
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 3. subscriptions ----------
create table public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  plan_id text not null default 'free' references public.plans (id) on delete restrict,
  billing public.billing_period,
  renews_at date,
  cancel_at date,                                            -- מנוי שבוטל מסתיים כאן (FR-6.3)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- חינם ⇔ בלי תקופת חיוב ובלי חידוש
  constraint subscriptions_free_has_no_billing check (
    (plan_id = 'free' and billing is null and renews_at is null)
    or (plan_id <> 'free' and billing is not null and renews_at is not null)
  )
);

-- ---------- 4. spaces ----------
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  type public.space_type not null,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- החלק שלפני @ בכתובת העברת החשבוניות (FR-9.1): 8 תווים בלי אותיות מבלבלות
  forwarding_local text not null unique
    default private.random_code(8, 'abcdefghjkmnpqrstuvwxyz23456789')
    check (forwarding_local ~ '^[a-hjkmnp-z2-9]{8}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_active_space_id_fkey
  foreign key (active_space_id) references public.spaces (id) on delete set null;

-- ---------- 7. properties ----------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_space_name_key unique (space_id, name),
  -- כדי שמוצר ובחירת נכס יפנו לנכס באותו מרחב בלבד
  constraint properties_id_space_key unique (id, space_id)
);

-- ---------- 5. space_members (טבלת צומת) ----------
create table public.space_members (
  space_id uuid not null references public.spaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null,
  active_property_id uuid,                                   -- הסינון לפי נכס (FR-7.4)
  joined_at timestamptz not null default now(),
  primary key (space_id, user_id),
  constraint space_members_active_property_fkey
    foreign key (active_property_id, space_id) references public.properties (id, space_id)
    on delete set null (active_property_id)
);

-- ---------- 6. invites ----------
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  -- 6 תווים בלי 0/O/1/I (FR-1.5)
  code text not null unique
    default private.random_code(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
    check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  role public.member_role not null,
  invited_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- ---------- 8. appliances (בממשק: «מוצר») ----------
create table public.appliances (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  property_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  category public.appliance_category not null default 'other',
  room public.room not null default 'other',
  brand text check (char_length(brand) <= 60),
  model text check (char_length(model) <= 60),
  serial text check (char_length(serial) <= 60),
  purchase_date date,                                        -- ריק = «תאריך לא ידוע»; לא בעתיד (טריגר)
  warranty_months integer not null check (warranty_months between 1 and 600),
  warranty_source public.date_source not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- נכס באותו מרחב. no action ולא restrict: מחיקת נכס עם מוצרים נחסמת (FR-7.2),
  -- אבל מחיקת מרחב שלם (שרשרת) עוברת, כי הבדיקה נעשית בסוף הפקודה
  constraint appliances_property_fkey
    foreign key (property_id, space_id) references public.properties (id, space_id)
    on delete no action
);

-- ---------- 11. documents ----------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  appliance_id uuid not null references public.appliances (id) on delete cascade,
  type public.document_type not null,
  -- המיקום בדלי הפרטי {space_id}/{appliance_id}/{document_id}, לא כתובת ציבורית (§8)
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 200),
  mime_type text not null check (mime_type = 'application/pdf' or mime_type like 'image/%'),
  size_bytes integer not null check (size_bytes between 1 and 10485760),  -- עד 10MB
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_id_appliance_key unique (id, appliance_id)
);

-- ---------- 9. extended_warranties (1 ל־0..1) ----------
create table public.extended_warranties (
  appliance_id uuid primary key references public.appliances (id) on delete cascade,
  provider text not null check (char_length(btrim(provider)) between 1 and 80),
  start_date date not null,
  end_date date not null,
  source public.date_source not null,
  certificate_document_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint extended_warranties_dates_check check (end_date > start_date),     -- FR-3.3
  -- התעודה שייכת לאותו מוצר; כשהיא נמחקת, רק ההפניה מתרוקנת
  constraint extended_warranties_certificate_fkey
    foreign key (certificate_document_id, appliance_id) references public.documents (id, appliance_id)
    on delete set null (certificate_document_id)
);

-- ---------- 10. contacts ----------
-- «לפחות טלפון או אימייל» נאכף בטופס בלבד: המוכר שנקרא מהחשבונית נשמר גם עם שם בלבד (FR-3.5)
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  appliance_id uuid not null references public.appliances (id) on delete cascade,
  type public.contact_type not null,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  phone text check (char_length(phone) <= 30),
  email text check (char_length(email) <= 120),
  website text check (char_length(website) <= 200),
  note text check (char_length(note) <= 200),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_appliance_type_key unique (appliance_id, type)          -- אחד לכל סוג
);

-- ראשי אחד לכל מוצר
create unique index contacts_one_primary_idx on public.contacts (appliance_id) where is_primary;

-- ---------- 12. notifications ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  kind public.notification_kind not null,
  tone public.notification_tone not null,
  text text not null,
  target_path text not null check (target_path like '/%'),
  appliance_id uuid references public.appliances (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,          -- לא מוצג למי שביצע (FR-5.7)
  recipient_id uuid references public.profiles (id) on delete cascade,       -- ריק = לכל החברים (FR-9.3)
  created_at timestamptz not null default now()
);

-- ---------- 13. notification_reads (טבלת צומת) ----------
create table public.notification_reads (
  notification_id uuid not null references public.notifications (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

-- ---------- 14. scans (גם מכסת הסריקות) ----------
create table public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  space_id uuid references public.spaces (id) on delete set null,            -- מחיקת מרחב לא מחזירה סריקות
  source public.scan_source not null,
  status public.scan_status not null,
  storage_path text,
  result jsonb,
  created_at timestamptz not null default now()
);

-- ---------- 15. inbox_items ----------
create table public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  file_name text not null check (char_length(file_name) between 1 and 200),
  mime_type text not null check (mime_type = 'application/pdf' or mime_type like 'image/%'),
  storage_path text not null unique,
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  status public.inbox_status not null,
  scan_id uuid references public.scans (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- 16. reminder_deliveries ----------
create table public.reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  appliance_id uuid not null references public.appliances (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  stage smallint not null check (stage in (90, 30, 7)),
  coverage_end date not null,                                -- תאריך ששונה = מחזור חדש
  status public.delivery_status not null,
  attempts integer not null default 0 check (attempts >= 0),
  last_attempt_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  -- כל מדרגה נשלחת פעם אחת (FR-5.1)
  constraint reminder_deliveries_once_key unique (appliance_id, user_id, stage, coverage_end)
);

-- ---------- 17. contact_messages ----------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  email text not null check (char_length(email) <= 120 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  subject public.contact_subject not null,
  message text not null check (char_length(btrim(message)) between 1 and 2000),
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- 18. cancellation_requests ----------
create table public.cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) between 1 and 80),
  email text not null check (char_length(email) <= 120 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text check (char_length(phone) <= 30),
  user_id uuid references public.profiles (id) on delete set null,          -- נמצא לפי האימייל, בשרת
  status public.request_status not null default 'received',
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- ---------- 19. auth_lockouts ----------
create table public.auth_lockouts (
  email text primary key check (email = lower(email)),
  failed_attempts smallint not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,                                  -- 5 דקות אחרי הכישלון החמישי (FR-1.2)
  updated_at timestamptz not null default now()
);

-- ---------- אינדקסים (§10, ומפתח זר בלי אינדקס = סריקה מלאה במחיקה) ----------
create index profiles_active_space_id_idx on public.profiles (active_space_id);
create index subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index spaces_owner_id_idx on public.spaces (owner_id);
create index space_members_user_id_idx on public.space_members (user_id);
create index space_members_active_property_idx on public.space_members (active_property_id, space_id);
create index invites_space_id_idx on public.invites (space_id);
create index invites_invited_by_idx on public.invites (invited_by);
create index appliances_space_property_idx on public.appliances (space_id, property_id);
create index appliances_property_space_idx on public.appliances (property_id, space_id);
create index appliances_created_by_idx on public.appliances (created_by);
create index documents_appliance_id_idx on public.documents (appliance_id);
create index documents_uploaded_by_idx on public.documents (uploaded_by);
create index extended_warranties_certificate_idx on public.extended_warranties (certificate_document_id, appliance_id);
create index notifications_space_created_idx on public.notifications (space_id, created_at desc);
create index notifications_appliance_id_idx on public.notifications (appliance_id);
create index notifications_actor_id_idx on public.notifications (actor_id);
create index notifications_recipient_id_idx on public.notifications (recipient_id);
create index notification_reads_user_id_idx on public.notification_reads (user_id);
create index scans_user_succeeded_idx on public.scans (user_id, created_at) where status = 'succeeded';
create index scans_user_id_idx on public.scans (user_id);
create index scans_space_id_idx on public.scans (space_id);
create index inbox_items_space_id_idx on public.inbox_items (space_id);
create index inbox_items_sender_id_idx on public.inbox_items (sender_id);
create index inbox_items_scan_id_idx on public.inbox_items (scan_id);
create index reminder_deliveries_user_id_idx on public.reminder_deliveries (user_id);
create index contact_messages_user_id_idx on public.contact_messages (user_id);
create index cancellation_requests_user_id_idx on public.cancellation_requests (user_id);

-- ---------- updated_at ----------
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute function private.set_updated_at();
create trigger spaces_set_updated_at before update on public.spaces
  for each row execute function private.set_updated_at();
create trigger properties_set_updated_at before update on public.properties
  for each row execute function private.set_updated_at();
create trigger appliances_set_updated_at before update on public.appliances
  for each row execute function private.set_updated_at();
create trigger documents_set_updated_at before update on public.documents
  for each row execute function private.set_updated_at();
create trigger extended_warranties_set_updated_at before update on public.extended_warranties
  for each row execute function private.set_updated_at();
create trigger contacts_set_updated_at before update on public.contacts
  for each row execute function private.set_updated_at();
create trigger auth_lockouts_set_updated_at before update on public.auth_lockouts
  for each row execute function private.set_updated_at();
