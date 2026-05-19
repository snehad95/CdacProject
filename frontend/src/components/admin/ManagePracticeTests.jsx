import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { PlusCircle, Trash2, Layout, Type, AlignLeft, Image as ImageIcon, Pencil } from 'lucide-react';
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
      document.getElementById('testImageInput').value = '';
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
