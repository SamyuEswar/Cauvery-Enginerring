import React from 'react';
import { MdNotifications, MdDelete, MdDoneAll } from 'react-icons/md';
import { FaUserPlus, FaEnvelope, FaFileInvoiceDollar } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

const typeConfig = {
  signup:    { icon: FaUserPlus,           color: 'var(--green)',  bg: 'rgba(52,211,153,0.12)',  label: 'badge-green'  },
  enquiry:   { icon: FaEnvelope,           color: 'var(--blue)',   bg: 'rgba(56,189,248,0.12)',  label: 'badge-blue'   },
  quotation: { icon: FaFileInvoiceDollar,  color: 'var(--accent)', bg: 'rgba(245,158,11,0.12)', label: 'badge-amber'  },
};

export default function Notifications() {
  const { notifications, setNotifications, markAllRead, showToast } = useApp();

  const markRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}`, { method: 'PUT' });
      setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(p => p.filter(n => n.id !== id));
      showToast('Notification removed');
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const clearAll = async () => {
    try {
      await fetch('http://localhost:5000/api/notifications/all', { method: 'DELETE' });
      setNotifications([]);
      showToast('All notifications cleared');
    } catch (err) {
      showToast('Failed to clear', 'error');
    }
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="anim-up">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{unread} unread notifications</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {unread > 0 && <button className="btn btn-outline" onClick={markAllRead}><MdDoneAll /> Mark All Read</button>}
          {notifications.length > 0 && <button className="btn btn-danger" onClick={clearAll}><MdDelete /> Clear All</button>}
        </div>
      </div>

      {/* Summary */}
      <div className="stats-row mb-24" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {[
          { label: 'Total', value: notifications.length, color: 'blue' },
          { label: 'Unread', value: unread, color: 'amber' },
          { label: 'Read', value: notifications.length - unread, color: 'green' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ padding: '14px 20px' }}>
            <div className={`stat-icon-box ${s.color}`}><MdNotifications /></div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <MdNotifications style={{ width: 48, height: 48 }} />
            <p>No notifications</p>
          </div>
        </div>
      ) : (
        <div className="card">
          {notifications.map((n, i) => {
            const cfg = typeConfig[n.type] || typeConfig.enquiry;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                style={{
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  padding: '16px 0',
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                  background: !n.read ? 'rgba(245,158,11,0.02)' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => markRead(n.id)}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ color: cfg.color, width: 20, height: 20 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--white)', fontSize: 14 }}>{n.title}</span>
                    <span className={`badge ${cfg.label}`} style={{ fontSize: 9 }}>{n.type}</span>
                    {!n.read && <span className="badge badge-amber" style={{ fontSize: 9 }}>NEW</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{n.message}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)', marginTop: 5 }}>{n.time}</div>
                </div>
                <button
                  className="btn btn-danger btn-icon btn-sm"
                  onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                  title="Delete"
                >
                  <MdDelete />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
