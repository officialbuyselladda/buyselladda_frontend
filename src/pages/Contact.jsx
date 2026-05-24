import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent! We'll reply within 24 hours.");
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <>
      <style>{contactStyles}</style>

      <div className="ct-page">
        <main className="ct-container">

          {/* ── Hero ── */}
          <div className="ct-hero">
            <h1 className="ct-hero__title">Contact Us</h1>
            <p className="ct-hero__sub">
              We'd love to hear from you. Send us a message and we'll respond fast.
            </p>
          </div>

          {/* ── Grid ── */}
          <div className="ct-grid">

            {/* ── Left: Info ── */}
            <div className="ct-left">

              <div className="ct-card">
                <p className="ct-card__heading">Get In Touch</p>

                {[
                  {
                    icon: Mail,
                    color: 'green',
                    title: 'Email Us',
                    primary: 'support@buyselladda.com',
                    secondary: 'Best for technical issues',
                  },
                  {
                    icon: Phone,
                    color: 'blue',
                    title: 'Call Us',
                    primary: '+91 98765 43210',
                    secondary: 'Mon–Sat, 9 AM – 7 PM',
                  },
                  {
                    icon: MapPin,
                    color: 'accent',
                    title: 'Visit Us',
                    primary: 'Mumbai, Maharashtra',
                    secondary: 'By appointment only',
                  },
                ].map(({ icon: Icon, color, title, primary, secondary }) => (
                  <div key={title} className="ct-info-row">
                    <div className={`ct-info-row__icon ct-info-row__icon--${color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="ct-info-row__content">
                      <p className="ct-info-row__title">{title}</p>
                      <p className="ct-info-row__primary">{primary}</p>
                      <p className="ct-info-row__secondary">{secondary}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety strip */}
              <div className="ct-safety">
                <div className="ct-safety__icon">
                  <Shield size={22} />
                </div>
                <div className="ct-safety__content">
                  <p className="ct-safety__title">Safe & Secure</p>
                  <p className="ct-safety__sub">All communications encrypted. Your data protected.</p>
                </div>
              </div>

            </div>

            {/* ── Right: Form ── */}
            <div className="ct-right">
              <div className="ct-form-card">
                <p className="ct-card__heading">Send a Message</p>

                <form onSubmit={handleSubmit} className="ct-form">
                  <div className="ct-field">
                    <label className="ct-label">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="ct-input"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="ct-field">
                    <label className="ct-label">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="ct-input"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="ct-field">
                    <label className="ct-label">Message</label>
                    <textarea
                      required
                      rows="6"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="ct-input ct-input--textarea"
                      placeholder="Tell us about your issue…"
                    />
                  </div>

                  <button type="submit" disabled={loading} className="ct-submit">
                    {loading ? (
                      <>
                        <span className="ct-submit__spinner" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const contactStyles = `
  :root {
    --ct-bg: #f5f4f1;
    --ct-surface: #ffffff;
    --ct-surface-2: #faf9f7;
    --ct-border: #edeae5;
    --ct-accent: #d4571a;
    --ct-accent-hover: #b84816;
    --ct-accent-light: #fff4ef;
    --ct-green: #16a34a;
    --ct-green-bg: #f0fdf4;
    --ct-blue: #2563eb;
    --ct-blue-bg: #eff6ff;
    --ct-text: #0f0e0c;
    --ct-text-2: #6b6860;
    --ct-text-3: #9c9890;
    --ct-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04);
    --ct-shadow-md: 0 4px 20px rgba(0,0,0,0.08);
    --ct-radius: 16px;
    --ct-radius-sm: 10px;
    --ct-radius-full: 999px;
    --ct-t: 0.16s cubic-bezier(0.4,0,0.2,1);
    --ct-font-display: 'Georgia','Times New Roman',serif;
  }

  .ct-page {
    min-height: 100vh;
    background: var(--ct-bg);
    padding: 40px 0 72px;
  }

  .ct-container {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 16px;
  }
  @media (min-width: 640px)  { .ct-container { padding: 0 28px; } }
  @media (min-width: 1024px) { .ct-container { padding: 0 40px; } }

  /* ── Hero ── */
  .ct-hero {
    text-align: center;
    margin-bottom: 44px;
  }
  .ct-hero__title {
    font-family: var(--ct-font-display);
    font-size: clamp(32px, 6vw, 56px);
    font-weight: 700;
    color: var(--ct-text);
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: 14px;
  }
  .ct-hero__sub {
    font-size: clamp(14px, 2vw, 17px);
    color: var(--ct-text-2);
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.65;
  }

  /* ── Layout Grid ── */
  .ct-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    align-items: start;
  }
  @media (min-width: 900px) {
    .ct-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
  }

  /* ── Shared card ── */
  .ct-card {
    background: var(--ct-surface);
    border: 1px solid var(--ct-border);
    border-radius: var(--ct-radius);
    padding: 26px 24px;
    box-shadow: var(--ct-shadow-md);
  }
  .ct-card__heading {
    font-family: var(--ct-font-display);
    font-size: 20px;
    font-weight: 700;
    color: var(--ct-text);
    letter-spacing: -0.02em;
    margin-bottom: 18px;
  }

  /* ── Left column ── */
  .ct-left { display: flex; flex-direction: column; gap: 14px; }

  /* ── Info Rows ── */
  .ct-info-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px;
    background: var(--ct-surface-2);
    border: 1px solid var(--ct-border);
    border-radius: var(--ct-radius-sm);
    transition: background var(--ct-t), border-color var(--ct-t);
    margin-bottom: 8px;
  }
  .ct-info-row:last-child { margin-bottom: 0; }
  .ct-info-row:hover { background: #f5f3ef; border-color: #ddd9d3; }

  .ct-info-row__icon {
    width: 44px;
    height: 44px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ct-info-row__icon--accent { background: var(--ct-accent-light); color: var(--ct-accent); }
  .ct-info-row__icon--green  { background: var(--ct-green-bg);    color: var(--ct-green);  }
  .ct-info-row__icon--blue   { background: var(--ct-blue-bg);     color: var(--ct-blue);   }

  .ct-info-row__content { flex: 1; min-width: 0; }
  .ct-info-row__title {
    font-size: 13px;
    font-weight: 700;
    color: var(--ct-text);
    margin-bottom: 2px;
  }
  .ct-info-row__primary {
    font-size: 13.5px;
    color: var(--ct-text-2);
    font-weight: 500;
    margin-bottom: 2px;
  }
  .ct-info-row__secondary {
    font-size: 11.5px;
    color: var(--ct-text-3);
  }

  /* ── Safety Strip ── */
  .ct-safety {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    background: var(--ct-surface);
    border: 1px solid #bbf7d0;
    border-radius: var(--ct-radius);
    box-shadow: var(--ct-shadow);
  }
  .ct-safety__icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--ct-green-bg);
    color: var(--ct-green);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ct-safety__content { flex: 1; }
  .ct-safety__title { font-size: 13.5px; font-weight: 700; color: var(--ct-text); margin-bottom: 3px; }
  .ct-safety__sub { font-size: 12px; color: var(--ct-text-3); line-height: 1.5; }

  /* ── Form Card ── */
  .ct-form-card {
    background: var(--ct-surface);
    border: 1px solid var(--ct-border);
    border-radius: var(--ct-radius);
    padding: 28px 26px;
    box-shadow: var(--ct-shadow-md);
    position: sticky;
    top: 88px;
  }

  .ct-form { display: flex; flex-direction: column; gap: 18px; }

  .ct-field { display: flex; flex-direction: column; gap: 6px; }

  .ct-label {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--ct-text-2);
    letter-spacing: 0.01em;
  }

  .ct-input {
    width: 100%;
    padding: 12px 15px;
    font-size: 14px;
    color: var(--ct-text);
    background: var(--ct-surface-2);
    border: 1.5px solid var(--ct-border);
    border-radius: var(--ct-radius-sm);
    outline: none;
    transition: border-color var(--ct-t), box-shadow var(--ct-t), background var(--ct-t);
    font-family: inherit;
  }
  .ct-input::placeholder { color: var(--ct-text-3); }
  .ct-input:focus {
    border-color: var(--ct-accent);
    background: var(--ct-surface);
    box-shadow: 0 0 0 3px rgba(212,87,26,0.10);
  }
  .ct-input--textarea {
    resize: vertical;
    min-height: 130px;
    line-height: 1.65;
  }

  /* ── Submit Button ── */
  .ct-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px 20px;
    background: var(--ct-accent);
    color: #fff;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.02em;
    border: none;
    border-radius: var(--ct-radius-sm);
    cursor: pointer;
    box-shadow: 0 2px 14px rgba(212,87,26,0.28);
    transition: background var(--ct-t), transform var(--ct-t), box-shadow var(--ct-t);
  }
  .ct-submit:hover:not(:disabled) {
    background: var(--ct-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(212,87,26,0.36);
  }
  .ct-submit:active:not(:disabled) { transform: translateY(0); }
  .ct-submit:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

  .ct-submit__spinner {
    width: 18px;
    height: 18px;
    border: 2.5px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ct-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes ct-spin { to { transform: rotate(360deg); } }
`;

export default Contact;