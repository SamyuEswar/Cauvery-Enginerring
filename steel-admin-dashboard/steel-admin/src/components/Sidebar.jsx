import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdContactMail, MdRequestQuote,
  MdBuildCircle, MdBarChart, MdNotifications, MdSettings, MdPhotoLibrary
} from 'react-icons/md';
import { FaTools, FaUserCircle } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

const navItems = [
  { label: 'Dashboard',     path: '/',              icon: MdDashboard,     section: 'main'    },
  { label: 'Customers',     path: '/customers',     icon: MdPeople,        section: 'main'    },
  { label: 'Enquiries',     path: '/enquiries',     icon: MdContactMail,   section: 'main',   badgeKey: 'newEnquiries' },
  { label: 'Quotations',    path: '/quotations',    icon: MdRequestQuote,  section: 'main'    },
  { label: 'Services',      path: '/services',      icon: MdBuildCircle,   section: 'main'    },
  { label: 'Projects',      path: '/projects',      icon: MdPhotoLibrary,  section: 'main'    },
  { label: 'Reports',       path: '/reports',       icon: MdBarChart,      section: 'system'  },
  { label: 'Notifications', path: '/notifications', icon: MdNotifications, section: 'system', badgeKey: 'unread' },
  { label: 'Profile',       path: '/profile',       icon: MdSettings,      section: 'system'  },
];

export default function Sidebar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { adminProfile, unreadCount, enquiries } = useApp();

  const newEnq = enquiries.filter(e => e.status === 'New').length;

  const getBadge = (key) => {
    if (key === 'unread')        return unreadCount || null;
    if (key === 'newEnquiries')  return newEnq || null;
    return null;
  };

  const mainItems   = navItems.filter(n => n.section === 'main');
  const systemItems = navItems.filter(n => n.section === 'system');

  return (
    <aside className="sidebar">
      {/*
        ★★★ LOGO LOCATION ★★★
        To change the company logo/name, edit the block below.
        - "brand-icon" div: replace <FaTools /> with your own SVG/image
        - "brand-text"    : change "SteelCraft" to your company name
        - "brand-sub"     : change "Admin Panel" to your tagline
      */}
      <div className="sidebar-brand">
        <div className="brand-icon" style={{ background: 'none', boxShadow: 'none', padding: 2 }}>
          <img src="/your-logo.png" alt="Cauvery Engineerings" style={{ width: '150px', height: '50px', objectFit: 'contain' }} />
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Main Menu</div>
        {mainItems.map(item => {
          const Icon  = item.icon;
          const badge = item.badgeKey ? getBadge(item.badgeKey) : null;
          return (
            <button
              key={item.path}
              className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon />
              <span>{item.label}</span>
              {badge ? <span className={`nav-badge${item.badgeKey === 'unread' ? ' red' : ''}`}>{badge}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">System</div>
        {systemItems.map(item => {
          const Icon  = item.icon;
          const badge = item.badgeKey ? getBadge(item.badgeKey) : null;
          return (
            <button
              key={item.path}
              className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon />
              <span>{item.label}</span>
              {badge ? <span className="nav-badge red">{badge}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">
          {adminProfile.avatar
            ? <img src={adminProfile.avatar} alt="admin" />
            : <FaUserCircle />}
        </div>
        <div>
          <div className="sidebar-user-name">{adminProfile.name}</div>
          <div className="sidebar-user-role">{adminProfile.role}</div>
        </div>
      </div>
    </aside>
  );
}
