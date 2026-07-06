import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GoalDetail from './pages/GoalDetail';
import GoalsList from './pages/GoalsList';
import TambahTabungan from './pages/TambahTabungan';
import Pengaturan from './pages/Pengaturan';
import Toast from './components/Toast';
import './App.css';

function AppContent() {
  const { currentUser } = useContext(AppContext);

  if (!currentUser) {
    return (
      <div className="auth-viewport">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toast />
      </div>
    );
  }

  return (
    <div className="app-layout has-sidebar">
      <Sidebar />
      <main className="main-viewport">
        <Routes>
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/goals" 
            element={
              <ProtectedRoute>
                <GoalsList />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tambah-tabungan" 
            element={
              <ProtectedRoute>
                <TambahTabungan />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/pengaturan" 
            element={
              <ProtectedRoute>
                <Pengaturan />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/goals/:id" 
            element={
              <ProtectedRoute>
                <GoalDetail />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all redirection */}
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </main>
      <Toast />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
