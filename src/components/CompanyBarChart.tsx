'use client';

import React, { useMemo, useState } from 'react';
import { ApplicationRow } from '@/lib/mock-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const TOP_N = 15;

interface CompanyBarChartProps {
  applications: ApplicationRow[];
}

export default function CompanyBarChart({ applications }: CompanyBarChartProps) {
  const [showAll, setShowAll] = useState(false);

  const allData = useMemo(() => {
    const map: Record<string, { total: number; applied: number; interviewing: number; rejected: number }> = {};

    applications.forEach(app => {
      const company = app.company || 'Unknown';
      if (!map[company]) map[company] = { total: 0, applied: 0, interviewing: 0, rejected: 0 };
      map[company].total += 1;
      const s = app.status.toLowerCase();

      if (s.includes('interview') || s.includes('offer')) {
        map[company].interviewing += 1;
      } else if (s.includes('reject') || s.includes('unsuccessful') || s.includes('ghost')) {
        map[company].rejected += 1;
      } else {
        map[company].applied += 1;
      }
    });

    return Object.entries(map)
      .map(([company, counts]) => ({ company, ...counts }))
      .sort((a, b) => b.total - a.total);
  }, [applications]);

  const data = showAll ? allData : allData.slice(0, TOP_N);
  const hasMore = allData.length > TOP_N;

  if (allData.length === 0) return null;

  return (
    <div
      className="glass-panel animate-fade-in delay-300"
      style={{ gridColumn: 'span 12', height: '400px', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Applications by Organization</h2>
        {hasMore && (
          <button
            className="icon-btn"
            onClick={() => setShowAll(s => !s)}
          >
            {showAll ? `Top ${TOP_N} only` : `Show all (${allData.length})`}
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: showAll ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      <div style={{ flex: 1, width: '100%', minHeight: 0, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={1}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="company"
              stroke="var(--text-secondary)"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-40}
              textAnchor="end"
              height={60}
            />
            <YAxis
              allowDecimals={false}
              stroke="var(--text-secondary)"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
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
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(val) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{val}</span>
              )}
            />
            <Bar dataKey="applied"      name="Applied"      stackId="a" fill="#3b82f6" />
            <Bar dataKey="interviewing" name="Interviewing"  stackId="a" fill="#f59e0b" />
            <Bar dataKey="rejected"     name="Unsuccessful"      stackId="a" fill="#f43f5e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
