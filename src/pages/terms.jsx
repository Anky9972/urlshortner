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
  'Acceptance of Terms',
  'Description of Service',
  'User Accounts',
  'Acceptable Use',
  'Intellectual Property',
  'Data & Privacy',
  'Disclaimer of Warranties',
  'Limitation of Liability',
  'Termination',
  'Changes to Terms',
  'Contact',
];

export default function TermsPage() {
  return (
    <>
      <SEOMetadata
        title="Terms of Service | TrimLink"
        description="Read TrimLink's Terms of Service to understand the rules and guidelines for using our URL shortener, QR code generator, and LinkTree builder."
        canonical="https://trimlynk.com/terms"
        keywords="TrimLink terms of service, terms and conditions, URL shortener terms"
      />

      <div className="min-h-screen bg-[hsl(230,15%,5%)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

          {/* Header */}
          <div className="mb-12">
            <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 transition-colors mb-6 inline-flex items-center gap-1">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white mt-4 mb-3">Terms of Service</h1>
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
            Welcome to {APP_NAME} ("we," "us," or "our"). By accessing or using our website at{' '}
            <a href={`https://${DOMAIN}`} className="text-blue-400 hover:underline">{DOMAIN}</a>{' '}
            and our services (collectively, the "Service"), you agree to be bound by these Terms of Service.
            If you do not agree, please do not use the Service.
          </p>

          <div className="space-y-10 divide-y divide-[hsl(230,10%,13%)]">

            <Section id="section-1" title="1. Acceptance of Terms">
              <p>
                By creating an account or using {APP_NAME} in any way, you confirm that you are at least 13 years
                old, have read these Terms, and agree to be legally bound by them. If you are using the Service on
                behalf of an organization, you represent that you have authority to bind that organization.
              </p>
            </Section>

            <div className="pt-10">
              <Section id="section-2" title="2. Description of Service">
                <p>{APP_NAME} provides a suite of link management tools including:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>URL shortening and custom branded links</li>
                  <li>QR code generation and customization</li>
                  <li>LinkTree / bio-link page builder</li>
                  <li>Click analytics and audience insights</li>
                  <li>Link expiration, password protection, and targeting rules</li>
                  <li>Team collaboration and API access</li>
                </ul>
                <p>
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time
                  with or without notice.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-3" title="3. User Accounts">
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for all
                  activities that occur under your account. Notify us immediately at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:underline">{CONTACT_EMAIL}</a>{' '}
                  if you suspect unauthorized access.
                </p>
                <p>
                  You must provide accurate and complete registration information. Accounts created with false
                  information may be suspended without notice.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-4" title="4. Acceptable Use">
                <p>You agree <strong className="text-white">not</strong> to use {APP_NAME} to:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Shorten, share, or redirect to illegal, harmful, or malicious content</li>
                  <li>Distribute spam, phishing links, or malware</li>
                  <li>Infringe on intellectual property rights of any party</li>
                  <li>Impersonate any person or entity</li>
                  <li>Scrape, crawl, or reverse-engineer the Service programmatically without permission</li>
                  <li>Circumvent rate limits, security measures, or access controls</li>
                  <li>Use the Service for any unlawful purpose or in violation of applicable laws</li>
                </ul>
                <p>
                  We may immediately suspend or terminate accounts that violate these rules without prior notice
                  and without liability.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-5" title="5. Intellectual Property">
                <p>
                  The {APP_NAME} name, logo, and all Service content (excluding user-generated content) are owned
                  by or licensed to us. You may not reproduce, redistribute, or create derivative works without
                  our prior written consent.
                </p>
                <p>
                  You retain ownership of content you submit through the Service. By using the Service, you grant
                  us a non-exclusive, worldwide, royalty-free license to use your content solely to operate and
                  improve the Service.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-6" title="6. Data & Privacy">
                <p>
                  Your use of the Service is also governed by our{' '}
                  <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>,
                  which is incorporated into these Terms by reference. By using the Service you consent to the
                  data practices described therein.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-7" title="7. Disclaimer of Warranties">
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
                  IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                  PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
                  ERROR-FREE, OR SECURE.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-8" title="8. Limitation of Liability">
                <p>
                  TO THE FULLEST EXTENT PERMITTED BY LAW, {APP_NAME.toUpperCase()} AND ITS OFFICERS, DIRECTORS,
                  EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                  OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR DATA, ARISING OUT OF OR RELATED TO YOUR USE OF
                  THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
                <p>
                  OUR TOTAL CUMULATIVE LIABILITY TO YOU SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID
                  US IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM OR (B) ONE HUNDRED US DOLLARS ($100).
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-9" title="9. Termination">
                <p>
                  You may delete your account at any time from your account settings. We may suspend or terminate
                  your access to the Service at our sole discretion, with or without cause, and with or without
                  notice.
                </p>
                <p>
                  Upon termination, your right to use the Service ceases immediately. Sections 5, 7, 8, and 9
                  survive termination.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-10" title="10. Changes to Terms">
                <p>
                  We may update these Terms at any time. We will notify you of material changes by updating the
                  "Last updated" date above and, where feasible, by email. Continued use of the Service after
                  changes constitutes acceptance of the updated Terms.
                </p>
              </Section>
            </div>

            <div className="pt-10">
              <Section id="section-11" title="11. Contact">
                <p>
                  Questions about these Terms? Contact us at:{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:underline">{CONTACT_EMAIL}</a>
                </p>
              </Section>
            </div>

          </div>

          {/* Footer CTA */}
          <div className="mt-16 pt-8 border-t border-[hsl(230,10%,13%)] flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <span>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
