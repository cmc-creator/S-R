import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prepareSection } from "@/lib/reports/save-section";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return prisma.$transaction(async tx => {
    const result = await prepareSection(req, "faceToFaceEval", "SRFaceToFaceEvaluation", tx);
    if (result.error) return result.error;
    const data = result.data as unknown as Prisma.SRFaceToFaceEvaluationUncheckedCreateInput;
    const record = await tx.sRFaceToFaceEvaluation.upsert({
      where: { srPacketId: result.packet.id },
      update: data,
      create: { ...data, completedById: session.user.id },
    });
    return NextResponse.json(record);
  });
}
