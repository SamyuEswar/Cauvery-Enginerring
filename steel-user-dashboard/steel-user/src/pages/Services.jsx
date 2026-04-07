import React, { useState } from 'react';
import {
  MdBuildCircle, MdClose, MdSend, MdCheckCircle
} from 'react-icons/md';
import {
  FaTools, FaBolt, FaWrench, FaPaintBrush, FaDraftingCompass, FaHardHat
} from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

const serviceIcons = [FaTools, FaBolt, FaWrench, FaPaintBrush, FaDraftingCompass, FaHardHat];

export default function Services() {
  const { services, addEnquiry, showToast } = useApp();
  const [viewItem, setViewItem]     = useState(null);
  const [requestItem, setRequestItem] = useState(null);
  const [reqMessage, setReqMessage] = useState('');
  const [done, setDone]             = useState(false);

  const submitRequest = () => {
    if (!reqMessage.trim()) { showToast('Please describe your requirement', 'error'); return; }
    const msg = `Service Request: ${requestItem.name}\n\n${reqMessage}`;
    addEnquiry(msg);
    setDone(true);
    setTimeout(() => { setRequestItem(null); setReqMessage(''); setDone(false); }, 2000);
    showToast('Quotation request submitted!');
  };

  return (
    <div className="anim-up">
      <div className="page-header">
        <h1>Our Services</h1>
        <p>Explore our full range of steel fabrication services — click any service to request a quotation</p>
      </div>

      <div className="services-grid">
        {services.map((s, i) => {
          const Icon = serviceIcons[i % serviceIcons.length];
          return (
            <div className="service-card" key={s.id}>
              <div className="service-icon-wrap"><Icon /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div className="service-name">{s.name}</div>
                <span className={`badge ${s.active ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 9 }}>
                  {s.active ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="service-price">{s.price}</div>
              <div className="service-desc">{s.desc}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setViewItem(s)}>View Details</button>
                {s.active && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setRequestItem(s); setReqMessage(''); setDone(false); }}>
                    <MdSend /> Get Quote
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View Details Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{viewItem.name}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewItem(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {(() => {
                const Icon = serviceIcons[services.indexOf(viewItem) % serviceIcons.length];
                return (
                  <div style={{ textAlign: 'center', padding: '20px 0', marginBottom: 24 }}>
                    <div style={{ width: 70, height: 70, borderRadius: 16, background: 'var(--accentd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Icon style={{ width: 34, height: 34, color: 'var(--accent)' }} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>{viewItem.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{viewItem.price}</div>
                  </div>
                );
              })()}
              {[
                ['Description', viewItem.desc],
                ['Price',       viewItem.price],
                ['Availability', viewItem.active ? 'Currently Available' : 'Currently Unavailable'],
              ].map(([k, v]) => (
                <div className="detail-row" key={k}>
                  <div className="detail-key">{k}</div>
                  <div className="detail-val">{v}</div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewItem(null)}>Close</button>
              {viewItem.active && (
                <button className="btn btn-primary" onClick={() => { setRequestItem(viewItem); setViewItem(null); setReqMessage(''); setDone(false); }}>
                  <MdSend /> Request Quotation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Quotation Modal */}
      {requestItem && (
        <div className="modal-overlay" onClick={() => setRequestItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Request Quote — {requestItem.name}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setRequestItem(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {done ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <MdCheckCircle style={{ width: 56, height: 56, color: 'var(--green)', marginBottom: 16 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--white)', marginBottom: 8 }}>Request Submitted!</div>
                  <p style={{ color: 'var(--text)', fontSize: 13.5 }}>Our team will review and send you a quotation within 24 hours.</p>
                </div>
              ) : (
                <>
                  <div style={{ padding: '12px 14px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 18, border: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: 2, marginBottom: 4 }}>SERVICE</div>
                    <div style={{ fontSize: 14, color: 'var(--white)', fontWeight: 500 }}>{requestItem.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>{requestItem.price}</div>
                  </div>
                  <div className="field">
                    <label className="field-label">Describe Your Requirement</label>
                    <textarea
                      className="field-input"
                      rows={5}
                      value={reqMessage}
                      onChange={e => setReqMessage(e.target.value)}
                      placeholder="Include dimensions, quantity, material preference, timeline, and any special requirements..."
                    />
                  </div>
                </>
              )}
            </div>
            {!done && (
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setRequestItem(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitRequest} disabled={!reqMessage.trim()}>
                  <MdSend /> Submit Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}
