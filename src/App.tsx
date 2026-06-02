import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import TypingArea from './components/TypingArea';
import Stats from './components/Stats';
import ModeSelector from './components/ModeSelector';
import type { TestMode } from './components/ModeSelector';
import ResultChart from './components/ResultChart';
import VirtualKeyboard from './components/VirtualKeyboard';
import { useTypingTest } from './hooks/useTypingTest';
import { generateWords } from './utils/wordGenerator';
import type { Language } from './utils/wordGenerator';
import { soundService } from './utils/soundService';
import './App.css';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const [mode, setMode] = useState<TestMode>('words');
  const [language, setLanguage] = useState<Language>('english');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('sound') === 'true');
  const [personalBest, setPersonalBest] = useState<number>(() => Number(localStorage.getItem('pb')) || 0);
  
  const [targetText, setTargetText] = useState(() => generateWords(25, language));
  const [customText, setCustomText] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  const { input, status, stats, handleInput, reset } = useTypingTest(targetText);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleRestart = useCallback(() => {
    if (mode === 'custom' && customText) {
      setTargetText(customText);
    } else {
      const wordCount = mode === 'words' ? 25 : 50;
      setTargetText(generateWords(wordCount, language));
    }
    reset();
  }, [reset, mode, language, customText]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    soundService.setEnabled(soundEnabled);
    localStorage.setItem('sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    if (status === 'typing') {
      soundService.playClick();
    }
  }, [input, status]);

  useEffect(() => {
    if (status === 'finished' && stats.wpm > personalBest) {
      setPersonalBest(stats.wpm);
      localStorage.setItem('pb', String(stats.wpm));
    }
  }, [status, stats.wpm, personalBest]);

  useEffect(() => {
    if (mode === 'custom') {
      setShowCustomModal(true);
    } else {
      handleRestart();
    }
  }, [mode, language]);

  // Global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.shiftKey) handleRestart();
      if (e.key === 'Tab') e.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRestart]);

  return (
    <div className={`container ${status}`}>
      <div className="ui-frame top">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <div className="top-stats">
          <div className="pb-display">
            <span className="pb-label">personal best:</span>
            <span className="pb-value">{personalBest} wpm</span>
          </div>
          <ModeSelector 
            mode={mode} setMode={setMode} 
            language={language} setLanguage={setLanguage}
            soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled}
            status={status}
          />
        </div>
      </div>
      
      <main className="main-content">
        {status !== 'finished' && (
          <Stats 
            wpm={stats.wpm} 
            accuracy={stats.accuracy} 
            timeElapsed={stats.timeElapsed}
            status={status}
          />
        )}
        
        <div className="test-box">
          <TypingArea 
            targetText={targetText}
            status={status}
            input={input}
            handleInput={handleInput}
            onFinished={() => {}}
            reset={handleRestart}
          />
        </div>

        {status === 'finished' && (
          <div className="results-view">
            <div className="results-grid">
              <Stats wpm={stats.wpm} accuracy={stats.accuracy} timeElapsed={stats.timeElapsed} status={status} />
              <div className="result-detail">
                <span className="detail-label">characters</span>
                <span className="detail-value">{stats.correctChars}/{stats.incorrectChars}/{stats.totalChars}</span>
              </div>
            </div>
            <ResultChart history={stats.history} />
            <div className="result-actions">
              <button className="restart-btn active" onClick={handleRestart}>Try Again</button>
            </div>
          </div>
        )}

        {status !== 'finished' && <VirtualKeyboard />}
      </main>

      {showCustomModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Custom Paragraph</h3>
            <textarea 
              value={customText} 
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste your text here..."
            />
            <div className="modal-actions">
              <button onClick={() => {
                if (customText) {
                  setTargetText(customText);
                  reset();
                }
                setShowCustomModal(false);
              }}>Start</button>
              <button onClick={() => {
                setMode('words');
                setShowCustomModal(false);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="ui-frame bottom">
        <Footer />
      </div>
    </div>
  );
}

export default App;
