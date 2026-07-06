import axios from 'axios';
import Question from '../models/Question.js';

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const LANG_VERSIONS = {
  python: '3.10.0',
  java: '15.0.2',
  cpp: '10.2.0',
  cplusplus: '10.2.0',
  'c++': '10.2.0'
};

export const executeCode = async (req, res) => {
  try {
    const { language, sourceCode, stdin } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({ message: "language and sourceCode are required." });
    }

    const normalizedLang = language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase();
    const version = LANG_VERSIONS[normalizedLang] || '*';

    const payload = {
      language: normalizedLang,
      version: version,
      files: [
        {
          name: normalizedLang === 'java' ? 'Main.java' : normalizedLang === 'cpp' ? 'main.cpp' : 'main.py',
          content: sourceCode
        }
      ],
      stdin: stdin || ''
    };

    const response = await axios.post(PISTON_URL, payload);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Compilation execution error:", error.message);
    res.status(500).json({ message: "Code compilation engine failed or timed out: " + error.message });
  }
};

export const testCode = async (req, res) => {
  try {
    const { questionId, language, sourceCode, type } = req.body; // type: 'public' or 'all'

    if (!questionId || !language || !sourceCode) {
      return res.status(400).json({ message: "questionId, language and sourceCode are required." });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Filter test cases based on type (public vs all)
    const testCases = question.testCases.filter(tc => type === 'all' ? true : tc.isPublic);

    if (testCases.length === 0) {
      return res.status(200).json({ passed: 0, total: 0, score: 0, results: [] });
    }

    const normalizedLang = language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase();
    const version = LANG_VERSIONS[normalizedLang] || '*';

    const results = [];
    let passedCount = 0;

    for (const tc of testCases) {
      const payload = {
        language: normalizedLang,
        version: version,
        files: [
          {
            name: normalizedLang === 'java' ? 'Main.java' : normalizedLang === 'cpp' ? 'main.cpp' : 'main.py',
            content: sourceCode
          }
        ],
        stdin: tc.input || ''
      };

      try {
        const response = await axios.post(PISTON_URL, payload);
        const stdout = response.data.run.stdout ? response.data.run.stdout.trim() : '';
        const stderr = response.data.run.stderr ? response.data.run.stderr.trim() : '';
        const expected = tc.output ? tc.output.trim() : '';
        
        const isMatched = stdout === expected && response.data.run.code === 0 && !stderr;
        if (isMatched) {
          passedCount += 1;
        }

        results.push({
          input: tc.input,
          expectedOutput: tc.output,
          actualOutput: stdout,
          error: stderr || null,
          passed: isMatched
        });
      } catch (err) {
        results.push({
          input: tc.input,
          expectedOutput: tc.output,
          actualOutput: '',
          error: "Timeout or server execution error",
          passed: false
        });
      }
    }

    const total = testCases.length;
    const score = total > 0 ? Math.round((passedCount / total) * (question.marks || 1)) : 0;

    res.status(200).json({
      passed: passedCount,
      total,
      score,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
