import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const HOME_BY_ROLE = { student: '/', teacher: '/teacher', admin: '/admin' }

/**
 * مسیرهای فرزند خود را فقط در صورتی نمایش می‌دهد که کاربر وارد شده و نقش او
 * در فهرست allowedRoles باشد. در غیر این صورت به /login یا صفحهٔ اصلیِ نقش خودش هدایت می‌شود.
 * @param {{ allowedRoles: string[], children: React.ReactNode }} props
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-sm text-ink-faint">در حال بارگذاری...</p>
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to={HOME_BY_ROLE[profile.role] ?? '/login'} replace />
  }

  return children
}
