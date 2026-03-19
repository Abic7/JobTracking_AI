import { getJobApplications } from '@/lib/google-sheets';
import MetricCard from '@/components/MetricCard';
import TimelineChart from '@/components/TimelineChart';
import CompanyBarChart from '@/components/CompanyBarChart';
import RecentApplicationsTable from '@/components/RecentApplicationsTable';
import ApplicationFunnel from '@/components/ApplicationFunnel';
import StatusDonut from '@/components/StatusDonut';
import IndustryBreakdown from '@/components/IndustryBreakdown';
import ThemeToggle from '@/components/ThemeToggle';
import SyncBadge from '@/components/SyncBadge';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Configurable target — update to match your personal goal
const APP_GOAL = 100;

// ── Inline SVG icons ─────────────────────────────────────────────────────────
const IconBriefcase = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconPipeline = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconChat = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconStar = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconX = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconCalendar = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8"  y1="2" x2="8"  y2="6" />
    <line x1="3"  y1="10" x2="21" y2="10" />
  </svg>
);

// ── Small conversion rate card ───────────────────────────────────────────────
function ConversionCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="glass-panel animate-fade-in delay-300" style={{ flex: 1, minWidth: '140px', padding: '1rem 1.25rem' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.875rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{sub}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const applications = await getJobApplications();

  // Core counts
  const totalApplied      = applications.length;
  const interviewingCount = applications.filter(a => a.status.toLowerCase().includes('interview')).length;
  const offersCount       = applications.filter(a => a.status.toLowerCase().includes('offer')).length;
  const rejectedCount     = applications.filter(a => {
    const s = a.status.toLowerCase();
    return s.includes('reject') || s.includes('unsuccessful');
  }).length;
  const ghostedCount = applications.filter(a => a.status.toLowerCase().includes('ghost')).length;
  const activeCount  = totalApplied - rejectedCount - ghostedCount;

  // Rates
  const interviewRate      = totalApplied      > 0 ? Math.round((interviewingCount / totalApplied)      * 100) : 0;
  const offerFromInterview = interviewingCount > 0 ? Math.round((offersCount       / interviewingCount) * 100) : 0;
  const overallSuccess     = totalApplied      > 0 ? Math.round((offersCount       / totalApplied)      * 100) : 0;
  const responseRate       = totalApplied      > 0 ? Math.round(((totalApplied - ghostedCount) / totalApplied) * 100) : 0;

  // Velocity
  let avgPerDay = 0, activePerDay = 0, interviewPerDay = 0, rejectedPerDay = 0;
  if (applications.length > 0) {
    const dates = applications.map(a => new Date(a.dateApplied).getTime()).filter(t => !isNaN(t));
    if (dates.length > 1) {
      const span = Math.max(1, Math.ceil((Math.max(...dates) - Math.min(...dates)) / 86_400_000));
      avgPerDay       = Number((totalApplied     / span).toFixed(1));
      activePerDay    = Number((activeCount       / span).toFixed(1));
      interviewPerDay = Number((interviewingCount / span).toFixed(2));
      rejectedPerDay  = Number((rejectedCount     / span).toFixed(2));
    } else if (dates.length === 1) {
      avgPerDay = totalApplied; activePerDay = activeCount;
      interviewPerDay = interviewingCount; rejectedPerDay = rejectedCount;
    }
  }

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

      <div className="dashboard-grid">

        {/* ── Metric cards ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '1.25rem', gridColumn: 'span 12', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <MetricCard title="Total Applied"    value={totalApplied}      delay={100} trendValue={avgPerDay}       trendIsPositive={avgPerDay > 0}       trendLabel="/ day" icon={IconBriefcase} accentColor="#3b82f6" goal={APP_GOAL} />
          <MetricCard title="Active Pipeline"  value={activeCount}       delay={200} trendValue={activePerDay}    trendIsPositive={activePerDay > 0}    trendLabel="/ day" icon={IconPipeline}  accentColor="#8b5cf6" />
          <MetricCard title="Interviewed"      value={interviewingCount} delay={300} trendValue={interviewPerDay} trendIsPositive={interviewPerDay > 0} trendLabel="/ day" icon={IconChat}      accentColor="#f59e0b" />
          <MetricCard title="Offers Received"  value={offersCount}       delay={400} icon={IconStar}     accentColor="#10b981" />
          <MetricCard title="Unsuccessful"     value={rejectedCount}     delay={500} trendValue={rejectedPerDay}  trendIsPositive={false}               trendLabel="/ day" icon={IconX}         accentColor="#f43f5e" />
          <MetricCard title="Avg Apps / Day"   value={avgPerDay}         delay={600} icon={IconCalendar} accentColor="#d946ef" />
        </div>

        {/* ── Conversion rate row ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '1.25rem', gridColumn: 'span 12', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <ConversionCard label="Interview Rate"      value={`${interviewRate}%`}      sub="Applied → Interviewed"          color="#f59e0b" />
          <ConversionCard label="Offer from Interview" value={`${offerFromInterview}%`} sub="Interviewed → Offer"            color="#10b981" />
          <ConversionCard label="Response Rate"        value={`${responseRate}%`}       sub="Applications with any response" color="#3b82f6" />
          <ConversionCard label="Overall Success"      value={`${overallSuccess}%`}     sub="Applied → Offer"                color="#8b5cf6" />
        </div>

        {/* ── Application timeline ─────────────────────────────────────────── */}
        <TimelineChart applications={applications} />

        {/* ── Status donut + Industry breakdown ────────────────────────────── */}
        <StatusDonut         applications={applications} />
        <IndustryBreakdown   applications={applications} />

        {/* ── Conversion funnel ────────────────────────────────────────────── */}
        <ApplicationFunnel applications={applications} />

        {/* ── Company bar chart ────────────────────────────────────────────── */}
        <CompanyBarChart applications={applications} />

        {/* ── Full applications table ──────────────────────────────────────── */}
        <RecentApplicationsTable applications={applications} />

      </div>
    </main>
  );
}
