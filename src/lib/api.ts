export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiFetch(
  endpoint: string,
  options?: RequestInit
) {
  return fetch(`${API_URL}${endpoint}`, options);
}