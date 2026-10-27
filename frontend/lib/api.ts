import { apiBaseUrl } from "./auth-config";

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!apiBaseUrl) throw new Error("The platform API is not configured for this site.");
  let response: Response;
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  headers.set("cache-control", "no-cache");
  headers.set("pragma", "no-cache");
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers,
    });
  } catch (cause) {
    const detail = cause instanceof Error ? ` (${cause.message})` : "";
    throw new Error(
      `Cannot reach the platform API at ${apiBaseUrl}. Check the API URL and confirm the backend server is running.${detail}`,
      { cause },
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || "The request could not be completed.");
  return payload as T;
}
