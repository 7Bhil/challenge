import { Role } from '@prisma/client'

export type UserRole = Role | string

// Vérifie si un utilisateur est admin
export function isAdmin(role: UserRole): boolean {
  return role === Role.Admin || role === Role.SuperAdmin
}

// Vérifie si un utilisateur est super admin
export function isSuperAdmin(role: UserRole): boolean {
  return role === Role.SuperAdmin
}

// Vérifie si un utilisateur peut promouvoir vers un rôle cible
export function canPromoteTo(currentRole: UserRole, targetRole: UserRole): boolean {
  if (currentRole === Role.SuperAdmin) {
    // SuperAdmin peut promouvoir vers tous les rôles SAUF créer un autre SuperAdmin
    return targetRole !== Role.SuperAdmin;
  }
  
  if (currentRole === Role.Admin) {
    // Admin peut seulement promouvoir vers Juré
    return targetRole === Role.Judge;
  }
  
  return false;
}

// Vérifie si un utilisateur peut modifier un autre utilisateur
export function canModifyUser(currentUserId: number, targetUserId: number, currentRole: UserRole, targetRole: UserRole): boolean {
  // Personne ne peut se modifier soi-même
  if (currentUserId === targetUserId) {
    return false;
  }
  
  // SuperAdmin peut modifier tout le monde (sauf lui-même)
  if (currentRole === Role.SuperAdmin) {
    return true;
  }
  
  // Admin peut modifier les Challengers et Judges, mais pas les Admins ou SuperAdmins
  if (currentRole === Role.Admin) {
    return targetRole === Role.Challenger || targetRole === Role.Judge;
  }
  
  return false;
}

// Vérifie si un admin peut modifier un rôle spécifique
export function canAdminModifyRole(currentRole: UserRole, targetCurrentRole: UserRole, targetNewRole: UserRole): boolean {
  if (currentRole === Role.SuperAdmin) {
    // SuperAdmin peut tout faire sauf créer un autre SuperAdmin
    return targetNewRole !== Role.SuperAdmin;
  }
  
  if (currentRole === Role.Admin) {
    // Admin ne peut modifier que les Challenger → Judge
    return targetCurrentRole === Role.Challenger && targetNewRole === Role.Judge;
  }
  
  return false;
}

// Liste des rôles disponibles selon le rôle actuel
export function getAvailableRoles(currentRole: UserRole): Role[] {
  if (currentRole === Role.SuperAdmin) {
    return [Role.Challenger, Role.Judge, Role.Admin];
  }
  
  if (currentRole === Role.Admin) {
    return [Role.Judge];
  }
  
  return [];
}

// Vérifie les permissions pour la gestion des utilisateurs
export function canManageUsers(role: UserRole): boolean {
  return isAdmin(role);
}

// Vérifie si un utilisateur est juré
export function isJuror(role?: UserRole | null): boolean {
  return role === Role.Judge;
}

// Vérifie si un utilisateur est challenger
export function isChallenger(role?: UserRole | null): boolean {
  return role === Role.Challenger;
}