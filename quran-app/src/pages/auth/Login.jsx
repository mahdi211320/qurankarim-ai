import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookMarked, GraduationCap, School, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const { signIn, signInDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('ایمیل یا رمز عبور نادرست است.')
      return
    }
    navigate(redirectTo, { replace: true })
  }

  function handleDemo(role) {
    signInDemo(role)
    navigate(role === 'teacher' ? '/teacher' : role === 'admin' ? '/admin' : '/', { replace: true })
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

        <form onSubmit={handleSubmit} className="card-surface p-5 flex flex-col gap-3">
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>}

          <label className="flex flex-col gap-1.5 text-sm">
            ایمیل
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <button type="submit" disabled={loading} className="btn-primary mt-1">
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>

          <p className="text-xs text-ink-faint text-center">
            حساب ندارید؟{' '}
            <Link to="/signup" className="text-emerald-600 font-semibold">
              ثبت‌نام معلم
            </Link>
          </p>
        </form>

        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-ink-faint text-center">
            یا برای پیش‌نمایش سریع بدون نیاز به حساب واقعی:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <DemoButton icon={GraduationCap} label="دانش‌آموز" onClick={() => handleDemo('student')} />
            <DemoButton icon={School} label="معلم" onClick={() => handleDemo('teacher')} />
            <DemoButton icon={ShieldCheck} label="مدیر" onClick={() => handleDemo('admin')} />
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card-surface p-3 flex flex-col items-center gap-1.5 text-ink-soft active:bg-paper-soft"
    >
      <Icon size={18} />
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  )
}
