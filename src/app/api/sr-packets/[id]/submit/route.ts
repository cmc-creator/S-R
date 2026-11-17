import { sectionKeys, sectionIssues, toFormSection } from "@/lib/reports/sections";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "SRPacket" WHERE "id" = ${id} FOR UPDATE`;
    const packet = await tx.sRPacket.findUnique({
      where: { id },
      include: {
        physicianOrder: true,
        faceToFaceEval: true,
        monitoringLogs: { include: { entries: true } },
        terminationSummary: true,
        patientDebriefing: true,
        staffDebriefing: true,
        afterActionCritique: true,
      },
    });

    if (!packet) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only the creator, a supervisor, or admin can submit
    const role = (session.user as { role?: string }).role;
    if (packet.createdById !== session.user.id && role !== "ADMIN" && role !== "SUPERVISOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (packet.submittedAt) {
      return NextResponse.json({ error: "Packet already submitted" }, { status: 409 });
    }

    // Existence alone is not completion: apply the same hard stops as section saving.
    const incomplete: string[] = [];
    for (const key of sectionKeys) {
      const record = key === "monitoringLogs" ? packet.monitoringLogs[0] : packet[key];
      if (!record) incomplete.push(key);
      else {
        const issues = sectionIssues(key, toFormSection(key, JSON.parse(JSON.stringify(record))));
        incomplete.push(...issues.map(issue => `${key}: ${issue}`));
      }
    }

    if (incomplete.length > 0) {
      return NextResponse.json(
        { error: "Cannot submit — incomplete sections: " + incomplete.join(", ") },
        { status: 400 }
      );
    }

    const updated = await tx.sRPacket.update({
      where: { id },
      data: { submittedAt: new Date() },
    });

    return NextResponse.json(updated);
  });
}
