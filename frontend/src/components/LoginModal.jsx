import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const LoginModal = ({ show, handleClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.reload(); // Quick refresh for now
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdropClassName="custom-backdrop-blur">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold w-100 text-center" style={{ color: '#6a41e6' }}>Login to CDAC ExamWeb</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 p-md-5">
        {error && <div className="alert alert-danger p-2">{error}</div>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>
          <Button className="w-100 py-2 fs-5 fw-bold shadow-sm text-white" type="submit" style={{ backgroundColor: '#6a41e6', border: 'none' }}>
            Sign In
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
