'use client';

import React, { useState, useMemo } from 'react';
import { ApplicationRow } from '@/lib/mock-data';

type SortKey = 'company' | 'role' | 'dateApplied' | 'location' | 'status' | 'age';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS = ['All', 'Applied', 'Interviewing', 'OA/Technical', 'Offer', 'Rejected', 'Ghosted'];
const PAGE_SIZE = 20;

function getDaysAgo(dateStr: string): number | null {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  try {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  } catch {
    return dateStr;
  }
}

function getStatusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('interview')) return 'status-badge interviewing';
  if (s.includes('offer'))     return 'status-badge offer';
  if (s.includes('reject') || s.includes('unsuccessful')) return 'status-badge rejected';
  if (s.includes('ghost'))     return 'status-badge ghosted';
  if (s.includes('oa') || s.includes('technical')) return 'status-badge oa';
  return 'status-badge applied';
}

function exportToCSV(apps: ApplicationRow[]) {
  const headers = ['Company', 'Role', 'Date Applied', 'Location', 'Status', 'Link', 'Notes'];
  const rows = apps.map(a =>
    [a.company, a.role, a.dateApplied, a.location, a.status, a.link, a.notes]
      .map(v => `"${(v || '').replace(/"/g, '""')}"`)
  );
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <span style={{ opacity: 0.25 }}>↕</span>;
  return <span style={{ color: 'var(--accent-purple)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

export default function RecentApplicationsTable({ applications }: { applications: ApplicationRow[] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('All');
  const [sortKey, setSortKey]       = useState<SortKey>('dateApplied');
  const [sortDir, setSortDir]       = useState<SortDir>('desc');
  const [page, setPage]             = useState(1);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    let result = [...applications];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(a =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.location || '').toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      const f = statusFilter.toLowerCase();
      result = result.filter(a => a.status.toLowerCase().includes(f));
    }

    result.sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';
      if (sortKey === 'age') {
        va = getDaysAgo(a.dateApplied) ?? 9999;
        vb = getDaysAgo(b.dateApplied) ?? 9999;
      } else if (sortKey === 'dateApplied') {
        va = new Date(a.dateApplied).getTime();
        vb = new Date(b.dateApplied).getTime();
      } else {
        va = (a[sortKey] || '').toLowerCase();
        vb = (b[sortKey] || '').toLowerCase();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, search, statusFilter, sortKey, sortDir]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore   = page * PAGE_SIZE < filtered.length;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const toggleNote = (index: number) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const ColHeader = ({ col, label }: { col: SortKey; label: string }) => (
    <th>
      <button className="sort-btn" onClick={() => handleSort(col)}>
        {label} <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </button>
    </th>
  );

  return (
    <div className="glass-panel animate-fade-in delay-400" style={{ gridColumn: 'span 12' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>All Applications</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: '3px' }}>
            {filtered.length !== applications.length
              ? `${filtered.length} of ${applications.length} shown`
              : `${applications.length} total`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="export-btn" onClick={() => exportToCSV(filtered)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            className="icon-btn"
            onClick={() => setIsExpanded(e => !e)}
          >
            {isExpanded ? 'Hide' : 'Show'}
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: isExpanded ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Filter bar */}
          <div className="filter-bar">
            <input
              className="filter-input"
              type="text"
              placeholder="Search company, role, location…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {(search || statusFilter !== 'All') && (
              <button
                className="icon-btn"
                onClick={() => { setSearch(''); setStatus('All'); setPage(1); }}
                style={{ whiteSpace: 'nowrap' }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <ColHeader col="company"     label="Company" />
                  <ColHeader col="role"        label="Role" />
                  <ColHeader col="dateApplied" label="Date Applied" />
                  <ColHeader col="age"         label="Age" />
                  <ColHeader col="location"    label="Location" />
                  <ColHeader col="status"      label="Status" />
                  <th style={{ textAlign: 'right' }}>Link</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((app, index) => {
                  const daysAgo   = getDaysAgo(app.dateApplied);
                  const hasNotes  = !!(app.notes && app.notes.trim());
                  const noteOpen  = expandedNotes.has(index);

                  return (
                    <React.Fragment key={`${app.company}-${app.dateApplied}-${index}`}>
                      <tr
                        onClick={() => hasNotes && toggleNote(index)}
                        style={{ cursor: hasNotes ? 'pointer' : 'default' }}
                        title={hasNotes ? 'Click to expand notes' : undefined}
                      >
                        <td style={{ fontWeight: 500 }}>
                          {app.company}
                          {hasNotes && (
                            <span
                              style={{ marginLeft: '6px', fontSize: '0.65rem', color: 'var(--accent-purple)', verticalAlign: 'middle', opacity: 0.8 }}
                              title="Has notes"
                            >
                              ●
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{app.role}</td>
                        <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {formatDate(app.dateApplied)}
                        </td>
                        <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {daysAgo !== null ? `${daysAgo}d ago` : '—'}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{app.location || '—'}</td>
                        <td>
                          <span className={getStatusBadgeClass(app.status)}>{app.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {app.link ? (
                            <a
                              href={app.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={e => e.stopPropagation()}
                            >
                              View
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="7" y1="17" x2="17" y2="7" />
                                <polyline points="7 7 17 7 17 17" />
                              </svg>
                            </a>
                          ) : '—'}
                        </td>
                      </tr>

                      {hasNotes && noteOpen && (
                        <tr className="notes-row">
                          <td colSpan={7}>
                            <span style={{ marginRight: '0.5rem', color: 'var(--accent-purple)', fontStyle: 'normal' }}>📝</span>
                            {app.notes}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Load more */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                className="icon-btn"
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '0.5rem 1.5rem', margin: '0 auto' }}
              >
                Load {Math.min(PAGE_SIZE, filtered.length - page * PAGE_SIZE)} more
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                  ({filtered.length - page * PAGE_SIZE} remaining)
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
