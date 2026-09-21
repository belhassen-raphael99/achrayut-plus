-- אחריות+ · שלב 8 · מיגרציה 6: שינוי תפקיד לגישה מלאה נבדק מול התוכנית (FR-1.5)
-- בחינם המוזמן בצפייה בלבד: גם העלאה ל־full אחרי ההצטרפות נחסמת, לא רק ההזמנה.

create or replace function private.guard_space_members()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_owner uuid;
  v_plan public.plans;
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
    v_plan := private.space_plan(old.space_id);
    if new.role = 'full' and v_plan.invitees_viewer_only then
      raise exception 'plan_viewer_only' using errcode = 'P0001';
    end if;
  end if;

  -- הסינון לפי נכס הוא בחירה אישית (FR-7.4)
  if new.active_property_id is distinct from old.active_property_id and old.user_id <> v_user then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.guard_space_members() from public;
