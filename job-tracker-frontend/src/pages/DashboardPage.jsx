// DashboardPage.jsx — Full-width layout with hero section
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications, deleteApplication } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import ApplicationCard from '../components/ApplicationCard';
import ApplicationForm from '../components/ApplicationForm';
import AICoverLetterModal from '../components/AICoverLetterModal';
import SearchBar from '../components/SearchBar';
import StatsChart from '../components/StatsChart';
import InterviewReminderBanner from '../components/InterviewReminderBanner';
import UpcomingInterviews from '../components/UpcomingInterviews';
import { useInterviewReminders } from '../hooks/useInterviewReminders';

function getGreeting(name) {
  const h = new Date().getHours();
  const base = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${base}, ${name?.split(' ')[0] || 'there'}`;
}

function getDateLine() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats]               = useState({});
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filter, setFilter]             = useState('All');
  const [showChart, setShowChart]       = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [editApp, setEditApp]           = useState(null);
  const [aiApp, setAiApp]               = useState(null);
  const [deleteId, setDeleteId]         = useState(null);
  const [toastMsg, setToastMsg]         = useState('');
  const navigate = useNavigate();

  // ── Interview reminders ─────────────────────────────────────────────────
  const { todayBanners, permissionState, requestPermission } =
    useInterviewReminders(applications);

  useEffect(() => { fetchApplications(); }, []);

  // Auto-request notification permission once after login
  useEffect(() => {
    if (user) {
      const asked = sessionStorage.getItem('notif-asked');
      if (!asked) {
        sessionStorage.setItem('notif-asked', '1');
        setTimeout(() => requestPermission(), 2000);
      }
    }
  }, [user]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getApplications();
      setApplications(res.data.applications);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filteredApplications = applications
    .filter(app => filter === 'All' || app.status === filter)
    .filter(app => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return app.company.toLowerCase().includes(term) ||
             app.role.toLowerCase().includes(term) ||
             (app.location || '').toLowerCase().includes(term);
    });

  const upcomingCount = applications.filter(app =>
    app.interviewDate && new Date(app.interviewDate) >= new Date()
  ).length;

  const confirmDelete = async () => {
    try {
      await deleteApplication(deleteId);
      setDeleteId(null);
      showToast('Application deleted successfully');
      fetchApplications();
    } catch { setDeleteId(null); }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditApp(null);
    showToast(editApp ? 'Application updated! ✅' : 'Application added! 🎉');
    fetchApplications();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════
          HERO — full-bleed, edge to edge
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700">
        {/* decorative glow accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

        <div className="relative max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-8 sm:pt-10 sm:pb-10">

          {/* Greeting row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-indigo-200 text-xs font-semibold tracking-wide uppercase mb-2">
                {getDateLine()}
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {getGreeting(user?.name)} 👋
              </h1>
              <p className="text-indigo-100/80 text-sm sm:text-base mt-2 max-w-lg">
                {stats.total
                  ? `You have ${stats.total} application${stats.total !== 1 ? 's' : ''} tracked. Keep the momentum going.`
                  : 'Start tracking your job hunt — add your first application below.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap lg:justify-end">
              <button onClick={() => navigate('/suggestions')}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
                           text-white px-4 py-2.5 rounded-2xl text-sm font-semibold
                           hover:bg-white/20 transition-all">
                💼 Job Suggestions
              </button>

              <button onClick={() => navigate('/resume')}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
                           text-white px-4 py-2.5 rounded-2xl text-sm font-semibold
                           hover:bg-white/20 transition-all">
                🤖 Resume AI
              </button>

              <button onClick={() => navigate('/interviews')}
                className="relative flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
                           text-white px-4 py-2.5 rounded-2xl text-sm font-semibold
                           hover:bg-white/20 transition-all">
                🎯 Interviews
                {upcomingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-indigo-900 text-[10px]
                                   w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {upcomingCount}
                  </span>
                )}
              </button>

              <button onClick={() => { setEditApp(null); setShowForm(true); }}
                className="flex items-center gap-2 bg-white text-indigo-700
                           px-5 py-2.5 rounded-2xl text-sm font-bold
                           hover:bg-indigo-50 hover:-translate-y-0.5 transform transition-all shadow-lg shadow-black/10">
                + Add Job
              </button>
            </div>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <StatsCard label="Total Applied"  value={stats.total}
              gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
              emoji="📋" onClick={() => setFilter('All')} active={filter === 'All'} />
            <StatsCard label="In Progress"    value={stats.applied}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              emoji="📤" onClick={() => setFilter('Applied')} active={filter === 'Applied'} />
            <StatsCard label="Interviews"     value={stats.interview}
              gradient="bg-gradient-to-br from-amber-500 to-orange-500"
              emoji="🎯" onClick={() => setFilter('Interview')} active={filter === 'Interview'} />
            <StatsCard label="Offers"         value={stats.offer}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
              emoji="🎉" onClick={() => setFilter('Offer')} active={filter === 'Offer'} />
          </div>
        </div>
      </section>

      {/* ── Today's interview banners ── */}
      <InterviewReminderBanner
        todayBanners={todayBanners}
        permissionState={permissionState}
        onRequestPermission={requestPermission}
      />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]
                        bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl
                        shadow-2xl flex items-center gap-2 animate-toast">
          {toastMsg}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT — full-width shell, two-column grid
      ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── LEFT: applications list ── */}
          <div className="lg:col-span-8 xl:col-span-9">

            {/* ── SEARCH + FILTER ── */}
            <SearchBar
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
              filter={filter}
              onFilter={setFilter}
            />

            {(searchTerm || filter !== 'All') && !loading && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">{filteredApplications.length}</span> result{filteredApplications.length !== 1 ? 's' : ''}
                  {searchTerm && <> for "<span className="text-indigo-600">{searchTerm}</span>"</>}
                </p>
                <button onClick={() => { setSearchTerm(''); setFilter('All'); }}
                  className="text-xs text-red-400 hover:text-red-600 font-medium">
                  Clear ×
                </button>
              </div>
            )}

            {/* ── LOADING ── */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
                <p className="text-gray-400 text-sm font-medium">Loading your applications...</p>
              </div>
            )}

            {/* ── EMPTY STATE ── */}
            {!loading && filteredApplications.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-6xl mb-4 animate-bounce-slow">{searchTerm ? '🔍' : '📭'}</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {searchTerm ? 'No results found' : filter !== 'All' ? `No ${filter} applications` : 'No applications yet'}
                </h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                  {searchTerm ? `Nothing matches "${searchTerm}".` : 'Start tracking your job hunt!'}
                </p>
                {!searchTerm && (
                  <button onClick={() => { setEditApp(null); setShowForm(true); }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                               px-6 py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition-all
                               shadow-lg shadow-indigo-500/25">
                    + Add First Application
                  </button>
                )}
              </div>
            )}

            {/* ── CARDS ── */}
            <div className="space-y-3">
              {!loading && filteredApplications.map((app, i) => (
                <div key={app._id} className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}>
                  <ApplicationCard
                    app={app}
                    onDelete={(id) => setDeleteId(id)}
                    onEdit={(a) => { setEditApp(a); setShowForm(true); }}
                    onAIClick={(a) => setAiApp(a)}
                  />
                </div>
              ))}
            </div>

            <div className="h-10" />
          </div>

          {/* ── RIGHT: sticky sidebar ── */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* Chart card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800 text-sm">Application Overview</h3>
                  <button onClick={() => setShowChart(!showChart)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all
                                ${showChart ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {showChart ? 'Hide' : '📊 Show'}
                  </button>
                </div>
                {showChart && (
                  <div className="mt-4 animate-fade-in">
                    <StatsChart stats={stats} />
                  </div>
                )}
              </div>

              {/* Upcoming interviews */}
              <UpcomingInterviews applications={applications} />

            </div>
          </div>

        </div>
      </div>

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center animate-slide-up">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Application?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeleteId(null)}
                className="py-3 border border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 shadow-md shadow-red-500/30">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <ApplicationForm
          editApp={editApp}
          onClose={() => { setShowForm(false); setEditApp(null); }}
          onSave={handleFormSave}
        />
      )}
      {aiApp && <AICoverLetterModal app={aiApp} onClose={() => setAiApp(null)} />}

      <style>{`
        @keyframes fade-in     { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up    { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toast       { from { opacity: 0; transform: translateX(-50%) translateY(16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fade-in       { animation: fade-in 0.3s ease-out; }
        .animate-fade-in-up    { animation: fade-in-up 0.4s ease-out; }
        .animate-slide-up      { animation: slide-up 0.3s ease-out; }
        .animate-toast         { animation: toast 0.3s ease-out; }
        .animate-bounce-slow   { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}