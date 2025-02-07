export interface GuardOptions {
  requireAuth?: boolean;
  requireMembership?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export interface GuardState {
  isChecking: boolean;
  error: Error | null;
  hasAccess: boolean;
}
