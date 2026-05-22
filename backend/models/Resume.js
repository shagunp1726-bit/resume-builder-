const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  personalInfo: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
  },
  education: [
    {
      degree: { type: String, default: '' },
      college: { type: String, default: '' },
      year: { type: String, default: '' },
      percentage: { type: String, default: '' },
    },
  ],
  experience: [
    {
      company: { type: String, default: '' },
      role: { type: String, default: '' },
      duration: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  ],
  projects: [
    {
      title: { type: String, default: '' },
      techStack: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  ],
  skills: [
    {
      category: { type: String, default: '' },
      items:    { type: String, default: '' },
    },
  ],
  jobRole: { type: String, default: '' },
  aiSummary: { type: String, default: '' },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', resumeSchema);
