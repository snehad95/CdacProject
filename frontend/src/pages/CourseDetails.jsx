import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Nav, Card, Button, Accordion, Spinner } from 'react-bootstrap';
import { Download, ChevronRight, MapPin, Phone, Mail, Info, FileText, CreditCard, List, CheckCircle, HelpCircle, Monitor, Shield, Smartphone, CircuitBoard, Cpu, GitPullRequest } from 'lucide-react';
import { motion } from 'framer-motion';
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
        // Map backend data to local structure
        const data = res.data;
        setCourseInfo({
          ...data,
          description: data.focus, // Map 'focus' to 'description' as used in component
        });
      } catch (err) {
        console.error("Error fetching course", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!courseInfo) {
    return (
      <Container className="my-5 text-center">
        <h3>Course not found</h3>
        <Link to="/courses" className="btn btn-primary mt-3">Back to Courses</Link>
      </Container>
    );
  }

  const Icon = getIcon(courseInfo.abbr);

  const navItems = [
    { id: 'focus', label: 'Course Focus', icon: Info },
    { id: 'eligibility', label: 'Eligibility Criteria', icon: FileText },
    { id: 'fees', label: 'Course Fees', icon: CreditCard },
    { id: 'contents', label: 'Course Contents', icon: List },
    { id: 'outcome', label: 'Course Outcome', icon: CheckCircle },
    { id: 'training', label: 'Training Centres', icon: MapPin },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'focus':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#444' }}>{courseInfo.description}</p>
          </motion.div>
        );
      case 'eligibility':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#444' }}>{courseInfo.eligibility}</div>
          </motion.div>
        );
      case 'fees':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#444' }}>{courseInfo.fees}</div>
          </motion.div>
        );
      case 'contents':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Accordion>
              {courseInfo.contents.map((item, idx) => (
                <Accordion.Item eventKey={idx.toString()} key={idx} className="mb-2 border rounded shadow-sm">
                  <Accordion.Header>
                    <div className="d-flex justify-content-between w-100 pe-3">
                      <span className="fw-bold" style={{ color: '#2a6ce4' }}>{item.title}</span>
                      <span className="text-muted small"> - {item.duration}</span>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      {item.modules.map((mod, midx) => (
                        <Col md={6} key={midx} className="mb-2">
                          <div className="d-flex align-items-center">
                            <ChevronRight size={14} className="me-2 text-primary" />
                            <span style={{ fontSize: '0.9rem' }}>{mod}</span>
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
      case 'outcome':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#444' }}>{courseInfo.outcome}</div>
          </motion.div>
        );
      case 'training':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {courseInfo.training.map((center, idx) => (
              <Card key={idx} className="border-0 bg-light p-4 rounded-4 shadow-sm mb-4">
                <h5 className="fw-bold mb-4" style={{ color: '#2a6ce4' }}>{center.name}</h5>
                <div className="mb-3 d-flex align-items-start">
                  <MapPin size={20} className="me-3 text-danger flex-shrink-0" />
                  <p className="mb-0">{center.address}</p>
                </div>
                <div className="mb-3 d-flex align-items-center">
                  <Phone size={20} className="me-3 text-success flex-shrink-0" />
                  <p className="mb-0">{center.phone}</p>
                </div>
                <div className="mb-3 d-flex align-items-start">
                  <Info size={20} className="me-3 text-info flex-shrink-0" />
                  <p className="mb-0"><strong>Contact:</strong> {center.contact}</p>
                </div>
                <div className="mb-3 d-flex align-items-start">
                  <Mail size={20} className="me-3 text-warning flex-shrink-0" />
                  <p className="mb-0"><strong>Email:</strong> {center.email}</p>
                </div>
                <div className="mt-4 pt-3 border-top">
                  <p className="mb-0"><strong>Courses offered here:</strong> {center.otherCourses}</p>
                </div>
              </Card>
            ))}
          </motion.div>
        );
      case 'faqs':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {courseInfo.faqs.map((faq, idx) => (
              <div key={idx} className="mb-4 p-3 border-start border-4 border-primary bg-light rounded-2 shadow-sm">
                <h6 className="fw-bold mb-2">Q: {faq.q}</h6>
                <p className="mb-0 text-muted">A: {faq.a}</p>
              </div>
            ))}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="my-5 pb-5">
      {/* Header Section */}
      <div className="d-flex flex-wrap align-items-start justify-content-between mb-5 p-4 bg-white rounded-4 shadow-sm border">
        <div className="d-flex align-items-center mb-3 mb-md-0 flex-grow-1">
          <div className="me-4 d-none d-md-block">
            {/* Logo simulation */}
            <div 
              style={{ 
                backgroundColor: '#3b3e47', 
                width: '130px', 
                height: '90px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                borderRight: `5px solid ${courseInfo.iconColor}`,
                borderBottom: `5px solid ${courseInfo.iconColor}`,
                color: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              <div 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  backgroundColor: courseInfo.iconColor, 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  flexShrink: 0
                }}
              >
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: '#bbb', fontWeight: '500', textTransform: 'uppercase', marginBottom: '-2px' }}>PGCP in</div>
                <div style={{ fontSize: '20px', fontWeight: '800' }}>{courseInfo.abbr}</div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="fw-bold mb-1" style={{ color: '#1a1a1a', maxWidth: '800px' }}>{courseInfo.title}</h2>
          </div>
        </div>
        <div className="text-end">
          <Button 
            variant="primary" 
            className="fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center ms-auto mb-2"
            as="a"
            href={courseInfo.flyerUrl || "/PDF_PGCP_AC.pdf"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={18} className="me-2" /> Download Course Flyer
          </Button>
          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
            (File Type: {courseInfo.fileType || 'PDF'}, File Size: {courseInfo.fileSize || '992 KB'}, Date: {courseInfo.uploadDate || '27/11/2025'})
          </div>
        </div>
      </div>

      <Row className="g-5">
        {/* Sidebar */}
        <Col lg={3}>
          <div className="sticky-top" style={{ top: '100px', zIndex: 10 }}>
            <Nav className="flex-column bg-white rounded-4 shadow-sm border p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Nav.Link 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`d-flex align-items-center py-3 px-4 rounded-3 mb-1 transition-all ${activeTab === item.id ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
                  >
                    <Icon size={18} className="me-3" />
                    <span className="fw-semibold">{item.label}</span>
                  </Nav.Link>
                );
              })}
            </Nav>
          </div>
        </Col>

        {/* Content Area */}
        <Col lg={9}>
          <div className="bg-white p-5 rounded-4 shadow-sm border h-100 min-vh-50">
            <h3 className="fw-bold mb-4 border-bottom pb-3">{navItems.find(n => n.id === activeTab).label}</h3>
            {renderContent()}
          </div>
        </Col>
      </Row>

      <div className="mt-5 text-center">
        <Button as={Link} to="/courses" variant="outline-secondary" className="px-5 py-2 rounded-pill fw-bold">
          ← Back to All Courses
        </Button>
      </div>
    </Container>
  );
};

export default CourseDetails;
