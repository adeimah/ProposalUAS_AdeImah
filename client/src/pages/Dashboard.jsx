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
    triggerToast,
    dashboardData,
    fetchDashboard
  } = useContext(AppContext);

  useEffect(() => {
    if (currentUser) {
      fetchDashboard();
    }
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  // Dropdown & Profile Modal State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const userDetail = users.find(u => u.id === currentUser?.id) || {};

  // Handle URL trigger from sidebar (?add=true) -> Redirect to goals list page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      navigate('/goals?add=true', { replace: true });
    }
  }, [location.search, navigate]);

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

  // Calculate dynamic Area Chart coordinates from API monthlySavings
  const monthMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const indonesianMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

  const monthlyData = monthMap.map((m, idx) => {
    // Find all deposits made in this calendar month (across all goals)
    const monthDeposits = deposits.filter(dep => {
      if (!dep.date) return false;
      const depDate = new Date(dep.date);
      return depDate.getMonth() === idx;
    });

    const monthTotal = monthDeposits.reduce((sum, dep) => sum + Number(dep.amount || 0), 0);

    return {
      month: indonesianMonths[idx],
      total: monthTotal,
      x: 30 + idx * 40
    };
  });

  const maxTotal = Math.max(...monthlyData.map(d => d.total), 15000000); // default to 15M minimum height
  
  const getY = (total) => {
    return 170 - (total / maxTotal) * 135;
  };

  const formatShortAmount = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + ' Jt';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + ' Rb';
    return num.toString();
  };

  // Generate SVG path coordinates
  const points = monthlyData.map(d => `${d.x},${getY(d.total)}`);
  const linePathD = `M ${points.join(' L ')}`;
  const areaPathD = `${linePathD} L 470,170 L 30,170 Z`;

  // Find active dot (use current month)
  const currentMonthIdx = new Date().getMonth();
  const activeX = 30 + currentMonthIdx * 40;
  const activeY = getY(monthlyData[currentMonthIdx].total);
  const activeMonthLabel = `${months2026[currentMonthIdx].split(' ')[0]} 2026`;
  const activeMonthTotal = monthlyData[currentMonthIdx].total;

  // SVG parameters for donut
  let accumulatedPercent = 0;

  return (
    <div className="dashboard-container">
      {/* HEADER SECTION - Aligned with Referensi_DashboardDLL.png */}
      <div className="dashboard-header-row">
        <div className="header-welcome">
          <h1>Hai {(currentUser?.name || 'Ade Imah').replace(/updated/gi, '').trim()} 👋</h1>
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
                {(currentUser?.name ? currentUser.name.replace(/updated/gi, '').trim() : 'Ade Imah').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <span className="profile-name">{(currentUser?.name || 'Ade Imah').replace(/updated/gi, '').trim()}</span>
              <ChevronDown size={14} className="control-icon" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'var(--transition)' }} />
            </div>

            {isDropdownOpen && (
              <div className="profile-dropdown-menu" style={{ width: '260px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', color: 'var(--text-color)' }}>
                  Profil Saya
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Nama</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{(currentUser?.name || 'Ade Imah').replace(/updated/gi, '').trim()}</span>
                  </div>
                  
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{currentUser?.email || 'ade@example.com'}</span>
                  </div>
                  
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Nomor Telepon</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{currentUser?.phone || '081234567890'}</span>
                  </div>
                </div>
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
            <span className="summary-card-title">Rata-rata Progress</span>
            <div className="summary-icon-box">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="summary-card-bottom">
            <h3 className="summary-card-value">{stats.averageProgress}%</h3>
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
              <text x="5" y="33" className="chart-axis-text">{formatShortAmount(maxTotal)}</text>
              <text x="5" y="68" className="chart-axis-text">{formatShortAmount(maxTotal * 0.75)}</text>
              <text x="5" y="103" className="chart-axis-text">{formatShortAmount(maxTotal * 0.5)}</text>
              <text x="5" y="138" className="chart-axis-text">{formatShortAmount(maxTotal * 0.25)}</text>
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
                d={areaPathD} 
              />
              
              {/* Curve Line */}
              <path 
                className="chart-line-path" 
                d={linePathD} 
              />
              
              {/* Mei Guide Line (Dashed) */}
              <line x1={activeX} y1={activeY} x2={activeX} y2="170" className="chart-vertical-guide" />
              
              {/* Active Dot */}
              <circle cx={activeX} cy={activeY} r="5" className="chart-interactive-dot" />
            </svg>
            
            {/* Chart Tooltip matching Reference exactly */}
            <div className="chart-tooltip-box" style={{ top: `${activeY - 45}px`, left: `${activeX}px`, transform: 'translateX(-50%)' }}>
              <span>{activeMonthLabel}</span>
              <span className="chart-tooltip-val">{formatIDR(activeMonthTotal)}</span>
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

        {/* Panel 3: Target Terbaru */}
        <div className="panel-card">
          <div className="panel-header">
            <h2>Target Terbaru</h2>
          </div>

          <div className="deposit-list-wrapper">
            {(() => {
              const latestGoals = dashboardData?.latestGoals || [];
              if (latestGoals.length === 0) {
                return (
                  <div className="empty-illustration-area">
                    <p>Belum ada target menabung.</p>
                  </div>
                );
              }
              return latestGoals.map((goal) => {
                const cat = getGoalCategory(goal.title || goal.name);
                const IconComponent = cat.icon;

                return (
                  <div key={goal.id} className="deposit-card-item">
                    <div className="deposit-card-left">
                      <div className={`deposit-card-icon-wrapper ${cat.bgClass}`}>
                        <IconComponent size={16} />
                      </div>
                      <div className="deposit-card-info">
                        <span className="deposit-card-title">{goal.title || goal.name}</span>
                        <span className="deposit-card-date">Target: {formatIDR(goal.targetAmount)}</span>
                      </div>
                    </div>
                    <span className="deposit-card-amount" style={{ color: 'var(--text-color)', fontWeight: '600' }}>{goal.progress}%</span>
                  </div>
                );
              });
            })()}
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

        {(() => {
          const myGoals = dashboardData?.myGoals || [];
          if (myGoals.length === 0) {
            return (
              <div className="panel-card empty-state text-center" style={{ padding: '3.5rem' }}>
                <Target size={40} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
                <h3>Belum Ada Target Menabung</h3>
                <p className="subtitle">Anda dapat menambahkan target baru melalui halaman Goals List.</p>
              </div>
            );
          }
          return (
            <div className="goals-grid-row">
              {myGoals.map((goal) => {
                const percent = goal.progress;
                const totalDeposited = goal.currentAmount;
                const estimasi = getEstimasiSelesai(goal.id.toString());
                const cat = getGoalCategory(goal.title || goal.name);
                const IconComponent = cat.icon;

                return (
                  <div 
                    key={goal.id} 
                    className="goal-card-item"
                    onClick={() => navigate(`/goals/${goal.id}?readOnly=true`)}
                  >
                    <div className="goal-card-item-top">
                      <div className={`goal-card-icon-box ${cat.bgClass}`}>
                        <IconComponent size={18} />
                      </div>
                      <div className="goal-card-title-box">
                        <h3 className="goal-card-name" title={goal.title || goal.name}>{goal.title || goal.name}</h3>
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
                      <span>Lihat Detail</span>
                      <span>&gt;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>


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
