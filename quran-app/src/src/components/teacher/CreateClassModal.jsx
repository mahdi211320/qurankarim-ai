import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * @param {{ open: boolean, onClose: () => void, onCreate: (data: object) => void }} props
 */
export default function CreateClassModal({ open, onClose, onCreate }) {
  const [className, setClassName] = useState('')
  const [gradeLevel, setGradeLevel] = useState(7)
  const [academicYear, setAcademicYear] = useState('۱۴۰۴-۱۴۰۵')

  function handleSubmit(e) {
    e.preventDefault()
    if (!className.trim()) return
    onCreate({ class_name: className.trim(), grade_level: gradeLevel, academic_year: academicYear })
    setClassName('')
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
              <h2 className="font-bold text-ink">ایجاد کلاس جدید</h2>
              <button type="button" onClick={onClose} className="p-1 text-ink-faint" aria-label="بستن">
                <X size={20} />
              </button>
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
              نام کلاس
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="مثلاً: هفتم - ب"
                required
                className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              پایه تحصیلی
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value={7}>پایه هفتم</option>
                <option value={8}>پایه هشتم</option>
                <option value={9}>پایه نهم</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              سال تحصیلی
              <input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="rounded-xl border border-paper-soft bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>

            <button type="submit" className="btn-primary mt-2">
              ایجاد کلاس
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
