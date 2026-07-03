// ResumeAnalyzerPage.jsx — Redesigned with polished UI
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const getScoreColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
};

const getScoreGrade = (score) => {
  if (score >= 90) return { grade: 'A+', label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 80) return { grade: 'A',  label: 'Great',     color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 70) return { grade: 'B',  label: 'Good',      color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' };
  if (score >= 60) return { grade: 'C',  label: 'Average',   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' };
  return                  { grade: 'D',  label: 'Needs Work', color: 'text-red-600',    bg: 'bg-red-50 border-red-200' };
};

export default function ResumeAnalyzerPage() {
  const [file, setFile]         = useState(null);
  const [jobDesc, setJobDesc]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError]       = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep]         = useState(0); // 0=upload, 1=result
  const navigate = useNavigate();

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }
    setFile(selectedFile);
    setError('');
    setAnalysis(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select a PDF resume first'); return; }
    setLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDesc) formData.append('jobDescription', jobDesc);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/resume/analyze',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setAnalysis(res.data.analysis);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setJobDesc('');
    setAnalysis(null);
    setError('');
    setStep(0);
  };

  const grade = analysis ? getScoreGrade(analysis.overallScore) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center
                       text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all shadow-sm">
            ←
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Resume Analyzer</h1>
            <p className="text-gray-500 text-sm mt-0.5">Get AI-powered feedback on your resume instantly</p>
          </div>
        </div>

        {/* ── UPLOAD STEP ── */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">

            {/* Upload Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Card header strip */}
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-lg">📄</span>
                  Upload Your Resume
                </h2>

                {/* Drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => document.getElementById('resume-input').click()}
                  className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                              transition-all duration-200
                              ${dragOver ? 'border-blue-400 bg-blue-50 scale-[1.01]' : ''}
                              ${file ? 'border-emerald-400 bg-emerald-50' : (!dragOver ? 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30' : '')}`}
                >
                  <input id="resume-input" type="file" accept=".pdf" className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])} />

                  {file ? (
                    <div>
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl">✅</div>
                      <p className="font-bold text-emerald-700 text-base mb-1">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">
                        Remove & choose different file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl
                                      transition-transform group-hover:scale-110">
                        📤
                      </div>
                      <p className="font-bold text-gray-700 text-base mb-1">
                        {dragOver ? 'Drop your resume here!' : 'Drag & drop your resume'}
                      </p>
                      <p className="text-sm text-gray-400 mb-3">or click to browse files</p>
                      <span className="inline-block bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full font-medium">
                        PDF only · Max 5MB
                      </span>
                    </div>
                  )}
                </div>

                {/* Job description */}
                <div className="mt-5">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Job Description
                    <span className="ml-2 text-xs font-normal text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Optional — adds a match score
                    </span>
                  </label>
                  <textarea
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Paste the job description here to see how well your resume matches it..."
                    rows={4}
                    className="w-full border border-gray-200 p-4 rounded-2xl text-sm text-gray-700 bg-gray-50
                               focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                               resize-none transition-all placeholder-gray-400"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                    <span className="text-xl">❌</span>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button onClick={handleSubmit} disabled={loading || !file}
                  className="mt-5 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl
                             font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:opacity-95
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:-translate-y-0.5 transform transition-all active:translate-y-0">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing your resume...
                    </span>
                  ) : '✨ Analyze My Resume'}
                </button>
              </div>
            </div>

            {/* Loading card */}
            {loading && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
                </div>
                <p className="text-gray-700 font-bold mb-1">AI is reading your resume...</p>
                <p className="text-gray-400 text-sm">This usually takes 10–20 seconds</p>
                <div className="flex justify-center gap-2 mt-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESULTS STEP ── */}
        {step === 1 && analysis && (
          <div className="space-y-4 animate-fade-in">

            {/* Score Hero Card */}
            <div className={`rounded-3xl border p-6 sm:p-8 ${grade.bg}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-4xl font-black ${grade.color}`}>{grade.grade}</span>
                    <div>
                      <p className={`text-lg font-extrabold ${grade.color}`}>{grade.label}</p>
                      <p className="text-gray-500 text-sm">{analysis.experienceLevel}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Score circle */}
                <div className="flex-shrink-0 ml-6">
                  <svg width="90" height="90" viewBox="0 0 90 90" className="transform -rotate-90">
                    <circle cx="45" cy="45" r="38" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle cx="45" cy="45" r="38"
                      stroke={getScoreColor(analysis.overallScore)} strokeWidth="8" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 38}`}
                      strokeDashoffset={`${2 * Math.PI * 38 * (1 - analysis.overallScore / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                  </svg>
                  <div className="absolute" style={{ marginTop: '-65px', marginLeft: '22px', textAlign: 'center' }}>
                    <span className="text-2xl font-extrabold text-gray-800">{analysis.overallScore}</span>
                    <span className="text-xs text-gray-500 block">/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job match score */}
            {analysis.jobMatchScore != null && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-xl">🎯</span> Job Match Score
                  </h3>
                  <span className={`text-2xl font-extrabold ${getScoreGrade(analysis.jobMatchScore).color}`}>
                    {analysis.jobMatchScore}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${analysis.jobMatchScore}%`,
                      backgroundColor: getScoreColor(analysis.jobMatchScore)
                    }} />
                </div>
                {analysis.jobMatchTips?.length > 0 && (
                  <ul className="space-y-1.5">
                    {analysis.jobMatchTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span> {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Top Skills */}
            {analysis.topSkills?.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">⚡</span> Top Skills Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.topSkills.map((skill, i) => (
                    <span key={i}
                      className="bg-blue-50 text-blue-700 border border-blue-200 text-sm px-3.5 py-1.5
                                 rounded-full font-semibold hover:bg-blue-100 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths + Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-5 sm:p-6">
                <h3 className="font-bold text-emerald-700 mb-4 flex items-center gap-2">
                  <span className="text-xl">✅</span> Strengths
                </h3>
                <ul className="space-y-2.5">
                  {analysis.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="text-emerald-500 flex-shrink-0 mt-0.5 font-bold">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-5 sm:p-6">
                <h3 className="font-bold text-orange-700 mb-4 flex items-center gap-2">
                  <span className="text-xl">🔧</span> Improvements
                </h3>
                <ul className="space-y-2.5">
                  {analysis.improvements?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="text-orange-500 flex-shrink-0 mt-0.5 font-bold">!</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing keywords */}
            {analysis.missingKeywords?.length > 0 && (
              <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-5 sm:p-6">
                <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                  <span className="text-xl">🔍</span> Missing Keywords
                </h3>
                <p className="text-gray-400 text-xs mb-4">
                  Add these to your resume to improve ATS scores and visibility
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((kw, i) => (
                    <span key={i}
                      className="bg-red-50 text-red-600 border border-red-200 text-sm px-3.5 py-1.5 rounded-full font-medium">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Analyze another button */}
            <button onClick={resetAll}
              className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-500 rounded-3xl
                         text-sm font-semibold hover:border-indigo-400 hover:text-indigo-600
                         hover:bg-indigo-50 transition-all">
              📄 Analyze Another Resume
            </button>
          </div>
        )}

        <div className="h-8" />
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
}
