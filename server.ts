import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.ts';
import { CasePolicy } from './src/server/policy.ts';
import { validateCaseInput } from './src/server/validator.ts';
import { runAutomatedTests } from './src/server/tests.ts';
import { User } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for consistent JSON response shape
function jsonResponse<T>(res: Response, status: number, success: boolean, message: string, data: T | null = null, errors?: Record<string, string[]>) {
  return res.status(status).json({
    success,
    data,
    message,
    ...(errors ? { errors } : {}),
  });
}

// Extend Request type to include authenticated user
interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

// Authentication middleware simulating Laravel Sanctum auth:sanctum
function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return jsonResponse(res, 401, false, 'Unauthenticated. Bearer token missing.');
  }

  const token = authHeader.substring(7).trim();
  const user = db.getUserByToken(token);
  if (!user) {
    return jsonResponse(res, 401, false, 'Unauthenticated. Token is invalid or expired.');
  }

  req.user = user;
  req.token = token;
  next();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // CORS headers if needed
  app.use((_req, res, next) => {
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    next();
  });

  /* ========================================================
     AUTHENTICATION ENDPOINTS
     ======================================================== */

  // POST /api/login - Get an API token (Anyone)
  app.post('/api/login', (req: Request, res: Response) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return jsonResponse(res, 422, false, 'The given data was invalid.', null, {
        email: !email ? ['The email field is required.'] : [],
        password: !password ? ['The password field is required.'] : [],
      });
    }

    const user = db.findUserByEmail(String(email));
    if (!user || user.password !== String(password)) {
      return jsonResponse(res, 401, false, 'These credentials do not match our records.');
    }

    const token = db.createTokenForUser(user.id);
    const { password: _, ...safeUser } = user;

    return jsonResponse(res, 200, true, 'Authenticated successfully.', {
      token,
      token_type: 'Bearer',
      user: safeUser,
    });
  });

  // POST /api/logout - Revoke the token (Logged-in users)
  app.post('/api/logout', authenticate, (req: AuthenticatedRequest, res: Response) => {
    if (req.token) {
      db.revokeToken(req.token);
    }
    return jsonResponse(res, 200, true, 'Logged out successfully.');
  });

  // GET /api/user - Get authenticated user profile
  app.get('/api/user', authenticate, (req: AuthenticatedRequest, res: Response) => {
    const { password: _, ...safeUser } = req.user!;
    return jsonResponse(res, 200, true, 'User profile retrieved.', safeUser);
  });

  /* ========================================================
     DASHBOARD STATS
     ======================================================== */

  // GET /api/dashboard/stats - Admin, Viewer, Engineer
  app.get('/api/dashboard/stats', authenticate, (req: AuthenticatedRequest, res: Response) => {
    if (!CasePolicy.viewAny(req.user)) {
      return jsonResponse(res, 403, false, 'This action is unauthorized.');
    }
    const stats = db.getDashboardStats();
    return jsonResponse(res, 200, true, 'Dashboard statistics retrieved successfully.', stats);
  });

  /* ========================================================
     CASE MANAGEMENT ENDPOINTS
     ======================================================== */

  // GET /api/cases - List cases (paginated 10 per page) - Admin, Viewer, Engineer
  app.get('/api/cases', authenticate, (req: AuthenticatedRequest, res: Response) => {
    if (!CasePolicy.viewAny(req.user)) {
      return jsonResponse(res, 403, false, 'This action is unauthorized.');
    }

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.per_page) || 10;
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const priority = req.query.priority ? String(req.query.priority) : undefined;
    const sortBy = req.query.sort_by ? String(req.query.sort_by) : undefined;
    const sortDir = (req.query.sort_dir === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

    const result = db.getCases({
      page,
      perPage,
      search,
      status,
      priority,
      sortBy,
      sortDir,
    });

    return jsonResponse(res, 200, true, 'Cases retrieved successfully.', result);
  });

  // POST /api/cases - Create a case - Admin, Engineer (Viewer blocked with 403)
  app.post('/api/cases', authenticate, (req: AuthenticatedRequest, res: Response) => {
    if (!CasePolicy.create(req.user)) {
      return jsonResponse(res, 403, false, 'This action is unauthorized. Only Admins and Engineers can create cases.');
    }

    const validation = validateCaseInput(req.body);
    if (!validation.isValid) {
      return jsonResponse(res, 422, false, 'The given data was invalid.', null, validation.errors);
    }

    const newCase = db.createCase({
      case_number: req.body.case_number,
      patient_reference: req.body.patient_reference,
      surgeon_name: req.body.surgeon_name,
      implant_type: req.body.implant_type,
      status: req.body.status,
      priority: req.body.priority,
      surgery_date: req.body.surgery_date,
      created_by: req.user!.id,
    });

    return jsonResponse(res, 201, true, 'Case created successfully.', newCase);
  });

  // GET /api/cases/:id - Get one case - Admin, Viewer, Engineer
  app.get('/api/cases/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
    if (!CasePolicy.view(req.user)) {
      return jsonResponse(res, 403, false, 'This action is unauthorized.');
    }

    const id = Number(req.params.id);
    const medicalCase = db.findCaseById(id);

    if (!medicalCase) {
      return jsonResponse(res, 404, false, 'Case not found.');
    }

    return jsonResponse(res, 200, true, 'Case details retrieved successfully.', medicalCase);
  });

  // PUT /api/cases/:id - Update a case - Admin, Engineer (Viewer blocked with 403)
  app.put('/api/cases/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
    if (!CasePolicy.update(req.user)) {
      return jsonResponse(res, 403, false, 'This action is unauthorized. Only Admins and Engineers can update cases.');
    }

    const id = Number(req.params.id);
    const existingCase = db.findCaseById(id);

    if (!existingCase) {
      return jsonResponse(res, 404, false, 'Case not found.');
    }

    // Validate inputs, passing existing case id to ignore on unique check
    const validation = validateCaseInput(req.body, id);
    if (!validation.isValid) {
      return jsonResponse(res, 422, false, 'The given data was invalid.', null, validation.errors);
    }

    const updated = db.updateCase(id, {
      case_number: req.body.case_number,
      patient_reference: req.body.patient_reference,
      surgeon_name: req.body.surgeon_name,
      implant_type: req.body.implant_type,
      status: req.body.status,
      priority: req.body.priority,
      surgery_date: req.body.surgery_date,
    });

    return jsonResponse(res, 200, true, 'Case updated successfully.', updated);
  });

  // DELETE /api/cases/:id - Delete a case - Admin ONLY! (Viewer & Engineer blocked with 403)
  app.delete('/api/cases/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
    // Strict requirement: Only Admin shall delete cases!
    if (!CasePolicy.delete(req.user)) {
      return jsonResponse(res, 403, false, 'This action is unauthorized. Only Admins can delete cases.');
    }

    const id = Number(req.params.id);
    const existing = db.findCaseById(id);
    if (!existing) {
      return jsonResponse(res, 404, false, 'Case not found.');
    }

    db.deleteCase(id);
    return jsonResponse(res, 200, true, 'Case deleted successfully.');
  });

  /* ========================================================
     BONUS & UTILITY ENDPOINTS
     ======================================================== */

  // GET /api/holidays - Call public Nager.Date API with timeout and graceful error handling
  app.get('/api/holidays', async (req: Request, res: Response) => {
    const year = Number(req.query.year) || new Date().getFullYear();
    const country = (req.query.country ? String(req.query.country) : 'US').toUpperCase();
    const apiUrl = process.env.NAGER_DATE_API_URL || `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const fetchRes = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!fetchRes.ok) {
        throw new Error(`Public Holiday API responded with status ${fetchRes.status}`);
      }

      const holidays = await fetchRes.json();
      return jsonResponse(res, 200, true, 'Public holidays fetched successfully.', holidays);
    } catch (err: unknown) {
      // Graceful fallback per instructions
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.warn('Nager.Date API fallback engaged:', message);

      // Return standard calendar holidays as fallback
      const fallbackHolidays = [
        { date: `${year}-01-01`, name: "New Year's Day", localName: "New Year's Day" },
        { date: `${year}-05-25`, name: "Memorial Day", localName: "Memorial Day" },
        { date: `${year}-07-04`, name: "Independence Day", localName: "Independence Day" },
        { date: `${year}-09-07`, name: "Labor Day", localName: "Labor Day" },
        { date: `${year}-11-26`, name: "Thanksgiving Day", localName: "Thanksgiving Day" },
        { date: `${year}-12-25`, name: "Christmas Day", localName: "Christmas Day" },
      ];

      return jsonResponse(res, 200, true, 'Public holidays loaded (cached/fallback).', fallbackHolidays);
    }
  });

  // POST /api/database/reset - Reset seeded data
  app.post('/api/database/reset', (_req: Request, res: Response) => {
    db.seed();
    return jsonResponse(res, 200, true, 'Database re-seeded successfully with initial users and cases.');
  });

  // POST /api/tests/run - Execute automated feature tests suite
  app.post('/api/tests/run', async (_req: Request, res: Response) => {
    const testSuiteResult = await runAutomatedTests();
    return jsonResponse(res, 200, true, 'Automated tests executed successfully.', testSuiteResult);
  });

  /* ========================================================
     VITE INTEGRATION
     ======================================================== */

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jajal Medical API & App running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
