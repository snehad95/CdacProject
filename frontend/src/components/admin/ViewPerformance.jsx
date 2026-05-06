import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const ViewPerformance = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/exams').then(res => setExams(res.data));
  }, []);

  const fetchResults = async (examId) => {
    if (!examId) return setResults([]);
    const res = await axios.get(`http://localhost:5000/api/results/exam/${examId}`);
    setResults(res.data);
  };

  useEffect(() => {
    fetchResults(selectedExam);
  }, [selectedExam]);

  return (
    <div>
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <h4 className="fw-bold mb-0" style={{ color: '#6a41e6' }}>Student Performance Rankings</h4>
            </Col>
            <Col md={6}>
              <Form.Select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                <option value="">Select an Exam to view rankings...</option>
                {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.title}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {selectedExam && (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table striped hover responsive className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Score</th>
                  <th>Attempted Q</th>
                  <th>Pass/Fail</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={r._id}>
                    <td className="fw-bold text-center">#{idx + 1}</td>
                    <td>{r.userId?.name || 'Unknown User'}</td>
                    <td className="fw-bold" style={{ color: '#6a41e6' }}>{r.score} / {r.totalQuestions}</td>
                    <td>{r.attemptedQuestions || 0}</td>
                    <td>
                      {r.passed ? <span className="badge bg-success">PASS</span> : <span className="badge bg-danger">FAIL</span>}
                    </td>
                    <td>{new Date(r.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted p-4">No attempts recorded for this exam yet.</td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ViewPerformance;
