import React from 'react';
import { User, UserRole } from '../types.ts';
import { 
  Activity, 
  LayoutDashboard, 
  FolderKanban, 
  FlaskConical, 
  Terminal, 
  FileText, 
  LogOut, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Wrench,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  user: User;
  activeTab: 'dashboard' | 'cases' | 'tests' | 'api' | 'docs';
  setActiveTab: (tab: 'dashboard' | 'cases' | 'tests' | 'api' | 'docs') => void;
  onLogout: () => void;
  onResetDb: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onResetDb,
  onSwitchRole,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </span>
        );
      case 'engineer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Wrench className="w-3.5 h-3.5" />
            Engineer (Bonus)
          </span>
        );
      case 'viewer':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Viewer (Read-only)
          </span>
        );
    }
  };

  interface NavItem {
    id: 'dashboard' | 'cases' | 'tests' | 'api' | 'docs';
    label: string;
    icon: React.ElementType;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Implant Cases', icon: FolderKanban },
    { id: 'tests', label: 'Automated Tests', icon: FlaskConical, badge: '7 Tests' },
    { id: 'api', label: 'REST API Playground', icon: Terminal },
    { id: 'docs', label: 'Docs & Traceability', icon: FileText },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-600 text-white shadow-inner">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">Jajal Medical</span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 border border-teal-500/30">
                  Case Management
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Patient-Specific Implant Case Tracking
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-teal-900 text-teal-200 border border-teal-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Role Switcher & User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Role Switcher for Reviewers */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 border border-slate-700 transition-colors"
                title="Reviewer tool: Switch active test role instantly"
              >
                <span>Role:</span>
                {getRoleBadge(user.role)}
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                    Switch Active User / Role
                  </div>
                  <button
                    onClick={() => {
                      onSwitchRole('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 ${
                      user.role === 'admin' ? 'bg-slate-700/50 text-teal-300 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div>Dr. Arthur Vance (Admin)</div>
                      <div className="text-[10px] text-slate-400">Full CRUD + Delete permission</div>
                    </div>
                    {user.role === 'admin' && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                  </button>
                  <button
                    onClick={() => {
                      onSwitchRole('viewer');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 ${
                      user.role === 'viewer' ? 'bg-slate-700/50 text-amber-300 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div>Clara Oswald (Viewer)</div>
                      <div className="text-[10px] text-slate-400">Read-only (403 on create/delete)</div>
                    </div>
                    {user.role === 'viewer' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </button>
                  <button
                    onClick={() => {
                      onSwitchRole('engineer');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 ${
                      user.role === 'engineer' ? 'bg-slate-700/50 text-blue-300 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div>Marcus Brody (Engineer)</div>
                      <div className="text-[10px] text-slate-400">Create & Edit, NO delete (Bonus)</div>
                    </div>
                    {user.role === 'engineer' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Reset DB Button */}
            <button
              onClick={onResetDb}
              title="Reset seeded demo cases"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-900 text-teal-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2">
              <div className="text-xs text-slate-400">
                Logged in as: <span className="text-white font-medium">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
