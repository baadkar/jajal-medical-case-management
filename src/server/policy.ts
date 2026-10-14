import { User } from '../types.ts';

/**
 * CasePolicy
 * Equivalent to Laravel's App\Policies\CasePolicy:
 * - Admin: viewAny, view, create, update, delete
 * - Engineer (Bonus): viewAny, view, create, update (cannot delete)
 * - Viewer: viewAny, view (cannot create, cannot update, cannot delete)
 */
export class CasePolicy {
  public static viewAny(user?: User | null): boolean {
    return !!user;
  }

  public static view(user?: User | null): boolean {
    return !!user;
  }

  public static create(user?: User | null): boolean {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'engineer';
  }

  public static update(user?: User | null): boolean {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'engineer';
  }

  public static delete(user?: User | null): boolean {
    if (!user) return false;
    // Strict requirement: Delete must work for Admin only!
    return user.role === 'admin';
  }
}
