import React, { useState } from 'react';
import { generateActionPlan } from '../agents/ActionPlanAgent';

// Simple markdown renderer — converts headers, bold, tables, bullets to JSX-safe HTML
function renderMarkdown(text) {
    if (!text) return '';
    return text
        // H1
        .replace(/^# (.+)$/gm, '<h1 style="font-size:1.25rem;font-weight:800;color:#f8fafc;margin:1.25rem 0 0.5rem;border-bottom:1px solid #334155;padding-bottom:0.4rem">$1</h1>')
        // H2
        .replace(/^## (.+)$/gm, '<h2 style="font-size:1rem;font-weight:700;color:#e2e8f0;margin:1rem 0 0.4rem">$1</h2>')
        // H3
        .replace(/^### (.+)$/gm, '<h3 style="font-size:0.875rem;font-weight:600;color:#cbd5e1;margin:0.75rem 0 0.3rem">$1</h3>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f1f5f9;font-weight:700">$1</strong>')
        // Horizontal rule
        .replace(/^---$/gm, '<hr style="border-color:#334155;margin:0.75rem 0"/>')
        // Table row (pipe separated)
        .replace(/^\|(.+)\|$/gm, (_, row) => {
            const isSep = row.split('|').every(c => /^[-: ]+$/.test(c.trim()));
            if (isSep) return '';
            const cells = row.split('|').map(c => `<td style="padding:4px 10px;border:1px solid #334155;font-size:0.75rem;color:#cbd5e1">${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        })
        .replace(/((<tr>.*<\/tr>\s*)+)/gs, '<table style="width:100%;border-collapse:collapse;margin:0.5rem 0">$1</table>')
        // Bullets
        .replace(/^[\*\-] (.+)$/gm, '<li style="margin:3px 0;font-size:0.8rem;color:#cbd5e1;line-height:1.5">$1</li>')
        .replace(/((<li.*<\/li>\s*)+)/gs, '<ul style="margin:0.3rem 0 0.5rem 1rem;padding:0">$1</ul>')
        // Newlines
        .replace(/\n/g, '<br/>');
}

const SEVERITY_COLOR = {
    high: { border: '#ef4444', bg: '#450a0a', badge: '#fca5a5' },
    medium: { border: '#f59e0b', bg: '#451a03', badge: '#fcd34d' },
    low: { border: '#3b82f6', bg: '#0c1a2e', badge: '#93c5fd' },
};

export default function ActionPlanModal({ alert, cityData, sensorData, elevationSamples, onClose }) {
    const [plan, setPlan] = useState(null);
    const [source, setSource] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const colors = SEVERITY_COLOR[alert.severity] || SEVERITY_COLOR.low;

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setPlan(null);
        try {
            const result = await generateActionPlan({ alert, cityData, sensorData, elevationSamples });
            if (result.plan) {
                setPlan(result.plan);
                setSource(result.source);
            } else {
                setError(result.error || 'Failed to generate action plan.');
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const [isPublished, setIsPublished] = useState(false);

    const handlePublish = () => {
        if (!plan) return;
        localStorage.setItem('citybuddy_published_action_plan', JSON.stringify({
            alertType: alert.type,
            alertMessage: alert.message,
            timestamp: Date.now(),
            plan: plan,
            source: source
        }));
        setIsPublished(true);
        setTimeout(() => setIsPublished(false), 3000);
    };

    return (
        // Backdrop
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
            }}
        >
            {/* Panel */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: 'min(860px, 95vw)',
                    maxHeight: '90vh',
                    background: '#0f172a',
                    borderRadius: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${colors.border}`,
                    boxShadow: `0 0 60px ${colors.border}33`,
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    background: colors.bg,
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexShrink: 0,
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span style={{
                                fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em',
                                textTransform: 'uppercase', color: colors.badge,
                                background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px'
                            }}>
                                ⚠ {alert.type?.replace(/_/g, ' ')} · {alert.severity?.toUpperCase()}
                            </span>
                            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{alert.timestamp}</span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.4, maxWidth: '600px' }}>
                            {alert.message}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem' }}>
                            📍 {alert.lat?.toFixed(5)}, {alert.lon?.toFixed(5)} &nbsp;|&nbsp; Source: {alert.agent}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8',
                            cursor: 'pointer', borderRadius: '0.4rem', padding: '0.35rem 0.75rem',
                            fontSize: '1rem', flexShrink: 0, marginLeft: '1rem'
                        }}
                    >✕</button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    {!plan && !loading && (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏛️</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                                Mayor's Crisis Action Plan
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                                The system will analyse nearby hospitals ({cityData?.infrastructure?.hospitals || 0}),
                                emergency stations, traffic congestion, terrain elevation, and weather to generate
                                a complete, actionable response plan.
                            </div>
                            <button
                                onClick={handleGenerate}
                                style={{
                                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                                    color: 'white', border: 'none', borderRadius: '0.6rem',
                                    padding: '0.75rem 2rem', fontSize: '0.875rem', fontWeight: 700,
                                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
                                    transition: 'transform 0.1s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Generate Action Plan with AI ✨
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                border: '3px solid #334155', borderTopColor: '#7c3aed',
                                animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
                            }} />
                            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                Analysing crisis data with Gemini 2.5 Flash...
                            </div>
                            <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                                Gathering hospital data, congestion, elevation, weather signals
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            background: '#450a0a', border: '1px solid #ef4444', borderRadius: '0.5rem',
                            padding: '1rem', color: '#fca5a5', fontSize: '0.85rem'
                        }}>
                            ⚠ Failed to generate plan: {error}
                        </div>
                    )}

                    {plan && (
                        <>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: '1.25rem'
                            }}>
                                <div style={{
                                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                                    letterSpacing: '0.08em', color: source === 'gemini' ? '#a78bfa' : '#34d399',
                                    background: source === 'gemini' ? 'rgba(124,58,237,0.15)' : 'rgba(52,211,153,0.1)',
                                    padding: '3px 10px', borderRadius: '4px'
                                }}>
                                    {source === 'gemini' ? '✦ Gemini 2.5 Flash' : '⚙ Ollama (qwen2.5:7b)'}
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    style={{
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid #334155',
                                        color: '#94a3b8', cursor: 'pointer', borderRadius: '0.35rem',
                                        padding: '4px 12px', fontSize: '0.7rem'
                                    }}
                                >↻ Regenerate</button>
                            </div>

                            <div
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(plan) }}
                                style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.82rem' }}
                            />
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '0.75rem 1.5rem',
                    borderTop: '1px solid #1e293b',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#0a0f1e', flexShrink: 0
                }}>
                    <span style={{ fontSize: '0.65rem', color: '#475569' }}>
                        CityBuddy Intelligence Platform · For authorised government use only
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {plan && (
                            <button
                                onClick={handlePublish}
                                style={{
                                    background: isPublished ? '#10b981' : '#3b82f6', border: 'none', color: 'white',
                                    cursor: 'pointer', borderRadius: '0.4rem', padding: '6px 16px', fontSize: '0.75rem',
                                    fontWeight: 600, transition: 'all 0.2s'
                                }}
                            >
                                {isPublished ? '✓ Published to Citizens' : '📢 Publish to Citizens'}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                background: '#1e293b', border: '1px solid #334155', color: '#94a3b8',
                                cursor: 'pointer', borderRadius: '0.4rem', padding: '6px 16px', fontSize: '0.75rem'
                            }}
                        >Close</button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
