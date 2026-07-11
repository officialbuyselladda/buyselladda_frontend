import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Facebook, Twitter, Instagram, Youtube,
  Plus, Shield, Download, Map, Link as LinkIcon,
  ChevronRight, ArrowUpRight, Star,
  Mail, Phone, MapPin,
} from 'lucide-react';
import { contentApi } from '../services/api';
import { cn } from '../utils';

/* ─── Fallback data ─────────────────────────────────────────── */
const fallbackFooter = {
  brandName: 'BuySellAdda',
  logoUrl: '/logo-1.png',
  tagline: 'Har Deal, Ek Nayi Shuruaat.\nBuy and sell locally with confidence.',
  trustTitle: 'Trusted by 10M+ users',
  trustSubtitle: "India's #1 buying & selling platform",
  bannerButtonText: 'Post Your Ad',
  bannerButtonPath: '/create-product',
  copyrightText: 'BuySellAdda. All rights reserved',
  columns: [
    {
      title: 'Buy & Sell',
      links: [
        { label: 'Post Free Ad', path: '/create-product' },
        { label: 'My Ads', path: '/my-products' },
        { label: 'Profile', path: '/profile' },
        { label: 'Messages', path: '/chats' },
      ],
    },
    {
      title: 'Browse',
      links: [
        { label: 'All Categories', path: '/categories' },
        { label: 'Search', path: '/search' },
        { label: 'Favorites', path: '/favorites' },
        { label: 'Notifications', path: '/notifications' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Login', path: '/login' },
        { label: 'Sign Up', path: '/register' },
        { label: 'Messages', path: '/chats' },
        { label: 'Notifications', path: '/notifications' },
      ],
    },
    {
      title: 'Help',
      links: [
        { label: 'Contact', path: '/contact' },
        { label: 'Safety Tips', path: '/safety' },
        { label: 'Report Problem', path: '/report' },
        { label: 'Support', path: '/support' },
      ],
    },
  ],
  bottomLinks: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Use', path: '/terms' },
    { label: 'Safety Tips', path: '/safety' },
    { label: 'Help', path: '/help' },
  ],
  popularCities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'],
  socialLinks: [
    { label: 'Facebook', url: '#' },
    { label: 'Twitter', url: '#' },
    { label: 'Instagram', url: '#' },
    { label: 'Youtube', url: '#' },
  ],
  stats: [
    { value: '10M+', label: 'Happy Users' },
    { value: '50M+', label: 'Listings Posted' },
    { value: '500+', label: 'Cities Covered' },
    { value: '4.9★', label: 'App Rating' },
  ],
  contact: {
    email: 'support@buyselladda.com',
    phone: '+91 9911356613',
    address: 'New Delhi',
  },
};

const socialIconMap = { facebook: Facebook, twitter: Twitter, instagram: Instagram, youtube: Youtube };
const getSocialIcon = (label = '') => socialIconMap[label.toLowerCase()] || LinkIcon;

const SmartLink = ({ item, className, children, onClick }) => {
  const target = item?.path || item?.url || '#';
  if (target.startsWith('http') || target.startsWith('mailto:') || target.startsWith('tel:') || target === '#') {
    return <a href={target} className={className} onClick={onClick} rel="noopener noreferrer">{children}</a>;
  }
  return <Link to={target} className={className} onClick={onClick}>{children}</Link>;
};

const navigateToCity = (event, city) => {
  event.preventDefault();
  const url = new URL(window.location);
  url.pathname = '/';
  url.searchParams.set('city', city.toLowerCase());
  window.location = url.toString();
};

/* ─── SVG Decorations ───────────────────────────────────────── */
const SvgWave = () => (
  <svg className="ftr-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,0 L0,0 Z"
      fill="#F8FAFF"
    />
  </svg>
);

const SvgDotGrid = () => (
  <svg className="ftr-dot-grid" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#2563EB" fillOpacity="0.12" />
      </pattern>
    </defs>
    <rect width="200" height="200" fill="url(#dots)" />
  </svg>
);

const SvgCircleDecor = () => (
  <svg className="ftr-circle-decor" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
    <circle cx="150" cy="150" r="120" fill="none" stroke="#2563EB" strokeOpacity="0.06" strokeWidth="40" />
    <circle cx="150" cy="150" r="60" fill="none" stroke="#2563EB" strokeOpacity="0.05" strokeWidth="20" />
  </svg>
);

const SvgCurveTop = () => (
  <svg className="ftr-curve-top" viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,0 Q360,100 720,60 Q1080,20 1440,80 L1440,100 L0,100 Z" fill="white" fillOpacity="0.6" />
    <path d="M0,20 Q240,80 600,40 Q960,0 1440,60 L1440,100 L0,100 Z" fill="white" fillOpacity="0.4" />
  </svg>
);

const SvgLinePattern = () => (
  <svg className="ftr-line-pattern" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="40" stroke="#2563EB" strokeOpacity="0.05" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#lines)" />
  </svg>
);

/* ─── Component ─────────────────────────────────────────────── */
const Footer = () => {
  const location = useLocation();
  const { data } = useQuery({
    queryKey: ['siteContent'],
    queryFn: contentApi.getSiteContent,
    staleTime: 5 * 60 * 1000,
  });
  const footer = { ...fallbackFooter, ...(data?.footer || {}) };
  const stats = footer.stats || fallbackFooter.stats;
  const contact = footer.contact || fallbackFooter.contact;

  return (
    <>
      <style>{footerStyles}</style>

      <footer className="ftr-root">
        {/* SVG background decorations */}
        <SvgDotGrid />
        <SvgCircleDecor />
        <SvgLinePattern />

        {/* ── Stats strip ───────────────────────────────────── */}
        <div className="ftr-stats-strip">
          <SvgCurveTop />
          <div className="ftr-stats-inner">
            {stats.map((s, i) => (
              <div className="ftr-stat-item" key={i}>
                <span className="ftr-stat-value">{s.value}</span>
                <span className="ftr-stat-label">{s.label}</span>
                {i < stats.length - 1 && <span className="ftr-stat-sep" aria-hidden />}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Banner ────────────────────────────────────── */}
        <div className="ftr-banner">
          <div className="ftr-banner-svg-left">
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" fill="none">
              <path d="M10,60 Q30,10 60,30 Q90,50 110,20" stroke="#2563EB" strokeOpacity=".15" strokeWidth="3" strokeLinecap="round"/>
              <path d="M0,80 Q40,40 80,70 Q110,90 120,60" stroke="#2563EB" strokeOpacity=".1" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="60" cy="60" r="40" stroke="#2563EB" strokeOpacity=".07" strokeWidth="12"/>
            </svg>
          </div>
          <div className="ftr-banner-inner">
            <div className="ftr-banner-left">
              <div className="ftr-banner-icon">
                <Shield size={22} strokeWidth={1.8} />
              </div>
              <div>
                <p className="ftr-banner-title">
                  {footer.trustTitle}
                  <span className="ftr-banner-badge">
                    <Star size={9} fill="#F59E0B" color="#F59E0B" /> 4.9
                  </span>
                </p>
                <p className="ftr-banner-sub">{footer.trustSubtitle}</p>
              </div>
            </div>
            <SmartLink item={{ path: footer.bannerButtonPath }} className="ftr-banner-btn">
              <span className="ftr-banner-btn-icon"><Plus size={13} strokeWidth={3} /></span>
              {footer.bannerButtonText}
              <ArrowUpRight size={14} className="ftr-banner-btn-arrow" />
            </SmartLink>
          </div>
          <div className="ftr-banner-svg-right">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none">
              <path d="M80,20 Q60,60 20,40 Q0,30 10,60" stroke="#2563EB" strokeOpacity=".12" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="70" cy="70" r="25" stroke="#2563EB" strokeOpacity=".08" strokeWidth="10"/>
            </svg>
          </div>
        </div>

        {/* ── Main grid ─────────────────────────────────────── */}
        <div className="ftr-main">
          <div className="ftr-grid">

            {/* Brand */}
            <div className="ftr-brand">
              <div className="ftr-logo-wrap">
                {footer.logoUrl
                  ? <img src={footer.logoUrl} alt={footer.brandName} className="ftr-logo" />
                  : <span className="ftr-logo-text">{footer.brandName?.charAt(0)}</span>
                }
              </div>
              <h2 className="ftr-brand-name">{footer.brandName}</h2>
              <p className="ftr-brand-tagline">
                {String(footer.tagline || '').split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>

              {/* Contact info */}
              <div className="ftr-contact-list">
                {contact?.email && (
                  <a href={`mailto:${contact.email}`} className="ftr-contact-item">
                    <Mail size={13} /> {contact.email}
                  </a>
                )}
                {contact?.phone && (
                  <a href={`tel:${contact.phone}`} className="ftr-contact-item">
                    <Phone size={13} /> {contact.phone}
                  </a>
                )}
                {contact?.address && (
                  <span className="ftr-contact-item ftr-contact-addr">
                    <MapPin size={13} /> {contact.address}
                  </span>
                )}
              </div>

              {/* Social */}
              <div className="ftr-social-row">
                {(footer.socialLinks || []).map((item) => {
                  const Icon = getSocialIcon(item.label);
                  return (
                    <SmartLink key={`${item.label}-${item.url}`} item={item} className="ftr-social-btn" aria-label={item.label}>
                      <Icon size={15} strokeWidth={1.8} />
                    </SmartLink>
                  );
                })}
              </div>

              <div className="ftr-play-store-cta">
                <SmartLink item={{ path: '/app-testing' }} className="ftr-play-store-btn">
                  <Download size={15} />
                  <div className="ftr-play-store-text">
                    <span>Play Store</span>
                    <span className="ftr-play-store-sub">App testing — Launch soon</span>
                  </div>
                </SmartLink>
              </div>
            </div>

            {/* Nav columns */}
            {(footer.columns || []).map((column) => (
              <div className="ftr-col" key={column.title}>
                <h3 className="ftr-col-title">
                  <span className="ftr-col-title-bar" />
                  {column.title}
                </h3>
                <ul className="ftr-list">
                  {(column.links || []).map((item) => (
                    <li key={`${column.title}-${item.label}-${item.path || item.url}`}>
                      <SmartLink
                        item={item}
                        className={cn('ftr-link', location.pathname === item.path && 'ftr-link-active')}
                      >
                        <ChevronRight size={12} className="ftr-link-arrow" strokeWidth={2.5} />
                        {item.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>

          {/* Cities */}
          {(footer.popularCities || []).length > 0 && (
            <div className="ftr-cities-section">
              <div className="ftr-cities-header">
                <Map size={14} strokeWidth={1.8} />
                <h3 className="ftr-cities-title">Popular Cities</h3>
                <div className="ftr-cities-line" />
              </div>
              <div className="ftr-cities-grid">
                {footer.popularCities.map((city) => (
                  <Link key={city} to="/" className="ftr-city-pill" onClick={(e) => navigateToCity(e, city)}>
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><circle cx="3" cy="3" r="3" fill="#2563EB" fillOpacity=".5"/></svg>
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div className="ftr-bottom">
          {/* SVG wave separator */}
          <svg className="ftr-bottom-wave" viewBox="0 0 1440 24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,12 Q120,0 240,12 Q360,24 480,12 Q600,0 720,12 Q840,24 960,12 Q1080,0 1200,12 Q1320,24 1440,12 L1440,24 L0,24 Z" fill="#EFF6FF"/>
          </svg>
          <div className="ftr-bottom-inner">
            <p className="ftr-copy">© {new Date().getFullYear()} {footer.copyrightText}</p>
            <div className="ftr-bottom-links">
              {(footer.bottomLinks || []).map((item, i) => (
                <span key={`${item.label}-${item.path}`} className="ftr-bottom-link-wrap">
                  {i > 0 && <span className="ftr-bottom-sep" aria-hidden>·</span>}
                  <SmartLink item={item} className="ftr-copy-link">{item.label}</SmartLink>
                </span>
              ))}
            </div>
            <div className="ftr-bottom-social">
              {(footer.socialLinks || []).map((item) => {
                const Icon = getSocialIcon(item.label);
                return (
                  <SmartLink key={`${item.label}-bottom`} item={item} className="ftr-bottom-social-btn" aria-label={item.label}>
                    <Icon size={13} strokeWidth={1.8} />
                  </SmartLink>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   STYLES  — white / light theme with SVG path accents
───────────────────────────────────────────────────────────── */
const footerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Figtree:wght@400;500;600;700&display=swap');

  /* tokens */
  :root {
    --ftr-blue:      #2563EB;
    --ftr-blue-lt:   #EFF6FF;
    --ftr-blue-mid:  #DBEAFE;
    --ftr-text:      #1E293B;
    --ftr-muted:     #64748B;
    --ftr-subtle:    #94A3B8;
    --ftr-border:    #E2E8F0;
    --ftr-bg:        #F8FAFF;
    --ftr-white:     #FFFFFF;
    --ftr-amber:     #F59E0B;
    --ftr-green:     #10B981;
    --ftr-radius:    14px;
    --ftr-shadow-sm: 0 1px 3px rgba(37,99,235,.08), 0 1px 2px rgba(0,0,0,.04);
    --ftr-shadow-md: 0 4px 16px rgba(37,99,235,.12), 0 2px 6px rgba(0,0,0,.06);
    --ftr-shadow-lg: 0 12px 40px rgba(37,99,235,.16), 0 4px 12px rgba(0,0,0,.08);
  }

  /* ── Root ─────────────────────────────────────────────────── */
  .ftr-root {
    font-family: 'Figtree', sans-serif;
    background: var(--ftr-bg);
    color: var(--ftr-text);
    border-top: 1px solid var(--ftr-border);
    position: relative;
    overflow: hidden;
  }

  /* SVG decorations */
  .ftr-dot-grid {
    position: absolute; top: 0; right: 0;
    width: 220px; height: 220px;
    pointer-events: none; z-index: 0;
    opacity: .7;
  }
  .ftr-circle-decor {
    position: absolute; bottom: 60px; left: -80px;
    width: 280px; height: 280px;
    pointer-events: none; z-index: 0;
  }
  .ftr-line-pattern {
    position: absolute; bottom: 0; right: 100px;
    width: 300px; height: 300px;
    pointer-events: none; z-index: 0;
    opacity: .6;
  }

  /* ── Stats strip ──────────────────────────────────────────── */
  .ftr-stats-strip {
    position: relative;
    background: linear-gradient(135deg, var(--ftr-blue) 0%, #1D4ED8 100%);
    overflow: hidden;
  }
  .ftr-curve-top {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 40px; width: 100%;
    display: block;
  }
  .ftr-stats-inner {
    max-width: 1200px; margin: 0 auto;
    padding: 28px 32px 48px;
    display: flex; align-items: center;
    justify-content: center;
    flex-wrap: wrap; gap: 0;
    position: relative; z-index: 1;
  }
  .ftr-stat-item {
    display: flex; flex-direction: column; align-items: center;
    padding: 0 40px;
    position: relative;
  }
  .ftr-stat-sep {
    position: absolute; right: 0; top: 50%;
    transform: translateY(-50%);
    width: 1px; height: 36px;
    background: rgba(255,255,255,.2);
  }
  .ftr-stat-value {
    font-family: 'Clash Display', sans-serif;
    font-size: 28px; font-weight: 700;
    color: #fff; line-height: 1;
    letter-spacing: -.02em;
  }
  .ftr-stat-label {
    font-size: 11px; font-weight: 500;
    color: rgba(255,255,255,.7);
    margin-top: 4px; text-transform: uppercase;
    letter-spacing: .08em;
  }

  /* ── Banner ───────────────────────────────────────────────── */
  .ftr-banner {
    background: var(--ftr-white);
    border-bottom: 1px solid var(--ftr-border);
    position: relative; overflow: hidden;
    box-shadow: var(--ftr-shadow-sm);
    z-index: 1;
  }
  .ftr-banner-svg-left,
  .ftr-banner-svg-right {
    position: absolute; top: 0; bottom: 0;
    width: 120px;
    display: flex; align-items: center;
    pointer-events: none;
  }
  .ftr-banner-svg-left { left: 0; }
  .ftr-banner-svg-right { right: 0; justify-content: flex-end; }
  .ftr-banner-svg-left svg,
  .ftr-banner-svg-right svg { width: 100%; height: 100%; }

  .ftr-banner-inner {
    max-width: 1200px; margin: 0 auto;
    padding: 20px 32px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
    position: relative; z-index: 1;
  }
  .ftr-banner-left { display: flex; align-items: center; gap: 14px; }
  .ftr-banner-icon {
    width: 48px; height: 48px; border-radius: 13px;
    background: linear-gradient(135deg, var(--ftr-blue), #1D4ED8);
    display: flex; align-items: center; justify-content: center;
    color: #fff; flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(37,99,235,.35);
  }
  .ftr-banner-title {
    font-family: 'Clash Display', sans-serif;
    font-size: 15px; font-weight: 600; color: var(--ftr-text);
    margin: 0; display: flex; align-items: center; gap: 8px;
  }
  .ftr-banner-badge {
    display: inline-flex; align-items: center; gap: 3px;
    background: #FEF3C7; border: 1px solid #FDE68A;
    border-radius: 20px; padding: 2px 8px;
    font-size: 10px; font-weight: 700; color: #92400E;
    font-family: 'Figtree', sans-serif;
  }
  .ftr-banner-sub { font-size: 12px; color: var(--ftr-muted); margin: 3px 0 0; }
  .ftr-banner-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px;
    background: linear-gradient(135deg, var(--ftr-blue) 0%, #1D4ED8 100%);
    color: #fff; border-radius: 11px;
    font-family: 'Clash Display', sans-serif;
    font-size: 13px; font-weight: 600;
    text-decoration: none; white-space: nowrap;
    transition: all .22s cubic-bezier(.34,1.56,.64,1);
    box-shadow: 0 4px 16px rgba(37,99,235,.35);
  }
  .ftr-banner-btn:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 28px rgba(37,99,235,.45);
    color: #fff; text-decoration: none;
  }
  .ftr-banner-btn-icon {
    width: 22px; height: 22px; border-radius: 7px;
    background: rgba(255,255,255,.2);
    display: flex; align-items: center; justify-content: center;
  }
  .ftr-banner-btn-arrow { opacity: .75; transition: transform .2s; }
  .ftr-banner-btn:hover .ftr-banner-btn-arrow { transform: translate(2px,-2px); opacity: 1; }

  /* ── Main body ────────────────────────────────────────────── */
  .ftr-main {
    max-width: 1200px; margin: 0 auto;
    padding: 60px 32px 40px;
    position: relative; z-index: 1;
  }
  .ftr-grid {
    display: grid;
    grid-template-columns: 260px repeat(4, 1fr);
    gap: 48px 32px;
    align-items: start;
  }

  /* ── Brand ────────────────────────────────────────────────── */
  .ftr-brand { grid-column: 1; }
  .ftr-logo-wrap {
    display: inline-flex; align-items: center; justify-content: center;
    width: 52px; height: 52px;
    background: var(--ftr-blue-lt);
    border: 1.5px solid var(--ftr-blue-mid);
    border-radius: 14px; margin-bottom: 14px;
    overflow: hidden;
  }
  .ftr-logo { width: 40px; height: 40px; object-fit: contain; border-radius: 8px; }
  .ftr-logo-text {
    font-family: 'Clash Display', sans-serif;
    font-size: 22px; font-weight: 700;
    color: var(--ftr-blue);
  }
  .ftr-brand-name {
    font-family: 'Clash Display', sans-serif;
    font-size: 20px; font-weight: 700; color: var(--ftr-text);
    margin: 0 0 8px; letter-spacing: -.02em;
  }
  .ftr-brand-tagline {
    font-size: 13px; color: var(--ftr-muted);
    line-height: 1.75; margin: 0 0 20px;
    max-width: 220px;
  }

  /* Contact */
  .ftr-contact-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .ftr-contact-item {
    display: flex; align-items: center; gap: 7px;
    font-size: 12.5px; color: var(--ftr-muted);
    text-decoration: none;
    transition: color .14s;
  }
  a.ftr-contact-item:hover { color: var(--ftr-blue); }
  .ftr-contact-item svg { flex-shrink: 0; color: var(--ftr-blue); opacity: .7; }

  /* Social */
  .ftr-social-row { display: flex; gap: 8px; }
  .ftr-social-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--ftr-white);
    border: 1.5px solid var(--ftr-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--ftr-muted); text-decoration: none;
    transition: all .2s cubic-bezier(.34,1.4,.64,1);
    box-shadow: var(--ftr-shadow-sm);
  }
  .ftr-social-btn:hover {
    background: var(--ftr-blue);
    border-color: var(--ftr-blue);
    color: #fff;
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(37,99,235,.3);
  }

  .ftr-play-store-cta {
    margin-top: 18px;
  }
  .ftr-play-store-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 13px;
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    color: #fff;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    transition: transform .2s, box-shadow .2s;
    box-shadow: 0 6px 18px rgba(16,185,129,.24);
  }
  .ftr-play-store-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(16,185,129,.28);
  }
  .ftr-play-store-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
    text-align: left;
  }
  .ftr-play-store-sub {
    font-size: 11px;
    color: rgba(255,255,255,.85);
    font-weight: 500;
  }

  /* ── Nav columns ──────────────────────────────────────────── */
  .ftr-col { min-width: 0; }
  .ftr-col-title {
    font-family: 'Clash Display', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--ftr-text);
    margin: 0 0 16px;
    display: flex; align-items: center; gap: 9px;
    letter-spacing: .01em;
  }
  .ftr-col-title-bar {
    display: inline-block;
    width: 3px; height: 14px;
    background: linear-gradient(180deg, var(--ftr-blue) 0%, #93C5FD 100%);
    border-radius: 2px; flex-shrink: 0;
  }
  .ftr-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0; }
  .ftr-link {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 0;
    font-size: 13.5px; color: var(--ftr-muted);
    text-decoration: none;
    transition: all .15s;
    border-radius: 6px;
  }
  .ftr-link-arrow {
    color: var(--ftr-blue);
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity .15s, transform .15s;
    flex-shrink: 0;
  }
  .ftr-link:hover { color: var(--ftr-blue); transform: translateX(4px); text-decoration: none; }
  .ftr-link:hover .ftr-link-arrow { opacity: 1; transform: translateX(0); }
  .ftr-link-active { color: var(--ftr-blue) !important; font-weight: 600; }
  .ftr-link-active .ftr-link-arrow { opacity: 1; transform: translateX(0); }

  /* ── App buttons ──────────────────────────────────────────── */
  .ftr-app-sub {
    font-size: 12px; color: var(--ftr-subtle);
    margin: 0 0 14px;
    display: flex; align-items: center; gap: 5px;
  }
  .ftr-app-btns { display: flex; flex-direction: column; gap: 10px; }
  .ftr-app-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; border-radius: 12px;
    text-decoration: none;
    transition: transform .2s cubic-bezier(.34,1.4,.64,1), box-shadow .2s;
    border: 1.5px solid transparent;
    position: relative;
  }
  .ftr-app-btn:hover { transform: translateY(-2px) scale(1.02); text-decoration: none; }
  .ftr-app-ios {
    background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
    box-shadow: 0 4px 14px rgba(14,165,233,.3);
  }
  .ftr-app-ios:hover { box-shadow: 0 8px 24px rgba(14,165,233,.4); }
  .ftr-app-android {
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    box-shadow: 0 4px 14px rgba(16,185,129,.3);
  }
  .ftr-app-android:hover { box-shadow: 0 8px 24px rgba(16,185,129,.4); }
  .ftr-app-icon { width: 22px; height: 22px; color: #fff; flex-shrink: 0; }
  .ftr-app-text { display: flex; flex-direction: column; }
  .ftr-app-store-label { font-family: 'Clash Display', sans-serif; font-size: 12px; font-weight: 600; color: #fff; }
  .ftr-app-store-sub { font-size: 10px; color: rgba(255,255,255,.75); margin-top: 1px; }

  /* ── Cities ───────────────────────────────────────────────── */
  .ftr-cities-section { margin-top: 44px; }
  .ftr-cities-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 16px;
    color: var(--ftr-muted);
  }
  .ftr-cities-title {
    font-family: 'Clash Display', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--ftr-text);
    margin: 0;
  }
  .ftr-cities-line {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, var(--ftr-border), transparent);
  }
  .ftr-cities-grid { display: flex; flex-wrap: wrap; gap: 7px; }
  .ftr-city-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 13px;
    background: var(--ftr-white);
    border: 1.5px solid var(--ftr-border);
    border-radius: 20px;
    font-size: 12px; font-weight: 500;
    color: var(--ftr-muted); text-decoration: none;
    transition: all .16s cubic-bezier(.34,1.4,.64,1);
    box-shadow: var(--ftr-shadow-sm);
  }
  .ftr-city-pill:hover {
    background: var(--ftr-blue-lt);
    border-color: #93C5FD;
    color: var(--ftr-blue);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37,99,235,.14);
    text-decoration: none;
  }

  /* ── Bottom bar ───────────────────────────────────────────── */
  .ftr-bottom {
    background: var(--ftr-blue-lt);
    border-top: 1px solid var(--ftr-blue-mid);
    position: relative; z-index: 1;
  }
  .ftr-bottom-wave {
    display: block; width: 100%; height: 24px;
    margin-bottom: -1px;
  }
  .ftr-bottom-inner {
    max-width: 1200px; margin: 0 auto;
    padding: 16px 32px;
    display: flex; align-items: center;
    justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
  }
  .ftr-copy { font-size: 12px; color: var(--ftr-subtle); margin: 0; }
  .ftr-bottom-links { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
  .ftr-bottom-link-wrap { display: flex; align-items: center; gap: 4px; }
  .ftr-bottom-sep { color: var(--ftr-border); font-size: 14px; }
  .ftr-copy-link {
    font-size: 12px; font-weight: 600;
    color: var(--ftr-muted); text-decoration: none;
    transition: color .14s;
    padding: 2px 0;
  }
  .ftr-copy-link:hover { color: var(--ftr-blue); }
  .ftr-bottom-social { display: flex; gap: 6px; }
  .ftr-bottom-social-btn {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--ftr-white);
    border: 1.5px solid var(--ftr-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--ftr-muted); text-decoration: none;
    transition: all .18s cubic-bezier(.34,1.4,.64,1);
    box-shadow: var(--ftr-shadow-sm);
  }
  .ftr-bottom-social-btn:hover {
    background: var(--ftr-blue);
    border-color: var(--ftr-blue);
    color: #fff;
    transform: translateY(-2px) scale(1.12);
    box-shadow: 0 4px 12px rgba(37,99,235,.3);
  }

  /* ── Responsive ───────────────────────────────────────────── */
  @media (max-width: 1100px) {
    .ftr-grid { grid-template-columns: 230px repeat(4, 1fr); }
    .ftr-app-col { grid-column: 1; grid-row: 2; }
    .ftr-brand { grid-row: 1; }
  }

  @media (max-width: 860px) {
    .ftr-grid { grid-template-columns: repeat(3, 1fr); }
    .ftr-brand { grid-column: 1 / -1; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto; gap: 0 24px; }
    .ftr-logo-wrap { grid-row: 1; }
    .ftr-brand-name { grid-column: 2; grid-row: 1; align-self: end; }
    .ftr-brand-tagline { grid-column: 2; grid-row: 2; }
    .ftr-contact-list { grid-column: 1 / -1; grid-row: 3; flex-direction: row; flex-wrap: wrap; gap: 12px 20px; }
    .ftr-social-row { grid-column: 1 / -1; grid-row: 4; }
    .ftr-app-col { grid-column: span 1; }
    .ftr-main { padding: 48px 24px 32px; }
    .ftr-stat-item { padding: 0 20px; }
    .ftr-stat-value { font-size: 22px; }
  }

  @media (max-width: 600px) {
    .ftr-grid { grid-template-columns: repeat(2, 1fr); gap: 32px 20px; }
    .ftr-brand { grid-column: 1 / -1; display: block; }
    .ftr-app-col { grid-column: 1 / -1; }
    .ftr-app-btns { flex-direction: row; }
    .ftr-app-btn { flex: 1; justify-content: center; }
    .ftr-stats-inner { gap: 0; padding: 24px 16px 42px; }
    .ftr-stat-item { padding: 0 14px; }
    .ftr-stat-value { font-size: 20px; }
    .ftr-banner-inner { padding: 16px 20px; }
    .ftr-main { padding: 40px 20px 28px; }
    .ftr-bottom-inner { flex-direction: column; align-items: flex-start; padding: 16px 20px; }
    .ftr-banner-svg-left, .ftr-banner-svg-right { display: none; }
  }

  @media (max-width: 400px) {
    .ftr-grid { grid-template-columns: 1fr; }
    .ftr-stat-item:nth-child(n+3) .ftr-stat-sep { display: none; }
    .ftr-stats-inner { flex-wrap: wrap; justify-content: center; gap: 16px 0; }
    .ftr-stat-item { padding: 0 16px; width: 50%; }
    .ftr-stat-sep { display: none; }
  }
`;

export default Footer;