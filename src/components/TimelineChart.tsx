'use client';

import React, { useMemo, useState } from 'react';
import { ApplicationRow } from '@/lib/mock-data';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

type Granularity = 'daily' | 'weekly' | 'monthly';

interface TimelineChartProps {
  applications: ApplicationRow[];
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d.toISOString().split('T')[0];
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function TimelineChart({ applications }: TimelineChartProps) {
  const [granularity, setGranularity] = useState<Granularity>('daily');

  const data = useMemo(() => {
    const counts: Record<string, number> = {};

    applications.forEach(app => {
      if (!app.dateApplied) return;
      const dateStr = app.dateApplied.split('T')[0];
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      let key: string;
      if (granularity === 'daily')   key = dateStr;
      else if (granularity === 'weekly') key = getWeekStart(date);
      else key = getMonthKey(date);

      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let cumulative = 0;
    return sorted.map(({ date, count }) => {
      cumulative += count;
      let displayDate: string;
      try {
        if (granularity === 'monthly') {
          const [yr, mo] = date.split('-');
          displayDate = new Intl.DateTimeFormat('en-AU', { month: 'short', year: '2-digit' })
            .format(new Date(Number(yr), Number(mo) - 1));
        } else {
          displayDate = new Intl.DateTimeFormat('en-AU', { month: 'short', day: 'numeric' })
            .format(new Date(date));
        }
      } catch {
        displayDate = date;
      }
      return { date, displayDate, count, cumulative };
    });
  }, [applications, granularity]);

  if (data.length === 0) return null;

  return (
    <div
      className="glass-panel animate-fade-in delay-200"
      style={{ gridColumn: 'span 12', height: '400px', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Application Timeline</h2>
        <div className="chart-toggle">
          {(['daily', 'weekly', 'monthly'] as Granularity[]).map(g => (
            <button
              key={g}
              className={`chart-toggle-btn${granularity === g ? ' active' : ''}`}
              onClick={() => setGranularity(g)}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, width: '100%', minHeight: 0, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={1}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="var(--text-secondary)"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              dy={10}
            />
            <YAxis
              allowDecimals={false}
              stroke="var(--text-secondary)"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
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
            <Area
              type="monotone"
              dataKey="count"
              name="Applications"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#gradCount)"
              dot={{ fill: 'var(--bg-primary)', stroke: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#3b82f6' }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              name="Cumulative"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#gradCumulative)"
              dot={false}
              activeDot={{ r: 4, fill: '#8b5cf6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
