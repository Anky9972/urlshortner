import SEOMetadata from '../components/seo-metadata';
import { Link } from 'react-router-dom';

const LAST_UPDATED = 'March 3, 2026';
const CONTACT_EMAIL = 'ankygaur9972@gmail.com';
const APP_NAME = 'TrimLink';
const DOMAIN = 'trimlynk.com';

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
    <div className="text-slate-400 leading-relaxed space-y-3">{children}</div>
  </section>
);

const sections = [
  'Information We Collect',
  'How We Use Your Information',
  'Cookies & Tracking',
  'Third-Party Services',
  'OAuth Sign-In (Google & GitHub)',
  'Data Retention',
  'Your Rights',
  'Data Security',
  'Children\'s Privacy',
  'Changes to This Policy',
  'Contact',
];

export default function PrivacyPage() {
  return (
    <>
      <SEOMetadata
        title="Privacy Policy | TrimLink"
        description="Learn how TrimLink collects, uses, and protects your personal data. We are committed to transparency and your privacy."
        canonical="https://trimlynk.com/privacy"
        keywords="TrimLink privacy policy, data protection, URL shortener privacy, GDPR"
      />

      <div className="min-h-screen bg-[hsl(230,15%,5%)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

          {/* Header */}
          <div className="mb-12">
            <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 transition-colors mb-6 inline-flex items-center gap-1">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white mt-4 mb-3">Privacy Policy</h1>
            <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
          </div>

          {/* TOC */}
          <nav className="bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,16%)] rounded-2xl p-6 mb-12">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Table of Contents</p>
            <ol className="space-y-2">
              {sections.map((s, i) => (
                <li key={s}>
                  <a href={`#section-${i + 1}`}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    {i + 1}. {s}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Intro */}
          <p className="text-slate-400 leading-relaxed mb-10">
            {APP_NAME} ("we," "us," or "our") operates{' '}
            <a href={`https://${DOMAIN}`} className="text-blue-400 hover:underline">{DOMAIN}</a>.
            This Privacy Policy explains what information we collect, how we use it, and your rights regarding
            that information. By using our Service, you agree to the practices described here.
          </p>

          <div className="space-y-10 divide-y divide-[hsl(230,10%,13%)]">

            <Section id="section-1" title="1. Information We Collect">
              <p><strong className="text-white">Account Information:</strong> When you register, we collect your name, email address, and a hashed password. OAuth sign-ins may provide your name, email, and profile picture from Google or GitHub.</p>
              <p><strong className="text-white">Usage Data:</strong> We automatically collect information about how you use the Service, including pages visited, links created, clicks, IP addresses, browser/device type, operating system, and referring URLs.</p>
              <p><strong className="text-white">Link Click Data:</strong> When someone clicks a shortened link, we log the click timestamp, approximate geographic location (country/city derived from IP), device type, browser, and referrer for analytics purposes.</p>
              <p><strong className="text-white">Communications:</strong> If you contact us, we retain the contents of your message and your contact details.</p>
            </Section>

            <div className="pt-10">
              <Section id="section-2" title="2. How We Use Your Information">
                <p>We use collected information to:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Provide, operate, and improve the Service</li>
                  <li>Authenticate users and maintain account security</li>
                  <li>Provide link analytics and click reports to link owners</li>
                  <li>Send transactional emails (account verification, password reset, expiry notifications)</li>
                  <li>Detect and prevent fraud, abuse, and security threats</li>
                  <li>Comply with legal obligations</li>
                </ul>
                <p>We do <strong className="text-white">not</strong> sell your personal data to third parties.</p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-3" title="3. Cookies & Tracking">
                <p>We use the following types of cookies and similar technologies:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong className="text-white">Essential cookies:</strong> Authentication tokens required for login sessions.</li>
                  <li><strong className="text-white">Analytics cookies:</strong> Google Analytics (GA4) to understand aggregate usage patterns. IP addresses are anonymized.</li>
                  <li><strong className="text-white">Local storage:</strong> Used to persist UI preferences (theme, settings) in your browser.</li>
                </ul>
                <p>You can disable cookies in your browser settings, but some features may not function correctly.</p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-4" title="4. Third-Party Services">
                <p>We use trusted third-party providers to operate the Service:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong className="text-white">Neon (PostgreSQL):</strong> Database hosting — stores all user and link data.</li>
                  <li><strong className="text-white">Render:</strong> Backend API hosting.</li>
                  <li><strong className="text-white">Netlify:</strong> Frontend hosting and CDN.</li>
                  <li><strong className="text-white">Resend:</strong> Transactional email delivery.</li>
                  <li><strong className="text-white">Google Analytics:</strong> Aggregated usage analytics.</li>
                </ul>
                <p>Each provider has their own privacy policy and data processing agreements in place.</p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-5" title="5. OAuth Sign-In (Google & GitHub)">
                <p>
                  When you sign in with Google or GitHub, we receive your name, email address, and profile picture
                  from the respective provider. We do not receive or store your OAuth provider password. We only
                  request the minimum scopes needed for authentication (<code className="text-blue-300 text-xs bg-blue-900/20 px-1 py-0.5 rounded">openid email profile</code> for Google;{' '}
                  <code className="text-blue-300 text-xs bg-blue-900/20 px-1 py-0.5 rounded">user:email</code> for GitHub).
                </p>
                <p>
                  Your OAuth account data is governed by{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google's Privacy Policy</a>{' '}
                  and{' '}
                  <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">GitHub's Privacy Statement</a>.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-6" title="6. Data Retention">
                <p>
                  We retain your account data for as long as your account is active or as needed to provide the
                  Service. Click analytics data is retained for up to 24 months. When you delete your account,
                  your personal data is permanently deleted within 30 days, except where we are required to retain
                  it by law.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-7" title="7. Your Rights">
                <p>Depending on your location, you may have the following rights:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you.</li>
                  <li><strong className="text-white">Correction:</strong> Request correction of inaccurate data.</li>
                  <li><strong className="text-white">Deletion:</strong> Request deletion of your account and associated data.</li>
                  <li><strong className="text-white">Portability:</strong> Request your data in a portable format.</li>
                  <li><strong className="text-white">Objection:</strong> Object to processing of your data for certain purposes.</li>
                </ul>
                <p>
                  To exercise any of these rights, email us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:underline">{CONTACT_EMAIL}</a>.
                  We will respond within 30 days.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-8" title="8. Data Security">
                <p>
                  We implement industry-standard security measures including encrypted connections (HTTPS/TLS),
                  bcrypt password hashing, JWT-based authentication with short expiry, and access controls on
                  our database. However, no method of transmission over the Internet is 100% secure, and we cannot
                  guarantee absolute security.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-9" title="9. Children's Privacy">
                <p>
                  The Service is not directed to children under 13. We do not knowingly collect personal
                  information from children under 13. If you believe we have inadvertently collected such
                  information, please contact us and we will delete it promptly.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-10" title="10. Changes to This Policy">
                <p>
                  We may update this Privacy Policy periodically. We will notify you of significant changes by
                  updating the "Last updated" date above and, where appropriate, by email. Your continued use of
                  the Service after any changes constitutes your acceptance of the updated policy.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-11" title="11. Contact">
                <p>
                  If you have questions, concerns, or requests regarding this Privacy Policy, contact us at:{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:underline">{CONTACT_EMAIL}</a>
                </p>
              </Section>
            </div>

          </div>

          {/* Footer CTA */}
          <div className="mt-16 pt-8 border-t border-[hsl(230,10%,13%)] flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <span>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
            <div className="flex gap-6">
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
