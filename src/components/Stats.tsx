import React from 'react';
import { motion } from 'framer-motion';
import './Stats.css';

interface StatsProps {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  status: string;
}

const Stats: React.FC<StatsProps> = ({ wpm, accuracy, timeElapsed, status }) => {
  return (
    <div className={`stats-container ${status}`}>
      <div className="stat-item">
        <span className="stat-label">wpm</span>
        <motion.span 
          key={wpm}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="stat-value"
        >
          {wpm}
        </motion.span>
      </div>
      <div className="stat-item">
        <span className="stat-label">acc</span>
        <motion.span 
          key={accuracy}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="stat-value"
        >
          {accuracy}%
        </motion.span>
      </div>
      <div className="stat-item">
        <span className="stat-label">time</span>
        <span className="stat-value">{timeElapsed}s</span>
      </div>
    </div>
  );
};

export default Stats;
