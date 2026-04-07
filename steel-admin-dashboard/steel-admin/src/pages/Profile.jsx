import React, { useState } from 'react';
import { MdSettings, MdEdit, MdSave, MdCamera, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

export default function Profile() {
  const { adminProfile, setAdminProfile, showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...adminProfile });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwSection, setPwSection] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const pw = (k, v) => setPwForm(p => ({ ...p, [k]: v }));

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => f('avatar', ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    setAdminProfile(form);
    setEditing(false);
    showToast('Profile updated successfully');
  };

  const changePassword = () => {
    if (!pwForm.current) { showToast('Enter current password', 'error'); return; }
    if (pwForm.newPw.length < 6) { showToast('New password must be at least 6 characters', 'error'); return; }
    if (pwForm.newPw !== pwForm.confirm) { showToast('Passwords do not match', 'error'); return; }
    setPwForm({ current: '', newPw: '', confirm: '' });
    setPwSection(false);
    showToast('Password changed successfully');
  };

  const p = editing ? form : adminProfile;

  return (
    <div className="anim-up">
      <div className="page-header">
        <div>
          <h1>Profile Settings</h1>
          <p>Manage your admin account details</p>
        </div>
        {!editing ? (
          <button className="btn btn-primary" onClick={() => { setForm({ ...adminProfile }); setEditing(true); }}>
            <MdEdit /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveProfile}><MdSave /> Save Changes</button>
          </div>
        )}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-title"><MdSettings /> Profile Information</div>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, gap: 12 }}>
            <div className="profile-avatar-big">
              {p.avatar ? <img src={p.avatar} alt="" /> : <FaUserCircle />}
            </div>
            {editing && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 20, fontSize: 12, cursor: 'pointer', color: 'var(--text2)', transition: 'var(--ease)', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
                <MdCamera /> Change Photo
                <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
              </label>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color: 'var(--white)' }}>{p.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 2, marginTop: 2 }}>{p.role}</div>
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Email Address', key: 'email', type: 'email' },
              { label: 'Contact Number', key: 'phone', type: 'tel' },
              { label: 'Role', key: 'role', type: 'text' },
            ].map(field => (
              <div className="form-group" key={field.key}>
                <label className="form-label">{field.label}</label>
                {editing ? (
                  <input className="form-input" type={field.type} value={form[field.key] || ''} onChange={e => f(field.key, e.target.value)} />
                ) : (
                  <div style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, color: 'var(--white)' }}>
                    {p[field.key] || '—'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Password Card */}
        <div>
          <div className="card mb-24">
            <div className="card-title"><MdLock /> Account Security</div>

            <div style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MdLock style={{ color: 'var(--green)', width: 18, height: 18 }} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 500 }}>Password</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>Last changed: Never</div>
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setPwSection(!pwSection)}>
                Change
              </button>
            </div>

            {pwSection && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Current Password', key: 'current' },
                  { label: 'New Password', key: 'newPw' },
                  { label: 'Confirm New Password', key: 'confirm' },
                ].map(field => (
                  <div className="form-group" key={field.key}>
                    <label className="form-label">{field.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="form-input"
                        type={showPw[field.key] ? 'text' : 'password'}
                        value={pwForm[field.key]}
                        onChange={e => pw(field.key, e.target.value)}
                        placeholder="••••••••"
                        style={{ paddingRight: 40 }}
                      />
                      <button
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}
                        onClick={() => setShowPw(p => ({ ...p, [field.key]: !p[field.key] }))}
                      >
                        {showPw[field.key] ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPwSection(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={changePassword}>Update Password</button>
                </div>
              </div>
            )}
          </div>

          {/* Activity Summary */}
          <div className="card">
            <div className="card-title">Activity Summary</div>
            {[
              ['Last Login', 'Today, 09:42 AM'],
              ['Login IP', '192.168.1.100'],
              ['Account Status', 'Active'],
              ['Account Type', 'Super Admin'],
              ['Member Since', '2024-01-01'],
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
