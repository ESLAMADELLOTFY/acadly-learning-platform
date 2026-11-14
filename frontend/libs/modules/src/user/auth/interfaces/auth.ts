export interface AuthResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}
