import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/resume/my-resumes');
      setResumes(res.data);
    } catch (err) {
      setError('Failed to load resumes. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/resume/${id}`);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError('Failed to delete resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-logo">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM9 13h6v1.5H9V13zm0 3h6v1.5H9V16zm0-6h4v1.5H9V10z"/>
            </svg>
          </div>
          <span className="dashboard-brand">AI Resume Builder</span>
        </div>
        <div className="dashboard-header-right">
          <div className="dashboard-user-info">
            <span className="dashboard-user-name">{user?.name}</span>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-hero">
          <div className="dashboard-hero-text">
            <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Build your next professional resume powered by AI</p>
          </div>
          <button
            id="create-resume-btn"
            onClick={() => navigate('/builder')}
            className="btn btn-accent btn-lg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
            Create New Resume
          </button>
        </div>

        {error && <div className="msg-error">{error}</div>}

        <div className="dashboard-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--primary)">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM9 13h6v1.5H9V13zm0 3h6v1.5H9V16zm0-6h4v1.5H9V10z"/>
          </svg>
          My Resumes
          {!loading && resumes.length > 0 && (
            <span style={{
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              padding: '0.15rem 0.6rem',
              fontWeight: '600',
            }}>
              {resumes.length}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM9 13h6v1.5H9V13zm0 3h6v1.5H9V16zm0-6h4v1.5H9V10z"/>
              </svg>
            </div>
            <h3>No resumes yet</h3>
            <p>Create your first AI-powered resume and land your dream job!</p>
            <button
              id="create-first-resume-btn"
              onClick={() => navigate('/builder')}
              className="btn btn-primary btn-lg"
            >
              Create Your First Resume
            </button>
          </div>
        ) : (
          <div className="resume-grid">
            {resumes.map((resume) => (
              <div key={resume._id} className="resume-card">
                <div className="resume-card-header">
                  <div className="resume-card-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM9 13h6v1.5H9V13zm0 3h6v1.5H9V16zm0-6h4v1.5H9V10z"/>
                    </svg>
                  </div>
                  <div className="resume-card-info">
                    <h3>{resume.personalInfo?.name || 'Unnamed Resume'}</h3>
                    <span className="role-badge">{resume.jobRole || 'No role specified'}</span>
                  </div>
                </div>
                <div className="resume-card-date">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--gray-400)">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM7 12h5v5H7z"/>
                  </svg>
                  {formatDate(resume.createdAt)}
                </div>
                <div className="resume-card-actions">
                  <button
                    id={`view-resume-${resume._id}`}
                    onClick={() => navigate(`/resume/${resume._id}`)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    View
                  </button>
                  <button
                    id={`delete-resume-${resume._id}`}
                    onClick={() => handleDelete(resume._id)}
                    className="btn btn-danger btn-sm"
                    disabled={deletingId === resume._id}
                  >
                    {deletingId === resume._id ? (
                      <span className="spinner" style={{ width: '13px', height: '13px', borderWidth: '2px' }}></span>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
