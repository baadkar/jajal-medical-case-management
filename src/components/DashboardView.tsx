import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api.ts';
import { DashboardStats, MedicalCase, User } from '../types.ts';
import { 
  FolderKanban, 
  CalendarClock, 
  SearchCheck, 
  CheckCircle, 
  Award, 
  FileEdit, 
  XCircle, 
  AlertTriangle,
  Plus, 
  ArrowUpRight, 
  Sparkles,
  Calendar,
  Clock
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  onOpenCreateCase: () => void;
  onSelectCase: (caseItem: MedicalCase) => void;
  onFilterByStatus: (status: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onOpenCreateCase,
  onSelectCase,
  onFilterByStatus,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCases, setRecentCases] = useState<MedicalCase[]>([]);
  const [loading, setLoading] = useState(true);

  const canCreate = currentUser.role === 'admin' || currentUser.role === 'engineer';

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, casesRes] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getCases({ page: 1, per_page: 5, sort_by: 'created_at', sort_dir: 'desc' }),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (casesRes.success && casesRes.data) {
        setRecentCases(casesRes.data.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Planning':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'In Review':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  if (loading && !stats) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading clinical case metrics...</p>
        </div>
      </div>
    );
  }

  // The 5 Mandatory Count Metrics from Section 4.2:
  // Total cases, Planning, In Review, Approved, Completed.
  const mandatoryMetrics = [
    {
      label: 'Total Cases',
      count: stats?.total ?? 0,
      icon: FolderKanban,
      color: 'bg-slate-900 text-white',
      badgeColor: 'bg-slate-800 text-slate-200',
      statusKey: 'All',
      desc: 'All tracked surgical cases',
    },
    {
      label: 'Planning',
      count: stats?.planning ?? 0,
      icon: CalendarClock,
      color: 'bg-purple-600 text-white',
      badgeColor: 'bg-purple-500 text-purple-100',
      statusKey: 'Planning',
      desc: 'Pre-op CAD & implant design',
    },
    {
      label: 'In Review',
      count: stats?.in_review ?? 0,
      icon: SearchCheck,
      color: 'bg-amber-500 text-white',
      badgeColor: 'bg-amber-600 text-amber-100',
      statusKey: 'In Review',
      desc: 'Surgeon clinical inspection',
    },
    {
      label: 'Approved',
      count: stats?.approved ?? 0,
      icon: CheckCircle,
      color: 'bg-emerald-600 text-white',
      badgeColor: 'bg-emerald-700 text-emerald-100',
      statusKey: 'Approved',
      desc: 'Cleared for surgical manufacture',
    },
    {
      label: 'Completed',
      count: stats?.completed ?? 0,
      icon: Award,
      color: 'bg-blue-600 text-white',
      badgeColor: 'bg-blue-700 text-blue-100',
      statusKey: 'Completed',
      desc: 'Surgery & implant successfully placed',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Clinical Implant Workflow
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Medical Case Dashboard
          </h1>
          <p className="mt-1 text-slate-300 text-sm max-w-2xl">
            Real-time status overview across orthopedic, cranial, and spinal custom implants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCreate ? (
            <button
              onClick={onOpenCreateCase}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Case</span>
            </button>
          ) : (
            <div className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800/80 px-3 py-2 rounded-lg">
              Viewing in read-only mode (Viewer role).
            </div>
          )}
        </div>
      </div>

      {/* 5 Mandatory Counts from Section 4.2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Lifecycle Case Counts (Section 4.2 Requirement)
          </h2>
          <span className="text-xs text-slate-400">Click any card to filter list</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {mandatoryMetrics.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => onFilterByStatus(item.statusKey)}
                className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer hover:border-teal-500"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {item.count}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Metrics Bar: Draft, Cancelled & High Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => onFilterByStatus('Draft')}
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Draft Stage</div>
              <div className="text-lg font-bold text-slate-900">{stats?.draft ?? 0} cases</div>
            </div>
          </div>
          <span className="text-xs text-teal-600 font-medium">Filter &rarr;</span>
        </div>

        <div 
          onClick={() => onFilterByStatus('Cancelled')}
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Cancelled Cases</div>
              <div className="text-lg font-bold text-slate-900">{stats?.cancelled ?? 0} cases</div>
            </div>
          </div>
          <span className="text-xs text-rose-600 font-medium">Filter &rarr;</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">High Priority Required</div>
              <div className="text-lg font-bold text-slate-900">{stats?.high_priority ?? 0} cases</div>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
            Urgent Attention
          </span>
        </div>
      </div>

      {/* Recent Cases Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Recent Implant Cases</h3>
            <p className="text-xs text-slate-500">Latest submissions and status changes</p>
          </div>
          <button
            onClick={() => onFilterByStatus('All')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
          >
            View all cases &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-5 py-3">Case Number</th>
                <th className="px-5 py-3">Patient Code</th>
                <th className="px-5 py-3">Surgeon</th>
                <th className="px-5 py-3">Implant Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Surgery Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentCases.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-semibold text-teal-700">
                    {c.case_number}
                  </td>
                  <td className="px-5 py-3 text-slate-600 font-mono text-xs">
                    {c.patient_reference}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {c.surgeon_name}
                  </td>
                  <td className="px-5 py-3 text-slate-600 max-w-xs truncate" title={c.implant_type}>
                    {c.implant_type}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(c.priority)}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {c.surgery_date ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {c.surgery_date}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unscheduled</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => onSelectCase(c)}
                      className="px-2.5 py-1 text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
