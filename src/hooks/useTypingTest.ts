import { useState, useEffect, useCallback, useRef } from 'react';

export type TestStatus = 'idle' | 'typing' | 'finished';

interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
  history: number[];
}

export const useTypingTest = (targetText: string) => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<TestStatus>('idle');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    timeElapsed: 0,
    history: [],
  });

  const timerRef = useRef<any>(null);

  const calculateStats = useCallback((currentInput: string, duration: number, prevHistory: number[]): TypingStats => {
    let correctChars = 0;
    let incorrectChars = 0;

    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] === targetText[i]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }

    const totalChars = currentInput.length;
    const timeInMinutes = duration / 60000;
    const wpm = timeInMinutes > 0 ? Math.round((correctChars / 5) / timeInMinutes) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    const newHistory = [...prevHistory];
    const secondsElapsed = Math.floor(duration / 1000);
    if (secondsElapsed > newHistory.length && status === 'typing') {
      newHistory.push(wpm);
    }

    return {
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      timeElapsed: secondsElapsed,
      history: newHistory,
    };
  }, [targetText, status]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const value = typeof e === 'string' ? e : e.target.value;
    
    if (status === 'finished') return;

    if (status === 'idle' && value.length > 0) {
      setStatus('typing');
      setStartTime(Date.now());
    }

    setInput(value);

    if (value.length >= targetText.length) {
      setStatus('finished');
      setEndTime(Date.now());
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (status === 'typing' && startTime) {
      timerRef.current = setInterval(() => {
        const duration = Date.now() - startTime;
        setStats(prev => calculateStats(input, duration, prev.history));
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, startTime, input, calculateStats]);

  useEffect(() => {
    if (status === 'finished' && startTime && endTime) {
      setStats(prev => calculateStats(input, endTime - startTime, prev.history));
    }
  }, [status, startTime, endTime, input, calculateStats]);

  const reset = useCallback(() => {
    setInput('');
    setStatus('idle');
    setStartTime(null);
    setEndTime(null);
    setStats({
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0,
      timeElapsed: 0,
      history: [],
    });
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return {
    input,
    status,
    stats,
    handleInput,
    reset,
  };
};
