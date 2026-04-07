import React, { useState } from 'react';
import { MdRequestQuote, MdAdd, MdEdit, MdDelete, MdDownload, MdSend, MdVisibility, MdClose } from 'react-icons/md';
import { useApp } from '../context/AppContext.jsx';

const statusBadge = { Pending: 'badge-amber', Approved: 'badge-green', Rejected: 'badge-red' };

const calcTotal = (m, l, g) => {
  const sub = (Number(m) || 0) + (Number(l) || 0);
  return Math.round(sub + sub * (Number(g) || 0) / 100);
};

const emptyForm = () => ({
  customer: '', service: '', material: '', labor: '', gst: 18, validity: '', status: 'Pending'
});

export default function Quotations() {
  const { quotations, setQuotations, customers, services, showToast } = useApp();
  const activeServices = services.filter(s => s.active === true);
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'view'
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const filtered = filter === 'All' ? quotations : quotations.filter(q => q.status === filter);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(emptyForm()); setModal('add'); };
  const openEdit = (q) => {
    setEditId(q.id);
    setForm({ customer: q.customer, service: q.service, material: q.material, labor: q.labor, gst: q.gst, validity: q.validity, status: q.status });
    setModal('edit');
  };

  const save = async () => {
    const total = calcTotal(form.material, form.labor, form.gst);
    
    // Attempt to match the carefully typed customer name to a real user in the DB
    const matchingCustomer = customers.find(c => c.name === form.customer);
    const userId = matchingCustomer ? matchingCustomer.id : null;

    const payload = { ...form, material: +form.material, labor: +form.labor, gst: +form.gst, total };
    if (userId) payload.userId = userId;

    if (modal === 'add') {
      try {
        const res = await fetch('http://localhost:5000/api/quotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const created = await res.json();
        setQuotations(p => [{ ...created, id: created._id, id_display: created.quotationId }, ...p]);
        showToast('Quotation created');
      } catch (err) {
        showToast('Failed to create quotation', 'error');
      }
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/quotations/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const updated = await res.json();
        setQuotations(p => p.map(q => q.id === editId ? { ...q, ...updated, id: updated._id, id_display: updated.quotationId } : q));
        showToast('Quotation updated');
      } catch (err) {
        showToast('Failed to update quotation', 'error');
      }
    }
    setModal(null);
  };

  const deleteQ = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/quotations/${id}`, { method: 'DELETE' });
      setQuotations(p => p.filter(q => q.id !== id));
      setDeleteId(null);
      showToast('Quotation deleted');
    } catch (err) {
      showToast('Failed to delete quotation', 'error');
    }
  };

  const downloadPDF = (q) => {
    const content = `
STEELCRAFT PRO — QUOTATION
===========================
Quotation ID : ${q.id}
Date         : ${q.date}
Validity     : ${q.validity}

Customer     : ${q.customer}
Service      : ${q.service}

COST BREAKDOWN
--------------
Material Cost : ₹${q.material.toLocaleString()}
Labour Cost   : ₹${q.labor.toLocaleString()}
Sub Total     : ₹${(q.material + q.labor).toLocaleString()}
GST (${q.gst}%)    : ₹${(q.total - q.material - q.labor).toLocaleString()}
TOTAL AMOUNT  : ₹${q.total.toLocaleString()}

Status       : ${q.status}

SteelCraft Pro | 12/4 Industrial Estate, Coimbatore - 641010
Phone: +91 98765 43210 | Email: info@steelcraftpro.in
    `.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${q.id}.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast(`Quotation ${q.id} downloaded`);
  };

  const sendToCustomer = (q) => {
    setQuotations(p => p.map(x => x.id === q.id ? { ...x, status: x.status === 'Pending' ? 'Pending' : x.status } : x));
    showToast(`Quotation sent to ${q.customer}`);
  };



  return (
    <div className="anim-up">
      <div className="page-header">
        <div>
          <h1>Quotations</h1>
          <p>{quotations.length} total quotations</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><MdAdd /> New Quotation</button>
      </div>

      {/* Stats */}
      <div className="stats-row mb-24" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total', value: quotations.length, color: 'blue' },
          { label: 'Pending', value: quotations.filter(q => q.status === 'Pending').length, color: 'amber' },
          { label: 'Approved', value: quotations.filter(q => q.status === 'Approved').length, color: 'green' },
          { label: 'Rejected', value: quotations.filter(q => q.status === 'Rejected').length, color: 'red' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ padding: '14px 20px' }}>
            <div className={`stat-icon-box ${s.color}`}><MdRequestQuote /></div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          {['All', 'Pending', 'Approved', 'Rejected'].map(f2 => (
            <button key={f2} className={`filter-tab${filter === f2 ? ' active' : ''}`} onClick={() => setFilter(f2)}>{f2}</button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Customer</th><th>Service</th><th>Material</th><th>Labour</th><th>GST</th><th>Total</th><th>Validity</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(q => (
              <tr key={q.id}>
                <td className="mono" style={{ color: 'var(--accent)' }}>{q.id}</td>
                <td><span className="name">{q.customer}</span></td>
                <td style={{ fontSize: 12 }}>{q.service}</td>
                <td className="mono">₹{q.material.toLocaleString()}</td>
                <td className="mono">₹{q.labor.toLocaleString()}</td>
                <td className="mono">{q.gst}%</td>
                <td className="mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{q.total.toLocaleString()}</td>
                <td className="mono">{q.validity}</td>
                <td><span className={`badge ${statusBadge[q.status]}`}>{q.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" title="View" onClick={() => { setViewItem(q); }}><MdVisibility /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => openEdit(q)}><MdEdit /></button>
                    <button className="btn btn-outline btn-icon btn-sm" title="Download" onClick={() => downloadPDF(q)}><MdDownload /></button>
                    <button className="btn btn-outline btn-icon btn-sm" title="Send" onClick={() => sendToCustomer(q)}><MdSend /></button>
                    <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => setDeleteId(q.id)}><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'add' ? 'New Quotation' : 'Edit Quotation'}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  {customers.length > 0 ? (
                    <select className="form-input" value={form.customer} onChange={e => f('customer', e.target.value)}>
                      {!form.customer && <option value="">-- Select Customer --</option>}
                      {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  ) : (
                    <input className="form-input" value={form.customer} onChange={e => f('customer', e.target.value)} placeholder="Customer name" />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Service Type</label>
                  <select className="form-input" value={form.service} onChange={e => f('service', e.target.value)}>
                    {!form.service && <option value="">-- Select Service --</option>}
                    {activeServices.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Material Cost (₹)</label>
                  <input className="form-input" type="number" value={form.material} onChange={e => f('material', e.target.value)} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Labour Cost (₹)</label>
                  <input className="form-input" type="number" value={form.labor} onChange={e => f('labor', e.target.value)} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">GST (%)</label>
                  <input className="form-input" type="number" value={form.gst} onChange={e => f('gst', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Validity Date</label>
                  <input className="form-input" type="date" value={form.validity} onChange={e => f('validity', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => f('status', e.target.value)}>
                    <option>Pending</option><option>Approved</option><option>Rejected</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)', letterSpacing: 1 }}>TOTAL AMOUNT (incl. GST)</span>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>₹{calcTotal(form.material, form.labor, form.gst).toLocaleString()}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save Quotation</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Quotation — {viewItem.id}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewItem(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', letterSpacing: 2, marginBottom: 6 }}>TOTAL AMOUNT</div>
                <div className="quot-amount">₹{viewItem.total.toLocaleString()}</div>
                <span className={`badge ${statusBadge[viewItem.status]}`} style={{ marginTop: 8 }}>{viewItem.status}</span>
              </div>
              {[['Customer', viewItem.customer], ['Service', viewItem.service], ['Material Cost', `₹${viewItem.material.toLocaleString()}`], ['Labour Cost', `₹${viewItem.labor.toLocaleString()}`], ['GST', `${viewItem.gst}%`], ['Validity', viewItem.validity], ['Date', viewItem.date]].map(([k, v]) => (
                <div className="detail-row" key={k}><div className="detail-key">{k}</div><div className="detail-val">{v}</div></div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewItem(null)}>Close</button>
              <button className="btn btn-outline" onClick={() => downloadPDF(viewItem)}><MdDownload /> Download</button>
              <button className="btn btn-primary" onClick={() => sendToCustomer(viewItem)}><MdSend /> Send</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title" style={{ color: 'var(--red)' }}>Delete Quotation</span></div>
            <div className="modal-body"><p style={{ color: 'var(--text)', fontSize: 14 }}>Delete this quotation permanently?</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteQ(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
