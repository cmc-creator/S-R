import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prepareSection } from "@/lib/reports/save-section";
import { toStoredSection } from "@/lib/reports/sections";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return prisma.$transaction(async tx => {
    const result = await prepareSection(req, "monitoringLogs", "SRMonitoringLog", tx);
    if (result.error) return result.error;
    const entries = toStoredSection("monitoringLogs", result.body).entries as Prisma.SRMonitoringEntryCreateWithoutMonitoringLogInput[];
    const cleanEntries = entries.map(({ militaryTime, behaviorCode, interventionCode, staffInitials }) => ({ militaryTime, behaviorCode, interventionCode, staffInitials }));
    const data = result.data as unknown as Prisma.SRMonitoringLogUncheckedCreateInput;
    // Reopening a saved log updates it instead of producing duplicate observation sheets.
    const log = await (async () => {
      const existing = typeof result.body.id === "string" ? await tx.sRMonitoringLog.findFirst({ where: { id: result.body.id, srPacketId: result.packet.id } }) : null;
      if (result.body.id && !existing) return null;
      if (existing) {
        await tx.sRMonitoringEntry.deleteMany({ where: { monitoringLogId: existing.id } });
        return tx.sRMonitoringLog.update({ where: { id: existing.id }, data: { ...data, entries: { create: cleanEntries } }, include: { entries: true } });
      }
      return tx.sRMonitoringLog.create({ data: { ...data, entries: { create: cleanEntries } }, include: { entries: true } });
    })();
    return log ? NextResponse.json(log) : NextResponse.json({ error: "Monitoring sheet not found in this packet. Refresh before trying again." }, { status: 404 });
  });
}
