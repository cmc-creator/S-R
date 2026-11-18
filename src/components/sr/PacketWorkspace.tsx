"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export const packetSteps = ["Patient & episode", "Physician order", "Face-to-face evaluation", "Observation & monitoring", "Termination", "Patient debriefing", "Staff debriefing", "After action critique"];
const phases = ["Start here", "Clinical documentation", "Clinical documentation", "Clinical documentation", "Clinical documentation", "Debrief & review", "Debrief & review", "Debrief & review"];
export default function PacketWorkspace({ step, maxStep, completed, packetId, patientLabel, guidance, dirty, onEdit, onNavigate, children }: {
  step: number; maxStep: number; completed: number[]; packetId: string | null; patientLabel: string; guidance: string;
  dirty: number[]; onEdit: () => void; onNavigate: (step: number) => void; children: React.ReactNode;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const saved = completed.filter(n => n > 0).length;
  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) { if (dirty.length) event.preventDefault(); }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  function confirmLeave(event: React.MouseEvent<HTMLAnchorElement>) {
    if (dirty.length && !window.confirm("Leave this packet? Unsaved changes will be lost. Choose Cancel, then Save & Continue to keep them.")) event.preventDefault();
  }
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
    const active = navigation.current?.querySelector<HTMLElement>('[aria-current="step"]');
    if (active && window.matchMedia("(max-width: 899px)").matches) navigation.current?.scrollTo({ left: active.offsetLeft - 16, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [step]);
  return <div className="packet-workspace">
    <div className="packet-workspace-header">
      <div><Link className="packet-back-link" onClick={confirmLeave} href="/dashboard/sr-packets">← All packets</Link><h1>Create S&amp;R packet</h1><p>One patient. One episode. A clear path to a complete packet.</p></div>
      {packetId && <Link className="packet-outline-action" onClick={confirmLeave} href={`/dashboard/sr-packets/${packetId}`}>Review saved packet ↗</Link>}
    </div>
    <div className="packet-workspace-grid">
      <aside className="packet-navigation-panel">
        <div className="packet-progress-summary"><p className="packet-eyebrow">Packet progress</p><strong>{saved}<span> / 7 sections saved</span></strong><progress value={saved} max={7} aria-label={`${saved} of 7 sections saved`} /><p>Save each section to unlock the next.</p></div>
        <nav className="packet-step-navigation" aria-label="Packet sections" ref={navigation}>
          {packetSteps.map((label, i) => {
            const active = step === i;
            const done = completed.includes(i);
            const reachable = i <= maxStep && (!packetId || i > 0);
            return <div className="packet-step-group" key={label}>
              {(i === 0 || phases[i] !== phases[i - 1]) && <p className="packet-phase-label">{phases[i]}</p>}
              <button type="button" disabled={!reachable} aria-current={active ? "step" : undefined} className={`packet-step ${done ? "packet-step-saved" : ""}`} onClick={() => onNavigate(i)}>
                <span className="packet-step-number" aria-hidden="true">{done ? "✓" : i === 0 ? "•" : i}</span>
                <span><span className="packet-step-title">{label}</span><span className="packet-step-caption">{dirty.includes(i) ? "Unsaved changes" : active ? "Working here" : done ? "Saved · revisit anytime" : reachable ? "Available" : i === 0 && packetId ? "Patient confirmed" : "Complete previous section"}</span></span>
              </button>
            </div>;
          })}
        </nav>
        <details className="packet-save-help"><summary>How saving works</summary><p>Save &amp; Continue stores the section securely on the server. Back keeps entries during this visit only. Leaving or reloading loses unsaved changes. Follow facility policy for care and deadlines.</p></details>
      </aside>
      <div className="packet-editor" onChangeCapture={onEdit}>
        {patientLabel && <div className="packet-patient-context"><span className="packet-eyebrow">Current patient</span><strong>{patientLabel}</strong><span>Check identity before documenting</span></div>}
        <header className="packet-section-intro"><p className="packet-eyebrow">{step === 0 ? "Get started" : `Section ${step} of 7`} · {phases[step]}</p><h2 ref={heading} tabIndex={-1}>{packetSteps[step]}</h2><p>{guidance}</p><div className="packet-save-notice" role="status">{step === 0 ? "Confirm the patient to begin." : dirty.includes(step) ? "Unsaved changes · choose Save & Continue to keep your work." : completed.includes(step) ? "Saved section · any new changes need Save & Continue." : "Not saved yet · complete this section, then Save & Continue."}</div></header>
        {children}
      </div>
    </div>
  </div>;
}
