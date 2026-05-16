import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, User, ChevronDown, LogOut, Settings, Sun, Moon, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const AdminNavbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const { data: notifications } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: () =>
api.get('/notifications/admin/list?limit=10').then(res => res.data.data?.notifications || []),
    staleTime: 5 * 60 * 1000,
  });

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem('adminTheme') === 'dark';
    setIsDark(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/admin/search', { state: { query: searchQuery } });
      setSearchQuery('');
    }
  };

  const notifCount = notifications?.length || 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .admin-navbar * { box-sizing: border-box; font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        .admin-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid #f0f0f0;
          box-shadow: 0 1px 12px rgba(0,0,0,0.06);
        }

        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* Brand */
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .brand-icon {
          width: 38px; height: 38px;
          border-radius: 11px;
          background: #fff;
          border: 1px solid #f0f0f0;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .brand-icon img { width: 100%; height: 100%; object-fit: contain; }
        .brand-stack { display: flex; flex-direction: column; line-height: 1.05; }
        .brand-text {
          font-size: 17px; font-weight: 800;
          color: #111827; letter-spacing: -0.03em;
          white-space: nowrap;
        }
        .brand-tagline {
          margin-top: 3px;
          font-size: 10px; font-weight: 700;
          color: #6b7280;
          white-space: nowrap;
        }
        .brand-badge {
          font-size: 10px; font-weight: 700;
          background: #ecfdf5; color: #10b981;
          padding: 2px 7px; border-radius: 20px;
          letter-spacing: 0.05em; text-transform: uppercase;
        }

        /* Search */
        .search-form { flex: 1; max-width: 420px; }
        .search-wrap {
          position: relative;
          display: flex; align-items: center;
        }
        .search-icon {
          position: absolute; left: 13px;
          color: #9ca3af; pointer-events: none;
          transition: color .2s;
        }
        .search-input {
          width: 100%;
          padding: 9px 38px 9px 40px;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          font-size: 14px; font-weight: 500;
          color: #111827;
          background: #f9fafb;
          outline: none;
          transition: border .2s, box-shadow .2s, background .2s;
        }
        .search-input::placeholder { color: #b0b7c3; }
        .search-input:focus {
          border-color: #10b981;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }
        .search-input:focus + .search-icon { color: #10b981; }
        .search-clear {
          position: absolute; right: 10px;
          background: none; border: none;
          cursor: pointer; color: #9ca3af;
          display: flex; align-items: center; justify-content: center;
          padding: 2px;
          border-radius: 6px;
          transition: color .15s, background .15s;
        }
        .search-clear:hover { color: #374151; background: #f3f4f6; }

        /* Right actions */
        .navbar-right {
          display: flex; align-items: center; gap: 6px;
          flex-shrink: 0;
        }

        /* Icon button */
        .icon-btn {
          width: 38px; height: 38px;
          border-radius: 12px;
          border: none; background: transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #6b7280;
          transition: background .15s, color .15s;
          position: relative;
        }
        .icon-btn:hover { background: #f3f4f6; color: #111827; }

        /* Notif badge */
        .notif-badge {
          position: absolute; top: 4px; right: 4px;
          width: 18px; height: 18px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid #fff;
          font-size: 9px; font-weight: 800; color: #fff;
          display: flex; align-items: center; justify-content: center;
          line-height: 1;
        }

        /* Divider */
        .nav-divider {
          width: 1px; height: 28px;
          background: #e5e7eb; margin: 0 4px;
          flex-shrink: 0;
        }

        /* Profile button */
        .profile-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 10px 5px 5px;
          border: none; background: transparent;
          border-radius: 14px; cursor: pointer;
          transition: background .15s;
        }
        .profile-btn:hover { background: #f3f4f6; }
        .profile-avatar {
          width: 34px; height: 34px;
          border-radius: 11px;
          background: linear-gradient(135deg,#3b82f6,#6366f1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(59,130,246,0.25);
        }
        .profile-name {
          font-size: 14px; font-weight: 700;
          color: #111827; white-space: nowrap;
          max-width: 120px; overflow: hidden; text-overflow: ellipsis;
        }
        .profile-chevron {
          color: #9ca3af;
          transition: transform .2s;
        }
        .profile-chevron.open { transform: rotate(180deg); }

        /* Dropdown base */
        .dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          z-index: 100;
          animation: dropIn .18s ease;
          overflow: hidden;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Notif dropdown */
        .notif-dropdown { width: 320px; }
        .notif-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        .notif-title { font-size: 15px; font-weight: 800; color: #111827; }
        .notif-count-pill {
          font-size: 11px; font-weight: 700;
          background: #fef2f2; color: #ef4444;
          padding: 2px 8px; border-radius: 20px;
        }
        .notif-empty {
          padding: 32px 20px;
          text-align: center; color: #9ca3af; font-size: 14px;
        }
        .notif-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 20px;
          border-bottom: 1px solid #f9fafb;
          transition: background .15s;
          cursor: pointer;
        }
        .notif-item:hover { background: #f9fafb; }
        .notif-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #10b981; flex-shrink: 0; margin-top: 5px;
        }
        .notif-text { font-size: 13px; color: #374151; line-height: 1.5; }
        .notif-time { font-size: 11px; color: #9ca3af; margin-top: 2px; }
        .notif-footer {
          padding: 12px 20px;
          text-align: center;
        }
        .notif-footer a {
          font-size: 13px; font-weight: 700;
          color: #10b981; text-decoration: none;
        }
        .notif-footer a:hover { color: #059669; }

        /* Profile dropdown */
        .profile-dropdown { width: 230px; }
        .profile-info {
          padding: 16px 18px 14px;
          border-bottom: 1px solid #f3f4f6;
        }
        .profile-info-name { font-size: 15px; font-weight: 800; color: #111827; }
        .profile-info-email { font-size: 12px; color: #9ca3af; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; }
        .profile-info-badge {
          display: inline-block; margin-top: 6px;
          font-size: 10px; font-weight: 700;
          background: #ecfdf5; color: #059669;
          padding: 2px 8px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .profile-menu { padding: 6px; }
        .profile-menu-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 14px; font-weight: 600; color: #374151;
          text-decoration: none;
          transition: background .15s, color .15s;
          border: none; background: transparent;
          width: 100%; cursor: pointer; text-align: left;
        }
        .profile-menu-item:hover { background: #f3f4f6; color: #111827; }
        .profile-menu-item.danger { color: #ef4444; }
        .profile-menu-item.danger:hover { background: #fef2f2; color: #dc2626; }

        /* Responsive: hide search on small */
        @media (max-width: 640px) {
          .search-form { display: none; }
          .brand-badge { display: none; }
          .brand-stack { display: none; }
          .navbar-inner { padding: 0 16px; }
          .profile-name { display: none; }
        }
        @media (max-width: 768px) {
          .profile-name { display: none; }
        }
      `}</style>

      <nav className="admin-navbar">
        <div className="navbar-inner">

          {/* Brand */}
          <Link to="/admin" className="navbar-brand">
            <div className="brand-icon"><img src="/logo-1.png" alt="BuySellAdda" /></div>
            <span className="brand-stack">
              <span className="brand-text">BuySellAdda</span>
              <span className="brand-tagline">Har Deal, Ek Nayi Shuruaat</span>
            </span>
            {/* <span className="brand-badge">Pro</span> */}
          </Link>

          {/* Search */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-wrap">
              <Search size={16} className="search-icon" style={{ position: 'absolute', left: 13, color: searchFocused ? '#10b981' : '#9ca3af', pointerEvents: 'none', transition: 'color .2s' }} />
              <input
                className="search-input"
                type="text"
                placeholder="Search users, products, chats..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery && (
                <button type="button" className="search-clear" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>
          </form>

          {/* Right */}
          <div className="navbar-right">

            {/* Theme toggle */}
            <button
              className="icon-btn"
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark
                ? <Sun size={18} style={{ color: '#f59e0b' }} />
                : <Moon size={18} />
              }
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="icon-btn"
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              >
                <Bell size={18} />
                {notifCount > 0 && (
                  <span className="notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="dropdown notif-dropdown">
                  <div className="notif-header">
                    <span className="notif-title">Notifications</span>
                    {notifCount > 0 && <span className="notif-count-pill">{notifCount} new</span>}
                  </div>
                  {notifCount === 0 ? (
                    <div className="notif-empty">
                      <Bell size={28} style={{ color: '#d1d5db', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                      No new notifications
                    </div>
                  ) : (
                    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                      {notifications.slice(0, 8).map((n, i) => (
                        <div key={i} className="notif-item">
                          <div className="notif-dot" />
                          <div>
                            <p className="notif-text">{n.message || n.title || 'New notification'}</p>
                            <p className="notif-time">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="notif-footer">
                    <Link to="/admin/notifications" onClick={() => setNotifOpen(false)}>View all notifications →</Link>
                  </div>
                </div>
              )}
            </div>

            <div className="nav-divider" />

            {/* Profile */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                className="profile-btn"
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              >
                <div className="profile-avatar">
                  <User size={16} color="#fff" />
                </div>
                <span className="profile-name">{user?.name || 'Admin'}</span>
                <ChevronDown size={15} className={`profile-chevron${profileOpen ? ' open' : ''}`} />
              </button>

              {profileOpen && (
                <div className="dropdown profile-dropdown">
                  <div className="profile-info">
                    <p className="profile-info-name">{user?.name || 'Admin'}</p>
                    <p className="profile-info-email">{user?.email}</p>
                    <span className="profile-info-badge">{user?.role || 'admin'}</span>
                  </div>
                  <div className="profile-menu">
                    <Link
                      to="/admin/settings"
                      className="profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button
                      className="profile-menu-item danger"
                      onClick={() => { logout(); setProfileOpen(false); }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;
