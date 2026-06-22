import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import '../Signup/Signup.css'; 

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const token = searchParams.get('token') || 'dummy-token';
    
    const verify = async () => {
      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now access all features.');
        } else {
          setStatus('error');
          setMessage('Verification failed or link expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    };

    verify();
  }, [searchParams, verifyEmail]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Email Verification</h2>
        
        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>{message}</p>
            {/* Simple spinner */}
            <div style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #6366f1',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '20px auto'
            }}></div>
          </div>
        )}

        {status === 'success' && (
          <div className="auth-success" style={{ padding: '30px' }}>
            <h3>✓ Verified</h3>
            <p>{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="auth-error" style={{ padding: '30px' }}>
            <h3>✕ Error</h3>
            <p>{message}</p>
          </div>
        )}

        <div className="auth-links">
          <Link to="/">Go to Homepage</Link>
          <span style={{ margin: '0 10px' }}>|</span>
          <Link to="/account">Go to Account</Link>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;
