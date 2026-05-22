import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePDF } from 'react-to-pdf';
import api from '../api/axios';

const ResumePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toPDF, targetRef } = usePDF({ filename: 'resume.pdf' });

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.get(`/api/resume/${id}`);
        setResume(res.data);
      } catch (err) {
        setError('Failed to load resume. It may have been deleted or you do not have access.');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <div className="preview-page">
        <header className="preview-header">
          <span className="preview-header-title">Resume Preview</span>
        </header>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="preview-page">
        <header className="preview-header">
          <span className="preview-header-title">Resume Preview</span>
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
            ← Back to Dashboard
          </button>
        </header>
        <div className="preview-main">
          <div className="msg-error">{error || 'Resume not found.'}</div>
        </div>
      </div>
    );
  }

  const { personalInfo, education, experience, projects, skills, jobRole, aiSummary } = resume;

  const handleDownload = () => {
    toPDF();
  };

  return (
    <div className="preview-page">
      <header className="preview-header">
        <span className="preview-header-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM9 13h6v1.5H9V13zm0 3h6v1.5H9V16zm0-6h4v1.5H9V10z"/>
          </svg>
          Resume Preview
        </span>
        <div className="preview-header-actions">
          <button
            id="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline"
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
          >
            ← Dashboard
          </button>
          <button
            id="download-pdf-btn"
            onClick={handleDownload}
            className="btn btn-accent"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download PDF
          </button>
        </div>
      </header>

      <div className="preview-main">
        {/* ── PDF Content ── */}
        <div ref={targetRef} className="resume-document">
          {/* Header / Personal Info */}
          <div className="resume-top">
            <div className="resume-name">{personalInfo?.name || 'Your Name'}</div>
            {jobRole && <div className="resume-job-role">{jobRole}</div>}
            <div className="resume-contacts">
              {personalInfo?.email && (
                <span className="resume-contact-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  {personalInfo.email}
                </span>
              )}
              {personalInfo?.phone && (
                <span className="resume-contact-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  {personalInfo.phone}
                </span>
              )}
              {personalInfo?.city && (
                <span className="resume-contact-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {personalInfo.city}
                </span>
              )}
              {personalInfo?.linkedin && (
                <span className="resume-contact-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <a href={personalInfo.linkedin} target="_blank" rel="noreferrer">{personalInfo.linkedin}</a>
                </span>
              )}
              {personalInfo?.github && (
                <span className="resume-contact-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <a href={personalInfo.github} target="_blank" rel="noreferrer">{personalInfo.github}</a>
                </span>
              )}
            </div>
          </div>

          <div className="resume-body">
            {/* Professional Summary */}
            {aiSummary && (
              <div className="resume-section">
                <div className="resume-section-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  Professional Summary
                </div>
                <p className="resume-summary">{aiSummary}</p>
              </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="resume-section">
                <div className="resume-section-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                  </svg>
                  Skills
                </div>
                <div className="resume-skills-table">
                  {skills.map((s, i) => (
                    <div key={i} className="resume-skill-row">
                      <span className="resume-skill-category">{s.category}</span>
                      <span className="resume-skill-items">{s.items}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
              <div className="resume-section">
                <div className="resume-section-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.05 15.96 0 13.5 0c-1.3 0-2.51.56-3.36 1.5L9 2.7 7.86 1.5C7.01.56 5.8 0 4.5 0 2.04 0 0 2.05 0 4.64c0 .48.11.92.18 1.36H0c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
                  </svg>
                  Experience
                </div>
                {experience.map((exp, i) => (
                  <div key={i} className="resume-entry">
                    <div className="resume-entry-header">
                      <div>
                        <div className="resume-entry-title">{exp.role}</div>
                        <div className="resume-entry-subtitle">{exp.company}</div>
                      </div>
                      <div className="resume-entry-meta">{exp.duration}</div>
                    </div>
                    {exp.description && (
                      <div className="resume-entry-desc">
                        {exp.description.split('\n').map((line, li) => (
                          <div key={li}>{line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <div className="resume-section">
                <div className="resume-section-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
                  </svg>
                  Projects
                </div>
                {projects.map((proj, i) => (
                  <div key={i} className="resume-entry">
                    <div className="resume-entry-header">
                      <div className="resume-entry-title">{proj.title}</div>
                    </div>
                    {proj.techStack && (
                      <div className="resume-entry-tech">Tech Stack: {proj.techStack}</div>
                    )}
                    {proj.description && (
                      <div className="resume-entry-desc">
                        {proj.description.split('\n').map((line, li) => (
                          <div key={li}>{line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div className="resume-section">
                <div className="resume-section-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3L1 9l4 2.18V15c0 .34.17.65.44.83L12 19.5l6.56-3.67c.27-.18.44-.49.44-.83v-3.82L19 11.5V17h2V9L12 3zM17.82 9L12 12.72 6.18 9 12 5.28 17.82 9zM15 15.99l-3 1.68-3-1.68v-3.73L12 14l3-1.74v3.73z"/>
                  </svg>
                  Education
                </div>
                {education.map((edu, i) => (
                  <div key={i} className="resume-entry">
                    <div className="resume-entry-header">
                      <div>
                        <div className="resume-entry-title">{edu.degree}</div>
                        <div className="resume-entry-subtitle">{edu.college}</div>
                      </div>
                      <div className="resume-entry-meta">
                        {edu.year}{edu.percentage ? ` · ${edu.percentage}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
