export type UserRole = 'admin' | 'viewer' | 'engineer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  created_at: string;
}

export type CaseStatus = 'Draft' | 'Planning' | 'In Review' | 'Approved' | 'Completed' | 'Cancelled';
export type CasePriority = 'Low' | 'Medium' | 'High';

export interface MedicalCase {
  id: number;
  case_number: string;
  patient_reference: string;
  surgeon_name: string;
  implant_type: string;
  status: CaseStatus;
  priority: CasePriority;
  surgery_date: string | null;
  created_by: number;
  creator?: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface DashboardStats {
  total: number;
  planning: number;
  in_review: number;
  approved: number;
  completed: number;
  draft: number;
  cancelled: number;
  high_priority: number;
  upcoming_surgeries: number;
}

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
}

export interface TestResult {
  id: number;
  name: string;
  requirement: string;
  passed: boolean;
  status_code: number;
  expected_status: number;
  response_body: unknown;
  duration_ms: number;
  error?: string;
  details?: string;
}
