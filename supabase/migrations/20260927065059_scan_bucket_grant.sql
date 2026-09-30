-- מדיניות הדלי רצה בשם המשתמש, ולכן צריך הרשאת הרצה על העוזרת (כמו object_space)
grant execute on function private.object_owner(text) to authenticated;
