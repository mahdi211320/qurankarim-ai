-- ============================================================================
-- Migration: 0003_add_national_id.sql
-- افزودن ستون کد ملی برای استفاده به‌عنوان «نام کاربری» ورود دانش‌آموز
-- (رمز عبور پیش‌فرض همچنان همان student_code باقی می‌ماند)
-- ============================================================================

alter table students
  add column if not exists national_id text unique;

create index if not exists idx_students_national_id on students (national_id);

comment on column students.national_id is
  'کد ملی دانش‌آموز؛ به‌عنوان شناسهٔ ورود (username) استفاده می‌شود. رمز عبور پیش‌فرض = student_code.';
