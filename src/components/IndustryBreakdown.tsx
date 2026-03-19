'use client';

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { ApplicationRow } from '@/lib/mock-data';

// ── Industry classifier ───────────────────────────────────────────────────────
// Checks the email domain first, then falls back to matching on company name.

const RULES: Array<{ industry: string; color: string; keywords: string[] }> = [
  {
    industry: 'Government',
    color: '#f59e0b',
    keywords: ['.gov.au', '.gov.nz', '.gov.uk', '.gov', 'parliament', 'council', 'municipality', 'vic gov', 'nsw gov', 'qld gov'],
  },
  {
    industry: 'Technology',
    color: '#3b82f6',
    keywords: [
      'google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'stripe',
      'airbnb', 'uber', 'lyft', 'databricks', 'snowflake', 'palantir', 'plaid',
      'rippling', 'notion', 'figma', 'canva', 'atlassian', 'squareup', 'block',
      'twilio', 'datadog', 'elastic', 'xero', 'airwallex', 'airtasker', 'canva',
      'envato', 'seek.com', 'afterpay', 'zip.co', 'redbubble', 'SafetyCulture',
      'safetyculture', 'buildkite', 'culture amp', 'cultureamp',
    ],
  },
  {
    industry: 'Finance & Banking',
    color: '#10b981',
    keywords: [
      'westpac', 'anz.com', 'commbank', 'cba.com', 'nab.com', 'macquarie',
      'commonwealth bank', 'ing.com', 'citibank', 'jpmorgan', 'jpmchase',
      'ubs.com', 'hsbc', 'blackrock', 'vanguard', 'fidelity', 'morningstar',
      'moneyme', 'wisr', 'prospa', 'judo', 'latitude', 'humm',
    ],
  },
  {
    industry: 'Consulting',
    color: '#8b5cf6',
    keywords: [
      'deloitte', 'kpmg', 'pwc', 'ernst', 'accenture', 'mckinsey', 'bain',
      'bcg', 'capgemini', 'ibm.com', 'infosys', 'tcs.com', 'wipro', 'cognizant',
      'thoughtworks', 'slalom',
    ],
  },
  {
    industry: 'Education',
    color: '#06b6d4',
    keywords: [
      '.edu', '.ac.uk', '.edu.au', 'university', 'college', 'unimelb', 'monash',
      'rmit', 'anu.edu', 'unsw', 'usyd', 'uq.edu', 'curtin', 'swinburne',
      'latrobe', 'deakin', 'victoria university',
    ],
  },
  {
    industry: 'Healthcare',
    color: '#ec4899',
    keywords: [
      'health', 'hospital', 'medical', 'clinic', 'pharma', 'bupa', 'medibank',
      'healthscope', 'ramsay', 'epworth', 'cabrini', 'mercy', 'nhs.', 'pfizer',
      'johnson', 'novartis', 'astrazeneca', 'csiro',
    ],
  },
  {
    industry: 'Retail & E-commerce',
    color: '#f97316',
    keywords: [
      'coles', 'woolworths', 'bunnings', 'kmart', 'target', 'myer', 'officeworks',
      'jbhifi', 'jb hi-fi', 'harvey norman', 'aldi', 'ikea', 'ebay', 'shopify',
      'bigcommerce',
    ],
  },
  {
    industry: 'Media & Telco',
    color: '#a78bfa',
    keywords: [
      'news.com', 'nine.com', 'seven', 'foxtel', 'abc.net', 'sbs.com',
      'optus', 'telstra', 'tpg', 'vodafone', 'iinet', 'aussie broadband',
      'spotify', 'tiktok', 'twitter', 'snap.com', 'linkedin',
    ],
  },
  {
    industry: 'Recruitment / Platform',
    color: '#6c7086',
    keywords: [
      'seek.', 'indeed', 'linkedin', 'workday', 'jobadder', 'greenhouse',
      'lever.co', 'smartrecruiters', 'bamboohr', 'recruiter', 'recruitment',
      'staffing', 'talent', 'hays.', 'robert half', 'manpower', 'adecco',
    ],
  },
];

export function classifyIndustry(email: string, company: string): string {
  const haystack = `${email} ${company}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some(k => haystack.includes(k))) {
      return rule.industry;
    }
  }
  return 'Other';
}

const COLOR_MAP = Object.fromEntries(RULES.map(r => [r.industry, r.color]));
COLOR_MAP['Other'] = '#64748b';

// ── Component ────────────────────────────────────────────────────────────────
export default function IndustryBreakdown({ applications }: { applications: ApplicationRow[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => {
      const industry = classifyIndustry(a.email ?? '', a.company);
      counts[industry] = (counts[industry] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);
  }, [applications]);

  if (data.length === 0) return null;

  return (
    <div
      className="glass-panel animate-fade-in delay-300"
      style={{ gridColumn: 'span 6', height: '380px', display: 'flex', flexDirection: 'column' }}
    >
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Applications by Industry</h2>
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
              dataKey="industry"
              stroke="var(--text-secondary)"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              width={140}
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
              {data.map((entry, i) => (
                <Cell key={i} fill={COLOR_MAP[entry.industry] ?? '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
