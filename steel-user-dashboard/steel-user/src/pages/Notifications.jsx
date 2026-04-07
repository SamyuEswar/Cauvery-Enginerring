import React from 'react';
import {
  MdNotifications, MdDelete, MdDoneAll, MdRequestQuote,
  MdReply, MdLocalOffer
} from 'react-icons/md';
import { FaBell } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

const typeConfig = {
  quote:  { icon: MdRequestQuote, cls: 'quote',  label: 'Quotation',  badge: 'badge-gold'   },
  reply:  { icon: MdReply,        cls: 'reply',  label: 'Reply',      badge: 'badge-green'  },
  offer:  { icon: MdLocalOffer,   cls: 'offer',  label: 'Offer',      badge: 'badge-purple' },
  alert:  { icon: FaBell,         cls: 'alert',  label: 'Alert',      badge: 'badge-red'    },
};

export default function Notifications() {
  const { notifications, unreadNotifs, markAllRead, markOneRead, deleteNotif } = useApp();

  const unread = notifications.filter(n => !n.read);
  const read   = notifications.filter(n => n.read);

  const NotifItem = ({ n }) => {
    const cfg  = typeConfig[n.type] || typeConfig.alert;
    const Icon = cfg.icon;
    return (
      <div
        className={`notif-item${!n.read ? ' unread' : ''}`}
        onClick={() => markOneRead(n.id)}
      >
        <div className={`notif-icon-wrap ${cfg.cls}`}><Icon /></div>
        <div className="notif-pip-dot" style={{ flexShrink: 0, marginTop: 10 }}>
          <div className={`notif-pip-dot ${n.read ? 'read' : 'unread'}`} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span className="notif-title">{n.title}</span>
            <span className={`badge ${cfg.badge}`} style={{ fontSize: 9 }}>{cfg.label}</span>
            {!n.read && <span className="badge badge-gold" style={{ fontSize: 9 }}>New</span>}
          </div>
          <div className="notif-msg">{n.message}</div>
          <div className="notif-time">{n.time}</div>
        </div>
        <button
          className="btn btn-ghost btn-icon btn-sm"
          style={{ flexShrink: 0 }}
          onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
          title="Delete"
        >
          <MdDelete />
        </button>
      </div>
    );
  };

  return (
    <div className="anim-up">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Notifications</h1>
          <p>{unreadNotifs} unread notification{unreadNotifs !== 1 ? 's' : ''}</p>
        </div>
        {unreadNotifs > 0 && (
          <button className="btn btn-outline" onClick={markAllRead}>
            <MdDoneAll /> Mark All Read
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, margin: '24px 0' }}>
        {[
          { label: 'Total',  value: notifications.length, color: 'gold'  },
          { label: 'Unread', value: unreadNotifs,          color: 'red'   },
          { label: 'Read',   value: notifications.length - unreadNotifs, color: 'green' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.color}`}><MdNotifications /></div>
            <div className="stat-number" style={{ fontSize: 28 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FaBell style={{ width: 48, height: 48 }} />
            <p>You're all caught up — no notifications</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {unread.length > 0 && (
            <div className="card card-shine">
              <div className="card-title"><FaBell /> Unread ({unread.length})</div>
              <div className="notif-list">
                {unread.map(n => <NotifItem key={n.id} n={n} />)}
              </div>
            </div>
          )}
          {read.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ color: 'var(--text2)' }}>Earlier</div>
              <div className="notif-list">
                {read.map(n => <NotifItem key={n.id} n={n} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
