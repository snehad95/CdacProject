import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, Shield, Smartphone, Cpu, CircuitBoard, GitPullRequest } from 'lucide-react';
import axios from 'axios';

const Courses = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/courses');
        // Group by category
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

        // Define sort order
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
    // Return appropriate icon based on abbreviation or title
    if (course.abbr === 'AC') return Monitor;
    if (course.abbr === 'ASSD') return Shield;
    if (course.abbr === 'MC') return Smartphone;
    if (course.abbr === 'VLSI') return CircuitBoard;
    if (course.abbr === 'ESD') return Cpu;
    return GitPullRequest;
  };

  return (
    <Container className="my-5 pb-5" style={{ maxWidth: '1200px' }}>
      
      {categories.map((category) => (
        <div key={category._id} className="mb-5">
          {/* Animated Category Header */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="py-2 px-3 mb-4" 
            style={{ 
              backgroundColor: category.bgColor, 
              color: '#1a1a1a', 
              fontWeight: '500', 
              fontSize: '20px',
              fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif"
            }}
          >
            {category.name}
          </motion.div>
          
          {/* Courses List - Left Aligned */}
          <Row className="g-4 justify-content-start px-2">
            {category.courses.map((course, idx) => {
              const Icon = getIcon(course);
              return (
                <Col xs={12} sm={6} md={4} lg={3} key={course._id} className="d-flex" style={{ maxWidth: '290px' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="h-100 w-100"
                  >
                    <Card 
                      className="h-100 border-1 w-100 shadow-sm" 
                      onClick={() => navigate(`/course/${course._id}`)}
                      style={{ 
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        borderColor: '#eee',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                        cursor: 'pointer'
                      }}
                    >
                      <Card.Body className="p-4 d-flex flex-column">
                        
                        {/* Premium Logo Box */}
                        <div className="mb-4 mt-1" style={{ width: '180px' }}>
                          <div 
                            style={{ 
                              backgroundColor: '#3b3e47', 
                              height: '110px', 
                              width: '100%',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '12px',
                              position: 'relative',
                              borderRight: `6px solid ${course.iconColor}`,
                              borderBottom: `6px solid ${course.iconColor}`,
                              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}
                          >
                            {/* Icon inside the box */}
                            <div 
                              style={{ 
                                width: '45px', 
                                height: '45px', 
                                backgroundColor: course.iconColor, 
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                marginRight: '12px',
                                flexShrink: 0
                              }}
                            >
                              <Icon size={24} strokeWidth={2.5} />
                            </div>
                            
                            <div className="text-white">
                              <div style={{ fontSize: '10px', color: '#bbb', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '-2px' }}>
                                PGCP in
                              </div>
                              <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1.1' }}>
                                {course.abbr}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="mt-1">
                          <h6 style={{ 
                            fontSize: '15px', 
                            fontWeight: '700', 
                            color: '#000', 
                            marginBottom: '6px',
                            fontFamily: "'Inter', 'Segoe UI', sans-serif"
                          }}>
                            {course.title}
                          </h6>
                          <p style={{ 
                            fontSize: '12.5px', 
                            color: '#666', 
                            lineHeight: '1.4',
                            margin: 0,
                            fontFamily: "'Inter', 'Segoe UI', sans-serif"
                          }}>
                            {course.fullName}
                          </p>
                        </div>
                        
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              );
            })}
          </Row>
        </div>
      ))}
      
    </Container>
  );
};

export default Courses;
