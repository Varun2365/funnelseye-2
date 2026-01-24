import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './components/AdminLayout';
import LoginPage from './components/LoginPage';
import AdminLoginPage from './components/AdminLoginPage';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import UserDetail from './components/UserDetail';
import SystemSettings from './components/SystemSettings';
import PaymentSettings from './components/PaymentSettings';
import Analytics from './components/Analytics';
import SubscriptionManagement from './components/SubscriptionManagement';
import SubscriptionPlans from './components/SubscriptionPlans';
import CoursesManagement from './components/CoursesManagement';
import SupportTickets from './components/SupportTickets';
import PaymentManagement from './components/PaymentManagement';
import MlmManagement from './components/MlmManagement';
import AuditLogs from './components/AuditLogs';
import SecurityDashboard from './components/SecurityDashboard';
import FinancialDashboard from './components/FinancialDashboard';
import FinancialMlmManagement from './components/FinancialMlmManagement';
import PlatformConfig from './components/PlatformConfig';
import DebugFinancial from './components/DebugFinancial';
import WhatsAppDashboard from './components/WhatsAppDashboard';
import MailSetup from './components/MailSetup';
import AdminUploadsManager from './components/AdminUploadsManager';
import CourseOverview from './components/CourseOverview';
import CourseEditor from './components/CourseEditor';
import CourseCreationFlow from './components/CourseCreationFlow';
import CoursePreview from './components/CoursePreview';
import CoursePreviewStandalone from './components/CoursePreviewStandalone';
import HierarchyRequests from './components/HierarchyRequests';
import AdminStaffComingSoon from './components/AdminStaffComingSoon';
import FunnelCreator from './components/funnels/FunnelCreator';
import FunnelsManagement from './components/funnels/FunnelsManagement';
import FunnelManagement from './components/funnels/FunnelManagement';
import FunnelEditor from './components/funnels/FunnelEditor';
import { Toaster } from 'sonner';
import { ToastProvider } from './contexts/ToastContext';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, admin, retryAuth, retryCount } = useAuth();
  
  // Show loading while auth check is in progress
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground">Checking authentication...</div>
          {retryCount > 0 && (
            <div className="text-sm text-muted-foreground">
              Retry attempt: {retryCount}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && admin?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AppContent() {
  const { isAuthenticated, loading, admin } = useAuth();
  
  console.log('🔐 [APP_CONTENT] Rendering with state:', { isAuthenticated, loading, admin: admin ? 'exists' : 'null' });

  if (loading) {
    console.log('🔐 [APP_CONTENT] Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4 reveal-fade">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary animate-pulse-gentle"></div>
          <div className="text-muted-foreground reveal reveal-delay-1">Loading...</div>
        </div>
      </div>
    );
  }
  
  console.log('🔐 [APP_CONTENT] Not loading, isAuthenticated:', isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/course-preview-standalone/:courseId" element={<CoursePreviewStandalone />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="system-settings" element={<SystemSettings />} />
          <Route path="payment-settings" element={<PaymentSettings />} />
          <Route path="payment-management" element={<PaymentManagement />} />
          <Route path="financial-mlm" element={<FinancialMlmManagement />} />
            <Route path="uploads" element={<AdminUploadsManager />} />
            <Route path="course-creation" element={<CourseCreationFlow />} />
            <Route path="course-creation/:courseId" element={<CourseCreationFlow />} />
            <Route path="courses-overview" element={<CourseOverview />} />
            <Route path="course-preview/:courseId" element={<CoursePreview />} />
            <Route path="hierarchy-requests" element={<HierarchyRequests />} />
            <Route path="admin-staff" element={<AdminStaffComingSoon />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="subscription" element={<SubscriptionManagement />} />
            <Route path="subscription-plans" element={<SubscriptionPlans />} />
            <Route path="courses" element={<CoursesManagement />} />
            <Route path="support" element={<SupportTickets />} />
            <Route path="mlm-management" element={<MlmManagement />} />
            <Route path="security" element={<SecurityDashboard />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="platform-config" element={<PlatformConfig />} />
            <Route path="debug-financial" element={<DebugFinancial />} />
            <Route path="messaging" element={<WhatsAppDashboard />} />
            <Route path="mail-setup" element={<MailSetup />} />
            <Route path="funnels" element={<FunnelsManagement />} />
            <Route path="funnels/manage/:funnelId" element={<FunnelManagement />} />
        </Route>
        {/* Standalone Editor Route - No Sidebar/Topbar */}
        <Route path="funnel_edit/:funnelId/:stageId" element={<ProtectedRoute><FunnelEditor /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;