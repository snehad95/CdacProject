import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Card } from 'react-bootstrap';
import { Check, X, Edit2, Trash2, Globe, EyeOff, Play, Image } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFeedback, setEditFeedback] = useState('');
  
  // Video Modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/testimonials/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestimonials(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/testimonials/admin/${id}`, {
        data: { status }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Testimonial status updated to ${status}`);
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const togglePublish = async (id, isPublished) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/testimonials/admin/${id}`, {
        data: { isPublished }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(isPublished ? 'Testimonial published!' : 'Testimonial unpublished!');
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update publish state');
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditFeedback(item.feedback);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/testimonials/admin/${editingItem._id}`, {
        data: { feedback: editFeedback }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Testimonial feedback updated');
      setShowEditModal(false);
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      toast.error('Failed to edit feedback');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/testimonials/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete testimonial');
    }
  };

  const playVideo = (url) => {
    setCurrentVideoUrl(url);
    setShowVideoModal(true);
  };

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
      <Card.Header className="bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
        <h4 className="mb-0 fw-bold">Manage Testimonials</h4>
        <Button variant="outline-primary" size="sm" onClick={fetchTestimonials} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th>Feedback</th>
              <th>Media</th>
              <th>Status</th>
              <th>Visibility</th>
              <th className="text-end px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((item) => (
              <tr key={item._id}>
                <td className="px-4">
                  <div className="d-flex align-items-center gap-3">
                    {item.profileImageUrl ? (
                      <img
                        src={item.profileImageUrl}
                        alt={item.studentName}
                        className="rounded-circle border"
                        style={{ width: 44, height: 44, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white bg-primary"
                        style={{ width: 44, height: 44, fontSize: '1rem' }}
                      >
                        {item.studentName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="fw-bold">{item.studentName}</div>
                      <div className="small text-muted">ID: {item.studentId?._id || item.studentId || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ maxWidth: '300px' }}>
                  <div className="text-truncate-2 small">{item.feedback}</div>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    {item.profileImageUrl && (
                      <Badge bg="secondary" className="d-flex align-items-center gap-1">
                        <Image size={12} /> Image
                      </Badge>
                    )}
                    {item.videoUrl ? (
                      <Button
                        size="sm"
                        variant="info"
                        className="text-white py-0 px-2 d-flex align-items-center gap-1"
                        onClick={() => playVideo(item.videoUrl)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <Play size={12} fill="#fff" /> Video
                      </Button>
                    ) : (
                      <span className="text-muted small">No Video</span>
                    )}
                  </div>
                </td>
                <td>
                  {item.status === 'approved' && <Badge bg="success">Approved</Badge>}
                  {item.status === 'rejected' && <Badge bg="danger">Rejected</Badge>}
                  {item.status === 'pending' && <Badge bg="warning">Pending</Badge>}
                </td>
                <td>
                  {item.isPublished ? (
                    <Badge bg="success" className="d-inline-flex align-items-center gap-1">
                      <Globe size={11} /> Published
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="d-inline-flex align-items-center gap-1">
                      <EyeOff size={11} /> Draft
                    </Badge>
                  )}
                </td>
                <td className="text-end px-4">
                  <div className="d-flex justify-content-end gap-2">
                    {item.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        title="Approve"
                        onClick={() => updateStatus(item._id, 'approved')}
                      >
                        <Check size={14} />
                      </Button>
                    )}
                    {item.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        title="Reject"
                        onClick={() => updateStatus(item._id, 'rejected')}
                      >
                        <X size={14} />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      title="Edit"
                      onClick={() => handleEditClick(item)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    {item.status === 'approved' && (
                      <Button
                        size="sm"
                        variant={item.isPublished ? "outline-warning" : "outline-info"}
                        title={item.isPublished ? "Unpublish" : "Publish"}
                        onClick={() => togglePublish(item._id, !item.isPublished)}
                      >
                        {item.isPublished ? <EyeOff size={14} /> : <Globe size={14} />}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-danger"
                      title="Delete"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No testimonials found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>

      {/* Edit Feedback Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">Edit Testimonial Feedback</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Student Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={editFeedback}
                onChange={(e) => setEditFeedback(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Video Playback Modal */}
      <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white border-0">
          <Modal.Title className="fw-bold">Testimonial Video</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark p-0">
          {currentVideoUrl && (
            <video
              src={currentVideoUrl}
              controls
              autoPlay
              className="w-100"
              style={{ maxHeight: '500px' }}
            />
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </Card>
  );
};

export default ManageTestimonials;
