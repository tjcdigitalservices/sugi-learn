import type { UserRole } from "@/types/database";

export type { UserRole };

export interface AppProfile {
  id: string;
  role: UserRole;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSessionUser {
  id: string;
  email: string | null;
  /** True when the session is an anonymous/guest Auth user. */
  isAnonymous: boolean;
}

export interface CurrentAuth {
  user: AuthSessionUser;
  profile: AppProfile;
}

export const ADMIN_ROLE: UserRole = "admin";
export const LEARNER_ROLE: UserRole = "learner";

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}
