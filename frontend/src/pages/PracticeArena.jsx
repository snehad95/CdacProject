import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronLeft, ChevronRight, X, LayoutGrid,
  CheckCircle2, HelpCircle, ArrowRight, Circle, Dot
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PracticeArena = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/test');
      return;
    }

    const loadQuestions = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/practice-tests');
        const practiceTest = res.data.find(t => t.title === decodeURIComponent(category));
        if (!practiceTest) {
          toast.error("Practice test category not found");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const qRes = await axios.get(`http://localhost:5000/api/questions/practice-test/${practiceTest._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setQuestions(qRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading practice questions", err);
        toast.error("Failed to load questions");
        setLoading(false);
      }
    };

    loadQuestions();
  }, [category, navigate]);

  const handleOptionClick = (optIdx) => {
    setAnswers({ ...answers, [currentIdx]: optIdx });
    if (currentIdx < questions.length - 1) {
      setTimeout(() => setCurrentIdx(prev => prev + 1), 280);
    }
  };

  const handleNext = () => { if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1); };
  const handlePrev = () => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (q.type === 'subjective') return;
      const correctIdx = q.options.findIndex(o => o.isCorrect);
      if (answers[i] === correctIdx) score++;
    });
    return score;
  };

  const submitTest = async () => {
    const score = calculateScore();
    const resultData = {
      _id: `practice_${Date.now()}`,
      userId: user.id,
      isPractice: true,
      category: decodeURIComponent(category),
      score,
      totalQuestions: questions.length,
      submittedAt: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem('practiceResults') || '[]');
    existing.push(resultData);
    localStorage.setItem('practiceResults', JSON.stringify(existing));
    setShowSubmitModal(false);
    setShowResult(true);
  };

  if (loading) {
    return (
      <div style={{ ...styles.pageWrap, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--cdac-text-muted)', fontWeight: 500 }}>Loading practice session...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ ...styles.pageWrap, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <HelpCircle size={48} color="#7c5cff" className="mb-3" />
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No Questions Available</h3>
          <p style={{ color: 'var(--cdac-text-muted)', fontSize: 14, marginBottom: 24 }}>
            There are no questions explicitly added to this practice test category yet. Please check back later or contact your administrator.
          </p>
          <button style={styles.backBtn} onClick={() => navigate('/test')}>
            Back to Test Portal
          </button>
        </div>
      </div>
    );
  }

  const isMobile = windowWidth < 900;
  const attemptedCount = Object.keys(answers).length;
  const progress = ((currentIdx + 1) / questions.length) * 100;

  if (showResult) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 40;
    return (
      <div style={resultStyles.page}>
        <motion.div
          style={resultStyles.card}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div style={resultStyles.iconWrap}>
            <CheckCircle2 size={36} color="#fff" />
          </div>
          <p style={resultStyles.eyebrow}>Session Complete</p>
          <h1 style={resultStyles.title}>Practice Summary</h1>
          <p style={resultStyles.subtitle}>
            {decodeURIComponent(category || 'General')} — performance overview
          </p>

          <div style={resultStyles.scoreGrid}>
            <div style={resultStyles.scoreCell}>
              <p style={resultStyles.cellLabel}>Score</p>
              <p style={resultStyles.cellValue}>{score}<span style={resultStyles.cellMuted}>/{questions.length}</span></p>
            </div>
            <div style={resultStyles.divider} />
            <div style={resultStyles.scoreCell}>
              <p style={resultStyles.cellLabel}>Accuracy</p>
              <p style={{ ...resultStyles.cellValue, color: passed ? '#16a34a' : '#dc2626' }}>{percentage}%</p>
            </div>
            <div style={resultStyles.divider} />
            <div style={resultStyles.scoreCell}>
              <p style={resultStyles.cellLabel}>Attempted</p>
              <p style={resultStyles.cellValue}>{attemptedCount}</p>
            </div>
          </div>

          <button style={resultStyles.goBtn} onClick={() => navigate('/test')}>
            Back to Test Portal
            <ArrowRight size={18} style={{ marginLeft: 10 }} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrap}>
      {/* TOP BAR */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={() => navigate('/test')}>
            <ChevronLeft size={18} />
            <span>Exit</span>
          </button>
          <div style={styles.brandDivider} />
          <div>
            <p style={styles.eyebrow}>Practice Session</p>
            <p style={styles.subject}>{decodeURIComponent(category || 'General Assessment')}</p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.statPill}>
            <Dot size={18} color="#16a34a" style={{ margin: -6 }} />
            <span style={styles.statText}>{attemptedCount}/{questions.length} answered</span>
          </div>
          <div style={styles.userPill}>
            <div style={styles.userAvatar}><User size={16} color="#fff" /></div>
            {windowWidth > 520 && <span style={styles.userName}>{user.name || 'Student'}</span>}
          </div>
          <button
            style={{ ...styles.toggleBtn, background: isPaletteOpen ? 'var(--cdac-surface-alt)' : '#7c5cff', color: isPaletteOpen ? '#7c5cff' : '#fff' }}
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            aria-label="Toggle question palette"
          >
            {isPaletteOpen ? <X size={18} /> : <LayoutGrid size={18} />}
          </button>
        </div>
      </header>

      {/* PROGRESS */}
      <div style={styles.progressTrack}>
        <motion.div
          style={styles.progressBar}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* MAIN */}
      <div style={styles.mainContainer}>
        <div className="notranslate" style={{
          ...styles.questionArea,
          maxWidth: (isPaletteOpen && !isMobile) ? 'calc(100% - 340px)' : '880px',
          margin: (isPaletteOpen && !isMobile) ? '0 340px 0 auto' : '0 auto'
        }}>
          <div style={styles.questionCard}>
            <div style={styles.qMeta}>
              <span style={styles.qBadge}>Question {currentIdx + 1}</span>
              <span style={styles.qMetaSep}>of {questions.length}</span>
            </div>
            <p style={styles.qText}>{questions[currentIdx].title ? `${questions[currentIdx].title}: ` : ''}{questions[currentIdx].text}</p>
            {questions[currentIdx].type === 'coding' && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                {questions[currentIdx].description && (
                  <div style={{ marginBottom: '12px', fontSize: '14px', color: '#334155', whiteSpace: 'pre-wrap' }}>{questions[currentIdx].description}</div>
                )}
                {questions[currentIdx].constraints && (
                  <div style={{ marginBottom: '8px', fontSize: '13px' }}><strong>Constraints: </strong><code>{questions[currentIdx].constraints}</code></div>
                )}
                {questions[currentIdx].sampleInput && (
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', marginTop: '8px' }}>
                    <div style={{ flex: 1, background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong>Sample Input:</strong><pre style={{ margin: '4px 0 0', fontSize: '12px' }}>{questions[currentIdx].sampleInput}</pre>
                    </div>
                    <div style={{ flex: 1, background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong>Sample Output:</strong><pre style={{ margin: '4px 0 0', fontSize: '12px' }}>{questions[currentIdx].sampleOutput}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {(questions[currentIdx].type === 'subjective' || questions[currentIdx].type === 'coding') ? (
            <div style={{ marginBottom: 32 }}>
              {questions[currentIdx].type === 'coding' && (
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>WRITE YOUR PROGRAM BELOW:</div>
              )}
              <textarea
                rows={10}
                placeholder={questions[currentIdx].type === 'coding' ? "// Write your code here..." : "Type your subjective response here..."}
                value={answers[currentIdx] || ''}
                onChange={e => {
                  setAnswers({ ...answers, [currentIdx]: e.target.value });
                }}
                style={{
                  width: '100%',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '16px 18px',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: 14,
                  background: '#1e1e1e',
                  color: '#d4d4d4',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          ) : (
            <div style={styles.optionsGrid}>
              {questions[currentIdx].options.map((opt, i) => {
                const selected = answers[currentIdx] === i;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleOptionClick(i)}
                    style={{
                      ...styles.optionBox,
                      borderColor: selected ? '#7c5cff' : '#e5e7eb',
                      background: selected ? 'var(--cdac-surface-alt)' : '#fff',
                      boxShadow: selected ? '0 6px 18px rgba(79,70,229,0.12)' : '0 1px 2px rgba(15,23,42,0.04)'
                    }}
                  >
                    <div style={{
                      ...styles.optLetter,
                      background: selected ? '#7c5cff' : 'var(--cdac-bg)',
                      color: selected ? '#fff' : 'var(--cdac-text-muted)',
                      borderColor: selected ? '#7c5cff' : '#e5e7eb'
                    }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span style={{ color: selected ? '#1e1b4b' : '#1f2937' }}>{opt.text}</span>
                    {selected && <CheckCircle2 size={18} color="#7c5cff" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  </motion.button>
                );
              })}
            </div>
          )}

          <div style={styles.navRow}>
            <button
              style={{ ...styles.navBtn, visibility: currentIdx === 0 ? 'hidden' : 'visible' }}
              onClick={handlePrev}
            >
              <ChevronLeft size={16} style={{ marginRight: 6 }} /> Previous
            </button>

            {currentIdx === questions.length - 1 ? (
              <button style={styles.submitTestBtn} onClick={() => setShowSubmitModal(true)}>
                Submit Test <ArrowRight size={16} style={{ marginLeft: 8 }} />
              </button>
            ) : (
              <button style={styles.navBtnPrimary} onClick={handleNext}>
                Next <ChevronRight size={16} style={{ marginLeft: 6 }} />
              </button>
            )}
          </div>
        </div>

        {/* PALETTE */}
        <AnimatePresence>
          {isPaletteOpen && (
            <motion.aside
              style={{
                ...styles.palette,
                position: isMobile ? 'fixed' : 'fixed',
                top: isMobile ? 88 : 96,
                right: isMobile ? 12 : 24,
                bottom: isMobile ? 12 : 24,
              }}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div style={styles.paletteHeader}>
                <p style={styles.paletteTitle}>Question Navigator</p>
                <span style={styles.paletteCount}>{attemptedCount}/{questions.length}</span>
              </div>

              <div style={styles.paletteGrid}>
                {questions.map((_, i) => {
                  const isCurrent = currentIdx === i;
                  const isAnswered = answers[i] !== undefined;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentIdx(i);
                        if (isMobile) setIsPaletteOpen(false);
                      }}
                      style={{
                        ...styles.paletteBox,
                        background: isCurrent ? '#7c5cff' : isAnswered ? '#dcfce7' : '#fff',
                        color: isCurrent ? '#fff' : isAnswered ? '#15803d' : 'var(--cdac-text-muted)',
                        borderColor: isCurrent ? '#7c5cff' : isAnswered ? '#bbf7d0' : '#e5e7eb',
                      }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div style={styles.legend}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.swatch, background: '#7c5cff' }} />
                  <span>Current</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.swatch, background: '#dcfce7', border: '1px solid #bbf7d0' }} />
                  <span>Answered</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.swatch, background: 'var(--cdac-surface)', border: '1px solid #e5e7eb' }} />
                  <span>Unanswered</span>
                </div>
              </div>

              <button style={styles.paletteSubmit} onClick={() => setShowSubmitModal(true)}>
                Submit Test
              </button>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* SUBMIT MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <div style={styles.modalOverlay}>
            <motion.div
              style={styles.modal}
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
            >
              <div style={styles.modalIcon}>
                <HelpCircle size={28} color="#7c5cff" />
              </div>
              <h2 style={styles.modalTitle}>Submit your test?</h2>
              <p style={styles.modalText}>
                You've answered {attemptedCount} of {questions.length} questions. Once submitted, answers cannot be changed.
              </p>
              <div style={styles.modalActions}>
                <button style={styles.modalCancel} onClick={() => setShowSubmitModal(false)}>Keep reviewing</button>
                <button style={styles.modalSubmit} onClick={submitTest}>Confirm submit</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const styles = {
  pageWrap: {
    minHeight: '100vh',
    background: 'var(--cdac-bg)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: FONT,
    color: 'var(--cdac-text)'
  },
  header: {
    padding: '14px 24px',
    background: 'var(--cdac-surface)',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '8px 12px', borderRadius: 8,
    border: '1px solid #e5e7eb', background: 'var(--cdac-surface)',
    color: 'var(--cdac-text-muted)', fontWeight: 600, fontSize: 13,
    cursor: 'pointer', fontFamily: FONT
  },
  brandDivider: { width: 1, height: 28, background: '#e5e7eb' },
  eyebrow: {
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--cdac-text-muted)', margin: 0
  },
  subject: { fontSize: 15, fontWeight: 700, color: 'var(--cdac-text)', margin: 0, marginTop: 2 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  statPill: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '7px 12px', borderRadius: 999,
    background: 'var(--cdac-surface-alt)', border: '1px solid var(--cdac-border)'
  },
  statText: { fontSize: 12, fontWeight: 600, color: 'var(--cdac-text)' },
  userPill: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--cdac-surface)', padding: '5px 14px 5px 5px',
    borderRadius: 999, border: '1px solid #e5e7eb'
  },
  userName: { fontWeight: 600, fontSize: 13, color: 'var(--cdac-text)' },
  userAvatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'linear-gradient(135deg,#7c5cff,#6a41e6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  toggleBtn: {
    width: 38, height: 38, borderRadius: 10, border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all .15s ease'
  },
  progressTrack: { height: 3, background: '#e5e7eb' },
  progressBar: { height: '100%', background: 'linear-gradient(90deg,#7c5cff,#6a41e6)' },

  mainContainer: {
    flex: 1, display: 'flex', padding: '32px 24px',
    position: 'relative'
  },
  questionArea: {
    flex: 1, display: 'flex', flexDirection: 'column',
    transition: 'all .25s cubic-bezier(.4,0,.2,1)',
    width: '100%'
  },
  questionCard: {
    background: 'var(--cdac-surface)',
    padding: '28px 32px',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
    marginBottom: 20,
  },
  qMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  qBadge: {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#7c5cff',
    background: 'var(--cdac-surface-alt)', padding: '4px 10px', borderRadius: 6
  },
  qMetaSep: { fontSize: 12, color: '#94a3b8', fontWeight: 500 },
  qText: {
    fontSize: 'clamp(1.05rem, 1.6vw, 1.25rem)',
    fontWeight: 600, color: 'var(--cdac-text)',
    lineHeight: 1.55, margin: 0
  },

  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    marginBottom: 32
  },

  optionBox: {
    padding: '16px 18px', borderRadius: 12,
    border: '1.5px solid #e5e7eb',
    display: 'flex', alignItems: 'center', gap: 14,
    fontSize: 14, fontWeight: 500, textAlign: 'left',
    cursor: 'pointer', transition: 'all .15s ease',
    fontFamily: FONT, lineHeight: 1.5
  },
  optLetter: {
    width: 30, height: 30, borderRadius: 8,
    border: '1.5px solid #e5e7eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, flexShrink: 0,
    transition: 'all .15s ease'
  },
  navRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 'auto', paddingTop: 8
  },
  navBtn: {
    display: 'flex', alignItems: 'center',
    background: 'var(--cdac-surface)', border: '1px solid #e5e7eb',
    padding: '10px 18px', borderRadius: 10,
    color: 'var(--cdac-text-muted)', fontWeight: 600, fontSize: 13,
    cursor: 'pointer', fontFamily: FONT
  },
  navBtnPrimary: {
    display: 'flex', alignItems: 'center',
    background: 'var(--cdac-text)', border: 'none',
    padding: '11px 20px', borderRadius: 10,
    color: '#fff', fontWeight: 600, fontSize: 13,
    cursor: 'pointer', fontFamily: FONT
  },
  submitTestBtn: {
    display: 'flex', alignItems: 'center',
    background: 'linear-gradient(135deg,#7c5cff,#6a41e6)',
    border: 'none', padding: '12px 26px', borderRadius: 10,
    color: '#fff', fontWeight: 700, fontSize: 13.5,
    boxShadow: '0 6px 16px rgba(79,70,229,.25)',
    cursor: 'pointer', fontFamily: FONT
  },

  palette: {
    width: 300,
    background: 'var(--cdac-surface)',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 30px rgba(15,23,42,.06)',
    padding: 20,
    display: 'flex', flexDirection: 'column',
    zIndex: 50,
    overflowY: 'auto'
  },
  paletteHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16
  },
  paletteTitle: { fontSize: 13, fontWeight: 700, color: 'var(--cdac-text)', margin: 0 },
  paletteCount: {
    fontSize: 11, fontWeight: 600, color: '#7c5cff',
    background: 'var(--cdac-surface-alt)', padding: '3px 8px', borderRadius: 6
  },
  paletteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 8, marginBottom: 20
  },
  paletteBox: {
    aspectRatio: '1', borderRadius: 8,
    border: '1px solid #e5e7eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
    transition: 'all .12s ease', fontFamily: FONT
  },
  legend: {
    borderTop: '1px solid #e5e7eb', paddingTop: 14,
    display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16
  },
  legendItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 12, fontWeight: 500, color: 'var(--cdac-text-muted)'
  },
  swatch: { width: 14, height: 14, borderRadius: 4 },
  paletteSubmit: {
    marginTop: 'auto',
    padding: '11px 16px', borderRadius: 10, border: 'none',
    background: 'var(--cdac-text)', color: '#fff',
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
    fontFamily: FONT
  },

  modalOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20
  },
  modal: {
    background: 'var(--cdac-surface)', padding: 32, borderRadius: 16,
    maxWidth: 420, width: '100%',
    boxShadow: '0 20px 60px rgba(15,23,42,.2)'
  },
  modalIcon: {
    width: 48, height: 48, borderRadius: 12,
    background: 'var(--cdac-surface-alt)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16
  },
  modalTitle: { fontSize: 19, fontWeight: 700, color: 'var(--cdac-text)', margin: 0, marginBottom: 8 },
  modalText: { fontSize: 14, color: 'var(--cdac-text-muted)', lineHeight: 1.6, margin: 0, marginBottom: 24 },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  modalCancel: {
    padding: '10px 18px', borderRadius: 10,
    border: '1px solid #e5e7eb', background: 'var(--cdac-surface)',
    fontWeight: 600, fontSize: 13, color: 'var(--cdac-text-muted)',
    cursor: 'pointer', fontFamily: FONT
  },
  modalSubmit: {
    padding: '10px 18px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg,#7c5cff,#6a41e6)',
    color: '#fff', fontWeight: 600, fontSize: 13,
    cursor: 'pointer', fontFamily: FONT
  }
};

const resultStyles = {
  page: {
    minHeight: '100vh', background: 'var(--cdac-bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, fontFamily: FONT
  },
  card: {
    background: 'var(--cdac-surface)', padding: '48px 40px', borderRadius: 20,
    width: '100%', maxWidth: 540,
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 40px rgba(15,23,42,.06)',
    textAlign: 'center'
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 16,
    background: 'linear-gradient(135deg,#7c5cff,#6a41e6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 20px rgba(79,70,229,.25)'
  },
  eyebrow: {
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#7c5cff', margin: 0, marginBottom: 8
  },
  title: { fontSize: 28, fontWeight: 700, color: 'var(--cdac-text)', margin: 0, marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'var(--cdac-text-muted)', margin: 0, marginBottom: 32 },
  scoreGrid: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    padding: '24px 0', borderTop: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb', marginBottom: 32
  },
  scoreCell: { flex: 1 },
  divider: { width: 1, height: 40, background: '#e5e7eb' },
  cellLabel: {
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#94a3b8', margin: 0, marginBottom: 6
  },
  cellValue: { fontSize: 26, fontWeight: 700, color: 'var(--cdac-text)', margin: 0 },
  cellMuted: { fontSize: 16, fontWeight: 500, color: '#94a3b8', marginLeft: 2 },
  goBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto',
    background: 'var(--cdac-text)', color: '#fff', border: 'none',
    padding: '13px 28px', fontSize: 14, fontWeight: 600,
    borderRadius: 10, cursor: 'pointer', fontFamily: FONT
  }
};

export default PracticeArena;
