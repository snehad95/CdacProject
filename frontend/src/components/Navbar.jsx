import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
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

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', password: '' });

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
      <Navbar expand="lg" className="py-2 px-lg-4"
        style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,255,0.06)' }}>
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
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
                <Nav.Link as={Link} to="/admin" className="fw-bold" style={{ color: '#e11d48' }}>Admin Panel</Nav.Link>
              )}
              {user?.role === 'teacher' && (
                <Nav.Link as={Link} to="/teacher" className="fw-bold" style={{ color: '#d97706' }}>Teacher Panel</Nav.Link>
              )}
              {user?.role === 'student' && (
                <Nav.Link as={Link} to="/dashboard" className="fw-bold" style={{ color: '#16a34a' }}>My Dashboard</Nav.Link>
              )}
            </Nav>
            <div className="d-flex gap-2 align-items-center">
              {token ? (
                <>
                  <div 
                    onClick={() => setShowProfile(true)}
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

                  <Button onClick={handleLogout} className="fw-semibold px-3"
                    style={{ background: 'transparent', border: `2px solid ${T.primaryDeep}`, color: T.primaryDeep, borderRadius: 10 }}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button className="fw-semibold px-4"
                    style={{ background: 'transparent', border: `2px solid ${T.primaryDeep}`, color: T.primaryDeep, borderRadius: 10 }}
                    onClick={() => setShowLogin(true)}>Login</Button>
                  <Button className="fw-semibold px-4 text-white border-0"
                    style={{
                      background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`,
                      borderRadius: 10, boxShadow: '0 6px 16px rgba(124,92,255,0.35)',
                    }}
                    onClick={() => setShowRegister(true)}>Register</Button>
                </>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} handleClose={() => setShowRegister(false)} />

      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <div style={{ background: T.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.border}` }}>
          <div style={{ height: 6, background: `linear-gradient(90deg, ${T.primary}, ${T.primaryDeep})` }} />
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold w-100 text-center" style={{ color: T.primaryDeep }}>
              Edit Profile
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 p-md-5">
            <Form onSubmit={handleProfileUpdate}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold" style={{ color: T.text }}>Full Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={profileData.name} 
                  onChange={e => setProfileData({ ...profileData, name: e.target.value })} 
                  required
                  style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }} 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold" style={{ color: T.text }}>Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  value={profileData.email} 
                  onChange={e => setProfileData({ ...profileData, email: e.target.value })} 
                  required
                  style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }} 
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold" style={{ color: T.text }}>New Password (leave blank to keep current)</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="••••••••" 
                  value={profileData.password} 
                  onChange={e => setProfileData({ ...profileData, password: e.target.value })} 
                  style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }} 
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button 
                  variant="light" 
                  className="w-50 py-2 fw-bold" 
                  onClick={() => setShowProfile(false)}
                  style={{ borderRadius: 10, border: `1px solid ${T.border}` }}
                >
                  Cancel
                </Button>
                <Button 
                  className="w-50 py-2 fw-bold text-white border-0" 
                  type="submit"
                  style={{
                    background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDeep})`,
                    borderRadius: 10, boxShadow: '0 8px 20px rgba(124,92,255,0.35)',
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
