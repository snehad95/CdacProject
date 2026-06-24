import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Clock, BookOpen, Target, Camera, AlertTriangle,
  CheckCircle, User, Shield, Award, ChevronRight, Maximize2,
  Copy, ToggleLeft, ArrowLeftCircle, Eye
} from 'lucide-react';

const T = {
  bg: 'var(--cdac-bg)',
  surface: 'var(--cdac-surface)',
  surfaceAlt: 'var(--cdac-surface-alt)',
  primary: '#7c5cff',
  primarySoft: '#cbb6e9',
  accent: '#ffb84d',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  text: 'var(--cdac-text)',
  textMuted: 'var(--cdac-text-muted)',
  border: 'var(--cdac-border)',
};

const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/exams'); return; }
    const fetchExamAndResults = async () => {
      try {
        const [examRes, resultRes] = await Promise.all([
          axios.get('http://localhost:5000/api/exams'),
          axios.get(`http://localhost:5000/api/results/student/${user.id}`)
        ]);
        const found = examRes.data.find(e => e._id === examId);
        setExam(found);
        const hasAttempted = resultRes.data.some(r => (r.examId?._id === examId || r.examId === examId));
        setAlreadyAttempted(hasAttempted);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (user.id) fetchExamAndResults();
  }, [examId, navigate, user.id]);

  const handleStartTest = () => {
    navigate(`/exam/${examId}`);
  };

  if (loading) {
    return (
      <div style={S.loadingWrap}>
        <div style={S.spinner} />
        <p style={{ color: T.textMuted, fontWeight: 500 }}>Loading exam details...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={S.loadingWrap}>
        <p style={{ color: T.text, fontWeight: 600 }}>Exam not found.</p>
        <button style={S.solidBtn} onClick={() => navigate('/exams')}>Go Back</button>
      </div>
    );
  }

  const passMark = exam.passingMarks ?? Math.round((exam.totalMarks ?? 0) * 0.4);

  const infoCards = [
    { icon: BookOpen, color: T.primary, label: 'Total Questions', value: exam.totalMarks ?? 'N/A' },
    { icon: Target, color: T.success, label: 'Passing Marks', value: passMark || 'N/A' },
    { icon: Clock, color: T.accent, label: 'Duration', value: `${exam.durationMinutes ?? '—'} mins` },
    { icon: Award, color: '#9f7aea', label: 'Pass Percentage', value: `${exam.passingScore ?? 40}%` },
  ];

  const rules = [
    { icon: Maximize2, color: T.primary, title: 'Fullscreen Mode Required', text: 'The exam will run in fullscreen mode. Exiting fullscreen will be treated as a violation and a warning will be issued.' },
    { icon: ArrowLeftCircle, color: T.danger, title: 'No Going Back', text: 'Navigation back button is disabled. Once you start the exam you cannot return to any previous page without submitting.' },
    { icon: Copy, color: T.warning, title: 'Copy / Paste Disabled', text: 'Right-click, Ctrl+C, Ctrl+V, and text selection are completely blocked inside the exam to prevent plagiarism.' },
    { icon: ToggleLeft, color: T.accent, title: 'No Tab Switching', text: 'Switching to another browser tab or application window will be detected and logged as a violation against your session.' },
    { icon: Camera, color: T.success, title: 'Webcam Proctoring Active', text: 'Your webcam will be active throughout. Face must remain clearly visible. Multiple faces will be detected instantly.' },
    { icon: Eye, color: '#9f7aea', title: 'Anti-Cheat — 3-Strike System', text: 'You are allowed only 3 violations (face away, tab switch, fullscreen exit). On the 3rd violation, your exam will be auto-submitted immediately.' },
    { icon: Clock, color: T.danger, title: 'Timer Cannot Be Paused', text: 'The countdown timer starts the moment you enter the exam and cannot be paused or reset under any circumstances.' },
    { icon: CheckCircle, color: T.success, title: 'Review Before Submitting', text: 'All unanswered questions are treated as wrong. Use the question palette to review your answers before final submission.' },
  ];

  return (
    <div style={S.pageWrap}>
      {/* Top Bar */}
      <div style={S.topBar}>
        <span style={S.logoText}>CDAC ExamWeb</span>
        <div style={S.userPill}>
          <div style={S.userAvatar}><User size={16} color="#fff" /></div>
          <span style={S.userName}>{user.name || user.email || 'Student'}</span>
        </div>
      </div>

      <div style={S.scrollArea}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={S.card}>
          {/* Header */}
          <div style={S.examHeader}>
            <div style={S.examIconWrap}>
              <Shield size={28} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={S.examBadge}>EXAM INSTRUCTIONS</p>
              <h1 style={S.examTitle}>{exam.title}</h1>
              {exam.description && <p style={S.examDesc}>{exam.description}</p>}
            </div>
          </div>

          {/* Info Grid */}
          <div style={S.infoGrid}>
            {infoCards.map(({ icon: Icon, color, label, value }, i) => (
              <div key={i} style={S.infoCard}>
                <div style={{ ...S.infoIcon, background: `${color}1a` }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={S.infoValue}>{value}</div>
                <div style={S.infoLabel}>{label}</div>
              </div>
            ))}
          </div>

          <div style={S.divider} />

          {/* Rules */}
          <div style={{ padding: '24px 36px' }}>
            <div style={S.rulesTitle}>
              <AlertTriangle size={20} color={T.warning} style={{ marginRight: 10 }} />
              Rules & Anti-Cheat Policy
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {rules.map(({ icon: Icon, color, title, text }, i) => (
                <div key={i} style={S.ruleRow}>
                  <div style={{ ...S.ruleIcon, background: `${color}1a` }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <p style={{ color: T.text, fontWeight: 700, margin: 0, fontSize: '.95rem' }}>{title}</p>
                    <p style={{ color: T.textMuted, fontSize: '.82rem', margin: '4px 0 0', lineHeight: 1.5 }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Banner */}
          <div style={S.warnBanner}>
            <AlertTriangle size={20} color={T.danger} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Auto-Submit is active.</strong> Your exam will be automatically submitted upon time expiry or 3 anti-cheat violations.
              <div style={{ marginTop: 4, fontSize: '.85rem', opacity: .85 }}>
                Your webcam, tab-focus, and fullscreen status are monitored in real time.
              </div>
            </div>
          </div>

          {/* Agreement */}
          {!alreadyAttempted ? (
            <label style={S.agreeRow}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: T.primary, cursor: 'pointer' }}
              />
              <span style={{ color: T.text, fontWeight: 500 }}>
                I have read all instructions and agree to the anti-cheat policy.
              </span>
            </label>
          ) : (
            <div style={S.attemptedBox}>
              <CheckCircle size={18} color={T.success} />
              <span>You have already completed this exam. Multiple attempts are not permitted.</span>
            </div>
          )}

          {/* Actions */}
          <div style={S.btnRow}>
            <button style={S.backBtn} onClick={() => navigate('/exams')}>← Back to Exams</button>
            <button
              style={{ ...S.startBtn, opacity: (!agreed || alreadyAttempted) ? 0.5 : 1, cursor: (!agreed || alreadyAttempted) ? 'not-allowed' : 'pointer' }}
              disabled={!agreed || alreadyAttempted}
              onClick={handleStartTest}
            >
              {alreadyAttempted ? 'Exam Already Attempted' : 'Start Test — Enter Fullscreen'}
              <ChevronRight size={18} style={{ marginLeft: 6 }} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const S = {
  pageWrap: { minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 32px', background: T.surface, borderBottom: `1px solid ${T.border}`,
    position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(124,92,255,0.05)',
  },
  logoText: { fontSize: '1.25rem', fontWeight: 800, color: T.primary, letterSpacing: '.5px' },
  userPill: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: T.surfaceAlt, border: `1px solid ${T.border}`,
    borderRadius: 50, padding: '5px 16px 5px 5px',
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: `linear-gradient(135deg, ${T.primary}, ${T.primarySoft})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userName: { color: T.text, fontWeight: 600, fontSize: '.9rem' },
  scrollArea: { flex: 1, overflowY: 'auto', padding: '32px 16px 48px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' },
  card: {
    width: '100%', maxWidth: 920, background: T.surface,
    border: `1px solid ${T.border}`, borderRadius: 24,
    boxShadow: '0 25px 60px -30px rgba(124,92,255,0.35)', overflow: 'hidden',
  },
  examHeader: {
    display: 'flex', alignItems: 'flex-start', gap: 20,
    background: `linear-gradient(135deg, ${T.surfaceAlt}, #ffffff)`,
    borderBottom: `1px solid ${T.border}`, padding: '32px 36px',
  },
  examIconWrap: {
    width: 60, height: 60, borderRadius: 16, flexShrink: 0,
    background: `linear-gradient(135deg, ${T.primary}, ${T.primarySoft})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 10px 24px -8px ${T.primary}66`,
  },
  examBadge: { fontSize: '.72rem', fontWeight: 700, letterSpacing: '1.5px', color: T.primary, marginBottom: 6 },
  examTitle: { color: T.text, fontWeight: 800, fontSize: '1.75rem', margin: 0, lineHeight: 1.25 },
  examDesc: { color: T.textMuted, fontSize: '.95rem', marginTop: 8, marginBottom: 0, lineHeight: 1.6 },
  infoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 16, padding: '28px 36px',
  },
  infoCard: {
    background: T.surfaceAlt, border: `1px solid ${T.border}`,
    borderRadius: 16, padding: '20px 16px', textAlign: 'center',
  },
  infoIcon: {
    width: 48, height: 48, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
  },
  infoValue: { color: T.text, fontWeight: 800, fontSize: '1.5rem', marginBottom: 4 },
  infoLabel: { color: T.textMuted, fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' },
  divider: { height: 1, background: `linear-gradient(90deg, transparent, ${T.border}, transparent)`, margin: '0 36px' },
  rulesTitle: { color: T.text, fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', marginBottom: 20 },
  ruleRow: {
    display: 'flex', alignItems: 'flex-start', gap: 14,
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 12, padding: '14px 16px',
  },
  ruleIcon: {
    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  warnBanner: {
    display: 'flex', alignItems: 'flex-start', gap: 14,
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 12, padding: '16px 20px',
    color: '#b91c1c', fontSize: '.9rem', lineHeight: 1.55, margin: '4px 36px 16px',
  },
  agreeRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    margin: '0 36px 16px', padding: '14px 18px',
    background: T.surfaceAlt, border: `1px solid ${T.border}`,
    borderRadius: 12, cursor: 'pointer',
  },
  attemptedBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    margin: '0 36px 16px', padding: '14px 18px',
    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: 12, color: '#15803d', fontWeight: 500, fontSize: '.9rem',
  },
  btnRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 36px 36px', gap: 16, flexWrap: 'wrap',
  },
  backBtn: {
    background: T.surface, border: `1px solid ${T.border}`,
    color: T.textMuted, fontWeight: 600, fontSize: '.95rem',
    borderRadius: 12, padding: '12px 28px', cursor: 'pointer',
  },
  startBtn: {
    display: 'flex', alignItems: 'center',
    background: `linear-gradient(135deg, ${T.primary}, ${T.primarySoft})`,
    border: 'none', color: '#fff', fontWeight: 700, fontSize: '1rem',
    borderRadius: 12, padding: '14px 36px',
    boxShadow: `0 10px 24px -8px ${T.primary}88`,
  },
  solidBtn: {
    background: T.primary, border: 'none', color: '#fff',
    borderRadius: 12, padding: '12px 28px', cursor: 'pointer', fontWeight: 600,
  },
  loadingWrap: {
    minHeight: '100vh', background: T.bg,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  spinner: {
    width: 44, height: 44,
    border: `3px solid ${T.border}`, borderTop: `3px solid ${T.primary}`,
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('exam-spin-kf')) {
  const s = document.createElement('style');
  s.id = 'exam-spin-kf';
  s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}

export default ExamInstructions;
