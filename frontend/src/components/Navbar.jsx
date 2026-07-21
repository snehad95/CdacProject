import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';


const T = {
  surface: 'var(--cdac-surface)', primary: '#7c5cff', primaryDeep: '#6a41e6',
  primarySoft: '#cbb6e9', text: 'var(--cdac-text)', muted: '#6b6483', border: 'var(--cdac-border)',
};

const AppNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [expanded, setExpanded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (showProfile && user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
    }
  }, [showProfile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const res = await axios.put('http://localhost:5000/api/users/profile', profileData, config);
      
      const updatedUser = { ...user, name: res.data.name, email: res.data.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully!");
      setShowProfile(false);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };


  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const isActive = (path) => {
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.substring(1);
    }
    return location.pathname === path && !location.hash;
  };
  
  const navStyle = (path) => ({
    color: isActive(path) ? T.primaryDeep : T.text,
    fontWeight: isActive(path) ? 700 : 600,
    fontSize: '0.95rem',
    position: 'relative',
    padding: '6px 4px',
  });

  const handleNavClick = (e, to) => {
    if (to.startsWith('/#')) {
      e.preventDefault();
      const id = to.substring(2);
      if (location.pathname === '/') {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', to);
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', to);
          }
        }, 300);
      }
    }
  };

  return (
    <>
      <Navbar expand="lg" expanded={expanded} onToggle={(val) => setExpanded(val)} className="py-2 px-lg-4"
        style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,255,0.06)' }}>
        <Container fluid>
          <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>
            <img src="http://recruitment-portal.in/reccdac/images/logo_cdac.png" alt="CDAC Logo"
              style={{ width: 'auto', maxWidth: '100%', height: 46, objectFit: 'contain' }} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto gap-4 align-items-center pe-4 pb-3 pb-lg-0 me-4">
              {[
                { to: '/', label: 'Home' },
                { to: '/test', label: 'Test' },
                { to: '/exams', label: 'Exams' },
                { to: '/courses', label: 'Courses' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact Us' },
              ].map((item) => {
                const isAnchor = item.to.startsWith('/#');
                return (
                  <Nav.Link 
                    key={item.to} 
                    as={isAnchor ? 'a' : Link} 
                    to={isAnchor ? undefined : item.to}
                    href={isAnchor ? item.to : undefined}
                    onClick={(e) => {
                      setExpanded(false);
                      if (isAnchor) {
                        handleNavClick(e, item.to);
                      }
                    }}
                    style={navStyle(item.to)}
                  >
                    {item.label}
                    {isActive(item.to) && (
                      <span style={{
                        position: 'absolute', left: 0, right: 0, bottom: -4, height: 2,
                        borderRadius: 2, background: `linear-gradient(90deg, ${T.primary}, ${T.primaryDeep})`,
                      }} />
                    )}
                  </Nav.Link>
                );
              })}
              {user?.role === 'admin' && (
                <Nav.Link as={Link} to="/admin" onClick={() => setExpanded(false)} className="fw-bold" style={{ color: '#e11d48' }}>Admin Panel</Nav.Link>
              )}
              {user?.role === 'teacher' && (
                <Nav.Link as={Link} to="/teacher" onClick={() => setExpanded(false)} className="fw-bold" style={{ color: '#d97706' }}>Teacher Panel</Nav.Link>
              )}
              {user?.role === 'student' && (
                <Nav.Link as={Link} to="/dashboard" onClick={() => setExpanded(false)} className="fw-bold" style={{ color: '#16a34a' }}>My Dashboard</Nav.Link>
              )}
            </Nav>
            <div className="d-flex gap-2 align-items-center">
              {token && (
                <>
                  <div 
                    onClick={() => { setExpanded(false); setShowProfile(true); }}
                    className="d-flex align-items-center me-3"
                    style={{ background: '#f5f1ff', border: `1px solid ${T.border}`, borderRadius: 999, padding: '4px 12px 4px 4px', cursor: 'pointer' }}
                    title="Edit Profile"
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8,
                    }}>
                      <User size={16} color="#fff" />
                    </div>
                    <span style={{ color: T.text, fontWeight: 600, fontSize: '0.85rem' }}>
                      {JSON.parse(localStorage.getItem('user') || '{}').name || 'User'}
                    </span>
                  </div>

                  <Button onClick={() => { setExpanded(false); handleLogout(); }} className="fw-bold px-3 py-2 d-flex align-items-center gap-2 border-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff', borderRadius: 10, fontSize: '0.88rem' }}>
                    <LogOut size={16} /> Logout
                  </Button>
                </>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <div style={{ background: '#ffffff', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.1)' }}>
          <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4 px-md-5">
            <Modal.Title className="fw-bold text-dark" style={{ fontSize: '1.35rem', letterSpacing: '-0.3px' }}>
              Account Settings
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 py-4 px-md-5">
            {/* Light Executive Avatar Header */}
            <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
                fontSize: '1.35rem',
                fontWeight: 700,
                border: '1.5px solid #bfdbfe',
                flexShrink: 0
              }}>
                {(profileData.name || user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{profileData.name || user?.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{profileData.email || user?.email}</div>
              </div>
            </div>

            <Form onSubmit={handleProfileUpdate}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-uppercase" style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.6px' }}>Full Name</Form.Label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', color: '#94a3b8' }}>
                    <User size={18} />
                  </span>
                  <Form.Control 
                    type="text" 
                    value={profileData.name} 
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })} 
                    required
                    style={{ border: '1.5px solid #cbd5e1', borderRadius: 12, padding: '12px 16px 12px 42px', fontSize: '0.95rem', background: '#f8fafc', color: '#0f172a', fontWeight: 500 }} 
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-uppercase" style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.6px' }}>Email Address</Form.Label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', color: '#94a3b8' }}>
                    <Mail size={18} />
                  </span>
                  <Form.Control 
                    type="email" 
                    value={profileData.email} 
                    onChange={e => setProfileData({ ...profileData, email: e.target.value })} 
                    required
                    style={{ border: '1.5px solid #cbd5e1', borderRadius: 12, padding: '12px 16px 12px 42px', fontSize: '0.95rem', background: '#f8fafc', color: '#0f172a', fontWeight: 500 }} 
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold small text-uppercase" style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '0.6px' }}>New Password <span className="text-lowercase" style={{ fontWeight: 400, color: '#64748b' }}>(leave blank to keep current)</span></Form.Label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', color: '#94a3b8' }}>
                    <Lock size={18} />
                  </span>
                  <Form.Control 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a new password" 
                    value={profileData.password} 
                    onChange={e => setProfileData({ ...profileData, password: e.target.value })} 
                    style={{ border: '1.5px solid #cbd5e1', borderRadius: 12, padding: '12px 42px 12px 42px', fontSize: '0.95rem', background: '#f8fafc', color: '#0f172a', fontWeight: 500 }} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Form.Group>

              <div className="d-flex gap-3 pt-1">
                <Button 
                  variant="light" 
                  className="w-50 py-2.5 fw-bold" 
                  onClick={() => setShowProfile(false)}
                  style={{ borderRadius: 12, border: '1px solid #cbd5e1', padding: '11px 0', fontSize: '0.95rem', background: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </Button>
                <Button 
                  className="w-50 py-2.5 fw-bold text-white border-0" 
                  type="submit"
                  style={{
                    background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`,
                    borderRadius: 12, 
                    boxShadow: '0 10px 25px rgba(124,92,255,0.35)',
                    padding: '11px 0',
                    fontSize: '0.95rem'
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
};

export default AppNavbar;
