import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TypingArea.css';

interface TypingAreaProps {
  targetText: string;
  onFinished: (stats: any) => void;
  status: string;
  input: string;
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reset: () => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({ 
  targetText, 
  status, 
  input, 
  handleInput,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status !== 'finished') {
      inputRef.current?.focus();
    }
  }, [status]);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const renderCharacters = () => {
    return targetText.split('').map((char, index) => {
      let className = 'char';
      const isTyped = index < input.length;
      const isCurrent = index === input.length;
      const isCorrect = isTyped && input[index] === char;
      const isIncorrect = isTyped && input[index] !== char;

      if (isCorrect) className += ' correct';
      if (isIncorrect) className += ' incorrect';
      if (isCurrent) className += ' current';

      return (
        <span key={index} className={className}>
          {char}
          {isCurrent && status !== 'finished' && (
            <motion.div
              className="caret"
              layoutId="caret"
              initial={false}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
          )}
        </span>
      );
    });
  };

  return (
    <div className={`typing-area-container ${status}`} onClick={handleClick}>
      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        value={input}
        onChange={handleInput}
        autoFocus
        spellCheck={false}
        autoComplete="off"
      />
      <div className="words-wrapper">
        {renderCharacters()}
      </div>
      
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="focus-notice"
          >
            Click here or press any key to start
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TypingArea;
