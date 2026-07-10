-- ============================================================================
-- Migration: 0004_lesson_audio.sql
-- افزودن ستون صوت تلاوت قاری به جدول lessons + ساخت باکت عمومی Storage
-- ============================================================================

alter table lessons add column if not exists audio_url text;
comment on column lessons.audio_url is
  'آدرس عمومی فایل صوتی تلاوت قاری برای این درس (در باکت lesson-audio).';

-- باکت عمومی برای صوت دروس (بر خلاف recitations که خصوصی و مخصوص هر دانش‌آموز است)
insert into storage.buckets (id, name, public)
values ('lesson-audio', 'lesson-audio', true)
on conflict (id) do nothing;

-- فقط ادمین اجازهٔ آپلود/جایگزینی صوت دروس را دارد؛ خواندن چون باکت public است نیاز به پالیسی ندارد
create policy "admin_upload_lesson_audio"
on storage.objects for insert
with check (
  bucket_id = 'lesson-audio'
  and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "admin_update_lesson_audio"
on storage.objects for update
using (
  bucket_id = 'lesson-audio'
  and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
