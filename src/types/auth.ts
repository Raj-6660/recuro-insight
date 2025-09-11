export type UserRole = 'student' | 'recruiter';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}