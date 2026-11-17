import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const packets = await prisma.sRPacket.findMany({
    include: {
      patient: true,
      createdBy: { select: { name: true } },
      physicianOrder: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(packets);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.patientId || !await prisma.patient.findUnique({ where: { id: body.patientId } })) return NextResponse.json({ error: "Select a valid patient" }, { status: 400 });
  if (body.incidentReportId) {
    const incident = await prisma.incidentReport.findUnique({ where: { id: body.incidentReportId } });
    if (!incident || incident.patientId !== body.patientId) return NextResponse.json({ error: "The linked incident must belong to the selected patient" }, { status: 400 });
  }
  const packet = await prisma.sRPacket.create({
    data: {
      patientId: body.patientId,
      createdById: session.user.id,
      incidentReportId: body.incidentReportId ?? null,
    },
  });
  return NextResponse.json(packet, { status: 201 });
}
