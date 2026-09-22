-- אחריות+ · נתוני הדוגמה במסד האמיתי (שלב 8, 22/09/2026) — אותו מצב כמו src/data/demoData.js של שלב 6
-- מריצים כ־postgres (MCP או SQL Editor). אפשר להריץ שוב: משתמשי הדוגמה נמחקים ונוצרים מחדש (בשרשרת).
-- התאריכים ביחס להיום, כדי שהמצבים יישארו נכונים (17 / 18 ב«משפחת לוי»).
-- הקבצים של המסמכים עולים בנפרד ל־Storage (TASK-PLAN.md, צעד 8.4 · נתוני דוגמה).
--
-- החשבונות (הסיסמה של כולם: Warranty2026):
--   noa@example.com — נועה לוי, יוצרת שני המרחבים, גישה מלאה, «פרו לניהול נכסים» שנתי
--   eyal@example.com — אייל לוי, צפייה בלבד ב«משפחת לוי»
--   new@example.com — רחל כהן, בלי מרחב. קוד ההזמנה שלה ל«משפחת לוי»: BLH4K2

do $$
declare
  noa uuid := '00000000-0000-4000-8000-00000000d001';
  eyal uuid := '00000000-0000-4000-8000-00000000d002';
  rachel uuid := '00000000-0000-4000-8000-00000000d003';
  levi uuid;
  rentals uuid;
  levi_home uuid;
  herzl uuid;
  eilat uuid;
  jaffa uuid;
  a uuid;
  washer uuid;
  fridge uuid;
  salon_ac uuid;
  d date := (now() at time zone 'Asia/Jerusalem')::date;
  r record;
  i int := 0;
begin
  -- ---------- איפוס ----------
  delete from auth.users where id in (noa, eyal, rachel);

  -- ---------- משתמשים (הטריגר יוצר פרופיל ומנוי חינם) ----------
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change)
  select '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
    extensions.crypt('Warranty2026', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', jsonb_build_object('first_name', u.first, 'last_name', u.last),
    now(), now(), '', '', '', ''
  from (values
    (noa, 'noa@example.com', 'נועה', 'לוי'),
    (eyal, 'eyal@example.com', 'אייל', 'לוי'),
    (rachel, 'new@example.com', 'רחל', 'כהן')
  ) as u(id, email, first, last);

  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select u.id::text, u.id, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now()
  from auth.users u where u.id in (noa, eyal, rachel);

  -- נועה: «פרו לניהול נכסים» שנתי, מתחדש בעוד 5 חודשים
  update public.subscriptions set plan_id = 'manager', billing = 'annual', renews_at = d + interval '5 months'
    where user_id = noa;

  -- ---------- מרחבים (הטריגר מוסיף את היוצרת ונכס ראשון בשם המרחב) ----------
  insert into public.spaces (name, type, owner_id) values ('משפחת לוי', 'family', noa) returning id into levi;
  insert into public.spaces (name, type, owner_id) values ('דירות להשכרה', 'business', noa) returning id into rentals;

  select id into levi_home from public.properties where space_id = levi;
  update public.properties set name = 'הרצל 12' where space_id = rentals returning id into herzl;
  insert into public.properties (space_id, name) values (rentals, 'אילת') returning id into eilat;
  insert into public.properties (space_id, name) values (rentals, 'יפו') returning id into jaffa;

  insert into public.space_members (space_id, user_id, role, joined_at) values (levi, eyal, 'viewer', now() - interval '8 days');
  update public.profiles set active_space_id = levi where id in (noa, eyal);

  -- ההזמנה של רחל, בצפייה בלבד
  insert into public.invites (space_id, code, role, invited_by, expires_at)
    values (levi, 'BLH4K2', 'viewer', noa, now() + interval '7 days');

  -- ---------- «משפחת לוי»: 18 מוצרים · 15 מוגנים, 2 מסתיימים בקרוב, 1 הסתיים ----------
  -- end = היום + ends_in; purchase_date = end − warranty_months
  for r in
    select * from (values
      ('lg-washer', 'מכונת כביסה LG', 'laundry', 'laundry_room', 'LG', 'F4WV709S1E', '304KWYR88192', interval '24 days', 12, 'invoice', 40),
      ('samsung-fridge', 'מקרר סמסונג', 'fridge', 'kitchen', 'Samsung', 'RB38T602DWW', 'SM0385520193', interval '11 months 10 days', 24, 'invoice', 9),
      ('bosch-oven', 'תנור בוש', 'oven', 'kitchen', 'Bosch', 'HBG635BS1', 'BS4471190028', interval '-3 months -5 days', 24, 'certificate', 11),
      ('lg-microwave', 'מיקרוגל LG', 'small_kitchen', 'kitchen', 'LG', 'MS23', null, interval '5 months 10 days', 12, 'estimated', 13),
      ('salon-ac', 'מזגן סלון', 'ac', 'living', 'תדיראן', 'Alpha Pro 140', null, interval '61 days', 36, 'invoice', 10),
      ('lg-tv', 'טלוויזיה LG', 'tv', 'living', 'LG', 'OLED55C4', '410RMXX77231', interval '3 months 15 days', 24, 'certificate', 12),
      ('bosch-dishwasher', 'מדיח כלים בוש', 'dishwasher', 'kitchen', 'Bosch', 'SMS6ECI07E', null, interval '14 months', 24, 'invoice', 60),
      ('electra-dryer', 'מייבש כביסה אלקטרה', 'laundry', 'laundry_room', 'Electra', 'TD7800', null, interval '-2 months', 12, 'invoice', 75),
      ('induction-hob', 'כיריים אינדוקציה', 'oven', 'kitchen', 'Bosch', 'PIE631FB1E', null, interval '8 months', 24, 'invoice', 90),
      ('bedroom-ac', 'מזגן חדר שינה', 'ac', 'bedroom', 'אלקטרה', null, null, interval '24 months', 36, 'invoice', 100),
      ('living-sofa', 'ספה לסלון', 'furniture', 'living', 'ביתילי', null, null, interval '7 months', 12, 'invoice', 110),
      ('lenovo-laptop', 'מחשב נייד Lenovo', 'computer', 'office', 'Lenovo', 'ThinkPad E14', null, interval '10 months', 36, 'invoice', 120),
      ('samsung-phone', 'טלפון סמסונג', 'computer', 'other', 'Samsung', 'Galaxy S24', null, interval '6 months', 24, 'invoice', 130),
      ('dyson-vacuum', 'שואב אבק Dyson', 'vacuum', 'other', 'Dyson', 'V12', null, interval '16 months', 24, 'invoice', 140),
      ('coffee-machine', 'מכונת קפה נספרסו', 'small_kitchen', 'kitchen', 'Nespresso', 'Vertuo', null, interval '9 months', 24, 'invoice', 150),
      ('freezer', 'מקפיא אלקטרולוקס', 'fridge', 'laundry_room', 'Electrolux', null, null, interval '4 months', 24, 'invoice', 160),
      ('water-heater', 'דוד חשמל', 'home_systems', 'bathroom', 'כרומגן', null, null, interval '30 months', 60, 'invoice', 170),
      ('family-car', 'טויוטה קורולה', 'car', 'parking', 'Toyota', 'Corolla Hybrid', null, interval '26 months', 36, 'invoice', 180)
    ) as t(key, name, category, room, brand, model, serial, ends_in, months, source, added_days_ago)
  loop
    insert into public.appliances (space_id, property_id, name, category, room, brand, model, serial,
      purchase_date, warranty_months, warranty_source, created_by, created_at)
    values (levi, levi_home, r.name, r.category::public.appliance_category, r.room::public.room, r.brand, r.model, r.serial,
      (d + r.ends_in - make_interval(months => r.months))::date, r.months, r.source::public.date_source,
      noa, now() - make_interval(days => r.added_days_ago))
    returning id into a;

    if r.key = 'lg-washer' then
      washer := a;
      insert into public.contacts (appliance_id, type, name, phone, email, note, is_primary) values
        (a, 'importer', 'LG ישראל', '1-800-000-000', 'service@example.com', 'שירות לקוחות', true),
        (a, 'seller', 'מחסני חשמל', '09-000-0000', null, 'סניף רעננה', false),
        (a, 'installer', 'אבי', '050-000-0000', null, 'התקין את המכונה', false);
    elsif r.key = 'samsung-fridge' then
      fridge := a;
      insert into public.contacts (appliance_id, type, name, phone, note, is_primary) values
        (a, 'importer', 'סמסונג ישראל', '1-800-000-001', null, true),
        (a, 'seller', 'מחסני חשמל', '09-000-0000', 'סניף רעננה', false);
    elsif r.key = 'bosch-oven' then
      insert into public.contacts (appliance_id, type, name, phone, note, is_primary) values
        (a, 'importer', 'BSH ישראל', '1-800-000-002', null, true),
        (a, 'seller', 'מחסני חשמל', '09-000-0000', 'סניף רעננה', false);
    elsif r.key = 'lg-microwave' then
      insert into public.contacts (appliance_id, type, name, phone, is_primary) values
        (a, 'seller', 'מחסני חשמל', '09-000-0000', true);
    elsif r.key = 'salon-ac' then
      salon_ac := a;
      insert into public.contacts (appliance_id, type, name, phone, is_primary) values
        (a, 'installer', 'אבי', '050-000-0000', true),
        (a, 'importer', 'תדיראן', '1-800-000-003', false);
    elsif r.key = 'lg-tv' then
      insert into public.contacts (appliance_id, type, name, phone, is_primary) values
        (a, 'importer', 'LG ישראל', '1-800-000-000', true);
    elsif r.key = 'electra-dryer' then
      -- האחריות הרגילה הסתיימה, והמורחבת מכסה: התו סופר עד סוף המורחבת (FR-3.3)
      insert into public.extended_warranties (appliance_id, provider, start_date, end_date, source)
        values (a, 'מחסני חשמל', (d - interval '2 months')::date, (d + interval '22 months')::date, 'certificate');
    end if;
  end loop;

  -- ---------- «דירות להשכרה»: 19 מוצרים בשלושה נכסים; «תנור» בהרצל 12 בתאריך לא ידוע (F4) ----------
  for r in
    select * from (values
      ('herzl', 'מזגן', 'ac', 'living', 'תדיראן', 20),
      ('herzl', 'מקרר', 'fridge', 'kitchen', 'Samsung', 14),
      ('herzl', 'מכונת כביסה', 'laundry', 'laundry_room', 'Bosch', 9),
      ('herzl', 'טלוויזיה', 'tv', 'living', 'LG', 7),
      ('herzl', 'מדיח כלים', 'dishwasher', 'kitchen', 'Bosch', 11),
      ('herzl', 'מיקרוגל', 'small_kitchen', 'kitchen', 'LG', 5),
      ('herzl', 'תנור', 'oven', 'kitchen', 'Electrolux', null),
      ('eilat', 'מזגן', 'ac', 'bedroom', 'אלקטרה', 26),
      ('eilat', 'מקרר', 'fridge', 'kitchen', 'LG', 18),
      ('eilat', 'מכונת כביסה', 'laundry', 'laundry_room', 'Samsung', 13),
      ('eilat', 'טלוויזיה', 'tv', 'living', 'Samsung', 16),
      ('eilat', 'שואב אבק', 'vacuum', 'other', 'Dyson', 8),
      ('eilat', 'מכונת קפה', 'small_kitchen', 'kitchen', 'Nespresso', 6),
      ('eilat', 'מדיח כלים', 'dishwasher', 'kitchen', 'Electrolux', 15),
      ('jaffa', 'מזגן', 'ac', 'living', 'תדיראן', 30),
      ('jaffa', 'מקרר', 'fridge', 'kitchen', 'Beko', 12),
      ('jaffa', 'כיריים', 'oven', 'kitchen', 'Bosch', 9),
      ('jaffa', 'טלוויזיה', 'tv', 'living', 'TCL', 21),
      ('jaffa', 'נתב Wi-Fi', 'computer', 'office', 'TP-Link', 4)
    ) as t(property, name, category, room, brand, ends_in_months)
  loop
    insert into public.appliances (space_id, property_id, name, category, room, brand,
      purchase_date, warranty_months, warranty_source, created_by, created_at)
    values (rentals,
      case r.property when 'herzl' then herzl when 'eilat' then eilat else jaffa end,
      r.name, r.category::public.appliance_category, r.room::public.room, r.brand,
      case when r.ends_in_months is null then null
           else (d + make_interval(months => r.ends_in_months) - interval '36 months')::date end,
      36, 'invoice', noa, now() - make_interval(days => 20 + i * 3))
    returning id into a;

    -- בלי חשבונית ובלי תאריך: רק המתקין ידוע (F4)
    if r.ends_in_months is null then
      insert into public.contacts (appliance_id, type, name, phone, is_primary) values (a, 'installer', 'אבי', '050-000-0000', true);
    end if;
    i := i + 1;
  end loop;

  -- ---------- «ממתינות לבדיקה» (FR-9): PDF עם כמה מוצרים שמוכן לבדיקה, ותמונה שלא נקראה ----------
  insert into public.inbox_items (space_id, sender_id, file_name, mime_type, storage_path, size_bytes, status, created_at) values
    (levi, noa, 'חשבונית-מחסני-חשמל.pdf', 'application/pdf', levi || '/demo-inbox-pdf', 184320, 'ready', now() - interval '1 day'),
    (levi, noa, 'scan0042.jpg', 'image/jpeg', levi || '/demo-inbox-blurry', 402112, 'unreadable', now() - interval '3 days');

  -- ---------- התראות: במקום אלה שהטריגרים יצרו בזמן הזריעה, ההתראות של שלב 6 ----------
  delete from public.notifications where space_id in (levi, rentals);

  insert into public.notifications (space_id, kind, tone, text, target_path, appliance_id, actor_id, recipient_id, created_at) values
    (levi, 'space', 'inbox', 'חשבונית שהעברתם במייל מחכה לבדיקה', '/settings/forwarding', null, null, noa, now() - interval '1 day'),
    (levi, 'warranty', 'soon', 'האחריות על מכונת הכביסה LG מסתיימת בעוד 30 ימים', '/appliances/' || washer, washer, null, null, now() - interval '6 days'),
    (levi, 'space', 'member', 'אייל לוי · הצטרפות למרחב עם צפייה בלבד', '/members', null, eyal, null, now() - interval '8 days'),
    (levi, 'space', 'added', 'מקרר סמסונג נוסף למרחב', '/appliances/' || fridge, fridge, null, null, now() - interval '9 days'),
    (levi, 'warranty', 'error', 'לא הצלחנו לשלוח תזכורת במייל. ננסה שוב מחר.', '/appliances/' || salon_ac, salon_ac, null, null, now() - interval '12 days');

  -- מה שכבר נקרא בשלב 6
  insert into public.notification_reads (notification_id, user_id)
  select n.id, x.user_id
  from public.notifications n
  join (values ('אייל לוי · הצטרפות למרחב עם צפייה בלבד', noa),
               ('מקרר סמסונג נוסף למרחב', noa),
               ('מקרר סמסונג נוסף למרחב', eyal),
               ('לא הצלחנו לשלוח תזכורת במייל. ננסה שוב מחר.', noa)) as x(text, user_id)
    on x.text = n.text
  where n.space_id = levi;
end $$;
