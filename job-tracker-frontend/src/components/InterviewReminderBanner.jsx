// components/InterviewReminderBanner.jsx
// Shows a dismissable banner when the user has an interview TODAY.
// Also shows a small bell icon to enable browser notifications if permission
// hasn't been granted yet.

import { useState } from 'react';

function formatTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

// ─── Single banner card for one interview ─────────────────────────────────────
function BannerCard({ app, onDismiss }) {
  const time = formatTime(app.interviewTime);

  const typeColors = {
    Phone:       'bg-blue-600',
    Online:      'bg-violet-600',
    'In-Person': 'bg-emerald-600',
    Technical:   'bg-orange-600',
    HR:          'bg-pink-600',
  };
  const barColor = typeColors[app.interviewType] || 'bg-indigo-600';

  return (
    <div className={`relative flex items-start gap-3 bg-white rounded-2xl shadow-lg
                     border border-amber-200 overflow-hidden p-4
                     animate-slide-down`}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor}`} />

      {/* Pulse dot */}
      <div className="flex-shrink-0 mt-0.5">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
        </span>
      </div>

      <div className="flex-1 min-w-0 pl-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wide">
            🔥 Interview Today
          </span>
          {app.interviewType && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${barColor}`}>
              {app.interviewType}
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-gray-900 truncate">
          {app.role}
          <span className="text-gray-400 font-medium"> · {app.company}</span>
        </p>
        {time && (
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            🕐 {time}
            {app.location && app.location !== 'Not specified' && (
              <> · 📍 {app.location}</>
            )}
          </p>
        )}
        {app.interviewNotes && (
          <p className="text-xs text-indigo-600 mt-1 truncate">
            📝 {app.interviewNotes}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button onClick={() => onDismiss(app._id)}
        className="flex-shrink-0 w-7 h-7 rounded-xl bg-gray-100 hover:bg-gray-200
                   flex items-center justify-center text-gray-400 hover:text-gray-600
                   transition-colors text-lg font-light">
        ×
      </button>
    </div>
  );
}

// ─── Permission request button ─────────────────────────────────────────────
function NotificationPermissionBar({ onRequest }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200
                    rounded-2xl px-4 py-3 animate-slide-down">
      <span className="text-xl">🔔</span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-indigo-800">Enable interview reminders</p>
        <p className="text-xs text-indigo-600">Get notified 1 hour before each interview</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setDismissed(true)}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">
          Not now
        </button>
        <button onClick={() => { onRequest(); setDismissed(true); }}
          className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5
                     rounded-xl hover:bg-indigo-700 transition-colors">
          Allow
        </button>
      </div>
    </div>
  );
}

// ─── Main exported component ───────────────────────────────────────────────
export default function InterviewReminderBanner({ todayBanners, permissionState, onRequestPermission }) {
  const [dismissed, setDismissed] = useState([]);

  const visible = todayBanners.filter(app => !dismissed.includes(app._id));
  const showPermBar = permissionState === 'default' && todayBanners.length === 0;

  if (visible.length === 0 && !showPermBar) return null;

  return (
    <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10 pt-4 space-y-2">
      {showPermBar && (
        <NotificationPermissionBar onRequest={onRequestPermission} />
      )}
      {visible.map(app => (
        <BannerCard key={app._id} app={app}
          onDismiss={(id) => setDismissed(prev => [...prev, id])} />
      ))}

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
      `}</style>
    </div>
  );
}