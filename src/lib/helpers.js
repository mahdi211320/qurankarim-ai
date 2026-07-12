// توابع کمکی مشترک در سراسر فرانت‌اند

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

/** تبدیل اعداد انگلیسی درون یک رشته/عدد به ارقام فارسی */
export function formatPersianNumber(num) {
  return String(num).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)])
}

/** فرمت تاریخ به شمسی با استفاده از Intl (بدون نیاز به کتابخانهٔ اضافه) */
export function formatDate(date, options = {}) {
  const d = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(d)
}

export function formatRelativeTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.round(diffMs / 60000)
  const rtf = new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' })

  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, 'minute')
  const diffHour = Math.round(diffMin / 60)
  if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, 'hour')
  const diffDay = Math.round(diffHour / 24)
  return rtf.format(-diffDay, 'day')
}

function normalizeArabicText(text) {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ی')
    .replace(/[^\p{L}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function levenshteinDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

/**
 * درصد شباهت دو متن (۰ تا ۱۰۰). نسخهٔ سمت کلاینت، هم‌ارز با
 * supabase/functions/_shared/similarity.ts (برای پیش‌نمایش قبل از ارسال به سرور).
 */
export function calculateSimilarity(text1, text2) {
  const a = normalizeArabicText(text1)
  const b = normalizeArabicText(text2)
  if (!a.length && !b.length) return 100
  const distance = levenshteinDistance(a, b)
  const maxLen = Math.max(a.length, b.length, 1)
  return Math.max(0, Math.round((1 - distance / maxLen) * 100))
}
