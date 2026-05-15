-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STAFF', 'PROVIDER', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "IncidentLevel" AS ENUM ('I', 'II', 'III', 'IV');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "unit" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "mrn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "signature" TEXT,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "incidentTime" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "locationOther" TEXT,
    "categories" JSONB NOT NULL DEFAULT '[]',
    "summaryOfEvent" TEXT NOT NULL,
    "noOtherWitnesses" BOOLEAN NOT NULL DEFAULT false,
    "witnesses" JSONB NOT NULL DEFAULT '[]',
    "nursingAssessmentNA" BOOLEAN NOT NULL DEFAULT false,
    "nursingAssessment" TEXT,
    "painScale" INTEGER,
    "patientDeniesPain" BOOLEAN NOT NULL DEFAULT false,
    "nurseAssessorName" TEXT,
    "nurseAssessorDate" TIMESTAMP(3),
    "nurseAssessorTime" TEXT,
    "nurseSignature" TEXT,
    "interventionsNA" BOOLEAN NOT NULL DEFAULT false,
    "interventionPrnMed" BOOLEAN NOT NULL DEFAULT false,
    "interventionLos" BOOLEAN NOT NULL DEFAULT false,
    "interventionOneToOne" BOOLEAN NOT NULL DEFAULT false,
    "interventionUnitRestriction" BOOLEAN NOT NULL DEFAULT false,
    "interventionUnitChange" BOOLEAN NOT NULL DEFAULT false,
    "interventionRoomChange" BOOLEAN NOT NULL DEFAULT false,
    "interventionTreatmentRefused" BOOLEAN NOT NULL DEFAULT false,
    "interventionSAndR" BOOLEAN NOT NULL DEFAULT false,
    "interventionPrecautions" TEXT,
    "interventionXray" BOOLEAN NOT NULL DEFAULT false,
    "interventionFirstAid" BOOLEAN NOT NULL DEFAULT false,
    "interventionAdminDischarge" BOOLEAN NOT NULL DEFAULT false,
    "interventionTransferHosp" TEXT,
    "interventionTransferVia" TEXT,
    "interventionOtherBH" TEXT,
    "interventionOther" TEXT,
    "notificationsNA" BOOLEAN NOT NULL DEFAULT false,
    "notifications" JSONB NOT NULL DEFAULT '[]',
    "reviewedByName" TEXT,
    "reviewedByDate" TIMESTAMP(3),
    "incidentLevel" "IncidentLevel",
    "qmReviewInitials" TEXT,
    "qmComments" TEXT,
    "qmSignature" TEXT,
    "supervisorName" TEXT,
    "supervisorTitle" TEXT,
    "supervisorDate" TIMESTAMP(3),
    "supervisorComments" TEXT,
    "supervisorSignature" TEXT,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SRPacket" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "incidentReportId" TEXT,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "SRPacket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SRPhysicianOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "srPacketId" TEXT NOT NULL,
    "physicianId" TEXT,
    "isPhysicalRestraint" BOOLEAN NOT NULL DEFAULT false,
    "physRestDate" TIMESTAMP(3),
    "physRestStartTime" TEXT,
    "physRestEndTime" TEXT,
    "isSeclusion" BOOLEAN NOT NULL DEFAULT false,
    "seclusionDate" TIMESTAMP(3),
    "seclusionStartTime" TEXT,
    "seclusionEndTime" TEXT,
    "isChemicalRestraint" BOOLEAN NOT NULL DEFAULT false,
    "chemPatientVoluntary" BOOLEAN,
    "chemAllergiesVerified" BOOLEAN NOT NULL DEFAULT false,
    "chemMedications" JSONB NOT NULL DEFAULT '[]',
    "medicalConditionContraindication" BOOLEAN NOT NULL DEFAULT false,
    "medicalConditionExplanation" TEXT,
    "reasonDTO" BOOLEAN NOT NULL DEFAULT false,
    "reasonDTS" BOOLEAN NOT NULL DEFAULT false,
    "reasonDescription" TEXT,
    "lessRestrictiveMeans" JSONB NOT NULL DEFAULT '[]',
    "criteriaForRelease" JSONB NOT NULL DEFAULT '[]',
    "criteriaOther" TEXT,
    "criteriaNA" BOOLEAN NOT NULL DEFAULT false,
    "patientInformedYes" BOOLEAN,
    "patientInformedNA" BOOLEAN NOT NULL DEFAULT false,
    "isTelephoneOrder" BOOLEAN NOT NULL DEFAULT false,
    "isReadBack" BOOLEAN NOT NULL DEFAULT false,
    "nurseName" TEXT,
    "nurseSignature" TEXT,
    "nurseDate" TIMESTAMP(3),
    "nurseTime" TEXT,
    "physicianName" TEXT,
    "physicianSignature" TEXT,
    "physicianDate" TIMESTAMP(3),
    "physicianTime" TEXT,

    CONSTRAINT "SRPhysicianOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SRFaceToFaceEvaluation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "srPacketId" TEXT NOT NULL,
    "completedById" TEXT,
    "evalDate" TIMESTAMP(3) NOT NULL,
    "evalTime" TEXT NOT NULL,
    "patientResponse" TEXT,
    "vitalsBP" TEXT,
    "vitalsPulse" TEXT,
    "vitalsRespirations" TEXT,
    "vitalsPatientRefused" BOOLEAN NOT NULL DEFAULT false,
    "unstableMedical" BOOLEAN,
    "unstableComment" TEXT,
    "adverseDrug" BOOLEAN,
    "adverseDrugComment" TEXT,
    "respCardiac" BOOLEAN,
    "respCardiacComment" TEXT,
    "painNeuro" BOOLEAN,
    "painNeuroComment" TEXT,
    "limitedROM" BOOLEAN,
    "limitedROMComment" TEXT,
    "skinBreakage" BOOLEAN,
    "skinBreakageComment" TEXT,
    "injuriesFromRestraint" BOOLEAN,
    "injuriesComment" TEXT,
    "orientPerson" BOOLEAN NOT NULL DEFAULT false,
    "orientPlace" BOOLEAN NOT NULL DEFAULT false,
    "orientTime" BOOLEAN NOT NULL DEFAULT false,
    "orientSituation" BOOLEAN NOT NULL DEFAULT false,
    "mood" JSONB NOT NULL DEFAULT '[]',
    "moodOther" TEXT,
    "affect" JSONB NOT NULL DEFAULT '[]',
    "affectOther" TEXT,
    "behaviorCooperative" BOOLEAN,
    "abnormalFindings" BOOLEAN,
    "abnormalComment" TEXT,
    "actionsTaken" TEXT,
    "healthReviewFactors" BOOLEAN,
    "healthReviewDescription" TEXT,
    "continuedNeedNA" BOOLEAN NOT NULL DEFAULT false,
    "continuedNeedNo" BOOLEAN NOT NULL DEFAULT false,
    "continuedNeedYes" BOOLEAN NOT NULL DEFAULT false,
    "continuedNeedExplanation" TEXT,
    "discontinueCriteria" JSONB NOT NULL DEFAULT '[]',
    "discontinueOther" TEXT,
    "practitionerName" TEXT,
    "practitionerDate" TIMESTAMP(3),
    "practitionerTime" TEXT,
    "additionalOrders" BOOLEAN,
    "additionalOrdersDescription" TEXT,
    "rnName" TEXT,
    "rnSignature" TEXT,
    "rnDate" TIMESTAMP(3),
    "rnTime" TEXT,

    CONSTRAINT "SRFaceToFaceEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SRMonitoringLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "srPacketId" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "notApplicable" BOOLEAN NOT NULL DEFAULT false,
    "staffSignatures" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "SRMonitoringLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SRMonitoringEntry" (
    "id" TEXT NOT NULL,
    "monitoringLogId" TEXT NOT NULL,
    "militaryTime" TEXT NOT NULL,
    "behaviorCode" TEXT NOT NULL,
    "interventionCode" TEXT NOT NULL,
    "staffInitials" TEXT NOT NULL,

    CONSTRAINT "SRMonitoringEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SRTerminationSummary" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "srPacketId" TEXT NOT NULL,
    "completedById" TEXT,
    "isPhysicalRestraint" BOOLEAN NOT NULL DEFAULT false,
    "physTimeIn" TEXT,
    "physTimeOut" TEXT,
    "isSeclusion" BOOLEAN NOT NULL DEFAULT false,
    "seclusionTimeIn" TEXT,
    "seclusionTimeOut" TEXT,
    "isChemicalRestraint" BOOLEAN NOT NULL DEFAULT false,
    "chemTimeGiven" TEXT,
    "chemLocationIM" TEXT,
    "totalMinutes" INTEGER,
    "behaviorPsychStatus" TEXT,
    "physAirwayIntact" BOOLEAN NOT NULL DEFAULT false,
    "physCirculationGood" BOOLEAN NOT NULL DEFAULT false,
    "physMusculoskeletal" BOOLEAN NOT NULL DEFAULT false,
    "injuryComplaints" BOOLEAN,
    "injuryDescription" TEXT,
    "familyNotifiedYes" BOOLEAN,
    "familyNotifiedName" TEXT,
    "familyNotifiedNo" BOOLEAN,
    "familyNotifiedNoReason" TEXT,
    "notificationDate" TIMESTAMP(3),
    "notificationTime" TEXT,
    "rnName" TEXT,
    "rnSignature" TEXT,
    "rnDate" TIMESTAMP(3),
    "rnTime" TEXT,

    CONSTRAINT "SRTerminationSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SRPatientDebriefing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "srPacketId" TEXT NOT NULL,
    "debriefDate" TIMESTAMP(3) NOT NULL,
    "debriefTime" TEXT NOT NULL,
    "interventionTypes" JSONB NOT NULL DEFAULT '[]',
    "reasonDTS" BOOLEAN NOT NULL DEFAULT false,
    "reasonDTO" BOOLEAN NOT NULL DEFAULT false,
    "staffInvolved" JSONB NOT NULL DEFAULT '[]',
    "participants" JSONB NOT NULL DEFAULT '[]',
    "patientName" TEXT,
    "infoDiscussed" TEXT,
    "eventDescription" TEXT,
    "preventionStrategies" TEXT,
    "patientSignature" TEXT,
    "patientRefused" BOOLEAN NOT NULL DEFAULT false,
    "rnSignature" TEXT,
    "rnDate" TIMESTAMP(3),
    "rnTime" TEXT,

    CONSTRAINT "SRPatientDebriefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SRStaffDebriefing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "srPacketId" TEXT NOT NULL,
    "debriefDate" TIMESTAMP(3) NOT NULL,
    "debriefTime" TEXT NOT NULL,
    "leader" TEXT,
    "staffMembers" JSONB NOT NULL DEFAULT '[]',
    "initiatingIndividuals" TEXT,
    "interventionOpportunities" TEXT,
    "thingsDoneWell" TEXT,
    "strengthenResponse" TEXT,
    "infoDiscussed" TEXT,
    "preventionProcedures" TEXT,
    "debriefingOutcome" TEXT,
    "cpi7" TEXT,
    "cpi8" TEXT,
    "cpi9" TEXT,
    "cpi10" TEXT,
    "cpi11" TEXT,
    "cpi12" TEXT,
    "cpi13" TEXT,
    "cpi14" TEXT,
    "cpiNoExplanation" TEXT,

    CONSTRAINT "SRStaffDebriefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SRAfterActionCritique" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "srPacketId" TEXT NOT NULL,
    "completedById" TEXT,
    "q1" TEXT,
    "q2" TEXT,
    "q3" TEXT,
    "q4" TEXT,
    "q5" TEXT,
    "q6" TEXT,
    "q7" TEXT,
    "q8" TEXT,
    "q9" TEXT,
    "q10" TEXT,
    "q11" TEXT,
    "q12" TEXT,
    "q13" TEXT,
    "q14" TEXT,
    "q15" TEXT,
    "q16" TEXT,
    "q17" TEXT,
    "q18" TEXT,
    "q19" TEXT,
    "q20" TEXT,
    "q21" TEXT,
    "recommendations" TEXT,
    "completedByName" TEXT,
    "completedBySign" TEXT,
    "completedDate" TIMESTAMP(3),
    "qmSignature" TEXT,
    "qmDate" TIMESTAMP(3),

    CONSTRAINT "SRAfterActionCritique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_mrn_key" ON "Patient"("mrn");

-- CreateIndex
CREATE UNIQUE INDEX "SRPhysicianOrder_srPacketId_key" ON "SRPhysicianOrder"("srPacketId");

-- CreateIndex
CREATE UNIQUE INDEX "SRFaceToFaceEvaluation_srPacketId_key" ON "SRFaceToFaceEvaluation"("srPacketId");

-- CreateIndex
CREATE UNIQUE INDEX "SRTerminationSummary_srPacketId_key" ON "SRTerminationSummary"("srPacketId");

-- CreateIndex
CREATE UNIQUE INDEX "SRPatientDebriefing_srPacketId_key" ON "SRPatientDebriefing"("srPacketId");

-- CreateIndex
CREATE UNIQUE INDEX "SRStaffDebriefing_srPacketId_key" ON "SRStaffDebriefing"("srPacketId");

-- CreateIndex
CREATE UNIQUE INDEX "SRAfterActionCritique_srPacketId_key" ON "SRAfterActionCritique"("srPacketId");

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRPacket" ADD CONSTRAINT "SRPacket_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRPacket" ADD CONSTRAINT "SRPacket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRPacket" ADD CONSTRAINT "SRPacket_incidentReportId_fkey" FOREIGN KEY ("incidentReportId") REFERENCES "IncidentReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRPhysicianOrder" ADD CONSTRAINT "SRPhysicianOrder_srPacketId_fkey" FOREIGN KEY ("srPacketId") REFERENCES "SRPacket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRPhysicianOrder" ADD CONSTRAINT "SRPhysicianOrder_physicianId_fkey" FOREIGN KEY ("physicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRFaceToFaceEvaluation" ADD CONSTRAINT "SRFaceToFaceEvaluation_srPacketId_fkey" FOREIGN KEY ("srPacketId") REFERENCES "SRPacket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRFaceToFaceEvaluation" ADD CONSTRAINT "SRFaceToFaceEvaluation_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRMonitoringLog" ADD CONSTRAINT "SRMonitoringLog_srPacketId_fkey" FOREIGN KEY ("srPacketId") REFERENCES "SRPacket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRMonitoringEntry" ADD CONSTRAINT "SRMonitoringEntry_monitoringLogId_fkey" FOREIGN KEY ("monitoringLogId") REFERENCES "SRMonitoringLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRTerminationSummary" ADD CONSTRAINT "SRTerminationSummary_srPacketId_fkey" FOREIGN KEY ("srPacketId") REFERENCES "SRPacket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRTerminationSummary" ADD CONSTRAINT "SRTerminationSummary_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRPatientDebriefing" ADD CONSTRAINT "SRPatientDebriefing_srPacketId_fkey" FOREIGN KEY ("srPacketId") REFERENCES "SRPacket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRStaffDebriefing" ADD CONSTRAINT "SRStaffDebriefing_srPacketId_fkey" FOREIGN KEY ("srPacketId") REFERENCES "SRPacket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRAfterActionCritique" ADD CONSTRAINT "SRAfterActionCritique_srPacketId_fkey" FOREIGN KEY ("srPacketId") REFERENCES "SRPacket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SRAfterActionCritique" ADD CONSTRAINT "SRAfterActionCritique_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
