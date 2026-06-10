import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Shield, Award, Cpu, Users, Target, BookOpen, Layers, CheckCircle } from 'lucide-react';

const T = {
  bg: 'var(--cdac-bg)',
  surface: 'var(--cdac-surface)',
  primary: '#7c5cff',
  primaryDeep: '#6a41e6',
  accent: '#a78bfa',
  text: 'var(--cdac-text)',
  muted: 'var(--cdac-text-muted)',
  border: 'var(--cdac-border)'
};

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const pillars = [
    {
      title: 'Advanced R&D',
      desc: 'Carrying out cutting-edge research in Artificial Intelligence, Blockchain, and cloud technologies.',
      icon: Cpu,
      tint: '#efe9ff',
      iconColor: '#7c5cff'
    },
    {
      title: 'e-Governance Solutions',
      desc: 'Designing and implementing large-scale national IT frameworks under Digital India initiatives.',
      icon: Layers,
      tint: '#e0f2fe',
      iconColor: '#0284c7'
    },
    {
      title: 'Cyber Security',
      desc: 'Developing robust defence systems and protocols to secure strategic national infrastructure.',
      icon: Shield,
      tint: '#dcfce7',
      iconColor: '#16a34a'
    },
    {
      title: 'Capacity Building',
      desc: 'Training the next generation of IT professionals through high-end postgraduate programs.',
      icon: BookOpen,
      tint: '#fef3c7',
      iconColor: '#d97706'
    }
  ];

  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', padding: '60px 0 80px 0' }}>
      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Typography Header Section */}
          <motion.div variants={itemVariants} className="mb-5">
            <span
              style={{
                display: 'inline-block',
                color: T.primaryDeep,
                fontWeight: '700',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '8px'
              }}
            >
              About C-DAC Delhi
            </span>
            <h3
              style={{ color: 'var(--cdac-text)', fontSize: '38px', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif", marginBottom: '8px', lineHeight: '1.2' }}
            >
              Centre for Development of Advanced Computing
            </h3>
            <p
              className="lead"
              style={{ color: T.muted, fontSize: '1.2rem', maxWidth: '900px', lineHeight: '1.6' }}
            >
              An autonomous scientific society under the Ministry of Electronics and Information Technology (MeitY), Government of India, conducting advanced R&D and national capacity building.
            </p>
          </motion.div>

          <hr style={{ borderColor: T.border, margin: '40px 0' }} />

          {/* Section: Our Story */}
          <Row className="g-4 mb-5">
            <Col lg={7}>
              <motion.div variants={itemVariants}>
                <div className="d-flex align-items-center gap-3 mb-4" style={{ borderLeft: `4px solid ${T.primary}`, paddingLeft: '12px' }}>
                  <h3 className="fw-bold mb-0" style={{ color: T.text }}>
                    Pioneering Innovation
                  </h3>
                  <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{ backgroundColor: '#efe9ff', color: T.primaryDeep, fontSize: '0.8rem' }}>
                    Core Vision
                  </span>
                </div>
                <p style={{ color: T.muted, fontSize: '1.05rem', lineHeight: '1.8' }} className="text-justify mb-4">
                  C-DAC New Delhi plays a significant role in carrying out research, development, training, and consultancy in advanced areas of Information Technology, Electronics, and Digital Governance aligned with national priorities.
                </p>
                <p style={{ color: T.muted, fontSize: '1.05rem', lineHeight: '1.8' }} className="text-justify">
                  Over the years, C-DAC New Delhi has emerged as a major hub for policy-driven technology solutions, working closely with MeitY and other government stakeholders to translate national IT policies into practical and deployable systems. The centre emphasizes innovation, quality, and reliability in delivering mission-critical applications.
                </p>
              </motion.div>
            </Col>

            <Col lg={5}>
              <motion.div
                variants={itemVariants}
                className="p-4 h-100 d-flex flex-column justify-content-center"
                style={{
                  backgroundColor: '#f5f1ff',
                  border: `1px solid ${T.border}`,
                  borderRadius: '16px'
                }}
              >
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: T.primaryDeep }}>
                  <Target size={20} /> Our Mission
                </h5>
                <p className="mb-0 text-muted" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                  To build locally designed, highly reliable technology systems and nurture specialized skillsets in advanced fields—including Cyber Security, Artificial Intelligence, Blockchain, and e-Governance—for the growth of a secure, inclusive, and digitally empowered community.
                </p>
              </motion.div>
            </Col>
          </Row>

          {/* Statistics Section (Clean layout) */}
          <motion.div variants={itemVariants} className="my-5 py-3">
            <Row className="g-4 text-center justify-content-center">
              {[
                { number: '30+', label: 'Years of Excellence', icon: Award },
                { number: '500+', label: 'Systems Deployed', icon: Cpu },
                { number: '10K+', label: 'Professionals Trained', icon: Users },
                { number: '100%', label: 'National Commitment', icon: Shield }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Col key={index} xs={6} md={3}>
                    <div
                      style={{
                        backgroundColor: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: '14px',
                        padding: '20px 15px',
                      }}
                    >
                      <h3 className="fw-extrabold mb-1" style={{ color: T.primaryDeep, fontSize: '1.8rem' }}>{stat.number}</h3>
                      <span className="fw-semibold text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>{stat.label}</span>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </motion.div>

          {/* Section: Strategic Focus Areas */}
          <div className="my-5 pt-3">
            <motion.div variants={itemVariants} className="d-flex align-items-center gap-3 mb-4" style={{ borderLeft: `4px solid ${T.primary}`, paddingLeft: '12px' }}>
              <h3 className="fw-bold mb-0" style={{ color: T.text }}>
                Strategic Focus Areas
              </h3>
              <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '0.8rem' }}>
                4 domains
              </span>
            </motion.div>

            <Row className="g-4">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <Col key={index} md={6} lg={3}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="h-100"
                    >
                      <Card
                        className="h-100 border-0 shadow-sm"
                        style={{
                          backgroundColor: T.surface,
                          borderRadius: '14px',
                          border: `1px solid ${T.border}`,
                        }}
                      >
                        <Card.Body className="p-4 d-flex flex-column">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                            style={{
                              width: '44px',
                              height: '44px',
                              backgroundColor: pillar.tint
                            }}
                          >
                            <Icon size={20} color={pillar.iconColor} />
                          </div>
                          <h6 className="fw-bold mb-2" style={{ color: T.text }}>{pillar.title}</h6>
                          <p className="mb-0 text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{pillar.desc}</p>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* Section: Technological Capabilities */}
          <div className="mt-5 pt-3">
            <motion.div variants={itemVariants} className="d-flex align-items-center gap-3 mb-4" style={{ borderLeft: `4px solid ${T.primary}`, paddingLeft: '12px' }}>
              <h3 className="fw-bold mb-0" style={{ color: T.text }}>
                Technological Capabilities
              </h3>
              <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.8rem' }}>
                Core Tech
              </span>
            </motion.div>

            <Card className="border-0 shadow-sm" style={{ backgroundColor: T.surface, borderRadius: '16px', border: `1px solid ${T.border}` }}>
              <Card.Body className="p-4 p-md-5">
                <Row className="g-3">
                  {[
                    'Advanced Artificial Intelligence & Deep Learning models',
                    'Enterprise blockchain architectures for transparency',
                    'Secure cloud and high-performance server configurations',
                    'National-scale identity and registry frameworks',
                    'Proctoring systems with visual threat verification algorithms',
                    'Advanced cryptanalysis and identity key protection schemas'
                  ].map((bullet, i) => (
                    <Col key={i} md={6}>
                      <div className="d-flex align-items-center gap-3 p-2">
                        <CheckCircle size={18} color="#16a34a" className="flex-shrink-0" />
                        <span style={{ color: T.text, fontSize: '0.95rem', fontWeight: 500 }}>{bullet}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </div>

        </motion.div>
      </Container>
    </div>
  );
};

export default About;

