import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { sectionIssues, toStoredSection, type SectionKey } from "./sections";

// Only model scalar fields may cross the form boundary; no IDs, relations or audit fields.
export async function prepareSection(req: Request, key: SectionKey, model: string, db: Prisma.TransactionClient) {
  const body = await req.json();
  if (!body || typeof body.srPacketId !== "string") return { error: NextResponse.json({ error: "Packet is required" }, { status: 400 }) };
  // Share a row lock with submission so a save cannot slip in after finalization.
  await db.$queryRaw`SELECT "id" FROM "SRPacket" WHERE "id" = ${body.srPacketId} FOR UPDATE`;
  const packet = await db.sRPacket.findUnique({ where: { id: body.srPacketId } });
  if (!packet) return { error: NextResponse.json({ error: "Packet not found" }, { status: 404 }) };
  if (packet.submittedAt) return { error: NextResponse.json({ error: "Submitted packets cannot be edited" }, { status: 409 }) };
  const issues = sectionIssues(key, body);
  if (issues.length) return { error: NextResponse.json({ error: "Complete before continuing: " + issues.join("; ") }, { status: 400 }) };
  const mapped = toStoredSection(key, body);
  const data: Record<string, unknown> = {};
  const fields = Prisma.dmmf.datamodel.models.find(m => m.name === model)!.fields;
  for (const field of fields) {
    if (field.kind === "object" || ["id", "createdAt", "updatedAt", "physicianId", "completedById"].includes(field.name)) continue;
    let value = mapped[field.name];
    if (value === undefined) continue;
    if (field.type === "DateTime") value = value ? new Date(String(value)) : null;
    if (field.type === "Boolean") value = value === "" || value == null ? (field.isRequired ? false : null) : value === true || value === "true";
    if (field.type === "Int") value = value === "" || value == null ? null : Number(value);
    if (value instanceof Date && Number.isNaN(value.getTime())) return { error: NextResponse.json({ error: `Invalid date: ${field.name}` }, { status: 400 }) };
    data[field.name] = value;
  }
  return { data, body, packet };
}
