type Data = Record<string, unknown>;
const filled = (v: unknown) => typeof v === "string" && !!v.trim();
export function incidentIssues(d: Data, step?: number): string[] {
  const issues: string[] = [];
  if (!step || step === 1) {
    for (const [key, label] of Object.entries({ patientId: "Select a patient", reporterName: "Reporter name", incidentDate: "Incident date", incidentTime: "Incident time", unit: "Unit", location: "Location", summaryOfEvent: "Event summary", signature: "Reporter signature" })) if (!filled(d[key])) issues.push(label);
    if (!Array.isArray(d.categories) || !d.categories.length) issues.push("Select at least one incident type");
    if (d.location === "Other" && !filled(d.locationOther)) issues.push("Specify the other location");
    if (!d.noOtherWitnesses && (!Array.isArray(d.witnesses) || !d.witnesses.length || d.witnesses.some(w => !filled(w.name)))) issues.push("Name each witness or explicitly select no other witnesses");
    if (filled(d.incidentDate) && Number.isNaN(Date.parse(String(d.incidentDate)))) issues.push("Enter a valid incident date");
  }
  if (!step || step === 2) {
    if (!d.nursingAssessmentNA) {
      for (const [key, label] of Object.entries({ nursingAssessment: "Nursing findings or N/A", nurseAssessorName: "Assessing nurse name", nurseAssessorDate: "Nursing assessment date", nurseAssessorTime: "Nursing assessment time", nurseSignature: "Nurse signature" })) if (!filled(d[key])) issues.push(label);
      if (!d.patientDeniesPain && (d.painScale == null || d.painScale === "" || !Number.isInteger(Number(d.painScale)) || Number(d.painScale) < 0 || Number(d.painScale) > 10)) issues.push("Pain score 0–10 or patient denies pain");
    }
    if (!d.interventionsNA && !Object.entries(d).some(([key, value]) => key.startsWith("intervention") && key !== "interventionsNA" && (value === true || filled(value)))) issues.push("Record interventions or explicitly select none given");
    const notices = Array.isArray(d.notifications) ? d.notifications.filter(n => [n.name, n.contactMethod, n.date, n.time].some(filled)) : [];
    if (!d.notificationsNA && (!notices.length || notices.some(n => ![n.name, n.contactMethod, n.date, n.time].every(filled)))) issues.push("Complete name, contact method, date and time for each notification, or explicitly select N/A");
  }
  return issues;
}
