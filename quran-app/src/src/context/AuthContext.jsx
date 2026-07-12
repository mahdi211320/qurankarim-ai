import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)
const DEMO_STORAGE_KEY = 'quran-app-demo-session'

// حساب‌های آزمایشی برای پیش‌نمایش رابط کاربری بدون نیاز به پروژهٔ واقعی Supabase.
// این مسیر فقط برای دمو/توسعه است؛ در تولید واقعی همیشه از supabase.auth استفاده می‌شود.
const DEMO_PROFILES = {
  student: { id: 'demo-student', role: 'student', full_name: 'محمدرضا احمدی' },
  teacher: { id: 'demo-teacher', role: 'teacher', full_name: 'خانم رضایی' },
  admin: { id: 'demo-admin', role: 'admin', full_name: 'محمد مهدی خراسانی' }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [studentRecord, setStudentRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const demoRole = localStorage.getItem(DEMO_STORAGE_KEY)
    if (demoRole && DEMO_PROFILES[demoRole]) {
      setProfile(DEMO_PROFILES[demoRole])
      setIsDemo(true)
      setLoading(false)
      return
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
        if (data.session) fetchProfile(data.session.user.id)
        else setLoading(false)
      })
      .catch(() => setLoading(false))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) fetchProfile(newSession.user.id)
      else {
        setProfile(null)
        setStudentRecord(null)
        setLoading(false)
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('id, role, full_name').eq('id', userId).single()
    setProfile(data ?? null)

    // برای دانش‌آموزان، ردیف واقعی جدول students (شامل UUID لازم برای ثبت پیشرفت) نیز واکشی می‌شود
    if (data?.role === 'student') {
      const { data: studentRow } = await supabase
        .from('students')
        .select('id, class_id, student_code, national_id')
        .eq('profile_id', userId)
        .maybeSingle()
      setStudentRecord(studentRow ?? null)
    } else {
      setStudentRecord(null)
    }

    setLoading(false)
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signUp({ email, password, fullName, role }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    })
    return { error }
  }

  function signInDemo(role) {
    localStorage.setItem(DEMO_STORAGE_KEY, role)
    setProfile(DEMO_PROFILES[role])
    setIsDemo(true)
  }

  async function signOut() {
    if (isDemo) {
      localStorage.removeItem(DEMO_STORAGE_KEY)
      setIsDemo(false)
      setProfile(null)
      setStudentRecord(null)
      return
    }
    await supabase.auth.signOut()
    setStudentRecord(null)
  }

  const value = { session, profile, studentRecord, loading, isDemo, signIn, signUp, signInDemo, signOut }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth باید داخل AuthProvider استفاده شود')
  return ctx
}
