import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import StorageGauge from '../../components/admin/StorageGauge.jsx'
import CleanupConfirmModal from '../../components/admin/CleanupConfirmModal.jsx'
import { toPersianDigits } from '../../components/layout/Header.jsx'
import { mockStorage, mockCleanupHistory, getCleanupPreview } from '../../lib/adminMockData.js'

export default function StorageDetail() {
  const [storage, setStorage] = useState(mockStorage)
  const [history, setHistory] = useState(mockCleanupHistory)
  const [modalOpen, setModalOpen] = useState(false)
  const preview = getCleanupPreview()

  function handleCleanup() {
    setStorage((prev) => ({ ...prev, usedMB: Math.max(0, prev.usedMB - preview.mbToFree) }))
    setHistory((prev) => [
      { id: `cl_new_${prev.length + 1}`, date: 'اکنون', filesRemoved: preview.filesToRemove, mbFreed: preview.mbToFree },
      ...prev
    ])
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin" className="flex items-center gap-1.5 text-sm text-ink-soft w-fit">
        <ArrowRight size={16} /> بازگشت به داشبورد
      </Link>

      <div className="card-surface p-6 flex flex-col items-center gap-4">
        <StorageGauge usedMB={storage.usedMB} limitMB={storage.limitMB} size={200} />
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5">
          <Sparkles size={16} /> پاک‌سازی هوشمند
        </button>
      </div>

      <div className="card-surface p-4">
        <h2 className="font-bold text-ink mb-3">ترکیب استفاده از فضا</h2>
        <div className="flex flex-col gap-3">
          {storage.breakdown.map((b) => (
            <div key={b.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-ink-soft">{b.label}</span>
                <span className="text-ink-faint tabular-nums">{toPersianDigits(b.mb)} MB</span>
              </div>
              <div className="h-2 bg-paper-soft rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(b.mb / storage.limitMB) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-4">
        <h2 className="font-bold text-ink mb-3">تاریخچهٔ پاک‌سازی‌ها</h2>
        {history.length === 0 ? (
          <p className="text-sm text-ink-faint">هنوز پاک‌سازی‌ای انجام نشده است.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-paper-soft">
            {history.map((h) => (
              <li key={h.id} className="py-3 flex items-center justify-between text-sm">
                <span className="text-ink-soft">{h.date}</span>
                <span className="text-ink">
                  {toPersianDigits(h.filesRemoved)} فایل حذف شد · {toPersianDigits(h.mbFreed)} MB آزاد شد
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CleanupConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleCleanup}
        preview={preview}
      />
    </div>
  )
}
