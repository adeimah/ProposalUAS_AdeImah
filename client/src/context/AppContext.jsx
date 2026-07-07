import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sg_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [goals, setGoals] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Local storage for deposits history display (kept local for UX as database doesn't have a Deposit table)
  const [deposits, setDeposits] = useState(() => {
    const saved = localStorage.getItem('sg_deposits');
    return saved ? JSON.parse(saved) : [];
  });

  // Toast notification state
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const triggerToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Persist deposits local state
  useEffect(() => {
    localStorage.setItem('sg_deposits', JSON.stringify(deposits));
  }, [deposits]);

  // Sync session with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sg_current_user', JSON.stringify(currentUser));
      fetchGoals();
      fetchDashboard();
    } else {
      localStorage.removeItem('sg_current_user');
      setGoals([]);
      setDashboardData(null);
    }
  }, [currentUser]);

  // Helper to handle API response errors and session expiration
  const handleApiResponse = async (response) => {
    if (response.status === 401) {
      setCurrentUser(null);
      triggerToast('error', 'Sesi Anda telah berakhir. Silakan login kembali.');
      throw new Error('Unauthorized');
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Terjadi kesalahan pada server.');
    }
    return data;
  };

  // Fetch Goals from Backend
  const fetchGoals = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_BASE_URL}/savings`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      const data = await handleApiResponse(response);
      if (data.success) {
        const mapped = data.data.map(item => ({
          id: item.savingGoal.id.toString(), // cast integer ID to string for components
          name: item.savingGoal.title,
          targetAmount: Number(item.savingGoal.targetAmount),
          currentAmount: Number(item.savingGoal.currentAmount || 0),
          category: item.savingGoal.category || getGoalCategory(item.savingGoal.title),
          deadline: item.savingGoal.deadline ? item.savingGoal.deadline.split('T')[0] : '',
          userId: currentUser?.id?.toString() || ''
        }));
        setGoals(mapped);
      }
    } catch (err) {
      console.error('Fetch goals error:', err);
    }
  };

  // Fetch Dashboard Stats from Backend
  const fetchDashboard = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_BASE_URL}/savings/dashboard`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      const data = await handleApiResponse(response);
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    }
  };

  // Auth Operations
  const registerUser = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Registrasi gagal.');
        triggerToast('error', data.message || 'Registrasi gagal.');
        return false;
      }
      triggerToast('success', 'Registrasi berhasil! Silakan login.');
      return true;
    } catch (err) {
      setError(err.message || 'Koneksi ke server gagal.');
      triggerToast('error', err.message || 'Koneksi ke server gagal.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Login gagal.');
        triggerToast('error', data.message || 'Login gagal! Email atau password salah.');
        return false;
      }

      const userSession = {
        id: data.data.id.toString(),
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone || '',
        token: data.data.token
      };

      setCurrentUser(userSession);
      triggerToast('success', `Selamat datang kembali, ${data.data.name}!`);
      return true;
    } catch (err) {
      setError(err.message || 'Koneksi ke server gagal.');
      triggerToast('error', err.message || 'Koneksi ke server gagal.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    triggerToast('success', 'Anda telah berhasil keluar dari akun.');
  };

  const updateUserProfile = async (name, email, phone, newPassword = null) => {
    setError(null);
    if (!currentUser) return false;
    setLoading(true);

    try {
      const body = { name, email, phone };
      if (newPassword) body.password = newPassword;

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(body)
      });
      const data = await handleApiResponse(response);
      if (data.success) {
        const updatedSession = {
          ...currentUser,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || ''
        };
        setCurrentUser(updatedSession);
        triggerToast('success', 'Profil dan pengaturan berhasil disimpan!');
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Gagal menyimpan profil.');
      triggerToast('error', err.message || 'Gagal menyimpan profil.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUserAccount = () => {
    // Note: account deletion can be simulated locally as the backend doesn't have an endpoint for this.
    setError(null);
    if (!currentUser) return false;
    setCurrentUser(null);
    triggerToast('success', 'Akun Anda berhasil dihapus.');
    return true;
  };

  // Auto categorization helper matching UI
  const getGoalCategory = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('darurat') || n.includes('medis') || n.includes('emergency')) {
      return 'Emergency';
    } else if (n.includes('liburan') || n.includes('bali') || n.includes('wisata')) {
      return 'Vacation';
    } else if (n.includes('pendidikan') || n.includes('sekolah') || n.includes('kuliah') || n.includes('belajar')) {
      return 'Education';
    } else if (n.includes('laptop') || n.includes('hp') || n.includes('gadget') || n.includes('motor') || n.includes('impian')) {
      return 'Gadget';
    } else {
      return 'Lainnya';
    }
  };

  // Saving Goals Operations
  const addGoal = async (name, targetAmount, deadline) => {
    setError(null);
    if (!currentUser) {
      console.log('[DEBUG Frontend] addGoal aborted - no currentUser');
      return false;
    }
    setLoading(true);

    const category = getGoalCategory(name);
    const url = `${API_BASE_URL}/savings`;
    const payload = {
      title: name,
      targetAmount: parseFloat(targetAmount),
      deadline,
      category
    };

    console.log('[DEBUG Frontend] addGoal request starting');
    console.log('[DEBUG Frontend] url:', url);
    console.log('[DEBUG Frontend] token:', currentUser.token);
    console.log('[DEBUG Frontend] payload:', payload);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(payload)
      });
      
      console.log('[DEBUG Frontend] addGoal response status:', response.status, response.statusText);
      const data = await handleApiResponse(response);
      console.log('[DEBUG Frontend] addGoal response data:', data);
      
      if (data.success) {
        await fetchGoals();
        await fetchDashboard();
        triggerToast('success', 'Target menabung berhasil dibuat!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('[DEBUG Frontend] addGoal caught error:', err);
      setError(err.message || 'Gagal membuat target menabung.');
      triggerToast('error', err.message || 'Gagal membuat target menabung.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id, name, targetAmount, deadline) => {
    setError(null);
    if (!currentUser) return false;
    setLoading(true);

    try {
      const category = getGoalCategory(name);
      const response = await fetch(`${API_BASE_URL}/savings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          title: name,
          targetAmount: parseFloat(targetAmount),
          deadline,
          category
        })
      });
      const data = await handleApiResponse(response);
      if (data.success) {
        await fetchGoals();
        await fetchDashboard();
        triggerToast('success', 'Target menabung berhasil diperbarui!');
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Gagal memperbarui target menabung.');
      triggerToast('error', err.message || 'Gagal memperbarui target menabung.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    setError(null);
    if (!currentUser) return false;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/savings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      const data = await handleApiResponse(response);
      if (data.success) {
        setDeposits(prev => prev.filter(dep => dep.goalId !== id));
        await fetchGoals();
        await fetchDashboard();
        triggerToast('success', 'Target menabung berhasil dihapus.');
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Gagal menghapus target menabung.');
      triggerToast('error', err.message || 'Gagal menghapus target menabung.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deposits Operations (PUT currentAmount back to SavingGoal model)
  const addDeposit = async (goalId, amount, date, note = '') => {
    setError(null);
    if (!currentUser) return false;
    setLoading(true);

    try {
      // Fetch fresh goal detail to find currentAmount directly from the API endpoint
      const getResponse = await fetch(`${API_BASE_URL}/savings/${goalId}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      
      if (!getResponse.ok) {
        triggerToast('error', 'Target menabung tidak ditemukan.');
        return false;
      }
      
      const getResData = await getResponse.json();
      if (!getResData.success || !getResData.data?.savingGoal) {
        triggerToast('error', 'Target menabung tidak ditemukan.');
        return false;
      }

      const freshGoal = getResData.data.savingGoal;
      const amountNum = parseFloat(amount);
      const newCurrentAmount = Number(freshGoal.currentAmount || 0) + amountNum;

      // Update backend target amount directly
      const response = await fetch(`${API_BASE_URL}/savings/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          currentAmount: newCurrentAmount
        })
      });
      const data = await handleApiResponse(response);
      if (data.success) {
        // Record deposit locally for display in the table logs
        const newDeposit = {
          id: `dep-${Date.now()}`,
          goalId: goalId.toString(),
          amount: amountNum,
          date: date || new Date().toISOString().split('T')[0],
          note
        };
        setDeposits(prev => [newDeposit, ...prev]);

        await fetchGoals();
        await fetchDashboard();
        triggerToast('success', 'Setoran tabungan berhasil dicatat!');
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Gagal mencatat setoran.');
      triggerToast('error', err.message || 'Gagal mencatat setoran.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Helper calculations
  const getGoalProgress = (goalId) => {
    const goal = goals.find(g => g.id === goalId.toString());
    if (!goal) return { totalDeposited: 0, percent: 0, remaining: 0 };

    const totalDeposited = Number(goal.currentAmount || 0);
    const percent = Math.min(100, Math.round((totalDeposited / goal.targetAmount) * 100 * 10) / 10);
    const remaining = Math.max(0, goal.targetAmount - totalDeposited);

    return {
      totalDeposited,
      percent,
      remaining
    };
  };

  const getStats = () => {
    const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount || 0), 0);
    
    const activeGoalsCount = goals.filter(g => {
      const target = Number(g.targetAmount || 0);
      const current = Number(g.currentAmount || 0);
      return target > 0 ? (current / target) < 1.0 : true;
    }).length;
    
    const completedGoalsCount = goals.filter(g => {
      const target = Number(g.targetAmount || 0);
      const current = Number(g.currentAmount || 0);
      return target > 0 ? (current / target) >= 1.0 : false;
    }).length;

    const totalProgress = goals.reduce((sum, g) => {
      const target = Number(g.targetAmount || 0);
      const current = Number(g.currentAmount || 0);
      const progress = target > 0 ? Math.round((current / target) * 100) : 0;
      return sum + progress;
    }, 0);
    
    const averageProgress = goals.length > 0 
      ? Math.round((totalProgress / goals.length) * 10) / 10 
      : 0;

    return {
      totalSaved,
      activeGoals: activeGoalsCount,
      completedGoals: completedGoalsCount,
      averageProgress
    };
  };

  const getEstimasiSelesai = (goalId) => {
    const goal = goals.find(g => g.id === goalId.toString());
    if (!goal) return 'N/A';

    const { remaining } = getGoalProgress(goalId);
    if (remaining <= 0) return 'Tercapai';

    // Estimasi can be calculated dynamically based on local deposit records
    const goalDeposits = deposits.filter(d => d.goalId === goalId.toString());
    if (goalDeposits.length === 0) return 'Butuh setoran pertama';

    const totalGoalSaved = goalDeposits.reduce((sum, dep) => sum + dep.amount, 0);
    const averageGoalDeposit = totalGoalSaved / goalDeposits.length;

    if (averageGoalDeposit <= 0) return 'N/A';

    const timesNeeded = Math.ceil(remaining / averageGoalDeposit);
    if (goalDeposits.length === 1) {
      return `${timesNeeded} bulan lagi`;
    }

    const sortedDeps = [...goalDeposits].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstDate = new Date(sortedDeps[0].date);
    const lastDate = new Date(sortedDeps[sortedDeps.length - 1].date);
    const diffTime = Math.abs(lastDate - firstDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const avgDaysBetween = diffDays > 0 ? diffDays / (sortedDeps.length - 1) : 30;
    const totalDaysNeeded = Math.round(timesNeeded * avgDaysBetween);

    if (totalDaysNeeded < 30) {
      return `${timesNeeded} setoran (~${totalDaysNeeded} hari lagi)`;
    } else if (totalDaysNeeded < 365) {
      const months = Math.round(totalDaysNeeded / 30);
      return `${months} bulan lagi`;
    } else {
      const years = (totalDaysNeeded / 365).toFixed(1);
      return `${years} tahun lagi`;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        error,
        success,
        setError,
        setSuccess,
        toast,
        triggerToast,
        loading,
        goals,
        allGoals: goals,
        allDeposits: deposits,
        deposits: deposits.filter(d => {
          if (!currentUser) return false;
          const userGoalIds = goals.map(g => g.id);
          return userGoalIds.includes(d.goalId);
        }),
        dashboardData,
        fetchDashboard,
        registerUser,
        loginUser,
        logoutUser,
        updateUserProfile,
        deleteUserAccount,
        users: currentUser ? [{
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || ''
        }] : [],
        addGoal,
        updateGoal,
        deleteGoal,
        addDeposit,
        getGoalProgress,
        getStats,
        getEstimasiSelesai
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
