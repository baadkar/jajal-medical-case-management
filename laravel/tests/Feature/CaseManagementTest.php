<?php

namespace Tests\Feature;

use App\Models\MedicalCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CaseManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test 1: Valid login succeeds.
     */
    public function test_valid_login_succeeds(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@jajalmedical.com',
            'password' => bcrypt('Admin@12345'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@jajalmedical.com',
            'password' => 'Admin@12345',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['token', 'user'],
                'message',
            ])
            ->assertJson(['success' => true]);
    }

    /**
     * Test 2: Invalid login is rejected.
     */
    public function test_invalid_login_is_rejected(): void
    {
        User::factory()->create([
            'email' => 'admin@jajalmedical.com',
            'password' => bcrypt('Admin@12345'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@jajalmedical.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test 3: A guest cannot open case pages or APIs (401 / redirect).
     */
    public function test_guest_cannot_open_cases(): void
    {
        $response = $this->getJson('/api/cases');

        $response->assertStatus(401);
    }

    /**
     * Test 4: Admin can create a case.
     */
    public function test_admin_can_create_a_case(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $caseData = [
            'case_number' => 'CASE-9001',
            'patient_reference' => 'PT-5001',
            'surgeon_name' => 'Dr. Sarah Mitchell',
            'implant_type' => 'Titanium Cranial Plate 3D-Custom',
            'status' => 'Planning',
            'priority' => 'High',
            'surgery_date' => '2026-11-15',
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/cases', $caseData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'case_number' => 'CASE-9001',
                    'patient_reference' => 'PT-5001',
                    'created_by' => $admin->id,
                ],
            ]);

        $this->assertDatabaseHas('cases', [
            'case_number' => 'CASE-9001',
            'created_by' => $admin->id,
        ]);
    }

    /**
     * Test 5: Creating a case with a duplicate Case Number fails (422).
     */
    public function test_creating_case_with_duplicate_case_number_fails(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        MedicalCase::factory()->create([
            'case_number' => 'CASE-0001',
            'created_by' => $admin->id,
        ]);

        $duplicateData = [
            'case_number' => 'CASE-0001',
            'patient_reference' => 'PT-9999',
            'surgeon_name' => 'Dr. James Wilson',
            'implant_type' => 'Spinal Cage',
            'status' => 'Draft',
            'priority' => 'Low',
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/cases', $duplicateData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['case_number']);
    }

    /**
     * Test 6: Viewer cannot delete a case (403).
     */
    public function test_viewer_cannot_delete_a_case(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $viewer = User::factory()->create(['role' => 'viewer']);

        $case = MedicalCase::factory()->create([
            'created_by' => $admin->id,
        ]);

        $response = $this->actingAs($viewer, 'sanctum')
            ->deleteJson("/api/cases/{$case->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('cases', ['id' => $case->id]);
    }
}
