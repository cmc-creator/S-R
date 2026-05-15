"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Role } from "@prisma/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SRSuiteLockup } from "@/components/SRSuiteLogo";

interface Props {
  user: { name: string; email: string; role: Role; title?: string };
}

function NavLink({ href, children, exact }: { href: string; children: React.ReactNode; exact?: boolean }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: isActive ? "var(--text)" : "var(--text-2)",
        textDecoration: "none",
        padding: "4px 0",
        position: "relative",
        transition: "color 0.15s",
        letterSpacing: "0.005em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
      {isActive && (
        <span
          style={{
            position: "absolute",
            bottom: -1,
            left: 0,
            right: 0,
            height: 1,
            background: "var(--gold)",
            borderRadius: 1,
          }}
        />
      )}
    </Link>
  );
}

export default function Navbar({ user }: Props) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav
      style={{
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Left: Logo + Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/dashboard" style={{ textDecoration: "none", flexShrink: 0 }}>
            <SRSuiteLockup size={26} />
          </Link>

          {/* Nav links */}
          <div
            className="hidden md:flex"
            style={{ alignItems: "center", gap: 24 }}
          >
            <NavLink href="/dashboard" exact>Dashboard</NavLink>
            <NavLink href="/dashboard/sr-packets/new">New S&amp;R</NavLink>
            <NavLink href="/dashboard/sr-packets">All Packets</NavLink>
            {(user.role === Role.ADMIN || user.role === Role.SUPERVISOR) && (
              <>
                <NavLink href="/dashboard/analytics">QAPI</NavLink>
                <NavLink href="/dashboard/admin">Admin</NavLink>
              </>
            )}
          </div>
        </div>

        {/* Right: User + Toggle + Sign out */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* User info */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--gold-faint)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--gold)",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                {user.title ?? user.role}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="hidden md:block"
            style={{ width: 1, height: 18, background: "var(--border)" }}
          />

          <ThemeToggle />

          {/* Divider */}
          <div
            style={{ width: 1, height: 18, background: "var(--border)" }}
          />

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-2)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 6,
              transition: "color 0.15s, background 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
