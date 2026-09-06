import { getToken } from "./lib/supabase";

export { getToken, setToken, signIn, signUp, signOut, getUser } from "./lib/supabase";

const API_BASE: string = (import.meta as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      (body as { detail?: string; error?: string }).detail || (body as { error?: string }).error || `Request failed (${res.status})`,
      res.status
    );
  }
  return body as T;
}

// ── 8-digit email-verification flows (FastAPI /api/v1/auth/*) ──────────────

/** Stable error codes echoed by the backend `detail` field. */
export const AUTH_CODE = {
  EMAIL_EXISTS: "EMAIL_EXISTS",
  INVALID_OR_EXPIRED: "INVALID_OR_EXPIRED_CODE",
  TOO_MANY_ATTEMPTS: "TOO_MANY_ATTEMPTS",
  RESEND_TOO_SOON: "RESEND_TOO_SOON",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  SEND_FAILED: "CODE_SEND_FAILED",
} as const;

export interface CodeDelivery {
  ok: boolean;
  maskedEmail: string;
  emailLive: boolean;
  expiresMinutes: number;
  devCode?: string | null;
}

export interface VerifySignupInput {
  email: string;
  code: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

/**
 * Request an 8-digit signup code. Never throws for the "email already exists"
 * case — callers inspect `{ exists: true }` to show the login/reset popup.
 */
export async function requestSignupCode(email: string): Promise<{ exists?: boolean } & Partial<CodeDelivery>> {
  try {
    const body = await api<CodeDelivery>("/api/v1/auth/code/signup", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { exists: false, ...body };
  } catch (err) {
    if (err instanceof ApiError && err.status === 409 && err.message === AUTH_CODE.EMAIL_EXISTS) {
      return { exists: true };
    }
    throw err;
  }
}

export async function verifySignupCode(input: VerifySignupInput): Promise<void> {
  await api("/api/v1/auth/verify/signup", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      code: input.code,
      first_name: input.firstName,
      last_name: input.lastName,
      password: input.password,
    }),
  });
}

export async function requestResetCode(email: string): Promise<CodeDelivery> {
  return api<CodeDelivery>("/api/v1/auth/code/reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  await api("/api/v1/auth/verify/reset", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      code: input.code,
      new_password: input.newPassword,
    }),
  });
}

/** Map a backend auth error code to a friendly, human-readable message. */
export function authErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!(err instanceof Error)) return fallback;
  const message = err.message ?? "";
  if (message.includes(AUTH_CODE.INVALID_OR_EXPIRED))
    return "That code is incorrect or has expired. Request a new one and try again.";
  if (message.includes(AUTH_CODE.TOO_MANY_ATTEMPTS))
    return "Too many attempts. Request a new code before trying again.";
  if (message.includes(AUTH_CODE.RESEND_TOO_SOON))
    return "Please wait a moment before requesting another code.";
  if (message.includes(AUTH_CODE.WEAK_PASSWORD))
    return message.split(":")[1]?.trim() ? `Password ${message.split(":")[1].trim()}.` : "Password does not meet the requirements.";
  if (message.includes(AUTH_CODE.ACCOUNT_NOT_FOUND))
    return "We couldn't find an account for that email address.";
  if (message.includes(AUTH_CODE.EMAIL_EXISTS))
    return "An account with this email already exists.";
  if (message.includes(AUTH_CODE.SEND_FAILED))
    return "The email could not be sent right now. Please try again.";
  return err.message || fallback;
}