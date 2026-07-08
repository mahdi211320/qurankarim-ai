import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Download, Printer } from 'lucide-react'
import { toPersianDigits } from '../../components/layout/Header.jsx'
import { mockClasses, getClassStats, mockStudentsList } from '../../lib/teacherMockData.js'

export default function Reports() {
  const chartData = mockClasses.map((c) => ({
    name: c.class_name,
    ...getClassStats(c.id)
  }))

  function exportCsv() {
    const header = ['نام', 'کد دانش‌آموزی', 'کلاس', 'درصد پیشرفت', 'میانگین تلاوت', 'میانگین آزمون']
    const rows = mockStudentsList.map((s) => [
      s.full_name,
      s.student_code,
      mockClasses.find((c) => c.id === s.class_id)?.class_name || '',
      s.progress_percent,
      s.recitation_avg,
      s.quiz_avg
    ])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'گزارش-دانش‌آموزان.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-xl text-ink">گزارش‌ها</h1>
          <p className="text-sm text-ink-soft mt-1">عملکرد کلاس‌ها و نرخ تکمیل دروس</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="btn-secondary flex items-center gap-1.5 !py-2.5">
            <Download size={16} /> خروجی Excel/CSV
          </button>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-1.5 !py-2.5">
            <Printer size={16} /> چاپ / PDF
          </button>
        </div>
      </div>

      <div className="card-surface p-4">
        <h2 className="font-bold text-ink mb-3">میانگین عملکرد کلاس‌ها</h2>
        <div className="w-full h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE7" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8A948F' }} reversed />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#8A948F' }} />
              <Tooltip contentStyle={{ direction: 'rtl', fontFamily: 'Vazirmatn, sans-serif', borderRadius: 12 }} />
              <Bar dataKey="avgScore" name="میانگین نمره" fill="#0B6E4F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface p-4">
        <h2 className="font-bold text-ink mb-3">نرخ تکمیل دروس بر اساس کلاس</h2>
        <div className="flex flex-col gap-3">
          {chartData.map((c) => (
            <div key={c.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-ink">{c.name}</span>
                <span className="text-ink-faint tabular-nums">{toPersianDigits(c.avgScore)}٪</span>
              </div>
              <div className="h-2 bg-paper-soft rounded-full overflow-hidden">
                <div className="h-full bg-gold-500 rounded-full" style={{ width: `${c.avgScore}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
