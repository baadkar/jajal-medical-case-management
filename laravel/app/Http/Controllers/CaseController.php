<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCaseRequest;
use App\Http\Requests\UpdateCaseRequest;
use App\Models\MedicalCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaseController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(MedicalCase::class, 'case');
    }

    /**
     * Display a paginated listing of cases with search & filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MedicalCase::with('creator:id,name,email,role');

        // Filter by Status
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        // Filter by Priority (Bonus)
        if ($request->filled('priority') && $request->priority !== 'All') {
            $query->where('priority', $request->priority);
        }

        // Search by Case Number or Surgeon Name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('case_number', 'like', "%{$search}%")
                  ->orWhere('surgeon_name', 'like', "%{$search}%")
                  ->orWhere('patient_reference', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = (int) $request->get('per_page', 10);
        $cases = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $cases,
            'message' => 'Cases retrieved successfully.',
        ], 200);
    }

    /**
     * Store a newly created case using FormRequest validation.
     */
    public function store(StoreCaseRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['created_by'] = $request->user()->id;

        $case = MedicalCase::create($validated);
        $case->load('creator:id,name,email,role');

        return response()->json([
            'success' => true,
            'data' => $case,
            'message' => 'Case created successfully.',
        ], 201);
    }

    /**
     * Display the specified case.
     */
    public function show(MedicalCase $case): JsonResponse
    {
        $case->load('creator:id,name,email,role');

        return response()->json([
            'success' => true,
            'data' => $case,
            'message' => 'Case details retrieved successfully.',
        ], 200);
    }

    /**
     * Update the specified case using FormRequest validation.
     */
    public function update(UpdateCaseRequest $request, MedicalCase $case): JsonResponse
    {
        $case->update($request->validated());
        $case->load('creator:id,name,email,role');

        return response()->json([
            'success' => true,
            'data' => $case,
            'message' => 'Case updated successfully.',
        ], 200);
    }

    /**
     * Remove the specified case from storage.
     */
    public function destroy(MedicalCase $case): JsonResponse
    {
        $case->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Case deleted successfully.',
        ], 200);
    }

    /**
     * Aggregate dashboard case statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => MedicalCase::count(),
            'planning' => MedicalCase::where('status', 'Planning')->count(),
            'in_review' => MedicalCase::where('status', 'In Review')->count(),
            'approved' => MedicalCase::where('status', 'Approved')->count(),
            'completed' => MedicalCase::where('status', 'Completed')->count(),
            'draft' => MedicalCase::where('status', 'Draft')->count(),
            'cancelled' => MedicalCase::where('status', 'Cancelled')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Dashboard statistics retrieved successfully.',
        ], 200);
    }
}
