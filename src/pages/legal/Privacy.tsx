import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EFFECTIVE = 'April 27, 2026';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h2 className="text-white font-bold text-[15px] mb-2.5">{title}</h2>
    <div className="text-slate-400 text-[13px] leading-relaxed space-y-2">{children}</div>
  </div>
);

const Table = ({ rows }: { rows: [string, string, string][] }) => (
  <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(156,39,176,0.2)' }}>
    {rows.map(([a, b, c], i) => (
      <div key={i} className={`grid grid-cols-3 gap-2 px-3 py-2.5 text-[12px] ${i === 0 ? 'font-bold text-white' : 'text-slate-400'}`} style={{ background: i % 2 === 0 ? '#1a0828' : '#160820' }}>
        <span>{a}</span><span>{b}</span><span>{c}</span>
      </div>
    ))}
  </div>
);

export const PrivacyPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
      <div className="pt-safe px-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#220f38' }}>
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white text-xl font-black">Privacy Policy</h1>
          <p className="text-slate-400 text-xs">Effective: {EFFECTIVE}</p>
        </div>
      </div>

      <div className="px-5">
        <div className="p-4 rounded-2xl mb-6" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <p className="text-slate-300 text-[13px] leading-relaxed">Your privacy matters deeply to us. This policy explains what data we collect, why we collect it, who we share it with, and your rights under GDPR, CCPA, and applicable Kenyan data protection law.</p>
        </div>

        <Section title="1. Data Controller">
          <p>Mechi Technologies Ltd., Westlands, Nairobi, Kenya, is the data controller for all personal data processed through the Mechi platform. Contact our Data Protection Officer at <span className="text-brand-pink">dpo@mechi.app</span>.</p>
        </Section>

        <Section title="2. Data We Collect">
          <Table rows={[
            ['Category', 'Examples', 'Purpose'],
            ['Identity', 'Name, age, gender, photos', 'Profile creation & matching'],
            ['Contact', 'Email address', 'Authentication & notifications'],
            ['Location', 'City / approx. GPS', 'Nearby match discovery'],
            ['Profile Content', 'Bio, interests, preferences', 'Matching algorithm'],
            ['Messages', 'Chat content', 'Messaging service'],
            ['Device', 'OS, browser, IP address', 'Security & fraud prevention'],
            ['Usage', 'Feature interactions, session data', 'Product improvement'],
            ['Payment', 'Phone number for M-Pesa (not card data)', 'Premium billing'],
          ]} />
        </Section>

        <Section title="3. Legal Basis for Processing (GDPR)">
          <p>We process your data under the following legal bases:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-white">Contract performance</strong> — to provide the matching and messaging service you signed up for.</li>
            <li><strong className="text-white">Legitimate interest</strong> — fraud prevention, safety, and platform security.</li>
            <li><strong className="text-white">Consent</strong> — analytics, marketing emails, and optional personalisation cookies.</li>
            <li><strong className="text-white">Legal obligation</strong> — responding to lawful requests from authorities.</li>
          </ul>
        </Section>

        <Section title="4. How We Use Your Data">
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Operate and personalise the matching algorithm</li>
            <li>Enable real-time messaging and video calling</li>
            <li>Send transactional emails (match alerts, security notices)</li>
            <li>Process subscription payments</li>
            <li>Detect and prevent fraudulent or abusive behaviour</li>
            <li>Comply with legal obligations</li>
            <li>Improve product features using anonymised analytics</li>
          </ul>
        </Section>

        <Section title="5. Data Sharing">
          <p>We do <strong className="text-white">not</strong> sell your personal data. We may share data only with:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-white">Supabase</strong> — database and authentication (EU data region)</li>
            <li><strong className="text-white">Safaricom / M-Pesa</strong> — payment processing (Kenya)</li>
            <li><strong className="text-white">Analytics providers</strong> — anonymised usage data only, if you consent</li>
            <li><strong className="text-white">Law enforcement</strong> — when legally compelled by a valid court order</li>
          </ul>
          <p>All third-party processors are bound by Data Processing Agreements meeting GDPR Article 28 requirements.</p>
        </Section>

        <Section title="6. Data Retention">
          <Table rows={[
            ['Data Type', 'Retention Period', 'Reason'],
            ['Account & profile', 'Until deletion + 30 days', 'Account recovery grace period'],
            ['Messages', '12 months from send date', 'User access & dispute resolution'],
            ['Payment records', '7 years', 'Legal / tax obligation'],
            ['Server logs', '90 days', 'Security monitoring'],
            ['Anonymised analytics', 'Indefinitely', 'Product improvement'],
          ]} />
        </Section>

        <Section title="7. Your Rights">
          <p>Depending on your location, you have the following rights regarding your personal data:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-white">Access</strong> — request a copy of all data we hold about you</li>
            <li><strong className="text-white">Rectification</strong> — correct inaccurate or incomplete data</li>
            <li><strong className="text-white">Erasure</strong> — request deletion ("right to be forgotten")</li>
            <li><strong className="text-white">Portability</strong> — receive your data in a machine-readable format</li>
            <li><strong className="text-white">Restriction</strong> — ask us to limit certain processing</li>
            <li><strong className="text-white">Objection</strong> — object to processing based on legitimate interest</li>
            <li><strong className="text-white">Withdraw consent</strong> — at any time for consent-based processing</li>
            <li><strong className="text-white">CCPA (California)</strong> — do not sell or share my personal information</li>
          </ul>
          <p>To exercise any right, email <span className="text-brand-pink">privacy@mechi.app</span>. We will respond within 30 days (GDPR: 1 month).</p>
        </Section>

        <Section title="8. Security">
          <p>We implement industry-standard security measures including:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>TLS 1.3 encryption for all data in transit</li>
            <li>AES-256 encryption for data at rest</li>
            <li>Row-level security (RLS) on all database tables</li>
            <li>Regular penetration testing and security audits</li>
            <li>Strict access controls — staff access to user data requires managerial approval</li>
          </ul>
          <p>In the event of a data breach affecting your rights, we will notify you within 72 hours as required by GDPR Article 33.</p>
        </Section>

        <Section title="9. Cookies">
          <p>We use cookies and similar tracking technologies. For full details and to manage your preferences, see our Cookie Consent panel (shown on first launch) or visit Settings → Privacy.</p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>Mechi is not intended for users under 18. We do not knowingly collect data from anyone under 18. If we discover we have done so, we will delete it immediately. If you believe a minor is using Mechi, contact <span className="text-brand-pink">safety@mechi.app</span>.</p>
        </Section>

        <Section title="11. Changes to this Policy">
          <p>We may update this Privacy Policy. We will notify you of significant changes by email or in-app banner at least 14 days before they take effect. Your continued use after the effective date constitutes acceptance.</p>
        </Section>

        <Section title="12. Contact & Complaints">
          <p>Data Protection Officer: <span className="text-brand-pink">dpo@mechi.app</span></p>
          <p>You have the right to lodge a complaint with your local data protection authority. In Kenya, that is the Office of the Data Protection Commissioner: <span className="text-brand-pink">www.odpc.go.ke</span></p>
        </Section>
      </div>
    </div>
  );
};
