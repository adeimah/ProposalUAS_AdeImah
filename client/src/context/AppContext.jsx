import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Helper to get date string in 2026 for consistency
const getFutureDate2026 = (monthNum) => {
  // Return formatted date string: YYYY-MM-DD
  const m = String(monthNum).padStart(2, '0');
  return `2026-${m}-15`;
};

// Initial mock data with 2026 dates to align with dashboard dropdowns
const initialGoals = [
  {
    id: 'goal-1',
    name: 'Dana Darurat Medis',
    targetAmount: 10000000,
    deadline: getFutureDate2026(12),
    createdAt: '2026-01-10',
    userId: 'user-demo'
  },
  {
    id: 'goal-2',
    name: 'Liburan Akhir Tahun ke Bali',
    targetAmount: 8000000,
    deadline: getFutureDate2026(12),
    createdAt: '2026-01-15',
    userId: 'user-demo'
  },
  {
    id: 'goal-3',
    name: 'Dana Pendidikan S2',
    targetAmount: 6000000,
    deadline: getFutureDate2026(7),
    createdAt: '2026-01-05',
    userId: 'user-demo'
  },
  {
    id: 'goal-4',
    name: 'Beli Laptop ASUS ROG',
    targetAmount: 5000000,
    deadline: getFutureDate2026(9),
    createdAt: '2026-02-01',
    userId: 'user-demo'
  }
];

const initialDeposits = [
  // Deposits for Dana Darurat
  { id: 'dep-1', goalId: 'goal-1', amount: 3000000, date: '2026-02-12', note: 'Alokasi gajian pertama' },
  { id: 'dep-2', goalId: 'goal-1', amount: 1000000, date: '2026-05-12', note: 'Nabung Mei 2026' },
  
  // Deposits for Bali
  { id: 'dep-3', goalId: 'goal-2', amount: 2000000, date: '2026-02-10', note: 'Setoran tiket pesawat' },
  { id: 'dep-4', goalId: 'goal-2', amount: 1000000, date: '2026-05-10', note: 'Nabung bulanan' },

  // Deposits for Dana Pendidikan
  { id: 'dep-5', goalId: 'goal-3', amount: 1500000, date: '2026-03-09', note: 'Setoran pendidikan' },
  { id: 'dep-6', goalId: 'goal-3', amount: 500000, date: '2026-05-09', note: 'Nabung bulanan' },

  // Deposits for Laptop
  { id: 'dep-7', goalId: 'goal-4', amount: 1000000, date: '2026-05-11', note: 'Alokasi Laptop' }
];

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('sg_users');
    return saved ? JSON.parse(saved) : [
      { id: 'user-demo', name: 'Ade Imah', email: 'adeimah@gmail.com', password: 'password123' }
    ];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sg_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('sg_goals');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [deposits, setDeposits] = useState(() => {
    const saved = localStorage.getItem('sg_deposits');
    return saved ? JSON.parse(saved) : initialDeposits;
  });

  // Global Toast State for professional notifications
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const triggerToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sg_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sg_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sg_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sg_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('sg_deposits', JSON.stringify(deposits));
  }, [deposits]);

  // Auth Operations
  const registerUser = (name, email, password) => {
    setError(null);
    setSuccess(null);

    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      setError('Email sudah terdaftar.');
      triggerToast('error', 'Registrasi gagal! Email sudah terdaftar.');
      return false;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password
    };

    setUsers(prev => [...prev, newUser]);
    triggerToast('success', 'Registrasi berhasil! Silakan login.');
    return true;
  };

  const loginUser = (email, password) => {
    setError(null);
    setSuccess(null);

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      setError('Email atau password salah.');
      triggerToast('error', 'Login gagal! Email atau password salah.');
      return false;
    }

    const mockToken = `mock-jwt-header.${btoa(JSON.stringify({ id: user.id, email: user.email, name: user.name }))}.mock-signature`;
    
    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      token: mockToken
    };

    setCurrentUser(userSession);
    triggerToast('success', `Selamat datang kembali, ${user.name}!`);
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    triggerToast('success', 'Anda telah berhasil keluar dari akun.');
  };

  const updateUserProfile = (name, email, phone, newPassword = null) => {
    setError(null);
    if (!currentUser) return false;

    const emailExists = users.some(
      u => u.email.toLowerCase() === email.toLowerCase() && u.id !== currentUser.id
    );
    if (emailExists) {
      setError('Email sudah terdaftar pada akun lain.');
      triggerToast('error', 'Update gagal! Email sudah digunakan.');
      return false;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = {
          ...u,
          name,
          email,
          phone: phone || ''
        };
        if (newPassword) {
          updated.password = newPassword;
        }
        return updated;
      }
      return u;
    }));

    setCurrentUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        name,
        email,
        phone: phone || ''
      };
    });

    triggerToast('success', 'Profil dan pengaturan berhasil disimpan!');
    return true;
  };

  const deleteUserAccount = () => {
    setError(null);
    if (!currentUser) return false;
    const userId = currentUser.id;

    // Clean up goals and deposits of this user
    setGoals(prev => prev.filter(g => g.userId !== userId));
    setDeposits(prev => {
      const userGoalIds = goals.filter(g => g.userId === userId).map(g => g.id);
      return prev.filter(d => !userGoalIds.includes(d.goalId));
    });

    // Remove user
    setUsers(prev => prev.filter(u => u.id !== userId));

    // Clear current user
    setCurrentUser(null);
    triggerToast('success', 'Akun Anda berhasil dihapus.');
    return true;
  };

  // Saving Goals Operations
  const addGoal = (name, targetAmount, deadline) => {
    setError(null);
    if (!currentUser) return false;

    const targetNum = parseFloat(targetAmount);
    const newGoal = {
      id: `goal-${Date.now()}`,
      name,
      targetAmount: targetNum,
      deadline,
      createdAt: new Date().toISOString().split('T')[0],
      userId: currentUser.id
    };

    setGoals(prev => [newGoal, ...prev]);
    triggerToast('success', 'Target menabung berhasil dibuat!');
    return true;
  };

  const updateGoal = (id, name, targetAmount, deadline) => {
    setError(null);
    if (!currentUser) return false;

    const targetNum = parseFloat(targetAmount);

    setGoals(prev => prev.map(goal => {
      if (goal.id === id && goal.userId === currentUser.id) {
        return {
          ...goal,
          name,
          targetAmount: targetNum,
          deadline
        };
      }
      return goal;
    }));

    triggerToast('success', 'Target menabung berhasil diperbarui!');
    return true;
  };

  const deleteGoal = (id) => {
    setError(null);
    if (!currentUser) return false;

    setGoals(prev => prev.filter(goal => !(goal.id === id && goal.userId === currentUser.id)));
    setDeposits(prev => prev.filter(dep => dep.goalId !== id));

    triggerToast('success', 'Target menabung berhasil dihapus.');
    return true;
  };

  // Deposits Operations
  const addDeposit = (goalId, amount, date, note = '') => {
    setError(null);
    if (!currentUser) return false;

    const amountNum = parseFloat(amount);
    const newDeposit = {
      id: `dep-${Date.now()}`,
      goalId,
      amount: amountNum,
      date: date || new Date().toISOString().split('T')[0],
      note
    };

    setDeposits(prev => [newDeposit, ...prev]);
    triggerToast('success', 'Setoran tabungan berhasil dicatat!');
    return true;
  };

  // Helper calculations
  const getGoalProgress = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { totalDeposited: 0, percent: 0, remaining: 0 };

    const goalDeposits = deposits.filter(d => d.goalId === goalId);
    const totalDeposited = goalDeposits.reduce((sum, dep) => sum + dep.amount, 0);
    const percent = Math.min(100, Math.round((totalDeposited / goal.targetAmount) * 100 * 10) / 10);
    const remaining = Math.max(0, goal.targetAmount - totalDeposited);

    return {
      totalDeposited,
      percent,
      remaining
    };
  };

  const getStats = () => {
    if (!currentUser) return { totalSaved: 0, activeGoals: 0, averageDeposit: 0, completedGoals: 0 };

    const userGoals = goals.filter(g => g.userId === currentUser.id);
    const userGoalIds = userGoals.map(g => g.id);
    const userDeposits = deposits.filter(d => userGoalIds.includes(d.goalId));

    const totalSaved = userDeposits.reduce((sum, dep) => sum + dep.amount, 0);
    
    let completedGoals = 0;
    userGoals.forEach(g => {
      const { percent } = getGoalProgress(g.id);
      if (percent >= 100) completedGoals++;
    });

    const averageDeposit = userDeposits.length > 0 ? Math.round(totalSaved / userDeposits.length) : 0;

    return {
      totalSaved,
      activeGoals: userGoals.length - completedGoals,
      completedGoals,
      averageDeposit,
      depositCount: userDeposits.length
    };
  };

  const getEstimasiSelesai = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return 'N/A';

    const { remaining } = getGoalProgress(goalId);
    if (remaining <= 0) return 'Tercapai';

    const goalDeposits = deposits.filter(d => d.goalId === goalId);
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

    const avgDaysBetween = diffDays > 0 ? diffDays / (sortedDeps.length - 1) : 30; // Assume monthly if same day
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
        goals: goals.filter(g => currentUser && g.userId === currentUser.id),
        allGoals: goals,
        allDeposits: deposits,
        deposits: deposits.filter(d => {
          if (!currentUser) return false;
          const userGoalIds = goals.filter(g => g.userId === currentUser.id).map(g => g.id);
          return userGoalIds.includes(d.goalId);
        }),
        registerUser,
        loginUser,
        logoutUser,
        updateUserProfile,
        deleteUserAccount,
        users,
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
