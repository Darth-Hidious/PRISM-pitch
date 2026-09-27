/**
 * A multivariate Hawkes process on a small network: the mathematics behind the supply-chain demo
 * (SupplyShock.tsx). Every number the demo shows comes from here.
 *
 * Node i's event rate:
 *
 *     λ_i(t) = μ_i + Σ_j Σ_{t_k^j < t} α_ij · β e^{−β (t − t_k^j)}
 *
 * α_ij is how many events at i one event at j sets off on average (the kernel integrates to α_ij), and
 * 1/β is the mean delay. A = [α_ij].
 *
 * One shock at node j leads, in expectation, to (I − A)⁻¹ e_j events at each node, the shock included:
 * the sum over generations I + A + A² + …, which converges exactly when the spectral radius ρ(A) < 1
 * (Hawkes 1971; Hawkes and Oakes 1974). Over time, the expected extra rate is
 * h(t) = β A e^{−β (I − A) t} e_j, the solution of h′ = −β (I − A) h with h(0) = β A e_j.
 */

export type Matrix = number[][];

export const identity = (n: number): Matrix => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

export const scale = (a: Matrix, k: number): Matrix => a.map((row) => row.map((v) => v * k));

export const matVec = (a: Matrix, v: number[]): number[] => a.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));

export function matMul(a: Matrix, b: Matrix): Matrix {
    const n = a.length;
    const m = b[0].length;
    const out: Matrix = Array.from({ length: n }, () => new Array<number>(m).fill(0));
    for (let i = 0; i < n; i++) {
        for (let k = 0; k < b.length; k++) {
            const aik = a[i][k];
            if (aik === 0) continue;
            for (let j = 0; j < m; j++) out[i][j] += aik * b[k][j];
        }
    }
    return out;
}

/** The largest absolute row sum: a norm, so ‖Aᵏ‖^(1/k) → ρ(A). */
const norm = (a: Matrix) => Math.max(...a.map((row) => row.reduce((s, x) => s + Math.abs(x), 0)));

/**
 * The spectral radius ρ(A), from Gelfand's formula ρ = lim ‖Aᵏ‖^(1/k), with k = 2⁴⁰ reached by squaring
 * forty times and rescaling as it goes. It needs no eigenvector, so it also holds for networks that
 * are not strongly connected, where power iteration can stall. 0 for a nilpotent matrix (no loops).
 */
export function spectralRadius(a: Matrix): number {
    let b = a;
    let logScale = 0;
    const steps = 40;
    for (let s = 0; s < steps; s++) {
        const n = norm(b);
        if (n === 0) return 0;
        b = scale(b, 1 / n);
        logScale += Math.log(n);
        b = matMul(b, b);
        logScale *= 2;
    }
    const n = norm(b);
    return n === 0 ? 0 : Math.exp((logScale + Math.log(n)) / 2 ** steps);
}

/** Solves M x = v by Gaussian elimination with partial pivoting. */
export function solve(m: Matrix, v: number[]): number[] {
    const n = m.length;
    const a = m.map((row, i) => [...row, v[i]]);
    for (let c = 0; c < n; c++) {
        let p = c;
        for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
        if (Math.abs(a[p][c]) < 1e-12) throw new Error('solve: the matrix is singular');
        [a[c], a[p]] = [a[p], a[c]];
        for (let r = 0; r < n; r++) {
            if (r === c) continue;
            const f = a[r][c] / a[c][c];
            if (f === 0) continue;
            for (let k = c; k <= n; k++) a[r][k] -= f * a[c][k];
        }
    }
    return a.map((row, i) => row[n] / row[i]);
}

/**
 * Expected events at every node after one shock at node j, the shock included: (I − A)⁻¹ e_j. Only
 * meaningful when ρ(A) < 1; beyond that the expectation is infinite.
 */
export function expectedCascade(a: Matrix, j: number): number[] {
    const n = a.length;
    const iMinusA = identity(n).map((row, r) => row.map((v, c) => v - a[r][c]));
    const e = new Array<number>(n).fill(0);
    e[j] = 1;
    return solve(iMinusA, e);
}

/**
 * The expected extra event rate at every node, over time, after one shock at node j at time 0:
 * h(t) = β A e^{−β (I − A) t} e_j, integrated from h′ = −β (I − A) h, h(0) = β A e_j with fourth-order
 * Runge–Kutta. Returns one row per time in `times` (ascending, starting at 0 or later).
 */
export function impulseResponse(a: Matrix, beta: number, j: number, times: number[], step = 0.05): number[][] {
    const n = a.length;
    let h = a.map((row) => beta * row[j]);
    const f = (x: number[]) => {
        const ax = matVec(a, x);
        return x.map((xi, i) => -beta * (xi - ax[i]));
    };
    const add = (x: number[], k: number[], s: number) => x.map((xi, i) => xi + s * k[i]);
    const out: number[][] = [];
    let t = 0;
    for (const target of times) {
        while (t < target - 1e-12) {
            const dt = Math.min(step, target - t);
            const k1 = f(h);
            const k2 = f(add(h, k1, dt / 2));
            const k3 = f(add(h, k2, dt / 2));
            const k4 = f(add(h, k3, dt));
            h = h.map((hi, i) => hi + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
            t += dt;
        }
        out.push([...h]);
    }
    if (out.length && out[0].length !== n) throw new Error('impulseResponse: size mismatch');
    return out;
}

/**
 * The chance that the cascade after one shock at node j reaches node p at all, exactly. Let q_k be the
 * chance that the cascade an event at k starts never reaches p. An event at k sets off Poisson(α_ik)
 * events at each node i, so q_k = exp(Σ_i α_ik (q_i − 1)) for k ≠ p, and q_p = 0. Iterating that from
 * q = 1 gives, after n steps, the chance of missing p for n generations, which falls to q as n grows.
 */
export function hitProbability(a: Matrix, j: number, p: number, tolerance = 1e-13, maxSteps = 1e6): number {
    const n = a.length;
    let q: number[] = Array.from({ length: n }, (_, k) => (k === p ? 0 : 1));
    for (let step = 0; step < maxSteps; step++) {
        let change = 0;
        q = q.map((qk, k) => {
            if (k === p) return 0;
            let s = 0;
            for (let i = 0; i < n; i++) s += a[i][k] * (q[i] - 1);
            const next = Math.exp(s);
            change = Math.max(change, Math.abs(next - qk));
            return next;
        });
        if (change < tolerance) break;
    }
    return 1 - q[j];
}

/** A Poisson draw (Knuth), fine for the small means α_ij takes here. */
export function poisson(rand: () => number, mean: number): number {
    if (mean <= 0) return 0;
    const limit = Math.exp(-mean);
    let k = 0;
    let p = rand();
    while (p > limit) {
        k++;
        p *= rand();
    }
    return k;
}

export interface CascadeEvent {
    node: number;
    /** Days after the shock. */
    time: number;
    /** The event that set this one off; -1 for the shock itself. */
    parent: number;
}

/**
 * One cascade after a shock at node j, drawn exactly with the process's branching structure (Hawkes and
 * Oakes 1974): every event at j sets off a Poisson(α_ij) number of events at each node i, each after an
 * Exp(β) delay, and each of those does the same. Stops at `maxEvents` (then `capped` is true), since near
 * ρ(A) = 1 a cascade can run very long.
 */
export function simulateCascade(a: Matrix, beta: number, j: number, rand: () => number, maxEvents = 20000) {
    const events: CascadeEvent[] = [{ node: j, time: 0, parent: -1 }];
    let capped = false;
    for (let e = 0; e < events.length; e++) {
        const { node, time } = events[e];
        for (let i = 0; i < a.length; i++) {
            const children = poisson(rand, a[i][node]);
            for (let c = 0; c < children; c++) {
                if (events.length >= maxEvents) {
                    capped = true;
                    break;
                }
                events.push({ node: i, time: time - Math.log(1 - rand()) / beta, parent: e });
            }
        }
        if (capped) break;
    }
    return { events, capped };
}

/** The value below which a share q of the sorted sample lies (nearest rank). */
export function quantile(sorted: number[], q: number): number {
    if (!sorted.length) return NaN;
    return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(q * sorted.length) - 1))];
}
