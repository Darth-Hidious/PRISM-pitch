import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import MirdyneMark from '../components/MirdyneMark';
import Disclosure from './Disclosure';
import NebulaCanvas from './NebulaCanvas';
import UtcClock from './UtcClock';
import designArt from './art/design.jpg';
import makeArt from './art/make.jpg';
import qualifyArt from './art/qualify.jpg';
import { company, contact, credentials, faq, footer, goal, hero, links, mission, steps, strip } from './content';
import type { Step } from './content';

/** Each step's image is 2:1; its three cards show different horizontal slices of it. */
const stepArt: Record<Step['id'], { src: string; positions: [number, number, number] }> = {
    design: { src: designArt, positions: [0, 50, 100] },
    make: { src: makeArt, positions: [55, 80, 100] },
    qualify: { src: qualifyArt, positions: [0, 30, 60] },
};

function Pending({ what }: { what: string }) {
    return <span className="pending">To confirm: {what}</span>;
}

function ExternalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
        </a>
    );
}

function Divider() {
    return <div className="divider" aria-hidden="true" />;
}

/** Centred heading, divider and text, the pattern Genesis uses for its intro sections. */
function CentredSection({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
    return (
        <section id={id} className="section-tight" aria-labelledby={`${id}-title`}>
            <div className="container-x text-center" data-reveal>
                <h2 id={`${id}-title`} className="section-title">{heading}</h2>
                <Divider />
                {children}
            </div>
        </section>
    );
}

function StepSection({ step }: { step: Step }) {
    const art = stepArt[step.id];
    return (
        <section id={step.id} className="section-tight" aria-labelledby={`${step.id}-title`}>
            <div className="container-x">
                <div className="text-center" data-reveal>
                    <h2 id={`${step.id}-title`} className="section-title">{step.name}</h2>
                    <Divider />
                    <p className="mx-auto max-w-xl text-lg text-muted">{step.description}</p>
                </div>
                <div className="mt-12 grid gap-4 md:grid-cols-3">
                    {step.stories.map((story, i) => (
                        <article key={story.label} className="story-card" data-reveal>
                            <div
                                className="story-card-bg"
                                style={{ backgroundImage: `url(${art.src})`, backgroundPosition: `${art.positions[i]}% 50%` }}
                                aria-hidden="true"
                            />
                            <div className="story-card-shade" aria-hidden="true" />
                            <div className="story-card-content">
                                <h3 className="text-2xl font-bold">{story.label}</h3>
                                <div>
                                    <Disclosure summary={story.title} buttonClassName="story-card-toggle">
                                        <p className="pt-3 text-sm leading-relaxed text-muted">{story.text}</p>
                                    </Disclosure>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Overview() {
    const heroArtRef = useRef<HTMLDivElement>(null);

    // Reveal-on-scroll and a slow parallax on the hero background.
    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const revealables = document.querySelectorAll<HTMLElement>('[data-reveal]');
        if (reduceMotion) {
            revealables.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                }
            },
            { rootMargin: '0px 0px -8% 0px' },
        );
        revealables.forEach((el) => observer.observe(el));

        let frame = 0;
        const onScroll = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const y = window.scrollY;
                if (heroArtRef.current && y < window.innerHeight * 1.2) {
                    heroArtRef.current.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
                }
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <>
            <a href="#main" className="skip-link">Skip to content</a>

            <div className="top-strip">
                <div className="container-x flex h-9 items-center justify-between gap-4">
                    <span className="flex items-center gap-2 font-semibold tracking-[0.2em]">
                        <MirdyneMark className="h-3 w-3" />
                        {company.name.toUpperCase()}
                    </span>
                    <span className="hidden font-semibold tracking-[0.2em] uppercase sm:block">{strip.statement}</span>
                    <UtcClock className="font-mono tracking-[0.08em] text-muted" />
                </div>
            </div>

            <main id="main">
                <section id="top" className="relative min-h-[100svh] overflow-hidden" aria-labelledby="hero-title">
                    <div ref={heroArtRef} className="hero-art absolute inset-0" aria-hidden="true">
                        <NebulaCanvas className="h-full w-full" />
                    </div>
                    <div className="hero-fade absolute inset-0" aria-hidden="true" />
                    <div className="container-x relative pt-[16vh] pb-24" data-reveal>
                        <p className="flex items-center gap-3 text-[28px] font-bold md:text-[36px]">
                            <span className="grid h-11 w-11 place-items-center rounded-full border border-white/40 md:h-12 md:w-12">
                                <MirdyneMark className="h-4 w-4 md:h-5 md:w-5" />
                            </span>
                            {company.product}
                        </p>
                        <h1 id="hero-title" className="mt-6 max-w-[21ch] text-[38px] leading-[1.06] font-bold tracking-[-0.02em] text-balance md:text-[56px] lg:text-[60px]">
                            {hero.title}
                        </h1>
                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <ExternalLink href={links.briefing} className="button">Request a briefing</ExternalLink>
                            <a href="#design" className="button button-ghost">How it works</a>
                        </div>
                    </div>
                    <div className="container-x absolute inset-x-0 bottom-0 flex items-center justify-end pb-8 font-mono text-[11px] tracking-[0.12em] text-faint uppercase sm:justify-between">
                        <span className="hidden sm:inline">{hero.caption}</span>
                        <a href="#mission" className="scroll-cue">Scroll</a>
                    </div>
                </section>

                <CentredSection id="mission" heading={mission.heading}>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted">{mission.text}</p>
                </CentredSection>

                <CentredSection id="goal" heading={goal.heading}>
                    <p className="mx-auto max-w-2xl text-2xl leading-snug font-semibold text-balance md:text-[28px]">{goal.text}</p>
                    <p className="mx-auto mt-6 max-w-2xl text-base text-muted">{goal.firstTarget}</p>
                </CentredSection>

                <CentredSection id="credentials" heading={credentials.heading}>
                    <ul className="mt-2 grid gap-px overflow-hidden rounded-md border border-line bg-line text-left sm:grid-cols-2 lg:grid-cols-4">
                        {credentials.items.map((item) => (
                            <li key={item.name} className="bg-black p-6">
                                <p className="text-lg font-semibold">{item.name}</p>
                                <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
                                {item.pending && <Pending what={item.pending} />}
                            </li>
                        ))}
                    </ul>
                </CentredSection>

                {steps.map((step) => (
                    <StepSection key={step.id} step={step} />
                ))}

                <section id="faq" className="section border-t border-line" aria-labelledby="faq-title">
                    <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                        <h2 id="faq-title" className="section-title lg:max-w-[10ch]" data-reveal>{faq.heading}</h2>
                        <div className="border-t border-line" data-reveal>
                            {faq.questions.map((item, i) => (
                                <div key={item.q} className="border-b border-line">
                                    <Disclosure summary={item.q} heading="h3" defaultOpen={i === 0} buttonClassName="faq-toggle">
                                        <div className="pb-6">
                                            <p className="max-w-2xl text-base leading-relaxed text-muted">{item.a}</p>
                                            {item.pending && <Pending what={item.pending} />}
                                        </div>
                                    </Disclosure>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer border-t border-line">
                <div className="container-x py-20" data-reveal>
                    <h2 className="text-[30px] leading-tight font-bold md:text-[40px]">{contact.heading}</h2>
                    <p className="mt-3 text-lg font-bold text-muted">{contact.subheading}</p>
                    <ExternalLink href={links.briefing} className="button mt-8">{contact.cta}</ExternalLink>
                </div>
                <div className="container-x grid gap-8 border-t border-line py-10 text-xs md:grid-cols-3">
                    <p className="flex items-center gap-2 font-semibold tracking-[0.2em]">
                        <MirdyneMark className="h-3 w-3" />
                        {company.name.toUpperCase()}
                        <span className="font-normal tracking-normal text-faint">· {company.location}</span>
                    </p>
                    <ul className="grid gap-1 text-faint">
                        {footer.notes.map((note) => (
                            <li key={note}>{note}</li>
                        ))}
                    </ul>
                    <ul className="grid content-start gap-1 md:justify-items-end">
                        <li><ExternalLink href={links.briefing} className="footer-link">Request a briefing</ExternalLink></li>
                        <li><ExternalLink href={links.github} className="footer-link">PRISM on GitHub</ExternalLink></li>
                        <li className="text-faint">© {new Date().getFullYear()} {company.name}</li>
                    </ul>
                </div>
            </footer>
        </>
    );
}
