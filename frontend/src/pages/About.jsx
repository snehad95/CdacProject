import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div style={{ backgroundColor: 'var(--cdac-bg)', minHeight: '100vh', paddingTop: '40px', paddingBottom: '40px' }}>
    <Container className="my-5 overflow-hidden" style={{ maxWidth: '1800px' }}>
      <motion.h2
        className="text-center fw-bold mb-3"
        style={{ color: '#7c5cff', letterSpacing: '0.5px' }}
        initial={{ opacity: 0, x: -150 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Centre for Development of Advanced Computing (C-DAC), New Delhi
      </motion.h2>

      {/* Purple underline divider */}
      <div className="mx-auto rounded-pill mb-5" style={{ width: '90px', height: '4px', backgroundColor: '#7c5cff' }}></div>
      <Row className="justify-content-center ">
        <Col lg={11}>
          <Card className="shadow-sm border-0" style={{ backgroundColor: 'var(--cdac-surface)' }}>
            <Card.Body className="p-4 p-md-5" style={{ lineHeight: '1.85', fontSize: '1.05rem', color: 'var(--cdac-text-muted)' }}>
              <p className="text-justify mb-4">
                The Centre for Development of Advanced Computing (C-DAC), New Delhi is one of the key centres of C-DAC, an autonomous scientific society under the Ministry of Electronics and Information Technology (MeitY), Government of India. C-DAC New Delhi plays a significant role in carrying out research, development, training, and consultancy in advanced areas of Information Technology, Electronics, and Digital Governance aligned with national priorities.
              </p>
              <p className="text-justify mb-4">
                C-DAC New Delhi has been actively contributing to the design and implementation of large-scale national e-Governance and Digital India initiatives. The centre focuses on areas such as Cyber Security, e-Governance, Software Technologies, Data Analytics, Artificial Intelligence, Blockchain, Cloud Computing and IT infrastructure for government systems.
              </p>
              <p className="text-justify mb-4">
                Over the years, C-DAC New Delhi has emerged as a major hub for policy-driven technology solutions, working closely with MeitY and other government stakeholders to translate national IT policies into practical and deployable systems. The centre emphasizes innovation, quality, and reliability in delivering mission-critical applications that support governance and public services.
              </p>
              <p className="text-justify mb-4">
                In addition to research and development activities, C-DAC New Delhi contributes to capacity building and human resource development through specialized training programs and professional courses. These initiatives aim to bridge the skill gap in emerging technologies and meet the growing needs of the Indian IT industry and government sector.
              </p>
              <p className="text-justify mb-0">
                Today, C-DAC New Delhi stands as a vital pillar within the C-DAC ecosystem, strengthening India's technological capabilities and supporting the nation's vision of a secure, inclusive, and digitally empowered society through advanced research, innovation, and technology deployment.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default About;
