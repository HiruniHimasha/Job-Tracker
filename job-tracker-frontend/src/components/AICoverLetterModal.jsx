import { useState } from 'react';
import { generateCoverLetter } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AICoverLetterModal({ app, onClose }) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleGenerate = async () => {
    if (!app.jobDescription) {
      setError('No job description found. Please edit the application and add a job description first.');
      return;
    }
    setLoading(true);
    setError('');
    setCoverLetter('');
    try {
      const res = await generateCoverLetter({
        company: app.company,
        role: app.role,
        jobDescription: app.jobDescription,
        userName: user?.name,
      });
      setCoverLetter(res.data.coverLetter);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${app.company.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.6)' }}>

      {/* Modal */}
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[88vh]
                      flex flex-col shadow-2xl overflow-hidden
                      animate-slide-up">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-violet-600 to-purple-700 p-6 flex-shrink-0">
          {/* Subtle circles decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-8 w-16 h-16 rounded-full bg-white/5 translate-y-1/2" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">🤖</div>
                <h2 className="text-xl font-bold text-white">AI Cover Letter</h2>
              </div>
              <p className="text-violet-200 text-sm">
                <span className="font-semibold text-white">{app.role}</span> at <span className="font-semibold text-white">{app.company}</span>
              </p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center
                         text-white transition-colors text-xl font-light">
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Warning — no job description */}
          {!app.jobDescription && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm">No Job Description</p>
                <p className="text-amber-700 text-xs mt-1">
                  Edit this application → Notes tab → paste the job description to enable AI generation.
                </p>
              </div>
            </div>
          )}

          {/* Generate button — initial state */}
          {!coverLetter && !loading && app.jobDescription && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Ready to generate</h3>
              <p className="text-gray-500 text-sm mb-6">
                AI will write a professional cover letter tailored to this job
              </p>
              <button onClick={handleGenerate}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl
                           font-bold text-sm shadow-lg shadow-violet-500/30 hover:shadow-xl
                           hover:-translate-y-0.5 transform transition-all">
                ✨ Generate Cover Letter
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex flex-col items-center">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-violet-200" />
                  <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
                </div>
                <p className="text-gray-700 font-semibold">Writing your cover letter...</p>
                <p className="text-gray-400 text-sm mt-1">This takes 10–20 seconds</p>

                {/* Progress dots */}
                <div className="flex gap-2 mt-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i}
                      className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
              <span className="text-xl flex-shrink-0">❌</span>
              <div>
                <p className="font-semibold text-red-700 text-sm">Generation Failed</p>
                <p className="text-red-600 text-xs mt-1">{error}</p>
                <button onClick={handleGenerate}
                  className="mt-3 text-xs text-red-700 underline font-medium">
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Cover letter result */}
          {coverLetter && !loading && (
            <>
              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button onClick={handleGenerate}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-violet-50 text-violet-700
                             rounded-xl text-sm font-semibold hover:bg-violet-100 transition-colors border border-violet-200">
                  <span>🔄</span>
                  <span className="hidden sm:inline">Regenerate</span>
                  <span className="sm:hidden">Redo</span>
                </button>
                <button onClick={handleCopy}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold
                              transition-all border ${copied
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
                  <span>{copied ? '✅' : '📋'}</span>
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button onClick={handleDownload}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold
                              transition-all border ${downloaded
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}>
                  <span>{downloaded ? '✅' : '💾'}</span>
                  <span className="hidden sm:inline">{downloaded ? 'Saved!' : 'Download'}</span>
                  <span className="sm:hidden">{downloaded ? 'Done' : 'Save'}</span>
                </button>
              </div>

              {/* Textarea */}
              <div className="relative">
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-violet-50 border border-violet-200
                                text-violet-600 text-xs font-semibold px-2.5 py-1 rounded-full z-10">
                  <span>✨</span> AI Generated
                </div>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={18}
                  className="w-full p-4 pt-10 border border-gray-200 rounded-2xl text-sm text-gray-800
                             leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-violet-400
                             bg-gray-50 font-mono"
                />
              </div>

              <p className="text-xs text-gray-400 text-center">
                💡 You can edit the letter above before copying or downloading
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
