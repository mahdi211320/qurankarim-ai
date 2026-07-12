import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'

/**
 * @param {{ data: { lesson: string, quiz: number, recitation: number }[] }} props
 */
export default function ProgressLineChart({ data }) {
  return (
    <div className="w-full h-64" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE7" />
          <XAxis dataKey="lesson" tick={{ fontSize: 11, fill: '#8A948F' }} reversed />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#8A948F' }} />
          <Tooltip
            contentStyle={{ direction: 'rtl', fontFamily: 'Vazirmatn, sans-serif', borderRadius: 12, border: '1px solid #F1EFE7' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'Vazirmatn, sans-serif', fontSize: 12 }} />
          <Line type="monotone" dataKey="quiz" name="نمرهٔ آزمون" stroke="#0B6E4F" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="recitation" name="نمرهٔ تلاوت" stroke="#C9A227" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
