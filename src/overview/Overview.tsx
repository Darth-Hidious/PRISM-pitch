import MirdyneMark from '../components/MirdyneMark';
import NebulaCanvas from './NebulaCanvas';
import { company, contact, credentials, footer, goal, hero, links, questions, steps } from './content';
import type { Credential } from './content';

function Pending({ what }: { what: string }) {
    return <span className="pending">To confirm: {what}</span>;
}

function ExternalLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
        </a>
    );
}

function Brand() {
    return (
        <a href="#top" className="flex items-center gap-3 text-text no-underline" aria-label="PRISM by Mirdyne, back to top">
            <MirdyneMark className="h-5 w-5" />
            <span className="font-display text-lg font-bold tracking-[0.08em]">{company.product}</span>
            <span className="hidden font-mono text-[11px] tracking-[0.14em] text-faint uppercase sm:inline">by {company.name}</span>
        </a>
    );
}

function CredentialList({ label, items }: { label: string; items: Credential[] }) {
    return (
        <div>
            <h3 className="eyebrow mb-5">{label}</h3>
            <ul className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
                {items.map((item) => (
                    <li key={item.name} className="bg-ink p-6">
                        <p className="font-display text-xl font-semibold">{item.name}</p>
                        <p className="mt-2 text-muted">{item.detail}</p>
                        {item.pending && <Pending what={item.pending} />}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Overview() {
    return (
        <>
            <a href="#main" className="skip-link">Skip to content</a>

            <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/70 backdrop-blur-md">
                <div className="container-x flex h-16 items-center justify-between">
                    <Brand />
                    <nav aria-label="Page" className="flex items-center gap-6">
                        <a href="#loop" className="nav-link hidden md:inline">How it works</a>
                        <a href="#faq" className="nav-link hidden md:inline">FAQ</a>
                        <ExternalLink href={links.briefing} className="button button-small">Request a briefing</ExternalLink>
                    </nav>
                </div>
            </header>

            <main id="main">
                <section id="top" className="hero relative flex min-h-[100svh] items-end overflow-hidden" aria-labelledby="hero-title">
                    <NebulaCanvas className="absolute inset-0 h-full w-full" />
                    <div className="hero-fade absolute inset-0" aria-hidden="true" />
                    <div className="container-x relative pt-32 pb-20 md:pb-28">
                        <p className="eyebrow mb-6">{hero.eyebrow}</p>
                        <h1 id="hero-title" className="max-w-5xl font-display text-[clamp(2.6rem,7vw,6.25rem)] leading-[0.95] font-bold tracking-[-0.03em] text-balance">
                            {hero.title}
                        </h1>
                        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{hero.intro}</p>
                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <ExternalLink href={links.briefing} className="button">Request a briefing</ExternalLink>
                            <a href="#loop" className="button button-ghost">How it works</a>
                        </div>
                    </div>
                </section>

                <section className="section" aria-labelledby="goal-title">
                    <div className="container-x grid gap-8 md:grid-cols-[200px_1fr]">
                        <h2 id="goal-title" className="eyebrow pt-2">Goal</h2>
                        <div>
                            <p className="font-display text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-balance">
                                {goal.statement}
                            </p>
                            <p className="mt-8 flex gap-3 text-lg text-muted">
                                <span className="mt-[0.6em] h-px w-6 shrink-0 bg-accent" aria-hidden="true" />
                                {goal.firstTarget}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="section pt-0" aria-labelledby="credentials-title">
                    <div className="container-x">
                        <h2 id="credentials-title" className="sr-only">Funding, recognition and partners</h2>
                        <div className="grid gap-12 lg:grid-cols-2">
                            <CredentialList label="Funding and recognition" items={credentials.funding} />
                            <CredentialList label="Partners" items={credentials.partners} />
                        </div>
                    </div>
                </section>

                <section id="loop" className="section border-t border-line" aria-labelledby="loop-title">
                    <div className="container-x">
                        <p className="eyebrow mb-5">How it works</p>
                        <h2 id="loop-title" className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.02] font-bold tracking-[-0.03em]">
                            One loop, three steps.
                        </h2>

                        <div className="mt-16 grid gap-20">
                            {steps.map((step) => (
                                <article key={step.id} id={step.id} className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16" aria-labelledby={`${step.id}-title`}>
                                    <header>
                                        <p className="font-mono text-sm text-accent">{step.number}</p>
                                        <h3 id={`${step.id}-title`} className="mt-3 font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-none font-bold tracking-[-0.03em]">
                                            {step.name}
                                        </h3>
                                        <p className="mt-4 max-w-md text-xl text-muted">{step.lead}</p>
                                    </header>
                                    <ul className="divide-y divide-line border-y border-line">
                                        {step.stories.map((story) => (
                                            <li key={story.title} className="py-6">
                                                <h4 className="font-display text-xl font-semibold">{story.title}</h4>
                                                <p className="mt-2 text-muted">{story.text}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="faq" className="section border-t border-line" aria-labelledby="faq-title">
                    <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                        <div>
                            <p className="eyebrow mb-5">FAQ</p>
                            <h2 id="faq-title" className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.02] font-bold tracking-[-0.03em]">
                                Essential information
                            </h2>
                        </div>
                        <div className="border-t border-line">
                            {questions.map((item) => (
                                <details key={item.q} className="faq border-b border-line">
                                    <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 font-display text-xl font-semibold">
                                        {item.q}
                                        <span className="faq-icon" aria-hidden="true" />
                                    </summary>
                                    <div className="pb-6">
                                        <p className="max-w-2xl text-muted">{item.a}</p>
                                        {item.pending && <Pending what={item.pending} />}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="contact" className="section contact border-t border-line" aria-labelledby="contact-title">
                    <div className="container-x">
                        <h2 id="contact-title" className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none font-bold tracking-[-0.03em]">
                            {contact.title}
                        </h2>
                        <p className="mt-6 max-w-xl text-xl text-muted">{contact.text}</p>
                        <ExternalLink href={links.briefing} className="button mt-10">{contact.cta}</ExternalLink>
                    </div>
                </section>
            </main>

            <footer className="border-t border-line py-12">
                <div className="container-x grid gap-10 md:grid-cols-3">
                    <div>
                        <p className="flex items-center gap-3 font-display text-lg font-bold">
                            <MirdyneMark className="h-5 w-5" />
                            {company.name}
                        </p>
                        <p className="mt-3 text-sm text-faint">{company.location}</p>
                    </div>
                    <ul className="grid gap-2 text-sm text-faint">
                        {footer.notes.map((note) => (
                            <li key={note}>{note}</li>
                        ))}
                    </ul>
                    <ul className="grid content-start gap-2 text-sm md:justify-items-end">
                        <li><ExternalLink href={links.briefing} className="footer-link">Request a briefing</ExternalLink></li>
                        <li><ExternalLink href={links.github} className="footer-link">PRISM on GitHub</ExternalLink></li>
                        <li className="text-faint">© {new Date().getFullYear()} {company.name}</li>
                    </ul>
                </div>
            </footer>
        </>
    );
}
