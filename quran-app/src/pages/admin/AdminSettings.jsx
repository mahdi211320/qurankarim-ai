import { useState } from 'react'
import { Download, Upload, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const THEME_SWATCHES = [
  { name: 'زمردی (پیش‌فرض)', color: '#0B6E4F' },
  { name: 'آبی نیلی', color: '#1E3A8A' },
  { name: 'قهوه‌ای کهربایی', color: '#7C4A1E' }
]

export default function AdminSettings() {
  const { signOut } = useAuth()
  const [appName, setAppName] = useState('دستیار آموزشی قرآن متوسطه اول')
  const [theme, setTheme] = useState(THEME_SWATCHES[0].color)
  const [aiModel, setAiModel] = useState('gpt-4o')
  const [temperature, setTemperature] = useState(0.4)

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h1 className="font-bold text-xl text-ink">تنظیمات سامانه</h1>

      <section className="card-surface p-4 flex flex-col gap-3">
        <h2 className="font-bold text-ink">اطلاعات کلی</h2>
        <label className="flex flex-col gap-1.5 text-sm">
          نام برنامه
          <input
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </label>
      </section>

      <section className="card-surface p-4 flex flex-col gap-3">
        <h2 className="font-bold text-ink">رنگ اصلی برنامه</h2>
        <div className="flex gap-3">
          {THEME_SWATCHES.map((s) => (
            <button
              key={s.color}
              onClick={() => setTheme(s.color)}
              className={`w-11 h-11 rounded-full border-2 ${theme === s.color ? 'border-ink' : 'border-transparent'}`}
              style={{ backgroundColor: s.color }}
              aria-label={s.name}
              title={s.name}
            />
          ))}
        </div>
        <p className="text-[11px] text-ink-faint">
          تغییر رنگ اصلی نیاز به به‌روزرسانی `tailwind.config.js` و بیلد مجدد دارد.
        </p>
      </section>

      <section className="card-surface p-4 flex flex-col gap-4">
        <h2 className="font-bold text-ink">تنظیمات هوش مصنوعی</h2>
        <label className="flex flex-col gap-1.5 text-sm">
          مدل تولید آزمون
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o mini</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          میزان خلاقیت (temperature): {temperature}
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="accent-emerald-500"
          />
        </label>
      </section>

      <section className="card-surface p-4 flex flex-col gap-3">
        <h2 className="font-bold text-ink">پشتیبان‌گیری</h2>
        <div className="flex gap-2">
          <button className="btn-secondary flex-1 flex items-center justify-center gap-1.5">
            <Download size={16} /> تهیهٔ نسخهٔ پشتیبان
          </button>
          <button className="btn-secondary flex-1 flex items-center justify-center gap-1.5">
            <Upload size={16} /> بازیابی از فایل
          </button>
        </div>
      </section>

      <button
        onClick={signOut}
        className="flex items-center justify-center gap-2 card-surface p-4 text-red-500 font-semibold text-sm w-fit px-6"
      >
        <LogOut size={16} /> خروج از حساب
      </button>
    </div>
  )
}
