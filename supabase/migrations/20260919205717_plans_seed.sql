-- אחריות+ · שלב 8 · מיגרציה 5: שלוש התוכניות (PRD §6, docs/07-data-design.md §3.2)
-- הערכים כמו בקוד היום (src/data/lists.js, src/data/site.js). המחירים ייבחנו מחדש (החלטת רפאל, 19/09/2026):
-- שינוי = מיגרציה חדשה, לא עריכה של הקובץ הזה.

insert into public.plans
  (id, name, rank, price_monthly, price_annual, scans_per_month, max_properties, max_invitees, invitees_viewer_only, service_message)
values
  ('free', 'חינם', 0, 0, 0, 5, 1, 1, true, false),
  ('pro', 'פרו', 1, 19, 149, 40, 3, null, false, true),
  ('manager', 'פרו לניהול נכסים', 2, 59, 590, 100, 10, null, false, true);
