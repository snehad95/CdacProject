import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

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

  const getNavClass = (path) => {
    return location.pathname === path
      ? "fw-bold fs-5 nav-link-hover"
      : "fw-semibold fs-6 text-dark nav-link-hover";
  };

  // Active link inline style
  const getNavStyle = (path) => ({
    color: location.pathname === path ? '#6a41e6' : undefined,
  });

  return (
    <>
      <Navbar bg="white" expand="lg" className="shadow-sm py-2 px-lg-4">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            <img
              src="http://recruitment-portal.in/reccdac/images/logo_cdac.png"
              alt="CDAC Logo"
              style={{ width: 'auto', maxWidth: '100%', height: '46px', objectFit: 'contain' }}
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto gap-4 align-items-center pe-4 pb-3 pb-lg-0 me-4">
              <Nav.Link as={Link} to="/" className={getNavClass("/")} style={getNavStyle("/")}>Home</Nav.Link>
              <Nav.Link as={Link} to="/test" className={getNavClass("/test")} style={getNavStyle("/test")}>Test</Nav.Link>
              <Nav.Link as={Link} to="/exams" className={getNavClass("/exams")} style={getNavStyle("/exams")}>Exams</Nav.Link>
              <Nav.Link as={Link} to="/courses" className={getNavClass("/courses")} style={getNavStyle("/courses")}>Courses</Nav.Link>
              <Nav.Link as={Link} to="/about" className={getNavClass("/about")} style={getNavStyle("/about")}>About Us</Nav.Link>
              <Nav.Link as={Link} to="/contact" className={getNavClass("/contact")} style={getNavStyle("/contact")}>Contact Us</Nav.Link>
              {user?.role === 'admin' && (
                <Nav.Link as={Link} to="/admin" className="text-danger fw-bold fs-6 nav-link-hover">Admin Panel</Nav.Link>
              )}
              {user?.role === 'teacher' && (
                <Nav.Link as={Link} to="/teacher" className="text-warning fw-bold fs-6 nav-link-hover" style={{ color: '#ed8936' }}>Teacher Panel</Nav.Link>
              )}
              {user && user.role === 'student' && (
                <Nav.Link as={Link} to="/dashboard" className="text-success fw-bold fs-6 nav-link-hover">My Dashboard</Nav.Link>
              )}
            </Nav>
            <div className="d-flex gap-2 align-items-center">
              {token ? (
                <>
                  <div className="d-flex align-items-center me-3" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '4px 8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '6px' }}>
                      <User size={16} color="#fff" />
                    </div>
                    <span style={{ color: 'black', fontWeight: 600, fontSize: '0.85rem' }}>{JSON.parse(localStorage.getItem('user') || '{}').name || 'User'}</span>
                  </div>
                  <Button variant="outline-danger" className="fw-semibold px-4" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <>
                  <Button
                    className="fw-semibold px-4"
                    style={{ backgroundColor: 'transparent', border: '2px solid #6a41e6', color: '#6a41e6' }}
                    onClick={() => setShowLogin(true)}
                  >Login</Button>
                  <Button
                    className="fw-semibold px-4 text-white"
                    style={{ backgroundColor: '#6a41e6', border: '2px solid #6a41e6' }}
                    onClick={() => setShowRegister(true)}
                  >Register</Button>
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
