import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const footerBg = 'var(--cdac-bg)';
const footerSurface = 'var(--cdac-surface)';
const footerBorder = 'var(--cdac-border)';
const footerText = 'var(--cdac-text)';
const footerMuted = 'var(--cdac-text-muted)';
const footerHeading = 'var(--cdac-primary-deep)';
const footerLinkHover = 'var(--cdac-primary)';


const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: footerBg,
        color: footerText,
        fontSize: '0.93rem',
        borderTop: `1px solid ${footerBorder}`,
      }}
    >

      <Container className="pt-5 pb-3">
        <Row className="mb-5">
          <Col md={3} className="mb-4 mb-md-0">
            <h6 className="mb-4 fw-bold text-uppercase" style={{ color: footerHeading, letterSpacing: '1.5px', fontSize: '0.78rem' }}>
              Centers
            </h6>
            <ul className="list-unstyled" style={{ lineHeight: '2' }}>
              {['Bengaluru', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Mohali', 'Mumbai', 'Noida', 'North East', 'Patna', 'Pune', 'Thiruvananthapuram'].map(city => (
                <li key={city}>
                  <a
                    href="https://cdac.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: footerText, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = footerLinkHover}
                    onMouseLeave={e => e.target.style.color = footerText}
                  >
                    <span style={{ color: footerHeading, marginRight: '6px' }}>›</span>{city}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          <Col md={3} className="mb-5 mb-md-0">
            <h6 className="mb-4 fw-bold text-uppercase" style={{ color: footerHeading, letterSpacing: '1.5px', fontSize: '0.78rem' }}>
              Links
            </h6>
            <ul className="list-unstyled" style={{ lineHeight: '2' }}>
              {['About Us', 'Products & Services', 'R&D', 'Careers', 'Tenders', 'Press Kit', 'Video Gallery', 'Events', 'Awards', 'Downloads', 'Achievements', 'Alliance'].map(item => (
                <li key={item}>
                  <a
                    href="https://cdac.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: footerText, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = footerLinkHover}
                    onMouseLeave={e => e.target.style.color = footerText}
                  >
                    <span style={{ color: footerHeading, marginRight: '6px' }}>›</span>{item}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          <Col md={6}>
            <h6 className="mb-4 fw-bold text-uppercase" style={{ color: footerHeading, letterSpacing: '1.5px', fontSize: '0.78rem' }}>
              Contact Us
            </h6>
            <div
              className="mb-3 rounded overflow-hidden"
              style={{ height: '160px', border: `1px solid ${footerBorder}`, opacity: 0.85 }}
            >
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
            <div
              style={{
                lineHeight: '1.7',
                padding: '14px 16px',
                backgroundColor: footerSurface,
                borderRadius: '10px',
                border: `1px solid ${footerBorder}`,
              }}
            >
              <p className="mb-0 fw-bold" style={{ color: footerText }}>Centre for Development of Advanced Computing</p>
              <p className="mb-0 fw-semibold" style={{ color: footerText }}>Delhi Centre,</p>
              <p className="mb-0" style={{ color: footerText }}>Plot No. 20, FC-33, Institutional Area, Jasola, New Delhi - 110025 (India)</p>
              <p className="mb-0" style={{ color: footerText }}>Phone: +91-11-26900220</p>
              <p className="mb-0" style={{ color: footerText }}>Fax: +91-11-26902011</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Bottom Bar */}
      <div style={{ borderTop: `1px solid ${footerBorder}`, backgroundColor: 'var(--cdac-surface)' }}>
        <Container className="py-3 text-center" style={{ fontSize: '0.82rem', color: footerMuted }}>
          <p className="mb-2">
            {['Help', 'Website Policies', 'Copyright Policy', 'Terms & Conditions', 'Reach Us', 'Sitemap'].map((item, i, arr) => (
              <span key={item}>
                <a
                  href="https://cdac.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: footerMuted, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = footerLinkHover}
                  onMouseLeave={e => e.target.style.color = footerMuted}
                >
                  {item}
                </a>
                {i < arr.length - 1 && <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>}
              </span>
            ))}
          </p>
          <p className="mb-1">
            Website owned &amp; maintained by:{' '}
            <a
              href="https://cdac.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: footerMuted, textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = footerLinkHover}
              onMouseLeave={e => e.target.style.color = footerMuted}
            >
              Centre for Development of Advanced Computing (C-DAC)
            </a>
          </p>
          <p className="mb-0" style={{ color: footerMuted }}>
            &copy; {new Date().getFullYear()} C-DAC. All rights reserved.&nbsp;&nbsp;Last Updated:{' '}
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;

