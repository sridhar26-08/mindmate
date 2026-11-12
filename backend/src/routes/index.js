import { Router } from 'express';
import { register, login, me, updateMe } from '../controllers/auth.js';
import * as w from '../controllers/wellness.js';
import { protect, adminOnly } from '../middleware/auth.js';

const r = Router();

// Auth
r.post('/auth/register', register);
r.post('/auth/login', login);
r.get('/auth/me', protect, me);
r.patch('/auth/me', protect, updateMe);

// Moods & Assessments
r.get('/moods', protect, w.moods);
r.post('/moods', protect, w.createMood);
r.get('/moods/calendar', protect, w.calendar);
r.get('/moods/dashboard', protect, w.dashboard);
r.get('/assessments', protect, w.assessments);
r.post('/assessments/burnout', protect, w.burnout);

// AI Chatbot
r.post('/chat', protect, w.chatbot);

// Emergency Contacts
r.get('/emergency-contacts', protect, w.contacts);
r.post('/emergency-contacts', protect, w.saveContact);
r.delete('/emergency-contacts', protect, w.deleteContact);

// Support & Counselors
r.get('/support/counselors', protect, w.counselors);
r.get('/support/resources', protect, w.resources);
r.post('/support/appointments', protect, w.appointment);

// Admin Only
r.get('/admin/analytics', protect, adminOnly, w.adminAnalytics);
r.get('/admin/appointments', protect, adminOnly, w.adminAppointments);
r.patch('/admin/appointments/:id', protect, adminOnly, w.updateAppointmentStatus);
r.get('/admin/critical-alerts', protect, adminOnly, w.adminCriticalAlerts);
r.post('/admin/counselors', protect, adminOnly, w.createCounselor);
r.delete('/admin/counselors/:id', protect, adminOnly, w.deleteCounselor);
r.post('/admin/resources', protect, adminOnly, w.createResource);
r.delete('/admin/resources/:id', protect, adminOnly, w.deleteResource);

export default r;
