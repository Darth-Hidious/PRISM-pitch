import { useEffect, useState } from 'react';
import { Button, PrismMark } from '../ds';
import InterestMenu from './InterestMenu';
import { LINKS } from './links';

/** The site's pages. Home is `/`; each other page is its own HTML entry (see vite.config.ts). */
export type PageId = 'home' | 'platform' | 'method' | 'company' | 'news' | 'interest' | 'impressum' | 'privacy';

const NAV: { id: PageId; href: string; label: string }[] = [
    { id: 'platform', href: '/platform/', label: 'Platform' },
    { id: 'method', href: '/method/', label: 'Method' },
    { id: 'company', href: '/company/', label: 'Company' },
    { id: 'news', href: '/news/', label: 'News' },
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

export function SiteNav({ page }: { page: PageId }) {
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
                <a className="nav__brand" href="/" aria-label="PRISM by Mirdyne, home" aria-current={page === 'home' ? 'page' : undefined}>
                    <PrismMark title="" weight={20} />
                    <span className="nav__name">PRISM</span>
                    <span className="nav__by">by Mirdyne</span>
                </a>
                <ul className="nav__links">
                    {NAV.map((n) => (
                        <li key={n.href}>
                            <a href={n.href} aria-current={n.id === page ? 'page' : undefined}>
                                {n.label}
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="nav__cta">
                    <InterestMenu />
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
                    <a href="/" aria-current={page === 'home' ? 'page' : undefined}>
                        Home
                    </a>
                    {NAV.map((n) => (
                        <a key={n.href} href={n.href} aria-current={n.id === page ? 'page' : undefined}>
                            {n.label}
                        </a>
                    ))}
                    <div className="nav__panel-ctas">
                        <Button href={LINKS.interest}>Register interest</Button>
                        <Button variant="secondary" href={LINKS.deck}>
                            Investor room
                        </Button>
                    </div>
                </div>
            </nav>
        </header>
    );
}

/** The footer's pages: the bar's four, then the two ways in. */
const FOOTER_PAGES: { id?: PageId; href: string; label: string }[] = [
    ...NAV,
    { id: 'interest', href: LINKS.interest, label: 'Register interest' },
    { href: LINKS.deck, label: 'Investor room' },
];

const ELSEWHERE = [
    { href: LINKS.forager, label: 'Forager' },
    { href: LINKS.github, label: 'GitHub' },
    { href: LINKS.bimotech, label: 'Bimo Tech' },
    { href: LINKS.bimomaterials, label: 'Bimo Materials' },
];

/** Where to go next and the legal links; nothing else. Picture credits live in the Impressum. */
export function SiteFooter({ page }: { page: PageId }) {
    return (
        <footer className="footer" data-theme="navy" data-nav="navy">
            <div className="wrap">
                <div className="footer__top">
                    <a className="footer__brand" href="/" aria-label="PRISM by Mirdyne, home">
                        <img src="/brand/mirdyne-lockup-white.png" alt="Mirdyne" width={150} height={41} />
                    </a>
                    <div className="footer__navs">
                        <nav className="footer__pages" aria-label="Pages">
                            {FOOTER_PAGES.map((n) => (
                                <a key={n.href} href={n.href} aria-current={n.id && n.id === page ? 'page' : undefined}>
                                    {n.label}
                                </a>
                            ))}
                        </nav>
                        <nav className="footer__out" aria-label="Elsewhere">
                            {ELSEWHERE.map((n) => (
                                <a key={n.href} href={n.href} target="_blank" rel="noopener noreferrer">
                                    {n.label}
                                    <span aria-hidden="true"> ↗</span>
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
                <div className="footer__legal">
                    <span>© 2026 Mirdyne</span>
                    <nav className="footer__law" aria-label="Legal">
                        <a href="/impressum/" aria-current={page === 'impressum' ? 'page' : undefined}>
                            Impressum
                        </a>
                        <a href="/privacy/" aria-current={page === 'privacy' ? 'page' : undefined}>
                            Privacy
                        </a>
                        <a href="/impressum/#credits">Picture credits</a>
                    </nav>
                    <a className="footer__credit" href={LINKS.marc27} target="_blank" rel="noopener noreferrer">
                        Technology concept by marc27
                    </a>
                </div>
            </div>
        </footer>
    );
}
