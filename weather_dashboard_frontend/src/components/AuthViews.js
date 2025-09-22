import React, { useState } from "react";
import "../theme.css";
import "../App.css";
import { signin, signup, isEmailValid, isUsernameValid, signout } from "../services/auth";

// Small helper for input
function Field({ label, type="text", value, onChange, placeholder, name, autoComplete, required=true }) {
  return (
    <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
      <span style={{ color: "var(--cp-muted)" }}>{label}</span>
      <input
        style={{
          border: "2px solid rgba(0,0,0,0.08)",
          borderRadius: "14px",
          padding: "12px 14px",
          fontSize: 16,
          outline: "none",
          boxShadow: "0 6px 16px rgba(167,139,250,0.12)"
        }}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
    </label>
  );
}

function Card({ children, title, subtitle, footer }) {
  return (
    <section className="card" style={{
      maxWidth: 480,
      margin: "24px auto",
      padding: 22,
      background: "linear-gradient(180deg, rgba(249,168,212,0.22), rgba(164,128,255,0.12)), var(--cp-surface)"
    }}>
      <div style={{ display: "grid", gap: 8, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="brand-logo" aria-hidden>🍬</div>
          <h2 style={{ margin: 0, fontWeight: 900 }}>{title}</h2>
        </div>
        {subtitle && <div className="helper" style={{ textAlign: "left" }}>{subtitle}</div>}
      </div>
      <div>{children}</div>
      {footer && <div style={{ marginTop: 14 }}>{footer}</div>}
    </section>
  );
}

// PUBLIC_INTERFACE
export function SignIn({ onSuccess, onSwitch }) {
  /** Sign in form using email/username + password. */
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signin({ identifier, password });
      onSuccess?.();
    } catch (ex) {
      setErr(ex?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="Welcome back"
      subtitle="Sign in to view your sweet weather dashboard."
      footer={
        <div className="helper">
          New here?{" "}
          <button type="button" onClick={onSwitch} style={linkButtonStyle}>
            Create an account
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <Field
          label="Email or Username"
          name="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@candy.com or sweet.user"
          autoComplete="username"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {err && <div className="error" role="alert">{err}</div>}
        <button
          type="submit"
          className="search-button"
          disabled={loading}
          style={primaryButtonStyle(loading)}
          aria-busy={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </Card>
  );
}

// PUBLIC_INTERFACE
export function SignUp({ onSuccess, onSwitch }) {
  /** Sign up form for creating an account locally. */
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState({ email: true, username: true });

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    const emailOk = isEmailValid(email);
    const userOk = isUsernameValid(username);
    setValid({ email: emailOk, username: userOk });
    if (!emailOk || !userOk) return;

    setLoading(true);
    try {
      await signup({ email, username, password });
      onSuccess?.();
    } catch (ex) {
      setErr(ex?.message || "Unable to sign up.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="Create your account"
      subtitle="Store your session locally; passwords are hashed in-browser."
      footer={
        <div className="helper">
          Already have an account?{" "}
          <button type="button" onClick={onSwitch} style={linkButtonStyle}>
            Sign in
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <Field
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@candy.com"
          autoComplete="email"
        />
        {!valid.email && <div className="error" role="alert">Enter a valid email.</div>}
        <Field
          label="Username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="sweet.user"
          autoComplete="username"
        />
        {!valid.username && <div className="error" role="alert">3-24 chars; letters, numbers, underscore, dot.</div>}
        <Field
          label="Password"
          name="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 6 characters"
          autoComplete="new-password"
        />
        {err && <div className="error" role="alert">{err}</div>}
        <button
          type="submit"
          className="search-button"
          disabled={loading}
          style={primaryButtonStyle(loading)}
          aria-busy={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </Card>
  );
}

// PUBLIC_INTERFACE
export function AuthGate({ isAuthed, onLogout, children }) {
  /**
   * Simple header with logout when authed. Wraps app content.
   * Exposes a "Sign out" button matching the Candy Pop style.
   */
  if (!isAuthed) return <>{children}</>;
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{
        maxWidth: 1040,
        margin: "8px auto 0",
        padding: "6px 10px",
        display: "flex",
        justifyContent: "flex-end"
      }}>
        <button
          type="button"
          onClick={() => { signout(); onLogout?.(); }}
          aria-label="Sign out"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.9), rgba(244,114,182,0.9))",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "8px 12px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 6px 12px rgba(239,68,68,0.35)"
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

const linkButtonStyle = {
  background: "transparent",
  border: "none",
  color: "var(--cp-secondary)",
  fontWeight: 900,
  textDecoration: "underline",
  cursor: "pointer"
};

function primaryButtonStyle(loading) {
  return {
    background: "var(--cp-primary)",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "12px 16px",
    fontWeight: 900,
    cursor: loading ? "default" : "pointer",
    opacity: loading ? 0.8 : 1,
    boxShadow: "0 10px 20px rgba(244,114,182,0.35)"
  };
}
