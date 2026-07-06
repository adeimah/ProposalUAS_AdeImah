import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  PiggyBank, 
  DollarSign, 
  Calendar, 
  Upload, 
  Check, 
  RefreshCw,
  File,
  FileText
} from 'lucide-react';

const TambahTabungan = () => {
  const { goals, addDeposit, getGoalProgress, triggerToast } = useContext(AppContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  // Filter out completed goals (only show active/running goals)
  const activeGoals = goals.filter(g => {
    const { percent } = getGoalProgress(g.id);
    return percent < 100;
  });

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedGoalId) {
      triggerToast('error', 'Silakan pilih target tabungan terlebih dahulu.');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast('error', 'Nominal setoran harus berupa angka positif.');
      return;
    }

    const success = addDeposit(selectedGoalId, amount, date, note);
    if (success) {
      // Clear form
      setSelectedGoalId('');
      setAmount('');
      setNote('');
      setUploadedFile(null);
      setDate(new Date().toISOString().split('T')[0]);

      // Redirect to target details page or dashboard
      setTimeout(() => {
        navigate(`/goals/${selectedGoalId}`);
      }, 500);
    }
  };

  // Reset Handler
  const handleReset = () => {
    setSelectedGoalId('');
    setAmount('');
    setNote('');
    setUploadedFile(null);
    setDate(new Date().toISOString().split('T')[0]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    triggerToast('success', 'Formulir berhasil direset.');
  };

  return (
    <div className="tambah-tabungan-page">
      {/* Header */}
      <header className="dashboard-header-row">
        <div className="header-welcome">
          <h1>Catat Setoran Tabungan</h1>
          <p className="subtitle">Tambah setoran uang ke salah satu target tabungan aktif Anda.</p>
        </div>
      </header>

      <div className="tambah-tabungan-container">
        <div className="tambah-tabungan-card">
          <form onSubmit={handleSubmit} className="auth-form">
            
            {/* Goal Select Dropdown */}
            <div className="auth-input-group">
              <label htmlFor="goalSelect">Pilih Target Tabungan</label>
              <div className="auth-input-wrapper">
                <PiggyBank size={18} className="auth-field-icon" />
                <select
                  id="goalSelect"
                  className="filter-select"
                  style={{ width: '100%', paddingLeft: '2.75rem', height: '48px', borderRadius: '12px' }}
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  required
                >
                  <option value="">-- Pilih Target --</option>
                  {activeGoals.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deposit Amount Input */}
            <div className="auth-input-group">
              <label htmlFor="depositAmount">Nominal Setoran (Rp)</label>
              <div className="auth-input-wrapper">
                <DollarSign size={18} className="auth-field-icon" />
                <input
                  type="number"
                  id="depositAmount"
                  placeholder="Masukkan nominal setoran. Contoh: 500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date Input */}
            <div className="auth-input-group">
              <label htmlFor="depositDate">Tanggal Setoran</label>
              <div className="auth-input-wrapper">
                <Calendar size={18} className="auth-field-icon" />
                <input
                  type="date"
                  id="depositDate"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Notes Textarea */}
            <div className="auth-input-group">
              <label htmlFor="depositNote">Catatan / Keterangan (Opsional)</label>
              <div className="auth-input-wrapper">
                <FileText size={18} className="auth-field-icon" style={{ alignSelf: 'flex-start', marginTop: '0.875rem' }} />
                <textarea
                  id="depositNote"
                  className="auth-textarea"
                  style={{ 
                    width: '100%', 
                    border: '1px solid var(--border-medium)', 
                    borderRadius: '12px', 
                    paddingLeft: '2.75rem', 
                    paddingTop: '0.75rem', 
                    paddingRight: '1rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    minHeight: '100px', 
                    fontFamily: 'inherit',
                    backgroundColor: 'var(--bg-white)',
                    transition: 'var(--transition)'
                  }}
                  placeholder="Masukkan keterangan (misal: Sisa uang jajan, bonus proyek)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
            </div>

            {/* Upload Proof (UI only) */}
            <div className="auth-input-group">
              <label>Unggah Bukti Setoran (Opsional)</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
                accept="image/*,application/pdf"
              />
              
              <div 
                className="upload-dropzone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <Upload size={32} className="upload-icon" />
                <span className="upload-text">Tarik file bukti transfer di sini atau klik untuk memilih</span>
                <span className="upload-subtext">Mendukung format JPG, PNG, PDF (Maks. 5MB)</span>

                {uploadedFile && (
                  <div className="uploaded-file-info" onClick={(e) => e.stopPropagation()}>
                    <div className="file-detail">
                      <File size={16} className="brand-text-saving" />
                      <span title={uploadedFile.name} style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {uploadedFile.name}
                      </span>
                      <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>({uploadedFile.size})</span>
                    </div>
                    <button type="button" className="btn-remove-file" onClick={handleRemoveFile}>&times;</button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions button row */}
            <div className="form-actions-row">
              <button 
                type="button" 
                className="btn btn-secondary"
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                onClick={handleReset}
              >
                <RefreshCw size={16} />
                <span>Reset</span>
              </button>
              
              <button 
                type="submit" 
                className="btn btn-accent"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--text-main)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <Check size={16} />
                <span>Simpan Setoran</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default TambahTabungan;
