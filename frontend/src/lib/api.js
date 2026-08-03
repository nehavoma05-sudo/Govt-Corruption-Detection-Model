const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function getStoredSession() {
  return {
    token: localStorage.getItem("token") || "",
    user: JSON.parse(localStorage.getItem("user") || "null"),
    apiBase: localStorage.getItem("apiBase") || API_BASE,
  };
}

export function saveSession(auth) {
  const user = {
    full_name: auth.full_name || "User",
    role: auth.role,
  };
  localStorage.setItem("token", auth.token);
  localStorage.setItem("user", JSON.stringify(user));
  return { token: auth.token, user };
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function request(path, { apiBase, token, ...options }) {
  const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || `Request failed with ${response.status}`);
  }

  return data;
}

export function normalizeNumbers(payload, keys) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (value === "") return [key, null];
      if (keys.includes(key) && value !== null && value !== undefined) return [key, Number(value)];
      return [key, value];
    }),
  );
}
