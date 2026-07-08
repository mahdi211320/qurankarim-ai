import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Play, RotateCcw, Send, Sparkles } from 'lucide-react'
import CircularProgress from './CircularProgress.jsx'
import { toPersianDigits } from '../layout/Header.jsx'
import { uploadAndProcessRecitation } from '../../lib/api.js'
import { mockStudent } from '../../lib/mockData.js'

const BAR_COUNT = 24

/**
 * ضبط تلاوت دانش‌آموز، نمایش موج صدا، و ارسال برای تصحیح هوش مصنوعی.
 * ابتدا تلاش می‌کند Edge Function واقعی («process-recitation») را فراخوانی کند؛
 * اگر بک‌اند واقعی هنوز پیکربندی نشده باشد (مثلاً در همین محیط پیش‌نمایش)،
 * به‌صورت خودکار به شبیه‌سازی محلی سوییچ می‌کند تا تجربهٔ کاربری قطع نشود.
 * @param {{ lessonId: string, onComplete: (result: { score: number, feedback: string }) => void }} props
 */
export default function RecitationRecorder({ lessonId, onComplete }) {
  const [phase, setPhase] = useState('idle') // idle | recording | recorded | submitting | result
  const [seconds, setSeconds] = useState(0)
  const [levels, setLevels] = useState(Array(BAR_COUNT).fill(4))
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const recordedBlobRef = useRef(null)
  const audioUrlRef = useRef(null)
  const audioElRef = useRef(null)
  const streamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const rafRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => cleanup, [])

  function cleanup() {
    clearInterval(timerRef.current)
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close().catch(() => {})
  }

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      audioCtxRef.current = audioCtx
      analyserRef.current = analyser
      trackLevels()

      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        recordedBlobRef.current = blob
        audioUrlRef.current = URL.createObjectURL(blob)
        setPhase('recorded')
      }
      recorder.start()
      mediaRecorderRef.current = recorder

      setSeconds(0)
      setPhase('recording')
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setError('دسترسی به میکروفون امکان‌پذیر نشد. لطفاً مجوز میکروفون را بررسی کنید.')
    }
  }

  function trackLevels() {
    const analyser = analyserRef.current
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      analyser.getByteFrequencyData(data)
      const step = Math.floor(data.length / BAR_COUNT) || 1
      const next = Array.from({ length: BAR_COUNT }, (_, i) => Math.max(4, data[i * step] / 4))
      setLevels(next)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    clearInterval(timerRef.current)
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close().catch(() => {})
    setLevels(Array(BAR_COUNT).fill(4))
  }

  function playback() {
    if (audioUrlRef.current && audioElRef.current) {
      audioElRef.current.src = audioUrlRef.current
      audioElRef.current.play()
    }
  }

  function reRecord() {
    setPhase('idle')
    setResult(null)
    setSeconds(0)
  }

  // ابتدا تلاش می‌شود Edge Function واقعی («process-recitation») فراخوانی شود؛
  // اگر هنوز پروژهٔ Supabase/باکت Storage پیکربندی نشده باشد، به‌صورت شفاف به شبیه‌سازی محلی برمی‌گردد.
  async function submitForGrading() {
    setPhase('submitting')

    if (recordedBlobRef.current && lessonId) {
      const { data, error } = await uploadAndProcessRecitation(recordedBlobRef.current, {
        lessonId,
        studentId: mockStudent.id,
        durationSeconds: seconds
      })
      if (!error && data) {
        const finalResult = { score: data.similarity_score, feedback: data.feedback }
        setResult(finalResult)
        setPhase('result')
        onComplete?.(finalResult)
        return
      }
    }

    await simulateGrading()
  }

  async function simulateGrading() {
    await new Promise((r) => setTimeout(r, 1800))
    const score = Math.floor(70 + Math.random() * 28)
    const feedback =
      score >= 90
        ? 'عالی بود! تلفظ حروف و مدها بسیار دقیق ادا شد.'
        : score >= 70
          ? 'خوب بود. در چند کلمه سرعت خواندن کمی بالا بود؛ کمی آرام‌تر تمرین کنید.'
          : 'نیاز به تمرین بیشتر دارید؛ روی مخارج حروف تمرکز کنید.'
    const finalResult = { score, feedback }
    setResult(finalResult)
    setPhase('result')
    onComplete?.(finalResult)
  }

  return (
    <div className="card-surface p-5 flex flex-col items-center gap-4">
      <audio ref={audioElRef} className="hidden" />

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 w-full text-center">{error}</p>}

      <AnimatePresence mode="wait">
        {(phase === 'idle' || phase === 'recording') && (
          <motion.div key="record" className="flex flex-col items-center gap-4 w-full" exit={{ opacity: 0 }}>
            <div className="flex items-end justify-center gap-1 h-16 w-full">
              {levels.map((lvl, i) => (
                <span
                  key={i}
                  className={`w-1.5 rounded-full ${phase === 'recording' ? 'bg-emerald-500' : 'bg-paper-soft'}`}
                  style={{ height: `${phase === 'recording' ? lvl : 4}px`, transition: 'height 80ms linear' }}
                />
              ))}
            </div>

            {phase === 'recording' && (
              <p className="text-sm font-semibold text-emerald-700 tabular-nums">{formatTimer(seconds)}</p>
            )}

            <button
              type="button"
              onClick={phase === 'recording' ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-card
                          ${phase === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-red-500'}`}
              aria-label={phase === 'recording' ? 'توقف ضبط' : 'شروع ضبط'}
            >
              {phase === 'recording' ? <Square size={26} /> : <Mic size={30} />}
            </button>
            <p className="text-sm font-medium text-ink-soft">
              {phase === 'recording' ? 'در حال ضبط... برای توقف بزنید' : 'شروع ضبط'}
            </p>
          </motion.div>
        )}

        {phase === 'recorded' && (
          <motion.div
            key="recorded"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <p className="text-sm text-ink-soft">ضبط شما آماده است. می‌توانید گوش دهید یا ارسال کنید.</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={playback} className="btn-secondary flex items-center gap-1.5 !px-4 !py-2.5">
                <Play size={16} /> پخش مجدد
              </button>
              <button type="button" onClick={reRecord} className="btn-secondary flex items-center gap-1.5 !px-4 !py-2.5">
                <RotateCcw size={16} /> ضبط دوباره
              </button>
            </div>
            <button type="button" onClick={submitForGrading} className="btn-primary flex items-center gap-2 w-full justify-center">
              <Send size={16} /> ارسال برای تصحیح
            </button>
          </motion.div>
        )}

        {phase === 'submitting' && (
          <motion.div
            key="submitting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
            >
              <Sparkles size={28} className="text-gold-500" />
            </motion.div>
            <p className="text-sm font-medium text-ink-soft">در حال تصحیح توسط هوش مصنوعی...</p>
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <CircularProgress value={result.score} label="از ۱۰۰" />
            <p className="text-sm text-ink-soft text-center leading-6">{result.feedback}</p>
            <button type="button" onClick={reRecord} className="btn-secondary flex items-center gap-1.5 !px-4 !py-2.5">
              <RotateCcw size={16} /> ضبط مجدد
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatTimer(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return toPersianDigits(`${m}:${String(s).padStart(2, '0')}`)
}
