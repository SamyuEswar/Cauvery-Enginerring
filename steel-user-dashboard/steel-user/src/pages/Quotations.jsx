import React, { useState } from 'react';
import {
  MdRequestQuote, MdDownload, MdCheckCircle, MdCancel,
  MdVisibility, MdClose, MdCalendarToday, MdWarning
} from 'react-icons/md';
import { FaFileInvoiceDollar, FaRupeeSign } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

const statusConfig = {
  Pending:  { badge: 'badge-gold',   cls: 'pending',  label: 'Awaiting Decision' },
  Approved: { badge: 'badge-green',  cls: 'approved', label: 'Accepted by You'   },
  Rejected: { badge: 'badge-red',    cls: 'rejected', label: 'Declined by You'   },
  Expired:  { badge: 'badge-gray',   cls: 'expired',  label: 'Validity Expired'  },
};

export default function Quotations() {
  const { quotations, acceptQuotation, rejectQuotation, showToast } = useApp();
  const [filter, setFilter]   = useState('All');
  const [viewItem, setViewItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { id, action }

  const filtered = filter === 'All' ? quotations : quotations.filter(q => q.status === filter);

  const counts = {
    All:      quotations.length,
    Pending:  quotations.filter(q => q.status === 'Pending').length,
    Approved: quotations.filter(q => q.status === 'Approved').length,
    Rejected: quotations.filter(q => q.status === 'Rejected').length,
    Expired:  quotations.filter(q => q.status === 'Expired').length,
  };

  const downloadPDF = (q) => {
    const lines = [
      '╔══════════════════════════════════════════╗',
      '║      CAUVERY ENGINEERINGS — QUOTATION      ║',
      '╚══════════════════════════════════════════╝',
      '',
      `Quotation ID  : ${q.id}`,
      `Date          : ${q.date}`,
      `Valid Until   : ${q.validity}`,
      `Status        : ${q.status}`,
      '',
      '──────────────────────────────────────────',
      `Service       : ${q.service}`,
      '──────────────────────────────────────────',
      '',
      'COST BREAKDOWN',
      `  Material Cost  :  ₹${q.material.toLocaleString('en-IN')}`,
      `  Labour Cost    :  ₹${q.labor.toLocaleString('en-IN')}`,
      `  Sub Total      :  ₹${(q.material + q.labor).toLocaleString('en-IN')}`,
      `  GST @ ${q.gst}%     :  ₹${(q.total - q.material - q.labor).toLocaleString('en-IN')}`,
      '                     ─────────────────',
      `  TOTAL AMOUNT   :  ₹${q.total.toLocaleString('en-IN')}`,
      '',
      '──────────────────────────────────────────',
      'NOTES',
      q.notes || 'No additional notes.',
      '',
      '══════════════════════════════════════════',
      'Cauvery Engineerings',
      '12/4 Industrial Estate, Coimbatore — 641010',
      'Phone : +91 98765 43210',
      'Email : info@cauveryengineerings.in',
      '══════════════════════════════════════════',
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${q.id}_CauveryEngineerings.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast(`Quotation ${q.id} downloaded`);
  };

  const doAction = () => {
    if (!confirmModal) return;
    if (confirmModal.action === 'accept') acceptQuotation(confirmModal.id);
    else rejectQuotation(confirmModal.id);
    setConfirmModal(null);
    if (viewItem?.id === confirmModal.id) setViewItem(null);
  };

  const isExpiredDate = (validity) => new Date(validity) < new Date();

  return (
    <div className="anim-up">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>My Quotations</h1>
          <p>{quotations.length} quotations received from Cauvery Engineerings</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, margin: '24px 0' }}>
        {[
          { label: 'Total',    value: counts.All,      color: 'gold'   },
          { label: 'Pending',  value: counts.Pending,  color: 'gold'   },
          { label: 'Approved', value: counts.Approved, color: 'green'  },
          { label: 'Rejected', value: counts.Rejected, color: 'red'    },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.color}`}><FaFileInvoiceDollar /></div>
            <div className="stat-number" style={{ fontSize: 28 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="toolbar mb-18">
        <div className="filter-tabs">
          {['All', 'Pending', 'Approved', 'Rejected', 'Expired'].map(f => (
            <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f} {counts[f] !== undefined && f !== 'All' ? `(${counts[f]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Pending alert */}
      {counts.Pending > 0 && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 18px', background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 10, marginBottom: 20 }}>
          <MdWarning style={{ color: 'var(--accent)', width: 22, height: 22, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13.5, color: 'var(--white)', fontWeight: 600, marginBottom: 2 }}>Action Required</div>
            <div style={{ fontSize: 12.5, color: 'var(--text)' }}>You have <strong style={{ color: 'var(--accent)' }}>{counts.Pending} pending quotation{counts.Pending > 1 ? 's' : ''}</strong> that need your decision. Please review and accept or reject.</div>
          </div>
        </div>
      )}

      {/* Quotation Cards */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FaFileInvoiceDollar />
            <p>No quotations found</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(q => {
            const cfg = statusConfig[q.status] || statusConfig.Pending;
            const expired = isExpiredDate(q.validity) && q.status === 'Pending';
            return (
              <div className={`quot-card ${cfg.cls}`} key={q.id}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', letterSpacing: 1 }}>{q.id}</span>
                      <span className={`badge ${cfg.badge}`}>{q.status}</span>
                      {expired && <span className="badge badge-red">EXPIRED</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--white)' }}>{q.service}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdCalendarToday style={{ width: 12, height: 12 }} /> Valid until: {q.validity}
                    </div>
                  </div>
                  <div className="quot-amount">₹{q.total.toLocaleString('en-IN')}</div>
                </div>

                {/* Cost breakdown mini */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16, border: '1px solid var(--border)' }}>
                  {[['Material', q.material], ['Labour', q.labor], [`GST ${q.gst}%`, q.total - q.material - q.labor]].map(([l, v]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--white)' }}>₹{v.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setViewItem(q)}>
                    <MdVisibility /> View Details
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => downloadPDF(q)}>
                    <MdDownload /> Download
                  </button>
                  {q.status === 'Pending' && !expired && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => setConfirmModal({ id: q.id, action: 'accept' })}>
                        <MdCheckCircle /> Accept
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmModal({ id: q.id, action: 'reject' })}>
                        <MdCancel /> Reject
                      </button>
                    </>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{q.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Detail Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Quotation — {viewItem.id}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewItem(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {/* Big total */}
              <div style={{ textAlign: 'center', padding: '20px 0', marginBottom: 20, background: 'var(--bg3)', borderRadius: 10 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Total Amount</div>
                <div className="quot-amount" style={{ fontSize: 42 }}>₹{viewItem.total.toLocaleString('en-IN')}</div>
                <span className={`badge ${statusConfig[viewItem.status]?.badge}`} style={{ marginTop: 10 }}>{viewItem.status}</span>
              </div>

              {[
                ['Quotation ID', viewItem.id],
                ['Service', viewItem.service],
                ['Material Cost', `₹${viewItem.material.toLocaleString('en-IN')}`],
                ['Labour Cost', `₹${viewItem.labor.toLocaleString('en-IN')}`],
                ['GST', `${viewItem.gst}%`],
                ['Issued Date', viewItem.date],
                ['Valid Until', viewItem.validity],
                ['Notes', viewItem.notes],
              ].map(([k, v]) => (
                <div className="detail-row" key={k}>
                  <div className="detail-key">{k}</div>
                  <div className="detail-val">{v}</div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewItem(null)}>Close</button>
              <button className="btn btn-outline" onClick={() => downloadPDF(viewItem)}><MdDownload /> Download</button>
              {viewItem.status === 'Pending' && (
                <>
                  <button className="btn btn-success" onClick={() => { setConfirmModal({ id: viewItem.id, action: 'accept' }); setViewItem(null); }}>
                    <MdCheckCircle /> Accept
                  </button>
                  <button className="btn btn-danger" onClick={() => { setConfirmModal({ id: viewItem.id, action: 'reject' }); setViewItem(null); }}>
                    <MdCancel /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: confirmModal.action === 'accept' ? 'var(--green)' : 'var(--red)' }}>
                {confirmModal.action === 'accept' ? 'Accept Quotation?' : 'Reject Quotation?'}
              </span>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>
                {confirmModal.action === 'accept'
                  ? 'By accepting this quotation, you agree to proceed with the service. Our team will contact you to schedule the work.'
                  : 'Are you sure you want to reject this quotation? You can submit a new enquiry if you need a revised quote.'}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button className={`btn ${confirmModal.action === 'accept' ? 'btn-success' : 'btn-danger'}`} onClick={doAction}>
                {confirmModal.action === 'accept' ? <><MdCheckCircle /> Confirm Accept</> : <><MdCancel /> Confirm Reject</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
