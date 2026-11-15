import type { NebulaCloudBuffer, PopulationId, StarChunkData } from '../types';
import { clampTempK, samplePopulationStar } from './blackbody';

export const CHUNK_STAR_COUNT = 500_000;
export const FLOATS_PER_STAR = 8;
export const FLOATS_PER_NEBULA = 8;

export const R_GAL_KPC = 16.0;
export const R_SUN_KPC = 8.178;
export const Y_SUN_KPC = 0.021;

/** Conversion factor: 1 km/s = 0.001022712165 kpc/Myr */
export const KM_S_TO_KPC_MYR = 0.001022712165;

/** Coherent Galactic bar pattern speed (rad/Myr). */
export const OMEGA_BAR = 0.041;

/** Coherent spiral density-wave pattern speed (rad/Myr). */
export const OMEGA_PATTERN = 0.025;

/** Galactic bar angle relative to the Sun-GC X axis (27 degrees). */
export const BAR_ANGLE_RAD = (27 * Math.PI) / 180;
const BAR_COS = Math.cos(BAR_ANGLE_RAD);
const BAR_SIN = Math.sin(BAR_ANGLE_RAD);

/** Spiral pitch angle 12.5 degrees -> k = cot(12.5 deg) ≈ 4.5107 (matches DUST_MAP_FRAG). */
export const PITCH_ANGLE_DEG = 12.5;
export const PITCH_K = 1 / Math.tan((PITCH_ANGLE_DEG * Math.PI) / 180);
export const SPIRAL_R0_KPC = 3.1;

/**
 * 4 major logarithmic spiral arms matching DUST_MAP_FRAG:
 * 0: Sagittarius-Carina, 1: Perseus, 2: Norma-Outer, 3: Scutum-Centaurus
 */
const ARM_OFFSETS = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5] as const;
const ARM_CUMULATIVE_WEIGHTS = [0.27, 0.56, 0.77, 1.0] as const;

const TWO_PI = Math.PI * 2;

export interface GlobularClusterDef {
  name: string;
  x: number;
  y: number;
  z: number;
  omega: number;
  coreRadiusKpc: number;
  tidalRadiusKpc: number;
  weight: number;
}

interface ObKnotDef {
  x: number;
  y: number;
  z: number;
  radiusKpc: number;
  luminosityBoost: number;
}

/**
 * Creates a fast deterministic xoshiro128** PRNG seeded from an integer via SplitMix32.
 */
export function createSeededRng(seed: number): () => number {
  let sm = (seed ^ 0x9e3779b9) >>> 0;
  const splitMix = (): number => {
    sm = (sm + 0x9e3779b9) >>> 0;
    let t = sm ^ (sm >>> 16);
    t = Math.imul(t, 0x85ebca6b) >>> 0;
    t = t ^ (t >>> 13);
    t = Math.imul(t, 0xc2b2ae35) >>> 0;
    return (t ^ (t >>> 16)) >>> 0;
  };

  let s0 = splitMix() || 1;
  let s1 = splitMix() || 2;
  let s2 = splitMix() || 3;
  let s3 = splitMix() || 4;

  return (): number => {
    const result = Math.imul(rotl32(Math.imul(s1, 5), 7), 9) >>> 0;
    const t = (s1 << 9) >>> 0;

    s2 ^= s0;
    s3 ^= s1;
    s1 ^= s2;
    s0 ^= s3;
    s2 ^= t;
    s3 = rotl32(s3, 11);

    return result / 4294967296;
  };
}

function rotl32(x: number, k: number): number {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

function sampleNormal(rand: () => number): number {
  let u = 0;
  let v = 0;
  let s = 0;
  do {
    u = rand() * 2 - 1;
    v = rand() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1 || s <= 1e-9);
  return u * Math.sqrt((-2 * Math.log(s)) / s);
}

/**
 * Exact inverse-CDF sample of sech^2(y / h) vertical profile, clamped safely against extreme tails.
 */
function sampleSech2(rand: () => number, scaleHeight: number): number {
  const u = 0.002 + rand() * 0.996;
  return scaleHeight * 0.5 * Math.log(u / (1 - u));
}

/**
 * Galactic flat differential rotation curve:
 * v(r) = 225 * tanh(r / 1.4) km/s -> omega = v_kpc_per_myr / max(r, 0.45)
 */
export function computeRotationOmega(rKpc: number): number {
  const safeR = Math.max(rKpc, 0.45);
  const vKms = 225 * Math.tanh(rKpc / 1.4);
  return (vKms * KM_S_TO_KPC_MYR) / safeR;
}

/**
 * Logarithmic trailing spiral arm center angle at radius `rKpc`:
 * Under clockwise rotation (theta(t) = theta0 + omega * t), outer radii lag at smaller theta.
 */
function spiralArmAngle(rKpc: number, armOffset: number): number {
  return armOffset - PITCH_K * Math.log(Math.max(rKpc, 1.15) / SPIRAL_R0_KPC);
}

// Precompute inverse-CDF table for r^-3.5 3D halo density profile out to 32 kpc
const HALO_CDF_SIZE = 512;
const HALO_RADII_LUT = new Float32Array(HALO_CDF_SIZE);
(() => {
  const rMin = 0.25;
  const rMax = 32.0;
  const a2 = 1.6 * 1.6;
  const cdf = new Float64Array(HALO_CDF_SIZE);
  let accum = 0;
  for (let i = 0; i < HALO_CDF_SIZE; i++) {
    const r = rMin + ((rMax - rMin) * i) / (HALO_CDF_SIZE - 1);
    const shellDensity = r * r * Math.pow(r * r + a2, -1.75);
    accum += shellDensity;
    cdf[i] = accum;
  }
  for (let i = 0; i < HALO_CDF_SIZE; i++) {
    cdf[i] /= accum;
  }
  let idx = 0;
  for (let k = 0; k < HALO_CDF_SIZE; k++) {
    const u = k / (HALO_CDF_SIZE - 1);
    while (idx < HALO_CDF_SIZE - 2 && cdf[idx + 1] < u) {
      idx++;
    }
    const c0 = cdf[idx];
    const c1 = cdf[idx + 1];
    const frac = c1 > c0 ? (u - c0) / (c1 - c0) : 0;
    const r0 = rMin + ((rMax - rMin) * idx) / (HALO_CDF_SIZE - 1);
    const r1 = rMin + ((rMax - rMin) * (idx + 1)) / (HALO_CDF_SIZE - 1);
    HALO_RADII_LUT[k] = r0 + (r1 - r0) * frac;
  }
})();

function sampleHaloRadius(rand: () => number): number {
  const pos = rand() * (HALO_CDF_SIZE - 1);
  const i0 = Math.floor(pos);
  const i1 = Math.min(HALO_CDF_SIZE - 1, i0 + 1);
  const frac = pos - i0;
  return HALO_RADII_LUT[i0] + (HALO_RADII_LUT[i1] - HALO_RADII_LUT[i0]) * frac;
}

// Deterministic catalog of ~120 Milky Way Globular Clusters (including real Omega Cen, 47 Tuc, M13, M22)
export const GLOBULAR_CLUSTERS: GlobularClusterDef[] = (() => {
  const rand = createSeededRng(0x474c4f42);
  const clusters: GlobularClusterDef[] = [
    {
      name: 'Omega Centauri (NGC 5139)',
      x: -4.98,
      y: 1.38,
      z: 3.93,
      omega: 0.011,
      coreRadiusKpc: 0.015,
      tidalRadiusKpc: 0.075,
      weight: 2.3,
    },
    {
      name: '47 Tucanae (NGC 104)',
      x: -6.31,
      y: -3.16,
      z: 2.58,
      omega: 0.012,
      coreRadiusKpc: 0.012,
      tidalRadiusKpc: 0.062,
      weight: 2.0,
    },
    {
      name: 'Hercules Cluster (M13)',
      x: -5.53,
      y: 4.47,
      z: -4.41,
      omega: 0.009,
      coreRadiusKpc: 0.011,
      tidalRadiusKpc: 0.056,
      weight: 1.7,
    },
    {
      name: 'M22 (NGC 6656)',
      x: -5.06,
      y: -0.40,
      z: -0.54,
      omega: 0.015,
      coreRadiusKpc: 0.012,
      tidalRadiusKpc: 0.058,
      weight: 1.7,
    },
  ];

  for (let i = clusters.length; i < 120; i++) {
    // Most Milky Way globulars concentrate inside R ~ 1.5..14 kpc, with outer halo outliers to 26 kpc
    const u = rand();
    const r = u < 0.72 ? 1.4 + Math.pow(rand(), 1.35) * 10.5 : 8.0 + Math.pow(rand(), 1.6) * 18.0;
    const cosPhi = 2 * rand() - 1;
    const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));
    const theta = rand() * TWO_PI;

    const x = r * sinPhi * Math.cos(theta);
    const y = r * cosPhi * 0.82;
    const z = r * sinPhi * Math.sin(theta);

    const rCyl = Math.hypot(x, z);
    const baseOmega = computeRotationOmega(Math.max(rCyl, 1.0));
    const omega = baseOmega * (0.25 + rand() * 0.45) * (rand() < 0.85 ? 1 : -1);

    const coreRadiusKpc = 0.007 + rand() * 0.010;
    const tidalRadiusKpc = coreRadiusKpc * (4.2 + rand() * 2.4);
    const weight = 0.65 + Math.pow(rand(), 1.4) * 1.1;

    clusters.push({
      name: `GC-${i + 1}`,
      x,
      y,
      z,
      omega,
      coreRadiusKpc,
      tidalRadiusKpc,
      weight,
    });
  }
  return clusters;
})();

// Precompute cumulative weights for globular cluster selection
const GC_CUMULATIVE_WEIGHTS = (() => {
  const weights = new Float64Array(GLOBULAR_CLUSTERS.length);
  let sum = 0;
  for (let i = 0; i < GLOBULAR_CLUSTERS.length; i++) {
    sum += GLOBULAR_CLUSTERS[i].weight;
    weights[i] = sum;
  }
  for (let i = 0; i < GLOBULAR_CLUSTERS.length; i++) {
    weights[i] /= sum;
  }
  return weights;
})();

function pickGlobularCluster(rand: () => number): GlobularClusterDef {
  const u = rand();
  let lo = 0;
  let hi = GC_CUMULATIVE_WEIGHTS.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (GC_CUMULATIVE_WEIGHTS[mid] < u) lo = mid + 1;
    else hi = mid;
  }
  return GLOBULAR_CLUSTERS[lo];
}

// Deterministic catalog of ~180 young OB association / H-II knots anchored to spiral arms & Orion Spur
const OB_KNOTS: ObKnotDef[] = (() => {
  const rand = createSeededRng(0x4f424b4e);
  const knots: ObKnotDef[] = [
    // Real iconic star-forming complexes matching landmarks.ts
    { x: -8.518, y: -0.116, z: 0.188, radiusKpc: 0.14, luminosityBoost: 1.55 }, // Orion M42
    { x: -7.39, y: -0.027, z: 2.48, radiusKpc: 0.24, luminosityBoost: 1.65 },   // Carina NGC 3372
    { x: -6.50, y: 0.045, z: -0.51, radiusKpc: 0.19, luminosityBoost: 1.5 },    // Eagle M16
    { x: -4.24, y: -0.029, z: 1.47, radiusKpc: 0.18, luminosityBoost: 1.7 },    // Westerlund 1
    { x: -9.80, y: -0.148, z: -1.63, radiusKpc: 0.21, luminosityBoost: 1.5 },   // Perseus Double Cluster
    { x: -7.47, y: 0.14, z: -2.08, radiusKpc: 0.22, luminosityBoost: 1.45 },    // Cygnus X complex
  ];

  // Distribute OB knots along the 4 logarithmic arms
  for (let i = 0; i < 156; i++) {
    const armIndex = i % 4;
    const r = 2.6 + Math.pow(rand(), 0.92) * 11.8;
    const jitter = sampleNormal(rand) * (0.045 + 0.015 * (r / 10));
    const theta = spiralArmAngle(r, ARM_OFFSETS[armIndex]) + jitter;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = sampleNormal(rand) * 0.045;
    knots.push({
      x,
      y,
      z,
      radiusKpc: 0.10 + rand() * 0.22,
      luminosityBoost: 1.15 + rand() * 0.65,
    });
  }

  // Distribute OB knots along the Orion-Cygnus Spur near Sol
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const r = 6.9 + t * 2.7;
    const theta = Math.PI - 3.6 * Math.log(r / R_SUN_KPC) + sampleNormal(rand) * 0.03;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = sampleNormal(rand) * 0.04;
    knots.push({
      x,
      y,
      z,
      radiusKpc: 0.09 + rand() * 0.16,
      luminosityBoost: 1.15 + rand() * 0.55,
    });
  }

  return knots;
})();

function pickArmOffset(rand: () => number): number {
  const u = rand();
  if (u < ARM_CUMULATIVE_WEIGHTS[0]) return ARM_OFFSETS[0];
  if (u < ARM_CUMULATIVE_WEIGHTS[1]) return ARM_OFFSETS[1];
  if (u < ARM_CUMULATIVE_WEIGHTS[2]) return ARM_OFFSETS[2];
  return ARM_OFFSETS[3];
}

/**
 * Computes minimum angular offset from the nearest spiral arm ridge at radius `r`.
 */
function minArmDeltaTheta(r: number, theta: number): number {
  const baseSpiral = -PITCH_K * Math.log(Math.max(r, 1.15) / SPIRAL_R0_KPC);
  let best = Math.PI;
  for (let i = 0; i < 4; i++) {
    const target = ARM_OFFSETS[i] + baseSpiral;
    let d = (theta - target) % TWO_PI;
    if (d > Math.PI) d -= TWO_PI;
    if (d < -Math.PI) d += TWO_PI;
    const absD = Math.abs(d);
    if (absD < best) best = absD;
  }
  return best;
}

/**
 * Generates a deterministic, morphologically complete star chunk of `starCount` stars
 * (`8 * starCount` Float32 elements: `[x0, y0, z0, omega, tempK, luminosity, size, population]`).
 */
export function generateStarChunk(chunkIndex: number, starCount: number): StarChunkData {
  const count = Math.max(0, Math.floor(starCount));
  const buffer = new Float32Array(count * FLOATS_PER_STAR);
  const rand = createSeededRng(0x5a7c19e3 ^ Math.imul(chunkIndex + 1, 0x9e3779b9));
  const specSample = { tempK: 5778, luminosity: 1, size: 1 };

  for (let i = 0; i < count; i++) {
    const popRoll = rand();
    let x = 0;
    let y = 0;
    let z = 0;
    let omega = 0;
    let population: PopulationId = 2;
    let coreProximity = 0;
    let lumScale = 1.0;

    if (popRoll < 0.21) {
      // Population 0 (~21%): Triaxial Prolate Bar + Boxy/Peanut Bulge + Nuclear Star Cluster
      population = 0;
      omega = OMEGA_BAR;
      const subRoll = rand();

      if (subRoll < 0.075) {
        // Nuclear Star Cluster inside r < 0.35 kpc (with physical Sgr A* inner cavity)
        const rNsc = Math.min(0.35, 0.0035 + Math.pow(rand(), 1.65) * 0.3465);
        const cosP = 2 * rand() - 1;
        const sinP = Math.sqrt(Math.max(0, 1 - cosP * cosP));
        const th = rand() * TWO_PI;
        x = rNsc * sinP * Math.cos(th);
        y = rNsc * cosP * 0.68;
        z = rNsc * sinP * Math.sin(th);
        coreProximity = Math.exp(-rNsc / 0.14);
        lumScale = 1.0 + 0.25 * coreProximity;
      } else if (subRoll < 0.52) {
        // Boxy / Peanut Bulge
        const bx = sampleNormal(rand) * 1.15;
        const bz = sampleNormal(rand) * 0.72;
        const peanutWing = 1.0 + 0.38 * Math.exp(-Math.pow((Math.abs(bx) - 0.95) / 0.65, 2));
        const peanutSign = rand() < 0.5 ? -1 : 1;
        const peanutShift = peanutSign * 0.19 * Math.exp(-Math.pow((Math.abs(bx) - 1.05) / 0.55, 2));
        const by = sampleNormal(rand) * 0.48 * peanutWing + peanutShift;

        x = bx * BAR_COS - bz * BAR_SIN;
        y = by;
        z = bx * BAR_SIN + bz * BAR_COS;
      } else {
        // Triaxial Prolate Bar (~3.6 kpc semi-major, ~1.35 kpc minor, ~0.95 kpc vertical)
        const uAxis = Math.min(4.1, Math.abs(sampleNormal(rand)) * 1.85) * (rand() < 0.5 ? -1 : 1);
        const endTaper = 1.0 - 0.35 * Math.min(1, Math.abs(uAxis) / 3.8);
        const bz = sampleNormal(rand) * 0.56 * endTaper;
        const by = sampleNormal(rand) * 0.36 * endTaper;

        x = uAxis * BAR_COS - bz * BAR_SIN;
        y = by;
        z = uAxis * BAR_SIN + bz * BAR_COS;
      }
    } else if (popRoll < 0.45) {
      // Population 1 (~24%): 4 Logarithmic Spiral Arms + Orion-Cygnus Spur + OB Associations
      population = 1;
      omega = OMEGA_PATTERN;
      const modeRoll = rand();

      if (modeRoll < 0.31) {
        // Tight young OB-association knots along the arms & Orion Spur
        const knot = OB_KNOTS[Math.floor(rand() * OB_KNOTS.length)];
        const u1 = Math.max(1e-6, rand());
        const rLocal = knot.radiusKpc * Math.sqrt(-0.42 * Math.log(u1));
        const thLocal = rand() * TWO_PI;
        x = knot.x + rLocal * Math.cos(thLocal);
        z = knot.z + rLocal * Math.sin(thLocal);
        y = knot.y + sampleNormal(rand) * 0.045;
        lumScale = knot.luminosityBoost;
      } else if (modeRoll < 0.42) {
        // Orion-Cygnus Spur passing directly near Sol (-8.178, 0.021, 0)
        const r = 6.7 + rand() * 3.1;
        const thetaCenter = Math.PI - 3.6 * Math.log(r / R_SUN_KPC);
        const crossSigma = 0.32 / r;
        const theta = thetaCenter + sampleNormal(rand) * crossSigma;
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = sampleSech2(rand, 0.115);
      } else {
        // 4 Major Logarithmic Spiral Arms (pitch 12.5 deg, r from 2.4 to 15.8 kpc)
        const uR = rand();
        const r = 2.4 + Math.pow(uR, 0.92) * 13.4;
        const armOffset = pickArmOffset(rand);
        // Subtle organic spiral arm meander + feathered cross-arm Gaussian width
        const meander = 0.045 * Math.sin(2.4 * Math.log(r / 3.1) + armOffset);
        const feather = rand() < 0.22 ? 1.55 : 1.0;
        const widthKpc = (0.28 + 0.045 * r) * feather;
        const dTheta = sampleNormal(rand) * (widthKpc / r);
        const theta = spiralArmAngle(r, armOffset) + meander + dTheta;
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);

        const hScale = 0.095 + 0.07 * Math.min(1, Math.max(0, (r - 4.0) / 11.0));
        y = sampleSech2(rand, hScale);
      }
    } else if (popRoll < 0.79) {
      // Population 2 (~34%): Thin Disk following r * exp(-r / 2.6) with gentle spiral modulation
      population = 2;
      let r = 0;
      for (let attempt = 0; attempt < 4; attempt++) {
        const u1 = Math.max(1e-6, rand());
        const u2 = Math.max(1e-6, rand());
        r = -2.6 * (Math.log(u1) + Math.log(u2));
        if (r <= 17.8) break;
      }
      if (r > 17.8) r = 17.8 * (0.5 + 0.5 * rand());

      // Gentle ~18% spiral density modulation beyond bar radius
      let theta = rand() * TWO_PI;
      if (r > 3.0) {
        const armDelta = minArmDeltaTheta(r, theta);
        const armProx = Math.exp(-(armDelta * armDelta) / (2 * 0.35 * 0.35));
        if (rand() > 0.78 + 0.22 * armProx) {
          // Resample half the time to concentrate mildly near spiral density waves
          theta = rand() * TWO_PI;
        }
      }

      x = r * Math.cos(theta);
      z = r * Math.sin(theta);

      // Vertical sech^2 flaring: 0.22 kpc inner -> 0.45 kpc outer + subtle outer warp
      const flareT = Math.min(1, Math.max(0, (r - 4.0) / 12.0));
      const hThin = 0.22 + 0.23 * Math.pow(flareT, 1.35);
      const warpT = Math.max(0, (r - 10.5) / 5.5);
      const warpY = 0.42 * Math.pow(warpT, 1.55) * Math.sin(theta - 0.35);
      y = sampleSech2(rand, hThin) + warpY;

      omega = computeRotationOmega(r);
    } else if (popRoll < 0.92) {
      // Population 3 (~13%): Older Thick Disk (scale height ~0.85 kpc, scale length 3.4 kpc)
      population = 3;
      let r = 0;
      for (let attempt = 0; attempt < 4; attempt++) {
        const u1 = Math.max(1e-6, rand());
        const u2 = Math.max(1e-6, rand());
        r = -3.4 * (Math.log(u1) + Math.log(u2));
        if (r <= 19.5) break;
      }
      if (r > 19.5) r = 19.5 * (0.45 + 0.55 * rand());

      const theta = rand() * TWO_PI;
      x = r * Math.cos(theta);
      z = r * Math.sin(theta);

      const hThick = 0.78 + 0.16 * Math.min(1, r / 16.0);
      y = sampleSech2(rand, hThick);

      // Asymmetric drift (~16% slower rotation than cold thin disk)
      const safeR = Math.max(r, 0.55);
      const vThickKms = 0.84 * 225 * Math.tanh(r / 1.6);
      omega = (vThickKms * KM_S_TO_KPC_MYR) / safeR;
    } else {
      // Population 4 (~8%): Galactic Halo (r^-3.5 out to 32 kpc) + ~120 King-model Globular Clusters
      population = 4;
      if (rand() < 0.15) {
        // King-model concentrated sphere around one of ~120 Globular Clusters
        const gc = pickGlobularCluster(rand);
        // King profile rho(r) ~ (1 + (r/rc)^2)^(-3/2) via monotonic radial transform
        const u = rand();
        const rRatio = Math.sqrt(Math.pow(1 - u * 0.92, -1.25) - 1);
        const rLocal = Math.min(gc.tidalRadiusKpc, gc.coreRadiusKpc * rRatio);
        const cosP = 2 * rand() - 1;
        const sinP = Math.sqrt(Math.max(0, 1 - cosP * cosP));
        const th = rand() * TWO_PI;

        x = gc.x + rLocal * sinP * Math.cos(th);
        y = gc.y + rLocal * cosP;
        z = gc.z + rLocal * sinP * Math.sin(th);
        omega = gc.omega;
        lumScale = 1.32;
      } else {
        // Smooth spheroidal-oblate Galactic Halo (r^-3.5 falloff out to 32 kpc)
        const rHalo = sampleHaloRadius(rand);
        const cosP = 2 * rand() - 1;
        const sinP = Math.sqrt(Math.max(0, 1 - cosP * cosP));
        const th = rand() * TWO_PI;

        const oblate = 0.72 + 0.18 * Math.min(1, rHalo / 22.0);
        x = rHalo * sinP * Math.cos(th);
        y = rHalo * cosP * oblate;
        z = rHalo * sinP * Math.sin(th);

        // Slow prograde halo drift + velocity dispersion
        omega = 0.0025 + sampleNormal(rand) * 0.007;
      }
    }

    const spec = samplePopulationStar(population, rand, coreProximity, specSample);
    const base = i * FLOATS_PER_STAR;
    buffer[base] = x;
    buffer[base + 1] = y;
    buffer[base + 2] = z;
    buffer[base + 3] = omega;
    buffer[base + 4] = clampTempK(spec.tempK);
    buffer[base + 5] = spec.luminosity * lumScale;
    buffer[base + 6] = spec.size;
    buffer[base + 7] = population;
  }

  return {
    chunkIndex,
    starCount: count,
    buffer,
  };
}

/**
 * Generates volumetric ISM nebula & dust-scattering clouds (`8 * count` floats):
 * - kind 0.0: H-II emission regions along spiral arm edges & OB nurseries (co-moving at OMEGA_PATTERN)
 * - kind 1.0: Blue reflection nebulae around young OB associations (co-moving at OMEGA_PATTERN)
 * - kind 2.0: Warm bulge & disk scattering haze (co-moving at OMEGA_BAR or OMEGA_PATTERN)
 */
export function generateNebulaClouds(count = 16000): NebulaCloudBuffer {
  const safeCount = Math.max(0, Math.floor(count));
  const buffer = new Float32Array(safeCount * FLOATS_PER_NEBULA);
  const rand = createSeededRng(0x6e656275);

  for (let i = 0; i < safeCount; i++) {
    const roll = rand();
    let x = 0;
    let y = 0;
    let z = 0;
    let omega = OMEGA_PATTERN;
    let kind = 0.0;
    let radiusKpc = 0.25;
    let density = 0.8;

    if (roll < 0.38) {
      // kind = 0.0: H-II emission regions hugging OB knots & leading spiral edges
      kind = 0.0;
      omega = OMEGA_PATTERN;

      if (rand() < 0.42) {
        const knot = OB_KNOTS[Math.floor(rand() * OB_KNOTS.length)];
        const rLocal = knot.radiusKpc * (0.2 + rand() * 1.15);
        const th = rand() * TWO_PI;
        x = knot.x + rLocal * Math.cos(th);
        z = knot.z + rLocal * Math.sin(th);
        y = knot.y + sampleNormal(rand) * 0.03;
        radiusKpc = 0.14 + rand() * 0.28;
        density = (0.78 + rand() * 0.72) * Math.min(1.3, knot.luminosityBoost);
      } else if (rand() < 0.16) {
        // Orion-Cygnus Spur H-II filaments
        const r = 6.9 + rand() * 2.8;
        const theta = Math.PI - 3.6 * Math.log(r / R_SUN_KPC) + sampleNormal(rand) * (0.22 / r);
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = sampleNormal(rand) * 0.035;
        radiusKpc = 0.16 + rand() * 0.26;
        density = 0.65 + rand() * 0.65;
      } else {
        const r = 2.6 + Math.pow(rand(), 0.95) * 12.2;
        const armOffset = pickArmOffset(rand);
        // Slightly toward leading/outer spiral shock ridge
        const theta = spiralArmAngle(r, armOffset) + 0.04 + sampleNormal(rand) * (0.24 / r);
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = sampleNormal(rand) * 0.04;
        radiusKpc = 0.16 + rand() * 0.34;
        density = 0.62 + rand() * 0.75;
      }
    } else if (roll < 0.65) {
      // kind = 1.0: Blue reflection nebulae near hot OB clusters
      kind = 1.0;
      omega = OMEGA_PATTERN;

      if (rand() < 0.48) {
        const knot = OB_KNOTS[Math.floor(rand() * OB_KNOTS.length)];
        const rLocal = knot.radiusKpc * (0.3 + rand() * 1.4);
        const th = rand() * TWO_PI;
        x = knot.x + rLocal * Math.cos(th);
        z = knot.z + rLocal * Math.sin(th);
        y = knot.y + sampleNormal(rand) * 0.04;
      } else {
        const r = 2.8 + Math.pow(rand(), 0.95) * 12.4;
        const armOffset = pickArmOffset(rand);
        const theta = spiralArmAngle(r, armOffset) + sampleNormal(rand) * (0.32 / r);
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = sampleNormal(rand) * 0.05;
      }
      radiusKpc = 0.20 + rand() * 0.36;
      density = 0.55 + rand() * 0.68;
    } else {
      // kind = 2.0: Warm bulge & disk stellar-dust scattering haze
      kind = 2.0;
      if (rand() < 0.45) {
        // Bar & Bulge scattering glow (co-moving with OMEGA_BAR)
        omega = OMEGA_BAR;
        const bx = sampleNormal(rand) * 1.45;
        const bz = sampleNormal(rand) * 0.68;
        const by = sampleNormal(rand) * 0.32;
        x = bx * BAR_COS - bz * BAR_SIN;
        y = by;
        z = bx * BAR_SIN + bz * BAR_COS;
        radiusKpc = 0.45 + rand() * 0.90;
        density = 0.48 + rand() * 0.52;
      } else {
        // Mid-disk & spiral diffuse dust-scattering haze (co-moving with OMEGA_PATTERN)
        omega = OMEGA_PATTERN;
        const r = 2.5 + Math.pow(rand(), 0.95) * 11.5;
        const armOffset = pickArmOffset(rand);
        const theta =
          rand() < 0.72
            ? spiralArmAngle(r, armOffset) + sampleNormal(rand) * (0.55 / r)
            : rand() * TWO_PI;
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = sampleNormal(rand) * 0.09;
        radiusKpc = 0.55 + rand() * 1.15;
        density = 0.32 + rand() * 0.48;
      }
    }

    const base = i * FLOATS_PER_NEBULA;
    buffer[base] = x;
    buffer[base + 1] = y;
    buffer[base + 2] = z;
    buffer[base + 3] = omega;
    buffer[base + 4] = kind;
    buffer[base + 5] = radiusKpc;
    buffer[base + 6] = density;
    buffer[base + 7] = rand();
  }

  return {
    count: safeCount,
    buffer,
  };
}
