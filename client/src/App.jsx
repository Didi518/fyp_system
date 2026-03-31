import { useEffect } from 'react';
import { LoaderIcon } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Student Pages
import UploadFiles from './pages/student/UploadFiles';
import FeedbackPage from './pages/student/FeedbackPage';
import SubmitProposal from './pages/student/SubmitProposal';
import SupervisorPage from './pages/student/SupervisorPage';
import StudentDashboard from './pages/student/StudentDashboard';
import NotificationsPage from './pages/student/NotificationsPage';

// Teacher Pages
import TeacherFiles from './pages/teacher/TeacherFiles';
import PendingRequests from './pages/teacher/PendingRequests';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AssignedStudents from './pages/teacher/AssignedStudents';

// Admin Pages
import { getUser } from './store/slices/authSlice';
import ProjectsPage from './pages/admin/ProjectsPage';
import DeadlinesPage from './pages/admin/DeadlinesPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import AssignSupervisor from './pages/admin/AssignSupervisor';

const App = () => {
  const dispatch = useDispatch();
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderIcon className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        <Route
          path="/reinitialiser-mot-de-passe/:token"
          element={<ResetPasswordPage />}
        />
      </Routes>
      <ToastContainer theme="dark" />
    </BrowserRouter>
  );
};

export default App;
