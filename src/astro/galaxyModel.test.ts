import { describe, expect, it } from 'vitest';
import {
  MAX_TEMP_K,
  MIN_TEMP_K,
  kelvinToLinearRgb,
  kelvinToSrgb,
  samplePopulationStar,
} from './blackbody';
import {
  FLOATS_PER_NEBULA,
  FLOATS_PER_STAR,
  GLOBULAR_CLUSTERS,
  OMEGA_BAR,
  OMEGA_PATTERN,
  PITCH_K,
  SPIRAL_R0_KPC,
  computeRotationOmega,
  createSeededRng,
  generateNebulaClouds,
  generateStarChunk,
} from './galaxyModel';
import { StarPool } from './starPool';

const ARM_OFFSETS = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

function minSpiralArmDistanceRad(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const theta = Math.atan2(z, x);
  const baseSpiral = -PITCH_K * Math.log(Math.max(r, 1.15) / SPIRAL_R0_KPC);
  let best = Math.PI;
  for (let i = 0; i < ARM_OFFSETS.length; i++) {
    let d = (theta - (ARM_OFFSETS[i] + baseSpiral)) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    const absD = Math.abs(d);
    if (absD < best) best = absD;
  }
  return best;
}

describe('blackbody photometry & spectral sampling', () => {
  it('produces valid finite linear RGB and sRGB values across 2200K..42000K', () => {
    const temps = [1500, MIN_TEMP_K, 3000, 4500, 5778, 6500, 10000, 20000, 35000, MAX_TEMP_K, 60000];
    for (const tempK of temps) {
      const lin = kelvinToLinearRgb(tempK);
      const srgb = kelvinToSrgb(tempK);

      for (const ch of [...lin, ...srgb]) {
        expect(Number.isFinite(ch)).toBe(true);
        expect(ch).toBeGreaterThanOrEqual(0);
        expect(ch).toBeLessThanOrEqual(1.0001);
      }
      expect(Math.max(...lin)).toBeCloseTo(1, 5);
    }
  });

  it('exhibits realistic Planckian color temperature progression without neon clipping', () => {
    const [rCool, gCool, bCool] = kelvinToLinearRgb(2600);
    expect(rCool).toBeGreaterThan(gCool);
    expect(gCool).toBeGreaterThan(bCool);
    expect(bCool).toBeGreaterThan(0.01);

    const [rSolar, gSolar, bSolar] = kelvinToLinearRgb(5778);
    expect(rSolar).toBeGreaterThan(0.95);
    expect(gSolar).toBeGreaterThan(0.82);
    expect(bSolar).toBeGreaterThan(0.68);

    const [rHot, gHot, bHot] = kelvinToLinearRgb(34000);
    const [rHotSrgb] = kelvinToSrgb(34000);
    expect(bHot).toBeGreaterThan(gHot);
    expect(gHot).toBeGreaterThan(rHot);
    // Real O-stars are pale sapphire blue-white in sRGB (~#a6c9ff), not pure neon #0000ff
    expect(rHot).toBeGreaterThan(0.30);
    expect(rHotSrgb).toBeGreaterThan(0.55);
  });

  it('samples distinct temperature regimes for each galactic population', () => {
    const rand = createSeededRng(1337);
    const meanTemp = (pop: 0 | 1 | 2 | 3 | 4): number => {
      let sum = 0;
      let invalid = 0;
      const n = 2000;
      const sample = { tempK: 0, luminosity: 0, size: 0 };
      for (let i = 0; i < n; i++) {
        samplePopulationStar(pop, rand, 0, sample);
        if (
          !Number.isFinite(sample.tempK) ||
          !Number.isFinite(sample.luminosity) ||
          !Number.isFinite(sample.size) ||
          sample.tempK < MIN_TEMP_K ||
          sample.tempK > MAX_TEMP_K ||
          sample.luminosity <= 0 ||
          sample.size <= 0
        ) {
          invalid++;
        }
        sum += sample.tempK;
      }
      expect(invalid).toBe(0);
      return sum / n;
    };

    const tBulge = meanTemp(0);
    const tSpiralOB = meanTemp(1);
    const tThinDisk = meanTemp(2);
    const tThickDisk = meanTemp(3);
    const tHalo = meanTemp(4);

    expect(tSpiralOB).toBeGreaterThan(11000);
    expect(tBulge).toBeLessThan(5000);
    expect(tThickDisk).toBeLessThan(5800);
    expect(tThinDisk).toBeGreaterThan(tBulge);
    expect(tHalo).toBeGreaterThan(tBulge);
  });
});

describe('galaxyModel star chunk generation', () => {
  const sampleCount = 50_000;
  const chunk0 = generateStarChunk(0, sampleCount);

  it('produces exact buffer layout without NaNs or Infs', () => {
    expect(chunk0.chunkIndex).toBe(0);
    expect(chunk0.starCount).toBe(sampleCount);
    expect(chunk0.buffer.length).toBe(sampleCount * FLOATS_PER_STAR);
    expect(chunk0.buffer.byteLength).toBe(sampleCount * FLOATS_PER_STAR * 4);

    let nonFinite = 0;
    const buf = chunk0.buffer;
    for (let i = 0; i < buf.length; i++) {
      if (!Number.isFinite(buf[i])) nonFinite++;
    }
    expect(nonFinite).toBe(0);
  });

  it('is deterministic per chunkIndex and produces distinct chunks across indices', () => {
    const repeat = generateStarChunk(0, 1024);
    const first = generateStarChunk(0, 1024);
    const other = generateStarChunk(1, 1024);

    expect(Array.from(repeat.buffer)).toEqual(Array.from(first.buffer));
    let diffs = 0;
    for (let i = 0; i < first.buffer.length; i++) {
      if (first.buffer[i] !== other.buffer[i]) diffs++;
    }
    expect(diffs).toBeGreaterThan(first.buffer.length * 0.8);
  });

  it('represents all 5 galactic populations and preserves spiral concentration vs halo extent', () => {
    const counts = [0, 0, 0, 0, 0];
    const absYSum = [0, 0, 0, 0, 0];
    const radialSum = [0, 0, 0, 0, 0];
    const tempSum = [0, 0, 0, 0, 0];
    const armDeltaSum = [0, 0]; // [Pop 1, Pop 4]

    let invalidCount = 0;
    let nscCount = 0;
    let haloFarCount = 0;
    let omegaBarMatches = 0;
    let omegaPatternMatches = 0;

    const buf = chunk0.buffer;
    for (let i = 0; i < sampleCount; i++) {
      const base = i * FLOATS_PER_STAR;
      const x = buf[base];
      const y = buf[base + 1];
      const z = buf[base + 2];
      const omega = buf[base + 3];
      const tempK = buf[base + 4];
      const lum = buf[base + 5];
      const size = buf[base + 6];
      const pop = Math.round(buf[base + 7]);

      if (
        pop < 0 ||
        pop > 4 ||
        tempK < MIN_TEMP_K ||
        tempK > MAX_TEMP_K ||
        lum <= 0 ||
        size <= 0
      ) {
        invalidCount++;
        continue;
      }

      const rCyl = Math.hypot(x, z);
      const r3d = Math.hypot(x, y, z);

      counts[pop]++;
      absYSum[pop] += Math.abs(y);
      radialSum[pop] += rCyl;
      tempSum[pop] += tempK;

      if (pop === 0) {
        if (Math.abs(omega - OMEGA_BAR) < 1e-5) omegaBarMatches++;
        if (r3d < 0.35) nscCount++;
      } else if (pop === 1) {
        if (Math.abs(omega - OMEGA_PATTERN) < 1e-5) omegaPatternMatches++;
        armDeltaSum[0] += minSpiralArmDistanceRad(x, z);
      } else if (pop === 4) {
        if (r3d > 16.0) haloFarCount++;
        armDeltaSum[1] += minSpiralArmDistanceRad(x, z);
      }
    }

    expect(invalidCount).toBe(0);

    // All 5 populations present in expected proportions (~21%, 24%, 34%, 13%, 8%)
    expect(counts[0] / sampleCount).toBeCloseTo(0.21, 1);
    expect(counts[1] / sampleCount).toBeCloseTo(0.24, 1);
    expect(counts[2] / sampleCount).toBeCloseTo(0.34, 1);
    expect(counts[3] / sampleCount).toBeCloseTo(0.13, 1);
    expect(counts[4] / sampleCount).toBeCloseTo(0.08, 1);

    // Cohesive bar & spiral density wave pattern speeds
    expect(omegaBarMatches).toBe(counts[0]);
    expect(omegaPatternMatches).toBe(counts[1]);
    expect(nscCount).toBeGreaterThan(250);

    // Spiral arm concentration vs isotropic halo extent
    const meanSpiralArmOffset = armDeltaSum[0] / counts[1];
    const meanHaloArmOffset = armDeltaSum[1] / counts[4];
    expect(meanSpiralArmOffset).toBeLessThan(0.18);
    expect(meanHaloArmOffset).toBeGreaterThan(0.32);

    // Vertical scale hierarchy: Spiral OB < Thin Disk < Thick Disk < Halo
    const meanY = counts.map((c, idx) => absYSum[idx] / c);
    expect(meanY[1]).toBeLessThan(0.2);
    expect(meanY[1]).toBeLessThan(meanY[2]);
    expect(meanY[2]).toBeLessThan(meanY[3]);
    expect(meanY[3]).toBeLessThan(meanY[4]);

    // Radial hierarchy: Bulge/Bar compact (< 3 kpc) vs Extended Halo (> 16 kpc stars present)
    const meanR = counts.map((c, idx) => radialSum[idx] / c);
    expect(meanR[0]).toBeLessThan(2.6);
    expect(meanR[2]).toBeGreaterThan(4.0);
    expect(haloFarCount).toBeGreaterThan(200);

    // Spiral OB arms significantly hotter than Bulge & Thick Disk
    expect(tempSum[1] / counts[1]).toBeGreaterThan(11000);
    expect(tempSum[0] / counts[0]).toBeLessThan(5000);
  });

  it('includes ~120 globular clusters with real Milky Way coordinates and flat rotation curve', () => {
    expect(GLOBULAR_CLUSTERS.length).toBe(120);
    const names = GLOBULAR_CLUSTERS.map((g) => g.name);
    expect(names.some((n) => n.includes('Omega Centauri'))).toBe(true);
    expect(names.some((n) => n.includes('47 Tucanae'))).toBe(true);
    expect(names.some((n) => n.includes('M13'))).toBe(true);
    expect(names.some((n) => n.includes('M22'))).toBe(true);

    // Sol-radius rotation omega near ~0.0281 rad/Myr
    const omegaSol = computeRotationOmega(8.178);
    expect(omegaSol).toBeGreaterThan(0.027);
    expect(omegaSol).toBeLessThan(0.030);
  });
});

describe('nebula clouds & StarPool streaming', () => {
  it('generates valid nebula cloud buffer with H-II, reflection, and scattering haze', () => {
    const neb = generateNebulaClouds(16000);
    expect(neb.count).toBe(16000);
    expect(neb.buffer.length).toBe(16000 * FLOATS_PER_NEBULA);

    const kindCounts = [0, 0, 0];
    let invalidCount = 0;

    for (let i = 0; i < neb.count; i++) {
      const base = i * FLOATS_PER_NEBULA;
      for (let f = 0; f < FLOATS_PER_NEBULA; f++) {
        if (!Number.isFinite(neb.buffer[base + f])) invalidCount++;
      }
      const omega = neb.buffer[base + 3];
      const kind = Math.round(neb.buffer[base + 4]);
      const radius = neb.buffer[base + 5];
      const density = neb.buffer[base + 6];
      const seed = neb.buffer[base + 7];

      const validOmega =
        Math.abs(omega - OMEGA_PATTERN) < 1e-6 || Math.abs(omega - OMEGA_BAR) < 1e-6;
      if (
        kind < 0 ||
        kind > 2 ||
        radius <= 0.05 ||
        density <= 0 ||
        seed < 0 ||
        seed >= 1 ||
        !validOmega
      ) {
        invalidCount++;
      } else {
        kindCounts[kind]++;
      }
    }

    expect(invalidCount).toBe(0);
    expect(kindCounts[0]).toBeGreaterThan(4000);
    expect(kindCounts[1]).toBeGreaterThan(3000);
    expect(kindCounts[2]).toBeGreaterThan(4000);
  });

  it('streams chunks via StarPool fallback and supports tier upgrades cleanly', async () => {
    const pool = new StarPool();
    const receivedChunks: number[] = [];
    let targetReached = 0;

    let resolver: (() => void) | null = null;
    const waitTarget = (target: number) =>
      new Promise<void>((resolve) => {
        if (targetReached >= target) {
          resolve();
          return;
        }
        resolver = resolve;
      });

    pool.startGeneration(
      500_000,
      (chunk) => {
        receivedChunks.push(chunk.chunkIndex);
        expect(chunk.starCount).toBe(500_000);
        expect(chunk.buffer.length).toBe(500_000 * FLOATS_PER_STAR);
      },
      (loaded, target) => {
        targetReached = loaded;
        if (loaded >= target && resolver) {
          const r = resolver;
          resolver = null;
          r();
        }
      }
    );

    await waitTarget(500_000);
    expect(receivedChunks).toEqual([0]);

    pool.ensureStars(1_000_000);
    await waitTarget(1_000_000);
    expect(receivedChunks).toEqual([0, 1]);
    expect(pool.getLoadedStarCount()).toBe(1_000_000);

    const neb = pool.getNebulaCloudBuffer(1000);
    expect(neb.count).toBe(1000);

    pool.dispose();
  });
});
