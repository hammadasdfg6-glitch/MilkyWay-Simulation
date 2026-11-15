import { StarPool } from './astro/starPool';
import {
  MILKY_WAY_LANDMARKS,
  SOL_OMEGA_RAD_PER_MYR,
  SOL_POSITION_KPC,
  getLandmarkPositionAtTime,
} from './data/landmarks';
import { GalaxyCamera } from './engine/camera';
import { MilkyWayRenderer } from './engine/milkywayRenderer';
import { rotateY, type Vec3 } from './math/mat4';
import type {
  CameraPreset,
  Landmark,
  SimulationSettings,
  TelemetryStats,
} from './types';
import { ObservatoryHud, type HudCallbacks } from './ui/hud';

const KPC_TO_LIGHT_YEARS = 3261.563777;
const TELEMETRY_INTERVAL_MS = 100;

const DEFAULT_SETTINGS: SimulationSettings = {
  starCountTier: 2_000_000,
  paused: false,
  timeScaleMyrPerSec: 1.5,
  wavelength: 'optical',
  exposure: 1.15,
  bloomIntensity: 0.75,
  dustOpacity: 1.0,
  nebulaIntensity: 0.85,
  showLandmarks: true,
  autoOrbit: false,
  followSol: false,
};

function getSolPositionAtTime(simTimeMyr: number): Vec3 {
  return rotateY(SOL_POSITION_KPC, SOL_OMEGA_RAD_PER_MYR * simTimeMyr);
}

function initObservatory(): () => void {
  const canvas = document.getElementById('galaxy-canvas') as HTMLCanvasElement | null;
  const hudRoot = document.getElementById('hud-root') as HTMLElement | null;

  if (!canvas || !hudRoot) {
    throw new Error('Milky Way Observatory requires #galaxy-canvas and #hud-root elements.');
  }

  let settings: SimulationSettings = { ...DEFAULT_SETTINGS };
  let simTimeMyr = 0;
  let loadedStars = 0;
  let targetStars: number = settings.starCountTier;
  let smoothedFps = 0;
  let rafId = 0;
  let disposed = false;

  const camera = new GalaxyCamera('overview');
  let renderer: MilkyWayRenderer | null = null;
  let starPool: StarPool | null = null;
  let detachControls: (() => void) | null = null;

  const callbacks: HudCallbacks = {
    onSettingsChange(partial: Partial<SimulationSettings>): void {
      const prevTier = settings.starCountTier;
      settings = { ...settings, ...partial };
      if (partial.starCountTier !== undefined && partial.starCountTier !== prevTier) {
        targetStars = settings.starCountTier;
        starPool?.ensureStars(settings.starCountTier);
      }
      hud.syncSettings(settings);
    },

    onSelectLandmark(landmark: Landmark): void {
      if (landmark.id !== 'sol-system' && settings.followSol) {
        settings = { ...settings, followSol: false };
        hud.syncSettings(settings);
      }
      const pos = getLandmarkPositionAtTime(landmark, simTimeMyr);
      const offset = rotateY(
        landmark.cameraOffsetKpc,
        landmark.omegaRadPerMyr * simTimeMyr
      );
      camera.flyTo(pos, offset);
    },

    onCameraPreset(preset: CameraPreset): void {
      if (preset !== 'sol' && settings.followSol) {
        settings = { ...settings, followSol: false };
        hud.syncSettings(settings);
      }
      camera.setPreset(preset);
      if (preset === 'sol') {
        camera.flyTo(getSolPositionAtTime(simTimeMyr));
      }
    },

    onResetView(): void {
      if (settings.followSol) {
        settings = { ...settings, followSol: false };
        hud.syncSettings(settings);
      }
      camera.setPreset('overview');
    },
  };

  const hud = new ObservatoryHud(
    hudRoot,
    MILKY_WAY_LANDMARKS,
    settings,
    callbacks
  );

  try {
    renderer = new MilkyWayRenderer(canvas);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'WebGL2 HDR initialization failed on this device.';
    hud.showError(message);
    return () => {
      hud.dispose();
    };
  }

  const syncCanvasViewport = (): void => {
    const cssW = Math.max(1, canvas.clientWidth || window.innerWidth || 1);
    const cssH = Math.max(1, canvas.clientHeight || window.innerHeight || 1);
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    renderer?.resize(cssW, cssH, dpr);
    camera.setViewport(cssW, cssH);
  };

  syncCanvasViewport();
  detachControls = camera.attachControls(canvas);

  const onResize = (): void => syncCanvasViewport();
  const onContextLost = (event: Event): void => {
    event.preventDefault();
    cancelAnimationFrame(rafId);
    hud.showError('WebGL2 GPU context was lost. Reload the page to reinitialize the observatory.');
  };

  window.addEventListener('resize', onResize);
  canvas.addEventListener('webglcontextlost', onContextLost);

  starPool = new StarPool();
  renderer.uploadNebulaClouds(starPool.getNebulaCloudBuffer(16000));
  starPool.startGeneration(
    settings.starCountTier,
    (chunk) => {
      renderer?.uploadStarChunk(chunk);
    },
    (loaded, target) => {
      loadedStars = loaded;
      targetStars = target;
    }
  );

  let lastFrameMs: number | null = null;
  let lastTelemetryMs = -Infinity;

  const tick = (nowMs: number): void => {
    if (disposed || !renderer || !starPool) return;

    let rawDtSec = 1 / 60;
    if (lastFrameMs !== null) {
      const deltaSec = (nowMs - lastFrameMs) * 0.001;
      if (deltaSec > 0.0005) {
        rawDtSec = deltaSec;
        if (rawDtSec < 0.5) {
          const instantFps = Math.min(240, 1 / rawDtSec);
          smoothedFps =
            smoothedFps === 0 ? instantFps : smoothedFps * 0.88 + instantFps * 0.12;
        }
      } else {
        rawDtSec = 0.0005;
      }
    }
    lastFrameMs = nowMs;
    const dtSec = Math.min(rawDtSec, 0.1);

    if (!settings.paused) {
      simTimeMyr += dtSec * settings.timeScaleMyrPerSec;
    }

    const solPos = getSolPositionAtTime(simTimeMyr);
    if (settings.followSol) {
      camera.followPoint(solPos);
    }

    camera.update(dtSec, settings.autoOrbit);

    const activeStars = renderer.render(
      camera,
      settings,
      simTimeMyr,
      nowMs * 0.001
    );

    const widthCss = Math.max(1, canvas.clientWidth || window.innerWidth || 1);
    const heightCss = Math.max(1, canvas.clientHeight || window.innerHeight || 1);
    const projected = renderer.projectLandmarks(
      MILKY_WAY_LANDMARKS,
      camera,
      simTimeMyr,
      widthCss,
      heightCss
    );
    hud.updateProjectedLandmarks(projected);

    if (nowMs - lastTelemetryMs >= TELEMETRY_INTERVAL_MS) {
      lastTelemetryMs = nowMs;
      const eye = camera.getEyePosition();
      const currentLoaded = starPool.getLoadedStarCount();
      const currentTarget = settings.starCountTier;
      const distSolKpc = Math.hypot(
        eye[0] - solPos[0],
        eye[1] - solPos[1],
        eye[2] - solPos[2]
      );

      const stats: TelemetryStats = {
        fps: smoothedFps,
        activeStars,
        loadedStars: currentLoaded || loadedStars,
        targetStars: currentTarget || targetStars,
        loadingProgress:
          currentTarget > 0 ? Math.min(1, currentLoaded / currentTarget) : 1,
        simTimeMyr,
        cameraRadiusKpc: Math.hypot(eye[0], eye[2]),
        cameraHeightKpc: eye[1],
        cameraDistFromSolLy: distSolKpc * KPC_TO_LIGHT_YEARS,
        webglBackend: renderer.getBackendName(),
      };
      hud.updateTelemetry(stats);
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return (): void => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    detachControls?.();
    camera.dispose();
    starPool?.dispose();
    renderer?.dispose();
    hud.dispose();
  };
}

let cleanupFn: (() => void) | null = null;

function mount(): void {
  cleanupFn = initObservatory();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}

window.addEventListener('pagehide', () => {
  cleanupFn?.();
  cleanupFn = null;
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanupFn?.();
    cleanupFn = null;
  });
}
