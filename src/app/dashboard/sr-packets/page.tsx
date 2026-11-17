import PacketList from "@/components/sr/PacketList";
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

      <PacketList packets={packets.map(p => ({
        id: p.id, patientName: p.patient.fullName, mrn: p.patient.mrn,
        dateLabel: format(new Date(p.createdAt), "MMM d, yyyy"), submitted: !!p.submittedAt,
        incidentId: p.incidentReport?.id ?? null,
        types: [p.physicianOrder?.isPhysicalRestraint ? "Physical" : "", p.physicianOrder?.isSeclusion ? "Seclusion" : "", p.physicianOrder?.isChemicalRestraint ? "Chemical" : ""].filter(Boolean),
      }))} />
    </div>
  );
}
