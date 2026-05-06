import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────
   PROCTORED EXAM ARENA
   Anti-cheat features:
     • Fullscreen lock (exit = violation)
     • Tab / window visibility lock (blur = violation)
     • Copy / paste / right-click disabled
     • History.back() blocked
     • Webcam feed displayed (bottom-right)
     • face-api.js face detection:
         – no face detected = violation
         – multiple faces  = violation
     • 3-strike system → auto-submit on 3rd strike
   ───────────────────────────────────────────────────────── */

const MAX_VIOLATIONS = 3;

/* ── Tiny helper: load a <script> tag once ── */
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
  const navigate   = useNavigate();
  const user       = JSON.parse(localStorage.getItem('user') || '{}');

  /* ── Exam data ── */
  const [exam,      setExam]      = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState({});
  const answersRef  = useRef({});
  const [timeLeft,  setTimeLeft]  = useState(0);

  /* ── Anti-cheat state ── */
  const [violations, setViolations] = useState(0);
  const [warnMsg,    setWarnMsg]    = useState('');
  const [showWarn,   setShowWarn]   = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const violationsRef = useRef(0); // sync ref for async callbacks

  /* ── Camera / face detection ── */
  const videoRef           = useRef(null);
  const faceDetectInterval = useRef(null);
  const [faceStatus, setFaceStatus] = useState('Initializing...');
  const faceApiLoaded      = useRef(false);
  const streamRef          = useRef(null);

  /* ── Misc refs ── */
  const timerRef    = useRef(null);
  const submittedRef = useRef(false);

  // ================================================================
  //  SUBMIT (called by timer expiry, violations, or manual button)
  // ================================================================
  const submitExam = useCallback(async (reason = 'manual') => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setAutoSubmitted(true);

    // Clean up
    clearInterval(timerRef.current);
    clearInterval(faceDetectInterval.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    // Exit fullscreen
    try { if (document.exitFullscreen) document.exitFullscreen(); } catch (_) {}
    // Re-enable right-click / copy
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
    } catch (err) {
      console.error('Submit error', err);
    }

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

  // ================================================================
  //  VIOLATION HANDLER
  // ================================================================
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

  // ================================================================
  //  ANTI-CHEAT: Fullscreen, Tab-switch, Copy/Paste, Back
  // ================================================================
  useEffect(() => {
    /* ── Block Back navigation ── */
    window.history.pushState(null, '', window.location.href);
    const blockBack = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', blockBack);

    /* ── Block copy / paste / right-click ── */
    document.oncontextmenu = e => e.preventDefault();
    document.oncopy  = e => e.preventDefault();
    document.onpaste = e => e.preventDefault();
    document.oncut   = e => e.preventDefault();
    document.addEventListener('keydown', blockKeys);

    /* ── Tab-switch / window blur ── */
    const handleBlur = () => {
      if (!submittedRef.current)
        triggerViolation('Tab switching or window focus lost detected.');
    };
    const handleVisibility = () => {
      if (document.hidden && !submittedRef.current)
        triggerViolation('You switched to another tab or application.');
    };
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    /* ── Fullscreen exit ── */
    const handleFsChange = () => {
      if (!document.fullscreenElement && !submittedRef.current)
        triggerViolation('Fullscreen was exited. Please stay in fullscreen mode.');
    };
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
    // Block Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X, Ctrl+P, Ctrl+S, F12, etc.
    if ((e.ctrlKey || e.metaKey) && ['c','v','a','x','p','s','u'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
    if (['F12','F5'].includes(e.key)) e.preventDefault();
  }

  // ================================================================
  //  FETCH EXAM DATA
  // ================================================================
  useEffect(() => {
    if (user.role !== 'student') { navigate('/'); return; }

    const fetchExamData = async () => {
      try {
        // 1. Check if user already submitted this exam
        try {
          const checkRes = await axios.get(`http://localhost:5000/api/results/student/${user.id}`);
          const hasAttempted = checkRes.data.some(r => r.examId._id === examId);
          if (hasAttempted) {
            toast.error('🚫 Access Denied: You have already submitted this exam.', { duration: 5000 });
            navigate('/dashboard');
            return;
          }
        } catch (err) { console.error("Result check failed", err); }

        // 2. Fetch Exam and Questions
        const [examsRes, qRes] = await Promise.all([
          axios.get('http://localhost:5000/api/exams'),
          axios.get(`http://localhost:5000/api/questions/exam/${examId}`),
        ]);
        
        const current = examsRes.data.find(e => e._id === examId);
        setExam(current);
        if (current) setTimeLeft(current.durationMinutes * 60);

        // 3. Shuffle Questions randomly
        const shuffled = qRes.data.sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      } catch (err) { console.error(err); }
    };
    fetchExamData();
  }, [examId, navigate, user.role, user.id]);

  // ================================================================
  //  COUNTDOWN TIMER
  // ================================================================
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

  // ================================================================
  //  WEBCAM + FACE DETECTION
  // ================================================================
  useEffect(() => {
    let alive = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        // Load face-api.js from CDN (Unified maintained version)
        await loadScript('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js');

        if (!alive) return;
        const faceapi = window.faceapi;

        // Load tiny models from a reliable weights source
        const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';
        
        setFaceStatus('Loading Models...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        ]);
        
        faceApiLoaded.current = true;
        setFaceStatus('Active');

        // Start detection loop every 3 seconds
        faceDetectInterval.current = setInterval(async () => {
          if (!alive || submittedRef.current || !videoRef.current || !faceApiLoaded.current) return;
          try {
            const detections = await faceapi.detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4, inputSize: 224 })
            );
            if (detections.length === 0) {
              triggerViolation('No face detected in camera! Please ensure your face is clearly visible.');
            } else if (detections.length > 1) {
              triggerViolation(`Multiple faces detected (${detections.length}). Exam violation! Only you must be in the frame.`);
            }
          } catch (_) {}
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

  // ================================================================
  //  HELPERS
  // ================================================================
  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const answered = Object.keys(answers).length;
  const total    = questions.length;
  const progress = total > 0 ? (answered / total) * 100 : 0;
  const pct      = timeLeft / ((exam?.durationMinutes ?? 1) * 60);
  const timerRed = pct < 0.15;

  if (!exam) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#a0aec0', fontSize: '1.2rem' }}>Loading exam...</div>
      </div>
    );
  }

  // Generate watermark array for grid display
  const watermarkText = `${user.name || 'Candidate'} - ${user.email} - IP Cached`;
  const watermarks = Array(20).fill(watermarkText);

  return (
    <div style={S.page} onContextMenu={e => e.preventDefault()}>

      {/* ══════════ WATERMARK OVERLAY (Anti-Screenshot/DRM) ══════════ */}
      <div style={S.watermarkOverlay}>
        {watermarks.map((text, i) => (
          <div key={i} style={S.watermarkText}>{text}</div>
        ))}
      </div>

      {/* ══════════ TOP BAR ══════════ */}
      <div style={S.topBar}>
        <div style={S.topLeft}>
          <span style={S.logoText}>CDAC <span style={{ color: '#667eea' }}>ExamWeb</span></span>
          <span style={S.examTitleBadge}>{exam.title}</span>
        </div>

        {/* Timer */}
        <div style={{ ...S.timer, background: timerRed ? 'rgba(252,129,129,0.15)' : 'rgba(102,126,234,0.15)', border: `1px solid ${timerRed ? '#fc8181' : '#667eea'}44` }}>
          <span style={{ fontSize: '0.7rem', color: '#718096', fontWeight: 700, letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>TIME LEFT</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: timerRed ? '#fc8181' : '#f7fafc', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* User + Violations */}
        <div style={S.topRight}>
          <div style={S.userChip}>
            <div style={S.userAvatar}>{(user.name || 'S')[0].toUpperCase()}</div>
            <div>
              <div style={{ color: '#f7fafc', fontWeight: 700, fontSize: '0.88rem' }}>{user.name || 'Student'}</div>
              <div style={{ color: '#718096', fontSize: '0.72rem' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ ...S.strikeBadge, background: violations > 0 ? 'rgba(252,129,129,0.2)' : 'rgba(72,187,120,0.15)', borderColor: violations > 0 ? '#fc818166' : '#48bb7866' }}>
            <span style={{ fontSize: '0.65rem', color: '#718096', fontWeight: 700, letterSpacing: '1px' }}>VIOLATIONS</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: violations >= 3 ? '#fc8181' : violations > 0 ? '#f6ad55' : '#48bb78' }}>
              {violations}/{MAX_VIOLATIONS}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════ PROGRESS BAR ══════════ */}
      <div style={S.progressTrack}>
        <div style={{ ...S.progressFill, width: `${progress}%` }} />
      </div>

      {/* ══════════ MAIN BODY ══════════ */}
      <div style={S.body}>

        {/* ── Question Panel ── */}
        <div style={S.questionPanel}>
          <div style={S.panelHeader}>
            <span style={{ color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600 }}>
              {answered}/{total} Answered
            </span>
          </div>

          <div style={S.questionScroll}>
            {questions.map((q, idx) => {
              const sel = answers[q._id];
              return (
                <div key={q._id} id={`q-${q._id}`} style={{ ...S.qCard, borderLeft: sel ? '4px solid #48bb78' : '4px solid rgba(255,255,255,0.08)' }}>
                  <div style={S.qNumber}>Q{idx + 1}</div>
                  <div style={S.qText}>{q.text}</div>
                  {q.imageUrl && (
                    <img
                      src={`http://localhost:5000${q.imageUrl}`}
                      alt="question"
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', margin: '10px 0', objectFit: 'contain' }}
                    />
                  )}
                  <div style={S.optionsList}>
                    {q.options.map((opt, oIdx) => {
                      const isSelected = sel === opt.text;
                      return (
                        <label key={oIdx} style={{ ...S.optionLabel, background: isSelected ? 'rgba(102,126,234,0.2)' : 'rgba(255,255,255,0.04)', border: isSelected ? '1.5px solid #667eea' : '1.5px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                          <div style={{ ...S.optionDot, background: isSelected ? '#667eea' : 'transparent', border: isSelected ? '2px solid #667eea' : '2px solid rgba(255,255,255,0.25)' }}>
                            {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                          </div>
                          <input
                            type="radio"
                            name={`q-${q._id}`}
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
                          <span style={{ color: isSelected ? '#e2e8f0' : '#a0aec0', fontSize: '0.92rem' }}>{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Submit Button */}
            <div style={{ textAlign: 'center', padding: '32px 0 16px' }}>
              <button
                style={S.submitBtn}
                onClick={() => { if (window.confirm(`Submit exam? You've answered ${answered}/${total} questions.`)) submitExam('manual'); }}
              >
                ✓ Submit Exam
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar: User + Camera + Question Palette ── */}
        <div style={S.sidebar}>

          {/* User Card */}
          <div style={S.sideCard}>
            <div style={S.sideAvatarBig}>{(user.name || 'S')[0].toUpperCase()}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#f7fafc', fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</div>
              <div style={{ color: '#718096', fontSize: '0.78rem', marginTop: '2px' }}>{user.email}</div>
            </div>
          </div>

          {/* Camera Feed */}
          <div style={S.cameraCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: faceStatus === 'Active' ? '#48bb78' : '#ed8936', boxShadow: faceStatus === 'Active' ? '0 0 6px #48bb78' : 'none' }} />
                <span style={{ color: '#718096', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px' }}>PROCTOR: {faceStatus}</span>
              </div>
            </div>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', borderRadius: '10px', background: '#111', minHeight: '120px', objectFit: 'cover', border: faceStatus === 'Active' ? '1px solid #48bb7833' : '1px solid #ed893633' }}
            />
            <div style={{ textAlign: 'center', marginTop: '6px', color: '#718096', fontSize: '0.7rem' }}>
              Keep your face clearly visible
            </div>
          </div>

          {/* Violation Status */}
          <div style={{ ...S.sideCard, background: violations >= MAX_VIOLATIONS ? 'rgba(252,129,129,0.15)' : violations > 0 ? 'rgba(246,173,85,0.12)' : 'rgba(72,187,120,0.12)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>
                {violations >= MAX_VIOLATIONS ? '🚨' : violations > 0 ? '⚠️' : '✅'}
              </div>
              <div style={{ color: '#f7fafc', fontWeight: 700, fontSize: '0.88rem' }}>Anti-Cheat Status</div>
              <div style={{ color: violations >= 2 ? '#fc8181' : violations > 0 ? '#f6ad55' : '#48bb78', fontWeight: 800, fontSize: '1.1rem', marginTop: '4px' }}>
                {violations}/{MAX_VIOLATIONS} Violations
              </div>
              <div style={{ color: '#718096', fontSize: '0.72rem', marginTop: '4px' }}>
                {MAX_VIOLATIONS - violations} strike(s) remaining
              </div>
            </div>
          </div>

          {/* Question Palette */}
          <div style={S.paletteCard}>
            <div style={{ color: '#a0aec0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>
              QUESTION PALETTE
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {questions.map((q, i) => {
                const done = !!answers[q._id];
                return (
                  <button
                    key={q._id}
                    style={{ ...S.paletteDot, background: done ? '#48bb78' : 'rgba(255,255,255,0.08)', border: done ? 'none' : '1px solid rgba(255,255,255,0.15)', color: done ? '#fff' : '#718096' }}
                    onClick={() => {
                      const el = document.getElementById(`q-${q._id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '12px', fontSize: '0.72rem', color: '#718096' }}>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#48bb78', marginRight: '4px' }} />Answered</span>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', marginRight: '4px' }} />Not Answered</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ VIOLATION WARNING OVERLAY ══════════ */}
      {showWarn && (
        <div style={S.warnOverlay}>
          <div style={{ ...S.warnBox, borderColor: violations >= MAX_VIOLATIONS ? '#fc8181' : '#f6ad55' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
              {violations >= MAX_VIOLATIONS ? '🚨' : '⚠️'}
            </div>
            <div style={{ color: '#f7fafc', fontWeight: 800, fontSize: '1.05rem', whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1.6 }}>
              {warnMsg}
            </div>
            {violations < MAX_VIOLATIONS && (
              <button
                style={{ marginTop: '16px', background: '#f6ad55', border: 'none', color: '#1a1a1a', fontWeight: 700, padding: '10px 28px', borderRadius: '10px', cursor: 'pointer' }}
                onClick={() => setShowWarn(false)}
              >
                I Understand
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        ::selection { background: transparent; }
      `}</style>
    </div>
  );
};

/* ─── Styles ─── */
const S = {
  page: {
    minHeight: '100vh', height: '100vh',
    background: 'linear-gradient(135deg, #0d0d1a 0%, #111132 100%)',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    userSelect: 'none', overflow: 'hidden',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    flexShrink: 0, zIndex: 10, flexWrap: 'wrap', gap: '8px',
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  logoText: { fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' },
  examTitleBadge: {
    background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.3)',
    color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600,
    padding: '4px 14px', borderRadius: '50px',
  },
  timer: {
    textAlign: 'center', borderRadius: '12px', padding: '6px 20px', minWidth: '120px',
  },
  topRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userChip: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: '1rem',
  },
  strikeBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '4px 14px', borderRadius: '10px', border: '1px solid',
    minWidth: '80px',
  },

  progressTrack: {
    height: '4px', background: 'rgba(255,255,255,0.06)', flexShrink: 0,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #48bb78)',
    transition: 'width 0.5s ease',
  },

  body: {
    flex: 1, display: 'flex', overflow: 'hidden',
  },

  questionPanel: {
    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  panelHeader: {
    padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
  },
  questionScroll: {
    flex: 1, overflowY: 'auto', padding: '20px 24px',
  },
  qCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px', padding: '20px 22px', marginBottom: '20px',
    transition: 'border-left-color 0.3s',
  },
  qNumber: {
    fontSize: '0.72rem', fontWeight: 700, color: '#667eea',
    letterSpacing: '1px', marginBottom: '8px',
  },
  qText: { color: '#f7fafc', fontWeight: 600, fontSize: '1rem', lineHeight: 1.6, marginBottom: '16px' },
  optionsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionLabel: {
    display: 'flex', alignItems: 'center', gap: '12px',
    borderRadius: '10px', padding: '12px 16px',
    transition: 'all 0.2s',
  },
  optionDot: {
    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #48bb78, #38a169)',
    border: 'none', color: '#fff', fontWeight: 800,
    fontSize: '1rem', padding: '14px 48px',
    borderRadius: '12px', cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(72,187,120,0.35)',
    letterSpacing: '0.3px',
  },

  sidebar: {
    width: '260px', flexShrink: 0,
    background: 'rgba(255,255,255,0.02)',
    overflowY: 'auto', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  sideCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px', padding: '16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
  },
  sideAvatarBig: {
    width: '52px', height: '52px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: '1.4rem',
  },
  cameraCard: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(72,187,120,0.25)',
    borderRadius: '14px', padding: '14px',
  },
  paletteCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px', padding: '14px',
  },
  paletteDot: {
    width: '32px', height: '32px', borderRadius: '8px',
    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.2s',
  },

  warnOverlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(6px)',
  },
  warnBox: {
    background: '#1a1a2e',
    border: '2px solid',
    borderRadius: '20px', padding: '40px 48px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    maxWidth: '460px', width: '90%',
    boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
  },

  watermarkOverlay: {
    position: 'absolute', inset: 0, zIndex: 9998,
    pointerEvents: 'none', overflow: 'hidden',
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '40px', padding: '40px', opacity: 0.05,
    transform: 'rotate(-15deg)', transformOrigin: 'center center',
  },
  watermarkText: {
    color: '#fff', fontSize: '1.5rem', fontWeight: 800,
    whiteSpace: 'nowrap', userSelect: 'none',
  },
};

export default ExamArena;
