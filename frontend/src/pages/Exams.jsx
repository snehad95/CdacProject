import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Laptop, Clock, Calendar, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

// ---- Light theme palette ----
const THEME = {
  bg: 'var(--cdac-bg)',   // page background (very light lavender)
  surface: 'var(--cdac-surface)',   // card surface
  surfaceAlt: 'var(--cdac-surface-alt)',   // chip / info row background
  primary: '#7c5cff',   // soft violet
  primarySoft: '#cbb6e9',   // pastel violet
  accent: '#ffb84d',   // warm amber accent
  text: 'var(--cdac-text)',
  textMuted: 'var(--cdac-text-muted)',
  border: 'var(--cdac-border)',
  success: '#22c55e',
  live: '#ef4444',
};

function useScrollDirection() {
  const [direction, setDirection] = useState('down');
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious();
    setDirection(latest > prev ? 'down' : 'up');
  });
  return direction;
}

const CourseCard = ({ exam, onOpen, scrollDirection }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const yFrom = scrollDirection === 'down' ? 60 : -60;
  const startTime = new Date(exam.startTime);
  const isLive = new Date() >= startTime && new Date() <= new Date(exam.endTime);
  const acronym = exam.title.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 3);

  return (
    <motion.div
      ref={ref}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: yFrom }}
      initial={{ opacity: 0, y: yFrom }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="h-100"
    >
      <Card
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="h-100 border-0"
        style={{
          borderRadius: '20px',
          background: THEME.surface,
          boxShadow: hover
            ? '0 20px 40px -20px rgba(124,92,255,0.35)'
            : '0 8px 24px -16px rgba(124,92,255,0.18)',
          transform: hover ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all .35s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header band */}
        <div
          className="position-relative d-flex align-items-center"
          style={{
            height: '120px',
            margin: '14px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${THEME.surfaceAlt} 0%, #ffffff 100%)`,
            border: `1px solid ${THEME.border}`,
            paddingLeft: '70px',
          }}
        >
          <div
            className="position-absolute d-flex align-items-center justify-content-center"
            style={{
              width: '58px',
              height: '58px',
              left: '-10px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primarySoft})`,
              boxShadow: '0 8px 18px -6px rgba(124,92,255,0.6)',
            }}
          >
            <Laptop size={26} color="#fff" strokeWidth={2.4} />
          </div>

          <div>
            <p className="mb-1" style={{ fontSize: '0.72rem', color: THEME.textMuted, letterSpacing: '1.5px', fontWeight: 600 }}>
              PGCP IN
            </p>
            <h2 className="fw-bold mb-0" style={{ color: THEME.primary, letterSpacing: '1px', fontSize: '1.8rem' }}>
              {acronym}
            </h2>
          </div>

          <span
            className="position-absolute d-inline-flex align-items-center gap-1 px-2 py-1"
            style={{
              top: '10px',
              right: '10px',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.8px',
              borderRadius: '999px',
              background: isLive ? 'rgba(239,68,68,0.12)' : 'rgba(124,92,255,0.12)',
              color: isLive ? THEME.live : THEME.primary,
            }}
          >
            {isLive && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.live, display: 'inline-block' }} />
            )}
            {isLive ? 'LIVE' : 'UPCOMING'}
          </span>
        </div>

        <Card.Body className="px-4 pb-4 pt-1 d-flex flex-column">
          <Card.Title
            className="fw-bold mb-3"
            style={{ fontSize: '1.05rem', color: THEME.text, lineHeight: 1.35 }}
          >
            {exam.title}
          </Card.Title>

          <div
            className="w-100 p-3 mb-3"
            style={{
              borderRadius: '12px',
              background: THEME.surfaceAlt,
              border: `1px solid ${THEME.border}`,
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: '.82rem', color: THEME.text }}>
              <Calendar size={14} color={THEME.primary} />
              <span className="fw-semibold">
                {startTime.toLocaleDateString()} · {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2" style={{ fontSize: '.82rem', color: THEME.text }}>
              <Clock size={14} color={THEME.primary} />
              <span className="fw-semibold">Duration: {exam.durationMinutes} mins</span>
            </div>
          </div>

          <Button
            className="w-100 fw-bold py-2 mt-auto border-0 d-inline-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: '12px',
              background: isLive
                ? `linear-gradient(135deg, ${THEME.live}, #ff7a59)`
                : `linear-gradient(135deg, ${THEME.primary}, ${THEME.primarySoft})`,
              color: '#fff',
              letterSpacing: '0.5px',
              boxShadow: '0 10px 20px -10px rgba(124,92,255,0.55)',
            }}
            onClick={() => onOpen(exam._id)}
          >
            {isLive ? <><Sparkles size={16} /> Start Test</> : 'Register Now'}
          </Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

const SectionHeading = ({ children, count }) => (
  <div className="mb-4 mt-3" style={{ overflow: 'hidden' }}>
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 0.55 }}
      className="d-flex align-items-center gap-3"
    >
      <div
        style={{
          height: '32px',
          width: '6px',
          background: `linear-gradient(180deg, ${THEME.primary}, ${THEME.primarySoft})`,
          borderRadius: '10px',
        }}
      />
      <h2 className="mb-0 fw-bold" style={{ fontSize: '1.6rem', color: THEME.text }}>
        {children}
      </h2>
      {typeof count === 'number' && (
        <span
          className="px-2 py-1"
          style={{
            fontSize: '.7rem',
            fontWeight: 700,
            background: THEME.surfaceAlt,
            color: THEME.primary,
            borderRadius: '999px',
          }}
        >
          {count}
        </span>
      )}
    </motion.div>
  </div>
);

const Exams = () => {
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection();
  const [examsByCat, setExamsByCat] = useState({});
  const [showPrompt, setShowPrompt] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showReg, setShowReg] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/exams');
        const grouped = res.data.reduce((acc, exam) => {
          const cat = exam.category || 'General';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(exam);
          return acc;
        }, {});
        setExamsByCat(grouped);
      } catch (err) {
        console.error('Error fetching exams', err);
      }
    };
    fetchExams();
  }, []);

  const handleOpen = (examId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowPrompt(true);
    } else {
      navigate(`/exam-instructions/${examId}`);
    }
  };

  return (
    <div style={{ background: THEME.bg, minHeight: '100vh' }}>
      <Container className="py-5">
        {/* Page intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-5"
        >
          <span
            className="px-3 py-1 d-inline-block mb-3"
            style={{
              fontSize: '.75rem',
              fontWeight: 700,
              letterSpacing: '1.5px',
              borderRadius: '999px',
              background: THEME.surfaceAlt,
              color: THEME.primary,
            }}
          >
            EXPLORE EXAMS
          </span>
          <h1 className="fw-bold mb-2" style={{ color: THEME.text, fontSize: '2.2rem' }}>
            Pick your next challenge
          </h1>
          <p style={{ color: THEME.textMuted, maxWidth: 560, margin: '0 auto' }}>
            Browse upcoming and live exams. Register early to secure your spot.
          </p>
        </motion.div>

        <Modal show={showPrompt} onHide={() => setShowPrompt(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold w-100 text-center" style={{ color: THEME.primary }}>
              Login Required
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center p-4">
            <p className="mb-4 fs-6" style={{ color: THEME.textMuted }}>
              You must login or register first to open an exam.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button
                className="px-4 py-2 fw-semibold text-white border-0"
                style={{ background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primarySoft})`, borderRadius: '10px' }}
                onClick={() => { setShowPrompt(false); setShowLogin(true); }}
              >
                Login
              </Button>
              <Button
                className="px-4 py-2 fw-semibold"
                style={{ border: `2px solid ${THEME.primary}`, color: THEME.primary, background: 'transparent', borderRadius: '10px' }}
                onClick={() => { setShowPrompt(false); setShowReg(true); }}
              >
                Register
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
        <RegisterModal show={showReg} handleClose={() => setShowReg(false)} />

        {Object.keys(examsByCat).length === 0 && (
          <div className="text-center py-5">
            <h4 style={{ color: THEME.textMuted }}>No exams available currently.</h4>
          </div>
        )}

        {Object.entries(examsByCat).map(([category, exams]) => (
          <div key={category} className="mb-5 pb-3">
            <SectionHeading count={exams.length}>{category}</SectionHeading>
            <Row className="justify-content-center justify-content-lg-start g-4">
              {exams.map(exam => (
                <Col lg={4} md={6} sm={10} key={exam._id}>
                  <CourseCard exam={exam} onOpen={handleOpen} scrollDirection={scrollDirection} />
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </Container>
    </div>
  );
};

export default Exams;
