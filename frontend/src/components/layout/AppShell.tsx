import { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import {
  BarChart3,
  Building2,
  Globe2,
  LayoutDashboard,
  LogOut,
  MenuSquare,
  MonitorSmartphone,
  Settings,
  Shield,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../features/auth/AuthProvider';
import { Button } from '../ui/Button';

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  roles?: string[];
};

const tenantNav: NavItem[] = [
  { href: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
  { href: '/app/websites', label: 'Website', icon: <MonitorSmartphone className="size-4" /> },
  { href: '/app/menu', label: 'Menu', icon: <MenuSquare className="size-4" /> },
  { href: '/app/analytics', label: 'Analytics', icon: <BarChart3 className="size-4" /> },
  { href: '/app/domains', label: 'Domains', icon: <Globe2 className="size-4" />, roles: ['TENANT_ADMIN'] },
  { href: '/app/settings', label: 'Settings', icon: <Settings className="size-4" /> },
];

const adminNav: NavItem[] = [
  { href: '/admin/dashboard', label: 'Platform', icon: <Shield className="size-4" /> },
  { href: '/admin/tenants', label: 'Tenants', icon: <Building2 className="size-4" /> },
  { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="size-4" /> },
];

export function AppShell({ children, mode }: { children: ReactNode; mode: 'tenant' | 'admin' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = mode === 'admin' ? adminNav : tenantNav;
  const visibleNav = nav.filter((item) => !item.roles || item.roles.includes(user?.role ?? ''));

  async function handleLogout() {
    await logout();
    navigate('/auth/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <Link to={mode === 'admin' ? '/admin/dashboard' : '/app/dashboard'} className="font-semibold text-slate-950">
            UMKM Builder
          </Link>
        </div>
        <nav className="grid gap-1 p-3">
          {visibleNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <div>
            <p className="text-sm font-medium text-slate-900">{user?.email}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white p-1 lg:hidden">
        {visibleNav.slice(0, 4).map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'grid place-items-center gap-1 rounded-md px-2 py-2 text-xs',
                isActive ? 'text-teal-800' : 'text-slate-500',
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
