import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import { FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './AdminLogin.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  const phoneOrEmail = location.state?.phoneOrEmail || '';
  const otp = location.state?.otp || '';
  const isVerified = location.state?.verified || false;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Basic password strength analysis
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Weak',
    color: '#e74c3c'
  });

  // Safeguard: Redirect if not verified via OTP
  useEffect(() => {
    if (!isVerified || !phoneOrEmail || !otp) {
      navigate('/admin-login', { replace: true });
    }
  }, [isVerified, phoneOrEmail, otp, navigate]);

  // Analyze password strength as user types
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, label: 'Weak', color: '#e74c3c' });
      return;
    }

    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    let label = 'Weak';
    let color = '#e74c3c';

    if (score === 2) {
      label = 'Medium';
      color = '#f39c12';
    } else if (score >= 3) {
      label = 'Strong';
      color = '#2ecc71';
    }

    setPasswordStrength({ score, label, color });
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(phoneOrEmail, newPassword);

      if (result.success) {
        setSuccess(true);
        // After 3 seconds, redirect to regular admin login
        setTimeout(() => {
          navigate('/admin-login', { 
            state: { message: 'Your password was reset successfully. Please log in with your new credentials.' },
            replace: true 
          });
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred during password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card text-center success-card animate-fade-in">
          <div className="card-header-icon success-icon">
            <FiCheckCircle size={48} />
          </div>
          <h2>Password Reset Successful!</h2>
          <p className="card-subtitle">
            Your admin login credentials have been securely updated.
          </p>
          <div className="alert-message success-alert">
            Redirecting to Admin Login page in a few seconds...
          </div>
          <div className="card-footer">
            <Link to="/admin-login" className="btn-primary-link">
              Go to Login Immediately
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="card-header-icon">
          <FiLock size={32} />
        </div>
        <h2>Reset Password</h2>
        <p className="card-subtitle">
          Please choose a strong, secure new password for your admin account.
        </p>

        {error && (
          <div className="login-error flex-error">
            <FiAlertCircle className="err-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-with-icon password-input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex="-1"
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            
            {newPassword && (
              <div className="password-strength-indicator">
                <div className="strength-bar-bg">
                  <div 
                    className="strength-bar-fill" 
                    style={{ 
                      width: `${(passwordStrength.score / 4) * 100}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  ></div>
                </div>
                <span className="strength-label" style={{ color: passwordStrength.color }}>
                  Strength: <strong>{passwordStrength.label}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-with-icon password-input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`btn-primary ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-container">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="loading-text">Resetting Password...</span>
              </span>
            ) : (
              'Confirm Password Reset'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
