'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  trendValue?: React.ReactNode;
  trendIsPositive?: boolean | null;
  trendLabel?: string;
  delay?: number;
  icon?: React.ReactNode;
  accentColor?: string;
  goal?: number;
}

function useCountUp(target: number, durationMs = 1000, delayMs = 0) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const startTime = performance.now() + delayMs;

    const animate = (now: number) => {
      if (now < startTime) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, durationMs, delayMs]);

  return count;
}

export default function MetricCard({
  title, value, trendValue, trendIsPositive, trendLabel,
  delay = 0, icon, accentColor, goal,
}: MetricCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  const isInteger = Number.isInteger(numericValue);
  const isNumeric = !isNaN(numericValue);

  // Animate integers; show static value for floats
  const animated = useCountUp(isNumeric && isInteger ? numericValue : 0, 1000, delay);
  const displayValue = !isNumeric
    ? value
    : isInteger
      ? animated
      : numericValue.toFixed(1);

  const getTrendIcon = () => {
    if (trendIsPositive === null || trendIsPositive === undefined) return null;
    if (trendIsPositive) return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
      </svg>
    );
  };

  const getTrendClass = () => {
    if (trendIsPositive === null || trendIsPositive === undefined) return 'neutral';
    return trendIsPositive ? 'positive' : 'negative';
  };

  const delayClass = delay ? `delay-${delay}` : '';
  const goalPercent = goal && isNumeric && goal > 0
    ? Math.min(100, Math.round((numericValue / goal) * 100))
    : null;

  return (
    <div
      className={`glass-panel metric-card animate-fade-in ${delayClass}`}
      style={{ minWidth: '155px', flex: '1 1 0', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Colored top accent bar */}
      {accentColor && (
        <div className="metric-card-accent" style={{ background: accentColor }} />
      )}

      {/* Title row with icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p className="title">{title}</p>
        {icon && (
          <div style={{ color: accentColor || 'var(--text-tertiary)', opacity: 0.75, flexShrink: 0 }}>
            {icon}
          </div>
        )}
      </div>

      {/* Animated value */}
      <p className="value">{displayValue}</p>

      {/* Goal progress bar */}
      {goalPercent !== null && (
        <div style={{ marginTop: '0.375rem' }}>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${goalPercent}%`, background: accentColor || 'var(--accent-blue)' }}
            />
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>
            {goalPercent}% of {goal} goal
          </p>
        </div>
      )}

      {/* Trend */}
      {trendValue !== undefined && (
        <div className={`trend ${getTrendClass()}`} style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          {getTrendIcon()}
          <span>{trendValue}</span>
          {trendLabel && (
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 'normal', marginLeft: '4px' }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
