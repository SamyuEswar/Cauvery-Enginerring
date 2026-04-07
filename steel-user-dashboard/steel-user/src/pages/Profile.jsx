import React, { useState } from 'react';
import {
  MdPerson, MdEdit, MdSave, MdClose, MdLock,
  MdCameraAlt, MdVisibility, MdVisibilityOff
} from 'react-icons/md';
import { FaUserCircle, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

export default function Profile() {
  const { user, setUser, showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm]   = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwMode, setPwMode] = useState(false);
  const [pw, setPw]       = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({});

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const p = (k, v) => setPw(x => ({ ...x, [k]: v }));
  const tog = (k) => setShowPw(x => ({ ...x, [k]: !x[k] }));

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUser(u => ({ ...u, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    if (!form.name.trim()) { showToast('Name cannot be empty', 'error'); return; }
    setUser(u => ({ ...u, name: form.name, phone: form.phone }));
    setEditing(false);
    showToast('Profile updated successfully');
  };

  const changePassword = () => {
    if (!pw.current) { showToast('Enter current password', 'error'); return; }
    if (pw.newPw.length < 4) { showToast('New password must be at least 4 characters', 'error'); return; }
    if (pw.newPw !== pw.confirm) { showToast('Passwords do not match', 'error'); return; }
    setPwMode(false); setPw({ current: '', newPw: '', confirm: '' });
    showToast('Password changed successfully');
  };

  return (
    <div className="anim-up">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => { setForm({ name: user?.name || '', phone: user?.phone || '' }); setEditing(true); }}>
            <MdEdit /> Edit Profile
          </button>
        )}
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginTop: 24 }}>
        {/* Left — Avatar + Info */}
        <div className="card card-shine">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 24px', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar-lg">
                {user?.avatar ? <img src={user.avatar} alt="" /> : <FaUserCircle />}
              </div>
              {editing && (
                <label style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg2)' }}>
                  <MdCameraAlt style={{ color: 'var(--bg4)', width: 14, height: 14 }} />
                  <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--white)' }}>{user?.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Customer</div>
            </div>
          </div>

          <div className="divider" />

          {/* Info rows */}
          {[
            { icon: FaEnvelope,     label: 'Email',      val: user?.email,      key: null },
            { icon: FaPhone,        label: 'Phone',      val: user?.phone,      key: 'phone' },
            { icon: FaCalendarAlt,  label: 'Registered', val: user?.registered, key: null },
          ].map(row => {
            const Icon = row.icon;
            return (
              <div className="detail-row" key={row.label}>
                <div className="detail-key" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon style={{ color: 'var(--accent)', width: 12, height: 12 }} /> {row.label}
                </div>
                <div className="detail-val">
                  {editing && row.key ? (
                    <input className="field-input" value={form[row.key]} onChange={e => f(row.key, e.target.value)} style={{ padding: '6px 10px', fontSize: 13 }} />
                  ) : row.val || '—'}
                </div>
              </div>
            );
          })}

          {editing && (
            <div className="detail-row">
              <div className="detail-key">Name</div>
              <div className="detail-val">
                <input className="field-input" value={form.name} onChange={e => f('name', e.target.value)} style={{ padding: '6px 10px', fontSize: 13 }} />
              </div>
            </div>
          )}

          {editing && (
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditing(false)}><MdClose /> Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveProfile}><MdSave /> Save</button>
            </div>
          )}
        </div>

        {/* Right — Security */}
        <div>
          <div className="card card-shine mb-24">
            <div className="card-title"><MdLock /> Account Security</div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--white)', fontWeight: 500, marginBottom: 3 }}>Password</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>Last changed: Never</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setPwMode(v => !v)}>
                {pwMode ? 'Cancel' : 'Change'}
              </button>
            </div>

            {pwMode && (
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[['Current Password','current'],['New Password','newPw'],['Confirm New Password','confirm']].map(([label, key]) => (
                  <div className="field" key={key}>
                    <label className="field-label">{label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="field-input"
                        type={showPw[key] ? 'text' : 'password'}
                        value={pw[key]}
                        onChange={e => p(key, e.target.value)}
                        placeholder="••••••••"
                        style={{ paddingRight: 40 }}
                      />
                      <button type="button" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }} onClick={() => tog(key)}>
                        {showPw[key] ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </div>
                  </div>
                ))}
                <button className="btn btn-primary" onClick={changePassword} style={{ alignSelf: 'flex-start' }}>
                  <MdSave /> Update Password
                </button>
              </div>
            )}
          </div>

          <div className="card card-shine">
            <div className="card-title"><MdPerson /> Account Summary</div>
            {[
              ['Account Status', <span className="badge badge-green">Active</span>],
              ['Account Type',   'Customer'],
              ['Email Verified', <span className="badge badge-green">Verified</span>],
              ['Total Enquiries', '3'],
              ['Total Quotations','4'],
            ].map(([k, v]) => (
              <div className="detail-row" key={k}>
                <div className="detail-key">{k}</div>
                <div className="detail-val">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
