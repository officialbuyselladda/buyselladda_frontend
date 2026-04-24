import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../utils';
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin, Home, Tag, User, MessageCircle, Heart, Bell, Search, Plus, LogIn, FileText, Shield, Download, Map } from 'lucide-react';
import { cn } from '../utils';

const pageRoutes = [
  { path: '/',               label: 'Home',          icon: Home },
  { path: '/categories',     label: 'Categories',    icon: Tag },
  { path: '/search',         label: 'Search',        icon: Search },
  { path: '/create-product', label: 'Post Free Ad',  icon: Plus },
  { path: '/my-products',    label: 'My Ads',        icon: Tag },
  { path: '/favorites',      label: 'Favorites',     icon: Heart },
  { path: '/chats',          label: 'Messages',      icon: MessageCircle },
  { path: '/notifications',  label: 'Notifications', icon: Bell },
  { path: '/profile',        label: 'My Profile',    icon: User },
  { path: '/login',          label: 'Login',         icon: LogIn },
  { path: '/register',       label: 'Sign Up',       icon: User },
];

const popularCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
];

const navigateToCity = (e, city) => {
  e.preventDefault();
  const url = new URL(window.location);
  url.searchParams.set('city', city.toLowerCase());
  window.location = url.toString();
};

const Footer = () => {
  const location = useLocation();

  return (
    <>
      <style>{footerStyles}</style>

      <footer className="ftr-root">

        {/* ── Trust banner ── */}
        <div className="ftr-banner">
          <div className="ftr-banner-inner">
            <div className="ftr-banner-left">
              <div className="ftr-banner-icon">
                <Shield size={18} />
              </div>
              <div>
                <p className="ftr-banner-title">Trusted by 10M+ users</p>
                <p className="ftr-banner-sub">India's #1 buying &amp; selling platform</p>
              </div>
            </div>
            <Link to="/create-product" className="ftr-banner-btn">
              <Plus size={14} strokeWidth={2.5} />
              Post Your Ad
            </Link>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="ftr-main">
          <div className="ftr-grid">

            {/* Brand */}
            <div className="ftr-brand">
              <img
                src="https://i.ibb.co/d4v1q3jZ/logo.jpg"
                alt="DealKro"
                className="ftr-logo"
              />
              <p className="ftr-brand-tagline">Buy and sell locally.<br />Quick, easy, safe.</p>
              <div className="ftr-social-row">
                {[
                  { Icon: Facebook,  label: 'Facebook' },
                  { Icon: Twitter,   label: 'Twitter' },
                  { Icon: Instagram, label: 'Instagram' },
                  { Icon: Youtube,   label: 'Youtube' },
                ].map(({ Icon, label }) => (
                  <a key={label} href="#" className="ftr-social-btn" aria-label={label}>
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Buy & Sell */}
            <div className="ftr-col">
              <h3 className="ftr-col-title">
                <Plus size={14} />
                Buy &amp; Sell
              </h3>
              <ul className="ftr-list">
                <li>
                  <Link to="/create-product" className="ftr-link">
                    <Plus size={13} /> Post Free Ad
                  </Link>
                </li>
                <li>
                  <Link to="/my-products" className="ftr-link">
                    <Tag size={13} /> My Ads
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="ftr-link">
                    <User size={13} /> Profile
                  </Link>
                </li>
              </ul>
            </div>

            {/* Browse */}
            <div className="ftr-col">
              <h3 className="ftr-col-title">
                <Tag size={14} />
                Browse
              </h3>
              <ul className="ftr-list">
                {pageRoutes.slice(1, 6).map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <Link
                      to={path}
                      className={cn('ftr-link', location.pathname === path && 'ftr-link-active')}
                    >
                      <Icon size={13} />
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/categories" className="ftr-link ftr-link-accent">
                    All Categories →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div className="ftr-col">
              <h3 className="ftr-col-title">
                <User size={14} />
                Account
              </h3>
              <ul className="ftr-list">
                {pageRoutes.slice(8).map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <Link
                      to={path}
                      className={cn('ftr-link', location.pathname === path && 'ftr-link-active')}
                    >
                      <Icon size={13} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div className="ftr-col">
              <h3 className="ftr-col-title">
                <FileText size={14} />
                Help
              </h3>
              <ul className="ftr-list">
                <li><Link to="#" className="ftr-link"><Phone size={13} /> Contact</Link></li>
                <li><Link to="#" className="ftr-link"><Shield size={13} /> Safety</Link></li>
                <li><Link to="#" className="ftr-link"><Mail size={13} /> Report Problem</Link></li>
                <li><Link to="/notifications" className="ftr-link"><Bell size={13} /> Support</Link></li>
              </ul>
            </div>

            {/* Download */}
            <div className="ftr-col">
              <h3 className="ftr-col-title">
                <Download size={14} />
                Download App
              </h3>
              <p className="ftr-app-sub">Buy &amp; sell on the go</p>
              <div className="ftr-app-btns">
                <a href="#" className="ftr-app-btn ftr-app-ios">
                  <span className="ftr-app-store-label">App Store</span>
                  <span className="ftr-app-store-sub">iOS</span>
                </a>
                <a href="#" className="ftr-app-btn ftr-app-android">
                  <span className="ftr-app-store-label">Google Play</span>
                  <span className="ftr-app-store-sub">Android</span>
                </a>
              </div>
            </div>

            {/* Popular Cities */}
            <div className="ftr-cities-col">
              <h3 className="ftr-col-title">
                <Map size={14} />
                Popular Cities
              </h3>
              <div className="ftr-cities-grid">
                {popularCities.map((city) => (
                  <Link
                    key={city}
                    to="/"
                    className="ftr-city-pill"
                    onClick={(e) => navigateToCity(e, city)}
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="ftr-bottom">
          <div className="ftr-bottom-inner">

            {/* Copyright */}
            <p className="ftr-copy">
              © 2024 DealKro. All rights reserved &nbsp;|&nbsp;
              <Link to="#" className="ftr-copy-link">Privacy Policy</Link>
              &nbsp;|&nbsp;
              <Link to="#" className="ftr-copy-link">Terms of Use</Link>
              &nbsp;|&nbsp;
              <Link to="#" className="ftr-copy-link">Help</Link>
            </p>

            {/* City pills (bottom) */}
            <div className="ftr-bottom-cities">
              {popularCities.map((city) => (
                <Link
                  key={city}
                  to="/"
                  className="ftr-bottom-city"
                  onClick={(e) => navigateToCity(e, city)}
                >
                  {city}
                </Link>
              ))}
            </div>

            {/* Social icons (bottom) */}
            <div className="ftr-bottom-social">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="ftr-bottom-social-btn">
                  <Icon size={14} />
                </a>
              ))}
            </div>

          </div>
        </div>

      </footer>
    </>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const footerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

  .ftr-root {
    font-family: 'DM Sans', sans-serif;
    background: #0F172A;
    color: #CBD5E1;
    border-top: 1px solid rgba(255,255,255,.06);
  }

  /* ── trust banner ── */
  .ftr-banner {
    background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%);
    border-bottom: 1px solid rgba(255,255,255,.08);
  }
  .ftr-banner-inner {
    max-width: 1200px; margin: 0 auto;
    padding: 16px 24px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
  }
  .ftr-banner-left { display: flex; align-items: center; gap: 12px; }
  .ftr-banner-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: rgba(255,255,255,.15);
    display: flex; align-items: center; justify-content: center;
    color: #fff; flex-shrink: 0;
  }
  .ftr-banner-title { font-size: 14px; font-weight: 600; color: #fff; margin: 0; }
  .ftr-banner-sub   { font-size: 11px; color: rgba(255,255,255,.75); margin: 0; }
  .ftr-banner-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px;
    background: #fff; color: #1D4ED8;
    border: none; border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    text-decoration: none; white-space: nowrap;
    transition: box-shadow .18s, transform .15s;
    box-shadow: 0 2px 8px rgba(0,0,0,.18);
  }
  .ftr-banner-btn:hover { box-shadow: 0 6px 18px rgba(0,0,0,.25); transform: translateY(-1px); color: #1D4ED8; text-decoration: none; }

  /* ── main grid ── */
  .ftr-main { max-width: 1200px; margin: 0 auto; padding: 56px 24px 48px; }
  .ftr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 36px 28px;
    align-items: start;
  }

  /* Brand */
  .ftr-brand { grid-column: span 2; }
  .ftr-logo  { height: 44px; width: auto; margin-bottom: 14px; border-radius: 8px; }
  .ftr-brand-tagline { font-size: 13px; color: #94A3B8; line-height: 1.65; margin: 0 0 18px; }
  .ftr-social-row { display: flex; gap: 8px; }
  .ftr-social-btn {
    width: 34px; height: 34px; border-radius: 8px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.08);
    display: flex; align-items: center; justify-content: center;
    color: #94A3B8; text-decoration: none;
    transition: background .15s, color .15s, transform .15s;
  }
  .ftr-social-btn:hover { background: rgba(255,255,255,.12); color: #fff; transform: translateY(-1px); }

  /* Columns */
  .ftr-col { min-width: 0; }
  .ftr-col-title {
    display: flex; align-items: center; gap: 7px;
    font-size: 11px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    color: #fff;
    margin: 0 0 16px;
  }

  /* Links */
  .ftr-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
  .ftr-link {
    display: flex; align-items: center; gap: 7px;
    padding: 5px 0;
    font-size: 13px; color: #94A3B8;
    text-decoration: none;
    transition: color .14s, transform .14s;
  }
  .ftr-link:hover { color: #fff; transform: translateX(2px); text-decoration: none; }
  .ftr-link-active { color: #60A5FA !important; font-weight: 500; }
  .ftr-link-accent { color: #60A5FA !important; font-weight: 600; margin-top: 4px; }
  .ftr-link-accent:hover { color: #93C5FD !important; }

  /* App buttons */
  .ftr-app-sub { font-size: 12px; color: #64748B; margin: 0 0 12px; }
  .ftr-app-btns { display: flex; flex-direction: column; gap: 8px; }
  .ftr-app-btn {
    display: block; padding: 10px 14px; border-radius: 10px;
    text-align: center; text-decoration: none;
    font-weight: 600; transition: transform .15s, box-shadow .15s;
    border: none;
  }
  .ftr-app-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.3); text-decoration: none; }
  .ftr-app-ios     { background: linear-gradient(135deg, #10B981, #059669); color: #fff; }
  .ftr-app-android { background: linear-gradient(135deg, #3B82F6, #2563EB); color: #fff; }
  .ftr-app-store-label { display: block; font-size: 12px; color: #fff; }
  .ftr-app-store-sub   { display: block; font-size: 10px; color: rgba(255,255,255,.75); }

  /* Cities block */
  .ftr-cities-col { grid-column: span 2; }
  .ftr-cities-grid { display: flex; flex-wrap: wrap; gap: 7px; }
  .ftr-city-pill {
    padding: 5px 12px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 20px;
    font-size: 11px; font-weight: 500;
    color: #94A3B8; text-decoration: none;
    transition: background .14s, color .14s, border-color .14s;
  }
  .ftr-city-pill:hover { background: rgba(255,255,255,.12); color: #fff; border-color: rgba(255,255,255,.18); text-decoration: none; }

  /* ── bottom bar ── */
  .ftr-bottom {
    border-top: 1px solid rgba(255,255,255,.06);
    background: rgba(0,0,0,.25);
  }
  .ftr-bottom-inner {
    max-width: 1200px; margin: 0 auto;
    padding: 18px 24px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 14px;
  }
  .ftr-copy { font-size: 11px; color: #475569; margin: 0; order: 3; }
  .ftr-copy-link { color: #60A5FA; text-decoration: none; font-weight: 500; }
  .ftr-copy-link:hover { color: #93C5FD; text-decoration: underline; }
  .ftr-bottom-cities { display: flex; flex-wrap: wrap; gap: 6px; order: 1; }
  .ftr-bottom-city {
    padding: 3px 10px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 20px;
    font-size: 10px; font-weight: 500;
    color: #64748B; text-decoration: none;
    transition: background .14s, color .14s;
  }
  .ftr-bottom-city:hover { background: rgba(255,255,255,.1); color: #fff; text-decoration: none; }
  .ftr-bottom-social { display: flex; gap: 6px; order: 2; }
  .ftr-bottom-social-btn {
    width: 30px; height: 30px; border-radius: 8px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.07);
    display: flex; align-items: center; justify-content: center;
    color: #64748B; text-decoration: none;
    transition: background .14s, color .14s, transform .14s;
  }
  .ftr-bottom-social-btn:hover { background: rgba(255,255,255,.12); color: #fff; transform: scale(1.1); }

  @media (max-width: 768px) {
    .ftr-brand      { grid-column: span 1; }
    .ftr-cities-col { grid-column: span 1; }
    .ftr-bottom-inner { flex-direction: column; align-items: flex-start; }
    .ftr-bottom-cities { order: 2; }
    .ftr-bottom-social { order: 3; }
    .ftr-copy { order: 4; }
  }
`;

export default Footer;