import React, { useState } from 'react';
import { MdPhotoLibrary, MdSearch, MdEdit, MdDelete, MdClose, MdVisibility } from 'react-icons/md';
import { FaPlus, FaCamera } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

export default function Projects() {
  const { projects, setProjects, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [addModal, setAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Yet to Start');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5000/api';
  const MEDIA_URL = 'http://localhost:5000';

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                        p.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const saveAdd = async () => {
    if (!title || !description || !image) {
      showToast('Please fill all fields and select an image', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('image', image);

    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const newProject = await res.json();
        // ensure id maps to _id
        newProject.id = newProject._id;
        setProjects([newProject, ...projects]);
        setAddModal(false);
        setTitle('');
        setDescription('');
        setStatus('Yet to Start');
        setImage(null);
        showToast('Project added successfully');
      } else {
        showToast('Failed to add project', 'error');
      }
    } catch (err) {
      showToast('Error uploading project', 'error');
    }
    setLoading(false);
  };

  const deleteProject = async (id) => {
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setDeleteId(null);
        showToast('Project deleted successfully');
      }
    } catch (err) {
      showToast('Failed to delete project', 'error');
    }
  };

  const statusColors = {
    'Completed': 'green',
    'Ongoing': 'blue',
    'Yet to Start': 'orange'
  };

  return (
    <div className="anim-up">
      <div className="page-header">
        <div>
          <h1>Projects Gallery</h1>
          <p>{projects.length} uploaded projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>
          <FaPlus /> Add Project
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <MdSearch />
          <input placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['All', 'Completed', 'Ongoing', 'Yet to Start'].map(f => (
            <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' }}>
          <MdPhotoLibrary size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <div>No projects found</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, marginTop: 24 }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ position: 'relative', paddingTop: '60%' }}>
                <img 
                  src={`${MEDIA_URL}${p.imageUrl}`} 
                  alt={p.title} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span className={`badge badge-${statusColors[p.status]}`}>{p.status}</span>
                </div>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text)', flex: 1, marginBottom: 16 }}>
                  {p.description.length > 80 ? p.description.substring(0, 80) + '...' : p.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => setDeleteId(p.id)}><MdDelete /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={() => setAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add New Project</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setAddModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Project Image</label>
                  <label style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    height: 140, border: '2px dashed var(--border)', borderRadius: 8, cursor: 'pointer',
                    background: 'var(--bg-hover)', color: 'var(--text)' 
                  }}>
                    {image ? (
                      <span style={{ color: 'var(--accent)' }}>{image.name}</span>
                    ) : (
                      <>
                        <FaCamera size={24} style={{ marginBottom: 8 }} />
                        <span>Click to browse image</span>
                      </>
                    )}
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => {
                      if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
                    }} />
                  </label>
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Title</label>
                  <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Project Title" />
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Completed">Completed</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Yet to Start">Yet to Start</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Project description..." style={{ minHeight: 80 }} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveAdd} disabled={loading}>{loading ? 'Uploading...' : 'Save Project'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: 'var(--red)' }}>Delete Project</span>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text)', fontSize: 14 }}>Are you sure you want to delete this project? The image will be deleted too.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteProject(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
