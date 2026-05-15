"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "var(--accent-fg)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              DS
            </span>
          </div>
          <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>
            Destiny Springs
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <div style={{ width: "100%", maxWidth: 360 }}>

          {/* Brand mark */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 8px 32px var(--gold-faint)",
              }}
            >
              <span style={{ color: "var(--accent-fg)", fontSize: 18, fontWeight: 700, letterSpacing: "0.02em" }}>
                DS
              </span>
            </div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                color: "var(--gold)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Seclusion &amp; Restraint Platform
            </p>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "var(--text)",
                margin: 0,
              }}
            >
              Sign in
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)", marginTop: 6 }}>
              Access your documentation portal
            </p>
          </div>

          {/* Form card */}
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Gold accent line */}
            <div
              style={{
                height: 1,
                background: "linear-gradient(90deg, transparent 0%, var(--gold) 40%, var(--gold) 60%, transparent 100%)",
              }}
            />

            <div style={{ padding: "28px 28px 32px" }}>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 18 }}>
                  <label
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
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@destinysprings.com"
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
                  <div
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
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-3)",
              marginTop: 20,
              letterSpacing: "0.02em",
            }}
          >
            Destiny Springs Behavioral Health &copy; {new Date().getFullYear()}
          </p>
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
