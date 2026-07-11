import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, MapPin, Tag, MessageCircle, Heart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl, placeholderImage } from '../utils/image';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(Boolean(product.isFavorited));
  const [favoriting, setFavoriting] = useState(false);

  const isNew =
    product.createdAt &&
    Date.parse(product.createdAt) > Date.now() - 24 * 60 * 60 * 1000;

  const imageUrl = getImageUrl(product?.images?.[0]);
  const categoryLabel = product.subCategory || product.category || '';

  const requireLogin = () => {
    if (user) return false;
    toast.error('Please login first');
    navigate('/login');
    return true;
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireLogin() || favoriting) return;
    setFavoriting(true);
    try {
      const { data } = await api.post('/favorites/toggle', { productId: product._id });
      setFavorited(data.data?.action === 'added');
      toast.success(data.message || 'Favorite updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update favorite');
    } finally {
      setFavoriting(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireLogin()) return;
    try {
      const { data } = await api.post(`/products/${product._id}/contact`);
      navigate(`/chats/${data.data.chat._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start chat');
    }
  };

  return (
    <>
      <style>{cardStyles}</style>

      <Link to={`/products/${product._id}`} className="pc-card">

        {/* ── Image ── */}
        <div className="pc-img-wrap">
          <img
            src={imageUrl}
            alt={product.title}
            className="pc-img"
            onError={(e) => { e.currentTarget.src = placeholderImage; }}
          />

          {isNew && <span className="pc-new-badge">NEW</span>}

          {product.status !== 'approved' && (
            <span className="pc-status-badge">
              {product.status === 'pending' ? 'Pending' : 'Rejected'}
            </span>
          )}

          {/* Hover overlay actions */}
          <div className="pc-overlay">
            <button
              onClick={handleFavorite}
              className={`pc-overlay-btn pc-overlay-btn--heart ${favorited ? 'pc-overlay-btn--heart-active' : ''}`}
              aria-label={favorited ? 'Remove from favourites' : 'Save to favourites'}
            >
              <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="pc-body">

          {/* Price + Category */}
          <div className="pc-top">
            <span className="pc-price">₹{product.price?.toLocaleString('en-IN')}</span>
            {categoryLabel && (
              <span className="pc-cat">
                <Tag size={10} />
                {categoryLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="pc-title">{product.title}</p>

          {/* Seller */}
          <div className="pc-seller">
            <div className="pc-seller__avatar">
              <User size={11} />
            </div>
            <span className="pc-seller__name">{product.user?.name || 'Seller'}</span>
          </div>

          {/* Meta row */}
          <div className="pc-meta">
            <span className="pc-meta__views">
              <Eye size={12} />
              {product.views || 0}
            </span>
            {product.condition && (
              <span className="pc-meta__condition">{product.condition}</span>
            )}
          </div>

          {/* Location */}
          {product.location && (
            <div className="pc-location">
              <MapPin size={12} />
              <span>{product.location}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pc-actions">
            <button
              onClick={handleFavorite}
              className={`pc-btn pc-btn--fav ${favorited ? 'pc-btn--fav-active' : ''}`}
              aria-label={favorited ? 'Remove from favourites' : 'Favourite'}
            >
              <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleChat} className="pc-btn pc-btn--chat">
              <MessageCircle size={14} />
              Chat
            </button>
          </div>

        </div>
      </Link>
    </>
  );
};

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const cardStyles = `
  :root {
    --pc-bg: #ffffff;
    --pc-bg-2: #faf9f7;
    --pc-border: #edeae5;
    --pc-accent: #d4571a;
    --pc-accent-hover: #b84816;
    --pc-accent-light: #fff4ef;
    --pc-text: #0f0e0c;
    --pc-text-2: #6b6860;
    --pc-text-3: #9c9890;
    --pc-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --pc-shadow-hover: 0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
    --pc-radius: 13px;
    --pc-radius-sm: 7px;
    --pc-radius-full: 999px;
    --pc-t: 0.18s cubic-bezier(0.4,0,0.2,1);
    --pc-font-display: 'Georgia','Times New Roman',serif;
  }

  /* ── Card ── */
  .pc-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    background: var(--pc-bg);
    border: 1px solid var(--pc-border);
    border-radius: var(--pc-radius);
    overflow: hidden;
    text-decoration: none;
    box-shadow: var(--pc-shadow);
    transition: box-shadow var(--pc-t), transform var(--pc-t), border-color var(--pc-t);
    position: relative;
  }
  .pc-card:hover {
    box-shadow: var(--pc-shadow-hover);
    transform: translateY(-3px);
    border-color: #d4cfc7;
  }

  /* ── Image ── */
  .pc-img-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 4/3;
    background: var(--pc-bg-2);
    overflow: hidden;
    flex-shrink: 0;
  }
  .pc-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    background: var(--pc-bg-2);
  }

  /* NEW badge */
  .pc-new-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #fff;
    background: var(--pc-accent);
    padding: 3px 8px;
    border-radius: var(--pc-radius-full);
    box-shadow: 0 2px 6px rgba(212,87,26,0.4);
    z-index: 2;
  }

  /* Status badge */
  .pc-status-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 9.5px;
    font-weight: 700;
    color: #92400e;
    background: #fffbeb;
    border: 1px solid #fde68a;
    padding: 3px 8px;
    border-radius: var(--pc-radius-full);
    z-index: 2;
  }

  /* Hover overlay */
  .pc-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%);
    opacity: 0;
    transition: opacity var(--pc-t);
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 8px;
    z-index: 1;
  }
  .pc-card:hover .pc-overlay { opacity: 1; }

  .pc-overlay-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background var(--pc-t), transform var(--pc-t);
  }
  .pc-overlay-btn--heart {
    background: rgba(255,255,255,0.92);
    color: var(--pc-accent);
    backdrop-filter: blur(4px);
  }
  .pc-overlay-btn--heart:hover {
    background: #fff;
    transform: scale(1.12);
  }
  .pc-overlay-btn--heart-active {
    color: #ef4444;
  }

  /* ── Body ── */
  .pc-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
    padding: 11px 13px 13px;
    gap: 5px;
  }

  /* Price + Category */
  .pc-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    gap: 6px;
  }
  .pc-price {
    font-family: var(--pc-font-display);
    font-size: 17px;
    font-weight: 700;
    color: var(--pc-accent);
    letter-spacing: -0.02em;
    line-height: 1;
    white-space: nowrap;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pc-cat {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    color: var(--pc-accent);
    background: var(--pc-accent-light);
    border: 1px solid #fddcc8;
    padding: 2px 7px;
    border-radius: var(--pc-radius-full);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90px;
    flex-shrink: 0;
    text-transform: capitalize;
  }

  /* Title */
  .pc-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--pc-text);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 36px;
  }

  /* Seller */
  .pc-seller {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 1px;
  }
  .pc-seller__avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--pc-bg-2);
    border: 1px solid var(--pc-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pc-text-3);
    flex-shrink: 0;
  }
  .pc-seller__name {
    font-size: 11.5px;
    color: var(--pc-text-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  /* Meta */
  .pc-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .pc-meta__views {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: var(--pc-text-3);
    font-weight: 500;
  }
  .pc-meta__condition {
    font-size: 10.5px;
    color: var(--pc-text-3);
    background: var(--pc-bg-2);
    border: 1px solid var(--pc-border);
    padding: 1px 7px;
    border-radius: var(--pc-radius-full);
    text-transform: capitalize;
    font-weight: 500;
  }

  /* Location */
  .pc-location {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11.5px;
    color: var(--pc-text-3);
    overflow: hidden;
  }
  .pc-location svg { flex-shrink: 0; color: var(--pc-accent); opacity: 0.7; }
  .pc-location span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  /* Actions */
  .pc-actions {
    display: flex;
    min-width: 0;
    gap: 6px;
    margin-top: auto;
    padding-top: 10px;
  }
  .pc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 700;
    border-radius: var(--pc-radius-sm);
    border: 1.5px solid transparent;
    cursor: pointer;
    transition: background var(--pc-t), color var(--pc-t), border-color var(--pc-t), transform var(--pc-t);
  }
  .pc-btn:hover { transform: translateY(-1px); }

  .pc-btn--fav {
    width: 34px;
    flex-shrink: 0;
    padding: 0;
    background: var(--pc-bg-2);
    color: var(--pc-text-2);
    border-color: var(--pc-border);
  }
  .pc-btn--fav:hover { background: #fff1f1; color: #ef4444; border-color: #fecaca; }
  .pc-btn--fav-active {
    background: #fff1f1;
    color: #ef4444;
    border-color: #fecaca;
  }

  .pc-btn--chat {
    min-width: 0;
    flex: 1;
    background: var(--pc-accent);
    color: #fff;
    border-color: var(--pc-accent);
    box-shadow: 0 2px 8px rgba(212,87,26,0.22);
  }
  .pc-btn--chat:hover { background: var(--pc-accent-hover); border-color: var(--pc-accent-hover); box-shadow: 0 3px 12px rgba(212,87,26,0.32); }

  @media (max-width: 420px) {
    .pc-body {
      padding: 9px 9px 10px;
      gap: 4px;
    }
    .pc-price {
      font-size: 15px;
    }
    .pc-cat {
      max-width: 58px;
      padding: 2px 5px;
      font-size: 9px;
    }
    .pc-title {
      font-size: 12px;
      min-height: 34px;
    }
    .pc-seller__name,
    .pc-location {
      font-size: 10.5px;
    }
    .pc-meta__condition {
      max-width: 62px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 1px 5px;
      font-size: 9.5px;
    }
    .pc-actions {
      gap: 5px;
      padding-top: 8px;
    }
    .pc-btn {
      min-height: 32px;
      padding: 6px 7px;
      font-size: 11px;
    }
    .pc-btn--fav {
      width: 32px;
    }
  }
`;

export default ProductCard;
