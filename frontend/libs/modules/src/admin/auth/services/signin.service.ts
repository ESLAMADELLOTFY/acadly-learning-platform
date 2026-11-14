import axios from "axios";
import API from "@acadly/infrastructure/apis/api";
import type { AuthResponse, SignInCredentials } from "../interfaces/auth";

export const signInUser = async (
  credentials: SignInCredentials,
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>(
    '/auth/signin',
    credentials,
  );

  return response.data;
};

export function getSignInErrorMessage(error: unknown): string {
  if (axios.isAxiosError<unknown>(error)) {
    const payload = error.response?.data;
    if (typeof payload === "object" && payload !== null && "message" in payload) {
      const message = payload.message;
      if (Array.isArray(message)) return message.join(", ");
      if (typeof message === "string") return message;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An error occurred while logging in.";
}