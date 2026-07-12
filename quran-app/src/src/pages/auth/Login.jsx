import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookMarked } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

// باید دقیقاً با EMAIL_DOMAIN در supabase/functions/bulk-import-students/index.ts یکسان باشد
const STUDENT_EMAIL_DOMAIN = 'students.quranapp.internal'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('staff') // 'staff' | 'student'
  const [identifier, setIdentifier] = useState('') // ایمیل (معلم/مدیر) یا کد ملی (دانش‌آموز)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const email = mode === 'student' ? `${identifier.trim()}@${STUDENT_EMAIL_DOMAIN}` : identifier
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(mode === 'student' ? 'کد ملی یا رمز عبور نادرست است.' : 'ایمیل یا رمز عبور نادرست است.')
      return
    }
    navigate(redirectTo, { replace: true })
  }

  function switchMode(next) {
    setMode(next)
    setIdentifier('')
    setPassword('')
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-paper" dir="rtl">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <BookMarked size={22} />
          </div>
          <h1 className="font-bold text-lg text-ink">دستیار آموزشی قرآن متوسطه اول</h1>
          <p className="text-xs text-ink-faint">برای ادامه وارد حساب کاربری خود شوید</p>
        </div>

        {/* تب انتخاب نوع ورود */}
        <div className="flex bg-paper-soft rounded-full p-1">
          <button
            type="button"
            onClick={() => switchMode('student')}
            className={`flex-1 py-2 text-xs font-semibold rounded-full transition-colors
                        ${mode === 'student' ? 'bg-emerald-500 text-white' : 'text-ink-soft'}`}
          >
            ورود دانش‌آموز
          </button>
          <button
            type="button"
            onClick={() => switchMode('staff')}
            className={`flex-1 py-2 text-xs font-semibold rounded-full transition-colors
                        ${mode === 'staff' ? 'bg-emerald-500 text-white' : 'text-ink-soft'}`}
          >
            ورود معلم / مدیر
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-5 flex flex-col gap-3">
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>}

          <label className="flex flex-col gap-1.5 text-sm">
            {mode === 'student' ? 'کد ملی' : 'ایمیل'}
            <input
              type={mode === 'student' ? 'text' : 'email'}
              inputMode={mode === 'student' ? 'numeric' : undefined}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            رمز عبور
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </label>
          {mode === 'student' && (
            <p className="text-[11px] text-ink-faint -mt-1">
              نام کاربری، کد ملیِ شماست. اگر رمز عبورتان را تغییر نداده‌اید، رمز پیش‌فرض همان کد دانش‌آموزی است.
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-1">
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>

          {mode === 'staff' && (
            <p className="text-xs text-ink-faint text-center">
              حساب ندارید؟{' '}
              <Link to="/signup" className="text-emerald-600 font-semibold">
                ثبت‌نام معلم
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
