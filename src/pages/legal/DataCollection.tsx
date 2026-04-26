import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Eye, Lock, Trash2, Download, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const EFFECTIVE = 'April 27, 2026';

const Section = ({ title, icon: Icon, color = '#e91e8c', children }: { title: string; icon: React.ElementType; color?: string; children: React.ReactNode }) => (
  <div className="mb-5 p-4 rounded-[20px]" style={{ background: '#1a0828', border: '1px solid rgba(156,39,176,0.15)' }}>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={17} style={{ color }} />
      </div>
      <h2 className="text-white font-bold text-[15px]">{title}</h2>
    </div>
    <div className="text-slate-400 text-[13px] leading-relaxed space-y-2">{children}</div>
  </div>
);

const DataRow = ({ label, what, why, kept }: { label: string; what: string; why: string; kept: string }) => (
  <div className="py-3 border-b" style={{ borderColor: 'rgba(156,39,176,0.12)' }}>
    <div className="flex justify-between items-start gap-2 mb-1">
      <span className="text-white text-[13px] font-semibold">{label}</span>
      <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(233,30,140,0.15)', color: '#e91e8c' }}>{kept}</span>
    </div>
    <p className="text-slate-500 text-[12px] mb-0.5"><span className="text-slate-300">What:</span> {what}</p>
    <p className="text-slate-500 text-[12px]"><span className="text-slate-300">Why:</span> {why}</p>
  </div>
);

export const DataCollectionPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-nav-scroll app-bg overflow-y-auto">
      <div className="pt-safe px-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#220f38' }}>
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white text-xl font-black">Data Collection</h1>
          <p className="text-slate-400 text-xs">Transparency report · {EFFECTIVE}</p>
        </div>
      </div>

      <div className="px-5">
        {/* Intro */}
        <div className="p-4 rounded-2xl mb-5" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p className="text-slate-300 text-[13px] leading-relaxed">This document provides a plain-language breakdown of every type of data Mechi collects, why we collect it, how long we keep it, and who can access it. We believe you deserve full transparency — no legalese.</p>
        </div>

        {/* Data inventory */}
        <Section title="What Data We Collect" icon={Database} color="#3b82f6">
          <DataRow label="Full Name" what="The name you enter during sign-up" why="Shown on your profile to build trust" kept="Until account deletion" />
          <DataRow label="Age" what="Your date of birth or entered age" why="Age verification (18+) and match filtering" kept="Until account deletion" />
          <DataRow label="Email Address" what="Your sign-up email" why="Authentication, password reset, and transactional emails" kept="Until account deletion + 30 days" />
          <DataRow label="Profile Photos" what="Images you upload (stored on our servers)" why="Profile display, verification badge assessment" kept="Until you delete them or close your account" />
          <DataRow label="Bio & Interests" what="Text you write and tags you select" why="Matching algorithm personalisation" kept="Until account deletion" />
          <DataRow label="Location (approx.)" what="City or district-level GPS (not exact address)" why="Show nearby profiles within your chosen radius" kept="Session only unless you enable persistent location" />
          <DataRow label="Device Identifiers" what="IP address, device OS, browser type" why="Security, fraud prevention, session management" kept="90 days rolling" />
          <DataRow label="Messages" what="Text content of chats between matched users" why="Deliver messages, content moderation if reported" kept="12 months from send date" />
          <DataRow label="Usage Events" what="Screens visited, features tapped, swipe patterns" why="Improve product and debug errors (anonymised)" kept="Anonymised forever; identifiable data 24 months" />
          <DataRow label="Payment Phone" what="M-Pesa number for STK push only" why="Process premium subscription payment" kept="7 years (legal/tax requirement)" />
          <DataRow label="Support Tickets" what="Content of messages sent to our support team" why="Resolve your issue and improve support quality" kept="3 years" />
        </Section>

        {/* Who can see it */}
        <Section title="Who Can Access Your Data" icon={Eye} color="#f59e0b">
          <p>Access is strictly controlled. Here is who can see what:</p>
          <div className="space-y-2 mt-2">
            {[
              ['Other Mechi users', 'Profile name, photos, bio, interests, approx. distance, online status', 'Only visible to users you have matched with or whose radius overlaps yours.'],
              ['Mechi Support Staff', 'Account info and messages (only when you raise a support ticket or report is filed)', 'Access requires manager approval and is logged.'],
              ['Safety & Trust Team', 'Flagged content, reported accounts', 'Only when investigating a safety report.'],
              ['Supabase (data processor)', 'All data stored in our database', 'Acts as infrastructure provider under strict DPA. EU data centre.'],
              ['M-Pesa / Safaricom', 'Your phone number and transaction amount', 'Only for payment processing. No profile data is shared.'],
              ['Law Enforcement', 'Account data as specified in a lawful court order', 'We scrutinise every request and comply only when legally obligated.'],
            ].map(([who, what, note]) => (
              <div key={who as string} className="p-3 rounded-xl" style={{ background: '#220f38' }}>
                <p className="text-white text-[13px] font-semibold">{who}</p>
                <p className="text-slate-400 text-[12px] mt-0.5">{what}</p>
                <p className="text-slate-500 text-[11px] mt-0.5 italic">{note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Security measures */}
        <Section title="How We Protect Your Data" icon={Lock} color="#22c55e">
          {[
            ['TLS 1.3 in transit', 'All data exchanged between your device and our servers is encrypted.'],
            ['AES-256 at rest', 'Database and file storage are encrypted at the infrastructure level.'],
            ['Row-Level Security', 'Database queries are restricted so each user can only read their own data.'],
            ['Zero-trust access', 'Staff access to production data requires MFA and a separate approval workflow.'],
            ['Regular audits', 'We conduct quarterly internal reviews and annual third-party penetration tests.'],
            ['Breach notification', 'We notify affected users and regulators within 72 hours of a confirmed breach.'],
          ].map(([title, desc]) => (
            <div key={title as string} className="flex gap-2.5 py-2 border-b" style={{ borderColor: 'rgba(156,39,176,0.1)' }}>
              <span className="text-green-400 font-bold text-[13px] shrink-0">✓</span>
              <div><span className="text-white text-[13px] font-semibold">{title}: </span><span className="text-slate-400 text-[13px]">{desc}</span></div>
            </div>
          ))}
        </Section>

        {/* Your rights / delete */}
        <Section title="Delete or Download Your Data" icon={Trash2} color="#ef4444">
          <p>You have the right to request a full export of your data or to have it permanently deleted.</p>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <motion.button whileTap={{ scale: 0.95 }}
              className="h-11 rounded-xl font-semibold text-white text-[13px] flex items-center justify-center gap-2"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}
              onClick={() => window.open('mailto:privacy@mechi.app?subject=Data Export Request', '_blank')}>
              <Download size={14} />Export Data
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              className="h-11 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
              onClick={() => window.open('mailto:privacy@mechi.app?subject=Account Deletion Request', '_blank')}>
              <Trash2 size={14} />Delete Account
            </motion.button>
          </div>
          <p className="text-slate-500 text-[11px] mt-3">Requests are fulfilled within 30 days. Some data may be retained for legal obligations as described in our Privacy Policy.</p>
        </Section>

        {/* Do not sell */}
        <Section title="Do Not Sell My Personal Information" icon={AlertTriangle} color="#f59e0b">
          <p>Mechi does <strong className="text-white">not</strong> sell your personal information to advertisers or data brokers. This applies to all users regardless of jurisdiction.</p>
          <p>For California residents (CCPA) and similar rights under other laws: you may also opt out of "sharing" for cross-context behavioural advertising by toggling off Marketing cookies in our Cookie Preferences panel.</p>
          <p>To formally exercise your CCPA right, email <span className="text-brand-pink">privacy@mechi.app</span> with subject line "Do Not Sell — CCPA Request".</p>
        </Section>

        <div className="text-center pb-4">
          <p className="text-slate-500 text-[12px]">Questions? Contact our DPO at <span className="text-brand-pink">dpo@mechi.app</span></p>
        </div>
      </div>
    </div>
  );
};
