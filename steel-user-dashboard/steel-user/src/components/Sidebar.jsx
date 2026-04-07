import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTools, FaUserCircle } from 'react-icons/fa';
import {
  MdDashboard, MdPerson, MdContactMail, MdRequestQuote,
  MdBuildCircle, MdNotifications, MdHeadsetMic, MdLogout, MdPhotoLibrary
} from 'react-icons/md';
import { useApp } from '../context/AppContext.jsx';

const navItems = [
  { label: 'Dashboard',     path: '/',              icon: MdDashboard    },
  { label: 'My Profile',    path: '/profile',       icon: MdPerson       },
  { label: 'My Enquiries',  path: '/enquiries',     icon: MdContactMail  },
  { label: 'My Quotations', path: '/quotations',    icon: MdRequestQuote, badge: 'quotes' },
  { label: 'Services',      path: '/services',      icon: MdBuildCircle  },
  { label: 'Gallery',       path: '/gallery',       icon: MdPhotoLibrary },
  { label: 'Notifications', path: '/notifications', icon: MdNotifications, badge: 'notifs' },
  { label: 'Support',       path: '/support',       icon: MdHeadsetMic   },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, unreadNotifs, quotations } = useApp();

  const pendingQuotes = quotations.filter(q => q.status === 'Pending').length;

  const getBadge = (key) => {
    if (key === 'notifs') return unreadNotifs || null;
    if (key === 'quotes') return pendingQuotes || null;
    return null;
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="brand-icon" style={{ background: 'none', boxShadow: 'none', padding: 2 }}>
            <img src="/your-logo.png" alt="Cauvery Engineerings" style={{ width: '150px', height: '50px', objectFit: 'contain' }} />
          </div>
        </div>
      </div>

      {/* User card */}
      {user && (
        <div className="sidebar-user">
          <div className="user-avatar-sm">
            {user.avatar ? <img src={user.avatar} alt="" /> : <FaUserCircle />}
          </div>
          <div>
            <div className="user-name-sm">{user.name}</div>
            <div className="user-role-sm">Customer</div>
          </div>
        </div>
      )}

      <div className="nav-section">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => {
          const Icon  = item.icon;
          const badge = item.badge ? getBadge(item.badge) : null;
          return (
            <button
              key={item.path}
              className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon />
              <span>{item.label}</span>
              {badge ? <span className={`nav-badge${item.badge === 'quotes' ? ' gold' : ''}`}>{badge}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="sidebar-logout">
        <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--red)', width: '100%' }}>
          <MdLogout />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
