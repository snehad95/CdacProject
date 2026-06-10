import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { PlusCircle, Trash2, Layout, Type, AlignLeft, Image as ImageIcon, Pencil, HelpCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const emptyForm = { title: '', description: '', image: null };

const ManagePracticeTests = () => {
  const [tests, setTests] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ title: '', description: '', image: null });

  // Questions manager state & actions
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedTestForQuestions, setSelectedTestForQuestions] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [csvFile, setCsvFile] = useState(null);

  const fetchTestQuestions = async (practiceTestId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/questions/practice-test/${practiceTestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openQuestions = (test) => {
    setSelectedTestForQuestions(test);
    fetchTestQuestions(test._id);
    setShowQuestionsModal(true);
  };

  const handleAddQuestionManual = async (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return toast.error("Please enter question text!");
    if (!newOptions.some(o => o.isCorrect)) return toast.error("Please mark at least one correct option!");
    if (newOptions.some(o => !o.text.trim())) return toast.error("Please enter text for all options!");

    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/questions', {
        practiceTestId: selectedTestForQuestions._id,
        text: newQuestionText,
        options: newOptions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Question added successfully!");
      setNewQuestionText('');
      setNewOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]);
      fetchTestQuestions(selectedTestForQuestions._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add question");
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/questions/${qId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Question deleted!");
        fetchTestQuestions(selectedTestForQuestions._id);
      } catch (err) {
        toast.error("Failed to delete question");
      }
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const questions = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      if (values.length < 6) continue;
      const cleanStr = (str) => str.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
      const qText = cleanStr(values[0]);
      const optA = cleanStr(values[1]);
      const optB = cleanStr(values[2]);
      const optC = cleanStr(values[3]);
      const optD = cleanStr(values[4]);
      const correctLetter = cleanStr(values[5]).toUpperCase();
      if (!qText || !optA || !optB || !optC || !optD || !correctLetter) continue;
      const options = [
        { text: optA, isCorrect: correctLetter === 'A' },
        { text: optB, isCorrect: correctLetter === 'B' },
        { text: optC, isCorrect: correctLetter === 'C' },
        { text: optD, isCorrect: correctLetter === 'D' },
      ];
      questions.push({ text: qText, options });
    }
    return questions;
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return toast.error("Please select a CSV file first!");
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          return toast.error("No valid questions found in CSV file. Check headers and format.");
        }
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/questions/bulk', {
          practiceTestId: selectedTestForQuestions._id,
          questions: parsed
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Successfully uploaded ${parsed.length} questions!`);
        setCsvFile(null);
        const fileInput = document.getElementById('csvFileInput');
        if (fileInput) fileInput.value = '';
        fetchTestQuestions(selectedTestForQuestions._id);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to bulk upload questions. Check file format.");
      }
    };
    reader.readAsText(csvFile);
  };

  const fetchTests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/practice-tests');
      setTests(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (formData.image) data.append('image', formData.image);

      await axios.post('http://localhost:5000/api/practice-tests', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      setFormData(emptyForm);
      const fileInput = document.getElementById('testImageInput');
      if (fileInput) fileInput.value = '';
      fetchTests();
      toast.success('✅ Practice Test Added Successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error occurred while adding test');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this practice test category?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/practice-tests/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTests();
        toast.success('Practice test deleted');
      } catch (err) {
        toast.error('Failed to delete practice test');
      }
    }
  };

  const openEdit = (test) => {
    setEditId(test._id);
    setEditData({ title: test.title, description: test.description, image: null });
    setShowEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', editData.title);
      data.append('description', editData.description);
      if (editData.image) data.append('image', editData.image);

      await axios.put(`http://localhost:5000/api/practice-tests/${editId}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      setShowEdit(false);
      fetchTests();
      toast.success('✅ Practice Test Updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="pb-5">

      {/* ── CREATE FORM ── */}
      <Card className="border-0 shadow-sm rounded-4 mb-5">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
            <div style={{ backgroundColor: '#7c5cff15', color: '#7c5cff', padding: '10px', borderRadius: '12px' }}>
              <PlusCircle size={24} />
            </div>
            <h4 className="fw-bold mb-0">Add New Practice Test Section</h4>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                  <Type size={14} className="me-1" /> Test Title
                </Form.Label>
                <Form.Control
                  placeholder="e.g. Programming Mastery"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required className="rounded-3 py-2 border-light shadow-none bg-light"
                />
              </Col>

              <Col md={12} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                  <AlignLeft size={14} className="me-1" /> Description
                </Form.Label>
                <Form.Control
                  as="textarea" rows={2}
                  placeholder="What will students learn/test in this section?"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  required className="rounded-3 border-light shadow-none bg-light"
                />
              </Col>

              <Col md={12} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                  <ImageIcon size={14} className="me-1" /> Upload Section Image
                </Form.Label>
                <Form.Control
                  id="testImageInput"
                  type="file"
                  accept="image/*"
                  onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                  className="rounded-3 py-2 border-light shadow-none bg-light"
                />
                <div className="small text-muted mt-1">Choose a visual related to the test (Programming, GK, etc.)</div>
              </Col>
            </Row>

            <div className="text-end">
              <Button type="submit" size="lg" className="px-5 fw-800 rounded-pill shadow-sm"
                style={{ backgroundColor: '#7c5cff', border: 'none' }}>
                Add Test Section
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* ── TABLE ── */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <div style={{ backgroundColor: '#48bb7815', color: '#48bb78', padding: '10px', borderRadius: '12px' }}>
          <Layout size={24} />
        </div>
        <h4 className="fw-bold mb-0">Existing Test Sections</h4>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Table responsive hover className="mb-0 custom-admin-table">
          <thead className="bg-light">
            <tr>
              <th className="py-3 px-4 text-uppercase small text-muted fw-bold">Banner</th>
              <th className="py-3 px-4 text-uppercase small text-muted fw-bold">Title &amp; Info</th>
              <th className="py-3 px-4 text-uppercase small text-muted fw-bold">Description</th>
              <th className="py-3 px-4 text-uppercase small text-muted fw-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map(test => (
              <tr key={test._id}>
                <td className="px-4 py-3">
                  <img src={test.image} alt="" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                </td>
                <td className="px-4 py-3">
                  <div className="fw-bold text-dark">{test.title}</div>
                  <div className="small text-muted">Created: {new Date(test.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-muted small d-inline-block" style={{ maxWidth: '300px' }}>
                    {test.description}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="d-flex gap-3 justify-content-center">
                    <Button variant="link" className="p-0 shadow-none hover-scale text-success"
                      title="Questions" onClick={() => openQuestions(test)}>
                      <HelpCircle size={18} />
                    </Button>
                    <Button variant="link" className="p-0 shadow-none hover-scale text-primary"
                      title="Edit" onClick={() => openEdit(test)}>
                      <Pencil size={18} />
                    </Button>
                    <Button variant="link" className="p-0 shadow-none hover-scale text-danger"
                      title="Delete" onClick={() => handleDelete(test._id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {tests.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-5 text-muted">No test sections found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* ── EDIT MODAL ── */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: '#7c5cff' }}>
            <Pencil size={20} className="me-2" /> Edit Practice Test
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Test Title</Form.Label>
              <Form.Control
                value={editData.title}
                onChange={e => setEditData({ ...editData, title: e.target.value })}
                required className="rounded-3 border-light bg-light shadow-none"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Description</Form.Label>
              <Form.Control
                as="textarea" rows={3}
                value={editData.description}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
                required className="rounded-3 border-light bg-light shadow-none"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                Replace Image (optional)
              </Form.Label>
              <Form.Control
                type="file" accept="image/*"
                onChange={e => setEditData({ ...editData, image: e.target.files[0] })}
                className="rounded-3 border-light bg-light shadow-none"
              />
              <div className="small text-muted mt-1">Leave blank to keep existing image.</div>
            </Form.Group>

            <div className="text-end">
              <Button variant="light" className="me-2 rounded-pill px-4" onClick={() => setShowEdit(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-pill px-5 fw-bold"
                style={{ backgroundColor: '#7c5cff', border: 'none' }}>
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ── MANAGE QUESTIONS MODAL ── */}
      <Modal show={showQuestionsModal} onHide={() => setShowQuestionsModal(false)} size="xl" centered scrollable>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-primary">
            <HelpCircle size={22} className="me-2 text-primary" />
            Manage Questions: <span className="text-dark">{selectedTestForQuestions?.title}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Row className="g-4">
            {/* Add Questions Column */}
            <Col lg={5}>
              <div className="p-3 bg-light rounded-4 mb-4 border border-light shadow-xs">
                <h5 className="fw-bold mb-3 text-secondary">Add Question Manually</h5>
                <Form onSubmit={handleAddQuestionManual}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Question Text</Form.Label>
                    <Form.Control 
                      as="textarea" rows={3} placeholder="Enter question..."
                      value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)}
                      required className="rounded-3 shadow-none border-light bg-white"
                    />
                  </Form.Group>
                  <Form.Label className="small fw-bold text-muted">Options (Mark correct option)</Form.Label>
                  {newOptions.map((opt, idx) => (
                    <Form.Group key={idx} className="mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <Form.Check 
                          type="radio" name="correctOptManual" 
                          checked={opt.isCorrect}
                          onChange={() => {
                            setNewOptions(prev => prev.map((o, i) => ({
                              ...o, isCorrect: i === idx
                            })));
                          }}
                        />
                        <Form.Control 
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          value={opt.text}
                          onChange={e => {
                            const val = e.target.value;
                            setNewOptions(prev => prev.map((o, i) => i === idx ? { ...o, text: val } : o));
                          }}
                          required className="rounded-3 py-1 shadow-none border-light"
                        />
                      </div>
                    </Form.Group>
                  ))}
                  <Button type="submit" className="w-100 mt-3 rounded-pill fw-bold text-white border-0" style={{ backgroundColor: '#7c5cff' }}>
                    Add Question
                  </Button>
                </Form>
              </div>

              <div className="p-3 bg-light rounded-4 border border-light shadow-xs">
                <h5 className="fw-bold mb-2 text-secondary">Bulk Upload Questions</h5>
                <p className="text-muted small">Upload questions at once using a CSV file. Format: <code>Question, Option A, Option B, Option C, Option D, Correct Option (A/B/C/D)</code></p>
                <Form onSubmit={handleCsvUpload}>
                  <Form.Group className="mb-3">
                    <Form.Control 
                      id="csvFileInput"
                      type="file" accept=".csv"
                      onChange={e => setCsvFile(e.target.files[0])}
                      required className="rounded-3 shadow-none border-light bg-white"
                    />
                  </Form.Group>
                  <Button type="submit" className="w-100 rounded-pill fw-bold text-white border-0" style={{ backgroundColor: '#48bb78' }}>
                    Upload CSV
                  </Button>
                </Form>
              </div>
            </Col>

            {/* Questions List Column */}
            <Col lg={7}>
              <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
                <span>Existing Questions ({testQuestions.length})</span>
              </h5>
              <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '5px' }}>
                {testQuestions.map((q, idx) => (
                  <Card key={q._id} className="mb-3 border-light shadow-xs rounded-3">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="fw-semibold text-dark mb-2 small">Q{idx + 1}. {q.text}</div>
                        <Button variant="link" className="p-0 text-danger hover-scale shadow-none" onClick={() => handleDeleteQuestion(q._id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <Row className="g-2">
                        {q.options.map((opt, oIdx) => (
                          <Col md={6} key={oIdx}>
                            <div className="p-2 rounded-3 text-muted small border" style={{ backgroundColor: opt.isCorrect ? '#e6fffa' : '#f8fafc', borderColor: opt.isCorrect ? '#319795' : '#edf2f7', color: opt.isCorrect ? '#234e52' : 'inherit', fontWeight: opt.isCorrect ? 600 : 'normal' }}>
                              {String.fromCharCode(65 + oIdx)}. {opt.text} {opt.isCorrect && '✓'}
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
                {testQuestions.length === 0 && (
                  <div className="text-center py-5 text-muted small">No questions in this test yet. Add some on the left!</div>
                )}
              </div>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      <style>{`
        .custom-admin-table td { vertical-align: middle; border-color: #f1f3f9; }
        .ls-1 { letter-spacing: 1px; }
        .fw-800 { font-weight: 800; }
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:hover { transform: scale(1.2); }
      `}</style>
    </div>
  );
};

export default ManagePracticeTests;
