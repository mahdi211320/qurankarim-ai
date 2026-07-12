import { Component } from 'react'
import { AlertOctagon } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // TODO: در نسخهٔ نهایی، ارسال خطا به سرویس مانیتورینگ (مثلاً Sentry)
    console.error('خطای غیرمنتظره:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-paper" dir="rtl">
        <AlertOctagon size={40} className="text-red-500" />
        <div>
          <h1 className="font-bold text-lg text-ink">مشکلی پیش آمد</h1>
          <p className="text-sm text-ink-soft mt-1">
            خطایی غیرمنتظره رخ داد. لطفاً صفحه را دوباره بارگذاری کنید.
          </p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-primary">
          تلاش دوباره
        </button>
        <a href="mailto:support@example.com" className="text-xs text-emerald-600 font-semibold">
          تماس با پشتیبانی
        </a>
      </div>
    )
  }
}
