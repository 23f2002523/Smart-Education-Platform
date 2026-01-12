import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Login, StudentDashboard, StudentAnalytics, StudentPractice, StudentPBL, StudentSettings, TeacherDashboard, AdminDashboard } from './pages'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/analytics" element={<StudentAnalytics />} />
        <Route path="/student/practice" element={<StudentPractice />} />
        <Route path="/student/pbl" element={<StudentPBL />} />
        <Route path="/student/settings" element={<StudentSettings />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
