import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Toast from './components/Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Customers from './pages/Customers.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Quotations from './pages/Quotations.jsx';
import Services from './pages/Services.jsx';
import Reports from './pages/Reports.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';
import Projects from './pages/Projects.jsx';

function Layout() {
  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-area">
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/customers"     element={<Customers />} />
            <Route path="/enquiries"     element={<Enquiries />} />
            <Route path="/quotations"    element={<Quotations />} />
            <Route path="/services"      element={<Services />} />
            <Route path="/projects"      element={<Projects />} />
            <Route path="/reports"       element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile"       element={<Profile />} />
          </Routes>
        </div>
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout />
      </Router>
    </AppProvider>
  );
}
