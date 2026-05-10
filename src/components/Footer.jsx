import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Facebook, Twitter, Instagram, Youtube, Plus, FileText, Shield, Download, Map, Link as LinkIcon } from 'lucide-react';
import { contentApi } from '../services/api';
import { cn } from '../utils';

const fallbackFooter = {
  brandName: 'DealKro',
  logoUrl: 'https://i.ibb.co/d4v1q3jZ/logo.jpg',
  tagline: 'Buy and sell locally.\nQuick, easy, safe.',
  trustTitle: 'Trusted by 10M+ users',
  trustSubtitle: "India's #1 buying & selling platform",
  bannerButtonText: 'Post Your Ad',
  bannerButtonPath: '/create-product',
  copyrightText: 'DealKro. All rights reserved',
  columns: [
    { title: 'Buy & Sell', links: [{ label: 'Post Free Ad', path: '/create-product' }, { label: 'My Ads', path: '/my-products' }, { label: 'Profile', path: '/profile' }] },
    { title: 'Browse', links: [{ label: 'All Categories', path: '/categories' }, { label: 'Search', path: '/search' }, { label: 'Favorites', path: '/favorites' }] },
    { title: 'Account', links: [{ label: 'Login', path: '/login' }, { label: 'Sign Up', path: '/register' }, { label: 'Messages', path: '/chats' }] },
    { title: 'Help', links: [{ label: 'Contact', path: '/contact' }, { label: 'Safety', path: '/safety' }, { label: 'Report Problem', path: '/report' }, { label: 'Support', path: '/support' }] },
  ],
  bottomLinks: [{ label: 'Privacy Policy', path: '/privacy' }, { label: 'Terms of Use', path: '/terms' }, { label: 'Help', path: '/help' }],
  popularCities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'],
  socialLinks: [{ label: 'Facebook', url: '#' }, { label: 'Twitter', url: '#' }, { label: 'Instagram', url: '#' }, { label: 'Youtube', url: '#' }],
  appButtons: [{ label: 'App Store', subLabel: 'iOS', url: '#' }, { label: 'Google Play', subLabel: 'Android', url: '#' }],
};

const socialIconMap = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
};

const getSocialIcon = (label = '') => socialIconMap[label.toLowerCase()] || LinkIcon;

const SmartLink = ({ item, className, children, onClick }) => {
  const target = item?.path || item?.url || '#';
  if (target.startsWith('http') || target.startsWith('mailto:') || target.startsWith('tel:') || target === '#') {
    return <a href={target} className={className} onClick={onClick}>{children}</a>;
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

const Footer = () => {
  const location = useLocation();
  const { data } = useQuery({
    queryKey: ['siteContent'],
    queryFn: contentApi.getSiteContent,
    staleTime: 5 * 60 * 1000,
  });
  const footer = { ...fallbackFooter, ...(data?.footer || {}) };

  return (
    <>
      <style>{footerStyles}</style>

      <footer className="ftr-root">
        <div className="ftr-banner">
          <div className="ftr-banner-inner">
            <div className="ftr-banner-left">
              <div className="ftr-banner-icon">
                <Shield size={18} />
              </div>
              <div>
                <p className="ftr-banner-title">{footer.trustTitle}</p>
                <p className="ftr-banner-sub">{footer.trustSubtitle}</p>
              </div>
            </div>
            <SmartLink item={{ path: footer.bannerButtonPath }} className="ftr-banner-btn">
              <Plus size={14} strokeWidth={2.5} />
              {footer.bannerButtonText}
            </SmartLink>
          </div>
        </div>

        <div className="ftr-main">
          <div className="ftr-grid">
            <div className="ftr-brand">
              {footer.logoUrl && <img src={footer.logoUrl} alt={footer.brandName} className="ftr-logo" />}
              <p className="ftr-brand-tagline">{String(footer.tagline || '').split('\n').map((line) => <span key={line}>{line}<br /></span>)}</p>
              <div className="ftr-social-row">
                {(footer.socialLinks || []).map((item) => {
                  const Icon = getSocialIcon(item.label);
                  return (
                    <SmartLink key={`${item.label}-${item.url}`} item={item} className="ftr-social-btn">
                      <Icon size={16} />
                    </SmartLink>
                  );
                })}
              </div>
            </div>

            {(footer.columns || []).map((column) => (
              <div className="ftr-col" key={column.title}>
                <h3 className="ftr-col-title">
                  <FileText size={14} />
                  {column.title}
                </h3>
                <ul className="ftr-list">
                  {(column.links || []).map((item) => (
                    <li key={`${column.title}-${item.label}-${item.path || item.url}`}>
                      <SmartLink
                        item={item}
                        className={cn('ftr-link', location.pathname === item.path && 'ftr-link-active')}
                      >
                        <LinkIcon size={13} />
                        {item.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {(footer.appButtons || []).length > 0 && (
              <div className="ftr-col">
                <h3 className="ftr-col-title">
                  <Download size={14} />
                  Download App
                </h3>
                <p className="ftr-app-sub">Buy &amp; sell on the go</p>
                <div className="ftr-app-btns">
                  {footer.appButtons.map((item, index) => (
                    <SmartLink key={`${item.label}-${item.url}`} item={item} className={`ftr-app-btn ${index % 2 ? 'ftr-app-android' : 'ftr-app-ios'}`}>
                      <span className="ftr-app-store-label">{item.label}</span>
                      <span className="ftr-app-store-sub">{item.subLabel}</span>
                    </SmartLink>
                  ))}
                </div>
              </div>
            )}

            {(footer.popularCities || []).length > 0 && (
              <div className="ftr-cities-col">
                <h3 className="ftr-col-title">
                  <Map size={14} />
                  Popular Cities
                </h3>
                <div className="ftr-cities-grid">
                  {footer.popularCities.map((city) => (
                    <Link key={city} to="/" className="ftr-city-pill" onClick={(event) => navigateToCity(event, city)}>
                      {city}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="ftr-bottom">
          <div className="ftr-bottom-inner">
            <p className="ftr-copy">
              © {new Date().getFullYear()} {footer.copyrightText}
              {(footer.bottomLinks || []).map((item) => (
                <span key={`${item.label}-${item.path}`}>
                  &nbsp;|&nbsp;
                  <SmartLink item={item} className="ftr-copy-link">{item.label}</SmartLink>
                </span>
              ))}
            </p>

            <div className="ftr-bottom-cities">
              {(footer.popularCities || []).map((city) => (
                <Link key={city} to="/" className="ftr-bottom-city" onClick={(event) => navigateToCity(event, city)}>
                  {city}
                </Link>
              ))}
            </div>

            <div className="ftr-bottom-social">
              {(footer.socialLinks || []).map((item) => {
                const Icon = getSocialIcon(item.label);
                return (
                  <SmartLink key={`${item.label}-bottom`} item={item} className="ftr-bottom-social-btn">
                    <Icon size={14} />
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

const footerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

  .ftr-root {
    font-family: 'DM Sans', sans-serif;
    background: #0F172A;
    color: #CBD5E1;
    border-top: 1px solid rgba(255,255,255,.06);
  }

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

  .ftr-main { max-width: 1200px; margin: 0 auto; padding: 56px 24px 48px; }
  .ftr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 36px 28px;
    align-items: start;
  }

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

  .ftr-col { min-width: 0; }
  .ftr-col-title {
    display: flex; align-items: center; gap: 7px;
    font-size: 11px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    color: #fff;
    margin: 0 0 16px;
  }

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
  .ftr-copy { font-size: 11px; color: #94A3B8; margin: 0; order: 3; }
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
