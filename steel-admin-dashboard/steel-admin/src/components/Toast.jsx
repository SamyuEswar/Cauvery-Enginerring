import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useApp } from '../context/AppContext.jsx';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className={`toast${toast.type === 'error' ? ' error' : ''}`}>
      {toast.type === 'error' ? <FaTimes style={{ width: 12, height: 12 }} /> : <FaCheck style={{ width: 12, height: 12 }} />}
      {toast.msg}
    </div>
  );
}
