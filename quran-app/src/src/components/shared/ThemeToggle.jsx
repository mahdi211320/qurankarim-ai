import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-between w-full card-surface p-4"
      aria-pressed={isDark}
    >
      <span className="flex items-center gap-2 text-sm font-medium text-ink">
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
        حالت {isDark ? 'تیره' : 'روشن'}
      </span>
      <span
        className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors
                    ${isDark ? 'bg-emerald-500 justify-end' : 'bg-paper-soft justify-start'}`}
      >
        <span className="w-5 h-5 bg-white rounded-full shadow" />
      </span>
    </button>
  )
}
