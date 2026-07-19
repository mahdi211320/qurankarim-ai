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

/**
 * تراز کلمه‌به‌کلمهٔ دو متن (با الگوریتم فاصلهٔ ویرایشی روی کلمات، نه حروف) تا
 * دقیقاً مشخص شود کدام کلمه‌ها جا افتاده، اضافه، یا اشتباه خوانده شده‌اند.
 */
export function findWordMistakes(
  original: string,
  transcript: string,
  maxMistakes = 6
): { type: 'substituted' | 'omitted' | 'extra'; expected?: string; said?: string }[] {
  const a = normalizeArabicText(original).split(' ').filter(Boolean)
  const b = normalizeArabicText(transcript).split(' ').filter(Boolean)

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

  // بازگشت از انتهای جدول برای استخراج نوع عملیات (تطبیق/جایگزینی/حذف/افزودن)
  const mistakes: { type: 'substituted' | 'omitted' | 'extra'; expected?: string; said?: string }[] = []
  let i = a.length
  let j = b.length
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      i--
      j--
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      mistakes.unshift({ type: 'substituted', expected: a[i - 1], said: b[j - 1] })
      i--
      j--
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      mistakes.unshift({ type: 'omitted', expected: a[i - 1] })
      i--
    } else {
      mistakes.unshift({ type: 'extra', said: b[j - 1] })
      j--
    }
  }

  return mistakes.slice(0, maxMistakes)
}

/**
 * بازخورد نهایی را می‌سازد: اگر اشتباه مشخصی پیدا شده باشد، دقیقاً همان کلمه‌ها
 * را نام می‌برد؛ در غیر این صورت یک پیام کلی بر اساس درصد شباهت برمی‌گرداند.
 */
export function buildRecitationFeedback(
  score: number,
  mistakes: { type: 'substituted' | 'omitted' | 'extra'; expected?: string; said?: string }[]
): string {
  if (mistakes.length === 0) {
    return score >= 95 ? 'عالی بود! تلفظ کاملاً درست بود.' : 'خوب بود، تفاوت محسوسی با متن اصلی پیدا نشد.'
  }

  const parts = mistakes.slice(0, 3).map((m) => {
    if (m.type === 'substituted') return `به‌جای «${m.expected}» گفتید «${m.said}»`
    if (m.type === 'omitted') return `کلمهٔ «${m.expected}» را نخواندید`
    return `کلمهٔ اضافهٔ «${m.said}» گفتید`
  })

  const more = mistakes.length > 3 ? ` و ${mistakes.length - 3} مورد دیگر` : ''
  return `نیاز به تمرین دارد: ${parts.join('، ')}${more}.`
}
