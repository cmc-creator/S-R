// Focused reproduction; no database, network, or patient records required.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const nativeRequire = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import ts from 'typescript';
const root = path.resolve(__dirname, '..');
function load(file, mocks = {}) {
  let filename = path.join(root, file);
  if (!fs.existsSync(filename) && filename.endsWith(".ts") && fs.existsSync(filename + "x")) filename += "x";
  const m = new Module(filename);
  m.filename = filename; m.paths = Module._nodeModulePaths(path.dirname(filename));
  m.require = name => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts', mocks);
    if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(filename), name)) + '.ts', mocks);
    return nativeRequire(name);
  };
  m._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename);
  return m.exports;
}
const { sectionIssues, toStoredSection, toFormSection } = load('src/lib/reports/sections.ts');
const { incidentIssues } = load('src/lib/reports/incident.ts');
const when = '2026-01-01';
const examples = {
  physicianOrder: { isPhysicalRestraint: true, physRestDate: when, physRestStartTime: '12:00', reasonDescription: 'Synthetic example', nurseName: 'Test Nurse', nurseDate: when, nurseTime: '12:00', physicianName: 'Test Provider', physicianDate: when, physicianTime: '12:00', medicalConditionContraindication: 'false' },
  faceToFaceEval: { evalDate: when, evalTime: '12:00', patientResponse: 'Synthetic response', practitionerName: 'Test Provider', unstableMedical: 'false' },
  monitoringLogs: { logDate: when, entries: [{ militaryTime: '12:00', behaviorCode: 'K', interventionCode: '16', staffInitials: 'TN' }] },
  terminationSummary: { physRestTimeIn: '12:00', physRestTimeOut: '12:10', totalMinutes: '10', behavioralStatus: 'Synthetic status', rnName: 'Test Nurse', rnDate: when, rnTime: '12:10', complaintsOfInjury: 'false', familyNotified: 'false', familyNotifiedExplanation: 'Synthetic explanation' },
  patientDebriefing: { debriefDate: when, debriefTime: '12:00', rnName: 'Test Nurse', patientRefused: true, isPhysicalRestraint: true },
  staffDebriefing: { debriefDate: when, debriefTime: '12:00', staffRows: [{ name: 'Test Leader', credentials: 'RN' }], q1: 'Synthetic opportunity', cpiResponses: Array.from({ length: 8 }, () => ({ answer: 'NA' })) },
  afterActionCritique: { completedByName: 'Test Supervisor', completedByDate: when, checklist: Array.from({ length: 21 }, () => ({ answer: 'NO', comments: 'Synthetic comment' })) },
};
for (const [key, example] of Object.entries(examples)) {
  assert.ok(sectionIssues(key, {}).length, `${key} must not accept an empty section`);
  assert.deepEqual(sectionIssues(key, example), [], key);
  const roundtrip = toFormSection(key, toStoredSection(key, example));
  assert.deepEqual(sectionIssues(key, roundtrip), [], `${key} must remain complete when reopened`);
}
for (const informed of ['yes', 'no', 'na', '']) {
  const stored = toStoredSection('physicianOrder', { patientInformed: informed });
  assert.equal(stored.patientInformedYes, informed === 'yes' ? true : informed === 'no' ? false : null);
  assert.equal(toFormSection('physicianOrder', stored).patientInformed, informed);
}
assert.equal(toStoredSection('terminationSummary' , examples.terminationSummary).familyNotifiedNoReason, 'Synthetic explanation');
assert.equal(toFormSection('staffDebriefing', toStoredSection('staffDebriefing', examples.staffDebriefing)).q1, 'Synthetic opportunity');
assert.ok(sectionIssues('monitoringLogs', { logDate: when, entries: [{ militaryTime: '12:00' }] }).length);
assert.deepEqual(sectionIssues('monitoringLogs', { logDate: when, notApplicable: true }), []);
assert.ok(sectionIssues('physicianOrder', { ...examples.physicianOrder, isTelephoneOrder: true, isReadBack: false }).length);
assert.ok(sectionIssues('afterActionCritique', { ...examples.afterActionCritique, checklist: [{ answer: 'YES' }] }).length);
const incident = { patientId: 'synthetic', reporterName: 'Test', incidentDate: when, incidentTime: '12:00', unit: 'Test', location: 'Hallway', summaryOfEvent: 'Synthetic event', signature: 'synthetic', categories: ['16'], noOtherWitnesses: true, nursingAssessmentNA: true, interventionsNA: true, notificationsNA: true };
assert.deepEqual(incidentIssues(incident), []);
assert.ok(incidentIssues({ ...incident, signature: '' }).length);
assert.ok(incidentIssues({ ...incident, location: 'Other' }).length);
assert.ok(incidentIssues({ ...incident, notificationsNA: false, notifications: [{ name: 'Test' }] }).length);
assert.ok(incidentIssues({ ...incident, nursingAssessmentNA: false }).length);

async function main() {
  const packet = { id: 'synthetic', createdById: 'owner', submittedAt: null };
  const prisma = { $queryRaw: async () => [], sRPacket: { findUnique: async () => packet } };
  const { prepareSection } = load('src/lib/reports/save-section.ts', { '@/lib/prisma': { prisma } });
  const models = { physicianOrder: 'SRPhysicianOrder', faceToFaceEval: 'SRFaceToFaceEvaluation', monitoringLogs: 'SRMonitoringLog', terminationSummary: 'SRTerminationSummary', patientDebriefing: 'SRPatientDebriefing', staffDebriefing: 'SRStaffDebriefing', afterActionCritique: 'SRAfterActionCritique' };
  for (const [key, example] of Object.entries(examples)) {
    const result = await prepareSection(new Request('https://example.invalid', { method: 'POST', body: JSON.stringify({ ...example, srPacketId: 'synthetic', id: 'untrusted', completedById: 'untrusted', patient: { connect: {} } }) }), key, models[key], prisma);
    assert.equal(result.error, undefined, key);
    assert.equal(result.data.id, undefined);
    assert.equal(result.data.completedById, undefined);
    assert.equal(result.data.patient, undefined);
  }
  packet.submittedAt = new Date();
  const locked = await prepareSection(new Request('https://example.invalid', { method: 'POST', body: JSON.stringify({ ...examples.physicianOrder, srPacketId: packet.id }) }), 'physicianOrder', 'SRPhysicianOrder', prisma);
  assert.equal(locked.error.status, 409);
  let session = null, deleted = 0;
  const tx = { incidentReport: { findUnique: async () => ({ _count: { srPackets: 0 } }), delete: async () => { deleted++; } }, sRPacket: { findUnique: async () => packet, delete: async () => { deleted++; } } };
  for (const model of ['sRMonitoringEntry', 'sRMonitoringLog', 'sRPhysicianOrder', 'sRFaceToFaceEvaluation', 'sRTerminationSummary', 'sRPatientDebriefing', 'sRStaffDebriefing', 'sRAfterActionCritique']) tx[model] = { deleteMany: async () => {} };
  const { deleteReport } = load('src/lib/reports/delete-report.ts', { '@/lib/auth': { auth: async () => session }, '@/lib/prisma': { prisma: { $transaction: async fn => fn(tx) } } });
  assert.equal((await deleteReport('incident', 'synthetic')).status, 401);
  session = { user: { id: 'other-staff', role: 'STAFF' } };
  assert.equal((await deleteReport('incident', 'synthetic')).status, 403);
  assert.equal((await deleteReport('packet', 'synthetic')).status, 409);
  packet.submittedAt = null;
  assert.equal((await deleteReport('packet', 'synthetic')).status, 403);
  packet.submittedAt = new Date();
  session.user.id = 'owner';
  assert.equal((await deleteReport('packet', 'synthetic')).status, 409);
  packet.submittedAt = null;
  assert.equal((await deleteReport('packet', 'synthetic')).status, 204);
  assert.equal(deleted, 1);
  deleted = 0;
  session.user.id = 'other-staff';
  session.user.role = 'SUPERVISOR';
  packet.submittedAt = new Date();
  assert.equal((await deleteReport('packet', 'synthetic')).status, 409);
  packet.submittedAt = null;
  assert.equal((await deleteReport('packet', 'synthetic')).status, 204);
  assert.equal(deleted, 1);
  tx.incidentReport.findUnique = async () => ({ _count: { srPackets: 1 } });
  assert.equal((await deleteReport('incident', 'synthetic')).status, 409);
  tx.incidentReport.findUnique = async () => ({ _count: { srPackets: 0 }, supervisorSignature: 'signed' });
  assert.equal((await deleteReport('incident', 'synthetic')).status, 409);
  tx.incidentReport.findUnique = async () => ({ _count: { srPackets: 0 }, qmComments: 'review in progress' });
  assert.equal((await deleteReport('incident', 'synthetic')).status, 409);
  assert.equal(deleted, 1);
  const syntheticPacket = {
    id: 'synthetic', createdAt: new Date(when), submittedAt: null,
    patient: { fullName: 'Synthetic Patient', mrn: 'TEST-ONLY', dob: new Date(when) },
    createdBy: { name: 'Synthetic Staff' },
    ...Object.fromEntries(Object.entries(examples).map(([key, value]) => [key, key === 'monitoringLogs' ? [toStoredSection(key, value)] : toStoredSection(key, value)])),
  };
  const { default: PrintPage } = load('src/app/dashboard/sr-packets/[id]/print/page.tsx', {
    '@/lib/auth': { auth: async () => session },
    '@/lib/prisma': { prisma: { sRPacket: { findUnique: async () => syntheticPacket } } },
    './PrintButton': { default: () => null },
  });
  const { renderToStaticMarkup } = nativeRequire('react-dom/server');
  const html = renderToStaticMarkup(await PrintPage({ params: Promise.resolve({ id: 'synthetic' }), searchParams: Promise.resolve({}) }));
  for (const content of ['Synthetic Patient', 'TEST-ONLY', 'DRAFT', 'DO NOT FILE IN PATIENT RECORD', 'Synthetic opportunity', 'Synthetic comment', 'Patient was an immediate risk', 'Military Time']) assert.ok(html.includes(content), `Printed packet must contain ${content}`);
  const { createElement } = nativeRequire('react');
  const { default: Workspace } = load('src/components/sr/PacketWorkspace.tsx');
  const props = { step: 2, maxStep: 2, completed: [1], packetId: 'synthetic', patientLabel: 'Synthetic Patient · MRN TEST-ONLY', guidance: 'Synthetic guidance', dirty: [], onEdit: () => {}, onNavigate: () => {}, children: createElement('input', { name: 'synthetic' }) };
  const workspaceHtml = renderToStaticMarkup(createElement(Workspace, props));
  assert.equal((workspaceHtml.match(/aria-current="step"/g) ?? []).length, 1);
  assert.ok(workspaceHtml.includes('value="1" max="7"'));
  assert.equal((workspaceHtml.match(/<button[^>]*disabled/g) ?? []).length, 6);
  assert.ok(workspaceHtml.includes('MRN TEST-ONLY'));
  const dirtyHtml = renderToStaticMarkup(createElement(Workspace, { ...props, dirty: [2] }));
  assert.ok(dirtyHtml.includes('Unsaved changes'));
  const { SRField } = load('src/components/sr/PhysicianOrderForm.tsx');
  const fieldHtml = renderToStaticMarkup(createElement(SRField, { label: 'Synthetic label', error: 'Required' }, createElement('input', { type: 'text' })));
  const labelId = fieldHtml.match(/for="([^"]+)"/)[1];
  assert.ok(fieldHtml.includes(`id="${labelId}"`));
  assert.ok(fieldHtml.includes('aria-invalid="true"'));
  assert.ok(fieldHtml.includes(`aria-describedby="${labelId}-error"`));
  const { default: PacketList } = load('src/components/sr/PacketList.tsx');
  const listHtml = renderToStaticMarkup(createElement(PacketList, { packets: [
    { id: 'draft-only', patientName: 'Synthetic Patient', mrn: 'TEST-ONLY', dateLabel: 'Jan 1, 2026', submitted: false, types: ['Physical'], incidentId: null },
    { id: 'submitted-only', patientName: 'Synthetic Patient', mrn: 'TEST-ONLY', dateLabel: 'Jan 2, 2026', submitted: true, types: [], incidentId: 'synthetic-incident' },
  ] }));
  assert.ok(listHtml.includes('/dashboard/sr-packets/new?packetId=draft-only'));
  assert.ok(listHtml.includes('/dashboard/sr-packets/submitted-only'));
  assert.ok(listHtml.includes('/dashboard/incidents/synthetic-incident'));
  assert.ok(!listHtml.includes('?q='));
  assert.ok(renderToStaticMarkup(createElement(PacketList, { packets: [] })).includes('Create a packet'));
  const { canDeletePacket } = load('src/lib/reports/packet-permissions.ts');
  assert.equal(canDeletePacket({ id: 'owner', role: 'STAFF' }, { createdById: 'owner', submittedAt: null }), true);
  assert.equal(canDeletePacket({ id: 'other', role: 'STAFF' }, { createdById: 'owner', submittedAt: null }), false);
  assert.equal(canDeletePacket({ id: 'admin', role: 'ADMIN' }, { createdById: 'owner', submittedAt: new Date() }), false);
  const rows = [
    { id: 'own-draft', createdById: 'owner', submittedAt: null },
    { id: 'other-draft', createdById: 'other', submittedAt: null },
    { id: 'own-submitted', createdById: 'owner', submittedAt: new Date() },
  ].map(p => ({ ...p, createdAt: new Date(when), patient: syntheticPacket.patient }));
  let dashboardUser = { id: 'owner', role: 'STAFF', name: 'Synthetic Staff' };
  const { default: Dashboard } = load('src/app/dashboard/page.tsx', {
    'next/navigation': { useRouter: () => ({ push() {}, refresh() {} }) },
    '@/lib/auth': { auth: async () => ({ user: dashboardUser }) },
    '@/lib/prisma': { prisma: { sRPacket: { findMany: async () => rows, count: async args => !args ? rows.length : args.where.submittedAt === null ? 2 : 1 } } },
  });
  const staffDashboard = renderToStaticMarkup(await Dashboard());
  assert.equal((staffDashboard.match(/Delete draft packet<\/button>/g) ?? []).length, 1);
  assert.ok(staffDashboard.includes('Submitted · protected'));
  assert.ok(staffDashboard.includes('owner/admin deletion only'));
  assert.ok(!(staffDashboard.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? []).some(link => link.includes('<button')), 'delete buttons must not be nested in navigation links');
  dashboardUser = { ...dashboardUser, id: 'admin', role: 'ADMIN' };
  const adminDashboard = renderToStaticMarkup(await Dashboard());
  assert.equal((adminDashboard.match(/Delete draft packet<\/button>/g) ?? []).length, 2);
  assert.ok(staffDashboard.includes('Less friction.'));
  assert.ok(staffDashboard.includes('Recent S&amp;R packets'));
  assert.ok(staffDashboard.includes('Continue the latest draft'));
  assert.equal((staffDashboard.match(/class="suite-metric"/g) ?? []).length, 3);
  const { default: Navbar } = load('src/components/Navbar.tsx', {
    'next/navigation': { usePathname: () => '/dashboard/sr-packets/new' },
    'next-auth/react': { signOut: () => {} },
    '@/components/ThemeToggle': { ThemeToggle: () => null },
  });
  const navigation = renderToStaticMarkup(createElement(Navbar, { user: { id: 'owner', name: 'Synthetic Staff', role: 'STAFF', email: 'synthetic@example.invalid' } }));
  assert.equal((navigation.match(/aria-current="page"/g) ?? []).length, 1);
  assert.ok(navigation.includes('Create packet'));
  assert.ok(!navigation.includes('Administration'));
  const adminNavigation = renderToStaticMarkup(createElement(Navbar, { user: { name: 'Synthetic Admin', role: 'ADMIN', email: 'synthetic@example.invalid' } }));
  assert.ok(adminNavigation.includes('Administration'));
  assert.ok(adminNavigation.includes('Quality &amp; insights'));
  const { default: UnavailableDashboard } = load('src/app/dashboard/page.tsx', {
    'next/navigation': { useRouter: () => ({ push() {}, refresh() {} }) },
    '@/lib/auth': { auth: async () => ({ user: dashboardUser }) },
    '@/lib/prisma': { prisma: { sRPacket: { findMany: async () => { throw new Error('Synthetic outage'); }, count: async () => 0 } } },
  });
  const unavailableHtml = renderToStaticMarkup(await UnavailableDashboard());
  assert.ok(unavailableHtml.includes('role="alert"'));
  assert.equal((unavailableHtml.match(/<strong>—<\/strong>/g) ?? []).length, 3);
  console.log('PASS: redesigned dashboard metrics, single active navigation link, role-aware administration and unavailable-data state');
  console.log('PASS: recent-packet deletion controls, owner/staff/admin permissions and submitted protection');
  console.log('PASS: packet list resume/view destinations and empty state');
  console.log('PASS: workspace active section, locked steps, saved progress, unsaved state and accessible field errors');
  console.log('PASS: printed saved values and checklist wording');
  console.log('PASS: section validation, save/reopen mappings, API field filtering, incident hard stops, submitted locks, deletion permissions and protected records');
}
main().catch(err => { console.error(err); process.exitCode = 1; });
