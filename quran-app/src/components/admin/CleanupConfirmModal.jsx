import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { toPersianDigits } from '../layout/Header.jsx'

/**
 * @param {{ open: boolean, onClose: () => void, onConfirm: () => void, preview: { filesToRemove: number, mbToFree: number } }} props
 */
export default function CleanupConfirmModal({ open, onClose, onConfirm, preview }) {
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
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="bg-paper-card w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-gold-600" />
                <h2 className="font-bold text-ink">پاک‌سازی هوشمند</h2>
              </div>
              <button onClick={onClose} className="p-1 text-ink-faint" aria-label="بستن">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-ink-soft leading-6">
              فایل‌های صوتی قدیمی‌تر از ۳۰ روز حذف می‌شوند (فقط آخرین تلاوت هر دانش‌آموز برای هر درس نگه
              داشته می‌شود). این عملیات قابل بازگشت نیست.
            </p>

            <div className="bg-gold-50 rounded-xl p-3 text-sm text-ink text-center">
              {toPersianDigits(preview.filesToRemove)} فایل حذف خواهد شد
              <span className="text-ink-faint"> · </span>
              {toPersianDigits(preview.mbToFree)} مگابایت آزاد می‌شود
            </div>

            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary flex-1">
                انصراف
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="flex-1 bg-red-500 text-white font-semibold rounded-xl px-5 py-3 active:bg-red-600"
              >
                تأیید و پاک‌سازی
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
