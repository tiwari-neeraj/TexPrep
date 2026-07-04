export const metadata = {
  title: "Delete Your Account — TexPrep",
};

const S = {
  page: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "40px 24px",
    fontFamily: "'Nunito', system-ui, sans-serif",
    color: "#1e293b",
    lineHeight: 1.7,
  },
  h1: { fontSize: 32, fontWeight: 900, marginBottom: 8 },
  h2: { fontSize: 20, fontWeight: 800, marginTop: 32, marginBottom: 8 },
  muted: { color: "#64748b", fontSize: 14 },
  box: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "18px 20px",
    margin: "16px 0",
  },
};

export default function DeleteAccount() {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>Delete Your TexPrep Account</h1>
      <p style={S.muted}>Last updated: June 2026</p>

      <p>
        This page explains how to request deletion of your <strong>TexPrep</strong>{" "}
        account and all associated data. TexPrep is developed as an independent
        educational app.
      </p>

      <h2 style={S.h2}>How to request account deletion</h2>
      <p>
        To permanently delete your TexPrep account and all associated data, send an
        email from the address associated with your account to:
      </p>
      <div style={S.box}>
        <strong>Email:</strong> texprep.help@gmail.com
        <br />
        <strong>Subject:</strong> Delete My Account
      </div>
      <p>
        Please include the email address you used to sign up so we can locate and
        remove your account. We will process your request and delete your account
        within 30 days.
      </p>

      <h2 style={S.h2}>What data is deleted</h2>
      <p>When your account is deleted, we permanently remove:</p>
      <ul>
        <li>Your account and login credentials (email, display name, role)</li>
        <li>Your practice session history, scores, and answer records</li>
        <li>All other personal data associated with your account</li>
      </ul>

      <h2 style={S.h2}>What data is kept</h2>
      <p>
        TexPrep does not retain any personal data after account deletion. Anonymous,
        non-identifying usage totals that cannot be linked back to you may remain in
        aggregate form. The practice questions themselves are general educational
        content and are not personal data.
      </p>

      <h2 style={S.h2}>Questions</h2>
      <p>
        If you have any questions about deleting your account or your data, contact us
        at texprep.help@gmail.com.
      </p>
    </div>
  );
}
