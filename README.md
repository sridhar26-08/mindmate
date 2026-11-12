# MindMate AI — Student Mental Wellness & Institutional Crisis Escalation Platform

[![SDG 3: Good Health & Well-being](https://img.shields.io/badge/UN%20SDG-3%3A%20Good%20Health%20%26%20Well--being-emerald?style=flat-square)](https://sdgs.un.org/goals/goal3)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TailwindCSS-indigo?style=flat-square)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20%2B%20MongoDB-black?style=flat-square)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/AI%20Engine-FastAPI%20%2B%20Ollama%20%2F%20NLP-teal?style=flat-square)](https://fastapi.tiangolo.com/)

**MindMate AI** is a comprehensive, privacy-first university mental health platform built in alignment with **United Nations Sustainable Development Goal 3 (Good Health and Well-being)**. It provides students with a confidential sanctuary to track daily emotional states, receive AI-guided stress interventions, and access licensed campus counselors, while offering institutional administrators population-level wellness telemetry and automated crisis escalation.

> **Important Safety Note**: MindMate AI is a supportive mental wellness companion and triage platform, not a clinical diagnostic tool. In acute crises, the system immediately surfaces 24/7 emergency hotlines (e.g., 988 Lifeline).

---

## 🌟 Key Features

### 🎓 1. Student Wellness Sanctuary
- **Confidential Mood Telemetry**: Daily check-ins featuring interactive emoji selectors, energy level gauges (1–10), contributing academic pressure tags (*Exams, Deadlines, Sleep, Loneliness, Finances*), and encrypted private journaling.
- **AI Stress & Sentiment Analysis**: Real-time evaluation of emotional patterns generating personalized coping recommendations and risk classifications (*Low, Moderate, High, Critical*).
- **Interactive Mindful Break & Panic Relief**:
  - **4-4-4-4 Box Breathing Visualizer**: Animated breathing guide (Inhale, Hold, Exhale, Rest) with timer controls and cycle counters to deactivate acute fight-or-flight responses.
  - **5-4-3-2-1 Sensory Grounding Tool**: Step-by-step interactive anxiety anchor to pull students out of panic spirals before exams or presentations.
  - **Academic Micro-Resets**: Practical 20-20-20 eye strain rules, hydration prompts, and posture checks.
- **AI Burnout Predictor**: Multi-variable predictive screening evaluating study hours, sleep deficit, attendance, and assignment load to preempt academic exhaustion.
- **24/7 AI Wellness Confidant**: Context-aware conversational assistant trained to provide empathetic, evidence-backed student coping strategies.
- **Confidential Counseling Bookings**: Direct appointment scheduling with university counselors and customized trusted emergency contact escalation.

### 🛡️ 2. Institutional Admin & Counselor Console
- **Role-Gated Security**: Strict barrier between student accounts and institutional staff, protected by institutional verification passkeys (`ADMIN_SECRET`).
- **Campus Population Analytics**: Anonymized macro-level stress distributions, average campus stress scores, and historical wellness trends.
- **Counselor Appointment Management**: Full lifecycle management (*Requested, Confirmed, Cancelled*) of student counseling sessions with student context and consultation notes.
- **Critical Triage Monitor**: Real-time surveillance board identifying students categorized under "Critical" stress or "High" burnout risk for immediate campus intervention.
- **Resource & Staff Directory**: Institutional management tools to maintain active counselor rosters and certified 24/7 crisis hotlines.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)              │
│       Tailwind CSS • Chart.js • Lucide • Glassmorphism  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / JSON Web Token
┌──────────────────────────▼─────────────────────────────┐
│                 Backend API (Node.js + Express)        │
│          Zod Validation • JWT Auth • Mongoose ODM       │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
┌──────────────▼─────────────┐   ┌─────────▼─────────────┐
│       MongoDB Database      │   │   AI Wellness Engine  │
│  Users, MoodLogs, Sessions │   │  FastAPI + Ollama LLM │
│   Atlas / Local Instance   │   │  TextBlob / Fallback  │
└────────────────────────────┘   └───────────────────────┘
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (running locally or via MongoDB Atlas)
- *(Optional)* Ollama (`ollama pull llama3.2:3b`)

### 1. Clone & Setup Environment
```bash
git clone https://github.com/sridhar26-08/mindmate.git
cd mindmate

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Run Database
Start your local MongoDB daemon:
```bash
mongod --dbpath ./data/db --port 27018
```

### 3. Start Backend API
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5001
```

### 4. Start AI Service
```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
# Running on http://localhost:8000
```

### 5. Start Frontend Web Application
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5175
```

---

## ☁️ 100% Free Cloud Deployment Guide

MindMate is pre-configured for seamless zero-cost deployment using industry-standard platforms:

### 1. Database (MongoDB Atlas)
1. Create a free **M0 Cluster** on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Set Network Access to `0.0.0.0/0` (Allow from anywhere).
3. Copy your database connection URI:
   `mongodb+srv://<username>:<password>@cluster.mongodb.net/mindmate?retryWrites=true&w=majority`

### 2. Backend (Render)
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a **Web Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Environment Variables**:
     - `PORT` = `5001`
     - `MONGODB_URI` = `Your MongoDB Atlas URI`
     - `JWT_SECRET` = `mindmate-secure-jwt-key-2026`
     - `ADMIN_SECRET` = `mindmate-admin-secret`
     - `CLIENT_URL` = `*`

### 3. Frontend (Vercel)
1. Import your repository into [Vercel](https://vercel.com).
2. Select **Framework Preset**: `Vite`.
3. Set **Root Directory**: `frontend`.
4. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
5. Click **Deploy**.

---

## 🔒 Institutional Security & Demo Passkeys

| Portal | Route | Access Requirements | Default Credentials |
| :--- | :--- | :--- | :--- |
| **Student Sanctuary** | `/student/login` | University Email & Password | Self-registration open |
| **Admin & Staff Console** | `/admin/login` | Institutional Clearance | Registration requires Passkey: `mindmate-admin-secret` |

---

## 📡 REST API Reference

### Authentication & Profiles
- `POST /api/auth/register` — Register student or verified admin (with `adminSecret`).
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/me` — Retrieve verified user profile.
- `PATCH /api/auth/me` — Update emergency contact & study preferences.

### Moods & Telemetry
- `POST /api/moods` — Log check-in, energy levels, tags, and run AI analysis.
- `GET /api/moods` — Retrieve user mood history.
- `GET /api/moods/dashboard` — Aggregated 7-day and 30-day student telemetry.
- `GET /api/moods/calendar` — Date-range mood logs.

### AI & Assessments
- `POST /api/chat` — Context-aware AI wellness conversation with crisis detection.
- `POST /api/assessments/burnout` — Multi-variable burnout risk calculation.
- `GET /api/assessments` — Historical assessment reports.

### Counseling & Support
- `GET /api/support/counselors` — View campus counselor directory.
- `POST /api/support/appointments` — Book 1-on-1 counselor session.
- `GET /api/support/resources` — Certified emergency helplines & wellness guides.
- `GET / POST / DELETE /api/emergency-contacts` — Manage trusted contact alerts.

### Institutional Oversight (Admin Only)
- `GET /api/admin/analytics` — Campus-wide aggregated stress distributions.
- `GET /api/admin/appointments` — View student counseling booking requests.
- `PATCH /api/admin/appointments/:id` — Update booking status (*confirmed / cancelled*).
- `GET /api/admin/critical-alerts` — Triage monitor for students at Critical / High risk.
- `POST / DELETE /api/admin/counselors` — Manage staff roster.
- `POST / DELETE /api/admin/resources` — Manage emergency crisis resources.

---

## 📄 License & Attribution

Distributed under the MIT License. Developed to advance digital health and private mental wellness support across academic institutions.
