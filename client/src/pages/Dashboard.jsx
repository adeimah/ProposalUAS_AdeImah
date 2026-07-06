import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  Wallet, 
  TrendingUp, 
  Target, 
  Trophy, 
  Plus, 
  Calendar, 
  ChevronDown, 
  Bell, 
  DollarSign, 
  Briefcase, 
  GraduationCap, 
  Laptop,
  User,
  Settings,
  Trash2
} from 'lucide-react';

// Auto categorization helper for design rendering matching the mock values exactly
export const getGoalCategory = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('darurat') || n.includes('medis') || n.includes('emergency')) {
    return {
      type: 'Emergency',
      color: 'var(--color-emergency)',
      bgClass: 'bg-emergency',
      dotClass: 'dot-emergency',
      icon: Briefcase // vault representation
    };
  } else if (n.includes('liburan') || n.includes('bali') || n.includes('wisata')) {
    return {
      type: 'Vacation',
      color: 'var(--color-vacation)',
      bgClass: 'bg-vacation',
      dotClass: 'dot-vacation',
      icon: Briefcase
    };
  } else if (n.includes('pendidikan') || n.includes('sekolah') || n.includes('kuliah') || n.includes('belajar')) {
    return {
      type: 'Education',
      color: 'var(--color-education)',
      bgClass: 'bg-education',
      dotClass: 'dot-education',
      icon: GraduationCap
    };
  } else if (n.includes('laptop') || n.includes('hp') || n.includes('gadget') || n.includes('motor') || n.includes('impian')) {
    return {
      type: 'Gadget',
      color: 'var(--color-gadget)',
      bgClass: 'bg-gadget',
      dotClass: 'dot-gadget',
      icon: Laptop
    };
  } else {
    return {
      type: 'Lainnya',
      color: 'var(--color-other)',
      bgClass: 'bg-other',
      dotClass: 'dot-other',
      icon: Target
    };
  }
};

export const months2026 = [
  "Januari 2026",
  "Februari 2026",
  "Maret 2026",
  "April 2026",
  "Mei 2026",
  "Juni 2026",
  "Juli 2026",
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
  "November 2026",
  "Desember 2026"
];

const Dashboard = () => {
  const { 
    currentUser,
    users,
    deleteUserAccount,
    goals, 
    deposits, 
    addGoal, 
    getGoalProgress, 
    getStats, 
    getEstimasiSelesai,
    error,
    success,
    setError,
    setSuccess,
    triggerToast
  } = useContext(AppContext);

  const navigate = useNavigate();
  const location = useLocation();

  // Dropdown & Profile Modal State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const userDetail = users.find(u => u.id === currentUser?.id) || {};

  // Add Goal Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  // Handle URL trigger from sidebar (?add=true)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setError(null);
      setSuccess(null);
      setIsModalOpen(true);
    }
  }, [location.search, setError, setSuccess]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (location.search.includes('add=true')) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    const done = addGoal(goalName, targetAmount, deadline);
    if (done) {
      setGoalName('');
      setTargetAmount('');
      setDeadline('');
      handleCloseModal();
    }
  };

  // Helper to format currency
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num).replace(/\s/g, ''); // Remove spaces
  };

  // Get user stats
  const stats = getStats();

  // Prepare Donut Chart Data
  const categoriesCount = { Emergency: 0, Vacation: 0, Education: 0, Gadget: 0, Lainnya: 0 };
  let totalActive = 0;

  goals.forEach(g => {
    const cat = getGoalCategory(g.name);
    categoriesCount[cat.type] = (categoriesCount[cat.type] || 0) + 1;
    totalActive++;
  });

  const donutData = [
    { label: 'Dana Darurat', count: categoriesCount.Emergency, pct: totalActive ? Math.round((categoriesCount.Emergency / totalActive) * 100) : 0, color: 'var(--color-emergency)', dotClass: 'dot-emergency' },
    { label: 'Liburan', count: categoriesCount.Vacation, pct: totalActive ? Math.round((categoriesCount.Vacation / totalActive) * 100) : 0, color: 'var(--color-vacation)', dotClass: 'dot-vacation' },
    { label: 'Pendidikan', count: categoriesCount.Education, pct: totalActive ? Math.round((categoriesCount.Education / totalActive) * 100) : 0, color: 'var(--color-education)', dotClass: 'dot-education' },
    { label: 'Gadget', count: categoriesCount.Gadget, pct: totalActive ? Math.round((categoriesCount.Gadget / totalActive) * 100) : 0, color: 'var(--color-gadget)', dotClass: 'dot-gadget' },
    { label: 'Lainnya', count: categoriesCount.Lainnya, pct: totalActive ? Math.round((categoriesCount.Lainnya / totalActive) * 100) : 0, color: 'var(--color-other)', dotClass: 'dot-other' }
  ];

  // SVG parameters for donut
  let accumulatedPercent = 0;

  return (
    <div className="dashboard-container">
      {/* HEADER SECTION - Aligned with Referensi_DashboardDLL.png */}
      <div className="dashboard-header-row">
        <div className="header-welcome">
          <h1>Hi, {currentUser?.name || 'Ade Imah'} 👋</h1>
          <p className="subtitle">Selamat datang kembali! Semangat menabung hari ini 💪</p>
        </div>

        <div className="header-controls">
          <div className="dropdown-control" style={{ padding: '0 0.75rem 0 2.25rem', position: 'relative' }}>
            <Calendar size={16} className="control-icon" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <select 
              className="filter-select" 
              style={{ border: 'none', background: 'transparent', padding: '0.625rem 0', fontWeight: 600, fontSize: '0.875rem', outline: 'none', cursor: 'pointer', paddingRight: '1rem' }}
              defaultValue="Mei 2026"
              onChange={(e) => triggerToast('success', `Dashboard difilter ke ${e.target.value}`)}
            >
              {months2026.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="btn-icon-circle" onClick={() => alert('Tidak ada notifikasi baru.')}>
            <Bell size={16} className="control-icon" />
            <span className="notification-dot"></span>
          </div>

          <div className="profile-dropdown-wrapper">
            <div className="profile-control" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="profile-avatar-circle">
                {currentUser?.name ? currentUser.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) : 'AI'}
              </div>
              <span className="profile-name">{currentUser?.name || 'Ade Imah'}</span>
              <ChevronDown size={14} className="control-icon" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'var(--transition)' }} />
            </div>

            {isDropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <span className="profile-dropdown-header-name">{currentUser?.name || 'Ade Imah'}</span>
                  <span className="profile-dropdown-header-email">{currentUser?.email}</span>
                </div>
                
                <button 
                  className="dropdown-menu-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                >
                  <User size={16} className="brand-text-saving" />
                  <span>Profil</span>
                </button>
                
                <button 
                  className="dropdown-menu-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/pengaturan');
                  }}
                >
                  <Settings size={16} className="brand-text-goals" />
                  <span>Pengaturan</span>
                </button>
                
                <button 
                  className="dropdown-menu-item danger-item"
                  style={{ borderTop: '1px solid var(--border-light)', marginTop: '4px', paddingTop: '8px' }}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus akun Anda secara permanen? Seluruh target tabungan dan riwayat transaksi akan hilang.')) {
                      const success = deleteUserAccount();
                      if (success) {
                        navigate('/login');
                      }
                    }
                  }}
                >
                  <Trash2 size={16} />
                  <span>Hapus Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {success && <div className="alert alert-success global-alert">{success}</div>}

      {/* SUMMARY CARDS ROW - Aligned with Referensi_DashboardDLL.png */}
      <section className="summary-cards-row">
        <div className="summary-card summary-card-teal">
          <div className="summary-card-top">
            <span className="summary-card-title">Total Tabungan</span>
            <div className="summary-icon-box">
              <Wallet size={20} />
            </div>
          </div>
          <div className="summary-card-bottom">
            <h3 className="summary-card-value">{formatIDR(stats.totalSaved)}</h3>
            <div className="summary-badge-row">
              <span className="summary-badge summary-badge-success">↑ 22%</span>
              <span className="summary-badge-text">dari bulan lalu</span>
            </div>
          </div>
        </div>

        <div className="summary-card summary-card-blue">
          <div className="summary-card-top">
            <span className="summary-card-title">Rata-rata Setoran</span>
            <div className="summary-icon-box">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="summary-card-bottom">
            <h3 className="summary-card-value">{formatIDR(stats.averageDeposit)}</h3>
            <div className="summary-badge-row">
              <span className="summary-badge summary-badge-success">↑ 36%</span>
              <span className="summary-badge-text">dari bulan lalu</span>
            </div>
          </div>
        </div>

        <div className="summary-card summary-card-pink">
          <div className="summary-card-top">
            <span className="summary-card-title">Target Aktif</span>
            <div className="summary-icon-box">
              <Target size={20} />
            </div>
          </div>
          <div className="summary-card-bottom">
            <h3 className="summary-card-value">{stats.activeGoals} Target</h3>
            <div className="summary-badge-row">
              <span className="summary-badge summary-badge-gray">-</span>
              <span className="summary-badge-text">sama seperti bulan lalu</span>
            </div>
          </div>
        </div>

        <div className="summary-card summary-card-purple">
          <div className="summary-card-top">
            <span className="summary-card-title">Target Tercapai</span>
            <div className="summary-icon-box">
              <Trophy size={20} />
            </div>
          </div>
          <div className="summary-card-bottom">
            <h3 className="summary-card-value">{stats.completedGoals} Target</h3>
            <div className="summary-badge-row">
              <span className="summary-badge summary-badge-gray">-</span>
              <span className="summary-badge-text">sama seperti bulan lalu</span>
            </div>
          </div>
        </div>
      </section>

      {/* MIDDLE THREE PANELS GRID - Aligned with Referensi_DashboardDLL.png */}
      <section className="middle-grid">
        {/* Panel 1: Area Chart */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Total Tabungan Tiap Bulan</h2>
            <select 
              className="panel-header-select" 
              defaultValue="Mei 2026"
              onChange={(e) => triggerToast('success', `Grafik tabungan difilter ke ${e.target.value}`)}
            >
              {months2026.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          <div className="chart-container-inner">
            <svg className="chart-svg" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--purple-primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--purple-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="30" y1="30" x2="470" y2="30" className="chart-grid-line" />
              <line x1="30" y1="65" x2="470" y2="65" className="chart-grid-line" />
              <line x1="30" y1="100" x2="470" y2="100" className="chart-grid-line" />
              <line x1="30" y1="135" x2="470" y2="135" className="chart-grid-line" />
              <line x1="30" y1="170" x2="470" y2="170" className="chart-grid-line" />
              
              {/* Y Axis labels */}
              <text x="5" y="33" className="chart-axis-text">15 Jt</text>
              <text x="5" y="68" className="chart-axis-text">12 Jt</text>
              <text x="5" y="103" className="chart-axis-text">9 Jt</text>
              <text x="5" y="138" className="chart-axis-text">6 Jt</text>
              <text x="5" y="173" className="chart-axis-text">0</text>
              
              {/* X Axis labels */}
              <text x="30" y="190" className="chart-axis-text" textAnchor="middle">Jan</text>
              <text x="70" y="190" className="chart-axis-text" textAnchor="middle">Feb</text>
              <text x="110" y="190" className="chart-axis-text" textAnchor="middle">Mar</text>
              <text x="150" y="190" className="chart-axis-text" textAnchor="middle">Apr</text>
              <text x="190" y="190" className="chart-axis-text" textAnchor="middle">Mei</text>
              <text x="230" y="190" className="chart-axis-text" textAnchor="middle">Jun</text>
              <text x="270" y="190" className="chart-axis-text" textAnchor="middle">Jul</text>
              <text x="310" y="190" className="chart-axis-text" textAnchor="middle">Agt</text>
              <text x="350" y="190" className="chart-axis-text" textAnchor="middle">Sep</text>
              <text x="390" y="190" className="chart-axis-text" textAnchor="middle">Okt</text>
              <text x="430" y="190" className="chart-axis-text" textAnchor="middle">Nov</text>
              <text x="470" y="190" className="chart-axis-text" textAnchor="middle">Des</text>

              {/* Area Under Curve */}
              <path 
                className="chart-area-path" 
                d="M 30,140 C 60,135 60,120 70,115 C 90,110 100,125 110,110 C 130,95 140,115 150,118 C 170,125 180,95 190,95 C 210,95 220,115 230,110 C 250,105 260,105 270,100 C 290,90 300,105 310,108 C 330,110 340,90 350,92 C 370,95 380,85 390,88 C 410,92 420,80 430,82 C 450,85 460,95 470,90 L 470,170 L 30,170 Z" 
              />
              
              {/* Curve Line */}
              <path 
                className="chart-line-path" 
                d="M 30,140 C 60,135 60,120 70,115 C 90,110 100,125 110,110 C 130,95 140,115 150,118 C 170,125 180,95 190,95 C 210,95 220,115 230,110 C 250,105 260,105 270,100 C 290,90 300,105 310,108 C 330,110 340,90 350,92 C 370,95 380,85 390,88 C 410,92 420,80 430,82 C 450,85 460,95 470,90" 
              />
              
              {/* Mei Guide Line (Dashed) */}
              <line x1="190" y1="95" x2="190" y2="170" className="chart-vertical-guide" />
              
              {/* Active Dot */}
              <circle cx="190" cy="95" r="5" className="chart-interactive-dot" />
            </svg>
            
            {/* Chart Tooltip matching Reference exactly */}
            <div className="chart-tooltip-box" style={{ top: '80px', left: '190px' }}>
              <span>Mei 2026</span>
              <span className="chart-tooltip-val">{formatIDR(stats.totalSaved)}</span>
              <div className="chart-tooltip-arrow"></div>
            </div>
          </div>
        </div>

        {/* Panel 2: Donut Chart */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Aktivitas Target</h2>
            <select 
              className="panel-header-select" 
              defaultValue="Mei 2026"
              onChange={(e) => triggerToast('success', `Aktivitas target difilter ke ${e.target.value}`)}
            >
              {months2026.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="donut-container">
            <div className="donut-chart-wrapper">
              <svg className="donut-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="donut-ring-bg" />
                
                {/* Dynamically build segments or fallbacks for demo */}
                {donutData.map((d, index) => {
                  if (d.pct <= 0) return null;
                  const strokeLength = (d.pct / 100) * 251.2;
                  const strokeOffset = 251.2 - (accumulatedPercent / 100) * 251.2;
                  accumulatedPercent += d.pct;
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      className="donut-segment"
                      stroke={d.color}
                      strokeDasharray={`${strokeLength} 251.2`}
                      strokeDashoffset={strokeOffset}
                    />
                  );
                })}
              </svg>
              
              <div className="donut-center-text">
                <span className="donut-number">{goals.length}</span>
                <span className="donut-label">Total Target</span>
              </div>
            </div>

            <div className="donut-legend">
              {donutData.map((d, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-item-left">
                    <span className={`legend-dot ${d.dotClass}`}></span>
                    <span>{d.label}</span>
                  </div>
                  <span className="legend-value">{d.count} ({d.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 3: Recent Deposits */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Setoran Terakhir</h2>
          </div>

          <div className="deposit-list-wrapper">
            {deposits.slice(0, 5).length === 0 ? (
              <div className="empty-illustration-area">
                <p>Belum ada catatan setoran masuk.</p>
              </div>
            ) : (
              deposits.slice(0, 5).map((dep) => {
                const goal = goals.find(g => g.id === dep.goalId);
                const cat = getGoalCategory(goal ? goal.name : '');
                const IconComponent = cat.icon;

                return (
                  <div key={dep.id} className="deposit-card-item">
                    <div className="deposit-card-left">
                      <div className={`deposit-card-icon-wrapper ${cat.bgClass}`}>
                        <IconComponent size={16} />
                      </div>
                      <div className="deposit-card-info">
                        <span className="deposit-card-title">{goal ? goal.name : 'Target Dihapus'}</span>
                        <span className="deposit-card-date">{dep.date}</span>
                      </div>
                    </div>
                    <span className="deposit-card-amount">+{formatIDR(dep.amount)}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="panel-footer-link" onClick={() => navigate('/goals')}>
            <span>Lihat Semua</span>
            <span>&gt;</span>
          </div>
        </div>
      </section>

      {/* GOALS SECTION - Aligned with Referensi_DashboardDLL.png */}
      <section className="goals-section-container">
        <div className="section-goals-header">
          <h2>My Goals</h2>
          <a href="#all" className="goals-link-all" onClick={(e) => { e.preventDefault(); navigate('/goals'); }}>
            Lihat Semua &gt;
          </a>
        </div>

        {goals.length === 0 ? (
          <div className="panel-card empty-state text-center" style={{ padding: '3.5rem' }}>
            <Target size={40} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
            <h3>Belum Ada Target Menabung</h3>
            <p className="subtitle" style={{ marginBottom: '1.5rem' }}>Ayo tentukan target tabungan Anda untuk mulai menabung secara teratur.</p>
            <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              <span>Buat Target Pertama</span>
            </button>
          </div>
        ) : (
          <div className="goals-grid-row">
            {goals.map((goal) => {
              const { totalDeposited, percent } = getGoalProgress(goal.id);
              const estimasi = getEstimasiSelesai(goal.id);
              const cat = getGoalCategory(goal.name);
              const IconComponent = cat.icon;

              return (
                <div 
                  key={goal.id} 
                  className="goal-card-item"
                  onClick={() => navigate(`/goals/${goal.id}`)}
                >
                  <div className="goal-card-item-top">
                    <div className={`goal-card-icon-box ${cat.bgClass}`}>
                      <IconComponent size={18} />
                    </div>
                    <div className="goal-card-title-box">
                      <h3 className="goal-card-name" title={goal.name}>{goal.name}</h3>
                      <p className="goal-card-amount-label">
                        {formatIDR(totalDeposited)} / {formatIDR(goal.targetAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="goal-card-progress-bar-row">
                    <div className="goal-card-progress-track">
                      <div 
                        className="goal-card-progress-fill" 
                        style={{ width: `${percent}%`, backgroundColor: cat.color }}
                      ></div>
                    </div>
                    <span className="goal-card-percent-text">{percent}%</span>
                  </div>

                  <div className="goal-card-meta-list">
                    <div className="goal-card-meta-item">
                      <span className="goal-card-meta-label">Deadline</span>
                      <span className="goal-card-meta-value">{goal.deadline}</span>
                    </div>
                    <div className="goal-card-meta-item">
                      <span className="goal-card-meta-label">Est. Tercapai</span>
                      <span className="goal-card-meta-value">{estimasi.split(' ')[0]} {estimasi.includes('bulan') ? 'bulan lagi' : (estimasi.includes('hari') ? 'hari lagi' : 'lagi')}</span>
                    </div>
                  </div>

                  <div className="goal-card-action-row">
                    <span>Lihat Detail & Riwayat</span>
                    <span>&gt;</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Add Goal (BR-1) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-card-header">
              <h2>Buat Target Menabung Baru</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleCreateGoal} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="goalName">Nama Target / Impian</label>
                <div className="auth-input-wrapper">
                  <Target size={18} className="auth-field-icon" />
                  <input
                    type="text"
                    id="goalName"
                    placeholder="Contoh: Beli Laptop, Dana Darurat"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="targetAmount">Nominal Target (Rp)</label>
                <div className="auth-input-wrapper">
                  <DollarSign size={18} className="auth-field-icon" />
                  <input
                    type="number"
                    id="targetAmount"
                    placeholder="Contoh: 5000000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="deadline">Batas Waktu (Deadline)</label>
                <div className="auth-input-wrapper">
                  <Calendar size={18} className="auth-field-icon" />
                  <input
                    type="date"
                    id="deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--blue-primary)' }}>Simpan Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Profil User Modal */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <h2>Profil Pengguna</h2>
              <button className="modal-close-btn" onClick={() => setIsProfileModalOpen(false)}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', margin: '1rem 0' }}>
              <div className="profile-avatar-circle" style={{ width: '80px', height: '80px', fontSize: '2rem', borderRadius: '50%', marginBottom: '0.5rem' }}>
                {currentUser?.name ? currentUser.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) : 'AI'}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{userDetail.name || currentUser?.name}</h3>
              <span className="summary-badge summary-badge-success" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>Akun Aktif</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Email:</span>
                <span style={{ fontWeight: 600 }}>{userDetail.email || currentUser?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Nomor Telepon:</span>
                <span style={{ fontWeight: 600 }}>{userDetail.phone || 'Belum diatur'}</span>
              </div>
            </div>

            <div className="modal-form-actions" style={{ marginTop: '2rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsProfileModalOpen(false)}
              >
                Tutup
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setIsProfileModalOpen(false);
                  navigate('/pengaturan');
                }}
              >
                Ubah Profil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
