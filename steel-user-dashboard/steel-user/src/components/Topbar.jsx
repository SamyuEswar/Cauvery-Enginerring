import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdNotifications, MdClose } from 'react-icons/md';
import { FaUserCircle, FaCheck } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

const titles = {
  '/':              ['Dashboard',     'Your account overview'],
  '/profile':       ['My Profile',    'Manage your personal details'],
  '/enquiries':     ['My Enquiries',  'Your submitted enquiries'],
  '/quotations':    ['My Quotations', 'Quotations sent by Cauvery Engineerings'],
  '/services':      ['Services',      'Available fabrication services'],
  '/notifications': ['Notifications', 'Your alerts and updates'],
  '/support':       ['Support',       'Get help from our team'],
};

export function Topbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, notifications, unreadNotifs, markAllRead, markOneRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [title, sub] = titles[location.pathname] || ['My Account', ''];

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const typeIcon = { quote: '₹', reply: '↩', offer: '★', alert: '!' };

  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-subtitle">{sub}</div>
      </div>

      <div className="topbar-right">
        {/* Notifications bell */}
        <div style={{ position: 'relative' }} ref={ref}>
          <button className="icon-btn" onClick={() => setOpen(v => !v)}>
            <MdNotifications />
            {unreadNotifs > 0 && <span className="notif-pip" />}
          </button>

          {open && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden', animation: 'dropIn 0.2s ease' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--white)', fontWeight: 600 }}>Notifications</span>
                {unreadNotifs > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={markAllRead} style={{ gap: 5, fontSize: 11 }}>
                    <FaCheck style={{ width: 10, height: 10 }} /> All read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                {notifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: !n.read ? 'rgba(200,169,110,0.04)' : 'transparent' }}
                    onClick={() => { markOneRead(n.id); setOpen(false); navigate('/notifications'); }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                      <span className={`notif-pip-dot ${n.read ? 'read' : 'unread'}`} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--white)' }}>{n.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 16 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 3, marginLeft: 16 }}>{n.time}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setOpen(false); navigate('/notifications'); }}>
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <button className="icon-btn" onClick={() => navigate('/profile')}>
          {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} /> : <FaUserCircle />}
        </button>
      </div>
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className={`toast${toast.type === 'error' ? ' error' : toast.type === 'info' ? ' info' : ''}`}>
      <FaCheck style={{ width: 12, height: 12, flexShrink: 0 }} />
      {toast.msg}
    </div>
  );
}
