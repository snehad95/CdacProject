import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const ExamCards = () => {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [exploreHovered, setExploreHovered] = useState(false);

  const handleQuizClick = (categoryTitle) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowPrompt(true);
    } else {
      navigate(`/practice-instructions/${encodeURIComponent(categoryTitle)}`);
    }
  };

  const [categories, setCategories] = useState([
    {
      title: "Programming",
      desc: "Test coding knowledge in different programming languages.",
      img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=500",
    },
    {
      title: "Quantitative Aptitude",
      desc: "Improve mathematical and logical problem solving skills.",
      img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=500",
    },
    {
      title: "Logical Reasoning",
      desc: "Develop analytical and thinking ability.",
      img: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=500",
    },
    {
      title: "English",
      desc: "Practice grammar, vocabulary and comprehension.",
      img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=500",
    },
    {
      title: "General Knowledge",
      desc: "Stay updated with current affairs and general awareness.",
      img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=500",
    },
    {
      title: "Technical Subjects",
      desc: "Prepare technical concepts for placements and exams.",
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500",
    },
    {
      title: "Computer Fundamentals",
      desc: "Test your basic knowledge of computer hardware and software.",
      img: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&q=80&w=500",
    },
    {
      title: "Data Structures",
      desc: "Assess your understanding of arrays, trees, graphs, and algorithms.",
      img: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=500",
    },
  ]);

  useEffect(() => {
    const fetchPractice = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/practice-tests');
        if (res.data.length > 0) {
          const dbCats = res.data.map(t => ({ title: t.title, desc: t.description, img: t.image }));
          // Keep base 6 and add news ones from DB
          const baseTitles = categories.map(c => c.title);
          const newOnes = dbCats.filter(d => !baseTitles.includes(d.title));
          setCategories(prev => [...prev, ...newOnes]);
        }
      } catch (err) {
        console.error("Home test fetch err", err);
      }
    };
    fetchPractice();
  }, []);

  return (
    <Container className="my-5 p-0">

      {/* Animated Heading */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-5"
      >
        <h2 className="fw-bolder  " style={{ color: '#6a41e6ff' }}>Available Tests</h2>
        <div className="mx-auto  rounded-pill mt-3" style={{ width: '80px', height: '4px', background: '#a78bfa' }}></div>
      </motion.div>

      <Row className="g-4">
        {categories.slice(0, 8).map((cat, idx) => (
          <Col lg={3} md={6} key={idx}>
            <motion.div
              initial="initial"
              whileInView="visible"
              viewport={{ once: false, margin: "0px 0px -30px 0px" }}
              variants={{
                initial: { opacity: 0, y: 80 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: idx * 0.08, ease: "easeOut" } },
                hover: { scale: 1.04 }
              }}
              whileHover="hover"
              whileTap={{ scale: 1.07 }}
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
                      onClick={() => handleQuizClick(cat.title)}
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
          </Col>
        ))}
      </Row>

      {/* ── Explore More Button ── */}
      <div className="text-center mt-5">
        <motion.button
          onClick={() => navigate('/test')}
          onMouseEnter={() => setExploreHovered(true)}
          onMouseLeave={() => setExploreHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '12px 42px',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '8px',
            border: '2px solid #6a41e6',
            backgroundColor: exploreHovered ? '#6a41e6' : '#ffffff',
            color: exploreHovered ? '#ffffff' : '#6a41e6',
            cursor: 'pointer',
            transition: 'background-color 0.25s ease, color 0.25s ease',
            letterSpacing: '0.5px',
          }}
        >
          Explore More
        </motion.button>
      </div>

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

      <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} handleClose={() => setShowRegister(false)} />
    </Container>
  );
};

export default ExamCards;
