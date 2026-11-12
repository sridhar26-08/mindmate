# MindMate AI — Student Mental Wellness Assistant

MindMate AI supports SDG 3 (Good Health and Well-being) with private mood tracking, AI-assisted wellness insights, burnout screening, counseling access, and crisis-safe escalation. It is a **support tool, not a medical diagnosis service**.

## Architecture

```
frontend (React + Vite + Tailwind + Chart.js) → API (Express + MongoDB) → AI (FastAPI)
                                                    ↘ email/SMS provider (optional)
```

## Quick start

1. Copy environment templates: `cp backend/.env.example backend/.env` and `cp frontend/.env.example frontend/.env`.
2. Start MongoDB (local or Atlas), then run `npm install && npm run dev` inside `backend/`.
3. Run `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000` inside `ai-service/`.
4. Run `npm install && npm run dev` inside `frontend/`.

## REST API

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET/PATCH /api/auth/me` |
| Mood | `GET/POST /api/moods`, `GET /api/moods/calendar`, `GET /api/moods/dashboard` |
| Assessment | `POST /api/assessments/stress`, `POST /api/assessments/burnout`, `GET /api/assessments` |
| Support | `GET /api/support/counselors`, `POST /api/support/appointments`, `GET /api/support/resources` |
| Emergency | `GET/POST/DELETE /api/emergency-contacts` |
| Admin | `GET /api/admin/analytics`, `POST /api/admin/counselors`, `POST /api/admin/resources` |

All private endpoints require `Authorization: Bearer <JWT>`. Admin endpoints also require the `admin` role.

## Deployment

Deploy the frontend to Vercel/Netlify, API to Render/Railway/Fly, AI service to a separate container service, and MongoDB Atlas for data. Set `VITE_API_URL` to the API URL and `AI_SERVICE_URL` to the private FastAPI URL. Set strong `JWT_SECRET`, allow only the frontend origin in `CLIENT_URL`, enable Atlas IP/network access, and configure a real email/SMS provider before enabling emergency notifications.

## Safety notes

Critical assessments show immediate crisis resources and can notify a user-provided trusted contact only when notification is enabled. Adapt helplines and escalation workflow to the institution and country before production. Do not treat model results as clinical advice.
