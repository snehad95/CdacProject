import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, HelpCircle, TrendingUp, Award, UserCheck, CheckCircle2 } from 'lucide-react';
import { Card } from 'react-bootstrap';

const T = {
  bg: 'var(--cdac-bg)', primary: '#7c5cff', primaryDeep: '#6a41e6',
  accent: '#a78bfa', sky: '#93c5fd', text: 'var(--cdac-text)', muted: '#6b6483', border: 'var(--cdac-border)',
};

const features = [
  {
    id: 1, title: 'About Our Quiz Project', desc: 'Our quiz platform helps students practice concepts.', icon: BookOpen, tint: '#efe9ff',
    bullets: ['Enhances subject understanding', 'Supports multiple quiz formats', 'Real-time performance metrics', 'Customizable difficulty levels', 'Interactive learning modules']
  },
  {
    id: 2, title: 'Quiz Types', desc: 'Multiple quiz formats designed to evaluate different learning skills.', icon: HelpCircle, tint: '#e6f0ff',
    bullets: ['Fill in the Blanks', 'Subjective Questions', 'Multiple Choice Questions', 'True or False format', 'Matching type questions']
  },
  {
    id: 3, title: 'Performance Tracking', desc: 'Students can monitor their progress and identify weak areas.', icon: TrendingUp, tint: '#efe9ff',
    bullets: ['Instant Result generation', 'Score Tracking over time', 'Detailed visual Analysis', 'Rank prediction and comparison', 'Personalized feedback reports']
  },
  {
    id: 4, title: 'Learning Benefits', desc: 'Improves conceptual clarity and time management skills.', icon: Award, tint: '#fff5e0',
    bullets: ['Improves Concept Clarity', 'Better Time Management', 'Abundant Practice Questions', 'Builds exam confidence', 'Identifies knowledge gaps']
  },
  {
    id: 5, title: 'User Features', desc: 'User friendly and secure platform designed for smooth experience.', icon: UserCheck, tint: '#e0f7fc',
    bullets: ['Easy, intuitive Interface', 'Fully Mobile Friendly', 'Highly Secure Access', 'Customizable profile dashboard', '24/7 technical support']
  },
];

const FeaturesZigZag = () => {
  const containerRef = useRef(null);
  // Using native horizontal scrolling instead of Framer Motion scroll-jacking

  return (
    <div style={{ background: `linear-gradient(180deg, ${T.bg} 0%, #f1ecff 100%)` }}>
      <div className="text-center pt-5 pb-4 px-3">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span style={{
            display: 'inline-block', padding: '6px 14px', borderRadius: 999,
            background: 'var(--cdac-surface)', color: T.primaryDeep, fontSize: 12, fontWeight: 700,
            letterSpacing: 1.5, marginBottom: 14, border: `1px solid ${T.border}`,
          }}>
            WHY CHOOSE US
          </span>
          <h2 className="fw-bolder mb-3" style={{ color: T.text, maxWidth: 900, margin: '0 auto', letterSpacing: -0.5 }}>
            Elevate Your Assessment Experience with Industry-Leading Excellence
          </h2>
          <div className="mx-auto rounded-pill"
            style={{ width: 90, height: 4, background: `linear-gradient(90deg, ${T.primary}, ${T.primaryDeep})` }} />
        </motion.div>
      </div>

      <div ref={containerRef} className="pb-5">
        <div style={{
          width: '100%',
          overflowX: 'auto',
          display: 'flex',
          padding: '2rem 8vw',
          gap: '2rem',
          scrollbarWidth: 'auto', // For Firefox
        }} className="custom-scrollbar">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} style={{ flexShrink: 0, width: 320, height: 410, display: 'flex' }}>
                <motion.div whileHover={{ scale: 1.03, y: -6 }}
                  style={{ cursor: 'pointer', borderRadius: 18, width: '100%', height: '100%' }}
                  transition={{ type: 'spring', stiffness: 300 }}>
                  <Card className="border-0" style={{
                    borderRadius: 18,
                    background: 'var(--cdac-surface)',
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 12px 30px rgba(124,92,255,0.12)',
                    borderTop: `5px solid ${T.primary}`,
                    height: '100%', width: '100%', overflow: 'hidden',
                  }}>
                    <Card.Body className="p-4 d-flex flex-column" style={{ height: '100%' }}>
                      <div className="d-flex align-items-center gap-3 mb-3 flex-shrink-0">
                        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                          style={{ width: 52, height: 52, backgroundColor: item.tint }}>
                          <Icon size={24} color={T.primaryDeep} strokeWidth={2.2} />
                        </div>
                        <h5 className="fw-bolder mb-0" style={{ color: T.text, lineHeight: 1.3 }}>{item.title}</h5>
                      </div>
                      <p className="mb-3 fs-6 flex-shrink-0" style={{
                        color: T.muted, lineHeight: 1.6,
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{item.desc}</p>
                      <ul className="list-unstyled mt-auto mb-0">
                        {item.bullets.map((bullet, i) => (
                          <li key={i} className="mb-2 d-flex align-items-center">
                            <CheckCircle2 size={18} color={T.primary} className="me-3 flex-shrink-0" />
                            <span className="fs-6" style={{ color: T.text, fontWeight: 500 }}>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturesZigZag;
