"use client";

import { getSupabase } from "./supabaseClient";

// ── FREEMIUM CONFIGURATION ───────────────────────────────────────────────
// Tune these freely. Set PAYWALL_ENABLED=false to make everything free again
// (useful early on to maximize traction before you have full content/trust).
export const PAYWALL_ENABLED = false;  // master switch — false = unlimited free for everyone (launch setting). Flip to true to turn on revenue.
export const FREE_SESSIONS_PER_DAY = 5; // generous free daily limit (builds trust)
export const PREMIUM_UNLOCKS = {
  unlimitedSessions: true,
  officialTestLengths: true,  // full STAAR/MAP length tests are premium
};

// Pricing (display only — actual billing set up separately in Stripe/Play later)
export const PLANS = [
  { id: "monthly", label: "Monthly", price: "$4.99", period: "/month", note: "Cancel anytime" },
  { id: "yearly", label: "Yearly", price: "$39.99", period: "/year", note: "Save 33% · best value", highlight: true },
];

// Local-day key for counting free sessions (resets at local midnight)
function todayKey() {
  const d = new Date();
  return `texprep_sessions_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// How many free sessions used today (stored locally; premium users bypass entirely)
export function sessionsUsedToday() {
  if (typeof window === "undefined") return 0;
  try { return parseInt(window.localStorage.getItem(todayKey()) || "0", 10); }
  catch { return 0; }
}

export function recordSessionToday() {
  if (typeof window === "undefined") return;
  try {
    const k = todayKey();
    const n = parseInt(window.localStorage.getItem(k) || "0", 10) + 1;
    window.localStorage.setItem(k, String(n));
    // tidy up old day keys
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith("texprep_sessions_") && key !== k) window.localStorage.removeItem(key);
    });
  } catch { /* ignore */ }
}

// Check premium status from the user's profile (is_premium column in Supabase)
export async function isPremium(user) {
  if (!user) return false;
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { data } = await sb.from("profiles").select("is_premium,premium_until").eq("id", user.id).single();
    if (!data) return false;
    if (data.is_premium) {
      // if there's an expiry, honor it
      if (data.premium_until && new Date(data.premium_until) < new Date()) return false;
      return true;
    }
    return false;
  } catch { return false; }
}

// Can this user start another session right now?
export function canStartSession({ premium }) {
  if (!PAYWALL_ENABLED) return { allowed: true };
  if (premium) return { allowed: true };
  const used = sessionsUsedToday();
  if (used >= FREE_SESSIONS_PER_DAY) {
    return { allowed: false, reason: "daily_limit", used, limit: FREE_SESSIONS_PER_DAY };
  }
  return { allowed: true, used, limit: FREE_SESSIONS_PER_DAY };
}

// Is the "official test length" option premium-gated?
export function officialLengthRequiresPremium({ premium }) {
  if (!PAYWALL_ENABLED) return false;
  if (!PREMIUM_UNLOCKS.officialTestLengths) return false;
  return !premium;
}
