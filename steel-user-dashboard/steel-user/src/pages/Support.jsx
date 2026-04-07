import React, { useState, useRef, useEffect } from 'react';
import {
  MdHeadsetMic, MdAdd, MdClose, MdSend,
  MdCheckCircle, MdPending, MdVisibility
} from 'react-icons/md';
import { FaUserCircle, FaRobot } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

const priorityBadge = { High: 'badge-red', Normal: 'badge-blue', Low: 'badge-gray' };
const statusIcon    = { Open: MdPending, Closed: MdCheckCircle };

export default function Support() {
  const { user, tickets, addTicket, chatMessages, sendChatMessage, showToast } = useApp();
  const [tab, setTab]       = useState('tickets');
  const [newModal, setNewModal] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [form, setForm]     = useState({ subject: '', priority: 'Normal', desc: '' });
  const chatEndRef          = useRef(null);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (tab === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, tab]);

  const submitTicket = () => {
    if (!form.subject.trim() || !form.desc.trim()) { showToast('Please fill all fields', 'error'); return; }
    addTicket(form.subject, form.priority, form.desc);
    setNewModal(false);
    setForm({ subject: '', priority: 'Normal', desc: '' });
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="anim-up">
      <div className="page-header">
        <h1>Support Centre</h1>
        <p>Raise tickets or chat directly with our team</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {[['tickets','Support Tickets'], ['chat','Live Chat']].map(([k, l]) => (
          <button
            key={k}
            className={`filter-tab${tab === k ? ' active' : ''}`}
            style={{ padding: '10px 22px', fontSize: 13 }}
            onClick={() => setTab(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── TICKETS TAB ── */}
      {tab === 'tickets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
            <button className="btn btn-primary" onClick={() => setNewModal(true)}>
              <MdAdd /> Raise New Ticket
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <MdHeadsetMic style={{ width: 48, height: 48 }} />
                <p>No support tickets yet</p>
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Ticket ID</th><th>Subject</th><th>Date</th><th>Priority</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {tickets.map(t => {
                    const SIcon = statusIcon[t.status] || MdPending;
                    return (
                      <tr key={t.id}>
                        <td className="td-mono" style={{ color: 'var(--accent)' }}>{t.id}</td>
                        <td><span className="td-main">{t.subject}</span></td>
                        <td className="td-mono">{t.date}</td>
                        <td><span className={`badge ${priorityBadge[t.priority]}`}>{t.priority}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <SIcon style={{ width: 15, height: 15, color: t.status === 'Closed' ? 'var(--green)' : 'var(--accent)' }} />
                            <span style={{ fontSize: 12, color: t.status === 'Closed' ? 'var(--green)' : 'var(--accent)' }}>{t.status}</span>
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewTicket(t)}><MdVisibility /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* FAQ */}
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-title"><MdHeadsetMic /> Frequently Asked Questions</div>
            {[
              ['How long does fabrication usually take?', 'Lead times vary from 3–10 working days depending on complexity and order size. Rush orders can be accommodated upon request.'],
              ['Can I request changes to a quotation?', 'Yes! Submit a new enquiry with updated specifications or contact us directly and we will revise the quotation.'],
              ['What payment methods do you accept?', 'We accept bank transfer (NEFT/RTGS/IMPS), UPI, and cheque payments. 50% advance is required to begin work.'],
              ['Do you provide installation services?', 'Yes, we offer professional on-site installation for all fabricated structures. Charges are included in the quotation.'],
            ].map(([q, a]) => (
              <div key={q} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)', marginBottom: 6 }}>{q}</div>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {tab === 'chat' && (
        <div className="card card-shine">
          {/* Chat header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accentd)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaRobot style={{ color: 'var(--accent)', width: 20, height: 20 }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--white)', fontWeight: 600 }}>Cauvery Support</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
                <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>Online · Mon–Sat 9AM–6PM</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                <div className="chat-avatar">
                  {msg.sender === 'admin' ? <FaRobot /> : <FaUserCircle />}
                </div>
                <div>
                  <div className="chat-bubble">{msg.text}</div>
                  <div className="chat-time">{msg.time}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Type your message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
            />
            <button className="btn btn-primary btn-icon" onClick={sendChat} disabled={!chatInput.trim()}>
              <MdSend />
            </button>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {newModal && (
        <div className="modal-overlay" onClick={() => setNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Raise Support Ticket</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setNewModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="field full">
                  <label className="field-label">Subject</label>
                  <input className="field-input" value={form.subject} onChange={e => f('subject', e.target.value)} placeholder="Brief subject of the issue" />
                </div>
                <div className="field full">
                  <label className="field-label">Priority</label>
                  <select className="field-input" value={form.priority} onChange={e => f('priority', e.target.value)}>
                    <option>Normal</option>
                    <option>High</option>
                    <option>Low</option>
                  </select>
                </div>
                <div className="field full">
                  <label className="field-label">Description</label>
                  <textarea className="field-input" rows={5} value={form.desc} onChange={e => f('desc', e.target.value)} placeholder="Describe your issue in detail..." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setNewModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitTicket}>
                <MdSend /> Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Ticket Modal */}
      {viewTicket && (
        <div className="modal-overlay" onClick={() => setViewTicket(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Ticket — {viewTicket.id}</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewTicket(null)}><MdClose /></button>
            </div>
            <div className="modal-body">
              {[
                ['Subject',  viewTicket.subject],
                ['Date',     viewTicket.date],
                ['Priority', viewTicket.priority],
                ['Status',   viewTicket.status],
              ].map(([k, v]) => (
                <div className="detail-row" key={k}><div className="detail-key">{k}</div><div className="detail-val">{v}</div></div>
              ))}
              <div style={{ marginTop: 16, padding: '14px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div className="field-label" style={{ marginBottom: 8 }}>Admin Response</div>
                <p style={{ fontSize: 13.5, color: 'var(--white)', lineHeight: 1.7 }}>{viewTicket.lastReply}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewTicket(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* 📍 Location Section */}
<div className="card" style={{ marginTop: 24 }}>
  <div className="card-title">📍 Our Location</div>

  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.0030106248364!2d77.70242227481353!3d11.334490088850265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f25a713475f%3A0x525be6dcdf736008!2sCauvery%20Engineerings!5e0!3m2!1sen!2sin!4v1775404135866!5m2!1sen!2sin"
    width="100%"
    height="300"
    style={{ border: 0, borderRadius: "10px" }}
    loading="lazy"
  ></iframe>
</div>
    </div>
  );
}
