import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import { MapPin, Phone, Mail, Clock, Send, ShieldAlert, CheckCircle } from 'lucide-react';

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

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await axios.post('http://localhost:5000/api/contact', formData);
      setStatus({ type: 'success', message: 'Your message has been sent successfully! We will get back to you soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'danger', message: 'Failed to send message. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', padding: '60px 0 80px 0' }}>
      <Container>
        {/* Typography Header Section */}
        <div className="mb-5">
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
            Get In Touch
          </span>
          <h3
            style={{ color: 'var(--cdac-text)', fontSize: '38px', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif", marginBottom: '8px', lineHeight: '1.2' }}
          >
            Contact Our Team
          </h3>
          <p
            className="lead"
            style={{ color: T.muted, fontSize: '1.2rem', maxWidth: '900px', lineHeight: '1.6' }}
          >
            Have questions about courses, certifications, or assessments? Reach out and we will help you promptly.
          </p>
        </div>

        <hr style={{ borderColor: T.border, margin: '40px 0' }} />

        <Row className="g-5 justify-content-center">

          {/* Left Column: Contact Information */}
          <Col lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="d-flex flex-column gap-4"
            >
              <div className="d-flex align-items-center gap-3" style={{ borderLeft: `4px solid ${T.primary}`, paddingLeft: '12px' }}>
                <h3 className="fw-bold mb-0" style={{ color: T.text }}>
                  Contact Information
                </h3>
                <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{ backgroundColor: '#efe9ff', color: T.primaryDeep, fontSize: '0.8rem' }}>
                  Office
                </span>
              </div>
              <p style={{ color: T.muted, fontSize: '1.05rem', lineHeight: '1.7' }} className="mb-2">
                We are here to support your learning journey. Contact us through any of the options below or submit the message form directly.
              </p>

              {/* Address Widget */}
              <Card className="border-0 shadow-sm" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px' }}>
                <Card.Body className="d-flex gap-3 p-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '44px', height: '44px', backgroundColor: '#efe9ff' }}>
                    <MapPin size={20} color={T.primaryDeep} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: T.text }}>Main Campus Address</h6>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                      Centre for Development of Advanced Computing,<br />
                      GGSIPU Campus, Sector 16C, Dwarka,<br />
                      New Delhi, Delhi 110078
                    </p>
                  </div>
                </Card.Body>
              </Card>

              {/* Phone & Email Widget */}
              <Card className="border-0 shadow-sm" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px' }}>
                <Card.Body className="d-flex gap-3 p-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '44px', height: '44px', backgroundColor: '#e0f2fe' }}>
                    <Phone size={20} color="#0284c7" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: T.text }}>Call & Support Desk</h6>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                      Phone: +91-11-25302140 / 141<br />
                      Support: +91-11-25302142
                    </p>
                  </div>
                </Card.Body>
              </Card>

              {/* Email Widget */}
              <Card className="border-0 shadow-sm" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px' }}>
                <Card.Body className="d-flex gap-3 p-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '44px', height: '44px', backgroundColor: '#dcfce7' }}>
                    <Mail size={20} color="#16a34a" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: T.text }}>Official Email</h6>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                      General Queries: info.delhi@cdac.in<br />
                      Exam Support: exams.delhi@cdac.in
                    </p>
                  </div>
                </Card.Body>
              </Card>

              {/* Working Hours Widget */}
              <Card className="border-0 shadow-sm" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px' }}>
                <Card.Body className="d-flex gap-3 p-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '44px', height: '44px', backgroundColor: '#fef3c7' }}>
                    <Clock size={20} color="#d97706" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: T.text }}>Working Hours</h6>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                      Monday – Friday: 9:00 AM – 5:30 PM<br />
                      Saturday & Sunday: Closed
                    </p>
                  </div>
                </Card.Body>
              </Card>

            </motion.div>
          </Col>

          {/* Right Column: Contact Form */}
          <Col lg={7}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card className="border-0 shadow-sm" style={{ backgroundColor: T.surface, borderRadius: '16px', border: `1px solid ${T.border}` }}>
                <Card.Body className="p-4 p-md-5">
                  <div className="d-flex align-items-center gap-3 mb-4" style={{ borderLeft: `4px solid ${T.primary}`, paddingLeft: '12px' }}>
                    <h3 className="fw-bold mb-0" style={{ color: T.text }}>
                      Send Us a Message
                    </h3>
                  </div>

                  {status.message && (
                    <Alert variant={status.type} className="mb-4 border-0 d-flex align-items-center gap-2" style={{ borderRadius: '12px' }}>
                      {status.type === 'success' ? <CheckCircle size={20} className="text-success" /> : <ShieldAlert size={20} className="text-danger" />}
                      <span className="fw-medium">{status.message}</span>
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold small mb-2" style={{ color: T.text }}>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '10px',
                              border: `1px solid ${T.border}`,
                              backgroundColor: 'var(--cdac-bg)',
                              color: 'var(--cdac-text)'
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold small mb-2" style={{ color: T.text }}>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '10px',
                              border: `1px solid ${T.border}`,
                              backgroundColor: 'var(--cdac-bg)',
                              color: 'var(--cdac-text)'
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group>
                      <Form.Label className="fw-semibold small mb-2" style={{ color: T.text }}>Subject</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="What is your query about?"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${T.border}`,
                          backgroundColor: 'var(--cdac-bg)',
                          color: 'var(--cdac-text)'
                        }}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className="fw-semibold small mb-2" style={{ color: T.text }}>Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Detail your request or question here..."
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: `1px solid ${T.border}`,
                          backgroundColor: 'var(--cdac-bg)',
                          color: 'var(--cdac-text)',
                          resize: 'none'
                        }}
                      />
                    </Form.Group>

                    <div className="mt-3">
                      <Button
                        className="w-100 py-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                        type="submit"
                        disabled={loading}
                        style={{
                          background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDeep} 100%)`,
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 6px 20px rgba(124,92,255,0.25)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,92,255,0.35)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,92,255,0.25)';
                        }}
                      >
                        <Send size={18} />
                        {loading ? 'Sending Message...' : 'Send Message'}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

        </Row>
      </Container>
    </div>
  );
};

export default Contact;
