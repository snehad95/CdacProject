import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageQuestions = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  const [selectedExamForView, setSelectedExamForView] = useState('');

  const [formData, setFormData] = useState({
    examId: '', text: '', option1: '', isCorrect1: false, option2: '', isCorrect2: false, 
    option3: '', isCorrect3: false, option4: '', isCorrect4: false
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchExams = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/exams');
      setExams(res.data);
      // Clean up selected exam state if the selected exam was deleted
      const examIds = res.data.map(ex => ex._id);
      if (formData.examId && !examIds.includes(formData.examId)) {
        setFormData(prev => ({ ...prev, examId: '' }));
      }
      if (selectedExamForView && !examIds.includes(selectedExamForView)) {
        setSelectedExamForView('');
      }
    } catch (err) {
      console.error("Error fetching exams:", err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchQuestions = async (examId) => {
    if (!examId) return setQuestions([]);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/questions/exam/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(res.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to load questions");
    }
  };

  // Watch selected Exam for viewing test questions
  useEffect(() => {
    fetchQuestions(selectedExamForView);
  }, [selectedExamForView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.examId) return toast.error("Select an exam to add question to!");

    const optionsArray = [
      { text: formData.option1, isCorrect: formData.isCorrect1 },
      { text: formData.option2, isCorrect: formData.isCorrect2 },
      { text: formData.option3, isCorrect: formData.isCorrect3 },
      { text: formData.option4, isCorrect: formData.isCorrect4 }
    ];

    const data = new FormData();
    data.append('examId', formData.examId);
    data.append('text', formData.text);
    data.append('options', JSON.stringify(optionsArray));
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/questions', data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Question added successfully!');
      if (selectedExamForView === formData.examId) fetchQuestions(formData.examId);
      // Reset form but keep examId
      setFormData(prev => ({ 
        ...prev, text: '', option1: '', isCorrect1: false, option2: '', isCorrect2: false, 
        option3: '', isCorrect3: false, option4: '', isCorrect4: false 
      }));
      setImageFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred');
    }
  };

  const setCorrectOption = (optNum) => {
    setFormData(prev => ({
      ...prev,
      isCorrect1: optNum === 1,
      isCorrect2: optNum === 2,
      isCorrect3: optNum === 3,
      isCorrect4: optNum === 4
    }));
  };

  return (
    <div>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="fw-bold mb-3 border-bottom pb-2">Add New Question</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Select
                  value={formData.examId}
                  onFocus={fetchExams}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({...formData, examId: val});
                    // Auto-sync the view section to the same exam
                    setSelectedExamForView(val);
                  }}
                  required
                >
                  <option value="">Select Target Exam...</option>
                  {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.title}</option>)}
                </Form.Select>
              </Col>
              <Col md={8} className="mb-3">
                <Form.Control as="textarea" rows={3} placeholder="Question Text" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} required />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="small">Optional Image Upload</Form.Label>
                <Form.Control type="file" onChange={e => setImageFile(e.target.files[0])} />
              </Col>

              <Col md={6} className="mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Form.Check type="radio" name="correctOpt" onChange={() => setCorrectOption(1)} checked={formData.isCorrect1} />
                  <Form.Control placeholder="Option A" value={formData.option1} onChange={e => setFormData({...formData, option1: e.target.value})} required />
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Form.Check type="radio" name="correctOpt" onChange={() => setCorrectOption(2)} checked={formData.isCorrect2} />
                  <Form.Control placeholder="Option B" value={formData.option2} onChange={e => setFormData({...formData, option2: e.target.value})} required />
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Form.Check type="radio" name="correctOpt" onChange={() => setCorrectOption(3)} checked={formData.isCorrect3} />
                  <Form.Control placeholder="Option C" value={formData.option3} onChange={e => setFormData({...formData, option3: e.target.value})} required />
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Form.Check type="radio" name="correctOpt" onChange={() => setCorrectOption(4)} checked={formData.isCorrect4} />
                  <Form.Control placeholder="Option D" value={formData.option4} onChange={e => setFormData({...formData, option4: e.target.value})} required />
                </div>
              </Col>
            </Row>
            <Button type="submit" variant="info" className="px-4 text-white fw-bold">Add Question</Button>
          </Form>
        </Card.Body>
      </Card>

      <Row className="mb-3 align-items-center">
        <Col md={6}>
          <h5 className="fw-bold mb-0">
            Existing Questions
            {selectedExamForView && (
              <span className="badge bg-primary ms-2" style={{ fontSize: '0.85rem' }}>
                {questions.length} question{questions.length !== 1 ? 's' : ''}
              </span>
            )}
          </h5>
        </Col>
        <Col md={6}>
          <Form.Select 
            value={selectedExamForView} 
            onFocus={fetchExams}
            onChange={e => setSelectedExamForView(e.target.value)}
          >
            <option value="">Select Exam to view questions...</option>
            {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.title}</option>)}
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered responsive className="bg-white shadow-sm small">
        <thead className="table-dark">
          <tr>
            <th>Question</th>
            <th>Type</th>
            <th>Options</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => (
            <tr key={q._id}>
              <td style={{ maxWidth: '300px' }} className="text-wrap">{q.text}</td>
              <td>{q.imageUrl ? 'Text+Image' : 'Text'}</td>
              <td>{q.options.filter(o => o.isCorrect).map(o => o.text).join(', ')} (Correct)</td>
              <td>
                <Button variant="danger" size="sm" onClick={async () => {
                  if (window.confirm('Delete this question?')) {
                    try {
                      const token = localStorage.getItem('token');
                      await axios.delete(`http://localhost:5000/api/questions/${q._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      fetchQuestions(selectedExamForView);
                      toast.success('Question deleted');
                    } catch (err) {
                      toast.error('Failed to delete question');
                    }
                  }
                }}>Delete</Button>
              </td>
            </tr>
          ))}
          {selectedExamForView && questions.length === 0 && (
            <tr><td colSpan={4} className="text-center text-muted">No questions added yet.</td></tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ManageQuestions;
