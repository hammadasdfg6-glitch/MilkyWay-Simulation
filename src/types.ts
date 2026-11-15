export type StarCountTier = 500_000 | 1_000_000 | 2_000_000 | 3_500_000 | 5_000_000;

export type WavelengthMode = 'optical' | 'infrared' | 'ultraviolet' | 'population';

/**
 * 0 = Bulge/Bar, 1 = Spiral Arm Young (OB), 2 = Thin Disk,
 * 3 = Thick Disk, 4 = Halo & Globular Clusters
 */
export type PopulationId = 0 | 1 | 2 | 3 | 4;

export interface StarChunkData {
  chunkIndex: number;
  starCount: number;
  /** 8 floats per star: [x0, y0, z0, omega, tempK, luminosity, size, population] */
  buffer: Float32Array;
}

export interface NebulaCloudBuffer {
  count: number;
  /** 8 floats per cloud: [x0, y0, z0, omega, kind, radiusKpc, density, seed] */
  buffer: Float32Array;
}

export type LandmarkCategory = 'core' | 'solar' | 'nebula' | 'cluster' | 'arm' | 'vantage';

export type CameraPreset = 'overview' | 'oblique' | 'edge' | 'sol' | 'core';

export interface Landmark {
  id: string;
  name: string;
  category: LandmarkCategory;
  positionKpc: [number, number, number];
  cameraOffsetKpc: [number, number, number];
  distanceFromSolLy: string;
  classification: string;
  description: string;
  omegaRadPerMyr: number;
}

export interface CameraState {
  target: [number, number, number];
  yaw: number;
  pitch: number;
  distanceKpc: number;
  fovDeg: number;
}

export interface SimulationSettings {
  starCountTier: StarCountTier;
  paused: boolean;
  timeScaleMyrPerSec: number;
  wavelength: WavelengthMode;
  exposure: number;
  bloomIntensity: number;
  dustOpacity: number;
  nebulaIntensity: number;
  showLandmarks: boolean;
  autoOrbit: boolean;
  followSol: boolean;
}

export interface TelemetryStats {
  fps: number;
  activeStars: number;
  loadedStars: number;
  targetStars: number;
  loadingProgress: number;
  simTimeMyr: number;
  cameraRadiusKpc: number;
  cameraHeightKpc: number;
  cameraDistFromSolLy: number;
  webglBackend: string;
}

export interface ProjectedLandmark {
  landmark: Landmark;
  screenX: number;
  screenY: number;
  visible: boolean;
  distanceKpc: number;
}
