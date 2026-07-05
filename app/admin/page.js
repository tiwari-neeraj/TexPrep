"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabaseClient";

// Simple admin traction dashboard. Access at /admin.
// Protected by a passphrase you set below (change ADMIN_KEY).
const ADMIN_KEY = "9899192548"; // change this to your own secret

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    const sb = getSupabase();
    if (!sb) { setErr("Supabase not configured."); return; }
    try {
      // Total users (profiles)
      const { count: userCount } = await sb.from("profiles").select("id", { count: "exact", head: true });
      // Total sessions
      const { count: sessionCount } = await sb.from("sessions").select("id", { count: "exact", head: true });
      // Question bank size
      const { count: qCount } = await sb.from("question_bank").select("id", { count: "exact", head: true });
      // Recent sessions for breakdowns (last 500)
      const { data: recent } = await sb.from("sessions")
        .select("subject,grade,mode,correct,total,created_at")
        .order("created_at", { ascending: false }).limit(500);

      const sessions = recent || [];
      // Sign-ups / sessions in last 7 days
      const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
      const sessions7d = sessions.filter((s) => s.created_at >= weekAgo).length;

      // Subject popularity
      const subjCount = {};
      const gradeCount = {};
      let totalCorrect = 0, totalQ = 0;
      for (const s of sessions) {
        subjCount[s.subject] = (subjCount[s.subject] || 0) + 1;
        gradeCount[s.grade] = (gradeCount[s.grade] || 0) + 1;
        totalCorrect += s.correct || 0; totalQ += s.total || 0;
      }
      const topSubjects = Object.entries(subjCount).sort((a, b) => b[1] - a[1]);
      const topGrades = Object.entries(gradeCount).sort((a, b) => b[1] - a[1]);
      const avgScore = totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0;

      setStats({ userCount, sessionCount, qCount, sessions7d, topSubjects, topGrades, avgScore, sampleSize: sessions.length });
    } catch (e) { setErr(e.message); }
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  const wrap = { minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e1b4b)", fontFamily: "'Nunito',system-ui,sans-serif", color: "#f1f5f9", padding: "40px 20px" };
  const card = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 24px", maxWidth: 720, margin: "0 auto 16px" };
  const stat = { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: "16px", textAlign: "center" };

  if (!authed) {
    return (
      <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, maxWidth: 360, width: "100%" }}>
          <h2 style={{ margin: "0 0 12px", fontWeight: 900 }}>TexPrep Admin 📊</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>Enter admin passphrase to view traction.</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passphrase"
            style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px", color: "#f1f5f9", fontSize: 15, boxSizing: "border-box", marginBottom: 12, outline: "none" }} />
          <button onClick={() => pass === ADMIN_KEY ? setAuthed(true) : setErr("Wrong passphrase.")}
            style={{ width: "100%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            View Dashboard
          </button>
          {err && <p style={{ color: "#fb7185", fontSize: 13, marginTop: 10 }}>{err}</p>}
        </div>
      </div>
    );
  }

  const SUBJ = { math: "Mathematics", ela: "Reading & ELA", science: "Science", social: "Social Studies" };
  const MODE = { practice: "Daily Practice", staar: "STAAR", map: "MAP", gt: "G&T" };

  return (
    <div style={wrap}>
      <h1 style={{ textAlign: "center", fontWeight: 900, marginBottom: 24 }}>📊 TexPrep Traction Dashboard</h1>
      {!stats && <p style={{ textAlign: "center", color: "#94a3b8" }}>Loading real usage data...</p>}
      {err && <p style={{ textAlign: "center", color: "#fb7185" }}>{err}</p>}
      {stats && (
        <>
          <div style={{ ...card, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
            <div style={stat}><div style={{ fontSize: 30, fontWeight: 900, color: "#a78bfa" }}>{stats.userCount ?? 0}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>Total Users</div></div>
            <div style={stat}><div style={{ fontSize: 30, fontWeight: 900, color: "#34d399" }}>{stats.sessionCount ?? 0}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>Practice Sessions</div></div>
            <div style={stat}><div style={{ fontSize: 30, fontWeight: 900, color: "#60a5fa" }}>{stats.sessions7d}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>Sessions (7 days)</div></div>
            <div style={stat}><div style={{ fontSize: 30, fontWeight: 900, color: "#fbbf24" }}>{stats.qCount ?? 0}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>Questions in Bank</div></div>
            <div style={stat}><div style={{ fontSize: 30, fontWeight: 900, color: "#f9a8d4" }}>{stats.avgScore}%</div><div style={{ fontSize: 12, color: "#94a3b8" }}>Avg Score</div></div>
          </div>

          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#a78bfa" }}>Most Practiced Subjects <span style={{ color: "#475569", fontWeight: 400 }}>(last {stats.sampleSize} sessions)</span></h3>
            {stats.topSubjects.length === 0 && <p style={{ color: "#64748b", fontSize: 14 }}>No sessions yet.</p>}
            {stats.topSubjects.map(([s, n]) => (
              <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span>{SUBJ[s] || s}</span><span style={{ color: "#34d399", fontWeight: 700 }}>{n}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#60a5fa" }}>Most Practiced Grades</h3>
            {stats.topGrades.length === 0 && <p style={{ color: "#64748b", fontSize: 14 }}>No sessions yet.</p>}
            {stats.topGrades.map(([g, n]) => (
              <div key={g} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span>Grade {g}</span><span style={{ color: "#60a5fa", fontWeight: 700 }}>{n}</span>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", color: "#475569", fontSize: 12 }}>
            Live data from your Supabase database. Refresh the page to update.
          </p>
        </>
      )}
    </div>
  );
}
