import React, { useState, useMemo } from 'react';
import { MdBarChart, MdDownload, MdTableChart } from 'react-icons/md';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { useApp } from '../context/AppContext.jsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a2232', border: '1px solid #2a3d55', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#f59e0b', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ fontSize: 12, color: p.color }}>
            {p.name}: {p.name === 'Revenue' ? `₹${p.value.toLocaleString()}` : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const { customers, enquiries, quotations, showToast } = useApp();
  const [activeReport, setActiveReport] = useState('enquiry');

  const approvedRevenue = quotations.filter(q => q.status === 'Approved').reduce((a, q) => a + q.total, 0);
  const pendingRevenue = quotations.filter(q => q.status === 'Pending').reduce((a, q) => a + q.total, 0);

  const monthlyData = useMemo(() => {
    const mmap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date();
    d.setDate(1);
    for(let i=5; i>=0; i--) {
      const past = new Date(d);
      past.setMonth(d.getMonth() - i);
      const mStr = `${monthNames[past.getMonth()]} ${past.getFullYear().toString().slice(2)}`;
      mmap[mStr] = { month: mStr, enquiries: 0, revenue: 0, customers: 0 };
    }

    const getMstr = (dateString) => {
      if (!dateString) return null;
      const t = new Date(dateString);
      return `${monthNames[t.getMonth()]} ${t.getFullYear().toString().slice(2)}`;
    };

    enquiries.forEach(e => { const m = getMstr(e.date || e.createdAt); if(m && mmap[m]) mmap[m].enquiries++; });
    quotations.forEach(q => { if(q.status === 'Approved') { const m = getMstr(q.date || q.createdAt); if(m && mmap[m]) mmap[m].revenue += (q.total || 0); } });
    customers.forEach(c => { const m = getMstr(c.registered || c.createdAt); if(m && mmap[m]) mmap[m].customers++; });
    
    return Object.values(mmap);
  }, [customers, enquiries, quotations]);

  const downloadReport = (format) => {
    if (format === 'txt') {
      const lines = [
        'CAUVERY ENGINEERINGS — ADMIN REPORT',
        '================================',
        `Generated: ${new Date().toLocaleString()}`,
        '',
        'SUMMARY',
        `Total Customers  : ${customers.length}`,
        `Total Enquiries  : ${enquiries.length}`,
        `New Enquiries    : ${enquiries.filter(e => e.status === 'New').length}`,
        `Total Quotations : ${quotations.length}`,
        `Approved Revenue : ₹${approvedRevenue.toLocaleString()}`,
        `Pending Revenue  : ₹${pendingRevenue.toLocaleString()}`,
        '',
        'MONTHLY DATA (Last 6 Months)',
        'Month  | Enquiries | Revenue     | Customers',
        ...monthlyData.map(m => `${m.month.padEnd(6)} | ${String(m.enquiries).padEnd(9)} | ₹${String(m.revenue).padEnd(10)} | ${m.customers}`)
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `cauvery-report-${Date.now()}.txt`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const csv = [
        'Month,Enquiries,Revenue,Customers',
        ...monthlyData.map(m => `${m.month},${m.enquiries},${m.revenue},${m.customers}`)
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `cauvery-report-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
    showToast(`Report downloaded as ${format.toUpperCase()}`);
  };

  const avgMonthlyEnq = monthlyData.length ? Math.round(monthlyData.reduce((a, m) => a + m.enquiries, 0) / monthlyData.length) : 0;
  const newCustCount = monthlyData.reduce((a, m) => a + m.customers, 0);

  const summaryCards = [
    { label: 'Total Revenue', value: `₹${approvedRevenue.toLocaleString()}`, sub: 'From approved quotations', color: 'var(--green)' },
    { label: 'Pending Revenue', value: `₹${pendingRevenue.toLocaleString()}`, sub: 'Awaiting approval', color: 'var(--accent)' },
    { label: 'Avg Monthly Enquiries', value: avgMonthlyEnq, sub: 'Last 6 months', color: 'var(--blue)' },
    { label: 'Customer Growth', value: `+${newCustCount}`, sub: 'New in last 6 months', color: 'var(--purple)' },
  ];

  return (
    <div className="anim-up">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Business performance overview</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => downloadReport('txt')}><FaFilePdf /> Download PDF</button>
          <button className="btn btn-primary" onClick={() => downloadReport('csv')}><FaFileExcel /> Download Excel</button>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-row mb-24">
        {summaryCards.map(c => (
          <div className="stat-card" key={c.label}>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{c.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Tabs */}
      <div className="card mb-24">
        <div className="flex-between mb-16">
          <div className="card-title" style={{ marginBottom: 0 }}><MdBarChart /> Analytics</div>
          <div className="filter-tabs">
            {[['enquiry', 'Enquiries'], ['revenue', 'Revenue'], ['customers', 'Customers']].map(([k, l]) => (
              <button key={k} className={`filter-tab${activeReport === k ? ' active' : ''}`} onClick={() => setActiveReport(k)}>{l}</button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          {activeReport === 'enquiry' ? (
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d40" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="enquiries" name="Enquiries" fill="#38bdf8" radius={[4,4,0,0]} />
            </BarChart>
          ) : activeReport === 'revenue' ? (
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d40" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#34d399" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          ) : (
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d40" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Share Tech Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="customers" name="Customers" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 5 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Monthly Data Table */}
      <div className="card">
        <div className="card-title"><MdTableChart /> Monthly Data Table</div>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr><th>Month</th><th>Enquiries</th><th>Revenue (₹)</th><th>New Customers</th><th>Avg Quotation</th></tr>
            </thead>
            <tbody>
              {monthlyData.map(m => (
                <tr key={m.month}>
                  <td style={{ fontFamily: 'var(--font-head)', color: 'var(--white)', fontWeight: 600 }}>{m.month}</td>
                  <td className="mono">{m.enquiries}</td>
                  <td className="mono" style={{ color: 'var(--green)' }}>₹{m.revenue.toLocaleString()}</td>
                  <td className="mono">{m.customers}</td>
                  <td className="mono" style={{ color: 'var(--accent)' }}>₹{m.enquiries ? Math.round(m.revenue / m.enquiries).toLocaleString() : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
