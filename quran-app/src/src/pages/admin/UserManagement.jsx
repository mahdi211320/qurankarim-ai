import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, Trash2, Pencil, X, Upload, Download, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Papa from 'papaparse'
import { toPersianDigits } from '../../components/layout/Header.jsx'
import { mockUsers as initialUsers, mockAdminClasses } from '../../lib/adminMockData.js'
import { bulkImportStudents, listAdminUsers, createAdminUser, deleteAdminUser } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const ROLE_TABS = [
  { key: 'student', label: 'دانش‌آموزان' },
  { key: 'teacher', label: 'معلم‌ها' },
  { key: 'admin', label: 'مدیران' }
]

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers)
  const [isRealData, setIsRealData] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [activeRole, setActiveRole] = useState('student')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [importClassId, setImportClassId] = useState(mockAdminClasses[0]?.id || '')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = useRef(null)
  const { showToast } = useToast()

  // در بارگذاری هر تب نقش، فهرست واقعی کاربران از Supabase واکشی می‌شود.
  // در نبود بک‌اند واقعی، همان لیست نمونهٔ محلی به‌عنوان fallback باقی می‌ماند.
  useEffect(() => {
    let cancelled = false
    setLoadingUsers(true)
    listAdminUsers(activeRole).then(({ data, error }) => {
      if (cancelled) return
      setLoadingUsers(false)
      if (!error && data?.users) {
        setIsRealData(true)
        setUsers((prev) => [...prev.filter((u) => u.role !== activeRole), ...data.users])
      }
    })
    return () => {
      cancelled = true
    }
  }, [activeRole])

  const filtered = useMemo(
    () =>
      users.filter(
        (u) => u.role === activeRole && u.full_name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [users, activeRole, search]
  )

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function removeUsers(ids) {
    for (const id of ids) {
      if (isRealData) {
        const { error } = await deleteAdminUser(id)
        if (error) {
          showToast(`حذف یکی از کاربران ناموفق بود.`, 'error')
          continue
        }
      }
      setUsers((prev) => prev.filter((u) => u.id !== id))
    }
  }

  async function bulkDelete() {
    const count = selected.size
    await removeUsers([...selected])
    setSelected(new Set())
    showToast(`${toPersianDigits(count)} کاربر حذف شد.`, 'error')
  }

  async function deleteUser(id) {
    await removeUsers([id])
    showToast('کاربر حذف شد.', 'error')
  }

  async function addUser(newUser) {
    if (!isRealData) {
      // بدون بک‌اند واقعی، فقط به‌صورت محلی/نمایشی اضافه می‌شود
      setUsers((prev) => [...prev, { id: `u_new_${prev.length + 1}`, ...newUser }])
      showToast(`«${newUser.full_name}» فقط به‌صورت محلی اضافه شد (Supabase وصل نیست).`, 'error')
      return
    }

    const { data, error } = await createAdminUser(newUser)
    if (error || !data) {
      showToast('ساخت کاربر واقعی ناموفق بود.', 'error')
      return
    }
    setUsers((prev) => [
      ...prev,
      {
        id: data.id,
        full_name: newUser.full_name,
        role: newUser.role,
        code: newUser.student_code || '—',
        email: newUser.email || '—'
      }
    ])
    showToast(`«${newUser.full_name}» با موفقیت افزوده شد.`)
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

  function handleFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !importClassId) return

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

        setImporting(true)
        setImportResult(null)
        const { data, error } = await bulkImportStudents(importClassId, rows)
        setImporting(false)

        if (error || !data) {
          showToast('ورود گروهی ناموفق بود. اتصال Supabase را بررسی کنید.', 'error')
          return
        }

        setImportResult(data)
        if (data.created_count > 0) showToast(`${toPersianDigits(data.created_count)} دانش‌آموز اضافه شد.`)
        if (data.failed.length > 0) showToast(`${toPersianDigits(data.failed.length)} ردیف با خطا مواجه شد.`, 'error')
      },
      error: () => showToast('خواندن فایل CSV ناموفق بود.', 'error')
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-xl text-ink">کاربران</h1>
          <p className="text-sm text-ink-soft mt-1">
            مدیریت دانش‌آموزان، معلم‌ها و مدیران سامانه
            {!loadingUsers && !isRealData && (
              <span className="text-gold-600"> — نمایش داده‌های نمونه (Supabase وصل نیست)</span>
            )}
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5 !py-2.5">
          <Plus size={16} /> افزودن کاربر
        </button>
      </div>

      {/* تب‌های نقش */}
      <div className="flex gap-2">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveRole(tab.key)
              setSelected(new Set())
            }}
            className={`text-xs font-semibold rounded-full px-3.5 py-2 transition-colors
                        ${activeRole === tab.key ? 'bg-emerald-500 text-white' : 'bg-paper-soft text-ink-soft'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ورود گروهی دانش‌آموزان با CSV — فقط ادمین، برای هر کلاس جداگانه */}
      {activeRole === 'student' && (
        <div className="card-surface p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-ink">ورود گروهی دانش‌آموزان یک کلاس</p>
          <p className="text-xs text-ink-soft leading-6">
            فایل CSV باید ستون‌های <code className="text-emerald-700">full_name</code>،{' '}
            <code className="text-emerald-700">national_id</code> (کد ملی — نام کاربری ورود)،{' '}
            <code className="text-emerald-700">student_code</code> (کد دانش‌آموزی — رمز عبور پیش‌فرض) و{' '}
            <code className="text-emerald-700">parent_phone</code> (اختیاری) داشته باشد. این کار را برای هر
            کلاس جداگانه (مثلاً هر ۱۲ بار) تکرار کنید.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={importClassId}
              onChange={(e) => setImportClassId(e.target.value)}
              className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {mockAdminClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </select>

            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelected} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="btn-primary flex items-center gap-1.5 !py-2.5 disabled:opacity-60"
            >
              <Upload size={16} /> {importing ? 'در حال ورود...' : 'انتخاب فایل CSV'}
            </button>
            <button onClick={downloadSampleCsv} className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
              <Download size={14} /> دانلود نمونه
            </button>
          </div>

          {importResult && (
            <div className="border-t border-paper-soft pt-3">
              <p className="flex items-center gap-1.5 text-sm text-emerald-600 mb-2">
                <CheckCircle2 size={15} /> {toPersianDigits(importResult.created_count)} دانش‌آموز با موفقیت اضافه شد
              </p>
              {importResult.failed.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {importResult.failed.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-red-600">
                      <XCircle size={13} className="shrink-0" />
                      کد ملی {toPersianDigits(f.national_id)}: {f.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* جستجو */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی نام..."
          className="w-full rounded-xl border border-paper-soft bg-paper-card pr-9 pl-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* نوار اقدام گروهی */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-2.5"
          >
            <span className="text-sm text-emerald-700 font-medium">
              {toPersianDigits(selected.size)} کاربر انتخاب شده
            </span>
            <button onClick={bulkDelete} className="flex items-center gap-1.5 text-sm text-red-600 font-semibold">
              <Trash2 size={15} /> حذف گروهی
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* جدول کاربران */}
      <div className="card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-xs text-ink-faint border-b border-paper-soft">
              <th className="px-4 py-3 w-8" />
              <th className="px-4 py-3 font-medium">نام</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">کد / ایمیل</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-paper-soft last:border-0 hover:bg-paper-soft/50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    className="accent-emerald-500"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-ink">{user.full_name}</td>
                <td className="px-4 py-3 text-ink-soft hidden sm:table-cell tabular-nums">
                  {user.code !== '—' ? toPersianDigits(user.code) : user.email}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 justify-end">
                    <button className="text-ink-faint" aria-label="ویرایش">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteUser(user.id)} className="text-red-500" aria-label="حذف">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-faint text-sm">
                  کاربری یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addUser} defaultRole={activeRole} />
    </div>
  )
}

function AddUserModal({ open, onClose, onAdd, defaultRole }) {
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState(defaultRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [classId, setClassId] = useState(mockAdminClasses[0]?.id || '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fullName.trim()) return
    setSaving(true)
    await onAdd({
      full_name: fullName.trim(),
      role,
      email: role !== 'student' ? email.trim() : undefined,
      password: role !== 'student' ? password : undefined,
      national_id: role === 'student' ? nationalId.trim() : undefined,
      student_code: role === 'student' ? studentCode.trim() : undefined,
      class_id: role === 'student' ? classId : undefined
    })
    setSaving(false)
    setFullName('')
    setEmail('')
    setPassword('')
    setNationalId('')
    setStudentCode('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="bg-paper-card w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-ink">افزودن کاربر</h2>
              <button type="button" onClick={onClose} className="p-1 text-ink-faint" aria-label="بستن">
                <X size={20} />
              </button>
            </div>

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
                <option value="student">دانش‌آموز</option>
                <option value="teacher">معلم</option>
                <option value="admin">مدیر</option>
              </select>
            </label>

            {role === 'student' ? (
              <>
                <label className="flex flex-col gap-1.5 text-sm">
                  کد ملی (نام کاربری ورود)
                  <input
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    required
                    className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  کد دانش‌آموزی (رمز عبور پیش‌فرض)
                  <input
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    required
                    className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  کلاس
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {mockAdminClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.class_name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
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
                  رمز عبور اولیه
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </label>
              </>
            )}

            <button type="submit" disabled={saving} className="btn-primary mt-2 disabled:opacity-60">
              {saving ? 'در حال افزودن...' : 'افزودن'}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
