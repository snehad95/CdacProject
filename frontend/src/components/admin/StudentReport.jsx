import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, InputGroup, Table, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { Search, User, Mail, GraduationCap, ChevronRight, FileText, BarChart3 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentReport = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const handleOpenSubmissionModal = (result) => {
    setSelectedResult(result);
    setShowSubmissionModal(true);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.get('http://localhost:5000/api/users', config);
      // Filter for students only
      setStudents(data.filter(u => u.role === 'student'));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.get(`http://localhost:5000/api/results/student/${student._id}`, config);
      setStudentResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div>
      <Row className="g-4">
        {/* Student List Sidebar */}
        <Col lg={4}>
          <div className="d-flex align-items-center gap-2 mb-4">
            <div style={{ backgroundColor: '#7c5cff15', color: '#7c5cff', padding: '10px', borderRadius: '12px' }}>
              <User size={24} />
            </div>
            <h4 className="fw-bold mb-0">Student Registry</h4>
          </div>

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-3">
              <InputGroup className="mb-3 bg-light rounded-3 overflow-hidden border-0">
                <InputGroup.Text className="bg-transparent border-0 pe-0 text-muted">
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control 
                  placeholder="Search student..." 
                  className="bg-transparent border-0 shadow-none py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {filteredStudents.map(s => (
                  <div 
                    key={s._id}
                    onClick={() => handleViewDetails(s)}
                    className={`d-flex align-items-center justify-content-between p-3 rounded-4 mb-2 cursor-pointer transition-all ${selectedStudent?._id === s._id ? 'bg-primary text-white shadow-sm' : 'bg-light hover-bg-light-dark'}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3 overflow-hidden">
                      <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                        {s.name[0].toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="fw-bold text-truncate">{s.name}</div>
                        <div className={`small text-truncate ${selectedStudent?._id === s._id ? 'text-white-50' : 'text-muted'}`}>{s.email}</div>
                      </div>
                    </div>
                    <ChevronRight size={18} opacity={0.5} />
                  </div>
                ))}
                {filteredStudents.length === 0 && <p className="text-center text-muted py-4">No students found.</p>}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Report Display Area */}
        <Col lg={8}>
          {selectedStudent ? (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary text-white rounded-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
                    <GraduationCap size={30} />
                  </div>
                  <div>
                    <h3 className="fw-800 mb-0">{selectedStudent.name}</h3>
                    <p className="text-muted mb-0">{selectedStudent.email}</p>
                  </div>
                </div>
                <div className="text-end">
                   <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill">ID: {selectedStudent._id.slice(-6).toUpperCase()}</Badge>
                </div>
              </div>

              {detailsLoading ? (
                <div className="text-center p-5"><Spinner animation="grow" variant="primary" /></div>
              ) : (
                <Row className="g-4">
                  {/* Summary Cards */}
                  <Col md={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-3 rounded-4 bg-primary-subtle text-primary">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h6 className="text-muted small fw-bold text-uppercase mb-1">Exams Given</h6>
                          <h4 className="fw-800 mb-0">{studentResults.length}</h4>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-3 rounded-4 bg-success-subtle text-success">
                          <BarChart3 size={24} />
                        </div>
                        <div>
                          <h6 className="text-muted small fw-bold text-uppercase mb-1">Pass Status</h6>
                          <h4 className="fw-800 mb-0">
                            {studentResults.filter(r => r.passed).length} / {studentResults.length} Passed
                          </h4>
                        </div>
                      </div>
                    </Card>
                  </Col>

                  {/* Results Table */}
                  <Col md={12}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="p-3 bg-light border-bottom">
                        <h6 className="fw-bold mb-0">Detailed Performance Report</h6>
                      </div>
                      <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="border-0 small text-muted text-uppercase fw-bold px-4">Exam/Test Name</th>
                            <th className="border-0 small text-muted text-uppercase fw-bold px-4">Score</th>
                            <th className="border-0 small text-muted text-uppercase fw-bold px-4">Result</th>
                            <th className="border-0 small text-muted text-uppercase fw-bold px-4">Rank</th>
                            <th className="border-0 small text-muted text-uppercase fw-bold px-4">Date</th>
                            <th className="border-0 small text-muted text-uppercase fw-bold px-4">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentResults.map((res, i) => (
                            <tr key={res._id} className="align-middle">
                              <td className="px-4 py-3 border-0">
                                <div className="fw-bold">{res.examId?.title || 'Practice Test'}</div>
                                <div className="text-muted small">{res.examId?.category || 'General'}</div>
                              </td>
                              <td className="px-4 py-3 border-0">
                                <div className="fw-800 text-primary">{res.score} / {res.totalQuestions}</div>
                                <div className="progress mt-1" style={{ height: '4px', width: '60px' }}>
                                  <div className="progress-bar" style={{ width: `${(res.score/res.totalQuestions)*100}%` }}></div>
                                </div>
                              </td>
                              <td className="px-4 py-3 border-0">
                                <Badge bg={res.passed ? 'success' : 'danger'} className="rounded-pill px-3">
                                  {res.passed ? 'PASSED' : 'FAILED'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 border-0">
                                <div className="fw-bold">#{res.rank || 'N/A'}</div>
                              </td>
                              <td className="px-4 py-3 border-0 text-muted small">
                                {new Date(res.submittedAt || res.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 border-0">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  className="rounded-3 px-3 fw-semibold"
                                  onClick={() => handleOpenSubmissionModal(res)}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {studentResults.length === 0 && (
                            <tr>
                              <td colSpan="6" className="text-center py-5 text-muted">No results recorded for this student.</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Card>
                  </Col>
                </Row>
              )}
            </div>
          ) : (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-5 bg-white rounded-4 border-dashed" style={{ border: '2px dashed #e2e8f0', minHeight: '400px' }}>
              <GraduationCap size={60} className="mb-3 opacity-20" />
              <h5 className="fw-bold">Select a Student</h5>
              <p>Click on a student from the list to view their complete academic report</p>
            </div>
          )}
        </Col>
      </Row>

      {/* Detailed Submission Modal */}
      <Modal show={showSubmissionModal} onHide={() => setShowSubmissionModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">
            Submission Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedResult && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-4 bg-light border">
                <div>
                  <h6 className="text-muted small fw-bold text-uppercase mb-1">Exam Title</h6>
                  <h5 className="fw-bold text-dark mb-0">{selectedResult.examId?.title || 'Practice Test'}</h5>
                </div>
                <div className="text-end">
                  <h6 className="text-muted small fw-bold text-uppercase mb-1">Score</h6>
                  <h4 className="fw-bold text-primary mb-0">{selectedResult.score} / {selectedResult.totalQuestions}</h4>
                </div>
              </div>

              <h6 className="fw-bold mb-3">Submitted Answers:</h6>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="pe-2">
                {selectedResult.answers && selectedResult.answers.length > 0 ? (
                  selectedResult.answers.map((ans, idx) => {
                    const question = ans.questionId;
                    const isSubj = question?.type === 'subjective';
                    return (
                      <Card key={ans._id || idx} className="border rounded-4 mb-3 p-3 bg-white shadow-none">
                        <div className="fw-bold small text-primary mb-2">
                          Question {idx + 1} 
                          <span className={`badge ms-2 ${isSubj ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                            {isSubj ? 'SUBJECTIVE' : 'MCQ'}
                          </span>
                        </div>
                        <p className="fw-semibold text-dark mb-3" style={{ fontSize: '0.95rem' }}>
                          {question?.text || 'Question text not available (deleted)'}
                        </p>

                        {isSubj ? (
                          <div>
                            <div className="p-3 rounded-3 bg-light border border-dashed mb-3">
                              <div className="small fw-bold text-muted text-uppercase mb-1">Written Answer / Java Code:</div>
                              <pre style={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                fontFamily: 'Consolas, Monaco, monospace',
                                fontSize: '0.85rem',
                                margin: 0,
                                color: '#1e293b'
                              }}>
                                {ans.subjectiveAnswer || '(No answer written)'}
                              </pre>
                            </div>
                            
                            <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-light-subtle">
                              <div className="small fw-bold text-dark">
                                Question Max Marks: <span className="badge bg-secondary">{question?.marks || 1}</span>
                              </div>
                              <Form className="d-flex align-items-center gap-2" onSubmit={async (e) => {
                                e.preventDefault();
                                const val = parseFloat(e.target.marksInput.value);
                                if (isNaN(val) || val < 0 || val > (question?.marks || 1)) {
                                  return toast.error(`Enter a value between 0 and ${question?.marks || 1}`);
                                }
                                try {
                                  const token = localStorage.getItem('token');
                                  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                                  const res = await axios.put(`http://localhost:5000/api/results/${selectedResult._id}/grade`, {
                                    questionId: question?._id,
                                    marksObtained: val
                                  }, config);
                                  
                                  setSelectedResult(res.data);
                                  toast.success('Grade updated successfully!');
                                  setStudentResults(prev => prev.map(item => item._id === res.data._id ? res.data : item));
                                } catch (err) {
                                  console.error(err);
                                  toast.error(err.response?.data?.message || 'Failed to update grade');
                                }
                              }}>
                                <Form.Label className="small fw-semibold text-muted mb-0">Award Marks:</Form.Label>
                                <Form.Control 
                                  name="marksInput"
                                  type="number" 
                                  step="0.5"
                                  min="0"
                                  max={question?.marks || 1}
                                  defaultValue={ans.marksObtained || 0}
                                  style={{ width: '80px' }}
                                  className="form-control-sm"
                                  required
                                />
                                <Button type="submit" variant="success" size="sm" className="fw-bold">Save Grade</Button>
                              </Form>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-2 small">
                            <div>
                              <strong>Correct Option(s):</strong>{' '}
                              <span className="text-success fw-semibold">
                                {question?.options?.filter(o => o.isCorrect).map(o => o.text).join(', ') || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <strong>Student Selected:</strong>{' '}
                              <span className={ans.isCorrect ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
                                {ans.selectedOptionText || '(Skipped)'}
                              </span>
                              {ans.isCorrect ? (
                                <Badge bg="success" className="ms-2">Correct</Badge>
                              ) : (
                                <Badge bg="danger" className="ms-2">Incorrect</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })
                ) : (
                  <p className="text-center text-muted py-3">No answer details available.</p>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" className="rounded-3" onClick={() => setShowSubmissionModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .hover-bg-light-dark:hover { background-color: #f1f5f9 !important; }
        .cursor-pointer { cursor: pointer; }
        .fw-800 { font-weight: 800; }
        .bg-primary-subtle { background-color: #7c5cff15; }
        .bg-success-subtle { background-color: #48bb7815; }
      `}</style>
    </div>
  );
};

export default StudentReport;
