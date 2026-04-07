import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);
const API_URL = 'http://localhost:5000/api';

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User', email: 'admin@steelcraftpro.in',
    phone: '+91 98765 43210', avatar: '', role: 'Super Admin'
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cusRes, enqRes, quoRes, serRes, projRes, notRes] = await Promise.all([
        fetch(`${API_URL}/customers`).then(r => r.json()),
        fetch(`${API_URL}/enquiries`).then(r => r.json()),
        fetch(`${API_URL}/quotations`).then(r => r.json()),
        fetch(`${API_URL}/services`).then(r => r.json()),
        fetch(`${API_URL}/projects`).then(r => r.json()),
        fetch(`${API_URL}/notifications`).then(r => r.json())
      ]);
      // map _id to id so we don't break existing components
      setCustomers(cusRes.map(item => ({ ...item, id: item._id })));
      setEnquiries(enqRes.map(item => ({ ...item, id: item._id })));
      setQuotations(quoRes.map(item => ({ ...item, id: item._id })));
      setServices(serRes.map(item => ({ ...item, id: item._id })));
      setProjects(projRes.map(item => ({ ...item, id: item._id })));
      setNotifications(notRes.map(item => ({ ...item, id: item._id })));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/mark-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // admin has no userId
      });
      setNotifications(n => n.map(x => ({ ...x, read: true })));
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <AppContext.Provider value={{
      customers, setCustomers,
      enquiries, setEnquiries,
      quotations, setQuotations,
      services, setServices,
      notifications, setNotifications,
      adminProfile, setAdminProfile,
      toast, showToast,
      unreadCount, markAllRead,
      projects, setProjects,
      fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
