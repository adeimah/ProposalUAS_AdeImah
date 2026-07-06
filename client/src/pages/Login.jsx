import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logoWebImg from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { loginUser, currentUser, error, setError, setSuccess } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
    setError(null);
    setSuccess(null);
  }, [currentUser, navigate, setError, setSuccess]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = loginUser(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-viewport">
      <div className="auth-card">
        <div className="auth-logo-area">
          <img src={logoWebImg} alt="SavingGoals Logo" className="auth-logo-img" />
          <div className="brand-logo-text">
            <span className="brand-text-saving">Saving</span>
            <span className="brand-text-goals">Goals</span>
          </div>
          <p className="auth-subtitle-text">Masuk ke akun Anda</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="email">Email</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-field-icon" />
              <input
                type="email"
                id="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-forgot-password-row">
            <a href="#forgot" className="auth-forgot-link" onClick={(e) => { e.preventDefault(); alert('Hubungi administrator untuk reset password.'); }}>
              Lupa password?
            </a>
          </div>

          <button type="submit" className="btn-auth-submit btn-login-submit">
            Masuk
          </button>
        </form>

        <div className="auth-footer-area">
          <p>
            Belum punya akun? <Link to="/register" className="auth-footer-link">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
