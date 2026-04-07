import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdContactMail, MdRequestQuote, MdCheckCircle,
  MdNotifications, MdArrowForward
} from 'react-icons/md';
import { FaFileInvoiceDollar, FaEnvelope, FaUserCircle } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import { useApp } from '../context/AppContext.jsx';

export default function Dashboard() {
  const { user, enquiries, quotations, notifications } = useApp();
  const navigate = useNavigate();

  const activeQuotes = quotations.filter(q => q.status === 'Pending').length;

  const activity = [
    ...quotations.map(q => ({ type: 'quote', text: `Quotation ${q.id} — ${q.service}`, sub: `Status: ${q.status}`, time: q.date, badge: q.status })),
    ...enquiries.map(e => ({ type: 'enquiry', text: 'Enquiry submitted', sub: e.message.slice(0, 60) + '…', time: e.date, badge: e.status })),
    ...notifications.slice(0, 2).map(n => ({ type: 'notif', text: n.title, sub: n.message, time: n.time, badge: null })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  const statusBadge = { Pending: 'badge-gold', Approved: 'badge-green', Rejected: 'badge-red', Expired: 'badge-gray', New: 'badge-blue', Replied: 'badge-green', Closed: 'badge-gray' };

  const quickActions = [
    { label: 'Submit New Enquiry',   path: '/enquiries',  icon: MdContactMail,      color: 'var(--blue)' },
    { label: 'View My Quotations',   path: '/quotations', icon: MdRequestQuote,     color: 'var(--accent)' },
    { label: 'Browse Services',      path: '/services',   icon: BsLightningChargeFill, color: 'var(--green)' },
    { label: 'Contact Support',      path: '/support',    icon: MdNotifications,    color: 'var(--purple)' },
  ];

  return (
    <div className="anim-up">
      {/* Welcome Banner */}
      <div className="welcome-banner mb-24">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
              Welcome back
            </div>
            <div className="welcome-banner-name">
              {user?.name || 'Customer'} 👋
            </div>
            <div className="welcome-banner-sub">
              Here's what's happening with your account today.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: 1.5, marginBottom: 2 }}>MEMBER SINCE</div>
              <div style={{ fontSize: 13, color: 'var(--white)' }}>{user?.registered || '—'}</div>
            </div>
            <div className="avatar-lg" style={{ width: 52, height: 52, fontSize: 24 }}>
              {user?.avatar ? <img src={user.avatar} alt="" /> : <FaUserCircle />}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-24">
        {[
          { label: 'Enquiries Submitted',   value: enquiries.length,  icon: MdContactMail,       cls: 'blue'   },
          { label: 'Quotations Received',   value: quotations.length, icon: FaFileInvoiceDollar, cls: 'gold'   },
          { label: 'Active Quotations',     value: activeQuotes,      icon: MdCheckCircle,       cls: 'green'  },
          { label: 'Notifications',         value: notifications.filter(n => !n.read).length, icon: MdNotifications, cls: 'purple' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.cls}`}><Icon /></div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        {/* Recent Activity */}
        <div className="card card-shine">
          <div className="card-title"><FaEnvelope /> Recent Activity</div>
          <div className="activity-list">
            {activity.length === 0 && (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <MdNotifications style={{ width: 36, height: 36 }} />
                <p>No recent activity</p>
              </div>
            )}
            {activity.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className={`activity-dot ${a.type}`}>
                  {a.type === 'quote'   && <FaFileInvoiceDollar />}
                  {a.type === 'enquiry' && <FaEnvelope />}
                  {a.type === 'notif'   && <MdNotifications />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="activity-text">{a.text}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.sub}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <div className="activity-time">{a.time}</div>
                    {a.badge && <span className={`badge ${statusBadge[a.badge] || 'badge-gray'}`} style={{ fontSize: 9 }}>{a.badge}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card card-shine">
          <div className="card-title"><MdArrowForward /> Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quickActions.map(a => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', padding: '13px 16px', gap: 12 }}
                  onClick={() => navigate(a.path)}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: `rgba(${a.color === 'var(--accent)' ? '200,169,110' : a.color === 'var(--blue)' ? '96,165,250' : a.color === 'var(--green)' ? '52,211,153' : '192,132,252'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ color: a.color, width: 16, height: 16 }} />
                  </div>
                  <span style={{ color: 'var(--white)', fontWeight: 500 }}>{a.label}</span>
                  <MdArrowForward style={{ marginLeft: 'auto', color: 'var(--text3)', width: 14, height: 14 }} />
                </button>
              );
            })}
          </div>

          {/* Pending Quote Alert */}
          {activeQuotes > 0 && (
            <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.25)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <MdRequestQuote style={{ color: 'var(--accent)', width: 18, height: 18 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--white)', fontWeight: 600 }}>Action Required</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text)', marginBottom: 10 }}>
                You have <strong style={{ color: 'var(--accent)' }}>{activeQuotes} pending quotation{activeQuotes > 1 ? 's' : ''}</strong> awaiting your review.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/quotations')}>
                Review Now <MdArrowForward />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
