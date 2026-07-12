import { useState } from 'react'
import { Activity, Sparkles, AlertTriangle } from 'lucide-react'
import { mockActivityLogs } from '../../lib/adminMockData.js'

const TYPE_CONFIG = {
  activity: { icon: Activity, label: 'فعالیت', className: 'bg-emerald-50 text-emerald-700' },
  ai: { icon: Sparkles, label: 'هوش مصنوعی', className: 'bg-gold-50 text-gold-600' },
  error: { icon: AlertTriangle, label: 'خطا', className: 'bg-red-50 text-red-600' }
}

const FILTERS = [
  { key: 'all', label: 'همه' },
  { key: 'activity', label: 'فعالیت‌ها' },
  { key: 'ai', label: 'هوش مصنوعی' },
  { key: 'error', label: 'خطاها' }
]

export default function ActivityLogs() {
  const [filter, setFilter] = useState('all')
  const logs = filter === 'all' ? mockActivityLogs : mockActivityLogs.filter((l) => l.type === filter)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-bold text-xl text-ink">گزارش فعالیت‌ها</h1>
        <p className="text-sm text-ink-soft mt-1">فعالیت‌های اخیر کاربران، مصرف هوش مصنوعی و خطاهای سامانه</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs font-semibold rounded-full px-3.5 py-2 transition-colors
                        ${filter === f.key ? 'bg-emerald-500 text-white' : 'bg-paper-soft text-ink-soft'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card-surface p-4">
        <ul className="flex flex-col divide-y divide-paper-soft">
          {logs.map((log) => {
            const cfg = TYPE_CONFIG[log.type]
            const Icon = cfg.icon
            return (
              <li key={log.id} className="py-3 flex items-start gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.className}`}>
                  <Icon size={15} />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-ink leading-6">{log.text}</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">{log.time}</p>
                </div>
              </li>
            )
          })}
          {logs.length === 0 && <p className="py-6 text-center text-sm text-ink-faint">موردی یافت نشد.</p>}
        </ul>
      </div>
    </div>
  )
}
