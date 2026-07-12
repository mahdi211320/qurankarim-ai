import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Sparkles } from 'lucide-react'
import StorageGauge from './StorageGauge.jsx'
import CleanupConfirmModal from './CleanupConfirmModal.jsx'
import { toPersianDigits } from '../layout/Header.jsx'
import { mockStorage, getCleanupPreview } from '../../lib/adminMockData.js'
import { getStorageUsage, previewCleanup, runCleanup } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function StorageWidget() {
  const [storage, setStorage] = useState(mockStorage)
  const [modalOpen, setModalOpen] = useState(false)
  const [preview, setPreview] = useState(getCleanupPreview())
  const percent = Math.round((storage.usedMB / storage.limitMB) * 100)
  const { showToast } = useToast()

  useEffect(() => {
    // تلاش برای دریافت آمار واقعی از Edge Function «storage-manager»؛
    // در نبود پروژهٔ واقعی Supabase، مقادیر نمونهٔ mockStorage باقی می‌ماند.
    getStorageUsage().then(({ data }) => {
      if (data) setStorage({ usedMB: data.used_mb, limitMB: data.limit_mb, breakdown: data.breakdown })
    })
  }, [])

  async function openModal() {
    const { data } = await previewCleanup()
    if (data) setPreview({ filesToRemove: data.files_to_remove, mbToFree: data.mb_to_free })
    setModalOpen(true)
  }

  async function handleCleanup() {
    const { data } = await runCleanup()
    const freed = data ? data.mb_freed : preview.mbToFree
    setStorage((prev) => ({ ...prev, usedMB: Math.max(0, prev.usedMB - freed) }))
    showToast(`پاک‌سازی انجام شد؛ ${freed} مگابایت آزاد شد.`)
  }

  return (
    <div className="card-surface p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink">فضای ابری (Supabase Storage)</h2>
        <Link to="/admin/storage" className="text-xs text-emerald-600 font-semibold">
          بررسی دقیق‌تر
        </Link>
      </div>

      {percent > 85 && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-3 py-2.5 text-sm font-medium">
          <AlertTriangle size={16} />
          🚨 فضای ابری در حال پر شدن است!
        </div>
      )}
      {percent > 70 && percent <= 85 && (
        <div className="flex items-center gap-2 bg-gold-50 text-gold-700 rounded-xl px-3 py-2.5 text-sm font-medium">
          <AlertTriangle size={16} />
          ⚠️ فضای ابری رو به اتمام است
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <StorageGauge usedMB={storage.usedMB} limitMB={storage.limitMB} />
        <div className="flex-1 flex flex-col gap-2 w-full">
          <p className="text-xs text-ink-faint">
            {toPersianDigits(storage.usedMB)} مگابایت از {toPersianDigits(storage.limitMB)} مگابایت استفاده شده
          </p>
          <button
            onClick={openModal}
            className="btn-primary flex items-center justify-center gap-1.5"
          >
            <Sparkles size={16} /> پاک‌سازی هوشمند
          </button>
        </div>
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
