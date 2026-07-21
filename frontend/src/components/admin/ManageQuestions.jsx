import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Nav } from 'react-bootstrap';
import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageQuestions = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  const [selectedExamForView, setSelectedExamForView] = useState('');

  // Bulk Upload states
  const [activeTab, setActiveTab] = useState('single');
  const [bulkExamId, setBulkExamId] = useState('');
  const [bulkDataText, setBulkDataText] = useState('');
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

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
    data.append('text', isCoding ? (formData.description || formData.title || 'Coding Problem') : formData.text);
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

  const handleDownloadSampleCsv = () => {
    const csvContent = `text,type,option1,isCorrect1,option2,isCorrect2,option3,isCorrect3,option4,isCorrect4,marks,timeLimit\n"What is the output of 2 + 2 in JavaScript?","mcq","3","false","4","true","5","false","22","false","1","2"\n"Which keyword is used to declare a constant in ES6?","mcq","var","false","let","false","const","true","def","false","1","2"\n"Explain the concept of Closures in JavaScript with an example.","subjective","","false","","false","","false","","false","5","5"`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvToQuestions = (csvText) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error("CSV must contain a header row and at least one data row.");
    
    const parseCsvLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      return result;
    };

    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
    const questionsList = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      if (values.length === 0 || !values[0]) continue;
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      const type = (row.type || 'mcq').toLowerCase();
      const isSubjective = type === 'subjective';
      const isCoding = type === 'coding';
      const options = (isSubjective || isCoding) ? [] : [
        { text: row.option1 || '', isCorrect: String(row.iscorrect1).toLowerCase() === 'true' },
        { text: row.option2 || '', isCorrect: String(row.iscorrect2).toLowerCase() === 'true' },
        { text: row.option3 || '', isCorrect: String(row.iscorrect3).toLowerCase() === 'true' },
        { text: row.option4 || '', isCorrect: String(row.iscorrect4).toLowerCase() === 'true' }
      ];

      questionsList.push({
        text: row.text || 'Untitled Question',
        type: type,
        options: options,
        marks: Number(row.marks) || 1,
        timeLimit: Number(row.timelimit) || 2,
        workspaceLines: 10,
        wordLimit: 500
      });
    }
    return questionsList;
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkExamId) return toast.error("Please select a target exam for bulk upload!");
    
    setBulkLoading(true);
    try {
      let content = bulkDataText;
      if (bulkFile) {
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (error) => reject(error);
          reader.readAsText(bulkFile);
        });
      }

      if (!content || !content.trim()) {
        setBulkLoading(false);
        return toast.error("Please upload a file or paste JSON/CSV data!");
      }

      let parsedQuestions = [];
      const trimmed = content.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const json = JSON.parse(trimmed);
        parsedQuestions = Array.isArray(json) ? json : [json];
      } else {
        parsedQuestions = parseCsvToQuestions(trimmed);
      }

      if (parsedQuestions.length === 0) {
        setBulkLoading(false);
        return toast.error("No valid questions found to import!");
      }

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/questions/bulk', {
        examId: bulkExamId,
        questions: parsedQuestions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Successfully imported ${parsedQuestions.length} questions!`);
      setBulkDataText('');
      setBulkFile(null);
      if (selectedExamForView === bulkExamId || !selectedExamForView) {
        setSelectedExamForView(bulkExamId);
        fetchQuestions(bulkExamId);
      }
      setActiveTab('single');
    } catch (err) {
      console.error("Bulk upload error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to process bulk upload");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div>
      <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden" style={{ border: '1px solid #ede9fe' }}>
        <div className="bg-light px-4 pt-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            Add Questions to Exam
          </h5>
          <Nav variant="pills" className="custom-pills gap-2 mb-2">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'single'} 
                onClick={() => setActiveTab('single')}
                className="py-1 px-3 small fw-semibold"
                style={{ cursor: 'pointer', borderRadius: '8px', backgroundColor: activeTab === 'single' ? '#7c5cff' : 'transparent', color: activeTab === 'single' ? '#fff' : '#64748b' }}
              >
                Single Question
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'bulk'} 
                onClick={() => setActiveTab('bulk')}
                className="py-1 px-3 small fw-semibold d-flex align-items-center gap-1"
                style={{ cursor: 'pointer', borderRadius: '8px', backgroundColor: activeTab === 'bulk' ? '#7c5cff' : 'transparent', color: activeTab === 'bulk' ? '#fff' : '#64748b' }}
              >
                <Upload size={14} /> Bulk Upload (CSV/JSON)
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
        
        <Card.Body className="p-4">
          {activeTab === 'single' ? (
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
          ) : (
            <Form onSubmit={handleBulkSubmit}>
              <div className="p-3 mb-4 rounded-3 bg-light border border-dashed d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h6 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                    <FileSpreadsheet size={18} className="text-success" /> Prepare Your Question Bank
                  </h6>
                  <p className="text-muted small mb-0">
                    Upload a CSV file or paste formatted JSON array. Use our standard template for best results.
                  </p>
                </div>
                <Button 
                  variant="outline-success" 
                  size="sm" 
                  onClick={handleDownloadSampleCsv}
                  className="fw-semibold d-flex align-items-center gap-1 py-2 px-3"
                  style={{ borderRadius: '8px' }}
                >
                  <Download size={15} /> Download Sample CSV Template
                </Button>
              </div>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Target Exam</Form.Label>
                  <Form.Select
                    value={bulkExamId}
                    onFocus={fetchExams}
                    onChange={e => setBulkExamId(e.target.value)}
                    required
                  >
                    <option value="">Select Target Exam...</option>
                    {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.title}</option>)}
                  </Form.Select>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Upload CSV / JSON File</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={e => setBulkFile(e.target.files[0])}
                  />
                  <Form.Text className="text-muted small">Supports .csv or .json files</Form.Text>
                </Col>

                <Col md={12} className="mb-4">
                  <Form.Label className="small fw-semibold text-muted">Or Paste CSV / JSON Content Direct</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    placeholder={`Paste CSV data or JSON array here...\ne.g.\n[{"text": "What is 2+2?", "type": "mcq", "marks": 1, "options": [{"text": "4", "isCorrect": true}, {"text": "5", "isCorrect": false}]}]`}
                    value={bulkDataText}
                    onChange={e => setBulkDataText(e.target.value)}
                    disabled={!!bulkFile}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                  {bulkFile && <Form.Text className="text-success small fw-semibold">✔ File selected ({bulkFile.name}). Clear file input to paste manual text.</Form.Text>}
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button 
                  type="button" 
                  variant="outline-secondary" 
                  onClick={() => { setBulkFile(null); setBulkDataText(''); }}
                  disabled={bulkLoading}
                >
                  Clear
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="px-5 text-white fw-bold d-flex align-items-center gap-2"
                  style={{ backgroundColor: '#7c5cff', border: 'none' }}
                  disabled={bulkLoading}
                >
                  <Upload size={16} /> {bulkLoading ? 'Importing Questions...' : 'Import Questions'}
                </Button>
              </div>
            </Form>
          )}
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
