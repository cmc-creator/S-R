"use client";
import { useEffect, useId, useState } from "react";

interface Patient {
  id: string;
  fullName: string;
  dob: string;
  mrn: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export default function PatientSelector({ value, onChange }: Props) {
  const fieldId = useId();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ fullName: "", dob: "", mrn: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/patients")
      .then(async (r) => {
        if (!r.ok) throw new Error("Unable to load patients. Reload to try again.");
        const data = await r.json();
        if (!Array.isArray(data)) throw new Error("Unable to load patients. Reload to try again.");
        return data;
      })
      .then(setPatients)
      .catch((error) => setError(error.message));
  }, []);

  async function createPatient() {
    setError("");
    setNotice("");
    const details = { fullName: form.fullName.trim(), dob: form.dob, mrn: form.mrn.trim() };
    if (!details.fullName || !details.dob || !details.mrn) {
      setError("Enter the patient's name, date of birth, and MRN, then click Save Patient.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const patient = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(res.status === 401
          ? "Your session expired. Sign in again before saving the patient."
          : patient?.error || "Unable to save the patient. Please try again.");
      }
      if (!patient?.id || !patient.fullName || !patient.dob || !patient.mrn) {
        throw new Error("The server did not confirm a saved patient. Please try again.");
      }
      setPatients((prev) => [...prev.filter((p) => p.id !== patient.id), patient]);
      onChange(patient.id);
      setShowCreate(false);
      setForm({ fullName: "", dob: "", mrn: "" });
      setNotice("Patient saved and selected. You can continue the report.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save the patient. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const selected = patients.find((p) => p.id === value);

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="text-sm text-green-700">{notice}</p>}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor={`${fieldId}-select`} className="block text-sm font-semibold text-gray-800 mb-1">Select Patient</label>
          <select
            id={`${fieldId}-select`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose patient…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} — MRN {p.mrn}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => { setShowCreate(!showCreate); setError(""); setNotice(""); }}
            disabled={saving}
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + New Patient
          </button>
        </div>
      </div>

      {selected && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm">
          <strong>{selected.fullName}</strong> &nbsp;·&nbsp; DOB: {new Date(selected.dob).toLocaleDateString()} &nbsp;·&nbsp; MRN: {selected.mrn}
        </div>
      )}

      {showCreate && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Add New Patient</p>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label htmlFor={`${fieldId}-name`} className="block text-sm font-semibold text-gray-800 mb-1">Full Name</label>
              <input
                id={`${fieldId}-name`}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`${fieldId}-dob`} className="block text-sm font-semibold text-gray-800 mb-1">Date of Birth</label>
              <input
                id={`${fieldId}-dob`}
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`${fieldId}-mrn`} className="block text-sm font-semibold text-gray-800 mb-1">MRN</label>
              <input
                id={`${fieldId}-mrn`}
                value={form.mrn}
                onChange={(e) => setForm({ ...form, mrn: e.target.value })}
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={createPatient}
              disabled={saving}
              className="bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-blue-800 transition disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Patient"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              disabled={saving}
              className="text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
