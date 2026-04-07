import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import { Topbar, Toast } from './components/Topbar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Quotations from './pages/Quotations.jsx';
import Services from './pages/Services.jsx';
import Notifications from './pages/Notifications.jsx';
import Support from './pages/Support.jsx';
import Gallery from './pages/Gallery.jsx';
import WhatsAppButton from "./components/WhatsAppButton";
function ProtectedLayout() {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-area">
          <Routes>
            <Route path="/"              element={<Dashboard />}     />
            <Route path="/profile"       element={<Profile />}       />
            <Route path="/enquiries"     element={<Enquiries />}     />
            <Route path="/quotations"    element={<Quotations />}    />
            <Route path="/services"      element={<Services />}      />
            <Route path="/gallery"       element={<Gallery />}       />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/support"       element={<Support />}       />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      <Toast />
      <WhatsAppButton />
    </div>
  );
}

function AppRoutes() {
  const { user } = useApp();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*"     element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}
