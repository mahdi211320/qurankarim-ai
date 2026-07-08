// نرمال‌سازی متن عربی/فارسی برای مقایسه (حذف تشکیل، اعراب و علائم غیرضروری)
export function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // حذف اعراب و علائم تجویدی
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ی')
    .replace(/[^\p{L}\s]/gu, '') // حذف علائم نگارشی
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function levenshteinDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
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
 * درصد شباهت دو متن (۰ تا ۱۰۰) بر اساس فاصلهٔ لِوِنشتاین نرمال‌شده.
 * پیش از مقایسه، هر دو متن نرمال‌سازی می‌شوند تا تفاوت‌های ظاهری (اعراب و...) اثرگذار نباشند.
 */
export function calculateSimilarityScore(original: string, transcript: string): number {
  const a = normalizeArabicText(original)
  const b = normalizeArabicText(transcript)
  if (!a.length && !b.length) return 100
  const distance = levenshteinDistance(a, b)
  const maxLen = Math.max(a.length, b.length, 1)
  const similarity = (1 - distance / maxLen) * 100
  return Math.max(0, Math.round(similarity))
}

export function feedbackForScore(score: number): string {
  if (score >= 90) return 'عالی بود! تلفظ حروف و مدها بسیار دقیق ادا شد.'
  if (score >= 70) return 'خوب بود. چند کلمه با متن اصلی اندکی تفاوت داشت؛ کمی آرام‌تر تمرین کنید.'
  return 'نیاز به تمرین بیشتر دارید. بهتر است دوباره با دقت روی مخارج حروف تمرین کنید.'
}
