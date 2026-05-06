import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

// ── Scroll Direction Hook ──────────────────────────────────────────────────────
function useScrollDirection() {
  const [direction, setDirection] = useState('down');
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious();
    setDirection(latest > prev ? 'down' : 'up');
  });
  return direction;
}

// ── All 18 exam categories ─────────────────────────────────────────────────────
const ALL_CATEGORIES = [
  // Row 1
  { title: 'Programming',        desc: 'Test coding knowledge in different programming languages.',         img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=500' },
  { title: 'Quantitative Aptitude', desc: 'Improve mathematical and logical problem solving skills.',      img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=500' },
  { title: 'Logical Reasoning',  desc: 'Develop analytical and thinking ability.',                        img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=500' },
  // Row 2
  { title: 'English',            desc: 'Practice grammar, vocabulary and comprehension.',                  img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=500' },
  { title: 'General Knowledge',  desc: 'Stay updated with current affairs and general awareness.',         img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=500' },
  { title: 'Technical Subjects', desc: 'Prepare technical concepts for placements and exams.',             img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500' },
  // Row 3
  { title: 'Data Structures',    desc: 'Master arrays, trees, graphs, and algorithm complexity.',          img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=500' },
  { title: 'Database Management', desc: 'SQL, NoSQL, normalization, and query optimization.',             img: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=500' },
  { title: 'Operating Systems',  desc: 'Processes, memory management, scheduling and more.',               img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500' },
  // Row 4
  { title: 'Computer Networks',  desc: 'TCP/IP, OSI model, routing and network security concepts.',        img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=500' },
  { title: 'Software Engineering', desc: 'SDLC, design patterns, testing, and agile methodologies.',      img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500' },
  { title: 'Cybersecurity',      desc: 'Encryption, ethical hacking, firewalls and threat analysis.',      img: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=500' },
  // Row 5
  { title: 'Artificial Intelligence', desc: 'AI fundamentals, search algorithms, and knowledge representation.', img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=500' },
  { title: 'Machine Learning',   desc: 'Supervised, unsupervised learning and model evaluation.',           img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=500' },
  { title: 'Web Development',    desc: 'HTML, CSS, JavaScript, REST APIs and frontend frameworks.',         img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=500' },
  // Row 6
  { title: 'Cloud Computing',    desc: 'AWS, Azure, GCP — deployment, storage and cloud architecture.',    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=500' },
  { title: 'Mobile Development', desc: 'Android, iOS fundamentals and cross-platform app building.',       img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=500' },
  { title: 'DevOps & CI/CD',     desc: 'Docker, Kubernetes, pipelines and continuous integration.',        img: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=500' },
];

// ── Single animated card ───────────────────────────────────────────────────────
const TestCard = ({ cat, scrollDirection, onQuizClick }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const yFrom = scrollDirection === 'down' ? 70 : -70;

  return (
    <motion.div
      initial="initial"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -30px 0px" }}
      variants={{
        initial: { opacity: 0, y: yFrom },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
        hover: { scale: 1.04 }
      }}
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      className="h-100"
      style={{ cursor: 'pointer' }}
    >
      <Card className="h-100 shadow border-0 text-center" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f8f9fa', position: 'relative' }}>
          <Card.Img
            variant="top"
            src={cat.img}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt={cat.title}
          />
          <motion.div
            variants={{
              initial: { opacity: 0 },
              hover: { opacity: 1 }
            }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Button
              className="px-4 py-2 text-white fw-semibold"
              style={{ borderRadius: '5px', backgroundColor: '#6a41e6', border: 'none' }}
              onClick={onQuizClick}
            >
              Start Test
            </Button>
          </motion.div>
        </div>
        <Card.Body className="d-flex flex-column p-4">
          <Card.Title className="fw-bold fs-5 mb-3">{cat.title}</Card.Title>
          <Card.Text className="text-muted small mb-0" style={{ minHeight: '40px' }}>
            {cat.desc}
          </Card.Text>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const Test = () => {
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection();
  const [categories, setCategories] = useState(ALL_CATEGORIES);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showLogin, setShowLogin]   = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const fetchPracticeTests = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/practice-tests');
        if (res.data.length > 0) {
          const dbCats = res.data.map(t => ({ title: t.title, desc: t.description, img: t.image }));
          // Filter out duplicates if any match by title
          const existingTitles = ALL_CATEGORIES.map(c => c.title);
          const uniqueDbCats = dbCats.filter(db => !existingTitles.includes(db.title));
          setCategories([...ALL_CATEGORIES, ...uniqueDbCats]);
        }
      } catch (err) {
        console.error("Failed to fetch practice tests", err);
      }
    };
    fetchPracticeTests();
  }, []);

  const handleQuizClick = (categoryTitle) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowPrompt(true);
    } else {
      navigate(`/practice-instructions/${encodeURIComponent(categoryTitle)}`);
    }
  };

  return (
    <Container className="my-5 pb-5">

      {/* Page heading */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-5"
      >
        <h2 className="fw-bolder" style={{ color: '#6a41e6' }}>All Exam Categories</h2>
        <p className="text-muted mt-2 mb-0">Browse all available test categories and start practising today</p>
        <div className="mx-auto rounded-pill mt-3" style={{ width: '80px', height: '4px', backgroundColor: '#6a41e6' }} />
      </motion.div>

      {/* Dynamic cards */}
      <Row className="g-4">
        {categories.map((cat, idx) => (
          <Col lg={3} md={6} key={idx}>
            <TestCard
              cat={cat}
              scrollDirection={scrollDirection}
              onQuizClick={() => handleQuizClick(cat.title)}
            />
          </Col>
        ))}
      </Row>

      {/* Login Required Modal */}
      <Modal show={showPrompt} onHide={() => setShowPrompt(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-danger w-100 text-center">Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <p className="mb-4 fs-5 text-muted">You must login or register first to start a quiz.</p>
          <div className="d-flex justify-content-center gap-3">
            <Button className="px-4 py-2 fw-semibold text-white" style={{ backgroundColor: '#6a41e6', border: 'none' }}
              onClick={() => { setShowPrompt(false); setShowLogin(true); }}>Login</Button>
            <Button className="px-4 py-2 fw-semibold" style={{ border: '2px solid #6a41e6', color: '#6a41e6', backgroundColor: 'transparent' }}
              onClick={() => { setShowPrompt(false); setShowRegister(true); }}>Register</Button>
          </div>
        </Modal.Body>
      </Modal>

      <LoginModal    show={showLogin}    handleClose={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} handleClose={() => setShowRegister(false)} />
    </Container>
  );
};

export default Test;
