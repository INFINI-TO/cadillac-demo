import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import logo from '../assets/logo-aiphotobooth-default.svg'
import backgroundVideo from '../assets/apbck.mp4'

function ObfuscatedEmail({ user, domain, className }: { user: string; domain: string; className?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = `mailto:${user}@${domain}`
  }
  
  return (
    <a 
      href="#" 
      onClick={handleClick}
      className={className || "text-primary-400 hover:underline"}
      data-user={user}
      data-domain={domain}
    >
      {user}&#64;{domain}
    </a>
  )
}

export function PrivacyPolicy() {
  return (
    <div 
      className="w-full min-h-screen flex flex-col items-center relative overflow-y-auto"
      style={{ background: 'rgb(var(--aipb-bg))' }}
    >
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.1 }}
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      
      {/* Dimmed overlay */}
      <div className="fixed inset-0 z-[1]" style={{ background: 'rgba(17, 17, 17, 0.35)', pointerEvents: 'none' }} />
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full max-w-4xl px-6 py-12"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
          <Link to="/">
            <img 
              src={logo} 
              alt="AI Photo Booth" 
              className="drop-shadow-lg mb-6 hover:opacity-80 transition-opacity"
              style={{ height: 'clamp(60px, 8vh, 120px)', width: 'auto' }}
            />
          </Link>
          <h1 
            className="text-white text-center font-bold"
            style={{ fontSize: 'clamp(1.5rem, 4vh, 2.5rem)' }}
          >
            Privacy Policy
          </h1>
          <p className="text-gray-400 mt-2" style={{ fontSize: 'clamp(0.875rem, 1.5vh, 1rem)' }}>
            Last updated: February 2026
          </p>
        </div>

        {/* Policy Content */}
        <div 
          className="rounded-mobile prose prose-invert max-w-none"
          style={{ 
            background: 'var(--aipb-card-bg)',
            border: '1px solid var(--aipb-section-border)',
            padding: 'clamp(1.5rem, 3vh, 3rem)',
          }}
        >
          <Section title="1. Data Controller">
            <p>
              The data controller responsible for processing your personal data is:
            </p>
            <address className="not-italic text-gray-300 my-4 pl-4 border-l-2 border-primary-500">
              <strong className="text-white">INFINI.TO </strong><br />
              ul. Nowohucka 1<br />
              54-617 Wrocław<br />
              Poland<br /><br />
              Email: <ObfuscatedEmail user="privacy" domain="infini.to" /><br />
              Website: <a href="https://aiphoto.events" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">aiphoto.events</a>
            </address>
          </Section>

          <Section title="2. What Data We Collect">
            <p>When you use the AI Photo Booth Demo, we collect:</p>
            <ul>
              <li><strong>Contact Information:</strong> Name, email address, phone number (optional), company name, and industry sector - collected when you request demo access.</li>
              <li><strong>Photos:</strong> Images you capture during the demo session for AI transformation.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and session identifiers for service operation and security.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with the demo (styles selected, photos generated) for service improvement.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <p>We process your personal data for the following purposes:</p>
            <ul>
              <li><strong>Demo Service Delivery:</strong> To provide you access to the AI Photo Booth demo, process your photos, and deliver transformed images.</li>
              <li><strong>Communication:</strong> To send you the demo access link and respond to your inquiries.</li>
              <li><strong>Marketing (with consent):</strong> If you opted in, to send information about our products, services, and updates.</li>
              <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our AI models and user experience.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations.</li>
            </ul>
          </Section>

          <Section title="4. Legal Basis for Processing">
            <p>We process your data based on:</p>
            <ul>
              <li><strong>Contract Performance:</strong> Processing necessary to provide the demo service you requested (Art. 6(1)(b) GDPR).</li>
              <li><strong>Consent:</strong> For marketing communications, which you can withdraw at any time (Art. 6(1)(a) GDPR).</li>
              <li><strong>Legitimate Interest:</strong> For service improvement and security (Art. 6(1)(f) GDPR).</li>
            </ul>
          </Section>

          <Section title="5. Photo Processing & AI">
            <p>
              <strong>Important information about your photos:</strong>
            </p>
            <ul>
              <li>Photos are processed using third-party AI services (such as Google Gemini, OpenAI, or similar) to generate transformed images.</li>
              <li>Original photos are transmitted to these AI providers solely for the purpose of image transformation.</li>
              <li>We do not use your photos to train AI models.</li>
              <li>AI providers process photos according to their own privacy policies and data processing agreements we have in place.</li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your data for the following periods:</p>
            <ul>
              <li><strong>Demo Photos:</strong> Automatically deleted within <strong>2 minutes</strong> after generation. Photos are stored temporarily only to allow you to view and download them.</li>
              <li><strong>QR Code Links:</strong> Photo download links expire within <strong>5 minutes</strong> of generation.</li>
              <li><strong>Demo Session Data:</strong> Session information is deleted when your demo access expires (typically 24-48 hours after issuance).</li>
              <li><strong>Contact Information:</strong> Retained for up to <strong>2 years</strong> for follow-up communication, unless you request earlier deletion.</li>
              <li><strong>Marketing Contacts:</strong> Until you withdraw consent or unsubscribe.</li>
            </ul>
          </Section>

          <Section title="7. Data Security">
            <p>We implement appropriate technical and organizational measures to protect your data:</p>
            <ul>
              <li><strong>Encryption:</strong> All data transmission uses TLS/HTTPS encryption.</li>
              <li><strong>Access Control:</strong> Strict access controls limit who can access personal data.</li>
              <li><strong>Automatic Deletion:</strong> Photos are automatically purged from our servers within minutes.</li>
              <li><strong>Secure Infrastructure:</strong> Our services run on secure cloud infrastructure with regular security updates.</li>
              <li><strong>No Permanent Storage:</strong> Demo photos are never permanently stored or backed up.</li>
            </ul>
          </Section>

          <Section title="8. Data Sharing">
            <p>We may share your data with:</p>
            <ul>
              <li><strong>AI Service Providers:</strong> For photo transformation (Google, OpenAI, or similar).</li>
              <li><strong>Cloud Infrastructure:</strong> Hosting and storage providers (with EU/US data processing agreements).</li>
              <li><strong>Email Services:</strong> To deliver demo access links and communications.</li>
            </ul>
            <p>
              We do not sell your personal data to third parties. All service providers are bound by data processing agreements ensuring GDPR compliance.
            </p>
          </Section>

          <Section title="9. International Transfers">
            <p>
              Some of our service providers may process data outside the European Economic Area (EEA). In such cases, we ensure appropriate safeguards are in place, including:
            </p>
            <ul>
              <li>EU Standard Contractual Clauses (SCCs)</li>
              <li>Adequacy decisions by the European Commission</li>
              <li>Binding Corporate Rules where applicable</li>
            </ul>
          </Section>

          <Section title="10. Your Rights">
            <p>Under GDPR, you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data.</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data.</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten").</li>
              <li><strong>Restriction:</strong> Limit how we process your data.</li>
              <li><strong>Portability:</strong> Receive your data in a portable format.</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interest.</li>
              <li><strong>Withdraw Consent:</strong> Withdraw marketing consent at any time.</li>
            </ul>
            <p>
              To exercise these rights, contact us at{' '}
              <ObfuscatedEmail user="privacy" domain="infini.to" />.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="11. Cookies & Tracking">
            <p>
              The AI Photo Booth Demo uses minimal cookies and local storage strictly necessary for:
            </p>
            <ul>
              <li>Session management and authentication</li>
              <li>Remembering your demo access token</li>
              <li>Basic analytics for service improvement</li>
            </ul>
            <p>
              We do not use advertising cookies or third-party tracking pixels.
            </p>
          </Section>

          <Section title="12. Children's Privacy">
            <p>
              The AI Photo Booth Demo is not intended for children under 16 years of age. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us immediately.
            </p>
          </Section>

          <Section title="13. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </Section>

          <Section title="14. Complaints">
            <p>
              If you believe your data protection rights have been violated, you have the right to lodge a complaint with a supervisory authority. In Poland, this is:
            </p>
            <address className="not-italic text-gray-300 my-4 pl-4 border-l-2 border-primary-500">
              <strong className="text-white">Prezes Urzędu Ochrony Danych Osobowych (UODO)</strong><br />
              ul. Stawki 2<br />
              00-193 Warszawa<br />
              Poland<br />
              Website: <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">uodo.gov.pl</a>
            </address>
          </Section>

          <Section title="15. Contact Us">
            <p>
              For any questions about this Privacy Policy or our data practices, please contact:
            </p>
            <address className="not-italic text-gray-300 my-4 pl-4 border-l-2 border-primary-500">
              <strong className="text-white">INFINI.TO</strong><br />
              Data Protection Inquiries<br />
              ul. Nowohucka 1<br />
              54-617 Wrocław, Poland<br /><br />
              Email: <ObfuscatedEmail user="privacy" domain="infini.to" /><br />
              General: <ObfuscatedEmail user="contact" domain="infini.to" />
            </address>
          </Section>
        </div>

        {/* Back to Demo Button */}
        <div className="flex justify-center mt-8">
          <Link
            to="/"
            className="text-white font-semibold rounded-full transition-all hover:opacity-90"
            style={{ 
              background: 'var(--aipb-accent-bg)',
              padding: 'clamp(0.75rem, 1.5vh, 1.25rem) clamp(2rem, 4vh, 3rem)',
              fontSize: 'clamp(0.875rem, 1.5vh, 1.1rem)',
            }}
          >
            ← Back to Demo
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500" style={{ fontSize: 'clamp(0.75rem, 1.2vh, 0.9rem)' }}>
          <p>© 2026 INFINI.TO All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 
        className="text-white font-semibold mb-4"
        style={{ fontSize: 'clamp(1.1rem, 2vh, 1.5rem)' }}
      >
        {title}
      </h2>
      <div 
        className="text-gray-300 space-y-3"
        style={{ fontSize: 'clamp(0.875rem, 1.4vh, 1rem)', lineHeight: '1.7' }}
      >
        {children}
      </div>
      <style>{`
        section ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-top: 0.75rem;
        }
        section li {
          margin-bottom: 0.5rem;
        }
        section p {
          margin-bottom: 0.75rem;
        }
      `}</style>
    </section>
  )
}
