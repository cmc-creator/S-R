import { CHECKLIST_ITEMS, CPI_QUESTIONS } from "@/lib/reports/questions";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import PrintButton from "./PrintButton";

export default async function SRPacketPrintPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ autoprint?: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;
  const autoprint = sp.autoprint === "1";
  let packet: Awaited<ReturnType<typeof prisma.sRPacket.findUnique<{ where: { id: string }; include: { patient: true; createdBy: { select: { name: true; title: true } }; physicianOrder: true; faceToFaceEval: true; monitoringLogs: { include: { entries: true } }; terminationSummary: true; patientDebriefing: true; staffDebriefing: true; afterActionCritique: true } }>>> | null = null;
  try {
    packet = await prisma.sRPacket.findUnique({
      where: { id },
      include: {
        patient: true,
        createdBy: { select: { name: true, title: true } },
        physicianOrder: true,
        faceToFaceEval: true,
        monitoringLogs: { include: { entries: true } },
        terminationSummary: true,
        patientDebriefing: true,
        staffDebriefing: true,
        afterActionCritique: true,
      },
    });
  } catch {
    // DB not available locally
  }

  if (!packet) notFound();

  const sections = [
    ["Physician Order", packet.physicianOrder],
    ["One-Hour Face-to-Face Evaluation", packet.faceToFaceEval],
    ["Observation & Monitoring", packet.monitoringLogs],
    ["Termination Summary", packet.terminationSummary],
    ["Patient Debriefing", packet.patientDebriefing],
    ["Staff Debriefing — DO NOT FILE IN PATIENT RECORD", packet.staffDebriefing],
    ["After Action Critique — DO NOT FILE IN PATIENT RECORD", packet.afterActionCritique],
  ] as const;
  return (
    <div className="print-container max-w-4xl mx-auto px-6 py-4 text-sm text-gray-900 bg-white">
      <style>{`@media print {
        nav, header, footer, .no-print { display: none !important; }
        .print-container { max-width: 100%; padding: 0; }
        .packet-section { break-before: page; }
        .saved-field { break-inside: avoid; }
        @page { margin: 16mm; }
      }`}</style>
      <div className="no-print flex items-center gap-3 mb-6">
        <a href={`/dashboard/sr-packets/${packet.id}`} className="underline">← Back to Packet</a>
        <PrintButton autoprint={autoprint} />
        <span>Choose “Save as PDF” in the print dialog to download.</span>
      </div>
      <h1 className="text-xl font-bold">Seclusion &amp; Restraint Documentation Packet</h1>
      <p>Destiny Springs Behavioral Health — CONFIDENTIAL</p>
      {!packet.submittedAt && <p className="border-2 border-amber-600 p-3 my-4 font-bold">DRAFT — Not submitted. May contain incomplete documentation.</p>}
      <p className="my-3">Patient: {packet.patient.fullName} · MRN: {packet.patient.mrn} · DOB: {format(packet.patient.dob, "MM/dd/yyyy")}</p>
      <p>Created by {packet.createdBy.name} · {format(packet.createdAt, "MM/dd/yyyy h:mm a")}</p>
      {packet.submittedAt && <p>Submitted {format(packet.submittedAt, "MM/dd/yyyy h:mm a")} — Pending provider sign-off</p>}
      <p className="mt-3 font-semibold">Print handling: Staff Debriefing and After Action Critique are separate internal-review sections. Do not file those pages in the patient record.</p>
      {sections.map(([title, record]) => (
        <section key={title} className="packet-section mt-6 border-t-2 border-gray-600 pt-4">
          <h2 className="font-bold text-lg mb-2">{title}</h2>
          <p className="text-xs mb-4">{packet.patient.fullName} · MRN {packet.patient.mrn} · {packet.submittedAt ? "Submitted" : "DRAFT — Not submitted"}</p>
          <SavedValues value={record} questions={Object.fromEntries((title.startsWith("After Action") ? CHECKLIST_ITEMS : title.startsWith("Staff Debriefing") ? CPI_QUESTIONS : []).map(q => [`${title.startsWith("After Action") ? "q" : "cpi"}${q.num}`, q.text]))} />
        </section>
      ))}
    </div>
  );
}

const hiddenFields = new Set(["id", "srPacketId", "monitoringLogId", "createdAt", "updatedAt", "physicianId", "completedById"]);
const labels: Record<string, string> = { rnName: "RN name", rnSignature: "RN signature / name", rnDate: "RN date", rnTime: "RN time", physRestDate: "Physical restraint date", physRestStartTime: "Physical restraint start time", physRestEndTime: "Physical restraint end time", physTimeIn: "Physical restraint time in", physTimeOut: "Physical restraint time out", chemLocationIM: "IM administration location" };
function fieldLabel(key: string) { return labels[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()); }
function SavedValues({ value, questions = {} }: { value: unknown; questions?: Record<string, string> }) {
  if (value === null || value === undefined || value === "") return <span className="text-gray-500">Not documented</span>;
  if (value instanceof Date) return <span>{format(value, "MM/dd/yyyy")}</span>;
  if (typeof value === "boolean") return <span>{value ? "Yes / selected" : "No / not selected"}</span>;
  if (Array.isArray(value)) return value.length ? <ol className="space-y-3 list-decimal ml-5">{value.map((row, i) => <li key={i}><SavedValues value={row} /></li>)}</ol> : <span>None recorded</span>;
  if (typeof value === "object") return <dl className="space-y-2">{Object.entries(value).filter(([key]) => !hiddenFields.has(key)).map(([key, v]) => <div key={key} className="saved-field border-b border-gray-200 pb-2"><dt className="font-semibold">{questions[key] ?? fieldLabel(key)}</dt><dd className="whitespace-pre-wrap"><SavedValues value={v} questions={questions} /></dd></div>)}</dl>;
  if (typeof value === "string" && value.startsWith("data:image/png;base64,")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={value} alt="Saved signature" className="max-h-20" />;
  }
  if (typeof value === "string" && value.startsWith('{')) {
    let parsed: unknown;
    try { parsed = JSON.parse(value); } catch { /* Legacy free text stays visible. */ }
    if (parsed && typeof parsed === "object") return <SavedValues value={parsed} />;
  }
  return <span>{String(value)}</span>;
}
