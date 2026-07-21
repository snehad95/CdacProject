import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { Award, Download, Upload, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageCertificates = () => {
  const [results, setResults] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchPassedStudentsAndCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch certificates
      const certRes = await axios.get('http://localhost:5000/api/certificates', config);
      setCertificates(certRes.data);
      
      // Fetch exams and results
      const examsRes = await axios.get('http://localhost:5000/api/exams');
      const allResults = [];
      
      for (const exam of examsRes.data) {
        const res = await axios.get(`http://localhost:5000/api/results/exam/${exam._id}`);
        allResults.push(...res.data);
      }
      
      setResults(allResults);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load certificate data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassedStudentsAndCertificates();
  }, []);

  const openUploadModal = (result) => {
    setSelectedResult(result);
    setPdfFile(null);
    setShowUpload(true);
  };

  const handleIssueDynamic = async (result) => {
    const token = localStorage.getItem('token');
    const rUserId = result.userId?._id || result.userId;
    const rExamId = result.examId?._id || result.examId;
    try {
      await axios.post('http://localhost:5000/api/certificates/dynamic', {
        studentId: rUserId,
        examId: rExamId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Dynamic Certificate issued successfully!');
      fetchPassedStudentsAndCertificates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue certificate');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) return toast.error("Please select a PDF file!");
    if (pdfFile.type !== 'application/pdf') return toast.error("Only PDF files are allowed!");

    const token = localStorage.getItem('token');
    const formData = new FormData();
    const rUserId = selectedResult.userId?._id || selectedResult.userId;
    const rExamId = selectedResult.examId?._id || selectedResult.examId;
    formData.append('studentId', rUserId);
    formData.append('examId', rExamId);
    formData.append('pdf', pdfFile);

    try {
      setUploading(true);
      await axios.post('http://localhost:5000/api/certificates', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Certificate uploaded successfully!');
      setShowUpload(false);
      fetchPassedStudentsAndCertificates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload certificate');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (certId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/certificates/${certId}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Certificate published successfully!');
      fetchPassedStudentsAndCertificates();
    } catch (err) {
      toast.error('Failed to publish certificate');
    }
  };

  const handleDelete = async (certId) => {
    if (window.confirm('Are you sure you want to remove this certificate?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/certificates/${certId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Certificate deleted successfully');
        fetchPassedStudentsAndCertificates();
      } catch (err) {
        toast.error('Failed to delete certificate');
      }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-4">
        <div style={{ backgroundColor: '#ed893615', color: '#ed8936', padding: '10px', borderRadius: '12px' }}>
          <Award size={24} />
        </div>
        <h4 className="fw-bold mb-0">Certificate Issuance &amp; PDF Upload</h4>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Table hover responsive className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="px-4 py-3 border-0">Student Name</th>
              <th className="px-4 py-3 border-0">Exam Title</th>
              <th className="px-4 py-3 border-0">Score & Status</th>
              <th className="px-4 py-3 border-0">Publish Status</th>
              <th className="px-4 py-3 border-0 text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const cert = certificates.find((c) => {
                const cStudentId = c.studentId?._id || c.studentId;
                const cExamId = c.examId?._id || c.examId;
                const rUserId = r.userId?._id || r.userId;
                const rExamId = r.examId?._id || r.examId;
                return cStudentId === rUserId && cExamId === rExamId;
              });
              return (
                <tr key={r._id} className="align-middle">
                  <td className="px-4 py-3 border-0">
                    <div className="fw-bold">{r.userId?.name}</div>
                    <div className="text-muted small">{r.userId?.email}</div>
                  </td>
                  <td className="px-4 py-3 border-0">
                    <div className="fw-semibold text-primary">{r.examId?.title || 'General Exam'}</div>
                  </td>
                  <td className="px-4 py-3 border-0">
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="primary" className="px-2 py-1 rounded-pill fw-bold">
                        {r.score} Marks
                      </Badge>
                      {((r.passed !== undefined ? r.passed : (r.score / (r.totalQuestions || 1)) >= 0.4)) ? (
                        <Badge bg="success" className="px-2 py-1 rounded-pill">Passed</Badge>
                      ) : (
                        <Badge bg="danger" className="px-2 py-1 rounded-pill">Failed</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-0">
                    {cert ? (
                      cert.isPublished ? (
                        <Badge bg="success" className="px-3 py-2 rounded-pill fw-bold">Published</Badge>
                      ) : (
                        <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill fw-bold">Draft (Unpublished)</Badge>
                      )
                    ) : (
                      <Badge bg="secondary" className="px-3 py-2 rounded-pill fw-bold">Not Uploaded / Issued</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 border-0 text-end">
                    <div className="d-flex gap-2 justify-content-end align-items-center">
                      {!cert ? (
                        <>
                          <Button 
                            variant="warning" 
                            size="sm" 
                            className="rounded-pill px-3 d-flex align-items-center gap-1 fw-bold text-dark"
                            onClick={() => handleIssueDynamic(r)}
                          >
                            <Award size={14} /> Issue Dynamic Cert
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="rounded-pill px-3 d-flex align-items-center gap-1"
                            onClick={() => openUploadModal(r)}
                          >
                            <Upload size={14} /> Upload PDF
                          </Button>
                        </>
                      ) : (
                        <>
                          {cert.pdfUrl === 'DYNAMIC_CERTIFICATE' ? (
                            <Badge bg="info" className="px-3 py-2 rounded-pill fw-bold text-dark">Dynamic Cert Issued</Badge>
                          ) : (
                            <a 
                              href={cert.pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn btn-outline-info btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1"
                            >
                              <Eye size={14} /> View PDF
                            </a>
                          )}
                          
                          {!cert.isPublished && (
                            <Button 
                              variant="success" 
                              size="sm" 
                              className="rounded-pill px-3 d-flex align-items-center gap-1"
                              onClick={() => handlePublish(cert._id)}
                            >
                              Publish
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="rounded-circle p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px' }}
                            title="Revoke / Delete Certificate"
                            onClick={() => handleDelete(cert._id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {results.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">No students found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Upload PDF Modal */}
      <Modal show={showUpload} onHide={() => setShowUpload(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-primary">Upload Certificate</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {selectedResult && (
            <Form onSubmit={handleUploadSubmit}>
              <div className="mb-3">
                <strong>Student:</strong> {selectedResult.userId?.name} ({selectedResult.userId?.email})
              </div>
              <div className="mb-3">
                <strong>Exam:</strong> {selectedResult.examId?.title}
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold small text-muted text-uppercase">Select Certificate PDF</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  required 
                  className="rounded-3 shadow-none border-light bg-light"
                />
                <Form.Text className="text-muted">Only PDF documents are allowed.</Form.Text>
              </Form.Group>

              <div className="text-end">
                <Button variant="light" className="me-2 rounded-pill px-4" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploading} 
                  className="rounded-pill px-5 fw-bold"
                  style={{ backgroundColor: '#7c5cff', border: 'none' }}
                >
                  {uploading ? 'Uploading...' : 'Upload &amp; Save'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageCertificates;
