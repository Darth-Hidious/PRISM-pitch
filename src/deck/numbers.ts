/*
 * The problem, in plain arithmetic, the same as the website's: choose five of nine metals that all
 * melt above 1,650 °C (126 ways) and mix them in whole percent, each at least 1 % (C(99, 4) =
 * 3,764,376 ways). Nothing here is anyone's measurement.
 */
export const ALLOYS = 126 * 3_764_376; // 474,311,376
export const PER_DAY = 10;
/** Years to make every one once, at ten a day: about 130,000. */
export const YEARS_ALL = Math.round(ALLOYS / PER_DAY / 365.25 / 10_000) * 10_000;
/** One dot in the field stands for this many alloys. */
export const PER_DOT = 20_000;
export const N_DOTS = Math.round(ALLOYS / PER_DOT); // 23,716
/** One dot's worth of alloys, made at ten a day: about five and a half years. */
export const YEARS_PER_DOT = PER_DOT / PER_DAY / 365.25;

export const fmt = (v: number) => v.toLocaleString('en-GB');
