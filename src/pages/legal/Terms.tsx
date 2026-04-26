import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EFFECTIVE = 'April 27, 2026';
const COMPANY = 'Mechi Technologies Ltd.';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h2 className="text-white font-bold text-[15px] mb-2.5">{title}</h2>
    <div className="text-slate-400 text-[13px] leading-relaxed space-y-2">{children}</div>
  </div>
);

export const TermsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
      <div className="pt-safe px-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#220f38' }}>
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white text-xl font-black">Terms of Service</h1>
          <p className="text-slate-400 text-xs">Effective: {EFFECTIVE}</p>
        </div>
      </div>

      <div className="px-5">
        <div className="p-4 rounded-2xl mb-6" style={{ background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.2)' }}>
          <p className="text-slate-300 text-[13px] leading-relaxed">Please read these Terms of Service carefully before using Mechi. By accessing or using our platform you agree to be bound by these terms. If you do not agree, do not use Mechi.</p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>By creating an account or otherwise accessing Mechi, you agree to these Terms, our Privacy Policy, and our Data Collection Disclosure. These Terms constitute a legally binding agreement between you and {COMPANY}, a company registered in Kenya.</p>
          <p>We may update these Terms at any time. Continued use of Mechi after changes constitutes acceptance. We will notify you of material changes via email or in-app notice at least 14 days in advance.</p>
        </Section>

        <Section title="2. Eligibility">
          <p><strong className="text-white">You must be at least 18 years old</strong> to use Mechi. By creating an account you represent and warrant that you are 18 or older. We reserve the right to terminate accounts of anyone found to be under 18 immediately and without notice.</p>
          <p>You must not be prohibited by applicable law from using dating or social networking services and must not be listed on any government sex-offender registry.</p>
        </Section>

        <Section title="3. Your Account">
          <p>You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Immediately notify us at <span className="text-brand-pink">safety@mechi.app</span> if you suspect unauthorised access.</p>
          <p>You may only create one account. Creating duplicate or fake accounts is a violation of these Terms and may result in permanent suspension.</p>
          <p>You agree to provide accurate, current, and complete information during registration and to update it as necessary.</p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Post false, misleading, or fraudulent information</li>
            <li>Impersonate any person or entity</li>
            <li>Harass, threaten, bully, or intimidate other users</li>
            <li>Post sexually explicit content not permitted by our guidelines</li>
            <li>Solicit money, gifts, or financial information from other users</li>
            <li>Advertise or promote third-party products or services</li>
            <li>Use automated bots, scrapers, or scripts on the platform</li>
            <li>Distribute malware, viruses, or harmful code</li>
            <li>Violate any applicable local, national, or international law</li>
          </ul>
        </Section>

        <Section title="5. Content & Intellectual Property">
          <p>You retain ownership of content you post. By posting, you grant Mechi a non-exclusive, worldwide, royalty-free licence to use, display, reproduce, and distribute your content for the purpose of operating and improving the platform.</p>
          <p>Mechi's brand, logo, design, and software are the exclusive property of {COMPANY} and protected by intellectual property laws. You may not copy, modify, or distribute them without prior written consent.</p>
        </Section>

        <Section title="6. Verification & Badges">
          <p>The Verified badge is awarded to users who upload two genuine photos of themselves. Mechi does not independently verify identity documents. The badge signals a good-faith effort at authenticity — not a government-level identity check.</p>
          <p>Attempting to obtain a badge through fake or manipulated images will result in immediate account termination and may be reported to relevant authorities.</p>
        </Section>

        <Section title="7. Premium Services">
          <p>Premium subscriptions are billed as described on the Subscription page. All payments are final and non-refundable unless required by law. We reserve the right to modify pricing with 30 days' notice.</p>
          <p>If a technical error causes incorrect billing, contact <span className="text-brand-pink">billing@mechi.app</span> within 14 days for a review.</p>
        </Section>

        <Section title="8. Safety & Reporting">
          <p>Mechi provides tools to block and report users. Our Safety Team reviews reports within 2 hours during business hours. For urgent safety emergencies always contact local law enforcement first.</p>
          <p>We cooperate fully with law enforcement investigations and may disclose account data when legally required.</p>
        </Section>

        <Section title="9. Disclaimers">
          <p>Mechi is provided "as is" without warranties of any kind. We do not guarantee that you will find a romantic partner through our platform, that any user's information is accurate, or that the service will be uninterrupted or error-free.</p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>To the maximum extent permitted by law, {COMPANY} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of Mechi, including but not limited to loss of data, loss of profit, or personal injury resulting from user interactions.</p>
          <p>Our total aggregate liability to you shall not exceed the amount you paid to Mechi in the 12 months preceding the claim.</p>
        </Section>

        <Section title="11. Termination">
          <p>We may suspend or terminate your account at our sole discretion, with or without notice, for violation of these Terms or for any conduct we reasonably believe is harmful to users or the platform. You may delete your account at any time via Profile → Settings → Delete Account.</p>
        </Section>

        <Section title="12. Governing Law">
          <p>These Terms are governed by the laws of Kenya. Any disputes shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya, unless otherwise required by applicable consumer protection laws in your country.</p>
        </Section>

        <Section title="13. Contact">
          <p>For questions about these Terms, contact us at:</p>
          <p className="text-brand-pink">legal@mechi.app</p>
          <p>{COMPANY}, Westlands, Nairobi, Kenya</p>
        </Section>
      </div>
    </div>
  );
};
