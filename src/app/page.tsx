import { getJobApplications } from '@/lib/google-sheets';
import ThemeToggle from '@/components/ThemeToggle';
import SyncBadge from '@/components/SyncBadge';
import DashboardClient from '@/components/DashboardClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Configurable target — update to match your personal goal
const APP_GOAL = 200;

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const applications = await getJobApplications();

  // Core counts
  const totalApplied = applications.length;

  // Goal & duration
  const goalPercent = APP_GOAL > 0 ? Math.min(100, Math.round((totalApplied / APP_GOAL) * 100)) : null;
  const daysHunting = (() => {
    const ts = applications.map(a => new Date(a.dateApplied).getTime()).filter(t => !isNaN(t));
    return ts.length ? Math.ceil((Date.now() - Math.min(...ts)) / 86_400_000) : 0;
  })();
  const uniqueCompanies = new Set(applications.map(a => a.company)).size;

  return (
    <main className="container">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header className="sticky-header animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1>Job Hunt Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0, marginTop: '0.2rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{totalApplied}</strong> applications ·{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{uniqueCompanies}</strong> companies
              {daysHunting > 0 && (
                <span style={{ color: 'var(--text-tertiary)', marginLeft: '0.75rem' }}>
                  · Day {daysHunting} of your search
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Goal progress tracker */}
            {goalPercent !== null && (
              <div className="goal-tracker">
                <div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                    Goal
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1 }}>
                    {totalApplied} / {APP_GOAL}
                  </div>
                </div>
                <div style={{ width: '72px' }}>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${goalPercent}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '3px', textAlign: 'right' }}>
                    {goalPercent}%
                  </div>
                </div>
              </div>
            )}

            {/* Last synced badge — client-only to avoid RSC timing mismatch */}
            <SyncBadge />

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Render the interactive client-side dashboard container */}
      <DashboardClient applications={applications} appGoal={APP_GOAL} />

    </main>
  );
}
