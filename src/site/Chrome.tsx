import { useEffect, useState } from 'react';
import { Button, MirdyneMark } from '../ds';
import { LINKS } from './links';

const NAV = [
    { href: '#platform', label: 'Platform' },
    { href: '#loop', label: 'How it works' },
    { href: '#evidence', label: 'Evidence and IP' },
    { href: '#programmes', label: 'Programmes' },
    { href: '#company', label: 'Company' },
];

export function SiteNav() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className={`site-nav${scrolled ? ' site-nav--scrolled' : ''}`}>
            <div className="site-container site-nav__inner">
                <a className="site-brand" href="#top" aria-label="PRISM by Mirdyne, back to top">
                    <MirdyneMark title="" />
                    <span className="site-brand__name">PRISM</span>
                    <span className="site-brand__by">by Mirdyne</span>
                </a>
                <ul className="site-nav__links">
                    {NAV.map((n) => (
                        <li key={n.href}>
                            <a href={n.href}>{n.label}</a>
                        </li>
                    ))}
                </ul>
                <div className="site-nav__actions">
                    <Button variant="link" href={LINKS.deck} arrow={false}>
                        Investor briefing
                    </Button>
                    <Button href={LINKS.interest} external>
                        Register interest
                    </Button>
                </div>
                <button
                    type="button"
                    className="site-nav__menu"
                    aria-expanded={open}
                    aria-controls="site-menu"
                    onClick={() => setOpen((o) => !o)}
                >
                    <span />
                    <span className="pm-visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
                </button>
            </div>
            <nav
                id="site-menu"
                className={`site-nav__panel${open ? ' site-nav__panel--open' : ''}`}
                aria-label="Site"
                onClick={(e) => {
                    if ((e.target as HTMLElement).closest('a')) setOpen(false);
                }}
            >
                {NAV.map((n) => (
                    <a key={n.href} href={n.href}>
                        {n.label}
                    </a>
                ))}
                <a href={LINKS.deck}>Investor briefing</a>
                <Button href={LINKS.interest} external>
                    Register interest
                </Button>
            </nav>
        </header>
    );
}

export function SiteFooter() {
    return (
        <footer className="site-footer" data-theme="navy">
            <div className="site-container">
                <div className="site-footer__grid">
                    <div className="site-footer__brand">
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
                                <a href="#evidence">Evidence and IP</a>
                            </li>
                            <li>
                                <a href="#programmes">Programmes</a>
                            </li>
                        </ul>
                    </nav>
                    <nav aria-label="Company">
                        <h2>Company</h2>
                        <ul>
                            <li>
                                <a href="#company">About Mirdyne</a>
                            </li>
                            <li>
                                <a href={LINKS.deck}>Investor briefing</a>
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
                <div className="site-footer__legal">
                    <span>© 2026 Mirdyne · Giessen, Germany · A spin-off of Bimo Tech</span>
                    <a className="site-footer__credit" href={LINKS.marc27} target="_blank" rel="noopener noreferrer">
                        Technology concept by marc27
                    </a>
                </div>
            </div>
        </footer>
    );
}
