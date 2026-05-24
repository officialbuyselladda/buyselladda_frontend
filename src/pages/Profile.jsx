import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Package, MessageCircle, Edit, LogOut, Shield, Eye, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['profileStats'],
    queryFn: () => api.get('/users/profile-stats').then(res => res.data.data),
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <>
      <style>{profileStyles}</style>

      <div className="prf-page">
        <div className="prf-container">

          {/* ── Hero Card ── */}
          <div className="prf-hero">
            <div className="prf-hero__avatar">
              <User size={38} />
            </div>
            <div className="prf-hero__info">
              <h1 className="prf-hero__name">{user.name}</h1>
              <p className="prf-hero__email">{user.email}</p>
              <div className="prf-hero__meta">
                <span className="prf-hero__since">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
                {user.phone && (
                  <span className="prf-hero__phone">📞 {user.phone}</span>
                )}
                {user.role === 'admin' && (
                  <span className="prf-hero__admin-badge">
                    <Shield size={12} /> Admin
                  </span>
                )}
              </div>
            </div>
            <Link to="/profile/edit" className="prf-hero__edit-btn">
              <Edit size={15} />
              <span>Edit Profile</span>
            </Link>
          </div>

          {/* ── Stats ── */}
          <div className="prf-stats">
            {[
              { icon: Package, value: stats?.totalProducts ?? 0, label: 'Ads Posted', color: 'accent' },
              { icon: Package, value: stats?.approvedProducts ?? 0, label: 'Live Listings', color: 'green' },
              { icon: MessageCircle, value: stats?.totalChats ?? 0, label: 'Messages', color: 'blue' },
              { icon: Eye, value: stats?.totalViews ?? 0, label: 'Total Views', color: 'purple' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className={`prf-stat prf-stat--${color}`}>
                <div className="prf-stat__icon">
                  <Icon size={20} />
                </div>
                <div className="prf-stat__num">{value.toLocaleString('en-IN')}</div>
                <div className="prf-stat__label">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Bottom Row ── */}
          <div className="prf-bottom">

            {/* Quick Actions */}
            <div className="prf-actions">
              <p className="prf-section-label">Quick Actions</p>
              <div className="prf-actions__grid">
                {[
                  { to: '/create-product', icon: Plus, label: 'Post New Ad', accent: true },
                  { to: '/my-products', icon: Package, label: 'My Ads' },
                  { to: '/chats', icon: MessageCircle, label: 'Messages' },
                ].map(({ to, icon: Icon, label, accent }) => (
                  <Link key={to} to={to} className={`prf-action-item ${accent ? 'prf-action-item--accent' : ''}`}>
                    <div className="prf-action-item__icon">
                      <Icon size={18} />
                    </div>
                    <span className="prf-action-item__label">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account */}
            <div className="prf-account">
              <p className="prf-section-label">Account</p>
              <div className="prf-account__list">
                <Link to="/profile/edit" className="prf-account__item">
                  <div className="prf-account__item-icon">
                    <Edit size={16} />
                  </div>
                  <span>Edit Profile</span>
                  <span className="prf-account__item-arrow">→</span>
                </Link>

                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="prf-account__item prf-account__item--admin">
                    <div className="prf-account__item-icon prf-account__item-icon--admin">
                      <Shield size={16} />
                    </div>
                    <span>Admin Panel</span>
                    <span className="prf-account__item-arrow">→</span>
                  </Link>
                )}

                <button onClick={logout} className="prf-account__item prf-account__item--logout">
                  <div className="prf-account__item-icon prf-account__item-icon--logout">
                    <LogOut size={16} />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const profileStyles = `
  :root {
    --prf-bg: #f5f4f1;
    --prf-surface: #ffffff;
    --prf-surface-2: #faf9f7;
    --prf-border: #edeae5;
    --prf-accent: #d4571a;
    --prf-accent-hover: #b84816;
    --prf-accent-light: #fff4ef;
    --prf-green: #16a34a;
    --prf-green-bg: #f0fdf4;
    --prf-blue: #2563eb;
    --prf-blue-bg: #eff6ff;
    --prf-purple: #7c3aed;
    --prf-purple-bg: #f5f3ff;
    --prf-text: #0f0e0c;
    --prf-text-2: #6b6860;
    --prf-text-3: #9c9890;
    --prf-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --prf-shadow-md: 0 4px 20px rgba(0,0,0,0.08);
    --prf-radius: 16px;
    --prf-radius-sm: 10px;
    --prf-radius-full: 999px;
    --prf-t: 0.16s cubic-bezier(0.4,0,0.2,1);
    --prf-font-display: 'Georgia', 'Times New Roman', serif;
  }

  .prf-page {
    min-height: 100vh;
    background: var(--prf-bg);
    padding: 32px 0 64px;
  }

  .prf-container {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  @media (min-width: 640px) { .prf-container { padding: 0 24px; } }

  /* ── Hero ── */
  .prf-hero {
    background: var(--prf-surface);
    border: 1px solid var(--prf-border);
    border-radius: var(--prf-radius);
    box-shadow: var(--prf-shadow-md);
    padding: 28px 28px 24px;
    display: flex;
    align-items: flex-start;
    gap: 20px;
    flex-wrap: wrap;
    position: relative;
  }

  .prf-hero__avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d4571a 0%, #e8833a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(212,87,26,0.3);
  }
  @media (min-width: 640px) { .prf-hero__avatar { width: 80px; height: 80px; } }

  .prf-hero__info { flex: 1; min-width: 0; }

  .prf-hero__name {
    font-family: var(--prf-font-display);
    font-size: clamp(22px, 4vw, 32px);
    font-weight: 700;
    color: var(--prf-text);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .prf-hero__email {
    font-size: 14px;
    color: var(--prf-text-2);
    margin-bottom: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .prf-hero__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .prf-hero__since,
  .prf-hero__phone {
    font-size: 12px;
    color: var(--prf-text-3);
    font-weight: 500;
  }

  .prf-hero__admin-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    color: var(--prf-green);
    background: var(--prf-green-bg);
    border: 1px solid #bbf7d0;
    padding: 3px 10px;
    border-radius: var(--prf-radius-full);
    letter-spacing: 0.04em;
  }

  .prf-hero__edit-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 700;
    color: var(--prf-text-2);
    background: var(--prf-surface-2);
    border: 1.5px solid var(--prf-border);
    padding: 8px 14px;
    border-radius: var(--prf-radius-sm);
    text-decoration: none;
    transition: background var(--prf-t), color var(--prf-t), border-color var(--prf-t);
    flex-shrink: 0;
    align-self: flex-start;
  }
  .prf-hero__edit-btn:hover {
    background: var(--prf-accent-light);
    color: var(--prf-accent);
    border-color: #fddcc8;
  }

  /* ── Stats ── */
  .prf-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  @media (min-width: 640px) { .prf-stats { grid-template-columns: repeat(4, 1fr); gap: 12px; } }

  .prf-stat {
    background: var(--prf-surface);
    border: 1px solid var(--prf-border);
    border-radius: var(--prf-radius);
    padding: 20px 16px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: var(--prf-shadow);
    transition: transform var(--prf-t), box-shadow var(--prf-t);
  }
  .prf-stat:hover { transform: translateY(-2px); box-shadow: var(--prf-shadow-md); }

  .prf-stat__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }
  .prf-stat--accent .prf-stat__icon { background: var(--prf-accent-light); color: var(--prf-accent); }
  .prf-stat--green  .prf-stat__icon { background: var(--prf-green-bg); color: var(--prf-green); }
  .prf-stat--blue   .prf-stat__icon { background: var(--prf-blue-bg); color: var(--prf-blue); }
  .prf-stat--purple .prf-stat__icon { background: var(--prf-purple-bg); color: var(--prf-purple); }

  .prf-stat__num {
    font-size: clamp(22px, 4vw, 30px);
    font-weight: 800;
    color: var(--prf-text);
    letter-spacing: -0.03em;
    font-family: var(--prf-font-display);
    line-height: 1;
    margin-bottom: 5px;
  }

  .prf-stat__label {
    font-size: 12px;
    color: var(--prf-text-3);
    font-weight: 500;
  }

  /* ── Bottom Row ── */
  .prf-bottom {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  @media (min-width: 680px) { .prf-bottom { grid-template-columns: 1fr 1fr; } }

  .prf-section-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--prf-text-3);
    margin-bottom: 10px;
    padding: 0 2px;
  }

  /* ── Actions Card ── */
  .prf-actions {
    background: var(--prf-surface);
    border: 1px solid var(--prf-border);
    border-radius: var(--prf-radius);
    padding: 20px;
    box-shadow: var(--prf-shadow);
  }

  .prf-actions__grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .prf-action-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    border-radius: var(--prf-radius-sm);
    border: 1.5px solid var(--prf-border);
    background: var(--prf-surface-2);
    text-decoration: none;
    color: var(--prf-text-2);
    font-size: 13.5px;
    font-weight: 600;
    transition: background var(--prf-t), color var(--prf-t), border-color var(--prf-t), transform var(--prf-t);
  }
  .prf-action-item:hover {
    background: var(--prf-accent-light);
    color: var(--prf-accent);
    border-color: #fddcc8;
    transform: translateX(3px);
  }
  .prf-action-item--accent {
    background: var(--prf-accent);
    color: #fff;
    border-color: var(--prf-accent);
    box-shadow: 0 2px 10px rgba(212,87,26,0.25);
  }
  .prf-action-item--accent:hover {
    background: var(--prf-accent-hover);
    border-color: var(--prf-accent-hover);
    color: #fff;
    transform: translateX(3px);
  }

  .prf-action-item__icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.18);
  }
  .prf-action-item:not(.prf-action-item--accent) .prf-action-item__icon {
    background: var(--prf-border);
    color: var(--prf-text-2);
  }
  .prf-action-item:not(.prf-action-item--accent):hover .prf-action-item__icon {
    background: rgba(212,87,26,0.12);
    color: var(--prf-accent);
  }

  .prf-action-item__label { flex: 1; }

  /* ── Account Card ── */
  .prf-account {
    background: var(--prf-surface);
    border: 1px solid var(--prf-border);
    border-radius: var(--prf-radius);
    padding: 20px;
    box-shadow: var(--prf-shadow);
  }

  .prf-account__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .prf-account__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: var(--prf-radius-sm);
    border: 1.5px solid var(--prf-border);
    background: var(--prf-surface-2);
    font-size: 13.5px;
    font-weight: 600;
    color: var(--prf-text-2);
    text-decoration: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: background var(--prf-t), color var(--prf-t), border-color var(--prf-t), transform var(--prf-t);
  }
  .prf-account__item:hover {
    background: var(--prf-accent-light);
    color: var(--prf-accent);
    border-color: #fddcc8;
    transform: translateX(3px);
  }

  .prf-account__item-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: var(--prf-border);
    transition: background var(--prf-t), color var(--prf-t);
  }
  .prf-account__item:hover .prf-account__item-icon {
    background: rgba(212,87,26,0.12);
    color: var(--prf-accent);
  }

  .prf-account__item--admin .prf-account__item-icon--admin { background: var(--prf-purple-bg); color: var(--prf-purple); }
  .prf-account__item--admin:hover { background: #f5f3ff; color: var(--prf-purple); border-color: #ddd6fe; }
  .prf-account__item--admin:hover .prf-account__item-icon { background: var(--prf-purple-bg); color: var(--prf-purple); }

  .prf-account__item--logout { }
  .prf-account__item--logout .prf-account__item-icon--logout { background: #fff1f1; color: #ef4444; }
  .prf-account__item--logout:hover { background: #fff5f5; color: #ef4444; border-color: #fecaca; }
  .prf-account__item--logout:hover .prf-account__item-icon { background: #fee2e2; color: #ef4444; }

  .prf-account__item-arrow {
    margin-left: auto;
    font-size: 15px;
    color: var(--prf-text-3);
    transition: transform var(--prf-t);
  }
  .prf-account__item:hover .prf-account__item-arrow { transform: translateX(3px); color: inherit; }
`;

export default Profile;