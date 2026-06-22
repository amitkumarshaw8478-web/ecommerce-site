import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import '../Signup/Signup.css'; 

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setMessage('If an account with that email exists, a reset link has been sent. (Dummy: check console or just proceed to /reset-password for demo)');
      } else {
        setError(result.error || 'Failed to send reset link');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Password</h2>
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              disabled={isLoading || message !== ''}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading || message !== ''}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-links">
          Remembered your password? <Link to="/login">Sign In</Link>
          {message && (
             <div style={{ marginTop: '10px' }}>
                <Link to="/reset-password">Click here to demo Reset Password page</Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
