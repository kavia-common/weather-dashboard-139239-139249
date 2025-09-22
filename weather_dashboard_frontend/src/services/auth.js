//
// Local, frontend-only authentication helpers using localStorage.
// Passwords hashed via Web Crypto API (SHA-256). No plaintext stored.
//
const USERS_KEY = "cpw_users";
const SESSION_KEY = "cpw_session";

// PUBLIC_INTERFACE
export async function hashPassword(password) {
  /** SHA-256 hash a password string and return a hex digest. */
  const enc = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  const bytes = Array.from(new Uint8Array(digest));
  const hex = bytes.map(b => b.toString(16).padStart(2, "0")).join("");
  return hex;
}

// PUBLIC_INTERFACE
export function getUsers() {
  /** Retrieve the users array from localStorage. */
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveUsers(users) {
  /** Persist the users array to localStorage. */
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// PUBLIC_INTERFACE
export function getSession() {
  /** Return the current session object or null. */
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function setSession(session) {
  /** Persist the current session object (e.g., { email, username, ts }). */
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// PUBLIC_INTERFACE
export function clearSession() {
  /** Clear stored session. */
  localStorage.removeItem(SESSION_KEY);
}

// PUBLIC_INTERFACE
export function isEmailValid(email) {
  /** Basic email validation for UI gating. */
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// PUBLIC_INTERFACE
export function isUsernameValid(username) {
  /** Allow alphanumerics, underscores and dots, 3-24 chars. */
  if (!username) return false;
  return /^[a-zA-Z0-9_.]{3,24}$/.test(username);
}

// PUBLIC_INTERFACE
export async function signup({ email, username, password }) {
  /**
   * Create a new user (frontend-only).
   * Validates uniqueness of email and username (case-insensitive).
   * Stores hashed password.
   * Returns { email, username, createdAt } on success.
   */
  const users = getUsers();
  const emailLc = (email || "").trim().toLowerCase();
  const usernameLc = (username || "").trim().toLowerCase();

  if (!isEmailValid(emailLc)) {
    throw new Error("Please enter a valid email.");
  }
  if (!isUsernameValid(usernameLc)) {
    throw new Error("Username must be 3-24 chars, letters/numbers/_/.");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const exists = users.find(
    (u) => u.email === emailLc || u.username === usernameLc
  );
  if (exists) {
    throw new Error("Email or username already exists.");
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const newUser = {
    email: emailLc,
    username: usernameLc,
    passwordHash,
    createdAt: now,
    updatedAt: now
  };
  users.push(newUser);
  saveUsers(users);

  // Auto-login after signup
  setSession({ email: emailLc, username: usernameLc, ts: Date.now() });

  return { email: emailLc, username: usernameLc, createdAt: now };
}

// PUBLIC_INTERFACE
export async function signin({ identifier, password }) {
  /**
   * Sign in user using email or username as identifier.
   * Validates by comparing SHA-256 hash with stored hash.
   * Returns session object on success.
   */
  const users = getUsers();
  if (!identifier || !password) {
    throw new Error("Please provide identifier and password.");
  }
  const idLc = String(identifier).trim().toLowerCase();
  const user = users.find(
    (u) => u.email === idLc || u.username === idLc
  );
  if (!user) {
    throw new Error("Invalid credentials.");
  }
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    throw new Error("Invalid credentials.");
  }

  const sess = { email: user.email, username: user.username, ts: Date.now() };
  setSession(sess);
  return sess;
}

// PUBLIC_INTERFACE
export function signout() {
  /** Clear current session (logout). */
  clearSession();
}
