import React, { useState, useEffect } from 'react';
import { Tab } from 'react-bootstrap';
import {
  BarChart3, Users, BookOpen, HelpCircle,
  Settings, Info, LayoutDashboard, Database, ShieldCheck,
  FileText, Award, Mail, LogOut, ChevronRight,
  TrendingUp, CheckSquare, Bell, Search, MessageSquare
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
import ManageTestimonials from '../components/admin/ManageTestimonials';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/* ── Light Design Tokens ───────────────────────────────────── */
const C = {
  sidebarBg:    '#ffffff',
  sidebarBorder:'#ede9fe',        // violet-100
  activeBg:     '#ede9fe',        // violet-100
  activeText:   '#7c3aed',        // violet-600
  activeDot:    '#7c3aed',
  navText:      '#6b7280',        // gray-500
  navHover:     '#f5f3ff',        // violet-50
  contentBg:    '#f5f3ff',        // violet-50 tinted
  cardBg:       '#ffffff',
  border:       '#ede9fe',
  headerBg:     '#ffffff',
  primary:      '#7c3aed',        // violet-600
  primaryLight: '#ede9fe',        // violet-100
  text:         '#1e1b4b',        // indigo-950
  muted:        '#6b7280',
  accent1:      '#6366f1',        // indigo-500
  accent2:      '#0ea5e9',        // sky-500
  accent3:      '#10b981',        // emerald-500
  accent4:      '#f59e0b',        // amber-500
};

const navItems = [
  { key: 'courses',        label: 'Courses',        icon: LayoutDashboard, group: 'Content' },
  { key: 'exams',          label: 'Exams',           icon: Database,        group: 'Content' },
  { key: 'practice-tests', label: 'Practice Tests',  icon: CheckSquare,     group: 'Content' },
  { key: 'questions',      label: 'Questions',       icon: HelpCircle,      group: 'Content' },
  { key: 'instructions',   label: 'Exam Rules',      icon: Info,            group: 'Content' },
  { key: 'users',          label: 'Users',           icon: Users,           group: 'People' },
  { key: 'performance',    label: 'Results',         icon: BarChart3,       group: 'Analytics' },
  { key: 'reports',        label: 'Reports',         icon: FileText,        group: 'Analytics' },
  { key: 'certificates',   label: 'Certificates',    icon: Award,           group: 'Analytics' },
  { key: 'messages',       label: 'Messages',        icon: Mail,            group: 'System' },
  { key: 'testimonials',   label: 'Testimonials',    icon: MessageSquare,   group: 'System' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeKey, setActiveKey] = useState('exams');
  const [stats, setStats] = useState({ exams: 0, students: 0, messages: 0 });

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [examsRes, usersRes, contactRes] = await Promise.all([
        axios.get('http://localhost:5000/api/exams'),
        axios.get('http://localhost:5000/api/users', config),
        axios.get('http://localhost:5000/api/contact', config),
      ]);
      setStats({
        exams: examsRes.data.length,
        students: usersRes.data.filter(u => u.role === 'student').length,
        messages: contactRes.data.length,
      });
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user.role === 'admin') {
      fetchDashboardStats();
    }
  }, [user.role]);

  if (user.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: C.contentBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={40} color="#ef4444" />
        </div>
        <h2 style={{ color: C.text, fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Access Denied</h2>
        <p style={{ color: C.muted, fontFamily: "'Inter', sans-serif" }}>You don't have admin permissions.</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: C.primary, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Go Home</button>
      </div>
    );
  }

  const groups = [...new Set(navItems.map(n => n.group))];

  const cards = [
    { label: 'Active Exams',    value: stats.exams,    icon: Database,    bg: '#eef2ff', color: C.accent1, trend: 'Total scheduled', key: 'exams' },
    { label: 'Total Students',  value: stats.students, icon: Users,       bg: '#ecfdf5', color: C.accent3, trend: 'Registered users', key: 'users' },
    { label: 'Avg. Score',      value: '88%',          icon: TrendingUp,  bg: '#fffbeb', color: C.accent4, trend: 'Across all exams', key: 'performance' },
    { label: 'Messages',        value: stats.messages, icon: Mail,        bg: '#f5f3ff', color: C.primary, trend: 'Inbox', key: 'messages' },
  ];

  const activeLabel = navItems.find(n => n.key === activeKey)?.label || 'Dashboard';
  const ActiveIcon  = navItems.find(n => n.key === activeKey)?.icon || LayoutDashboard;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: C.contentBg }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════ */}
      <aside style={{
        width: 256, flexShrink: 0,
        backgroundColor: C.sidebarBg,
        borderRight: `1px solid ${C.sidebarBorder}`,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${C.sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            }}>
              <ShieldCheck size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ color: C.text, fontWeight: 800, fontSize: 15, lineHeight: 1 }}>C-DAC Admin</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>Examination Portal</div>
            </div>
          </div>
        </div>

        {/* Admin profile chip */}
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.sidebarBorder}` }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: C.primaryLight, borderRadius: 10, padding: '10px 12px',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {(user.name || user.userId || 'A').charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name || user.userId || 'Administrator'}
              </div>
              {/* Commented out Super Admin related role description */}
              {/* <div style={{ color: C.primary, fontSize: 11, fontWeight: 600 }}>Super Admin</div> */}
              <div style={{ color: C.primary, fontSize: 11, fontWeight: 600 }}>Admin</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {/* Go to Website navigation link */}
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: 10, padding: '9px 12px', borderRadius: 9,
              border: 'none', cursor: 'pointer', marginBottom: 16,
              backgroundColor: 'transparent',
              color: C.navText,
              fontWeight: 600,
              fontSize: 13.5, textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.navHover; e.currentTarget.style.color = C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.navText; }}
          >
            <BookOpen size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>Go to Website</span>
          </button>

          {groups.map(group => (
            <div key={group} style={{ marginBottom: 22 }}>
              <div style={{
                color: '#9ca3af', fontSize: '10px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '1.2px',
                padding: '0 8px 8px',
              }}>{group}</div>
              {navItems.filter(n => n.group === group).map(item => {
                const Icon = item.icon;
                const isActive = activeKey === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveKey(item.key)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      gap: 10, padding: '9px 12px', borderRadius: 9,
                      border: 'none', cursor: 'pointer', marginBottom: 2,
                      backgroundColor: isActive ? C.activeBg : 'transparent',
                      color: isActive ? C.activeText : C.navText,
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13.5, textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(124,58,237,0.12)' : 'none',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = C.navHover; e.currentTarget.style.color = C.primary; }}}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.navText; }}}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.primary }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ padding: 12, borderTop: `1px solid ${C.sidebarBorder}` }}>
          <button
            onClick={() => { localStorage.clear(); navigate('/'); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
              backgroundColor: '#fef2f2', color: '#ef4444',
              fontSize: 13.5, fontWeight: 600, transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════ */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          backgroundColor: C.headerBg,
          borderBottom: `1px solid ${C.border}`,
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
          boxShadow: '0 1px 4px rgba(124,58,237,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              backgroundColor: C.primaryLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ActiveIcon size={16} color={C.primary} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1 }}>{activeLabel}</h1>
              <p style={{ fontSize: 11, color: C.muted, margin: '3px 0 0' }}>CDAC ExamWeb · Admin Panel</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Bell */}
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              border: `1px solid ${C.border}`, backgroundColor: C.cardBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Bell size={15} color={C.muted} />
            </div>
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13,
            }}>
              {(user.name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ padding: '28px 32px' }}>

          {/* Stat Cards — shown on all tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16, marginBottom: 28,
          }}>
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} 
                  onClick={() => card.key && setActiveKey(card.key)}
                  style={{
                    backgroundColor: C.cardBg,
                    borderRadius: 16, border: `1px solid ${C.border}`,
                    padding: '20px', boxShadow: '0 1px 4px rgba(124,58,237,0.06)',
                    transition: 'all 0.2s ease',
                    cursor: card.key ? 'pointer' : 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.1)';
                    if (card.key) e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(124,58,237,0.06)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    backgroundColor: card.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <Icon size={20} color={card.color} strokeWidth={2.2} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1 }}>{card.value}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontWeight: 500 }}>{card.label}</div>
                  <div style={{
                    marginTop: 10, paddingTop: 10,
                    borderTop: `1px solid ${C.border}`,
                    fontSize: 11, color: card.color, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <TrendingUp size={11} /> {card.trend}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Content Panel */}
          <div style={{
            backgroundColor: C.cardBg,
            borderRadius: 18,
            border: `1px solid ${C.border}`,
            padding: '28px',
            boxShadow: '0 1px 6px rgba(124,58,237,0.06)',
          }}>
            {/* Panel header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
              paddingBottom: 18, borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ActiveIcon size={17} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>Manage {activeLabel}</div>
                <div style={{ fontSize: 12, color: C.muted }}>Add, edit or remove records</div>
              </div>
            </div>

            <Tab.Container activeKey={activeKey}>
              <Tab.Content>
                <Tab.Pane eventKey="courses"><ManageCourses /></Tab.Pane>
                <Tab.Pane eventKey="exams"><ManageExams /></Tab.Pane>
                <Tab.Pane eventKey="practice-tests"><ManagePracticeTests /></Tab.Pane>
                <Tab.Pane eventKey="questions"><ManageQuestions /></Tab.Pane>
                <Tab.Pane eventKey="users"><ManageUsers /></Tab.Pane>
                <Tab.Pane eventKey="instructions"><ManageInstructions /></Tab.Pane>
                <Tab.Pane eventKey="performance"><ViewPerformance /></Tab.Pane>
                <Tab.Pane eventKey="reports"><StudentReport /></Tab.Pane>
                <Tab.Pane eventKey="certificates"><ManageCertificates /></Tab.Pane>
                <Tab.Pane eventKey="messages"><ManageMessages onMessagesChange={fetchDashboardStats} /></Tab.Pane>
                <Tab.Pane eventKey="testimonials"><ManageTestimonials /></Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-track { background: transparent; }
        aside::-webkit-scrollbar-thumb { background: #e9d5ff; border-radius: 4px; }
        main::-webkit-scrollbar { width: 6px; }
        main::-webkit-scrollbar-track { background: #f5f3ff; }
        main::-webkit-scrollbar-thumb { background: #ddd6fe; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
