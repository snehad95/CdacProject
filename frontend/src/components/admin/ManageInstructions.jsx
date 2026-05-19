import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Nav } from 'react-bootstrap';
import { Save, Info, CheckCircle, GraduationCap, Laptop } from 'lucide-react';

const ManageInstructions = () => {
  const [activeType, setActiveType] = useState('practice'); // 'practice' or 'exam'
  const [practiceInst, setPracticeInst] = useState([]);
  const [examInst, setExamInst] = useState([]);
  const [newInst, setNewInst] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load Practice Instructions
    const savedPractice = JSON.parse(localStorage.getItem('practiceInstructions') || '[]');
    if (savedPractice.length === 0) {
        const defaults = [
            "1. This is a practice test for exam preparation.",
            "2. Each question carries 1 equal mark.",
            "3. There is no negative marking.",
            "4. Your final score will be displayed immediately."
        ];
        setPracticeInst(defaults);
        localStorage.setItem('practiceInstructions', JSON.stringify(defaults));
    } else {
        setPracticeInst(savedPractice);
    }

    // Load Exam Instructions
    const savedExam = JSON.parse(localStorage.getItem('examInstructions') || '[]');
    if (savedExam.length === 0) {
        const defaults = [
            "1. This is a proctored official exam.",
            "2. Ensure your webcam and microphone are working.",
            "3. Do not minimize the browser or switch tabs.",
            "4. Result will be announced by the coordinator later."
        ];
        setExamInst(defaults);
        localStorage.setItem('examInstructions', JSON.stringify(defaults));
    } else {
        setExamInst(savedExam);
    }
  }, []);

  const handleSave = () => {
    if (activeType === 'practice') {
        localStorage.setItem('practiceInstructions', JSON.stringify(practiceInst));
        localStorage.setItem('siteInstructions', JSON.stringify(practiceInst)); // Keep legacy sync
    } else {
        localStorage.setItem('examInstructions', JSON.stringify(examInst));
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const addInstruction = () => {
    if (!newInst.trim()) return;
    if (activeType === 'practice') {
      setPracticeInst([...practiceInst, newInst]);
    } else {
      setExamInst([...examInst, newInst]);
    }
    setNewInst('');
  };

  const removeInstruction = (index) => {
    if (activeType === 'practice') {
      setPracticeInst(practiceInst.filter((_, i) => i !== index));
    } else {
      setExamInst(examInst.filter((_, i) => i !== index));
    }
  };

  const currentInstructions = activeType === 'practice' ? practiceInst : examInst;

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
      <Card.Header style={{ backgroundColor: '#7c5cff', color: '#fff', padding: '0' }}>
        <div className="p-4 d-flex align-items-center gap-2">
            <Info size={24} />
            <h4 className="mb-0 fw-bold">Instruction Manager</h4>
        </div>
        <Nav variant="tabs" className="px-4 border-0 admin-inst-tabs" activeKey={activeType} onSelect={(k) => setActiveType(k)}>
          <Nav.Item>
            <Nav.Link eventKey="practice" className="border-0 px-4 py-3 fw-bold d-flex align-items-center gap-2">
                <Laptop size={18} /> Practice Test
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="exam" className="border-0 px-4 py-3 fw-bold d-flex align-items-center gap-2">
                <GraduationCap size={18} /> Official Exam
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Header>
      
      <Card.Body className="p-4">
        {showSuccess && (
          <Alert variant="success" className="d-flex align-items-center gap-2 border-0 shadow-sm">
            <CheckCircle size={20} />
            {activeType === 'practice' ? 'Practice' : 'Exam'} instructions published successfully!
          </Alert>
        )}

        <div className="mb-4">
          <label className="fw-bold mb-2 text-uppercase small text-muted ls-1">
            Current {activeType === 'practice' ? 'Practice' : 'Official'} Instructions
          </label>
          <div className="bg-light p-3 rounded-3 border">
            {currentInstructions.map((inst, idx) => (
              <div key={idx} className="d-flex justify-content-between align-items-center mb-2 last-child-mb-0 p-2 bg-white rounded border-bottom shadow-sm">
                <span className="fw-semibold" style={{ color: '#4a5568' }}>{inst}</span>
                <Button variant="outline-danger" size="sm" className="rounded-circle border-0" style={{ width: '28px', height: '28px', padding: 0 }} onClick={() => removeInstruction(idx)}>×</Button>
              </div>
            ))}
            {currentInstructions.length === 0 && <p className="text-muted mb-0">No instructions set yet.</p>}
          </div>
        </div>

        <Form.Group className="mb-4">
          <label className="fw-bold mb-2 text-uppercase small text-muted ls-1 text-primary">Add New Line</label>
          <div className="d-flex gap-2">
            <Form.Control 
              type="text" 
              placeholder={`e.g. ${activeType === 'practice' ? 'Each question has 1 mark...' : 'Webcam is mandatory...'}`}
              value={newInst}
              onChange={(e) => setNewInst(e.target.value)}
              className="rounded-3 border-light py-2 shadow-none"
              style={{ backgroundColor: '#f8faff' }}
            />
            <Button 
              style={{ backgroundColor: '#7c5cff', border: 'none' }}
              onClick={addInstruction}
              className="px-4 fw-bold"
            >Add</Button>
          </div>
        </Form.Group>

        <div className="d-grid pt-2">
          <Button 
            size="lg"
            variant="success" 
            className="fw-bold rounded-pill shadow-sm"
            onClick={handleSave}
            style={{ padding: '15px' }}
          >
            <Save size={20} className="me-2" />
            Publish to Live Frontend
          </Button>
        </div>
      </Card.Body>
      <style>{`
        .admin-inst-tabs .nav-link { color: rgba(255,255,255,0.7) !important; background: transparent !important; }
        .admin-inst-tabs .nav-link.active { color: #fff !important; background: rgba(255,255,255,0.1) !important; border-bottom: 4px solid #ffc107 !important; }
        .ls-1 { letter-spacing: 1px; }
      `}</style>
    </Card>
  );
};

export default ManageInstructions;
