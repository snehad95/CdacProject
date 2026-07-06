import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const T = {
  bg: 'var(--cdac-bg)', surface: 'var(--cdac-surface)', primary: '#7c5cff', primaryDeep: '#6a41e6',
  primarySoft: '#cbb6e9', accent: '#a78bfa', text: 'var(--cdac-text)', muted: '#6b6483', border: 'var(--cdac-border)',
};

const ExamCards = () => {
  const navigate = useNavigate();
  const [exploreHovered, setExploreHovered] = useState(false);

  const handleQuizClick = (categoryTitle) => {
    navigate(`/practice-instructions/${encodeURIComponent(categoryTitle)}`);
  };

  const defaultCategories = [
    { title: 'Programming', desc: 'Test coding knowledge in different programming languages.', img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=500' },
    { title: 'Quantitative Aptitude', desc: 'Improve mathematical and logical problem solving skills.', img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=500' },
    { title: 'Logical Reasoning', desc: 'Develop analytical and thinking ability.', img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=500' },
    { title: 'English', desc: 'Practice grammar, vocabulary and comprehension.', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=500' },
    { title: 'General Knowledge', desc: 'Stay updated with current affairs and general awareness.', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=500' },
    { title: 'Technical Subjects', desc: 'Prepare technical concepts for placements and exams.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500' },
    { title: 'Computer Fundamentals', desc: 'Test your basic knowledge of computer hardware and software.', img: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&q=80&w=500' },
    { title: 'Data Structures', desc: 'Assess your understanding of arrays, trees, graphs, and algorithms.', img: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=500' },
  ];

  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/practice-tests');
        if (res.data.length > 0) {
          const dbCats = res.data.map(t => ({ title: t.title, desc: t.description, img: t.image }));
          setCategories(dbCats);
        }
      } catch (err) {
        console.error('Home test fetch err', err);
      }
    })();
  }, []);

  return (
    <div style={{ background: T.bg }}>
      <Container className="py-5">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-5"
        >
          {/* <span style={{
            display: 'inline-block', padding: '6px 14px', borderRadius: 999,
            background: '#efe9ff', color: T.primaryDeep, fontSize: 12, fontWeight: 700,
            letterSpacing: 1.5, marginBottom: 14,
          }}>
            POPULAR TESTS
          </span> */}
          <h2 className="fw-bolder mb-2" style={{ color: T.text, letterSpacing: -0.5 }}>Available Tests</h2>
          <p className="mb-0" style={{ color: T.muted }}>Pick a category and start practising in seconds.</p>
          <div className="mx-auto rounded-pill mt-3"
            style={{ width: 80, height: 4, background: `linear-gradient(90deg, ${T.primarySoft}, ${T.primary})` }} />
        </motion.div>

        <Row className="g-4">
          {categories.slice(0, 8).map((cat, idx) => (
            <Col lg={3} md={6} key={idx}>
              <motion.div
                initial="initial"
                whileInView="visible"
                viewport={{ once: false, margin: '0px 0px -30px 0px' }}
                variants={{
                  initial: { opacity: 0, y: 80 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: idx * 0.08, ease: 'easeOut' } },
                  hover: { y: -6 },
                }}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                className="h-100"
                style={{ cursor: 'pointer' }}
              >
                <Card className="h-100 border-0 text-center"
                  style={{
                    borderRadius: 18, overflow: 'hidden',
                    background: T.surface, border: `1px solid ${T.border}`,
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
                        className="px-4 py-2 text-white fw-semibold border-0"
                        style={{
                          borderRadius: 10,
                          background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`,
                          boxShadow: '0 6px 18px rgba(124,92,255,0.45)',
                        }}
                        onClick={() => handleQuizClick(cat.title)}
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
            </Col>
          ))}
        </Row>

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
              fontWeight: 600,
              borderRadius: 10,
              border: `2px solid ${T.primaryDeep}`,
              backgroundColor: exploreHovered ? T.primaryDeep : T.surface,
              color: exploreHovered ? '#ffffff' : T.primaryDeep,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              letterSpacing: 0.5,
              boxShadow: exploreHovered ? '0 10px 24px rgba(124,92,255,0.4)' : '0 4px 14px rgba(124,92,255,0.18)',
            }}
          >
            Explore More →
          </motion.button>
        </div>

      </Container>
    </div>
  );
};

export default ExamCards;
