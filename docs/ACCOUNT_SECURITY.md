# Account and password management

## Staff

Open **Account & security** in workspace navigation. Account identity, role, title and unit are shown read-only; contact an administrator to correct these details. Change your password by confirming your current password and entering the replacement twice. New passwords must be at least 12 characters and no more than 72 UTF-8 bytes because bcrypt is the existing password-hashing algorithm. A unique passphrase/password manager is recommended. Passwords are never returned by the API or stored in browser storage by this feature.

A successful change signs you out. Sign in with the new password. All other sessions become invalid on their next authenticated request; already displayed information on an idle tab cannot be erased remotely.

## Forgotten password

The sign-in page's **Forgot your password?** guidance directs staff to their facility administrator. This repository has no email delivery/recovery service, and this feature does not claim to send reset emails.

Only **ADMIN** accounts may reset another account's password. Open **Administration**, find the correct user and expand **Reset password**. Verify identity under facility policy, supply your own administrator password, and enter the replacement twice. Confirm the intended account before saving. Existing sessions are invalidated. Communicate the replacement only through your approved secure channel and ask the user to change it after signing in. A forced first-login change and an audit/event-retention system are not included. Supervisors cannot perform password resets or create privileged administrator/supervisor accounts.

## Session rollout

The encrypted JWT now carries an internal credential fingerprint. Each authenticated request checks the current stored password hash and role. Password changes revoke old sessions without adding database columns. Fingerprints/password hashes are never copied to the client session response. **All sessions issued before this deployment will require sign-in again once.** Passwords themselves do not change on deployment. Session validation now depends on database availability and adds a user lookup per authentication check.

User creation now enforces authenticated ADMIN/SUPERVISOR permissions on the server, validates new-password length and roles, and prevents supervisors from creating privileged roles. No clinical-record permissions or fields are changed.

This is not MFA, automated account recovery, a complete account audit, or distributed brute-force protection. Review and configure infrastructure-level login/password endpoint rate limiting as part of the facility security program; no in-memory limiter is presented as cross-instance protection. Do not expose an unattended shared session.

## Verification

Run `node scripts/check-account-security.mjs`, `node scripts/check-report-workflow.mjs`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Account tests mock database access with randomly generated synthetic passwords and verify authentication, admin-only reset, current-password verification, confirmation/length policy, own-account scoping, bcrypt hash replacement, concurrent-write rejection, legacy/stale session rejection and restricted user creation. They do not alter any live accounts.

Before production rollout, test with separate synthetic users in an isolated preview database: change own password, reject incorrect current password/mismatched confirmation, reject staff/supervisor resets, perform admin reset, verify old sessions/old passwords fail and new sign-in works, verify mobile account navigation and forms. Do not reset live accounts to test. Repository setup does not document an isolated preview account; seed defaults are not safe evidence of one. No migration is required.
