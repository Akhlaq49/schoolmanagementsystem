export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  loginType: string;
  userId: number;
  name: string;
  email: string;
  roles?: string[]; // Array of user roles
}

