import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { entries, staffSignatures, ...logData } = body;

  // Delete any existing monitoring log for this packet to prevent duplicates on re-save
  const existing = await prisma.sRMonitoringLog.findFirst({
    where: { srPacketId: logData.srPacketId },
    select: { id: true },
  });
  if (existing) {
    await prisma.sRMonitoringEntry.deleteMany({ where: { monitoringLogId: existing.id } });
    await prisma.sRMonitoringLog.delete({ where: { id: existing.id } });
  }

  const log = await prisma.sRMonitoringLog.create({
    data: {
      ...logData,
      logDate: new Date(logData.logDate),
      staffSignatures: staffSignatures ?? [],
      entries: {
        create: (entries ?? []).map((e: { militaryTime: string; behaviorCode: string; interventionCode: string; staffInitials: string }) => ({
          militaryTime: e.militaryTime,
          behaviorCode: e.behaviorCode,
          interventionCode: e.interventionCode,
          staffInitials: e.staffInitials,
        })),
      },
    },
    include: { entries: true },
  });
  return NextResponse.json(log, { status: 201 });
}
