import type { PopulationId } from '../types';

export const MIN_TEMP_K = 2200;
export const MAX_TEMP_K = 42000;

const LUT_SIZE = 512;
const INV_T_MIN = 1 / MAX_TEMP_K;
const INV_T_MAX = 1 / MIN_TEMP_K;

// Second radiation constant c2 = h * c / k_B in um * K (CODATA 2018)
const C2_UM_K = 14387.76877;

export interface SpectralSample {
  tempK: number;
  luminosity: number;
  size: number;
}

/**
 * Analytic piecewise-Gaussian approximation to CIE 1931 2-deg color matching functions
 * (Wyman, Sloan, & Shirley 2013) evaluated at wavelength in nanometers.
 */
function cie1931X(waveNm: number): number {
  const t1 = (waveNm - 442.0) * (waveNm < 442.0 ? 0.0624 : 0.0374);
  const t2 = (waveNm - 599.8) * (waveNm < 599.8 ? 0.0264 : 0.0323);
  const t3 = (waveNm - 501.1) * (waveNm < 501.1 ? 0.0490 : 0.0382);
  return (
    0.362 * Math.exp(-0.5 * t1 * t1) +
    1.056 * Math.exp(-0.5 * t2 * t2) -
    0.065 * Math.exp(-0.5 * t3 * t3)
  );
}

function cie1931Y(waveNm: number): number {
  const t1 = (waveNm - 568.8) * (waveNm < 568.8 ? 0.0213 : 0.0247);
  const t2 = (waveNm - 530.9) * (waveNm < 530.9 ? 0.0613 : 0.0322);
  return 0.821 * Math.exp(-0.5 * t1 * t1) + 0.286 * Math.exp(-0.5 * t2 * t2);
}

function cie1931Z(waveNm: number): number {
  const t1 = (waveNm - 437.0) * (waveNm < 437.0 ? 0.0845 : 0.0278);
  const t2 = (waveNm - 459.0) * (waveNm < 459.0 ? 0.0385 : 0.0725);
  return 1.217 * Math.exp(-0.5 * t1 * t1) + 0.681 * Math.exp(-0.5 * t2 * t2);
}

/**
 * Integrates Planck's blackbody spectrum over 380..780 nm against CIE 1931 XYZ
 * and transforms to linear Rec.709/sRGB (D65 white point), normalized by peak channel.
 */
function integratePlanckLinearRgb(tempK: number): [number, number, number] {
  let X = 0;
  let Y = 0;
  let Z = 0;

  for (let waveNm = 380; waveNm <= 780; waveNm += 5) {
    const lambdaUm = waveNm * 0.001;
    const lambda5 = lambdaUm * lambdaUm * lambdaUm * lambdaUm * lambdaUm;
    const exponent = C2_UM_K / (lambdaUm * tempK);
    const radiance = 1 / (lambda5 * Math.expm1(exponent));

    X += radiance * cie1931X(waveNm);
    Y += radiance * cie1931Y(waveNm);
    Z += radiance * cie1931Z(waveNm);
  }

  // IEC 61966-2-1 XYZ -> linear sRGB (D65)
  let r = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
  let g = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
  let b = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;

  r = Math.max(0, r);
  g = Math.max(0, g);
  b = Math.max(0, b);

  const peak = Math.max(r, g, b, 1e-8);
  return [r / peak, g / peak, b / peak];
}

// Precompute LUT indexed uniformly in inverse temperature (1/T) for smooth high-precision lookup
const BLACKBODY_LUT = new Float32Array(LUT_SIZE * 3);
for (let i = 0; i < LUT_SIZE; i++) {
  const u = i / (LUT_SIZE - 1);
  const invT = INV_T_MIN + u * (INV_T_MAX - INV_T_MIN);
  const tempK = 1 / invT;
  const [r, g, b] = integratePlanckLinearRgb(tempK);
  const base = i * 3;
  BLACKBODY_LUT[base] = r;
  BLACKBODY_LUT[base + 1] = g;
  BLACKBODY_LUT[base + 2] = b;
}

/**
 * Clamps a stellar effective temperature to the supported physical range [2200K, 42000K].
 */
export function clampTempK(tempK: number): number {
  if (!Number.isFinite(tempK)) return 5778;
  return Math.min(MAX_TEMP_K, Math.max(MIN_TEMP_K, tempK));
}

/**
 * Converts a stellar effective temperature in Kelvin [2200K..42000K] to physically
 * calibrated linear sRGB chromaticity [0..1] derived from Planck's law and CIE 1931.
 */
export function kelvinToLinearRgb(tempK: number): [number, number, number] {
  const clamped = clampTempK(tempK);
  const invT = 1 / clamped;
  const u = (invT - INV_T_MIN) / (INV_T_MAX - INV_T_MIN);
  const scaled = Math.min(LUT_SIZE - 1, Math.max(0, u * (LUT_SIZE - 1)));
  const i0 = Math.floor(scaled);
  const i1 = Math.min(LUT_SIZE - 1, i0 + 1);
  const frac = scaled - i0;

  const b0 = i0 * 3;
  const b1 = i1 * 3;
  return [
    BLACKBODY_LUT[b0] + (BLACKBODY_LUT[b1] - BLACKBODY_LUT[b0]) * frac,
    BLACKBODY_LUT[b0 + 1] + (BLACKBODY_LUT[b1 + 1] - BLACKBODY_LUT[b0 + 1]) * frac,
    BLACKBODY_LUT[b0 + 2] + (BLACKBODY_LUT[b1 + 2] - BLACKBODY_LUT[b0 + 2]) * frac,
  ];
}

function linearToSrgbChannel(c: number): number {
  const v = Math.min(1, Math.max(0, c));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

/**
 * Converts stellar temperature in Kelvin to gamma-encoded sRGB [0..1].
 */
export function kelvinToSrgb(tempK: number): [number, number, number] {
  const [r, g, b] = kelvinToLinearRgb(tempK);
  return [linearToSrgbChannel(r), linearToSrgbChannel(g), linearToSrgbChannel(b)];
}

/**
 * Box-Muller normal sample with variance 1 clamped gently against extreme outliers.
 */
function sampleNormal(rand: () => number): number {
  const u1 = Math.max(1e-7, rand());
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Samples a power-law stellar mass / luminosity proxy inspired by Kroupa/Salpeter IMFs.
 * Returns normalized t in [0, 1] skewed toward lower-mass stars unless steepness is low.
 */
function samplePowerLaw(rand: () => number, alpha: number): number {
  const u = Math.max(1e-6, rand());
  // Inverse transform on [1, 10] mapped to [0, 1]
  const p = 1 - alpha;
  const minPow = 1;
  const maxPow = Math.pow(12, p);
  const val = Math.pow(minPow + u * (maxPow - minPow), 1 / p);
  return Math.min(1, Math.max(0, (val - 1) / 11));
}

/**
 * Samples realistic effective temperature (K), HDR visual luminosity weight, and sprite size
 * tailored to each Milky Way stellar population using Kroupa/Salpeter-inspired distributions.
 *
 * @param population PopulationId (0=Bulge/Bar, 1=Spiral OB, 2=Thin Disk, 3=Thick Disk, 4=Halo/GC)
 * @param rand Deterministic [0, 1) PRNG callback
 * @param coreProximity Optional [0, 1] weight indicating proximity to the Nuclear Star Cluster
 * @param out Optional preallocated sample object to avoid per-star allocations
 */
export function samplePopulationStar(
  population: PopulationId,
  rand: () => number,
  coreProximity = 0,
  out: SpectralSample = { tempK: 5778, luminosity: 1, size: 1 }
): SpectralSample {
  const write = (tempK: number, luminosity: number, size: number): SpectralSample => {
    out.tempK = tempK;
    out.luminosity = luminosity;
    out.size = size;
    return out;
  };
  const u = rand();

  switch (population) {
    case 0: {
      // Bulge & Bar: dominated by metal-rich K/M giants & red clump (3000-5200K),
      // plus luminous nuclear cluster young/hot stars right near Sgr A* (coreProximity > 0).
      if (coreProximity > 0.2 && rand() < 0.22 * coreProximity) {
        const tempK = clampTempK(11000 + Math.pow(rand(), 1.4) * 24000);
        const luminosity = 2.6 + Math.pow(rand(), 2.2) * 8.5;
        const size = 1.4 + Math.min(1.6, luminosity * 0.14);
        return write(tempK, luminosity, size);
      }

      if (u < 0.54) {
        // K-giant / Red Clump core (~4100-5000K)
        const tempK = clampTempK(4550 + sampleNormal(rand) * 380);
        const lumBoost = 1 + coreProximity * 0.75;
        const luminosity = (0.55 + Math.pow(rand(), 1.6) * 2.1) * lumBoost;
        const size = 0.9 + Math.min(1.2, luminosity * 0.25);
        return write(tempK, luminosity, size);
      }
      if (u < 0.88) {
        // Cool M/K RGB & AGB giants (2850-3950K)
        const tempK = clampTempK(3450 + sampleNormal(rand) * 320);
        const giantTail = Math.pow(rand(), 2.1);
        const luminosity = (0.75 + giantTail * 4.2) * (1 + coreProximity * 0.6);
        const size = 1.05 + Math.min(1.5, luminosity * 0.22);
        return write(tempK, luminosity, size);
      }
      if (u < 0.965) {
        // Older G/F turnoff & subgiants (4900-6000K)
        const tempK = clampTempK(5400 + sampleNormal(rand) * 340);
        const luminosity = 0.4 + rand() * 0.8;
        const size = 0.85 + rand() * 0.35;
        return write(tempK, luminosity, size);
      }
      // Small population of bulge blue stragglers / EHB stars (6500-9800K)
      const tempK = clampTempK(7400 + rand() * 2400);
      const luminosity = 0.85 + rand() * 1.9;
      const size = 1.1 + rand() * 0.55;
      return write(tempK, luminosity, size);
    }

    case 1: {
      // Spiral Arm Young (OB associations, H-II clusters, young A/B stars):
      // Dominated by hot O/B/A stars (9000-38000K) following Salpeter IMF slope -2.35
      if (u < 0.16) {
        // Massive O-type & early B supergiants (22000-40500K)
        const salp = samplePowerLaw(rand, 2.35);
        const tempK = clampTempK(22500 + (1 - salp) * 18000);
        const luminosity = 3.8 + Math.pow(1 - salp, 1.5) * 11.5;
        const size = 1.65 + Math.min(1.65, luminosity * 0.11);
        return write(tempK, luminosity, size);
      }
      if (u < 0.62) {
        // Main-sequence B stars (10500-22000K)
        const t = Math.pow(rand(), 1.35);
        const tempK = clampTempK(10500 + t * 11500);
        const luminosity = 1.3 + t * 3.8;
        const size = 1.15 + Math.min(1.25, luminosity * 0.19);
        return write(tempK, luminosity, size);
      }
      if (u < 0.88) {
        // Young A-type stars (7800-10500K)
        const tempK = clampTempK(8000 + rand() * 2500);
        const luminosity = 0.75 + rand() * 1.45;
        const size = 0.95 + rand() * 0.55;
        return write(tempK, luminosity, size);
      }
      // Rare red supergiants (Betelgeuse-like M1-M2 Ia, 3300-4100K) & young F stars
      if (rand() < 0.3) {
        const tempK = clampTempK(3550 + sampleNormal(rand) * 260);
        const luminosity = 4.2 + rand() * 6.5;
        const size = 1.7 + rand() * 0.9;
        return write(tempK, luminosity, size);
      }
      const tempK = clampTempK(6400 + rand() * 1600);
      const luminosity = 0.55 + rand() * 0.9;
      const size = 0.85 + rand() * 0.4;
      return write(tempK, luminosity, size);
    }

    case 2: {
      // Thin Disk: Kroupa IMF F/G/K/M mix with red clump giants & A/F main sequence
      if (u < 0.28) {
        // M/late-K dwarfs and faint red disk stars (2700-4100K)
        const tempK = clampTempK(2850 + Math.pow(rand(), 0.85) * 1250);
        const luminosity = 0.22 + rand() * 0.42;
        const size = 0.72 + rand() * 0.28;
        return write(tempK, luminosity, size);
      }
      if (u < 0.60) {
        // K & G dwarfs (4200-5950K, including Solar G2V ~5778K)
        const tempK = clampTempK(4200 + rand() * 1750);
        const luminosity = 0.34 + rand() * 0.65;
        const size = 0.8 + rand() * 0.35;
        return write(tempK, luminosity, size);
      }
      if (u < 0.84) {
        // F & late-A disk stars (6000-8200K)
        const tempK = clampTempK(6000 + Math.pow(rand(), 1.2) * 2200);
        const luminosity = 0.55 + rand() * 1.1;
        const size = 0.9 + rand() * 0.45;
        return write(tempK, luminosity, size);
      }
      if (u < 0.94) {
        // Evolved K/M red clump & RGB giants (3400-4900K)
        const tempK = clampTempK(4300 + sampleNormal(rand) * 420);
        const luminosity = 1.25 + Math.pow(rand(), 1.8) * 3.4;
        const size = 1.15 + Math.min(1.1, luminosity * 0.22);
        return write(tempK, luminosity, size);
      }
      // Intermediate-age A/B7 stars (8200-11500K)
      const tempK = clampTempK(8200 + rand() * 3300);
      const luminosity = 0.9 + rand() * 1.9;
      const size = 1.05 + rand() * 0.55;
      return write(tempK, luminosity, size);
    }

    case 3: {
      // Thick Disk: older alpha-enhanced F/G/K population (3500-6400K)
      if (u < 0.44) {
        // Old K dwarfs & subgiants (3800-5100K)
        const tempK = clampTempK(3800 + rand() * 1300);
        const luminosity = 0.28 + rand() * 0.52;
        const size = 0.78 + rand() * 0.3;
        return write(tempK, luminosity, size);
      }
      if (u < 0.80) {
        // Old G/F turnoff stars (5100-6400K)
        const tempK = clampTempK(5100 + Math.pow(rand(), 1.15) * 1300);
        const luminosity = 0.42 + rand() * 0.78;
        const size = 0.85 + rand() * 0.35;
        return write(tempK, luminosity, size);
      }
      // Thick-disk K/M RGB giants (3450-4800K)
      const tempK = clampTempK(4150 + sampleNormal(rand) * 380);
      const luminosity = 1.15 + Math.pow(rand(), 1.7) * 2.8;
      const size = 1.1 + rand() * 0.75;
      return write(tempK, luminosity, size);
    }

    case 4:
    default: {
      // Galactic Halo & Globular Clusters: metal-poor K/M giants + Blue Horizontal Branch A/B stars
      if (u < 0.22) {
        // Blue Horizontal Branch (BHB) & blue straggler stars (7600-14500K)
        const tempK = clampTempK(7800 + Math.pow(rand(), 1.5) * 6700);
        const luminosity = 1.35 + rand() * 2.3;
        const size = 1.15 + rand() * 0.65;
        return write(tempK, luminosity, size);
      }
      if (u < 0.66) {
        // Metal-poor RGB / AGB K-M giants (3650-5150K)
        const tempK = clampTempK(4450 + sampleNormal(rand) * 410);
        const luminosity = 1.1 + Math.pow(rand(), 1.8) * 3.6;
        const size = 1.05 + Math.min(1.25, luminosity * 0.24);
        return write(tempK, luminosity, size);
      }
      // Metal-poor halo F/G subdwarfs (5200-6600K)
      const tempK = clampTempK(5200 + rand() * 1400);
      const luminosity = 0.35 + rand() * 0.68;
      const size = 0.82 + rand() * 0.32;
      return write(tempK, luminosity, size);
    }
  }
}
