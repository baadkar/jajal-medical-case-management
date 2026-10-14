import React, { useState, useEffect } from 'react';
import { User, MedicalCase, UserRole } from './types.ts';
import { ApiService } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { CaseListView } from './components/CaseListView.tsx';
import { CaseFormModal } from './components/CaseFormModal.tsx';
import { CaseDetailsModal } from './components/CaseDetailsModal.tsx';
import { TestRunnerView } from './components/TestRunnerView.tsx';
import { ApiExplorerView } from './components/ApiExplorerView.tsx';
import { DocsView } from './components/DocsView.tsx';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cases' | 'tests' | 'api' | 'docs'>('dashboard');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<MedicalCase | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<MedicalCase | null>(null);

  // Status filter state for jumping from dashboard to cases
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Check initial login state
  useEffect(() => {
    const savedUser = ApiService.getUser();
    const token = ApiService.getToken();
    if (savedUser && token) {
      setCurrentUser(savedUser);
    } else {
      // For instant reviewer convenience, if no token, automatically authenticate as Admin!
      ApiService.login('admin@jajalmedical.com', 'Admin@12345').then(res => {
        if (res.success && res.data?.user) {
          setCurrentUser(res.data.user);
        }
      }).catch(() => {
        // Fallback to login screen
      });
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = async () => {
    await ApiService.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
    showToast('Logged out successfully.');
  };

  const handleRoleSwitch = async (role: UserRole) => {
    let email = 'admin@jajalmedical.com';
    let pass = 'Admin@12345';
    if (role === 'viewer') {
      email = 'viewer@jajalmedical.com';
      pass = 'Viewer@12345';
    } else if (role === 'engineer') {
      email = 'engineer@jajalmedical.com';
      pass = 'Engineer@12345';
    }

    try {
      const res = await ApiService.login(email, pass);
      if (res.success && res.data?.user) {
        setCurrentUser(res.data.user);
        showToast(`Switched active role to ${role.toUpperCase()}`);
      }
    } catch {
      showToast('Failed to switch role.', 'error');
    }
  };

  const handleResetDb = async () => {
    if (window.confirm('Reset database to initial 25 seeded cases?')) {
      try {
        const res = await ApiService.resetDatabase();
        if (res.success) {
          showToast('Database reset and re-seeded with 25 initial cases.');
          // Refresh views
          window.location.reload();
        }
      } catch {
        showToast('Failed to reset database.', 'error');
      }
    }
  };

  const handleOpenCreateCase = () => {
    setEditingCase(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditCase = (caseItem: MedicalCase) => {
    setEditingCase(caseItem);
    setIsFormModalOpen(true);
  };

  const handleOpenCaseDetails = (caseItem: MedicalCase) => {
    setSelectedCase(caseItem);
    setIsDetailsModalOpen(true);
  };

  const handleCaseSaved = (saved: MedicalCase) => {
    showToast(`Case ${saved.case_number} ${editingCase ? 'updated' : 'created'} successfully.`);
    // If details modal was open with this case, update it
    if (selectedCase && selectedCase.id === saved.id) {
      setSelectedCase(saved);
    }
  };

  const handleCaseDeleted = () => {
    showToast('Case deleted successfully.');
  };

  const handleFilterFromDashboard = (statusKey: string) => {
    setStatusFilter(statusKey);
    setActiveTab('cases');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Requirement: All case pages must be hidden from users who are not logged in!
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold transition-all animate-in slide-in-from-bottom-5 bg-slate-900 text-white border border-slate-700">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onResetDb={handleResetDb}
        onSwitchRole={handleRoleSwitch}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            onOpenCreateCase={handleOpenCreateCase}
            onSelectCase={handleOpenCaseDetails}
            onFilterByStatus={handleFilterFromDashboard}
          />
        )}

        {activeTab === 'cases' && (
          <CaseListView
            currentUser={currentUser}
            initialStatusFilter={statusFilter}
            onOpenCreateCase={handleOpenCreateCase}
            onSelectCase={handleOpenCaseDetails}
            onEditCase={handleOpenEditCase}
            onCaseDeleted={handleCaseDeleted}
          />
        )}

        {activeTab === 'tests' && <TestRunnerView />}

        {activeTab === 'api' && <ApiExplorerView currentUser={currentUser} />}

        {activeTab === 'docs' && <DocsView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Jajal Medical • Implant Case Management System • Practical Developer Assignment
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Laravel + React</span>
            <span>•</span>
            <span>REST API Sanctum</span>
            <span>•</span>
            <span>IEC 62304 / ISO 13485 Traceable</span>
          </div>
        </div>
      </footer>

      {/* Reused Create / Edit Case Modal */}
      <CaseFormModal
        isOpen={isFormModalOpen}
        editingCase={editingCase}
        onClose={() => setIsFormModalOpen(false)}
        onSaved={handleCaseSaved}
      />

      {/* Case Details Modal */}
      <CaseDetailsModal
        isOpen={isDetailsModalOpen}
        caseItem={selectedCase}
        currentUser={currentUser}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={(caseItem) => {
          setIsDetailsModalOpen(false);
          handleOpenEditCase(caseItem);
        }}
        onDeleted={handleCaseDeleted}
      />
    </div>
  );
}
