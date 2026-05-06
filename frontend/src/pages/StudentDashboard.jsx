import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user || Object.keys(user).length === 0) {
      navigate('/');
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        const examsRes = await axios.get('http://localhost:5000/api/exams');
        setExams(examsRes.data);

        const resultsRes = await axios.get(`http://localhost:5000/api/results/student/${user.id}`);
        
        // Merge with practice results from localStorage (Filter by current user ID)
        const practiceData = JSON.parse(localStorage.getItem('practiceResults') || '[]');
        const myPracticeData = practiceData.filter(r => r.userId === user.id);
        
        setResults([...resultsRes.data, ...myPracticeData]);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchDashboardData();
  }, [navigate, user.id, user.role]);

  return (
    <Container className="my-5">
      <h2 className="mb-4 fw-bold" style={{ color: '#6a41e6' }}>Welcome, {user.name}</h2>
      
      <Row className="mb-5">
        <Col>
          <h4 className="fw-bold border-bottom pb-2 mb-3">Available Exams</h4>
          <Row>
            {exams
              .filter(exam => !results.some(r => r.examId?._id === exam._id))
              .map(exam => (
              <Col md={4} key={exam._id} className="mb-4">
                <Card className="shadow-sm h-100 border-primary border-top border-3">
                  <Card.Body>
                    <Card.Title className="fw-bold">{exam.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{exam.category}</Card.Subtitle>
                    <Card.Text className="small">{exam.description || 'No description provided.'}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="badge bg-secondary">{exam.durationMinutes} mins</span>
                      <Button size="sm" className="text-white fw-semibold" style={{ backgroundColor: '#6a41e6', border: 'none' }} onClick={() => navigate(`/exam/${exam._id}`)}>Attempt Test</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            {exams.filter(exam => !results.some(r => r.examId?._id === exam._id)).length === 0 && <p className="text-muted">No pending exams available currently.</p>}
          </Row>
        </Col>
      </Row>

      <Row>
        <Col>
          <h4 className="fw-bold border-bottom pb-2 mb-3">My Past Results</h4>
          <Row>
            {results
              .filter(result => result.isPractice || (result.examId && result.examId.resultsPublished))
              .map(result => {
              const passMark = result.examId?.passingMarks ?? Math.round((result.totalQuestions || 10) * 0.4);
              const isPass = result.score >= passMark;

              // Exam window details (only for non-practice results)
              const examStart = result.examId?.startTime ? new Date(result.examId.startTime) : null;
              const examEnd   = result.examId?.endTime   ? new Date(result.examId.endTime)   : null;

              return (
              <Col md={4} key={result._id} className="mb-4">
                <Card className="shadow-sm h-100 bg-white" style={{ borderLeft: `5px solid ${isPass ? '#48bb78' : '#fc8181'}` }}>
                  <Card.Body>
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
                  </Card.Body>
                </Card>
              </Col>
            )})}
            {results.length === 0 && <p className="text-muted">You haven't taken any tests yet.</p>}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDashboard;
