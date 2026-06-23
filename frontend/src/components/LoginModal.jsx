import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const T = {
  primary: '#7c5cff', primaryDeep: '#6a41e6', text: 'var(--cdac-text)',
  muted: '#6b6483', border: 'var(--cdac-border)', surface: 'var(--cdac-surface)',
};

const LoginModal = ({ show, handleClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      handleClose();
      
      const role = res.data.user.role;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdropClassName="custom-backdrop-blur">
      <div style={{ background: T.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.border}` }}>
        <div style={{ height: 6, background: `linear-gradient(90deg, ${T.primary}, ${T.primaryDeep})` }} />
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold w-100 text-center" style={{ color: T.primaryDeep }}>
            Welcome back
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 p-md-5">
          <p className="text-center mb-4" style={{ color: T.muted }}>Sign in to continue to CDAC ExamWeb</p>
          {error && (
            <div className="p-2 mb-3 rounded text-center"
              style={{ background: '#fdecec', color: '#b42318', fontSize: 14 }}>{error}</div>
          )}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ color: T.text }}>Email address</Form.Label>
              <Form.Control type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }} />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold" style={{ color: T.text }}>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }} />
            </Form.Group>
            <Button className="w-100 py-2 fs-6 fw-bold text-white border-0" type="submit"
              style={{
                background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`,
                borderRadius: 10, boxShadow: '0 8px 20px rgba(124,92,255,0.35)',
              }}>
              Sign In
            </Button>
          </Form>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default LoginModal;
