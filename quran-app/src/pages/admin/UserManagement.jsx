import { useMemo, useState } from 'react'
import { Plus, Search, Trash2, Pencil, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toPersianDigits } from '../../components/layout/Header.jsx'
import { mockUsers as initialUsers } from '../../lib/adminMockData.js'
import { useToast } from '../../context/ToastContext.jsx'

const ROLE_TABS = [
  { key: 'student', label: 'دانش‌آموزان' },
  { key: 'teacher', label: 'معلم‌ها' },
  { key: 'admin', label: 'مدیران' }
]

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers)
  const [activeRole, setActiveRole] = useState('student')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const { showToast } = useToast()

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

  function bulkDelete() {
    const count = selected.size
    setUsers((prev) => prev.filter((u) => !selected.has(u.id)))
    setSelected(new Set())
    showToast(`${toPersianDigits(count)} کاربر حذف شد.`, 'error')
  }

  function deleteUser(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    showToast('کاربر حذف شد.', 'error')
  }

  function addUser(newUser) {
    setUsers((prev) => [...prev, { id: `u_new_${prev.length + 1}`, ...newUser }])
    showToast(`«${newUser.full_name}» با موفقیت افزوده شد.`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-xl text-ink">کاربران</h1>
          <p className="text-sm text-ink-soft mt-1">مدیریت دانش‌آموزان، معلم‌ها و مدیران سامانه</p>
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
  const [identifier, setIdentifier] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!fullName.trim()) return
    onAdd({
      full_name: fullName.trim(),
      role,
      code: role === 'student' ? identifier || '—' : '—',
      email: role !== 'student' ? identifier || '—' : '—'
    })
    setFullName('')
    setIdentifier('')
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

            <label className="flex flex-col gap-1.5 text-sm">
              {role === 'student' ? 'کد دانش‌آموزی' : 'ایمیل'}
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>

            <button type="submit" className="btn-primary mt-2">
              افزودن
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
