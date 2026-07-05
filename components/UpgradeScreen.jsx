"use client";

import { useState } from "react";
import { PLANS, FREE_SESSIONS_PER_DAY } from "../lib/premium";

// Soft, optional upgrade screen. Never a hard mandatory wall — always has a
// "Maybe later / Keep practicing free" escape so traction isn't hurt.
export function UpgradeScreen({ reason, onBack, onDismiss, user }) {
  const [selected, setSelected] = useState("yearly");

  const bg = "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)";
  const page = { minHeight: "100vh", background: bg, fontFamily: "'Nunito',system-ui,sans-serif", color: "#f1f5f9", padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: "center" };
  const card = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "28px 26px", maxWidth: 440, width: "100%" };
  const btn = { cursor: "pointer", border: "none", borderRadius: 12, fontFamily: "inherit", fontWeight: 700, transition: "all 0.18s ease" };

  const headline = reason === "daily_limit"
    ? "You've used today's free sessions! 🎉"
    : reason === "official_length"
    ? "Full-length tests are a Premium feature ⭐"
    : "Upgrade to TexPrep Premium ⭐";

  const subtext = reason === "daily_limit"
    ? `You've completed all ${FREE_SESSIONS_PER_DAY} free practice sessions for today — nice work! Come back tomorrow for ${FREE_SESSIONS_PER_DAY} more, or go Premium for unlimited practice.`
    : reason === "official_length"
    ? "Practice with authentic full-length STAAR & MAP tests by upgrading. You can keep using shorter practice sets for free."
    : "Support TexPrep and unlock the full experience.";

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>⭐</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900 }}>{headline}</h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>{subtext}</p>
        </div>

        {/* Premium benefits */}
        <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
          <p style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 13, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 1 }}>Premium includes</p>
          {[
            "Unlimited daily practice sessions",
            "Full official-length STAAR & MAP tests",
            "Priority access to new features",
            "Support an independent education app",
          ].map((b) => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 14 }}>
              <span style={{ color: "#34d399" }}>✓</span> {b}
            </div>
          ))}
        </div>

        {/* Plan chooser */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {PLANS.map((p) => (
            <button key={p.id} onClick={() => setSelected(p.id)}
              style={{ ...btn, padding: "16px 10px", background: selected === p.id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.05)", color: selected === p.id ? "#fff" : "#cbd5e1", border: selected === p.id ? "none" : "1px solid rgba(255,255,255,0.1)", textAlign: "center", position: "relative" }}>
              {p.highlight && <div style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", background: "#34d399", color: "#04231a", fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>BEST VALUE</div>}
              <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>{p.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, margin: "4px 0" }}>{p.price}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{p.period}</div>
              <div style={{ fontSize: 10, marginTop: 4, opacity: 0.75 }}>{p.note}</div>
            </button>
          ))}
        </div>

        {/* Upgrade CTA (billing wired later) */}
        <button
          onClick={() => alert("Payment setup coming soon! For now, enjoy TexPrep free. 🙂")}
          style={{ ...btn, width: "100%", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", padding: "15px", fontSize: 16, boxShadow: "0 4px 20px rgba(245,158,11,0.35)" }}>
          Upgrade to Premium
        </button>

        {/* Soft escape — critical for traction */}
        <button onClick={onDismiss || onBack}
          style={{ ...btn, width: "100%", background: "none", color: "#94a3b8", padding: "14px", fontSize: 14, marginTop: 8 }}>
          {reason === "daily_limit" ? "Keep exploring — come back tomorrow" : "Maybe later — keep practicing free"}
        </button>

        <p style={{ textAlign: "center", color: "#475569", fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>
          TexPrep is free to use. Premium is optional and helps us keep improving the app.
        </p>
      </div>
    </div>
  );
}
