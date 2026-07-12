import { Check } from 'lucide-react'

/**
 * ناوبری تب‌های صفحهٔ درس با نشانگر زیرخط برای تب فعال و تیک برای تب‌های تکمیل‌شده.
 * @param {{ tabs: { key: string, label: string, done?: boolean }[], active: string, onChange: (key: string) => void }} props
 */
export default function LessonTabs({ tabs, active, onChange }) {
  return (
    <div className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-paper-soft" role="tablist">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = tab.key === active
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={`relative flex-1 flex items-center justify-center gap-1 py-3 text-xs font-semibold
                          transition-colors ${isActive ? 'text-emerald-600' : 'text-ink-faint'}`}
            >
              {tab.done && <Check size={13} className="text-emerald-500" />}
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-emerald-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
