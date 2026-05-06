import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ChevronLeft, ChevronRight, X, Plus, CheckCircle, 
  HelpCircle, AlertCircle, Home, LogOut, ArrowRight
} from 'lucide-react';
import axios from 'axios';

const PracticeArena = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { index: optionIndex }
  const [isPaletteOpen, setIsPaletteOpen] = useState(true); // OPEN BY DEFAULT
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock Questions (In a real app, fetch based on category)
  const [questions] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      text: `Practice Question ${i + 1} for ${decodeURIComponent(category || 'General')}: Which of the following best describes the core concept of this topic?`,
      options: [
        "A standard definition of the concept.",
        "An alternative approach to the problem.",
        "The most efficient implementation method.",
        "None of the above options are correct."
      ],
      correct: 0 // First option is correct for mock
    }))
  );

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/test');
    }
  }, [navigate]);

  const handleOptionClick = (optIdx) => {
    setAnswers({ ...answers, [currentIdx]: optIdx });
    
    // Auto-advance to next question if not at the end
    if (currentIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 300); // 300ms delay for visual feedback of the selection
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    return score;
  };

  const submitTest = async () => {
    const score = calculateScore();
    const resultData = {
      _id: `practice_${Date.now()}`,
      userId: user.id, // Add user ID for isolation
      isPractice: true,
      category: decodeURIComponent(category),
      score: score,
      totalQuestions: questions.length,
      submittedAt: new Date().toISOString()
    };

    // Store in localStorage to show in dashboard
    const existingPractice = JSON.parse(localStorage.getItem('practiceResults') || '[]');
    existingPractice.push(resultData);
    localStorage.setItem('practiceResults', JSON.stringify(existingPractice));

    setShowSubmitModal(false);
    setShowResult(true);
  };

  // Result Section
  if (showResult) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;
    return (
      <div style={resultStyles.page}>
        <motion.div 
          style={resultStyles.card}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle size={80} color="#48bb78" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontWeight: '800', marginBottom: '10px' }}>Test Completed!</h1>
          <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '30px' }}>
            You have successfully finished the {decodeURIComponent(category)} Practice Test.
          </p>
          
          <div style={resultStyles.scoreArea}>
            <div style={resultStyles.scoreCircle}>
              <span style={{ fontSize: '3rem', fontWeight: '800', color: '#6a41e6' }}>{score}</span>
              <span style={{ fontSize: '1.2rem', color: '#999' }}>/ {questions.length}</span>
            </div>
            <p style={{ marginTop: '15px', fontWeight: '700', fontSize: '1.3rem' }}>
              Your Score: <span style={{ color: percentage >= 40 ? '#48bb78' : '#fc8181' }}>{percentage}%</span>
            </p>
          </div>

          <button 
            style={resultStyles.goBtn} 
            onClick={() => navigate('/test')}
          >
            Go to Test Section
            <ArrowRight size={20} style={{ marginLeft: '10px' }} />
          </button>
        </motion.div>
      </div>
    );
  }

  const isMobile = windowWidth < 768;

  return (
    <div style={styles.pageWrap}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}></div> {/* Empty for spacing */}
        
        <div style={styles.headerCenter}>
          <div style={styles.subjectBadge}>
            {decodeURIComponent(category || 'General Assessment')}
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.userPill}>
            {windowWidth > 480 && <span style={styles.userName}>{user.name || 'Student'}</span>}
            <div style={styles.userAvatar}>
              <User size={18} color="#fff" />
            </div>
          </div>
          
          {/* Question Palette Toggle */}
          <button 
            style={{...styles.toggleBtn, backgroundColor: isPaletteOpen ? '#fc8181' : '#6a41e6'}}
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
          >
            {isPaletteOpen ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={styles.mainContainer}>
        {/* QUESTION AREA */}
        <div style={{
          ...styles.questionArea, 
          width: (isPaletteOpen && !isMobile) ? 'calc(100% - 320px)' : '100%',
          marginRight: (isPaletteOpen && !isMobile) ? '320px' : '0'
        }}>
          <div style={styles.questionBox}>
            <div style={styles.qHeader}>
              <span style={styles.qNum}>Question {currentIdx + 1} of {questions.length}</span>
            </div>
            <p style={styles.qText}>{questions[currentIdx].text}</p>
          </div>

          <div style={styles.optionsGrid}>
            {questions[currentIdx].options.map((opt, i) => (
              <button 
                key={i}
                onClick={() => handleOptionClick(i)}
                style={{
                  ...styles.optionBox,
                  backgroundColor: answers[currentIdx] === i ? '#6a41e6' : '#fff',
                  color: answers[currentIdx] === i ? '#fff' : '#333',
                  boxShadow: answers[currentIdx] === i ? '0 10px 20px rgba(106, 65, 230, 0.2)' : '0 4px 15px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{...styles.optLetter, border: `1.5px solid ${answers[currentIdx] === i ? '#fff' : '#6a41e6'}`}}>
                  {String.fromCharCode(65 + i)}
                </div>
                {opt}
              </button>
            ))}
          </div>

          {/* NAVIGATION BUTTONS */}
          <div style={styles.navRow}>
            <button 
              style={{...styles.navBtn, visibility: currentIdx === 0 ? 'hidden' : 'visible'}}
              onClick={handlePrev}
            >
              <ChevronLeft style={{ marginRight: '8px' }} /> Previous
            </button>
            
            {currentIdx === questions.length - 1 ? (
              <button 
                style={styles.submitTestBtn}
                onClick={() => setShowSubmitModal(true)}
              >
                Submit Test
              </button>
            ) : (
              <button style={styles.navBtn} onClick={handleNext}>
                Next <ChevronRight style={{ marginLeft: '8px' }} />
              </button>
            )}
          </div>
        </div>

        {/* QUESTION PALETTE */}
        <AnimatePresence>
          {isPaletteOpen && (
            <motion.div 
              style={{
                ...styles.palette,
                position: isMobile ? 'fixed' : 'absolute',
                top: isMobile ? '80px' : '20px',
                right: isMobile ? '10px' : '20px',
                zIndex: 200,
              }}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <h5 style={{ fontWeight: '800', marginBottom: '20px' }}>Question Palette</h5>
              <div style={styles.paletteGrid}>
                {questions.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                        setCurrentIdx(i);
                        if(isMobile) setIsPaletteOpen(false); // Close on mobile after selection
                    }}
                    style={{
                      ...styles.paletteBox,
                      backgroundColor: currentIdx === i ? '#6a41e6' : 
                                      answers[i] !== undefined ? '#48bb78' : '#fff',
                      color: (currentIdx === i || answers[i] !== undefined) ? '#fff' : '#333',
                      border: currentIdx === i ? 'none' : '1px solid #eee'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <div style={styles.legend}>
                <div style={styles.legendItem}>
                  <div style={{...styles.dot, backgroundColor: '#6a41e6'}} /> <span>Current</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.dot, backgroundColor: '#48bb78'}} /> <span>Attempted</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.dot, backgroundColor: '#fff', border: '1px solid #ddd'}} /> <span>Not Attempted</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SUBMIT MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <div style={styles.modalOverlay}>
            <motion.div 
              style={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <HelpCircle size={60} color="#6a41e6" style={{ marginBottom: '20px' }} />
              <h2 style={{ fontWeight: '800' }}>Submit Test?</h2>
              <p style={{ color: '#666', marginBottom: '30px' }}>
                Are you really want to submit the test? You can't change your answers after submission.
              </p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button style={styles.modalCancel} onClick={() => setShowSubmitModal(false)}>Cancel</button>
                <button style={styles.modalSubmit} onClick={submitTest}>Yes, Submit</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  pageWrap: {
    minHeight: '100vh',
    background: '#fcfcfe',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    overflow: 'hidden' // Prevent double scrollbars
  },
  header: {
    padding: '15px 20px',
    background: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  headerCenter: { flex: 1, display: 'flex', justifyContent: 'center' },
  subjectBadge: {
    background: '#6a41e615',
    color: '#6a41e6',
    padding: '6px 16px',
    borderRadius: '50px',
    fontWeight: '800',
    fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  userPill: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px',
    background: '#f9f9ff', 
    padding: '5px 5px 5px 15px',
    borderRadius: '50px', 
    border: '1px solid #eee'
  },
  userName: { fontWeight: '700', fontSize: '0.9rem', color: '#333' },
  userAvatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  toggleBtn: {
    width: '36px', height: '36px', borderRadius: '10px',
    border: 'none', color: '#fff', display: 'flex', 
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    transition: 'all 0.1s ease', // FASTER
    boxShadow: '0 4px 10px rgba(106, 65, 230, 0.2)'
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    padding: '20px',
    gap: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  questionArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', // FASTER & SMOOTHER
    maxWidth: '100%',
    overflowY: 'auto',
    padding: '10px'
  },
  questionBox: {
    background: '#fff',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    marginBottom: '25px',
  },
  qHeader: { marginBottom: '10px' },
  qNum: { color: '#6a41e6', fontWeight: '800', fontSize: '0.85rem' },
  qText: { fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', fontWeight: '600', color: '#1a1a1a', lineHeight: '1.4' },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // 2 in left, 2 in right
    gap: '20px',
    marginBottom: '40px'
  },
  optionBox: {
    padding: '20px',
    borderRadius: '15px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.1s ease', // FASTER
  },
  optLetter: {
    width: '28px', height: '28px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: '800', flexShrink: 0
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: '20px'
  },
  navBtn: {
    background: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '10px',
    color: '#6a41e6',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  submitTestBtn: {
    background: 'linear-gradient(135deg, #6a41e6, #7c3aed)',
    border: 'none',
    padding: '14px 40px',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: '800',
    fontSize: '1rem',
    boxShadow: '0 8px 20px rgba(106, 65, 230, 0.3)',
    cursor: 'pointer',
  },
  palette: {
    width: 'min(300px, 80vw)',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
    padding: '24px',
    height: 'fit-content',
    position: 'absolute', // OVERLAY ON MOBILE/FASTER TRANSITION
    right: '20px',
    top: '20px',
    zIndex: 50,
  },
  paletteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '20px'
  },
  paletteBox: {
    aspectRatio: '1',
    borderRadius: '8px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background-color 0.1s'
  },
  legend: { borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: '600', color: '#666' },
  dot: { width: '8px', height: '8px', borderRadius: '50%' },
  
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: '#fff', padding: '30px', borderRadius: '25px', 
    maxWidth: '400px', width: '100%', textAlign: 'center'
  },
  modalCancel: {
    padding: '10px 24px', borderRadius: '10px', border: '1.5px solid #ddd',
    background: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem'
  },
  modalSubmit: {
    padding: '10px 24px', borderRadius: '10px', border: 'none',
    background: '#6a41e6', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem'
  }
};

const resultStyles = {
  page: {
    minHeight: '100vh', background: '#f8f9ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
  },
  card: {
    background: '#fff', padding: '60px 40px', borderRadius: '40px',
    width: '100%', maxWidth: '600px', textAlign: 'center',
    boxShadow: '0 30px 70px rgba(106, 65, 230, 0.1)'
  },
  scoreArea: { margin: '40px 0' },
  scoreCircle: {
    width: '150px', height: '150px', borderRadius: '50%',
    margin: '0 auto', border: '8px solid #f0f0ff',
    display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '5px',
    paddingTop: '35px'
  },
  goBtn: {
    background: '#6a41e6', color: 'white', border: 'none',
    padding: '18px 50px', fontSize: '1.1rem', fontWeight: '800',
    borderRadius: '15px', display: 'flex', alignItems: 'center', margin: '0 auto',
    cursor: 'pointer', transition: 'all 0.2s',
    boxShadow: '0 10px 20px rgba(106, 65, 230, 0.2)'
  }
};

export default PracticeArena;
