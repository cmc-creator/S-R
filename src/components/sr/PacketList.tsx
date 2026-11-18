"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
export type PacketListItem = { id: string; patientName: string; mrn: string; dateLabel: string; submitted: boolean; types: string[]; incidentId: string | null };
export default function PacketList({ packets }: { packets: PacketListItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = packets.filter(p => `${p.patientName} ${p.mrn}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) && (status === "all" || p.submitted === (status === "submitted")));
  return <>
    <div className="packet-list-search" role="search" aria-label="Find a packet">
      <div><label htmlFor="packet-search">Find a patient’s packet</label><input id="packet-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Patient name or MRN" maxLength={120} type="search" /></div>
      <div className="packet-status-filter"><label htmlFor="packet-status">Show</label><select id="packet-status" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All packets</option><option value="draft">In progress</option><option value="submitted">Submitted</option></select></div>
      {(query || status !== "all") && <button type="button" onClick={() => { setQuery(""); setStatus("all"); }}>Clear filters</button>}
      <p role="status" aria-live="polite">{filtered.length} of {packets.length} packets</p>
    </div>
    <div className="packet-results">
      {!filtered.length ? <div className="packet-empty"><Image className="suite-empty-artwork" src="/artwork/gold-orbit.svg" alt="" width={180} height={135} /><h2>{packets.length ? "No matching packets" : "Your packet workspace starts here"}</h2><p>{packets.length ? "Try a different patient name or MRN, or clear your filters." : "Create a packet, save one section at a time, and return whenever you need."}</p>{!packets.length && <Link className="packet-outline-action" href="/dashboard/sr-packets/new">Create a packet →</Link>}</div> :
        <table className="packet-results-table"><caption className="sr-only">Seclusion and restraint packets</caption><thead><tr>{["Patient / MRN", "Intervention", "Created", "Status", "Open packet"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{filtered.map(p => <tr key={p.id}>
          <td><strong>{p.patientName}</strong><span className="packet-result-secondary">MRN {p.mrn}</span>{p.incidentId && <Link className="packet-result-secondary underline" href={`/dashboard/incidents/${p.incidentId}`}>Linked incident ↗</Link>}</td>
          <td>{p.types.length ? p.types.join(" · ") : "Not recorded yet"}</td><td className="whitespace-nowrap">{p.dateLabel}</td><td><span className={`packet-status-pill ${p.submitted ? "packet-status-submitted" : ""}`}>{p.submitted ? "Submitted" : "In progress"}</span></td>
          <td><Link className="packet-open-link" aria-label={`${p.submitted ? "View" : "Continue"} packet for ${p.patientName}, created ${p.dateLabel}`} href={p.submitted ? `/dashboard/sr-packets/${p.id}` : `/dashboard/sr-packets/new?packetId=${p.id}`}>{p.submitted ? "View" : "Continue"} →</Link></td>
        </tr>)}</tbody></table>}
    </div>
    <p className="packet-list-privacy">Search filters this list only. Patient search terms aren’t added to the URL or saved in browser storage.</p>
  </>;
}
