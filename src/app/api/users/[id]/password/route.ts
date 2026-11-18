import { updatePassword } from "@/lib/account/update-password";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updatePassword(req, id);
}
