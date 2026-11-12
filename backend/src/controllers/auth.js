import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/index.js';

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'local-development-secret-change-before-deployment', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

export async function register(req, res) {
  try {
    const data = z
      .object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(['student', 'admin']).optional().default('student'),
        adminSecret: z.string().optional(),
        profile: z
          .object({
            college: z.string().optional(),
            course: z.string().optional(),
            year: z.number().optional()
          })
          .optional()
      })
      .parse(req.body);

    let role = data.role || 'student';
    if (role === 'admin') {
      const expectedSecret = process.env.ADMIN_SECRET || 'mindmate-admin-secret';
      if (!data.adminSecret || data.adminSecret.trim() !== expectedSecret.trim()) {
        return res.status(403).json({
          message: 'Invalid Institutional Admin Secret Passkey. Please contact the system administrator.'
        });
      }
    }

    const existing = await User.exists({ email: data.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      profile: data.profile || {}
    });

    res.status(201).json({
      token: sign(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (err) {
    if (err?.errors) {
      const msg = err.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password, requestedPortal } = z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
        requestedPortal: z.enum(['student', 'admin']).optional()
      })
      .parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // If logging into admin portal specifically, verify role is admin
    if (requestedPortal === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access restricted: This account has Student privileges. Please sign in through the Student Wellness portal.'
      });
    }

    res.json({
      token: sign(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (err) {
    if (err?.errors) {
      const msg = err.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: err.message || 'Login failed' });
  }
}

export const me = (req, res) => res.json(req.user);

export async function updateMe(req, res) {
  const allowed = ['name', 'profile', 'emergencyContact'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json(req.user);
}
