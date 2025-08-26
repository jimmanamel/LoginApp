import React from 'react';
import { useAuth } from './AuthContext';

const SessionTimeoutModal = () => {
  const { showModal, countdown, refreshToken } = useAuth();

  if (!showModal) return null;

  const continueSession = () => {
    refreshToken(); // refresh token and reset timers
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Session Expiring</h2>
        <p>Your session will expire in <strong>{countdown}</strong> seconds.</p>
        <button onClick={continueSession}>Continue Session</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
  }
};

export default SessionTimeoutModal;
