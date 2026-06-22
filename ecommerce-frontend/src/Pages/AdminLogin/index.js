import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiPhone, FiAlertCircle } from 'react-icons/fi';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAdmin, authError, clearAuthError, logout } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const from = location.state?.from?.pathname || '/admin';
  const loginMessage = location.state?.message;

  // Clear auth error when navigating to this page
  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  // Handle redirect if already logged in as Admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(from, { replace: true });
    } else if (isAuthenticated && !isAdmin) {
      logout();
      setFormError('Access denied: Administrator privileges required.');
    }
  }, [isAuthenticated, isAdmin, navigate, from, logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password) {
      setFormError('Email and Password are required.');
      return;
    }

    setIsLoading(true);

    try {
      // FIXING ISSUES: Added await since login is an asynchronous operation returning a promise
      const result = await login(email.trim(), password);

      if (result.success) {
        if (result.user.role === 'admin') {
          navigate(from, { replace: true });
        } else {
          logout();
          setFormError('Access denied: Administrator privileges required.');
        }
      } else {
        setFormError(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (error) {
      setFormError('An unexpected service error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="card-header-icon">
          <FiShield size={32} />
        </div>
        <h2>Admin Portal</h2>
        <p className="card-subtitle">Please enter your administrative credentials to access the console.</p>

        {loginMessage && (
          <div className="login-info-message">
            <span>{loginMessage}</span>
          </div>
        )}

        {(formError || authError) && (
          <div className="login-error flex-error">
            <FiAlertCircle className="err-icon" />
            <span>{formError || authError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="adminIdentifier">Email or Phone Number</label>
            <div className="input-with-icon">
              <span className="input-icon"><FiMail /></span>
              <input
                id="adminIdentifier"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com or +15550192834"
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adminPassword">Password</label>
            <div className="input-with-icon password-input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-actions-row">
            <label className="remember-me">
              <input type="checkbox" disabled={isLoading} />
              <span>Remember me</span>
            </label>
            <Link to="/admin-login/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className={`btn-primary ${isLoading ? 'btn-loading' : ''}`} 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-container">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="loading-text">Authenticating...</span>
              </span>
            ) : (
              'Access Portal'
            )}
          </button>
        </form>

        <div className="divider-or">or</div>

        <Link to="/admin-login/phone-login" style={{ textDecoration: 'none' }}>
          <button className="btn-secondary-outline" type="button" disabled={isLoading}>
            <FiPhone /> Log In with Phone Number
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;
