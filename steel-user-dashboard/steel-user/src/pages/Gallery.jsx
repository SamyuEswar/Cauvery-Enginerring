import React, { useState } from 'react';
import { MdPhotoLibrary, MdSearch } from 'react-icons/md';
import { useApp } from '../context/AppContext.jsx';

export default function Gallery() {
  const { projects } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const MEDIA_URL = 'http://localhost:5000';

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                        p.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const statusColors = {
    'Completed': 'green',
    'Ongoing': 'blue',
    'Yet to Start': 'orange'
  };

  return (
    <div className="anim-up">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: '0 0 8px 0' }}>Projects Gallery</h1>
          <p style={{ color: 'var(--text)', margin: 0 }}>Browse through our extensive portfolio of projects.</p>
        </div>
      </div>

      <div className="toolbar" style={{ marginBottom: 24 }}>
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
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text2)', background: 'var(--bg)', borderRadius: 16 }}>
          <MdPhotoLibrary size={56} style={{ opacity: 0.1, marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 500 }}>No projects found</div>
          <div style={{ marginTop: 8 }}>Try adjusting your search or filter.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              background: 'var(--bg)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'transform 0.3s'
            }} className="gallery-card">
              <div style={{ position: 'relative', paddingTop: '65%' }}>
                <img 
                  src={`${MEDIA_URL}${p.imageUrl}`} 
                  alt={p.title} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <span className={`badge badge-${statusColors[p.status]}`} style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.5)', border: `1px solid var(--${statusColors[p.status]})`, color: `var(--${statusColors[p.status]})` }}>{p.status}</span>
                </div>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text)', flex: 1, lineHeight: 1.6 }}>
                  {p.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
