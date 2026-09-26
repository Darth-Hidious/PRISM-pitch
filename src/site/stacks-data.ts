import type { Maturity } from '../ds/MaturityPill';

/**
 * The five PRISM stacks and what is in each, with how far each part has come. The website's platform
 * page and the investor deck both draw from this.
 */

export interface Layer {
    name: string;
    detail: string;
    maturity: Maturity;
}

export interface StackDef {
    id: string;
    name: string;
    short: string;
    question: string;
    lead: string;
    answer: string;
    limit: string;
    layers: Layer[];
    photo?: { src: string; alt: string; caption: string };
}

export const STACKS: StackDef[] = [
    {
        id: 'research',
        name: 'Research stack',
        short: 'Research',
        question: 'Out of millions of possible mixes, which are worth making?',
        lead: 'A short list, ranked, with how sure we are.',
        answer: 'AI suggests ideas. Physics simulations throw out what cannot work, before any powder is weighed.',
        limit: 'It cannot see what a real machine does to the alloy. The manufacturing stack checks that.',
        layers: [
            {
                name: 'Knowledge graph',
                detail: 'Papers, patents and lab data, linked, each with its source.',
                maturity: 'prototype',
            },
            {
                name: 'Idea generator',
                detail: 'AI that suggests new mixes that are physically possible.',
                maturity: 'prototype',
            },
            {
                name: 'Physics filter',
                detail: 'Fast simulations first, then exact ones. Most ideas stop here, cheaply.',
                maturity: 'prototype',
            },
            {
                name: 'Smart experiment choice',
                detail: 'Each experiment is picked for what it will teach us.',
                maturity: 'prototype',
            },
            {
                name: 'Safe settings',
                detail: 'Settings that still work when powder and machine vary.',
                maturity: 'prototype',
            },
        ],
    },
    {
        id: 'harness',
        name: 'Harness stack',
        short: 'Harness',
        question: 'Who runs the work between the AI models?',
        lead: 'The harness.',
        answer: 'AI models only suggest. The harness plans each round, runs the tools, scores the results and remembers what failed.',
        limit: 'It never makes the final call. A named engineer signs off what leaves the loop.',
        layers: [
            {
                name: 'Planner',
                detail: 'Decides what to try next, from the last results.',
                maturity: 'prototype',
            },
            {
                name: 'Playbooks',
                detail: 'What each round learned, failures included.',
                maturity: 'prototype',
            },
            {
                name: 'Tool connections',
                detail: 'One way in to simulations, lab instruments and factory data.',
                maturity: 'prototype',
            },
            {
                name: 'Scorer',
                detail: 'Scores every result against the requirement.',
                maturity: 'prototype',
            },
            {
                name: 'Human sign-off',
                detail: 'AI suggests, engineers decide. Ideas without a source are rejected.',
                maturity: 'prototype',
            },
        ],
    },
    {
        id: 'autonomy',
        name: 'Autonomy stack',
        short: 'Autonomy',
        question: 'How do experiments stop being the slow part?',
        lead: 'Robots do the repetitive steps. People stay in charge.',
        answer: 'Robots weigh and heat, instruments measure on the spot, and the data flows straight back.',
        limit: 'Most of this is still being built. The recipe writer works as a prototype today.',
        layers: [
            {
                name: 'Recipe writer',
                detail: 'Turns an idea into steps a lab can run.',
                maturity: 'prototype',
            },
            {
                name: 'Robot lab',
                detail: 'Robot arms weigh powder and move samples through the furnace.',
                maturity: 'development',
            },
            {
                name: 'Automatic measurement',
                detail: 'X-ray patterns on the spot, read by AI.',
                maturity: 'development',
            },
            {
                name: 'Probes',
                detail: 'Our own sensors, recording calibrated data at the machine.',
                maturity: 'development',
            },
            {
                name: 'Machine control',
                detail: 'Software drives the instruments, so the loop never waits.',
                maturity: 'development',
            },
            {
                name: 'Field robots',
                detail: 'The same autonomy outside the lab, without GPS. For civil and defence use.',
                maturity: 'development',
            },
        ],
    },
    {
        id: 'manufacturing',
        name: 'Manufacturing and test stack',
        short: 'Manufacturing and test',
        question: 'Can it really be made? Does it hold up?',
        lead: 'Only a real test can say.',
        answer: 'Most computer-designed materials stop at the recipe. We melt and 3D-print the best ideas, then test them.',
        photo: {
            src: '/img/spark-furnace-wide.webp',
            alt: 'A vacuum-arc furnace, open: the steel chamber with its viewports lifted above the round copper hearth.',
            caption: 'The vacuum-arc furnace, open.',
        },
        limit: 'A test sample is not a finished part. Certification is the goal, not a claim.',
        layers: [
            {
                name: 'Powder and melting',
                detail: 'New alloys, prepared and melted in a vacuum-arc furnace.',
                maturity: 'in-use',
            },
            {
                name: 'Printability check',
                detail: 'Can it be 3D-printed? Checked before any build starts.',
                maturity: 'prototype',
            },
            {
                name: 'Metal 3D printing',
                detail: 'Industrial laser printing from metal powder, safe settings mapped.',
                maturity: 'in-use',
            },
            {
                name: 'Testing',
                detail: 'Density and inner structure first, then strength and heat.',
                maturity: 'in-use',
            },
            {
                name: 'Certification file',
                detail: 'The evidence certification needs, from test sample to real part.',
                maturity: 'target',
            },
        ],
    },
    {
        id: 'evidence-stack',
        name: 'Evidence stack',
        short: 'Evidence',
        question: 'Where did this result come from, and who may see it?',
        lead: 'Every result carries its source, its owner and its rules.',
        answer: 'Every requirement, design, sample, test and decision is linked, like a family tree.',
        limit: 'Tracing and export labels work today. Automatic enforcement is being built.',
        layers: [
            {
                name: 'Traceability',
                detail: 'Every result records its inputs: data, code and model versions.',
                maturity: 'in-use',
            },
            {
                name: 'Linked records',
                detail: 'Requirement to decision, linked instead of scattered in files.',
                maturity: 'prototype',
            },
            {
                name: 'Data rights',
                detail: 'Each piece of data carries its owner and its allowed uses.',
                maturity: 'development',
            },
            {
                name: 'Controlled sharing',
                detail: 'Nothing is shared by accident. Every release is signed.',
                maturity: 'development',
            },
            {
                name: 'Export control',
                detail: 'Export rules on every deliverable today; automatic checks next.',
                maturity: 'in-use',
            },
        ],
    },
];
