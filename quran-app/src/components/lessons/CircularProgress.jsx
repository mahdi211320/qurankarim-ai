import { motion } from 'framer-motion'
import { toPersianDigits } from '../layout/Header.jsx'

/**
 * نشانگر دایره‌ای امتیاز (برای نمایش درصد تشابه تلاوت یا نمرهٔ آزمون).
 * @param {{ value: number, size?: number, label?: string }} props
 */
export default function CircularProgress({ value, size = 120, label }) {
  const clamped = Math.max(0, Math.min(100, value))
  const stroke = size * 0.09
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const color = clamped >= 70 ? '#0B6E4F' : clamped >= 40 ? '#C9A227' : '#C4501F'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1EFE7" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (clamped / 100) * circumference }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-ink">{toPersianDigits(Math.round(clamped))}</span>
        {label && <span className="text-[11px] text-ink-faint mt-0.5">{label}</span>}
      </div>
    </div>
  )
}
