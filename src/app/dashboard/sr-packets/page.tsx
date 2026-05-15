import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export default async function SRPacketsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  let packets: Awaited<ReturnType<typeof prisma.sRPacket.findMany<{ include: { patient: true; physicianOrder: { select: { id: true; isPhysicalRestraint: true; isSeclusion: true; isChemicalRestraint: true } }; incidentReport: { select: { id: true } } } }>>> = [];
  try {
    packets = await prisma.sRPacket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        patient: true,
        physicianOrder: { select: { id: true, isPhysicalRestraint: true, isSeclusion: true, isChemicalRestraint: true } },
        incidentReport: { select: { id: true } },
      },
    });
  } catch {
    // DB not available locally
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", margin: 0 }}>
            S&amp;R Packets
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
            Seclusion / Physical Hold / Chemical Restraint Documentation
          </p>
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
            whiteSpace: "nowrap",
          }}
        >
          + New Packet
        </Link>
      </div>

      {/* Table card */}
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {packets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px" }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              style={{ color: "var(--text-3)", margin: "0 auto 12px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 8 }}>No S&amp;R packets yet</p>
            <Link href="/dashboard/sr-packets/new" style={{ fontSize: 13, color: "var(--gold)", textDecoration: "none" }}>
              Create your first packet
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
                  {["Patient", "MRN", "Type", "Linked Incident", "Date Created", "Status", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "11px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        color: "var(--text-3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packets.map((p, i) => {
                  const types = [
                    p.physicianOrder?.isPhysicalRestraint && "Physical",
                    p.physicianOrder?.isSeclusion && "Seclusion",
                    p.physicianOrder?.isChemicalRestraint && "Chemical",
                  ].filter((t): t is string => Boolean(t));
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: i < packets.length - 1 ? "1px solid var(--border-subtle)" : "none",
                        transition: "background 0.12s",
                      }}
                      className="hover:bg-[var(--bg-hover)]"
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>
                        {p.patient.fullName}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-2)", fontFamily: "monospace", fontSize: 12 }}>
                        {p.patient.mrn}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {types.length > 0 ? types.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: 11,
                                fontWeight: 500,
                                padding: "2px 8px",
                                borderRadius: 20,
                                background: "var(--gold-faint)",
                                border: "1px solid var(--border)",
                                color: "var(--gold)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t}
                            </span>
                          )) : <span style={{ color: "var(--text-3)" }}>—</span>}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {p.incidentReport ? (
                          <Link
                            href={`/dashboard/incidents/${p.incidentReport.id}`}
                            style={{ fontSize: 12, fontFamily: "monospace", color: "var(--gold)", textDecoration: "none" }}
                          >
                            {p.incidentReport.id.slice(0, 8)}…
                          </Link>
                        ) : (
                          <span style={{ color: "var(--text-3)" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-2)", whiteSpace: "nowrap" }}>
                        {format(new Date(p.createdAt), "MM/dd/yyyy")}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: "rgba(201,168,76,0.08)",
                            border: "1px solid var(--border)",
                            color: "var(--gold)",
                          }}
                        >
                          In Progress
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <Link
                          href={`/dashboard/sr-packets/${p.id}`}
                          style={{ fontSize: 12, fontWeight: 500, color: "var(--gold)", textDecoration: "none" }}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

