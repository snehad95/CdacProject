import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Monitor, Shield, Smartphone, Cpu, CircuitBoard,
  GitPullRequest, ArrowUpRight
} from 'lucide-react';
import axios from 'axios';

const Courses = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/courses');
        const grouped = res.data.reduce((acc, course) => {
          const cat = acc.find(c => c.name === course.category);
          if (cat) {
            cat.courses.push(course);
          } else {
            acc.push({
              _id: course.category,
              name: course.category,
              bgColor: course.categoryBgColor || '#f8a39a',
              courses: [course]
            });
          }
          return acc;
        }, []);

        const sortOrder = ["Software Development", "Electronics & Software"];
        grouped.sort((a, b) => {
          const indexA = sortOrder.indexOf(a.name);
          const indexB = sortOrder.indexOf(b.name);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });

        setCategories(grouped);
      } catch (err) {
        console.error("Error fetching courses", err);
      }
    };
    fetchCourses();
  }, []);

  const getIcon = (course) => {
    if (course.abbr === 'AC') return Monitor;
    if (course.abbr === 'ASSD') return Shield;
    if (course.abbr === 'MC') return Smartphone;
    if (course.abbr === 'VLSI') return CircuitBoard;
    if (course.abbr === 'ESD') return Cpu;
    return GitPullRequest;
  };

  return (
    <div style={{ backgroundColor: 'var(--cdac-bg)', minHeight: '100vh', paddingTop: '40px', paddingBottom: '80px' }}>
      <Container style={{ maxWidth: '1240px' }}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '2px',
            color: 'var(--cdac-text-muted)',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Explore Programmes
          </div>
          <h2 className="fw-bolder mb-2" style={{ color: 'var(--cdac-text)', letterSpacing: -0.5 }}>
            Post Graduate Certificate Programmes
          </h2>
          <p className="mb-0" style={{ color: '#6b6483', maxWidth: '640px' }}>
            Industry-aligned certifications crafted to accelerate your career in tech.
          </p>
        </motion.div>

        {categories.map((category) => (
          <div key={category._id} className="mb-5">
            {/* Category Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="d-flex align-items-center mb-4"
            >
              <div style={{
                width: '4px',
                height: '28px',
                backgroundColor: category.bgColor || '#7c5cff',
                borderRadius: '4px',
                marginRight: '14px'
              }} />
              <h2 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--cdac-text)',
                letterSpacing: '-0.01em',
                margin: 0,
                fontFamily: "'Inter', sans-serif"
              }}>
                {category.name}
              </h2>
              <div style={{
                marginLeft: '14px',
                padding: '4px 10px',
                backgroundColor: 'var(--cdac-surface)',
                border: '1px solid #e2e8f0',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--cdac-text-muted)',
                fontFamily: "'Inter', sans-serif"
              }}>
                {category.courses.length} {category.courses.length === 1 ? 'course' : 'courses'}
              </div>
            </motion.div>

            {/* Courses Grid */}
            <Row className="g-4">
              {category.courses.map((course, idx) => {
                const Icon = getIcon(course);
                const isHovered = hoveredCard === course._id;
                return (
                  <Col xs={12} sm={6} md={4} lg={3} key={course._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.06 }}
                      onHoverStart={() => setHoveredCard(course._id)}
                      onHoverEnd={() => setHoveredCard(null)}
                      onClick={() => navigate(`/course/${course._id}`)}
                      style={{
                        backgroundColor: 'var(--cdac-surface)',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '20px',
                        cursor: 'pointer',
                        height: '100%',
                        transition: 'all 0.25s ease',
                        boxShadow: isHovered
                          ? '0 20px 40px -12px rgba(15, 23, 42, 0.15)'
                          : '0 1px 3px rgba(15, 23, 42, 0.04)',
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        borderColor: isHovered ? course.iconColor : 'var(--cdac-border)'
                      }}
                    >
                      {/* Branded Visual Tile */}
                      <div style={{
                        position: 'relative',
                        height: '130px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        marginBottom: '18px'
                      }}>
                        {/* Decorative accent */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '120px',
                          height: '120px',
                          background: `radial-gradient(circle, ${course.iconColor}40 0%, transparent 70%)`,
                          borderRadius: '50%',
                          transform: 'translate(30%, -30%)'
                        }} />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '100%',
                          height: '4px',
                          background: course.iconColor
                        }} />

                        <div style={{
                          width: '42px',
                          height: '42px',
                          backgroundColor: course.iconColor,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          boxShadow: `0 8px 20px ${course.iconColor}50`,
                          position: 'relative',
                          zIndex: 1
                        }}>
                          <Icon size={22} strokeWidth={2.4} />
                        </div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{
                            fontSize: '9px',
                            color: 'rgba(255,255,255,0.55)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '1.2px',
                            marginBottom: '2px',
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            PGCP in
                          </div>
                          <div style={{
                            fontSize: '26px',
                            fontWeight: 800,
                            lineHeight: 1,
                            color: '#fff',
                            letterSpacing: '-0.02em',
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            {course.abbr}
                          </div>
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="d-flex flex-column" style={{ flexGrow: 1 }}>
                        <h3 style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: 'var(--cdac-text)',
                          marginBottom: '6px',
                          letterSpacing: '-0.01em',
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: 1.35
                        }}>
                          {course.title}
                        </h3>
                        <p style={{
                          fontSize: '13px',
                          color: 'var(--cdac-text-muted)',
                          lineHeight: 1.5,
                          margin: 0,
                          fontFamily: "'Inter', sans-serif",
                          flexGrow: 1
                        }}>
                          {course.fullName}
                        </p>

                        {/* Footer link */}
                        <div style={{
                          marginTop: '14px',
                          paddingTop: '14px',
                          borderTop: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isHovered ? course.iconColor : 'var(--cdac-text-muted)',
                            transition: 'color 0.2s',
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            View programme
                          </span>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: isHovered ? course.iconColor : '#f1f5f9',
                            color: isHovered ? '#fff' : 'var(--cdac-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.25s ease'
                          }}>
                            <ArrowUpRight size={14} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>
          </div>
        ))}
      </Container>
    </div>
  );
};

export default Courses;
