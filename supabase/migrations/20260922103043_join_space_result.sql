-- אחריות+ · שלב 8.4 · מיגרציה 8: join_space מחזיר את מה שמסך «הצטרפתם» צריך (O4, O5)
-- { status: 'joined', space_id, role, invited_by } · { status: 'member', space_id } · { status: 'invalid' }
-- קוד שגוי וקוד שפג תוקפו מחזירים אותו דבר (FR-1.4). כבר חבר → המרחב שלו, בלי שגיאה.

drop function if exists public.join_space(text);

create function public.join_space(p_code text)
returns jsonb
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
    return jsonb_build_object('status', 'invalid');
  end if;

  if exists (select 1 from public.space_members m where m.space_id = v_invite.space_id and m.user_id = v_user) then
    return jsonb_build_object('status', 'member', 'space_id', v_invite.space_id);
  end if;

  insert into public.space_members (space_id, user_id, role) values (v_invite.space_id, v_user, v_invite.role);
  delete from public.invites where id = v_invite.id;

  return jsonb_build_object(
    'status', 'joined',
    'space_id', v_invite.space_id,
    'role', v_invite.role,
    'invited_by', v_invite.invited_by
  );
end;
$$;

revoke all on function public.join_space(text) from public, anon;
grant execute on function public.join_space(text) to authenticated;
