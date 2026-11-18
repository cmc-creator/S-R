import { updatePassword } from "@/lib/account/update-password";
export async function POST(req: Request) { return updatePassword(req); }
