import React, { useState } from 'react';
import { MedicalCase, User } from '../types.ts';
import { ApiService } from '../services/api.ts';
import { 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  UserCheck, 
  Clock, 
  Stethoscope, 
  Fingerprint, 
  Tag, 
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';

interface CaseDetailsModalProps {
  isOpen: boolean;
  caseItem: MedicalCase | null;
  currentUser: User;
  onClose: () => void;
  onEdit: (caseItem: MedicalCase) => void;
  onDeleted: () => void;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  isOpen,
  caseItem,
  currentUser,
  onClose,
  onEdit,
  onDeleted,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!isOpen || !caseItem) return null;

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'engineer';
  const canDelete = currentUser.role === 'admin';

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete case ${caseItem.case_number}?`)) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await ApiService.deleteCase(caseItem.id);
      if (res.success) {
        onDeleted();
        onClose();
      } else {
        // Server blocked delete (HTTP 403)
        setDeleteError(res.message || 'Server rejected delete request (HTTP 403 Forbidden).');
      }
    } catch {
      setDeleteError('An unexpected network error occurred.');
    } finally {
      setDeleting(false);
    }
  };

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

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                Medical Case Record
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                ID #{caseItem.id}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 tracking-tight flex items-center gap-2">
              {caseItem.case_number}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Error Notification */}
        {deleteError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-700 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <span className="font-semibold">Authorization Error:</span> {deleteError}
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="p-6 space-y-5 text-sm">
          
          {/* Status & Priority Row */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Current Status
              </div>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(caseItem.status)}`}>
                  {caseItem.status}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Clinical Priority
              </div>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(caseItem.priority)}`}>
                  {caseItem.priority}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Surgery Schedule
              </div>
              <div className="mt-1 font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <Calendar className="w-4 h-4 text-slate-400" />
                {caseItem.surgery_date || <span className="italic text-slate-400">Not scheduled</span>}
              </div>
            </div>
          </div>

          {/* Clinical Specifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Implant & Surgeon Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-teal-600" />
                  Patient Reference Code
                </div>
                <div className="mt-1 font-mono font-semibold text-slate-900 text-sm">
                  {caseItem.patient_reference}
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  Lead Operating Surgeon
                </div>
                <div className="mt-1 font-semibold text-slate-900 text-sm">
                  {caseItem.surgeon_name}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                Implant Device Specification
              </div>
              <div className="mt-1 font-semibold text-slate-900 text-sm">
                {caseItem.implant_type}
              </div>
            </div>
          </div>

          {/* Audit Trail: Created By and Timestamps per Section 4.5 */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Traceability & Audit Metadata
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Created By (Foreign Key)</div>
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                    {caseItem.creator ? caseItem.creator.name : `User ID #${caseItem.created_by}`}
                  </div>
                  {caseItem.creator && (
                    <div className="text-[11px] text-slate-400">
                      {caseItem.creator.email} ({caseItem.creator.role})
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                Author
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Created At</div>
                  <div className="font-semibold text-slate-700">{formatDate(caseItem.created_at)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Last Updated At</div>
                  <div className="font-semibold text-slate-700">{formatDate(caseItem.updated_at)}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div>
            {canDelete && (
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <span className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete Case</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-white cursor-pointer"
            >
              Close
            </button>
            {canEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(caseItem);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Case</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
