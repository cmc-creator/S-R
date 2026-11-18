import { DeleteReportButton } from "@/components/ReportActions";
import { canDeletePacket } from "@/lib/reports/packet-permissions";
import InterfaceIcon, { type IconName } from "@/components/InterfaceIcon";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
  let recentPackets: Awaited<ReturnType<typeof prisma.sRPacket.findMany<{ include: { patient: true } }>>> = [];
  let total = 0, drafts = 0, submitted = 0;
  let unavailable = false;
  try {
    [recentPackets, total, drafts, submitted] = await Promise.all([
      prisma.sRPacket.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { patient: true } }),
      prisma.sRPacket.count(), prisma.sRPacket.count({ where: { submittedAt: null } }), prisma.sRPacket.count({ where: { submittedAt: { not: null } } }),
    ]);
  } catch { unavailable = true; }
  const firstDraft = recentPackets.find(p => !p.submittedAt);
  return <div className="executive-dashboard">
    <div className="suite-page-heading"><div><p className="suite-eyebrow">Your daily workspace <span> / </span> {format(new Date(), "MMM dd, yyyy")}</p><h1>Good to see you, {session?.user.name?.split(" ")[0]}.</h1><p>A considered space for essential documentation.</p></div><Link className="suite-button suite-button-primary" href="/dashboard/sr-packets/new"><InterfaceIcon name="plus" width={17} height={17} /> New S&amp;R packet</Link></div>
    <section className="suite-hero" aria-labelledby="hero-title"><div className="suite-hero-copy"><p className="suite-eyebrow">PRECISION IN EVERY EPISODE</p><h2 id="hero-title">Less friction.<br /><em>More focus.</em></h2><p>From the first detail to the final review.<br />Keep your documentation clear, connected and moving.</p><Link className="suite-hero-link" href={firstDraft ? `/dashboard/sr-packets/new?packetId=${firstDraft.id}` : "/dashboard/sr-packets/new"}>{firstDraft ? "Continue the latest draft" : "Begin a new packet"}<InterfaceIcon name="arrow" width={18} height={18} /></Link></div><div className="suite-hero-art" aria-hidden="true"><div className="suite-orbit suite-orbit-one" /><div className="suite-orbit suite-orbit-two" /><div className="suite-orbit suite-orbit-three" /><div className="suite-document-art"><span>SR / DOCUMENTATION</span><div className="suite-art-rule" /><InterfaceIcon name="document" width={44} height={44} /><i /><i /><i /><b>DETAILS, CONSIDERED.</b></div><span className="suite-art-caption">SR SUITE <span>—</span> THE CLINICAL COLLECTION</span></div></section>
    {unavailable && <div role="alert" className="suite-data-alert">Packet data couldn’t be loaded. Refresh to try again; the figures below are unavailable, not zero.</div>}
    <section className="suite-metrics" aria-label="Packet summary"><Metric label="Total packets" value={unavailable ? "—" : total} caption="Across the workspace" icon="layers" /><Metric label="In progress" value={unavailable ? "—" : drafts} caption="Drafts available to continue" icon="clock" /><Metric label="Submitted" value={unavailable ? "—" : submitted} caption="Locked documentation" icon="check" /></section>
    <div className="suite-dashboard-columns"><section className="suite-recent-panel" aria-labelledby="recent-title"><div className="suite-panel-heading"><div><p className="suite-eyebrow">YOUR DOCUMENTATION</p><h2 id="recent-title">Recent S&amp;R packets</h2></div><Link href="/dashboard/sr-packets">View library <InterfaceIcon name="arrow" width={15} height={15} /></Link></div>
      {unavailable ? <div className="suite-empty-state"><p>Recent packets are temporarily unavailable.</p></div> : !recentPackets.length ? <div className="suite-empty-state"><InterfaceIcon name="document" width={32} height={32} /><h3>A fresh page awaits.</h3><p>Your recent packets will appear here as you work.</p><Link className="suite-button suite-button-secondary" href="/dashboard/sr-packets/new">Create your first packet <InterfaceIcon name="arrow" width={16} height={16} /></Link></div> : <ul className="suite-recent-list">{recentPackets.map(p => <li key={p.id} className="recent-packet-row suite-recent-row"><Link className="suite-recent-packet-link" href={`/dashboard/sr-packets/${p.id}`}><span className="suite-patient-avatar">{p.patient.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span><span className="suite-recent-identity"><strong>{p.patient.fullName}</strong><span>MRN {p.patient.mrn} <span className="suite-inline-divider">/</span> {format(new Date(p.createdAt), "MMM d, yyyy")}</span></span><span className={`suite-record-status ${p.submittedAt ? "is-submitted" : ""}`}><span />{p.submittedAt ? "Submitted" : "In progress"}</span></Link><div className="recent-packet-actions">{p.submittedAt ? <span className="suite-protected-label">Submitted · protected</span> : session && canDeletePacket(session.user, p) ? <DeleteReportButton kind="sr-packets" id={p.id} stayOnPage description={`${p.patient.fullName} · MRN ${p.patient.mrn} · ${format(new Date(p.createdAt), "MMM d, yyyy h:mm a")}`} /> : <span className="suite-protected-label">Draft · owner/admin deletion only</span>}</div></li>)}</ul>}
    </section><aside className="suite-workflow-panel"><p className="suite-eyebrow">A CLEAR WAY FORWARD</p><h2>Thoughtful steps.<br />Thorough records.</h2><ol><li><span>01</span><div><strong>Start with the patient</strong><p>Confirm identity and create an episode.</p></div></li><li><span>02</span><div><strong>Document with clarity</strong><p>Work through each guided section.</p></div></li><li><span>03</span><div><strong>Review, then complete</strong><p>Check your documentation before submission.</p></div></li></ol><Link href="/dashboard/sr-packets">Explore your packet library <InterfaceIcon name="arrow" width={16} height={16} /></Link><div className="suite-discretion-note">PATIENT INFORMATION IS CONFIDENTIAL<br /><span>Keep your workspace private when stepping away.</span></div></aside></div>
  </div>;
}
function Metric({ label, value, caption, icon }: { label: string; value: number | string; caption: string; icon: IconName }) {
  return <article className="suite-metric"><div><p>{label}</p><strong>{value}</strong><span>{caption}</span></div><div className="suite-metric-icon"><InterfaceIcon name={icon} /></div></article>;
}
