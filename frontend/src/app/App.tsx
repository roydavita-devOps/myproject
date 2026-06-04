import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../features/auth/useAuth';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { TenantDashboardPage } from '../features/dashboard/TenantDashboardPage';
import { AdminDashboardPage } from '../features/dashboard/AdminDashboardPage';
import { TenantListPage } from '../features/tenants/TenantListPage';
import { WebsiteListPage } from '../features/websites/WebsiteListPage';
import { WebsiteEditorPage } from '../features/websites/WebsiteEditorPage';
import { WebsitePreviewPage } from '../features/websites/WebsitePreviewPage';
import { MenuManagementPage } from '../features/menus/MenuManagementPage';
import { PublicSitePage } from '../features/public-site/PublicSitePage';
import { PlaceholderPage } from '../pages/PlaceholderPage';

function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user?.role ?? '')) return <Navigate to="/" replace />;
  return <Outlet />;
}

function GuestRoute() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Outlet />;
  return <Navigate to={user?.role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/app/dashboard'} replace />;
}

function TenantLayout() {
  return (
    <AppShell mode="tenant">
      <Outlet />
    </AppShell>
  );
}

function AdminLayout() {
  return (
    <AppShell mode="admin">
      <Outlet />
    </AppShell>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user) return <Navigate to="/app/dashboard" replace />;
  return <Navigate to="/auth/login" replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route element={<GuestRoute />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['TENANT_ADMIN', 'EDITOR']} />}>
        <Route path="/app" element={<TenantLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<TenantDashboardPage />} />
          <Route path="websites" element={<WebsiteListPage />} />
          <Route path="websites/:websiteId/preview" element={<WebsitePreviewPage />} />
          <Route path="websites/:websiteId" element={<WebsiteEditorPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
          <Route path="domains" element={<PlaceholderPage title="Domains" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['SUPER_ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="tenants" element={<TenantListPage />} />
          <Route path="analytics" element={<PlaceholderPage title="Platform Analytics" />} />
        </Route>
      </Route>
      <Route path="/site/:slug" element={<PublicSitePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
