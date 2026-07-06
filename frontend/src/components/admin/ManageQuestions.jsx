import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageQuestions = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  const [selectedExamForView, setSelectedExamForView] = useState('');

  const [formData, setFormData] = useState({
    examId: '',
    type: 'mcq',
    text: '',
    option1: '',
    isCorrect1: false,
    option2: '',
    isCorrect2: false,
    option3: '',
    isCorrect3: false,
    option4: '',
    isCorrect4: false,
    marks: 1,
    workspaceLines: 10,
    title: '',
    description: '',
    wordLimit: 500,
    sampleAnswer: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    allowedLanguages: ['java', 'python', 'cpp'],
    timeLimit: 2,
    memoryLimit: 256,
    timerDuration: 0
  });
  
  const [testCases, setTestCases] = useState([{ input: '', output: '', isPublic: false }]);
  const [imageFile, setImageFile] = useState(null);

  const fetchExams = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/exams');
      setExams(res.data);
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

  useEffect(() => {
    fetchQuestions(selectedExamForView);
  }, [selectedExamForView]);

  const handleLanguageChange = (lang) => {
    setFormData(prev => {
      const current = prev.allowedLanguages;
      if (current.includes(lang)) {
        return { ...prev, allowedLanguages: current.filter(l => l !== lang) };
      } else {
        return { ...prev, allowedLanguages: [...current, lang] };
      }
    });
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', output: '', isPublic: false }]);
  };

  const handleRemoveTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index, field, value) => {
    setTestCases(testCases.map((tc, i) => i === index ? { ...tc, [field]: value } : tc));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.examId) return toast.error("Select an exam to add question to!");

    const isSubjective = formData.type === 'subjective';
    const isCoding = formData.type === 'coding';
    const optionsArray = (isSubjective || isCoding) ? [] : [
      { text: formData.option1, isCorrect: formData.isCorrect1 },
      { text: formData.option2, isCorrect: formData.isCorrect2 },
      { text: formData.option3, isCorrect: formData.isCorrect3 },
      { text: formData.option4, isCorrect: formData.isCorrect4 }
    ];

    const data = new FormData();
    data.append('examId', formData.examId);
    data.append('text', formData.text);
    data.append('type', formData.type);
    data.append('options', JSON.stringify(optionsArray));
    data.append('marks', formData.marks);
    data.append('workspaceLines', formData.workspaceLines);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('wordLimit', formData.wordLimit);
    data.append('sampleAnswer', formData.sampleAnswer);
    data.append('constraints', formData.constraints);
    data.append('sampleInput', formData.sampleInput);
    data.append('sampleOutput', formData.sampleOutput);
    data.append('allowedLanguages', JSON.stringify(formData.allowedLanguages));
    data.append('timeLimit', formData.timeLimit);
    data.append('memoryLimit', formData.memoryLimit);
    data.append('timerDuration', formData.timerDuration);
    data.append('testCases', JSON.stringify(isCoding ? testCases : []));

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
      
      setFormData(prev => ({ 
        ...prev,
        text: '',
        option1: '',
        isCorrect1: false,
        option2: '',
        isCorrect2: false,
        option3: '',
        isCorrect3: false,
        option4: '',
        isCorrect4: false,
        marks: 1,
        workspaceLines: 10,
        title: '',
        description: '',
        wordLimit: 500,
        sampleAnswer: '',
        constraints: '',
        sampleInput: '',
        sampleOutput: '',
        allowedLanguages: ['java', 'python', 'cpp'],
        timeLimit: 2,
        memoryLimit: 256,
        timerDuration: 0
      }));
      setTestCases([{ input: '', output: '', isPublic: false }]);
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
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-semibold text-muted">Target Exam</Form.Label>
                <Form.Select
                  value={formData.examId}
                  onFocus={fetchExams}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({...formData, examId: val});
                    setSelectedExamForView(val);
                  }}
                  required
                >
                  <option value="">Select Target Exam...</option>
                  {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.title}</option>)}
                </Form.Select>
              </Col>
              
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-semibold text-muted">Question Type</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="mcq">Multiple Choice Question (MCQ)</option>
                  <option value="subjective">Subjective Question</option>
                  <option value="coding">Coding Question</option>
                </Form.Select>
              </Col>
              
              <Col md={2} className="mb-3">
                <Form.Label className="small fw-semibold text-muted">Question Marks</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={formData.marks}
                  onChange={e => setFormData({...formData, marks: parseInt(e.target.value) || 1})}
                  required
                />
              </Col>

              <Col md={2} className="mb-3">
                <Form.Label className="small fw-semibold text-muted">Per-Question Timer (Mins)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="0 for none"
                  value={formData.timerDuration}
                  onChange={e => setFormData({...formData, timerDuration: parseInt(e.target.value) || 0})}
                  required
                />
              </Col>

              {formData.type === 'subjective' && (
                <>
                  <Col md={2} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Workspace Lines</Form.Label>
                    <Form.Control
                      type="number"
                      min="3"
                      max="50"
                      value={formData.workspaceLines}
                      onChange={e => setFormData({...formData, workspaceLines: parseInt(e.target.value) || 10})}
                      required
                    />
                  </Col>
                  <Col md={2} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Word Limit</Form.Label>
                    <Form.Control
                      type="number"
                      min="10"
                      value={formData.wordLimit}
                      onChange={e => setFormData({...formData, wordLimit: parseInt(e.target.value) || 500})}
                      required
                    />
                  </Col>
                  <Col md={8} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Sample/Reference Answer</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Optional reference answer shown to teacher during grading"
                      value={formData.sampleAnswer}
                      onChange={e => setFormData({...formData, sampleAnswer: e.target.value})}
                    />
                  </Col>
                </>
              )}

              {formData.type === 'coding' && (
                <>
                  <Col md={4} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Problem Title</Form.Label>
                    <Form.Control
                      placeholder="e.g. Reverse a String"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Allowed Languages</Form.Label>
                    <div className="d-flex gap-3 align-items-center mt-2">
                      <Form.Check
                        type="checkbox"
                        label="Python"
                        checked={formData.allowedLanguages.includes('python')}
                        onChange={() => handleLanguageChange('python')}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Java"
                        checked={formData.allowedLanguages.includes('java')}
                        onChange={() => handleLanguageChange('java')}
                      />
                      <Form.Check
                        type="checkbox"
                        label="C++"
                        checked={formData.allowedLanguages.includes('cpp')}
                        onChange={() => handleLanguageChange('cpp')}
                      />
                    </div>
                  </Col>
                  <Col md={2} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Time Limit (Secs)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={formData.timeLimit}
                      onChange={e => setFormData({...formData, timeLimit: parseInt(e.target.value) || 2})}
                      required
                    />
                  </Col>
                  <Col md={2} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Memory Limit (MB)</Form.Label>
                    <Form.Control
                      type="number"
                      min="16"
                      value={formData.memoryLimit}
                      onChange={e => setFormData({...formData, memoryLimit: parseInt(e.target.value) || 256})}
                      required
                    />
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Problem Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Write coding problem description here..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </Col>

                  <Col md={4} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Constraints</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="e.g. 1 <= N <= 10^5"
                      value={formData.constraints}
                      onChange={e => setFormData({...formData, constraints: e.target.value})}
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Sample Input</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Reference sample input"
                      value={formData.sampleInput}
                      onChange={e => setFormData({...formData, sampleInput: e.target.value})}
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Sample Output</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Reference sample output"
                      value={formData.sampleOutput}
                      onChange={e => setFormData({...formData, sampleOutput: e.target.value})}
                    />
                  </Col>

                  <Col md={12} className="mb-4">
                    <Form.Label className="fw-bold text-primary mb-2">Test Cases (for grading)</Form.Label>
                    {testCases.map((tc, idx) => (
                      <Row key={idx} className="g-2 align-items-center mb-2">
                        <Col md={5}>
                          <Form.Control
                            placeholder="Input Stdin"
                            value={tc.input}
                            onChange={e => handleTestCaseChange(idx, 'input', e.target.value)}
                          />
                        </Col>
                        <Col md={5}>
                          <Form.Control
                            placeholder="Expected Output"
                            value={tc.output}
                            onChange={e => handleTestCaseChange(idx, 'output', e.target.value)}
                            required
                          />
                        </Col>
                        <Col md={1} className="text-center">
                          <Form.Check
                            type="checkbox"
                            label="Public"
                            checked={tc.isPublic}
                            onChange={e => handleTestCaseChange(idx, 'isPublic', e.target.checked)}
                          />
                        </Col>
                        <Col md={1}>
                          <Button variant="outline-danger" size="sm" onClick={() => handleRemoveTestCase(idx)} disabled={testCases.length === 1}>Delete</Button>
                        </Col>
                      </Row>
                    ))}
                    <Button variant="outline-secondary" size="sm" onClick={handleAddTestCase}>+ Add Test Case</Button>
                  </Col>
                </>
              )}

              <Col md={8} className="mb-3">
                <Form.Label className="small fw-semibold text-muted">Question Prompt / Main Text</Form.Label>
                <Form.Control as="textarea" rows={2} placeholder="Question Text" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} required />
              </Col>
              
              <Col md={4} className="mb-3">
                <Form.Label className="small">Optional Image Upload</Form.Label>
                <Form.Control type="file" onChange={e => setImageFile(e.target.files[0])} />
              </Col>

              {formData.type === 'mcq' && (
                <>
                  <Col md={6} className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Form.Check type="radio" name="correctOpt" onChange={() => setCorrectOption(1)} checked={formData.isCorrect1} />
                      <Form.Control placeholder="Option A" value={formData.option1} onChange={e => setFormData({...formData, option1: e.target.value})} required={formData.type === 'mcq'} />
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Form.Check type="radio" name="correctOpt" onChange={() => setCorrectOption(2)} checked={formData.isCorrect2} />
                      <Form.Control placeholder="Option B" value={formData.option2} onChange={e => setFormData({...formData, option2: e.target.value})} required={formData.type === 'mcq'} />
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Form.Check type="radio" name="correctOpt" onChange={() => setCorrectOption(3)} checked={formData.isCorrect3} />
                      <Form.Control placeholder="Option C" value={formData.option3} onChange={e => setFormData({...formData, option3: e.target.value})} required={formData.type === 'mcq'} />
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Form.Check type="radio" name="correctOpt" onChange={() => setCorrectOption(4)} checked={formData.isCorrect4} />
                      <Form.Control placeholder="Option D" value={formData.option4} onChange={e => setFormData({...formData, option4: e.target.value})} required={formData.type === 'mcq'} />
                    </div>
                  </Col>
                </>
              )}
            </Row>
            <Button type="submit" variant="info" className="px-5 text-white fw-bold mt-2">Add Question</Button>
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
            <th>Marks</th>
            <th>Options / Info</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => (
            <tr key={q._id}>
              <td style={{ maxWidth: '300px' }} className="text-wrap">
                {q.type === 'coding' && q.title ? (
                  <strong>{q.title}: </strong>
                ) : null}
                {q.text}
              </td>
              <td>
                <span className={`badge ${q.type === 'coding' ? 'bg-danger' : q.type === 'subjective' ? 'bg-warning text-dark' : 'bg-primary'}`} style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  {q.type || 'mcq'}
                </span>
                {q.imageUrl && <span className="d-block small text-muted mt-1">(Image attached)</span>}
              </td>
              <td>
                <span className="fw-bold">{q.marks || 1} mark{(q.marks || 1) !== 1 ? 's' : ''}</span>
              </td>
              <td>
                {q.type === 'subjective' ? (
                  <div className="small text-muted">
                    <div>Workspace: {q.workspaceLines || 10} lines</div>
                    <div>Word Limit: {q.wordLimit || 500} words</div>
                    {q.sampleAnswer && <div className="text-success">✔ Sample Answer Configured</div>}
                    {q.timerDuration > 0 && <div className="text-danger">⏱ Timer: {q.timerDuration} mins</div>}
                  </div>
                ) : q.type === 'coding' ? (
                  <div className="small text-muted">
                    <div>Title: {q.title || 'Untitled'}</div>
                    <div>Languages: {q.allowedLanguages?.join(', ') || 'java, python, cpp'}</div>
                    <div>Test cases: {q.testCases?.length || 0} ({q.testCases?.filter(t => t.isPublic).length || 0} public)</div>
                    {q.timerDuration > 0 && <div className="text-danger">⏱ Timer: {q.timerDuration} mins</div>}
                  </div>
                ) : (
                  <span>
                    <strong>Correct:</strong> {q.options.filter(o => o.isCorrect).map(o => o.text).join(', ') || 'None'}
                  </span>
                )}
              </td>
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
            <tr><td colSpan={5} className="text-center text-muted">No questions added yet.</td></tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ManageQuestions;
