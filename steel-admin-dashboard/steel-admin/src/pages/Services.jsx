import React, { useState } from 'react';
import { MdBuildCircle, MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import { useApp } from '../context/AppContext.jsx';

const emptyForm = () => ({ name: '', price: '', description: '', active: true });

export default function Services() {
  const { services, setServices, showToast } = useApp();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(emptyForm()); setModal('add'); };
  const openEdit = (s) => { setEditId(s.id); setForm({ name: s.name, price: s.price, description: s.description, active: s.active }); setModal('edit'); };

  const save = async () => {
    if (modal === 'add') {
      try {
        const res = await fetch('http://localhost:5000/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        const savedService = await res.json();
        setServices(p => [...p, { ...savedService, id: savedService._id }]);
        showToast('Service added');
      } catch (err) {
        showToast('Failed to add service', 'error');
      }
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/services/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        const updated = await res.json();
        setServices(p => p.map(s => s.id === editId ? { ...s, ...updated } : s));
        showToast('Service updated');
      } catch (err) {
        showToast('Failed to update service', 'error');
      }
    }
    setModal(null);
  };

  const toggleActive = async (id) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    try {
      const res = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !service.active })
      });
      const updated = await res.json();
      setServices(p => p.map(s => s.id === id ? { ...s, active: updated.active } : s));
      showToast('Service status updated');
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const deleteService = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/services/${id}`, { method: 'DELETE' });
      setServices(p => p.filter(s => s.id !== id));
      setDeleteId(null);
      showToast('Service deleted');
    } catch (err) {
      showToast('Failed to delete service', 'error');
    }
  };

  return (
    <div className="anim-up">
      <div className="page-header">
        <div>
          <h1>Services</h1>
          <p>Control which services appear on your website</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><MdAdd /> Add Service</button>
      </div>

      <div className="stats-row mb-24" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {[
          { label: 'Total', value: services.length, color: 'blue' },
          { label: 'Active', value: services.filter(s => s.active).length, color: 'green' },
          { label: 'Inactive', value: services.filter(s => !s.active).length, color: 'red' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ padding: '14px 20px' }}>
            <div className={`stat-icon-box ${s.color}`}><MdBuildCircle /></div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="service-grid">
        {services.map(s => (
          <div className="service-card-admin" key={s.id} style={{ borderColor: s.active ? 'var(--border)' : 'var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accentd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MdBuildCircle style={{ color: 'var(--accent)', width: 20, height: 20 }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>{s.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>{s.price}</div>
                </div>
              </div>
              <button className={`service-status-toggle ${s.active ? 'on' : 'off'}`} onClick={() => toggleActive(s.id)} title={s.active ? 'Deactivate' : 'Activate'} />
            </div>

            <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, marginBottom: 14 }}>{s.description}</p>

            <div style={{ display: 'flex', gap: 8 }}>
              <span className={`badge ${s.active ? 'badge-green' : 'badge-gray'}`}>{s.active ? 'Active' : 'Inactive'}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)}><MdEdit /></button>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(s.id)}><MdDelete /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'add' ? 'Add Service' : 'Edit Service'}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Steel Fabrication" />
                </div>
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <input className="form-input" value={form.price} onChange={e => f('price', e.target.value)} placeholder="e.g. From ₹5,000" />
                </div>
                <div className="form-group full">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={form.description} onChange={e => f('description', e.target.value)} placeholder="Service description…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.active ? 'active' : 'inactive'} onChange={e => f('active', e.target.value === 'active')}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save Service</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title" style={{ color: 'var(--red)' }}>Delete Service</span></div>
            <div className="modal-body"><p style={{ color: 'var(--text)', fontSize: 14 }}>Delete this service permanently?</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteService(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
