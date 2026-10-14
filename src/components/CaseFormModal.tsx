import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api.ts';
import { MedicalCase, CaseStatus, CasePriority, PublicHoliday } from '../types.ts';
import { 
  X, 
  Save, 
  AlertCircle, 
  Calendar, 
  Sparkles, 
  Info,
  Clock
} from 'lucide-react';

interface CaseFormModalProps {
  isOpen: boolean;
  editingCase: MedicalCase | null;
  onClose: () => void;
  onSaved: (savedCase: MedicalCase) => void;
}

const STATUS_OPTIONS: CaseStatus[] = [
  'Draft', 
  'Planning', 
  'In Review', 
  'Approved', 
  'Completed', 
  'Cancelled'
];

const PRIORITY_OPTIONS: CasePriority[] = [
  'Low', 
  'Medium', 
  'High'
];

const COMMON_IMPLANTS = [
  'Titanium Cranial Plate 3D-Custom',
  'Acetabular Hip Reconstruction Cup',
  'Lumbar Spinal Fusion Cage L4-L5',
  'Bicondylar Knee Modular Insert',
  'Patient-Specific Mandibular Reconstruction',
  'Cervical Disc Prosthesis C5-C6',
  'Reverse Shoulder Glenoid Baseplate',
  'Femoral Stem Pro-Fit Cementless',
  'Temporomandibular Joint Total Replacement (TMJ)',
  'Custom Craniofacial PEEK Implant',
];

export const CaseFormModal: React.FC<CaseFormModalProps> = ({
  isOpen,
  editingCase,
  onClose,
  onSaved,
}) => {
  const [caseNumber, setCaseNumber] = useState('');
  const [patientReference, setPatientReference] = useState('');
  const [surgeonName, setSurgeonName] = useState('');
  const [implantType, setImplantType] = useState('');
  const [status, setStatus] = useState<CaseStatus>('Draft');
  const [priority, setPriority] = useState<CasePriority>('Medium');
  const [surgeryDate, setSurgeryDate] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Bonus task: Public holidays from Nager.Date
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [matchingHoliday, setMatchingHoliday] = useState<PublicHoliday | null>(null);

  // Reset or populate form when modal opens or editingCase changes
  useEffect(() => {
    if (editingCase) {
      setCaseNumber(editingCase.case_number);
      setPatientReference(editingCase.patient_reference);
      setSurgeonName(editingCase.surgeon_name);
      setImplantType(editingCase.implant_type);
      setStatus(editingCase.status);
      setPriority(editingCase.priority);
      setSurgeryDate(editingCase.surgery_date || '');
    } else {
      // Create mode default values
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setCaseNumber(`CASE-${randomSuffix}`);
      setPatientReference(`PT-${Math.floor(1000 + Math.random() * 9000)}`);
      setSurgeonName('');
      setImplantType('');
      setStatus('Draft');
      setPriority('Medium');
      setSurgeryDate('');
    }
    setFieldErrors({});
    setGeneralError(null);
  }, [editingCase, isOpen]);

  // Load public holidays for the chosen year (Bonus task)
  useEffect(() => {
    const yr = surgeryDate ? new Date(surgeryDate).getFullYear() : new Date().getFullYear();
    ApiService.getHolidays(yr).then(res => {
      if (res.success && res.data) {
        setHolidays(res.data);
      }
    }).catch(err => {
      console.warn('Could not fetch public holidays:', err);
    });
  }, [surgeryDate]);

  // Check if surgery date matches any holiday
  useEffect(() => {
    if (!surgeryDate) {
      setMatchingHoliday(null);
      return;
    }
    const match = holidays.find(h => h.date === surgeryDate);
    setMatchingHoliday(match || null);
  }, [surgeryDate, holidays]);

  if (!isOpen) return null;

  const handleGenerateCaseNumber = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setCaseNumber(`CASE-${randomSuffix}`);
    if (fieldErrors.case_number) {
      const next = { ...fieldErrors };
      delete next.case_number;
      setFieldErrors(next);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    const payload = {
      case_number: caseNumber,
      patient_reference: patientReference,
      surgeon_name: surgeonName,
      implant_type: implantType,
      status,
      priority,
      surgery_date: surgeryDate || null,
    };

    try {
      const res = editingCase
        ? await ApiService.updateCase(editingCase.id, payload)
        : await ApiService.createCase(payload);

      if (res.success && res.data) {
        onSaved(res.data);
        onClose();
      } else {
        // Validation errors returned from server (HTTP 422)
        if (res.errors) {
          setFieldErrors(res.errors);
        }
        setGeneralError(res.message || 'Validation failed. Please correct the highlighted errors.');
      }
    } catch {
      setGeneralError('Network error communicating with the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              {editingCase ? `Edit Case: ${editingCase.case_number}` : 'Create New Implant Case'}
            </h2>
            <p className="text-xs text-slate-400">
              {editingCase 
                ? 'Update surgical case parameters and status' 
                : 'Register a patient-specific medical implant case'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <span className="font-semibold">Error:</span> {generalError}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Case Number */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Case Number <span className="text-rose-500">*</span>
                </label>
                {!editingCase && (
                  <button
                    type="button"
                    onClick={handleGenerateCaseNumber}
                    className="text-[10px] text-teal-600 hover:text-teal-700 font-medium flex items-center gap-0.5 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Auto
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="e.g. CASE-0001"
                className={`mt-1 block w-full px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.case_number 
                    ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-rose-500' 
                    : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                }`}
              />
              {fieldErrors.case_number && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {fieldErrors.case_number[0]}
                </p>
              )}
            </div>

            {/* Patient Reference */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Patient Reference <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={patientReference}
                onChange={(e) => setPatientReference(e.target.value)}
                placeholder="e.g. PT-9801 (dummy code)"
                className={`mt-1 block w-full px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.patient_reference 
                    ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-rose-500' 
                    : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                }`}
              />
              {fieldErrors.patient_reference && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {fieldErrors.patient_reference[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Surgeon Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Surgeon Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={surgeonName}
                onChange={(e) => setSurgeonName(e.target.value)}
                placeholder="e.g. Dr. Sarah Mitchell"
                className={`mt-1 block w-full px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.surgeon_name 
                    ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-rose-500' 
                    : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                }`}
              />
              {fieldErrors.surgeon_name && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {fieldErrors.surgeon_name[0]}
                </p>
              )}
            </div>

            {/* Implant Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Implant Type <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="implant-presets"
                required
                value={implantType}
                onChange={(e) => setImplantType(e.target.value)}
                placeholder="Select or type implant device"
                className={`mt-1 block w-full px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.implant_type 
                    ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-rose-500' 
                    : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                }`}
              />
              <datalist id="implant-presets">
                {COMMON_IMPLANTS.map(item => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              {fieldErrors.implant_type && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {fieldErrors.implant_type[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.status 
                    ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-rose-500' 
                    : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                }`}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {fieldErrors.status && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {fieldErrors.status[0]}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Priority <span className="text-rose-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.priority 
                    ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-rose-500' 
                    : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                }`}
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {fieldErrors.priority && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {fieldErrors.priority[0]}
                </p>
              )}
            </div>
          </div>

          {/* Surgery Date + Public Holiday Bonus Alert */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Surgery Date (Optional)
              </label>
              <span className="text-[10px] text-slate-400">YYYY-MM-DD</span>
            </div>
            <div className="relative mt-1">
              <input
                type="date"
                value={surgeryDate}
                onChange={(e) => setSurgeryDate(e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.surgery_date 
                    ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-rose-500' 
                    : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                }`}
              />
            </div>
            {fieldErrors.surgery_date && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {fieldErrors.surgery_date[0]}
              </p>
            )}

            {/* Bonus Task Public Holiday Callout */}
            {matchingHoliday && (
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800 animate-in fade-in">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-900">Public Holiday Alert (Nager.Date API):</span>{' '}
                  The selected date coincides with <strong>{matchingHoliday.name}</strong> ({matchingHoliday.localName}). Confirm surgical suite on-call coverage.
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{editingCase ? 'Update Case' : 'Create Case'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
