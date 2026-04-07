import React, { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext(null);
const API_URL = 'http://localhost:5000/api';

export function AppProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [enquiries, setEnquiries]     = useState([]);
  const [quotations, setQuotations]   = useState([]);
  const [services, setServices]       = useState([]);
  const [projects, setProjects]       = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tickets, setTickets]         = useState([]); 
  const [chatMessages, setChatMessages] = useState([]);
  const [toast, setToast]             = useState(null);

  useEffect(() => {
    // Try to auto-login if token exists
    const token = localStorage.getItem('user_token');
    const u = localStorage.getItem('user_data');
    if (token && u) {
      const parsed = JSON.parse(u);
      setUser({ ...parsed, id: parsed.id || parsed._id });
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setEnquiries([]);
      setQuotations([]);
      setNotifications([]);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const [enqRes, quoRes, serRes, projRes, notRes] = await Promise.all([
        fetch(`${API_URL}/enquiries?userId=${user.id}`).then(r => r.json()),
        fetch(`${API_URL}/quotations?userId=${user.id}`).then(r => r.json()),
        fetch(`${API_URL}/services`).then(r => r.json()),
        fetch(`${API_URL}/projects`).then(r => r.json()),
        fetch(`${API_URL}/notifications?userId=${user.id}`).then(r => r.json())
      ]);
      setEnquiries(enqRes.map(x => ({ ...x, id: x._id })));
      setQuotations(quoRes.map(x => ({ ...x, id: x._id, id_display: x.quotationId })));
      setServices(serRes.map(x => ({ ...x, id: x._id })));
      setProjects(projRes.map(x => ({ ...x, id: x._id })));
      setNotifications(notRes.map(x => ({ ...x, id: x._id })));
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Login failed', 'error');
        return false;
      }
      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      setUser({ ...data.user, id: data.user.id || data.user._id });
      return true;
    } catch (error) {
      showToast('Network error', 'error');
      return false;
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role: 'user' })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registration failed', 'error');
        return false;
      }
      return await login(email, password);
    } catch (error) {
      showToast('Network error', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      if (user) {
        await fetch(`${API_URL}/notifications/mark-all`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
      }
      setNotifications(p => p.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markOneRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }});
      setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
      setNotifications(p => p.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addEnquiry = async (message) => {
    if(!user) return;
    try {
      const res = await fetch(`${API_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name: user.name, phone: user.phone || 'N/A', message, status: 'New' })
      });
      if(res.ok) fetchUserData();
    } catch (err) {
      console.error(err);
    }
  };

  const acceptQuotation = async (id) => {
    try {
      await fetch(`${API_URL}/quotations/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      fetchUserData();
      showToast('Quotation accepted successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const rejectQuotation = async (id) => {
    try {
      await fetch(`${API_URL}/quotations/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' })
      });
      fetchUserData();
      showToast('Quotation rejected', 'error');
    } catch (err) {
      console.error(err);
    }
  };

  const addTicket = (subject, priority, desc) => {
    const t = { id: `TK-${String(tickets.length + 1).padStart(3,'0')}`, subject, date: new Date().toISOString().split('T')[0], status: 'Open', priority, lastReply: desc };
    setTickets(p => [t, ...p]);
    showToast('Support ticket raised successfully');
  };

  const sendChatMessage = (text) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setChatMessages(p => [...p, { id: Date.now(), sender: 'user', text, time }]);
    setTimeout(() => {
      setChatMessages(p => [...p, { id: Date.now() + 1, sender: 'admin', text: 'Thank you for your message. Our team will respond to your query shortly during business hours (Mon–Sat, 9AM–6PM).', time }]);
    }, 1200);
  };

  return (
    <Ctx.Provider value={{
      user, setUser, login, register, logout,
      enquiries, setEnquiries, addEnquiry,
      quotations, setQuotations, acceptQuotation, rejectQuotation,
      services, projects,
      notifications, unreadNotifs, markAllRead, markOneRead, deleteNotif,
      tickets, addTicket,
      chatMessages, sendChatMessage,
      toast, showToast, fetchUserData
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
