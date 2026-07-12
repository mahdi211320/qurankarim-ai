import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

// پیام‌های واقعی Supabase Auth را به فارسیِ دقیق (نه یک حدس ثابت) برمی‌گرداند
function translateAuthError(message) {
  const msg = (message || '').toLowerCase()
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'این ایمیل قبلاً ثبت شده است. اگر حساب دارید، از صفحهٔ ورود استفاده کنید.'
  }
  if (msg.includes('password')) {
    return `رمز عبور مورد قبول نیست: ${message}`
  }
  if (msg.includes('invalid') && msg.includes('email')) {
    return 'فرمت ایمیل معتبر نیست.'
  }
  if (msg.includes('signups not allowed') || msg.includes('signup is disabled')) {
    return 'ثبت‌نام در تنظیمات Supabase غیرفعال است (Authentication → Providers → Email → Allow new users to sign up).'
  }
  if (msg.includes('rate limit')) {
    return 'تعداد درخواست‌ها زیاد بوده؛ کمی صبر کنید و دوباره تلاش کنید.'
  }
  return `ثبت‌نام ناموفق بود: ${message || 'خطای نامشخص'}`
}

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('teacher')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.')
      return
    }
    setLoading(true)
    const { error } = await signUp({ email, password, fullName, role })
    setLoading(false)
    if (error) {
      setError(translateAuthError(error.message))
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-paper" dir="rtl">
        <div className="card-surface p-6 max-w-sm">
          <h1 className="font-bold text-ink mb-2">ثبت‌نام با موفقیت انجام شد 🎉</h1>
          <p className="text-sm text-ink-soft leading-6">
            یک ایمیل تأیید برای شما ارسال شد. پس از تأیید ایمیل می‌توانید وارد شوید.
          </p>
          <Link to="/login" className="btn-primary mt-4 inline-block">
            رفتن به صفحهٔ ورود
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-paper" dir="rtl">
      <form onSubmit={handleSubmit} className="w-full max-w-sm card-surface p-5 flex flex-col gap-3">
        <h1 className="font-bold text-lg text-ink text-center mb-1">ثبت‌نام</h1>

        {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>}

        <label className="flex flex-col gap-1.5 text-sm">
          نام کامل
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          نقش
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="teacher">معلم</option>
            <option value="student">دانش‌آموز</option>
          </select>
          <span className="text-[11px] text-ink-faint">
            حساب مدیر فقط توسط مدیر فعلی سامانه ساخته می‌شود.
          </span>
        </label>

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
            minLength={6}
            className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </label>

        <button type="submit" disabled={loading} className="btn-primary mt-1">
          {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
        </button>

        <p className="text-xs text-ink-faint text-center">
          حساب دارید؟{' '}
          <Link to="/login" className="text-emerald-600 font-semibold">
            ورود
          </Link>
        </p>
      </form>
    </div>
  )
}
