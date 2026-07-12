import { useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { toPersianDigits } from '../layout/Header.jsx'

/**
 * پخش‌کنندهٔ صوت تلاوت قاری برای تب «متن قرآن».
 * src باید در نسخهٔ نهایی به فایل صوتی واقعی (Supabase Storage یا CDN) اشاره کند.
 * @param {{ src?: string }} props
 */
export default function AudioPlayer({ src }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasSource, setHasSource] = useState(Boolean(src))

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoaded = () => setDuration(audio.duration || 0)
    const onTime = () => setCurrentTime(audio.currentTime)
    const onEnd = () => setIsPlaying(false)
    const onError = () => setHasSource(false)

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('error', onError)
    }
  }, [])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || !hasSource) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => setHasSource(false))
    }
    setIsPlaying(!isPlaying)
  }

  function seek(e) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const ratio = Number(e.target.value) / 100
    audio.currentTime = ratio * duration
    setCurrentTime(audio.currentTime)
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="card-surface p-4">
      {/* آدرس واقعی فایل صوتی قاری (مثلاً از Supabase Storage) باید اینجا قرار گیرد */}
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!hasSource}
          className="w-11 h-11 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center
                     disabled:opacity-40 active:bg-emerald-600 transition-colors"
          aria-label={isPlaying ? 'توقف پخش' : 'پخش صوت'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="-me-0.5" />}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={100}
            value={progressPercent}
            onChange={seek}
            disabled={!hasSource}
            className="w-full accent-emerald-500 h-1.5"
            aria-label="نوار پیشرفت صوت"
          />
          <div className="flex justify-between text-[11px] text-ink-faint mt-1 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{hasSource ? formatTime(duration) : 'بدون صوت'}</span>
          </div>
        </div>
      </div>
      {!hasSource && (
        <p className="text-[11px] text-ink-faint mt-2">
          فایل صوتی تلاوت این درس هنوز بارگذاری نشده است.
        </p>
      )}
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return toPersianDigits('0:00')
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return toPersianDigits(`${m}:${String(s).padStart(2, '0')}`)
}
