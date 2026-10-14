import React, { useState } from 'react';
import { 
  FileText, 
  Database, 
  ShieldCheck, 
  Cloud, 
  Download, 
  Check, 
  Copy,
  ExternalLink
} from 'lucide-react';

const DOC_ITEMS = [
  { id: 'traceability', title: 'Traceability Matrix (docs/traceability.md)', icon: ShieldCheck },
  { id: 'database', title: 'Database Schema & ERD (docs/database.md)', icon: Database },
  { id: 'deployment', title: 'AWS Cloud Deployment (docs/deployment.md)', icon: Cloud },
  { id: 'readme', title: 'Project Overview & Setup (README.md)', icon: FileText },
] as const;

export const DocsView: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'traceability' | 'database' | 'deployment' | 'readme'>('traceability');
  const [copied, setCopied] = useState(false);

  const handleDownloadPostman = () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            Engineering & Medical Compliance Docs
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Software Documentation & Traceability
          </h1>
          <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl">
            Complete project specifications, database relationship diagrams, requirements traceability matrix (IEC 62304 / ISO 13485), and AWS cloud infrastructure guides.
          </p>
        </div>

        <button
          onClick={handleDownloadPostman}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Postman JSON</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {DOC_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeDoc === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveDoc(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Doc Viewer Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 text-slate-800 space-y-6 text-sm">
        
        {activeDoc === 'traceability' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Requirements Traceability Matrix (docs/traceability.md)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Mandatory Section 7 requirement: Links medical software input requirements to code implementation and verification tests.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Requirement (Input)</th>
                    <th className="px-4 py-3 text-left">Implementation (Output)</th>
                    <th className="px-4 py-3 text-left">Verification (Test)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-teal-700">REQ-001</td>
                    <td className="px-4 py-3 font-medium text-slate-900">Admin shall be able to create a case</td>
                    <td className="px-4 py-3 font-mono text-slate-600">CaseController@store + create form</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">Feature test 4: admin creates case (201 Created)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-teal-700">REQ-002</td>
                    <td className="px-4 py-3 font-medium text-slate-900">Case Number shall be unique</td>
                    <td className="px-4 py-3 font-mono text-slate-600">Unique DB index + Form Request rule</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">Feature test 5: duplicate rejected (422)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-teal-700">REQ-003</td>
                    <td className="px-4 py-3 font-medium text-slate-900">Only Admin shall delete cases</td>
                    <td className="px-4 py-3 font-mono text-slate-600">CasePolicy@delete</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">Feature test 6: viewer gets 403</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-teal-700">REQ-004</td>
                    <td className="px-4 py-3 font-medium text-slate-900">All case pages & APIs hidden from guests</td>
                    <td className="px-4 py-3 font-mono text-slate-600">auth:sanctum middleware + Guard</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">Feature test 3: guest access returns 401</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-teal-700">REQ-005</td>
                    <td className="px-4 py-3 font-medium text-slate-900">Valid credentials grant access token</td>
                    <td className="px-4 py-3 font-mono text-slate-600">AuthController@login</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">Feature test 1: valid login succeeds (200)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-teal-700">REQ-006</td>
                    <td className="px-4 py-3 font-medium text-slate-900">Invalid login rejected with clear error</td>
                    <td className="px-4 py-3 font-mono text-slate-600">AuthController@login check</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">Feature test 2: invalid login rejected (401)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-teal-700">BONUS-01</td>
                    <td className="px-4 py-3 font-medium text-slate-900">Engineer can create/edit, cannot delete</td>
                    <td className="px-4 py-3 font-mono text-slate-600">CasePolicy@create/update/delete</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">Feature test 7: engineer delete gets 403</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-teal-700">BONUS-02</td>
                    <td className="px-4 py-3 font-medium text-slate-900">Public holiday checking with fallback</td>
                    <td className="px-4 py-3 font-mono text-slate-600">GET /api/holidays + Nager.Date</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">Graceful timeout & fallback assertion</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeDoc === 'database' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Database Schema & Relational ERD (docs/database.md)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Foreign key constraints, unique indexes, and status enum indexing.
              </p>
            </div>

            <pre className="p-4 bg-slate-900 text-teal-300 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
{`+-------------------------------------------------------+
|                        USERS                          |
+-------------------------------------------------------+
| PK  id             BIGINT UNSIGNED AUTO_INCREMENT     |
|     name           VARCHAR(255)                       |
| U   email          VARCHAR(255) UNIQUE                |
|     password       VARCHAR(255)                       |
|     role           ENUM('admin', 'viewer', 'engineer')|
|     created_at     TIMESTAMP                          |
|     updated_at     TIMESTAMP                          |
+-------------------------------------------------------+
                           | 1
                           | hasMany (creates)
                           v N
+-------------------------------------------------------+
|                        CASES                          |
+-------------------------------------------------------+
| PK  id                BIGINT UNSIGNED AUTO_INCREMENT  |
| U   case_number       VARCHAR(50) UNIQUE INDEX        |
|     patient_reference VARCHAR(50)                     |
|     surgeon_name      VARCHAR(255)                    |
|     implant_type      VARCHAR(255)                    |
| IDX status            ENUM('Draft', 'Planning', ...)  | <-- INDEXED
|     priority          ENUM('Low', 'Medium', 'High')   |
|     surgery_date      DATE NULLABLE                   |
| FK  created_by        BIGINT UNSIGNED NOT NULL        | <-- REFERENCES users(id)
|     created_at        TIMESTAMP NOT NULL              |
|     updated_at        TIMESTAMP NOT NULL              |
+-------------------------------------------------------+`}
            </pre>

            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-900">Key Database Guarantees:</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li><strong>Referential Integrity:</strong> <code className="font-mono text-slate-800">cases.created_by</code> references <code className="font-mono text-slate-800">users.id</code> with <code className="font-mono text-slate-800">ON DELETE RESTRICT</code> preventing orphan records.</li>
                <li><strong>Unique Index:</strong> <code className="font-mono text-slate-800">cases_case_number_unique</code> prevents duplicate tracking IDs across hospital departments.</li>
                <li><strong>Status Query Optimization:</strong> <code className="font-mono text-slate-800">cases_status_index</code> provides sub-millisecond filtering for dashboard counters and status filters.</li>
              </ul>
            </div>
          </div>
        )}

        {activeDoc === 'deployment' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold text-slate-900">AWS Production Hosting Architecture (docs/deployment.md)</h2>
              <p className="text-xs text-slate-500 mt-1">
                High-availability, HIPAA-aligned architecture with EC2, RDS MySQL, S3, Secrets Manager, and HTTPS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">1. App Tier (EC2 + Auto Scaling)</h4>
                <p className="text-slate-600">
                  Dual-AZ EC2 instances running Nginx + PHP-FPM / Node inside private subnets behind an Application Load Balancer (ALB).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">2. Database Tier (Amazon RDS MySQL)</h4>
                <p className="text-slate-600">
                  Multi-AZ automated failover with KMS storage encryption at rest and 35-day automated point-in-time recovery.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">3. Storage Tier (Amazon S3)</h4>
                <p className="text-slate-600">
                  Pre-op CT/MRI scans and 3D STL implant models stored in encrypted S3 buckets with time-limited pre-signed URLs.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">4. Security Groups & HTTPS</h4>
                <p className="text-slate-600">
                  Strict 3-tier firewall isolation (ALB &rarr; EC2 &rarr; RDS). Free SSL/TLS termination via AWS Certificate Manager (ACM) enforcing TLS 1.3.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'readme' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Project README & Setup Instructions</h2>
              <p className="text-xs text-slate-500 mt-1">
                Overview, dummy credentials, installation steps, and test execution.
              </p>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 font-medium">
                Test Accounts: <strong>admin@jajalmedical.com</strong> (Pass: Admin@12345), <strong>viewer@jajalmedical.com</strong> (Pass: Viewer@12345), and <strong>engineer@jajalmedical.com</strong> (Pass: Engineer@12345).
              </div>

              <p>
                The complete codebase includes working migrations, seeders, FormRequests, policies, and test files inside both the live full-stack runtime and the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/laravel</code> reference directory.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
