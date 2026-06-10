import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const MAX_VIOLATIONS = 3;

const T = {
  bg: 'var(--cdac-bg)',
  surface: 'var(--cdac-surface)',
  surfaceAlt: 'var(--cdac-surface-alt)',
  primary: '#7c5cff',
  primarySoft: '#cbb6e9',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: 'var(--cdac-text)',
  textMuted: 'var(--cdac-text-muted)',
  border: 'var(--cdac-border)',
};

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

const ExamArena = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const answersRef = useRef({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [violations, setViolations] = useState(0);
  const [warnMsg, setWarnMsg] = useState('');
  const [showWarn, setShowWarn] = useState(false);
  const violationsRef = useRef(0);

  const videoRef = useRef(null);
  const faceDetectInterval = useRef(null);
  const [faceStatus, setFaceStatus] = useState('Initializing...');
  const faceApiLoaded = useRef(false);
  const streamRef = useRef(null);

  const timerRef = useRef(null);
  const submittedRef = useRef(false);

  const submitExam = useCallback(async (reason = 'manual') => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    clearInterval(faceDetectInterval.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    try { if (document.exitFullscreen) document.exitFullscreen(); } catch (_) { }
    document.oncontextmenu = null;
    document.oncopy = null; document.onpaste = null;

    try {
      const currentAnswers = answersRef.current;
      const formattedAnswers = Object.keys(currentAnswers).map(qId => ({
        questionId: qId,
        selectedOptionText: currentAnswers[qId],
      }));
      await axios.post('http://localhost:5000/api/results/submit', {
        userId: user.id, examId, answers: formattedAnswers,
      });
    } catch (err) { console.error('Submit error', err); }

    const msg = reason === 'time'
      ? 'Time is up! Your exam has been submitted.'
      : reason === 'violation'
        ? '🚨 3 violations detected. Your exam has been auto-submitted.'
        : 'Exam submitted successfully!';

    setTimeout(() => {
      if (reason === 'time') toast.error(msg);
      else if (reason === 'violation') toast.error(msg, { duration: 6000 });
      else toast.success(msg);
      navigate('/dashboard');
    }, 200);
  }, [examId, user.id, navigate]);

  const triggerViolation = useCallback((message) => {
    if (submittedRef.current) return;
    violationsRef.current += 1;
    const v = violationsRef.current;
    setViolations(v);
    if (v >= MAX_VIOLATIONS) {
      setWarnMsg(`🚨 VIOLATION #${v}: ${message}\nAuto-submitting your exam NOW!`);
      setShowWarn(true);
      setTimeout(() => submitExam('violation'), 2500);
    } else {
      setWarnMsg(`⚠️ WARNING ${v}/${MAX_VIOLATIONS}: ${message}\n${MAX_VIOLATIONS - v} warning(s) left before auto-submit.`);
      setShowWarn(true);
      setTimeout(() => setShowWarn(false), 4000);
    }
  }, [submitExam]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const blockBack = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', blockBack);

    document.oncontextmenu = e => e.preventDefault();
    document.oncopy = e => e.preventDefault();
    document.onpaste = e => e.preventDefault();
    document.oncut = e => e.preventDefault();
    document.addEventListener('keydown', blockKeys);

    const handleBlur = () => { if (!submittedRef.current) triggerViolation('Tab switching or window focus lost detected.'); };
    const handleVisibility = () => { if (document.hidden && !submittedRef.current) triggerViolation('You switched to another tab or application.'); };
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    const handleFsChange = () => { if (!document.fullscreenElement && !submittedRef.current) triggerViolation('Fullscreen was exited. Please stay in fullscreen mode.'); };
    document.addEventListener('fullscreenchange', handleFsChange);

    return () => {
      window.removeEventListener('popstate', blockBack);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('keydown', blockKeys);
      document.oncontextmenu = null;
      document.oncopy = null; document.onpaste = null; document.oncut = null;
    };
  }, [triggerViolation]);

  function blockKeys(e) {
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'x', 'p', 's', 'u'].includes(e.key.toLowerCase())) e.preventDefault();
    if (['F12', 'F5'].includes(e.key)) e.preventDefault();
  }

  useEffect(() => {
    if (user.role !== 'student') { navigate('/'); return; }
    const fetchExamData = async () => {
      try {
        try {
          const token = localStorage.getItem('token');
          const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
          const checkRes = await axios.get(`http://localhost:5000/api/results/student/${user.id}`, config);
          const hasAttempted = checkRes.data.some(r => r.examId && r.examId._id === examId);
          if (hasAttempted) {
            setAlreadySubmitted(true);
            return;
          }
        } catch (err) { console.error("Result check failed", err); }

        const [examsRes, qRes] = await Promise.all([
          axios.get('http://localhost:5000/api/exams'),
          axios.get(`http://localhost:5000/api/questions/exam/${examId}`),
        ]);
        const current = examsRes.data.find(e => e._id === examId);
        setExam(current);
        if (current) setTimeLeft(current.durationMinutes * 60);
        const shuffled = qRes.data.sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      } catch (err) { console.error(err); }
    };
    fetchExamData();
  }, [examId, navigate, user.role, user.id]);

  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); submitExam('time'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [exam]); // eslint-disable-line

  useEffect(() => {
    let alive = true;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        await loadScript('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js');
        if (!alive) return;
        const faceapi = window.faceapi;
        const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';
        setFaceStatus('Loading Models...');
        await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)]);
        faceApiLoaded.current = true;
        setFaceStatus('Active');
        faceDetectInterval.current = setInterval(async () => {
          if (!alive || submittedRef.current || !videoRef.current || !faceApiLoaded.current) return;
          try {
            const detections = await faceapi.detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4, inputSize: 224 })
            );
            if (detections.length === 0) triggerViolation('No face detected in camera! Please ensure your face is clearly visible.');
            else if (detections.length > 1) triggerViolation(`Multiple faces detected (${detections.length}). Exam violation! Only you must be in the frame.`);
          } catch (_) { }
        }, 3000);
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err.message);
        setFaceStatus('Camera Error');
      }
    };
    startCamera();
    return () => {
      alive = false;
      clearInterval(faceDetectInterval.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [triggerViolation]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const answered = Object.keys(answers).length;
  const total = questions.length;
  const progress = total > 0 ? (answered / total) * 100 : 0;
  const pct = timeLeft / ((exam?.durationMinutes ?? 1) * 60);
  const timerRed = pct < 0.15;

  if (alreadySubmitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #edd8ff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'Segoe UI', system-ui, sans-serif"
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(124, 58, 237, 0.1)',
          padding: '40px 32px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          border: '1px solid #ede9fe'
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            backgroundColor: '#fee2e2', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 16px rgba(239, 68, 68, 0.15)'
          }}>
            <span style={{ fontSize: '2.5rem' }}>🚫</span>
          </div>
          <h3 style={{ color: '#1e1b4b', fontWeight: 800, marginBottom: 12 }}>Attempt Blocked</h3>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
            Our records show you have already submitted this exam. Only one attempt is permitted per student to maintain test integrity.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 32px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: T.textMuted, fontWeight: 500 }}>Loading exam...</p>
      </div>
    );
  }

  const watermarkText = `${user.name || 'Candidate'} - ${user.email}`;
  const watermarks = Array(20).fill(watermarkText);

  return (
    <div style={S.page} onContextMenu={e => e.preventDefault()}>
      {/* Watermark */}
      <div style={S.watermarkOverlay}>
        {watermarks.map((text, i) => (<div key={i} style={S.watermarkText}>{text}</div>))}
      </div>

      {/* Top Bar */}
      <div style={S.topBar}>
        <div style={S.topLeft}>
          <span style={S.logoText}>CDAC ExamWeb</span>
          <span style={S.examTitleBadge}>{exam.title}</span>
        </div>

        <div style={{ ...S.timer, background: timerRed ? 'rgba(239,68,68,0.12)' : T.surfaceAlt, border: `1px solid ${timerRed ? 'rgba(239,68,68,0.3)' : T.border}` }}>
          <div style={{ fontSize: '.65rem', color: T.textMuted, fontWeight: 700, letterSpacing: '1px' }}>TIME LEFT</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: timerRed ? T.danger : T.primary, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div style={S.topRight}>
          <div style={S.userChip}>
            <div style={S.userAvatar}>{(user.name || 'S')[0].toUpperCase()}</div>
            <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: '.85rem' }}>{user.name || 'Student'}</div>
              <div style={{ color: T.textMuted, fontSize: '.7rem' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ ...S.strikeBadge, background: violations > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', borderColor: violations > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)' }}>
            <span style={{ fontSize: '.6rem', color: T.textMuted, fontWeight: 700, letterSpacing: '.5px' }}>VIOLATIONS</span>
            <span style={{ fontWeight: 800, color: violations >= 3 ? T.danger : violations > 0 ? T.warning : T.success }}>
              {violations}/{MAX_VIOLATIONS}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={S.progressTrack}>
        <div style={{ ...S.progressFill, width: `${progress}%` }} />
      </div>

      {/* Body */}
      <div style={S.body}>
        {/* Questions */}
        <div style={S.questionPanel}>
          <div style={S.panelHeader}>
            <span style={{ color: T.text, fontWeight: 700 }}>{answered}/{total} Answered</span>
          </div>

          <div style={S.questionScroll} className="notranslate">
            {questions.map((q, idx) => {
              const sel = answers[q._id];
              return (
                <div key={q._id} id={`q-${q._id}`} style={{ ...S.qCard, borderLeft: sel ? `4px solid ${T.success}` : `4px solid ${T.border}` }}>
                  <div style={S.qNumber}>Q{idx + 1}</div>
                  <p style={S.qText}>{q.text}</p>
                  {q.imageUrl && <img src={q.imageUrl} alt="" style={{ maxWidth: '100%', borderRadius: 10, marginBottom: 14 }} />}
                  <div style={S.optionsList}>
                    {q.options.map((opt, oIdx) => {
                      const isSelected = sel === opt.text;
                      return (
                        <label key={oIdx} style={{ ...S.optionLabel, background: isSelected ? 'rgba(124,92,255,0.1)' : T.surfaceAlt, border: `1px solid ${isSelected ? T.primary : T.border}`, cursor: 'pointer' }}>
                          <span style={{ ...S.optionDot, background: isSelected ? T.primary : T.surface, border: `2px solid ${isSelected ? T.primary : T.primarySoft}` }}>
                            {isSelected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cdac-surface)' }} />}
                          </span>
                          <input
                            type="radio"
                            name={q._id}
                            style={{ display: 'none' }}
                            checked={isSelected}
                            onChange={() => {
                              setAnswers(prev => {
                                const newAnswers = { ...prev, [q._id]: opt.text };
                                answersRef.current = newAnswers;
                                return newAnswers;
                              });
                            }}
                          />
                          <span style={{ color: T.text, fontWeight: 500, fontSize: '.95rem' }}>{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
              <button
                style={S.submitBtn}
                onClick={() => { if (window.confirm(`Submit exam? You've answered ${answered}/${total} questions.`)) submitExam('manual'); }}
              >✓ Submit Exam</button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={S.sidebar}>
          <div style={S.sideCard}>
            <div style={S.sideAvatarBig}>{(user.name || 'S')[0].toUpperCase()}</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: T.text, fontWeight: 700, margin: 0 }}>{user.name}</p>
              <p style={{ color: T.textMuted, fontSize: '.75rem', margin: 0 }}>{user.email}</p>
            </div>
          </div>

          <div style={S.cameraCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: faceStatus === 'Active' ? T.success : T.warning }} />
                <span style={{ color: T.text, fontSize: '.72rem', fontWeight: 700 }}>PROCTOR: {faceStatus}</span>
              </div>
            </div>
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', borderRadius: 10, background: '#000', aspectRatio: '4/3', objectFit: 'cover' }} />
            <p style={{ color: T.textMuted, fontSize: '.7rem', textAlign: 'center', margin: '8px 0 0' }}>Keep your face clearly visible</p>
          </div>

          <div style={{ ...S.sideCard, background: violations >= MAX_VIOLATIONS ? 'rgba(239,68,68,0.1)' : violations > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.08)', border: `1px solid ${violations >= MAX_VIOLATIONS ? 'rgba(239,68,68,0.3)' : violations > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.25)'}` }}>
            <span style={{ fontSize: '1.6rem' }}>{violations >= MAX_VIOLATIONS ? '🚨' : violations > 0 ? '⚠️' : '✅'}</span>
            <p style={{ color: T.text, fontWeight: 700, margin: 0, fontSize: '.85rem' }}>Anti-Cheat Status</p>
            <p style={{ color: violations >= 2 ? T.danger : violations > 0 ? T.warning : T.success, fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>
              {violations}/{MAX_VIOLATIONS} Violations
            </p>
            <p style={{ color: T.textMuted, fontSize: '.7rem', margin: 0 }}>{MAX_VIOLATIONS - violations} strike(s) remaining</p>
          </div>

          <div style={S.paletteCard}>
            <p style={{ color: T.textMuted, fontSize: '.7rem', fontWeight: 700, letterSpacing: '1px', marginBottom: 10 }}>QUESTION PALETTE</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {questions.map((q, i) => {
                const done = !!answers[q._id];
                return (
                  <div
                    key={q._id}
                    style={{ ...S.paletteDot, background: done ? T.success : T.surfaceAlt, color: done ? '#fff' : T.text, border: `1px solid ${done ? T.success : T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => {
                      const el = document.getElementById(`q-${q._id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                  >{i + 1}</div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: '.7rem', color: T.textMuted }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: T.success, borderRadius: 2, marginRight: 4 }} />Answered</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 2, marginRight: 4 }} />Not Answered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Overlay */}
      {showWarn && (
        <div style={S.warnOverlay}>
          <div style={{ ...S.warnBox, borderColor: violations >= MAX_VIOLATIONS ? T.danger : T.warning }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{violations >= MAX_VIOLATIONS ? '🚨' : '⚠️'}</div>
            <p style={{ color: T.text, fontWeight: 600, textAlign: 'center', whiteSpace: 'pre-line', marginBottom: 20 }}>{warnMsg}</p>
            {violations < MAX_VIOLATIONS && (
              <button style={S.submitBtn} onClick={() => setShowWarn(false)}>I Understand</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  page: {
    minHeight: '100vh', height: '100vh',
    background: T.bg,
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    userSelect: 'none', overflow: 'hidden', position: 'relative',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px', background: T.surface,
    borderBottom: `1px solid ${T.border}`,
    flexShrink: 0, zIndex: 10, flexWrap: 'wrap', gap: 8,
    boxShadow: '0 2px 12px rgba(124,92,255,0.05)',
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  logoText: { fontSize: '1.15rem', fontWeight: 800, color: T.primary, letterSpacing: '.5px' },
  examTitleBadge: {
    background: T.surfaceAlt, border: `1px solid ${T.border}`,
    color: T.primary, fontSize: '.8rem', fontWeight: 600,
    padding: '4px 14px', borderRadius: 50,
  },
  timer: { textAlign: 'center', borderRadius: 12, padding: '6px 20px', minWidth: 120 },
  topRight: { display: 'flex', alignItems: 'center', gap: 12 },
  userChip: { display: 'flex', alignItems: 'center', gap: 10 },
  userAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: `linear-gradient(135deg, ${T.primary}, ${T.primarySoft})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: '1rem',
  },
  strikeBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '4px 14px', borderRadius: 10, border: '1px solid', minWidth: 80,
  },
  progressTrack: { height: 4, background: T.surfaceAlt, flexShrink: 0 },
  progressFill: { height: '100%', background: `linear-gradient(90deg, ${T.primary}, ${T.success})`, transition: 'width 0.5s ease' },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  questionPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: `1px solid ${T.border}` },
  panelHeader: { padding: '12px 24px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.surface },
  questionScroll: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  qCard: {
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: '20px 22px', marginBottom: 20,
    boxShadow: '0 4px 12px -8px rgba(124,92,255,0.15)',
    transition: 'border-left-color 0.3s',
  },
  qNumber: { fontSize: '.72rem', fontWeight: 700, color: T.primary, letterSpacing: '1px', marginBottom: 8 },
  qText: { color: T.text, fontWeight: 600, fontSize: '1rem', lineHeight: 1.6, marginBottom: 16 },
  optionsList: { display: 'flex', flexDirection: 'column', gap: 10 },
  optionLabel: { display: 'flex', alignItems: 'center', gap: 12, borderRadius: 10, padding: '12px 16px', transition: 'all .2s' },
  optionDot: { width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' },
  submitBtn: {
    background: `linear-gradient(135deg, ${T.success}, #16a34a)`,
    border: 'none', color: '#fff', fontWeight: 800,
    fontSize: '1rem', padding: '14px 48px',
    borderRadius: 12, cursor: 'pointer',
    boxShadow: '0 10px 24px -8px rgba(34,197,94,0.5)',
    letterSpacing: '.3px',
  },
  sidebar: {
    width: 280, flexShrink: 0, background: T.surface,
    overflowY: 'auto', padding: 16,
    display: 'flex', flexDirection: 'column', gap: 14,
    borderLeft: `1px solid ${T.border}`,
  },
  sideCard: {
    background: T.surfaceAlt, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: 16,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  sideAvatarBig: {
    width: 52, height: 52, borderRadius: '50%',
    background: `linear-gradient(135deg, ${T.primary}, ${T.primarySoft})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: '1.4rem',
  },
  cameraCard: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 },
  paletteCard: { background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 },
  paletteDot: { height: 32, borderRadius: 8, fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' },
  warnOverlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(42,36,64,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(6px)',
  },
  warnBox: {
    background: T.surface, border: '2px solid',
    borderRadius: 20, padding: '40px 48px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    maxWidth: 460, width: '90%',
    boxShadow: '0 30px 80px rgba(42,36,64,0.3)',
  },
  watermarkOverlay: {
    position: 'absolute', inset: 0, zIndex: 1,
    pointerEvents: 'none', overflow: 'hidden',
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 40, padding: 40, opacity: 0.06,
    transform: 'rotate(-15deg)', transformOrigin: 'center center',
  },
  watermarkText: { color: T.primary, fontSize: '1.5rem', fontWeight: 800, whiteSpace: 'nowrap', userSelect: 'none' },
};

export default ExamArena;
