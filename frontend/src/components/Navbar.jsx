import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

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
                  <div className="d-flex align-items-center me-3"
                    style={{ background: '#f5f1ff', border: `1px solid ${T.border}`, borderRadius: 999, padding: '4px 12px 4px 4px' }}>
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
    </>
  );
};

export default AppNavbar;
