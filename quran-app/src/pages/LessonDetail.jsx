import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { ArrowRight, Bookmark, PartyPopper, ClipboardList } from 'lucide-react'
import LessonTabs from '../components/lessons/LessonTabs.jsx'
import AudioPlayer from '../components/lessons/AudioPlayer.jsx'
import ActivityForm from '../components/lessons/ActivityForm.jsx'
import RecitationRecorder from '../components/lessons/RecitationRecorder.jsx'
import { toPersianDigits } from '../components/layout/Header.jsx'
import {
  mockLessons,
  mockProgress,
  mockBookmarks,
  getLessonById,
  getNextLesson
} from '../lib/mockData.js'

const TAB_KEYS = { QURAN: 'quran', ACT1: 'act1', ACT2: 'act2', ACT3: 'act3' }

export default function LessonDetail() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  const lesson = useMemo(() => getLessonById(mockLessons, lessonId), [lessonId])
  const nextLesson = lesson ? getNextLesson(mockLessons, lesson) : null

  const [activeTab, setActiveTab] = useState(TAB_KEYS.QURAN)
  const [progress, setProgress] = useState(
    () =>
      mockProgress[lessonId] || {
        act1_done: false,
        act2_done: false,
        act3_done: false,
        quiz_score: null,
        recitation_score: null,
        is_completed: false
      }
  )
  const [isBookmarked, setIsBookmarked] = useState(() => mockBookmarks.has(lessonId))
  const [justUnlocked, setJustUnlocked] = useState(false)

  if (!lesson) {
    return (
      <div className="px-5 pt-6 text-center">
        <p className="text-ink-soft">درسی با این شناسه پیدا نشد.</p>
        <Link to="/lessons" className="text-emerald-600 font-semibold text-sm mt-2 inline-block">
          بازگشت به لیست درس‌ها
        </Link>
      </div>
    )
  }

  const allDone = progress.act1_done && progress.act2_done && progress.act3_done

  function markDone(key, extra = {}) {
    setProgress((prev) => {
      const next = { ...prev, [key]: true, ...extra }
      const willBeComplete = next.act1_done && next.act2_done && next.act3_done
      if (willBeComplete && !prev.is_completed) {
        next.is_completed = true
        // TODO: در نسخهٔ نهایی این‌جا student_progress در Supabase به‌روزرسانی می‌شود
        // (تریگر sync_progress_status در دیتابیس status و completed_at را خودکار می‌سازد)
        celebrate()
      }
      return next
    })
  }

  function celebrate() {
    setJustUnlocked(true)
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#0B6E4F', '#C9A227', '#FAF8F3']
    })
  }

  const tabs = [
    { key: TAB_KEYS.QURAN, label: 'متن قرآن' },
    { key: TAB_KEYS.ACT1, label: 'فعالیت ۱', done: progress.act1_done },
    { key: TAB_KEYS.ACT2, label: 'فعالیت ۲', done: progress.act2_done },
    { key: TAB_KEYS.ACT3, label: 'فعالیت ۳', done: progress.act3_done }
  ]

  return (
    <div className="pb-6">
      {/* هدر */}
      <div className="px-5 pt-6 pb-4 flex items-start justify-between gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -m-2 text-ink" aria-label="بازگشت">
          <ArrowRight size={22} />
        </button>

        <div className="flex-1 text-center">
          <p className="text-[11px] text-ink-faint mb-0.5">
            پایه {toPersianDigits(lesson.grade_level)} · درس {toPersianDigits(lesson.lesson_number)}
          </p>
          <h1 className="font-bold text-ink leading-6">{lesson.title}</h1>
        </div>

        <button
          onClick={() => setIsBookmarked((v) => !v)}
          className="p-2 -m-2"
          aria-label={isBookmarked ? 'حذف نشان' : 'افزودن نشان'}
        >
          <Bookmark size={22} className={isBookmarked ? 'fill-gold-500 text-gold-500' : 'text-ink-faint'} />
        </button>
      </div>

      {/* نشانگر پیشرفت فعالیت‌ها */}
      <div className="px-5 flex items-center gap-2 mb-2">
        {['act1_done', 'act2_done', 'act3_done'].map((key) => (
          <span
            key={key}
            className={`h-1.5 flex-1 rounded-full ${progress[key] ? 'bg-emerald-500' : 'bg-paper-soft'}`}
          />
        ))}
      </div>

      <LessonTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="px-5 mt-5 flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {activeTab === TAB_KEYS.QURAN && (
            <motion.div key="quran" {...fadeProps} className="flex flex-col gap-4">
              <AudioPlayer />
              {lesson.verses.length > 0 ? (
                <div className="card-surface p-5 flex flex-col gap-5">
                  {lesson.verses.map((verse, i) => (
                    <div key={i} className="pb-4 border-b border-paper-soft last:border-0 last:pb-0">
                      <p className="quran-text">{verse.arabic}</p>
                      <p className="text-sm text-ink-soft mt-2 leading-7">{verse.translation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-surface p-6 text-center">
                  <p className="text-sm text-ink-faint">متن قرآن این درس هنوز بارگذاری نشده است.</p>
                </div>
              )}
              {lesson.dailyReading && (
                <div className="bg-emerald-50 rounded-xl2 p-4">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">انس روزانه</p>
                  <p className="text-sm text-emerald-900 leading-6">{lesson.dailyReading}</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === TAB_KEYS.ACT1 && (
            <motion.div key="act1" {...fadeProps}>
              <ActivityForm
                prompt={lesson.activities.act1?.prompt}
                placeholder={lesson.activities.act1?.placeholder}
                explanation={lesson.activities.act1?.explanation}
                done={progress.act1_done}
                onSubmit={() => markDone('act1_done')}
              />
            </motion.div>
          )}

          {activeTab === TAB_KEYS.ACT2 && (
            <motion.div key="act2" {...fadeProps} className="flex flex-col gap-4">
              {lesson.verses.length > 0 && (
                <div className="card-surface p-4">
                  {lesson.verses.map((verse, i) => (
                    <p key={i} className="quran-text mb-2 last:mb-0">
                      {verse.arabic}
                    </p>
                  ))}
                </div>
              )}
              <RecitationRecorder
                lessonId={lesson.id}
                onComplete={(res) => markDone('act2_done', { recitation_score: res.score })}
              />
            </motion.div>
          )}

          {activeTab === TAB_KEYS.ACT3 && (
            <motion.div key="act3" {...fadeProps}>
              <ActivityForm
                prompt={lesson.activities.act3?.prompt}
                placeholder={lesson.activities.act3?.placeholder}
                done={progress.act3_done}
                onSubmit={() => markDone('act3_done')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* پیام تکمیل درس + دسترسی به آزمون و درس بعدی */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500 text-white rounded-xl2 p-5 flex flex-col items-center gap-3 text-center mt-2"
            >
              {justUnlocked && <PartyPopper size={28} />}
              <p className="font-bold">
                {nextLesson ? 'درس بعدی باز شد! 🎉' : 'همهٔ فعالیت‌های این درس را کامل کردید 🎉'}
              </p>

              <Link
                to={`/quiz/${lesson.id}`}
                className="w-full bg-white text-emerald-700 font-semibold rounded-xl py-3 flex items-center justify-center gap-2"
              >
                <ClipboardList size={18} /> شروع آزمون
              </Link>

              {nextLesson && (
                <Link
                  to={`/lessons/${nextLesson.id}`}
                  className="w-full border border-white/50 rounded-xl py-3 text-sm font-medium"
                >
                  رفتن به درس {toPersianDigits(nextLesson.lesson_number)}
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const fadeProps = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.18 }
}
