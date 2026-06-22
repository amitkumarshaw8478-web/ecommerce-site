import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import { FiPhone, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import './AdminLogin.css';

const PhoneLogin = () => {
  const navigate = useNavigate();
  const { sendOTP } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePhone = (phone) => {
    // Basic phone regex (allows + and digits, min 10 chars)
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phoneNumber.replace(/[\s()-]/g, '');

    if (!cleanPhone) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhone(cleanPhone)) {
      setError('Please enter a valid phone number (10-14 digits)');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate/call sendOTP API via context
      const result = await sendOTP(cleanPhone);
      
      if (result.success) {
        // Redirect to OTP verification screen with phoneNumber in state
        navigate('/admin-login/verify-otp', { 
          state: { 
            phoneOrEmail: phoneNumber, 
            type: 'phone-login' 
          } 
        });
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
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
          <FiPhone size={32} />
        </div>
        <h2>Phone Authentication</h2>
        <p className="card-subtitle">Enter your registered admin phone number to receive a secure OTP code.</p>

        {error && (
          <div className="login-error flex-error">
            <FiAlertCircle className="err-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <div className="input-with-icon">
              <span className="input-icon"><FiPhone /></span>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 019-2834"
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
                <span className="loading-text">Sending OTP...</span>
              </span>
            ) : (
              'Send OTP Code'
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

export default PhoneLogin;
