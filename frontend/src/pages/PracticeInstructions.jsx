import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock, BookOpen, Target, CheckCircle, ArrowLeft, PlayCircle, Award, ChevronRight, Camera, AlertTriangle
} from 'lucide-react';

const PracticeInstructions = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [rules, setRules] = useState([
    { text: 'Each question carries 1 equal mark.' },
    { text: 'There is no negative marking.' },
    { text: 'This is a practice test for preparation.' }
  ]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/test');
    }

    const savedInstructions = JSON.parse(localStorage.getItem('practiceInstructions') || '[]');
    if (savedInstructions.length > 0) {
      setRules(savedInstructions.map(text => ({ text })));
    }
  }, [navigate]);

  return (
    <div style={styles.pageWrap}>
      {/* Absolute Back Button - Top Right */}
      <button 
        style={styles.absBackBtn} 
        onClick={() => navigate('/test')}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5a31d6'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6a41e6'}
      >
        <ArrowLeft size={18} style={{ marginRight: '8px' }} />
        Back to Tests
      </button>

      {/* Main content */}
      <div style={styles.contentWrap}>
        <motion.div
          style={styles.card}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.iconCircle}>
              <BookOpen size={32} color="#fff" />
            </div>
            <h1 style={styles.title}>{decodeURIComponent(category || 'Practice')} Exam Instructions</h1>
            <p style={styles.subtitle}>Please read the following instructions carefully before starting the test.</p>
          </div>

          {/* Rules List */}
          <div style={styles.rulesContainer}>
            {rules.map((rule, index) => (
              <motion.div 
                key={index} 
                style={styles.ruleItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div style={styles.bullet}>
                  <CheckCircle size={20} color="#6a41e6" />
                </div>
                <span style={styles.ruleText}>{rule.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Centered Start Button at Bottom */}
          <div style={styles.footer}>
            <button
              style={styles.startBtn}
              onClick={() => navigate(`/practice-arena/${encodeURIComponent(category)}`)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(106, 65, 230, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(106, 65, 230, 0.2)';
              }}
            >
              <PlayCircle size={24} style={{ marginRight: '12px' }} />
              START TEST
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  pageWrap: {
    minHeight: '100vh',
    background: '#f8faff',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    fontFamily: "'Inter', system-ui, sans-serif",
    overflowX: 'hidden'
  },
  absBackBtn: {
    position: 'absolute',
    top: '30px',
    right: '40px',
    backgroundColor: '#6a41e6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(106, 65, 230, 0.3)',
    transition: 'all 0.2s ease'
  },
  contentWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '800px',
    borderRadius: '24px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    padding: '50px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  iconCircle: {
    width: '70px',
    height: '70px',
    backgroundColor: '#6a41e6',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 10px 20px rgba(106, 65, 230, 0.2)'
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#666',
    fontSize: '1.1rem'
  },
  rulesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '50px',
    backgroundColor: '#f9f9ff',
    padding: '30px',
    borderRadius: '20px'
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  bullet: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ruleText: {
    fontSize: '1.15rem',
    color: '#333',
    fontWeight: '600'
  },
  footer: {
    display: 'flex',
    justifyContent: 'center'
  },
  startBtn: {
    backgroundColor: '#6a41e6',
    color: 'white',
    border: 'none',
    padding: '18px 50px',
    fontSize: '1.25rem',
    fontWeight: '800',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 4px 15px rgba(106, 65, 230, 0.2)',
    letterSpacing: '1px'
  }
};

export default PracticeInstructions;
