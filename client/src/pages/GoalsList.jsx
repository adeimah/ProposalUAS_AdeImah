import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { getGoalCategory } from './Dashboard';
import { 
  Search, 
  Plus, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Tag, 
  Eye, 
  SlidersHorizontal,
  Target
} from 'lucide-react';

const GoalsList = () => {
  const { 
    goals, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    getGoalProgress, 
    getEstimasiSelesai
  } = useContext(AppContext);

  const navigate = useNavigate();
  const location = useLocation();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, Emergency, Vacation, Education, Gadget, Lainnya
  const [sortBy, setSortBy] = useState('newest'); // newest, deadline, target_desc, progress_desc

  // Modal State for Add Goal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  // Modal State for Edit Goal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [editGoalName, setEditGoalName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  // Handle URL trigger from dashboard/sidebar (?add=true) to open modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setIsAddModalOpen(true);
      // Clean up query param from URL
      navigate('/goals', { replace: true });
    }
  }, [location.search, navigate]);

  // Handle Add Goal Submit
  const handleAddGoal = async (e) => {
    e.preventDefault();
    const done = await addGoal(newGoalName, newTargetAmount, newDeadline);
    if (done) {
      setNewGoalName('');
      setNewTargetAmount('');
      setNewDeadline('');
      setIsAddModalOpen(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (goal, e) => {
    e.stopPropagation(); // Prevent clicking card navigations
    setSelectedGoalId(goal.id);
    setEditGoalName(goal.name);
    setEditTargetAmount(goal.targetAmount);
    setEditDeadline(goal.deadline);
    setIsEditModalOpen(true);
  };

  // Handle Edit Goal Submit
  const handleEditGoal = async (e) => {
    e.preventDefault();
    const done = await updateGoal(selectedGoalId, editGoalName, editTargetAmount, editDeadline);
    if (done) {
      setIsEditModalOpen(false);
    }
  };

  // Handle Delete
  const handleDeleteGoal = async (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Apakah Anda yakin ingin menghapus target "${name}" beserta seluruh riwayat setorannya?`)) {
      await deleteGoal(id);
    }
  };

  // Formatting helper
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num).replace(/\s/g, '');
  };

  // Filter & Sort Goals list
  const filteredGoals = goals.filter(goal => {
    const { percent } = getGoalProgress(goal.id);
    const cat = getGoalCategory(goal.name);
    
    const matchesSearch = goal.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = percent < 100;
    if (statusFilter === 'completed') matchesStatus = percent >= 100;

    let matchesCategory = true;
    if (categoryFilter !== 'all') matchesCategory = cat.type === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedGoals = [...filteredGoals].sort((a, b) => {
    const progressA = getGoalProgress(a.id);
    const progressB = getGoalProgress(b.id);

    if (sortBy === 'newest') {
      return new Date(b.createdAt || '') - new Date(a.createdAt || '');
    }
    if (sortBy === 'deadline') {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (sortBy === 'target_desc') {
      return b.targetAmount - a.targetAmount;
    }
    if (sortBy === 'progress_desc') {
      return progressB.percent - progressA.percent;
    }
    return 0;
  });

  return (
    <div className="goals-list-page">
      {/* Header Row */}
      <header className="dashboard-header-row">
        <div className="header-welcome">
          <h1>Daftar Target Tabungan</h1>
          <p className="subtitle">Kelola seluruh target menabung Anda dalam satu halaman terpadu.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Tambah Goal Baru</span>
        </button>
      </header>

      {/* Search and Filters controls bar */}
      <section className="panel-card goals-list-controls-bar" style={{ marginBottom: '2rem' }}>
        <div className="controls-left">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Cari nama target tabungan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="controls-right">
          <SlidersHorizontal size={16} className="control-icon" style={{ marginRight: '0.25rem' }} />
          
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="active">Sedang Berjalan</option>
            <option value="completed">Tercapai</option>
          </select>

          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            <option value="Emergency">Dana Darurat</option>
            <option value="Vacation">Liburan</option>
            <option value="Education">Pendidikan</option>
            <option value="Gadget">Gadget</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Terbaru</option>
            <option value="deadline">Batas Waktu Terdekat</option>
            <option value="target_desc">Target Terbesar</option>
            <option value="progress_desc">Progres Tertinggi</option>
          </select>
        </div>
      </section>

      {/* Grid Goals view */}
      {sortedGoals.length === 0 ? (
        <div className="panel-card empty-state text-center" style={{ padding: '5rem 2rem' }}>
          <Target size={48} className="empty-icon" style={{ marginBottom: '1rem' }} />
          <h3>Target Tidak Ditemukan</h3>
          <p className="subtitle">Tidak ada target tabungan yang cocok dengan pencarian atau filter Anda.</p>
        </div>
      ) : (
        <div className="goals-grid-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {sortedGoals.map((goal) => {
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
                  <div className="goal-card-title-box" style={{ flex: 1 }}>
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
                    <span className="goal-card-meta-label">Est. Selesai</span>
                    <span className="goal-card-meta-value">{estimasi}</span>
                  </div>
                </div>

                <div className="goal-detail-actions" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', justifyContent: 'space-between', width: '100%' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/goals/${goal.id}`); }}
                  >
                    <Eye size={12} />
                    <span>Detail</span>
                  </button>

                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                    onClick={(e) => openEditModal(goal, e)}
                  >
                    <Edit size={12} />
                    <span>Edit</span>
                  </button>

                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                    onClick={(e) => handleDeleteGoal(goal.id, goal.name, e)}
                  >
                    <Trash2 size={12} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Goal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-card-header">
              <h2>Buat Target Menabung Baru</h2>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleAddGoal} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="addGoalName">Nama Target / Impian</label>
                <div className="auth-input-wrapper">
                  <Target size={18} className="auth-field-icon" />
                  <input
                    type="text"
                    id="addGoalName"
                    placeholder="Contoh: Beli Laptop ROG, Dana Darurat"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="addTargetAmount">Nominal Target (Rp)</label>
                <div className="auth-input-wrapper">
                  <DollarSign size={18} className="auth-field-icon" />
                  <input
                    type="number"
                    id="addTargetAmount"
                    placeholder="Contoh: 5000000"
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="addDeadline">Batas Waktu (Deadline)</label>
                <div className="auth-input-wrapper">
                  <Calendar size={18} className="auth-field-icon" />
                  <input
                    type="date"
                    id="addDeadline"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Target</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Goal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-card-header">
              <h2>Ubah Target Menabung</h2>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleEditGoal} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="editGoalName">Nama Target</label>
                <div className="auth-input-wrapper">
                  <Tag size={18} className="auth-field-icon" />
                  <input
                    type="text"
                    id="editGoalName"
                    value={editGoalName}
                    onChange={(e) => setEditGoalName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="editTargetAmount">Nominal Target (Rp)</label>
                <div className="auth-input-wrapper">
                  <DollarSign size={18} className="auth-field-icon" />
                  <input
                    type="number"
                    id="editTargetAmount"
                    value={editTargetAmount}
                    onChange={(e) => setEditTargetAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="editDeadline">Batas Waktu (Deadline)</label>
                <div className="auth-input-wrapper">
                  <Calendar size={18} className="auth-field-icon" />
                  <input
                    type="date"
                    id="editDeadline"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsList;
