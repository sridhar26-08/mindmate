import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  HeartHandshake, 
  Phone, 
  Mail, 
  Calendar, 
  AlertCircle, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  UserCheck
} from 'lucide-react';

export default function Support() {
  const [counselors, setCounselors] = useState([]);
  const [resources, setResources] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Appointment Modal
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    scheduledFor: '',
    notes: ''
  });
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // Emergency Contact Form
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    notifyOnCritical: true
  });
  const [contactSavedMsg, setContactSavedMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, rRes, ecRes] = await Promise.all([
        api.get('/support/counselors'),
        api.get('/support/resources'),
        api.get('/emergency-contacts')
      ]);
      setCounselors(cRes.data || []);
      setResources(rRes.data || []);
      setEmergencyContacts(ecRes.data || []);
      if (ecRes.data && ecRes.data.length > 0) {
        setContactForm({
          name: ecRes.data[0].name || '',
          phone: ecRes.data[0].phone || '',
          email: ecRes.data[0].email || '',
          notifyOnCritical: ecRes.data[0].notifyOnCritical ?? true
        });
      }
    } catch (err) {
      console.error('Failed to load support data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedCounselor) return;
    try {
      await api.post('/support/appointments', {
        counselor: selectedCounselor._id,
        scheduledFor: appointmentForm.scheduledFor,
        notes: appointmentForm.notes
      });
      setAppointmentSuccess(true);
      setTimeout(() => {
        setAppointmentSuccess(false);
        setSelectedCounselor(null);
        setAppointmentForm({ scheduledFor: '', notes: '' });
      }, 3000);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to book appointment');
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/emergency-contacts', contactForm);
      setContactSavedMsg('Trusted emergency contact updated successfully.');
      loadData();
      setTimeout(() => setContactSavedMsg(''), 4000);
    } catch (err) {
      alert('Failed to save emergency contact');
    }
  };

  const handleDeleteContact = async () => {
    try {
      await api.delete('/emergency-contacts');
      setEmergencyContacts([]);
      setContactForm({ name: '', phone: '', email: '', notifyOnCritical: true });
      setContactSavedMsg('Emergency contact removed.');
      setTimeout(() => setContactSavedMsg(''), 4000);
    } catch (err) {
      alert('Failed to remove emergency contact');
    }
  };

  const emergencyResources = resources.filter((r) => r.emergency);
  const generalResources = resources.filter((r) => !r.emergency);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 mb-2">
          <HeartHandshake className="h-3.5 w-3.5 text-emerald-500" />
          Campus Mental Health & Safety
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
          Counseling, Helplines & Crisis Safety
        </h1>
        <p className="mt-1 text-slate-500 text-sm">
          Connect with licensed university counselors, explore verified mental health resources, and configure your crisis escalation pathway.
        </p>
      </div>

      {/* Feature 8: High-Risk Support / Escalation Pathway Banner */}
      <section className="rounded-2xl border border-red-200 bg-red-50/90 dark:bg-red-950/40 dark:border-red-900 p-5 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-red-900 dark:text-red-100">
              Immediate Crisis & High-Risk Escalation Pathway
            </h2>
            <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">
              If you or someone you know is in immediate danger, experiencing self-harm urges, or in severe distress, you do not have to carry it alone. Confidential, compassionate help is active right now.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 pt-1">
          <a
            href="tel:988"
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 hover:shadow-md transition group"
          >
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-red-700 dark:text-red-300">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-red-600 transition">
                Call / Text 988
              </p>
              <p className="text-[11px] text-slate-500">Suicide & Crisis Lifeline (24/7)</p>
            </div>
          </a>

          <a
            href="sms:741741?body=HOME"
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 hover:shadow-md transition group"
          >
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-red-700 dark:text-red-300">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-red-600 transition">
                Text HOME to 741741
              </p>
              <p className="text-[11px] text-slate-500">Crisis Text Line (Free & 24/7)</p>
            </div>
          </a>

          <a
            href="tel:911"
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 hover:shadow-md transition group"
          >
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-red-700 dark:text-red-300">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-red-600 transition">
                Call 911 / Campus Police
              </p>
              <p className="text-[11px] text-slate-500">Immediate Emergency Dispatch</p>
            </div>
          </a>
        </div>
      </section>

      {/* Feature 7 & 8: Emergency Contact Pathway */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-500" />
              Trusted Emergency Contact Escalation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify a trusted guardian, friend, or roommate to be notified only if you record a Critical mental health assessment.
            </p>
          </div>
          {emergencyContacts.length > 0 && (
            <button
              onClick={handleDeleteContact}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove Contact
            </button>
          )}
        </div>

        {contactSavedMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {contactSavedMsg}
          </div>
        )}

        <form onSubmit={handleSaveContact} className="grid gap-3 sm:grid-cols-3 text-xs">
          <div>
            <label className="font-semibold block mb-1">Contact Name</label>
            <input
              required
              placeholder="e.g. Alex Johnson"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Contact Phone</label>
            <input
              placeholder="+1 (555) 000-0000"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Contact Email</label>
            <input
              type="email"
              placeholder="alex@example.com"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            />
          </div>
          <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={contactForm.notifyOnCritical}
                onChange={(e) => setContactForm({ ...contactForm, notifyOnCritical: e.target.checked })}
                className="rounded text-brand-600 h-4 w-4"
              />
              Notify this trusted contact if a critical stress assessment is detected
            </label>
            <button type="submit" className="btn px-4 py-2">
              Save Escalation Contact
            </button>
          </div>
        </form>
      </section>

      {/* Feature 7: Campus Counselors & Appointment Booking */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Campus Mental Health Counselors
            </h2>
            <p className="text-xs text-slate-500">
              Confidential, professional 1-on-1 counseling for students.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {counselors.map((c) => (
            <div
              key={c._id}
              className="card flex flex-col justify-between hover:shadow-md transition border border-slate-200/80 dark:border-slate-800"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{c.name}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/50">
                    Available
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.specialty?.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {c.bio}
                </p>
                <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                  {c.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {c.email}
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {c.phone}
                    </div>
                  )}
                  {c.availability?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                      <Clock className="h-3.5 w-3.5 text-brand-600" /> {c.availability[0]}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedCounselor(c)}
                className="btn w-full mt-4 text-xs flex items-center justify-center gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" /> Request Appointment
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Helplines & Resources */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Verified Helplines & Wellness Resources
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {resources.map((r) => (
            <a
              key={r._id}
              href={r.url || (r.phone ? `tel:${r.phone}` : '#')}
              target={r.url ? '_blank' : '_self'}
              rel="noreferrer"
              className={`card flex items-start justify-between p-4 hover:shadow-md transition border ${
                r.emergency
                  ? 'border-red-200/80 bg-red-50/30 dark:bg-red-950/20 dark:border-red-900/40'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{r.title}</h3>
                  {r.emergency && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      24/7
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{r.description}</p>
                {r.phone && (
                  <p className="text-xs font-bold text-brand-600 pt-1 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {r.phone}
                  </p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
            </a>
          ))}
        </div>
      </section>

      {/* Book Appointment Modal */}
      {selectedCounselor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card max-w-md w-full space-y-4 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Book Counseling Session
                </h3>
                <p className="text-xs text-brand-600 font-medium">with {selectedCounselor.name}</p>
              </div>
            </div>

            {appointmentSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Appointment Requested!</h4>
                <p className="text-xs text-slate-500">
                  The counseling office has received your confidential appointment request and will confirm shortly via campus email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Preferred Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={appointmentForm.scheduledFor}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, scheduledFor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Confidential Notes / Reason (Optional)</label>
                  <textarea
                    rows="3"
                    maxLength="1000"
                    placeholder="Briefly describe what you'd like to discuss (e.g., midterm stress, sleep problems)..."
                    value={appointmentForm.notes}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCounselor(null)}
                    className="border px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn px-4 py-2">
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
