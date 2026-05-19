import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, Tabs, Tab } from 'react-bootstrap';
import { PlusCircle, Trash2, Calendar, Clock, Award, Tag, AlignLeft, Pencil, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '', category: '', description: '',
  startTime: '', endTime: '', durationMinutes: '', totalMarks: '', passingScore: 40, 
  resultsPublished: false, negativeMarking: false, negativeMarks: 0.25
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
      await axios.post('http://localhost:5000/api/exams', formData);
      setFormData(emptyForm);
      setAutoDuration('');
      fetchExams();
      setActiveTab('list');
      toast.success('✅ Exam published successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this exam? This cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/exams/${id}`);
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
      negativeMarks: exam.negativeMarks || 0
    });
    setEditAutoDuration(calcDuration(exam.startTime, exam.endTime));
    setShowEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/exams/${editId}`, editData);
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
            </Row>

            <div className="text-end">
              <Button type="submit" size="lg" className="px-5 fw-800 rounded-pill shadow-sm"
                style={{ backgroundColor: '#7c5cff', border: 'none' }}>
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
