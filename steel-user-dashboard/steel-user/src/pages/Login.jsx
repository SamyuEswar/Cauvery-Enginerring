import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTools, FaEnvelope, FaLock, FaUser, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdLogin, MdPersonAdd } from 'react-icons/md';
import { useApp } from '../context/AppContext.jsx';

export default function Login() {
  const { login, register, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab]     = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr]     = useState('');

  const [lf, setLf] = useState({ email: '', password: '' });
  const [rf, setRf] = useState({ name: '', email: '', phone: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    if (!lf.email || !lf.password) { setErr('Please fill all fields'); return; }
    
    const success = await login(lf.email, lf.password);
    if (success) {
      showToast('Welcome back!');
      navigate('/');
    } else {
      setErr('Invalid credentials or network error.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr('');
    if (!rf.name || !rf.email || !rf.password) { setErr('Please fill required fields'); return; }
    if (rf.password.length < 4) { setErr('Password must be at least 4 characters'); return; }
    
    const success = await register(rf.name, rf.email, rf.phone, rf.password);
    if (success) {
      showToast('Account created! Welcome to Cauvery Engineerings');
      navigate('/');
    } else {
      setErr('Registration failed. This email might already be taken.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div className="brand-icon" style={{ background: 'none', boxShadow: 'none', padding: 2, marginBottom: 10 }}>
            <img src="/your-logo.png" alt="Cauvery Engineerings" style={{ width: '200px', height: '100px', objectFit: 'contain' }} />
          </div>
          <div className="login-brand-sub">Customer Portal</div>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button className={`login-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setErr(''); }}>Sign In</button>
          <button className={`login-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setErr(''); }}>Create Account</button>
        </div>

        {err && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#F87171', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            {err}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><FaEnvelope /></span>
                <input className="form-input" type="email" placeholder="your@email.com" value={lf.email} onChange={e => setLf(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><FaLock /></span>
                <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={lf.password} onChange={e => setLf(p => ({ ...p, password: e.target.value }))} style={{ paddingRight: 40 }} />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              <MdLogin /> Sign In
            </button>
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text2)' }}>
              Demo: Enter any email + any password (min 4 chars)
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <span className="input-icon"><FaUser /></span>
                <input className="form-input" placeholder="Your full name" value={rf.name} onChange={e => setRf(p => ({ ...p, name: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><FaEnvelope /></span>
                <input className="form-input" type="email" placeholder="your@email.com" value={rf.email} onChange={e => setRf(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone (Optional)</label>
              <div className="input-wrap">
                <span className="input-icon"><FaPhone /></span>
                <input className="form-input" placeholder="+91 XXXXX XXXXX" value={rf.phone} onChange={e => setRf(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><FaLock /></span>
                <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min 4 characters" value={rf.password} onChange={e => setRf(p => ({ ...p, password: e.target.value }))} style={{ paddingRight: 40 }} />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              <MdPersonAdd /> Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
