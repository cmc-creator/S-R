import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  format,
  startOfMonth,
  subMonths,
  isWithinInterval,
  endOfMonth,
  differenceInDays,
} from "date-fns";
import { Role } from "@prisma/client";

export const metadata = { title: "QAPI Analytics – Destiny Springs" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPERVISOR) {
    redirect("/dashboard");
  }

  let reports: Awaited<ReturnType<typeof prisma.incidentReport.findMany<{ include: { patient: true; srPackets: { select: { id: true } } } }>>> = [];
  try {
    reports = await prisma.incidentReport.findMany({
      include: { patient: true, srPackets: { select: { id: true } } },
      orderBy: { incidentDate: "desc" },
    });
  } catch {
    // DB not available (e.g. no connection string configured locally)
  }

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const thisMonth = reports.filter((r) =>
    isWithinInterval(new Date(r.incidentDate), { start: thisMonthStart, end: thisMonthEnd })
  );
  const ytd = reports.filter((r) => new Date(r.incidentDate) >= yearStart);
  const pendingQM = reports.filter((r) => !r.qmSignature);
  const pendingSup = reports.filter((r) => !r.supervisorSignature);
  const withSR = reports.filter((r) => r.srPackets.length > 0);

  // Review completion rate
  const qmReviewedCount = reports.filter((r) => !!r.qmSignature).length;
  const supReviewedCount = reports.filter((r) => !!r.supervisorSignature).length;
  const qmRate = reports.length ? Math.round((qmReviewedCount / reports.length) * 100) : 0;
  const supRate = reports.length ? Math.round((supReviewedCount / reports.length) * 100) : 0;

  // Average days to QM review
  const reviewedWithDates = reports.filter((r) => r.qmSignature && r.reviewedByDate);
  const avgDaysToReview =
    reviewedWithDates.length
      ? Math.round(
          reviewedWithDates.reduce(
            (sum, r) => sum + differenceInDays(new Date(r.reviewedByDate!), new Date(r.incidentDate)),
            0
          ) / reviewedWithDates.length
        )
      : null;

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  for (const r of reports) {
    for (const c of (r.categories as string[]) ?? []) {
      categoryCount[c] = (categoryCount[c] ?? 0) + 1;
    }
  }
  const topCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 12);

  // Unit breakdown
  const unitCount: Record<string, number> = {};
  for (const r of reports) {
    if (r.unit) unitCount[r.unit] = (unitCount[r.unit] ?? 0) + 1;
  }
  const unitBreakdown = Object.entries(unitCount).sort((a, b) => b[1] - a[1]);

  // Monthly trend — last 12 months
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const total = reports.filter((r) =>
      isWithinInterval(new Date(r.incidentDate), { start, end })
    ).length;
    const reviewed = reports.filter(
      (r) =>
        isWithinInterval(new Date(r.incidentDate), { start, end }) && !!r.qmSignature
    ).length;
    return { label: format(d, "MMM"), shortYear: format(d, "yy"), total, reviewed };
  });

  // Level distribution
  const levelCount: Record<string, number> = {};
  for (const r of reports) {
    if (r.incidentLevel) levelCount[r.incidentLevel] = (levelCount[r.incidentLevel] ?? 0) + 1;
  }
  const levelColors: Record<string, { border: string; bg: string; text: string }> = {
    I:   { border: "#4ade80", bg: "rgba(74,222,128,0.08)",  text: "#16a34a" },
    II:  { border: "#fbbf24", bg: "rgba(251,191,36,0.08)",  text: "#d97706" },
    III: { border: "#fb923c", bg: "rgba(251,146,60,0.08)",  text: "#ea580c" },
    IV:  { border: "#f87171", bg: "rgba(248,113,113,0.08)", text: "#dc2626" },
  };

  // Day of week breakdown
  const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowCount = Array(7).fill(0);
  for (const r of reports) {
    dowCount[new Date(r.incidentDate).getDay()]++;
  }

  // Shift breakdown (based on incidentTime string "HH:MM")
  const shiftCount = { Day: 0, Evening: 0, Night: 0 };
  for (const r of reports) {
    if (r.incidentTime) {
      const hour = parseInt(r.incidentTime.split(":")[0] ?? "0", 10);
      if (hour >= 7 && hour < 15) shiftCount.Day++;
      else if (hour >= 15 && hour < 23) shiftCount.Evening++;
      else shiftCount.Night++;
    }
  }

  // Intervention usage
  const interventionKeys: { key: keyof typeof reports[0]; label: string }[] = [
    { key: "interventionPrnMed", label: "PRN Medication" },
    { key: "interventionOneToOne", label: "1:1 Observation" },
    { key: "interventionSAndR", label: "Seclusion / Restraint" },
    { key: "interventionFirstAid", label: "First Aid" },
    { key: "interventionXray", label: "X-Ray Ordered" },
    { key: "interventionUnitRestriction", label: "Unit Restriction" },
    { key: "interventionUnitChange", label: "Unit Change" },
    { key: "interventionRoomChange", label: "Room Change" },
    { key: "interventionTransferHosp", label: "Transfer to Hospital" },
    { key: "interventionAdminDischarge", label: "Admin / Discharge" },
    { key: "interventionTreatmentRefused", label: "Treatment Refused" },
    { key: "interventionLos", label: "LOS Impact" },
  ];
  const interventionCounts = interventionKeys.map(({ key, label }) => ({
    label,
    count: reports.filter((r) => {
      const v = r[key];
      return typeof v === "boolean" ? v : !!v;
    }).length,
  }));
  const activeInterventions = interventionCounts
    .filter((i) => i.count > 0)
    .sort((a, b) => b.count - a.count);

  // Reporter activity
  const reporterCount: Record<string, number> = {};
  for (const r of reports) {
    reporterCount[r.reporterName] = (reporterCount[r.reporterName] ?? 0) + 1;
  }
  const topReporters = Object.entries(reporterCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Repeat incidents by patient
  const patientCount: Record<string, { name: string; count: number; lastDate: Date }> = {};
  for (const r of reports) {
    if (!patientCount[r.patientId]) {
      patientCount[r.patientId] = { name: r.patient.fullName, count: 0, lastDate: new Date(r.incidentDate) };
    }
    patientCount[r.patientId].count++;
    const d = new Date(r.incidentDate);
    if (d > patientCount[r.patientId].lastDate) patientCount[r.patientId].lastDate = d;
  }
  const repeatPatients = Object.values(patientCount)
    .filter((p) => p.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const maxMonthly = Math.max(...monthlyTrend.map((m) => m.total), 1);
  const maxCat = Math.max(...topCategories.map(([, v]) => v), 1);
  const maxUnit = Math.max(...unitBreakdown.map(([, v]) => v), 1);
  const maxDow = Math.max(...dowCount, 1);
  const maxIntervention = Math.max(...activeInterventions.map((i) => i.count), 1);
  const maxReporter = Math.max(...topReporters.map(([, v]) => v), 1);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <Link href="/dashboard" style={{ fontSize: 13, color: "var(--gold)", textDecoration: "none" }}>
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", margin: "8px 0 4px" }}>QAPI Analytics</h1>
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>
          Quality Assurance &amp; Performance Improvement — Incident Reporting &nbsp;·&nbsp;
          Generated {format(now, "MMMM d, yyyy")}
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="This Month" value={thisMonth.length} sub={format(now, "MMMM yyyy")} />
        <StatCard label="Year to Date" value={ytd.length} sub={format(now, "yyyy")} />
        <StatCard label="Total on Record" value={reports.length} sub="all time" />
        <StatCard label="S&R Linked" value={withSR.length} sub="incidents with S&R packet" />
      </div>

      {/* Review Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="QM Review Rate" value={qmRate} sub={`${qmReviewedCount} of ${reports.length} signed`} pct />
        <StatCard label="Supervisor Review Rate" value={supRate} sub={`${supReviewedCount} of ${reports.length} signed`} pct />
        <StatCard label="Pending QM Review" value={pendingQM.length} sub="no QM signature" />
        <StatCard label="Pending Sup Review" value={pendingSup.length} sub="no supervisor signature" />
      </div>

      {/* Avg time to review */}
      {avgDaysToReview !== null && (
        <div style={{ background: "var(--gold-faint)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{avgDaysToReview}</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Avg. Days to QM Review</p>
            <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3 }}>From incident date to completed QM signature ({reviewedWithDates.length} reviewed incidents)</p>
          </div>
        </div>
      )}

      {/* 12-Month Trend */}
      <Section title="Incident Trend — Last 12 Months">
        <div className="flex items-end gap-1.5 h-44 pt-4 mt-2">
          {monthlyTrend.map(({ label, shortYear, total, reviewed }) => (
            <div key={`${label}${shortYear}`} className="flex-1 flex flex-col items-center gap-0.5">
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-2)" }}>{total || ""}</span>
              <div className="w-full flex flex-col-reverse" style={{ height: `${(total / maxMonthly) * 130}px`, minHeight: total > 0 ? 4 : 0 }}>
                <div className="w-full rounded-t-sm bg-blue-500" style={{ height: `${(reviewed / Math.max(total, 1)) * 100}%` }} title={`${reviewed} reviewed`} />
                <div className="w-full bg-blue-200" style={{ height: `${((total - reviewed) / Math.max(total, 1)) * 100}%` }} title={`${total - reviewed} pending`} />
              </div>
              <span style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1 }}>{label}</span>
              <span style={{ fontSize: 9, color: "var(--text-3)", lineHeight: 1, opacity: 0.7 }}>{shortYear}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "var(--text-2)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#3b82f6", display: "inline-block" }} /> QM Reviewed</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#93c5fd", display: "inline-block" }} /> Pending Review</span>
        </div>
      </Section>

      {/* Categories + Units */}
      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Top Incident Categories">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {topCategories.length === 0 && <p style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic" }}>No data yet.</p>}
            {topCategories.map(([cat, count]) => (
              <div key={cat}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{cat}</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--bg-hover)" }}>
                  <div style={{ height: 6, borderRadius: 3, background: "#6366f1", width: `${(count / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Incidents by Unit">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {unitBreakdown.length === 0 && <p style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic" }}>No data yet.</p>}
            {unitBreakdown.map(([unit, count]) => (
              <div key={unit}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: "var(--text-2)" }}>{unit}</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--bg-hover)" }}>
                  <div style={{ height: 6, borderRadius: 3, background: "#a855f7", width: `${(count / maxUnit) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Day of Week + Shift */}
      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Incidents by Day of Week">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 128, marginTop: 16 }}>
            {DOW_LABELS.map((day, i) => (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-2)" }}>{dowCount[i] || ""}</span>
                <div
                  style={{ width: "100%", borderRadius: "3px 3px 0 0", background: "#14b8a6", height: `${(dowCount[i] / maxDow) * 80}px`, minHeight: dowCount[i] > 0 ? 4 : 0 }}
                />
                <span style={{ fontSize: 10, color: "var(--text-3)" }}>{day}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Incidents by Shift">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {(
              [
                { label: "Day (7a–3p)", count: shiftCount.Day, color: "#f59e0b" },
                { label: "Evening (3p–11p)", count: shiftCount.Evening, color: "#f97316" },
                { label: "Night (11p–7a)", count: shiftCount.Night, color: "#1d4ed8" },
              ] as { label: string; count: number; color: string }[]
            ).map(({ label, count, color }) => {
              const total = shiftCount.Day + shiftCount.Evening + shiftCount.Night;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ fontWeight: 500, color: "var(--text)" }}>{label}</span>
                    <span style={{ color: "var(--text-2)" }}>{count} <span style={{ color: "var(--text-3)" }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "var(--bg-hover)" }}>
                    <div style={{ height: 8, borderRadius: 4, background: color, width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* Intervention Usage */}
      {activeInterventions.length > 0 && (
        <Section title="Intervention / Treatment Usage">
          <div className="grid md:grid-cols-2" style={{ gap: "8px 32px", marginTop: 8 }}>
            {activeInterventions.map(({ label, count }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: "var(--text-2)" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--bg-hover)" }}>
                  <div style={{ height: 6, borderRadius: 3, background: "#f43f5e", width: `${(count / maxIntervention) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Level Distribution */}
      {Object.keys(levelCount).length > 0 && (
        <Section title="Incident Level Distribution (QM Assigned)">
          <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
            {["I", "II", "III", "IV"].map((lvl) =>
              levelCount[lvl] ? (
                <div key={lvl} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", border: `3px solid ${levelColors[lvl].border}`, background: levelColors[lvl].bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: levelColors[lvl].text }}>{levelCount[lvl]}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 5, fontWeight: 500 }}>Level {lvl}</p>
                </div>
              ) : null
            )}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", border: "3px solid var(--border)", background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-3)" }}>
                  {reports.length - Object.values(levelCount).reduce((a, b) => a + b, 0)}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 5 }}>Unassigned</p>
            </div>
          </div>
        </Section>
      )}

      {/* Reporter Activity + Repeat Patients */}
      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Top Reporters">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {topReporters.length === 0 && <p style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic" }}>No data yet.</p>}
            {topReporters.map(([name, count]) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{name}</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--bg-hover)" }}>
                  <div style={{ height: 6, borderRadius: 3, background: "#06b6d4", width: `${(count / maxReporter) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Patients with Multiple Incidents">
          {repeatPatients.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic", marginTop: 8 }}>No patients with repeat incidents.</p>
          ) : (
            <table style={{ width: "100%", fontSize: 13, marginTop: 8, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "7px 0", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)" }}>Patient</th>
                  <th style={{ textAlign: "right", padding: "7px 0", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)" }}>Incidents</th>
                  <th style={{ textAlign: "right", padding: "7px 0", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)" }}>Last</th>
                </tr>
              </thead>
              <tbody>
                {repeatPatients.map((p) => (
                  <tr key={p.name} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "8px 0", color: "var(--text)" }}>{p.name}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 700, color: "#f43f5e" }}>{p.count}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", color: "var(--text-2)", fontSize: 12 }}>{format(p.lastDate, "MM/dd/yy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      </div>

      {/* Pending QM Review */}
      {pendingQM.length > 0 && (
        <Section title={`Pending QM Review (${pendingQM.length})`}>
          <PendingTable rows={pendingQM} />
        </Section>
      )}

      {/* Pending Supervisor Review */}
      {pendingSup.length > 0 && (
        <Section title={`Pending House Supervisor Review (${pendingSup.length})`}>
          <PendingTable rows={pendingSup} />
        </Section>
      )}
    </div>
  );
}

function PendingTable({ rows }: { rows: { id: string; incidentDate: Date; unit: string | null; reporterName: string; patient: { fullName: string } }[] }) {
  return (
    <table style={{ width: "100%", fontSize: 13, marginTop: 8, borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--border)" }}>
          {["Date", "Patient", "Unit", "Reporter", ""].map((h) => (
            <th key={h} style={{ textAlign: "left", padding: "8px 0", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 20).map((r) => (
          <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }} className="hover:bg-[var(--bg-hover)]">
            <td style={{ padding: "9px 0", color: "var(--text-2)" }}>{format(new Date(r.incidentDate), "MM/dd/yyyy")}</td>
            <td style={{ padding: "9px 0", color: "var(--text)" }}>{r.patient.fullName}</td>
            <td style={{ padding: "9px 0", color: "var(--text-2)" }}>{r.unit}</td>
            <td style={{ padding: "9px 0", color: "var(--text-2)" }}>{r.reporterName}</td>
            <td style={{ padding: "9px 0" }}>
              <Link href={`/dashboard/incidents/${r.id}`} style={{ fontSize: 12, fontWeight: 500, color: "var(--gold)", textDecoration: "none" }}>
                Review →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatCard({
  label,
  value,
  sub,
  pct,
}: {
  label: string;
  value: number;
  sub: string;
  color?: string;
  pct?: boolean;
}) {
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", margin: 0 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", margin: "6px 0 0" }}>{value}{pct ? "%" : ""}</p>
      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{sub}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", padding: "11px 20px" }}>
        <h3 style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-2)", margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}
