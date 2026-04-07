import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdNotifications, MdSearch, MdPerson } from 'react-icons/md';
import { FaCheck, FaBell, FaUserCircle } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

const titles = {
  '/':              ['Dashboard',    'Welcome back, Admin'],
  '/customers':     ['Customers',    'Manage all customer accounts'],
  '/enquiries':     ['Enquiries',    'View and respond to contact messages'],
  '/quotations':    ['Quotations',   'Create and manage price quotes'],
  '/services':      ['Services',     'Control website service listings'],
  '/reports':       ['Reports',      'Analytics and performance reports'],
  '/notifications': ['Notifications','System alerts and updates'],
  '/profile':       ['Profile',      'Manage admin account settings'],
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [title, subtitle] = titles[location.pathname] || ['Admin', ''];

  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const typeColor = { signup: 'green', enquiry: 'blue', quotation: 'amber' };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-breadcrumb">{subtitle}</div>
        </div>
      </div>

      <div className="topbar-right">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="topbar-btn" onClick={() => setNotifOpen(v => !v)}>
            <MdNotifications />
            {unreadCount > 0 && <span className="notif-dot" />}
          </button>

          {notifOpen && (
            <div className="notif-panel">
              <div className="notif-header">
                <span className="notif-header-title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="btn btn-sm btn-ghost" onClick={markAllRead} style={{ gap: 5 }}>
                    <FaCheck style={{ width: 10, height: 10 }} /> Mark all read
                  </button>
                )}
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`notif-item${!n.read ? ' unread' : ''}`}>
                  <div className={`notif-dot2 ${n.read ? 'read' : 'unread'}`} />
                  <div style={{ flex: 1 }}>
                    <div className="notif-text-title">{n.title}</div>
                    <div className="notif-text-msg">{n.message}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <button className="topbar-btn" onClick={() => navigate('/profile')}>
          <FaUserCircle />
        </button>
      </div>
    </div>
  );
}
