import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  UserPlus, 
  BookPlus, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  HeartPulse, 
  PhoneCall, 
  Trash2, 
  Calendar, 
  Mail, 
  Phone, 
  ExternalLink,
  MessageSquare,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'appointments' | 'alerts' | 'staff'
  const [analytics, setAnalytics] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [resources, setResources] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals / forms
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [counselorForm, setCounselorForm] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    availability: '',
    bio: ''
  });
  const [resourceForm, setResourceForm] = useState({
    title: '',
    phone: '',
    url: '',
    description: '',
    emergency: false
  });
  const [actionMsg, setActionMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [anRes, cRes, rRes, appRes, altRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/support/counselors'),
        api.get('/support/resources'),
        api.get('/admin/appointments').catch(() => ({ data: [] })),
        api.get('/admin/critical-alerts').catch(() => ({ data: [] }))
      ]);
      setAnalytics(anRes.data);
      setCounselors(cRes.data || []);
      setResources(rRes.data || []);
      setAppointments(appRes.data || []);
      setCriticalAlerts(altRes.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Failed to load administrative analytics. Please ensure your account has administrator credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCounselor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: counselorForm.name,
        specialty: counselorForm.specialty.split(',').map((s) => s.trim()).filter(Boolean),
        email: counselorForm.email,
        phone: counselorForm.phone,
        availability: counselorForm.availability ? [counselorForm.availability] : [],
        bio: counselorForm.bio,
        active: true
      };
      await api.post('/admin/counselors', payload);
      setShowCounselorModal(false);
      setCounselorForm({ name: '', specialty: '', email: '', phone: '', availability: '', bio: '' });
      setActionMsg('Counselor successfully added to institutional roster.');
      loadData();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add counselor');
    }
  };

  const handleDeleteCounselor = async (id) => {
    if (!window.confirm('Are you sure you want to remove this counselor from the campus roster?')) return;
    try {
      await api.delete(`/admin/counselors/${id}`);
      setActionMsg('Counselor removed successfully.');
      loadData();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to remove counselor');
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/resources', resourceForm);
      setShowResourceModal(false);
      setResourceForm({ title: '', phone: '', url: '', description: '', emergency: false });
      setActionMsg('Crisis helpline resource successfully created.');
      loadData();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add resource');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this mental health resource?')) return;
    try {
      await api.delete(`/admin/resources/${id}`);
      setActionMsg('Resource deleted successfully.');
      loadData();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to delete resource');
    }
  };

  const handleUpdateAppointment = async (id, status) => {
    try {
      await api.patch(`/admin/appointments/${id}`, { status });
      setActionMsg(`Appointment marked as ${status}.`);
      loadData();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to update appointment status');
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] space-y-4">
        <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Aggregating campus wellness analytics…</p>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="card text-center py-12 max-w-lg mx-auto space-y-4 shadow-xl">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Institutional Access Restricted</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button onClick={loadData} className="btn inline-flex items-center gap-2 text-xs">
          <RefreshCw className="h-4 w-4" /> Retry Connection
        </button>
      </div>
    );
  }

  const stressLevels = analytics?.stressByLevel || [];
  const totalAssessments = stressLevels.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const criticalCount = stressLevels.find((s) => s._id === 'Critical')?.count || 0;
  const highCount = stressLevels.find((s) => s._id === 'High')?.count || 0;
  const pendingAppointments = appointments.filter((a) => a.status === 'requested').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
            Institutional Oversight Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
            Counselor & Administrator Console
          </h1>
          <p className="mt-1 text-slate-500 text-xs">
            Monitor anonymous student population health, triage high-risk cases, manage counseling bookings, and maintain resources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh analytics"
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCounselorModal(true)}
            className="btn text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Counselor</span>
          </button>
          <button
            onClick={() => setShowResourceModal(true)}
            className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5"
          >
            <BookPlus className="h-3.5 w-3.5" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Stat Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Students</span>
            <Users className="h-4 w-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {analytics?.students || 0}
          </p>
          <span className="text-[11px] text-slate-400">Registered student users</span>
        </div>

        <div className="card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Check-Ins</span>
            <HeartPulse className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {totalAssessments}
          </p>
          <span className="text-[11px] text-slate-400">Total wellness evaluations</span>
        </div>

        <div className="card p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical / High Risk</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {criticalCount + highCount}
          </p>
          <span className="text-[11px] text-slate-400">Requires triage attention</span>
        </div>

        <div className="card p-5 border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Bookings</span>
            <Calendar className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-2">
            {pendingAppointments}
          </p>
          <span className="text-[11px] text-slate-400">{appointments.length} total requests</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Campus Stress Analytics
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Student Appointments</span>
          {pendingAppointments > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black">
              {pendingAppointments}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Critical Triage Alerts</span>
          {criticalAlerts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
              {criticalAlerts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === 'staff'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Counselors & Helplines ({counselors.length})
        </button>
      </div>

      {/* Tab 1: Overview & Stress Distributions */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-600" />
              <span>Campus Stress Level Distribution</span>
            </h3>

            {stressLevels.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No student check-ins logged yet.</p>
            ) : (
              <div className="space-y-3">
                {['Low', 'Moderate', 'High', 'Critical'].map((level) => {
                  const item = stressLevels.find((s) => s._id === level);
                  const count = item?.count || 0;
                  const pct = totalAssessments > 0 ? Math.round((count / totalAssessments) * 100) : 0;
                  const avg = item?.average ? Math.round(item.average) : 0;

                  const color =
                    level === 'Critical'
                      ? 'bg-rose-500'
                      : level === 'High'
                      ? 'bg-orange-500'
                      : level === 'Moderate'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500';

                  return (
                    <div key={level} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{level} Stress</span>
                        <span className="text-slate-500">
                          {count} logs ({pct}%) • Avg Score: {avg}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-teal-600" />
              <span>Institutional Crisis Escalation Protocol</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">Critical Stress Safeguard:</p>
                When a student check-in is assessed at "Critical" level, the system immediately displays crisis helplines (988) on their screen and triggers an automated escalation check.
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40">
                <p className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">Confidentiality Compliance:</p>
                All student journal texts are stored encrypted. Administrators view aggregated population-level metrics without compromising student psychological safety.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Student Appointments Management */}
      {activeTab === 'appointments' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-600" />
              <span>Student Counseling Requests</span>
            </h3>
            <span className="text-xs text-slate-400">{appointments.length} total bookings</span>
          </div>

          {appointments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No counseling appointments requested yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Counselor</th>
                    <th className="py-2.5 px-3">Scheduled Time</th>
                    <th className="py-2.5 px-3">Student Notes</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {apt.user?.name || 'Anonymous Student'}
                        </div>
                        <div className="text-slate-400 text-[11px]">{apt.user?.email || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {apt.counselor?.name || 'General Counselor'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {apt.scheduledFor
                          ? new Date(apt.scheduledFor).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })
                          : 'TBD'}
                      </td>
                      <td className="py-3 px-3 max-w-xs text-slate-500 italic truncate" title={apt.notes}>
                        {apt.notes || 'No specific notes'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`badge text-[10px] font-bold ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : apt.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {apt.status || 'requested'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        {apt.status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateAppointment(apt._id, 'confirmed')}
                            className="btn-calm text-[10px] px-2 py-1"
                            title="Confirm session"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateAppointment(apt._id, 'cancelled')}
                            className="btn-secondary text-[10px] px-2 py-1 text-rose-600"
                            title="Cancel session"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Critical Triage Alerts */}
      {activeTab === 'alerts' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <span>High-Risk & Critical Assessments Triage</span>
            </h3>
            <span className="text-xs text-slate-400">{criticalAlerts.length} flagged events</span>
          </div>

          {criticalAlerts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No students are currently flagged under Critical or High stress risk.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Student User</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Severity Level</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">AI Insights</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {criticalAlerts.map((alt) => (
                    <tr key={alt._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {alt.user?.name || 'Student'}
                        </div>
                        <div className="text-slate-400 text-[10px]">{alt.user?.email || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-500">
                        {alt.kind || 'stress'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="badge bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                          {alt.stressLevel || alt.burnoutRisk || 'Critical'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {alt.stressScore ? `${alt.stressScore}/100` : 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(alt.createdAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="py-3 px-3 max-w-sm text-slate-600 dark:text-slate-300 truncate" title={(alt.insights || []).join('; ')}>
                        {(alt.insights || [])[0] || 'Urgent counseling recommended'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Counselors & Crisis Helplines Directory */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Counselors Grid */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-600" />
                <span>Active Campus Counselors</span>
              </h3>
              <button
                onClick={() => setShowCounselorModal(true)}
                className="btn text-xs px-3 py-1.5"
              >
                + Add Counselor
              </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {counselors.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 relative group"
                >
                  <button
                    onClick={() => handleDeleteCounselor(c._id)}
                    title="Remove Counselor"
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{c.name}</h4>
                  <div className="flex flex-wrap gap-1 my-2">
                    {(c.specialty || []).map((s) => (
                      <span key={s} className="badge bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{c.bio}</p>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    {c.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{c.email}</div>}
                    {c.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{c.phone}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources & Crisis Hotlines Grid */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-rose-500" />
                <span>Certified Mental Health Resources & Hotlines</span>
              </h3>
              <button
                onClick={() => setShowResourceModal(true)}
                className="btn-outline text-xs px-3 py-1.5"
              >
                + Add Resource
              </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {resources.map((r) => (
                <div
                  key={r._id}
                  className={`p-4 rounded-xl border relative group ${
                    r.emergency
                      ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <button
                    onClick={() => handleDeleteResource(r._id)}
                    title="Remove Resource"
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{r.title}</h4>
                    {r.emergency && (
                      <span className="badge bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 text-[10px]">
                        24/7 Crisis
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2 line-clamp-2">{r.description}</p>
                  <div className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {r.phone && <a href={`tel:${r.phone}`}>📞 {r.phone}</a>}
                    {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="block text-indigo-500 underline text-[11px] mt-1">Visit Website</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Counselor Modal */}
      {showCounselorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="card max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Campus Counselor</h3>
            <form onSubmit={handleCreateCounselor} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input
                  required
                  placeholder="Dr. Sarah Jenkins"
                  value={counselorForm.name}
                  onChange={(e) => setCounselorForm({ ...counselorForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Specialties (comma separated)</label>
                <input
                  placeholder="Exam Anxiety, Burnout, Sleep Therapy"
                  value={counselorForm.specialty}
                  onChange={(e) => setCounselorForm({ ...counselorForm, specialty: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="counselor@univ.edu"
                    value={counselorForm.email}
                    onChange={(e) => setCounselorForm({ ...counselorForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Phone</label>
                  <input
                    placeholder="+1 (555) 019-2831"
                    value={counselorForm.phone}
                    onChange={(e) => setCounselorForm({ ...counselorForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Weekly Availability</label>
                <input
                  placeholder="Mon-Thu 10:00 AM - 4:00 PM"
                  value={counselorForm.availability}
                  onChange={(e) => setCounselorForm({ ...counselorForm, availability: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Bio / Profile Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specializes in academic burnout and cognitive stress techniques."
                  value={counselorForm.bio}
                  onChange={(e) => setCounselorForm({ ...counselorForm, bio: e.target.value })}
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCounselorModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn text-xs px-4 py-2">
                  Save Counselor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="card max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Mental Health Resource</h3>
            <form onSubmit={handleCreateResource} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Title / Organization Name</label>
                <input
                  required
                  placeholder="Campus 24/7 Crisis Hotline"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Phone Helpline</label>
                  <input
                    placeholder="988 or 1-800-..."
                    value={resourceForm.phone}
                    onChange={(e) => setResourceForm({ ...resourceForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Website URL</label>
                  <input
                    placeholder="https://..."
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Free confidential 24/7 support for mental health crises."
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-brand-600"
                  checked={resourceForm.emergency}
                  onChange={(e) => setResourceForm({ ...resourceForm, emergency: e.target.checked })}
                />
                <span className="font-semibold text-rose-600">Mark as 24/7 Emergency Crisis Service</span>
              </label>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn text-xs px-4 py-2">
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
