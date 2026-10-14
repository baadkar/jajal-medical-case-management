import { ApiResponse, MedicalCase, PaginatedData, DashboardStats, PublicHoliday, User } from '../types.ts';

const TOKEN_STORAGE_KEY = 'jajal_medical_token';
const USER_STORAGE_KEY = 'jajal_medical_user';

export class ApiService {
  public static getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  public static setAuth(token: string, user: User): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  public static getUser(): User | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  public static clearAuth(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  private static getHeaders(includeAuth = true): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // Auth: POST /api/login
  public static async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.data?.token) {
      this.setAuth(data.data.token, data.data.user);
    }
    return data;
  }

  // Auth: POST /api/logout
  public static async logout(): Promise<void> {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: this.getHeaders(true),
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      this.clearAuth();
    }
  }

  // GET /api/dashboard/stats
  public static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const res = await fetch('/api/dashboard/stats', {
      headers: this.getHeaders(true),
    });
    return res.json();
  }

  // GET /api/cases
  public static async getCases(params: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    priority?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedData<MedicalCase>>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.priority && params.priority !== 'All') query.set('priority', params.priority);
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_dir) query.set('sort_dir', params.sort_dir);

    const res = await fetch(`/api/cases?${query.toString()}`, {
      headers: this.getHeaders(true),
    });
    return res.json();
  }

  // GET /api/cases/:id
  public static async getCase(id: number): Promise<ApiResponse<MedicalCase>> {
    const res = await fetch(`/api/cases/${id}`, {
      headers: this.getHeaders(true),
    });
    return res.json();
  }

  // POST /api/cases
  public static async createCase(caseData: {
    case_number: string;
    patient_reference: string;
    surgeon_name: string;
    implant_type: string;
    status: string;
    priority: string;
    surgery_date?: string | null;
  }): Promise<ApiResponse<MedicalCase>> {
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(caseData),
    });
    return res.json();
  }

  // PUT /api/cases/:id
  public static async updateCase(id: number, caseData: {
    case_number: string;
    patient_reference: string;
    surgeon_name: string;
    implant_type: string;
    status: string;
    priority: string;
    surgery_date?: string | null;
  }): Promise<ApiResponse<MedicalCase>> {
    const res = await fetch(`/api/cases/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(caseData),
    });
    return res.json();
  }

  // DELETE /api/cases/:id
  public static async deleteCase(id: number): Promise<ApiResponse<null>> {
    const res = await fetch(`/api/cases/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return res.json();
  }

  // GET /api/holidays
  public static async getHolidays(year?: number): Promise<ApiResponse<PublicHoliday[]>> {
    const yr = year || new Date().getFullYear();
    const res = await fetch(`/api/holidays?year=${yr}&country=US`);
    return res.json();
  }

  // POST /api/database/reset
  public static async resetDatabase(): Promise<ApiResponse<null>> {
    const res = await fetch('/api/database/reset', {
      method: 'POST',
      headers: this.getHeaders(false),
    });
    return res.json();
  }

  // POST /api/tests/run
  public static async runTests(): Promise<ApiResponse<{
    total: number;
    passed: number;
    failed: number;
    duration_ms: number;
    results: Array<{
      id: number;
      name: string;
      requirement: string;
      passed: boolean;
      status_code: number;
      expected_status: number;
      response_body: unknown;
      duration_ms: number;
      details?: string;
    }>;
  }>> {
    const res = await fetch('/api/tests/run', {
      method: 'POST',
      headers: this.getHeaders(false),
    });
    return res.json();
  }
}
