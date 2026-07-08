/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // پالت اصلی برنامه - الهام‌گرفته از زمرد، طلا و کاغذ کهنه
        emerald: {
          50: '#EAF5F0',
          100: '#CFE9DD',
          400: '#1E9C6E',
          500: '#0B6E4F', // رنگ اصلی برند
          600: '#095C42',
          700: '#084C37', // برای متن روی زمینه روشن / حالت هاور
          900: '#052E21'
        },
        gold: {
          50: '#FBF6E7',
          200: '#E9D6A0',
          400: '#D4B04C',
          500: '#C9A227', // رنگ تاکیدی - نشان‌ها، امتیازها
          600: '#A9861C'
        },
        paper: {
          DEFAULT: '#FAF8F3', // پس‌زمینه اصلی، شبیه کاغذ
          soft: '#F1EFE7',
          card: '#FFFFFF'
        },
        ink: {
          DEFAULT: '#1E2A26', // متن اصلی - سبز خیلی تیره به‌جای سیاه خالص
          soft: '#54615C',
          faint: '#8A948F'
        }
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        quran: ['Amiri', 'Scheherazade New', 'serif']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      boxShadow: {
        card: '0 2px 10px -2px rgba(11, 110, 79, 0.10), 0 1px 3px -1px rgba(11,110,79,0.08)'
      }
    }
  },
  plugins: []
}
