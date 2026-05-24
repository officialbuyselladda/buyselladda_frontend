import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, FileText, HelpCircle, LockKeyhole, Shield } from 'lucide-react';
import { contentApi } from '../services/api';

const fallbackPages = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Your privacy matters. We protect your personal information and explain how we collect, use, and safeguard your data.',
    accent: 'orange',
    updatedText: 'January 1, 2025',
    sections: [
      { heading: '1. Information We Collect', body: 'We collect information you provide directly, such as your name, email, phone number, and location when you create an account, post ads, or contact us.' },
      { heading: '2. How We Use Your Information', body: 'Your data helps us provide services, improve our platform, communicate with you, and prevent fraud. We never sell your personal information.' },
    ],
  },
  terms: {
    title: 'Terms of Use',
    subtitle: 'By using BuySellAdda, you agree to these terms. Please read carefully.',
    accent: 'emerald',
    updatedText: 'January 1, 2025',
    sections: [
      { heading: '1. Acceptance of Terms', body: 'These Terms govern your use of BuySellAdda platform. Continued use means acceptance.' },
      { heading: '2. User Conduct', body: 'No spam, illegal content, scams. Respect other users.' },
    ],
  },
  help: {
    title: 'Help',
    subtitle: 'Find quick answers, safety guidance, and support options for buying and selling on BuySellAdda.',
    accent: 'blue',
    updatedText: '',
    sections: [
      { heading: '1. Getting Started', body: 'Create an account, set your location, browse categories, and contact sellers directly from product pages.' },
      { heading: '2. Need More Support?', body: 'If something is not working or you need help with an ad, create a support ticket and our team will respond.' },
    ],
  },
};

const pageMeta = {
  privacy: {
    icon: LockKeyhole,
    eyebrow: 'Trust & Privacy',
    helper: 'We keep your personal details protected and explain how your data is used.',
  },
  terms: {
    icon: FileText,
    eyebrow: 'Platform Rules',
    helper: 'Clear rules help every buyer and seller use BuySellAdda safely.',
  },
  help: {
    icon: HelpCircle,
    eyebrow: 'Help Center',
    helper: 'Quick guidance for account, listings, chats, support, and safety.',
  },
};

const getCurrentUpdatedDate = () => new Date().toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const pageStyles = `
  :root {
    --scp-blue: #2563eb;
    --scp-blue-dark: #1d4ed8;
    --scp-blue-light: #eff6ff;
    --scp-blue-mid: #dbeafe;
    --scp-text: #1e293b;
    --scp-muted: #64748b;
    --scp-subtle: #94a3b8;
    --scp-border: #e2e8f0;
    --scp-bg: #f8faff;
    --scp-white: #ffffff;
    --scp-shadow: 0 12px 40px rgba(37, 99, 235, 0.12), 0 4px 12px rgba(0,0,0,0.06);
  }

  .scp-root {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(circle at 8% 10%, rgba(37,99,235,0.10), transparent 30%),
      radial-gradient(circle at 90% 20%, rgba(16,185,129,0.10), transparent 28%),
      var(--scp-bg);
    color: var(--scp-text);
  }

  .scp-dot-grid,
  .scp-ring {
    position: absolute;
    pointer-events: none;
    opacity: 0.75;
  }
  .scp-dot-grid {
    top: 24px;
    right: 0;
    width: 230px;
    height: 230px;
  }
  .scp-ring {
    bottom: 120px;
    left: -90px;
    width: 300px;
    height: 300px;
  }

  .scp-wrap {
    position: relative;
    z-index: 1;
    width: min(100%, 1120px);
    margin: 0 auto;
    padding: 34px 16px 58px;
  }

  .scp-hero {
    overflow: hidden;
    border: 1px solid var(--scp-blue-mid);
    border-radius: 24px;
    background: linear-gradient(135deg, var(--scp-blue), var(--scp-blue-dark));
    color: #ffffff;
    box-shadow: var(--scp-shadow);
  }

  .scp-hero-inner {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 26px;
    align-items: center;
    padding: 32px;
  }

  .scp-hero-inner::after {
    content: "";
    position: absolute;
    right: -70px;
    top: -90px;
    width: 260px;
    height: 260px;
    border: 38px solid rgba(255,255,255,0.10);
    border-radius: 999px;
  }

  .scp-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin: 0 0 12px;
    border: 1px solid rgba(255,255,255,0.26);
    border-radius: 999px;
    background: rgba(255,255,255,0.12);
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .scp-title {
    margin: 0;
    font-size: clamp(34px, 6vw, 64px);
    font-weight: 950;
    letter-spacing: 0;
    line-height: 0.98;
  }

  .scp-subtitle {
    max-width: 760px;
    margin: 16px 0 0;
    color: rgba(255,255,255,0.82);
    font-size: clamp(15px, 2vw, 19px);
    line-height: 1.65;
    font-weight: 550;
  }

  .scp-hero-icon {
    position: relative;
    z-index: 1;
    display: flex;
    width: 92px;
    height: 92px;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.24);
    border-radius: 28px;
    background: rgba(255,255,255,0.14);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.26);
  }

  .scp-layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    gap: 22px;
    margin-top: 22px;
    align-items: start;
  }

  .scp-aside {
    position: sticky;
    top: 112px;
    border: 1px solid var(--scp-border);
    border-radius: 18px;
    background: var(--scp-white);
    padding: 18px;
    box-shadow: 0 4px 16px rgba(37,99,235,0.08);
  }

  .scp-aside-title {
    margin: 0 0 9px;
    color: var(--scp-text);
    font-size: 14px;
    font-weight: 900;
  }

  .scp-aside-copy {
    margin: 0 0 16px;
    color: var(--scp-muted);
    font-size: 13px;
    line-height: 1.55;
  }

  .scp-aside-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-height: 42px;
    border-radius: 12px;
    background: var(--scp-blue);
    color: #ffffff;
    font-size: 13px;
    font-weight: 900;
    text-decoration: none;
    box-shadow: 0 6px 18px rgba(37,99,235,0.24);
  }

  .scp-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .scp-section {
    border: 1px solid var(--scp-border);
    border-radius: 18px;
    background: var(--scp-white);
    padding: 22px;
    box-shadow: 0 4px 16px rgba(37,99,235,0.07);
  }

  .scp-section-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  .scp-section-icon {
    display: flex;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
    background: var(--scp-blue-light);
    color: var(--scp-blue);
  }

  .scp-section-title {
    margin: 0;
    color: var(--scp-text);
    font-size: clamp(18px, 2.4vw, 24px);
    font-weight: 900;
    line-height: 1.25;
  }

  .scp-section-body {
    margin: 0;
    color: #475569;
    font-size: 15.5px;
    line-height: 1.85;
    white-space: pre-wrap;
  }

  .scp-updated {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border: 1px solid var(--scp-blue-mid);
    border-radius: 18px;
    background: var(--scp-blue-light);
    padding: 18px 20px;
    color: var(--scp-text);
  }
  .scp-updated p {
    margin: 0;
    color: var(--scp-muted);
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .scp-updated strong {
    display: block;
    margin-top: 3px;
    color: var(--scp-blue);
    font-size: 18px;
  }

  @media (max-width: 860px) {
    .scp-wrap {
      padding: 22px 12px 42px;
    }
    .scp-hero {
      border-radius: 20px;
    }
    .scp-hero-inner {
      grid-template-columns: 1fr;
      padding: 26px 20px;
    }
    .scp-hero-icon {
      width: 74px;
      height: 74px;
      border-radius: 22px;
      order: -1;
    }
    .scp-layout {
      grid-template-columns: 1fr;
    }
    .scp-aside {
      position: static;
    }
    .scp-section {
      padding: 18px;
    }
  }
`;

const SvgDotGrid = () => (
  <svg className="scp-dot-grid" viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <pattern id="scp-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#2563EB" fillOpacity="0.16" />
      </pattern>
    </defs>
    <rect width="200" height="200" fill="url(#scp-dots)" />
  </svg>
);

const SvgRing = () => (
  <svg className="scp-ring" viewBox="0 0 300 300" aria-hidden="true">
    <circle cx="150" cy="150" r="120" fill="none" stroke="#2563EB" strokeOpacity="0.07" strokeWidth="40" />
    <circle cx="150" cy="150" r="58" fill="none" stroke="#10B981" strokeOpacity="0.08" strokeWidth="18" />
  </svg>
);

const SiteContentPage = ({ pageKey }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['siteContent'],
    queryFn: contentApi.getSiteContent,
    staleTime: 5 * 60 * 1000,
  });

  const page = data?.pages?.[pageKey] || fallbackPages[pageKey] || {
    title: 'Page',
    subtitle: '',
    accent: 'emerald',
    updatedText: '',
    sections: [],
  };
  const meta = pageMeta[pageKey] || pageMeta.help;
  const PageIcon = meta.icon;
  const currentUpdatedDate = getCurrentUpdatedDate();

  if (isLoading && !page.title) {
    return <div className="min-h-screen bg-[#f8faff] px-4 py-16 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="scp-root">
      <style>{pageStyles}</style>
      <SvgDotGrid />
      <SvgRing />

      <main className="scp-wrap">
        <section className="scp-hero">
          <div className="scp-hero-inner">
            <div>
              <p className="scp-eyebrow">
                <Shield size={14} />
                {meta.eyebrow}
              </p>
              <h1 className="scp-title">{page.title}</h1>
              {page.subtitle && <p className="scp-subtitle">{page.subtitle}</p>}
            </div>
            <div className="scp-hero-icon">
              <PageIcon size={40} strokeWidth={1.8} />
            </div>
          </div>
        </section>

        <div className="scp-layout">
          <aside className="scp-aside">
            <p className="scp-aside-title">BuySellAdda Support</p>
            <p className="scp-aside-copy">{meta.helper}</p>
            <Link to="/support" className="scp-aside-link">
              Contact Support
              <ArrowUpRight size={15} />
            </Link>
          </aside>

          <div className="scp-content">
            {(page.sections || []).map((section, index) => (
              <section key={`${section.heading}-${index}`} className="scp-section">
                <div className="scp-section-head">
                  <span className="scp-section-icon">
                    <CheckCircle2 size={18} />
                  </span>
                  <h2 className="scp-section-title">{section.heading}</h2>
                </div>
                <p className="scp-section-body">{section.body}</p>
              </section>
            ))}

            <div className="scp-updated">
              <div>
                <p>Last Updated</p>
                <strong>{currentUpdatedDate}</strong>
              </div>
              <FileText size={26} color="#2563eb" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SiteContentPage;
