import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Tabs, Tab } from 'react-bootstrap';
import { PlusCircle, Trash2, Calendar, Clock, Award, Tag, AlignLeft, Pencil, ShieldCheck, HelpCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '', category: '', description: '',
  startTime: '', endTime: '', durationMinutes: '', totalMarks: '', passingScore: 40, 
  resultsPublished: false, negativeMarking: false, negativeMarks: 0.25,
  mcqDuration: 0, subjectiveDuration: 0, codingDuration: 0
};

// Helper: format datetime-local value from ISO string
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Helper: compute duration string from two datetime strings
const calcDuration = (start, end) => {
  if (!start || !end) return '';
  const diff = (new Date(end) - new Date(start)) / 60000; // minutes
  if (isNaN(diff) || diff <= 0) return '';
  const h = Math.floor(diff / 60);
  const m = Math.round(diff % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
};

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [autoDuration, setAutoDuration] = useState('');
  const [activeTab, setActiveTab] = useState('list');

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [editAutoDuration, setEditAutoDuration] = useState('');

  // Questions manager state & actions
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [csvFile, setCsvFile] = useState(null);

  // Questions composed during creation
  const [preparedQuestions, setPreparedQuestions] = useState([]);
  const [composedText, setComposedText] = useState('');
  const [composedOptions, setComposedOptions] = useState(['', '', '', '']);
  const [composedCorrectIndex, setComposedCorrectIndex] = useState(0);

  const handleAddPreparedQuestion = (e) => {
    e.preventDefault();
    if (!composedText.trim()) return toast.error("Please enter question text!");
    if (composedOptions.some(o => !o.trim())) return toast.error("Please fill all options!");
    
    const newQ = {
      text: composedText,
      options: composedOptions.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === composedCorrectIndex
      }))
    };
    
    setPreparedQuestions([...preparedQuestions, newQ]);
    setComposedText('');
    setComposedOptions(['', '', '', '']);
    setComposedCorrectIndex(0);
    toast.success("Question added to list!");
  };

  const handleRemovePreparedQuestion = (idxToRemove) => {
    setPreparedQuestions(preparedQuestions.filter((_, idx) => idx !== idxToRemove));
  };

  const fetchExamQuestions = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/questions/exam/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExamQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openQuestions = (exam) => {
    setSelectedExamForQuestions(exam);
    fetchExamQuestions(exam._id);
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
        examId: selectedExamForQuestions._id,
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
      fetchExamQuestions(selectedExamForQuestions._id);
      fetchExams(); // update totalMarks
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
        fetchExamQuestions(selectedExamForQuestions._id);
        fetchExams();
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
          examId: selectedExamForQuestions._id,
          questions: parsed
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Successfully uploaded ${parsed.length} questions!`);
        setCsvFile(null);
        const fileInput = document.getElementById('csvFileInput');
        if (fileInput) fileInput.value = '';
        fetchExamQuestions(selectedExamForQuestions._id);
        fetchExams();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to bulk upload questions. Check file format.");
      }
    };
    reader.readAsText(csvFile);
  };

  // --- Auto-calculate duration from start/end windows (Create form) ---
  useEffect(() => {
    const mins = (new Date(formData.endTime) - new Date(formData.startTime)) / 60000;
    if (!isNaN(mins) && mins > 0) {
      setFormData(prev => ({ ...prev, durationMinutes: Math.round(mins) }));
      setAutoDuration(calcDuration(formData.startTime, formData.endTime));
    } else {
      setAutoDuration('');
    }
  }, [formData.startTime, formData.endTime]);

  // --- Auto-calculate duration (Edit modal) ---
  useEffect(() => {
    const mins = (new Date(editData.endTime) - new Date(editData.startTime)) / 60000;
    if (!isNaN(mins) && mins > 0) {
      setEditData(prev => ({ ...prev, durationMinutes: Math.round(mins) }));
      setEditAutoDuration(calcDuration(editData.startTime, editData.endTime));
    } else {
      setEditAutoDuration('');
    }
  }, [editData.startTime, editData.endTime]);

  const fetchExams = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/exams');
      setExams(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/exams', {
        ...formData,
        questions: preparedQuestions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(emptyForm);
      setPreparedQuestions([]);
      setAutoDuration('');
      fetchExams();
      setActiveTab('list');
      toast.success('✅ Exam published with ' + preparedQuestions.length + ' questions successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this exam? This cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/exams/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchExams();
        toast.success('Exam deleted successfully');
      } catch (err) {
        toast.error('Failed to delete exam');
      }
    }
  };

  const openEdit = (exam) => {
    setEditId(exam._id);
    setEditData({
      title: exam.title,
      category: exam.category,
      description: exam.description || '',
      startTime: toLocalInput(exam.startTime),
      endTime: toLocalInput(exam.endTime),
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks || '',
      passingScore: exam.passingScore || 40,
      resultsPublished: exam.resultsPublished || false,
      negativeMarking: exam.negativeMarking || false,
      negativeMarks: exam.negativeMarks || 0,
      mcqDuration: exam.mcqDuration || 0,
      subjectiveDuration: exam.subjectiveDuration || 0,
      codingDuration: exam.codingDuration || 0
    });
    setEditAutoDuration(calcDuration(exam.startTime, exam.endTime));
    setShowEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/exams/${editId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEdit(false);
      fetchExams();
      toast.success('✅ Exam updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="pb-5">
      <Tabs
        id="manage-exams-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4 custom-pills border-0"
        variant="pills"
      >
        <Tab eventKey="list" title="Active Published Exams">
          {/* ── TABLE ── */}
          <div className="d-flex align-items-center gap-2 mb-4">
            <div style={{ backgroundColor: '#48bb7815', color: '#48bb78', padding: '10px', borderRadius: '12px' }}>
              <Tag size={24} />
            </div>
            <h4 className="fw-bold mb-0">Active Published Exams</h4>
          </div>

          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <Table responsive hover className="mb-0 custom-admin-table">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4 text-uppercase small text-muted fw-bold">Exam</th>
                  <th className="py-3 px-4 text-uppercase small text-muted fw-bold">Window</th>
                  <th className="py-3 px-4 text-uppercase small text-muted fw-bold">Duration</th>
                  <th className="py-3 px-4 text-uppercase small text-muted fw-bold">Status</th>
                  <th className="py-3 px-4 text-uppercase small text-muted fw-bold">Results</th>
                  <th className="py-3 px-4 text-uppercase small text-muted fw-bold">Category</th>
                  <th className="py-3 px-4 text-uppercase small text-muted fw-bold">Pass %</th>
                  <th className="py-3 px-4 text-uppercase small text-muted fw-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(ex => {
                  const now = new Date();
                  const start = new Date(ex.startTime);
                  const end = new Date(ex.endTime);
                  const isLive = now >= start && now <= end;
                  const isExpired = now > end;
                  const dur = calcDuration(ex.startTime, ex.endTime);
                  return (
                    <tr key={ex._id}>
                      <td className="px-4 py-3">
                        <div className="fw-bold text-dark">{ex.title}</div>
                        <div className="small text-muted">{ex.description?.slice(0, 50)}{ex.description?.length > 50 ? '…' : ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="small d-flex align-items-center gap-1 text-muted">
                          <Calendar size={12} />
                          {start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="small text-muted">
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} →{' '}
                          {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-1 fw-semibold" style={{ color: '#7c5cff' }}>
                          <Clock size={14} /> {dur || `${ex.durationMinutes} min`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className="rounded-pill px-3"
                          bg={isLive ? 'success' : isExpired ? 'secondary' : 'primary'}
                        >
                          {isLive ? 'LIVE' : isExpired ? 'ENDED' : 'UPCOMING'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge bg={ex.resultsPublished ? 'info' : 'warning'} text={ex.resultsPublished ? 'white' : 'dark'} className="rounded-pill">
                          {ex.resultsPublished ? 'PUBLISHED' : 'HIDDEN'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-3">{ex.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="fw-bold" style={{ color: '#7c5cff' }}>{ex.passingScore}%</div>
                        <div className="small text-muted" style={{ fontSize: '0.7rem' }}>TO PASS</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <Button variant="link" className="p-0 shadow-none hover-scale text-success"
                            title="Questions" onClick={() => openQuestions(ex)}>
                            <HelpCircle size={18} />
                          </Button>
                          <Button variant="link" className="p-0 shadow-none hover-scale text-primary"
                            title="Edit" onClick={() => openEdit(ex)}>
                            <Pencil size={18} />
                          </Button>
                          <Button variant="link" className="p-0 shadow-none hover-scale text-danger"
                            title="Delete" onClick={() => handleDelete(ex._id)}>
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {exams.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">No exams created yet. Start by creating one above!</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </Tab>

        <Tab eventKey="create" title="Create New Exam">
          {/* ── CREATE FORM ── */}
          <Card className="border-0 shadow-sm rounded-4 mb-5">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
            <div style={{ backgroundColor: '#7c5cff15', color: '#7c5cff', padding: '10px', borderRadius: '12px' }}>
              <PlusCircle size={24} />
            </div>
            <h4 className="fw-bold mb-0">Create &amp; Publish New Exam</h4>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Exam Title</Form.Label>
                <Form.Control
                  placeholder="e.g. Software Development Specialization"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required className="rounded-3 py-2 border-light shadow-none bg-light"
                />
              </Col>

              <Col md={6} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Category Group</Form.Label>
                <Form.Control
                  placeholder="e.g. Software Development"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  required className="rounded-3 py-2 border-light shadow-none bg-light"
                />
              </Col>

              <Col md={12} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Short Description</Form.Label>
                <Form.Control
                  as="textarea" rows={2}
                  placeholder="Tell students what this exam covers..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-3 border-light shadow-none bg-light"
                />
              </Col>

              <Col md={4} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                  <Calendar size={14} className="me-1" /> Start Window
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  required className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>

              <Col md={4} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                  <Calendar size={14} className="me-1" /> Closing Window
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  required className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>

              <Col md={2} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                  <Clock size={14} className="me-1" /> Duration (Mins)
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData.durationMinutes}
                  onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })}
                  required className="rounded-3 border-light bg-light shadow-none"
                  readOnly={!!autoDuration}
                />
                {autoDuration && (
                  <div className="small mt-1 fw-semibold" style={{ color: '#7c5cff' }}>
                    ⏱ Auto: {autoDuration}
                  </div>
                )}
              </Col>

              <Col md={2} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                  <Award size={14} className="me-1" /> Passing Score %
                </Form.Label>
                <Form.Control
                  type="number" placeholder="40"
                  value={formData.passingScore}
                  onChange={e => setFormData({ ...formData, passingScore: e.target.value })}
                  required className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              
              <Col md={4} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">MCQ Section Duration (mins)</Form.Label>
                <Form.Control
                  type="number" placeholder="0 for unlimited"
                  value={formData.mcqDuration}
                  onChange={e => setFormData({ ...formData, mcqDuration: Number(e.target.value) || 0 })}
                  className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              <Col md={4} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Subjective Section Duration (mins)</Form.Label>
                <Form.Control
                  type="number" placeholder="0 for unlimited"
                  value={formData.subjectiveDuration}
                  onChange={e => setFormData({ ...formData, subjectiveDuration: Number(e.target.value) || 0 })}
                  className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              <Col md={4} className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Coding Section Duration (mins)</Form.Label>
                <Form.Control
                  type="number" placeholder="0 for unlimited"
                  value={formData.codingDuration}
                  onChange={e => setFormData({ ...formData, codingDuration: Number(e.target.value) || 0 })}
                  className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              
              <Col md={12} className="mb-4">
                <div className="p-3 rounded-4 border bg-white shadow-sm d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <ShieldCheck size={24} className="text-danger" />
                    <div>
                      <h6 className="mb-0 fw-bold">Negative Marking</h6>
                      <p className="small text-muted mb-0">Subtract marks for incorrect answers</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-4">
                    <Form.Check 
                      type="switch"
                      checked={formData.negativeMarking}
                      onChange={e => setFormData({...formData, negativeMarking: e.target.checked})}
                      label={formData.negativeMarking ? "ENABLED" : "DISABLED"}
                      className="fw-bold text-danger"
                    />
                    {formData.negativeMarking && (
                      <div className="d-flex align-items-center gap-2">
                        <span className="small fw-bold">DEDUCTION:</span>
                        <Form.Control 
                          type="number" step="0.25" style={{ width: '80px' }}
                          value={formData.negativeMarks}
                          onChange={e => setFormData({...formData, negativeMarks: e.target.value})}
                          className="py-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Col>

              <Col md={12} className="mb-4">
                <Card className="border-0 bg-light rounded-4 shadow-sm p-4 mt-3">
                  <h5 className="fw-bold mb-3" style={{ color: '#7c5cff' }}>Prepared Exam Questions ({preparedQuestions.length})</h5>
                  
                  <div className="p-3 bg-white rounded-3 border mb-3">
                    <h6 className="fw-bold text-dark mb-3">Add Question to Exam</h6>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-muted">Question Text</Form.Label>
                      <Form.Control 
                        as="textarea" rows={2} placeholder="e.g. Which keyword is used to define a class in Javascript?"
                        value={composedText} onChange={e => setComposedText(e.target.value)}
                        className="rounded-3 shadow-none border-light bg-light"
                      />
                    </Form.Group>
                    
                    <Row className="g-3">
                      {composedOptions.map((optText, oIdx) => (
                        <Col md={6} key={oIdx} className="mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <Form.Check 
                              type="radio" name="composedCorrectOpt"
                              checked={composedCorrectIndex === oIdx}
                              onChange={() => setComposedCorrectIndex(oIdx)}
                            />
                            <Form.Control 
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              value={optText}
                              onChange={e => {
                                const val = e.target.value;
                                setComposedOptions(prev => prev.map((valStr, idx) => idx === oIdx ? val : valStr));
                              }}
                              className="rounded-3 shadow-none border-light"
                            />
                          </div>
                        </Col>
                      ))}
                    </Row>
                    
                    <Button 
                      variant="outline-primary" 
                      className="mt-3 rounded-pill px-4 fw-bold"
                      onClick={handleAddPreparedQuestion}
                      style={{ border: '2px solid #7c5cff', color: '#7c5cff', background: 'transparent' }}
                    >
                      + Add Question to List
                    </Button>
                  </div>
                  
                  {preparedQuestions.length > 0 ? (
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {preparedQuestions.map((q, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-3 border mb-2 d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-bold small text-dark mb-1">Q{idx + 1}. {q.text}</div>
                            <div className="small text-muted">
                              Options: {q.options.map((o, oIdx) => (
                                <span key={oIdx} className="me-2" style={{ color: o.isCorrect ? '#22c55e' : 'inherit', fontWeight: o.isCorrect ? 600 : 'normal' }}>
                                  ({String.fromCharCode(65 + oIdx)}) {o.text}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Button 
                            variant="link" className="p-0 text-danger"
                            onClick={() => handleRemovePreparedQuestion(idx)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted small bg-white border rounded-3">
                      No questions prepared yet. Use the composer above to add questions directly to the exam.
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            <div className="text-end">
              <Button type="submit" size="lg" className="px-5 fw-800 rounded-pill shadow-sm text-white border-0"
                style={{ background: 'linear-gradient(135deg, #7c5cff, #6a41e6)', boxShadow: '0 8px 20px rgba(124, 92, 255, 0.35)' }}>
                Publish Exam
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
        </Tab>
      </Tabs>

      {/* ── EDIT MODAL ── */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#7c5cff' }}>
            <Pencil size={20} className="me-2" /> Edit Exam
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Exam Title</Form.Label>
                <Form.Control
                  value={editData.title}
                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                  required className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Category</Form.Label>
                <Form.Control
                  value={editData.category}
                  onChange={e => setEditData({ ...editData, category: e.target.value })}
                  required className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              <Col md={12} className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Description</Form.Label>
                <Form.Control
                  as="textarea" rows={2}
                  value={editData.description}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                  className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                  <Calendar size={13} className="me-1" /> Start Window
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={editData.startTime}
                  onChange={e => setEditData({ ...editData, startTime: e.target.value })}
                  required className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                  <Calendar size={13} className="me-1" /> Closing Window
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={editData.endTime}
                  onChange={e => setEditData({ ...editData, endTime: e.target.value })}
                  required className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              <Col md={2} className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">
                  <Clock size={13} className="me-1" /> Duration (Mins)
                </Form.Label>
                <Form.Control
                  type="number"
                  value={editData.durationMinutes}
                  onChange={e => setEditData({ ...editData, durationMinutes: e.target.value })}
                  required className="rounded-3 border-light bg-light shadow-none"
                  readOnly={!!editAutoDuration}
                />
                {editAutoDuration && (
                  <div className="small mt-1 fw-semibold" style={{ color: '#7c5cff' }}>⏱ {editAutoDuration}</div>
                )}
              </Col>
              <Col md={2} className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Pass %</Form.Label>
                <Form.Control
                  type="number"
                  value={editData.passingScore}
                  onChange={e => setEditData({ ...editData, passingScore: e.target.value })}
                  required className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">MCQ Section Duration (mins)</Form.Label>
                <Form.Control
                  type="number"
                  value={editData.mcqDuration}
                  onChange={e => setEditData({ ...editData, mcqDuration: Number(e.target.value) || 0 })}
                  className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Subjective Section Duration (mins)</Form.Label>
                <Form.Control
                  type="number"
                  value={editData.subjectiveDuration}
                  onChange={e => setEditData({ ...editData, subjectiveDuration: Number(e.target.value) || 0 })}
                  className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted ls-1">Coding Section Duration (mins)</Form.Label>
                <Form.Control
                  type="number"
                  value={editData.codingDuration}
                  onChange={e => setEditData({ ...editData, codingDuration: Number(e.target.value) || 0 })}
                  className="rounded-3 border-light bg-light shadow-none"
                />
              </Col>
              <Col md={12} className="mb-3">
                <Form.Check 
                  type="switch"
                  id="publish-results-switch"
                  label={<strong>Publish Results to Students</strong>}
                  checked={editData.resultsPublished}
                  onChange={e => setEditData({ ...editData, resultsPublished: e.target.checked })}
                  className="mt-2"
                />
                <div className="small text-muted mt-1">If enabled, students can view their score for this exam on their dashboard.</div>
              </Col>
              
              <Col md={12} className="mb-3">
                <div className="p-3 rounded-4 border bg-white shadow-sm d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <ShieldCheck size={20} className="text-danger" />
                    <div className="small">
                      <h6 className="mb-0 fw-bold">Negative Marking</h6>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-4">
                    <Form.Check 
                      type="switch"
                      checked={editData.negativeMarking}
                      onChange={e => setEditData({...editData, negativeMarking: e.target.checked})}
                      label={editData.negativeMarking ? "ON" : "OFF"}
                      className="fw-bold text-danger small"
                    />
                    {editData.negativeMarking && (
                      <div className="d-flex align-items-center gap-2">
                        <span className="small fw-bold">MARK:</span>
                        <Form.Control 
                          type="number" step="0.25" style={{ width: '70px' }}
                          value={editData.negativeMarks}
                          onChange={e => setEditData({...editData, negativeMarks: e.target.value})}
                          className="py-0 px-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            <div className="text-end mt-2">
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
            Manage Questions: <span className="text-dark">{selectedExamForQuestions?.title}</span>
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
                <span>Existing Questions ({examQuestions.length})</span>
              </h5>
              <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '5px' }}>
                {examQuestions.map((q, idx) => (
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
                {examQuestions.length === 0 && (
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
        .custom-pills .nav-link { color: #7c5cff; border-radius: 12px; font-weight: 600; padding: 10px 24px; margin-right: 10px; border: 1px solid transparent; background: transparent; }
        .custom-pills .nav-link:hover { background: #7c5cff15; border-color: #7c5cff; }
        .custom-pills .nav-link.active { background: #7c5cff; color: white; border-color: #7c5cff; box-shadow: 0 4px 15px rgba(106, 65, 230, 0.3); }
      `}</style>
    </div>
  );
};

export default ManageExams;
