-- ברירת המחדל של Supabase נותנת הרשאת הרצה ל־anon ול־authenticated על כל פונקציה חדשה ב־public.
-- שתי הפונקציות האלה הן של השרת בלבד: בלי הביטול הזה, משתמש מחובר היה יכול לרשום סריקה בשם מישהו אחר.
revoke execute on function public.scan_context(uuid) from anon, authenticated;
revoke execute on function public.record_scan(uuid, uuid, uuid, public.scan_source, public.scan_status, text, jsonb) from anon, authenticated;
