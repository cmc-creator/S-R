// Shared by the wizard and API: never infer clinical answers from blank fields.
export const sectionKeys = ["physicianOrder", "faceToFaceEval", "monitoringLogs", "terminationSummary", "patientDebriefing", "staffDebriefing", "afterActionCritique"] as const;
export type SectionKey = typeof sectionKeys[number];
type Data = Record<string, unknown>;
const text = (v: unknown) => typeof v === "string" && !!v.trim();
const rows = (v: unknown): Data[] => Array.isArray(v) ? v : [];
const yes = (v: unknown) => v === true || v === "true";
const aliases: Partial<Record<SectionKey, Record<string, string>>> = {
  terminationSummary: { physRestTimeIn: "physTimeIn", physRestTimeOut: "physTimeOut", chemIMLocation: "chemLocationIM", behavioralStatus: "behaviorPsychStatus", physAirway: "physAirwayIntact", physCirculation: "physCirculationGood", complaintsOfInjury: "injuryComplaints", complaintsDescription: "injuryDescription", familyNotified: "familyNotifiedYes", familyName: "familyNotifiedName", familyNotifiedExplanation: "familyNotifiedNoReason" },
  patientDebriefing: { participatingStaff: "participants", informationDiscussed: "infoDiscussed", descriptionOfEvents: "eventDescription", rnName: "rnSignature" },
  staffDebriefing: { staffRows: "staffMembers", eventInitiators: "initiatingIndividuals", q1: "interventionOpportunities", q2: "thingsDoneWell", q3: "strengthenResponse", q4: "infoDiscussed", q5: "preventionProcedures", q6: "debriefingOutcome", cpiExplanation: "cpiNoExplanation" },
  afterActionCritique: { completedByDate: "completedDate", reviewedByName: "qmSignature", reviewedByDate: "qmDate" },
};
export function toStoredSection(key: SectionKey, input: Data): Data {
  const data = { ...input };
  for (const [form, stored] of Object.entries(aliases[key] ?? {})) { data[stored] = data[form]; delete data[form]; }
  if (key === "physicianOrder") {
    data.chemPatientVoluntary = input.chemPatientVoluntary === "" ? null : input.chemPatientVoluntary;
    data.patientInformedYes = input.patientInformed === "yes" ? true : input.patientInformed === "no" ? false : null;
    data.patientInformedNA = input.patientInformed === "na";
  }
  if (key === "patientDebriefing") data.interventionTypes = ["isPhysicalRestraint", "isSeclusion", "isChemicalRestraint"].filter(k => yes(input[k]));
  if (key === "terminationSummary") {
    data.isPhysicalRestraint = !!input.physRestTimeIn; data.isSeclusion = !!input.seclusionTimeIn; data.isChemicalRestraint = !!input.chemTimeGiven;
    data.familyNotifiedNo = input.familyNotified === "false";
  }
  if (key === "staffDebriefing") {
    data.leader = rows(input.staffRows)[0]?.name;
    rows(input.cpiResponses).forEach((r, i) => { data[`cpi${i + 7}`] = r.answer; });
  }
  if (key === "afterActionCritique") rows(input.checklist).forEach((r, i) => { data[`q${i + 1}`] = JSON.stringify(r); });
  if (key === "monitoringLogs") data.entries = input.notApplicable ? [] : rows(input.entries).filter(r => Object.values(r).some(text));
  return data;
}
export function toFormSection(key: SectionKey, input: Data): Data {
  const data = { ...input };
  for (const [form, stored] of Object.entries(aliases[key] ?? {})) data[form] = input[stored] ?? "";
  for (const [k, v] of Object.entries(data)) {
    if (v === null) data[k] = "";
    if (/Date$/.test(k) && typeof v === "string") data[k] = v.slice(0, 10);
  }
  const radioFields = ["chemPatientVoluntary", "medicalConditionContraindication", "unstableMedical", "adverseDrug", "respCardiac", "painNeuro", "limitedROM", "skinBreakage", "injuriesFromRestraint", "behaviorCooperative", "abnormalFindings", "healthReviewFactors", "additionalOrders", "complaintsOfInjury", "familyNotified"];
  radioFields.forEach(k => { if (typeof data[k] === "boolean") data[k] = String(data[k]); });
  if (key === "physicianOrder") data.patientInformed = input.patientInformedNA ? "na" : input.patientInformedYes === true ? "yes" : input.patientInformedYes === false ? "no" : "";
  if (key === "patientDebriefing") for (const k of ["isPhysicalRestraint", "isSeclusion", "isChemicalRestraint"]) data[k] = Array.isArray(input.interventionTypes) && input.interventionTypes.includes(k);
  if (key === "staffDebriefing") data.cpiResponses = Array.from({ length: 8 }, (_, i) => ({ answer: input[`cpi${i + 7}`] ?? "" }));
  if (key === "afterActionCritique") data.checklist = Array.from({ length: 21 }, (_, i) => {
    const value = input[`q${i + 1}`];
    try { return JSON.parse(String(value)); } catch { return { answer: ["YES", "NO", "NA"].includes(String(value)) ? value : "", comments: "" }; }
  });
  return data;
}
export function sectionIssues(key: SectionKey, d: Data): string[] {
  const missing: string[] = [];
  const requireFields = (fields: Record<string, string>) => { for (const [k, label] of Object.entries(fields)) if (!text(d[k]) && !(d[k] instanceof Date)) missing.push(label); };
  if (key === "physicianOrder") {
    if (![d.isPhysicalRestraint, d.isSeclusion, d.isChemicalRestraint].some(yes)) missing.push("Select an intervention type");
    requireFields({ reasonDescription: "Reason for intervention", nurseName: "Nurse name", nurseDate: "Nurse date", nurseTime: "Nurse time", physicianName: "Physician name", physicianDate: "Physician date", physicianTime: "Physician time" });
    if (yes(d.isPhysicalRestraint)) requireFields({ physRestDate: "Restraint date", physRestStartTime: "Restraint start time" });
    if (yes(d.isSeclusion)) requireFields({ seclusionDate: "Seclusion date", seclusionStartTime: "Seclusion start time" });
    if (yes(d.isChemicalRestraint)) {
      const medications = rows(d.chemMedications).filter(r => [r.medication, r.dosage, r.date, r.time].some(text));
      if (!medications.length || medications.some(r => ![r.medication, r.dosage, r.route, r.date, r.time].every(text))) missing.push("Each medication needs medication, dosage, route, date and time");
    }
    if (yes(d.isTelephoneOrder) && !yes(d.isReadBack)) missing.push("Telephone order read-back confirmation");
  }
  if (key === "faceToFaceEval") requireFields({ evalDate: "Evaluation date", evalTime: "Evaluation time", patientResponse: "Patient response", practitionerName: "Practitioner name" });
  if (key === "monitoringLogs") {
    requireFields({ logDate: "Monitoring date" });
    const entries = rows(d.entries).filter(r => Object.values(r).some(text));
    if (!yes(d.notApplicable) && (!entries.length || entries.some(r => ![r.militaryTime, r.behaviorCode, r.interventionCode, r.staffInitials].every(text)))) missing.push("Each monitoring entry needs time, behavior, intervention and staff initials");
  }
  if (key === "terminationSummary") {
    requireFields({ rnName: "RN name", rnDate: "RN date", rnTime: "RN time", behavioralStatus: "Status at termination" });
    if (d.totalMinutes === "" || d.totalMinutes == null || !Number.isInteger(Number(d.totalMinutes)) || Number(d.totalMinutes) < 0) missing.push("Total minutes (zero or more)");
  }
  if (key === "patientDebriefing") {
    requireFields({ debriefDate: "Debriefing date", debriefTime: "Debriefing time", rnName: "RN name" });
    if (!yes(d.patientRefused)) requireFields({ informationDiscussed: "Information discussed", descriptionOfEvents: "Description of events", preventionStrategies: "Prevention strategies" });
  }
  if (key === "staffDebriefing") {
    requireFields({ debriefDate: "Debriefing date", debriefTime: "Debriefing time" });
    if (!text(rows(d.staffRows)[0]?.name)) missing.push("Team leader name");
  }
  if (key === "afterActionCritique") {
    requireFields({ completedByName: "Completed by name", completedByDate: "Completion date" });
    if (rows(d.checklist).length !== 21 || rows(d.checklist).some(r => !["YES", "NO", "NA"].includes(String(r.answer)))) missing.push("Answer all 21 checklist items (Yes, No or N/A)");
  }
  return missing;
}
