import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfile } from './pages/StudentProfile';
import { StudentApplications } from './pages/StudentApplications';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { CompanyProfile } from './pages/CompanyProfile';
import { CompanyApplicants } from './pages/CompanyApplicants';
import { TpoDashboard } from './pages/TpoDashboard';
import { TpoStudents } from './pages/TpoStudents';
import { TpoCompanies } from './pages/TpoCompanies';
import { TpoAnalytics } from './pages/TpoAnalytics';
import { Jobs } from './pages/Jobs';
import { Notifications } from './pages/Notifications';
import { AIAnalysis } from './pages/AIAnalysis';
import { Toaster } from 'react-hot-toast';

// A helper route component to redirect `/` to the correct role dashboard
const RootRedirect: React.FC = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  switch (userProfile.role) {
    case 'TPO_ADMIN':
      return <Navigate to="/tpo/dashboard" replace />;
    case 'COMPANY_HR':
      return <Navigate to="/company/dashboard" replace />;
    case 'STUDENT':
    default:
      return <Navigate to="/student/dashboard" replace />;
  }
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased font-sans">
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes (Wrapper inside Layout) */}
            <Route path="/" element={<RootRedirect />} />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout>
                    <StudentDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout>
                    <StudentProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/applications"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout>
                    <StudentApplications />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-analysis"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Layout>
                    <AIAnalysis />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Company HR Routes */}
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute allowedRoles={['COMPANY_HR']}>
                  <Layout>
                    <CompanyDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/profile"
              element={
                <ProtectedRoute allowedRoles={['COMPANY_HR']}>
                  <Layout>
                    <CompanyProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/applicants"
              element={
                <ProtectedRoute allowedRoles={['COMPANY_HR']}>
                  <Layout>
                    <CompanyApplicants />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* TPO Admin Routes */}
            <Route
              path="/tpo/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TPO_ADMIN']}>
                  <Layout>
                    <TpoDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tpo/students"
              element={
                <ProtectedRoute allowedRoles={['TPO_ADMIN']}>
                  <Layout>
                    <TpoStudents />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tpo/companies"
              element={
                <ProtectedRoute allowedRoles={['TPO_ADMIN']}>
                  <Layout>
                    <TpoCompanies />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tpo/analytics"
              element={
                <ProtectedRoute allowedRoles={['TPO_ADMIN']}>
                  <Layout>
                    <TpoAnalytics />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Shared Protected Routes */}
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Jobs />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute allowedRoles={['COMPANY_HR', 'TPO_ADMIN']}>
                  <Layout>
                    <Jobs /> {/* Jobs component has toggle state for new job creation */}
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Wildcard Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Hot Notifications Toaster */}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800 text-xs font-semibold rounded-xl p-3',
              duration: 3500
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
};
