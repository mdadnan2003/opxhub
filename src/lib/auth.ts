import { supabase } from "@/integrations/supabase/client";

export const ADMIN_EMAIL = "mdadnaniftekhari@gmail.com";
export const ADMIN_PASSWORD = "adnan786";

export type PreviewUser = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  college: string;
  degree: string;
  gradYear: number;
  interests: string[];
  createdAt: string;
};

const USERS_KEY = "opxhub.preview.users";
const SESSION_KEY = "opxhub.preview.session";
const fallbackStore = new Map<string, string>();

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function readStorage<T>(key: string): T | null {
  const storage = getStorage();

  if (storage) {
    try {
      const raw = storage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  const raw = fallbackStore.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

function writeStorage<T>(key: string, value: T) {
  const storage = getStorage();

  const serialized = JSON.stringify(value);

  if (storage) {
    try {
      storage.setItem(key, serialized);
      return;
    } catch {
      // local preview fallback: ignore storage failures gracefully
    }
  }

  fallbackStore.set(key, serialized);
}

function clearStorage(key: string) {
  const storage = getStorage();

  if (storage) {
    try {
      storage.removeItem(key);
      return;
    } catch {
      // ignore storage failures gracefully
    }
  }

  fallbackStore.delete(key);
}

function readUsers(): PreviewUser[] {
  return readStorage<PreviewUser[]>(USERS_KEY) ?? [];
}

function writeUsers(users: PreviewUser[]) {
  writeStorage(USERS_KEY, users);
}

export function clearPreviewAuth() {
  clearStorage(USERS_KEY);
  clearStorage(SESSION_KEY);
}

export function getPreviewUser(): PreviewUser | null {
  const session = readStorage<{ userId: string }>(SESSION_KEY);
  if (!session?.userId) return null;

  const user = readUsers().find((item) => item.id === session.userId);
  if (!user) {
    clearStorage(SESSION_KEY);
    return null;
  }

  return user;
}

export function signOutPreview() {
  clearStorage(SESSION_KEY);
}

export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore Supabase sign-out errors and rely on local cleanup
  }
  clearPreviewAuth();
}

export function ensureAdminPreviewUser(): PreviewUser | null {
  const existing = readUsers().find((item) => item.email.toLowerCase() === ADMIN_EMAIL);
  if (existing) {
    writeStorage(SESSION_KEY, { userId: existing.id });
    return existing;
  }

  const seeded = signUpPreview({
    fullName: "Admin User",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    college: "OPXHUB",
    degree: "Admin",
    gradYear: 2026,
    interests: ["Admin", "Operations"],
  });

  if (!seeded) return null;
  writeStorage(SESSION_KEY, { userId: seeded.id });
  return seeded;
}

export function signUpPreview(input: {
  fullName: string;
  email: string;
  password: string;
  college: string;
  degree: string;
  gradYear: number;
  interests: string[];
}): PreviewUser | null {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();

  if (!fullName || !email || !password) return null;

  const users = readUsers();
  if (users.some((user) => user.email === email)) return null;

  const user: PreviewUser = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `preview-${Date.now()}`,
    fullName,
    email,
    password,
    college: input.college.trim(),
    degree: input.degree.trim(),
    gradYear: Number.isFinite(input.gradYear) ? Number(input.gradYear) : 2027,
    interests: Array.from(
      new Set((input.interests ?? []).map((item) => item.trim()).filter(Boolean)),
    ),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeUsers(users);
  writeStorage(SESSION_KEY, { userId: user.id });

  return user;
}

export function signInPreview(input: { email: string; password: string }): PreviewUser | null {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) return null;

  const user = readUsers().find((item) => item.email === email && item.password === password);
  if (!user) return null;

  writeStorage(SESSION_KEY, { userId: user.id });
  return user;
}

export async function signUpWithSupabase(input: {
  fullName: string;
  email: string;
  password: string;
  college: string;
  degree: string;
  gradYear: number;
  interests: string[];
}) {
  const passwordError = validatePasswordStrength(input.password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        college: input.college.trim(),
        course: input.degree.trim(),
        grad_year: Number(input.gradYear || 2027),
        interests: Array.from(
          new Set((input.interests ?? []).map((item) => item.trim()).filter(Boolean)),
        ),
      },
    },
  });

  if (error) throw new Error(normalizeAuthErrorMessage(error.message));
  if (!data.user) throw new Error("Unable to create your account.");

  if (!data.session) {
    throw new Error("Check your inbox and confirm your email before continuing.");
  }

  await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      full_name: input.fullName.trim(),
      college: input.college.trim(),
      course: input.degree.trim(),
      grad_year: Number(input.gradYear || 2027),
      interests: Array.from(
        new Set((input.interests ?? []).map((item) => item.trim()).filter(Boolean)),
      ),
      headline: "Student builder",
      onboarded: false,
      about: "",
      skills: [],
      location: null,
    },
    { onConflict: "id" },
  );

  return data.user;
}

export function validatePasswordStrength(password: string): string | null {
  const value = password.trim();

  if (!/[A-Z]/.test(value)) return "Use at least 1 uppercase letter.";
  if (!/[0-9]/.test(value)) return "Use at least 1 number.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Use at least 1 symbol.";
  if (value.length < 8) return "Use at least 8 characters.";

  return null;
}

export function normalizeAuthErrorMessage(message: string | null | undefined): string {
  const trimmed = (message ?? "").trim();
  if (!trimmed) return "Something went wrong. Please try again.";

  const lower = trimmed.toLowerCase();
  if (
    lower.includes("email not confirmed") ||
    lower.includes("confirm your email") ||
    lower.includes("email confirmation")
  ) {
    return "Check your inbox and confirm your email before logging in.";
  }
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password") ||
    lower.includes("invalid credentials")
  ) {
    return "Invalid email or password.";
  }
  if (lower.includes("password is known to be weak") || lower.includes("weak and easy to guess")) {
    return "Use 8+ chars with 1 uppercase, 1 number, and 1 symbol.";
  }
  if (lower.includes("already registered") || lower.includes("user already registered")) {
    return "An account with this email already exists.";
  }

  return trimmed;
}

export function getAuthRedirectUrl(nextPath = "/feed") {
  if (typeof window === "undefined") return nextPath;
  const path = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${window.location.origin}${path}`;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthRedirectUrl("/feed"),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) throw new Error(normalizeAuthErrorMessage(error.message));
}

export async function signUpWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthRedirectUrl("/feed"),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) throw new Error(normalizeAuthErrorMessage(error.message));
}

export function isAdminCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export async function signInWithSupabase(input: { email: string; password: string }) {
  const email = input.email.trim();
  const password = input.password;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      return data.user;
    }
  } catch {
    // Fall through to preview login for local/demo-only credentials when no real Supabase auth exists.
  }

  if (isAdminCredentials(email, password)) {
    const previewUser = ensureAdminPreviewUser();
    if (!previewUser) {
      throw new Error("Unable to initialize the admin account.");
    }

    return {
      id: previewUser.id,
      email: previewUser.email,
      full_name: previewUser.fullName,
      first_name: previewUser.fullName.split(" ")[0] || previewUser.fullName,
      app_metadata: { role: "admin" },
      user_metadata: {
        full_name: previewUser.fullName,
        college: previewUser.college,
        course: previewUser.degree,
        grad_year: previewUser.gradYear,
        interests: previewUser.interests,
      },
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw new Error(normalizeAuthErrorMessage(error.message));
  }
  return data.user;
}

export async function getActiveUser() {
  const previewUser = getPreviewUser();
  if (previewUser) {
    return {
      id: previewUser.id,
      email: previewUser.email,
      full_name: previewUser.fullName,
      first_name: previewUser.fullName.split(" ")[0] || previewUser.fullName,
      college: previewUser.college,
      degree: previewUser.degree,
      grad_year: previewUser.gradYear,
      interests: previewUser.interests,
    };
  }

  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}
