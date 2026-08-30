import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Share2,
  Tag,
  ZoomIn,
  X,
} from 'lucide-react';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { PRODUCT_STATUS } from '../utils';
import { getImageUrl, placeholderImage } from '../utils/image';
import toast from 'react-hot-toast';

const formatPrice = (price) => `Rs. ${Number(price || 0).toLocaleString('en-IN')}`;

/* ─── Gallery ──────────────────────────────────────────────────────────── */
const Gallery = ({ images = [], title }) => {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const list = images.length ? images : [{ url: placeholderImage }];
  const hasMultiple = list.length > 1;
  const activeImage = getImageUrl(list[active]);

  const prev = () => setActive((i) => (i - 1 + list.length) % list.length);
  const next = () => setActive((i) => (i + 1) % list.length);

  return (
    <>
      <div className="pdp-gallery">
        <div className={`pdp-gallery__inner ${hasMultiple ? 'pdp-gallery__inner--split' : ''}`}>
          {hasMultiple && (
            <div className="pdp-gallery__thumbs">
              {list.map((img, i) => (
                <button
                  key={`${getImageUrl(img)}-side-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`pdp-gallery__thumb ${active === i ? 'pdp-gallery__thumb--active' : ''}`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt=""
                    onError={(e) => { e.currentTarget.src = placeholderImage; }}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="pdp-gallery__stage">
            <img
              src={activeImage}
              alt={title}
              className="pdp-gallery__main-img"
              onClick={() => setZoomed(true)}
              onError={(e) => { e.currentTarget.src = placeholderImage; }}
            />

            {hasMultiple && (
              <>
                <button type="button" onClick={prev} aria-label="Previous" className="pdp-gallery__nav pdp-gallery__nav--prev">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" onClick={next} aria-label="Next" className="pdp-gallery__nav pdp-gallery__nav--next">
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setZoomed(true)}
              className="pdp-gallery__zoom-badge"
            >
              <ZoomIn size={13} />
              <span>{active + 1} / {list.length}</span>
            </button>
          </div>
        </div>

        {hasMultiple && (
          <div className="pdp-gallery__strip">
            {list.map((img, i) => (
              <button
                key={`${getImageUrl(img)}-bot-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={`pdp-gallery__strip-thumb ${active === i ? 'pdp-gallery__strip-thumb--active' : ''}`}
              >
                <img
                  src={getImageUrl(img)}
                  alt=""
                  onError={(e) => { e.currentTarget.src = placeholderImage; }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {zoomed && (
        <div className="pdp-lightbox" onClick={() => setZoomed(false)}>
          <img
            src={activeImage}
            alt={title}
            className="pdp-lightbox__img"
            onError={(e) => { e.currentTarget.src = placeholderImage; }}
          />
          <button
            type="button"
            className="pdp-lightbox__close"
            onClick={() => setZoomed(false)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </>
  );
};

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="pdp-skeleton">
    <div className="pdp-skeleton__bar pdp-skeleton__bar--sm" />
    <div className="pdp-skeleton__grid">
      <div className="pdp-skeleton__col">
        <div className="pdp-skeleton__block pdp-skeleton__block--gallery" />
        <div className="pdp-skeleton__block pdp-skeleton__block--info" />
      </div>
      <div className="pdp-skeleton__col">
        <div className="pdp-skeleton__block pdp-skeleton__block--aside" />
        <div className="pdp-skeleton__block pdp-skeleton__block--aside-sm" />
      </div>
    </div>
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contactMethod, setContactMethod] = useState('message');
  const [wishlisted, setWishlisted] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((res) => res.data.data),
  });

  const { data: relatedProducts = [], isLoading: relatedLoading } = useQuery({
    queryKey: ['related-products', product?.category, id],
    enabled: Boolean(product?.category && id),
    queryFn: async () => {
      const params = new URLSearchParams({ category: product.category, limit: '8', page: '1' });
      const { data } = await api.get(`/products?${params}`);
      return (data.data?.products || []).filter((item) => item?._id && item._id !== id).slice(0, 4);
    },
  });

  const detailRows = useMemo(() => {
    if (!product) return [];
    return [
      { label: 'Category', value: product.category, icon: Layers },
      { label: 'Condition', value: product.condition, icon: Tag },
      { label: 'Location', value: product.location, icon: MapPin },
      {
        label: 'Posted',
        value: product.createdAt ? `${formatDistanceToNow(new Date(product.createdAt))} ago` : '',
        icon: CalendarDays,
      },
    ].filter((r) => r.value);
  }, [product]);

  const handleContact = async () => {
    const token = localStorage.getItem('token');
    if (!user || !token || token === 'undefined' || token === 'null') {
      toast.error('Please login to contact seller');
      navigate('/login');
      return;
    }
    if (contactMethod === 'message') {
      try {
        const { data } = await api.post(`/products/${id}/contact`);
        if (data.success) {
          toast.success('Chat started with seller');
          navigate(`/chats/${data.data.chat._id}`);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to start chat');
      }
      return;
    }
    toast.success('Phone number is visible below');
  };

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const locationCoords = useMemo(() => {
    if (!product?.locationCoords?.coordinates?.length) return null;
    const [lng, lat] = product.locationCoords.coordinates;
    return { lat, lng };
  }, [product]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.title, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    } catch {
      toast.error('Could not share this listing');
    }
  };

  if (isLoading) return <Skeleton />;

  if (error) return (
    <div className="pdp-error">
      <p className="pdp-error__msg">Failed to load listing</p>
      <Link to="/" className="pdp-error__link">← Back to listings</Link>
    </div>
  );

  if (!product) return (
    <div className="pdp-error">
      <p className="pdp-error__msg">Product not found</p>
    </div>
  );

  const isSold = product.status === 'sold';
  const statusLabel = PRODUCT_STATUS[product.status] || product.status;
  const sellerDisplayName = product.sellerName || product.user?.name || 'Seller';
  const sellerInitial = sellerDisplayName.trim().charAt(0).toUpperCase() || 'S';
  const postedLabel = product.createdAt ? `${formatDistanceToNow(new Date(product.createdAt))} ago` : 'Recently';

  return (
    <>
      <style>{`
        /* ── Reset & Base ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --pdp-bg: #f5f4f1;
          --pdp-surface: #ffffff;
          --pdp-surface-2: #faf9f7;
          --pdp-border: #e8e5df;
          --pdp-border-2: #d4cfc7;

          --pdp-text-primary: #0f0e0c;
          --pdp-text-secondary: #6b6860;
          --pdp-text-tertiary: #9c9890;

          --pdp-accent: #d4571a;
          --pdp-accent-light: #fff4ef;
          --pdp-accent-hover: #b84816;

          --pdp-green: #1a7a4a;
          --pdp-green-bg: #f0faf5;

          --pdp-red: #b91c1c;
          --pdp-red-bg: #fff1f1;

          --pdp-yellow-bg: #fffbeb;
          --pdp-yellow-border: #fde68a;
          --pdp-yellow-text: #92400e;

          --pdp-shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --pdp-shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
          --pdp-shadow-lg: 0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          --pdp-radius: 14px;
          --pdp-radius-sm: 8px;
          --pdp-radius-full: 999px;

          --pdp-font-display: 'Georgia', 'Times New Roman', serif;
          --pdp-font-body: 'system-ui', -apple-system, sans-serif;
          --pdp-transition: 0.18s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── Page Wrapper ── */
        .pdp-page {
          min-height: 100vh;
          background: var(--pdp-bg);
          padding: 28px 0 88px;
          font-family: var(--pdp-font-body);
          color: var(--pdp-text-primary);
        }

        .pdp-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 20px;
        }

        @media (min-width: 640px) { .pdp-container { padding: 0 32px; } }
        @media (min-width: 1024px) { .pdp-container { padding: 0 48px; } }

        /* ── Back Link ── */
        .pdp-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          color: var(--pdp-text-secondary);
          text-decoration: none;
          margin-bottom: 24px;
          transition: color var(--pdp-transition);
          letter-spacing: 0.01em;
        }
        .pdp-back:hover { color: var(--pdp-accent); }

        /* ── Main Grid ── */
        .pdp-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 1024px) {
          .pdp-grid {
            grid-template-columns: minmax(0,1fr) 360px;
            align-items: start;
          }
        }

        .pdp-main { display: flex; flex-direction: column; gap: 16px; }

        /* ── Gallery ── */
        .pdp-gallery {
          border-radius: var(--pdp-radius);
          border: 1px solid var(--pdp-border);
          background: var(--pdp-surface);
          overflow: hidden;
          box-shadow: var(--pdp-shadow-md);
        }

        .pdp-gallery__inner {
          display: grid;
          grid-template-columns: 1fr;
          background: var(--pdp-surface);
        }
        .pdp-gallery__inner--split {
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .pdp-gallery__inner--split {
            grid-template-columns: 88px minmax(0,1fr);
          }
        }

        .pdp-gallery__thumbs {
          display: none;
          flex-direction: column;
          gap: 6px;
          padding: 12px;
          border-right: 1px solid var(--pdp-border);
          overflow-y: auto;
          max-height: 580px;
          background: var(--pdp-surface-2);
        }
        @media (min-width: 768px) { .pdp-gallery__thumbs { display: flex; } }

        .pdp-gallery__thumb {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          border: 2px solid var(--pdp-border);
          overflow: hidden;
          cursor: pointer;
          transition: border-color var(--pdp-transition), opacity var(--pdp-transition), transform var(--pdp-transition);
          flex-shrink: 0;
          background: var(--pdp-bg);
        }
        .pdp-gallery__thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          background: var(--pdp-bg);
        }
        .pdp-gallery__thumb:hover { border-color: var(--pdp-accent); opacity: 1; }
        .pdp-gallery__thumb--active { border-color: var(--pdp-accent); box-shadow: 0 0 0 3px rgba(212,87,26,0.15); }

        .pdp-gallery__stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #faf9f7 0%, #f1eee8 100%);
          aspect-ratio: 4/3;
          min-height: 280px;
          max-height: 600px;
          overflow: hidden;
        }
        @media (min-width: 640px) { .pdp-gallery__stage { min-height: 400px; } }
        @media (min-width: 1024px) { .pdp-gallery__stage { aspect-ratio: 16/11; min-height: 500px; } }

        .pdp-gallery__main-img {
          display: block;
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          object-position: center;
          padding: 12px;
          cursor: zoom-in;
        }

        .pdp-gallery__nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.93);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--pdp-shadow-md);
          color: var(--pdp-text-primary);
          transition: background var(--pdp-transition), transform var(--pdp-transition);
          z-index: 2;
        }
        .pdp-gallery__nav:hover { background: #fff; transform: translateY(-50%) scale(1.08); }
        .pdp-gallery__nav--prev { left: 12px; }
        .pdp-gallery__nav--next { right: 12px; }

        .pdp-gallery__zoom-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.92);
          border: none;
          border-radius: var(--pdp-radius-full);
          padding: 5px 11px;
          font-size: 11px;
          font-weight: 700;
          color: var(--pdp-text-primary);
          cursor: pointer;
          box-shadow: var(--pdp-shadow-sm);
          letter-spacing: 0.02em;
          transition: background var(--pdp-transition);
        }
        .pdp-gallery__zoom-badge:hover { background: #fff; }

        .pdp-gallery__strip {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 10px 12px;
          border-top: 1px solid var(--pdp-border);
          background: var(--pdp-surface-2);
          scrollbar-width: none;
        }
        .pdp-gallery__strip::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) { .pdp-gallery__strip { display: none; } }

        .pdp-gallery__strip-thumb {
          width: 56px;
          height: 56px;
          flex-shrink: 0;
          border-radius: 7px;
          border: 2px solid var(--pdp-border);
          overflow: hidden;
          cursor: pointer;
          transition: border-color var(--pdp-transition);
          background: var(--pdp-bg);
        }
        .pdp-gallery__strip-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          background: var(--pdp-bg);
        }
        .pdp-gallery__strip-thumb--active { border-color: var(--pdp-accent); }

        /* ── Lightbox ── */
        .pdp-lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0,0,0,0.94);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          cursor: zoom-out;
          backdrop-filter: blur(6px);
          animation: pdp-fade-in 0.2s ease;
        }
        @keyframes pdp-fade-in { from { opacity: 0 } to { opacity: 1 } }
        .pdp-lightbox__img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 10px;
          box-shadow: var(--pdp-shadow-lg);
        }
        .pdp-lightbox__close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          transition: background var(--pdp-transition);
        }
        .pdp-lightbox__close:hover { background: rgba(255,255,255,0.22); }

        /* ── Card (shared surface style) ── */
        .pdp-card {
          background: var(--pdp-surface);
          border: 1px solid var(--pdp-border);
          border-radius: var(--pdp-radius);
          box-shadow: var(--pdp-shadow-sm);
          overflow: hidden;
        }

        /* ── Hero Info Card ── */
        .pdp-hero {
          padding: 22px 24px;
        }
        .pdp-highlights {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          padding: 14px;
        }
        @media (min-width: 640px) {
          .pdp-highlights { grid-template-columns: repeat(3, minmax(0,1fr)); }
        }
        .pdp-highlight {
          display: flex;
          min-width: 0;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid var(--pdp-border);
          border-radius: 12px;
          background: var(--pdp-surface-2);
          padding: 12px;
        }
        .pdp-highlight svg {
          flex-shrink: 0;
          color: var(--pdp-accent);
          margin-top: 1px;
        }
        .pdp-highlight strong {
          display: block;
          color: var(--pdp-text-primary);
          font-size: 12.5px;
          font-weight: 800;
          line-height: 1.25;
        }
        .pdp-highlight span {
          display: block;
          margin-top: 2px;
          color: var(--pdp-text-tertiary);
          font-size: 11.5px;
          font-weight: 600;
          line-height: 1.35;
        }
        .pdp-hero__meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .pdp-hero__tag {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--pdp-accent);
          background: var(--pdp-accent-light);
          border-radius: var(--pdp-radius-full);
          padding: 4px 12px;
        }
        .pdp-hero__meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--pdp-text-tertiary);
          font-weight: 500;
        }
        .pdp-hero__top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .pdp-hero__location {
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--pdp-text-secondary);
          background: rgba(43, 106, 77, 0.08);
          border: 1px solid rgba(43, 106, 77, 0.16);
          border-radius: 999px;
          padding: 8px 12px;
          max-width: fit-content;
          line-height: 1.4;
        }
        .pdp-hero__location svg {
          color: var(--pdp-accent);
          flex-shrink: 0;
        }
        .pdp-hero__title {
          font-family: var(--pdp-font-display);
          font-size: clamp(22px, 4vw, 36px);
          font-weight: 700;
          line-height: 1.2;
          color: var(--pdp-text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .pdp-hero__price {
          margin-top: 10px;
          font-size: clamp(26px, 5vw, 38px);
          font-weight: 800;
          color: var(--pdp-accent);
          letter-spacing: -0.03em;
          font-family: var(--pdp-font-display);
        }
        .pdp-hero__location {
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--pdp-text-secondary);
          background: rgba(212, 87, 26, 0.08);
          border: 1px solid rgba(212, 87, 26, 0.18);
          border-radius: 999px;
          padding: 9px 14px;
          max-width: fit-content;
        }
        .pdp-hero__location svg {
          color: var(--pdp-accent);
          flex-shrink: 0;
        }
        .pdp-hero__actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .pdp-icon-btn {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1.5px solid var(--pdp-border);
          background: var(--pdp-surface);
          color: var(--pdp-text-secondary);
          cursor: pointer;
          transition: all var(--pdp-transition);
        }
        .pdp-icon-btn:hover { border-color: var(--pdp-accent); color: var(--pdp-accent); background: var(--pdp-accent-light); }
        .pdp-icon-btn--active { border-color: #fca5a5; background: #fff1f1; color: #ef4444; }
        .pdp-icon-btn--active svg { fill: #ef4444; }

        .pdp-status-banner {
          margin-top: 16px;
          padding: 10px 14px;
          border-radius: var(--pdp-radius-sm);
          border: 1px solid var(--pdp-yellow-border);
          background: var(--pdp-yellow-bg);
          font-size: 13px;
          font-weight: 600;
          color: var(--pdp-yellow-text);
        }

        /* ── Divider ── */
        .pdp-divider {
          height: 1px;
          background: var(--pdp-border);
          margin: 0;
        }

        /* ── Description + Details Row ── */
        .pdp-info-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .pdp-info-row { grid-template-columns: minmax(0,1fr) 300px; }
        }

        .pdp-desc { padding: 22px 24px; }
        .pdp-desc__heading {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--pdp-text-tertiary);
          margin-bottom: 12px;
        }
        .pdp-desc__body {
          font-size: 14px;
          line-height: 1.85;
          color: var(--pdp-text-secondary);
          white-space: pre-line;
        }

        .pdp-details { padding: 22px 24px; }
        .pdp-details__heading {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--pdp-text-tertiary);
          margin-bottom: 12px;
        }
        .pdp-details__list { display: flex; flex-direction: column; }
        .pdp-details__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid var(--pdp-border);
        }
        .pdp-details__row:last-child { border-bottom: none; }
        .pdp-details__label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: var(--pdp-text-secondary);
        }
        .pdp-details__value {
          font-size: 13px;
          font-weight: 600;
          color: var(--pdp-text-primary);
          text-align: right;
          text-transform: capitalize;
          max-width: 55%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Safety Banner ── */
        .pdp-safety {
          border-radius: var(--pdp-radius);
          border: 1px solid #fed7aa;
          background: linear-gradient(135deg, #fff7ed 0%, #fff4e8 100%);
          padding: 18px 20px;
          display: flex;
          gap: 14px;
        }
        .pdp-safety__icon { flex-shrink: 0; color: var(--pdp-accent); margin-top: 1px; }
        .pdp-safety__title { font-weight: 700; color: #9a3412; font-size: 14px; margin-bottom: 8px; }
        .pdp-safety__tips {
          display: grid;
          grid-template-columns: 1fr;
          gap: 5px;
        }
        @media (min-width: 640px) { .pdp-safety__tips { grid-template-columns: repeat(3, 1fr); } }
        .pdp-safety__tip {
          font-size: 12.5px;
          color: #b45309;
          display: flex;
          align-items: flex-start;
          gap: 5px;
        }
        .pdp-safety__tip::before {
          content: '•';
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ── Aside ── */
        .pdp-aside {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .pdp-aside { position: sticky; top: 20px; }
        }

        .pdp-sold-banner {
          border-radius: var(--pdp-radius);
          border: 1px solid #fecaca;
          background: var(--pdp-red-bg);
          padding: 12px 16px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: var(--pdp-red);
          letter-spacing: 0.01em;
        }

        /* ── Seller Card ── */
        .pdp-seller { padding: 22px 22px 18px; }
        .pdp-seller__label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--pdp-text-tertiary);
          margin-bottom: 16px;
        }
        .pdp-seller__profile {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }
        .pdp-seller__avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--pdp-text-primary), #3b342c);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 20px;
          font-weight: 900;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }
        .pdp-seller__name {
          font-size: 17px;
          font-weight: 800;
          color: var(--pdp-text-primary);
          letter-spacing: -0.01em;
          font-family: var(--pdp-font-display);
          margin-bottom: 4px;
          line-height: 1.2;
        }
        .pdp-seller__verified {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--pdp-green);
        }
        .pdp-seller__facts {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 8px;
          margin: 14px 0 16px;
        }
        .pdp-seller__fact {
          min-width: 0;
          border: 1px solid var(--pdp-border);
          border-radius: 10px;
          background: var(--pdp-surface-2);
          padding: 9px 8px;
          text-align: center;
        }
        .pdp-seller__fact strong {
          display: block;
          color: var(--pdp-text-primary);
          font-size: 12px;
          font-weight: 900;
          line-height: 1.2;
        }
        .pdp-seller__fact span {
          display: block;
          margin-top: 2px;
          color: var(--pdp-text-tertiary);
          font-size: 10.5px;
          font-weight: 700;
          line-height: 1.2;
        }
        .pdp-map-card {
          padding: 22px 24px;
          margin-top: 20px;
        }
        .pdp-map-heading {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--pdp-text-tertiary);
          margin-bottom: 12px;
        }
        .pdp-map-frame {
          width: 100%;
          height: 280px;
          border-radius: 16px;
          overflow: hidden;
        }
        .pdp-map-empty {
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--pdp-text-secondary);
          background: var(--pdp-surface-2);
          border: 1px solid var(--pdp-border);
          border-radius: 16px;
          padding: 24px;
        }
        .pdp-seller__location {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          background: var(--pdp-surface-2);
          border: 1px solid var(--pdp-border);
          border-radius: var(--pdp-radius-sm);
          padding: 9px 12px;
          font-size: 13px;
          color: var(--pdp-text-secondary);
          margin-bottom: 16px;
        }

        /* ── Contact Toggle ── */
        .pdp-contact-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 10px;
        }
        .pdp-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          border-radius: var(--pdp-radius-sm);
          border: 1.5px solid var(--pdp-border);
          background: var(--pdp-surface);
          font-size: 13px;
          font-weight: 700;
          color: var(--pdp-text-secondary);
          cursor: pointer;
          transition: all var(--pdp-transition);
        }
        .pdp-toggle-btn:hover { border-color: var(--pdp-accent); color: var(--pdp-accent); }
        .pdp-toggle-btn--active {
          border-color: var(--pdp-accent);
          background: var(--pdp-accent-light);
          color: var(--pdp-accent);
        }

        /* ── CTA Button ── */
        .pdp-cta {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          border-radius: var(--pdp-radius-sm);
          border: none;
          background: var(--pdp-accent);
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: background var(--pdp-transition), transform var(--pdp-transition), box-shadow var(--pdp-transition);
          box-shadow: 0 2px 12px rgba(212,87,26,0.28);
          margin-bottom: 10px;
        }
        .pdp-cta:hover:not(:disabled) {
          background: var(--pdp-accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(212,87,26,0.36);
        }
        .pdp-cta:active:not(:disabled) { transform: translateY(0); }
        .pdp-cta:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
        .pdp-contact-note {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          color: var(--pdp-text-tertiary);
          font-size: 11.5px;
          font-weight: 600;
          line-height: 1.45;
          margin-top: 2px;
        }
        .pdp-contact-note svg {
          color: var(--pdp-green);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .pdp-phone-reveal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: var(--pdp-radius-sm);
          border: 1.5px solid #fed7aa;
          background: var(--pdp-accent-light);
          color: var(--pdp-accent);
          font-size: 16px;
          font-weight: 800;
          text-decoration: none;
          transition: background var(--pdp-transition);
          letter-spacing: -0.01em;
        }
        .pdp-phone-reveal:hover { background: #ffe9d9; }

        /* ── Ad ID ── */
        .pdp-adid { padding: 16px 20px; }
        .pdp-adid__label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--pdp-text-tertiary);
          margin-bottom: 6px;
        }
        .pdp-adid__value {
          font-family: 'ui-monospace', 'Cascadia Code', 'Fira Code', monospace;
          font-size: 11px;
          color: var(--pdp-text-secondary);
          word-break: break-all;
          line-height: 1.6;
        }
        .pdp-mobile-contact {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          gap: 12px;
          border-top: 1px solid var(--pdp-border);
          background: rgba(255,255,255,0.96);
          box-shadow: 0 -8px 24px rgba(15,14,12,0.10);
          padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
          backdrop-filter: blur(10px);
        }
        .pdp-mobile-contact__price {
          min-width: 0;
          flex: 1;
        }
        .pdp-mobile-contact__price strong {
          display: block;
          color: var(--pdp-accent);
          font-size: 16px;
          font-weight: 900;
          line-height: 1.1;
        }
        .pdp-mobile-contact__price span {
          display: block;
          overflow: hidden;
          color: var(--pdp-text-tertiary);
          font-size: 11px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pdp-mobile-contact__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 42px;
          border: 0;
          border-radius: 10px;
          background: var(--pdp-accent);
          color: #fff;
          cursor: pointer;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 900;
        }
        .pdp-mobile-contact__btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        @media (min-width: 1024px) {
          .pdp-page { padding-bottom: 60px; }
          .pdp-mobile-contact { display: none; }
        }

        /* ── Related ── */
        .pdp-related { margin-top: 48px; }
        .pdp-related__header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }
        .pdp-related__title {
          font-family: var(--pdp-font-display);
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 700;
          color: var(--pdp-text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 3px;
        }
        .pdp-related__sub {
          font-size: 13px;
          color: var(--pdp-text-tertiary);
        }
        .pdp-related__link {
          font-size: 13px;
          font-weight: 700;
          color: var(--pdp-accent);
          text-decoration: none;
          white-space: nowrap;
          display: none;
        }
        @media (min-width: 640px) { .pdp-related__link { display: inline; } }
        .pdp-related__link:hover { color: var(--pdp-accent-hover); }

        .pdp-related__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 480px) { .pdp-related__grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .pdp-related__grid { grid-template-columns: repeat(4, 1fr); } }

        .pdp-related__skeleton {
          height: 300px;
          border-radius: var(--pdp-radius);
          background: var(--pdp-surface);
          animation: pdp-pulse 1.5s ease-in-out infinite;
        }
        @keyframes pdp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }

        .pdp-related__empty {
          border-radius: var(--pdp-radius);
          border: 1.5px dashed var(--pdp-border-2);
          background: var(--pdp-surface);
          padding: 40px 20px;
          text-align: center;
          font-size: 13px;
          color: var(--pdp-text-tertiary);
        }

        /* ── Skeleton ── */
        .pdp-skeleton {
          min-height: 100vh;
          background: var(--pdp-bg);
          padding: 28px 20px 60px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .pdp-skeleton__bar {
          border-radius: 99px;
          background: #e5e2dc;
          animation: pdp-pulse 1.5s infinite;
          margin-bottom: 24px;
        }
        .pdp-skeleton__bar--sm { height: 14px; width: 120px; }
        .pdp-skeleton__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 1024px) { .pdp-skeleton__grid { grid-template-columns: 1fr 360px; } }
        .pdp-skeleton__col { display: flex; flex-direction: column; gap: 16px; }
        .pdp-skeleton__block {
          border-radius: var(--pdp-radius);
          background: #e5e2dc;
          animation: pdp-pulse 1.5s infinite;
        }
        .pdp-skeleton__block--gallery { height: 400px; }
        .pdp-skeleton__block--info { height: 160px; }
        .pdp-skeleton__block--aside { height: 280px; }
        .pdp-skeleton__block--aside-sm { height: 80px; }

        /* ── Error State ── */
        .pdp-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 12px;
          text-align: center;
          background: var(--pdp-bg);
        }
        .pdp-error__msg { font-weight: 600; color: #ef4444; font-size: 15px; }
        .pdp-error__link { font-size: 13px; font-weight: 700; color: var(--pdp-accent); text-decoration: none; }
        .pdp-error__link:hover { text-decoration: underline; }
      `}</style>

      <div className="pdp-page">
        <div className="pdp-container">
          <Link to="/" className="pdp-back">
            <ArrowLeft size={16} />
            Back to listings
          </Link>

          <div className="pdp-grid">
            {/* ── Left Column ── */}
            <div className="pdp-main">
              <Gallery images={product.images} title={product.title} />

              {/* Hero Info */}
              <div className="pdp-card pdp-hero">
                <div className="pdp-hero__meta">
                  {product.condition && (
                    <span className="pdp-hero__tag">{product.condition}</span>
                  )}
                  <span className="pdp-hero__meta-item">
                    <Eye size={13} />
                    {product.views || 0} views
                  </span>
                  {product.createdAt && (
                    <span className="pdp-hero__meta-item">
                      {formatDistanceToNow(new Date(product.createdAt))} ago
                    </span>
                  )}
                </div>

                <div className="pdp-hero__top">
                  <div>
                    <h1 className="pdp-hero__title">{product.title}</h1>
                    <p className="pdp-hero__price">{formatPrice(product.price)}</p>
                    {product.location && (
                      <div className="pdp-hero__location">
                        <MapPin size={16} />
                        <span>{product.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="pdp-hero__actions">
                    <button
                      type="button"
                      onClick={() => setWishlisted((v) => !v)}
                      aria-label="Save listing"
                      className={`pdp-icon-btn ${wishlisted ? 'pdp-icon-btn--active' : ''}`}
                    >
                      <Heart size={19} />
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      aria-label="Share listing"
                      className="pdp-icon-btn"
                    >
                      <Share2 size={19} />
                    </button>
                  </div>
                </div>

                {product.status && product.status !== 'approved' && (
                  <div className="pdp-status-banner">Status: {statusLabel}</div>
                )}
              </div>

              <div className="pdp-card pdp-highlights" aria-label="Listing highlights">
                <div className="pdp-highlight">
                  <BadgeCheck size={18} />
                  <div>
                    <strong>Verified seller profile</strong>
                    <span>Contact through BuySellAdda chat before you meet.</span>
                  </div>
                </div>
                <div className="pdp-highlight">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>Buyer safety first</strong>
                    <span>Inspect the item and meet in a public location.</span>
                  </div>
                </div>
                <div className="pdp-highlight">
                  <CalendarDays size={18} />
                  <div>
                    <strong>Posted {postedLabel}</strong>
                    <span>{product.views || 0} people viewed this listing.</span>
                  </div>
                </div>
              </div>

              {/* Description + Details */}
              <div className="pdp-info-row">
                <div className="pdp-card pdp-desc">
                  <p className="pdp-desc__heading">Description</p>
                  <p className="pdp-desc__body">
                    {product.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pdp-card pdp-details">
                  <p className="pdp-details__heading">Details</p>
                  <div className="pdp-details__list">
                    {detailRows.map(({ label, value, icon: Icon }) => (
                      <div key={label} className="pdp-details__row">
                        <span className="pdp-details__label">
                          <Icon size={15} />
                          {label}
                        </span>
                        <span className="pdp-details__value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pdp-card pdp-map-card">
                <p className="pdp-map-heading">Location on map</p>
                {locationCoords && googleMapsApiKey ? (
                  <LoadScript googleMapsApiKey={googleMapsApiKey}>
                    <GoogleMap
                      mapContainerClassName="pdp-map-frame"
                      center={locationCoords}
                      zoom={13}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                      }}
                    >
                      <Marker position={locationCoords} />
                    </GoogleMap>
                  </LoadScript>
                ) : (
                  <div className="pdp-map-empty">
                    {product.location ? (
                      <>
                        Map coordinates are not available for this listing. The address is shown above.
                      </>
                    ) : (
                      'Location information is not available for this listing.'
                    )}
                  </div>
                )}
              </div>

              {/* Safety */}
              <div className="pdp-safety">
                <ShieldCheck size={22} className="pdp-safety__icon" />
                <div>
                  <p className="pdp-safety__title">Stay safe while buying</p>
                  <div className="pdp-safety__tips">
                    <span className="pdp-safety__tip">Meet in a public place</span>
                    <span className="pdp-safety__tip">Inspect before paying</span>
                    <span className="pdp-safety__tip">Avoid advance transfers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Aside ── */}
            <div className="pdp-aside">
              {isSold && (
                <div className="pdp-sold-banner">This item has already been sold</div>
              )}

              {/* Seller Card */}
              <div className="pdp-card pdp-seller">
                <p className="pdp-seller__label">Seller</p>

                <div className="pdp-seller__profile">
                  <div className="pdp-seller__avatar">
                    {sellerInitial}
                  </div>
                  <div>
                    <p className="pdp-seller__name">
                      {sellerDisplayName}
                    </p>
                    <span className="pdp-seller__verified">
                      <BadgeCheck size={13} />
                      Verified profile
                    </span>
                  </div>
                </div>

                <div className="pdp-seller__facts" aria-label="Seller trust summary">
                  <div className="pdp-seller__fact">
                    <strong>Private</strong>
                    <span>seller</span>
                  </div>
                  <div className="pdp-seller__fact">
                    <strong>Secure</strong>
                    <span>chat</span>
                  </div>
                  <div className="pdp-seller__fact">
                    <strong>{product.views || 0}</strong>
                    <span>views</span>
                  </div>
                </div>

                {product.location && (
                  <div className="pdp-seller__location">
                    <MapPin size={14} style={{ color: 'var(--pdp-accent)', flexShrink: 0, marginTop: 1 }} />
                    <span>{product.location}</span>
                  </div>
                )}

                <div className="pdp-contact-toggle">
                  <button
                    type="button"
                    onClick={() => setContactMethod('message')}
                    className={`pdp-toggle-btn ${contactMethod === 'message' ? 'pdp-toggle-btn--active' : ''}`}
                  >
                    <MessageCircle size={16} />
                    Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod('phone')}
                    className={`pdp-toggle-btn ${contactMethod === 'phone' ? 'pdp-toggle-btn--active' : ''}`}
                  >
                    <Phone size={16} />
                    Call
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleContact}
                  disabled={isSold}
                  className="pdp-cta"
                >
                  {contactMethod === 'phone' ? <Phone size={17} /> : <Mail size={17} />}
                  {contactMethod === 'phone' ? 'Show phone number' : 'Message seller'}
                </button>

                <div className="pdp-contact-note">
                  <ShieldCheck size={14} />
                  <span>For a safer deal, chat first and avoid advance payments before inspection.</span>
                </div>

                {product.phone && contactMethod === 'phone' && user && (
                  <a href={`tel:${product.phone}`} className="pdp-phone-reveal">
                    <Phone size={17} />
                    {product.phone}
                  </a>
                )}
              </div>

              {/* Ad ID */}
              <div className="pdp-card pdp-adid">
                <p className="pdp-adid__label">Ad ID</p>
                <p className="pdp-adid__value">{product._id}</p>
              </div>
            </div>
          </div>

          {/* ── Related ── */}
          <section className="pdp-related">
            <div className="pdp-related__header">
              <div>
                <h2 className="pdp-related__title">Related ads</h2>
                <p className="pdp-related__sub">More from {product.category || 'this category'}</p>
              </div>
              {product.category && (
                <Link
                  to={`/?category=${encodeURIComponent(product.category)}`}
                  className="pdp-related__link"
                >
                  View all →
                </Link>
              )}
            </div>

            {relatedLoading ? (
              <div className="pdp-related__grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="pdp-related__skeleton" />
                ))}
              </div>
            ) : relatedProducts.length > 0 ? (
              <div className="pdp-related__grid">
                {relatedProducts.map((related) => (
                  <ProductCard key={related._id} product={related} />
                ))}
              </div>
            ) : (
              <div className="pdp-related__empty">No related ads found right now.</div>
            )}
          </section>
        </div>
      </div>

      <div className="pdp-mobile-contact">
        <div className="pdp-mobile-contact__price">
          <strong>{formatPrice(product.price)}</strong>
          <span>{product.title}</span>
        </div>
        <button
          type="button"
          onClick={handleContact}
          disabled={isSold}
          className="pdp-mobile-contact__btn"
        >
          <MessageCircle size={16} />
          Contact
        </button>
      </div>
    </>
  );
};

export default ProductDetail;
