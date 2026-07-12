import { toPersianDigits } from '../layout/Header.jsx'

/**
 * @param {{ icon: React.ComponentType, label: string, value: number, suffix?: string, color?: string }} props
 */
export default function StatCard({ icon: Icon, label, value, suffix = '', color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    gold: 'bg-gold-50 text-gold-600'
  }
  return (
    <div className="card-surface p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xl font-extrabold text-ink tabular-nums">
          {toPersianDigits(value)}
          {suffix}
        </p>
        <p className="text-xs text-ink-faint mt-0.5">{label}</p>
      </div>
    </div>
  )
}
