export interface AdminFetchOptions extends RequestInit {
  token?: string;
  json?: unknown;
}

export async function adminFetch(
  input: string | URL | Request,
  options: AdminFetchOptions = {},
): Promise<Response> {
  const { token, json, headers, ...rest } = options;
  const mergedHeaders = new Headers(headers);

  if (token) {
    mergedHeaders.set("x-admin-token", token);
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (json !== undefined) {
    if (!mergedHeaders.has("Content-Type")) {
      mergedHeaders.set("Content-Type", "application/json");
    }
    return fetch(input, {
      ...rest,
      headers: mergedHeaders,
      body: JSON.stringify(json),
    });
  }

  return fetch(input, {
    ...rest,
    headers: mergedHeaders,
  });
}
