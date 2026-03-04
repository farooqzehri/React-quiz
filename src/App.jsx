import axios from 'axios'
import React, { useEffect, useRef, useState, useMemo } from 'react'

function shuffleOnce(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function App() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)
  const [index, setIndex]         = useState(0)
  const [result, setResult]       = useState(false)
  const [marks, setMarks]         = useState(0)
  const [selected, setSelected]   = useState(null)
  const [answered, setAnswered]   = useState(false)
  const [correct, setCorrect]     = useState(null)

  useEffect(() => {
    axios('https://the-trivia-api.com/v2/questions')
      .then(res => setQuestions(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [])

  // Shuffle options once per question — not on every render
  const shuffledOptions = useMemo(() => {
    if (!questions[index]) return []
    return shuffleOnce([
      ...questions[index].incorrectAnswers,
      questions[index].correctAnswer
    ])
  }, [questions, index])

  const handleSelect = (val) => {
    if (answered) return
    setSelected(val)
  }

  const nextQuestion = () => {
    if (!selected) {
      // shake the button — handled via CSS class toggle if desired
      return alert('Please select an option first.')
    }
    const isCorrect = selected === questions[index].correctAnswer
    setCorrect(isCorrect)
    setAnswered(true)
    if (isCorrect) setMarks(m => m + 10)

    setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex(i => i + 1)
        setSelected(null)
        setAnswered(false)
        setCorrect(null)
      } else {
        setResult(true)
      }
    }, 900)
  }

  const restart = () => {
    setLoading(true)
    setQuestions([])
    setIndex(0)
    setMarks(0)
    setResult(false)
    setSelected(null)
    setAnswered(false)
    setCorrect(null)
    axios('https://the-trivia-api.com/v2/questions')
      .then(res => setQuestions(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }

  const progress = questions.length ? ((index) / questions.length) * 100 : 0
  const percentage = questions.length ? Math.round((marks / (questions.length * 10)) * 100) : 0

  const getGrade = () => {
    if (percentage >= 90) return { label: 'Outstanding!', color: '#00f5a0' }
    if (percentage >= 70) return { label: 'Great Job!', color: '#00d9f5' }
    if (percentage >= 50) return { label: 'Not Bad!', color: '#f5a623' }
    return { label: 'Keep Practicing', color: '#f55252' }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #0a0a0f;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Animated background */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99,60,255,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(0,200,255,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,60,130,0.07) 0%, transparent 70%);
          z-index: 0;
          animation: bgPulse 8s ease-in-out infinite alternate;
        }

        @keyframes bgPulse {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0.7; transform: scale(1.08); }
        }

        /* Floating orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          animation: orbFloat 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .orb-1 { width: 400px; height: 400px; background: rgba(99,60,255,0.12); top: -100px; left: -100px; }
        .orb-2 { width: 350px; height: 350px; background: rgba(0,210,255,0.10); bottom: -80px; right: -80px; animation-delay: -4s; }
        .orb-3 { width: 250px; height: 250px; background: rgba(255,60,130,0.08); top: 40%; left: 60%; animation-delay: -8s; }

        @keyframes orbFloat {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 40px) scale(1.1); }
        }

        /* Card */
        .card {
          position: relative;
          z-index: 10;
          width: min(520px, 95vw);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 28px;
          padding: 36px 36px 32px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 32px 80px rgba(0,0,0,0.5),
            0 0 60px rgba(99,60,255,0.08);
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Header row */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 5px 12px;
          border-radius: 100px;
        }

        .score-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #a78bfa;
          background: rgba(167,139,250,0.10);
          border: 1px solid rgba(167,139,250,0.20);
          padding: 5px 14px;
          border-radius: 100px;
        }

        .score-pill span { color: rgba(255,255,255,0.5); font-weight: 400; }

        /* Progress bar */
        .progress-wrap {
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 28px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, #7c3aed, #06b6d4);
          transition: width 0.6s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 0 12px rgba(124,58,237,0.6);
        }

        /* Category tag */
        .category {
          font-size: 11px;
          font-weight: 600;
          color: #06b6d4;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
        }

        /* Question */
        .question-text {
          font-size: 18px;
          font-weight: 700;
          color: rgba(255,255,255,0.92);
          line-height: 1.55;
          margin-bottom: 28px;
          min-height: 56px;
        }

        /* Options */
        .options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }

        .option {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .option:hover:not(.disabled) {
          border-color: rgba(167,139,250,0.4);
          background: rgba(167,139,250,0.06);
          transform: translateX(3px);
        }

        .option.selected {
          border-color: rgba(167,139,250,0.7);
          background: rgba(167,139,250,0.10);
        }

        .option.correct {
          border-color: #00f5a0 !important;
          background: rgba(0,245,160,0.08) !important;
        }

        .option.wrong {
          border-color: #f55252 !important;
          background: rgba(245,82,82,0.08) !important;
        }

        .option.disabled { cursor: not-allowed; pointer-events: none; }

        /* Radio indicator */
        .radio-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .option.selected .radio-dot,
        .option.correct .radio-dot,
        .option.wrong .radio-dot {
          border-color: currentColor;
        }

        .radio-inner {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #a78bfa;
          transform: scale(0);
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }

        .option.selected .radio-inner { transform: scale(1); background: #a78bfa; }
        .option.correct .radio-inner { transform: scale(1); background: #00f5a0; }
        .option.wrong .radio-inner { transform: scale(1); background: #f55252; }

        .option-label {
          font-size: 14.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.80);
          line-height: 1.4;
          flex: 1;
        }

        .option-icon {
          font-size: 16px;
          margin-left: auto;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .option.correct .option-icon,
        .option.wrong   .option-icon { opacity: 1; }

        /* Next button */
        .btn-next {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          color: #fff;
          box-shadow: 0 8px 32px rgba(124,58,237,0.35);
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
        }

        .btn-next:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,0.5); }
        .btn-next:active { transform: translateY(0); }
        .btn-next:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* --- Loading --- */
        .loading-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px 0;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.08);
          border-top-color: #7c3aed;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-text {
          font-size: 15px;
          color: rgba(255,255,255,0.4);
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        /* --- Error --- */
        .error-wrap { text-align: center; padding: 16px 0; }
        .error-emoji { font-size: 40px; margin-bottom: 12px; }
        .error-title { font-size: 18px; font-weight: 700; color: #f55252; margin-bottom: 8px; }
        .error-sub { font-size: 13px; color: rgba(255,255,255,0.35); }

        /* --- Result --- */
        .result-wrap { text-align: center; padding: 10px 0; }

        .result-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          margin: 0 auto 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 3px solid;
          position: relative;
          animation: pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .result-pct {
          font-size: 30px;
          font-weight: 800;
          line-height: 1;
        }

        .result-pct-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); margin-top: 2px; }

        .result-grade {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 6px;
        }

        .result-score-line {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 28px;
        }

        .result-score-line strong { color: rgba(255,255,255,0.75); }

        .btn-restart {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.12);
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.85);
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
        }

        .btn-restart:hover {
          background: rgba(255,255,255,0.10);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        /* Divider */
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 20px 0;
        }

        /* Stats row */
        .stats-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .stat-box {
          flex: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 14px;
          text-align: center;
        }

        .stat-val { font-size: 22px; font-weight: 800; color: #fff; line-height: 1; margin-bottom: 4px; }
        .stat-key { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; }

        /* Feedback toast */
        .feedback {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 13px;
          font-weight: 600;
          animation: fadeSlide 0.3s ease both;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .feedback.correct { background: rgba(0,245,160,0.08); color: #00f5a0; border: 1px solid rgba(0,245,160,0.2); }
        .feedback.wrong   { background: rgba(245,82,82,0.08);  color: #f57070; border: 1px solid rgba(245,82,82,0.2); }
      `}</style>

      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="card">

        {/* LOADING */}
        {loading && (
          <div className="loading-wrap">
            <div className="spinner" />
            <p className="loading-text">Fetching questions…</p>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="error-wrap">
            <div className="error-emoji">⚠️</div>
            <div className="error-title">Oops! Something went wrong.</div>
            <div className="error-sub">Couldn't load questions. Check your connection.</div>
          </div>
        )}

        {/* RESULT */}
        {result && (() => {
          const grade = getGrade()
          return (
            <div className="result-wrap">
              <div className="result-circle" style={{ borderColor: grade.color, boxShadow: `0 0 40px ${grade.color}33` }}>
                <div className="result-pct" style={{ color: grade.color }}>{percentage}%</div>
                <div className="result-pct-label">SCORE</div>
              </div>
              <div className="result-grade">{grade.label}</div>
              <div className="result-score-line">You scored <strong>{marks} pts</strong> out of <strong>{questions.length * 10} pts</strong></div>

              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-val" style={{ color: '#00f5a0' }}>{marks / 10}</div>
                  <div className="stat-key">Correct</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val" style={{ color: '#f55252' }}>{questions.length - marks / 10}</div>
                  <div className="stat-key">Wrong</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val">{questions.length}</div>
                  <div className="stat-key">Total</div>
                </div>
              </div>

              <div className="divider" />
              <button className="btn-restart" onClick={restart}>↺ &nbsp;Play Again</button>
            </div>
          )
        })()}

        {/* QUIZ */}
        {questions.length > 0 && !result && !loading && (
          <>
            <div className="header">
              <span className="badge">Question {index + 1} / {questions.length}</span>
              <span className="score-pill">⚡ {marks} <span>pts</span></span>
            </div>

            <div className="progress-wrap">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {questions[index].category && (
              <div className="category">{questions[index].category}</div>
            )}

            <div className="question-text">{questions[index].question.text}</div>

            {/* Feedback toast */}
            {answered && (
              <div className={`feedback ${correct ? 'correct' : 'wrong'}`}>
                {correct ? '✓ Correct! Well done.' : `✗ Incorrect — "${questions[index].correctAnswer}"`}
              </div>
            )}

            <div className="options">
              {shuffledOptions.map((item, i) => {
                let cls = 'option'
                if (answered) {
                  cls += ' disabled'
                  if (item === questions[index].correctAnswer) cls += ' correct'
                  else if (item === selected) cls += ' wrong'
                } else if (item === selected) {
                  cls += ' selected'
                }
                return (
                  <div key={i} className={cls} onClick={() => handleSelect(item)}>
                    <div className="radio-dot" style={
                      answered && item === questions[index].correctAnswer ? { borderColor: '#00f5a0', color: '#00f5a0' } :
                      answered && item === selected ? { borderColor: '#f55252', color: '#f55252' } :
                      item === selected ? { borderColor: '#a78bfa' } : {}
                    }>
                      <div className="radio-inner" />
                    </div>
                    <span className="option-label">{item}</span>
                    <span className="option-icon">
                      {answered && item === questions[index].correctAnswer ? '✓' :
                       answered && item === selected && item !== questions[index].correctAnswer ? '✗' : ''}
                    </span>
                  </div>
                )
              })}
            </div>

            <button className="btn-next" onClick={nextQuestion} disabled={answered}>
              {index === questions.length - 1 ? 'Finish Quiz →' : 'Next Question →'}
            </button>
          </>
        )}

      </div>
    </>
  )
}

export default App