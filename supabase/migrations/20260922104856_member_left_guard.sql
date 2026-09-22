-- אחריות+ · שלב 8.4 · מיגרציה 9: התראת «עזיבת המרחב» לא נכתבת כשהמרחב או החשבון נמחקים
-- באג שנמצא בבדיקה (22/09/2026): מחיקת חשבון → המרחב נמחק בשרשרת → הטריגר ניסה לכתוב התראה
-- למרחב שכבר לא קיים (notifications_space_id_fkey). בטריגר AFTER, pg_trigger_depth לא מזהה את השרשרת,
-- ולכן בודקים שהמרחב והפרופיל עדיין קיימים.

create or replace function private.notify_member_left()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.user_id is distinct from (select auth.uid())
     or not exists (select 1 from public.spaces s where s.id = old.space_id)
     or not exists (select 1 from public.profiles p where p.id = old.user_id) then
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

revoke all on function private.notify_member_left() from public;
