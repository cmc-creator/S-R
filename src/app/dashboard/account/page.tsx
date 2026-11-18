import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PasswordForm from "@/components/PasswordForm";
export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <div className="account-page"><div className="suite-page-heading"><div><p className="suite-eyebrow">YOUR WORKSPACE · YOUR ACCESS</p><h1>Account &amp; security</h1><p>Manage your password and review your account information.</p></div></div><div className="account-grid"><section className="account-card"><h2>Account details</h2><dl>{Object.entries({ Name: session.user.name, Email: session.user.email, Role: session.user.role, "Title / credentials": session.user.title ?? "Not set", Unit: session.user.unit ?? "Not set" }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>Contact an administrator to update your identity, role or unit. Clinical records are not changed here.</p></section><section className="account-card"><h2>Change password</h2><PasswordForm /></section></div></div>;
}
