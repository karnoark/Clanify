// src/types/database.ts

export type DatabaseMembershipStatus = 'active' | 'expired' | 'cancelled';

export interface DatabaseMembership {
  id: string;
  member_id: string;
  mess_id: string;
  plan_id: string;
  start_date: string; // ISO date string
  expiry_date: string; // ISO date string
  points: number | null;
  status: DatabaseMembershipStatus;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface DatabaseMembershipPlan {
  id: string;
  mess_id: string;
  name: string;
  description: string | null;
  membership_period: number;
  price: number;
  is_active: boolean;
  created_at: string; // ISO timestamp
}

export interface DatabaseMembershipRequest {
  id: string;
  member_id: string;
  mess_id: string;
  plan_id: string;
  requested_start_date: string; // ISO date string
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  points_to_use: number | null;
  points_days_added: number | null;
  processed_at: string | null; // ISO timestamp
  processed_by: string | null;
  created_at: string; // ISO timestamp
  membership_plans?: DatabaseMembershipPlan;
}

// Type guards for database responses
export const isDatabaseMembership = (obj: any): obj is DatabaseMembership => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.member_id === 'string' &&
    typeof obj.mess_id === 'string' &&
    typeof obj.plan_id === 'string' &&
    typeof obj.start_date === 'string' &&
    typeof obj.expiry_date === 'string' &&
    (typeof obj.points === 'number' || obj.points === null) &&
    typeof obj.status === 'string'
  );
};

// Points related database types
export interface DatabasePointsTransaction {
  points_used: number | null;
  points_days_added: number | null;
}
