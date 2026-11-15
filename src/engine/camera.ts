import type { CameraPreset, CameraState } from '../types';
import {
  createMat4,
  invertMat4,
  lookAtMat4,
  multiplyMat4,
  perspectiveMat4,
  type Mat4,
  type Vec3,
} from '../math/mat4';

export const MIN_CAMERA_DIST_KPC = 0.0005;
export const MAX_CAMERA_DIST_KPC = 120.0;
const MIN_PITCH = -1.52;
const MAX_PITCH = 1.52;
const TWO_PI = Math.PI * 2;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function wrapAngleDelta(delta: number): number {
  let d = (delta + Math.PI) % TWO_PI;
  if (d < 0) d += TWO_PI;
  return d - Math.PI;
}

const PRESET_STATES: Record<CameraPreset, CameraState> = {
  overview: {
    target: [0, 0, 0],
    yaw: -0.45,
    pitch: 1.04,
    distanceKpc: 32.0,
    fovDeg: 48,
  },
  oblique: {
    target: [0, 0, 0],
    yaw: 0.62,
    pitch: 0.42,
    distanceKpc: 24.5,
    fovDeg: 48,
  },
  edge: {
    target: [0, 0, 0],
    yaw: 0.14,
    pitch: 0.032,
    distanceKpc: 22.5,
    fovDeg: 46,
  },
  sol: {
    target: [-8.178, 0.021, 0],
    yaw: 2.35,
    pitch: 0.18,
    distanceKpc: 0.28,
    fovDeg: 52,
  },
  core: {
    target: [0, 0, 0],
    yaw: 0.55,
    pitch: 0.24,
    distanceKpc: 0.014,
    fovDeg: 50,
  },
};

export class GalaxyCamera {
  private current: CameraState;
  private goal: CameraState;

  private aspect = 16 / 9;
  private viewportHeightPx = 900;
  private nearKpc = 0.05;
  private farKpc = 300;

  private readonly viewMatrix: Mat4 = createMat4();
  private readonly projMatrix: Mat4 = createMat4();
  private readonly viewProjMatrix: Mat4 = createMat4();
  private readonly invViewProjMatrix: Mat4 = createMat4();

  private eyePos: Vec3 = [0, 0, 0];
  private rightVec: Vec3 = [1, 0, 0];
  private upVec: Vec3 = [0, 1, 0];

  private activePointers = new Map<number, { x: number; y: number; button: number; shift: boolean }>();
  private lastPinchDist = 0;
  private lastPinchCenter: { x: number; y: number } | null = null;
  private isUserInteracting = false;
  private lastFollowPoint: Vec3 | null = null;
  private followedThisFrame = false;
  private detachFn: (() => void) | null = null;

  constructor(initialPreset: CameraPreset = 'overview') {
    const p = PRESET_STATES[initialPreset];
    this.current = {
      target: [...p.target],
      yaw: p.yaw,
      pitch: p.pitch,
      distanceKpc: p.distanceKpc,
      fovDeg: p.fovDeg,
    };
    this.goal = {
      target: [...p.target],
      yaw: p.yaw,
      pitch: p.pitch,
      distanceKpc: p.distanceKpc,
      fovDeg: p.fovDeg,
    };
    this.recomputeMatrices();
  }

  setViewport(widthPx: number, heightPx: number): void {
    const w = Math.max(1, widthPx);
    const h = Math.max(1, heightPx);
    this.aspect = w / h;
    this.viewportHeightPx = h;
    this.recomputeMatrices();
  }

  setPreset(preset: CameraPreset): void {
    const p = PRESET_STATES[preset];
    this.lastFollowPoint = null;
    this.goal.target = [p.target[0], p.target[1], p.target[2]];
    this.goal.yaw = this.current.yaw + wrapAngleDelta(p.yaw - this.current.yaw);
    this.goal.pitch = p.pitch;
    this.goal.distanceKpc = p.distanceKpc;
    this.goal.fovDeg = p.fovDeg;
  }

  flyTo(target: Vec3, offsetOrDistance?: Vec3 | number, yawRad?: number, pitchRad?: number): void {
    this.lastFollowPoint = null;
    this.goal.target = [target[0], target[1], target[2]];

    if (Array.isArray(offsetOrDistance)) {
      const [dx, dy, dz] = offsetOrDistance;
      const dist = clamp(Math.hypot(dx, dy, dz), MIN_CAMERA_DIST_KPC, MAX_CAMERA_DIST_KPC);
      const nextPitch = clamp(Math.asin(clamp(dy / Math.max(dist, 1e-6), -0.995, 0.995)), MIN_PITCH, MAX_PITCH);
      const nextYaw = Math.atan2(dz, dx);
      this.goal.distanceKpc = dist;
      this.goal.pitch = nextPitch;
      this.goal.yaw = this.current.yaw + wrapAngleDelta(nextYaw - this.current.yaw);
      return;
    }

    if (typeof offsetOrDistance === 'number' && Number.isFinite(offsetOrDistance)) {
      this.goal.distanceKpc = clamp(offsetOrDistance, MIN_CAMERA_DIST_KPC, MAX_CAMERA_DIST_KPC);
    }
    if (typeof yawRad === 'number' && Number.isFinite(yawRad)) {
      this.goal.yaw = this.current.yaw + wrapAngleDelta(yawRad - this.current.yaw);
    }
    if (typeof pitchRad === 'number' && Number.isFinite(pitchRad)) {
      this.goal.pitch = clamp(pitchRad, MIN_PITCH, MAX_PITCH);
    }
  }

  /**
   * Smoothly locks onto and co-moves with a dynamically orbiting point (e.g., Sol)
   * without overriding user orbit/zoom angles.
   */
  followPoint(point: Vec3): void {
    this.followedThisFrame = true;
    if (this.lastFollowPoint) {
      const dx = point[0] - this.lastFollowPoint[0];
      const dy = point[1] - this.lastFollowPoint[1];
      const dz = point[2] - this.lastFollowPoint[2];
      this.current.target[0] += dx;
      this.current.target[1] += dy;
      this.current.target[2] += dz;
      this.goal.target[0] += dx;
      this.goal.target[1] += dy;
      this.goal.target[2] += dz;
    } else {
      this.goal.target = [point[0], point[1], point[2]];
    }
    this.lastFollowPoint = [point[0], point[1], point[2]];
  }

  update(dtSec: number, autoOrbit = false): void {
    const dt = clamp(dtSec, 0.0001, 0.1);

    if (!this.followedThisFrame) {
      this.lastFollowPoint = null;
    }
    this.followedThisFrame = false;

    if (autoOrbit && !this.isUserInteracting) {
      this.goal.yaw += dt * 0.085;
    }

    // Critically damped exponential smoothing
    const smoothPos = 1 - Math.exp(-8.5 * dt);
    const smoothRot = 1 - Math.exp(-10.5 * dt);
    const smoothZoom = 1 - Math.exp(-11.0 * dt);

    this.current.target[0] += (this.goal.target[0] - this.current.target[0]) * smoothPos;
    this.current.target[1] += (this.goal.target[1] - this.current.target[1]) * smoothPos;
    this.current.target[2] += (this.goal.target[2] - this.current.target[2]) * smoothPos;

    this.current.yaw += (this.goal.yaw - this.current.yaw) * smoothRot;
    this.current.pitch += (this.goal.pitch - this.current.pitch) * smoothRot;

    // Log-space distance smoothing makes zooming across 5 orders of magnitude silky smooth
    const logCur = Math.log(Math.max(this.current.distanceKpc, MIN_CAMERA_DIST_KPC));
    const logGoal = Math.log(Math.max(this.goal.distanceKpc, MIN_CAMERA_DIST_KPC));
    this.current.distanceKpc = clamp(
      Math.exp(logCur + (logGoal - logCur) * smoothZoom),
      MIN_CAMERA_DIST_KPC,
      MAX_CAMERA_DIST_KPC
    );

    this.current.fovDeg += (this.goal.fovDeg - this.current.fovDeg) * smoothRot;

    this.recomputeMatrices();
  }

  getState(): CameraState {
    return {
      target: [this.current.target[0], this.current.target[1], this.current.target[2]],
      yaw: this.current.yaw,
      pitch: this.current.pitch,
      distanceKpc: this.current.distanceKpc,
      fovDeg: this.current.fovDeg,
    };
  }

  getEyePosition(): Vec3 {
    return [this.eyePos[0], this.eyePos[1], this.eyePos[2]];
  }

  getViewMatrix(): Mat4 {
    return this.viewMatrix;
  }

  getProjMatrix(): Mat4 {
    return this.projMatrix;
  }

  getViewProjMatrix(): Mat4 {
    return this.viewProjMatrix;
  }

  getInvViewProjMatrix(): Mat4 {
    return this.invViewProjMatrix;
  }

  getRightVector(): Vec3 {
    return [this.rightVec[0], this.rightVec[1], this.rightVec[2]];
  }

  getUpVector(): Vec3 {
    return [this.upVec[0], this.upVec[1], this.upVec[2]];
  }

  getNearFar(): [number, number] {
    return [this.nearKpc, this.farKpc];
  }

  getFocalLengthPx(): number {
    const fovRad = (this.current.fovDeg * Math.PI) / 180;
    return (this.viewportHeightPx * 0.5) / Math.tan(fovRad * 0.5);
  }

  attachControls(element: HTMLElement): () => void {
    this.detachControls();

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
      element.setPointerCapture?.(e.pointerId);
      this.activePointers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
        button: e.button,
        shift: e.shiftKey,
      });
      this.isUserInteracting = true;
      this.resetPinchTracking();
    };

    const onPointerMove = (e: PointerEvent) => {
      const prev = this.activePointers.get(e.pointerId);
      if (!prev) return;

      if (this.activePointers.size >= 2) {
        this.activePointers.set(e.pointerId, {
          ...prev,
          x: e.clientX,
          y: e.clientY,
        });
        this.handleMultiTouchGesture(element);
        return;
      }

      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      prev.x = e.clientX;
      prev.y = e.clientY;
      prev.shift = e.shiftKey;

      const isPan = prev.button === 2 || prev.button === 1 || e.shiftKey;
      if (isPan) {
        this.panByPixels(dx, dy, element.clientHeight || this.viewportHeightPx);
      } else {
        const orbitScale = 0.0055;
        this.goal.yaw += dx * orbitScale;
        this.goal.pitch = clamp(this.goal.pitch + dy * orbitScale, MIN_PITCH, MAX_PITCH);
      }
    };

    const onPointerUpOrCancel = (e: PointerEvent) => {
      this.activePointers.delete(e.pointerId);
      if (element.hasPointerCapture?.(e.pointerId)) {
        try {
          element.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore if already released
        }
      }
      this.resetPinchTracking();
      if (this.activePointers.size === 0) {
        this.isUserInteracting = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 18;
      else if (e.deltaMode === 2) delta *= 300;
      delta = clamp(delta, -260, 260);
      const factor = Math.exp(delta * 0.00125);
      this.goal.distanceKpc = clamp(
        this.goal.distanceKpc * factor,
        MIN_CAMERA_DIST_KPC,
        MAX_CAMERA_DIST_KPC
      );
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUpOrCancel);
    element.addEventListener('pointercancel', onPointerUpOrCancel);
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('contextmenu', onContextMenu);

    this.detachFn = () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUpOrCancel);
      element.removeEventListener('pointercancel', onPointerUpOrCancel);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('contextmenu', onContextMenu);
      this.activePointers.clear();
      this.isUserInteracting = false;
    };

    return () => this.detachControls();
  }

  detachControls(): void {
    if (this.detachFn) {
      this.detachFn();
      this.detachFn = null;
    }
  }

  dispose(): void {
    this.detachControls();
  }

  private resetPinchTracking(): void {
    if (this.activePointers.size < 2) {
      this.lastPinchDist = 0;
      this.lastPinchCenter = null;
      return;
    }
    const pts = Array.from(this.activePointers.values());
    const p0 = pts[0];
    const p1 = pts[1];
    this.lastPinchDist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    this.lastPinchCenter = { x: (p0.x + p1.x) * 0.5, y: (p0.y + p1.y) * 0.5 };
  }

  private handleMultiTouchGesture(element: HTMLElement): void {
    const pts = Array.from(this.activePointers.values());
    if (pts.length < 2) return;
    const p0 = pts[0];
    const p1 = pts[1];
    const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const center = { x: (p0.x + p1.x) * 0.5, y: (p0.y + p1.y) * 0.5 };

    if (this.lastPinchDist > 1 && dist > 1) {
      const ratio = this.lastPinchDist / dist;
      this.goal.distanceKpc = clamp(
        this.goal.distanceKpc * ratio,
        MIN_CAMERA_DIST_KPC,
        MAX_CAMERA_DIST_KPC
      );
    }
    if (this.lastPinchCenter) {
      this.panByPixels(
        center.x - this.lastPinchCenter.x,
        center.y - this.lastPinchCenter.y,
        element.clientHeight || this.viewportHeightPx
      );
    }

    this.lastPinchDist = dist;
    this.lastPinchCenter = center;
  }

  private panByPixels(dx: number, dy: number, viewportHeight: number): void {
    const fovRad = (this.current.fovDeg * Math.PI) / 180;
    const worldHeight = 2 * this.goal.distanceKpc * Math.tan(fovRad * 0.5);
    const kpcPerPx = worldHeight / Math.max(1, viewportHeight);

    const moveRight = -dx * kpcPerPx;
    const moveUp = dy * kpcPerPx;

    this.goal.target[0] += this.rightVec[0] * moveRight + this.upVec[0] * moveUp;
    this.goal.target[1] += this.rightVec[1] * moveRight + this.upVec[1] * moveUp;
    this.goal.target[2] += this.rightVec[2] * moveRight + this.upVec[2] * moveUp;

    // Keep target within reasonable extragalactic bounds
    this.goal.target[0] = clamp(this.goal.target[0], -45, 45);
    this.goal.target[1] = clamp(this.goal.target[1], -30, 30);
    this.goal.target[2] = clamp(this.goal.target[2], -45, 45);
  }

  private recomputeMatrices(): void {
    const { target, yaw, pitch, distanceKpc, fovDeg } = this.current;
    const cosPitch = Math.cos(pitch);
    this.eyePos = [
      target[0] + distanceKpc * cosPitch * Math.cos(yaw),
      target[1] + distanceKpc * Math.sin(pitch),
      target[2] + distanceKpc * cosPitch * Math.sin(yaw),
    ];

    this.nearKpc = clamp(distanceKpc * 0.002, 0.00005, 0.5);
    this.farKpc = Math.max(250.0, distanceKpc * 8.0);

    lookAtMat4(this.eyePos, target, [0, 1, 0], this.viewMatrix);

    // Extract camera world-space right & up axes directly from view matrix rows
    this.rightVec = [this.viewMatrix[0], this.viewMatrix[4], this.viewMatrix[8]];
    this.upVec = [this.viewMatrix[1], this.viewMatrix[5], this.viewMatrix[9]];

    const fovRad = (fovDeg * Math.PI) / 180;
    perspectiveMat4(fovRad, this.aspect, this.nearKpc, this.farKpc, this.projMatrix);
    multiplyMat4(this.projMatrix, this.viewMatrix, this.viewProjMatrix);
    invertMat4(this.viewProjMatrix, this.invViewProjMatrix);
  }
}
