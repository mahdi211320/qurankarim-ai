import { useEffect, useRef, useState } from 'react'
import Papa from 'papaparse'
import { Users, TrendingUp, Upload, Download, CheckCircle2, XCircle } from 'lucide-react'
import { toPersianDigits } from '../../components/layout/Header.jsx'
import { mockAdminClasses } from '../../lib/adminMockData.js'
import { fetchClasses } from '../../lib/classesApi.js'
import { bulkImportStudents } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const TEACHERS = ['خانم رضایی', 'آقای موسوی']

export default function ClassManagement() {
  const [classes, setClasses] = useState(mockAdminClasses)
  const [importState, setImportState] = useState({}) // { [classId]: { importing, result } }
  const fileInputsRef = useRef({})
  const { showToast } = useToast()

  // در بارگذاری صفحه، فهرست واقعی کلاس‌ها از Supabase واکشی می‌شود (در نبود
  // بک‌اند واقعی، همان ۱۲ کلاس نمونهٔ محلی به‌عنوان fallback باقی می‌ماند).
  useEffect(() => {
    let cancelled = false
    fetchClasses().then(({ data, error }) => {
      if (cancelled || error || !data || data.length === 0) return
      setClasses(
        data.map((c) => ({
          ...c,
          teacherName: c.teacher_id ? 'تخصیص‌داده‌شده' : 'بدون معلم',
          studentCount: 0,
          avgScore: 0
        }))
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  function reassignTeacher(classId, teacherName) {
    // TODO: تخصیص واقعی معلم نیاز به شناسهٔ ردیف teachers (نه profiles) دارد؛
    // فعلاً فقط به‌صورت نمایشی/محلی به‌روزرسانی می‌شود
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, teacherName } : c)))
  }

  function downloadSampleCsv() {
    const sample = [
      ['full_name', 'national_id', 'student_code', 'parent_phone'],
      ['محمدرضا احمدی', '0071234567', '70101', '09121234567'],
      ['علی حسینی', '0071234568', '70102', '']
    ]
    const csv = sample.map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'نمونه-ورود-دانش‌آموزان.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileSelected(classId, e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data
          .map((r) => ({
            full_name: (r.full_name || '').trim(),
            national_id: (r.national_id || '').trim(),
            student_code: (r.student_code || '').trim(),
            parent_phone: (r.parent_phone || '').trim() || null
          }))
          .filter((r) => r.full_name && r.national_id && r.student_code)

        if (rows.length === 0) {
          showToast('فایل خالی است یا ستون‌های لازم را ندارد.', 'error')
          return
        }

        setImportState((prev) => ({ ...prev, [classId]: { importing: true, result: null } }))
        const { data, error } = await bulkImportStudents(classId, rows)
        setImportState((prev) => ({ ...prev, [classId]: { importing: false, result: data || null } }))

        if (error || !data) {
          showToast('ورود گروهی ناموفق بود. اتصال Supabase را بررسی کنید.', 'error')
          return
        }
        if (data.created_count > 0) {
          showToast(`${toPersianDigits(data.created_count)} دانش‌آموز با موفقیت اضافه شد.`)
        }
        if (data.failed.length > 0) {
          showToast(`${toPersianDigits(data.failed.length)} ردیف با خطا مواجه شد.`, 'error')
        }
      },
      error: () => showToast('خواندن فایل CSV ناموفق بود.', 'error')
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-xl text-ink">کلاس‌ها</h1>
          <p className="text-sm text-ink-soft mt-1">مشاهده و مدیریت همهٔ کلاس‌ها در تمام پایه‌ها</p>
        </div>
        <button onClick={downloadSampleCsv} className="btn-secondary flex items-center gap-1.5 !py-2.5">
          <Download size={16} /> نمونهٔ فایل CSV
        </button>
      </div>

      <div className="card-surface p-3 text-xs text-ink-soft leading-6">
        برای هر کلاس، فایل CSV مخصوص همان کلاس را جداگانه آپلود کنید (نام کاربری دانش‌آموز =
        کد ملی، رمز عبور پیش‌فرض = کد دانش‌آموزی).
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {classes.map((c) => {
          const state = importState[c.id] || { importing: false, result: null }
          return (
            <div key={c.id} className="card-surface p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink">{c.class_name}</h3>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 font-semibold">
                  پایه {toPersianDigits(c.grade_level)}
                </span>
              </div>

              <label className="flex flex-col gap-1 text-xs text-ink-faint">
                معلم مسئول
                <select
                  value={c.teacherName}
                  onChange={(e) => reassignTeacher(c.id, e.target.value)}
                  className="rounded-lg border border-paper-soft bg-paper px-2.5 py-2 text-sm text-ink
                             focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {TEACHERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-4 pt-2 border-t border-paper-soft">
                <span className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <Users size={15} /> {toPersianDigits(c.studentCount)} دانش‌آموز
                </span>
                <span className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <TrendingUp size={15} /> {toPersianDigits(c.avgScore)}٪
                </span>
              </div>

              <input
                ref={(el) => (fileInputsRef.current[c.id] = el)}
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelected(c.id, e)}
                className="hidden"
              />
              <button
                onClick={() => fileInputsRef.current[c.id]?.click()}
                disabled={state.importing}
                className="btn-secondary flex items-center justify-center gap-1.5 !py-2 text-xs disabled:opacity-60"
              >
                <Upload size={14} /> {state.importing ? 'در حال ورود...' : 'ورود گروهی دانش‌آموزان (CSV)'}
              </button>

              {state.result && (
                <div className="text-xs flex flex-col gap-1">
                  <p className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 size={13} /> {toPersianDigits(state.result.created_count)} نفر اضافه شد
                  </p>
                  {state.result.failed.slice(0, 3).map((f, i) => (
                    <p key={i} className="flex items-center gap-1.5 text-red-600">
                      <XCircle size={12} className="shrink-0" /> {f.national_id}: {f.reason}
                    </p>
                  ))}
                  {state.result.failed.length > 3 && (
                    <p className="text-ink-faint">و {toPersianDigits(state.result.failed.length - 3)} خطای دیگر...</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
