import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import AppNavbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Contact from './pages/Contact';
import Exams from './pages/Exams';
import StudentDashboard from './pages/StudentDashboard';
import ExamArena from './pages/ExamArena';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ExamInstructions from './pages/ExamInstructions';
import Test from './pages/Test';
import PracticeInstructions from './pages/PracticeInstructions';
import PracticeArena from './pages/PracticeArena';

import CourseDetails from './pages/CourseDetails';
import { Toaster } from 'react-hot-toast';

// Scroll to top on every page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Pages that should be shown without navbar / footer
const FULLSCREEN_ROUTES = ['/exam-instructions/', '/exam/', '/practice-instructions/', '/practice-arena/'];

function LayoutShell({ children }) {
  const { pathname } = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some(r => pathname.startsWith(r));
  const isHome = pathname === '/';
  const isTest = pathname === '/test';
  const [navbarVisible, setNavbarVisible] = React.useState(true);
  const footerRef = React.useRef(null);

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', storedTheme);
    const observer = new IntersectionObserver(([entry]) => {
      // Hide navbar when footer is visible, show when footer is out of view
      setNavbarVisible(!entry.isIntersecting);
    }, { rootMargin: '0px', threshold: 0.1 });
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  if (isFullscreen) return <>{children}</>;

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header: only on home page */}
      {isHome && <Header />}

      {/* Navbar: always present */}
      <div
        className="sticky-top bg-white shadow-sm"
        style={{
          zIndex: 1000,
          transform: navbarVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.35s ease-in-out',
        }}
      >
        <AppNavbar />
      </div>

      <main className="flex-grow-1">{children}</main>
      {!isTest && <div ref={footerRef}><Footer /></div>}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff', borderRadius: '10px' } }} />
      <ScrollToTop />
      <LayoutShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:courseId" element={<CourseDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/exam-instructions/:examId" element={<ExamInstructions />} />
          <Route path="/exam/:examId" element={<ExamArena />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/test" element={<Test />} />
          <Route path="/practice-instructions/:category" element={<PracticeInstructions />} />
          <Route path="/practice-arena/:category" element={<PracticeArena />} />
        </Routes>
      </LayoutShell>
    </Router>
  );
}

export default App;
