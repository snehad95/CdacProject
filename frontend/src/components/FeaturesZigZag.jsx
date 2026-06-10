import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { BookOpen, HelpCircle, TrendingUp, Award, UserCheck, CheckCircle2 } from 'lucide-react';

const T = {
  bg: 'var(--cdac-bg)',
  primary: '#7c5cff',
  primaryDeep: '#6a41e6',
  primarySoft: '#cbb6e9',
  text: 'var(--cdac-text)',
  muted: 'var(--cdac-text-muted)',
  border: 'var(--cdac-border)',
  surface: 'var(--cdac-surface)',
};

const features = [
  {
    id: 1,
    title: 'About Our Quiz Project',
    desc: 'Our quiz platform helps students practice concepts and sharpen their skills.',
    icon: BookOpen,
    tint: '#efe9ff',
    iconColor: '#7c5cff',
    bullets: [
      'Enhances subject understanding',
      'Supports multiple quiz formats',
      'Real-time performance metrics',
      'Customizable difficulty levels',
      'Interactive learning modules',
    ],
  },
  {
    id: 2,
    title: 'Quiz Types',
    desc: 'Multiple quiz formats designed to evaluate different learning skills.',
    icon: HelpCircle,
    tint: '#e0f2fe',
    iconColor: '#0284c7',
    bullets: [
      'Fill in the Blanks',
      'Subjective Questions',
      'Multiple Choice Questions',
      'True or False format',
      'Matching type questions',
    ],
  },
  {
    id: 3,
    title: 'Performance Tracking',
    desc: 'Students can monitor their progress and identify weak areas over time.',
    icon: TrendingUp,
    tint: '#dcfce7',
    iconColor: '#16a34a',
    bullets: [
      'Instant Result generation',
      'Score Tracking over time',
      'Detailed visual Analysis',
      'Rank prediction & comparison',
      'Personalized feedback reports',
    ],
  },
  {
    id: 4,
    title: 'Learning Benefits',
    desc: 'Improves conceptual clarity, confidence and time management skills.',
    icon: Award,
    tint: '#fef3c7',
    iconColor: '#d97706',
    bullets: [
      'Improves Concept Clarity',
      'Better Time Management',
      'Abundant Practice Questions',
      'Builds exam confidence',
      'Identifies knowledge gaps',
    ],
  },
  {
    id: 5,
    title: 'User Features',
    desc: 'User-friendly and secure platform designed for a smooth experience.',
    icon: UserCheck,
    tint: '#fce7f3',
    iconColor: '#db2777',
    bullets: [
      'Easy, intuitive Interface',
      'Fully Mobile Friendly',
      'Highly Secure Access',
      'Customizable profile dashboard',
      '24/7 technical support',
    ],
  },
];

const CARD_WIDTH = 380;
const CARD_GAP = 24;
const SIDE_PADDING = 80;

const FeaturesZigZag = () => {
  const wrapperRef = useRef(null);
  const [maxScroll, setMaxScroll] = useState(600);
  const [activeIndex, setActiveIndex] = useState(0); // ← plain state, no hooks-in-loop

  // Calculate how far the track needs to shift to reveal all cards
  useEffect(() => {
    const calc = () => {
      const totalTrack =
        features.length * (CARD_WIDTH + CARD_GAP) - CARD_GAP + SIDE_PADDING * 2;
      const shift = Math.max(0, totalTrack - window.innerWidth);
      setMaxScroll(shift);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // Tie scroll progress to the tall wrapper
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Smooth spring on top of raw scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 18,
    restDelta: 0.0005,
  });

  // Map 0→1 scroll progress to horizontal translation
  const x = useTransform(smoothProgress, [0, 1], [0, -maxScroll]);

  // Update active dot index from scroll — safe: called at top level
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.round(v * (features.length - 1));
    setActiveIndex(Math.max(0, Math.min(features.length - 1, idx)));
  });

  const extraScroll = Math.max(maxScroll * 2, 800);

  return (
    // Tall wrapper — gives vertical scroll room for the horizontal effect
    <div
      ref={wrapperRef}
      style={{ height: `calc(100vh + ${extraScroll}px)`, position: 'relative' }}
    >
      {/* Sticky viewport — pins to top while scrolling through wrapper */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: T.bg,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* ── Section Header ── */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-5"
          style={{ paddingTop: '12px' }}
        >
          <h2
            className="fw-bolder mb-2"
            style={{
              color: T.text,
              letterSpacing: -0.5,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Elevate Your Assessment Experience
          </h2>
          <p
            className="mb-0"
            style={{
              color: T.muted,
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Scroll to explore all features →
          </p>
          <div
            className="mx-auto rounded-pill mt-3"
            style={{
              width: 80,
              height: 4,
              background: `linear-gradient(90deg, ${T.primarySoft}, ${T.primary})`,
            }}
          />
        </motion.div>

        {/* ── Horizontally sliding cards track ── */}
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <motion.div
            style={{
              x,
              display: 'flex',
              gap: `${CARD_GAP}px`,
              paddingLeft: `${SIDE_PADDING}px`,
              paddingRight: `${SIDE_PADDING}px`,
              width: 'max-content',
            }}
          >
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  style={{
                    flexShrink: 0,
                    width: `${CARD_WIDTH}px`,
                    height: '360px',
                    backgroundColor: T.surface,
                    borderRadius: '20px',
                    border: `1px solid ${T.border}`,
                    borderTop: `4px solid ${item.iconColor}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '26px',
                  }}
                >
                  {/* Icon + Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: item.tint,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} color={item.iconColor} strokeWidth={2.2} />
                    </div>
                    <h5
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: '15.5px',
                        color: T.text,
                        lineHeight: 1.3,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {item.title}
                    </h5>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '13.5px',
                      color: T.muted,
                      lineHeight: 1.6,
                      marginBottom: '16px',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {item.desc}
                  </p>

                  {/* Divider */}
                  <div style={{ height: '1px', backgroundColor: T.border, marginBottom: '16px' }} />

                  {/* Bullets */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {item.bullets.map((bullet, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <CheckCircle2 size={14} color={item.iconColor} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                        <span
                          style={{
                            fontSize: '13px',
                            color: T.text,
                            fontWeight: 500,
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* ── Progress Dots (state-driven, no hooks in loop) ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '28px',
          }}
        >
          {features.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === activeIndex ? '24px' : '8px',
                backgroundColor: i === activeIndex ? T.primary : T.border,
                opacity: i === activeIndex ? 1 : 0.5,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ height: '7px', borderRadius: '999px' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesZigZag;
