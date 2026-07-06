import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Mail, Phone, Lock, Save, ShieldAlert, AlertTriangle } from 'lucide-react';

const Pengaturan = () => {
  const { 
    currentUser, 
    users, 
    updateUserProfile, 
    deleteUserAccount, 
    triggerToast 
  } = useContext(AppContext);

  // Find detailed user info including phone and password from mock DB
  const userDetail = users.find(u => u.id === currentUser?.id) || {};

  // Profile fields state
  const [name, setName] = useState(userDetail.name || '');
  const [email, setEmail] = useState(userDetail.email || '');
  const [phone, setPhone] = useState(userDetail.phone || '');

  // Password fields state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync state if userDetails loaded asynchronously
  useEffect(() => {
    if (userDetail.name) {
      setName(userDetail.name);
      setEmail(userDetail.email);
      setPhone(userDetail.phone || '');
    }
  }, [userDetail.name, userDetail.email, userDetail.phone]);

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      triggerToast('error', 'Nama tidak boleh kosong.');
      return;
    }
    if (!email.trim()) {
      triggerToast('error', 'Email tidak boleh kosong.');
      return;
    }

    const success = updateUserProfile(name, email, phone);
    if (success) {
      triggerToast('success', 'Profil berhasil diperbarui!');
    }
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();

    if (!newPassword) {
      triggerToast('error', 'Silakan isi password baru Anda.');
      return;
    }

    if (newPassword.length < 6) {
      triggerToast('error', 'Password baru harus minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      triggerToast('error', 'Konfirmasi password baru tidak cocok.');
      return;
    }

    const success = updateUserProfile(name, email, phone, newPassword);
    if (success) {
      setNewPassword('');
      setConfirmPassword('');
      triggerToast('success', 'Password berhasil diubah!');
    }
  };

  return (
    <div className="pengaturan-page">
      {/* Header */}
      <header className="dashboard-header-row">
        <div className="header-welcome">
          <h1>Pengaturan Akun</h1>
          <p className="subtitle">Kelola profil Anda, informasi kontak, dan keamanan kata sandi.</p>
        </div>
      </header>

      <div className="pengaturan-grid-container">
        
        {/* Left Side: Profile & Contacts Form */}
        <div className="panel-card" style={{ padding: '2rem', height: 'fit-content' }}>
          <div className="panel-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <User size={20} className="brand-text-saving" />
              <span>Profil Pengguna & Kontak</span>
            </h2>
          </div>

          <form onSubmit={handleSaveProfile} className="auth-form">
            {/* Name Input */}
            <div className="auth-input-group">
              <label htmlFor="profileName">Nama Lengkap</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-field-icon" />
                <input
                  type="text"
                  id="profileName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="auth-input-group">
              <label htmlFor="profileEmail">Alamat Email</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-field-icon" />
                <input
                  type="email"
                  id="profileEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: user@domain.com"
                  required
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="auth-input-group">
              <label htmlFor="profilePhone">Nomor Telepon</label>
              <div className="auth-input-wrapper">
                <Phone size={18} className="auth-field-icon" />
                <input
                  type="tel"
                  id="profilePhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minWidth: '150px' }}
              >
                <Save size={16} />
                <span>Simpan Profil</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Security Password Form & Account Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Security / Password Card */}
          <div className="panel-card" style={{ padding: '2rem' }}>
            <div className="panel-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Lock size={20} className="brand-text-goals" />
                <span>Keamanan (Ubah Password)</span>
              </h2>
            </div>

            <form onSubmit={handleSaveSecurity} className="auth-form">
              {/* New Password Input */}
              <div className="auth-input-group">
                <label htmlFor="newPassword">Password Baru</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-field-icon" />
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              {/* Confirm New Password Input */}
              <div className="auth-input-group">
                <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-field-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-accent"
                  style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    alignItems: 'center', 
                    minWidth: '150px',
                    backgroundColor: 'var(--accent)',
                    color: 'var(--indigo-dark)'
                  }}
                >
                  <Save size={16} />
                  <span>Ubah Password</span>
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone: Hapus Akun */}
          <div className="panel-card" style={{ padding: '1.5rem', border: '1px dashed var(--danger)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'var(--danger-light)', padding: '0.75rem', borderRadius: '12px', color: 'var(--danger)' }}>
                <ShieldAlert size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.25rem' }}>Zona Bahaya (Danger Zone)</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '1rem' }}>
                  Menghapus akun Anda akan menghapus semua data target tabungan dan riwayat setoran Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  onClick={() => {
                    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus akun Anda secara permanen? Seluruh target tabungan dan riwayat transaksi Anda akan hilang selamanya.')) {
                      deleteUserAccount();
                    }
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>Hapus Akun Saya</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Pengaturan;
