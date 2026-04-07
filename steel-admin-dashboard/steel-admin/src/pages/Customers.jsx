import React, { useState } from 'react';
import { MdPeople, MdSearch, MdEdit, MdDelete, MdBlock, MdCheckCircle, MdVisibility, MdClose } from 'react-icons/md';
import { FaPlus, FaUserCircle } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

export default function Customers() {
  const { customers, setCustomers, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'Active' });

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchFilter = filter === 'All' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const openEdit = (c) => { setEditModal(c); setForm({ name: c.name, email: c.email, phone: c.phone, status: c.status }); };

  const saveEdit = () => {
    setCustomers(prev => prev.map(c => c.id === editModal.id ? { ...c, ...form } : c));
    setEditModal(null);
    showToast('Customer updated successfully');
  };

  const saveAdd = () => {
    const newC = { id: Date.now(), ...form, registered: new Date().toISOString().split('T')[0] };
    setCustomers(prev => [newC, ...prev]);
    setAddModal(false);
    setForm({ name: '', email: '', phone: '', status: 'Active' });
    showToast('Customer added successfully');
  };

  const toggleStatus = (id) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Blocked' : 'Active' } : c));
    showToast('Customer status updated');
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
    if (selected?.id === id) setSelected(null);
    showToast('Customer deleted');
  };

  const FormModal = ({ title, onSave, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><MdClose /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            {[['Full Name','name','text'],['Email','email','email'],['Phone','phone','tel']].map(([label, key, type]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={label} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option>Active</option><option>Blocked</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="anim-up">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>{customers.length} total customers registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', email: '', phone: '', status: 'Active' }); setAddModal(true); }}>
          <FaPlus /> Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row mb-24" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {[
          { label: 'Total', value: customers.length, color: 'blue' },
          { label: 'Active', value: customers.filter(c => c.status === 'Active').length, color: 'green' },
          { label: 'Blocked', value: customers.filter(c => c.status === 'Blocked').length, color: 'red' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ padding: '14px 20px' }}>
            <div className={`stat-icon-box ${s.color}`}><MdPeople /></div>
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
          <input placeholder="Search by name, email or phone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['All', 'Active', 'Blocked'].map(f => (
            <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Email</th><th>Phone</th>
              <th>Registered</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id}>
                <td className="mono">{i + 1}</td>
                <td><span className="name">{c.name}</span></td>
                <td className="mono" style={{ fontSize: 12 }}>{c.email}</td>
                <td className="mono">{c.phone}</td>
                <td className="mono">{c.registered}</td>
                <td><span className={`badge badge-${c.status === 'Active' ? 'green' : 'red'}`}>{c.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" title="View" onClick={() => setSelected(c)}><MdVisibility /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => openEdit(c)}><MdEdit /></button>
                    <button className={`btn btn-icon btn-sm ${c.status === 'Active' ? 'btn-danger' : 'btn-outline'}`} title={c.status === 'Active' ? 'Block' : 'Activate'} onClick={() => toggleStatus(c.id)}>
                      {c.status === 'Active' ? <MdBlock /> : <MdCheckCircle />}
                    </button>
                    <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => setDeleteId(c.id)}><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Customer Details</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelected(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, padding: '16px', background: 'var(--bg)', borderRadius: 8 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accentd)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaUserCircle style={{ color: 'var(--accent)', width: 28, height: 28 }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--white)' }}>{selected.name}</div>
                  <span className={`badge badge-${selected.status === 'Active' ? 'green' : 'red'}`}>{selected.status}</span>
                </div>
              </div>
              {[['Email', selected.email], ['Phone', selected.phone], ['Registered', selected.registered], ['Status', selected.status]].map(([k, v]) => (
                <div className="detail-row" key={k}>
                  <div className="detail-key">{k}</div>
                  <div className="detail-val">{v}</div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { openEdit(selected); setSelected(null); }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && <FormModal title="Edit Customer" onSave={saveEdit} onClose={() => setEditModal(null)} />}

      {/* Add Modal */}
      {addModal && <FormModal title="Add Customer" onSave={saveAdd} onClose={() => setAddModal(false)} />}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: 'var(--red)' }}>Delete Customer</span>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text)', fontSize: 14 }}>Are you sure you want to delete this customer? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteCustomer(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
