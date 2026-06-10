import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Card, Accordion, Badge } from 'react-bootstrap';
import { Plus, Edit, Trash2, Save, X, PlusCircle, MinusCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const initialFormState = {
    category: '',
    categoryBgColor: '#f8a39a',
    title: '',
    fullName: '',
    abbr: '',
    iconColor: '#2a6ce4',
    focus: '',
    eligibility: '',
    fees: '',
    outcome: '',
    flyerUrl: '/PDF_PGCP_AC.pdf',
    training: [{
      name: '',
      address: '',
      phone: '',
      contact: '',
      email: '',
      otherCourses: ''
    }],
    contents: [{ title: '', duration: '', modules: [''] }],
    faqs: [{ q: '', a: '' }]
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses", err);
    }
  };

  const handleShow = (course = null) => {
    if (course) {
      // Sanitize data for editing
      const sanitizedCourse = { ...course };
      if (!Array.isArray(sanitizedCourse.training)) {
        sanitizedCourse.training = sanitizedCourse.training ? [sanitizedCourse.training] : initialFormState.training;
      }
      if (!Array.isArray(sanitizedCourse.faqs)) {
        sanitizedCourse.faqs = sanitizedCourse.faqs ? [sanitizedCourse.faqs] : initialFormState.faqs;
      }
      if (!Array.isArray(sanitizedCourse.contents)) {
        sanitizedCourse.contents = sanitizedCourse.contents ? [sanitizedCourse.contents] : initialFormState.contents;
      }
      
      setEditingCourse(sanitizedCourse);
      setFormData(sanitizedCourse);
    } else {
      setEditingCourse(null);
      setFormData(initialFormState);
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleTrainingChange = (idx, field, value) => {
    const newTraining = [...formData.training];
    newTraining[idx][field] = value;
    setFormData({ ...formData, training: newTraining });
  };

  const addTraining = () => {
    setFormData({
      ...formData,
      training: [...formData.training, { name: '', address: '', phone: '', contact: '', email: '', otherCourses: '' }]
    });
  };

  const removeTraining = (idx) => {
    const newTraining = [...formData.training];
    newTraining.splice(idx, 1);
    setFormData({ ...formData, training: newTraining });
  };

  // Dynamic Content Handlers
  const addContent = () => {
    setFormData({
      ...formData,
      contents: [...formData.contents, { title: '', duration: '', modules: [''] }]
    });
  };

  const removeContent = (idx) => {
    const newContents = [...formData.contents];
    newContents.splice(idx, 1);
    setFormData({ ...formData, contents: newContents });
  };

  const handleContentChange = (idx, field, value) => {
    const newContents = [...formData.contents];
    newContents[idx][field] = value;
    setFormData({ ...formData, contents: newContents });
  };

  const addModule = (cIdx) => {
    const newContents = [...formData.contents];
    newContents[cIdx].modules.push('');
    setFormData({ ...formData, contents: newContents });
  };

  const handleModuleChange = (cIdx, mIdx, value) => {
    const newContents = [...formData.contents];
    newContents[cIdx].modules[mIdx] = value;
    setFormData({ ...formData, contents: newContents });
  };

  // FAQ Handlers
  const addFaq = () => {
    setFormData({ ...formData, faqs: [...formData.faqs, { q: '', a: '' }] });
  };

  const removeFaq = (idx) => {
    const newFaqs = [...formData.faqs];
    newFaqs.splice(idx, 1);
    setFormData({ ...formData, faqs: newFaqs });
  };

  const handleFaqChange = (idx, field, value) => {
    const newFaqs = [...formData.faqs];
    newFaqs[idx][field] = value;
    setFormData({ ...formData, faqs: newFaqs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };

    const data = new FormData();
    data.append('data', JSON.stringify(formData));
    if (selectedFile) {
      data.append('flyer', selectedFile);
    }

    try {
      if (editingCourse) {
        await axios.put(`http://localhost:5000/api/courses/${editingCourse._id}`, data, config);
        toast.success("Course updated successfully!");
      } else {
        await axios.post('http://localhost:5000/api/courses', data, config);
        toast.success("Course created successfully!");
      }
      fetchCourses();
      handleClose();
    } catch (err) {
      console.error("Error saving course", err);
      toast.error("Failed to save course: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/courses/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchCourses();
        toast.success('Course deleted successfully');
      } catch (err) {
        console.error("Error deleting course", err);
        toast.error('Failed to delete course');
      }
    }
  };

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
      <Card.Header className="bg-white p-4 d-flex justify-content-between align-items-center border-bottom">
        <h4 className="mb-0 fw-bold">Manage Courses</h4>
        <Button className="fw-bold text-white border-0" style={{ background: 'linear-gradient(135deg, #7c5cff, #6a41e6)', borderRadius: '10px', boxShadow: '0 4px 12px rgba(124,92,255,0.2)' }} onClick={() => handleShow()}>
          <Plus size={18} className="me-2" /> Add New Course
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th>Category</th>
              <th>Abbr</th>
              <th className="text-end px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td className="px-4 py-3 fw-bold">{course.title}</td>
                <td>
                  <span 
                    style={{ 
                      backgroundColor: '#f3e8ff', 
                      color: '#7e22ce',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      border: '1px solid #e9d5ff',
                      display: 'inline-block',
                      boxShadow: '0 2px 4px rgba(124,58,237,0.05)'
                    }}
                  >
                    {course.category}
                  </span>
                </td>
                <td>{course.abbr}</td>
                <td className="text-end px-4">
                  <Button variant="link" className="text-primary p-0 me-3" onClick={() => handleShow(course)}><Edit size={18} /></Button>
                  <Button variant="link" className="text-danger p-0" onClick={() => handleDelete(course._id)}><Trash2 size={18} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>

      {/* Course Editor Modal */}
      <Modal show={showModal} onHide={handleClose} size="xl" scrollable>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">{editingCourse ? 'Edit Course' : 'Add New Course'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Accordion defaultActiveKey="0">
              {/* Step 1: General Info */}
              <Accordion.Item eventKey="0" className="mb-3 border rounded">
                <Accordion.Header><span className="fw-bold">1. General Information</span></Accordion.Header>
                <Accordion.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Course Title (e.g. PGCP-AC)</Form.Label>
                        <Form.Control name="title" value={formData.title} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control name="fullName" value={formData.fullName} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Category</Form.Label>
                        <Form.Control name="category" value={formData.category} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Abbreviation (e.g. AC)</Form.Label>
                        <Form.Control name="abbr" value={formData.abbr} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Icon Color</Form.Label>
                        <div className="d-flex gap-2">
                          <Form.Control
                            type="color"
                            name="iconColor"
                            value={formData.iconColor || '#2a6ce4'}
                            onChange={handleChange}
                            style={{ width: '46px', height: '38px', padding: '2px', flexShrink: 0 }}
                          />
                          <Form.Control
                            type="text"
                            name="iconColor"
                            value={formData.iconColor}
                            onChange={handleChange}
                            placeholder="#2a6ce4"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Category Bg Color</Form.Label>
                        <div className="d-flex gap-2">
                          <Form.Control
                            type="color"
                            name="categoryBgColor"
                            value={formData.categoryBgColor || '#f8a39a'}
                            onChange={handleChange}
                            style={{ width: '46px', height: '38px', padding: '2px', flexShrink: 0 }}
                          />
                          <Form.Control
                            type="text"
                            name="categoryBgColor"
                            value={formData.categoryBgColor}
                            onChange={handleChange}
                            placeholder="#f8a39a"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="fw-bold text-primary">Course Flyer (PDF/Image)</Form.Label>
                        <Form.Control type="file" onChange={handleFileChange} accept=".pdf,image/*" />
                        <Form.Text className="text-muted small">
                          Selected: {selectedFile ? selectedFile.name : (formData.flyerUrl || 'None')}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>

              {/* Step 2: Content Details */}
              <Accordion.Item eventKey="1" className="mb-3 border rounded">
                <Accordion.Header><span className="fw-bold">2. Course Details & Eligibility</span></Accordion.Header>
                <Accordion.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Focus (Intro Paragraph)</Form.Label>
                    <Form.Control as="textarea" rows={4} name="focus" value={formData.focus} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Eligibility Criteria</Form.Label>
                    <Form.Control as="textarea" rows={4} name="eligibility" value={formData.eligibility} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Fees Information</Form.Label>
                    <Form.Control as="textarea" rows={4} name="fees" value={formData.fees} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Outcomes</Form.Label>
                    <Form.Control as="textarea" rows={4} name="outcome" value={formData.outcome} onChange={handleChange} />
                  </Form.Group>
                </Accordion.Body>
              </Accordion.Item>

              {/* Step 3: Syllabus Modules */}
              <Accordion.Item eventKey="2" className="mb-3 border rounded">
                <Accordion.Header><span className="fw-bold">3. Course Contents (Syllabus)</span></Accordion.Header>
                <Accordion.Body>
                  {formData.contents.map((content, cIdx) => (
                    <div key={cIdx} className="p-3 border rounded bg-light mb-3 position-relative">
                      <Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-2" onClick={() => removeContent(cIdx)}><X size={14} /></Button>
                      <Row className="g-3 mb-3">
                        <Col md={8}>
                          <Form.Label>Module Title</Form.Label>
                          <Form.Control value={content.title} onChange={(e) => handleContentChange(cIdx, 'title', e.target.value)} />
                        </Col>
                        <Col md={4}>
                          <Form.Label>Duration (e.g. 60 Hours)</Form.Label>
                          <Form.Control value={content.duration} onChange={(e) => handleContentChange(cIdx, 'duration', e.target.value)} />
                        </Col>
                      </Row>
                      <div className="ms-4">
                        <Form.Label className="small fw-bold">Topics/Modules</Form.Label>
                        {content.modules.map((mod, mIdx) => (
                          <div key={mIdx} className="d-flex gap-2 mb-2">
                            <Form.Control size="sm" value={mod} onChange={(e) => handleModuleChange(cIdx, mIdx, e.target.value)} />
                            {mIdx === content.modules.length - 1 && <Button variant="outline-success" size="sm" onClick={() => addModule(cIdx)}><Plus size={12} /></Button>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline-primary" className="w-100" onClick={addContent}>Add New Module Group</Button>
                </Accordion.Body>
              </Accordion.Item>

              {/* Step 4: Training & FAQs */}
              <Accordion.Item eventKey="3" className="mb-3 border rounded">
                <Accordion.Header><span className="fw-bold">4. Training Centres & FAQs</span></Accordion.Header>
                <Accordion.Body>
                  <h6 className="fw-bold mb-3 border-bottom pb-2">Training Centres</h6>
                  {formData.training.map((center, tIdx) => (
                    <div key={tIdx} className="p-3 border rounded bg-light mb-3 position-relative">
                      <Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-2" onClick={() => removeTraining(tIdx)}><X size={14} /></Button>
                      <Row className="g-3">
                        <Col md={6}><Form.Control placeholder="Centre Name" value={center.name} onChange={(e) => handleTrainingChange(tIdx, 'name', e.target.value)} /></Col>
                        <Col md={6}><Form.Control placeholder="Phone" value={center.phone} onChange={(e) => handleTrainingChange(tIdx, 'phone', e.target.value)} /></Col>
                        <Col md={12}><Form.Control placeholder="Address" value={center.address} onChange={(e) => handleTrainingChange(tIdx, 'address', e.target.value)} /></Col>
                        <Col md={6}><Form.Control placeholder="Email" value={center.email} onChange={(e) => handleTrainingChange(tIdx, 'email', e.target.value)} /></Col>
                        <Col md={6}><Form.Control placeholder="Contact Person" value={center.contact} onChange={(e) => handleTrainingChange(tIdx, 'contact', e.target.value)} /></Col>
                        <Col md={12}><Form.Control placeholder="Other Courses offered" value={center.otherCourses} onChange={(e) => handleTrainingChange(tIdx, 'otherCourses', e.target.value)} /></Col>
                      </Row>
                    </div>
                  ))}
                  <Button variant="outline-primary" className="w-100 mb-4" onClick={addTraining}>Add New Training Centre</Button>

                  <h6 className="fw-bold mb-3 border-bottom pb-2">FAQs</h6>
                  {formData.faqs.map((faq, fIdx) => (
                    <div key={fIdx} className="mb-3 p-2 border rounded">
                      <Form.Control className="mb-2" placeholder="Question" value={faq.q} onChange={(e) => handleFaqChange(fIdx, 'q', e.target.value)} />
                      <Form.Control as="textarea" rows={2} placeholder="Answer" value={faq.a} onChange={(e) => handleFaqChange(fIdx, 'a', e.target.value)} />
                      <Button variant="link" className="text-danger p-0 mt-1" onClick={() => removeFaq(fIdx)}>Remove FAQ</Button>
                    </div>
                  ))}
                  <Button variant="outline-primary" size="sm" onClick={addFaq}>Add FAQ</Button>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <div className="mt-4 d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button variant="success" type="submit" disabled={loading} className="px-5 fw-bold">
                {loading ? 'Saving...' : 'Save Course'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default ManageCourses;
