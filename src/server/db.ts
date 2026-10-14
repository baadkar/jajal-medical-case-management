import { MedicalCase, User, CaseStatus, CasePriority } from '../types.ts';

// Initial users per PDF specification
const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Dr. Arthur Vance (Admin)',
    email: 'admin@jajalmedical.com',
    role: 'admin',
    password: 'Admin@12345',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 2,
    name: 'Clara Oswald (Viewer)',
    email: 'viewer@jajalmedical.com',
    role: 'viewer',
    password: 'Viewer@12345',
    created_at: '2026-09-01T08:05:00Z',
  },
  {
    id: 3,
    name: 'Marcus Brody (Engineer)',
    email: 'engineer@jajalmedical.com',
    role: 'engineer',
    password: 'Engineer@12345',
    created_at: '2026-09-01T08:10:00Z',
  },
];

// Initial seeded dummy cases (25 cases) per PDF requirement (at least 20 dummy cases)
const INITIAL_CASES: Omit<MedicalCase, 'creator'>[] = [
  {
    id: 1,
    case_number: 'CASE-0001',
    patient_reference: 'PT-9801',
    surgeon_name: 'Dr. Sarah Mitchell',
    implant_type: 'Titanium Cranial Plate 3D-Custom',
    status: 'Approved',
    priority: 'High',
    surgery_date: '2026-10-25',
    created_by: 1,
    created_at: '2026-10-01T09:15:00Z',
    updated_at: '2026-10-05T14:30:00Z',
  },
  {
    id: 2,
    case_number: 'CASE-0002',
    patient_reference: 'PT-4122',
    surgeon_name: 'Dr. James Wilson',
    implant_type: 'Acetabular Hip Reconstruction Cup',
    status: 'Planning',
    priority: 'Medium',
    surgery_date: '2026-11-02',
    created_by: 1,
    created_at: '2026-10-02T10:00:00Z',
    updated_at: '2026-10-02T10:00:00Z',
  },
  {
    id: 3,
    case_number: 'CASE-0003',
    patient_reference: 'PT-3390',
    surgeon_name: 'Dr. Elena Rostova',
    implant_type: 'Lumbar Spinal Fusion Cage L4-L5',
    status: 'In Review',
    priority: 'High',
    surgery_date: '2026-10-28',
    created_by: 1,
    created_at: '2026-10-03T11:20:00Z',
    updated_at: '2026-10-06T16:45:00Z',
  },
  {
    id: 4,
    case_number: 'CASE-0004',
    patient_reference: 'PT-7104',
    surgeon_name: 'Dr. Marcus Vance',
    implant_type: 'Bicondylar Knee Modular Insert',
    status: 'Completed',
    priority: 'Low',
    surgery_date: '2026-10-08',
    created_by: 1,
    created_at: '2026-09-20T08:30:00Z',
    updated_at: '2026-10-09T17:00:00Z',
  },
  {
    id: 5,
    case_number: 'CASE-0005',
    patient_reference: 'PT-5291',
    surgeon_name: 'Dr. Sarah Mitchell',
    implant_type: 'Patient-Specific Mandibular Reconstruction',
    status: 'Planning',
    priority: 'High',
    surgery_date: '2026-11-15',
    created_by: 3,
    created_at: '2026-10-04T13:00:00Z',
    updated_at: '2026-10-04T13:00:00Z',
  },
  {
    id: 6,
    case_number: 'CASE-0006',
    patient_reference: 'PT-8942',
    surgeon_name: 'Dr. Kenji Sato',
    implant_type: 'Cervical Disc Prosthesis C5-C6',
    status: 'Approved',
    priority: 'Medium',
    surgery_date: '2026-10-30',
    created_by: 1,
    created_at: '2026-10-04T14:10:00Z',
    updated_at: '2026-10-07T11:20:00Z',
  },
  {
    id: 7,
    case_number: 'CASE-0007',
    patient_reference: 'PT-1038',
    surgeon_name: 'Dr. David Kim',
    implant_type: 'Reverse Shoulder Glenoid Baseplate',
    status: 'In Review',
    priority: 'Medium',
    surgery_date: '2026-11-05',
    created_by: 3,
    created_at: '2026-10-05T09:45:00Z',
    updated_at: '2026-10-08T15:10:00Z',
  },
  {
    id: 8,
    case_number: 'CASE-0008',
    patient_reference: 'PT-6621',
    surgeon_name: 'Dr. James Wilson',
    implant_type: 'Femoral Stem Pro-Fit Cementless',
    status: 'Draft',
    priority: 'Low',
    surgery_date: null,
    created_by: 1,
    created_at: '2026-10-05T16:00:00Z',
    updated_at: '2026-10-05T16:00:00Z',
  },
  {
    id: 9,
    case_number: 'CASE-0009',
    patient_reference: 'PT-2287',
    surgeon_name: 'Dr. Elena Rostova',
    implant_type: 'Thoracic Deformity Correction Rods',
    status: 'Approved',
    priority: 'High',
    surgery_date: '2026-10-22',
    created_by: 1,
    created_at: '2026-10-06T10:30:00Z',
    updated_at: '2026-10-08T09:00:00Z',
  },
  {
    id: 10,
    case_number: 'CASE-0010',
    patient_reference: 'PT-4419',
    surgeon_name: 'Dr. Rachel Adams',
    implant_type: 'Porous Titanium Maxillofacial Mesh',
    status: 'Completed',
    priority: 'Medium',
    surgery_date: '2026-10-04',
    created_by: 1,
    created_at: '2026-09-18T11:00:00Z',
    updated_at: '2026-10-05T12:00:00Z',
  },
  {
    id: 11,
    case_number: 'CASE-0011',
    patient_reference: 'PT-7734',
    surgeon_name: 'Dr. Kenji Sato',
    implant_type: 'Anterior Cruciate Ligament Interference Screw',
    status: 'Draft',
    priority: 'Low',
    surgery_date: null,
    created_by: 3,
    created_at: '2026-10-06T15:20:00Z',
    updated_at: '2026-10-06T15:20:00Z',
  },
  {
    id: 12,
    case_number: 'CASE-0012',
    patient_reference: 'PT-3105',
    surgeon_name: 'Dr. Sarah Mitchell',
    implant_type: 'Custom Rib Splint Reconstruction',
    status: 'Planning',
    priority: 'Medium',
    surgery_date: '2026-11-12',
    created_by: 1,
    created_at: '2026-10-07T08:50:00Z',
    updated_at: '2026-10-07T08:50:00Z',
  },
  {
    id: 13,
    case_number: 'CASE-0013',
    patient_reference: 'PT-9982',
    surgeon_name: 'Dr. David Kim',
    implant_type: 'Trabecular Metal Total Ankle Arthroplasty',
    status: 'In Review',
    priority: 'High',
    surgery_date: '2026-11-18',
    created_by: 3,
    created_at: '2026-10-07T14:15:00Z',
    updated_at: '2026-10-09T10:30:00Z',
  },
  {
    id: 14,
    case_number: 'CASE-0014',
    patient_reference: 'PT-6029',
    surgeon_name: 'Dr. James Wilson',
    implant_type: 'Subtrochanteric Intramedullary Nail',
    status: 'Approved',
    priority: 'High',
    surgery_date: '2026-10-26',
    created_by: 1,
    created_at: '2026-10-08T09:10:00Z',
    updated_at: '2026-10-10T14:20:00Z',
  },
  {
    id: 15,
    case_number: 'CASE-0015',
    patient_reference: 'PT-1845',
    surgeon_name: 'Dr. Elena Rostova',
    implant_type: 'Occipito-Cervical Fixation Plate',
    status: 'Cancelled',
    priority: 'Medium',
    surgery_date: null,
    created_by: 1,
    created_at: '2026-10-08T11:40:00Z',
    updated_at: '2026-10-11T16:00:00Z',
  },
  {
    id: 16,
    case_number: 'CASE-0016',
    patient_reference: 'PT-8233',
    surgeon_name: 'Dr. Marcus Vance',
    implant_type: 'Unicompartmental Knee Resurfacing',
    status: 'Planning',
    priority: 'Low',
    surgery_date: '2026-11-20',
    created_by: 3,
    created_at: '2026-10-09T10:00:00Z',
    updated_at: '2026-10-09T10:00:00Z',
  },
  {
    id: 17,
    case_number: 'CASE-0017',
    patient_reference: 'PT-5570',
    surgeon_name: 'Dr. Rachel Adams',
    implant_type: 'Orbital Floor Titanium Mesh Pre-Formed',
    status: 'Approved',
    priority: 'Medium',
    surgery_date: '2026-11-04',
    created_by: 1,
    created_at: '2026-10-09T13:30:00Z',
    updated_at: '2026-10-12T09:15:00Z',
  },
  {
    id: 18,
    case_number: 'CASE-0018',
    patient_reference: 'PT-7341',
    surgeon_name: 'Dr. Kenji Sato',
    implant_type: 'Distal Radius Volar Locking Plate',
    status: 'Completed',
    priority: 'Low',
    surgery_date: '2026-10-02',
    created_by: 1,
    created_at: '2026-09-15T08:00:00Z',
    updated_at: '2026-10-03T11:00:00Z',
  },
  {
    id: 19,
    case_number: 'CASE-0019',
    patient_reference: 'PT-9014',
    surgeon_name: 'Dr. Sarah Mitchell',
    implant_type: 'Custom Craniofacial PEEK Implant',
    status: 'In Review',
    priority: 'High',
    surgery_date: '2026-11-08',
    created_by: 3,
    created_at: '2026-10-10T09:25:00Z',
    updated_at: '2026-10-12T17:40:00Z',
  },
  {
    id: 20,
    case_number: 'CASE-0020',
    patient_reference: 'PT-3498',
    surgeon_name: 'Dr. David Kim',
    implant_type: 'Metatarsophalangeal Joint Hemi-Cap',
    status: 'Draft',
    priority: 'Low',
    surgery_date: null,
    created_by: 1,
    created_at: '2026-10-10T15:10:00Z',
    updated_at: '2026-10-10T15:10:00Z',
  },
  {
    id: 21,
    case_number: 'CASE-0021',
    patient_reference: 'PT-6582',
    surgeon_name: 'Dr. James Wilson',
    implant_type: 'Modular Revision Hip Stem 180mm',
    status: 'Planning',
    priority: 'High',
    surgery_date: '2026-11-14',
    created_by: 1,
    created_at: '2026-10-11T09:00:00Z',
    updated_at: '2026-10-11T09:00:00Z',
  },
  {
    id: 22,
    case_number: 'CASE-0022',
    patient_reference: 'PT-4190',
    surgeon_name: 'Dr. Elena Rostova',
    implant_type: 'Sacroiliac Joint Fusion Triangular Implants',
    status: 'Approved',
    priority: 'Medium',
    surgery_date: '2026-11-10',
    created_by: 3,
    created_at: '2026-10-11T14:30:00Z',
    updated_at: '2026-10-13T10:00:00Z',
  },
  {
    id: 23,
    case_number: 'CASE-0023',
    patient_reference: 'PT-8815',
    surgeon_name: 'Dr. Rachel Adams',
    implant_type: 'Temporomandibular Joint Total Replacement (TMJ)',
    status: 'In Review',
    priority: 'High',
    surgery_date: '2026-11-22',
    created_by: 1,
    created_at: '2026-10-12T10:15:00Z',
    updated_at: '2026-10-13T15:30:00Z',
  },
  {
    id: 24,
    case_number: 'CASE-0024',
    patient_reference: 'PT-2940',
    surgeon_name: 'Dr. Marcus Vance',
    implant_type: 'Tibial Plateau Fracture Fixation Grid',
    status: 'Completed',
    priority: 'Medium',
    surgery_date: '2026-10-06',
    created_by: 1,
    created_at: '2026-09-22T08:45:00Z',
    updated_at: '2026-10-07T12:00:00Z',
  },
  {
    id: 25,
    case_number: 'CASE-0025',
    patient_reference: 'PT-1267',
    surgeon_name: 'Dr. Kenji Sato',
    implant_type: 'Cannulated Scaphoid Compression Screw',
    status: 'Draft',
    priority: 'Low',
    surgery_date: null,
    created_by: 3,
    created_at: '2026-10-13T09:00:00Z',
    updated_at: '2026-10-13T09:00:00Z',
  },
];

class Database {
  private users: User[] = [];
  private cases: MedicalCase[] = [];
  private tokens: Map<string, number> = new Map(); // token -> userId
  private nextCaseId: number = 26;

  constructor() {
    this.seed();
  }

  public seed(): void {
    // Clone initial users
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    // Clear and build cases with relations
    const rawCases = JSON.parse(JSON.stringify(INITIAL_CASES));
    this.cases = rawCases.map((c: Omit<MedicalCase, 'creator'>) => {
      const creator = this.users.find(u => u.id === c.created_by);
      return {
        ...c,
        creator: creator ? { id: creator.id, name: creator.name, email: creator.email, role: creator.role } : undefined,
      };
    });
    this.nextCaseId = 26;
    // Clear tokens
    this.tokens.clear();
  }

  // User queries
  public findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public getAllUsers(): User[] {
    return this.users.map(({ password: _, ...rest }) => rest as User);
  }

  // Token management (Sanctum simulation)
  public createTokenForUser(userId: number): string {
    const token = `sanctum_${userId}_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    this.tokens.set(token, userId);
    return token;
  }

  public getUserByToken(token: string): User | undefined {
    const userId = this.tokens.get(token);
    if (!userId) return undefined;
    return this.findUserById(userId);
  }

  public revokeToken(token: string): boolean {
    return this.tokens.delete(token);
  }

  // Case queries
  public getCases(params: {
    page?: number;
    perPage?: number;
    search?: string;
    status?: string;
    priority?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    let filtered = [...this.cases];

    // Filter by status (indexed column)
    if (params.status && params.status !== 'All') {
      filtered = filtered.filter(c => c.status === params.status);
    }

    // Filter by priority (bonus task)
    if (params.priority && params.priority !== 'All') {
      filtered = filtered.filter(c => c.priority === params.priority);
    }

    // Search by Case Number or Surgeon Name
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.case_number.toLowerCase().includes(q) ||
        c.surgeon_name.toLowerCase().includes(q) ||
        c.patient_reference.toLowerCase().includes(q) ||
        c.implant_type.toLowerCase().includes(q)
      );
    }

    // Sort column
    const sortBy = params.sortBy || 'id';
    const sortDir = params.sortDir === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortBy] ?? '';
      const bVal = (b as unknown as Record<string, unknown>)[sortBy] ?? '';
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * sortDir;
      }
      if (aVal < bVal) return -1 * sortDir;
      if (aVal > bVal) return 1 * sortDir;
      return 0;
    });

    const total = filtered.length;
    const perPage = params.perPage || 10;
    const page = Math.max(1, params.page || 1);
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;
    const paginated = filtered.slice(offset, offset + perPage);

    return {
      data: paginated,
      current_page: page,
      per_page: perPage,
      total,
      last_page: lastPage,
      from: total === 0 ? 0 : offset + 1,
      to: Math.min(offset + perPage, total),
    };
  }

  public findCaseById(id: number): MedicalCase | undefined {
    return this.cases.find(c => c.id === id);
  }

  public findCaseByNumber(caseNumber: string): MedicalCase | undefined {
    return this.cases.find(c => c.case_number.trim().toUpperCase() === caseNumber.trim().toUpperCase());
  }

  public createCase(data: {
    case_number: string;
    patient_reference: string;
    surgeon_name: string;
    implant_type: string;
    status: CaseStatus;
    priority: CasePriority;
    surgery_date?: string | null;
    created_by: number;
  }): MedicalCase {
    const creator = this.findUserById(data.created_by);
    const now = new Date().toISOString();
    const newCase: MedicalCase = {
      id: this.nextCaseId++,
      case_number: data.case_number.trim().toUpperCase(),
      patient_reference: data.patient_reference.trim(),
      surgeon_name: data.surgeon_name.trim(),
      implant_type: data.implant_type.trim(),
      status: data.status,
      priority: data.priority,
      surgery_date: data.surgery_date ? data.surgery_date.trim() : null,
      created_by: data.created_by,
      creator: creator ? { id: creator.id, name: creator.name, email: creator.email, role: creator.role } : undefined,
      created_at: now,
      updated_at: now,
    };

    this.cases.unshift(newCase);
    return newCase;
  }

  public updateCase(id: number, data: {
    case_number?: string;
    patient_reference?: string;
    surgeon_name?: string;
    implant_type?: string;
    status?: CaseStatus;
    priority?: CasePriority;
    surgery_date?: string | null;
  }): MedicalCase | null {
    const index = this.cases.findIndex(c => c.id === id);
    if (index === -1) return null;

    const current = this.cases[index];
    const now = new Date().toISOString();

    const updated: MedicalCase = {
      ...current,
      case_number: data.case_number !== undefined ? data.case_number.trim().toUpperCase() : current.case_number,
      patient_reference: data.patient_reference !== undefined ? data.patient_reference.trim() : current.patient_reference,
      surgeon_name: data.surgeon_name !== undefined ? data.surgeon_name.trim() : current.surgeon_name,
      implant_type: data.implant_type !== undefined ? data.implant_type.trim() : current.implant_type,
      status: data.status !== undefined ? data.status : current.status,
      priority: data.priority !== undefined ? data.priority : current.priority,
      surgery_date: data.surgery_date !== undefined ? (data.surgery_date ? data.surgery_date.trim() : null) : current.surgery_date,
      updated_at: now,
    };

    this.cases[index] = updated;
    return updated;
  }

  public deleteCase(id: number): boolean {
    const initialLength = this.cases.length;
    this.cases = this.cases.filter(c => c.id !== id);
    return this.cases.length < initialLength;
  }

  public getDashboardStats() {
    return {
      total: this.cases.length,
      planning: this.cases.filter(c => c.status === 'Planning').length,
      in_review: this.cases.filter(c => c.status === 'In Review').length,
      approved: this.cases.filter(c => c.status === 'Approved').length,
      completed: this.cases.filter(c => c.status === 'Completed').length,
      draft: this.cases.filter(c => c.status === 'Draft').length,
      cancelled: this.cases.filter(c => c.status === 'Cancelled').length,
      high_priority: this.cases.filter(c => c.priority === 'High').length,
      upcoming_surgeries: this.cases.filter(c => c.surgery_date && new Date(c.surgery_date) >= new Date()).length,
    };
  }
}

export const db = new Database();
