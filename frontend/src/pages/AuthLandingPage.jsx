import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, LogIn, UserPlus, Sparkles, ShieldCheck,
  Mail, Lock, User, CheckCircle2
} from 'lucide-react';

const T = {
  primary: '#7c5cff',
  primaryDeep: '#5b32d6',
  primarySoft: '#f0ebff',
  accent: '#a78bfa',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  surface: '#ffffff',
  bg: '#f8fafc',
};

const AuthLandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleAuthSuccess = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    const role = user?.role || 'student';
    const targetUrl = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/exams';
    window.location.href = targetUrl;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      toast.success('Login successful!');
      handleAuthSuccess(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: regName,
        email: regEmail,
        password: regPassword,
      });
      toast.success('Registration successful!');
      handleAuthSuccess(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    border: `1.5px solid ${focusedField === fieldName ? T.primary : '#cbd5e1'}`,
    borderRadius: 12,
    padding: '12px 16px 12px 42px',
    fontSize: '0.95rem',
    background: focusedField === fieldName ? '#ffffff' : '#f8fafc',
    color: T.text,
    fontWeight: 500,
    boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(124, 92, 255, 0.12)' : 'none',
    transition: 'all 0.2s ease',
    outline: 'none',
  });

  return (
    <div
      style={{
        /* Soft pastel pink-to-ice-blue geometric gradient background exactly matching the reference image */
        background: 'linear-gradient(125deg, #fce7f3 0%, #fff1f2 25%, #f3f4f6 50%, #eff6ff 75%, #e0f2fe 100%)',
        minHeight: '100vh',
        paddingBottom: 80,
        color: T.text,
        position: 'relative',
      }}
    >
      {/* Subtle decorative background glow shapes to recreate geometric light look */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '400px',
          background: 'radial-gradient(circle at 10% 20%, rgba(244, 114, 182, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50px',
          right: 0,
          width: '50%',
          height: '400px',
          background: 'radial-gradient(circle at 90% 30%, rgba(96, 165, 250, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Logo Bar */}
      <div
        className="py-3 px-4 mb-4 d-flex justify-content-between align-items-center shadow-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="d-flex align-items-center">
          <img src="http://recruitment-portal.in/reccdac/images/logo_cdac.png" alt="CDAC Logo" style={{ height: 46, objectFit: 'contain' }} />
        </div>
        <div className="d-none d-sm-flex align-items-center gap-2 small fw-semibold" style={{ color: T.muted }}>
          <ShieldCheck size={18} color={T.primary} />
          <span>Official Assessment Gateway</span>
        </div>
      </div>

      <Container className="px-3 px-md-4" style={{ position: 'relative', zIndex: 2 }}>
        {/* Banner Image Section framed in thick white border with rounded corners exactly like reference */}
        <div className="mb-5 d-flex justify-content-center">
          <div
            style={{
              width: '100%',
              maxWidth: 1180,
              borderRadius: 24,
              overflow: 'hidden',
              background: '#ffffff',
              padding: 6,
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
            }}
          >
            <div
              style={{
                width: '100%',
                borderRadius: 18,
                overflow: 'hidden',
                background: '#110c22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/pgcp-banner.jpg"
                alt="C-DAC ACTS Post Graduate Certificate Programme Banner"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 380,
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>

        {/* Clean Executive Login/Register Portal Card */}
        <Row className="justify-content-center">
          <Col xs={12} md={9} lg={6} xl={5}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 24,
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.1), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
                overflow: 'hidden',
              }}
            >
              <div className="p-4 p-md-5">
                {/* Clean Switcher Tabs (Only Sign In and Register Buttons) */}
                <div
                  className="p-1 mb-4 rounded-3 d-flex"
                  style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
                >
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setError(''); }}
                    className="flex-grow-1 py-2 border-0 rounded-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: activeTab === 'login' ? '#ffffff' : 'transparent',
                      color: activeTab === 'login' ? '#0f172a' : '#64748b',
                      fontSize: '0.95rem',
                      boxShadow: activeTab === 'login' ? '0 4px 12px rgba(15,23,42,0.08)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <LogIn size={16} color={activeTab === 'login' ? T.primary : '#64748b'} /> Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setError(''); }}
                    className="flex-grow-1 py-2 border-0 rounded-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: activeTab === 'register' ? '#ffffff' : 'transparent',
                      color: activeTab === 'register' ? '#0f172a' : '#64748b',
                      fontSize: '0.95rem',
                      boxShadow: activeTab === 'register' ? '0 4px 12px rgba(15,23,42,0.08)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <UserPlus size={16} color={activeTab === 'register' ? T.primary : '#64748b'} /> Register
                  </button>
                </div>

                {/* Error Alert */}
                {error && (
                  <div
                    className="p-3 mb-4 rounded-3 text-center fw-semibold d-flex align-items-center justify-content-center gap-2"
                    style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.88rem' }}
                  >
                    <span>⚠️</span> {error}
                  </div>
                )}

                {/* Login Form */}
                {activeTab === 'login' ? (
                  <Form onSubmit={handleLoginSubmit} autoComplete="off">
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small text-uppercase" style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.6px' }}>
                        Email Address
                      </Form.Label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <Mail size={18} color={focusedField === 'loginEmail' ? T.primary : '#94a3b8'} />
                        </div>
                        <Form.Control
                          type="email"
                          placeholder="Enter your registered email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          onFocus={() => setFocusedField('loginEmail')}
                          onBlur={() => setFocusedField(null)}
                          required
                          autoComplete="off"
                          style={getInputStyle('loginEmail')}
                        />
                      </div>
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold small text-uppercase" style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.6px' }}>
                        Password
                      </Form.Label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <Lock size={18} color={focusedField === 'loginPassword' ? T.primary : '#94a3b8'} />
                        </div>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          onFocus={() => setFocusedField('loginPassword')}
                          onBlur={() => setFocusedField(null)}
                          required
                          autoComplete="new-password"
                          style={{ ...getInputStyle('loginPassword'), paddingRight: 44 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: 14,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                          }}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </Form.Group>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-100 py-3 fw-bold border-0 d-flex align-items-center justify-content-center gap-2 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`,
                        borderRadius: 12,
                        boxShadow: '0 10px 25px rgba(124,92,255,0.35)',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {loading ? 'Signing In...' : <><LogIn size={18} /> Sign In</>}
                    </Button>
                  </Form>
                ) : (
                  /* Register Form */
                  <Form onSubmit={handleRegisterSubmit} autoComplete="off">
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small text-uppercase" style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.6px' }}>
                        Full Name
                      </Form.Label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <User size={18} color={focusedField === 'regName' ? T.primary : '#94a3b8'} />
                        </div>
                        <Form.Control
                          type="text"
                          placeholder="Enter your full name"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          onFocus={() => setFocusedField('regName')}
                          onBlur={() => setFocusedField(null)}
                          required
                          autoComplete="off"
                          style={getInputStyle('regName')}
                        />
                      </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small text-uppercase" style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.6px' }}>
                        Email Address
                      </Form.Label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <Mail size={18} color={focusedField === 'regEmail' ? T.primary : '#94a3b8'} />
                        </div>
                        <Form.Control
                          type="email"
                          placeholder="you@example.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          onFocus={() => setFocusedField('regEmail')}
                          onBlur={() => setFocusedField(null)}
                          required
                          autoComplete="off"
                          style={getInputStyle('regEmail')}
                        />
                      </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small text-uppercase" style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.6px' }}>
                        Password
                      </Form.Label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <Lock size={18} color={focusedField === 'regPassword' ? T.primary : '#94a3b8'} />
                        </div>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password (min 6 chars)"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          onFocus={() => setFocusedField('regPassword')}
                          onBlur={() => setFocusedField(null)}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          style={{ ...getInputStyle('regPassword'), paddingRight: 44 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: 14,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                          }}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold small text-uppercase" style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.6px' }}>
                        Confirm Password
                      </Form.Label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <CheckCircle2 size={18} color={focusedField === 'regConfirmPassword' ? T.primary : '#94a3b8'} />
                        </div>
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          onFocus={() => setFocusedField('regConfirmPassword')}
                          onBlur={() => setFocusedField(null)}
                          required
                          autoComplete="new-password"
                          style={{ ...getInputStyle('regConfirmPassword'), paddingRight: 44 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: 14,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                          }}
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </Form.Group>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-100 py-3 fw-bold border-0 d-flex align-items-center justify-content-center gap-2 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`,
                        borderRadius: 12,
                        boxShadow: '0 10px 25px rgba(124,92,255,0.35)',
                        fontSize: '1rem',
                      }}
                    >
                      {loading ? 'Registering...' : 'Register Now'}
                    </Button>
                  </Form>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthLandingPage;
