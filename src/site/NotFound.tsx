import { LINKS } from './links';

const PLACES = [
    { href: '/', label: 'Home' },
    { href: '/platform/', label: 'Platform' },
    { href: '/method/', label: 'Method' },
    { href: '/company/', label: 'Company' },
    { href: '/news/', label: 'News' },
    { href: '/contact/', label: 'Contact' },
    { href: LINKS.interest, label: 'Register interest' },
];

/**
 * The page for addresses that do not exist (404.html; the server keeps the 404 status). Agents that ask
 * for Markdown get the same in Markdown from api/not-found.ts.
 */
export default function NotFound() {
    return (
        <section className="sec legal" data-theme="paper" data-nav="paper" aria-labelledby="notfound-title">
            <div className="wrap legal__wrap">
                <header className="legal__head">
                    <p className="w-label">Error 404</p>
                    <h1 id="notfound-title" className="w-h2">
                        Page not found.
                    </h1>
                    <p className="w-lead">There is no page at this address. The link may be wrong, or the page may have moved.</p>
                </header>
                <div className="legal__body">
                    <h2>Pages on this site</h2>
                    <ul className="legal__list">
                        {PLACES.map((p) => (
                            <li key={p.href}>
                                <a href={p.href}>{p.label}</a>
                            </li>
                        ))}
                    </ul>
                    <h2>Indexes</h2>
                    <p>
                        The <a href="/sitemap.xml">site map</a> lists every page. For language models and other software,{' '}
                        <a href="/llms.txt">llms.txt</a> describes the site and links a Markdown version of each page.
                    </p>
                </div>
            </div>
        </section>
    );
}
