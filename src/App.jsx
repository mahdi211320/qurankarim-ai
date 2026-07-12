import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import LessonsList from './pages/LessonsList.jsx'
import LessonDetail from './pages/LessonDetail.jsx'
import Profile from './pages/Profile.jsx'
import QuizPage from './pages/QuizPage.jsx'
import Bookmarks from './pages/Bookmarks.jsx'
import TeacherLayout from './pages/teacher/TeacherLayout.jsx'
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx'
import MyClasses from './pages/teacher/MyClasses.jsx'
import StudentsManagement from './pages/teacher/StudentsManagement.jsx'
import StudentDetail from './pages/teacher/StudentDetail.jsx'
import Reports from './pages/teacher/Reports.jsx'
import TeacherSettings from './pages/teacher/TeacherSettings.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import StorageDetail from './pages/admin/StorageDetail.jsx'
import UserManagement from './pages/admin/UserManagement.jsx'
import ClassManagement from './pages/admin/ClassManagement.jsx'
import LessonsManagement from './pages/admin/LessonsManagement.jsx'
import ActivityLogs from './pages/admin/ActivityLogs.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'
import NotFound from './pages/NotFound.jsx'
import InstallPrompt from './components/shared/InstallPrompt.jsx'
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<StudentDashboard />} />
          <Route path="/lessons" element={<LessonsList />} />
          <Route path="/lessons/:lessonId" element={<LessonDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz/:lessonId" element={<QuizPage />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<MyClasses />} />
          <Route path="/teacher/students" element={<StudentsManagement />} />
          <Route path="/teacher/students/:studentId" element={<StudentDetail />} />
          <Route path="/teacher/reports" element={<Reports />} />
          <Route path="/teacher/settings" element={<TeacherSettings />} />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/storage" element={<StorageDetail />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/classes" element={<ClassManagement />} />
          <Route path="/admin/lessons" element={<LessonsManagement />} />
          <Route path="/admin/logs" element={<ActivityLogs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <InstallPrompt />
    </>
  )
}
