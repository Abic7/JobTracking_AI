import React from 'react';
import { ApplicationRow } from '@/lib/mock-data';

interface ApplicationFunnelProps {
    applications: ApplicationRow[];
}

export default function ApplicationFunnel({ applications }: ApplicationFunnelProps) {
    const total = applications.length;
    if (total === 0) return null;

    // Simple funnel stages
    const oaAndTechnical = applications.filter(a => a.status.toLowerCase().includes('oa') || a.status.toLowerCase().includes('technical')).length;
    const interviewing = applications.filter(a => a.status.toLowerCase().includes('interview')).length;
    const offers = applications.filter(a => a.status.toLowerCase().includes('offer')).length;

    // We consider "interviews" as anyone who got an interview OR an offer
    const interviewStage = interviewing + offers;
    // We consider OA as anyone who got OA OR interview OR offer
    const oaStage = oaAndTechnical + interviewStage;

    const getPercentage = (count: number) => {
        return Math.round((count / total) * 100);
    };

    const stages = [
        { name: 'Applications Sent', count: total, percentage: 100, color: 'var(--status-applied)' },
        { name: 'OA / Technical', count: oaStage, percentage: getPercentage(oaStage), color: 'var(--status-oa)' },
        { name: 'Interviewing', count: interviewStage, percentage: getPercentage(interviewStage), color: 'var(--status-interview)' },
        { name: 'Offers', count: offers, percentage: getPercentage(offers), color: 'var(--status-offer)' }
    ];

    return (
        <div className="glass-panel animate-fade-in delay-200" style={{ gridColumn: 'span 12' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Application Funnel</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stages.map((stage, index) => (
                    <div key={stage.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '150px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            {stage.name}
                        </div>

                        <div style={{ flex: 1, height: '24px', background: 'var(--bg-secondary)', borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0, bottom: 0,
                                    width: `${stage.percentage}%`,
                                    background: stage.color,
                                    opacity: 0.8,
                                    transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                                    borderRadius: '9999px'
                                }}
                            />
                        </div>

                        <div style={{ width: '100px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600 }}>
                            {stage.count} <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 'normal' }}>({stage.percentage}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
