import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';

const RegisterModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      await axios.post('http://localhost:5000/api/auth/register', { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password 
      });
      handleClose();
      toast.success("Registration successful! Please login to continue.", { duration: 5000 });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" backdropClassName="custom-backdrop-blur">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold w-100 text-center" style={{ color: '#6a41e6' }}>Create an Account</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 p-md-5">
        {error && <div className="alert alert-danger p-2">{error}</div>}
        <Form onSubmit={handleRegister}>
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label className="fw-semibold">Full Name</Form.Label>
                <Form.Control type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label className="fw-semibold">Email address</Form.Label>
                <Form.Control type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-4">
              <Form.Group>
                <Form.Label className="fw-semibold">Password</Form.Label>
                <Form.Control type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} required minLength={6} />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-4">
              <Form.Group>
                <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                <Form.Control type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>
          <Button className="w-100 py-2 fs-5 fw-bold shadow-sm text-white" type="submit" style={{ backgroundColor: '#6a41e6', border: 'none' }}>
            Register Now
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterModal;
