import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  return <div className="suite-shell"><Navbar user={session.user} /><div className="suite-main-column"><main id="workspace-content" className="suite-main" tabIndex={-1}>{children}</main><Footer /></div></div>;
}
