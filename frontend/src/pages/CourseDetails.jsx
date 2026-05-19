import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Nav, Card, Button, Accordion, Spinner, Badge } from 'react-bootstrap';
import {
  Download, ChevronRight, MapPin, Phone, Mail, Info, FileText, CreditCard,
  List, CheckCircle, HelpCircle, Monitor, Shield, Smartphone, CircuitBoard,
  Cpu, GitPullRequest, ArrowLeft, Clock, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const CourseDetails = () => {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('focus');

  const getIcon = (abbr) => {
    if (abbr === 'AC') return Monitor;
    if (abbr === 'ASSD') return Shield;
    if (abbr === 'MC') return Smartphone;
    if (abbr === 'VLSI') return CircuitBoard;
    if (abbr === 'ESD') return Cpu;
    return GitPullRequest;
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
        const data = res.data;
        setCourseInfo({ ...data, description: data.focus });
      } catch (err) {
        console.error('Error fetching course', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '70vh' }}
      >
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted fw-medium">Loading course details…</p>
      </div>
    );
  }

  if (!courseInfo) {
    return (
      <Container className="my-5 text-center py-5">
        <div className="p-5 bg-white rounded-4 shadow-sm border d-inline-block">
          <h3 className="fw-bold mb-3">Course Not Found</h3>
          <p className="text-muted mb-4">The course you're looking for doesn't exist or has been moved.</p>
          <Link to="/courses" className="btn btn-primary px-4 py-2 rounded-pill">
            <ArrowLeft size={16} className="me-2" />
            Back to Courses
          </Link>
        </div>
      </Container>
    );
  }

  const Icon = getIcon(courseInfo.abbr);
  const accent = courseInfo.iconColor || '#2a6ce4';

  const navItems = [
    { id: 'focus', label: 'Course Focus', icon: Info },
    { id: 'eligibility', label: 'Eligibility Criteria', icon: FileText },
    { id: 'fees', label: 'Course Fees', icon: CreditCard },
    { id: 'contents', label: 'Course Contents', icon: List },
    { id: 'outcome', label: 'Course Outcome', icon: CheckCircle },
    { id: 'training', label: 'Training Centres', icon: MapPin },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.35, ease: 'easeOut' },
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'focus':
        return (
          <motion.p key="focus" {...fadeIn} style={{ lineHeight: 1.85, fontSize: '1.05rem', color: 'var(--cdac-text-muted)' }}>
            {courseInfo.description}
          </motion.p>
        );
      case 'eligibility':
      case 'fees':
      case 'outcome':
        return (
          <motion.div
            key={activeTab}
            {...fadeIn}
            style={{ whiteSpace: 'pre-line', lineHeight: 1.85, color: 'var(--cdac-text-muted)', fontSize: '1rem' }}
          >
            {courseInfo[activeTab]}
          </motion.div>
        );
      case 'contents':
        return (
          <motion.div key="contents" {...fadeIn}>
            <Accordion defaultActiveKey="0" flush>
              {courseInfo.contents.map((item, idx) => (
                <Accordion.Item
                  eventKey={idx.toString()}
                  key={idx}
                  className="mb-3 border-0 rounded-4 overflow-hidden shadow-sm"
                  style={{ background: 'var(--cdac-bg)' }}
                >
                  <Accordion.Header>
                    <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `${accent}15`, color: accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.9rem',
                          }}
                        >
                          {idx + 1}
                        </div>
                        <span className="fw-semibold" style={{ color: 'var(--cdac-text)' }}>{item.title}</span>
                      </div>
                      <Badge
                        bg=""
                        className="d-flex align-items-center gap-1 px-3 py-2 fw-medium"
                        style={{ background: 'var(--cdac-border)', color: 'var(--cdac-text-muted)', fontSize: '0.75rem' }}
                      >
                        <Clock size={12} /> {item.duration}
                      </Badge>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="bg-white">
                    <Row>
                      {item.modules.map((mod, midx) => (
                        <Col md={6} key={midx} className="mb-3">
                          <div className="d-flex align-items-start p-2 rounded-3 h-100" style={{ background: 'var(--cdac-bg)' }}>
                            <ChevronRight size={16} className="me-2 flex-shrink-0 mt-1" style={{ color: accent }} />
                            <span style={{ fontSize: '0.92rem', color: 'var(--cdac-text)' }}>{mod}</span>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </motion.div>
        );
      case 'training':
        return (
          <motion.div key="training" {...fadeIn}>
            <Row className="g-4">
              {courseInfo.training.map((center, idx) => (
                <Col md={12} key={idx}>
                  <Card className="border-0 rounded-4 shadow-sm overflow-hidden h-100">
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}80)` }} />
                    <Card.Body className="p-4">
                      <h5 className="fw-bold mb-4" style={{ color: 'var(--cdac-text)' }}>{center.name}</h5>
                      {[
                        { Icon: MapPin, color: '#ef4444', text: center.address },
                        { Icon: Phone, color: '#10b981', text: center.phone },
                        { Icon: Info, color: '#3b82f6', label: 'Contact', text: center.contact },
                        { Icon: Mail, color: '#f59e0b', label: 'Email', text: center.email },
                      ].map(({ Icon: I, color, label, text }, i) => (
                        <div key={i} className="d-flex align-items-start mb-3">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 me-3"
                            style={{ width: 36, height: 36, background: `${color}15`, color }}
                          >
                            <I size={16} />
                          </div>
                          <p className="mb-0 pt-1" style={{ color: 'var(--cdac-text-muted)' }}>
                            {label && <strong className="text-dark">{label}: </strong>}{text}
                          </p>
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-top">
                        <div className="d-flex align-items-start">
                          <BookOpen size={16} className="me-2 mt-1 text-muted flex-shrink-0" />
                          <p className="mb-0 small text-muted">
                            <strong className="text-dark">Courses offered here:</strong> {center.otherCourses}
                          </p>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </motion.div>
        );
      case 'faqs':
        return (
          <motion.div key="faqs" {...fadeIn}>
            {courseInfo.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="mb-3 p-4 rounded-4 shadow-sm position-relative overflow-hidden"
                style={{ background: 'var(--cdac-bg)', borderLeft: `4px solid ${accent}` }}
              >
                <h6 className="fw-bold mb-2 d-flex align-items-start" style={{ color: 'var(--cdac-text)' }}>
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle me-2 flex-shrink-0"
                    style={{ width: 24, height: 24, background: accent, color: '#fff', fontSize: '0.75rem' }}
                  >
                    Q
                  </span>
                  {faq.q}
                </h6>
                <p className="mb-0 ps-4 ms-1" style={{ color: 'var(--cdac-text-muted)', lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            ))}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ background: 'var(--cdac-bg)', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Container>
        {/* Breadcrumb */}
        <div className="mb-3">
          <Link to="/courses" className="text-decoration-none small text-muted d-inline-flex align-items-center fw-medium">
            <ArrowLeft size={14} className="me-1" /> All Courses
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="position-relative mb-4 rounded-4 overflow-hidden shadow-sm"
          style={{
            background: `linear-gradient(135deg, var(--cdac-surface) 0%, var(--cdac-surface) 60%, ${accent}25 100%)`,
            border: `1px solid var(--cdac-border)`,
          }}
        >
          <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}60)` }} />
          <div className="p-4 p-md-5">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-4">
              <div className="d-flex align-items-center flex-grow-1" style={{ minWidth: 0 }}>
                <div className="me-4 d-none d-md-flex flex-shrink-0">
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #1e293b, #334155)',
                      width: 110, height: 110, borderRadius: 18,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'white', boxShadow: `0 10px 30px ${accent}30`,
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        background: `radial-gradient(circle at top right, ${accent}40, transparent 70%)`,
                      }}
                    />
                    <div
                      style={{
                        width: 44, height: 44, background: accent, borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 6, position: 'relative', zIndex: 1,
                      }}
                    >
                      <Icon size={22} strokeWidth={2.5} />
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px', position: 'relative', zIndex: 1 }}>
                      PGCP in
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, position: 'relative', zIndex: 1 }}>
                      {courseInfo.abbr}
                    </div>
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <Badge
                    bg=""
                    className="mb-2 px-3 py-2 fw-semibold"
                    style={{ background: `${accent}`, color: '#ffffff', fontSize: '0.7rem', letterSpacing: '0.5px' }}
                  >
                    POST GRADUATE CERTIFICATE PROGRAMME
                  </Badge>
                  <h2 className="fw-bold mb-0" style={{ color: 'var(--cdac-text)', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', lineHeight: 1.3 }}>
                    {courseInfo.title}
                  </h2>
                </div>
              </div>

              <div className="text-end ms-auto">
                <Button
                  className="fw-semibold px-4 py-2 rounded-3 d-inline-flex align-items-center border-0 mb-2"
                  as="a"
                  href={courseInfo.flyerUrl || '/PDF_PGCP_AC.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    boxShadow: `0 6px 20px ${accent}40`,
                  }}
                >
                  <Download size={16} className="me-2" /> Download Flyer
                </Button>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {courseInfo.fileType || 'PDF'} · {courseInfo.fileSize || '992 KB'} · {courseInfo.uploadDate || '27/11/2025'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <Row className="g-4">
          {/* Sidebar */}
          <Col lg={3}>
            <div className="sticky-top" style={{ top: 24, zIndex: 10 }}>
              <Nav className="flex-column bg-white rounded-4 shadow-sm border p-2">
                {navItems.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Nav.Link
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="d-flex align-items-center py-3 px-3 rounded-3 mb-1 position-relative"
                      style={{
                        background: isActive ? `linear-gradient(135deg, ${accent}, ${accent}dd)` : 'transparent',
                        color: isActive ? '#fff' : 'var(--cdac-text-muted)',
                        boxShadow: isActive ? `0 6px 18px ${accent}40` : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        fontWeight: isActive ? 600 : 500,
                      }}
                      onMouseEnter={(e) => { 
                        if (!isActive) {
                          e.currentTarget.style.background = 'var(--cdac-surface-alt)';
                          e.currentTarget.style.color = 'var(--cdac-primary)';
                        }
                      }}
                      onMouseLeave={(e) => { 
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--cdac-text-muted)';
                        }
                      }}
                    >
                      <ItemIcon size={17} className="me-3 flex-shrink-0" />
                      <span style={{ fontSize: '0.92rem' }}>{item.label}</span>
                      {isActive && <ChevronRight size={16} className="ms-auto" />}
                    </Nav.Link>
                  );
                })}
              </Nav>
            </div>
          </Col>

          {/* Content */}
          <Col lg={9}>
            <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border" style={{ minHeight: 500 }}>
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{ width: 42, height: 42, background: `${accent}15`, color: accent }}
                >
                  {React.createElement(navItems.find(n => n.id === activeTab).icon, { size: 20 })}
                </div>
                <h3 className="fw-bold mb-0" style={{ color: 'var(--cdac-text)', fontSize: '1.4rem' }}>
                  {navItems.find(n => n.id === activeTab).label}
                </h3>
              </div>
              <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
            </div>
          </Col>
        </Row>

        <div className="mt-5 text-center">
          <Button
            as={Link}
            to="/courses"
            variant="outline-secondary"
            className="px-4 py-2 rounded-pill fw-semibold d-inline-flex align-items-center"
          >
            <ArrowLeft size={16} className="me-2" /> Back to All Courses
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default CourseDetails;
