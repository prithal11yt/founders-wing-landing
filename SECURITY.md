# Security operations

## Member setup and password reset

After verifying the member's identity using their established contact details, an admin opens **Members → Setup / reset**. This generates a private link valid for one hour and one use. Share it only with the verified member. Generating the link immediately replaces the previous credential and invalidates existing member sessions. If the link is lost or expires, generate another one.

Members with existing passwords can continue using them. New members need an admin-issued link; an email address alone cannot create an account password. New passwords must have 12–128 characters.

On the first deployment of this change, all existing member cookies will be invalidated once because they lack a credential version. Members must sign in again. The member UI and API changes must deploy together. No new environment variable or database table is introduced. The existing `fw_member_auth` table must have a unique email key and support its existing `password_hash` and `updated_at` columns. Validate this on staging before production.

## Checks

- `npm run test:security` runs isolated route regression tests with a fake database.
- `npm audit` checks the locked dependency versions against the registry's advisory database.
- The security workflow checks dependencies, regression tests, and current committed files for secret patterns.
- Dependabot configuration schedules dependency update proposals once merged to the default branch.

The current-file workflow does not certify Git history. A separate all-history scan found an old Higgsfield credential pair. Revocation and historical cleanup are separate account actions. Never put credential values in an issue, pull request, or public scanner log.

## Remaining production controls

- Revoke the historically exposed Higgsfield key and secret; replace them in any tools that use them and review usage since exposure. Removing scripts from the current branch does not revoke their credentials.
- Enable GitHub dependency alerts and security updates in repository settings; current authentication could read their disabled status but could not manage the required permission.
- Configure durable rate limiting at the hosting edge or shared storage for login and waitlist endpoints. Current process-local maps are not a distributed protection.
- Review Supabase RLS policies and grants for every exposed table, function and storage bucket using an administrative connection. Small anonymous read checks alone do not verify the entire policy configuration.
- Make Wings allowance enforcement and bonus creation transactional in the database. Existing read-then-write logic can race.
- Review admin session revocation/MFA. Member resets now revoke member sessions, but admin tokens remain valid for up to 24 hours unless the signing secret is rotated. Cookie logout cannot revoke a stolen copy of a token.
- Repair existing TypeScript errors and remove `ignoreBuildErrors` after they are resolved.

Never treat a passing automated scan as a guarantee against compromise.
