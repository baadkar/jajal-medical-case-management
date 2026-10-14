<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CaseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Jajal Medical Case Management
|--------------------------------------------------------------------------
| Configured with Laravel Sanctum token authentication.
*/

// Public authentication routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dashboard/stats', [CaseController::class, 'stats']);

    // Case Management Resource Endpoints
    Route::get('/cases', [CaseController::class, 'index']);
    Route::post('/cases', [CaseController::class, 'store']);
    Route::get('/cases/{case}', [CaseController::class, 'show']);
    Route::put('/cases/{case}', [CaseController::class, 'update']);
    Route::delete('/cases/{case}', [CaseController::class, 'destroy']);
});
