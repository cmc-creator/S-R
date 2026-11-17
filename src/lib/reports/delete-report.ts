import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function deleteReport(kind: "incident" | "packet", id: string) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "SUPERVISOR"].includes(session.user.role)) return NextResponse.json({ error: "Only supervisors and administrators can delete reports" }, { status: 403 });
  try {
    const result = await prisma.$transaction(async tx => {
      if (kind === "incident") {
        const report = await tx.incidentReport.findUnique({ where: { id }, include: { _count: { select: { srPackets: true } } } });
        if (!report) return { status: 404, error: "Report not found" };
        if (report._count.srPackets || [report.reviewedByName, report.reviewedByDate, report.qmSignature, report.qmComments, report.qmReviewInitials, report.supervisorName, report.supervisorTitle, report.supervisorDate, report.supervisorComments, report.supervisorSignature, report.incidentLevel].some(Boolean)) return { status: 409, error: "Linked or reviewed reports cannot be deleted. Contact your records administrator." };
        await tx.incidentReport.delete({ where: { id } });
      } else {
        const packet = await tx.sRPacket.findUnique({ where: { id } });
        if (!packet) return { status: 404, error: "Packet not found" };
        if (packet.submittedAt) return { status: 409, error: "Submitted packets cannot be deleted. Contact your records administrator." };
        await tx.sRMonitoringEntry.deleteMany({ where: { monitoringLog: { srPacketId: id } } });
        await tx.sRMonitoringLog.deleteMany({ where: { srPacketId: id } });
        await tx.sRPhysicianOrder.deleteMany({ where: { srPacketId: id } });
        await tx.sRFaceToFaceEvaluation.deleteMany({ where: { srPacketId: id } });
        await tx.sRTerminationSummary.deleteMany({ where: { srPacketId: id } });
        await tx.sRPatientDebriefing.deleteMany({ where: { srPacketId: id } });
        await tx.sRStaffDebriefing.deleteMany({ where: { srPacketId: id } });
        await tx.sRAfterActionCritique.deleteMany({ where: { srPacketId: id } });
        await tx.sRPacket.delete({ where: { id } });
      }
      return null;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return result ? NextResponse.json({ error: result.error }, { status: result.status }) : new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && ["P2034", "P2003", "P2025"].includes(err.code)) return NextResponse.json({ error: "The record changed. Refresh and check it before trying again." }, { status: 409 });
    throw err;
  }
}
