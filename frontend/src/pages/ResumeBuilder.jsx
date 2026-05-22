import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STEPS = ['Personal Info', 'Education', 'Experience', 'Projects', 'Skills'];

const defaultPersonalInfo = {
  name: '', email: '', phone: '', city: '', linkedin: '', github: '',
};

const defaultEducation = {
  degree: '', college: '', year: '', percentage: '',
};

const defaultExperience = {
  company: '', role: '', duration: '', description: '',
};

const defaultProject = {
  title: '', techStack: '', description: '',
};

const SKILL_PRESETS = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Tools & Platforms',
  'Soft Skills',
  'Cloud & DevOps',
  'Testing',
  'Other',
];

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({ ...defaultPersonalInfo });
  const [education, setEducation] = useState([{ ...defaultEducation }]);
  const [experience, setExperience] = useState([{ ...defaultExperience }]);
  const [noExperience, setNoExperience] = useState(false);
  const [projects, setProjects] = useState([{ ...defaultProject }]);
  const [skills, setSkills] = useState([{ category: '', items: '' }]);
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const progressPercent = (step / (STEPS.length - 1)) * 100;

  // ─── Personal Info ────────────────────────────────────────────────────────
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Education ────────────────────────────────────────────────────────────
  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    setEducation((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [name]: value } : item))
    );
  };

  const addEducation = () => {
    setEducation((prev) => [...prev, { ...defaultEducation }]);
  };

  const removeEducation = (index) => {
    if (education.length === 1) return;
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Experience ───────────────────────────────────────────────────────────
  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    setExperience((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [name]: value } : item))
    );
  };

  const addExperience = () => {
    setExperience((prev) => [...prev, { ...defaultExperience }]);
  };

  const removeExperience = (index) => {
    if (experience.length === 1) return;
    setExperience((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Projects ─────────────────────────────────────────────────────────────
  const handleProjectChange = (index, e) => {
    const { name, value } = e.target;
    setProjects((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [name]: value } : item))
    );
  };

  const addProject = () => {
    setProjects((prev) => [...prev, { ...defaultProject }]);
  };

  const removeProject = (index) => {
    if (projects.length === 1) return;
    setProjects((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Skills (category + items key-value) ──────────────────────────────────
  const handleSkillChange = (index, field, value) => {
    setSkills((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const addSkillRow = () => {
    setSkills((prev) => [...prev, { category: '', items: '' }]);
  };

  const removeSkillRow = (index) => {
    if (skills.length === 1) return;
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Navigation ───────────────────────────────────────────────────────────
  const goNext = () => {
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!jobRole.trim()) {
      setError('Please enter the job role you are applying for.');
      return;
    }
    const validSkills = skills.filter((s) => s.category.trim() && s.items.trim());
    if (validSkills.length === 0) {
      setError('Please add at least one skill category with items.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        personalInfo,
        education,
        experience: noExperience ? [] : experience,
        projects,
        skills: validSkills,
        jobRole,
      };
      const res = await api.post('/api/resume/generate', payload);
      navigate(`/resume/${res.data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to generate resume. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Render Steps ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <h2 className="builder-step-title">Personal Information</h2>
            <p className="builder-step-desc">Tell us about yourself so we can personalize your resume.</p>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" name="name" value={personalInfo.name}
                  onChange={handlePersonalChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" name="email" value={personalInfo.email}
                  onChange={handlePersonalChange} placeholder="john@example.com" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" name="phone" value={personalInfo.phone}
                  onChange={handlePersonalChange} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" name="city" value={personalInfo.city}
                  onChange={handlePersonalChange} placeholder="New York, NY" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input className="form-input" name="linkedin" value={personalInfo.linkedin}
                  onChange={handlePersonalChange} placeholder="linkedin.com/in/johndoe" />
              </div>
              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input className="form-input" name="github" value={personalInfo.github}
                  onChange={handlePersonalChange} placeholder="github.com/johndoe" />
              </div>
            </div>
          </>
        );

      case 1:
        return (
          <>
            <h2 className="builder-step-title">Education</h2>
            <p className="builder-step-desc">Add your academic qualifications.</p>
            {education.map((edu, index) => (
              <div key={index} className="entry-card">
                <div className="entry-card-header">
                  <span className="entry-card-title">Education #{index + 1}</span>
                  {education.length > 1 && (
                    <button className="btn-remove" onClick={() => removeEducation(index)} title="Remove">✕</button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Degree / Qualification</label>
                    <input className="form-input" name="degree" value={edu.degree}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="B.Tech Computer Science" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">College / University</label>
                    <input className="form-input" name="college" value={edu.college}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="MIT" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Year of Graduation</label>
                    <input className="form-input" name="year" value={edu.year}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="2024" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Percentage / CGPA</label>
                    <input className="form-input" name="percentage" value={edu.percentage}
                      onChange={(e) => handleEducationChange(index, e)}
                      placeholder="8.5 CGPA / 85%" />
                  </div>
                </div>
              </div>
            ))}
            <button
              id="add-education-btn"
              onClick={addEducation}
              className="btn btn-outline-accent btn-sm"
              style={{ marginTop: '0.5rem' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
              Add Education
            </button>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="builder-step-title">Work Experience</h2>
            <p className="builder-step-desc">Add your professional work history.</p>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="no-experience"
                checked={noExperience}
                onChange={(e) => setNoExperience(e.target.checked)}
              />
              <label htmlFor="no-experience">I have no work experience (fresher)</label>
            </div>
            {!noExperience && (
              <>
                {experience.map((exp, index) => (
                  <div key={index} className="entry-card">
                    <div className="entry-card-header">
                      <span className="entry-card-title">Experience #{index + 1}</span>
                      {experience.length > 1 && (
                        <button className="btn-remove" onClick={() => removeExperience(index)} title="Remove">✕</button>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Company Name</label>
                        <input className="form-input" name="company" value={exp.company}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="Google Inc." />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Role / Position</label>
                        <input className="form-input" name="role" value={exp.role}
                          onChange={(e) => handleExperienceChange(index, e)}
                          placeholder="Software Engineer" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration</label>
                      <input className="form-input" name="duration" value={exp.duration}
                        onChange={(e) => handleExperienceChange(index, e)}
                        placeholder="Jan 2022 – Dec 2023" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" name="description" value={exp.description}
                        onChange={(e) => handleExperienceChange(index, e)}
                        placeholder="Describe your key responsibilities and achievements..." />
                    </div>
                  </div>
                ))}
                <button
                  id="add-experience-btn"
                  onClick={addExperience}
                  className="btn btn-outline-accent btn-sm"
                  style={{ marginTop: '0.5rem' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                  </svg>
                  Add Experience
                </button>
              </>
            )}
          </>
        );

      case 3:
        return (
          <>
            <h2 className="builder-step-title">Projects</h2>
            <p className="builder-step-desc">Showcase your best work and side projects.</p>
            {projects.map((proj, index) => (
              <div key={index} className="entry-card">
                <div className="entry-card-header">
                  <span className="entry-card-title">Project #{index + 1}</span>
                  {projects.length > 1 && (
                    <button className="btn-remove" onClick={() => removeProject(index)} title="Remove">✕</button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Project Title</label>
                    <input className="form-input" name="title" value={proj.title}
                      onChange={(e) => handleProjectChange(index, e)}
                      placeholder="E-Commerce Platform" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tech Stack</label>
                    <input className="form-input" name="techStack" value={proj.techStack}
                      onChange={(e) => handleProjectChange(index, e)}
                      placeholder="React, Node.js, MongoDB" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" name="description" value={proj.description}
                    onChange={(e) => handleProjectChange(index, e)}
                    placeholder="Describe what the project does and your role..." />
                </div>
              </div>
            ))}
            <button
              id="add-project-btn"
              onClick={addProject}
              className="btn btn-outline-accent btn-sm"
              style={{ marginTop: '0.5rem' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
              Add Project
            </button>
          </>
        );

      case 4:
        return (
          <>
            <h2 className="builder-step-title">Skills &amp; Target Role</h2>
            <p className="builder-step-desc">Organise your skills by category. The AI will use these to write a targeted resume.</p>

            <div className="form-group">
              <label className="form-label">Target Job Role *</label>
              <input
                id="job-role-input"
                className="form-input"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="Full Stack Developer, Data Scientist, UX Designer..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skills by Category *</label>
              <p className="tag-hint" style={{ marginBottom: '0.75rem' }}>
                Add a category name (e.g. <strong>Programming Languages</strong>) and the comma-separated values (e.g. <strong>Java, JavaScript, Python</strong>).
              </p>

              {skills.map((row, index) => (
                <div key={index} className="skill-row">
                  <div className="skill-row-inputs">
                    <div className="skill-row-category">
                      <input
                        className="form-input"
                        list={`preset-list-${index}`}
                        value={row.category}
                        onChange={(e) => handleSkillChange(index, 'category', e.target.value)}
                        placeholder="Category (e.g. Databases)"
                      />
                      <datalist id={`preset-list-${index}`}>
                        {SKILL_PRESETS.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>
                    <div className="skill-row-items">
                      <input
                        className="form-input"
                        value={row.items}
                        onChange={(e) => handleSkillChange(index, 'items', e.target.value)}
                        placeholder="MongoDB, MySQL, PostgreSQL"
                      />
                    </div>
                  </div>
                  {skills.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeSkillRow(index)}
                      title="Remove row"
                    >✕</button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addSkillRow}
                className="btn btn-outline-accent btn-sm"
                style={{ marginTop: '0.5rem' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                Add Category
              </button>
            </div>

            {error && <div className="msg-error">{error}</div>}
          </>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="builder-page">
        <header className="builder-header">
          <span className="builder-header-title">AI Resume Builder</span>
        </header>
        <div className="builder-main">
          <div className="builder-card">
            <div className="ai-loading">
              <div className="ai-loading-animation">
                <div className="ai-loading-ring"></div>
                <div className="ai-loading-ring"></div>
                <div className="ai-loading-ring"></div>
              </div>
              <h3>AI is crafting your resume...</h3>
              <p>Please wait while we generate professional bullet points for you.</p>
              <div className="ai-dots">
                <div className="ai-dot"></div>
                <div className="ai-dot"></div>
                <div className="ai-dot"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-page">
      <header className="builder-header">
        <span className="builder-header-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM9 13h6v1.5H9V13zm0 3h6v1.5H9V16zm0-6h4v1.5H9V10z"/>
          </svg>
          AI Resume Builder
        </span>
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
          ← Dashboard
        </button>
      </header>

      <main className="builder-main">
        {/* Progress */}
        <div className="progress-container">
          <div className="progress-steps">
            <div
              className="progress-track"
              style={{ width: `${progressPercent}%` }}
            ></div>
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`step-dot ${i === step ? 'active' : i < step ? 'completed' : ''}`}
              >
                {i < step ? '✓' : i + 1}
              </div>
            ))}
          </div>
          <div className="progress-labels">
            {STEPS.map((label, i) => (
              <div
                key={i}
                className={`progress-label ${i === step ? 'active' : i < step ? 'completed' : ''}`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="builder-card" key={step}>
          {renderStep()}

          {step < 4 && error && <div className="msg-error" style={{ marginTop: '1rem' }}>{error}</div>}

          <div className="builder-nav">
            <button
              id="prev-step-btn"
              onClick={goPrev}
              disabled={step === 0}
              className="btn btn-outline"
            >
              ← Previous
            </button>

            {step < STEPS.length - 1 ? (
              <button
                id="next-step-btn"
                onClick={goNext}
                className="btn btn-primary"
              >
                Next →
              </button>
            ) : (
              <button
                id="generate-resume-btn"
                onClick={handleGenerate}
                className="btn btn-accent btn-lg"
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
                Generate Resume
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
