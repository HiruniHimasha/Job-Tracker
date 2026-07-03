// ApplicationForm.jsx — Beautiful tabbed form with interview scheduling
import { useState, useEffect } from 'react';
import { createApplication, updateApplication } from '../services/api';

const EMPTY_FORM = {
  company: '', role: '', location: '', jobUrl: '', status: 'Applied',
  salary: '', notes: '', jobDescription: '',
  appliedDate: new Date().toISOString().split('T')[0],
  interviewDate: '', interviewTime: '', interviewType: 'Online', interviewNotes: '',
};

const TABS = ['Details', 'Interview', 'Notes'];

export default function ApplicationForm({ editApp, onClose, onSave }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [tab, setTab]       = useState('Details');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (editApp) {
      setForm({
        company:        editApp.company        || '',
        role:           editApp.role           || '',
        location:       editApp.location       || '',
        jobUrl:         editApp.jobUrl         || '',
        status:         editApp.status         || 'Applied',
        salary:         editApp.salary         || '',
        notes:          editApp.notes          || '',
        jobDescription: editApp.jobDescription || '',
        appliedDate:    editApp.appliedDate
          ? new Date(editApp.appliedDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        interviewDate:  editApp.interviewDate
          ? new Date(editApp.interviewDate).toISOString().split('T')[0] : '',
        interviewTime:  editApp.interviewTime  || '',
        interviewType:  editApp.interviewType  || 'Online',
        interviewNotes: editApp.interviewNotes || '',
      });
      // Auto-switch to Interview tab if editing and has interview data
      if (editApp.interviewDate) setTab('Interview');
    }
  }, [editApp]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editApp) await updateApplication(editApp._id, form);
      else         await createApplication(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 transition-all";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center
                    justify-center z-50 px-0 sm:px-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg
                      max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-5 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {editApp ? 'Edit Application' : 'Add Application'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {editApp ? 'Update the details below' : 'Track your next opportunity'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center
                       justify-center text-gray-500 transition-colors text-lg">
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 mb-1 flex-shrink-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors
                          ${tab === t
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {t === 'Interview' ? '🎯 ' : t === 'Notes' ? '📝 ' : '📋 '}{t}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* ── DETAILS TAB ── */}
          {tab === 'Details' && (
            <>
              <div>
                <label className={labelCls}>Company <span className="text-red-400">*</span></label>
                <input name="company" value={form.company} onChange={handleChange}
                  placeholder="e.g. WSO2, Dialog, 99X" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Job Role <span className="text-red-400">*</span></label>
                <input name="role" value={form.role} onChange={handleChange}
                  placeholder="e.g. Junior Software Engineer" className={inputCls} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Location</label>
                  <input name="location" value={form.location} onChange={handleChange}
                    placeholder="Colombo" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}
                    className={inputCls}>
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                    <option>Withdrawn</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Applied Date</label>
                  <input name="appliedDate" type="date" value={form.appliedDate}
                    onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Salary</label>
                  <input name="salary" value={form.salary} onChange={handleChange}
                    placeholder="LKR 80,000" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Job URL</label>
                <input name="jobUrl" type="url" value={form.jobUrl} onChange={handleChange}
                  placeholder="https://linkedin.com/jobs/..." className={inputCls} />
              </div>
            </>
          )}

          {/* ── INTERVIEW TAB ── */}
          {tab === 'Interview' && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-2">
                💡 Set status to <strong>Interview</strong> on the Details tab, then fill in your interview schedule here.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Interview Date</label>
                  <input name="interviewDate" type="date" value={form.interviewDate}
                    onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Interview Time</label>
                  <input name="interviewTime" type="time" value={form.interviewTime}
                    onChange={handleChange} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Interview Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Phone', 'Online', 'In-Person', 'Technical', 'HR'].map(type => (
                    <button key={type} type="button"
                      onClick={() => setForm({ ...form, interviewType: type })}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all
                                  ${form.interviewType === type
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Preparation Notes</label>
                <textarea name="interviewNotes" value={form.interviewNotes} onChange={handleChange}
                  placeholder="e.g. Prepare system design, bring laptop, review React hooks..."
                  rows={4} className={`${inputCls} resize-none`} />
              </div>
            </>
          )}

          {/* ── NOTES TAB ── */}
          {tab === 'Notes' && (
            <>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  placeholder="e.g. Applied via LinkedIn, referral from Kamal..."
                  rows={4} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>
                  Job Description
                  <span className="ml-1 text-violet-500 normal-case font-medium">🤖 for AI cover letter</span>
                </label>
                <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange}
                  placeholder="Paste the full job description here..."
                  rows={6} className={`${inputCls} resize-none`} />
              </div>
            </>
          )}

          {/* Save / Cancel always visible */}
          <div className="flex gap-3 pt-2 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold
                         text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3
                         rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50
                         transition-all shadow-sm">
              {loading ? 'Saving...' : editApp ? 'Update' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}