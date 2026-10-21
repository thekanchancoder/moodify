import React, { useState, useMemo } from 'react';
import '../styles/Home.scss';

// SVG canvas dimensions
const SVG_WIDTH = 460;
const SVG_HEIGHT = 75;
const START_X = 20;
const END_X = 440;

const MOOD_Y = {
  happy: 16,
  surprised: 32,
  sad: 48,
};

const MOOD_COLORS = {
  happy: '#FACC15',     // Yellow
  surprised: '#A855F7', // Purple
  sad: '#06B6D4',       // Cyan
};

const MOOD_EMOJIS = {
  happy: '😊',
  surprised: '😲',
  sad: '😢',
};

/**
 * Generate smooth cubic Bezier curve through given points
 */
function generateBezierCurve(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function MoodHistoryCard({ history = [] }) {
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'week'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Filter points based on selected view mode
  const displayedPoints = useMemo(() => {
    const now = new Date();
    const todayDateStr = now.toDateString();

    if (viewMode === 'today') {
      const todayList = history.filter(
        item => new Date(item.timestamp).toDateString() === todayDateStr
      );
      // If fewer than 2 items today, take last up to 8 records so graph renders smoothly
      if (todayList.length >= 2) {
        return todayList.slice(-8);
      }
      return history.slice(-8);
    } else {
      // 7 Days view: pick representative point per day or up to 8 recent points across 7 days
      return history.slice(-8);
    }
  }, [history, viewMode]);

  // Compute SVG coordinates for each point
  const chartPoints = useMemo(() => {
    const count = displayedPoints.length;
    if (count === 0) return [];

    return displayedPoints.map((item, idx) => {
      const x = count === 1 
        ? SVG_WIDTH / 2 
        : START_X + (idx / (count - 1)) * (END_X - START_X);
      const moodKey = (item.mood || 'happy').toLowerCase();
      const y = MOOD_Y[moodKey] || 32;
      const color = MOOD_COLORS[moodKey] || '#A855F7';

      return {
        ...item,
        x: Math.round(x),
        y: Math.round(y),
        color,
        moodKey,
      };
    });
  }, [displayedPoints]);

  const curvePath = useMemo(() => generateBezierCurve(chartPoints), [chartPoints]);

  const areaPath = useMemo(() => {
    if (chartPoints.length < 2) return '';
    const firstX = chartPoints[0].x;
    const lastX = chartPoints[chartPoints.length - 1].x;
    return `${curvePath} L ${lastX} 70 L ${firstX} 70 Z`;
  }, [chartPoints, curvePath]);

  // Format label for X-axis timestamps
  const formatTimeLabel = (timestamp) => {
    const d = new Date(timestamp);
    if (viewMode === 'today') {
      let hours = d.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutes = d.getMinutes();
      return minutes === 0 ? `${hours} ${ampm}` : `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
    } else {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `${days[d.getDay()]} ${d.getDate()}`;
    }
  };

  const formatTooltipTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
      ' • ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="history-card">
      <div className="history-header-row">
        <div className="card-top-header" style={{ marginBottom: 0 }}>
          <div className="icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <h3 className="card-title-text">
            {viewMode === 'today' ? "Today's Mood History" : "7-Day Mood History"}
          </h3>
        </div>

        {/* View toggle (Today vs 7 Days) + Legend */}
        <div className="history-header-right">
          <div className="history-toggle-pill">
            <button
              className={`toggle-btn ${viewMode === 'today' ? 'active' : ''}`}
              onClick={() => setViewMode('today')}
              type="button"
            >
              Today
            </button>
            <button
              className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
              type="button"
            >
              7 Days
            </button>
          </div>

          <div className="history-legend">
            <div className="legend-item">
              <span className="dot yellow" /> Happy
            </div>
            <div className="legend-item">
              <span className="dot purple" /> Surprised
            </div>
            <div className="legend-item">
              <span className="dot cyan" /> Sad
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Dynamic SVG Spline Line Graph */}
      <div className="chart-container" onMouseLeave={() => setHoveredPoint(null)}>
        {hoveredPoint && (
          <div 
            className="chart-tooltip-bubble"
            style={{ 
              left: `${(hoveredPoint.x / SVG_WIDTH) * 100}%`,
              top: `${hoveredPoint.y - 12}px`
            }}
          >
            <div className="tooltip-mood" style={{ color: hoveredPoint.color }}>
              <span>{MOOD_EMOJIS[hoveredPoint.moodKey] || '✨'}</span>
              <strong style={{ textTransform: 'capitalize' }}>{hoveredPoint.moodKey}</strong>
            </div>
            <div className="tooltip-time">{formatTooltipTime(hoveredPoint.timestamp)}</div>
          </div>
        )}

        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="historyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Subtle Horizontal Grid lines */}
          <line x1="10" y1="16" x2="450" y2="16" className="chart-grid-line" />
          <line x1="10" y1="32" x2="450" y2="32" className="chart-grid-line" />
          <line x1="10" y1="48" x2="450" y2="48" className="chart-grid-line" />

          {/* Gradient area underneath curve */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#historyGradient)"
              className="chart-area-fill"
            />
          )}

          {/* Smooth spline curve line */}
          {curvePath && (
            <path
              d={curvePath}
              className="chart-curve"
            />
          )}

          {/* Dynamic Node Circles */}
          {chartPoints.map((pt, idx) => (
            <circle
              key={pt.id || idx}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill={pt.color}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="chart-node"
              onMouseEnter={() => setHoveredPoint(pt)}
            />
          ))}
        </svg>

        {/* Dynamic Timestamps along X axis */}
        <div className="chart-timestamps">
          {chartPoints.map((pt, idx) => (
            <span key={pt.id || idx} title={formatTooltipTime(pt.timestamp)}>
              {formatTimeLabel(pt.timestamp)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
