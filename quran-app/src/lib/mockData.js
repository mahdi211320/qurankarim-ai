// داده‌های نمونه هم‌ساختار با جداول Supabase (lessons / student_progress)
// تا زمان اتصال کامل به بک‌اند، برای توسعه و پیش‌نمایش رابط کاربری استفاده می‌شود.

export const mockStudent = {
  id: 'stu_001',
  full_name: 'محمدرضا احمدی',
  grade_level: 7,
  class_name: 'هفتم - الف'
}

// درس‌های همهٔ پایه‌ها (طبق کتاب «آموزش قرآن» - دورهٔ اول متوسطه)
// نکتهٔ مهم: هر درس رسمی کتاب به ۲ بخش (بخش اول/دوم) با متن قرآن و فعالیت‌های
// جداگانه تقسیم می‌شود؛ برای همین هر درس رسمی، ۲ ردیف جداگانه در این آرایه دارد.
// عناوین مطابق فهرست کتاب رسمی است. محتوای کامل (متن قرآن/فعالیت‌ها) توسط ادمین
// از طریق پنل مدیریت دروس تکمیل می‌شود (به همین دلیل «verses» همه خالی است).
export const mockLessons = [
// پایه هفتم - هر درس به ۲ بخش تقسیم می‌شود (۱۲ درس × ۲ بخش = ۲۴ محتوا)
  { id: 'l7_1', grade_level: 7, lesson_number: 1, title: 'ابر و باد و مه و خورشید و فلک در کارند — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_2', grade_level: 7, lesson_number: 2, title: 'ابر و باد و مه و خورشید و فلک در کارند — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_3', grade_level: 7, lesson_number: 3, title: 'هرچه کنی به خود کنی — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_4', grade_level: 7, lesson_number: 4, title: 'هرچه کنی به خود کنی — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_5', grade_level: 7, lesson_number: 5, title: 'با توکّل زانوی اشتر ببند — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_6', grade_level: 7, lesson_number: 6, title: 'با توکّل زانوی اشتر ببند — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_7', grade_level: 7, lesson_number: 7, title: 'تو نیکی می‌کن و در دجله انداز — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_8', grade_level: 7, lesson_number: 8, title: 'تو نیکی می‌کن و در دجله انداز — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_9', grade_level: 7, lesson_number: 9, title: 'ای نمازم همه تو، راز و نیازم همه تو — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_10', grade_level: 7, lesson_number: 10, title: 'ای نمازم همه تو، راز و نیازم همه تو — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_11', grade_level: 7, lesson_number: 11, title: 'همه از بهر تو سرگشته و فرمان‌بردار — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_12', grade_level: 7, lesson_number: 12, title: 'همه از بهر تو سرگشته و فرمان‌بردار — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_13', grade_level: 7, lesson_number: 13, title: 'قرآن که پیام آسمانی است، روشنگر راه زندگانی است — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_14', grade_level: 7, lesson_number: 14, title: 'قرآن که پیام آسمانی است، روشنگر راه زندگانی است — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_15', grade_level: 7, lesson_number: 15, title: 'ندایی در زمین و آسمان است که این دنیا برای امتحان است — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_16', grade_level: 7, lesson_number: 16, title: 'ندایی در زمین و آسمان است که این دنیا برای امتحان است — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_17', grade_level: 7, lesson_number: 17, title: 'اگر مشتاق دیدار خدایی، عمل شایسته‌تر تا می‌توانی — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_18', grade_level: 7, lesson_number: 18, title: 'اگر مشتاق دیدار خدایی، عمل شایسته‌تر تا می‌توانی — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_19', grade_level: 7, lesson_number: 19, title: 'این خانه با نماز و دعا خو گرفته است — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_20', grade_level: 7, lesson_number: 20, title: 'این خانه با نماز و دعا خو گرفته است — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_21', grade_level: 7, lesson_number: 21, title: 'چو یونس از خدا باید طلب کرد — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_22', grade_level: 7, lesson_number: 22, title: 'چو یونس از خدا باید طلب کرد — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_23', grade_level: 7, lesson_number: 23, title: 'ولایت خدا بود تو را نصیر و رهنما — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l7_24', grade_level: 7, lesson_number: 24, title: 'ولایت خدا بود تو را نصیر و رهنما — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },

// پایه هشتم - هر درس به ۲ بخش تقسیم می‌شود (۱۲ درس × ۲ بخش = ۲۴ محتوا)
  { id: 'l8_1', grade_level: 8, lesson_number: 1, title: 'رستگاری در صلاة است و زکات — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_2', grade_level: 8, lesson_number: 2, title: 'رستگاری در صلاة است و زکات — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_3', grade_level: 8, lesson_number: 3, title: 'باد و خاک و آب و آتش بنده‌اند — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_4', grade_level: 8, lesson_number: 4, title: 'باد و خاک و آب و آتش بنده‌اند — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_5', grade_level: 8, lesson_number: 5, title: 'همه عالم جمال طلعت اوست — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_6', grade_level: 8, lesson_number: 6, title: 'همه عالم جمال طلعت اوست — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_7', grade_level: 8, lesson_number: 7, title: 'چون سلیمان از خدا حاجت بخواه — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_8', grade_level: 8, lesson_number: 8, title: 'چون سلیمان از خدا حاجت بخواه — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_9', grade_level: 8, lesson_number: 9, title: 'ای وارث پیمبر و قرآن و دین بیا — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_10', grade_level: 8, lesson_number: 10, title: 'ای وارث پیمبر و قرآن و دین بیا — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_11', grade_level: 8, lesson_number: 11, title: 'معبودهای باطل چون تار عنکبوت‌اند — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_12', grade_level: 8, lesson_number: 12, title: 'معبودهای باطل چون تار عنکبوت‌اند — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_13', grade_level: 8, lesson_number: 13, title: 'هر روزِ عمر مشق کن این شعر ناب را — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_14', grade_level: 8, lesson_number: 14, title: 'هر روزِ عمر مشق کن این شعر ناب را — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_15', grade_level: 8, lesson_number: 15, title: 'راهرو گر صد هنر دارد، توکل بایدش — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_16', grade_level: 8, lesson_number: 16, title: 'راهرو گر صد هنر دارد، توکل بایدش — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_17', grade_level: 8, lesson_number: 17, title: 'کدام دانه فرو رفت در زمین که نرست؟ — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_18', grade_level: 8, lesson_number: 18, title: 'کدام دانه فرو رفت در زمین که نرست؟ — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_19', grade_level: 8, lesson_number: 19, title: 'دستور خدا، سلام برتوست — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_20', grade_level: 8, lesson_number: 20, title: 'دستور خدا، سلام برتوست — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_21', grade_level: 8, lesson_number: 21, title: 'همنشین تو از تو به باشد — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_22', grade_level: 8, lesson_number: 22, title: 'همنشین تو از تو به باشد — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_23', grade_level: 8, lesson_number: 23, title: 'یا غافر الخطایا! دریاب بی‌نوا را — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l8_24', grade_level: 8, lesson_number: 24, title: 'یا غافر الخطایا! دریاب بی‌نوا را — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },

// پایه نهم - هر درس به ۲ بخش تقسیم می‌شود (۱۱ درس × ۲ بخش = ۲۲ محتوا)
  { id: 'l9_1', grade_level: 9, lesson_number: 1, title: 'این جهان راه است و ما راهی — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_2', grade_level: 9, lesson_number: 2, title: 'این جهان راه است و ما راهی — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_3', grade_level: 9, lesson_number: 3, title: 'روشنگر راه سعادت چو خورشید فروزان است قرآن — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_4', grade_level: 9, lesson_number: 4, title: 'روشنگر راه سعادت چو خورشید فروزان است قرآن — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_5', grade_level: 9, lesson_number: 5, title: 'در صراط مستقیم ای دل کسی گمراه نیست — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_6', grade_level: 9, lesson_number: 6, title: 'در صراط مستقیم ای دل کسی گمراه نیست — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_7', grade_level: 9, lesson_number: 7, title: 'یک میوه از درخت غرور، آن تمسخر است — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_8', grade_level: 9, lesson_number: 8, title: 'یک میوه از درخت غرور، آن تمسخر است — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_9', grade_level: 9, lesson_number: 9, title: 'بهشتِ حق، جزای متقین است — بخش اول', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_10', grade_level: 9, lesson_number: 10, title: 'بهشتِ حق، جزای متقین است — بخش دوم', is_term1_limited: true, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_11', grade_level: 9, lesson_number: 11, title: 'عدالت‌خواه و عادل چون خدا باش — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_12', grade_level: 9, lesson_number: 12, title: 'عدالت‌خواه و عادل چون خدا باش — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_13', grade_level: 9, lesson_number: 13, title: 'خدا با حکمت و میزان، رسولان را دهد یاری — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_14', grade_level: 9, lesson_number: 14, title: 'خدا با حکمت و میزان، رسولان را دهد یاری — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_15', grade_level: 9, lesson_number: 15, title: 'تجارت با خدا، کسبی است پرسود — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_16', grade_level: 9, lesson_number: 16, title: 'تجارت با خدا، کسبی است پرسود — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_17', grade_level: 9, lesson_number: 17, title: 'سفر زندگی ما ز خدا تا به خداست — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_18', grade_level: 9, lesson_number: 18, title: 'سفر زندگی ما ز خدا تا به خداست — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_19', grade_level: 9, lesson_number: 19, title: 'رتل القرآن ترتیلاً، ندای رحمت است — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_20', grade_level: 9, lesson_number: 20, title: 'رتل القرآن ترتیلاً، ندای رحمت است — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_21', grade_level: 9, lesson_number: 21, title: 'به آسمان و کوه‌ها چرا نظر نمی‌کنی؟! — بخش اول', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
  { id: 'l9_22', grade_level: 9, lesson_number: 22, title: 'به آسمان و کوه‌ها چرا نظر نمی‌کنی؟! — بخش دوم', is_term1_limited: false, verses: [], activities: {}, dailyReading: '' },
]

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
 * - محدودیت ترم اول: چون هر درس رسمی به ۲ بخش تقسیم شده، محدودیت‌ها نیز دو برابر شده‌اند:
 *   پایه هفتم و هشتم تا بخش ۱۲ (یعنی ۶ درس رسمی اول)، پایه نهم تا بخش ۱۰ (یعنی ۵ درس رسمی اول).
 */
export function getTermLimit(gradeLevel) {
  return gradeLevel === 9 ? 10 : 12
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
