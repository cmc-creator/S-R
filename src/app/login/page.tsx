"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SRSuiteLockup } from "@/components/SRSuiteLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="suite-login">
      <section className="suite-login-story" aria-label="SR Suite documentation workspace">
        <div className="suite-login-brand"><SRSuiteLockup size={38} /><span>THE DOCUMENTATION WORKSPACE</span></div>
        <div className="suite-login-editorial"><p className="suite-eyebrow">CONSIDERED SOFTWARE. ESSENTIAL WORK.</p><h1>But did you<br /><em>document it?</em></h1><p>A focused workspace for seclusion and restraint documentation. Designed to bring structure to the details, and confidence to your day.</p><div className="suite-login-divider" /><span>01 — DOCUMENT WITH PURPOSE<br />02 — KEEP EVERY DETAIL CONNECTED<br />03 — REVIEW WITH CARE</span></div>
        <p className="suite-login-story-footer">SR SUITE <span> / </span> DESTINY SPRINGS</p>
        <div className="suite-login-orbit" aria-hidden="true" />
      </section>
      <section className="suite-login-access" aria-labelledby="login-title">
        <div className="suite-login-toolbar"><span>STAFF ACCESS</span><ThemeToggle /></div>
        <main className="suite-login-form-area">
          <div className="suite-login-form">
            <p className="suite-eyebrow">WELCOME TO YOUR WORKSPACE</p><h2 id="login-title">Welcome back.</h2><p className="suite-login-subtitle">Sign in to continue your documentation.</p>
            <div className="suite-login-form-card">
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 18 }}>
                  <label
                    htmlFor="login-email"
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-2)",
                      marginBottom: 8,
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourfacility.com"
                    style={{
                      width: "100%",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: "var(--text)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label
                    htmlFor="login-password"
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-2)",
                      marginBottom: 8,
                    }}
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: "var(--text)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {error && (
                  <div role="alert"
                    style={{
                      background: "var(--danger-bg)",
                      border: "1px solid var(--danger-border)",
                      color: "var(--danger)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    background: "var(--accent)",
                    color: "var(--accent-fg)",
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.65 : 1,
                    transition: "opacity 0.15s, background 0.15s",
                  }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <svg
                        style={{ animation: "spin 0.9s linear infinite" }}
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    "Sign in →"
                  )}
                </button>
              </form>
          </div>

          <details className="account-recovery-help"><summary>Forgot your password?</summary><p>Contact your facility administrator. After verifying your identity, an administrator can reset your password from Administration. Email reset links are not enabled. Never send passwords in support messages.</p></details>
          <p className="suite-login-privacy">Patient information is confidential.<br />Only access records you are authorized to use.</p>
          </div>
        </main>
        <div className="suite-login-legal">&copy; {new Date().getFullYear()} NyxCollective LLC · SR Suite™<div><a href="/terms">Terms</a><a href="/privacy">Privacy</a></div></div>
      </section>
    </div>
  );
}
