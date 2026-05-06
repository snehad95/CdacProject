import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Laptop, Smartphone, Database, Clock, Calendar, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

// Hook that returns current scroll direction: 'down' | 'up'
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

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const yFrom = scrollDirection === 'down' ? 80 : -80;
  
  const startTime = new Date(exam.startTime);
  const isLive = new Date() >= startTime && new Date() <= new Date(exam.endTime);

  // Generate acronym from title (first letters of words)
  const acronym = exam.title.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 3);
  const color = '#6a41e6'; // Standard purple

  return (
    <motion.div
      ref={ref}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: yFrom }}
      initial={{ opacity: 0, y: yFrom }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="h-100"
    >
      <Card className="h-100 text-center shadow border border-light mb-4 py-3 px-3" style={{ borderRadius: '12px' }}>
        <div 
          className="mx-auto mt-2 d-flex align-items-center shadow-sm" 
          style={{ 
            width: '100%', 
            maxWidth: '280px', 
            height: '110px', 
            position: 'relative', 
            backgroundColor: '#2b2b36', 
            borderRadius: '12px', 
            borderBottom: `4px solid ${color}` 
          }}
        >
          <div className="ps-5 text-start ms-3">
            <p className="text-white mb-0" style={{ fontSize: '0.8rem', opacity: 0.8 }}>PGCP in</p>
            <h2 className="fw-bold mb-0" style={{ color: '#ffc107', letterSpacing: '1px' }}>{acronym}</h2>
          </div>
          <div 
            className="position-absolute d-flex align-items-center justify-content-center border border-4 border-white rounded-circle shadow-sm" 
            style={{ width: '60px', height: '60px', left: '-15px', backgroundColor: color }}
          >
            <Laptop size={28} color="#fff" strokeWidth={2.5} />
          </div>
          
          {/* Live Status Badge inside the header as an overlay */}
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
             <span className={`badge ${isLive ? 'bg-success' : 'bg-primary'} px-2 py-1 rounded-pill`} style={{ fontSize: '0.65rem' }}>
                {isLive ? 'LIVE' : 'UPCOMING'}
             </span>
          </div>
        </div>

        <Card.Body className="px-2 pb-2 d-flex flex-column align-items-center mt-3">
          <Card.Title className="fw-bolder mb-2" style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>{exam.title}</Card.Title>
          
          <div className="w-100 bg-light p-2 rounded-3 mb-3 text-start small fw-bold">
            <div className="d-flex align-items-center gap-2 mb-1">
                <Calendar size={14} color="#6a41e6" />
                <span>{startTime.toLocaleDateString()} at {startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
                <Clock size={14} color="#6a41e6" />
                <span>Duration: {exam.durationMinutes} Mins</span>
            </div>
          </div>

          <Button 
            className="w-100 fw-bold py-2 mt-auto text-white shadow-sm" 
            style={{ borderRadius: '8px', backgroundColor: '#6a41e6', border: 'none' }} 
            onClick={() => onOpen(exam._id)}
          >
            {isLive ? 'START TEST' : 'REGISTER NOW'}
          </Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

const SectionHeading = ({ children }) => {
  return (
    <div className="mb-5 mt-4" style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="d-flex align-items-center gap-3"
      >
        <div style={{ height: '35px', width: '8px', backgroundColor: '#6a41e6', borderRadius: '10px' }} />
        <h2 className="mb-0 fw-800" style={{ fontSize: '1.75rem', color: '#1a1a1a' }}>{children}</h2>
      </motion.div>
    </div>
  );
};

const Exams = () => {
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection();
  const [examsByCat, setExamsByCat] = useState({});
  const [showPrompt, setShowPrompt] = useState(false);
  const [showLogin, setShowLogin]   = useState(false);
  const [showReg,   setShowReg]     = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/exams');
        // Group by category
        const grouped = res.data.reduce((acc, exam) => {
          const cat = exam.category || 'General';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(exam);
          return acc;
        }, {});
        setExamsByCat(grouped);
      } catch (err) {
        console.error("Error fetching exams", err);
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
    <Container className="my-5 pb-5">
      <Modal show={showPrompt} onHide={() => setShowPrompt(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-danger w-100 text-center">Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <p className="mb-4 fs-5 text-muted">You must login or register first to open an exam.</p>
          <div className="d-flex justify-content-center gap-3">
            <Button className="px-4 py-2 fw-semibold text-white" style={{ backgroundColor: '#6a41e6', border: 'none' }}
              onClick={() => { setShowPrompt(false); setShowLogin(true); }}>Login</Button>
            <Button className="px-4 py-2 fw-semibold" style={{ border: '2px solid #6a41e6', color: '#6a41e6', backgroundColor: 'transparent' }}
              onClick={() => { setShowPrompt(false); setShowReg(true); }}>Register</Button>
          </div>
        </Modal.Body>
      </Modal>

      <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
      <RegisterModal show={showReg} handleClose={() => setShowReg(false)} />
      
      {Object.keys(examsByCat).length === 0 && (
        <div className="text-center py-5">
           <h4 className="text-muted">No exams available currently.</h4>
        </div>
      )}

      {Object.entries(examsByCat).map(([category, exams]) => (
        <div key={category} className="mb-5 pb-4">
          <SectionHeading>{category}</SectionHeading>
          <Row className="justify-content-center justify-content-lg-start g-4">
            {exams.map(exam => (
              <Col lg={4} md={6} sm={10} key={exam._id}>
                <CourseCard 
                  exam={exam}
                  onOpen={handleOpen}
                  scrollDirection={scrollDirection}
                />
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </Container>
  );
};

export default Exams;
