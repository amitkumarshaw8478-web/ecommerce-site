import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import { FiMail, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import './AdminLogin.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { sendOTP } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateInput = (input) => {
    // Check if input is a valid email or a valid phone number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,14}$/;

    const cleanInput = input.trim();
    const cleanPhone = cleanInput.replace(/[\s()-]/g, '');

    if (emailRegex.test(cleanInput)) return 'email';
    if (phoneRegex.test(cleanPhone)) return 'phone';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedInput = identifier.trim();

    if (!trimmedInput) {
      setError('Email or phone number is required');
      return;
    }

    const type = validateInput(trimmedInput);
    if (!type) {
      setError('Please enter a valid email address or phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate/call sendOTP API via context
      const result = await sendOTP(trimmedInput);

      if (result.success) {
        // Redirect to OTP verification page with user details in state
        navigate('/admin-login/verify-otp', {
          state: {
            phoneOrEmail: trimmedInput,
            type: 'forgot-password'
          }
        });
      } else {
        setError(result.error || 'Request failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="card-header-icon">
          <FiMail size={32} />
        </div>
        <h2>Forgot Password</h2>
        <p className="card-subtitle">
          Enter your registered email or phone number and we will send you an OTP to reset your password.
        </p>

        {error && (
          <div className="login-error flex-error">
            <FiAlertCircle className="err-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Email or Phone Number</label>
            <div className="input-with-icon">
              <span className="input-icon"><FiMail /></span>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@example.com or +15550192834"
                disabled={isLoading}
                required
              />
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
                <span className="loading-text">Requesting OTP...</span>
              </span>
            ) : (
              'Send Verification OTP'
            )}
          </button>
        </form>

        <div className="card-footer">
          <Link to="/admin-login" className="back-link">
            <FiArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
