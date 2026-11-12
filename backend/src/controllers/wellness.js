import { MoodLog, StressAssessment, Counselor, Appointment, Resource, User } from '../models/index.js';
import { aiPost } from '../services/ai.js';

const emergencyText =
  'You are not alone. If you may hurt yourself or are in immediate danger, call your local emergency number now or reach a trusted person.';

export async function createMood(req, res) {
  const { mood, journal, loggedAt } = req.body;
  const log = await MoodLog.create({ user: req.user.id, mood, journal, loggedAt });
  const ai = await aiPost('/analyze', { mood, journal: journal || '' });
  const result = ai || {
    sentiment: 0,
    stress_score:
      mood === 'Stressed' ? 72 : mood === 'Anxious' ? 68 : mood === 'Sad' ? 55 : mood === 'Neutral' ? 30 : 15,
    stress_level: 'Moderate',
    insights: ['Keep checking in with yourself.'],
    recommendations: ['Take a short mindful break.']
  };

  const assessment = await StressAssessment.create({
    user: req.user.id,
    moodLog: log.id,
    stressScore: result.stress_score,
    stressLevel: result.stress_level,
    sentiment: result.sentiment,
    insights: result.insights,
    recommendations: result.recommendations
  });

  if (result.stress_level === 'Critical') {
    assessment.insights.unshift(emergencyText);
    await assessment.save();
    /* Integrate approved email/SMS provider here; notify only opt-in emergency contact. */
  }

  res.status(201).json({ log, assessment, emergency: result.stress_level === 'Critical' });
}

export async function moods(req, res) {
  const logs = await MoodLog.find({ user: req.user.id })
    .sort({ loggedAt: -1 })
    .limit(Math.min(+req.query.limit || 90, 365));
  res.json(logs);
}

export async function calendar(req, res) {
  const logs = await MoodLog.find({
    user: req.user.id,
    loggedAt: {
      $gte: new Date(req.query.from || Date.now() - 90 * 86400000),
      $lte: new Date(req.query.to || Date.now())
    }
  }).select('mood loggedAt');
  res.json(logs);
}

export async function dashboard(req, res) {
  const [logs, assessments] = await Promise.all([
    MoodLog.find({ user: req.user.id }).sort({ loggedAt: -1 }).limit(30),
    StressAssessment.find({ user: req.user.id, kind: 'stress' }).sort({ createdAt: -1 }).limit(30)
  ]);
  res.json({ logs: logs.reverse(), assessments: assessments.reverse(), latest: assessments.at(-1) || null });
}

export async function assessments(req, res) {
  res.json(await StressAssessment.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50));
}

export async function burnout(req, res) {
  const ai = await aiPost('/burnout', req.body);
  if (!ai) return res.status(503).json({ message: 'AI service is temporarily unavailable' });
  const assessment = await StressAssessment.create({
    user: req.user.id,
    kind: 'burnout',
    burnoutRisk: ai.risk,
    insights: ai.factors,
    recommendations: ai.recommendations
  });
  res.json(assessment);
}

export async function chatbot(req, res) {
  const text = String(req.body.message || '').slice(0, 2000);
  const ai = await aiPost('/chat', { message: text, history: req.body.history || [] });
  if (ai && ai.message) {
    return res.json({
      urgent: Boolean(ai.urgent),
      message: ai.message,
      topic: ai.topic,
      source: ai.source,
      model: ai.model
    });
  }
  const urgent = /suicid|kill myself|self.?harm|want to die|unsafe/i.test(text);
  if (urgent) {
    return res.json({
      urgent: true,
      message:
        'I’m glad you shared that. Please know you are not alone. Please call 988 or your local emergency/crisis service immediately, or reach out to a trusted person.'
    });
  }
  return res.json({
    urgent: false,
    message:
      'Thank you for checking in. Dealing with academic pressures can be tough. Try taking a short 5-minute break, prioritize one small task next, or consider connecting with campus counseling.'
  });
}

export async function contacts(req, res) {
  res.json(req.user.emergencyContact?.name ? [req.user.emergencyContact] : []);
}

export async function saveContact(req, res) {
  req.user.emergencyContact = req.body;
  await req.user.save();
  res.status(201).json(req.user.emergencyContact);
}

export async function deleteContact(req, res) {
  req.user.emergencyContact = undefined;
  await req.user.save();
  res.status(204).end();
}

export const counselors = async (req, res) => res.json(await Counselor.find({ active: true }));
export const resources = async (req, res) => res.json(await Resource.find().sort({ emergency: -1 }));

export async function appointment(req, res) {
  const item = await Appointment.create({ user: req.user.id, ...req.body });
  res.status(201).json(item);
}

export async function adminAnalytics(req, res) {
  try {
    const aggregate = await StressAssessment.aggregate([
      { $group: { _id: '$stressLevel', count: { $sum: 1 }, average: { $avg: '$stressScore' } } }
    ]);
    const students = await User.countDocuments({ role: 'student' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'requested' });
    const activeCounselors = await Counselor.countDocuments({ active: true });
    res.json({ students, stressByLevel: aggregate, pendingAppointments, activeCounselors });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute analytics' });
  }
}

export async function adminAppointments(req, res) {
  try {
    const list = await Appointment.find()
      .populate('user', 'name email profile')
      .populate('counselor', 'name specialty email phone')
      .sort({ scheduledFor: -1 })
      .limit(100);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve appointments' });
  }
}

export async function updateAppointmentStatus(req, res) {
  try {
    const { status } = req.body;
    const item = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('counselor', 'name');
    if (!item) return res.status(404).json({ message: 'Appointment not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update appointment' });
  }
}

export async function adminCriticalAlerts(req, res) {
  try {
    const alerts = await StressAssessment.find({
      $or: [{ stressLevel: 'Critical' }, { stressLevel: 'High' }, { burnoutRisk: 'High' }]
    })
      .populate('user', 'name email profile')
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch alert assessments' });
  }
}

export async function createCounselor(req, res) {
  res.status(201).json(await Counselor.create(req.body));
}

export async function deleteCounselor(req, res) {
  try {
    await Counselor.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete counselor' });
  }
}

export async function createResource(req, res) {
  res.status(201).json(await Resource.create(req.body));
}

export async function deleteResource(req, res) {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete resource' });
  }
}
