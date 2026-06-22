import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import { FiKey, FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './AdminLogin.css';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, sendOTP, loginWithPhone } = useAuth();

  // Retrieve state passed from previous screens
  const phoneOrEmail = location.state?.phoneOrEmail || '';
  const flowType = location.state?.type || ''; // 'phone-login' or 'forgot-password'

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Refs for auto-focusing next/prev input
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // If no email/phone was provided, redirect to admin-login
  useEffect(() => {
    if (!phoneOrEmail) {
      navigate('/admin-login', { replace: true });
    }
  }, [phoneOrEmail, navigate]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle digit change
  const handleDigitChange = (index, value) => {
    // Only allow single numeric digits
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    const newDigits = [...otpDigits];
    // In case user pastes a multi-character code
    if (cleanValue.length > 1) {
      const pastedDigits = cleanValue.slice(0, 6).split('');
      pastedDigits.forEach((char, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = char;
        }
      });
      setOtpDigits(newDigits);
      
      // Focus on last filled input or the 6th input
      const nextFocusIdx = Math.min(index + pastedDigits.length, 5);
      inputRefs[nextFocusIdx].current.focus();
      return;
    }

    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (index < 5 && cleanValue) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle OTP Resend
  const handleResend = async () => {
    if (!canResend) return;

    setError('');
    setSuccessMessage('');
    setOtpDigits(['', '', '', '', '', '']);
    setTimer(59);
    setCanResend(false);

    try {
      const result = await sendOTP(phoneOrEmail);
      if (result.success) {
        setSuccessMessage('A new secure code has been sent.');
      } else {
        setError(result.error || 'Failed to resend code.');
        setTimer(0);
        setCanResend(true);
      }
    } catch (err) {
      setError('An error occurred during resending.');
      setTimer(0);
      setCanResend(true);
    }
  };

  // Handle OTP Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const otpCode = otpDigits.join('');

    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    setIsLoading(true);

    try {
      if (flowType === 'forgot-password') {
        // Step 1: Verify OTP is correct
        const verifyResult = await verifyOTP(phoneOrEmail, otpCode);

        if (verifyResult.success) {
          // If valid, redirect to Reset Password view, passing verification details
          navigate('/admin-login/reset-password', {
            state: {
              phoneOrEmail,
              otp: otpCode,
              verified: true
            }
          });
        } else {
          setError(verifyResult.error || 'Invalid OTP code. Please check and try again.');
        }
      } else {
        // Step 2: Phone Login flow - authenticate user directly
        const loginResult = await loginWithPhone(phoneOrEmail, otpCode);

        if (loginResult.success) {
          // Redirect to the main admin dashboard page on success
          navigate('/admin', { replace: true });
        } else {
          setError(loginResult.error || 'Invalid OTP code. Login failed.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Masking phone/email for security
  const getMaskedIdentifier = () => {
    if (phoneOrEmail.includes('@')) {
      const [local, domain] = phoneOrEmail.split('@');
      return `${local.charAt(0)}${'*'.repeat(local.length - 2)}${local.charAt(local.length - 1)}@${domain}`;
    } else {
      const clean = phoneOrEmail.replace(/[^0-9+]/g, '');
      return `${clean.slice(0, 3)}*****${clean.slice(-4)}`;
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="card-header-icon">
          <FiKey size={32} />
        </div>
        <h2>Verify OTP</h2>
        <p className="card-subtitle">
          We have sent a 6-digit secure code to <strong className="masked-id">{getMaskedIdentifier()}</strong>.
        </p>

        {error && (
          <div className="login-error flex-error">
            <FiAlertCircle className="err-icon" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="login-info-message flex-success">
            <FiCheckCircle className="succ-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs-wrapper">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength="6" // allows pasting full codes
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                placeholder="•"
                disabled={isLoading}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            className={`btn-primary ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-container">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="loading-text">Verifying Code...</span>
              </span>
            ) : (
              flowType === 'forgot-password' ? 'Verify & Continue' : 'Verify & Access Portal'
            )}
          </button>
        </form>

        <div className="resend-container">
          {canResend ? (
            <button type="button" className="resend-btn" onClick={handleResend}>
              Resend OTP Code
            </button>
          ) : (
            <span className="resend-timer">
              Resend code in <strong>{timer}s</strong>
            </span>
          )}
        </div>

        <div className="card-footer">
          <Link to="/admin-login" className="back-link">
            <FiArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
