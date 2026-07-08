-- ============================================================================
-- دستیار آموزشی قرآن متوسطه اول
-- Migration: 0001_init.sql
-- شامل: جداول اصلی، Row Level Security، ایندکس‌ها و داده نمونه
-- اجرا: کپی کامل این فایل در Supabase SQL Editor و اجرا (Run)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0) Extensions & Enums
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- برای gen_random_uuid()

do $$ begin
  create type user_role as enum ('admin', 'teacher', 'student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type progress_status as enum ('not_started', 'in_progress', 'completed');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 1) profiles
--    پروفایل عمومی هر کاربر، مستقیماً متصل به auth.users
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        user_role not null default 'student',
  full_name   text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2) teachers
-- ----------------------------------------------------------------------------
create table if not exists teachers (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null unique references profiles (id) on delete cascade,
  bio             text,
  specialization  text,
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3) classes
--    grade_level به‌صورت smallint (7/8/9) نگه‌داشته می‌شود تا مقایسه‌های عددی
--    (مثل محدودیت ترم) ساده و بدون تبدیل نوع باقی بماند.
-- ----------------------------------------------------------------------------
create table if not exists classes (
  id             uuid primary key default gen_random_uuid(),
  teacher_id     uuid not null references teachers (id) on delete cascade,
  class_name     text not null,
  grade_level    smallint not null check (grade_level in (7, 8, 9)),
  academic_year  text not null default to_char(now(), 'YYYY'),
  access_code    text not null unique default upper(substr(md5(random()::text), 1, 6)),
  created_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4) students
-- ----------------------------------------------------------------------------
create table if not exists students (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null unique references profiles (id) on delete cascade,
  class_id      uuid references classes (id) on delete set null,
  student_code  text not null unique,
  parent_phone  text,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5) lessons
--    محتوای هر درس. متن دقیق کتاب درسی رسمی باید توسط ادمین/معلم وارد شود؛
--    ردیف نمونهٔ زیر صرفاً برای تست ساختار جدول است (بخش «داده نمونه»).
-- ----------------------------------------------------------------------------
create table if not exists lessons (
  id                   uuid primary key default gen_random_uuid(),
  grade_level          smallint not null check (grade_level in (7, 8, 9)),
  lesson_number        smallint not null check (lesson_number > 0),
  title                text not null,
  quran_text_arabic    text not null,
  translation_fa       text not null,
  activity_1_text      text not null,
  activity_2_text      text not null,
  activity_3_text      text not null,
  daily_reading_text   text,
  is_term1_limited     boolean not null default true,
  order_index          smallint not null default 0,
  created_at           timestamptz not null default now(),
  unique (grade_level, lesson_number)
);

-- ----------------------------------------------------------------------------
-- 6) student_progress
-- ----------------------------------------------------------------------------
create table if not exists student_progress (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid not null references students (id) on delete cascade,
  lesson_id          uuid not null references lessons (id) on delete cascade,
  act1_done          boolean not null default false,
  act2_done          boolean not null default false,
  act3_done          boolean not null default false,
  quiz_score         numeric(5, 2) check (quiz_score between 0 and 100),
  recitation_score   numeric(5, 2) check (recitation_score between 0 and 100),
  status             progress_status not null default 'not_started',
  completed_at       timestamptz,
  updated_at         timestamptz not null default now(),
  unique (student_id, lesson_id)
);

-- ----------------------------------------------------------------------------
-- 7) audio_recordings
--    فایل صوتی تلاوت دانش‌آموز و نتیجهٔ تحلیل Whisper
-- ----------------------------------------------------------------------------
create table if not exists audio_recordings (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid not null references students (id) on delete cascade,
  lesson_id          uuid not null references lessons (id) on delete cascade,
  audio_url          text not null,
  whisper_transcript text,
  similarity_score   numeric(5, 2) check (similarity_score between 0 and 100),
  ai_feedback        text,
  duration_seconds   integer check (duration_seconds >= 0),
  created_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8) ai_generated_quizzes
--    آزمون تولیدشده توسط GPT-4o برای هر درس + پاسخ‌های دانش‌آموز
--    questions:        [{ "type": "mcq"|"short", "question": "...", "options": [...], "answer": "..." }, ...]
--    student_answers:  [{ "question_index": 0, "answer": "..." }, ...]
-- ----------------------------------------------------------------------------
create table if not exists ai_generated_quizzes (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references students (id) on delete cascade,
  lesson_id        uuid not null references lessons (id) on delete cascade,
  questions        jsonb not null,
  student_answers  jsonb,
  final_score      numeric(5, 2) check (final_score between 0 and 100),
  created_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9) bookmarks
-- ----------------------------------------------------------------------------
create table if not exists bookmarks (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students (id) on delete cascade,
  lesson_id   uuid not null references lessons (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (student_id, lesson_id)
);

-- ============================================================================
-- ایندکس‌ها برای کوئری‌های پرتکرار
-- ============================================================================
create index if not exists idx_teachers_profile_id          on teachers (profile_id);
create index if not exists idx_classes_teacher_id            on classes (teacher_id);
create index if not exists idx_classes_grade_level           on classes (grade_level);
create index if not exists idx_students_profile_id           on students (profile_id);
create index if not exists idx_students_class_id             on students (class_id);
create index if not exists idx_lessons_grade_lesson          on lessons (grade_level, lesson_number);
create index if not exists idx_progress_student_id           on student_progress (student_id);
create index if not exists idx_progress_lesson_id            on student_progress (lesson_id);
create index if not exists idx_progress_status               on student_progress (status);
create index if not exists idx_audio_student_lesson          on audio_recordings (student_id, lesson_id);
create index if not exists idx_audio_created_at              on audio_recordings (created_at desc);
create index if not exists idx_quizzes_student_lesson        on ai_generated_quizzes (student_id, lesson_id);
create index if not exists idx_bookmarks_student_id          on bookmarks (student_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles              enable row level security;
alter table teachers              enable row level security;
alter table classes               enable row level security;
alter table students              enable row level security;
alter table lessons               enable row level security;
alter table student_progress      enable row level security;
alter table audio_recordings      enable row level security;
alter table ai_generated_quizzes  enable row level security;
alter table bookmarks             enable row level security;

-- ----------------------------------------------------------------------------
-- توابع کمکی (security definer تا در policyها بدون بازگشتی‌شدن RLS قابل استفاده باشند)
-- ----------------------------------------------------------------------------
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function current_student_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from students where profile_id = auth.uid();
$$;

-- آیا کاربر جاری معلم کلاسی است که این دانش‌آموز در آن عضو است؟
create or replace function is_teacher_of_student(target_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from students s
    join classes c  on c.id = s.class_id
    join teachers t on t.id = c.teacher_id
    where s.id = target_student_id
      and t.profile_id = auth.uid()
  );
$$;

-- آیا کاربر جاری معلمِ صاحب این کلاس است؟
create or replace function is_owner_teacher(target_class_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from classes c
    join teachers t on t.id = c.teacher_id
    where c.id = target_class_id and t.profile_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());

create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_own_or_admin" on profiles
  for update using (id = auth.uid() or is_admin());

-- ----------------------------------------------------------------------------
-- teachers
-- ----------------------------------------------------------------------------
create policy "teachers_select_own_or_admin" on teachers
  for select using (profile_id = auth.uid() or is_admin());

create policy "teachers_write_admin_only" on teachers
  for insert with check (is_admin());

create policy "teachers_update_own_or_admin" on teachers
  for update using (profile_id = auth.uid() or is_admin());

-- ----------------------------------------------------------------------------
-- classes: معلم فقط کلاس‌های خودش را می‌بیند/می‌سازد/ویرایش می‌کند؛ ادمین همه؛
--          دانش‌آموزِ عضو کلاس هم می‌تواند اطلاعات کلاس خودش را بخواند.
-- ----------------------------------------------------------------------------
create policy "classes_select_owner_member_or_admin" on classes
  for select using (
    is_admin()
    or teacher_id in (select id from teachers where profile_id = auth.uid())
    or id in (select class_id from students where profile_id = auth.uid())
  );

create policy "classes_insert_own_teacher" on classes
  for insert with check (teacher_id in (select id from teachers where profile_id = auth.uid()));

create policy "classes_update_owner_or_admin" on classes
  for update using (
    is_admin() or teacher_id in (select id from teachers where profile_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- students: خود دانش‌آموز، معلمِ کلاسش، یا ادمین
-- ----------------------------------------------------------------------------
create policy "students_select_self_teacher_or_admin" on students
  for select using (
    profile_id = auth.uid()
    or is_admin()
    or is_owner_teacher(class_id)
  );

create policy "students_insert_own" on students
  for insert with check (profile_id = auth.uid() or is_admin());

create policy "students_update_self_or_admin" on students
  for update using (profile_id = auth.uid() or is_admin());

-- ----------------------------------------------------------------------------
-- lessons: خواندن برای همهٔ کاربران احرازهویت‌شده آزاد است؛ نوشتن فقط ادمین
-- ----------------------------------------------------------------------------
create policy "lessons_select_authenticated" on lessons
  for select using (auth.role() = 'authenticated');

create policy "lessons_admin_all" on lessons
  for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- student_progress: دانش‌آموز فقط رکورد خودش را می‌خواند/می‌نویسد؛
--                    معلمِ کلاسش فقط می‌خواند؛ ادمین همه‌کاره است.
-- ----------------------------------------------------------------------------
create policy "progress_select_self_teacher_or_admin" on student_progress
  for select using (
    student_id = current_student_id()
    or is_admin()
    or is_teacher_of_student(student_id)
  );

create policy "progress_insert_self" on student_progress
  for insert with check (student_id = current_student_id());

create policy "progress_update_self_or_admin" on student_progress
  for update using (student_id = current_student_id() or is_admin());

-- ----------------------------------------------------------------------------
-- audio_recordings: دانش‌آموز فقط فایل‌های خودش؛ معلم فقط می‌خواند؛ ادمین همه
-- ----------------------------------------------------------------------------
create policy "audio_select_self_teacher_or_admin" on audio_recordings
  for select using (
    student_id = current_student_id()
    or is_admin()
    or is_teacher_of_student(student_id)
  );

create policy "audio_insert_self" on audio_recordings
  for insert with check (student_id = current_student_id());

-- ----------------------------------------------------------------------------
-- ai_generated_quizzes: مشابه audio_recordings
-- ----------------------------------------------------------------------------
create policy "quizzes_select_self_teacher_or_admin" on ai_generated_quizzes
  for select using (
    student_id = current_student_id()
    or is_admin()
    or is_teacher_of_student(student_id)
  );

create policy "quizzes_insert_self" on ai_generated_quizzes
  for insert with check (student_id = current_student_id());

create policy "quizzes_update_self" on ai_generated_quizzes
  for update using (student_id = current_student_id());

-- ----------------------------------------------------------------------------
-- bookmarks: کاملاً خصوصی برای هر دانش‌آموز
-- ----------------------------------------------------------------------------
create policy "bookmarks_select_own" on bookmarks
  for select using (student_id = current_student_id() or is_admin());

create policy "bookmarks_insert_own" on bookmarks
  for insert with check (student_id = current_student_id());

create policy "bookmarks_delete_own" on bookmarks
  for delete using (student_id = current_student_id());

-- ============================================================================
-- Trigger: هم‌گام‌سازی خودکار وضعیت (status) و completed_at در student_progress
-- وقتی هر سه فعالیت انجام شد و نمرهٔ آزمون بالای ۷۰ باشد، درس «completed» می‌شود.
-- ============================================================================
create or replace function sync_progress_status()
returns trigger language plpgsql as $$
begin
  if new.act1_done and new.act2_done and new.act3_done and coalesce(new.quiz_score, 0) >= 70 then
    new.status := 'completed';
    if new.completed_at is null then
      new.completed_at := now();
    end if;
  elsif new.act1_done or new.act2_done or new.act3_done then
    new.status := 'in_progress';
  else
    new.status := 'not_started';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_sync_progress_status on student_progress;
create trigger trg_sync_progress_status
  before insert or update on student_progress
  for each row execute function sync_progress_status();

-- ============================================================================
-- داده نمونه (Seed data)
-- پایه هفتم - درس اول: سوره یوسف - بخش اول (آیات ۱ تا ۳)
-- توجه: متن عربی، وحی قرآنی و بدون حق نشر است. ترجمهٔ فارسی و متن فعالیت‌ها
-- به‌صورت ساده و اصیل برای این پروژه نوشته شده و صرفاً نمونه است؛ محتوای
-- نهایی باید توسط دبیر/کارشناس برنامه‌ریزی درسی بازبینی و جایگزین شود.
-- ============================================================================
insert into lessons (
  grade_level, lesson_number, title,
  quran_text_arabic, translation_fa,
  activity_1_text, activity_2_text, activity_3_text,
  daily_reading_text, is_term1_limited, order_index
) values (
  7, 1, 'سوره یوسف - بخش اول',

  $q$الٓر ۚ تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ
إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ
نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ بِمَا أَوْحَيْنَا إِلَيْكَ هَـٰذَا الْقُرْآنَ وَإِن كُنتَ مِن قَبْلِهِ لَمِنَ الْغَافِلِينَ$q$,

  $q$الف، لام، را؛ این است نشانه‌های کتابی روشنگر.
ما آن را قرآنی به زبان عربی فرو فرستادیم، باشد که بیندیشید.
ما بهترین داستان را با وحی‌کردن همین قرآن بر تو بازگو می‌کنیم، هرچند پیش از آن از غافلان بودی.$q$,

  'فعالیت ۱ (درک معنا): دانش‌آموز با کمک واژه‌نامهٔ کتاب، معنای واژه‌های کلیدی «الکتاب المبین»، «قرآنا عربیا» و «أحسن القصص» را می‌یابد و در یک جملهٔ ساده توضیح می‌دهد که به نظر او چرا این سوره «بهترین داستان» نامیده شده است.',

  'فعالیت ۲ (تمرین قرائت): دانش‌آموز آیات فوق را با رعایت مخارج حروف و مدّ‌های لازم، سه بار با صدای بلند تمرین می‌کند و سپس تلاوت خود را ضبط می‌کند تا با متن اصلی مقایسه شود.',

  'فعالیت ۳ (تدبر): دانش‌آموز دربارهٔ این پرسش می‌نویسد: چرا خداوند در همان آغاز سوره، داستان حضرت یوسف را «بهترین داستان‌ها» معرفی می‌کند؟ این ویژگی چه پیامی برای زندگی امروز ما دارد؟',

  'انس روزانه: تلاوت آیات ۱ تا ۳ سورهٔ یوسف را همراه با ترجمه، پیش از خواب یک بار برای اعضای خانواده بخوانید.',

  true, 1
)
on conflict (grade_level, lesson_number) do nothing;
