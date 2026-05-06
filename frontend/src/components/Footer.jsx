import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white text-dark pt-5 pb-3 border-top mt-5" style={{ fontSize: '0.95rem' }}>
      <Container>
        <Row className="mb-5">
          <Col md={3} className="mb-4 mb-md-0">
            <h6 className="mb-4 font-weight-normal text-secondary">CENTERS</h6>
            <ul className="list-unstyled" style={{ lineHeight: '1.8' }}>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Bengaluru</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Chennai</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Delhi</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Hyderabad</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Kolkata</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Mohali</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Mumbai</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Noida</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">North East</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Patna</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Pune</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Thiruvananthapuram</a></li>
            </ul>
          </Col>

          <Col md={3} className="mb-5 mb-md-0">
            <h6 className="mb-4 font-weight-normal text-secondary">LINKS</h6>
            <ul className="list-unstyled" style={{ lineHeight: '1.8' }}>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">About Us</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Products & Services</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">R&D</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Careers</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Tenders</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Press Kit</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Video Gallery</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Events</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Awards</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Downloads</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Achievements</a></li>
              <li><span className="me-2">&bull;</span> <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-primary">Alliance</a></li>
            </ul>
          </Col>

          <Col md={6}>
            <h6 className="mb-4 font-weight-normal text-secondary">CONTACT US</h6>
            <div className="mb-3 border rounded shadow-sm" style={{ height: '160px', overflow: 'hidden' }}>
              <iframe
                title="CDAC Delhi Location Map"
                src="https://maps.google.com/maps?q=CDAC%20Delhi&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div style={{ lineHeight: '1.6' }}>
              <p className="mb-0 fw-bold">Centre for Development of Advanced Computing</p>
              <p className="mb-0 fw-bold">Delhi Centre,</p>
              <p className="mb-0">Plot No. 20, FC-33, Institutional Area, Jasola, New Delhi - 110025 (India)</p>
              <p className="mb-0">Phone: +91-11-26900220</p>
              <p className="mb-0">Fax: +91-11-26902011</p>
            </div>
          </Col>
        </Row>
      </Container>

      <div className="  w-100 border-top pt-4 pb-4 text-center mt-4 text-secondary" style={{ fontSize: '0.85rem' }}>
        <p className="mb-2">
          <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none hover-primary">Help</a> | <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none hover-primary">Website Policies</a> | <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none hover-primary">Copyright Policy</a> | <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none hover-primary">Terms & Conditions</a> | <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none hover-primary">Reach Us</a> | <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none hover-primary">Sitemap</a>
        </p>
        <p className="mb-1">Website owned & maintained by: <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none hover-primary">Centre for Development of Advanced Computing (C-DAC)</a></p>
        <p className="mb-0">
          <a href="https://cdac.in/index.aspx?id=" target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none hover-primary">
            &copy; {new Date().getFullYear()} C-DAC. All rights reserved.
          </a> 
          &nbsp;Last Updated: {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
