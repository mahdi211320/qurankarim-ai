import { motion } from 'framer-motion'
import { toPersianDigits } from '../layout/Header.jsx'

/**
 * نشانگر دایره‌ای فضای ذخیره‌سازی با رنگ‌بندی بر اساس آستانه‌های بحرانی.
 * سبز (<۷۰٪)، زرد (۷۰ تا ۸۵٪)، قرمز (>۸۵٪)
 * @param {{ usedMB: number, limitMB: number, size?: number }} props
 */
export default function StorageGauge({ usedMB, limitMB, size = 160 }) {
  const percent = Math.min(100, Math.round((usedMB / limitMB) * 100))
  const stroke = size * 0.09
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const color = percent > 85 ? '#DC2626' : percent > 70 ? '#C9A227' : '#0B6E4F'

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
          animate={{ strokeDashoffset: circumference - (percent / 100) * circumference }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-ink tabular-nums">{toPersianDigits(percent)}٪</span>
        <span className="text-[11px] text-ink-faint mt-0.5 tabular-nums">
          {toPersianDigits(usedMB)} / {toPersianDigits(limitMB)} MB
        </span>
      </div>
    </div>
  )
}
