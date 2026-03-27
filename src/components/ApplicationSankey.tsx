"use client";

import React, { useEffect, useState } from 'react';
import { Sankey, ResponsiveContainer, Tooltip, Rectangle } from 'recharts';
import { ApplicationRow } from '@/lib/mock-data';

interface ApplicationSankeyProps {
    applications: ApplicationRow[];
}

export default function ApplicationSankey({ applications }: ApplicationSankeyProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const total = applications.length;
    if (total === 0) return null;
    if (!mounted) {
      return (
        <div className="glass-panel animate-fade-in delay-200" style={{ gridColumn: 'span 12', minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading funnel...</p>
        </div>
      );
    }

    // User flow: Applied -> Active / Interview / Unsuccessful
    const applied = applications.length;
    const active = applications.filter(a => {
      const s = a.status.toLowerCase();
      return s.includes('applied') || s.includes('oa') || s.includes('technical');
    }).length;
    const interview = applications.filter(a => {
      const s = a.status.toLowerCase();
      return s.includes('interview') || s.includes('offer');
    }).length;
    const rejected = applications.filter(a => {
      const s = a.status.toLowerCase();
      return s.includes('reject') || s.includes('ghost') || s.includes('unsuccessful');
    }).length;

    const nodes = [
      { name: 'Applied', value: applied, color: '#6092ff' },
      { name: 'Active', value: active, color: '#3b82f6' },
      { name: 'Interview', value: interview, color: '#f59e0b' },
      { name: 'Unsuccessful', value: rejected, color: '#f43f5e' }
    ];

    const links = [
      ...(active > 0 ? [{ source: 0, target: 1, value: active, color: '#3b82f6' }] : []),
      ...(interview > 0 ? [{ source: 0, target: 2, value: interview, color: '#f59e0b' }] : []),
      ...(rejected > 0 ? [{ source: 0, target: 3, value: rejected, color: '#f43f5e' }] : [])
    ];

    const data = { nodes, links };

    console.log('ApplicationSankey values:', {
      applied,
      active,
      interview,
      rejected,
      nodes,
      links
    });

    if (links.length === 0) {
      return (
        <div className="glass-panel animate-fade-in delay-200" style={{ gridColumn: 'span 12', minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            No funnel transition data available yet. Add some moved statuses (OA/Technical, Interviewing, Offer, etc.) and refresh.
          </p>
        </div>
      );
    }

    return (
        <div className="glass-panel animate-fade-in delay-200" style={{ gridColumn: 'span 12', minHeight: '520px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Application Funnel</h2>
            <div style={{ width: '100%', height: '440px', minHeight: '440px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <Sankey
                    data={data}
                    nodePadding={16}
                    nodeWidth={30}
                    margin={{ top: 20, right: 200, bottom: 20, left: 100 }}
                    node={(props: any) => {
                      const nodeValue = Math.round(props.payload.value || 0);
                      const nodeLabel = props.payload.name;
                      const nodeWidth = props.width ?? props.dx;
                      const nodeHeight = props.height ?? props.dy;
                      const hasValidPosition = typeof props.x === 'number' && typeof props.y === 'number' && typeof nodeWidth === 'number' && typeof nodeHeight === 'number' && isFinite(props.x) && isFinite(props.y);
                      return (
                        <g>
                          <Rectangle
                            {...props}
                            fill={props.payload.color ?? '#808080'}
                            stroke="rgba(255,255,255,0.75)"
                            strokeWidth={1.4}
                            rx={8}
                            ry={8}
                          />
                          {hasValidPosition && (
                            <g>
                              <text
                                x={props.x + nodeWidth + 16}
                                y={props.y + nodeHeight / 2 - 10}
                                fill="var(--text-primary)"
                                fontSize={16}
                                fontWeight={700}
                                textAnchor="start"
                                dominantBaseline="middle"
                              >
                                {nodeValue}
                              </text>
                              <text
                                x={props.x + nodeWidth + 16}
                                y={props.y + nodeHeight / 2 + 12}
                                fill="var(--text-secondary)"
                                fontSize={13}
                                fontWeight={500}
                                textAnchor="start"
                                dominantBaseline="middle"
                              >
                                {nodeLabel}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    }}
                    link={(props: any) => {
                      const d = `M${props.sourceX},${props.sourceY} C${props.sourceControlX},${props.sourceY} ${props.targetControlX},${props.targetY} ${props.targetX},${props.targetY}`;
                      return (
                        <path
                          d={d}
                          fill="none"
                          stroke={props.payload.color ?? 'rgba(255,255,255,0.35)'}
                          strokeWidth={Math.max(props.linkWidth, 2)}
                          strokeOpacity={0.9}
                        />
                      );
                    }}
                />
                <Tooltip
                  formatter={(value: number | string | undefined, name: string | undefined) => [`${value ?? 0}`, name ?? '']}
                />
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'start', alignItems: 'center' }}>
              {nodes.map(node => (
                <div key={node.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.55rem', borderRadius: '999px', background: 'rgba(250,250,250,0.08)', color: 'var(--text-primary)', fontSize: '0.75rem', flexShrink: 0 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: node.color }} />
                  <span>{node.name}</span>
                  <span style={{ fontWeight: 700 }}>({Math.round((node.name === 'Applied' ? applied : node.name === 'Active' ? active : node.name === 'Interview' ? interview : rejected) || 0)})</span>
                </div>
              ))}
            </div>
        </div>
    );
}