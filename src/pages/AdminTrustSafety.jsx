import React from 'react';
import { ShieldCheck } from 'lucide-react';
import AdminDynamicControlPage from './AdminDynamicControlPage';

const defaults = {
  manualReviewEnabled: true,
  requireEmailVerification: true,
  requirePhoneForPosting: false,
  minTrustScoreToPost: 0,
  fraudWarning: 'Meet in a safe public place and never share OTP or payment PIN.',
  defaultBlockedMessage: 'Your account is restricted. Please contact support.',
  suspiciousWords: ['advance payment', 'otp', 'urgent transfer'],
  blockedCategories: [],
};

const fields = [
  { key: 'manualReviewEnabled', label: 'Manual review queue', type: 'toggle', help: 'Keep suspicious listings in admin review.' },
  { key: 'requireEmailVerification', label: 'Require verified email', type: 'toggle', help: 'Block sensitive actions until email is verified.' },
  { key: 'requirePhoneForPosting', label: 'Require phone for posting', type: 'toggle', help: 'Require mobile number before creating ads.' },
  { key: 'minTrustScoreToPost', label: 'Minimum trust score to post', type: 'number' },
  { key: 'fraudWarning', label: 'Fraud warning message', type: 'textarea', rows: 4 },
  { key: 'defaultBlockedMessage', label: 'Blocked account message', type: 'textarea', rows: 4 },
  { key: 'suspiciousWords', label: 'Suspicious words', type: 'tags' },
  { key: 'blockedCategories', label: 'Blocked categories', type: 'tags' },
];

const AdminTrustSafety = () => (
  <AdminDynamicControlPage
    configKey="trustSafety"
    title="Trust & Safety"
    description="Control account safety, posting eligibility, fraud warning, and moderation triggers."
    icon={ShieldCheck}
    fields={fields}
    defaults={defaults}
    preview={(draft) => (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{draft.fraudWarning}</div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-900">Suspicious words</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(draft.suspiciousWords || []).map((word) => <span key={word} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700">{word}</span>)}
          </div>
        </div>
      </div>
    )}
  />
);

export default AdminTrustSafety;
