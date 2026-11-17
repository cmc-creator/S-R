# Creating and handling reports

## Incident report

1. Open a new incident report and confirm the selected patient, DOB and MRN.
2. **Event:** enter the reporter, event date/time, unit, location, incident types and factual summary. Identify witnesses or explicitly mark no other witnesses. Sign as the reporter.
3. **Care & notices:** record the assessment and nurse signature, interventions and notifications. Use N/A only when appropriate. Each notification needs a name, contact method, date and time.
4. **Review report:** verify the patient and event details. Go back for corrections, then **Submit Incident Report**.
5. If S&R was used, choose **+ S&R Packet** on the saved incident to carry over the patient and incident link.

Incidents are saved on submission, not while typing. Moving between steps keeps entries; leaving/reloading before submission loses them.

## S&R packet

1. Start from the incident where possible. The server rejects a linked incident for a different patient.
2. Complete each guided section. **Save & Continue** saves that section to the server before advancing. Back keeps unsaved entries during the current visit only.
3. Use **Review saved progress / finish later** to return to the packet. **Edit / Continue** reopens the same packet and its saved sections at the first section needing attention. It does not create another packet. Re-saving a monitoring sheet updates that sheet rather than appending a duplicate.
4. Review all sections. Missing required documentation is checked both when saving a section and when submitting; merely creating a blank section does not make it complete.
5. Choose **Submit & Print** when ready. Submitted packets cannot be changed through section-saving endpoints.

This is documentation assistance, not a substitute for facility clinical policy, clinical judgment, order requirements or response deadlines. No clinical findings, signatures or care times are auto-generated. Section requirements and record retention/deletion policy must be reviewed by facility leadership before rollout.

## Printing

- Incident detail: **Print / Save as PDF** prints saved information, including interventions, signatures and saved reviews, without navigation or editing controls.
- Packet detail: **Print / View** or **Print / Save as PDF** opens all saved sections. Unsubmitted packets are marked **DRAFT**. Choose the browser's Save as PDF destination to download.
- Staff Debriefing and After Action Critique start separate printed sections marked **DO NOT FILE IN PATIENT RECORD**; handle those pages separately.
- Protect downloaded and printed patient information under facility policy.

## Deletion

Only supervisors and administrators see the delete action and may use its API. Open the report/packet, select Delete, type `DELETE` and confirm. Cancel makes no changes. Deletion is permanent; no audit/recovery feature or schema migration is introduced here.

- Reviewed incident reports and incident reports linked to packets cannot be deleted.
- Submitted packets cannot be deleted.
- Deleting an unsubmitted packet removes its child sections in one transaction; its patient and linked incident remain.
- Follow retention policy. Do not use deletion to amend a finalized clinical record.

## Verification before rollout

Run `node scripts/check-report-workflow.mjs`, `npx tsc --noEmit`, `npm run lint` and `npm run build`.

On an isolated preview database with synthetic patients and authorized staff/supervisor test users, verify:
- Empty/partial incident steps cannot bypass validation through tabs, Enter or direct POST. Correcting errors preserves entries; the three-step flow creates one report.
- Each packet section saves and reopens with the same values, including No/N/A choices, debriefing narratives, staff rows and critique comments. Reload uses the existing packet ID. Back/forward retains unsaved fields during the visit.
- Reopening and saving monitoring does not add duplicate logs. Malformed/incomplete entries cannot be saved.
- A mismatched incident/patient link is rejected. Submission rejects missing documentation and locks subsequent saves, including concurrent saves.
- Staff deletion returns 403; cancel deletes nothing; supervisors can delete an eligible synthetic record; linked/reviewed/submitted records return 409. Never test deletion against live patient records.
- Print incidents, draft packets and submitted packets using browser print preview; confirm signatures, all saved fields, checklist questions/comments, draft labeling and internal-review page separation. Check desktop and narrow layouts.

The repository seed is not a documented isolated preview environment. Do not run it against a live/shared clinical database to obtain test access.

## Packet workspace layout

The packet creator now uses a desktop section rail (horizontal on smaller screens), visible patient context, a seven-section saved-progress indicator, and sticky Back / Save & Continue controls. Previously saved sections remain revisitable within the existing navigation rules. A changed field shows an unsaved indicator; saving a section successfully clears its indicator. Browser reload/close and workspace exit links warn about unsaved edits. Changing steps within the workspace preserves mounted form state; it does not itself save.

The packet list filters instantly by patient name/MRN and in-progress/submitted status. Search stays in component memory, not in the URL or browser storage. Draft list actions resume the existing packet; submitted actions open the overview. The overview prioritizes Edit / Continue and puts destructive deletion inside Manage draft. This is presentation/navigation work only: no reporting fields, clinical validators, API contracts, schema or database migrations changed.

Before release, verify the authenticated UI on an isolated preview using synthetic patient records at desktop and phone sizes: section focus/scrolling, sidebar navigation, keyboard tab order, errors and label focus, sticky actions, dirty/save indicators, leave/reload warning, in-page list filters, and resume/view destinations. The repository does not document an isolated preview test account; seed defaults must not be assumed safe for a live/shared clinical database. Static-render and TypeScript/build tests are not browser verification.
