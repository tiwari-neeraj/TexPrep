"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabaseClient";

export default function ResetPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    // Supabase detects the recovery token in the URL automatically
    sb.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async () => {
    setErr("");
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setErr("Passwords do not match."); return; }
    const sb = getSupabase();
    if (!sb) { setErr("Accounts are not configured."); return; }
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) setErr(error.message);
    else setDone(true);
  };

  const wrap = { background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "'Nunito',system-ui,sans-serif", color: "#f1f5f9" };
  const card = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 420 };
  const input = { width: "100%", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "13px 14px", color: "#f1f5f9", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", outline: "none", marginBottom: 12 };
  const primary = { cursor: "pointer", border: "none", borderRadius: 14, fontFamily: "inherit", fontWeight: 700, fontSize: 16, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", padding: "14px 32px", width: "100%" };

  return (
    <div style={wrap}>
      <div style={card}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <h2 style={{ margin: "0 0 8px", fontWeight: 900 }}>Password Updated!</h2>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20 }}>You can now sign in with your new password.</p>
            <a href="/" style={{ ...primary, display: "block", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>Go to TexPrep →</a>
          </div>
        ) : (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900 }}>Set a New Password 🔑</h2>
            {!ready && (
              <p style={{ color: "#fbbf24", fontSize: 13, marginBottom: 16 }}>
                Open this page from the link in your reset email. If you just clicked the link, give it a second...
              </p>
            )}
            <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (6+ characters)" />
            <input style={input} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" />
            {err && <p style={{ color: "#fb7185", fontSize: 13, margin: "0 0 10px" }}>{err}</p>}
            <button onClick={submit} disabled={busy || !ready} style={{ ...primary, opacity: busy || !ready ? 0.5 : 1 }}>
              {busy ? "Saving..." : "Save New Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
