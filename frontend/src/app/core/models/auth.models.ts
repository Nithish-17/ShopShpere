export type Role = 'ROLE_ADMIN' | 'ROLE_CUSTOMER';

export interface LoginRequest {
  username: string; // Note: Backend DTO property is 'username' with @Email validation
  password: string;
}

export interface LoginResponse {
  message: string; // Note: Backend returns the JWT token string in the 'message' field
}

export interface UserRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // 10 digit number
  password: string; // 8-100 characters
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AuthState {
  token: string | null;
  email: string | null;
  role: Role | null;
  isAuthenticated: boolean;
}
