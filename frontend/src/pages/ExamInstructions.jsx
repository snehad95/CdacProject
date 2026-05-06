import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Clock, BookOpen, Target, Camera, AlertTriangle,
  CheckCircle, PlayCircle, User, Shield,
  RefreshCw, Award, ChevronRight, Maximize2,
  Copy, ToggleLeft, ArrowLeftCircle, Wifi, Eye
} from 'lucide-react';

const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/exams');
      return;
    }
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user.id) fetchExamAndResults();
  }, [examId, navigate, user.id]);

  const handleStartTest = () => {
    // Request fullscreen when starting
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    navigate(`/exam/${examId}`);
  };

  if (loading) {
    return (
      <div style={S.loadingWrap}>
        <div style={S.spinner} />
        <p style={{ color: '#a0aec0', marginTop: '1rem' }}>Loading exam details...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={S.loadingWrap}>
        <p style={{ color: '#fc8181', fontSize: '1.2rem' }}>Exam not found.</p>
        <button style={S.solidBtn} onClick={() => navigate('/exams')}>Go Back</button>
      </div>
    );
  }

  const passMark = exam.passingMarks ?? Math.round((exam.totalMarks ?? 0) * 0.4);

  const infoCards = [
    { icon: BookOpen,  color: '#667eea', label: 'Total Questions', value: exam.totalMarks ?? 'N/A' },
    { icon: Target,    color: '#48bb78', label: 'Passing Marks',   value: passMark || 'N/A' },
    { icon: Clock,     color: '#ed8936', label: 'Duration',         value: `${exam.durationMinutes ?? '—'} mins` },
    { icon: Award,     color: '#9f7aea', label: 'Pass Percentage',  value: `${exam.passingScore ?? 40}%` },
  ];

  const rules = [
    {
      icon: Maximize2,
      color: '#667eea',
      title: 'Fullscreen Mode Required',
      text: 'The exam will run in fullscreen mode. Exiting fullscreen will be treated as a violation and a warning will be issued.',
    },
    {
      icon: ArrowLeftCircle,
      color: '#fc8181',
      title: 'No Going Back',
      text: 'Navigation back button is disabled. Once you start the exam you cannot return to any previous page without submitting.',
    },
    {
      icon: Copy,
      color: '#f6ad55',
      title: 'Copy / Paste Disabled',
      text: 'Right-click, Ctrl+C, Ctrl+V, and text selection are completely blocked inside the exam to prevent plagiarism.',
    },
    {
      icon: ToggleLeft,
      color: '#ed8936',
      title: 'No Tab Switching',
      text: 'Switching to another browser tab or application window will be detected and logged as a violation against your session.',
    },
    {
      icon: Camera,
      color: '#48bb78',
      title: 'Webcam Proctoring Active',
      text: 'Your webcam will be active throughout. Face must remain clearly visible. Multiple faces will be detected instantly.',
    },
    {
      icon: Eye,
      color: '#9f7aea',
      title: 'Anti-Cheat — 3-Strike System',
      text: 'You are allowed only 3 violations (face away, tab switch, fullscreen exit). On the 3rd violation, your exam will be auto-submitted immediately.',
    },
    {
      icon: Clock,
      color: '#fc8181',
      title: 'Timer Cannot Be Paused',
      text: 'The countdown timer starts the moment you enter the exam and cannot be paused or reset under any circumstances.',
    },
    {
      icon: CheckCircle,
      color: '#48bb78',
      title: 'Review Before Submitting',
      text: 'All unanswered questions are treated as wrong. Use the question palette to review your answers before final submission.',
    },
  ];

  return (
    <div style={S.pageWrap}>
      {/* ─── Top Bar ─── */}
      <div style={S.topBar}>
        <span style={S.logoText}>CDAC <span style={{ color: '#667eea' }}>ExamWeb</span></span>
        <div style={S.userPill}>
          <div style={S.userAvatar}><User size={17} color="#fff" /></div>
          <span style={S.userName}>{user.name || user.email || 'Student'}</span>
        </div>
      </div>

      {/* ─── Scroll Area ─── */}
      <div style={S.scrollArea}>
        <motion.div
          style={S.card}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Exam Header */}
          <div style={S.examHeader}>
            <motion.div
              style={S.examIconWrap}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <BookOpen size={30} color="#fff" />
            </motion.div>
            <div>
              <div style={S.examBadge}>EXAM INSTRUCTIONS</div>
              <h1 style={S.examTitle}>{exam.title}</h1>
              {exam.description && <p style={S.examDesc}>{exam.description}</p>}
            </div>
          </div>

          {/* Info Grid */}
          <div style={S.infoGrid}>
            {infoCards.map(({ icon: Icon, color, label, value }, i) => (
              <motion.div
                key={i}
                style={S.infoCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
              >
                <div style={{ ...S.infoIcon, background: color + '22', border: `1.5px solid ${color}44` }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={S.infoValue}>{value}</div>
                <div style={S.infoLabel}>{label}</div>
              </motion.div>
            ))}
          </div>

          <div style={S.divider} />

          {/* Rules */}
          <div style={{ padding: '28px 36px 20px' }}>
            <h2 style={S.rulesTitle}>
              <AlertTriangle size={20} color="#f6ad55" style={{ marginRight: '10px' }} />
              Rules &amp; Anti-Cheat Policy
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rules.map(({ icon: Icon, color, title, text }, i) => (
                <motion.div
                  key={i}
                  style={S.ruleRow}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                  <div style={{ ...S.ruleIcon, background: color + '18' }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <div style={{ color: '#f7fafc', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{title}</div>
                    <div style={{ color: '#a0aec0', fontSize: '0.88rem', lineHeight: 1.55 }}>{text}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Warning Banner */}
          <motion.div
            style={S.warnBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Camera size={20} color="#fc8181" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0 }}>
              <strong>Auto-Submit is active.</strong> Your exam will be automatically submitted upon time expiry or 3 anti-cheat violations.
              Your webcam, tab-focus, and fullscreen status are monitored in real time.
            </p>
          </motion.div>

          {/* Agreement checkbox */}
          {!alreadyAttempted ? (
            <div style={{ padding: '0 36px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="agreeChk"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#667eea', cursor: 'pointer' }}
              />
              <label htmlFor="agreeChk" style={{ color: '#cbd5e0', fontSize: '0.9rem', cursor: 'pointer' }}>
                I have read all instructions and agree to the anti-cheat policy.
              </label>
            </div>
          ) : (
            <div style={{ padding: '0 36px 16px' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(246,173,85,0.15)', border: '1px solid rgba(246,173,85,0.4)', borderRadius: '8px', color: '#fbd38d', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} /> You have already completed this exam to the best of your ability. Multiple attempts are not permitted.
              </div>
            </div>
          )}

          {/* Action Row */}
          <motion.div
            style={S.btnRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <button style={S.backBtn} onClick={() => navigate('/exams')}>
              ← Back to Exams
            </button>
            <button
              style={{ ...S.startBtn, opacity: (agreed && !alreadyAttempted) ? 1 : 0.45, cursor: (agreed && !alreadyAttempted) ? 'pointer' : 'not-allowed' }}
              onClick={(agreed && !alreadyAttempted) ? handleStartTest : undefined}
              disabled={!agreed || alreadyAttempted}
            >
              <PlayCircle size={20} style={{ marginRight: '10px' }} />
              {alreadyAttempted ? 'Exam Already Attempted' : 'Start Test — Enter Fullscreen'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

/* ─── Styles ─── */
const S = {
  pageWrap: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #24243e 100%)',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 32px',
    background: 'rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logoText: { fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' },
  userPill: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '50px', padding: '6px 16px 6px 6px',
  },
  userAvatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userName: { color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' },
  scrollArea: {
    flex: 1, overflowY: 'auto', padding: '32px 16px 48px',
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
  },
  card: {
    width: '100%', maxWidth: '880px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px', backdropFilter: 'blur(20px)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
  },
  examHeader: {
    display: 'flex', alignItems: 'flex-start', gap: '20px',
    background: 'linear-gradient(135deg,rgba(102,126,234,.25),rgba(118,75,162,.25))',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    padding: '32px 36px',
  },
  examIconWrap: {
    width: '60px', height: '60px', borderRadius: '16px', flexShrink: 0,
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(102,126,234,0.4)',
  },
  examBadge: { fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', color: '#a78bfa', marginBottom: '6px' },
  examTitle: { color: '#f7fafc', fontWeight: 800, fontSize: '1.75rem', margin: 0, lineHeight: 1.25 },
  examDesc: { color: '#a0aec0', fontSize: '0.95rem', marginTop: '8px', marginBottom: 0, lineHeight: 1.6 },
  infoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px', padding: '28px 36px',
  },
  infoCard: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', padding: '20px 16px', textAlign: 'center',
  },
  infoIcon: {
    width: '48px', height: '48px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
  },
  infoValue: { color: '#f7fafc', fontWeight: 800, fontSize: '1.5rem', marginBottom: '4px' },
  infoLabel: { color: '#718096', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  divider: { height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent)', margin: '0 36px' },
  rulesTitle: {
    color: '#f7fafc', fontWeight: 700, fontSize: '1.1rem',
    display: 'flex', alignItems: 'center', marginBottom: '20px',
  },
  ruleRow: {
    display: 'flex', alignItems: 'flex-start', gap: '14px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px', padding: '14px 16px',
  },
  ruleIcon: {
    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  warnBanner: {
    display: 'flex', alignItems: 'flex-start', gap: '14px',
    background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.3)',
    borderRadius: '12px', padding: '16px 20px',
    color: '#feb2b2', fontSize: '0.9rem', lineHeight: 1.55, margin: '20px 36px 16px',
  },
  btnRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 36px 36px', gap: '16px', flexWrap: 'wrap',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#a0aec0', fontWeight: 600, fontSize: '0.95rem',
    borderRadius: '12px', padding: '12px 28px', cursor: 'pointer',
  },
  startBtn: {
    display: 'flex', alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none', color: '#fff', fontWeight: 700, fontSize: '1rem',
    borderRadius: '12px', padding: '14px 40px',
    boxShadow: '0 8px 24px rgba(102,126,234,0.45)',
    transition: 'transform 0.2s',
  },
  solidBtn: {
    background: '#667eea', border: 'none', color: '#fff',
    borderRadius: '12px', padding: '12px 28px', cursor: 'pointer', fontWeight: 600,
  },
  loadingWrap: {
    minHeight: '100vh', background: 'linear-gradient(135deg,#0f0c29,#24243e)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
  },
  spinner: {
    width: '44px', height: '44px',
    border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #667eea',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}

export default ExamInstructions;
