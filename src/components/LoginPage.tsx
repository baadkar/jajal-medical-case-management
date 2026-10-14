import React, { useState } from 'react';
import { ApiService } from '../services/api.ts';
import { User } from '../types.ts';
import { 
  Activity, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Wrench, 
  AlertCircle, 
  ArrowRight,
  Stethoscope,
  FileCheck2
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await ApiService.login(email, password);
      if (response.success && response.data?.user) {
        onLoginSuccess(response.data.user);
      } else {
        setErrorMessage(response.message || 'These credentials do not match our records.');
      }
    } catch {
      setErrorMessage('Failed to connect to authentication service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await ApiService.login(userEmail, userPass);
      if (response.success && response.data?.user) {
        onLoginSuccess(response.data.user);
      } else {
        setErrorMessage(response.message || 'Login failed.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Gradient & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-xl shadow-teal-900/40">
            <Activity className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Jajal Medical
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Implant Case Management System (Laravel + React)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-800">
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 rounded-lg bg-rose-950/60 border border-rose-800 p-3.5 flex items-start gap-3 text-rose-200 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-rose-300">Authentication Failed:</span>{' '}
                {errorMessage}
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@jajalmedical.com"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Case Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Login Section for Reviewers */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Reviewer Test Accounts (1-Click)
            </p>
            <div className="grid grid-cols-1 gap-2">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@jajalmedical.com', 'Admin@12345')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                      Dr. Arthur Vance (Admin)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      admin@jajalmedical.com • Full Permissions
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Admin
                </span>
              </button>

              {/* Viewer Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('viewer@jajalmedical.com', 'Viewer@12345')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800/50">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                      Clara Oswald (Viewer)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      viewer@jajalmedical.com • Read-only
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  Viewer
                </span>
              </button>

              {/* Engineer Button (Bonus) */}
              <button
                type="button"
                onClick={() => handleQuickLogin('engineer@jajalmedical.com', 'Engineer@12345')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-blue-950 text-blue-400 border border-blue-800/50">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-300">
                      Marcus Brody (Engineer)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      engineer@jajalmedical.com • Create/Edit (No Delete)
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                  Bonus Role
                </span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" /> Medical Implant Portal
            </span>
            <span className="flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" /> Dummy Data Only
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
