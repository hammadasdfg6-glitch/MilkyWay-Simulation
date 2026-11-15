/**
 * GLSL ES 3.00 shaders for Milky Way Observatory:
 * - Precomputed 1024x1024 Galactic Dust & ISM spiral density texture
 * - Deep-space extragalactic sky backdrop
 * - Volumetric H-II / Reflection / Bulge scattering nebulae (instanced quads)
 * - 500K-5M star point-sprite renderer with real-time 4-tap midplane dust extinction,
 *   interstellar reddening, multi-wavelength modes, Planckian blackbody colorimetry,
 *   and bright-star PSF diffraction spikes
 * - Sagittarius A* relativistic black hole shadow, Doppler-beamed accretion disk,
 *   and gravitationally lensed photon ring
 * - 5-level progressive HDR Kawase/tent bloom downsample & upsample passes
 * - ACES Filmic tone-mapping & sRGB composite pass
 */

export const FULLSCREEN_VERT = /* glsl */ `#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  // Single fullscreen triangle covering clip space [-1, 1] with zero VBO attributes
  float x = float((gl_VertexID & 1) << 2) - 1.0;
  float y = float((gl_VertexID & 2) << 1) - 1.0;
  vUv = vec2(x, y) * 0.5 + 0.5;
  gl_Position = vec4(x, y, 0.0, 1.0);
}
`;

export const DUST_MAP_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    v += a * valueNoise(p);
    p = rot * p * 2.04 + vec2(17.1, 31.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  // World galactic plane coordinates in [-20, +20] kpc
  vec2 xz = (vUv - 0.5) * 40.0;
  float r = length(xz);
  float theta = atan(xz.y, xz.x);

  // Domain-warped spiral coordinates for feathery filamentary dust lanes
  float warpA = fbm(xz * 0.38 + vec2(4.2, -2.7)) - 0.5;
  float warpB = fbm(xz * 0.92 + vec2(-9.1, 6.4)) - 0.5;
  float filament = fbm(xz * 1.85 + vec2(warpA * 2.6, warpB * 2.6));
  float fineRift = fbm(xz * 4.1 - vec2(warpB * 1.8, warpA * 1.8));

  // Logarithmic 4-arm SBbc spiral model (pitch angle ~12.5 deg => k = 4.51)
  float pitchK = 4.51;
  float rLog = log(max(r, 1.15) / 3.1);
  float spiralAngle = theta + pitchK * rLog + warpA * 0.34;

  // 4 major arms: Scutum-Centaurus, Perseus, Sagittarius-Carina, Norma-Outer
  float armWave = 0.0;
  float h2Wave = 0.0;
  float armOffsets[4] = float[4](0.0, 1.570796, 3.141593, 4.712389);
  float armWeights[4] = float[4](1.05, 1.0, 0.88, 0.82);

  for (int i = 0; i < 4; i++) {
    // Dust shock lane sits slightly on the inner/concave edge (-0.18 rad) of the bright arm
    float dArm = atan(sin(spiralAngle - armOffsets[i]), cos(spiralAngle - armOffsets[i]));
    float dDust = atan(sin(spiralAngle - armOffsets[i] + 0.16), cos(spiralAngle - armOffsets[i] + 0.16));
    float armCore = exp(-(dArm * dArm) / (2.0 * 0.24 * 0.24));
    float dustLane = exp(-(dDust * dDust) / (2.0 * 0.16 * 0.16));
    armWave += armWeights[i] * dustLane;
    h2Wave += armWeights[i] * armCore;
  }

  // Orion-Cygnus local spur matching astro model: theta = PI - 3.6 * ln(r / 8.178)
  float orionTheta = PI - 3.6 * log(max(r, 1.0) / 8.178);
  float dOrion = atan(sin(theta - orionTheta + 0.03), cos(theta - orionTheta + 0.03));
  float orionArcDist = abs(dOrion) * r;
  float orionSpur = exp(-(orionArcDist * orionArcDist) / (2.0 * 0.38 * 0.38))
    * smoothstep(6.2, 7.0, r) * (1.0 - smoothstep(9.6, 10.6, r));
  float orionDust = orionSpur * (0.55 + 0.95 * filament);

  // Molecular ring (3.2 - 5.4 kpc) + inner bar dust lanes (bar tilted ~27 deg from Sun-GC axis)
  float molRing = exp(-pow((r - 4.1) / 1.35, 2.0));
  float barCos = cos(0.4712); // 27 deg
  float barSin = sin(0.4712);
  vec2 barLocal = vec2(xz.x * barCos + xz.y * barSin, -xz.x * barSin + xz.y * barCos);
  float barDust = exp(-pow(abs(barLocal.y) / 0.38, 2.0)) * (1.0 - smoothstep(0.6, 3.4, abs(barLocal.x))) * smoothstep(0.35, 0.9, r);

  // Radial disk dust profile: starts outside nuclear cavity, peaks 3-9 kpc, tapers by 16.5 kpc
  float innerClear = smoothstep(0.30, 1.4, r);
  float outerTaper = 1.0 - smoothstep(11.5, 17.5, r);
  float radialEnv = innerClear * outerTaper;

  // Combine into realistic filamentary Great Rift optical density
  float clump = smoothstep(0.22, 0.88, filament * 0.68 + fineRift * 0.36);
  float dustDensity = radialEnv * (
    0.16 +
    0.68 * armWave * (0.35 + 0.95 * clump) +
    0.34 * molRing * (0.45 + 0.75 * clump) +
    0.55 * orionDust +
    0.45 * barDust * (0.5 + 0.7 * fineRift)
  );
  // Subtle dense nuclear circumnuclear ring at 0.2 - 0.55 kpc
  dustDensity += 0.38 * exp(-pow((r - 0.36) / 0.18, 2.0)) * (0.6 + 0.6 * fineRift);

  float h2Density = radialEnv * (h2Wave * (0.4 + 0.8 * clump) + 0.5 * orionSpur);
  float molecularDensity = radialEnv * (molRing * 0.75 + armWave * 0.45) * (0.4 + 0.6 * fineRift);

  fragColor = vec4(
    clamp(dustDensity, 0.0, 2.2),
    clamp(h2Density, 0.0, 2.0),
    clamp(molecularDensity, 0.0, 2.0),
    1.0
  );
}
`;

export const SKY_VERT = /* glsl */ `#version 300 es
precision highp float;

out vec2 vNdc;

void main() {
  float x = float((gl_VertexID & 1) << 2) - 1.0;
  float y = float((gl_VertexID & 2) << 1) - 1.0;
  vNdc = vec2(x, y);
  gl_Position = vec4(x, y, 0.9999, 1.0);
}
`;

export const SKY_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vNdc;
out vec4 fragColor;

uniform mat4 uInvViewProj;
uniform int uWavelength;

float hash31(vec3 p) {
  p = fract(p * vec3(443.8975, 397.2973, 491.1871));
  p += dot(p, p.yxz + 19.19);
  return fract((p.x + p.y) * p.z);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yxz + 19.19);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float backgroundStars(vec3 dir, float scale, float densityThreshold) {
  vec3 grid = dir * scale;
  vec3 id = floor(grid);
  vec3 f = fract(grid) - 0.5;
  vec3 rnd = hash33(id);
  float prob = hash31(id + 7.13);
  if (prob < densityThreshold) return 0.0;
  vec3 offset = (rnd - 0.5) * 0.55;
  float d = length(f - offset);
  float brightness = smoothstep(0.14, 0.0, d) * pow((prob - densityThreshold) / (1.0 - densityThreshold), 2.2);
  return brightness;
}

void main() {
  vec4 farWorld = uInvViewProj * vec4(vNdc, 1.0, 1.0);
  vec4 nearWorld = uInvViewProj * vec4(vNdc, -1.0, 1.0);
  vec3 dir = normalize(farWorld.xyz / farWorld.w - nearWorld.xyz / nearWorld.w);

  // Subtle deep cosmic sky background (purely sub-threshold HDR so Milky Way pops against obsidian cosmos)
  float galLat = abs(dir.y);
  vec3 cosmicBase = mix(vec3(0.0022, 0.0026, 0.0044), vec3(0.0010, 0.0013, 0.0024), galLat);
  if (uWavelength == 1) {
    cosmicBase = vec3(0.0020, 0.0014, 0.0010);
  } else if (uWavelength == 2) {
    cosmicBase = vec3(0.0012, 0.0016, 0.0038);
  }

  // Ultra-faint distant extragalactic field stars locked to infinity
  float s1 = backgroundStars(dir, 175.0, 0.962);
  float s2 = backgroundStars(dir, 320.0, 0.972) * 0.45;
  vec3 starTint = mix(vec3(0.95, 0.88, 0.78), vec3(0.75, 0.85, 1.0), hash31(floor(dir * 175.0)));

  // Faint Local Group companion hints (Andromeda M31 + LMC/SMC soft distant glows)
  vec3 m31Dir = normalize(vec3(0.58, 0.34, -0.74));
  float m31Dot = max(dot(dir, m31Dir), 0.0);
  float m31Glow = pow(m31Dot, 900.0) * 0.08 + pow(m31Dot, 220.0) * 0.015;

  vec3 lmcDir = normalize(vec3(-0.32, -0.51, 0.80));
  float lmcDot = max(dot(dir, lmcDir), 0.0);
  float lmcGlow = pow(lmcDot, 360.0) * 0.025;

  vec3 color = cosmicBase + starTint * (s1 + s2) * 0.35 + vec3(0.92, 0.84, 0.72) * m31Glow + vec3(0.68, 0.78, 0.96) * lmcGlow;
  fragColor = vec4(color, 1.0);
}
`;

export const NEBULA_VERT = /* glsl */ `#version 300 es
precision highp float;

// Instanced attributes per nebula cloud (divisor = 1)
layout(location = 0) in vec4 aPosOmega;     // x0, y0, z0, omega
layout(location = 1) in vec4 aNebulaProps;  // kind, radiusKpc, density, seed

uniform mat4 uViewProj;
uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform float uTimeMyr;
uniform float uCameraDist;
uniform float uDustOpacity;
uniform float uNebulaIntensity;
uniform int uWavelength;
uniform sampler2D uDustMap;

out vec2 vQuadUv;
out vec3 vColor;
out float vAlpha;
out float vSeed;
out float vKind;

vec3 rotateY(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
}

vec3 sampleDustOpticalDepth(vec3 worldPos) {
  if (uDustOpacity <= 0.0001) return vec3(0.0);
  const float H = 0.34;
  vec3 delta = worldPos - uCameraPos;
  float totalDist = length(delta);
  if (totalDist < 0.001) return vec3(0.0);

  float tMin = 0.0;
  float tMax = 1.0;
  if (abs(delta.y) < 1e-5) {
    if (abs(uCameraPos.y) >= H) return vec3(0.0);
  } else {
    float tA = (-H - uCameraPos.y) / delta.y;
    float tB = ( H - uCameraPos.y) / delta.y;
    tMin = max(0.0, min(tA, tB));
    tMax = min(1.0, max(tA, tB));
    if (tMax <= tMin) return vec3(0.0);
  }

  float segLen = totalDist * (tMax - tMin);
  float dt = (tMax - tMin) / 4.0;
  float stepKpc = segLen / 4.0;
  float lod = clamp(log2(max(stepKpc / 0.045, 1.0)), 0.0, 5.0);

  float rotAngle = -uTimeMyr * 0.025;
  float c = cos(rotAngle);
  float s = sin(rotAngle);

  vec3 accum = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float t = tMin + (float(i) + 0.5) * dt;
    vec3 p = uCameraPos + delta * t;
    float verticalWeight = exp(-(p.y * p.y) / (2.0 * 0.115 * 0.115));
    vec2 xzRot = vec2(p.x * c - p.z * s, p.x * s + p.z * c);
    vec2 uv = xzRot / 40.0 + 0.5;
    if (uv.x > 0.01 && uv.x < 0.99 && uv.y > 0.01 && uv.y < 0.99) {
      accum += textureLod(uDustMap, uv, lod).rgb * verticalWeight;
    }
  }
  return accum * (stepKpc * 2.15 * uDustOpacity);
}

void main() {
  // 6 vertices forming a quad: (-1,-1), (1,-1), (1,1), (-1,-1), (1,1), (-1,1)
  vec2 corners[6] = vec2[6](
    vec2(-1.0, -1.0),
    vec2( 1.0, -1.0),
    vec2( 1.0,  1.0),
    vec2(-1.0, -1.0),
    vec2( 1.0,  1.0),
    vec2(-1.0,  1.0)
  );
  vec2 corner = corners[gl_VertexID];
  vQuadUv = corner;

  vec3 worldCenter = rotateY(aPosOmega.xyz, aPosOmega.w * uTimeMyr);
  float kind = aNebulaProps.x;
  float radiusKpc = aNebulaProps.y;
  float density = aNebulaProps.z;
  float seed = aNebulaProps.w;
  vSeed = seed;
  vKind = kind;

  float camDist = length(worldCenter - uCameraPos);
  // Fade each billboard relative to its own radiusKpc so close-up cameras never get engulfed by quads
  float closeFade = smoothstep(radiusKpc * 0.75, radiusKpc * 2.5, camDist);
  if (closeFade <= 0.001 || uNebulaIntensity <= 0.001) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    vAlpha = 0.0;
    vColor = vec3(0.0);
    return;
  }

  vec3 worldPos = worldCenter + (uCameraRight * corner.x + uCameraUp * corner.y) * radiusKpc;
  gl_Position = uViewProj * vec4(worldPos, 1.0);

  // Evaluate line-of-sight dust optical depth & extinction
  vec3 dustSample = sampleDustOpticalDepth(worldCenter);
  float tau = dustSample.r;

  vec3 baseColor;
  vec3 extinction;
  float intensityScale = density * uNebulaIntensity * closeFade;

  if (kind < 0.5) {
    // 0: H-II emission nursery (H-alpha #ff3060 + OIII hints)
    baseColor = mix(vec3(1.0, 0.19, 0.38), vec3(0.95, 0.30, 0.55), fract(seed * 3.17));
    intensityScale *= 0.036;
  } else if (kind < 1.5) {
    // 1: Reflection nebula near hot OB clusters (#50a8ff)
    baseColor = mix(vec3(0.28, 0.65, 1.0), vec3(0.45, 0.78, 1.0), fract(seed * 5.71));
    intensityScale *= 0.030;
  } else {
    // 2: Warm unresolved bulge/disk stellar-dust scattering haze (fades away when zoomed inside galaxy)
    float rGal = length(worldCenter.xz);
    vec3 bulgeHue = vec3(1.0, 0.68, 0.34);
    vec3 diskHue = vec3(0.75, 0.72, 0.80);
    baseColor = mix(bulgeHue, diskHue, smoothstep(1.5, 8.0, rGal));
    float hazeZoomFade = smoothstep(0.9, 5.2, uCameraDist);
    intensityScale *= 0.0095 * hazeZoomFade;
  }

  if (uWavelength == 0) {
    // Optical
    extinction = exp(-tau * vec3(1.15, 1.55, 2.25));
  } else if (uWavelength == 1) {
    // Infrared (JWST): dust-penetrating warm amber-gold glow, PAH filaments glow in mid-IR
    extinction = exp(-tau * 0.14 * vec3(0.45, 0.70, 1.0));
    baseColor = mix(vec3(1.0, 0.58, 0.22), vec3(1.0, 0.76, 0.44), kind * 0.45);
    intensityScale *= (kind > 1.5 ? 1.25 : 0.85);
  } else if (uWavelength == 2) {
    // Ultraviolet (GALEX): strong UV dust absorption, highlights young OB reflection nebulae
    extinction = exp(-tau * 1.90 * vec3(1.2, 1.4, 1.8));
    if (kind < 0.5) {
      baseColor = vec3(0.68, 0.52, 1.0);
      intensityScale *= 0.85;
    } else if (kind < 1.5) {
      baseColor = vec3(0.48, 0.74, 1.15);
      intensityScale *= 1.35;
    } else {
      baseColor = vec3(0.40, 0.50, 0.85);
      intensityScale *= 0.35;
    }
  } else {
    // Population diagnostic mode: suppress nebula fog so star populations read crisply
    extinction = exp(-tau * 0.35 * vec3(1.0));
    intensityScale *= 0.22;
  }

  vColor = baseColor * extinction;
  vAlpha = intensityScale;
}
`;

export const NEBULA_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vQuadUv;
in vec3 vColor;
in float vAlpha;
in float vSeed;
in float vKind;

out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm3(vec2 p) {
  float s = 0.0;
  float a = 0.55;
  mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    s += a * noise(p);
    p = m * p * 2.05;
    a *= 0.5;
  }
  return s;
}

void main() {
  if (vAlpha <= 0.0001) discard;
  float r2 = dot(vQuadUv, vQuadUv);
  if (r2 >= 1.0) discard;

  // Rotate UV per cloud seed so every sprite has unique organic orientation
  float ang = vSeed * 6.2831853;
  float c = cos(ang);
  float s = sin(ang);
  vec2 ruv = vec2(vQuadUv.x * c - vQuadUv.y * s, vQuadUv.x * s + vQuadUv.y * c);

  // Soft Gaussian falloff + FBM wisp modulation for emission & reflection clouds
  float gaussian = exp(-r2 * 4.2) * (1.0 - smoothstep(0.65, 1.0, sqrt(r2)));
  float wisp = vKind < 1.5
    ? mix(0.45, 1.35, fbm3(ruv * 2.4 + vec2(vSeed * 13.7, vSeed * 7.3)))
    : mix(0.75, 1.15, fbm3(ruv * 1.5 + vec2(vSeed * 5.1, vSeed * 11.3)));

  float density = gaussian * wisp * vAlpha;
  fragColor = vec4(vColor * density, 1.0);
}
`;

export const STAR_VERT = /* glsl */ `#version 300 es
precision highp float;

layout(location = 0) in vec4 aPosOmega;  // x0, y0, z0, omega (kpc, rad/Myr)
layout(location = 1) in vec4 aStarProps; // tempK, luminosity, size, population

uniform mat4 uViewProj;
uniform vec3 uCameraPos;
uniform float uTimeMyr;
uniform float uDpr;
uniform float uFocalLengthPx;
uniform float uCameraDist;
uniform float uMaxPointSize;
uniform float uDustOpacity;
uniform float uStarNorm;
uniform int uWavelength;
uniform sampler2D uDustMap;

out vec3 vColor;
out float vLuminance;
out float vPointSize;

vec3 rotateY(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
}

vec3 blackbodyLinear(float tempK) {
  float t = clamp(tempK, 1900.0, 42000.0) / 100.0;
  float r, g, b;
  if (t <= 66.0) {
    r = 1.0;
    g = clamp(0.390081578769 * log(max(t, 1.0)) - 0.631841443788, 0.0, 1.0);
  } else {
    float x = t - 60.0;
    r = clamp(1.29293618606 * pow(max(x, 0.1), -0.1332047592), 0.0, 1.0);
    g = clamp(1.12989086090 * pow(max(x, 0.1), -0.0755148492), 0.0, 1.0);
  }
  if (t >= 66.0) {
    b = 1.0;
  } else if (t <= 19.0) {
    b = 0.0;
  } else {
    b = clamp(0.54320678911 * log(max(t - 10.0, 1.0)) - 1.19625408914, 0.0, 1.0);
  }
  vec3 lin = pow(max(vec3(r, g, b), vec3(0.001)), vec3(2.2));
  float lum = dot(lin, vec3(0.2126, 0.7152, 0.0722));
  return lin / max(lum, 0.15) * 0.72;
}

vec3 sampleDustOpticalDepth(vec3 worldPos) {
  if (uDustOpacity <= 0.0001) return vec3(0.0);
  const float H = 0.34;
  vec3 delta = worldPos - uCameraPos;
  float totalDist = length(delta);
  if (totalDist < 0.001) return vec3(0.0);

  float tMin = 0.0;
  float tMax = 1.0;
  if (abs(delta.y) < 1e-5) {
    if (abs(uCameraPos.y) >= H) return vec3(0.0);
  } else {
    float tA = (-H - uCameraPos.y) / delta.y;
    float tB = ( H - uCameraPos.y) / delta.y;
    tMin = max(0.0, min(tA, tB));
    tMax = min(1.0, max(tA, tB));
    if (tMax <= tMin) return vec3(0.0);
  }

  float segLen = totalDist * (tMax - tMin);
  float dt = (tMax - tMin) / 4.0;
  float stepKpc = segLen / 4.0;
  float lod = clamp(log2(max(stepKpc / 0.045, 1.0)), 0.0, 5.0);

  float rotAngle = -uTimeMyr * 0.025;
  float c = cos(rotAngle);
  float s = sin(rotAngle);

  vec3 accum = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float t = tMin + (float(i) + 0.5) * dt;
    vec3 p = uCameraPos + delta * t;
    float verticalWeight = exp(-(p.y * p.y) / (2.0 * 0.115 * 0.115));
    vec2 xzRot = vec2(p.x * c - p.z * s, p.x * s + p.z * c);
    vec2 uv = xzRot / 40.0 + 0.5;
    if (uv.x > 0.01 && uv.x < 0.99 && uv.y > 0.01 && uv.y < 0.99) {
      accum += textureLod(uDustMap, uv, lod).rgb * verticalWeight;
    }
  }
  return accum * (stepKpc * 2.15 * uDustOpacity);
}

void main() {
  vec3 worldPos = rotateY(aPosOmega.xyz, aPosOmega.w * uTimeMyr);
  vec4 clipPos = uViewProj * vec4(worldPos, 1.0);
  gl_Position = clipPos;

  // Early cull vertices clearly outside clip frustum
  float wAbs = abs(clipPos.w) * 1.18 + 0.05;
  if (clipPos.w <= 0.0 || abs(clipPos.x) > wAbs || abs(clipPos.y) > wAbs) {
    gl_PointSize = 0.0;
    vColor = vec3(0.0);
    vLuminance = 0.0;
    vPointSize = 0.0;
    return;
  }

  float tempK = aStarProps.x;
  float luminosity = aStarProps.y;
  float starSize = aStarProps.z;
  int popId = int(aStarProps.w + 0.5);

  float dist = max(length(worldPos - uCameraPos), 0.00035);
  float refDist = max(uCameraDist, 0.04);

  // Smooth multi-scale apparent brightness curve spanning 0.0005 kpc to 120 kpc
  float distAtten = pow(refDist / max(dist, refDist * 0.06), 0.52);
  distAtten = clamp(distAtten, 0.18, 4.5);

  // Perspective-aware point size scaled cleanly by DPR and clamped to [1.0, 44.0] * DPR
  float perspFactor = pow(max(uFocalLengthPx / max(dist, 0.002), 1.0), 0.50);
  float sizePx = clamp(0.90 + starSize * 0.020 * perspFactor, 1.0, 44.0);
  float dprPointSize = clamp(sizePx * uDpr, 1.0, uMaxPointSize);
  gl_PointSize = dprPointSize;
  vPointSize = sizePx;

  // Real-time 4-tap midplane dust optical depth
  vec3 dustSample = sampleDustOpticalDepth(worldPos);
  float tau = dustSample.r;

  vec3 starRgb;
  vec3 extinction;
  float modeGain = 1.0;

  if (uWavelength == 0) {
    // Optical (V-band / RGB) with physical interstellar reddening
    starRgb = blackbodyLinear(tempK);
    extinction = exp(-tau * vec3(1.15, 1.55, 2.25));
  } else if (uWavelength == 1) {
    // Near-Infrared (JWST / 2MASS): penetrates dust lanes, reveals inner bar & cool K/M giants
    extinction = exp(-tau * 0.14 * vec3(0.45, 0.70, 1.0));
    float coolBias = mix(1.35, 0.55, smoothstep(3500.0, 18000.0, tempK));
    starRgb = mix(vec3(1.0, 0.62, 0.25), vec3(1.0, 0.88, 0.68), smoothstep(2800.0, 7500.0, tempK));
    modeGain = coolBias * 1.15;
  } else if (uWavelength == 2) {
    // Ultraviolet (GALEX): strong dust absorption, boosts hot OB stars (> 9000K) & dims cool giants
    extinction = exp(-tau * 1.90 * vec3(1.20, 1.40, 1.80));
    float uvBoost = mix(0.14, 2.75, smoothstep(5800.0, 18000.0, tempK));
    starRgb = mix(vec3(0.55, 0.42, 0.92), vec3(0.52, 0.78, 1.25), smoothstep(9000.0, 30000.0, tempK));
    modeGain = uvBoost;
  } else {
    // Population diagnostic map
    extinction = exp(-tau * 0.35 * vec3(1.0));
    if (popId == 0) {
      starRgb = vec3(1.0, 0.68, 0.18); // Amber-gold Bulge/Bar
    } else if (popId == 1) {
      starRgb = vec3(0.20, 0.78, 1.0); // Cyan-blue Spiral OB
    } else if (popId == 2) {
      starRgb = vec3(0.88, 0.91, 0.97); // Silver-white Thin Disk
    } else if (popId == 3) {
      starRgb = vec3(0.68, 0.38, 0.98); // Violet Thick Disk
    } else {
      starRgb = vec3(0.20, 0.90, 0.55); // Emerald Halo/Globulars
    }
    modeGain = 1.05;
  }

  // Conserve integrated energy across sprite area (sizePx^1.78) and prevent core whiteout
  float areaNorm = 1.0 / pow(max(sizePx, 1.0), 1.78);
  float closeCrowdAtten = mix(0.24, 1.0, smoothstep(0.015, 0.45, uCameraDist));
  float finalLum = luminosity * distAtten * uStarNorm * modeGain * areaNorm * closeCrowdAtten * 0.36;

  vColor = starRgb * extinction * finalLum;
  vLuminance = luminosity * distAtten * modeGain;
}
`;

export const STAR_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec3 vColor;
in float vLuminance;
in float vPointSize;

out vec4 fragColor;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  if (r2 > 1.0) discard;

  // Sub-pixel / pinpoint crispness for distant stars transitioning to Airy PSF for larger stars
  float crispDot = exp(-r2 * 3.1);
  float airyCore = exp(-r2 * 8.0) + 0.24 * exp(-r2 * 2.6);
  float psf = mix(crispDot, airyCore, smoothstep(1.6, 4.5, vPointSize));

  // Subtle 4-point telescope diffraction spikes ONLY on bright nearby/large point sprites
  if (vPointSize > 6.5 && vLuminance > 1.5) {
    float spikeH = exp(-abs(uv.y) * 15.0) * exp(-abs(uv.x) * 3.2);
    float spikeV = exp(-abs(uv.x) * 15.0) * exp(-abs(uv.y) * 3.2);
    float spikeWeight = smoothstep(6.5, 13.0, vPointSize) * smoothstep(1.5, 3.8, vLuminance) * 0.42;
    psf += (spikeH + spikeV) * spikeWeight;
  }

  float edgeFade = 1.0 - smoothstep(0.76, 1.0, sqrt(r2));
  fragColor = vec4(vColor * psf * edgeFade, 1.0);
}
`;

export const SGRA_VERT = /* glsl */ `#version 300 es
precision highp float;

uniform mat4 uViewProj;
uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;

out vec2 vUv;
out float vCamDist;

void main() {
  vec2 corners[6] = vec2[6](
    vec2(-1.0, -1.0),
    vec2( 1.0, -1.0),
    vec2( 1.0,  1.0),
    vec2(-1.0, -1.0),
    vec2( 1.0,  1.0),
    vec2(-1.0,  1.0)
  );
  vec2 c = corners[gl_VertexID];
  vUv = c;

  float camDist = length(uCameraPos);
  vCamDist = camDist;

  // Physical/observatory scale billboard centered at Sgr A* [0, 0, 0]
  // Clearly resolves below 0.25 kpc while smoothly becoming nuclear core point glow from afar
  float worldRadius = clamp(camDist * 0.22, 0.0022, 0.042);
  vec3 worldPos = (uCameraRight * c.x + uCameraUp * c.y) * worldRadius;
  gl_Position = uViewProj * vec4(worldPos, 1.0);
}
`;

export const SGRA_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
in float vCamDist;

out vec4 fragColor;

uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform float uRealTimeSec;
uniform int uWavelength;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.12);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float swirlFbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise2(p);
    p *= 2.08;
    a *= 0.5;
  }
  return v;
}

void main() {
  float r = length(vUv);
  if (r > 1.0) discard;

  // Fade out event horizon detail smoothly above 0.25 kpc, leaving warm nuclear cluster glow
  float closeMix = 1.0 - smoothstep(0.04, 0.28, vCamDist);

  // Project view orientation onto a tilted accretion disk normal (galactic inclination)
  vec3 viewDir = normalize(-uCameraPos);
  vec3 diskNormal = normalize(vec3(0.18, 0.92, 0.34));
  float cosTilt = abs(dot(viewDir, diskNormal));
  float squashY = mix(0.28, 0.92, cosTilt);

  // Event Horizon Shadow radius + gravitationally lensed photon ring
  float shadowRadius = 0.19;
  float shadowMask = (1.0 - smoothstep(shadowRadius * 0.88, shadowRadius * 1.08, r)) * closeMix;

  // Einstein photon ring surrounding the black hole shadow (brightest at r ~ 0.225)
  float ringDist = abs(r - 0.225);
  float photonRing = exp(-(ringDist * ringDist) / (2.0 * 0.016 * 0.016)) * 2.4 * closeMix;

  // Secondary upper/lower lensed halo arch created by light bending around the black hole
  float haloDist = abs(r - 0.28);
  float lensedHalo = exp(-(haloDist * haloDist) / (2.0 * 0.045 * 0.045)) * 0.85 * closeMix;

  // Tilted swirling accretion disk
  vec2 diskCoord = vec2(vUv.x, vUv.y / squashY);
  float diskR = length(diskCoord);
  float diskAng = atan(diskCoord.y, diskCoord.x);

  // Animated differential Keplerian shear in plasma rings
  float shearSpeed = uRealTimeSec * (0.85 / max(diskR, 0.18));
  float spiralPhase = diskAng + 6.0 * log(max(diskR, 0.15)) - shearSpeed;
  float plasma = swirlFbm(vec2(cos(spiralPhase) * 2.5 + diskR * 9.0, sin(spiralPhase) * 2.5 + diskR * 9.0));

  float diskRadialEnv = smoothstep(0.19, 0.27, diskR) * exp(-max(diskR - 0.26, 0.0) * 5.2);
  float diskIntensity = diskRadialEnv * (0.55 + 0.95 * plasma) * closeMix;

  // Relativistic Doppler beaming: approaching side (+X) boosted and hotter; receding side (-X) dimmed & redshifted
  float doppler = clamp(1.0 + 0.62 * (-vUv.x / max(r, 0.15)) * (1.0 - 0.4 * cosTilt), 0.35, 1.75);
  diskIntensity *= doppler;

  // Distant nuclear star cluster core glow (> 0.20 kpc)
  float farCoreGlow = exp(-r * r * 14.0) * (1.0 - closeMix) * 0.65;

  // Palette per wavelength mode
  vec3 hotColor = vec3(1.0, 0.88, 0.56);
  vec3 warmColor = vec3(1.0, 0.42, 0.08);
  if (uWavelength == 1) {
    hotColor = vec3(1.0, 0.78, 0.36);
    warmColor = vec3(0.95, 0.30, 0.06);
  } else if (uWavelength == 2) {
    hotColor = vec3(0.75, 0.90, 1.25);
    warmColor = vec3(0.48, 0.36, 1.0);
  } else if (uWavelength == 3) {
    hotColor = vec3(1.0, 0.75, 0.25);
    warmColor = vec3(0.85, 0.45, 0.10);
  }

  vec3 diskCol = mix(warmColor, hotColor, clamp((doppler - 0.5) * 0.85 + photonRing * 0.18, 0.0, 1.0));
  vec3 emission = diskCol * (diskIntensity * 2.1 + lensedHalo) + hotColor * photonRing + vec3(1.0, 0.78, 0.46) * farCoreGlow;

  // Premultiplied alpha: inside event horizon shadowMask=1 darkens background stars to pure black,
  // while outside shadow emission glows cleanly into the HDR buffer
  float edgeTaper = 1.0 - smoothstep(0.75, 1.0, r);
  float horizonClear = mix(1.0, smoothstep(0.165, 0.205, r), closeMix);
  emission *= edgeTaper * horizonClear;
  fragColor = vec4(emission, clamp(shadowMask, 0.0, 1.0));
}
`;

export const BLOOM_DOWNSAMPLE_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSourceTex;
uniform vec2 uTexelSize;
uniform int uMipLevel;
uniform float uThreshold;

float luminance(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

vec3 karisWeight(vec3 c) {
  return c / (1.0 + luminance(c));
}

void main() {
  vec2 ts = uTexelSize;

  // 13-tap CoD:AW / Jimenez downsample filter to eliminate bloom firefly shimmering
  vec3 a = texture(uSourceTex, vUv + vec2(-2.0,  2.0) * ts).rgb;
  vec3 b = texture(uSourceTex, vUv + vec2( 0.0,  2.0) * ts).rgb;
  vec3 c = texture(uSourceTex, vUv + vec2( 2.0,  2.0) * ts).rgb;
  vec3 d = texture(uSourceTex, vUv + vec2(-1.0,  1.0) * ts).rgb;
  vec3 e = texture(uSourceTex, vUv + vec2( 1.0,  1.0) * ts).rgb;
  vec3 f = texture(uSourceTex, vUv + vec2(-2.0,  0.0) * ts).rgb;
  vec3 g = texture(uSourceTex, vUv).rgb;
  vec3 h = texture(uSourceTex, vUv + vec2( 2.0,  0.0) * ts).rgb;
  vec3 i = texture(uSourceTex, vUv + vec2(-1.0, -1.0) * ts).rgb;
  vec3 j = texture(uSourceTex, vUv + vec2( 1.0, -1.0) * ts).rgb;
  vec3 k = texture(uSourceTex, vUv + vec2(-2.0, -2.0) * ts).rgb;
  vec3 l = texture(uSourceTex, vUv + vec2( 0.0, -2.0) * ts).rgb;
  vec3 m = texture(uSourceTex, vUv + vec2( 2.0, -2.0) * ts).rgb;

  vec3 downsample;
  if (uMipLevel == 0) {
    // Karis average across 5 sub-groups suppresses single-pixel star aliasing
    vec3 g0 = karisWeight((a + b + f + g) * 0.25) * 0.125;
    vec3 g1 = karisWeight((b + c + g + h) * 0.25) * 0.125;
    vec3 g2 = karisWeight((f + g + k + l) * 0.25) * 0.125;
    vec3 g3 = karisWeight((g + h + l + m) * 0.25) * 0.125;
    vec3 g4 = karisWeight((d + e + i + j) * 0.25) * 0.5;
    downsample = g0 + g1 + g2 + g3 + g4;

    // Soft HDR knee threshold on first bloom level
    float br = max(downsample.r, max(downsample.g, downsample.b));
    float knee = uThreshold * 0.65;
    float soft = clamp(br - uThreshold + knee, 0.0, 2.0 * knee);
    soft = (soft * soft) / (4.0 * max(knee, 1e-4));
    float contrib = max(soft, br - uThreshold) / max(br, 1e-4);
    downsample *= clamp(contrib, 0.0, 1.0);
  } else {
    downsample = g * 0.125;
    downsample += (a + c + k + m) * 0.03125;
    downsample += (b + f + h + l) * 0.0625;
    downsample += (d + e + i + j) * 0.125;
  }

  fragColor = vec4(max(downsample, vec3(0.0)), 1.0);
}
`;

export const BLOOM_UPSAMPLE_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSourceTex;
uniform vec2 uTexelSize;
uniform float uFilterRadius;
uniform float uSpreadWeight;

void main() {
  vec2 r = uTexelSize * uFilterRadius;

  // 9-tap tent filter [1,2,1; 2,4,2; 1,2,1] / 16
  vec3 s = vec3(0.0);
  s += texture(uSourceTex, vUv + vec2(-r.x,  r.y)).rgb * 1.0;
  s += texture(uSourceTex, vUv + vec2( 0.0,  r.y)).rgb * 2.0;
  s += texture(uSourceTex, vUv + vec2( r.x,  r.y)).rgb * 1.0;

  s += texture(uSourceTex, vUv + vec2(-r.x,  0.0)).rgb * 2.0;
  s += texture(uSourceTex, vUv).rgb * 4.0;
  s += texture(uSourceTex, vUv + vec2( r.x,  0.0)).rgb * 2.0;

  s += texture(uSourceTex, vUv + vec2(-r.x, -r.y)).rgb * 1.0;
  s += texture(uSourceTex, vUv + vec2( 0.0, -r.y)).rgb * 2.0;
  s += texture(uSourceTex, vUv + vec2( r.x, -r.y)).rgb * 1.0;

  fragColor = vec4((s / 16.0) * uSpreadWeight, 1.0);
}
`;

export const COMPOSITE_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSceneTex;
uniform sampler2D uBloomTex;
uniform float uExposure;
uniform float uBloomIntensity;

vec3 acesFilmic(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

float ditherHash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec3 scene = texture(uSceneTex, vUv).rgb;
  vec3 bloom = texture(uBloomTex, vUv).rgb;

  vec3 hdr = scene + bloom * (uBloomIntensity * 0.36);
  hdr *= uExposure;

  // ACES Filmic tone mapping
  vec3 mapped = acesFilmic(hdr);

  // Subtle observatory edge vignette
  vec2 centered = vUv * 2.0 - 1.0;
  float vig = 1.0 - dot(centered, centered) * 0.11;
  mapped *= clamp(vig, 0.72, 1.0);

  // Linear -> sRGB + 8-bit triangular dither to prevent dark cosmic gradient banding
  vec3 srgb = pow(max(mapped, vec3(0.0)), vec3(1.0 / 2.2));
  float dither = (ditherHash(gl_FragCoord.xy) - 0.5) / 255.0;
  fragColor = vec4(clamp(srgb + dither, 0.0, 1.0), 1.0);
}
`;
