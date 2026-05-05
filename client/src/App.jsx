import { useEffect } from 'react';
import { LoaderIcon } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth, useAdmin } from './hooks';

import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import DashboardLayout from './components/layout/DashboardLayout';

import UploadFiles from './pages/student/UploadFiles';
import FeedbackPage from './pages/student/FeedbackPage';
import SubmitProposal from './pages/student/SubmitProposal';
import SupervisorPage from './pages/student/SupervisorPage';
import StudentDashboard from './pages/student/StudentDashboard';
import NotificationsPage from './pages/student/NotificationsPage';

import TeacherFiles from './pages/teacher/TeacherFiles';
import PendingRequests from './pages/teacher/PendingRequests';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AssignedStudents from './pages/teacher/AssignedStudents';

import ProjectsPage from './pages/admin/ProjectsPage';
import DeadlinesPage from './pages/admin/DeadlinesPages';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import AssignSupervisor from './pages/admin/AssignSupervisor';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authUser } = useAuth();
  if (!authUser) {
    return <Navigate to="/connexion" replace />;
  }

  if (
    allowedRoles?.length &&
    authUser?.role &&
    !allowedRoles.includes(authUser.role)
  ) {
    const redirectPath =
      authUser.role === 'admin'
        ? '/admin'
        : authUser.role === 'teacher'
          ? '/enseignant'
          : '/etudiant';

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

const App = () => {
  const { getAllUsers, getAllProjects } = useAdmin();
  const { authUser, isCheckingAuth, getUser } = useAuth();

  useEffect(() => {
    if (!authUser) {
      getUser();
    }
  }, [authUser, getUser]);

  useEffect(() => {
    if (authUser && authUser?.role === 'admin') {
      getAllUsers();
      getAllProjects();
    }
  }, [authUser, getAllUsers, getAllProjects]);

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

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout userRole={'admin'} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="etudiants" element={<ManageStudents />} />
          <Route path="enseignants" element={<ManageTeachers />} />
          <Route path="assigner-superviseur" element={<AssignSupervisor />} />
          <Route path="deadlines" element={<DeadlinesPage />} />
          <Route path="projets" element={<ProjectsPage />} />
        </Route>
        <Route
          path="/etudiant"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout userRole={'student'} />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="proposition" element={<SubmitProposal />} />
          <Route path="telecharger-fichiers" element={<UploadFiles />} />
          <Route path="superviseur" element={<SupervisorPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
      <ToastContainer theme="dark" />
    </BrowserRouter>
  );
};

export default App;
