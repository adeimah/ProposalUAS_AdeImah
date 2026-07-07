import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { getGoalCategory } from './Dashboard';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar, 
  DollarSign, 
  Clock, 
  Tag, 
  FileText
} from 'lucide-react';

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    currentUser,
    allDeposits, 
    updateGoal, 
    deleteGoal, 
    addDeposit, 
    getGoalProgress, 
    getEstimasiSelesai,
    triggerToast
  } = useContext(AppContext);

  const [goal, setGoal] = useState(null);
  const [loadingGoal, setLoadingGoal] = useState(true);

  // Read query parameter to enforce Read Only mode when navigated from Dashboard My Goals
  const readOnly = new URLSearchParams(window.location.search).get('readOnly') === 'true';

  const updateGoalDetails = (resData) => {
    if (resData.success) {
      const apiGoal = resData.data.savingGoal;
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      };
      setGoal({
        id: apiGoal.id.toString(),
        name: apiGoal.title,
        targetAmount: Number(apiGoal.targetAmount),
        currentAmount: Number(apiGoal.currentAmount || 0),
        category: apiGoal.category || getGoalCategory(apiGoal.title).type,
        deadline: formatDate(apiGoal.deadline),
        createdAt: formatDate(apiGoal.createdAt) || 'N/A'
      });
    }
  };

  // Fetch target saving goal from backend
  useEffect(() => {
    const fetchGoalDetail = async () => {
      if (!currentUser) return;
      try {
        const response = await fetch(`http://localhost:5000/api/savings/${id}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        const resData = await response.json();
        if (resData.success) {
          updateGoalDetails(resData);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Fetch goal detail error:', err);
        navigate('/dashboard');
      } finally {
        setLoadingGoal(false);
      }
    };
    fetchGoalDetail();
  }, [id, currentUser, navigate]);

  // Modals visibility state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Edit Goal Form State
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  // Add Deposit Form State
  const [depAmount, setDepAmount] = useState('');
  const [depDate, setDepDate] = useState(new Date().toISOString().split('T')[0]);
  const [depNote, setDepNote] = useState('');

  // Initialize edit fields
  useEffect(() => {
    if (goal) {
      setEditName(goal.name);
      setEditTarget(goal.targetAmount);
      setEditDeadline(goal.deadline);
    }
  }, [goal]);

  if (loadingGoal || !goal) {
    return (
      <div className="loading-container text-center">
        <h3>Memuat target...</h3>
      </div>
    );
  }

  // Get progress and stats dynamically from goal details
  const totalDeposited = Number(goal.currentAmount || 0);
  const percent = Math.min(100, Math.round((totalDeposited / goal.targetAmount) * 100 * 10) / 10);
  const remaining = Math.max(0, goal.targetAmount - totalDeposited);
  const estimasi = getEstimasiSelesai(goal.id);
  const goalDeposits = allDeposits.filter(d => d.goalId === goal.id);
  
  // Categorize for colors
  const cat = getGoalCategory(goal.name);
  const IconComponent = cat.icon;

  const handleEditGoal = async (e) => {
    e.preventDefault();
    
    const targetNum = parseFloat(editTarget);
    if (isNaN(targetNum) || targetNum <= 0) {
      triggerToast('error', 'Nominal target harus berupa angka positif.');
      return;
    }

    const done = await updateGoal(goal.id, editName, targetNum, editDeadline);
    if (done) {
      setIsEditModalOpen(false);
      // Reload goal detail
      setLoadingGoal(true);
      try {
        const response = await fetch(`http://localhost:5000/api/savings/${id}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        const resData = await response.json();
        if (resData.success) {
          updateGoalDetails(resData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGoal(false);
      }
    }
  };

  const handleAddDeposit = async (e) => {
    e.preventDefault();
    
    const amountNum = parseFloat(depAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast('error', 'Nominal setoran harus berupa angka positif.');
      return;
    }

    const done = await addDeposit(goal.id, depAmount, depDate, depNote);
    if (done) {
      setDepAmount('');
      setDepNote('');
      setDepDate(new Date().toISOString().split('T')[0]);
      setIsDepositModalOpen(false);
      // Reload goal detail
      setLoadingGoal(true);
      try {
        const response = await fetch(`http://localhost:5000/api/savings/${id}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        const resData = await response.json();
        if (resData.success) {
          updateGoalDetails(resData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGoal(false);
      }
    }
  };

  const handleDeleteGoal = async () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus target "${goal.name}" beserta seluruh riwayat setorannya?`)) {
      const done = await deleteGoal(goal.id);
      if (done) {
        navigate('/dashboard');
      }
    }
  };

  // Helper to format currency
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num).replace(/\s/g, '');
  };

  return (
    <div className="goal-detail-wrapper">
      {/* Back Button */}
      <button className="btn-back" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} />
        <span>Kembali ke Dashboard</span>
      </button>

      {/* Goal Header Card */}
      <div className="goal-detail-header-card panel-card">
        <div className="goal-detail-header-top">
          <div>
            <div className="goal-detail-title-row">
              <div className={`goal-card-icon-box ${cat.bgClass}`}>
                <IconComponent size={20} />
              </div>
              <h1 style={{ margin: 0 }}>{goal.name}</h1>
              {percent >= 100 ? (
                <span className="badge badge-success">Tercapai</span>
              ) : (
                <span className="badge badge-info">Berjalan</span>
              )}
            </div>
            <p className="goal-created-date">Dibuat pada: {goal.createdAt}</p>
          </div>
          {!readOnly && (
            <div className="goal-detail-actions">
              <button className="btn btn-secondary btn-icon-only" onClick={() => setIsEditModalOpen(true)} title="Ubah Target">
                <Edit size={16} />
              </button>
              <button className="btn btn-danger btn-icon-only" onClick={handleDeleteGoal} title="Hapus Target" style={{ backgroundColor: 'var(--danger)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Progress Metrics (BR-3) */}
        <div className="goal-detail-metrics-row">
          <div className="goal-detail-metric-card">
            <span className="goal-detail-metric-label">Terkumpul</span>
            <span className="goal-detail-metric-value" style={{ color: cat.color }}>{formatIDR(totalDeposited)}</span>
          </div>
          <div className="goal-detail-metric-card">
            <span className="goal-detail-metric-label">Target Nominal</span>
            <span className="goal-detail-metric-value">{formatIDR(goal.targetAmount)}</span>
          </div>
          <div className="goal-detail-metric-card">
            <span className="goal-detail-metric-label">Sisa Tabungan</span>
            <span className="goal-detail-metric-value font-red">{formatIDR(remaining)}</span>
          </div>
        </div>

        {/* Progress Bar (BR-3) */}
        <div className="goal-detail-progress-section">
          <div className="goal-detail-progress-track">
            <div className="goal-detail-progress-fill" style={{ width: `${percent}%`, backgroundColor: cat.color }}></div>
            <span className="goal-detail-progress-percent">{percent}%</span>
          </div>
        </div>

        {/* Additional Meta (BR-7) */}
        <div className="goal-detail-meta-cards">
          <div className="goal-detail-meta-box">
            <div className="goal-detail-meta-icon text-blue">
              <Calendar size={18} />
            </div>
            <div className="goal-detail-meta-details">
              <span className="goal-detail-meta-label">Batas Waktu</span>
              <span className="goal-detail-meta-value">{goal.deadline}</span>
            </div>
          </div>
          <div className="goal-detail-meta-box">
            <div className="goal-detail-meta-icon text-yellow">
              <Clock size={18} />
            </div>
            <div className="goal-detail-meta-details">
              <span className="goal-detail-meta-label">Estimasi Selesai</span>
              <span className="goal-detail-meta-value">{estimasi}</span>
            </div>
          </div>
        </div>

        {!readOnly && percent < 100 && (
          <div className="goal-detail-cta">
            <button className="btn btn-accent btn-large" onClick={() => setIsDepositModalOpen(true)} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <Plus size={20} />
              <span>Catat Setoran Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Deposit History Section (Fitur 5) */}
      <div className="history-section-card panel-card">
        <div className="section-header">
          <h2>Riwayat Setoran ({goalDeposits.length})</h2>
        </div>

        {goalDeposits.length === 0 ? (
          <div className="empty-illustration-area text-center" style={{ padding: '4rem 1.5rem' }}>
            <FileText size={48} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
            <h3>Belum Ada Setoran</h3>
            <p>Mulai catat setoran pertama Anda untuk mendekati target impian.</p>
            {!readOnly && percent < 100 && (
              <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setIsDepositModalOpen(true)}>
                <Plus size={16} />
                <span>Tambah Setoran Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="deposit-history-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nominal Setoran</th>
                  <th>Catatan / Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {goalDeposits.map((dep) => (
                  <tr key={dep.id}>
                    <td>{dep.date}</td>
                    <td className="deposit-amount-cell">+{formatIDR(dep.amount)}</td>
                    <td className="deposit-note-cell">{dep.note ? dep.note : <span className="text-muted">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit Goal (BR-5) */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-card-header">
              <h2>Ubah Target Menabung</h2>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleEditGoal} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="editName">Nama Target</label>
                <div className="auth-input-wrapper">
                  <Tag size={18} className="auth-field-icon" />
                  <input
                    type="text"
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="editTarget">Nominal Target (Rp)</label>
                <div className="auth-input-wrapper">
                  <DollarSign size={18} className="auth-field-icon" />
                  <input
                    type="number"
                    id="editTarget"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
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
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--blue-primary)' }}>Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Deposit (BR-2) */}
      {isDepositModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-card-header">
              <h2>Catat Setoran Baru</h2>
              <button className="modal-close-btn" onClick={() => setIsDepositModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleAddDeposit} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="depAmount">Nominal Setoran (Rp)</label>
                <div className="auth-input-wrapper">
                  <DollarSign size={18} className="auth-field-icon" />
                  <input
                    type="number"
                    id="depAmount"
                    placeholder="Contoh: 500000"
                    value={depAmount}
                    onChange={(e) => setDepAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="depDate">Tanggal Setoran</label>
                <div className="auth-input-wrapper">
                  <Calendar size={18} className="auth-field-icon" />
                  <input
                    type="date"
                    id="depDate"
                    value={depDate}
                    onChange={(e) => setDepDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="depNote">Catatan / Keterangan (Opsional)</label>
                <textarea
                  id="depNote"
                  placeholder="Contoh: Sisa uang jajan mingguan, bonus lembur"
                  value={depNote}
                  onChange={(e) => setDepNote(e.target.value)}
                  rows="3"
                ></textarea>
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsDepositModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-accent">Catat Setoran</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalDetail;
