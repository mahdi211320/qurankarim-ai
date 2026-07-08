# Edge Functions

چهار تابع Deno-based که با Supabase CLI دیپلوی می‌شوند.

## پیش‌نیاز: تنظیم Secretها

```bash
supabase secrets set OPENAI_API_KEY=sk-xxxxxxxx
```

`SUPABASE_URL`، `SUPABASE_ANON_KEY` و `SUPABASE_SERVICE_ROLE_KEY` به‌صورت خودکار
در محیط اجرای هر Edge Function توسط Supabase تزریق می‌شوند و نیازی به تنظیم دستی ندارند.

## دیپلوی

```bash
supabase functions deploy generate-quiz
supabase functions deploy grade-quiz
supabase functions deploy process-recitation
supabase functions deploy storage-manager
```

## باکت Storage مورد نیاز

قبل از استفاده از `process-recitation`، باکتی به نام `recitations` بسازید
(از پنل Supabase یا CLI) و سیاست دسترسی زیر را برای آن تنظیم کنید تا هر دانش‌آموز
فقط بتواند در پوشهٔ خودش آپلود کند:

```sql
create policy "students_upload_own_recitations"
on storage.objects for insert
with check (
  bucket_id = 'recitations'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

پیشنهاد ساختار مسیر فایل: `recitations/{student_id}/{lesson_id}/{timestamp}.webm`

## توابع

| تابع | ورودی | توضیح |
|---|---|---|
| `generate-quiz` | `{ lesson_id, student_id }` | تولید ۵ سؤال چندگزینه‌ای + ۲ تشریحی با GPT-4o |
| `grade-quiz` | `{ quiz_id, student_answers }` | تصحیح خودکار (MCQ محلی، تشریحی با GPT-4o) |
| `process-recitation` | `{ audio_path, lesson_id, student_id }` | رونویسی با Whisper + محاسبهٔ شباهت |
| `storage-manager` | `{ action: 'usage' \| 'cleanup-preview' \| 'cleanup' }` | فقط ادمین؛ گزارش و پاک‌سازی فضا |

## تست محلی

```bash
supabase functions serve generate-quiz --env-file ./supabase/.env.local
```
