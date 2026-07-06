import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Toast = () => {
  const { toast } = useContext(AppContext);

  if (!toast.show) return null;

  return (
    <div className={`toast-container ${toast.type}`}>
      {toast.type === 'success' ? (
        <CheckCircle2 className="toast-icon" size={20} />
      ) : (
        <AlertCircle className="toast-icon" size={20} />
      )}
      <span className="toast-message">{toast.message}</span>
    </div>
  );
};

export default Toast;
