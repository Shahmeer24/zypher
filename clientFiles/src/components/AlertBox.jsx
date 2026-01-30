import React, { useEffect, useState } from 'react';
import './AlertBox.css';

function AlertBox({ type, message, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      const fadeTimer = setTimeout(onClose, 500);
      return () => clearTimeout(fadeTimer);
    }
  }, [visible, onClose]);

  return (
    <div className={`alert-box ${type} ${visible ? 'show' : 'hide'}`}>
      <p>{message}</p>
    </div>
  );
}

export default AlertBox;