// hooks/useInterviewReminders.js
// Call this hook once inside a logged-in layout (e.g. Navbar or App wrapper).
// It does two things:
//  1. Requests browser notification permission and schedules push notifications
//     for interviews happening today or tomorrow.
//  2. Returns `todayBanners` — an array of interviews happening TODAY so the
//     UI can show an in-app dismissable banner.

import { useEffect, useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth()    === date2.getMonth()    &&
    date1.getDate()     === date2.getDate()
  );
}

function isTomorrow(date) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

// Schedule a browser notification at a specific timestamp (ms).
// Returns a clearTimeout id so caller can cancel it.
function scheduleNotification(title, body, fireAtMs) {
  const delay = fireAtMs - Date.now();
  if (delay < 0) return null; // already passed
  return setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: title, // deduplicate same interview
      });
    }
  }, delay);
}

// Build a Date from interviewDate + optional interviewTime string ("14:30")
function buildInterviewDateTime(dateStr, timeStr) {
  const d = new Date(dateStr);
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(9, 0, 0, 0); // default 9 AM if no time given
  }
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useInterviewReminders(applications = []) {
  const [todayBanners, setTodayBanners] = useState([]);
  const [permissionState, setPermissionState] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  // Request notification permission (call once on mount)
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setPermissionState(result);
    }
  }, []);

  // Schedule notifications for all upcoming interviews
  useEffect(() => {
    if (!applications.length) return;

    const today     = new Date(); today.setHours(0,0,0,0);
    const timers    = [];
    const banners   = [];

    applications
      .filter(app => app.interviewDate)
      .forEach(app => {
        const ivDate     = new Date(app.interviewDate);
        const ivDateTime = buildInterviewDateTime(app.interviewDate, app.interviewTime);
        const label      = `${app.role} @ ${app.company}`;
        const timeLabel  = app.interviewTime ? ` at ${app.interviewTime}` : '';

        const dayStart = new Date(ivDate); dayStart.setHours(0,0,0,0);
        const daysAway = Math.round((dayStart - today) / 86400000);

        // ── TODAY ──────────────────────────────────────────────────────────
        if (daysAway === 0) {
          // Add to in-app banners
          banners.push(app);

          // Notification 1 hour before
          const oneHourBefore = new Date(ivDateTime.getTime() - 60 * 60 * 1000);
          const t1 = scheduleNotification(
            `🎯 Interview in 1 hour!`,
            `${label}${timeLabel}`,
            oneHourBefore.getTime()
          );
          if (t1) timers.push(t1);

          // Notification 15 min before
          const fifteenBefore = new Date(ivDateTime.getTime() - 15 * 60 * 1000);
          const t2 = scheduleNotification(
            `⚡ Interview in 15 minutes!`,
            `${label}${timeLabel} — get ready!`,
            fifteenBefore.getTime()
          );
          if (t2) timers.push(t2);
        }

        // ── TOMORROW ───────────────────────────────────────────────────────
        if (daysAway === 1) {
          // Notify at 9 PM today about tomorrow's interview
          const ninepm = new Date(); ninepm.setHours(21, 0, 0, 0);
          const t3 = scheduleNotification(
            `📅 Interview tomorrow`,
            `${label}${timeLabel} — don't forget to prepare!`,
            ninepm.getTime()
          );
          if (t3) timers.push(t3);
        }

        // ── 3 DAYS BEFORE ──────────────────────────────────────────────────
        if (daysAway === 3) {
          const morning = new Date(); morning.setHours(8, 0, 0, 0);
          const t4 = scheduleNotification(
            `🗓️ Interview in 3 days`,
            `${label} — start preparing now!`,
            morning.getTime()
          );
          if (t4) timers.push(t4);
        }
      });

    setTodayBanners(banners);
    return () => timers.forEach(t => t && clearTimeout(t));
  }, [applications]);

  return { todayBanners, permissionState, requestPermission };
}
