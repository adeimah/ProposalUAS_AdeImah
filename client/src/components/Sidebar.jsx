import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LayoutDashboard, Target, PiggyBank, Settings, LogOut } from 'lucide-react';
import logoWebImg from '../assets/LogoWeb-Removebg.png';

const Sidebar = () => {
  const { currentUser, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logoutUser();
      navigate('/login');
    }
  };

  if (!currentUser) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logoWebImg} alt="SavingGoals logo" className="sidebar-logo-img" />
        <div className="brand-logo-text">
          <span className="brand-text-saving">Saving</span>
          <span className="brand-text-goals">Goals</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/goals"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Target size={20} />
          <span>Goals List</span>
        </NavLink>

        <NavLink 
          to="/tambah-tabungan" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <PiggyBank size={20} />
          <span>Tambah Tabungan</span>
        </NavLink>

        <NavLink 
          to="/pengaturan" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>Pengaturan</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
