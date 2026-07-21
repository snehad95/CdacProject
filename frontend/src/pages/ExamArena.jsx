import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { Row, Col, Form } from 'react-bootstrap';
import { 
  Play, Terminal, CheckCircle, ChevronRight, ChevronLeft, 
  ShieldAlert, Lock, AlertTriangle, Monitor, Sparkles, Code2, 
  HelpCircle, RefreshCw, CheckCircle2, XCircle
} from 'lucide-react';

const MAX_VIOLATIONS = 3;

const T = {
  bg: '#0b0f19',
  surface: '#151b2c',
  surfaceAlt: '#1d263b',
  primary: '#7c5cff',
  primarySoft: '#a78bfa',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#2e3a59',
};

const getDefaultCode = (lang) => {
  const l = lang ? lang.toLowerCase() : 'python';
  if (l === 'java') {
    return `public class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n        System.out.println("Hello, World!");\n    }\n}`;
  } else if (l === 'cpp' || l === 'c++') {
    return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    cout << "Hello, World!" << endl;\n    return 0;\n}`;
  }
  return `# Write your Python code here\nprint("Hello, World!")\n`;
};

const CodeEditor = ({ value, onChange, placeholder, disabled }) => {
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i + 1);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + "    " + value.substring(end);
      onChange({ target: { value: newValue } });
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div style={{
      display: 'flex',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '14px',
      border: `1.5px solid ${T.border}`,
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#0d111d',
      color: '#e2e8f0',
      minHeight: '340px',
      position: 'relative',
      opacity: disabled ? 0.6 : 1
    }}>
      {/* Line Numbers */}
      <div style={{
        padding: '12px 8px',
        background: '#070a13',
        color: '#475569',
        textAlign: 'right',
        userSelect: 'none',
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        minWidth: '44px',
        lineHeight: '22px'
      }}>
        {lineNumbers.map(ln => (
          <div key={ln} style={{ height: '22px' }}>{ln}</div>
        ))}
      </div>
      {/* Code Textarea */}
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Write your code here...'}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '12px',
          background: '#0d111d',
          color: '#f8fafc',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: '14px',
          lineHeight: '22px',
          whiteSpace: 'pre',
          overflowWrap: 'normal',
          overflowX: 'auto',
          userSelect: 'text',
          WebkitUserSelect: 'text',
          MozUserSelect: 'text',
          msUserSelect: 'text'
        }}
      />
    </div>
  );
};

const ExamArena = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Core Exam States
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedLanguages, setSelectedLanguages] = useState({});
  const [lockedQuestions, setLockedQuestions] = useState({});
  const [codingTestResults, setCodingTestResults] = useState({});
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Security & Violation States
  const [violations, setViolations] = useState(0);
  const [warnMsg, setWarnMsg] = useState('');
  const [showWarn, setShowWarn] = useState(false);
  const [showFullscreenWarn, setShowFullscreenWarn] = useState(false);
  const [showStartOverlay, setShowStartOverlay] = useState(true);

  // Timers States
  const [timeLeft, setTimeLeft] = useState(0);
  const [mcqSectionTimer, setMcqSectionTimer] = useState(0);
  const [questionTimers, setQuestionTimers] = useState({});

  // Sync & Connection States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('Saved'); // 'Saved', 'Saving...', 'Offline'

  // Code Execution Workspace States
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [runOutput, setRunOutput] = useState(null);
  const [customStdin, setCustomStdin] = useState('');

  // Refs for persistent access in async intervals & listeners
  const answersRef = useRef({});
  const selectedLanguagesRef = useRef({});
  const lockedQuestionsRef = useRef({});
  const questionTimersRef = useRef({});
  const mcqSectionTimerRef = useRef(0);
  const activeQuestionIndexRef = useRef(0);
  const violationsRef = useRef(0);
  const submittedRef = useRef(false);
  const timerRef = useRef(null);
  const socketRef = useRef(null);

  // Helper State Updaters to keep refs in sync
  const updateAnswers = (newAns) => {
    setAnswers(newAns);
    answersRef.current = newAns;
  };
  const updateSelectedLanguages = (newLang) => {
    setSelectedLanguages(newLang);
    selectedLanguagesRef.current = newLang;
  };
  const updateLockedQuestions = (newLock) => {
    setLockedQuestions(newLock);
    lockedQuestionsRef.current = newLock;
  };
  const updateQuestionTimers = (newTimers) => {
    setQuestionTimers(newTimers);
    questionTimersRef.current = newTimers;
  };
  const updateMcqSectionTimer = (newVal) => {
    setMcqSectionTimer(newVal);
    mcqSectionTimerRef.current = newVal;
  };
  const updateActiveQuestionIndex = (newIdx) => {
    setActiveQuestionIndex(newIdx);
    activeQuestionIndexRef.current = newIdx;
  };

  // Helper to log violation to backend
  const logViolationToServer = useCallback(async (type) => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post('http://localhost:5000/api/violations', {
        studentId: user.id,
        examId,
        violationType: type
      }, config);
    } catch (err) {
      console.error("Failed to log violation to server", err);
    }
  }, [examId, user.id]);

  // Socket sync emitter
  const emitTimerSync = (remTime, qId) => {
    if (socketRef.current) {
      socketRef.current.emit('tickTimer', {
        studentId: user.id,
        examId,
        remainingTime: remTime,
        questionId: qId
      });
    }
  };

  // Submit Exam function
  const submitExam = useCallback(async (reason = 'manual') => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
    } catch (_) {}
    
    document.oncontextmenu = null;
    document.oncopy = null;
    document.onpaste = null;

    try {
      const currentAnswers = answersRef.current;
      const formattedAnswers = questions.map(q => {
        const ansVal = currentAnswers[q._id] || '';
        if (q.type === 'subjective') {
          return {
            questionId: q._id,
            subjectiveAnswer: ansVal,
          };
        } else if (q.type === 'coding') {
          const testRes = codingTestResults[q._id] || { passed: 0, total: 0, score: 0 };
          return {
            questionId: q._id,
            sourceCode: ansVal,
            language: selectedLanguagesRef.current[q._id] || (q.allowedLanguages && q.allowedLanguages[0]) || 'python',
            testResults: { passed: testRes.passed, total: testRes.total },
            marksObtained: testRes.score
          };
        } else {
          return {
            questionId: q._id,
            selectedOptionText: ansVal,
          };
        }
      });

      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      await axios.post('http://localhost:5000/api/results/submit', {
        userId: user.id,
        examId,
        answers: formattedAnswers,
      }, config);

      // Clear server progress schema
      await axios.delete(`http://localhost:5000/api/progress/${examId}/${user.id}`, config);
      localStorage.removeItem(`exam_progress_offline_${examId}`);
    } catch (err) {
      console.error('Submit error', err);
    }

    const msg = reason === 'time'
      ? 'Time is up! Your exam has been submitted.'
      : reason === 'violation'
        ? '🚨 3 violations detected. Your exam has been auto-submitted.'
        : 'Exam submitted successfully!';

    setTimeout(() => {
      if (reason === 'time' || reason === 'violation') {
        toast.error(msg, { duration: 6000 });
      } else {
        toast.success(msg);
      }
      navigate('/dashboard');
    }, 200);
  }, [examId, user.id, questions, codingTestResults, navigate]);

  // Local violation trigger
  const triggerViolation = useCallback((message, type) => {
    if (submittedRef.current) return;
    violationsRef.current += 1;
    const v = violationsRef.current;
    setViolations(v);
    
    if (v >= MAX_VIOLATIONS) {
      setWarnMsg(`🚨 VIOLATION #${v}: ${message}\nAuto-submitting your exam NOW!`);
      setShowWarn(true);
      setTimeout(() => submitExam('violation'), 2500);
    } else {
      setWarnMsg(`⚠️ WARNING ${v}/${MAX_VIOLATIONS}: ${message}\n${MAX_VIOLATIONS - v} warning(s) left before auto-submit.`);
      setShowWarn(true);
      setTimeout(() => setShowWarn(false), 4000);
    }
  }, [submitExam]);

  // Enter Fullscreen Helper
  const enterFullscreen = () => {
    const docEl = document.documentElement;
    const requestF = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    
    if (requestF) {
      requestF.call(docEl)
        .then(() => {
          setShowFullscreenWarn(false);
          setShowStartOverlay(false);
        })
        .catch(err => {
          console.error("Fullscreen request failed", err);
          toast.error("Please click 'Start' to enter fullscreen mode first.");
        });
    } else {
      setShowStartOverlay(false);
    }
  };

  // Auto-Save progress logic
  const saveProgressToServer = useCallback(async () => {
    if (submittedRef.current || !questions.length) return;
    setSyncStatus('Saving...');
    
    const payloadAnswers = questions.map(q => {
      const ansVal = answersRef.current[q._id] || '';
      return {
        questionId: q._id,
        selectedOptionText: q.type === 'mcq' ? ansVal : undefined,
        subjectiveAnswer: q.type === 'subjective' ? ansVal : undefined,
        sourceCode: q.type === 'coding' ? ansVal : undefined,
        language: q.type === 'coding' ? (selectedLanguagesRef.current[q._id] || (q.allowedLanguages && q.allowedLanguages[0]) || 'python') : undefined,
        timeLeft: q.type === 'mcq' ? mcqSectionTimerRef.current : (questionTimersRef.current[q._id] ?? (q.timerDuration * 60)),
        locked: lockedQuestionsRef.current[q._id] || false
      };
    });

    const progressData = {
      studentId: user.id,
      examId,
      currentQuestionId: questions[activeQuestionIndexRef.current]?._id,
      answers: payloadAnswers
    };

    if (!navigator.onLine) {
      localStorage.setItem(`exam_progress_offline_${examId}`, JSON.stringify(progressData));
      setSyncStatus('Offline');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post('http://localhost:5000/api/progress', progressData, config);
      setSyncStatus('Saved');
    } catch (err) {
      console.error("Error auto-saving progress:", err);
      localStorage.setItem(`exam_progress_offline_${examId}`, JSON.stringify(progressData));
      setSyncStatus('Offline');
    }
  }, [examId, user.id, questions]);

  // Load Exam and recovery data
  useEffect(() => {
    if (user.role !== 'student') { navigate('/'); return; }
    
    const fetchExamData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // 1. Check if user already has a submission record
        try {
          const checkRes = await axios.get(`http://localhost:5000/api/results/student/${user.id}`, config);
          const hasAttempted = checkRes.data.some(r => r.examId && r.examId._id === examId);
          if (hasAttempted) {
            setAlreadySubmitted(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Result check failed", err);
        }

        // 2. Fetch progress if any
        let progressData = null;
        try {
          const progRes = await axios.get(`http://localhost:5000/api/progress/${examId}/${user.id}`, config);
          progressData = progRes.data;
        } catch (e) {
          console.error("Failed to load progress from server", e);
        }

        // 3. Fetch Exam structure and Questions list
        const [examsRes, qRes] = await Promise.all([
          axios.get('http://localhost:5000/api/exams', config),
          axios.get(`http://localhost:5000/api/questions/exam/${examId}`, config),
        ]);
        const current = examsRes.data.find(e => e._id === examId);
        setExam(current);
        
        const qList = qRes.data;
        setQuestions(qList);

        // 4. Initialize recovery fields
        let initialAnswers = {};
        let initialLanguages = {};
        let initialLocked = {};
        let initialTimers = {};
        let initialMcqTimer = current.mcqDuration ? current.mcqDuration * 60 : 0;
        let startQuestionIndex = 0;

        if (progressData) {
          if (progressData.answers && progressData.answers.length > 0) {
            progressData.answers.forEach(ans => {
              const q = qList.find(item => item._id === ans.questionId);
              if (q) {
                if (q.type === 'mcq') {
                  initialAnswers[q._id] = ans.selectedOptionText || '';
                  initialMcqTimer = ans.timeLeft || initialMcqTimer;
                } else if (q.type === 'subjective') {
                  initialAnswers[q._id] = ans.subjectiveAnswer || '';
                  initialTimers[q._id] = ans.timeLeft ?? (q.timerDuration * 60);
                } else if (q.type === 'coding') {
                  const safeLang = ans.language || (q.allowedLanguages && q.allowedLanguages[0]) || 'python';
                  initialAnswers[q._id] = ans.sourceCode || getDefaultCode(safeLang);
                  initialLanguages[q._id] = safeLang;
                  initialTimers[q._id] = ans.timeLeft ?? (q.timerDuration * 60);
                }
                initialLocked[q._id] = ans.locked || false;
              }
            });
          }
          if (progressData.currentQuestionId) {
            const idx = qList.findIndex(q => q._id === progressData.currentQuestionId);
            if (idx !== -1) startQuestionIndex = idx;
          }

          // Calculate elapsed seconds from database creation to keep timer bulletproof
          const elapsed = Math.floor((Date.now() - new Date(progressData.createdAt).getTime()) / 1000);
          const masterLeft = Math.max(0, current.durationMinutes * 60 - elapsed);
          setTimeLeft(masterLeft);
        } else {
          // Default initialization
          qList.forEach(q => {
            if (q.type === 'coding') {
              const defaultLang = (q.allowedLanguages && q.allowedLanguages[0]) || 'python';
              initialAnswers[q._id] = getDefaultCode(defaultLang);
              initialLanguages[q._id] = defaultLang;
            } else {
              initialAnswers[q._id] = '';
            }
            initialLocked[q._id] = false;
            if (q.timerDuration > 0) {
              initialTimers[q._id] = q.timerDuration * 60;
            }
          });
          setTimeLeft(current.durationMinutes * 60);
        }

        updateAnswers(initialAnswers);
        updateSelectedLanguages(initialLanguages);
        updateLockedQuestions(initialLocked);
        updateQuestionTimers(initialTimers);
        updateMcqSectionTimer(initialMcqTimer);
        updateActiveQuestionIndex(startQuestionIndex);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchExamData();
  }, [examId, navigate, user.role, user.id]);

  // Navigation and Timer Advance Helper
  const moveToNextUnlocked = (currentIdx) => {
    let nextIdx = currentIdx + 1;
    while (nextIdx < questions.length) {
      const q = questions[nextIdx];
      if (!lockedQuestionsRef.current[q._id]) {
        updateActiveQuestionIndex(nextIdx);
        return;
      }
      nextIdx++;
    }
    let prevIdx = 0;
    while (prevIdx < currentIdx) {
      const q = questions[prevIdx];
      if (!lockedQuestionsRef.current[q._id]) {
        updateActiveQuestionIndex(prevIdx);
        return;
      }
      prevIdx++;
    }
    toast.error("Note: All remaining questions are locked or complete.");
  };

  // Socket Connection setup
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('joinExam', { studentId: user.id, examId });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [examId, user.id]);

  // Master Clock ticking interval
  useEffect(() => {
    if (!exam || timeLeft <= 0 || showStartOverlay || showFullscreenWarn) return;
    
    timerRef.current = setInterval(() => {
      // 1. Master Timer decrement
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitExam('time');
          return 0;
        }
        return prev - 1;
      });

      const q = questions[activeQuestionIndexRef.current];
      if (!q) return;

      // Lock checks
      if (lockedQuestionsRef.current[q._id]) return;

      // 2. MCQ section timer ticks
      if (q.type === 'mcq' && exam.mcqDuration > 0) {
        const newMcqTime = mcqSectionTimerRef.current - 1;
        updateMcqSectionTimer(newMcqTime);
        emitTimerSync(newMcqTime, q._id);
        
        if (newMcqTime <= 0) {
          const newLock = { ...lockedQuestionsRef.current };
          questions.forEach(item => {
            if (item.type === 'mcq') newLock[item._id] = true;
          });
          updateLockedQuestions(newLock);
          saveProgressToServer();
          toast.error("MCQ Section time has expired! Section locked.");
          
          const nextNonMcqIdx = questions.findIndex(item => item.type !== 'mcq');
          if (nextNonMcqIdx !== -1) {
            updateActiveQuestionIndex(nextNonMcqIdx);
          }
        }
      }

      // 3. Question-level subjective/coding timer ticks
      if ((q.type === 'subjective' || q.type === 'coding') && q.timerDuration > 0) {
        const curTime = questionTimersRef.current[q._id] ?? (q.timerDuration * 60);
        const newTime = curTime - 1;
        
        const newTimers = { ...questionTimersRef.current, [q._id]: newTime };
        updateQuestionTimers(newTimers);
        emitTimerSync(newTime, q._id);

        if (newTime <= 0) {
          const newLock = { ...lockedQuestionsRef.current, [q._id]: true };
          updateLockedQuestions(newLock);
          saveProgressToServer();
          toast.error(`Time has expired for Question ${activeQuestionIndexRef.current + 1}! Locked.`);
          moveToNextUnlocked(activeQuestionIndexRef.current);
        }
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [exam, showStartOverlay, showFullscreenWarn, questions, submitExam, saveProgressToServer]);

  // 15-second Save Heartbeat
  useEffect(() => {
    if (showStartOverlay || showFullscreenWarn || !questions.length) return;
    const interval = setInterval(() => {
      saveProgressToServer();
    }, 15000);
    return () => clearInterval(interval);
  }, [questions, showStartOverlay, showFullscreenWarn, saveProgressToServer]);

  // Security Listeners
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const blockBack = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', blockBack);

    const handleSecurityInfraction = (actionName) => {
      if (!submittedRef.current && !showStartOverlay) {
        toast.error(`Security Alert: ${actionName} is strictly disabled during proctored exams!`, { id: 'security-toast' });
        logViolationToServer(`Security Infraction: ${actionName}`);
      }
    };

    document.oncontextmenu = e => { e.preventDefault(); handleSecurityInfraction('Right-click Context Menu'); };
    document.oncopy = e => { e.preventDefault(); handleSecurityInfraction('Copying content'); };
    document.onpaste = e => { e.preventDefault(); handleSecurityInfraction('Pasting content'); };
    document.oncut = e => { e.preventDefault(); handleSecurityInfraction('Cutting content'); };

    const blockKeys = (e) => {
      const isTextarea = e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'textarea';
      if (isTextarea) {
        if ((e.ctrlKey || e.metaKey) && ['c', 'v'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          handleSecurityInfraction('Clipboard shortcut in editor');
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'x', 'p', 's', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        handleSecurityInfraction(`Keyboard shortcut (${e.key})`);
      }
      if (['F12', 'F5'].includes(e.key) || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        handleSecurityInfraction('Developer Tools / Refresh shortcut');
      }
    };
    document.addEventListener('keydown', blockKeys);

    const handleBlur = () => { 
      if (!submittedRef.current && !showStartOverlay) { 
        logViolationToServer('Window Blur');
        triggerViolation('Tab switching or window focus lost detected.', 'Window Blur'); 
      } 
    };
    const handleVisibility = () => { 
      if (document.hidden && !submittedRef.current && !showStartOverlay) { 
        logViolationToServer('Tab Change');
        triggerViolation('You switched to another tab or application.', 'Tab Change'); 
      } 
    };
    
    const handleBeforeUnload = (e) => {
      if (!submittedRef.current && !showStartOverlay) {
        logViolationToServer('Refresh Attempt');
        e.preventDefault();
        e.returnValue = 'Warning: refreshing or leaving may violate exam rules.';
        return e.returnValue;
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', blockBack);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('keydown', blockKeys);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.oncontextmenu = null;
      document.oncopy = null; document.onpaste = null; document.oncut = null;
    };
  }, [triggerViolation, logViolationToServer, showStartOverlay]);

  // Fullscreen exited listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submittedRef.current && !showStartOverlay) {
        logViolationToServer('Fullscreen Exit');
        triggerViolation('You exited fullscreen mode.', 'Fullscreen Exit');
        setShowFullscreenWarn(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [triggerViolation, logViolationToServer, showStartOverlay]);

  // Network listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Internet connection restored. Syncing progress...");
      const offlineData = localStorage.getItem(`exam_progress_offline_${examId}`);
      if (offlineData) {
        try {
          const parsed = JSON.parse(offlineData);
          const token = localStorage.getItem('token');
          const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
          axios.post('http://localhost:5000/api/progress', parsed, config)
            .then(() => {
              localStorage.removeItem(`exam_progress_offline_${examId}`);
              toast.success("Offline progress synced successfully.");
              setSyncStatus('Saved');
            })
            .catch(err => console.error("Failed to sync offline progress", err));
        } catch (e) {
          console.error("Error parsing offline progress", e);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('Offline');
      toast.error("Connection lost! Progress is being cached locally.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [examId]);

  // Workspace change language helper
  const handleLangChange = (qId, lang) => {
    updateSelectedLanguages({ ...selectedLanguages, [qId]: lang });
    
    // Auto-update templates if the text is empty or unchanged default template
    const currentCode = answers[qId] || '';
    const py = getDefaultCode('python');
    const jv = getDefaultCode('java');
    const cpp = getDefaultCode('cpp');
    
    if (
      currentCode === '' ||
      currentCode === py ||
      currentCode === jv ||
      currentCode === cpp
    ) {
      updateAnswers({ ...answers, [qId]: getDefaultCode(lang) });
    }
  };

  // Monospaced text word/char counter helpers
  const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Run Code trigger
  const handleRunCode = async (q) => {
    if (runningCode || lockedQuestions[q._id]) return;
    setRunningCode(true);
    setRunOutput(null);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const payload = {
        language: selectedLanguages[q._id] || (q.allowedLanguages && q.allowedLanguages[0]) || 'python',
        sourceCode: answers[q._id] || getDefaultCode(selectedLanguages[q._id] || (q.allowedLanguages && q.allowedLanguages[0]) || 'python'),
        stdin: customStdin || q.sampleInput || ''
      };

      const res = await axios.post('http://localhost:5000/api/compiler/execute', payload, config);
      setRunOutput(res.data);
    } catch (err) {
      toast.error("Compilation / Execution failed.");
      setRunOutput({ run: { stderr: err.response?.data?.message || err.message, code: -1 } });
    } finally {
      setRunningCode(false);
    }
  };

  // Submit Code trigger
  const handleSubmitCode = async (q) => {
    if (submittingCode || lockedQuestions[q._id]) return;
    setSubmittingCode(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const payload = {
        questionId: q._id,
        language: selectedLanguages[q._id] || (q.allowedLanguages && q.allowedLanguages[0]) || 'python',
        sourceCode: answers[q._id] || getDefaultCode(selectedLanguages[q._id] || (q.allowedLanguages && q.allowedLanguages[0]) || 'python'),
        type: 'all'
      };

      const res = await axios.post('http://localhost:5000/api/compiler/test', payload, config);
      const testRes = res.data;
      
      setCodingTestResults(prev => ({ ...prev, [q._id]: testRes }));
      toast.success(`Code submitted! Passed ${testRes.passed}/${testRes.total} test cases.`);
    } catch (err) {
      toast.error("Submission grading failed.");
    } finally {
      setSubmittingCode(false);
    }
  };

  if (alreadySubmitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #090d16 0%, #15102a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif"
      }}>
        <div style={{
          backgroundColor: '#1c1b2e', borderRadius: 24,
          padding: '48px 36px', maxWidth: 500, width: '100%',
          textAlign: 'center', border: '1px solid #2d2a45',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: 84, height: 84, borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            border: '2px solid rgba(239, 68, 68, 0.3)'
          }}>
            <ShieldAlert size={44} color={T.danger} />
          </div>
          <h3 style={{ color: T.text, fontWeight: 800, marginBottom: 12 }}>Attempt Blocked</h3>
          <p style={{ color: T.textMuted, fontSize: '0.98rem', lineHeight: 1.6, marginBottom: 32 }}>
            You have already submitted this exam. Only one attempt is permitted per student to maintain strict test integrity.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '14px 36px', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${T.primary}, #6366f1)`,
              color: '#fff', fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 8px 24px rgba(124, 58, 237, 0.4)`,
              transition: 'all 0.2s'
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading || !exam) {
    return (
      <div style={{
        minHeight: '100vh',
        background: T.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Segoe UI', system-ui, sans-serif", gap: 16
      }}>
        <div style={{
          width: 48, height: 48,
          border: `3.5px solid ${T.border}`,
          borderTop: `3.5px solid ${T.primary}`,
          borderRadius: '50%',
          animation: 'arena-spin 1s linear infinite'
        }} />
        <p style={{ color: T.textMuted, fontWeight: 600 }}>Syncing exam workspace security credentials...</p>
        <style>{`@keyframes arena-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const watermarkText = `${user.name || 'Candidate'} - ${user.email}`;
  const watermarks = Array(15).fill(watermarkText);

  const activeQuestion = questions[activeQuestionIndex];
  const isQuestionLocked = activeQuestion ? lockedQuestions[activeQuestion._id] : false;
  
  const answeredCount = Object.keys(answers).filter(k => !!answers[k]).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  
  const masterPct = timeLeft / (exam.durationMinutes * 60);
  const isMasterCritical = masterPct < 0.1;

  // Active question timers
  let currentTimerVal = null;
  let timerDisplayColor = T.primary;
  if (activeQuestion) {
    if (activeQuestion.type === 'mcq' && exam.mcqDuration > 0) {
      currentTimerVal = mcqSectionTimer;
      if (mcqSectionTimer < 180) timerDisplayColor = T.danger;
      else if (mcqSectionTimer < 600) timerDisplayColor = T.warning;
    } else if ((activeQuestion.type === 'subjective' || activeQuestion.type === 'coding') && activeQuestion.timerDuration > 0) {
      const remSec = questionTimers[activeQuestion._id] ?? (activeQuestion.timerDuration * 60);
      currentTimerVal = remSec;
      if (remSec < 120) timerDisplayColor = T.danger;
      else if (remSec < 300) timerDisplayColor = T.warning;
    }
  }

  try {
    return (
      <div style={S.page}>
      {/* Watermarks backdrop */}
      <div style={S.watermarkOverlay}>
        {watermarks.map((text, i) => (<div key={i} style={S.watermarkText}>{text}</div>))}
      </div>

      {/* Top Header Bar */}
      <header style={S.topBar}>
        <div style={S.topLeft}>
          <img src="http://recruitment-portal.in/reccdac/images/logo_cdac.png" alt="CDAC Logo" style={{ height: 38, objectFit: 'contain' }} />
          <span style={S.examTitleBadge}>{exam.title}</span>
        </div>

        {/* Master Clock */}
        <div style={{ 
          ...S.timerBox, 
          background: isMasterCritical ? 'rgba(239,68,68,0.1)' : 'rgba(124,92,255,0.05)',
          border: `1.5px solid ${isMasterCritical ? T.danger : T.border}` 
        }}>
          <div style={{ fontSize: '.6rem', color: T.textMuted, fontWeight: 800, letterSpacing: '1px' }}>MASTER CLOCK</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isMasterCritical ? T.danger : T.primary }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* User Details & Heartbeat Sync Indicator */}
        <div style={S.topRight}>
          <div style={S.userChip}>
            <div style={S.userAvatar}>{(user.name || 'S')[0].toUpperCase()}</div>
            <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: '.85rem' }}>{user.name || 'Student'}</div>
              <div style={{ color: T.textMuted, fontSize: '.7rem' }}>{user.email}</div>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div style={{
            ...S.syncBadge,
            borderColor: syncStatus === 'Offline' ? T.warning : T.success,
            background: syncStatus === 'Offline' ? 'rgba(245,158,11,0.05)' : 'rgba(16,185,129,0.05)'
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: syncStatus === 'Offline' ? T.warning : T.success,
              display: 'inline-block',
              animation: 'sync-pulse 1.4s infinite ease-in-out'
            }} />
            <span style={{ fontSize: '.72rem', color: T.text, fontWeight: 600 }}>
              {syncStatus === 'Saving...' ? 'Saving...' : syncStatus === 'Offline' ? 'Offline (Saved local)' : 'Saved'}
            </span>
          </div>

          {/* Violations Count */}
          <div style={{ 
            ...S.strikeBadge, 
            background: violations > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.05)', 
            borderColor: violations > 0 ? T.danger : T.success 
          }}>
            <span style={{ fontSize: '.58rem', color: T.textMuted, fontWeight: 800 }}>VIOLATIONS</span>
            <span style={{ fontWeight: 800, color: violations > 0 ? T.danger : T.success }}>
              {violations}/{MAX_VIOLATIONS}
            </span>
          </div>
        </div>
      </header>

      {/* Progress track bar */}
      <div style={S.progressTrack}>
        <div style={{ ...S.progressFill, width: `${progressPct}%` }} />
      </div>

      {/* Main Body */}
      <div style={S.body}>
        
        {/* Left Side: Dynamic Workspace Area */}
        {activeQuestion ? (
          <div style={S.questionPanel}>
            
            {/* Header info */}
            <div style={S.panelHeader}>
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1px',
                    color: activeQuestion.type === 'coding' ? T.danger : activeQuestion.type === 'subjective' ? T.warning : T.primary,
                    background: activeQuestion.type === 'coding' ? 'rgba(239,68,68,0.1)' : activeQuestion.type === 'subjective' ? 'rgba(245,158,11,0.1)' : 'rgba(124,92,255,0.1)',
                    padding: '3px 10px', borderRadius: '50px', border: `1px solid ${activeQuestion.type === 'coding' ? T.danger : activeQuestion.type === 'subjective' ? T.warning : T.primary}`
                  }}>
                    {activeQuestion.type.toUpperCase()} SECTION
                  </span>
                  <h5 style={{ color: T.text, fontWeight: 700, margin: '8px 0 0' }}>
                    Question {activeQuestionIndex + 1} of {questions.length} ({activeQuestion.marks || 1} Marks)
                  </h5>
                </div>

                {/* Section/Question Timer */}
                {currentTimerVal !== null && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                    background: 'rgba(255,255,255,0.02)', padding: '6px 16px', borderRadius: '10px',
                    border: `1.5px solid ${timerDisplayColor}`
                  }}>
                    <span style={{ fontSize: '0.58rem', color: T.textMuted, fontWeight: 800 }}>
                      {activeQuestion.type === 'mcq' ? 'MCQ SECTION TIMER' : 'QUESTION TIMER'}
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: timerDisplayColor, fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(currentTimerVal)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div style={S.questionContent} className="notranslate">
              
              {/* If question is locked */}
              {isQuestionLocked ? (
                <div style={S.lockedAlert}>
                  <Lock size={22} color={T.danger} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: T.text }}>This Question is Locked</div>
                    <div style={{ fontSize: '0.8rem', color: T.textMuted }}>Per-question or Section timer has expired. Your written answers are preserved and submitted automatically.</div>
                  </div>
                </div>
              ) : null}

              {/* Question description */}
              <div style={S.promptCard}>
                <div style={{ 
                  color: T.text, 
                  fontWeight: 600, 
                  fontSize: '1.05rem', 
                  lineHeight: 1.6,
                  userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none'
                }}>
                  {activeQuestion.text}
                </div>
                {activeQuestion.imageUrl && (
                  <img src={`http://localhost:5000${activeQuestion.imageUrl}`} alt="" style={S.promptImage} />
                )}
              </div>

              {/* MCQ Options Rendering */}
              {activeQuestion.type === 'mcq' && (
                <div style={S.optionsList}>
                  {activeQuestion.options.map((opt, oIdx) => {
                    const isSelected = answers[activeQuestion._id] === opt.text;
                    return (
                      <label 
                        key={oIdx} 
                        style={{ 
                          ...S.optionLabel, 
                          background: isSelected ? 'rgba(124,92,255,0.08)' : T.surface, 
                          borderColor: isSelected ? T.primary : T.border,
                          opacity: isQuestionLocked ? 0.6 : 1,
                          cursor: isQuestionLocked ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <span style={{ 
                          ...S.optionDot, 
                          background: isSelected ? T.primary : 'transparent', 
                          borderColor: isSelected ? T.primary : T.primarySoft 
                        }}>
                          {isSelected && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                        </span>
                        <input
                          type="radio"
                          name={activeQuestion._id}
                          disabled={isQuestionLocked}
                          style={{ display: 'none' }}
                          checked={isSelected}
                          onChange={() => {
                            if (isQuestionLocked) return;
                            const newAns = { ...answers, [activeQuestion._id]: opt.text };
                            updateAnswers(newAns);
                          }}
                        />
                        <span style={{ 
                          color: T.text, fontWeight: 500, fontSize: '.95rem',
                          userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none'
                        }}>
                          {opt.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Subjective Question Editor Rendering */}
              {activeQuestion.type === 'subjective' && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: T.textMuted }}>Workspace lines: {activeQuestion.workspaceLines || 10}</span>
                    <span style={{ 
                      color: countWords(answers[activeQuestion._id]) > (activeQuestion.wordLimit || 500) ? T.danger : T.textMuted,
                      fontWeight: 600
                    }}>
                      Words: {countWords(answers[activeQuestion._id])} / {activeQuestion.wordLimit || 500}
                    </span>
                  </div>
                  <textarea
                    rows={activeQuestion.workspaceLines || 10}
                    placeholder="Provide your subjective explanation or Java program code here..."
                    disabled={isQuestionLocked}
                    value={answers[activeQuestion._id] || ''}
                    onChange={e => {
                      if (isQuestionLocked) return;
                      const val = e.target.value;
                      const words = countWords(val);
                      const limit = activeQuestion.wordLimit || 500;
                      // Allow changes if word count is in limit or character deleted
                      if (words <= limit || val.length < (answers[activeQuestion._id] || '').length) {
                        const newAns = { ...answers, [activeQuestion._id]: val };
                        updateAnswers(newAns);
                      } else {
                        toast.error(`Word limit of ${limit} words reached!`);
                      }
                    }}
                    style={{
                      width: '100%',
                      border: `1.5px solid ${T.border}`,
                      borderRadius: '12px',
                      padding: '16px',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.92rem',
                      background: '#0d111d',
                      color: T.text,
                      resize: 'vertical',
                      outline: 'none',
                      userSelect: 'text',
                      WebkitUserSelect: 'text',
                      MozUserSelect: 'text',
                      opacity: isQuestionLocked ? 0.6 : 1
                    }}
                  />
                </div>
              )}

              {/* Coding Workspace Rendering */}
              {activeQuestion.type === 'coding' && (
                <div style={{ marginTop: '20px' }}>
                  <Row className="g-4">
                    {/* Problem specifications */}
                    <Col lg={5}>
                      <div style={S.specCard}>
                        <div style={{ fontWeight: 700, color: T.primary, marginBottom: '6px' }}>PROBLEM SPECIFICATION</div>
                        <h4 style={{ color: T.text, fontWeight: 800, marginBottom: '12px' }}>{activeQuestion.title || 'Untitled Code Question'}</h4>
                        <div style={{ color: T.textMuted, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                          {activeQuestion.description || 'Provide detailed programming logic.'}
                        </div>
                        
                        {activeQuestion.constraints && (
                          <div style={{ marginBottom: '14px' }}>
                            <strong style={{ color: T.text, fontSize: '0.85rem' }}>Constraints:</strong>
                            <pre style={S.preCode}>{activeQuestion.constraints}</pre>
                          </div>
                        )}

                        {activeQuestion.sampleInput && (
                          <Row>
                            <Col md={6}>
                              <strong style={{ color: T.text, fontSize: '0.85rem' }}>Sample Input:</strong>
                              <pre style={S.preCode}>{activeQuestion.sampleInput}</pre>
                            </Col>
                            <Col md={6}>
                              <strong style={{ color: T.text, fontSize: '0.85rem' }}>Sample Output:</strong>
                              <pre style={S.preCode}>{activeQuestion.sampleOutput}</pre>
                            </Col>
                          </Row>
                        )}
                        
                        <div style={{ marginTop: '12px', borderTop: `1px solid ${T.border}`, paddingTop: '10px', fontSize: '0.78rem', color: T.textMuted }}>
                          <div>CPU Time Limit: {activeQuestion.timeLimit || 2} seconds</div>
                          <div>RAM Memory Limit: {activeQuestion.memoryLimit || 256} MB</div>
                        </div>
                      </div>
                    </Col>

                    {/* Integrated IDE area */}
                    <Col lg={7}>
                      <div style={S.ideContainer}>
                        {/* Selector Row */}
                        <div style={S.ideHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Code2 size={16} color={T.primary} />
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>COMPILER RUNTIME IDE</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.75rem', color: T.textMuted }}>Language:</span>
                            <select
                              value={selectedLanguages[activeQuestion._id] || (activeQuestion.allowedLanguages && activeQuestion.allowedLanguages[0]) || 'python'}
                              onChange={e => handleLangChange(activeQuestion._id, e.target.value)}
                              disabled={isQuestionLocked}
                              style={S.langDropdown}
                            >
                              {(activeQuestion.allowedLanguages || ['python', 'java', 'cpp']).map(lang => (
                                <option key={lang} value={lang}>
                                  {lang.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Line numbered custom code editor */}
                        <CodeEditor
                          value={answers[activeQuestion._id] || getDefaultCode(selectedLanguages[activeQuestion._id] || (activeQuestion.allowedLanguages && activeQuestion.allowedLanguages[0]) || 'python')}
                          onChange={e => {
                            if (isQuestionLocked) return;
                            const newAns = { ...answers, [activeQuestion._id]: e.target.value };
                            updateAnswers(newAns);
                          }}
                          disabled={isQuestionLocked}
                          placeholder="Write your execution code statement here..."
                        />

                        {/* Stdin override inputs */}
                        <div style={{ marginTop: '16px' }}>
                          <Form.Label style={{ color: T.text, fontSize: '0.8rem', fontWeight: 600 }}>Test Stdin Input override:</Form.Label>
                          <textarea
                            rows={2}
                            placeholder="Input stdin stream values..."
                            value={customStdin}
                            onChange={e => setCustomStdin(e.target.value)}
                            disabled={isQuestionLocked}
                            style={S.stdinTextarea}
                          />
                        </div>

                        {/* IDE actions */}
                        <div style={S.ideFooter}>
                          <Button 
                            variant="secondary"
                            onClick={() => handleRunCode(activeQuestion)}
                            disabled={runningCode || isQuestionLocked}
                            style={S.runBtn}
                          >
                            <Terminal size={15} className="me-1" /> {runningCode ? 'Executing...' : 'Run Code'}
                          </Button>

                          <Button
                            variant="primary"
                            onClick={() => handleSubmitCode(activeQuestion)}
                            disabled={submittingCode || isQuestionLocked}
                            style={S.submitCodeBtn}
                          >
                            <CheckCircle2 size={15} className="me-1" /> {submittingCode ? 'Grading...' : 'Submit & Verify'}
                          </Button>
                        </div>

                        {/* Test run console output */}
                        {runOutput && (
                          <div style={S.consoleBox}>
                            <div style={{ color: T.primary, fontWeight: 700, fontSize: '0.78rem', borderBottom: `1px solid ${T.border}`, paddingBottom: '6px', marginBottom: '8px' }}>
                              EXECUTION LOGS CONSOLE (Piston v2 Engine)
                            </div>
                            {runOutput.run.stderr ? (
                              <pre style={{ color: T.danger, whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.85rem' }}>
                                {runOutput.run.stderr}
                              </pre>
                            ) : (
                              <pre style={{ color: '#38bdf8', whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.85rem' }}>
                                {runOutput.run.stdout || 'Process executed. Exit code 0 (No output stdout).'}
                              </pre>
                            )}
                            <div style={{ fontSize: '0.7rem', color: T.textMuted, marginTop: '8px' }}>
                              Exit code: {runOutput.run.code}
                            </div>
                          </div>
                        )}

                        {/* Submit verification test cases summary */}
                        {codingTestResults[activeQuestion._id] && (
                          <div style={S.testCasesBox}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}`, paddingBottom: '6px', marginBottom: '8px' }}>
                              <span style={{ color: T.success, fontWeight: 700, fontSize: '0.78rem' }}>SUBMISSION VERIFICATION SUMMARY</span>
                              <span style={{ fontWeight: 800, color: T.success }}>
                                Passed {codingTestResults[activeQuestion._id].passed}/{codingTestResults[activeQuestion._id].total} Test Cases
                              </span>
                            </div>
                            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                              {codingTestResults[activeQuestion._id].results.map((resItem, idx) => (
                                <div key={idx} style={S.tcRow}>
                                  <div>Case #{idx + 1}: {resItem.passed ? <span style={{ color: T.success }}>PASSED</span> : <span style={{ color: T.danger }}>FAILED</span>}</div>
                                  <div style={{ fontSize: '0.75rem', color: T.textMuted, marginTop: '2px' }}>
                                    Input: {resItem.input || 'None'} | Expected: {resItem.expectedOutput} | Actual: {resItem.actualOutput || 'Empty'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </Col>
                  </Row>
                </div>
              )}

            </div>

            {/* Footer switcher */}
            <div style={S.panelFooter}>
              <Button
                variant="outline-secondary"
                disabled={activeQuestionIndex === 0}
                onClick={() => updateActiveQuestionIndex(activeQuestionIndex - 1)}
                style={S.navButton}
              >
                <ChevronLeft size={16} /> Previous
              </Button>

              <Button
                variant="outline-primary"
                onClick={() => {
                  if (activeQuestionIndex === questions.length - 1) {
                    if (window.confirm(`Are you sure you want to finalize and submit? You have answered ${answeredCount}/${questions.length} questions.`)) {
                      submitExam('manual');
                    }
                  } else {
                    updateActiveQuestionIndex(activeQuestionIndex + 1);
                  }
                }}
                style={{
                  ...S.navButton,
                  borderColor: activeQuestionIndex === questions.length - 1 ? T.success : T.primary,
                  color: activeQuestionIndex === questions.length - 1 ? T.success : '#fff'
                }}
              >
                {activeQuestionIndex === questions.length - 1 ? 'Finish & Submit Exam' : 'Next Question'} <ChevronRight size={16} />
              </Button>
            </div>

          </div>
        ) : (
          <div style={{ ...S.questionPanel, alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: T.textMuted }}>No questions configured for this exam.</p>
          </div>
        )}

        {/* Right Sidebar */}
        <aside style={S.sidebar}>
          {/* Card profile */}
          <div style={S.sideCard}>
            <div style={S.sideAvatarBig}>{(user.name || 'S')[0].toUpperCase()}</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: T.text, fontWeight: 700, margin: 0 }}>{user.name}</p>
              <p style={{ color: T.textMuted, fontSize: '.75rem', margin: 0 }}>{user.email}</p>
            </div>
          </div>

          {/* Secure anti-cheat monitor card */}
          <div style={{ 
            ...S.sideCard, 
            background: violations >= MAX_VIOLATIONS ? 'rgba(239,68,68,0.1)' : violations > 0 ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.05)',
            borderColor: violations >= MAX_VIOLATIONS ? T.danger : violations > 0 ? T.warning : T.success
          }}>
            <ShieldAlert size={26} color={violations > 0 ? T.warning : T.success} />
            <p style={{ color: T.text, fontWeight: 700, margin: 0, fontSize: '.85rem' }}>Secure Exam Proctor</p>
            <p style={{ 
              color: violations >= MAX_VIOLATIONS ? T.danger : violations > 0 ? T.warning : T.success,
              fontWeight: 800, fontSize: '1.05rem', margin: 0 
            }}>
              {violations}/{MAX_VIOLATIONS} Violations Logged
            </p>
            <p style={{ color: T.textMuted, fontSize: '.7rem', margin: 0 }}>Limit: 3 exit warning strikes</p>
          </div>

          {/* Question Palette grid selector */}
          <div style={S.paletteCard}>
            <p style={{ color: T.textMuted, fontSize: '.7rem', fontWeight: 800, letterSpacing: '1px', marginBottom: 12 }}>EXAM PALETTE GRID</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {questions.map((q, i) => {
                const done = !!answers[q._id];
                const active = activeQuestionIndex === i;
                const locked = lockedQuestions[q._id];
                
                let dotBg = T.surfaceAlt;
                let dotBorder = T.border;
                let dotColor = T.text;

                if (locked) {
                  dotBg = 'rgba(239,68,68,0.1)';
                  dotBorder = T.danger;
                  dotColor = T.danger;
                } else if (done) {
                  dotBg = 'rgba(16,185,129,0.15)';
                  dotBorder = T.success;
                  dotColor = T.success;
                }
                
                if (active) {
                  dotBorder = T.primary;
                  dotColor = '#fff';
                  if (!done && !locked) dotBg = T.primary;
                }

                return (
                  <div
                    key={q._id}
                    style={{ 
                      ...S.paletteDot, 
                      background: dotBg, 
                      color: dotColor, 
                      border: `1.5px solid ${dotBorder}`
                    }}
                    onClick={() => updateActiveQuestionIndex(i)}
                  >
                    {locked ? '🔒' : i + 1}
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16, fontSize: '.7rem', color: T.textMuted }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 9, height: 9, background: 'rgba(16,185,129,0.15)', border: `1px solid ${T.success}`, borderRadius: 2 }} />
                <span>Completed / Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 9, height: 9, background: 'rgba(239,68,68,0.1)', border: `1px solid ${T.danger}`, borderRadius: 2 }} />
                <span>Locked / Expired</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 9, height: 9, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 2 }} />
                <span>Unattempted / Active</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '10px 0' }}>
            <Button 
              variant="outline-danger"
              style={{ width: '100%', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}
              onClick={() => { if (window.confirm("Submit exam and finalize all answers?")) submitExam('manual'); }}
            >
              ✓ Submit Full Exam
            </Button>
          </div>
        </aside>

      </div>

      {/* Start Fullscreen Overlay */}
      {showStartOverlay && (
        <div style={S.warnOverlay}>
          <div style={{ ...S.warnBox, borderColor: T.primary, maxWidth: 500 }}>
            <div style={{ width: 64, height: 64, background: 'rgba(124,92,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: `1.5px solid ${T.primary}` }}>
              <Monitor size={30} color={T.primary} />
            </div>
            <h4 style={{ color: T.text, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>Secure Exam Proctoring Environment</h4>
            <p style={{ color: T.textMuted, fontSize: '0.88rem', lineHeight: 1.6, textAlign: 'center', marginBottom: 24 }}>
              This exam uses strict browser constraints. The application will enter fullscreen mode. Switching tabs, exiting fullscreen, or minimizing the browser will be flagged as cheating violations.
            </p>
            <button 
              style={{
                ...S.submitBtn,
                background: `linear-gradient(135deg, ${T.primary}, #6366f1)`,
                boxShadow: `0 8px 24px rgba(124, 58, 237, 0.3)`
              }} 
              onClick={enterFullscreen}
            >
              Enter Secure Exam Arena
            </button>
          </div>
        </div>
      )}

      {/* Exited Fullscreen Warn Modal */}
      {showFullscreenWarn && !showStartOverlay && (
        <div style={S.warnOverlay}>
          <div style={{ ...S.warnBox, borderColor: T.danger, maxWidth: 480 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚨</div>
            <h4 style={{ color: T.text, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>Secure Window Violation</h4>
            <p style={{ color: T.textMuted, fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.5, marginBottom: 24 }}>
              You are attempting to leave fullscreen mode. This violates anti-cheat proctoring regulations and will invalidate your attempt.
            </p>
            
            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              <button 
                onClick={enterFullscreen}
                style={{
                  flex: 1, padding: '12px 0', border: 'none', background: T.success, color: '#fff',
                  borderRadius: '10px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Return to Exam
              </button>
              <button 
                onClick={() => submitExam('manual')}
                style={{
                  flex: 1, padding: '12px 0', border: `1.5px solid ${T.danger}`, background: 'transparent',
                  color: T.danger, borderRadius: '10px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Submit Exam Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Toast Alerts */}
      {showWarn && !showFullscreenWarn && (
        <div style={S.warnOverlay}>
          <div style={{ ...S.warnBox, borderColor: violations >= MAX_VIOLATIONS ? T.danger : T.warning }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{violations >= MAX_VIOLATIONS ? '🚨' : '⚠️'}</div>
            <p style={{ color: T.text, fontWeight: 600, textAlign: 'center', whiteSpace: 'pre-line', marginBottom: 20 }}>{warnMsg}</p>
            {violations < MAX_VIOLATIONS && (
              <button style={{ ...S.submitBtn, background: T.warning }} onClick={() => setShowWarn(false)}>I Understand</button>
            )}
          </div>
        </div>
      )}
    </div>
  ); } catch (renderError) {
    console.error("ExamArena Render Error:", renderError);
    return (
      <div style={{ padding: 24, background: '#fee2e2', color: '#b91c1c', fontFamily: 'monospace', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ fontWeight: 800 }}>Render Crash Caught</h2>
        <pre style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: 16, borderRadius: 8, marginTop: 16, maxWidth: '90%', overflowX: 'auto' }}>
          {renderError.stack || renderError.toString()}
        </pre>
      </div>
    );
  }
};

const Button = ({ variant, children, onClick, disabled, style }) => {
  const isOutline = variant?.startsWith('outline-');
  const color = variant === 'outline-primary' ? T.primary : variant === 'outline-danger' ? T.danger : '#fff';
  const bg = isOutline ? 'transparent' : variant === 'primary' ? T.primary : variant === 'secondary' ? T.surfaceAlt : T.success;

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        borderRadius: '10px',
        border: isOutline ? `1.5px solid ${color}` : 'none',
        background: bg,
        color: color,
        fontWeight: 700,
        fontSize: '0.9rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        outline: 'none',
        boxShadow: isOutline ? 'none' : '0 4px 10px rgba(0,0,0,0.15)',
        ...style
      }}
    >
      {children}
    </button>
  );
};

const S = {
  page: {
    minHeight: '100vh', height: '100vh',
    background: T.bg,
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Inter', sans-serif",
    userSelect: 'none', overflow: 'hidden', position: 'relative',
    color: T.text
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 24px', background: T.surface,
    borderBottom: `1px solid ${T.border}`,
    flexShrink: 0, zIndex: 10, flexWrap: 'wrap', gap: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  logoText: { fontSize: '1.05rem', fontWeight: 900, color: T.primary, letterSpacing: '1px' },
  examTitleBadge: {
    background: T.surfaceAlt, border: `1px solid ${T.border}`,
    color: T.primarySoft, fontSize: '.78rem', fontWeight: 700,
    padding: '4px 14px', borderRadius: 50,
  },
  timerBox: { textAlign: 'center', borderRadius: '12px', padding: '6px 20px', minWidth: 130 },
  topRight: { display: 'flex', alignItems: 'center', gap: 16 },
  userChip: { display: 'flex', alignItems: 'center', gap: 10 },
  userAvatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: `linear-gradient(135deg, ${T.primary}, ${T.primarySoft})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: '0.95rem',
  },
  syncBadge: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 12px', borderRadius: '10px', border: '1px solid',
  },
  strikeBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '4px 12px', borderRadius: '10px', border: '1px solid', minWidth: 80,
  },
  progressTrack: { height: 4, background: T.surfaceAlt, flexShrink: 0 },
  progressFill: { height: '100%', background: `linear-gradient(90deg, ${T.primary}, ${T.success})`, transition: 'width 0.4s ease' },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  questionPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: `1px solid ${T.border}` },
  panelHeader: { padding: '16px 24px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.surface },
  questionContent: { flex: 1, overflowY: 'auto', padding: '24px 32px' },
  lockedAlert: {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'rgba(239,68,68,0.1)', border: `1px solid ${T.danger}`,
    borderRadius: '12px', padding: '14px 20px', marginBottom: '20px'
  },
  promptCard: {
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: '16px', padding: '20px 24px', marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  promptImage: { maxWidth: '100%', borderRadius: 10, marginTop: 14, border: `1.5px solid ${T.border}` },
  optionsList: { display: 'flex', flexDirection: 'column', gap: 12 },
  optionLabel: { 
    display: 'flex', alignItems: 'center', gap: 14, borderRadius: '12px', 
    padding: '14px 18px', border: '1px solid', transition: 'all .25s' 
  },
  optionDot: { 
    width: 20, height: 20, borderRadius: '50%', border: '2px solid', 
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' 
  },
  panelFooter: { 
    padding: '16px 24px', borderTop: `1px solid ${T.border}`, 
    display: 'flex', justifyContent: 'space-between', background: T.surface, flexShrink: 0 
  },
  navButton: { padding: '10px 24px', borderRadius: '10px' },
  specCard: {
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: '14px', padding: '20px', height: '100%', overflowY: 'auto',
    maxHeight: '520px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
  },
  preCode: {
    background: '#070a13', border: `1px solid ${T.border}`,
    borderRadius: '8px', padding: '10px 12px', color: '#cbd5e1',
    fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem',
    margin: '6px 0 0', overflowX: 'auto', whiteSpace: 'pre-wrap'
  },
  ideContainer: {
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: '14px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
  },
  ideHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '12px', borderBottom: `1px solid ${T.border}`, paddingBottom: '10px'
  },
  langDropdown: {
    background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`,
    borderRadius: '6px', padding: '4px 10px', fontSize: '0.82rem', fontWeight: 600, outline: 'none'
  },
  stdinTextarea: {
    width: '100%', background: '#0d111d', color: '#f8fafc',
    border: `1.5px solid ${T.border}`, borderRadius: '10px', padding: '10px 12px',
    fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.88rem', outline: 'none', resize: 'vertical'
  },
  ideFooter: { display: 'flex', gap: 12, marginTop: '16px', justifyContent: 'flex-end' },
  runBtn: { padding: '10px 20px', borderRadius: '10px' },
  submitCodeBtn: { padding: '10px 24px', borderRadius: '10px' },
  consoleBox: {
    background: '#070a13', border: `1.5px solid ${T.border}`,
    borderRadius: '10px', padding: '14px', marginTop: '16px',
    fontFamily: 'Consolas, Monaco, monospace'
  },
  testCasesBox: {
    background: '#070a13', border: `1.5px solid ${T.border}`,
    borderRadius: '10px', padding: '14px', marginTop: '16px',
    fontFamily: 'Consolas, Monaco, monospace'
  },
  tcRow: {
    padding: '8px 10px', borderBottom: `1px solid ${T.border}`,
    fontSize: '0.85rem'
  },
  sidebar: {
    width: 280, flexShrink: 0, background: T.surface,
    overflowY: 'auto', padding: 16,
    display: 'flex', flexDirection: 'column', gap: 16,
    borderLeft: `1px solid ${T.border}`,
  },
  sideCard: {
    background: T.surfaceAlt, border: `1px solid ${T.border}`,
    borderRadius: '14px', padding: '16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  sideAvatarBig: {
    width: 54, height: 54, borderRadius: '50%',
    background: `linear-gradient(135deg, ${T.primary}, ${T.primarySoft})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: '1.4rem',
  },
  paletteCard: { background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '16px' },
  paletteDot: { 
    height: 34, borderRadius: 8, fontSize: '.78rem', fontWeight: 800, 
    cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center' 
  },
  warnOverlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(5, 7, 13, 0.82)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
  warnBox: {
    background: T.surface, border: '2px solid',
    borderRadius: '24px', padding: '40px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    width: '90%', boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
  },
  submitBtn: {
    border: 'none', color: '#fff', fontWeight: 800,
    fontSize: '0.98rem', padding: '12px 36px',
    borderRadius: '12px', cursor: 'pointer',
    letterSpacing: '.3px', transition: 'all 0.2s'
  },
  watermarkOverlay: {
    position: 'absolute', inset: 0, zIndex: 1,
    pointerEvents: 'none', overflow: 'hidden',
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 60, padding: 40, opacity: 0.02,
    transform: 'rotate(-15deg)', transformOrigin: 'center center',
  },
  watermarkText: { color: T.primary, fontSize: '1.4rem', fontWeight: 800, whiteSpace: 'nowrap', userSelect: 'none' },
};

export default ExamArena;
