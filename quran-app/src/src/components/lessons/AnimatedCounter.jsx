import { useEffect, useState } from 'react'
import { toPersianDigits } from '../layout/Header.jsx'

/**
 * شمارندهٔ متحرک برای نمایش آمار (میانگین نمرات، تعداد دروس و ...).
 * @param {{ value: number, suffix?: string, duration?: number }} props
 */
export default function AnimatedCounter({ value, suffix = '', duration = 800 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()
    const from = 0

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(Math.round(from + (value - from) * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return (
    <span className="tabular-nums">
      {toPersianDigits(display)}
      {suffix}
    </span>
  )
}
