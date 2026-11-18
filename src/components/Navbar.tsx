"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Role } from "@prisma/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SRSuiteLockup } from "@/components/SRSuiteLogo";
import InterfaceIcon, { type IconName } from "@/components/InterfaceIcon";

interface Props { user: { name: string; email: string; role: Role; title?: string }; }
export default function Navbar({ user }: Props) {
  const pathname = usePathname();
  const links: { href: string; label: string; icon: IconName; active: boolean }[] = [
    { href: "/dashboard", label: "Overview", icon: "overview", active: pathname === "/dashboard" },
    { href: "/dashboard/sr-packets/new", label: "Create packet", icon: "plus", active: pathname === "/dashboard/sr-packets/new" },
    { href: "/dashboard/sr-packets", label: "Packet library", icon: "layers", active: pathname.startsWith("/dashboard/sr-packets") && pathname !== "/dashboard/sr-packets/new" },
    { href: "/dashboard/account", label: "Account & security", icon: "settings", active: pathname.startsWith("/dashboard/account") },
    ...((user.role === Role.ADMIN || user.role === Role.SUPERVISOR) ? [
      { href: "/dashboard/analytics", label: "Quality & insights", icon: "chart" as const, active: pathname.startsWith("/dashboard/analytics") },
      { href: "/dashboard/admin", label: "Administration", icon: "settings" as const, active: pathname.startsWith("/dashboard/admin") },
    ] : []),
  ];
  const current = links.find(link => link.active)?.label ?? "Documentation";
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return <>
    <a href="#workspace-content" className="suite-skip-link">Skip to workspace</a>
    <aside className="suite-sidebar no-print">
      <Link href="/dashboard" className="suite-brand" aria-label="SR Suite overview"><SRSuiteLockup size={34} /><span>DOCUMENTATION WORKSPACE</span></Link>
      <div className="suite-workspace-label"><span className="suite-workspace-monogram">DS</span><div><strong>Destiny Springs</strong><span>Seclusion &amp; restraint</span></div></div>
      <p className="suite-nav-eyebrow">Workspace</p>
      <nav aria-label="Main navigation" className="suite-navigation">{links.map(link => <Link key={link.href} href={link.href} aria-current={link.active ? "page" : undefined}><InterfaceIcon name={link.icon} /><span>{link.label}</span>{link.active && <span className="suite-active-dot" />}</Link>)}</nav>
      <div className="suite-sidebar-note"><span className="suite-nav-eyebrow">Built around your work</span><p>One episode.<br />Every detail in its place.</p><Link href="/dashboard/sr-packets/new">Start a packet <InterfaceIcon name="arrow" width={15} height={15} /></Link></div>
      <div className="suite-account"><span className="suite-avatar">{initials}</span><div><strong>{user.name}</strong><span>{user.title ?? user.role.toLowerCase()}</span></div><button type="button" onClick={() => signOut({ callbackUrl: "/login" })} aria-label="Sign out" title="Sign out">↪</button></div>
    </aside>
    <div className="suite-topbar no-print"><div><span className="suite-topbar-brand">SR SUITE</span><span className="suite-breadcrumb">Workspace <span>/</span> <strong>{current}</strong></span></div><div className="suite-topbar-actions"><span className="suite-confidential">Confidential workspace</span><ThemeToggle /><button className="suite-mobile-signout" type="button" onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</button></div></div>
  </>;
}
