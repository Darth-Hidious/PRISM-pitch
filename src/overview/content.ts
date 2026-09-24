/**
 * All copy for the PRISM overview page (/overview).
 *
 * Every claim here is taken from the investor deck in src/slides. Anything
 * not yet confirmed for public use carries `pending`, which renders a visible
 * "To confirm" tag. Resolve every `pending` before this page goes live.
 */

export interface Story {
    title: string;
    text: string;
}

export interface Step {
    id: string;
    number: string;
    name: string;
    lead: string;
    stories: Story[];
}

export interface Credential {
    name: string;
    detail: string;
    pending?: string;
}

export interface Question {
    q: string;
    a: string;
    pending?: string;
}

export const links = {
    briefing: 'https://forms.office.com/r/6jHPzeKYYT',
    github: 'https://github.com/Darth-Hidious/PRISM',
};

export const company = {
    name: 'Mirdyne',
    product: 'PRISM',
    location: 'Giessen, Hessen, Germany',
};

export const hero = {
    eyebrow: 'PRISM by Mirdyne',
    title: 'Alloy design, synthesis and qualification in one loop.',
    intro:
        'PRISM is Mirdyne’s platform for developing new alloys. It screens candidate compositions before any powder is weighed, so most failures happen in simulation, not in the lab. Then it learns from every lab result that comes back.',
};

export const goal = {
    statement:
        'Replace trial-and-error in materials development with a closed loop that learns from each batch.',
    firstTarget:
        'First target: refractory high-entropy alloys for liquid-rocket-engine preburners, replacing legacy Monel K500.',
};

export const credentials: { funding: Credential[]; partners: Credential[] } = {
    funding: [
        {
            name: 'European Space Agency',
            detail: 'Initial development of PRISM funded under the Future Launchers Preparatory Programme (FLPP), FIRST! Simulation & Intelligence.',
        },
        {
            name: 'Hessen Ideen',
            detail: 'AI special prize, 2026.',
            pending: 'exact award name and wording',
        },
    ],
    partners: [
        {
            name: 'Fraunhofer IAPT',
            detail: 'Additive manufacturing calibration.',
            pending: 'permission to name publicly',
        },
        {
            name: 'ArianeGroup',
            detail: 'Requirements and testing.',
            pending: 'permission to name publicly, and whether this is a partnership or interest',
        },
    ],
};

export const steps: Step[] = [
    {
        id: 'design',
        number: '01',
        name: 'Design',
        lead: 'Search the composition space in simulation first.',
        stories: [
            {
                title: 'Failures happen in simulation',
                text: 'PRISM screens millions of candidate compositions before any powder is weighed, so most dead ends are ruled out before they reach the lab.',
            },
            {
                title: 'Beyond conventional screening',
                text: 'It can reach metastable alloys that equilibrium-based screening rules out.',
            },
            {
                title: 'Grounded in what is already known',
                text: 'Each campaign draws on published literature, patents and instrument data.',
            },
        ],
    },
    {
        id: 'make',
        number: '02',
        name: 'Make',
        lead: 'Turn the best candidates into recipes a lab can run.',
        stories: [
            {
                title: 'Recipes, not just rankings',
                text: 'For each candidate, PRISM specifies precursors, temperatures and thermal profiles.',
            },
            {
                title: 'Built for automated labs',
                text: 'Recipes are structured for robotic synthesis and automated characterisation.',
            },
            {
                title: 'Every result feeds back',
                text: 'Each lab result becomes training data for the next round, so the loop improves with every batch.',
            },
        ],
    },
    {
        id: 'qualify',
        number: '03',
        name: 'Qualify',
        lead: 'Prove the material against your requirements.',
        stories: [
            {
                title: 'Measured against your requirements',
                text: 'Every campaign is defined and accepted against the customer’s own requirements.',
            },
            {
                title: 'Traceable data',
                text: 'Results stay traceable to the data behind them, with versioned releases.',
            },
            {
                title: 'Handed to your team',
                text: 'Qualified process documents are handed over to your own engineers.',
            },
        ],
    },
];

export const questions: Question[] = [
    {
        q: 'What is PRISM?',
        a: 'PRISM is Mirdyne’s materials discovery platform. It designs candidate alloys in simulation, turns the best ones into lab recipes, and learns from every result, so new materials reach qualification with fewer physical trial runs.',
    },
    {
        q: 'Who is behind PRISM?',
        a: 'Mirdyne, based in Giessen, Germany, develops and operates PRISM. Its initial development was funded by the European Space Agency under FLPP (FIRST! Simulation & Intelligence). The technology concept originated at MARC27.',
        pending: 'whether to mention Bimo Tech',
    },
    {
        q: 'Why now?',
        a: 'Prediction has outrun validation. AI models have proposed more than 2.2 million potentially stable compositions, but only 736 have been verified in physical labs, and new alloys still take 10 to 20 years to reach the market. The bottleneck is no longer finding candidates. It is making and qualifying them.',
    },
    {
        q: 'How does it work?',
        a: 'One loop with three steps: design in simulation, make in the lab, qualify against your requirements. Every lab result improves the next round of designs. We walk through the technical approach in a private briefing.',
    },
    {
        q: 'Does PRISM replace materials engineers?',
        a: 'No. It takes the trial-and-error off their desks. Your engineers set the requirements and sign off every result.',
    },
    {
        q: 'How do we work together?',
        a: 'Most engagements start with a program: one experimental campaign against your requirements. From there: a pilot with calibration and a reference run, deployment on your hardware under your sign-off process, ongoing support, and transfer of qualified process documents to your team.',
    },
    {
        q: 'Is PRISM open source?',
        a: 'The prediction and ranking tools are open source and free to use. Mirdyne earns revenue by running programs, pilots and deployments with customers.',
    },
];

export const contact = {
    title: 'Work with us',
    text: 'Most engagements start with a program: one experimental campaign against your requirements.',
    cta: 'Request a briefing',
};

export const footer = {
    notes: [
        'Initial development of PRISM funded by the European Space Agency under FLPP.',
        'Technology concept originated at MARC27.',
    ],
};
