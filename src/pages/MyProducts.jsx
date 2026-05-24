import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit3, Eye, Clock, Package, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PRODUCT_STATUS } from '../utils';
import toast from 'react-hot-toast';
import { getImageUrl, placeholderImage } from '../utils/image';

const STATUS_CONFIG = {
  approved: { label: 'Live', cls: 'mp-badge--green' },
  pending: { label: 'Pending', cls: 'mp-badge--yellow' },
  rejected: { label: 'Rejected', cls: 'mp-badge--red' },
  paused: { label: 'Paused', cls: 'mp-badge--gray' },
  sold: { label: 'Sold', cls: 'mp-badge--blue' },
  suspicious: { label: 'Review', cls: 'mp-badge--red' },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Live' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'paused', label: 'Paused' },
  { key: 'sold', label: 'Sold' },
];

const getProductsPayload = (response) => {
  const payload = response?.data || {};
  return {
    products: Array.isArray(payload.data) ? payload.data : Array.isArray(payload.products) ? payload.products : [],
    pagination: payload.pagination || {},
  };
};

const formatProductDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Recently';
  return `${formatDistanceToNow(date)} ago`;
};

const MyProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const { data: productsData, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['myProducts', activeTab, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (activeTab !== 'all') params.set('status', activeTab);
      const res = await api.get(`/products/my-products?${params.toString()}`);
      return res.data;
    },
    enabled: !!user,
  });

  const { products, pagination } = getProductsPayload(productsData);
  const activeTabLabel = TABS.find((tab) => tab.key === activeTab)?.label || 'All';
  const totalCount = pagination.total ?? products.length;

  const deleteMutation = useMutation({
    mutationFn: (productId) => api.delete(`/products/${productId}`),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const handleDelete = (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId);
    }
  };

  return (
    <>
      <style>{mpStyles}</style>

      <div className="mp-page">
        <div className="mp-container">

          {/* ── Header ── */}
          <div className="mp-header">
            <div className="mp-header__left">
              <h1 className="mp-header__title">My Ads</h1>
              <p className="mp-header__sub">
                {isLoading
                  ? 'Loading your listings'
                  : `${totalCount} ${activeTabLabel.toLowerCase()} listing${totalCount !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="mp-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPage(1); }}
                  className={`mp-tab ${activeTab === tab.key ? 'mp-tab--active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link to="/create-product" className="mp-post-btn">
              <Plus size={16} />
              <span>Post New Ad</span>
            </Link>
          </div>

          {/* ── Empty State ── */}
          {error ? (
            <div className="mp-empty">
              <div className="mp-empty__icon">
                <Package size={30} />
              </div>
              <p className="mp-empty__title">Could not load your ads</p>
              <p className="mp-empty__sub">{error.response?.data?.message || error.message || 'Please try again.'}</p>
              <button type="button" onClick={() => refetch()} className="mp-empty__btn">
                Try Again
              </button>
            </div>
          ) : isLoading ? (
            <div className="mp-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="mp-skeleton">
                  <div className="mp-skeleton__img" />
                  <div className="mp-skeleton__body">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="mp-empty">
              <div className="mp-empty__icon">
                <Package size={30} />
              </div>
              <p className="mp-empty__title">
                {activeTab === 'all' ? 'No products yet' : `No ${activeTabLabel.toLowerCase()} ads`}
              </p>
              <p className="mp-empty__sub">
                {activeTab === 'all'
                  ? 'Start posting your first product to buy or sell locally.'
                  : `Ads with ${activeTabLabel.toLowerCase()} status will appear here.`}
              </p>
              {activeTab === 'all' && (
                <Link to="/create-product" className="mp-empty__btn">
                  <Plus size={15} />
                  Post Your First Ad
                </Link>
              )}
            </div>
          ) : (
            <>
              {isFetching && <div className="mp-refreshing">Refreshing listings...</div>}

              {/* ── Grid ── */}
              <div className="mp-grid">
                {products.map((product) => {
                  const status = product.status || 'pending';
                  const statusCfg = STATUS_CONFIG[status] || { label: status, cls: 'mp-badge--gray' };
                  return (
                    <div key={product._id} className="mp-card">

                      {/* Image */}
                      <div className="mp-card__img-wrap">
                        <img
                          src={getImageUrl(product.images?.[0])}
                          alt={product.title || 'Product'}
                          className="mp-card__img"
                          onError={(e) => { e.currentTarget.src = placeholderImage; }}
                        />
                        <span className={`mp-badge ${statusCfg.cls}`}>
                          {PRODUCT_STATUS[status] || statusCfg.label}
                        </span>
                        <div className="mp-card__views">
                          <Eye size={12} />
                          {product.views || 0}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="mp-card__body">
                        <h3 className="mp-card__title">{product.title || 'Untitled product'}</h3>

                        <div className="mp-card__meta">
                          <span className="mp-card__price">Rs {(Number(product.price) || 0).toLocaleString('en-IN')}</span>
                          <span className="mp-card__time">
                            <Clock size={12} />
                            {formatProductDate(product.createdAt)}
                          </span>
                        </div>

                        <div className="mp-card__info">
                          {product.location && <span className="mp-card__location">{product.location}</span>}
                          {product.category && <span className="mp-card__cat">{product.category?.name || product.category}</span>}
                        </div>

                        {/* Actions */}
                        <div className="mp-card__actions">
                          <Link
                            to={status === 'approved' ? `/products/${product._id}` : '#'}
                            className="mp-action-btn mp-action-btn--view"
                            onClick={(e) => {
                              if (status !== 'approved') {
                                e.preventDefault();
                                toast('This ad will be visible after admin approval.');
                              }
                            }}
                          >
                            <Eye size={14} />
                            View
                          </Link>
                          <Link
                            to={`/edit-product/${product._id}`}
                            className="mp-action-btn mp-action-btn--edit"
                          >
                            <Edit3 size={14} />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deleteMutation.isPending}
                            className="mp-action-btn mp-action-btn--delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Pagination ── */}
              {pagination.pages > 1 && (
                <div className="mp-pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="mp-page-btn"
                  >
                    ← Prev
                  </button>
                  <span className="mp-page-info">
                    Page <strong>{page}</strong> of <strong>{pagination.pages}</strong>
                    <span className="mp-page-total"> · {pagination.total} total</span>
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                    disabled={page === pagination.pages}
                    className="mp-page-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Footer Note ── */}
          <p className="mp-footer-note">
            New posts are reviewed for quality before going live.
          </p>

        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const mpStyles = `
  :root {
    --mp-bg: #f5f4f1;
    --mp-surface: #ffffff;
    --mp-surface-2: #faf9f7;
    --mp-border: #edeae5;
    --mp-accent: #d4571a;
    --mp-accent-hover: #b84816;
    --mp-accent-light: #fff4ef;
    --mp-green: #16a34a;
    --mp-green-bg: #f0fdf4;
    --mp-green-border: #bbf7d0;
    --mp-yellow: #92400e;
    --mp-yellow-bg: #fffbeb;
    --mp-yellow-border: #fde68a;
    --mp-red: #b91c1c;
    --mp-red-bg: #fff1f1;
    --mp-red-border: #fecaca;
    --mp-text: #0f0e0c;
    --mp-text-2: #6b6860;
    --mp-text-3: #9c9890;
    --mp-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04);
    --mp-shadow-md: 0 4px 16px rgba(0,0,0,0.08);
    --mp-radius: 14px;
    --mp-radius-sm: 9px;
    --mp-radius-full: 999px;
    --mp-t: 0.16s cubic-bezier(0.4,0,0.2,1);
    --mp-font-display: 'Georgia','Times New Roman',serif;
  }

  .mp-page {
    min-height: 100vh;
    background: var(--mp-bg);
    padding: 28px 0 64px;
  }

  .mp-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  @media (min-width: 640px)  { .mp-container { padding: 0 24px; } }
  @media (min-width: 1024px) { .mp-container { padding: 0 40px; } }

  /* ── Header ── */
  .mp-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .mp-header__left { flex: 1; min-width: 160px; }
  .mp-header__title {
    font-family: var(--mp-font-display);
    font-size: clamp(22px, 4vw, 30px);
    font-weight: 700;
    color: var(--mp-text);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 3px;
  }
  .mp-header__sub { font-size: 13px; color: var(--mp-text-3); font-weight: 500; }

  /* ── Tabs ── */
  .mp-tabs {
    display: flex;
    background: var(--mp-surface);
    border: 1px solid var(--mp-border);
    border-radius: var(--mp-radius-sm);
    padding: 3px;
    box-shadow: var(--mp-shadow);
    gap: 2px;
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .mp-tabs::-webkit-scrollbar { display: none; }

  .mp-tab {
    flex-shrink: 0;
    padding: 7px 14px;
    border-radius: 7px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--mp-text-2);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background var(--mp-t), color var(--mp-t), box-shadow var(--mp-t);
    white-space: nowrap;
  }
  .mp-tab:hover { background: var(--mp-surface-2); color: var(--mp-text); }
  .mp-tab--active {
    background: var(--mp-accent);
    color: #fff;
    box-shadow: 0 2px 8px rgba(212,87,26,0.25);
  }
  .mp-tab--active:hover { background: var(--mp-accent-hover); color: #fff; }

  /* ── Post Button ── */
  .mp-post-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    background: var(--mp-accent);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    border-radius: var(--mp-radius-sm);
    text-decoration: none;
    box-shadow: 0 2px 10px rgba(212,87,26,0.25);
    transition: background var(--mp-t), transform var(--mp-t), box-shadow var(--mp-t);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .mp-post-btn:hover {
    background: var(--mp-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(212,87,26,0.32);
  }

  /* ── Empty State ── */
  .mp-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 20px;
    background: var(--mp-surface);
    border: 1px solid var(--mp-border);
    border-radius: var(--mp-radius);
    text-align: center;
    box-shadow: var(--mp-shadow);
  }
  .mp-empty__icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--mp-surface-2);
    border: 1px solid var(--mp-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--mp-text-3);
    margin-bottom: 16px;
  }
  .mp-empty__title { font-size: 17px; font-weight: 700; color: var(--mp-text); margin-bottom: 5px; }
  .mp-empty__sub { font-size: 13px; color: var(--mp-text-3); margin-bottom: 20px; }
  .mp-empty__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 22px;
    background: var(--mp-accent);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    border-radius: var(--mp-radius-full);
    text-decoration: none;
    box-shadow: 0 2px 10px rgba(212,87,26,0.25);
    transition: background var(--mp-t), transform var(--mp-t);
  }
  .mp-empty__btn:hover { background: var(--mp-accent-hover); transform: translateY(-1px); }

  /* ── Grid ── */
  .mp-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }
  @media (min-width: 560px)  { .mp-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 900px)  { .mp-grid { grid-template-columns: repeat(3, 1fr); } }

  /* ── Card ── */
  .mp-card {
    background: var(--mp-surface);
    border: 1px solid var(--mp-border);
    border-radius: var(--mp-radius);
    overflow: hidden;
    box-shadow: var(--mp-shadow);
    transition: box-shadow var(--mp-t), transform var(--mp-t), border-color var(--mp-t);
  }
  .mp-card:hover {
    box-shadow: var(--mp-shadow-md);
    transform: translateY(-2px);
    border-color: #ddd9d3;
  }

  .mp-card__img-wrap {
    position: relative;
    aspect-ratio: 16/10;
    background: var(--mp-surface-2);
    overflow: hidden;
  }
  .mp-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  .mp-card:hover .mp-card__img { transform: scale(1.04); }

  /* Status Badge */
  .mp-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 10.5px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: var(--mp-radius-full);
    letter-spacing: 0.04em;
    border: 1px solid transparent;
  }
  .mp-badge--green  { background: var(--mp-green-bg);  color: var(--mp-green);  border-color: var(--mp-green-border);  }
  .mp-badge--yellow { background: var(--mp-yellow-bg); color: var(--mp-yellow); border-color: var(--mp-yellow-border); }
  .mp-badge--red    { background: var(--mp-red-bg);    color: var(--mp-red);    border-color: var(--mp-red-border);    }
  .mp-badge--gray   { background: #f5f4f1; color: var(--mp-text-3); border-color: var(--mp-border); }
  .mp-badge--blue   { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }

  .mp-refreshing {
    align-self: flex-start;
    border: 1px solid var(--mp-border);
    border-radius: var(--mp-radius-full);
    background: var(--mp-surface);
    padding: 6px 12px;
    color: var(--mp-text-3);
    font-size: 12px;
    font-weight: 700;
    box-shadow: var(--mp-shadow);
  }

  .mp-skeleton {
    overflow: hidden;
    border: 1px solid var(--mp-border);
    border-radius: var(--mp-radius);
    background: var(--mp-surface);
    box-shadow: var(--mp-shadow);
    animation: mp-pulse 1.35s ease-in-out infinite;
  }
  .mp-skeleton__img {
    aspect-ratio: 16/10;
    background: #edeae5;
  }
  .mp-skeleton__body {
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 14px 16px 16px;
  }
  .mp-skeleton__body span {
    height: 12px;
    border-radius: 999px;
    background: #edeae5;
  }
  .mp-skeleton__body span:nth-child(1) { width: 78%; }
  .mp-skeleton__body span:nth-child(2) { width: 54%; }
  .mp-skeleton__body span:nth-child(3) { width: 66%; }
  @keyframes mp-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.58; }
  }

  /* Views chip */
  .mp-card__views {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(0,0,0,0.55);
    color: #fff;
    font-size: 10.5px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: var(--mp-radius-full);
    backdrop-filter: blur(4px);
  }

  /* Card Body */
  .mp-card__body { padding: 14px 16px 16px; }

  .mp-card__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--mp-text);
    line-height: 1.35;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .mp-card__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }
  .mp-card__price {
    font-size: 18px;
    font-weight: 800;
    color: var(--mp-accent);
    letter-spacing: -0.02em;
    font-family: var(--mp-font-display);
  }
  .mp-card__time {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11.5px;
    color: var(--mp-text-3);
    font-weight: 500;
  }

  .mp-card__info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 14px;
  }
  .mp-card__location {
    font-size: 12px;
    color: var(--mp-text-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mp-card__cat {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--mp-text-3);
    background: var(--mp-surface-2);
    border: 1px solid var(--mp-border);
    padding: 2px 8px;
    border-radius: var(--mp-radius-full);
    white-space: nowrap;
    flex-shrink: 0;
    text-transform: capitalize;
  }

  /* Action Buttons */
  .mp-card__actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .mp-action-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 8px 10px;
    font-size: 12.5px;
    font-weight: 700;
    border-radius: var(--mp-radius-sm);
    border: 1.5px solid transparent;
    cursor: pointer;
    text-decoration: none;
    transition: background var(--mp-t), color var(--mp-t), border-color var(--mp-t), transform var(--mp-t);
  }
  .mp-action-btn:hover { transform: translateY(-1px); }
  .mp-action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .mp-action-btn--view {
    background: var(--mp-surface-2);
    color: var(--mp-text-2);
    border-color: var(--mp-border);
  }
  .mp-action-btn--view:hover { background: #f0eee9; color: var(--mp-text); border-color: #d4cfc7; }

  .mp-action-btn--edit {
    background: var(--mp-accent-light);
    color: var(--mp-accent);
    border-color: #fddcc8;
  }
  .mp-action-btn--edit:hover { background: #fde5d2; border-color: #f9c09b; }

  .mp-action-btn--delete {
    flex: 0 0 auto;
    padding: 8px 12px;
    background: var(--mp-red-bg);
    color: var(--mp-red);
    border-color: var(--mp-red-border);
  }
  .mp-action-btn--delete:hover { background: #fee2e2; border-color: #fca5a5; }

  /* ── Pagination ── */
  .mp-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    background: var(--mp-surface);
    border: 1px solid var(--mp-border);
    border-radius: var(--mp-radius);
    padding: 16px 24px;
    box-shadow: var(--mp-shadow);
    flex-wrap: wrap;
  }
  .mp-page-btn {
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 700;
    color: var(--mp-text-2);
    background: var(--mp-surface-2);
    border: 1.5px solid var(--mp-border);
    border-radius: var(--mp-radius-sm);
    cursor: pointer;
    transition: background var(--mp-t), color var(--mp-t), border-color var(--mp-t);
  }
  .mp-page-btn:hover:not(:disabled) { background: var(--mp-accent-light); color: var(--mp-accent); border-color: #fddcc8; }
  .mp-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .mp-page-info {
    font-size: 13px;
    color: var(--mp-text-2);
  }
  .mp-page-info strong { color: var(--mp-text); }
  .mp-page-total { color: var(--mp-text-3); }

  /* ── Footer Note ── */
  .mp-footer-note {
    text-align: center;
    font-size: 12px;
    color: var(--mp-text-3);
    padding-top: 4px;
  }
`;

export default MyProducts;
