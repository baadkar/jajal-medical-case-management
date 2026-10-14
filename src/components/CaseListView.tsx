import React, { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api.ts';
import { MedicalCase, User } from '../types.ts';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface CaseListViewProps {
  currentUser: User;
  initialStatusFilter?: string;
  onOpenCreateCase: () => void;
  onSelectCase: (caseItem: MedicalCase) => void;
  onEditCase: (caseItem: MedicalCase) => void;
  onCaseDeleted: () => void;
}

export const CaseListView: React.FC<CaseListViewProps> = ({
  currentUser,
  initialStatusFilter = 'All',
  onOpenCreateCase,
  onSelectCase,
  onEditCase,
  onCaseDeleted,
}) => {
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Pagination (10 per page strictly per Section 4.3)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCases, setTotalCases] = useState(0);
  const [fromCount, setFromCount] = useState(0);
  const [toCount, setToCount] = useState(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<MedicalCase | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Permissions based on user role
  const canCreate = currentUser.role === 'admin' || currentUser.role === 'engineer';
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'engineer';
  const canDelete = currentUser.role === 'admin';

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getCases({
        page: currentPage,
        per_page: 10,
        search,
        status: statusFilter,
        priority: priorityFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
      });

      if (res.success && res.data) {
        setCases(res.data.data);
        setCurrentPage(res.data.current_page);
        setTotalPages(res.data.last_page);
        setTotalCases(res.data.total);
        setFromCount(res.data.from);
        setToCount(res.data.to);
      }
    } catch (e) {
      console.error('Error fetching cases:', e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, priorityFilter, sortBy, sortDir]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handlePriorityChange = (val: string) => {
    setPriorityFilter(val);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await ApiService.deleteCase(deleteTarget.id);
      if (res.success) {
        setDeleteTarget(null);
        onCaseDeleted();
        loadCases();
      } else {
        // Backend blocked! (e.g. 403 Forbidden for Viewer or Engineer)
        setDeleteError(res.message || 'Server rejected delete request (HTTP 403).');
      }
    } catch {
      setDeleteError('An unexpected network error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
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

  return (
    <div className="space-y-5">
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Implant Cases Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Search, filter, and manage patient-specific implant workflows.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={onOpenCreateCase}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Implant Case</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Case Number or Surgeon Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search Case # or Surgeon..."
              className="block w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="block w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Planning">Planning</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Filter by Priority (Bonus task) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="block w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setPriorityFilter('All');
                setCurrentPage(1);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(statusFilter !== 'All' || priorityFilter !== 'All' || search) && (
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Active filters:</span>
            {search && (
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-medium">
                Keyword: "{search}"
              </span>
            )}
            {statusFilter !== 'All' && (
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-medium">
                Status: {statusFilter}
              </span>
            )}
            {priorityFilter !== 'All' && (
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-medium">
                Priority: {priorityFilter}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Case Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-xs text-slate-400">Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-16 text-center px-4">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No cases match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or status filters to view existing implant records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold select-none">
                <tr>
                  <th 
                    onClick={() => handleSort('case_number')} 
                    className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Case #</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5">Patient Ref</th>
                  <th 
                    onClick={() => handleSort('surgeon_name')}
                    className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Surgeon Name</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5">Implant Type</th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('priority')}
                    className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Priority</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('surgery_date')}
                    className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Surgery Date</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-teal-700 whitespace-nowrap">
                      {c.case_number}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-xs whitespace-nowrap">
                      {c.patient_reference}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      {c.surgeon_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={c.implant_type}>
                      {c.implant_type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {c.surgery_date ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {c.surgery_date}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Button - Shown to ALL roles (Admin, Viewer, Engineer) */}
                        <button
                          onClick={() => onSelectCase(c)}
                          title="View case details"
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button - Shown only to roles allowed (Admin, Engineer) */}
                        {canEdit && (
                          <button
                            onClick={() => onEditCase(c)}
                            title="Edit case"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button - Shown ONLY to Admin role per strict requirement! */}
                        {canDelete && (
                          <button
                            onClick={() => {
                              setDeleteTarget(c);
                              setDeleteError(null);
                            }}
                            title="Delete case (Admin only)"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar (10 per page strictly) */}
        {!loading && cases.length > 0 && (
          <div className="px-4 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-800">{fromCount}</span> to{' '}
              <span className="font-semibold text-slate-800">{toCount}</span> of{' '}
              <span className="font-semibold text-slate-800">{totalCases}</span> cases (10 per page)
            </div>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-2 py-1 font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Case Deletion</h3>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to permanently delete case{' '}
              <span className="font-semibold text-slate-900">{deleteTarget.case_number}</span> (
              {deleteTarget.implant_type})? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                <span className="font-semibold">Error:</span> {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                {deleting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
