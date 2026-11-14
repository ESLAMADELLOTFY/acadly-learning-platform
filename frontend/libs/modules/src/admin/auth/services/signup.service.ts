import API from "@acadly/infrastructure/apis/api";
import axios from "axios";
import type { AuthResponse, RegisterCredentials } from "../interfaces/auth";

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return error.message;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}

export const registerUser = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>(
    "/auth/register",
    credentials,
  );

  return response.data;
};
