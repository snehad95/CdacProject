import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { Play, Quote } from 'lucide-react';
import axios from 'axios';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchPublished = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/testimonials');
        setTestimonials(res.data);
      } catch (err) {
        console.error("Error fetching testimonials", err);
      }
    };
    fetchPublished();
  }, []);

  const handlePlayVideo = (url) => {
    setActiveVideoUrl(url);
    setShowVideoModal(true);
  };

  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentTestimonials = testimonials.slice(startIndex, startIndex + itemsPerPage);

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-5" style={{ background: 'linear-gradient(180deg, var(--cdac-bg) 0%, #ede9fe30 100%)' }}>
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bolder mb-2" style={{ color: '#1e1b4b', letterSpacing: -0.5 }}>
            What Our Students Say
          </h2>
          <p className="text-muted mx-auto mb-0" style={{ maxWidth: '600px' }}>
            Hear directly from C-DAC candidates who transformed their careers through our portal and examination prep modules.
          </p>
          <div className="mx-auto rounded-pill mt-3"
            style={{ width: 80, height: 4, background: 'linear-gradient(90deg, #cbb6e9, #7c5cff)' }} />
        </div>

        <Row className="g-4 justify-content-center">
          {currentTestimonials.map((item) => (
            <Col md={4} key={item._id}>
              <Card className="h-100 border-0 shadow-sm rounded-4 position-relative overflow-hidden hover-card" 
                style={{ 
                  background: 'var(--cdac-surface, #ffffff)', 
                  border: '1px solid var(--cdac-border, #ede9fe)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}>
                <Card.Body className="p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div className="d-flex align-items-center gap-3">
                        {item.profileImageUrl ? (
                          <img 
                            src={item.profileImageUrl} 
                            alt={item.studentName} 
                            className="rounded-circle border border-2 border-primary-subtle"
                            style={{ width: 56, height: 56, objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                            style={{ 
                              width: 56, 
                              height: 56, 
                              fontSize: '1.25rem',
                              background: 'linear-gradient(135deg, #7c5cff, #6a41e6)' 
                            }}
                          >
                             {item.studentName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h5 className="fw-bold mb-0" style={{ color: '#1e1b4b' }}>{item.studentName}</h5>
                          <span className="small text-primary fw-semibold">C-DAC Graduate</span>
                        </div>
                      </div>
                      <Quote size={28} className="text-primary opacity-25" style={{ transform: 'rotate(180deg)' }} />
                    </div>

                    <p className="text-muted mb-4 fs-6 lh-base italic-text" style={{ fontStyle: 'italic' }}>
                      "{item.feedback}"
                    </p>
                  </div>

                  {item.videoUrl && (
                    <div className="mt-3">
                      <Button 
                        variant="primary" 
                        className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0 text-white shadow-sm"
                        style={{ 
                          background: 'linear-gradient(135deg, #7c5cff, #6a41e6)',
                        }}
                        onClick={() => handlePlayVideo(item.videoUrl)}
                      >
                        <Play size={16} fill="#fff" /> Watch Video Testimonial
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-circle d-flex align-items-center justify-content-center shadow-xs"
              style={{ width: '38px', height: '38px', borderColor: '#7c5cff', color: '#7c5cff', borderWidth: '2px', fontWeight: 'bold' }}
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            >
              ←
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentPage(idx)}
                style={{
                  width: currentPage === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: currentPage === idx ? '#7c5cff' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            ))}
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-circle d-flex align-items-center justify-content-center shadow-xs"
              style={{ width: '38px', height: '38px', borderColor: '#7c5cff', color: '#7c5cff', borderWidth: '2px', fontWeight: 'bold' }}
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            >
              →
            </Button>
          </div>
        )}
      </Container>

      {/* Video Testimonial Modal */}
      <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white border-0">
          <Modal.Title className="fw-bold">Student Video Testimonial</Modal.Title>
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
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(124,92,255,0.15) !important;
          border-color: #cbb6e9 !important;
        }
        .italic-text {
          color: #4b5563 !important;
        }
        .fw-800 { font-weight: 800; }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;
