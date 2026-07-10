import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ArrowDown, Pencil, Upload, X, Lock, Music } from 'lucide-react'
import { toPersianDigits } from '../../components/layout/Header.jsx'
import { mockLessons as initialLessons } from '../../lib/mockData.js'
import { fetchLessonsForGrade, saveLessonContent, uploadLessonAudio } from '../../lib/lessonsApi.js'
import { useToast } from '../../context/ToastContext.jsx'

const GRADES = [7, 8, 9]

export default function LessonsManagement() {
  const [lessons, setLessons] = useState(initialLessons)
  const [grade, setGrade] = useState(7)
  const [editing, setEditing] = useState(null)
  const { showToast } = useToast()

  // در بارگذاری هر پایه، محتوای واقعیِ ذخیره‌شده در Supabase (اگر باشد) را
  // روی داده‌های نمونه اعمال می‌کند تا ادمین آخرین وضعیت واقعی را ببیند.
  useEffect(() => {
    let cancelled = false
    fetchLessonsForGrade(grade).then(({ data }) => {
      if (cancelled || !data) return
      setLessons((prev) =>
        prev.map((l) => {
          const real = data.find((r) => r.lesson_number === l.lesson_number && r.grade_level === grade)
          return real ? { ...l, ...real, id: l.id } : l
        })
      )
    })
    return () => {
      cancelled = true
    }
  }, [grade])

  const gradeLessons = lessons
    .filter((l) => l.grade_level === grade)
    .sort((a, b) => a.lesson_number - b.lesson_number)

  function move(lessonId, direction) {
    setLessons((prev) => {
      const list = [...prev]
      const idx = list.findIndex((l) => l.id === lessonId)
      const swapWith = list.findIndex(
        (l) => l.grade_level === grade && l.lesson_number === list[idx].lesson_number + direction
      )
      if (swapWith === -1) return prev
      const tmp = list[idx].lesson_number
      list[idx] = { ...list[idx], lesson_number: list[swapWith].lesson_number }
      list[swapWith] = { ...list[swapWith], lesson_number: tmp }
      return list
    })
  }

  async function saveLesson(updated, audioFile) {
    const { data, error } = await saveLessonContent(updated)

    if (error) {
      showToast('ذخیره در سرور ناموفق بود؛ فقط به‌صورت محلی ذخیره شد.', 'error')
      setLessons((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      setEditing(null)
      return
    }

    let finalLesson = { ...data, id: updated.id }

    if (audioFile) {
      const { data: withAudio, error: audioError } = await uploadLessonAudio(
        updated.grade_level,
        updated.lesson_number,
        audioFile
      )
      if (audioError) {
        showToast('متن ذخیره شد، ولی آپلود صوت ناموفق بود.', 'error')
      } else if (withAudio) {
        finalLesson = { ...withAudio, id: updated.id }
      }
    }

    setLessons((prev) => prev.map((l) => (l.id === updated.id ? finalLesson : l)))
    setEditing(null)
    showToast('درس با موفقیت ذخیره شد.')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-bold text-xl text-ink">مدیریت دروس</h1>
        <p className="text-sm text-ink-soft mt-1">ویرایش محتوا، ترتیب و فایل صوتی دروس هر پایه</p>
      </div>

      <div className="flex gap-2">
        {GRADES.map((g) => (
          <button
            key={g}
            onClick={() => setGrade(g)}
            className={`text-xs font-semibold rounded-full px-3.5 py-2 transition-colors
                        ${grade === g ? 'bg-emerald-500 text-white' : 'bg-paper-soft text-ink-soft'}`}
          >
            پایه {toPersianDigits(g)}
          </button>
        ))}
      </div>

      <div className="card-surface overflow-hidden">
        <ul className="flex flex-col divide-y divide-paper-soft">
          {gradeLessons.map((lesson, i) => (
            <li key={lesson.id} className="p-4 flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => move(lesson.id, -1)}
                  disabled={i === 0}
                  className="text-ink-faint disabled:opacity-30"
                  aria-label="جابه‌جایی به بالا"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => move(lesson.id, 1)}
                  disabled={i === gradeLessons.length - 1}
                  className="text-ink-faint disabled:opacity-30"
                  aria-label="جابه‌جایی به پایین"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-ink-faint">درس {toPersianDigits(lesson.lesson_number)}</p>
                <p className="text-sm font-medium text-ink truncate">{lesson.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {lesson.verses.length === 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-ink-faint">
                      <Lock size={10} /> محتوا هنوز بارگذاری نشده
                    </span>
                  )}
                  {lesson.audioUrl && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                      <Music size={10} /> صوت بارگذاری‌شده
                    </span>
                  )}
                </div>
              </div>

              <button onClick={() => setEditing(lesson)} className="text-emerald-600 p-1.5" aria-label="ویرایش">
                <Pencil size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <LessonEditModal lesson={editing} onClose={() => setEditing(null)} onSave={saveLesson} />
    </div>
  )
}

function LessonEditModal({ lesson, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [arabic, setArabic] = useState('')
  const [translation, setTranslation] = useState('')
  const [act1, setAct1] = useState('')
  const [act2, setAct2] = useState('')
  const [act3, setAct3] = useState('')
  const [dailyReading, setDailyReading] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [saving, setSaving] = useState(false)

  // هم‌گام‌سازی فرم هر بار که درس جدیدی برای ویرایش انتخاب می‌شود
  useEffect(() => {
    if (!lesson) return
    setTitle(lesson.title)
    setArabic(lesson.verses.map((v) => v.arabic).join('\n'))
    setTranslation(lesson.verses.map((v) => v.translation).join('\n'))
    setAct1(lesson.activities?.act1?.prompt || '')
    setAct2(lesson.activities?.act2?.instruction || '')
    setAct3(lesson.activities?.act3?.prompt || '')
    setDailyReading(lesson.dailyReading || '')
    setAudioFile(null)
  }, [lesson])

  async function handleSubmit(e) {
    e.preventDefault()
    const arabicLines = arabic.split('\n').filter(Boolean)
    const translationLines = translation.split('\n').filter(Boolean)
    const verses = arabicLines.map((a, i) => ({ arabic: a, translation: translationLines[i] || '' }))

    setSaving(true)
    await onSave(
      {
        ...lesson,
        title,
        verses,
        activities: {
          act1: { ...lesson.activities?.act1, prompt: act1 },
          act2: { instruction: act2 },
          act3: { ...lesson.activities?.act3, prompt: act3 }
        },
        dailyReading
      },
      audioFile
    )
    setSaving(false)
  }

  return (
    <AnimatePresence>
      {lesson && (
        <motion.div
          className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="bg-paper-card w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between sticky top-0 bg-paper-card">
              <h2 className="font-bold text-ink">ویرایش درس</h2>
              <button type="button" onClick={onClose} className="p-1 text-ink-faint" aria-label="بستن">
                <X size={20} />
              </button>
            </div>

            <Field label="عنوان درس" value={title} onChange={setTitle} />
            <Field label="متن عربی (هر آیه در یک خط)" value={arabic} onChange={setArabic} textarea quran />
            <Field label="ترجمهٔ فارسی (هر آیه در یک خط)" value={translation} onChange={setTranslation} textarea />
            <Field label="فعالیت ۱ (درک معنا)" value={act1} onChange={setAct1} textarea />
            <Field label="فعالیت ۲ (راهنمای تلاوت)" value={act2} onChange={setAct2} textarea />
            <Field label="فعالیت ۳ (تدبر)" value={act3} onChange={setAct3} textarea />
            <Field label="انس روزانه" value={dailyReading} onChange={setDailyReading} textarea />

            <label className="flex flex-col gap-1.5 text-sm">
              فایل صوتی تلاوت قاری (اختیاری، MP3)
              <div className="flex items-center gap-2">
                <label className="btn-secondary flex items-center gap-1.5 !py-2.5 cursor-pointer">
                  <Upload size={16} />
                  انتخاب فایل
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  />
                </label>
                <span className="text-xs text-ink-faint truncate">
                  {audioFile ? audioFile.name : lesson?.audioUrl ? 'صوت قبلی موجود است' : 'فایلی انتخاب نشده'}
                </span>
              </div>
            </label>

            <button type="submit" disabled={saving} className="btn-primary mt-2 disabled:opacity-60">
              {saving ? 'در حال ذخیره...' : 'ذخیرهٔ تغییرات'}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, value, onChange, textarea, quran }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none
                      focus:ring-2 focus:ring-emerald-400 resize-none ${quran ? 'font-quran text-lg' : ''}`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      )}
    </label>
  )
}
