import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Card } from 'react-bootstrap';
import { 
  BarChart3, Users, BookOpen, HelpCircle, 
  Settings, Info, LayoutDashboard, Database, ShieldCheck,
  FileText, Award, Mail
} from 'lucide-react';
import ManageExams from '../components/admin/ManageExams';
import ManageQuestions from '../components/admin/ManageQuestions';
import ViewPerformance from '../components/admin/ViewPerformance';
import ManageUsers from '../components/admin/ManageUsers';
import ManageInstructions from '../components/admin/ManageInstructions';
import ManagePracticeTests from '../components/admin/ManagePracticeTests';
import ManageCourses from '../components/admin/ManageCourses';
import ManageMessages from '../components/admin/ManageMessages';
import StudentReport from '../components/admin/StudentReport';
import ManageCertificates from '../components/admin/ManageCertificates';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({ exams: 0, students: 0, questions: 0 });

  useEffect(() => {
    if (user.role === 'admin') {
      const fetchStats = async () => {
        try {
          const [examsRes, usersRes] = await Promise.all([
            axios.get('http://localhost:5000/api/exams'),
            axios.get('http://localhost:5000/api/users')
          ]);
          const totalStudents = usersRes.data.filter(u => u.role === 'student').length;
          setStats({ exams: examsRes.data.length, students: totalStudents, questions: 'Manage Tab' });
        } catch (err) {
          console.error("Failed fetching stats", err);
        }
      };
      fetchStats();
    }
  }, [user.role]);

  if (user.role !== 'admin') {
    return (
      <Container className="my-5 text-center vh-100 d-flex flex-column justify-content-center align-items-center">
        <ShieldCheck size={80} color="#fc8181" className="mb-4" />
        <h2 className="fw-bold mb-3">Unauthorized Access</h2>
        <p className="text-muted mb-4">You do not have the necessary permissions to access the Admin Panel.</p>
        <button className="btn btn-primary px-5 py-2 fw-bold" style={{ backgroundColor: '#6a41e6', border: 'none' }} onClick={() => navigate('/')}>Return Home</button>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9f9ff', minHeight: '100vh', paddingBottom: '50px' }}>
      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(135deg, #6a41e6, #7c3aed)', height: '220px', padding: '40px 0' }} className="shadow-sm">
        <Container>
          <div className="d-flex justify-content-between align-items-end">
            <div className="text-white">
              <h1 className="fw-800 mb-2">Admin Command Center</h1>
              <p className="opacity-75 mb-0">Management HUB for CDAC Exam Portal</p>
            </div>
          </div>
        </Container>
      </div>

      <Container style={{ marginTop: '-60px' }}>
        {/* Statistics Widgets */}
        <Row className="mb-4 g-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <Card.Body className="p-4 d-flex align-items-center gap-4">
                    <div className="p-3 rounded-4" style={{ backgroundColor: '#6a41e615', color: '#6a41e6' }}>
                        <BookOpen size={30} />
                    </div>
                    <div>
                        <h6 className="text-muted mb-1 fw-bold text-uppercase small ls-1">Active Exams</h6>
                        <h2 className="mb-0 fw-800">{stats.exams}</h2>
                    </div>
                </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <Card.Body className="p-4 d-flex align-items-center gap-4">
                    <div className="p-3 rounded-4" style={{ backgroundColor: '#48bb7815', color: '#48bb78' }}>
                        <Users size={30} />
                    </div>
                    <div>
                        <h6 className="text-muted mb-1 fw-bold text-uppercase small ls-1">Total Students</h6>
                        <h2 className="mb-0 fw-800">{stats.students}</h2>
                    </div>
                </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <Card.Body className="p-4 d-flex align-items-center gap-4">
                    <div className="p-3 rounded-4" style={{ backgroundColor: '#ed893615', color: '#ed8936' }}>
                        <BarChart3 size={30} />
                    </div>
                    <div>
                        <h6 className="text-muted mb-1 fw-bold text-uppercase small ls-1">Performance</h6>
                        <h2 className="mb-0 fw-800">88%</h2>
                    </div>
                </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Navigation Sidebar & Content */}
        <Tab.Container defaultActiveKey="exams">
          <Row className="g-4">
            <Col lg={3}>
              <Card className="border-0 shadow-sm rounded-4 p-2 mb-4" style={{ position: 'sticky', top: '24px', zIndex: 10 }}>
                <Nav variant="pills" className="flex-row flex-lg-column gap-2 admin-sidebar overflow-auto flex-nowrap flex-lg-wrap">
                  <Nav.Item>
                    <Nav.Link eventKey="courses" className="d-flex align-items-center gap-2 gap-lg-3 p-2 p-lg-3 rounded-3 fw-bold text-nowrap">
                        <LayoutDashboard size={20} /> <span className="d-lg-inline">Courses</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="exams" className="d-flex align-items-center gap-2 gap-lg-3 p-2 p-lg-3 rounded-3 fw-bold text-nowrap">
                        <Database size={20} /> <span className="d-lg-inline">Exams</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="practice-tests" className="d-flex align-items-center gap-2 gap-lg-3 p-2 p-lg-3 rounded-3 fw-bold text-nowrap">
                        <Settings size={20} /> <span className="d-lg-inline">Practice</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="questions" className="d-flex align-items-center gap-2 gap-lg-3 p-2 p-lg-3 rounded-3 fw-bold text-nowrap">
                        <BookOpen size={20} /> <span className="d-lg-inline">Questions</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="users" className="d-flex align-items-center gap-2 gap-lg-3 p-2 p-lg-3 rounded-3 fw-bold text-nowrap">
                        <Users size={20} /> <span className="d-lg-inline">Users</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="instructions" className="d-flex align-items-center gap-2 gap-lg-3 p-2 p-lg-3 rounded-3 fw-bold text-nowrap">
                        <Info size={20} /> <span className="d-lg-inline">Rules</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="performance" className="d-flex align-items-center gap-2 gap-lg-3 p-2 p-lg-3 rounded-3 fw-bold text-nowrap">
                        <BarChart3 size={20} /> <span className="d-lg-inline">Results</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="reports" className="d-flex align-items-center gap-2 gap-lg-3 p-2 p-lg-3 rounded-3 fw-bold text-nowrap">
                        <FileText size={20} /> <span className="d-lg-inline">Reports</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="certificates" className="d-flex align-items-center gap-2 gap-lg-3 p-2 p-lg-3 rounded-3 fw-bold text-nowrap">
                        <Award size={20} /> <span className="d-lg-inline">Certificates</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="messages" className="d-flex align-items-center gap-2 gap-lg-3 p-2 p-lg-3 rounded-3 fw-bold text-nowrap">
                        <Mail size={20} /> <span className="d-lg-inline">Messages</span>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card>
            </Col>

            <Col lg={9}>
              <Tab.Content className="admin-content-pane">
                <Tab.Pane eventKey="courses"><ManageCourses /></Tab.Pane>
                <Tab.Pane eventKey="exams"><ManageExams /></Tab.Pane>
                <Tab.Pane eventKey="practice-tests"><ManagePracticeTests /></Tab.Pane>
                <Tab.Pane eventKey="questions"><ManageQuestions /></Tab.Pane>
                <Tab.Pane eventKey="users"><ManageUsers /></Tab.Pane>
                <Tab.Pane eventKey="instructions"><ManageInstructions /></Tab.Pane>
                <Tab.Pane eventKey="performance"><ViewPerformance /></Tab.Pane>
                <Tab.Pane eventKey="reports"><StudentReport /></Tab.Pane>
                <Tab.Pane eventKey="certificates"><ManageCertificates /></Tab.Pane>
                <Tab.Pane eventKey="messages"><ManageMessages /></Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
      
      <style>{`
        .admin-sidebar .nav-link {
          color: #4a5568;
          transition: all 0.2s ease;
        }
        .admin-sidebar .nav-link:hover {
          background-color: #6a41e60a;
          color: #6a41e6;
        }
        .admin-sidebar .nav-link.active {
          background: linear-gradient(135deg, #6a41e6, #7c3aed) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(106, 65, 230, 0.2);
        }
        .fw-800 { font-weight: 800; }
        .ls-1 { letter-spacing: 1px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;

