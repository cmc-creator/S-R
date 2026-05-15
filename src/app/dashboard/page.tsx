import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();

  let recentPackets: Awaited<ReturnType<typeof prisma.sRPacket.findMany<{ include: { patient: true } }>>> = [];
  let srCount = 0;
  try {
    [recentPackets, srCount] = await Promise.all([
      prisma.sRPacket.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { patient: true },
      }),
      prisma.sRPacket.count(),
    ]);
  } catch {
    // DB not available locally
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", margin: 0 }}>
            Welcome back, {session?.user.name?.split(" ")[0]}
          </h1>
        </div>
        <Link
          href="/dashboard/sr-packets/new"
          style={{
            background: "var(--accent)",
            color: "var(--accent-fg)",
            fontSize: 13,
            fontWeight: 600,
            padding: "9px 16px",
            borderRadius: 8,
            textDecoration: "none",
            letterSpacing: "0.01em",
            transition: "opacity 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          + New S&amp;R Packet
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <StatCard
          label="Total S&R Packets"
          value={srCount}
          icon={
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>
          Quick Actions
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <ActionCard
            href="/dashboard/sr-packets/new"
            title="New S&R Packet"
            description="Start a new Seclusion/Restraint documentation"
            icon={
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          />
          <ActionCard
            href="/dashboard/sr-packets"
            title="View All Packets"
            description="Browse and manage existing S&R records"
            icon={
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Recent packets */}
      <div>
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-subtle)",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
              Recent S&amp;R Packets
            </p>
            <Link
              href="/dashboard/sr-packets"
              style={{ fontSize: 12, fontWeight: 500, color: "var(--gold)", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>

          {recentPackets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 20px" }}>
              <svg
                width="36"
                height="36"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                style={{ color: "var(--text-3)", margin: "0 auto 12px" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 8 }}>No S&amp;R packets yet</p>
              <Link
                href="/dashboard/sr-packets/new"
                style={{ fontSize: 13, color: "var(--gold)", textDecoration: "none" }}
              >
                Create your first packet →
              </Link>
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {recentPackets.map((p, i) => (
                <li
                  key={p.id}
                  style={{ borderBottom: i < recentPackets.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                >
                  <Link
                    href={`/dashboard/sr-packets/${p.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 20px",
                      textDecoration: "none",
                      transition: "background 0.12s",
                    }}
                    className="hover:bg-[var(--bg-hover)]"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
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
                        {p.patient.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                          {p.patient.fullName}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-3)", margin: "2px 0 0" }}>
                          MRN {p.patient.mrn}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
                      {format(new Date(p.createdAt), "MMM d, yyyy")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 20px 18px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <div>
        <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", margin: 0 }}>
          {value}
        </p>
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginTop: 4, lineHeight: 1.3 }}>
          {label}
        </p>
      </div>
      <div
        style={{
          background: "var(--gold-faint)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 8,
          color: "var(--gold)",
        }}
      >
        {icon}
      </div>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
        textDecoration: "none",
        transition: "border-color 0.15s, background 0.15s",
      }}
      className="hover:border-[var(--gold)] hover:bg-[var(--bg-subtle)]"
    >
      <div
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 10,
          color: "var(--text-2)",
          flexShrink: 0,
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3 }}>{description}</p>
      </div>
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--text-3)", flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

