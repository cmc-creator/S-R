"use client";
import { useId, useState } from "react";
import { signOut } from "next-auth/react";
export default function PasswordForm({ userId, userName }: { userId?: string; userName?: string }) {
  const id = useId();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setSuccess("");
    if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }
    if (userId && !window.confirm(`Reset the password for ${userName}? Existing sessions will be revoked. Verify the person's identity and share the replacement using your facility's approved secure process.`)) return;
    setBusy(true);
    try {
      const res = await fetch(userId ? `/api/users/${userId}/password` : "/api/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword, confirmPassword }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Password could not be changed");
      setCurrent(""); setNew(""); setConfirm("");
      if (body.signInAgain) { setSuccess("Password changed. Signing you out; sign in with your new password."); await signOut({ callbackUrl: "/login?passwordChanged=1" }); }
      else setSuccess("Password reset. Existing sessions are revoked. Share the replacement through your approved secure process and ask the user to change it after signing in.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save. Try again."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="account-password-form">
    <p>{userId ? `Reset access for ${userName}. Enter your own administrator password to authorize this action.` : "Confirm your current password, then choose a unique passphrase. Changing it signs out all sessions, including this one."}</p>
    <label htmlFor={`${id}-current`}>{userId ? "Your administrator password" : "Current password"}</label><input id={`${id}-current`} type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrent(e.target.value)} required disabled={busy} />
    <label htmlFor={`${id}-new`}>{userId ? "Replacement password" : "New password"}</label><input id={`${id}-new`} type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={e => setNew(e.target.value)} required disabled={busy} aria-describedby={`${id}-help`} />
    <p id={`${id}-help`} className="account-field-help">At least 12 characters; at most 72 UTF-8 bytes. Use a unique passphrase or password manager.</p>
    <label htmlFor={`${id}-confirm`}>Confirm {userId ? "replacement" : "new"} password</label><input id={`${id}-confirm`} type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirm(e.target.value)} required disabled={busy} />
    {error && <p role="alert" className="text-red-700">{error}</p>}{success && <p role="status" className="text-green-700">{success}</p>}
    <button type="submit" disabled={busy} className="suite-button suite-button-primary">{busy ? "Saving…" : userId ? "Reset password" : "Change password"}</button>
  </form>;
}
