import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "16px 24px",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, letterSpacing: "0.02em" }}>
          &copy; {year} NyxCollective LLC. All rights reserved.&ensp;&middot;&ensp;SR Suite&#8482; is a trademark of NyxCollective LLC.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/terms"
            style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none", letterSpacing: "0.02em" }}
          >
            Terms of Use
          </Link>
          <Link
            href="/privacy"
            style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none", letterSpacing: "0.02em" }}
          >
            Privacy Policy
          </Link>
          <span style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.02em" }}>
            v1.0
          </span>
        </div>
      </div>
    </footer>
  );
}
