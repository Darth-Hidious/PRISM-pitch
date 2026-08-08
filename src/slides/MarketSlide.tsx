/**
 * Market & business.
 *
 * Rebuilt from the `EU Market` and `Sources` sheets of
 * `ESA BIC Proposal/2_WORKING/PRISM_Financial_Model_Researched_Europe_2026.xlsx`.
 *
 * The previous version led with a €49B "Total Addressable Market" and closed on
 * ">92% gross margins". Neither figure appears anywhere in the model, and the
 * model's guardrail #2 states that the aerospace enterprise population is a
 * ceiling, not a customer forecast. The headline is therefore the
 * serviceable wallet the model derives (€48M), the bridge that produces it is
 * shown step by step, and every external figure carries its source ID.
 */

// EU Market → serviceable account bridge, base case.
const BRIDGE = [
    { value: '472', label: 'EU aerospace enterprises', sub: '20+ staff · EU27 2024 prov.', tag: 'MKT2', kind: 'external' },
    { value: '189', label: 'Filtered technical fit', sub: '40% · materials, propulsion, qualification', tag: 'MODEL INFERENCE', kind: 'inference' },
    { value: '80', label: 'Reachable accounts', sub: '42% · relationship pool 2026–31', tag: 'ASSUMPTIONS C8', kind: 'model' },
    { value: '€600k', label: 'Annual wallet / account', sub: 'process development & qualification spend', tag: 'ASSUMPTIONS C9', kind: 'model' },
];

// EU Market → evidence register. Budget context; the model does not treat these as TAM.
const CONTEXT = [
    { v: '€170.7B', k: 'EU aerospace manufacturing turnover', s: 'MKT3' },
    { v: '€8.84B', k: 'European space manufacturing final sales', s: 'MKT4' },
    { v: '€8.26B', k: 'ESA annual budget, 2026', s: 'MKT6' },
    { v: '69.6%', k: 'Public-customer share of space sales', s: 'MKT5' },
];

// EU Market → PRISM monetisation boundary.
const PAID = [
    { name: 'Program', desc: 'Accepted experimental campaign against customer requirements.', color: 'var(--c-gold)' },
    { name: 'Pilot', desc: 'Probe deployment, calibration and reference run.', color: 'var(--c-blue)' },
    { name: 'Deployment', desc: 'PRISM installed on customer hardware, under their sign-off process.', color: 'var(--c-green)' },
    { name: 'Support', desc: 'Recurring recalibration, data traceability and versioned releases.', color: '#EDEDEF' },
    { name: 'Transfer', desc: 'Qualified process documents handed to the customer\u2019s own team.', color: 'var(--c-muted)' },
];

export default function MarketSlide() {
    return (
        <div className="relative w-full h-full" style={{ background: 'var(--c-bg)' }}>
            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header */}
                <header className="flex items-center justify-between anim-in anim-d1" style={{ marginBottom: 'clamp(14px, 2vw, 30px)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.15em',
                        color: 'var(--c-gold)',
                    }}>
                        06 &mdash; MARKET &amp; BUSINESS
                    </span>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.1em',
                        color: 'var(--c-dim)',
                    }}>
                        PRISM
                    </span>
                </header>

                <main className="flex-1 flex flex-col justify-center" style={{ minHeight: 0 }}>
                    {/* Headline: the serviceable wallet, with the top-down context beside it */}
                    <div className="flex items-end mobile-stack anim-in anim-d2" style={{ gap: 'clamp(16px, 3vw, 56px)', marginBottom: 'clamp(16px, 2.2vw, 34px)' }}>
                        <div style={{ flexShrink: 0 }}>
                            <div className="flex items-baseline" style={{ gap: 'clamp(8px, 1.2vw, 20px)' }}>
                                <div style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(56px, 7vw, 132px)',
                                    fontWeight: 800,
                                    lineHeight: 0.85,
                                    letterSpacing: '-0.04em',
                                    color: 'var(--c-gold)',
                                }}>
                                    {'€'}48M
                                </div>
                                <div>
                                    <div style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: 'clamp(16px, 1.7vw, 30px)',
                                        fontWeight: 600,
                                        lineHeight: 1.2,
                                    }}>
                                        Serviceable annual wallet
                                    </div>
                                    <div style={{
                                        fontSize: 'clamp(11px, 0.9vw, 15px)',
                                        color: 'var(--c-muted)',
                                        marginTop: '4px',
                                    }}>
                                        Base case. Upper bound on annual spend across reachable accounts.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex" style={{ flex: 1, gap: 'clamp(10px, 1.6vw, 28px)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {CONTEXT.map((c) => (
                                <div key={c.s}>
                                    <div style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: 'clamp(14px, 1.3vw, 24px)',
                                        fontWeight: 700,
                                        lineHeight: 1.1,
                                    }}>
                                        {c.v}
                                    </div>
                                    <div style={{
                                        fontSize: 'clamp(9px, 0.7vw, 12px)',
                                        color: 'var(--c-muted)',
                                        maxWidth: '150px',
                                        lineHeight: 1.35,
                                        marginTop: '3px',
                                    }}>
                                        {c.k}
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'clamp(8px, 0.6vw, 10px)',
                                        color: 'var(--c-dim)',
                                        letterSpacing: '0.1em',
                                        marginTop: '2px',
                                    }}>
                                        {c.s}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* The bridge */}
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(9px, 0.7vw, 11px)',
                        letterSpacing: '0.2em',
                        color: 'var(--c-dim)',
                        marginBottom: 'clamp(8px, 1vw, 14px)',
                    }}>
                        SERVICEABLE ACCOUNT BRIDGE
                    </div>

                    <div className="flex anim-in anim-d3 mobile-stack" style={{ gap: 'clamp(6px, 0.9vw, 14px)', alignItems: 'stretch', marginBottom: 'clamp(16px, 2.2vw, 34px)' }}>
                        {BRIDGE.map((b, i) => (
                            <div key={b.label} className="flex items-center" style={{ flex: 1, gap: 'clamp(6px, 0.9vw, 14px)', minWidth: 0 }}>
                                <div className="glass-card" style={{ flex: 1, padding: 'clamp(10px, 1.1vw, 20px)', minWidth: 0 }}>
                                    <div style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: 'clamp(20px, 2vw, 38px)',
                                        fontWeight: 700,
                                        lineHeight: 1,
                                        color: b.kind === 'external' ? 'var(--c-text)' : 'var(--c-gold)',
                                    }}>
                                        {b.value}
                                    </div>
                                    <div style={{
                                        fontSize: 'clamp(10px, 0.8vw, 14px)',
                                        fontWeight: 600,
                                        marginTop: '6px',
                                        lineHeight: 1.25,
                                    }}>
                                        {b.label}
                                    </div>
                                    <div style={{
                                        fontSize: 'clamp(9px, 0.68vw, 12px)',
                                        color: 'var(--c-muted)',
                                        marginTop: '3px',
                                        lineHeight: 1.35,
                                    }}>
                                        {b.sub}
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'clamp(8px, 0.58vw, 10px)',
                                        letterSpacing: '0.1em',
                                        color: b.kind === 'external' ? 'var(--c-green)' : 'var(--c-dim)',
                                        marginTop: 'clamp(6px, 0.7vw, 10px)',
                                    }}>
                                        {b.tag}
                                    </div>
                                </div>
                                {i < BRIDGE.length - 1 && (
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'clamp(11px, 0.9vw, 15px)',
                                        color: 'var(--c-dim)',
                                        flexShrink: 0,
                                    }}>
                                        &times;
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Monetisation boundary */}
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(9px, 0.7vw, 11px)',
                        letterSpacing: '0.2em',
                        color: 'var(--c-dim)',
                        marginBottom: 'clamp(8px, 1vw, 14px)',
                    }}>
                        MONETISATION BOUNDARY
                    </div>

                    <div className="flex anim-in anim-d4 mobile-stack" style={{ gap: 'clamp(10px, 1.5vw, 26px)', alignItems: 'stretch' }}>
                        {/* Free layer */}
                        <div style={{
                            flex: '0 0 26%',
                            padding: 'clamp(10px, 1.1vw, 20px)',
                            border: '1px dashed var(--c-border)',
                            borderRadius: '4px',
                            minWidth: 0,
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(8px, 0.6vw, 10px)',
                                letterSpacing: '0.15em',
                                color: 'var(--c-dim)',
                            }}>
                                FREE &amp; OPEN-SOURCE
                            </div>
                            <div style={{
                                fontSize: 'clamp(11px, 0.85vw, 15px)',
                                fontWeight: 600,
                                marginTop: '6px',
                                lineHeight: 1.3,
                            }}>
                                Prediction, ranking, materials informatics
                            </div>
                            <div style={{
                                fontSize: 'clamp(9px, 0.7vw, 12px)',
                                color: 'var(--c-muted)',
                                marginTop: '5px',
                                lineHeight: 1.4,
                            }}>
                                {'€'}0 in every scenario. Released open-source; the model books revenue only on delivery.
                            </div>
                        </div>

                        {/* Paid layers */}
                        <div className="flex" style={{ flex: 1, gap: 'clamp(8px, 1vw, 18px)', minWidth: 0 }}>
                            {PAID.map((p) => (
                                <div key={p.name} style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ width: '22px', height: '2px', background: p.color, marginBottom: 'clamp(6px, 0.7vw, 11px)' }} />
                                    <div style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: 'clamp(12px, 1vw, 19px)',
                                        fontWeight: 600,
                                        lineHeight: 1.2,
                                    }}>
                                        {p.name}
                                    </div>
                                    <div style={{
                                        fontSize: 'clamp(9px, 0.68vw, 12px)',
                                        color: 'var(--c-muted)',
                                        lineHeight: 1.4,
                                        marginTop: '4px',
                                    }}>
                                        {p.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer line — the model's own base-case outputs */}
                    <div className="anim-in anim-d5" style={{
                        marginTop: 'clamp(14px, 2vw, 30px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(12px, 1.6vw, 26px)',
                    }}>
                        <div style={{ height: '1px', flex: 1, background: 'var(--c-border)' }} />
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(9px, 0.8vw, 13px)',
                            color: 'var(--c-muted)',
                            whiteSpace: 'nowrap',
                        }}>
                            BASE CASE <span style={{ color: 'var(--c-gold)', fontWeight: 700 }}>{'€'}18.0M</span> REVENUE BY 2035
                            &middot; EBITDA-POSITIVE 2028 &middot; 61% GROSS MARGIN
                        </span>
                        <div style={{ height: '1px', flex: 1, background: 'var(--c-border)' }} />
                    </div>
                </main>
            </div>
        </div>
    );
}
