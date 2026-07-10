# راهنمای دیپلوی

## ۱) پیش‌نیازها
- حساب [Supabase](https://supabase.com) (پلن رایگان کافی برای شروع)
- حساب [Vercel](https://vercel.com) یا [Netlify](https://netlify.com)
- کلید API از [OpenAI](https://platform.openai.com) (دسترسی به GPT-4o و Whisper)
- Node.js نسخهٔ ۲۰ به بالا و Supabase CLI (`npm i -g supabase`)

## ۲) راه‌اندازی Supabase

```bash
supabase login
supabase link --project-ref <PROJECT_REF>

# اجرای مایگریشن‌های دیتابیس (به ترتیب)
supabase db push   # یا کپی‌کردن محتوای هر فایل supabase/migrations/*.sql در SQL Editor به ترتیب شماره

# ساخت باکت Storage برای فایل‌های تلاوت (از پنل Supabase یا CLI)
supabase storage create recitations --public=false

# تنظیم secret برای Edge Functionها
supabase secrets set OPENAI_API_KEY=sk-xxxxxxxx

# دیپلوی Edge Functionها
supabase functions deploy generate-quiz
supabase functions deploy grade-quiz
supabase functions deploy process-recitation
supabase functions deploy storage-manager
supabase functions deploy bulk-import-students
```

جزئیات بیشتر دربارهٔ سیاست دسترسی باکت Storage در `supabase/functions/README.md` آمده است.

## ۳) متغیرهای محیطی فرانت‌اند

فایل `.env` را بر اساس `.env.example` بسازید:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## ۴) دیپلوی روی Vercel

```bash
npm i -g vercel
vercel
```

- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- متغیرهای محیطی بالا را در تنظیمات پروژهٔ Vercel (Environment Variables) وارد کنید.
- فایل `vercel.json` (شامل rewrite برای SPA و هدرهای امنیتی) از قبل در پروژه موجود است.

## ۵) دیپلوی روی Netlify (جایگزین)

- Build Command: `npm run build`
- Publish Directory: `dist`
- یک فایل `_redirects` با محتوای `/* /index.html 200` برای پشتیبانی از SPA routing اضافه کنید.

## ۶) چک‌لیست پیش از انتشار نهایی

**احراز هویت**
- [ ] مایگریشن `0002_auth_trigger.sql` اجرا شده تا هنگام ثبت‌نام، ردیف `profiles` خودکار ساخته شود
- [ ] حساب ادمین دستی ساخته شده: ثبت‌نام عادی با نقش «معلم» یا «دانش‌آموز» و سپس
      `update profiles set role = 'admin' where id = '<uuid>';`
- [ ] دکمه‌های «ورود آزمایشی» در `src/pages/auth/Login.jsx` پیش از انتشار نهایی حذف یا پشت یک
      پرچم محیطی (مثلاً `import.meta.env.DEV`) محدود شوند، چون فقط برای پیش‌نمایش هستند

**دیتابیس و امنیت**
- [ ] همهٔ RLS Policyها روی جداول فعال و تست شده‌اند (`supabase/migrations/0001_init.sql`)
- [ ] کلید `SUPABASE_SERVICE_ROLE_KEY` فقط در Edge Functionها استفاده شده، نه در فرانت‌اند
- [ ] هدرهای امنیتی (CSP، X-Frame-Options و ...) در `vercel.json` بررسی و مطابق دامنهٔ نهایی به‌روزرسانی شده‌اند

**PWA**
- [ ] آیکن‌های واقعی برند در `public/icons/` جایگزین نمونه‌های فعلی شده‌اند
- [ ] `manifest` در `vite.config.js` (نام، رنگ‌ها، اسکرین‌شات‌ها) نهایی شده است
- [ ] نصب PWA روی حداقل یک دستگاه Android و یک iOS تست شده است

**عملکرد**
- [ ] `npm run build` بدون خطا اجرا می‌شود و حجم Bundle بررسی شده است
- [ ] Lighthouse Audit (Performance/PWA/Accessibility/SEO) اجرا و مشکلات اصلی رفع شده‌اند
- [ ] تصاویر/آیکن‌ها فشرده و در فرمت بهینه هستند

**آزمایش نهایی**
- [ ] `npm test` (تست‌های واحد) سبز است
- [ ] جریان‌های اصلی به‌صورت دستی تست شده‌اند: ورود → تکمیل فعالیت‌ها → ضبط تلاوت → آزمون → باز شدن درس بعد
- [ ] تست روی Chrome، Safari (iOS) و یک مرورگر اندروید انجام شده است
- [ ] نمایش RTL و فونت‌های فارسی/عربی روی همهٔ صفحات بررسی شده است

**مستندسازی**
- [ ] `README.md` به‌روز است
- [ ] راهنمای کاربر (معلم/دانش‌آموز/ادمین) در صورت نیاز تهیه شده است

## ۷) مانیتورینگ پس از انتشار

- لاگ Edge Functionها: `supabase functions logs <function-name>`
- مصرف Storage: از پنل ادمین برنامه (`/admin/storage`) یا Supabase Dashboard
- خطاهای فرانت‌اند: در نظر بگیرید ابزاری مثل Sentry به `ErrorBoundary.jsx` متصل کنید
