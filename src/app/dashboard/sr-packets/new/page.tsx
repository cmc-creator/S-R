"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PatientSelector from "@/components/PatientSelector";
import PhysicianOrderForm from "@/components/sr/PhysicianOrderForm";
import FaceToFaceForm from "@/components/sr/FaceToFaceForm";
import MonitoringLogForm from "@/components/sr/MonitoringLogForm";
import TerminationForm from "@/components/sr/TerminationForm";
import PatientDebriefingForm from "@/components/sr/PatientDebriefingForm";
import StaffDebriefingForm from "@/components/sr/StaffDebriefingForm";
import AfterActionForm from "@/components/sr/AfterActionForm";

const STEPS = [
  "Cover Sheet",
  "Physician Order",
  "1-Hr Face-to-Face",
  "1:1 Monitoring",
  "Termination",
  "Patient Debriefing",
  "Staff Debriefing",
  "After Action Critique",
];

function NewSRPacketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [packetId, setPacketId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState(searchParams.get("patientId") ?? "");
  const incidentId = searchParams.get("incidentId");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function createPacket() {
    if (!patientId) { setError("Please select a patient."); return; }
    setCreating(true);
    setError("");
    const res = await fetch("/api/sr-packets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, incidentReportId: incidentId ?? null }),
    });
    if (!res.ok) { setError("Failed to create packet."); setCreating(false); return; }
    const packet = await res.json();
    setPacketId(packet.id);
    setStep(1);
    setCreating(false);
  }

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function prev() { setStep((s) => Math.max(s - 1, 0)); }
  function finish() { router.push(`/dashboard/sr-packets/${packetId}`); }

  return (
    <div style={{ maxWidth: 896, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>S&amp;R Packet</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-3)", marginTop: 4 }}>Seclusion / Physical Hold / Chemical Restraint Documentation</p>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", overflowX: "auto", gap: 6, marginBottom: 32, paddingBottom: 8 }}>
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            disabled={packetId === null && i > 0}
            onClick={() => packetId && setStep(i)}
            style={{
              flexShrink: 0,
              padding: "6px 12px",
              borderRadius: 9999,
              fontSize: "0.75rem",
              fontWeight: 500,
              border: "none",
              cursor: packetId || i === 0 ? "pointer" : "default",
              opacity: packetId === null && i > 0 ? 0.4 : 1,
              transition: "all 0.15s",
              background: i === step
                ? "var(--accent)"
                : i < step
                ? "rgba(16,185,129,0.12)"
                : "var(--bg-subtle)",
              color: i === step
                ? "var(--accent-fg)"
                : i < step
                ? "#34d399"
                : "var(--text-3)",
            }}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div style={{ background: "var(--bg-elevated)", borderRadius: 12, border: "1px solid var(--border)", padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--text)", marginBottom: 4 }}>Cover Sheet</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>
              The following forms must be completed for ANY seclusion/personal or chemical restraint.
              Ensure to include the incident report associated with the S&amp;R.
            </p>
          </div>
          {incidentId && (
            <div style={{ background: "var(--gold-faint)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", fontSize: "0.875rem", borderRadius: 8, padding: "12px 16px" }}>
              Linked to Incident Report: <strong>{incidentId}</strong>
            </div>
          )}
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>Patient</p>
            <PatientSelector value={patientId} onChange={setPatientId} />
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "0.875rem" }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={createPacket}
              disabled={creating}
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                fontWeight: 600,
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                cursor: creating ? "default" : "pointer",
                opacity: creating ? 0.6 : 1,
                fontSize: "0.875rem",
              }}
            >
              {creating ? "Creating…" : "Start Packet →"}
            </button>
          </div>
        </div>
      )}

      {step === 1 && packetId && (
        <PhysicianOrderForm srPacketId={packetId} onNext={next} onBack={prev} />
      )}
      {step === 2 && packetId && (
        <FaceToFaceForm srPacketId={packetId} onNext={next} onBack={prev} />
      )}
      {step === 3 && packetId && (
        <MonitoringLogForm srPacketId={packetId} onNext={next} onBack={prev} />
      )}
      {step === 4 && packetId && (
        <TerminationForm srPacketId={packetId} onNext={next} onBack={prev} />
      )}
      {step === 5 && packetId && (
        <PatientDebriefingForm srPacketId={packetId} onNext={next} onBack={prev} />
      )}
      {step === 6 && packetId && (
        <StaffDebriefingForm srPacketId={packetId} onNext={next} onBack={prev} />
      )}
      {step === 7 && packetId && (
        <AfterActionForm srPacketId={packetId} onNext={finish} onBack={prev} />
      )}
    </div>
  );
}

export default function NewSRPacketPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: "var(--text-3)", textAlign: "center" }}>Loading…</div>}>
      <NewSRPacketContent />
    </Suspense>
  );
}
