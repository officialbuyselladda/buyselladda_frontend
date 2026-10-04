import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Package, MessageCircle, Edit, LogOut, Shield, Eye, Plus, CalendarDays, Clock3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['profileStats'],
    queryFn: () => api.get('/users/profile-stats').then(res => res.data.data),
    enabled: !!user,
  });

  const { data: postingEligibility, isLoading: quotaLoading } = useQuery({
    queryKey: ['postingEligibility', user?._id],
    queryFn: () => api.get('/products/posting-eligibility').then(res => res.data?.data || res.data),
    enabled: !!user,
  });

  if (!user) return null;

  const formatQuota = value => value === null || value === undefined ? 'Unlimited' : Number(value).toLocaleString('en-IN');
  const dailyQuota = postingEligibility?.daily || {};
  const monthlyQuota = postingEligibility?.monthly || {};
  const dailyLimit = Number(dailyQuota.limit || 0);
  const monthlyLimit = Number(monthlyQuota.limit || 0);
  const dailyUsed = Number(dailyQuota.used || 0);
  const monthlyUsed = Number(monthlyQuota.used || 0);
  const dailyProgress = dailyLimit > 0 ? Math.min(100, Math.max(0, (dailyUsed / dailyLimit) * 100)) : 0;
  const monthlyProgress = monthlyLimit > 0 ? Math.min(100, Math.max(0, (monthlyUsed / monthlyLimit) * 100)) : 0;
  const canPost = postingEligibility?.canPost !== false;
  const joinedDate = user.createdAt || user.created_at || user.joinedAt || user.updatedAt;
  const joinedAt = joinedDate ? new Date(joinedDate) : null;
  const memberSince = joinedAt && !Number.isNaN(joinedAt.getTime())
    ? joinedAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'recently';

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
                  Member since {memberSince}
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

          <div className={`prf-quota ${canPost ? '' : 'prf-quota--blocked'}`}>
            <div className="prf-quota__head">
              <div>
                <p className="prf-section-label">Posting Limit</p>
                <h2>{quotaLoading ? 'Checking ad slots...' : canPost ? 'Ads you can still post' : 'Posting limit reached'}</h2>
              </div>
              <Link to="/create-product" className="prf-quota__cta">
                <Plus size={15} />
                <span>Post Ad</span>
              </Link>
            </div>

            <div className="prf-quota__grid">
              <div className="prf-quota__item">
                <div className="prf-quota__icon prf-quota__icon--daily"><Clock3 size={18} /></div>
                <div className="prf-quota__content">
                  <span>Today remaining</span>
                  <strong>{quotaLoading ? '--' : formatQuota(dailyQuota.remaining)}</strong>
                  {!postingEligibility?.unlimited && <small>{dailyUsed.toLocaleString('en-IN')} of {dailyLimit.toLocaleString('en-IN')} used</small>}
                  <div className="prf-quota__bar"><span style={{ width: `${dailyProgress}%` }} /></div>
                </div>
              </div>

              <div className="prf-quota__item">
                <div className="prf-quota__icon prf-quota__icon--monthly"><CalendarDays size={18} /></div>
                <div className="prf-quota__content">
                  <span>This month remaining</span>
                  <strong>{quotaLoading ? '--' : formatQuota(monthlyQuota.remaining)}</strong>
                  {!postingEligibility?.unlimited && <small>{monthlyUsed.toLocaleString('en-IN')} of {monthlyLimit.toLocaleString('en-IN')} used</small>}
                  <div className="prf-quota__bar"><span style={{ width: `${monthlyProgress}%` }} /></div>
                </div>
              </div>
            </div>
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
    --prf-bg: #f5f7fa;
    --prf-surface: #ffffff;
    --prf-surface-2: #f5f7fa;
    --prf-border: #dde5f0;
    --prf-accent: #ff8200;
    --prf-accent-hover: #e86f00;
    --prf-accent-light: #fff3e4;
    --prf-green: #16a34a;
    --prf-green-bg: #f0fdf4;
    --prf-blue: #2563eb;
    --prf-blue-bg: #eff6ff;
    --prf-purple: #7c3aed;
    --prf-purple-bg: #f5f3ff;
    --prf-text: #17233c;
    --prf-text-2: #5d6b82;
    --prf-text-3: #95a1b2;
    --prf-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --prf-shadow-md: 0 4px 20px rgba(0,0,0,0.08);
    --prf-radius: 16px;
    --prf-radius-sm: 10px;
    --prf-radius-full: 999px;
    --prf-t: 0.16s cubic-bezier(0.4,0,0.2,1);
    --prf-font-display: 'Roboto', 'Inter', system-ui, sans-serif;
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
    background: linear-gradient(135deg, #ff8200 0%, #e8833a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(255,130,0,0.3);
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
    border-color: #ffcc99;
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
  .prf-quota {
    background: var(--prf-surface);
    border: 1px solid var(--prf-border);
    border-radius: var(--prf-radius);
    box-shadow: var(--prf-shadow);
    padding: 20px;
  }

  .prf-quota--blocked {
    border-color: #fecaca;
    background: #fffafa;
  }

  .prf-quota__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 16px;
  }

  .prf-quota__head .prf-section-label {
    margin-bottom: 5px;
    padding: 0;
  }

  .prf-quota__head h2 {
    font-size: clamp(18px, 3vw, 22px);
    line-height: 1.2;
    font-weight: 800;
    color: var(--prf-text);
    margin: 0;
  }

  .prf-quota__cta {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border-radius: var(--prf-radius-sm);
    background: var(--prf-accent);
    color: #fff;
    text-decoration: none;
    font-size: 12.5px;
    font-weight: 800;
    padding: 9px 12px;
    flex-shrink: 0;
    box-shadow: 0 2px 10px rgba(255,130,0,0.2);
  }

  .prf-quota__cta:hover {
    background: var(--prf-accent-hover);
    color: #fff;
  }

  .prf-quota__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  @media (min-width: 640px) { .prf-quota__grid { grid-template-columns: 1fr 1fr; } }

  .prf-quota__item {
    display: flex;
    gap: 12px;
    border: 1.5px solid var(--prf-border);
    background: var(--prf-surface-2);
    border-radius: var(--prf-radius-sm);
    padding: 14px;
  }

  .prf-quota__icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .prf-quota__icon--daily { background: var(--prf-blue-bg); color: var(--prf-blue); }
  .prf-quota__icon--monthly { background: var(--prf-green-bg); color: var(--prf-green); }

  .prf-quota__content {
    min-width: 0;
    flex: 1;
  }

  .prf-quota__content > span {
    display: block;
    color: var(--prf-text-2);
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .prf-quota__content strong {
    display: block;
    color: var(--prf-text);
    font-size: 22px;
    line-height: 1.05;
    font-weight: 900;
    margin-bottom: 3px;
  }

  .prf-quota__content small {
    display: block;
    color: var(--prf-text-3);
    font-size: 11.5px;
    font-weight: 600;
  }

  .prf-quota__bar {
    width: 100%;
    height: 6px;
    margin-top: 10px;
    overflow: hidden;
    border-radius: var(--prf-radius-full);
    background: #eee9e1;
  }

  .prf-quota__bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--prf-accent), #16a34a);
  }

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
    border-color: #ffcc99;
    transform: translateX(3px);
  }
  .prf-action-item--accent {
    background: var(--prf-accent);
    color: #fff;
    border-color: var(--prf-accent);
    box-shadow: 0 2px 10px rgba(255,130,0,0.25);
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
    background: rgba(255,130,0,0.12);
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
    border-color: #ffcc99;
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
    background: rgba(255,130,0,0.12);
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
