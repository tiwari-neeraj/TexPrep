"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";

const bg = "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)";
const card = { background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "24px 28px" };
const btn = { cursor: "pointer", border: "none", borderRadius: 14, fontFamily: "inherit", fontWeight: 700, transition: "all 0.18s ease", fontSize: 15 };
const primary = { ...btn, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", padding: "14px 32px", fontSize: 16, boxShadow: "0 4px 24px rgba(99,102,241,0.4)" };
const input = { width: "100%", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "13px 14px", color: "#f1f5f9", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", outline: "none", marginBottom: 12 };
const label = { fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "block" };

// Save a finished practice session to Supabase (no-op for guests)
export async function saveSession(user, result, isd) {
  const sb = getSupabase();
  if (!sb || !user) return;
  try {
    const correct = result.answers.filter((a) => a.selected === a.correct).length;
    await sb.from("sessions").insert({
      user_id: user.id,
      isd_name: isd?.name || null,
      grade: result.config.grade,
      subject: result.config.subject,
      mode: result.config.mode,
      total: result.answers.length,
      correct,
      elapsed_seconds: result.elapsed,
      answers: result.answers,
    });
  } catch (e) {
    console.error("saveSession failed", e);
  }
}

// ── Sign In / Sign Up ─────────────────────────────────────────────────────
export function AuthScreen({ onDone, onBack, onForgot, gate }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setErr(""); setMsg("");
    const sb = getSupabase();
    if (!sb) { setErr("Accounts are not configured yet."); return; }
    if (!email || !password) { setErr("Please enter your email and password."); return; }
    if (mode === "signup" && password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({
          email, password,
          options: { data: { role, display_name: name || email.split("@")[0] } },
        });
        if (error) throw error;
        const user = data.user;
        if (user) {
          await sb.from("profiles").upsert({ id: user.id, role, display_name: name || email.split("@")[0] });
        }
        if (data.session) { onDone(data.session.user); }
        else { setMsg("Account created! Check your email to confirm, then sign in."); setMode("signin"); }
      } else {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onDone(data.user);
      }
    } catch (e) {
      setErr(e.message || "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ background: bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "'Nunito',system-ui,sans-serif", color: "#f1f5f9" }}>
      <div style={{ ...card, width: "100%", maxWidth: 420 }}>
        {gate ? (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 12px", borderRadius: 18, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 2l2.9 6.26 6.6 1.01-5 4.87 1.18 6.88L12 17.77l-5.68 3.25L7.5 14.14l-5-4.87 6.6-1.01L12 2z"/></svg>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TexPrep</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Texas K–12 Practice · TEKS-Aligned</div>
          </div>
        ) : (
          <button onClick={onBack} style={{ ...btn, background: "rgba(255,255,255,0.08)", color: "#94a3b8", padding: "7px 14px", fontSize: 12, marginBottom: 18 }}>← Back</button>
        )}
        <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 900 }}>{mode === "signin" ? "Welcome Back! 👋" : "Create Your Account 🌟"}</h2>
        <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: 14 }}>
          {mode === "signin" ? "Sign in to start practicing." : "Sign up free to start practicing and track your progress."}
        </p>

        {mode === "signup" && (
          <>
            <span style={label}>I am a...</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[{ id: "student", icon: "🎒", t: "Student" }, { id: "parent", icon: "👨‍👩‍👧", t: "Parent" }].map((r) => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  style={{ ...btn, padding: "14px 8px", background: role === r.id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)", color: role === r.id ? "#fff" : "#94a3b8", border: role === r.id ? "none" : "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 26 }}>{r.icon}</span>
                  <span style={{ fontSize: 14 }}>{r.t}</span>
                </button>
              ))}
            </div>
            <span style={label}>Name</span>
            <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" />
          </>
        )}

        <span style={label}>Email</span>
        <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <span style={label}>Password</span>
        <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 6 characters" : "Your password"} />

        {err && <p style={{ color: "#fb7185", fontSize: 13, margin: "4px 0 10px" }}>{err}</p>}
        {msg && <p style={{ color: "#34d399", fontSize: 13, margin: "4px 0 10px" }}>{msg}</p>}

        <button onClick={submit} disabled={busy} style={{ ...primary, width: "100%", opacity: busy ? 0.6 : 1 }}>
          {busy ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(""); setMsg(""); }}
            style={{ ...btn, background: "none", color: "#a78bfa", fontSize: 13, padding: 0 }}>
            {mode === "signin" ? "New here? Create account" : "Have an account? Sign in"}
          </button>
          {mode === "signin" && (
            <button onClick={onForgot} style={{ ...btn, background: "none", color: "#64748b", fontSize: 13, padding: 0 }}>
              Forgot password?
            </button>
          )}
        </div>

        <p style={{ color: "#475569", fontSize: 11, marginTop: 18, lineHeight: 1.5 }}>
          Students under 13: please ask a parent to create the account for you.
        </p>
      </div>
    </div>
  );
}

// ── Forgot Password ───────────────────────────────────────────────────────
export function ForgotScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr("");
    const sb = getSupabase();
    if (!sb) { setErr("Accounts are not configured yet."); return; }
    if (!email) { setErr("Please enter your email."); return; }
    setBusy(true);
    try {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset`,
      });
      if (error) throw error;
      setSent(true);
    } catch (e) { setErr(e.message || "Could not send the email. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ background: bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "'Nunito',system-ui,sans-serif", color: "#f1f5f9" }}>
      <div style={{ ...card, width: "100%", maxWidth: 420 }}>
        <button onClick={onBack} style={{ ...btn, background: "rgba(255,255,255,0.08)", color: "#94a3b8", padding: "7px 14px", fontSize: 12, marginBottom: 18 }}>← Back</button>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>📬</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900 }}>Check Your Email</h2>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>
              We sent a password reset link to <strong style={{ color: "#c4b5fd" }}>{email}</strong>.
              Open it on this device to set a new password.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 900 }}>Reset Password 🔑</h2>
            <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: 14 }}>Enter your email and we'll send you a reset link.</p>
            <span style={label}>Email</span>
            <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            {err && <p style={{ color: "#fb7185", fontSize: 13, margin: "4px 0 10px" }}>{err}</p>}
            <button onClick={submit} disabled={busy} style={{ ...primary, width: "100%", opacity: busy ? 0.6 : 1 }}>
              {busy ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── History + Mistake Review ──────────────────────────────────────────────
const SUBJ_LABEL = { math: "Mathematics", ela: "Reading & ELA", science: "Science", social: "Social Studies" };
const SUBJ_ICON = { math: "➕", ela: "📖", science: "🔬", social: "🌎" };
const MODE_LABEL = { practice: "Daily Practice", staar: "STAAR Prep", map: "MAP Prep", gt: "G&T Mode" };

export function HistoryScreen({ user, onBack }) {
  const [sessions, setSessions] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user) { setSessions([]); return; }
    sb.from("sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => setSessions(error ? [] : data || []));
  }, [user]);

  const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  const fmtTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "16px", fontFamily: "'Nunito',system-ui,sans-serif", color: "#f1f5f9" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <button onClick={onBack} style={{ ...btn, background: "rgba(255,255,255,0.08)", color: "#94a3b8", padding: "8px 16px", fontSize: 13 }}>← Back</button>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>📜 My Practice History</h2>
        </div>

        {sessions === null && <p style={{ color: "#64748b", textAlign: "center", padding: 40 }}>Loading your history...</p>}

        {sessions && sessions.length === 0 && (
          <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🌱</div>
            <h3 style={{ margin: "0 0 8px", fontWeight: 900 }}>No sessions yet</h3>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Complete your first practice session and it will show up here with your score and mistake review.</p>
          </div>
        )}

        {sessions && sessions.map((s) => {
          const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
          const color = pct >= 90 ? "#34d399" : pct >= 70 ? "#60a5fa" : pct >= 50 ? "#fbbf24" : "#fb7185";
          const isOpen = open === s.id;
          const wrong = (s.answers || []).filter((a) => a.selected !== a.correct);
          return (
            <div key={s.id} style={{ ...card, marginBottom: 12, padding: "18px 20px" }}>
              <div onClick={() => setOpen(isOpen ? null : s.id)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                <div style={{ width: 54, height: 54, borderRadius: 14, background: `${color}22`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color, flexShrink: 0 }}>
                  {pct}%
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>
                    {SUBJ_ICON[s.subject]} {SUBJ_LABEL[s.subject] || s.subject} · Grade {s.grade}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {MODE_LABEL[s.mode] || s.mode} · {s.correct}/{s.total} correct · {fmtTime(s.elapsed_seconds)} · {fmtDate(s.created_at)}
                  </div>
                </div>
                <span style={{ color: "#64748b", fontSize: 18, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
              </div>

              {isOpen && (
                <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
                  {wrong.length === 0 ? (
                    <p style={{ color: "#34d399", fontSize: 14, fontWeight: 700, textAlign: "center", margin: 0 }}>🎉 Perfect session — no mistakes to review!</p>
                  ) : (
                    <>
                      <p style={{ fontSize: 12, fontWeight: 800, color: "#fb7185", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>
                        Review Your {wrong.length} Mistake{wrong.length > 1 ? "s" : ""}
                      </p>
                      {wrong.map((a, i) => (
                        <div key={i} style={{ background: "rgba(251,113,133,0.06)", border: "1px solid rgba(251,113,133,0.18)", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                          <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>{a.q}</p>
                          <p style={{ margin: "0 0 4px", fontSize: 13 }}>
                            <span style={{ color: "#fb7185", fontWeight: 800 }}>✗ Your answer: </span>
                            <span style={{ color: "#fda4af" }}>{a.opts ? a.opts[a.selected] : `Option ${"ABCD"[a.selected]}`}</span>
                          </p>
                          <p style={{ margin: "0 0 8px", fontSize: 13 }}>
                            <span style={{ color: "#34d399", fontWeight: 800 }}>✓ Correct answer: </span>
                            <span style={{ color: "#6ee7b7" }}>{a.opts ? a.opts[a.correct] : `Option ${"ABCD"[a.correct]}`}</span>
                          </p>
                          {a.exp && (
                            <p style={{ margin: 0, fontSize: 13, color: "#fde68a", background: "rgba(251,191,36,0.08)", borderRadius: 8, padding: "8px 10px", lineHeight: 1.5 }}>
                              💡 {a.exp}
                            </p>
                          )}
                          <p style={{ margin: "8px 0 0", fontSize: 11, color: "#64748b" }}>TEKS {a.teks}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
