-- אחריות+ · שלב 8 · מיגרציה 4: RLS והרשאות לפי עמודה (docs/07-data-design.md §6 · PRD §4)
-- anon = בלי התחברות · authenticated = משתמש מחובר · service_role = שרת (Edge Functions), עוקף RLS.
-- שתי שכבות: GRANT קובע אילו עמודות אפשר לכתוב, והמדיניות קובעת אילו שורות.

-- ---------- RLS בכל הטבלאות ----------
alter table public.plans enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.invites enable row level security;
alter table public.properties enable row level security;
alter table public.appliances enable row level security;
alter table public.documents enable row level security;
alter table public.extended_warranties enable row level security;
alter table public.contacts enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_reads enable row level security;
alter table public.scans enable row level security;
alter table public.inbox_items enable row level security;
alter table public.reminder_deliveries enable row level security;   -- שרת בלבד: בלי מדיניות
alter table public.contact_messages enable row level security;
alter table public.cancellation_requests enable row level security;
alter table public.auth_lockouts enable row level security;         -- שרת בלבד: בלי מדיניות

-- ---------- הרשאות: מתחילים מאפס, ופותחים רק מה שצריך ----------
revoke all on all tables in schema public from anon, authenticated;

grant usage on schema private to service_role;
grant execute on all functions in schema private to service_role;

grant select on public.plans to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (first_name, last_name, phone, reminder_90, reminder_30, reminder_7, active_space_id)
  on public.profiles to authenticated;

grant select on public.subscriptions to authenticated;

grant select, delete on public.spaces to authenticated;
grant insert (name, type) on public.spaces to authenticated;
grant update (name) on public.spaces to authenticated;

grant select, delete on public.space_members to authenticated;
grant update (role, active_property_id) on public.space_members to authenticated;

grant select, delete on public.invites to authenticated;
grant insert (space_id, role) on public.invites to authenticated;

grant select, delete on public.properties to authenticated;
grant insert (space_id, name) on public.properties to authenticated;
grant update (name) on public.properties to authenticated;

grant select, delete on public.appliances to authenticated;
grant insert (space_id, property_id, name, category, room, brand, model, serial, purchase_date, warranty_months, warranty_source)
  on public.appliances to authenticated;
grant update (property_id, name, category, room, brand, model, serial, purchase_date, warranty_months, warranty_source)
  on public.appliances to authenticated;

-- המזהה נקבע בדפדפן, כי הוא חלק מנתיב הקובץ שמועלה לפני השורה (§8)
grant select, delete on public.documents to authenticated;
grant insert (id, appliance_id, type, storage_path, file_name, mime_type, size_bytes) on public.documents to authenticated;
grant update (type, storage_path, file_name, mime_type, size_bytes) on public.documents to authenticated;

grant select, delete on public.extended_warranties to authenticated;
grant insert (appliance_id, provider, start_date, end_date, source, certificate_document_id)
  on public.extended_warranties to authenticated;
grant update (provider, start_date, end_date, source, certificate_document_id)
  on public.extended_warranties to authenticated;

grant select, delete on public.contacts to authenticated;
grant insert (appliance_id, type, name, phone, email, website, note, is_primary) on public.contacts to authenticated;
grant update (type, name, phone, email, website, note, is_primary) on public.contacts to authenticated;

grant select on public.notifications to authenticated;

grant select on public.notification_reads to authenticated;
grant insert (notification_id) on public.notification_reads to authenticated;

grant select on public.scans to authenticated;

grant select, delete on public.inbox_items to authenticated;

grant insert (name, email, subject, message, user_id) on public.contact_messages to anon, authenticated;
grant insert (full_name, email, phone) on public.cancellation_requests to anon, authenticated;

-- ---------- המדיניות ----------
-- (select auth.uid()) ולא auth.uid(): מחושב פעם אחת לשאילתה, לא לכל שורה

-- plans: כולם, גם בלי התחברות (S4)
create policy "plans: everyone reads" on public.plans
  for select to anon, authenticated using (true);

-- profiles: רק הבעלים. שמות של חברים — דרך get_space_members
create policy "profiles: owner reads" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles: owner updates" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- subscriptions: קריאה בלבד; שינוי, ביטול וחידוש בשרת (FR-6)
create policy "subscriptions: owner reads" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

-- spaces
create policy "spaces: members read" on public.spaces
  for select to authenticated
  using (owner_id = (select auth.uid()) or private.is_space_member(id));
create policy "spaces: anyone signed in creates their own" on public.spaces
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "spaces: owner renames" on public.spaces
  for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "spaces: owner deletes" on public.spaces
  for delete to authenticated using (owner_id = (select auth.uid()));

-- space_members: הצטרפות רק דרך join_space; הכללים הדקים בטריגר guard_space_members
create policy "space_members: members read" on public.space_members
  for select to authenticated using (private.is_space_member(space_id));
create policy "space_members: members update" on public.space_members
  for update to authenticated
  using (private.is_space_member(space_id)) with check (private.is_space_member(space_id));
create policy "space_members: leave or remove" on public.space_members
  for delete to authenticated
  using (user_id = (select auth.uid()) or private.has_full_access(space_id));

-- invites
create policy "invites: members read" on public.invites
  for select to authenticated using (private.is_space_member(space_id));
create policy "invites: full access creates" on public.invites
  for insert to authenticated with check (private.has_full_access(space_id));
create policy "invites: full access cancels" on public.invites
  for delete to authenticated using (private.has_full_access(space_id));

-- properties
create policy "properties: members read" on public.properties
  for select to authenticated using (private.is_space_member(space_id));
create policy "properties: full access creates" on public.properties
  for insert to authenticated with check (private.has_full_access(space_id));
create policy "properties: full access renames" on public.properties
  for update to authenticated
  using (private.has_full_access(space_id)) with check (private.has_full_access(space_id));
create policy "properties: full access deletes" on public.properties
  for delete to authenticated using (private.has_full_access(space_id));

-- appliances (מוצרים): צפייה בלבד רואה, גישה מלאה כותבת (PRD §4)
create policy "appliances: members read" on public.appliances
  for select to authenticated using (private.is_space_member(space_id));
create policy "appliances: full access creates" on public.appliances
  for insert to authenticated with check (private.has_full_access(space_id));
create policy "appliances: full access updates" on public.appliances
  for update to authenticated
  using (private.has_full_access(space_id)) with check (private.has_full_access(space_id));
create policy "appliances: full access deletes" on public.appliances
  for delete to authenticated using (private.has_full_access(space_id));

-- documents · extended_warranties · contacts: לפי המרחב של המוצר
create policy "documents: members read" on public.documents
  for select to authenticated using (private.is_space_member(private.appliance_space(appliance_id)));
create policy "documents: full access creates" on public.documents
  for insert to authenticated with check (private.has_full_access(private.appliance_space(appliance_id)));
create policy "documents: full access updates" on public.documents
  for update to authenticated
  using (private.has_full_access(private.appliance_space(appliance_id)))
  with check (private.has_full_access(private.appliance_space(appliance_id)));
create policy "documents: full access deletes" on public.documents
  for delete to authenticated using (private.has_full_access(private.appliance_space(appliance_id)));

create policy "extended_warranties: members read" on public.extended_warranties
  for select to authenticated using (private.is_space_member(private.appliance_space(appliance_id)));
create policy "extended_warranties: full access creates" on public.extended_warranties
  for insert to authenticated with check (private.has_full_access(private.appliance_space(appliance_id)));
create policy "extended_warranties: full access updates" on public.extended_warranties
  for update to authenticated
  using (private.has_full_access(private.appliance_space(appliance_id)))
  with check (private.has_full_access(private.appliance_space(appliance_id)));
create policy "extended_warranties: full access deletes" on public.extended_warranties
  for delete to authenticated using (private.has_full_access(private.appliance_space(appliance_id)));

create policy "contacts: members read" on public.contacts
  for select to authenticated using (private.is_space_member(private.appliance_space(appliance_id)));
create policy "contacts: full access creates" on public.contacts
  for insert to authenticated with check (private.has_full_access(private.appliance_space(appliance_id)));
create policy "contacts: full access updates" on public.contacts
  for update to authenticated
  using (private.has_full_access(private.appliance_space(appliance_id)))
  with check (private.has_full_access(private.appliance_space(appliance_id)));
create policy "contacts: full access deletes" on public.contacts
  for delete to authenticated using (private.has_full_access(private.appliance_space(appliance_id)));

-- notifications: חברי המרחב, לא מי שביצע (FR-5.7); עם נמען — רק הוא (FR-9.3)
create policy "notifications: members read" on public.notifications
  for select to authenticated
  using (
    private.is_space_member(space_id)
    and (recipient_id is null or recipient_id = (select auth.uid()))
    and (actor_id is null or actor_id <> (select auth.uid()))
  );

-- notification_reads: כל חבר מסמן לעצמו (FR-5.6)
create policy "notification_reads: owner reads" on public.notification_reads
  for select to authenticated using (user_id = (select auth.uid()));
create policy "notification_reads: owner marks visible notifications" on public.notification_reads
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.notifications n where n.id = notification_id)
  );

-- scans: המכסה של המשתמש (FR-2.3); הכתיבה בשרת
create policy "scans: owner reads" on public.scans
  for select to authenticated using (user_id = (select auth.uid()));

-- inbox_items: גישה מלאה בודקת ומוחקת (FR-9.2)
create policy "inbox_items: full access reads" on public.inbox_items
  for select to authenticated using (private.has_full_access(space_id));
create policy "inbox_items: full access deletes" on public.inbox_items
  for delete to authenticated using (private.has_full_access(space_id));

-- טפסים ציבוריים: שליחה בלבד, בלי קריאה (S6, S10)
create policy "contact_messages: anyone sends" on public.contact_messages
  for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
create policy "cancellation_requests: anyone sends" on public.cancellation_requests
  for insert to anon, authenticated
  with check (user_id is null and status = 'received' and processed_at is null);
