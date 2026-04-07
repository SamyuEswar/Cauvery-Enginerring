import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPeople, MdContactMail, MdRequestQuote, MdPersonAdd, MdAdd, MdBuildCircle } from 'react-icons/md';
import { FaArrowUp, FaEnvelope, FaUserPlus, FaFileInvoiceDollar } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext.jsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a2232', border: '1px solid #2a3d55', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#f59e0b', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ fontSize: 12, color: p.color }}>{p.name}: {p.name === 'revenue' ? `₹${p.value.toLocaleString()}` : p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { customers, enquiries, quotations } = useApp();

  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const newSignups = customers.filter(c => new Date(c.registered || c.createdAt) >= weekAgo).length;
  const approvedRevenue = quotations.filter(q => q.status === 'Approved').reduce((a, q) => a + q.total, 0);

  const stats = [
    { label: 'Total Customers',    value: customers.length,  icon: MdPeople,       color: 'blue',   delta: `+${newSignups} this week` },
    { label: 'Total Enquiries',    value: enquiries.length,  icon: MdContactMail,  color: 'amber',  delta: `${enquiries.filter(e=>e.status==='New').length} new` },
    { label: 'Quotations Sent',    value: quotations.length, icon: MdRequestQuote, color: 'purple', delta: `${quotations.filter(q=>q.status==='Approved').length} approved` },
    { label: 'Pending Revenue',    value: `₹${quotations.filter(q => q.status === 'Pending').reduce((a, q) => a + q.total, 0).toLocaleString()}`, icon: FaArrowUp, color: 'green',  delta: 'Awaiting' },
  ];

  const activityIcons = { enquiry: FaEnvelope, signup: FaUserPlus, quotation: FaFileInvoiceDollar };

  const recentActivity = useMemo(() => {
    const activities = [];
    customers.forEach(c => activities.push({ id: `c-${c.id}`, type: 'signup', text: `${c.name} registered as a customer`, dateObj: new Date(c.registered || c.createdAt) }));
    enquiries.forEach(e => activities.push({ id: `e-${e.id}`, type: 'enquiry', text: `${e.name} submitted an enquiry`, dateObj: new Date(e.date || e.createdAt) }));
    quotations.forEach(q => activities.push({ id: `q-${q.id}`, type: 'quotation', text: `Quotation ${q.quotationId} generated for ${q.customerName || 'Customer'}`, dateObj: new Date(q.date || q.createdAt) }));
    
    activities.sort((a, b) => b.dateObj - a.dateObj);
    return activities.slice(0, 5).map(a => ({
      ...a,
      time: a.dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }));
  }, [customers, enquiries, quotations]);

  const monthlyData = useMemo(() => {
    const mmap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date();
    d.setDate(1);
    for(let i=5; i>=0; i--) {
      const past = new Date(d);
      past.setMonth(d.getMonth() - i);
      const mStr = monthNames[past.getMonth()];
      mmap[mStr] = { month: mStr, enquiries: 0, revenue: 0, customers: 0 };
    }

    const getMstr = (dateString) => {
      if (!dateString) return null;
      return monthNames[new Date(dateString).getMonth()];
    };

    enquiries.forEach(e => { const m = getMstr(e.date || e.createdAt); if(m && mmap[m]) mmap[m].enquiries++; });
    quotations.forEach(q => { if(q.status === 'Approved') { const m = getMstr(q.date || q.createdAt); if(m && mmap[m]) mmap[m].revenue += (q.total || 0); } });
    customers.forEach(c => { const m = getMstr(c.registered || c.createdAt); if(m && mmap[m]) mmap[m].customers++; });
    
    return Object.values(mmap);
  }, [customers, enquiries, quotations]);

  return (
    <div className="anim-up">
      {/* Stats */}
      <div className="stats-row">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon-box ${s.color}`}><Icon /></div>
              <div className="stat-info">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-delta up">{s.delta}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-title"><BsLightningChargeFill /> Monthly Enquiries</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d40" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="enquiries" fill="#f59e0b" radius={[4, 4, 0, 0]} name="enquiries" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><FaArrowUp style={{ color: '#34d399' }} /> Monthly Revenue (₹)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d40" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 4 }} name="revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-title"><FaEnvelope /> Recent Activity</div>
          {recentActivity.map(a => {
            const Icon = activityIcons[a.type] || FaEnvelope;
            return (
              <div className="activity-item" key={a.id}>
                <div className={`activity-icon ${a.type}`}><Icon /></div>
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            );
          })}
          {recentActivity.length === 0 && <div style={{ fontSize: 12, color: 'var(--text2)', padding: '10px 0' }}>No recent activity found.</div>}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-title"><MdAdd /> Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Add New Quotation',    path: '/quotations',  icon: MdRequestQuote, color: 'var(--accent)' },
              { label: 'Add New Service',      path: '/services',    icon: MdBuildCircle,  color: 'var(--blue)' },
              { label: 'View All Enquiries',   path: '/enquiries',   icon: MdContactMail,  color: 'var(--green)' },
              { label: 'Manage Customers',     path: '/customers',   icon: MdPeople,       color: 'var(--purple)' },
              { label: 'View Reports',         path: '/reports',     icon: FaArrowUp,      color: 'var(--red)' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', width: '100%', gap: 12, padding: '12px 16px' }}
                  onClick={() => navigate(a.path)}
                >
                  <Icon style={{ color: a.color, width: 18, height: 18 }} />
                  <span style={{ color: 'var(--white)', fontWeight: 500 }}>{a.label}</span>
                </button>
              );
            })}
          </div>

          {/* Revenue Summary */}
          <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Approved Revenue</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700, color: 'var(--green)' }}>₹{approvedRevenue.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>From {quotations.filter(q => q.status === 'Approved').length} approved quotations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
