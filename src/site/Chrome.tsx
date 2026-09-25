import { useEffect, useState } from 'react';
import { Button, MirdyneMark } from '../ds';
import { LINKS } from './links';

const NAV = [
    { href: '#platform', label: 'Platform' },
    { href: '#loop', label: 'How it works' },
    { href: '#evidence', label: 'Evidence and IP' },
    { href: '#company', label: 'Company' },
    { href: '#news', label: 'News' },
];

type Over = 'hero' | 'navy' | 'paper';

/**
 * Reads which section sits under the bar. Sections declare `data-nav` as
 * `hero` (transparent bar), `navy` or `paper`.
 */
function useNavOver(): Over {
    const [over, setOver] = useState<Over>('hero');
    useEffect(() => {
        let raf = 0;
        const probe = 36;
        const update = () => {
            raf = 0;
            let found: Over = 'paper';
            for (const el of document.querySelectorAll<HTMLElement>('[data-nav]')) {
                const r = el.getBoundingClientRect();
                if (r.top <= probe && r.bottom > probe) {
                    found = (el.dataset.nav as Over) ?? 'paper';
                    break;
                }
            }
            setOver((prev) => (prev === found ? prev : found));
        };
        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        schedule();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => {
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            cancelAnimationFrame(raf);
        };
    }, []);
    return over;
}

export function SiteNav() {
    const over = useNavOver();
    const [open, setOpen] = useState(false);
    const theme = open ? 'navy' : over === 'paper' ? 'paper' : 'navy';

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <header className="nav" data-over={open ? 'navy' : over} data-theme={theme}>
            <div className="wrap nav__inner">
                <a className="nav__brand" href="#top" aria-label="PRISM by Mirdyne, back to top">
                    <MirdyneMark title="" />
                    <span className="nav__name">PRISM</span>
                    <span className="nav__by">by Mirdyne</span>
                </a>
                <ul className="nav__links">
                    {NAV.map((n) => (
                        <li key={n.href}>
                            <a href={n.href}>{n.label}</a>
                        </li>
                    ))}
                </ul>
                <div className="nav__cta">
                    <Button href={LINKS.interest} external>
                        Register interest
                    </Button>
                </div>
                <button
                    type="button"
                    className="nav__menu"
                    aria-expanded={open}
                    aria-controls="site-menu"
                    onClick={() => setOpen((o) => !o)}
                >
                    <span aria-hidden="true" />
                    <span className="pm-visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
                </button>
            </div>
            <nav
                id="site-menu"
                className={`nav__panel${open ? ' nav__panel--open' : ''}`}
                aria-label="Site"
                onClick={(e) => {
                    if ((e.target as HTMLElement).closest('a')) setOpen(false);
                }}
            >
                <div className="wrap">
                    {NAV.map((n) => (
                        <a key={n.href} href={n.href}>
                            {n.label}
                        </a>
                    ))}
                    <Button href={LINKS.interest} external>
                        Register interest
                    </Button>
                </div>
            </nav>
        </header>
    );
}

export function SiteFooter() {
    return (
        <footer className="footer" data-theme="navy" data-nav="navy">
            <div className="wrap">
                <div className="footer__grid">
                    <div className="footer__brand">
                        <img src="/brand/mirdyne-lockup-white.png" alt="Mirdyne" width={150} height={41} />
                        <p>
                            PRISM · Freedom to build.
                            <br />
                            Initial development of PRISM funded under the ESA Future Launchers Preparatory Programme,
                            FIRST! Simulation &amp; Intelligence.
                        </p>
                    </div>
                    <nav aria-label="Platform">
                        <h2>Platform</h2>
                        <ul>
                            <li>
                                <a href="#platform">The stacks</a>
                            </li>
                            <li>
                                <a href="#loop">How it works</a>
                            </li>
                            <li>
                                <a href="#method">The method</a>
                            </li>
                            <li>
                                <a href="#evidence">Evidence and IP</a>
                            </li>
                        </ul>
                    </nav>
                    <nav aria-label="Company">
                        <h2>Company</h2>
                        <ul>
                            <li>
                                <a href="#company">Mirdyne and Bimo Tech</a>
                            </li>
                            <li>
                                <a href="#news">News</a>
                            </li>
                            <li>
                                <a href={LINKS.interest} target="_blank" rel="noopener noreferrer">
                                    Register interest
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <nav aria-label="Elsewhere">
                        <h2>Elsewhere</h2>
                        <ul>
                            <li>
                                <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
                                    Open-source layer on GitHub
                                </a>
                            </li>
                            <li>
                                <a href={LINKS.bimotech} target="_blank" rel="noopener noreferrer">
                                    Bimo Tech
                                </a>
                            </li>
                            <li>
                                <a href={LINKS.bimomaterials} target="_blank" rel="noopener noreferrer">
                                    Bimo Materials
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="footer__legal">
                    <span>© 2026 Mirdyne · Giessen, Germany · A spin-off of Bimo Tech</span>
                    <a className="footer__credit" href={LINKS.marc27} target="_blank" rel="noopener noreferrer">
                        Technology concept by marc27
                    </a>
                </div>
            </div>
        </footer>
    );
}
