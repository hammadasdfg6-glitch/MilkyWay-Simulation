export type Vec3 = [number, number, number];
export type Mat4 = Float32Array;

/**
 * Create a new 4x4 column-major identity matrix.
 */
export function createMat4(): Mat4 {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

/**
 * Build a right-handed WebGL perspective projection matrix.
 * @param fovRad Vertical field of view in radians.
 */
export function perspectiveMat4(
  fovRad: number,
  aspect: number,
  near: number,
  far: number,
  out: Mat4 = new Float32Array(16)
): Mat4 {
  const safeAspect = Math.max(aspect, 1e-6);
  const f = 1.0 / Math.tan(fovRad * 0.5);
  const nf = 1.0 / (near - far);

  out[0] = f / safeAspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;

  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;

  out[8] = 0;
  out[9] = 0;
  out[10] = (far + near) * nf;
  out[11] = -1;

  out[12] = 0;
  out[13] = 0;
  out[14] = 2 * far * near * nf;
  out[15] = 0;

  return out;
}

/**
 * Build a right-handed column-major view matrix looking from `eye` toward `target`.
 */
export function lookAtMat4(
  eye: Vec3,
  target: Vec3,
  up: Vec3 = [0, 1, 0],
  out: Mat4 = new Float32Array(16)
): Mat4 {
  let zx = eye[0] - target[0];
  let zy = eye[1] - target[1];
  let zz = eye[2] - target[2];
  let zLen = Math.hypot(zx, zy, zz);

  if (zLen < 1e-8) {
    zx = 0;
    zy = 0;
    zz = 1;
  } else {
    zx /= zLen;
    zy /= zLen;
    zz /= zLen;
  }

  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  let xLen = Math.hypot(xx, xy, xz);

  if (xLen < 1e-8) {
    // Fallback up vector when view direction is collinear with `up`
    const altUp: Vec3 = Math.abs(up[2]) < 0.9 ? [0, 0, -1] : [1, 0, 0];
    xx = altUp[1] * zz - altUp[2] * zy;
    xy = altUp[2] * zx - altUp[0] * zz;
    xz = altUp[0] * zy - altUp[1] * zx;
    xLen = Math.hypot(xx, xy, xz) || 1;
  }

  xx /= xLen;
  xy /= xLen;
  xz /= xLen;

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  out[0] = xx;
  out[1] = yx;
  out[2] = zx;
  out[3] = 0;

  out[4] = xy;
  out[5] = yy;
  out[6] = zy;
  out[7] = 0;

  out[8] = xz;
  out[9] = yz;
  out[10] = zz;
  out[11] = 0;

  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[15] = 1;

  return out;
}

/**
 * Multiply two 4x4 column-major matrices: out = a * b.
 */
export function multiplyMat4(
  a: Mat4,
  b: Mat4,
  out: Mat4 = new Float32Array(16)
): Mat4 {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  return out;
}

/**
 * Invert a 4x4 column-major matrix. Falls back to identity if singular.
 */
export function invertMat4(
  m: Mat4,
  out: Mat4 = new Float32Array(16)
): Mat4 {
  const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
  const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
  const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
  const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  const det =
    b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (Math.abs(det) < 1e-12) {
    out.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    return out;
  }

  const invDet = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * invDet;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * invDet;

  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * invDet;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * invDet;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;

  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * invDet;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * invDet;

  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * invDet;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * invDet;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

  return out;
}

/**
 * Project a 3D world-space point into 2D screen coordinates (top-left origin).
 */
export function projectPoint(
  pos: Vec3,
  viewProj: Mat4,
  width: number,
  height: number
): { x: number; y: number; z: number; visible: boolean } {
  const px = pos[0];
  const py = pos[1];
  const pz = pos[2];

  const cx = viewProj[0] * px + viewProj[4] * py + viewProj[8] * pz + viewProj[12];
  const cy = viewProj[1] * px + viewProj[5] * py + viewProj[9] * pz + viewProj[13];
  const cz = viewProj[2] * px + viewProj[6] * py + viewProj[10] * pz + viewProj[14];
  const cw = viewProj[3] * px + viewProj[7] * py + viewProj[11] * pz + viewProj[15];

  if (cw <= 1e-6) {
    return { x: -1000, y: -1000, z: 1, visible: false };
  }

  const invW = 1.0 / cw;
  const ndcX = cx * invW;
  const ndcY = cy * invW;
  const ndcZ = cz * invW;

  const x = (ndcX * 0.5 + 0.5) * width;
  const y = (0.5 - ndcY * 0.5) * height;
  const visible =
    ndcZ >= -1.0 &&
    ndcZ <= 1.0 &&
    ndcX >= -1.0 &&
    ndcX <= 1.0 &&
    ndcY >= -1.0 &&
    ndcY <= 1.0;

  return { x, y, z: ndcZ, visible };
}

/**
 * Rotate a 3D point in the Galactic plane (around +Y axis, clockwise when
 * viewed from Galactic North +Y so positive omega moves Sol toward l = 90° / -Z):
 *   x' = x * cos(angleRad) - z * sin(angleRad)
 *   z' = x * sin(angleRad) + z * cos(angleRad)
 */
export function rotateY(pos: Vec3, angleRad: number): Vec3 {
  if (angleRad === 0) {
    return [pos[0], pos[1], pos[2]];
  }
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  return [
    pos[0] * c - pos[2] * s,
    pos[1],
    pos[0] * s + pos[2] * c,
  ];
}
