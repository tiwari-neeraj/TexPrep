export const metadata = {
  title: "Privacy Policy — TexPrep",
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
};

export default function Privacy() {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>TexPrep Privacy Policy</h1>
      <p style={S.muted}>Last updated: June 2026</p>

      <h2 style={S.h2}>Summary</h2>
      <p>
        TexPrep is a free educational practice app for Texas K-12 students. We are
        designed to be privacy-first and child-safe: <strong>we do not collect, store,
        or share any personal information from students.</strong>
      </p>

      <h2 style={S.h2}>Information We Do Not Collect</h2>
      <p>
        We do not collect names, email addresses, phone numbers, precise locations,
        photos, contacts, or any personally identifiable information. We do not use
        behavioral advertising, tracking cookies, or sell any data to third parties.
      </p>

      <h2 style={S.h2}>Information Processed on Your Device</h2>
      <p>
        Your school district selection, grade level, and practice results are processed
        on your device to run the practice session. The city or ZIP code you enter is
        used only to look up your school district from a public database and is not
        transmitted to us or stored.
      </p>

      <h2 style={S.h2}>Children's Privacy (COPPA)</h2>
      <p>
        TexPrep is designed for use by children with parental or teacher guidance.
        Because we collect no personal information from any user, no personal
        information is collected from children under 13.
      </p>

      <h2 style={S.h2}>Text-to-Speech</h2>
      <p>
        The read-aloud feature uses your device's built-in speech engine. Question text
        is processed locally on your device and is not sent to any external service.
      </p>

      <h2 style={S.h2}>Changes to This Policy</h2>
      <p>
        If our data practices ever change (for example, if we add optional accounts for
        progress tracking), we will update this policy before those changes take effect
        and clearly disclose what is collected.
      </p>

      <h2 style={S.h2}>Contact</h2>
      <p>
        Questions about this policy? Contact the TexPrep team via the contact
        information listed on our app store page.
      </p>
    </div>
  );
}
