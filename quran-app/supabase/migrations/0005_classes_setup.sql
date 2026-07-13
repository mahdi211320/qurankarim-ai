-- ============================================================================
-- Migration: 0005_classes_setup.sql
-- ۱) ستون teacher_id در جدول classes را nullable می‌کند (تا ادمین بتواند کلاس
--    را قبل از تخصیص معلم بسازد)
-- ۲) یک Policy جدید برای اجازهٔ ساخت/ویرایش کلاس توسط ادمین اضافه می‌کند
-- ۳) ۱۲ کلاس واقعی (۴ هفتم + ۴ هشتم + ۴ نهم) را در دیتابیس درج می‌کند
-- ============================================================================

alter table classes alter column teacher_id drop not null;

create policy "classes_insert_admin" on classes
  for insert with check (is_admin());

-- درج ۱۲ کلاس واقعی (اگر با همین نام/پایه از قبل وجود نداشته باشند)
insert into classes (class_name, grade_level, academic_year)
select v.class_name, v.grade_level, '1404-1405'
from (values
  ('هفتم ۱', 7), ('هفتم ۲', 7), ('هفتم ۳', 7), ('هفتم ۴', 7),
  ('هشتم ۱', 8), ('هشتم ۲', 8), ('هشتم ۳', 8), ('هشتم ۴', 8),
  ('نهم ۱', 9), ('نهم ۲', 9), ('نهم ۳', 9), ('نهم ۴', 9)
) as v(class_name, grade_level)
where not exists (
  select 1 from classes c where c.class_name = v.class_name and c.grade_level = v.grade_level
);
