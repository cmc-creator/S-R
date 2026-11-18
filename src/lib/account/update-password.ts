import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { passwordError } from "./password";

export async function updatePassword(req: Request, targetId?: string) {
  if (req.headers.get("sec-fetch-site") === "cross-site") return NextResponse.json({ error: "Cross-site requests are not allowed" }, { status: 403 });
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in again to continue" }, { status: 401 });
  if (targetId && session.user.role !== "ADMIN") return NextResponse.json({ error: "Only administrators can reset another account's password" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.currentPassword !== "string" || Buffer.byteLength(body.currentPassword, "utf8") > 72) return NextResponse.json({ error: "Enter your current password" }, { status: 400 });
  const invalid = passwordError(body.newPassword);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  if (body.newPassword !== body.confirmPassword) return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
  const actor = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!actor || !await bcrypt.compare(body.currentPassword, actor.password)) return NextResponse.json({ error: "Your current password is incorrect" }, { status: 400 });
  if (targetId && actor.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  const target = targetId && targetId !== actor.id ? await prisma.user.findUnique({ where: { id: targetId } }) : actor;
  if (!target) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  if (await bcrypt.compare(body.newPassword, target.password)) return NextResponse.json({ error: "Choose a password different from the current one" }, { status: 400 });
  const hash = await bcrypt.hash(body.newPassword, 12);
  // A concurrent reset must not silently replace credentials that changed meanwhile.
  const changed = await prisma.user.updateMany({ where: { id: target.id, password: target.password }, data: { password: hash } });
  if (changed.count !== 1) return NextResponse.json({ error: "The password changed during this request. Sign in again before retrying." }, { status: 409 });
  return NextResponse.json({ ok: true, signInAgain: target.id === actor.id }, { headers: { "Cache-Control": "no-store" } });
}
