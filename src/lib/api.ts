import { ENV } from "../config/env";

type ApiError = { detail?: any; message?: string };

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${ENV.API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as any) : null;

  if (!res.ok) {
    const err: ApiError = data || {};
    const msg =
      (typeof err.detail === "string" && err.detail) ||
      err.message ||
      `Error ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
