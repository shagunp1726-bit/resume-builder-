# 🤖 AI-Powered Resume Builder

A full-stack MERN application that uses Google Gemini AI to generate professional resume summaries.

## 🗂️ Project Structure

```
resume bulder/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Resume.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── resume.js
│   ├── .env                  ← Fill in your credentials!
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ResumeBuilder.jsx
    │   │   └── ResumePreview.jsx
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## ⚙️ Setup

### 1. Configure Environment Variables

Edit `backend/.env` and replace the placeholder values:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/resumebuilder
JWT_SECRET=your_long_random_secret_string
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
```

**Getting API Keys:**
- **MongoDB URI**: [MongoDB Atlas](https://cloud.mongodb.com) → Create free cluster → Connect → Get connection string
- **Gemini API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey) → Create API key
- **JWT Secret**: Any long random string (e.g., run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)

### 2. Start the Backend

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 3. Start the Frontend

```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

## 🚀 Features

- **🔐 Authentication** — JWT-based login/register with bcrypt password hashing
- **📝 5-Step Resume Builder** — Personal Info → Education → Experience → Projects → Skills
- **🤖 AI Summary** — Google Gemini generates an 80-100 word professional summary
- **📄 PDF Export** — Download your resume as a PDF
- **📊 Dashboard** — View, manage, and delete all your resumes
- **📱 Responsive** — Works on mobile and desktop

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Vanilla CSS (custom design system) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |
| AI | Google Gemini Pro API |
| PDF | react-to-pdf |
| HTTP | Axios |

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT token |
| POST | `/api/resume/generate` | Yes | Generate AI resume |
| GET | `/api/resume/my-resumes` | Yes | Get all user resumes |
| GET | `/api/resume/:id` | Yes | Get single resume |
| DELETE | `/api/resume/:id` | Yes | Delete resume |
