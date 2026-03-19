'use client';

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { ApplicationRow } from '@/lib/mock-data';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#d946ef', '#6c7086'];

export default function LocationBreakdown({ applications }: { applications: ApplicationRow[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => {
      const loc = (a.location || 'Unknown').trim();
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
  }, [applications]);

  if (data.length === 0) return null;

  return (
    <div
      className="glass-panel animate-fade-in delay-300"
      style={{ gridColumn: 'span 6', height: '380px', display: 'flex', flexDirection: 'column' }}
    >
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Applications by Location</h2>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              horizontal={false}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              stroke="var(--text-secondary)"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="location"
              stroke="var(--text-secondary)"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              width={110}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
              formatter={(value: number) => [value, 'Applications']}
            />
            <Bar dataKey="count" name="Applications" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
