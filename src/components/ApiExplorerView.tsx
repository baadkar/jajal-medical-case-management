import React, { useState } from 'react';
import { ApiService } from '../services/api.ts';
import { User } from '../types.ts';
import { 
  Terminal, 
  Send, 
  Download, 
  Copy, 
  Check, 
  Key, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ApiExplorerViewProps {
  currentUser: User;
}

interface EndpointConfig {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  authRequired: boolean;
  allowedRoles: string;
  sampleBody?: string;
  description: string;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'login-admin',
    name: '1. POST /api/login (Admin)',
    method: 'POST',
    path: '/api/login',
    authRequired: false,
    allowedRoles: 'Anyone',
    sampleBody: JSON.stringify({
      email: 'admin@jajalmedical.com',
      password: 'Admin@12345',
    }, null, 2),
    description: 'Authenticates admin user and returns a Laravel Sanctum Bearer token.',
  },
  {
    id: 'login-viewer',
    name: '2. POST /api/login (Viewer)',
    method: 'POST',
    path: '/api/login',
    authRequired: false,
    allowedRoles: 'Anyone',
    sampleBody: JSON.stringify({
      email: 'viewer@jajalmedical.com',
      password: 'Viewer@12345',
    }, null, 2),
    description: 'Authenticates viewer user with read-only capabilities.',
  },
  {
    id: 'login-invalid',
    name: '3. POST /api/login (Invalid 401 Test)',
    method: 'POST',
    path: '/api/login',
    authRequired: false,
    allowedRoles: 'Anyone',
    sampleBody: JSON.stringify({
      email: 'admin@jajalmedical.com',
      password: 'WrongPassword999!',
    }, null, 2),
    description: 'Simulates wrong password; asserts HTTP 401 Unauthorized response.',
  },
  {
    id: 'get-cases',
    name: '4. GET /api/cases (Paginated 10/page)',
    method: 'GET',
    path: '/api/cases?page=1&per_page=10&search=&status=All&priority=All',
    authRequired: true,
    allowedRoles: 'Admin, Viewer, Engineer',
    description: 'Returns paginated cases (10 per page) with search and filters.',
  },
  {
    id: 'create-case',
    name: '5. POST /api/cases (Create Case)',
    method: 'POST',
    path: '/api/cases',
    authRequired: true,
    allowedRoles: 'Admin, Engineer (403 for Viewer)',
    sampleBody: JSON.stringify({
      case_number: `CASE-API-${Math.floor(100 + Math.random() * 900)}`,
      patient_reference: 'PT-7712',
      surgeon_name: 'Dr. Sarah Mitchell',
      implant_type: 'Titanium Mandibular Reconstruction Plate',
      status: 'Planning',
      priority: 'High',
      surgery_date: '2026-11-20',
    }, null, 2),
    description: 'Creates a new case using FormRequest validation. Returns HTTP 201.',
  },
  {
    id: 'create-duplicate',
    name: '6. POST /api/cases (Duplicate 422 Test)',
    method: 'POST',
    path: '/api/cases',
    authRequired: true,
    allowedRoles: 'Admin, Engineer',
    sampleBody: JSON.stringify({
      case_number: 'CASE-0001', // Already taken!
      patient_reference: 'PT-9999',
      surgeon_name: 'Dr. Duplicate',
      implant_type: 'Spinal Cage',
      status: 'Draft',
      priority: 'Low',
    }, null, 2),
    description: 'Attempts creating duplicate case number; asserts HTTP 422 Unprocessable Entity.',
  },
  {
    id: 'get-case-id',
    name: '7. GET /api/cases/1 (Case Details)',
    method: 'GET',
    path: '/api/cases/1',
    authRequired: true,
    allowedRoles: 'Admin, Viewer, Engineer',
    description: 'Fetches single case with creator user relationship.',
  },
  {
    id: 'update-case',
    name: '8. PUT /api/cases/1 (Update Case)',
    method: 'PUT',
    path: '/api/cases/1',
    authRequired: true,
    allowedRoles: 'Admin, Engineer (403 for Viewer)',
    sampleBody: JSON.stringify({
      case_number: 'CASE-0001',
      patient_reference: 'PT-9801',
      surgeon_name: 'Dr. Sarah Mitchell',
      implant_type: 'Titanium Cranial Plate 3D-Custom Modified',
      status: 'In Review',
      priority: 'High',
      surgery_date: '2026-10-30',
    }, null, 2),
    description: 'Updates case fields. Demonstrates unique rule ignoring self ID.',
  },
  {
    id: 'delete-case',
    name: '9. DELETE /api/cases/1 (Delete Case)',
    method: 'DELETE',
    path: '/api/cases/1',
    authRequired: true,
    allowedRoles: 'Admin ONLY! (403 for Viewer/Engineer)',
    description: 'Deletes case. Strictly enforced on server; returns HTTP 403 for non-admins.',
  },
  {
    id: 'dashboard-stats',
    name: '10. GET /api/dashboard/stats',
    method: 'GET',
    path: '/api/dashboard/stats',
    authRequired: true,
    allowedRoles: 'Admin, Viewer, Engineer',
    description: 'Returns total case counts across all 6 statuses.',
  },
  {
    id: 'nager-holidays',
    name: '11. GET /api/holidays (Nager.Date API)',
    method: 'GET',
    path: '/api/holidays?year=2026&country=US',
    authRequired: false,
    allowedRoles: 'Anyone',
    description: 'Fetches public holidays with timeout and graceful fallback.',
  },
];

export const ApiExplorerView: React.FC<ApiExplorerViewProps> = ({ currentUser }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[3]); // Default to GET /api/cases
  const [requestPath, setRequestPath] = useState(selectedEndpoint.path);
  const [requestBody, setRequestBody] = useState(selectedEndpoint.sampleBody || '');
  const [sendAuthHeader, setSendAuthHeader] = useState(true);

  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeToken = ApiService.getToken();

  const handleSelectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setRequestPath(ep.path);
    setRequestBody(ep.sampleBody || '');
    setSendAuthHeader(ep.authRequired);
    setResponseStatus(null);
    setResponseBody(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const start = Date.now();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (sendAuthHeader && activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (['POST', 'PUT'].includes(selectedEndpoint.method) && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(requestPath, options);
      const data = await res.json();
      setResponseStatus(res.status);
      setResponseTime(Date.now() - start);
      setResponseBody(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setResponseStatus(500);
      setResponseTime(Date.now() - start);
      setResponseBody(JSON.stringify({ error: err instanceof Error ? err.message : 'Network error' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCollection = () => {
    // Download postman_collection.json
    fetch('/postman_collection.json')
      .then(r => r.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jajal_medical_postman_collection.json';
        a.click();
      });
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'POST': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PUT': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELETE': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (status === 401 || status === 403) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (status === 422) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" />
            Live REST API Console
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            REST API & Postman Explorer
          </h1>
          <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl">
            Test all endpoints live with real Sanctum Bearer tokens and verify status codes: 200, 201, 401, 403, 404, 422.
          </p>
        </div>

        <button
          onClick={handleDownloadCollection}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export Postman Collection</span>
        </button>
      </div>

      {/* Main Grid: Endpoint Selector on Left, Request/Response on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Endpoint Selector Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-3 space-y-1">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-2">
            Available Endpoints
          </div>
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors cursor-pointer flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-300 text-slate-900 shadow-xs'
                      : 'border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodColor(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {ep.authRequired ? 'Bearer Auth' : 'Public'}
                    </span>
                  </div>
                  <div className="font-semibold text-xs truncate">
                    {ep.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Request & Response Panel */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Request Header Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedEndpoint.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedEndpoint.description}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Allowed Roles:</span>
                <span className="text-xs font-semibold text-slate-700">
                  {selectedEndpoint.allowedRoles}
                </span>
              </div>
            </div>

            {/* Path & Method Input */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-2 rounded-lg text-xs font-bold border ${getMethodColor(selectedEndpoint.method)}`}>
                {selectedEndpoint.method}
              </span>
              <input
                type="text"
                value={requestPath}
                onChange={(e) => setRequestPath(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleExecute}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send</span>
              </button>
            </div>

            {/* Auth Toggle */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={sendAuthHeader}
                  onChange={(e) => setSendAuthHeader(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Include Sanctum Token Header (<code className="font-mono text-[11px]">Authorization: Bearer ...</code>)</span>
              </label>

              <div className="text-[11px] text-slate-400 font-mono">
                Current Role: <span className="font-semibold text-slate-700 capitalize">{currentUser.role}</span>
              </div>
            </div>

            {/* JSON Request Body if applicable */}
            {['POST', 'PUT'].includes(selectedEndpoint.method) && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  JSON Request Body
                </label>
                <textarea
                  rows={6}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full font-mono text-xs p-3 bg-slate-900 text-slate-100 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* Response Inspector */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-4 text-white">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Response Output
                </span>
                {responseStatus !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${getStatusBadge(responseStatus)}`}>
                    HTTP {responseStatus}
                  </span>
                )}
                {responseTime !== null && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {responseTime}ms
                  </span>
                )}
              </div>

              {responseBody && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(responseBody);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {responseBody ? (
              <pre className="font-mono text-xs text-slate-200 overflow-x-auto max-h-96 p-2 bg-slate-950 rounded-lg border border-slate-800 leading-relaxed">
                {responseBody}
              </pre>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">
                Click "Send" above to invoke the endpoint and inspect status codes & response bodies.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
