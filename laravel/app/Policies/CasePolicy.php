<?php

namespace App\Policies;

use App\Models\MedicalCase;
use App\Models\User;

class CasePolicy
{
    /**
     * Determine whether the user can view any cases.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'viewer', 'engineer']);
    }

    /**
     * Determine whether the user can view the specific case.
     */
    public function view(User $user, MedicalCase $case): bool
    {
        return in_array($user->role, ['admin', 'viewer', 'engineer']);
    }

    /**
     * Determine whether the user can create cases.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'engineer']);
    }

    /**
     * Determine whether the user can update the case.
     */
    public function update(User $user, MedicalCase $case): bool
    {
        return in_array($user->role, ['admin', 'engineer']);
    }

    /**
     * Determine whether the user can delete the case.
     * STRICT REQUIREMENT: Only Admin can delete cases.
     */
    public function delete(User $user, MedicalCase $case): bool
    {
        return $user->role === 'admin';
    }
}
