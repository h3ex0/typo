import React from 'react';
import './ResultChart.css';

interface ResultChartProps {
  history: number[];
}

const ResultChart: React.FC<ResultChartProps> = ({ history }) => {
  if (history.length < 2) return null;

  const maxWpm = Math.max(...history, 10);
  const width = 600;
  const height = 150;
  const padding = 20;

  const points = history.map((wpm, index) => {
    const x = (index / (history.length - 1)) * (width - 2 * padding) + padding;
    const y = height - padding - (wpm / maxWpm) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="chart-container">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke="var(--main-color)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map(percent => {
          const y = padding + percent * (height - 2 * padding);
          return (
            <line 
              key={percent}
              x1={padding} 
              y1={y} 
              x2={width - padding} 
              y2={y} 
              stroke="var(--sub-alt-color)" 
              strokeWidth="1" 
            />
          );
        })}
      </svg>
      <div className="chart-labels">
        <span>0s</span>
        <span>{history.length}s</span>
      </div>
    </div>
  );
};

export default ResultChart;
