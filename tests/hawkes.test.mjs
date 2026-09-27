/**
 * The mathematics behind the supply-chain explorer (src/site/hawkes.ts), checked against results known in
 * closed form and against simulation, on the explorer's own network (src/site/supply-model.ts). Random
 * draws come from a seeded generator, so every run checks the same draws.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './load.mjs';

const H = await load('src/site/hawkes.ts');
const M = await load('src/site/supply-model.ts');
const { seeded } = await load('src/site/hooks.ts');

const BETA = 1 / M.MEAN_DELAY_DAYS;
const close = (actual, expected, tolerance, what) =>
    assert.ok(Math.abs(actual - expected) <= tolerance, `${what}: ${actual} is not within ${tolerance} of ${expected}`);
const sum = (v) => v.reduce((s, x) => s + x, 0);
const matVec = (a, v) => a.map((row) => sum(row.map((x, j) => x * v[j])));

test('spectral radius: known matrices', () => {
    close(H.spectralRadius([[0.5]]), 0.5, 1e-12, '1 × 1');
    close(H.spectralRadius([[2, 0], [0, 3]]), 3, 1e-9, 'diagonal');
    close(H.spectralRadius([[0, 1], [1, 0]]), 1, 1e-9, 'swap');
    // A cycle of three links: ρ = (0.5 · 0.8 · 0.9)^(1/3).
    close(H.spectralRadius([[0, 0, 0.9], [0.5, 0, 0], [0, 0.8, 0]]), Math.cbrt(0.36), 1e-9, 'three-cycle');
    // Far from symmetric, where the norm alone says 100.5: the eigenvalues are 1 and 0.5.
    close(H.spectralRadius([[1, 100], [0, 0.5]]), 1, 1e-6, 'triangular');
    // No loops at all: every cascade stops.
    assert.equal(H.spectralRadius([[0, 1, 0], [0, 0, 1], [0, 0, 0]]), 0);
    // The 2 × 2 case in closed form: ρ = (tr + √(tr² − 4 det)) / 2 for real eigenvalues.
    const tr = 0.4;
    const det = 0.3 * 0.1 - 0.4 * 0.2;
    close(H.spectralRadius([[0.3, 0.4], [0.2, 0.1]]), (tr + Math.sqrt(tr * tr - 4 * det)) / 2, 1e-9, '2 × 2');
});

test('the explorer’s matrix: ρ(A) is exactly the value the slider sets', () => {
    close(H.spectralRadius(M.BASE), 1, 1e-9, 'ρ(BASE)');
    for (const k of [0.3, 0.5, 0.85, 0.95]) close(H.spectralRadius(H.scale(M.BASE, k)), k, 1e-9, `ρ(${k} · BASE)`);
    // Every link the network draws is in A, and nothing else is, apart from the diagonal.
    const n = M.NODES.length;
    const links = new Set(M.LINKS.map((l) => `${M.index(l.to)},${M.index(l.from)}`));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) assert.ok(M.BASE[i][j] > 0, `no self-excitation at ${M.NODES[i].id}`);
            else assert.equal(M.BASE[i][j] > 0, links.has(`${i},${j}`), `A[${i}][${j}]`);
        }
    }
});

test('hit probability: closed forms, and the equation it solves', () => {
    // A chain j → p, one link of weight α: hit with chance 1 − e^{−α}.
    close(H.hitProbability([[0, 0], [0.7, 0]], 0, 1), 1 - Math.exp(-0.7), 1e-12, 'chain');
    // The shock is already at p.
    assert.equal(H.hitProbability([[0.5]], 0, 0), 1);
    // No path from j to p: never hit.
    assert.equal(H.hitProbability([[0, 0.9], [0, 0]], 0, 1), 0);
    // With self-excitation s at j, q = 1 − hit solves q = exp(s (q − 1) − α).
    const s = 0.5;
    const alpha = 0.3;
    const q = 1 - H.hitProbability([[s, 0], [alpha, 0]], 0, 1);
    close(q, Math.exp(s * (q - 1) - alpha), 1e-12, 'fixed point');
    // And, by Jensen's inequality, q ≥ exp(−α · the expected number of events at j) = exp(−α / (1 − s)).
    assert.ok(q >= Math.exp(-alpha / (1 - s)) - 1e-12, 'Jensen');
});

test('simulation: cascades match the exact results', () => {
    const A = H.scale(M.BASE, 0.8);
    const j = M.SUPPLIERS[0].i;
    const runs = 20000;
    const rand = seeded(2024);
    const sizes = [];
    const hits = M.PROGRAMMES.map(() => 0);
    let delays = 0;
    let links = 0;
    for (let r = 0; r < runs; r++) {
        const { events, capped } = H.simulateCascade(A, BETA, j, rand);
        assert.equal(capped, false);
        sizes.push(events.length);
        M.PROGRAMMES.forEach((p, k) => events.some((e) => e.node === p.i) && hits[k]++);
        events.forEach((e, k) => {
            if (k === 0) return assert.deepEqual(e, { node: j, time: 0, parent: -1 });
            const parent = events[e.parent];
            assert.ok(e.parent >= 0 && e.parent < k, 'an event comes after the event that set it off');
            assert.ok(e.time > parent.time, 'and later in time');
            assert.ok(A[e.node][parent.node] > 0, 'along a link of the network');
            delays += e.time - parent.time;
            links++;
        });
    }
    // The mean size: within four standard errors of the exact mean, the sum over generations
    // (I + A + A² + …) e_j, which shrink like 0.8ⁿ.
    let generation = A.map((_, i) => (i === j ? 1 : 0));
    let exact = 1;
    for (let g = 0; g < 400; g++) {
        generation = matVec(A, generation);
        exact += sum(generation);
    }
    const mean = sum(sizes) / runs;
    const sd = Math.sqrt(sum(sizes.map((x) => (x - mean) ** 2)) / (runs - 1));
    close(mean, exact, (4 * sd) / Math.sqrt(runs), 'mean cascade size');
    // The chance of reaching each programme, which the explorer shows.
    M.PROGRAMMES.forEach((p, k) => {
        const chance = H.hitProbability(A, j, p.i);
        close(hits[k] / runs, chance, 4 * Math.sqrt((chance * (1 - chance)) / runs), `hit ${p.id}`);
    });
    // The delays are exponential with mean 1/β.
    close(delays / links, M.MEAN_DELAY_DAYS, (4 * M.MEAN_DELAY_DAYS) / Math.sqrt(links), 'mean delay');
});

test('a cascade stops at the cap it is given', () => {
    // Twenty events per event: dying out before 50 has a chance of about e^−20.
    const { events, capped } = H.simulateCascade([[20]], BETA, 0, seeded(3), 50);
    assert.equal(capped, true);
    assert.equal(events.length, 50);
});

test('Poisson draws', () => {
    const rand = seeded(11);
    const draws = Array.from({ length: 50000 }, () => H.poisson(rand, 0.7));
    const mean = sum(draws) / draws.length;
    const variance = sum(draws.map((x) => (x - mean) ** 2)) / (draws.length - 1);
    close(mean, 0.7, 0.02, 'mean');
    close(variance, 0.7, 0.03, 'variance');
    assert.equal(H.poisson(rand, 0), 0);
});
