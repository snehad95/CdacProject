import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  Monitor, Shield, Smartphone, Cpu, CircuitBoard,
  GitPullRequest, Laptop, BookOpen,
  Calendar, Clock, Timer, CheckCircle, PlayCircle, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const THEME = {
  bg: 'var(--cdac-bg)',
  surface: 'var(--cdac-surface)',
  primary: '#7c5cff',
  primarySoft: '#cbb6e9',
  primaryDeep: '#6a41e6',
  text: 'var(--cdac-text)',
  textMuted: 'var(--cdac-text-muted)',
  border: 'var(--cdac-border)',
  live: '#ef4444',
};

const ICON_COLORS = [
  '#7c5cff', '#f97316', '#06b6d4', '#ef4444',
  '#22c55e', '#3b82f6', '#a855f7', '#eab308',
];

const ICONS = [Monitor, BookOpen, Laptop, Cpu, CircuitBoard, GitPullRequest, Shield, Smartphone];

const CourseCard = ({ exam, onOpen, index, isHovered, onHoverStart, onHoverEnd, attempted }) => {
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);
  const isLive = new Date() >= startTime && new Date() <= endTime;

  const cleanTitle = exam.title || '';
  const acronym = cleanTitle.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().substring(0, 4) || 'EXM';

  const iconColor = isLive ? '#ef4444' : ICON_COLORS[0];
  const Icon = ICONS[index % ICONS.length];

  const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={() => onOpen(exam._id)}
      style={{
        backgroundColor: 'var(--cdac-surface)',
        borderRadius: '16px',
        border: `1px solid ${isHovered ? iconColor : 'var(--cdac-border)'}`,
        padding: '10px',
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.25s ease',
        boxShadow: isHovered
          ? '0 20px 40px -12px rgba(15, 23, 42, 0.15)'
          : '0 1px 3px rgba(15, 23, 42, 0.04)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Branded Visual Tile */}
      <div style={{
        position: 'relative',
        height: '130px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        marginBottom: '18px',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '120px', height: '120px',
          background: `radial-gradient(circle, ${iconColor}40 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '100%', height: '4px',
          background: iconColor,
        }} />
        <div style={{
          width: '42px', height: '42px',
          backgroundColor: iconColor,
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          boxShadow: `0 8px 20px ${iconColor}50`,
          position: 'relative', zIndex: 1,
        }}>
          <Icon size={22} strokeWidth={2.4} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '9px', color: 'rgba(255,255,255,0.55)',
            fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '1.2px', marginBottom: '2px',
            fontFamily: "'Inter', sans-serif",
          }}>
            {isLive ? (
              <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#ef4444', display: 'inline-block',
                  animation: 'dotPulse 1.4s infinite ease-in-out',
                }} />
                LIVE NOW
              </span>
            ) : (exam.category || 'EXAM')}
          </div>
          <div style={{
            fontSize: '26px', fontWeight: 800, lineHeight: 1,
            color: '#fff', letterSpacing: '-0.02em',
            fontFamily: "'Inter', sans-serif",
          }}>
            {acronym}
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="d-flex flex-column" style={{ flexGrow: 1 }}>
        <h3 style={{
          fontSize: '15px', fontWeight: 700,
          color: 'var(--cdac-text)', marginBottom: '10px',
          letterSpacing: '-0.01em',
          fontFamily: "'Inter', sans-serif", lineHeight: 1.35,
        }}>
          {exam.title}
        </h3>

        {/* Info chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: 'rgba(124,92,255,0.06)',
            borderRadius: '8px', padding: '6px 10px',
          }}>
            <Calendar size={13} color={iconColor} strokeWidth={2.2} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '11px', fontFamily: "'Inter', sans-serif" }}>
              <span style={{ color: 'var(--cdac-text-muted)', fontWeight: 500 }}>Start: </span>
              <span style={{ color: 'var(--cdac-text)', fontWeight: 600 }}>
                {fmtDate(startTime)} · {fmtTime(startTime)}
              </span>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: 'rgba(239,68,68,0.05)',
            borderRadius: '8px', padding: '6px 10px',
          }}>
            <Clock size={13} color='#ef4444' strokeWidth={2.2} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '11px', fontFamily: "'Inter', sans-serif" }}>
              <span style={{ color: 'var(--cdac-text-muted)', fontWeight: 500 }}>End: </span>
              <span style={{ color: 'var(--cdac-text)', fontWeight: 600 }}>
                {fmtDate(endTime)} · {fmtTime(endTime)}
              </span>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: 'rgba(34,197,94,0.06)',
            borderRadius: '8px', padding: '6px 10px',
          }}>
            <Timer size={13} color='#22c55e' strokeWidth={2.2} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '11px', fontFamily: "'Inter', sans-serif" }}>
              <span style={{ color: 'var(--cdac-text-muted)', fontWeight: 500 }}>Duration: </span>
              <span style={{ color: 'var(--cdac-text)', fontWeight: 600 }}>
                {exam.durationMinutes} minutes
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div
          style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}
          onClick={(e) => e.stopPropagation()}
        >
          {attempted ? (
            <button disabled style={{
              width: '100%', padding: '9px 16px',
              borderRadius: '10px', border: 'none',
              background: '#f1f5f9', color: '#94a3b8',
              fontWeight: 600, fontSize: '13px',
              cursor: 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              fontFamily: "'Inter', sans-serif",
            }}>
              <CheckCircle size={15} />
              Already Attempted
            </button>
          ) : isLive ? (
            <button
              onClick={() => onOpen(exam._id)}
              style={{
                width: '100%', padding: '9px 16px',
                borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontWeight: 600, fontSize: '13px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 18px rgba(34,197,94,0.45)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.3)'}
            >
              <PlayCircle size={15} />
              Start Exam
            </button>
          ) : (
            <button
              onClick={() => onOpen(exam._id)}
              style={{
                width: '100%', padding: '9px 16px',
                borderRadius: '10px', border: 'none',
                background: `linear-gradient(135deg, ${iconColor}, #6a41e6)`,
                color: '#fff', fontWeight: 600, fontSize: '13px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                boxShadow: `0 4px 12px ${iconColor}40`,
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Lock size={14} />
              Start Exam
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </motion.div>
  );
};

const SectionHeading = ({ children, count }) => (
  <div className="mb-4 mt-3">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="d-flex align-items-center"
    >
      <div style={{
        width: '4px', height: '28px',
        backgroundColor: '#7c5cff',
        borderRadius: '4px', marginRight: '14px',
      }} />
      <h2 style={{
        fontSize: '22px', fontWeight: 700,
        color: 'var(--cdac-text)',
        letterSpacing: '-0.01em', margin: 0,
        fontFamily: "'Inter', sans-serif",
      }}>
        {children}
      </h2>
      {typeof count === 'number' && (
        <div style={{
          marginLeft: '14px', padding: '4px 10px',
          backgroundColor: 'var(--cdac-surface)',
          border: '1px solid #e2e8f0',
          borderRadius: '999px', fontSize: '12px',
          fontWeight: 600, color: 'var(--cdac-text-muted)',
          fontFamily: "'Inter', sans-serif",
        }}>
          {count} {count === 1 ? 'exam' : 'exams'}
        </div>
      )}
    </motion.div>
  </div>
);

const Exams = () => {
  const navigate = useNavigate();
  const [examsByCat, setExamsByCat] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);
  const [attemptedIds, setAttemptedIds] = useState(new Set());

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

    const fetchAttempted = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id || payload._id || payload.userId;
        if (!userId) return;
        const res = await axios.get(`http://localhost:5000/api/results/student/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ids = new Set(res.data.map(r => r.examId?._id || r.examId));
        setAttemptedIds(ids);
      } catch (err) {
        console.error('Error fetching attempted exams', err);
      }
    };

    fetchExams();
    fetchAttempted();
  }, []);

  const handleOpen = (examId) => {
    navigate(`/exam-instructions/${examId}`);
  };

  let globalIndex = 0;

  return (
    <div style={{ backgroundColor: 'var(--cdac-bg)', minHeight: '100vh', paddingTop: '40px', paddingBottom: '80px' }}>
      <Container style={{ maxWidth: '1240px' }}>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <div style={{
            fontSize: '12px', fontWeight: 600, letterSpacing: '2px',
            color: 'var(--cdac-text-muted)', textTransform: 'uppercase', marginBottom: '12px',
          }}>
            Official Examinations
          </div>
          <h2 className="fw-bolder mb-2" style={{ color: 'var(--cdac-text)', letterSpacing: -0.5 }}>
            C-DAC Certification Exams
          </h2>
          <p className="mb-0" style={{ color: '#6b6483' }}>
            Browse upcoming and live exams. Register early and start your evaluation journey.
          </p>
        </motion.div>



        {Object.keys(examsByCat).length === 0 && (
          <div className="text-center py-5">
            <h4 style={{ color: THEME.textMuted }}>No exams available currently.</h4>
          </div>
        )}

        {Object.entries(examsByCat).map(([category, exams]) => (
          <div key={category} className="mb-5">
            <SectionHeading count={exams.length}>{category}</SectionHeading>
            <Row className="g-4">
              {exams.map((exam) => {
                const cardIndex = globalIndex++;
                return (
                  <Col xs={12} sm={6} md={4} lg={3} key={exam._id}>
                    <CourseCard
                      exam={exam}
                      onOpen={handleOpen}
                      index={cardIndex}
                      isHovered={hoveredCard === exam._id}
                      onHoverStart={() => setHoveredCard(exam._id)}
                      onHoverEnd={() => setHoveredCard(null)}
                      attempted={attemptedIds.has(exam._id)}
                    />
                  </Col>
                );
              })}
            </Row>
          </div>
        ))}
      </Container>
    </div>
  );
};

export default Exams;
