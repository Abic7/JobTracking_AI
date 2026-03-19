'use client';

import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ApplicationRow } from '@/lib/mock-data';

interface StatusDonutProps {
  applications: ApplicationRow[];
}

// Use literal hex values — CSS variables don't resolve inside SVG fill attributes
const STATUS_CONFIG = [
  {
    label: 'Applied',
    color: '#3b82f6',
    match: (s: string) =>
      !s.includes('interview') && !s.includes('offer') &&
      !s.includes('reject') && !s.includes('unsuccessful') &&
      !s.includes('ghost') && !s.includes('oa') && !s.includes('technical'),
  },
  {
    label: 'OA / Technical',
    color: '#8b5cf6',
    match: (s: string) => s.includes('oa') || s.includes('technical'),
  },
  {
    label: 'Interviewing',
    color: '#f59e0b',
    match: (s: string) => s.includes('interview'),
  },
  {
    label: 'Offer',
    color: '#10b981',
    match: (s: string) => s.includes('offer'),
  },
  {
    label: 'Rejected',
    color: '#f43f5e',
    match: (s: string) => s.includes('reject') || s.includes('unsuccessful'),
  },
  {
    label: 'Ghosted',
    color: '#6c7086',
    match: (s: string) => s.includes('ghost'),
  },
];

const RADIAN = Math.PI / 180;

function renderLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function StatusDonut({ applications }: StatusDonutProps) {
  const data = useMemo(() =>
    STATUS_CONFIG
      .map(cfg => ({
        name: cfg.label,
        value: applications.filter(a => cfg.match(a.status.toLowerCase())).length,
        color: cfg.color,
      }))
      .filter(d => d.value > 0),
    [applications]
  );

  if (data.length === 0) return null;

  return (
    <div
      className="glass-panel animate-fade-in delay-300"
      style={{ gridColumn: 'span 6', height: '380px', display: 'flex', flexDirection: 'column' }}
    >
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Status Breakdown</h2>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="42%"
              outerRadius="68%"
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={renderLabel as any}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
