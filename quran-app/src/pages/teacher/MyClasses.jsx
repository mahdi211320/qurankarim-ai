import { useState } from 'react'
import { Plus } from 'lucide-react'
import ClassCard from '../../components/teacher/ClassCard.jsx'
import CreateClassModal from '../../components/teacher/CreateClassModal.jsx'
import { mockClasses } from '../../lib/teacherMockData.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function MyClasses() {
  const [classes, setClasses] = useState(mockClasses)
  const [modalOpen, setModalOpen] = useState(false)
  const { showToast } = useToast()

  function handleCreate(data) {
    // TODO: در نسخهٔ نهایی، درج ردیف جدید در جدول classes با Supabase (insert)
    setClasses((prev) => [
      ...prev,
      { id: `c_new_${prev.length + 1}`, access_code: 'XXXXXX', ...data }
    ])
    showToast(`کلاس «${data.class_name}» ایجاد شد.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-ink">کلاس‌های من</h1>
          <p className="text-sm text-ink-soft mt-1">مدیریت کلاس‌ها و دانش‌آموزان هر کلاس</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5 !py-2.5">
          <Plus size={18} /> ایجاد کلاس جدید
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {classes.map((c) => (
          <ClassCard key={c.id} classItem={c} />
        ))}
      </div>

      <CreateClassModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />
    </div>
  )
}
