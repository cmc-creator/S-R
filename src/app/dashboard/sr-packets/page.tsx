import NewPacketAction from "@/components/sr/NewPacketAction";
import PacketList from "@/components/sr/PacketList";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
      <div className="suite-page-heading"><div><p className="suite-eyebrow">ORGANIZED. ACCESSIBLE. CONSIDERED.</p><h1>Packet library</h1><p>Your documentation, together in one place. Find a record or pick up where you left off.</p></div><NewPacketAction /></div>

      <PacketList packets={packets.map(p => ({
        id: p.id, patientName: p.patient.fullName, mrn: p.patient.mrn,
        dateLabel: format(new Date(p.createdAt), "MMM d, yyyy"), submitted: !!p.submittedAt,
        incidentId: p.incidentReport?.id ?? null,
        types: [p.physicianOrder?.isPhysicalRestraint ? "Physical" : "", p.physicianOrder?.isSeclusion ? "Seclusion" : "", p.physicianOrder?.isChemicalRestraint ? "Chemical" : ""].filter(Boolean),
      }))} />
    </div>
  );
}
