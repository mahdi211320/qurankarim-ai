import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-paper" dir="rtl">
      <Compass size={40} className="text-emerald-500" />
      <div>
        <h1 className="font-bold text-lg text-ink">صفحه پیدا نشد</h1>
        <p className="text-sm text-ink-soft mt-1">صفحه‌ای که دنبالش بودید وجود ندارد یا جابه‌جا شده است.</p>
      </div>
      <Link to="/" className="btn-primary">
        بازگشت به خانه
      </Link>
    </div>
  )
}
