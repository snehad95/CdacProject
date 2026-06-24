import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const T = {
  primary: '#7c5cff', primaryDeep: '#6a41e6', text: 'var(--cdac-text)',
  muted: '#6b6483', border: 'var(--cdac-border)', surface: 'var(--cdac-surface)',
};

const RegisterModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name, email: formData.email, password: formData.password,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      handleClose();
      toast.success('Registration successful! Welcome to CDAC ExamWeb.', { duration: 3000 });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const inputStyle = { border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <div style={{ background: T.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.border}` }}>
        <div style={{ height: 6, background: `linear-gradient(90deg, ${T.primary}, ${T.primaryDeep})` }} />
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold w-100 text-center" style={{ color: T.primaryDeep }}>
            Create an Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 p-md-5">
          <p className="text-center mb-4" style={{ color: T.muted }}>Join CDAC ExamWeb and start practising today.</p>
          {error && (
            <div className="p-2 mb-3 rounded text-center"
              style={{ background: '#fdecec', color: '#b42318', fontSize: 14 }}>{error}</div>
          )}
          <Form onSubmit={handleRegister}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: T.text }}>Full Name</Form.Label>
                  <Form.Control name="name" placeholder="Your name" value={formData.name}
                    onChange={handleChange} required style={inputStyle} />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: T.text }}>Email address</Form.Label>
                  <Form.Control type="email" name="email" placeholder="you@example.com"
                    value={formData.email} onChange={handleChange} required style={inputStyle} />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: T.text }}>Password</Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      placeholder="Create a password"
                      value={formData.password} 
                      onChange={handleChange} 
                      required 
                      minLength={6} 
                      style={{ ...inputStyle, paddingRight: '42px' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: T.muted,
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-4">
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: T.text }}>Confirm Password</Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword" 
                      placeholder="Confirm your password"
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      required 
                      style={{ ...inputStyle, paddingRight: '42px' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: T.muted,
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Button 
              className="w-100 py-2 fs-6 fw-bold text-white border-0" 
              type="submit"
              disabled={loading}
              style={{
                background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`,
                borderRadius: 10, boxShadow: '0 8px 20px rgba(124,92,255,0.35)',
              }}
            >
              {loading ? 'Registering...' : 'Register Now'}
            </Button>
          </Form>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default RegisterModal;
