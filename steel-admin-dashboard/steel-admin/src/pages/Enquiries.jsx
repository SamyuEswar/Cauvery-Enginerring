import React, { useState } from 'react';
import { MdSearch, MdDelete, MdVisibility, MdReply, MdContactMail, MdClose } from 'react-icons/md';
import { useApp } from '../context/AppContext.jsx';

const statusBadge = { New: 'badge-blue', Replied: 'badge-green', Closed: 'badge-gray' };

export default function Enquiries() {
  const { enquiries, setEnquiries, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const filtered = enquiries.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search) || e.message.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || e.status === filter;
    return matchSearch && matchFilter;
  });

  const sendReply = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/enquiries/${replyModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Replied', adminReply: replyText })
      });
      const updated = await res.json();
      setEnquiries(prev => prev.map(e => e.id === replyModal.id ? { ...e, ...updated, id: updated._id } : e));
      setReplyModal(null);
      setReplyText('');
      showToast('Reply sent successfully');
    } catch (err) {
      showToast('Failed to send reply', 'error');
    }
  };

  const closeEnquiry = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Closed' })
      });
      const updated = await res.json();
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, ...updated, id: updated._id } : e));
      showToast('Enquiry closed');
    } catch (err) {
      showToast('Failed to close enquiry', 'error');
    }
  };

  const deleteEnquiry = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/enquiries/${id}`, { method: 'DELETE' });
      setEnquiries(prev => prev.filter(e => e.id !== id));
      setDeleteId(null);
      if (selected?.id === id) setSelected(null);
      showToast('Enquiry deleted');
    } catch (err) {
      showToast('Failed to delete enquiry', 'error');
    }
  };

  const counts = {
    All: enquiries.length,
    New: enquiries.filter(e => e.status === 'New').length,
    Replied: enquiries.filter(e => e.status === 'Replied').length,
    Closed: enquiries.filter(e => e.status === 'Closed').length,
  };

  return (
    <div className="anim-up">
      <div className="page-header">
        <div>
          <h1>Enquiries</h1>
          <p>{counts.New} new enquiries awaiting response</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row mb-24" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total', value: counts.All, color: 'amber' },
          { label: 'New', value: counts.New, color: 'blue' },
          { label: 'Replied', value: counts.Replied, color: 'green' },
          { label: 'Closed', value: counts.Closed, color: 'red' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ padding: '14px 20px' }}>
            <div className={`stat-icon-box ${s.color}`}><MdContactMail /></div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <MdSearch />
          <input placeholder="Search enquiries…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['All', 'New', 'Replied', 'Closed'].map(f => (
            <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f} {f !== 'All' && `(${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Phone</th><th>Message Preview</th><th>Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id}>
                <td className="mono">{i + 1}</td>
                <td><span className="name">{e.name}</span></td>
                <td className="mono">{e.phone}</td>
                <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{e.message}</td>
                <td className="mono">{e.date}</td>
                <td><span className={`badge ${statusBadge[e.status]}`}>{e.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" title="View" onClick={() => setSelected(e)}><MdVisibility /></button>
                    <button className="btn btn-outline btn-icon btn-sm" title="Reply" onClick={() => { setReplyModal(e); setReplyText(''); }}><MdReply /></button>
                    {e.status !== 'Closed' && <button className="btn btn-ghost btn-icon btn-sm" title="Close" onClick={() => closeEnquiry(e.id)} style={{ fontSize: 10, width: 'auto', padding: '0 8px' }}>Close</button>}
                    <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => setDeleteId(e.id)}><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>No enquiries found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Enquiry Details</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelected(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {[['Name', selected.name], ['Phone', selected.phone], ['Date', selected.date], ['Status', selected.status]].map(([k, v]) => (
                <div className="detail-row" key={k}>
                  <div className="detail-key">{k}</div>
                  <div className="detail-val">{v}</div>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: '14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div className="form-label" style={{ marginBottom: 8 }}>Message</div>
                <p style={{ fontSize: 14, color: 'var(--white)', lineHeight: 1.7 }}>{selected.message}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setReplyModal(selected); setSelected(null); }}>Reply</button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="modal-overlay" onClick={() => setReplyModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Reply to {replyModal.name}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setReplyModal(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 8, marginBottom: 16, border: '1px solid var(--border)' }}>
                <div className="form-label" style={{ marginBottom: 6 }}>Original Message</div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{replyModal.message}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Your Reply</label>
                <textarea className="form-input" rows={5} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply here..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setReplyModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendReply} disabled={!replyText.trim()}>Send Reply</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title" style={{ color: 'var(--red)' }}>Delete Enquiry</span></div>
            <div className="modal-body"><p style={{ color: 'var(--text)', fontSize: 14 }}>Are you sure you want to delete this enquiry?</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteEnquiry(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
