import React, { useState } from 'react';
import { MdContactMail, MdAdd, MdClose, MdSend, MdVisibility } from 'react-icons/md';
import { FaEnvelope } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

const statusBadge = { New: 'badge-blue', Replied: 'badge-green', Closed: 'badge-gray' };

export default function Enquiries() {
  const { enquiries, addEnquiry, showToast } = useApp();
  const [filter, setFilter] = useState('All');
  const [newModal, setNewModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [message, setMessage] = useState('');

  const counts = {
    All: enquiries.length,
    New: enquiries.filter(e => e.status === 'New').length,
    Replied: enquiries.filter(e => e.status === 'Replied').length,
    Closed: enquiries.filter(e => e.status === 'Closed').length,
  };

  const filtered = filter === 'All' ? enquiries : enquiries.filter(e => e.status === filter);

  const submit = () => {
    if (!message.trim()) { showToast('Please enter a message', 'error'); return; }
    addEnquiry(message.trim());
    setMessage('');
    setNewModal(false);
    showToast('Enquiry submitted successfully!');
  };

  return (
    <div className="anim-up">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>My Enquiries</h1>
          <p>{enquiries.length} total enquiries submitted</p>
        </div>
        <button className="btn btn-primary" onClick={() => setNewModal(true)}>
          <MdAdd /> New Enquiry
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, margin: '24px 0' }}>
        {[
          { label: 'Total', value: counts.All,     color: 'gold'  },
          { label: 'New',   value: counts.New,     color: 'blue'  },
          { label: 'Replied',value:counts.Replied, color: 'green' },
          { label: 'Closed',value: counts.Closed,  color: 'red'   },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.color}`}><MdContactMail /></div>
            <div className="stat-number" style={{ fontSize: 28 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="toolbar">
        <div className="filter-tabs">
          {['All', 'New', 'Replied', 'Closed'].map(f => (
            <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f} {f !== 'All' && `(${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Query Message</th><th>Date</th><th>Status</th><th>Admin Reply</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id}>
                <td className="td-mono">{i + 1}</td>
                <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span className="td-main">{e.message.slice(0, 70)}{e.message.length > 70 ? '…' : ''}</span>
                </td>
                <td className="td-mono">{e.date}</td>
                <td><span className={`badge ${statusBadge[e.status]}`}>{e.status}</span></td>
                <td style={{ color: e.adminReply ? 'var(--green)' : 'var(--text3)', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.adminReply ? e.adminReply.slice(0, 50) + (e.adminReply.length > 50 ? '…' : '') : '—'}
                </td>
                <td>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewModal(e)}><MdVisibility /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>No enquiries found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Enquiry Modal */}
      {newModal && (
        <div className="modal-overlay" onClick={() => setNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Submit New Enquiry</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setNewModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '12px 14px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 18, border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text)', lineHeight: 1.6 }}>
                Describe your requirement in detail — service type, dimensions, quantity, timeline, and any special requirements. This helps us provide an accurate quotation.
              </div>
              <div className="field">
                <label className="field-label">Your Message</label>
                <textarea
                  className="field-input"
                  rows={6}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your steel fabrication requirement in detail..."
                />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                {message.length} characters
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setNewModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={!message.trim()}>
                <MdSend /> Submit Enquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Enquiry Modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Enquiry Details</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewModal(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, padding: '14px', background: 'var(--bg3)', borderRadius: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--accentd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaEnvelope style={{ color: 'var(--accent)', width: 18, height: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>Submitted on {viewModal.date}</div>
                  <span className={`badge ${statusBadge[viewModal.status]}`}>{viewModal.status}</span>
                </div>
              </div>
              <div className="field" style={{ marginBottom: 18 }}>
                <label className="field-label">Your Message</label>
                <div style={{ padding: '14px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13.5, color: 'var(--white)', lineHeight: 1.7 }}>
                  {viewModal.message}
                </div>
              </div>
              {viewModal.adminReply && (
                <div className="field">
                  <label className="field-label" style={{ color: 'var(--green)' }}>Admin Response</label>
                  <div style={{ padding: '14px', background: 'rgba(52,211,153,0.06)', borderRadius: 8, border: '1px solid rgba(52,211,153,0.2)', fontSize: 13.5, color: 'var(--white)', lineHeight: 1.7 }}>
                    {viewModal.adminReply}
                  </div>
                </div>
              )}
              {!viewModal.adminReply && (
                <div style={{ padding: '12px 14px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text2)', textAlign: 'center' }}>
                  Awaiting admin response...
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
