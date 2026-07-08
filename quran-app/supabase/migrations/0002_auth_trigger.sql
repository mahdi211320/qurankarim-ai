-- ============================================================================
-- Migration: 0002_auth_trigger.sql
-- ایجاد خودکار ردیف profiles هنگام ثبت‌نام کاربر جدید در auth.users
-- نقش و نام کامل از raw_user_meta_data (که هنگام signUp ارسال می‌شود) خوانده می‌شود.
-- ============================================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'student'),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'کاربر جدید')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- توجه: نقش «admin» عمداً از طریق signUp عمومی قابل انتخاب نیست (این محدودیت در
-- فرانت‌اند src/pages/auth/Signup.jsx اعمال شده)؛ حساب ادمین باید دستی در دیتابیس
-- یا با آپدیت مستقیم ستون role توسط یک ادمین موجود ساخته شود:
--   update profiles set role = 'admin' where id = '<user-uuid>';
