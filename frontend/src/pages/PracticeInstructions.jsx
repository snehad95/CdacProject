import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, ArrowLeft, PlayCircle, ShieldCheck, Clock, Award } from 'lucide-react';

const PracticeInstructions = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [rules, setRules] = useState([
    { text: 'Each question carries 1 equal mark.' },
    { text: 'There is no negative marking.' },
    { text: 'This is a practice test for preparation.' },
  ]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/test');
    }
    const saved = JSON.parse(localStorage.getItem('practiceInstructions') || '[]');
    if (saved.length > 0) setRules(saved.map((text) => ({ text })));
  }, [navigate]);

  return (
    <div style={styles.page}>
      {/* Decorative background */}
      <div style={styles.bgOrbOne} />
      <div style={styles.bgOrbTwo} />

      {/* Top bar */}
      <header style={styles.topBar}>
        <button
          style={styles.backBtn}
          onClick={() => navigate('/test')}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f3f9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <ArrowLeft size={16} style={{ marginRight: 8 }} />
          Back to Tests
        </button>
        <div style={styles.brand}>
          <div style={styles.brandDot} />
          Practice Portal
        </div>
      </header>

      <main style={styles.main}>
        <motion.section
          style={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Header */}
          <div style={styles.cardHeader}>
            <div style={styles.iconBadge}>
              <BookOpen size={22} color="#7c5cff" />
            </div>
            <div>
              <p style={styles.eyebrow}>Exam Instructions</p>
              <h1 style={styles.title}>
                {decodeURIComponent(category || 'Practice')}
              </h1>
              <p style={styles.subtitle}>
                Please review the guidelines below carefully before you begin.
              </p>
            </div>
          </div>

          {/* Meta strip */}
          <div style={styles.metaGrid}>
            <div style={styles.metaItem}>
              <ShieldCheck size={16} color="#7c5cff" />
              <span style={styles.metaLabel}>Mode</span>
              <span style={styles.metaValue}>Practice</span>
            </div>
            <div style={styles.metaItem}>
              <Award size={16} color="#7c5cff" />
              <span style={styles.metaLabel}>Marking</span>
              <span style={styles.metaValue}>+1 / 0</span>
            </div>
            <div style={styles.metaItem}>
              <Clock size={16} color="#7c5cff" />
              <span style={styles.metaLabel}>Type</span>
              <span style={styles.metaValue}>Untimed</span>
            </div>
          </div>

          {/* Rules */}
          <div style={styles.rulesSection}>
            <h2 style={styles.sectionLabel}>Guidelines</h2>
            <ul style={styles.rulesList}>
              {rules.map((rule, index) => (
                <motion.li
                  key={index}
                  style={styles.ruleItem}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.25 }}
                >
                  <CheckCircle2 size={18} color="#7c5cff" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={styles.ruleText}>{rule.text}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Footer / CTA */}
          <div style={styles.footer}>
            <p style={styles.footerNote}>
              By starting, you confirm you have read all instructions.
            </p>
            <button
              style={styles.startBtn}
              onClick={() => navigate(`/practice-arena/${encodeURIComponent(category)}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4338ca';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#7c5cff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <PlayCircle size={20} style={{ marginRight: 10 }} />
              Start Test
            </button>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f8fafc 0%, #f3eeff 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    color: 'var(--cdac-text)',
    position: 'relative',
    overflow: 'hidden',
  },
  bgOrbOne: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,70,229,0.12), transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrbTwo: {
    position: 'absolute',
    bottom: -160,
    left: -100,
    width: 420,
    height: 420,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14,165,233,0.10), transparent 70%)',
    pointerEvents: 'none',
  },
  topBar: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 32px',
    zIndex: 2,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'var(--cdac-surface)',
    color: 'var(--cdac-text)',
    border: '1px solid #e2e8f0',
    padding: '9px 16px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--cdac-text-muted)',
    letterSpacing: 0.3,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#7c5cff',
  },
  main: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '24px 24px 64px',
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: 'var(--cdac-surface)',
    border: '1px solid #e2e8f0',
    borderRadius: 20,
    padding: '40px 44px',
    boxShadow: '0 10px 40px rgba(15,23,42,0.06)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 28,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'var(--cdac-surface-alt)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    color: '#7c5cff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    margin: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--cdac-text)',
    margin: '6px 0 6px',
    lineHeight: 1.2,
  },
  subtitle: {
    color: 'var(--cdac-text-muted)',
    fontSize: 15,
    margin: 0,
    lineHeight: 1.5,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    marginBottom: 28,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    backgroundColor: 'var(--cdac-bg)',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    fontSize: 13,
  },
  metaLabel: {
    color: 'var(--cdac-text-muted)',
    fontWeight: 500,
  },
  metaValue: {
    marginLeft: 'auto',
    color: 'var(--cdac-text)',
    fontWeight: 600,
  },
  rulesSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--cdac-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    margin: '0 0 14px',
  },
  rulesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '14px 16px',
    backgroundColor: 'var(--cdac-bg)',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
  },
  ruleText: {
    fontSize: 15,
    color: 'var(--cdac-text-muted)',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 24,
    borderTop: '1px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  footerNote: {
    fontSize: 13,
    color: 'var(--cdac-text-muted)',
    margin: 0,
  },
  startBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#7c5cff',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, transform 0.15s ease',
    boxShadow: '0 4px 12px rgba(79,70,229,0.25)',
  },
};

export default PracticeInstructions;
