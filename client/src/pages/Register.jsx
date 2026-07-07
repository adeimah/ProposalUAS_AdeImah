import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logoWebImg from '../assets/logo.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { registerUser, currentUser, error, success, setError, setSuccess } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
    setError(null);
    setSuccess(null);
  }, [currentUser, navigate, setError, setSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // 1. All fields required
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Semua field wajib diisi.');
      return;
    }

    // 2. Email valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid.');
      return;
    }

    // 3. Password length >= 8 characters
    if (password.length < 8) {
      setError('Password minimal harus 8 karakter.');
      return;
    }

    // 4. Confirm Password must match
    if (password !== confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok.');
      return;
    }

    const registered = await registerUser(name, email, password);
    if (registered) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
          <p className="auth-subtitle-text">Buat akun baru</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="name">Nama Lengkap</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-field-icon" />
              <input
                type="text"
                id="name"
                placeholder="Masukkan nama lengkap Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
                placeholder="Buat password"
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

          <div className="auth-input-group">
            <label htmlFor="confirmPassword">Konfirmasi Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-field-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Konfirmasi password Anda"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-eye-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth-submit btn-register-submit">
            Daftar
          </button>
        </form>

        <div className="auth-footer-area">
          <p>
            Sudah punya akun? <Link to="/login" className="auth-footer-link">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
