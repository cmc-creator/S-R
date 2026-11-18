export function canDeletePacket(user: { id: string; role: string }, packet: { createdById: string; submittedAt: unknown }) {
  return !packet.submittedAt && (packet.createdById === user.id || ["ADMIN", "SUPERVISOR"].includes(user.role));
}
