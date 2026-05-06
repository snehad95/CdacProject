import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, HelpCircle, TrendingUp, Award, UserCheck, CheckCircle2 } from 'lucide-react';
import { Card } from 'react-bootstrap';

const features = [
  {
    id: 1,
    title: "About Our Quiz Project",
    desc: "Our quiz platform helps students practice concepts.",
    icon: BookOpen,
    iconColor: '#a78bfa',
    bg: "#e8f0fe",
    bullets: [
      "Enhances subject understanding",
      "Supports multiple quiz formats",
      "Real-time performance metrics",
      "Customizable difficulty levels",
      "Interactive learning modules"
    ]
  },
  {
    id: 2,
    title: "Quiz Types",
    desc: "Multiple quiz formats designed to evaluate different learning skills.",
    icon: HelpCircle,
    iconColor: "#6c757d",
    bg: "#f0f0f5",
    bullets: [
      "Fill in the Blanks",
      "Subjective Questions",
      "Multiple Choice Questions",
      "True or False format",
      "Matching type questions"
    ]
  },
  {
    id: 3,
    title: "Performance Tracking",
    desc: "Students can monitor their progress and identify weak areas.",
    icon: TrendingUp,
    iconColor: "#212529",
    bg: "#e8e8e8",
    bullets: [
      "Instant Result generation",
      "Score Tracking over time",
      "Detailed visual Analysis",
      "Rank prediction and comparison",
      "Personalized feedback reports"
    ]
  },
  {
    id: 4,
    title: "Learning Benefits",
    desc: "Improves conceptual clarity and time management skills.",
    icon: Award,
    iconColor: "#ffc107",
    bg: "#fff8e1",
    bullets: [
      "Improves Concept Clarity",
      "Better Time Management",
      "Abundant Practice Questions",
      "Builds exam confidence",
      "Identifies knowledge gaps"
    ]
  },
  {
    id: 5,
    title: "User Features",
    desc: "User friendly and secure platform designed for smooth experience.",
    icon: UserCheck,
    iconColor: "#0dcaf0",
    bg: "#e0f7fc",
    bullets: [
      "Easy, intuitive Interface",
      "Fully Mobile Friendly",
      "Highly Secure Access",
      "Customizable profile dashboard",
      "24/7 technical support"
    ]
  }
];

const FeaturesZigZag = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-72%"]);

  return (
    <div style={{ background: ' #a78bfa' }}>
      {/* Animated Heading */}
      <div className="text-center pt-5 pb-4 px-3">
        <motion.div
          initial={{ x: -250, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="fw-bolder text-white mb-3">
            Elevate Your Assessment Experience with Industry-Leading Excellence
          </h2>
          <div className="mx-auto bg-white rounded-pill opacity-75" style={{ width: '90px', height: '4px' }}></div>
        </motion.div>
      </div>

      {/* Tall container for sticky horizontal scroll */}
      <div ref={containerRef} style={{ height: '350vh' }}>
        <div style={{
          position: 'sticky',
          top: '80px',
          height: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          <motion.div style={{ x, display: 'flex', gap: '2rem', paddingLeft: '8vw', paddingRight: '8vw' }}>
            {features.map((item, index) => {
              const Icon = item.icon;
              const cardColor = index % 2 === 0 ? '#a78bfa' : '#0dcaf0';
              return (
                <div key={item.id} style={{ flexShrink: 0, width: '320px', height: '390px', display: 'flex' }}>
                  <motion.div
                    whileHover={{ scale: 1.04, y: -6 }}
                    style={{ cursor: 'pointer', borderRadius: '18px', width: '100%', height: '100%' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="border-0 shadow-lg" style={{
                      borderRadius: '18px',
                      background: '#ffffff',
                      borderTop: `5px solid ${cardColor}`,
                      height: '100%',
                      width: '100%',
                      overflow: 'hidden'
                    }}>
                      <Card.Body className="p-4 d-flex flex-column" style={{ height: '100%' }}>
                        <div className="d-flex align-items-center gap-3 mb-3 flex-shrink-0">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle shadow-sm flex-shrink-0"
                            style={{ width: '52px', height: '52px', backgroundColor: item.bg, marginTop: '2px' }}
                          >
                            <Icon size={24} color={cardColor} strokeWidth={2.2} />
                          </div>
                          <h5 className="fw-bolder mb-0" style={{ color: cardColor, lineHeight: '1.35' }}>{item.title}</h5>
                        </div>

                        <p className="text-muted mb-3 fs-6 flex-shrink-0" style={{
                          lineHeight: '1.6',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.desc}
                        </p>

                        <ul className="list-unstyled mt-auto mb-0">
                          {item.bullets.map((bullet, i) => (
                            <li key={i} className="mb-2 d-flex align-items-center">
                              <CheckCircle2 size={18} color={cardColor} className="me-3 flex-shrink-0" />
                              <span className="fs-6" style={{ color: cardColor, fontWeight: '500' }}>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesZigZag;
