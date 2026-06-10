import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Form, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Image, Video, Send, FileText, CheckCircle, Clock, XCircle, Play, Eye, Award, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Testimonials state
  const [myTestimonials, setMyTestimonials] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [testimonialVideo, setTestimonialVideo] = useState(null);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const examsRes = await axios.get('http://localhost:5000/api/exams');
      setExams(examsRes.data);

      let myResults = [];
      let myCertificates = [];
      if (user.id) {
        const [resultsRes, certRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/results/student/${user.id}`, config),
          axios.get('http://localhost:5000/api/certificates/my', config)
        ]);
        myResults = resultsRes.data;
        myCertificates = certRes.data;
      }
      
      setCertificates(myCertificates);
      
      // Merge with practice results from localStorage (Filter by current user ID)
      const practiceData = JSON.parse(localStorage.getItem('practiceResults') || '[]');
      const myPracticeData = practiceData.filter(r => r.userId === user.id);
      
      setResults([...myResults, ...myPracticeData]);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTestimonials = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/testimonials/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTestimonials(res.data);
    } catch (err) {
      console.error("Error fetching testimonials", err);
    }
  };

  useEffect(() => {
    if (!user || Object.keys(user).length === 0) {
      navigate('/');
      return;
    }
    fetchDashboardData();
    fetchMyTestimonials();
  }, [navigate, user.id]);

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error('Please write some feedback before submitting.');
      return;
    }

    setSubmittingTestimonial(true);
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify({ feedback: feedbackText }));
    if (profileImage) {
      formData.append('image', profileImage);
    }
    if (testimonialVideo) {
      formData.append('video', testimonialVideo);
    }

    try {
      await axios.post('http://localhost:5000/api/testimonials', formData, config);
      toast.success('Testimonial submitted successfully for review!');
      setFeedbackText('');
      setProfileImage(null);
      setTestimonialVideo(null);
      // Clear file input values
      const imgInput = document.getElementById('profileImageInput');
      const vidInput = document.getElementById('videoInput');
      if (imgInput) imgInput.value = '';
      if (vidInput) vidInput.value = '';
      
      fetchMyTestimonials();
    } catch (err) {
      console.error("Error submitting testimonial", err);
      toast.error(err.response?.data?.message || 'Failed to submit testimonial.');
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const playVideo = (url) => {
    setActiveVideoUrl(url);
    setShowVideoModal(true);
  };

  const downloadCertificate = async (pdfUrl, fileName) => {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'certificate.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate download started!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      // Fallback: open in a new tab if fetch fails due to CORS or network issues
      window.open(pdfUrl, '_blank');
      toast.success('Opening certificate in new tab...');
    }
  };

  if (!user || Object.keys(user).length === 0) {
    return <div className="text-center my-5">Loading user details...</div>;
  }

  if (loading) {
    return (
      <Container className="my-5 text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your portal metrics...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {/* Dashboard Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 pb-3 border-bottom">
        <div>
          <h2 className="mb-1 fw-bold" style={{ color: '#6a41e6' }}>Welcome, {user.name}</h2>
          <p className="text-muted mb-0">Manage your course exams, review results, and manage your public testimonials.</p>
        </div>
        <Button variant="outline-secondary" className="fw-semibold px-4 py-2" onClick={() => navigate('/')}>
          ← Back to Home
        </Button>
      </div>

      <Tabs defaultActiveKey="dashboard" className="custom-tabs mb-4 border-0 p-1 bg-light rounded-3" style={{ maxWidth: 'fit-content' }}>
        
        {/* Tab 1: Student Dashboard */}
        <Tab eventKey="dashboard" title="Dashboard Summary" className="pt-3">
          {/* Available Exams */}
          <Row className="mb-5">
            <Col>
              <h4 className="fw-bold pb-2 mb-3 text-dark d-flex align-items-center gap-2">
                <FileText size={20} className="text-primary" /> Available Exams
              </h4>
              <Row>
                {exams.map(exam => {
                  const hasAttempted = results.some(r => r.examId?._id === exam._id);
                  return (
                    <Col md={4} key={exam._id} className="mb-4">
                      <Card className="shadow-sm h-100 border-primary border-top border-3" style={{ opacity: hasAttempted ? 0.85 : 1 }}>
                        <Card.Body className="d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Card.Title className="fw-bold mb-0">{exam.title}</Card.Title>
                              {hasAttempted && (
                                <Badge bg="secondary" className="rounded-pill px-2 py-1 small fw-bold">ATTEMPTED</Badge>
                              )}
                            </div>
                            <Card.Subtitle className="mb-2 text-muted">{exam.category}</Card.Subtitle>
                            <Card.Text className="small">{exam.description || 'No description provided.'}</Card.Text>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="badge bg-secondary">{exam.durationMinutes} mins</span>
                            {hasAttempted ? (
                              <Button size="sm" variant="secondary" className="fw-semibold px-3" disabled>
                                Already Attempted
                              </Button>
                            ) : (
                              <Button size="sm" className="text-white fw-semibold px-3" style={{ backgroundColor: '#7c5cff', border: 'none' }} onClick={() => navigate(`/exam/${exam._id}`)}>Attempt Test</Button>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
                {exams.length === 0 && (
                  <Col>
                    <p className="text-muted bg-white p-3 border rounded text-center">No exams available currently.</p>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>

          {/* Past Results */}
          <Row>
            <Col>
              <h4 className="fw-bold pb-2 mb-3 text-dark d-flex align-items-center gap-2">
                <CheckCircle size={20} className="text-success" /> My Past Results
              </h4>
              <Row>
                {results
                  .filter(result => result.isPractice || (result.examId && result.examId.resultsPublished))
                  .map(result => {
                  const passMark = result.examId?.passingMarks ?? Math.round((result.totalQuestions || 10) * 0.4);
                  const isPass = result.score >= passMark;

                  // Exam window details (only for non-practice results)
                  const examStart = result.examId?.startTime ? new Date(result.examId.startTime) : null;
                  const examEnd   = result.examId?.endTime   ? new Date(result.examId.endTime)   : null;

                  const associatedCert = certificates.find(c => {
                    const cExamId = c.examId?._id || c.examId;
                    const rExamId = result.examId?._id || result.examId;
                    return cExamId === rExamId;
                  });

                  return (
                  <Col md={4} key={result._id} className="mb-4">
                    <Card className="shadow-sm h-100 bg-white" style={{ borderLeft: `5px solid ${isPass ? '#48bb78' : '#fc8181'}` }}>
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <Card.Title className="fw-bold text-dark d-flex justify-content-between align-items-center">
                            {result.isPractice ? `${result.category} (Practice)` : (result.examId?.title || 'Unknown Exam')}
                            <span className={`badge ${isPass ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.75rem' }}>
                              {isPass ? 'PASSED' : 'FAILED'}
                            </span>
                          </Card.Title>

                          {/* Exam date/time window */}
                          {examStart && (
                            <div className="d-flex align-items-center gap-1 mb-2 mt-1 px-2 py-1 rounded-3"
                              style={{ background: '#6a41e610', fontSize: '0.78rem', color: '#6a41e6', fontWeight: 600 }}>
                              📅&nbsp;
                              {examStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              &nbsp;·&nbsp;
                              {examStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {examEnd && (
                                <> → {examEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                              )}
                            </div>
                          )}

                          <Card.Text className="mb-1 mt-2">
                            <strong>Score:</strong> <span style={{ color: '#6a41e6', fontWeight: 'bold' }}>{result.score}</span> / {result.totalQuestions}
                          </Card.Text>
                          {!result.isPractice && result.rank && (
                            <Card.Text className="mb-1">
                              <strong>Ranking:</strong> <span style={{ color: '#ed8936', fontWeight: 'bold' }}>#{result.rank}</span> 
                              <span className="small text-muted"> out of {result.totalParticipants}</span>
                            </Card.Text>
                          )}
                          <Card.Text className="small text-muted mb-0">
                            <strong>Submitted:</strong> {new Date(result.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </Card.Text>
                          <Card.Text className="small text-muted">
                            <strong>On:</strong> {new Date(result.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Card.Text>
                        </div>

                        {associatedCert && (
                          <div className="mt-3 pt-3 border-top">
                            <div className="d-flex align-items-center gap-1 mb-2 text-warning fw-bold small">
                              <Award size={15} /> Certificate Issued (PDF)
                            </div>
                            <div className="d-flex gap-2">
                              <a 
                                href={associatedCert.pdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-sm btn-outline-primary py-1 px-2 d-flex align-items-center justify-content-center gap-1 flex-grow-1"
                                style={{ fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #7c5cff', color: '#7c5cff' }}
                              >
                                <Eye size={12} /> Open PDF
                              </a>
                              <Button 
                                size="sm"
                                onClick={() => downloadCertificate(associatedCert.pdfUrl, `Certificate_${result.examId?.title.replace(/\s+/g, '_') || 'Exam'}.pdf`)}
                                className="text-white py-1 px-2 d-flex align-items-center justify-content-center gap-1 flex-grow-1"
                                style={{ fontSize: '0.75rem', backgroundColor: '#7c5cff', border: 'none', borderRadius: '6px' }}
                              >
                                <Download size={12} /> Download
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                )})}
                {results.length === 0 && (
                  <Col>
                    <p className="text-muted bg-white p-3 border rounded text-center">You haven't taken any tests yet.</p>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        </Tab>

        {/* Tab 2: Testimonials Submission */}
        <Tab eventKey="testimonials" title="Share Testimonial" className="pt-3">
          <Row className="g-4">
            
            {/* Left: Testimonial submission form */}
            <Col lg={5}>
              <Card className="border-0 shadow-sm rounded-4 p-4" style={{ border: '1px solid #ede9fe' }}>
                <h5 className="fw-bold mb-3" style={{ color: '#6a41e6' }}>Submit Testimonial</h5>
                <p className="text-muted small mb-4">Share your feedback about the examination portal. Approved feedback will appear publicly on the Home Page!</p>
                
                <Form onSubmit={handleTestimonialSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Profile Picture (Optional)</Form.Label>
                    <div className="d-flex align-items-center gap-2">
                      <Form.Control 
                        id="profileImageInput" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setProfileImage(e.target.files[0])} 
                      />
                    </div>
                    <Form.Text className="text-muted small">JPG, PNG format only</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Video Testimonial (Optional)</Form.Label>
                    <div className="d-flex align-items-center gap-2">
                      <Form.Control 
                        id="videoInput" 
                        type="file" 
                        accept="video/*" 
                        onChange={(e) => setTestimonialVideo(e.target.files[0])} 
                      />
                    </div>
                    <Form.Text className="text-muted small">MP4, WEBM format only</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small">Your Feedback / Thoughts</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={5} 
                      placeholder="Tell us about your learning experience..." 
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      maxLength={500}
                      required 
                    />
                    <div className="text-end text-muted small mt-1">{feedbackText.length}/500 chars</div>
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: '#7c5cff', border: 'none' }}
                    disabled={submittingTestimonial}
                  >
                    <Send size={16} /> {submittingTestimonial ? 'Submitting...' : 'Submit Testimonial'}
                  </Button>
                </Form>
              </Card>
            </Col>

            {/* Right: Submission history */}
            <Col lg={7}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                Submission History
              </h5>
              <div className="d-flex flex-column gap-3">
                {myTestimonials.map((item) => (
                  <Card key={item._id} className="border rounded-4 p-3 bg-white shadow-xs">
                    <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2">
                        {item.profileImageUrl ? (
                          <img 
                            src={item.profileImageUrl} 
                            alt="Profile" 
                            className="rounded-circle border" 
                            style={{ width: 36, height: 36, objectFit: 'cover' }} 
                          />
                        ) : (
                          <div 
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-semibold" 
                            style={{ width: 36, height: 36 }}
                          >
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="fw-bold small">{user.name}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-1 align-items-center">
                        {item.status === 'pending' && <Badge bg="warning"><Clock size={11} /> Pending</Badge>}
                        {item.status === 'approved' && <Badge bg="success"><CheckCircle size={11} /> Approved</Badge>}
                        {item.status === 'rejected' && <Badge bg="danger"><XCircle size={11} /> Rejected</Badge>}

                        {item.isPublished ? (
                          <Badge bg="info"><Eye size={11} /> Published</Badge>
                        ) : (
                          <Badge bg="secondary"><Clock size={11} /> Draft</Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-muted small mb-2 italic-text" style={{ fontStyle: 'italic' }}>
                      "{item.feedback}"
                    </p>

                    {item.videoUrl && (
                      <div>
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          className="py-1 px-2 d-flex align-items-center gap-1 mt-1"
                          onClick={() => playVideo(item.videoUrl)}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <Play size={12} fill="#7c5cff" /> Play Uploaded Video
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}

                {myTestimonials.length === 0 && (
                  <p className="text-muted text-center py-4 bg-white border rounded">
                    You haven't submitted any testimonials yet. Share your experience!
                  </p>
                )}
              </div>
            </Col>
          </Row>
        </Tab>

        {/* Tab 3: My Certificates */}
        <Tab eventKey="certificates" title="My Certificates" className="pt-3">
          <h4 className="fw-bold pb-2 mb-3 text-dark d-flex align-items-center gap-2">
            <Award size={20} className="text-warning" /> My Certificates
          </h4>
          <Row>
            {certificates.map(cert => (
              <Col md={4} key={cert._id} className="mb-4">
                <Card className="shadow-sm h-100 border-0 rounded-4 overflow-hidden" style={{ border: '1px solid #ede9fe', transition: 'all 0.3s ease' }}>
                  <div className="p-3 d-flex align-items-center justify-content-between border-bottom" style={{ backgroundColor: '#fcfbff' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-2 rounded-3 text-warning" style={{ backgroundColor: '#fff8eb' }}>
                        <Award size={20} />
                      </div>
                      <div>
                        <div className="fw-bold text-dark small" style={{ fontSize: '0.85rem' }}>Certificate issued</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {cert.publishedAt ? new Date(cert.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(cert.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <Badge bg="success-subtle" className="text-success border border-success-subtle rounded-pill px-2 py-1 small fw-bold" style={{ fontSize: '0.7rem' }}>
                      PDF Format
                    </Badge>
                  </div>
                  <Card.Body className="d-flex flex-column justify-content-between p-4">
                    <div>
                      <h5 className="fw-bold mb-1 text-dark">{cert.examId?.title || 'Examination Certificate'}</h5>
                      <p className="text-muted small mb-3">{cert.examId?.description || 'Successfully cleared the final examination requirements.'}</p>
                      
                      {/* Document Preview Frame mockup */}
                      <div className="d-flex align-items-center justify-content-center flex-column py-4 mb-3 rounded-3 bg-light border border-dashed border-2" style={{ borderColor: '#e2e8f0' }}>
                        <FileText size={40} className="text-danger mb-2" />
                        <span className="text-dark fw-bold small text-center px-2">Certificate_{cert.examId?.title.substring(0, 15) || 'Exam'}.pdf</span>
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Ready to view or download</span>
                      </div>
                    </div>
                    
                    <div className="d-flex gap-2 mt-2">
                      <a 
                        href={cert.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-outline-primary fw-semibold flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                        style={{ borderRadius: '8px', border: '1px solid #7c5cff', color: '#7c5cff' }}
                      >
                        <Eye size={15} /> Open PDF
                      </a>
                      <Button 
                        onClick={() => downloadCertificate(cert.pdfUrl, `Certificate_${cert.examId?.title.replace(/\s+/g, '_') || 'Exam'}.pdf`)}
                        className="text-white fw-semibold flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                        style={{ backgroundColor: '#7c5cff', border: 'none', borderRadius: '8px' }}
                      >
                        <Download size={15} /> Download
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            {certificates.length === 0 && (
              <Col>
                <p className="text-muted bg-white p-3 border rounded text-center">No certificates issued or published yet.</p>
              </Col>
            )}
          </Row>
        </Tab>
      </Tabs>

      {/* Video Modal */}
      <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white border-0">
          <Modal.Title className="fw-bold">My Testimonial Video</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark p-0">
          {activeVideoUrl && (
            <video 
              src={activeVideoUrl} 
              controls 
              autoPlay 
              className="w-100" 
              style={{ maxHeight: '500px' }}
            />
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        .custom-tabs .nav-link {
          color: #4b5563;
          font-weight: 600;
          border-radius: 8px;
          padding: 8px 16px;
          border: none !important;
          transition: all 0.2s ease;
        }
        .custom-tabs .nav-link.active {
          background-color: #7c5cff !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(124, 92, 255, 0.2);
        }
      `}</style>
    </Container>
  );
};

export default StudentDashboard;
