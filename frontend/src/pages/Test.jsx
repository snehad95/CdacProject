import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const T = {
  bg: 'var(--cdac-bg)', surface: 'var(--cdac-surface)', primary: '#7c5cff', primaryDeep: '#6a41e6',
  primarySoft: '#cbb6e9', accent: '#a78bfa', text: 'var(--cdac-text)', muted: '#6b6483',
  border: 'var(--cdac-border)',
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

const ALL_CATEGORIES = [
  { title: 'Programming', desc: 'Test coding knowledge in different programming languages.', img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=500' },
  { title: 'Quantitative Aptitude', desc: 'Improve mathematical and logical problem solving skills.', img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=500' },
  { title: 'Logical Reasoning', desc: 'Develop analytical and thinking ability.', img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=500' },
  { title: 'English', desc: 'Practice grammar, vocabulary and comprehension.', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=500' },
  { title: 'General Knowledge', desc: 'Stay updated with current affairs and general awareness.', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=500' },
  { title: 'Technical Subjects', desc: 'Prepare technical concepts for placements and exams.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500' },
  { title: 'Data Structures', desc: 'Master arrays, trees, graphs, and algorithm complexity.', img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=500' },
  { title: 'Database Management', desc: 'SQL, NoSQL, normalization, and query optimization.', img: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=500' },
  { title: 'Operating Systems', desc: 'Processes, memory management, scheduling and more.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500' },
  { title: 'Computer Networks', desc: 'TCP/IP, OSI model, routing and network security concepts.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=500' },
  { title: 'Software Engineering', desc: 'SDLC, design patterns, testing, and agile methodologies.', img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500' },
  { title: 'Cybersecurity', desc: 'Encryption, ethical hacking, firewalls and threat analysis.', img: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=500' },
  { title: 'Artificial Intelligence', desc: 'AI fundamentals, search algorithms, and knowledge representation.', img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=500' },
  { title: 'Machine Learning', desc: 'Supervised, unsupervised learning and model evaluation.', img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=500' },
  { title: 'Web Development', desc: 'HTML, CSS, JavaScript, REST APIs and frontend frameworks.', img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=500' },
  { title: 'Cloud Computing', desc: 'AWS, Azure, GCP — deployment, storage and cloud architecture.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=500' },
  { title: 'Mobile Development', desc: 'Android, iOS fundamentals and cross-platform app building.', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=500' },
  { title: 'DevOps & CI/CD', desc: 'Docker, Kubernetes, pipelines and continuous integration.', img: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=500' },
];

const TestCard = ({ cat, scrollDirection, onQuizClick }) => {
  const ref = useRef(null);
  const [, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const yFrom = scrollDirection === 'down' ? 70 : -70;

  return (
    <motion.div
      ref={ref}
      initial="initial"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -30px 0px' }}
      variants={{
        initial: { opacity: 0, y: yFrom },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
        hover: { y: -6 },
      }}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      className="h-100"
      style={{ cursor: 'pointer' }}
    >
      <Card
        className="h-100 border-0 text-center"
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          background: T.surface,
          border: `1px solid ${T.border}`,
          boxShadow: '0 8px 24px rgba(124,92,255,0.10)',
          transition: 'box-shadow .25s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 18px 40px rgba(124,92,255,0.22)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,92,255,0.10)')}
      >
        <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
          <Card.Img variant="top" src={cat.img} alt={cat.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <motion.div
            variants={{ initial: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(124,92,255,0.15) 0%, rgba(106,65,230,0.55) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Button
              className="px-4 py-2 fw-semibold text-white border-0"
              style={{
                borderRadius: 10,
                background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`,
                boxShadow: '0 6px 18px rgba(124,92,255,0.45)',
              }}
              onClick={onQuizClick}
            >
              Start Test
            </Button>
          </motion.div>
        </div>
        <Card.Body className="d-flex flex-column p-4">
          <Card.Title className="fw-bold fs-5 mb-2" style={{ color: T.text }}>{cat.title}</Card.Title>
          <Card.Text className="small mb-0" style={{ color: T.muted, minHeight: 40 }}>{cat.desc}</Card.Text>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

const Test = () => {
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection();
  const [categories, setCategories] = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/practice-tests');
        if (res.data.length > 0) {
          const dbCats = res.data.map(t => ({ title: t.title, desc: t.description, img: t.image }));
          setCategories(dbCats);
        } else {
          setCategories(ALL_CATEGORIES);
        }
      } catch (err) {
        console.error('Failed to fetch practice tests', err);
        setCategories(ALL_CATEGORIES);
      }
    })();
  }, []);

  const handleQuizClick = (categoryTitle) => {
    const token = localStorage.getItem('token');
    if (!token) setShowPrompt(true);
    else navigate(`/practice-instructions/${encodeURIComponent(categoryTitle)}`);
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <Container className="py-5">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-5"
        >
          {/* <span style={{
            display: 'inline-block', padding: '6px 14px', borderRadius: 999,
            background: '#efe9ff', color: T.primaryDeep, fontSize: 12, fontWeight: 700,
            letterSpacing: 1.5, marginBottom: 14,
          }}>
            PRACTICE LIBRARY
          </span> */}
          <h2 className="fw-bolder mb-2" style={{ color: T.text, letterSpacing: -0.5 }}>
            All Exam Categories
          </h2>
          <p className="mb-0" style={{ color: T.muted }}>
            Browse every test category and start practising in seconds.
          </p>
          <div className="mx-auto rounded-pill mt-3"
            style={{ width: 80, height: 4, background: `linear-gradient(90deg, ${T.primarySoft}, ${T.primary})` }} />
        </motion.div>

        <Row className="g-4">
          {categories.map((cat, idx) => (
            <Col lg={3} md={6} key={idx}>
              <TestCard cat={cat} scrollDirection={scrollDirection} onQuizClick={() => handleQuizClick(cat.title)} />
            </Col>
          ))}
        </Row>

        <Modal show={showPrompt} onHide={() => setShowPrompt(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold w-100 text-center" style={{ color: T.primaryDeep }}>
              Login Required
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center p-4">
            <p className="mb-4 fs-6" style={{ color: T.muted }}>
              You must login or register first to start a quiz.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button className="px-4 py-2 fw-semibold text-white border-0"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`, borderRadius: 10 }}
                onClick={() => { setShowPrompt(false); setShowLogin(true); }}>Login</Button>
              <Button className="px-4 py-2 fw-semibold"
                style={{ border: `2px solid ${T.primaryDeep}`, color: T.primaryDeep, background: 'transparent', borderRadius: 10 }}
                onClick={() => { setShowPrompt(false); setShowRegister(true); }}>Register</Button>
            </div>
          </Modal.Body>
        </Modal>

        <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
        <RegisterModal show={showRegister} handleClose={() => setShowRegister(false)} />
      </Container>
    </div>
  );
};

export default Test;
