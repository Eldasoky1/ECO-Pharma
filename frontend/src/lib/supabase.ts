const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const TOKEN_KEY = "seph_token";

interface SessionData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
}

interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable */ }
}

export async function signIn(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error_description || body.msg || body.error || `Auth failed (${res.status})`);
  }
  const data: SessionData = await res.json();
  setToken(data.access_token);

  // Decode JWT payload to get user info
  let user: AuthUser = { id: "", email };
  try {
    const payload = JSON.parse(atob(data.access_token.split(".")[1]));
    user = { id: payload.sub ?? "", email: payload.email ?? email, role: payload.role };
  } catch { /* use defaults */ }

  return { token: data.access_token, user };
}

export async function signUp(email: string, password: string, meta?: { firstName?: string; lastName?: string }): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      data: meta ? { first_name: meta.firstName, last_name: meta.lastName } : undefined,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error_description || body.msg || body.error || `Signup failed (${res.status})`);
  }
  const data: SessionData = await res.json();
  setToken(data.access_token);

  let user: AuthUser = { id: "", email };
  try {
    const payload = JSON.parse(atob(data.access_token.split(".")[1]));
    user = { id: payload.sub ?? "", email: payload.email ?? email, role: payload.role };
  } catch { /* use defaults */ }

  return { token: data.access_token, user };
}

export async function signOut(): Promise<void> {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      });
    } catch { /* best-effort */ }
  }
  setToken(null);
}

export async function getUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      setToken(null);
      return null;
    }
    return { id: payload.sub ?? "", email: payload.email ?? "", role: payload.role };
  } catch {
    setToken(null);
    return null;
  }
}

/** Verifies the user's current password and refreshes the session token on success. */
export async function verifyPassword(email: string, password: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return false;
  const data: SessionData = await res.json();
  setToken(data.access_token);
  return true;
}

/** Applies a new password to the active Supabase Auth session immediately. */
export async function updatePassword(newPassword: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("No active session. Please sign in again.");
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.msg || body.error_description || body.error || `Password update failed (${res.status})`);
  }
}
