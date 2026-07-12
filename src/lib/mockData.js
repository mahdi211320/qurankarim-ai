// داده‌های نمونه هم‌ساختار با جداول Supabase (lessons / student_progress)
// تا زمان اتصال کامل به بک‌اند، برای توسعه و پیش‌نمایش رابط کاربری استفاده می‌شود.

export const mockStudent = {
  id: 'stu_001',
  full_name: 'محمدرضا احمدی',
  grade_level: 7,
  class_name: 'هفتم - الف'
}

// درس‌های ترم اول پایه هفتم (طبق کتاب «آموزش قرآن» - دورهٔ اول متوسطه)
// توجه: عناوین دروس مطابق فهرست کتاب رسمی است. محتوای کامل (متن قرآن و فعالیت‌ها)
// فقط برای درس ۱ به‌عنوان نمونهٔ کامل نوشته شده؛ بقیهٔ دروس بعداً توسط ادمین از
// طریق پنل مدیریت محتوا تکمیل می‌شوند (به همین دلیل «verses» آن‌ها خالی است).
export const mockLessons = [
  {
    id: 'l7_1',
    grade_level: 7,
    lesson_number: 1,
    title: 'سوره یوسف - بخش اول',
    is_term1_limited: true,
    verses: [
      {
        arabic: 'الٓر ۚ تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ',
        translation: 'الف، لام، را؛ این است نشانه‌های کتابی روشنگر.'
      },
      {
        arabic: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ',
        translation: 'ما آن را قرآنی به زبان عربی فرو فرستادیم، باشد که بیندیشید.'
      },
      {
        arabic: 'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ بِمَا أَوْحَيْنَا إِلَيْكَ هَـٰذَا الْقُرْآنَ',
        translation: 'ما بهترین داستان را با وحی‌کردنِ همین قرآن بر تو بازگو می‌کنیم.'
      }
    ],
    activities: {
      act1: {
        prompt:
          'به نظر شما چرا خداوند داستان حضرت یوسف را «أحسن القصص» (بهترین داستان) نامیده است؟ با توجه به معنای آیات، پاسخ خود را در چند جمله بنویسید.',
        placeholder: 'پاسخ خود را اینجا بنویسید...',
        explanation:
          'داستان حضرت یوسف به دلیل دربرداشتن درس‌های اخلاقی فراوان (صبر، امید، گذشت) و ساختار داستانی کامل، «بهترین داستان» نامیده شده است.'
      },
      act2: {
        instruction:
          'آیات فوق را با رعایت مخارج حروف و مدّهای لازم چند بار تمرین کنید، سپس صدای خود را ضبط کنید.'
      },
      act3: {
        prompt:
          'این ویژگیِ «بهترین داستان‌بودن» چه پیامی برای زندگی امروز ما دارد؟ یک نمونهٔ عملی از زندگی خودتان بنویسید.',
        placeholder: 'تدبر خود را اینجا بنویسید...'
      }
    },
    dailyReading:
      'تلاوت آیات ۱ تا ۳ سورهٔ یوسف را همراه با ترجمه، پیش از خواب یک بار برای اعضای خانواده بخوانید.'
  },
  {
    id: 'l7_2',
    grade_level: 7,
    lesson_number: 2,
    title: 'هرچه کنی به خود کنی',
    is_term1_limited: true,
    verses: [],
    activities: {},
    dailyReading: ''
  },
  {
    id: 'l7_3',
    grade_level: 7,
    lesson_number: 3,
    title: 'با توکّل زانوی اشتر ببند',
    is_term1_limited: true,
    verses: [],
    activities: {},
    dailyReading: ''
  },
  {
    id: 'l7_4',
    grade_level: 7,
    lesson_number: 4,
    title: 'تو نیکی می‌کن و در دجله انداز',
    is_term1_limited: true,
    verses: [],
    activities: {},
    dailyReading: ''
  },
  {
    id: 'l7_5',
    grade_level: 7,
    lesson_number: 5,
    title: 'ای نمازم همه تو، راز و نیازم همه تو',
    is_term1_limited: true,
    verses: [],
    activities: {},
    dailyReading: ''
  },
  {
    id: 'l7_6',
    grade_level: 7,
    lesson_number: 6,
    title: 'همه از بهر تو سرگشته و فرمان‌بردار',
    is_term1_limited: true,
    verses: [],
    activities: {},
    dailyReading: ''
  },

  // پایه هشتم - ترم اول (دروس ۱ تا ۶) - عناوین مطابق فهرست کتاب رسمی
  { id: 'l8_1', grade_level: 8, lesson_number: 1, title: 'رستگاری در صلاة است و زکات', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_2', grade_level: 8, lesson_number: 2, title: 'باد و خاک و آب و آتش بنده‌اند', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_3', grade_level: 8, lesson_number: 3, title: 'همه عالم جمال طلعت اوست', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_4', grade_level: 8, lesson_number: 4, title: 'چون سلیمان از خدا حاجت بخواه', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_5', grade_level: 8, lesson_number: 5, title: 'ای وارث پیمبر و قرآن و دین بیا', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_6', grade_level: 8, lesson_number: 6, title: 'معبودهای باطل چون تار عنکبوت‌اند', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },

  // پایه نهم - ترم اول (دروس ۱ تا ۵)
  { id: 'l9_1', grade_level: 9, lesson_number: 1, title: 'این جهان راه است و ما راهی', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_2', grade_level: 9, lesson_number: 2, title: 'روشنگر راه سعادت چو خورشید فروزان است قرآن', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_3', grade_level: 9, lesson_number: 3, title: 'در صراط مستقیم ای دل کسی گمراه نیست', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_4', grade_level: 9, lesson_number: 4, title: 'یک میوه از درخت غرور، آن تمسخر است', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_5', grade_level: 9, lesson_number: 5, title: 'بهشتِ حق، جزای متقین است', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' }
]

// نشان‌شده‌ها (bookmarks) - نمونه: درس ۱ نشان‌شده است
export const mockBookmarks = new Set(['l7_1'])

// جمله‌های انگیزشی برگرفته از مضمون آیات قرآن، برای نمایش روزانه در داشبورد
// (ترجمهٔ آزاد و کوتاه؛ هر روز بر اساس روز سال یکی به‌صورت چرخشی نمایش داده می‌شود)
export const motivationalQuotes = [
  { text: 'همانا با سختی، آسانی است.', source: 'سورهٔ انشراح، آیهٔ ۶' },
  { text: 'و صبر کن که خدا با شکیبایان است.', source: 'سورهٔ انفال، آیهٔ ۴۶' },
  { text: 'از رحمت خدا ناامید نشوید.', source: 'سورهٔ زمر، آیهٔ ۵۳' },
  { text: 'خدا با کسی جز به‌اندازهٔ توانش تکلیف نمی‌کند.', source: 'سورهٔ بقره، آیهٔ ۲۸۶' },
  { text: 'هر که کار نیک کند، به سود خویش کرده است.', source: 'سورهٔ فصلت، آیهٔ ۴۶' },
  { text: 'پروردگارتان گفت: مرا بخوانید تا شما را اجابت کنم.', source: 'سورهٔ غافر، آیهٔ ۶۰' },
  { text: 'و بگو: پروردگارا، دانشم را افزون کن.', source: 'سورهٔ طه، آیهٔ ۱۱۴' }
]

export function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  )
  return motivationalQuotes[dayOfYear % motivationalQuotes.length]
}

// آمار نمونه برای بخش «آمار» داشبورد (در نسخهٔ نهایی از student_progress محاسبه می‌شود)
export const mockStats = {
  avgRecitationScore: 88,
  avgQuizScore: 90,
  completedThisWeek: 1
}

// وضعیت پیشرفت نمونه برای یک دانش‌آموز: درس ۱ کامل، درس ۲ در حال انجام، بقیه قفل
export const mockProgress = {
  l7_1: { act1_done: true, act2_done: true, act3_done: true, quiz_score: 90, recitation_score: 88, is_completed: true },
  l7_2: { act1_done: true, act2_done: false, act3_done: false, quiz_score: null, recitation_score: null, is_completed: false }
}

/**
 * منطق قفل توالی دروس:
 * - درس شماره ۱ همیشه باز است.
 * - درس N+1 فقط زمانی باز می‌شود که هر سه فعالیت درس N انجام شده باشد (is_completed).
 * - محدودیت ترم اول: پایه هفتم و هشتم فقط دروس ۱ تا ۶، پایه نهم فقط دروس ۱ تا ۵.
 */
export function getTermLimit(gradeLevel) {
  return gradeLevel === 9 ? 5 : 6
}

export function getLessonsByGrade(lessons, gradeLevel) {
  return lessons
    .filter((l) => l.grade_level === gradeLevel)
    .sort((a, b) => a.lesson_number - b.lesson_number)
}

export function getLessonById(lessons, lessonId) {
  return lessons.find((l) => l.id === lessonId) || null
}

export function getNextLesson(lessons, currentLesson) {
  return (
    lessons.find(
      (l) =>
        l.grade_level === currentLesson.grade_level &&
        l.lesson_number === currentLesson.lesson_number + 1
    ) || null
  )
}

export function computeLessonStatus(lessons, progressMap, gradeLevel) {
  const termLimit = getTermLimit(gradeLevel)
  let previousCompleted = true // درس اول همیشه باز است

  return lessons
    .sort((a, b) => a.lesson_number - b.lesson_number)
    .map((lesson) => {
      const progress = progressMap[lesson.id] || {
        act1_done: false,
        act2_done: false,
        act3_done: false,
        is_completed: false,
        quiz_score: null,
        recitation_score: null
      }

      const beyondTerm = lesson.lesson_number > termLimit
      const locked = beyondTerm || !previousCompleted

      const status = beyondTerm
        ? 'term_locked' // خارج از محدودهٔ ترم - هنوز منتشر نشده
        : locked
          ? 'locked' // قفل به‌دلیل ناتمام‌بودن درس قبل
          : progress.is_completed
            ? 'completed'
            : progress.act1_done || progress.act2_done || progress.act3_done
              ? 'in_progress'
              : 'available'

      previousCompleted = progress.is_completed

      return { ...lesson, progress, status, locked }
    })
}
