import Link from "next/link";
import { SRSuiteLockup } from "@/components/SRSuiteLogo";

export const metadata = {
  title: "Privacy Policy — SR Suite",
  description: "Privacy Policy for SR Suite, a product of NyxCollective LLC.",
};

const EFFECTIVE_DATE = "May 19, 2026";
const COMPANY = "NyxCollective LLC";
const PRODUCT = "SR Suite™";
const CONTACT_EMAIL = "privacy@nyxcollective.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <SRSuiteLockup size={24} />
        </Link>
        <Link
          href="/dashboard"
          style={{ fontSize: 13, color: "var(--text-2)", textDecoration: "none", fontWeight: 500 }}
        >
          ← Back to Dashboard
        </Link>
      </header>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 780, margin: "0 auto", padding: "48px 24px 80px", width: "100%" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 12 }}>
          NyxCollective LLC
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 48 }}>
          Effective Date: {EFFECTIVE_DATE}&ensp;&middot;&ensp;SR Suite&#8482; v1.0
        </p>

        <PrivacySection title="Overview">
          <p>
            {COMPANY} (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates {PRODUCT},
            a clinical documentation platform for behavioral health professionals. This Privacy Policy describes
            how we collect, use, store, and protect information in connection with your use of {PRODUCT}.
          </p>
          <p>
            {PRODUCT} is a business-to-business (B2B) platform. We do not sell or market directly to patients.
            Patient information entered into {PRODUCT} is entered by authorized healthcare personnel on behalf
            of their facility and is subject to the Health Insurance Portability and Accountability Act (HIPAA)
            and any applicable Business Associate Agreement (BAA) between {COMPANY} and the facility.
          </p>
        </PrivacySection>

        <PrivacySection title="1. Information We Collect">
          <p><strong style={{ color: "var(--text)" }}>Account &amp; User Information</strong></p>
          <p>
            When a facility administrator creates user accounts, we collect name, email address, job title,
            unit or department, and role designation. This information is used to authenticate users and
            enforce role-based access controls within the platform.
          </p>
          <p><strong style={{ color: "var(--text)" }}>Clinical Documentation Data (PHI)</strong></p>
          <p>
            Authorized facility staff enter clinical information including patient names, dates of birth,
            medical record numbers (MRN), incident records, seclusion &amp; restraint documentation, nursing
            assessments, and related clinical data. This information constitutes Protected Health Information
            (PHI) under HIPAA and is handled in accordance with applicable law and the BAA.
          </p>
          <p><strong style={{ color: "var(--text)" }}>Usage &amp; Technical Data</strong></p>
          <p>
            We may collect non-identifiable technical data including browser type, operating system, IP address,
            session timestamps, and in-platform activity logs. This data is used solely for security monitoring,
            troubleshooting, and platform improvement. It is not linked to individual patient records.
          </p>
        </PrivacySection>

        <PrivacySection title="2. How We Use Information">
          <p>We use the information collected through {PRODUCT} to:</p>
          <ul>
            <li>Operate, maintain, and improve the platform.</li>
            <li>Authenticate users and enforce role-based access controls.</li>
            <li>Enable clinical documentation workflows (S&amp;R packets, incident reports, analytics).</li>
            <li>Detect and prevent unauthorized access, fraud, and security incidents.</li>
            <li>Fulfill our obligations under any applicable Business Associate Agreement.</li>
            <li>Communicate with facility administrators regarding account status, service updates, or legal notices.</li>
          </ul>
          <p>
            We do not use PHI entered into {PRODUCT} for marketing, advertising, data brokerage, or any purpose
            outside of operating the contracted service.
          </p>
        </PrivacySection>

        <PrivacySection title="3. HIPAA Compliance &amp; Business Associates">
          <p>
            {COMPANY} operates as a HIPAA Business Associate with respect to PHI processed through {PRODUCT}.
            We maintain administrative, physical, and technical safeguards consistent with the HIPAA Security
            Rule to protect electronic PHI (ePHI) from unauthorized access, use, or disclosure.
          </p>
          <p>
            Each facility using {PRODUCT} for PHI documentation must execute a signed BAA with {COMPANY}
            prior to entering patient data. The BAA governs the permissible uses and disclosures of PHI,
            the parties&rsquo; respective obligations, and breach notification procedures.
          </p>
          <p>
            In the event of a security incident or breach affecting ePHI, {COMPANY} will notify affected
            covered entities in accordance with the HIPAA Breach Notification Rule and the terms of the BAA.
          </p>
        </PrivacySection>

        <PrivacySection title="4. Data Security">
          <p>
            We implement industry-standard security measures to protect data stored and transmitted through
            {PRODUCT}, including:
          </p>
          <ul>
            <li>Encryption of data in transit (TLS 1.2+) and at rest.</li>
            <li>Role-based access controls that limit data visibility to authorized personnel.</li>
            <li>Authentication controls including credential hashing and session management.</li>
            <li>Infrastructure hosted on managed cloud services with enterprise-grade security controls.</li>
          </ul>
          <p>
            No method of electronic storage or transmission is 100% secure. While we strive to use commercially
            acceptable means to protect information, we cannot guarantee absolute security. If you believe a
            security incident has occurred, please contact us immediately at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--gold)" }}>{CONTACT_EMAIL}</a>.
          </p>
        </PrivacySection>

        <PrivacySection title="5. Data Retention &amp; Deletion">
          <p>
            Clinical records and documentation are retained for the duration of the facility&rsquo;s active
            subscription and for a reasonable period thereafter to allow for data export. Retention periods
            for PHI are governed by the applicable BAA and applicable federal and state law (including
            state-specific medical record retention requirements).
          </p>
          <p>
            Upon termination of a facility&rsquo;s subscription, facility administrators will receive notice
            and an opportunity to export records during the offboarding window defined in the service agreement.
            Following that window, {COMPANY} will securely delete or de-identify facility data.
          </p>
          <p>
            Non-PHI technical and usage data may be retained in anonymized or aggregated form for platform
            analytics and improvement purposes indefinitely.
          </p>
        </PrivacySection>

        <PrivacySection title="6. Sharing &amp; Disclosure of Information">
          <p>
            {COMPANY} does not sell, rent, or trade PHI or personal user information to third parties.
            We may disclose information only in the following circumstances:
          </p>
          <ul>
            <li><strong style={{ color: "var(--text)" }}>Service Providers:</strong> We engage trusted third-party infrastructure providers (e.g., database hosting, cloud services) who process data on our behalf under appropriate data processing agreements and confidentiality obligations.</li>
            <li><strong style={{ color: "var(--text)" }}>Legal Obligations:</strong> We may disclose information if required by law, court order, or regulatory authority, or to protect the rights, property, or safety of {COMPANY}, its users, or the public.</li>
            <li><strong style={{ color: "var(--text)" }}>Business Transactions:</strong> In the event of a merger, acquisition, or sale of all or substantially all of {COMPANY}&rsquo;s assets, user and facility data may be transferred to the successor entity, subject to equivalent privacy protections.</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="7. Children&rsquo;s Privacy">
          <p>
            {PRODUCT} is not intended for use by individuals under the age of 18 in any capacity other than
            as a patient whose information is entered by authorized clinical staff on behalf of a licensed
            healthcare facility. We do not knowingly collect personal information directly from minors.
          </p>
        </PrivacySection>

        <PrivacySection title="8. Changes to This Policy">
          <p>
            {COMPANY} may update this Privacy Policy from time to time. When we make material changes, we
            will update the Effective Date at the top of this page and, where required, provide notice to
            facility administrators. Your continued use of {PRODUCT} after changes become effective
            constitutes acceptance of the updated policy.
          </p>
        </PrivacySection>

        <PrivacySection title="9. Contact Us">
          <p>
            For privacy-related inquiries, data subject requests, BAA execution, or to report a suspected
            security incident, please contact:
          </p>
          <address style={{ fontStyle: "normal", lineHeight: 1.8 }}>
            <strong>{COMPANY}</strong><br />
            Privacy Office<br />
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--gold)" }}>{CONTACT_EMAIL}</a>
          </address>
        </PrivacySection>

        <div
          style={{
            marginTop: 48,
            padding: "16px 20px",
            background: "var(--bg-subtle)",
            borderRadius: 8,
            border: "1px solid var(--border-subtle)",
          }}
        >
          <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
            &copy; {new Date().getFullYear()} {COMPANY}. All rights reserved. SR Suite&#8482; is a trademark of {COMPANY}.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "16px 32px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>&copy; {new Date().getFullYear()} NyxCollective LLC</span>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/terms" style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none" }}>Terms of Use</Link>
            <Link href="/privacy" style={{ fontSize: 11, color: "var(--gold)", textDecoration: "none" }}>Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PrivacySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: "0.9375rem",
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 14,
          color: "var(--text-2)",
          lineHeight: 1.75,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {children}
      </div>
    </section>
  );
}
