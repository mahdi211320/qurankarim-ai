import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

const DISMISS_KEY = 'quran-app-install-dismissed-at'
const REMIND_AFTER_DAYS = 7

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handler(e) {
      e.preventDefault()
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
      const daysSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
      if (dismissedAt && daysSinceDismiss < REMIND_AFTER_DAYS) return

      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-20 inset-x-4 z-40 bg-emerald-700 text-white rounded-xl2 p-4 flex items-center gap-3 shadow-card"
        >
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <Download size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">نصب اپلیکیشن</p>
            <p className="text-xs text-emerald-50/80 mt-0.5">برای دسترسی سریع‌تر و استفادهٔ آفلاین نصب کنید.</p>
          </div>
          <button onClick={install} className="bg-white text-emerald-700 text-xs font-bold rounded-lg px-3 py-2 shrink-0">
            نصب
          </button>
          <button onClick={dismiss} aria-label="بستن" className="p-1 shrink-0">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
