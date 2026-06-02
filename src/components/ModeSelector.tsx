import React from 'react';
import { Timer, Type, Globe, Volume2, VolumeX } from 'lucide-react';
import type { Language } from '../utils/wordGenerator';
import './ModeSelector.css';

export type TestMode = 'words' | 'time' | 'custom';

interface ModeSelectorProps {
  mode: TestMode;
  setMode: (mode: TestMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  status: string;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ 
  mode, setMode, language, setLanguage, soundEnabled, setSoundEnabled, status 
}) => {
  if (status !== 'idle') return null;

  const languages: Language[] = ['english', 'spanish', 'french', 'programming'];

  return (
    <div className="mode-selector-container">
      <div className="mode-selector">
        <button className={mode === 'time' ? 'active' : ''} onClick={() => setMode('time')}>
          <Timer size={16} />
          <span>time</span>
        </button>
        <button className={mode === 'words' ? 'active' : ''} onClick={() => setMode('words')}>
          <Type size={16} />
          <span>words</span>
        </button>
        <button className={mode === 'custom' ? 'active' : ''} onClick={() => setMode('custom')}>
          <span>custom</span>
        </button>
        
        <div className="mode-divider" />
        
        <div className="language-selector">
          <Globe size={16} />
          {languages.map(lang => (
            <button 
              key={lang} 
              className={`option ${language === lang ? 'active' : ''}`}
              onClick={() => setLanguage(lang)}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="mode-divider" />

        <button className="sound-toggle" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
