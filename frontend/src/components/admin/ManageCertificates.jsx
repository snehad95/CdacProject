import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Award, Download, CheckCircle, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageCertificates = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issued, setIssued] = useState(new Set());

  useEffect(() => {
    fetchPassedStudents();
  }, []);

  const fetchPassedStudents = async () => {
    try {
      // Fetch all exams and get results for each to find passed students
      const examsRes = await axios.get('http://localhost:5000/api/exams');
      const allResults = [];
      
      for (const exam of examsRes.data) {
        const res = await axios.get(`http://localhost:5000/api/results/exam/${exam._id}`);
        allResults.push(...res.data.filter(r => r.passed));
      }
      
      setResults(allResults);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const issueCertificate = (id) => {
    setIssued(prev => new Set(prev).add(id));
    toast.success('Certificate Issued Successfully!', { icon: '🎓' });
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-4">
        <div style={{ backgroundColor: '#ed893615', color: '#ed8936', padding: '10px', borderRadius: '12px' }}>
          <Award size={24} />
        </div>
        <h4 className="fw-bold mb-0">Certificate Issuance</h4>
      </div>

      <Alert variant="info" className="border-0 shadow-sm rounded-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          <CheckCircle size={20} />
          <div>Only students who have <strong>PASSED</strong> their exams are eligible for certificate issuance.</div>
        </div>
      </Alert>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Table hover responsive className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="px-4 py-3 border-0">Student Name</th>
              <th className="px-4 py-3 border-0">Exam Title</th>
              <th className="px-4 py-3 border-0">Score</th>
              <th className="px-4 py-3 border-0">Completion Date</th>
              <th className="px-4 py-3 border-0 text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id} className="align-middle">
                <td className="px-4 py-3 border-0">
                  <div className="fw-bold">{r.userId?.name}</div>
                  <div className="text-muted small">{r.userId?.email}</div>
                </td>
                <td className="px-4 py-3 border-0">
                  <div className="fw-semibold text-primary">{r.examId?.title || 'General Exam'}</div>
                </td>
                <td className="px-4 py-3 border-0">
                  <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold">
                    {r.score} Marks
                  </Badge>
                </td>
                <td className="px-4 py-3 border-0 text-muted small">
                  {new Date(r.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 border-0 text-end">
                  {issued.has(r._id) ? (
                    <Button variant="success" size="sm" className="rounded-pill px-3 d-flex align-items-center gap-2 ms-auto" disabled>
                      <CheckCircle size={16} /> Issued
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="rounded-pill px-3 d-flex align-items-center gap-2 ms-auto"
                      style={{ backgroundColor: '#7c5cff', border: 'none' }}
                      onClick={() => issueCertificate(r._id)}
                    >
                      <Award size={16} /> Issue Certificate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">No eligible students found for certificate issuance.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default ManageCertificates;
