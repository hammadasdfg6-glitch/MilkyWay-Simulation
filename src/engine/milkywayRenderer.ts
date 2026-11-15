import type {
  Landmark,
  NebulaCloudBuffer,
  ProjectedLandmark,
  SimulationSettings,
  StarChunkData,
  WavelengthMode,
} from '../types';
import { getLandmarkPositionAtTime } from '../data/landmarks';
import { projectPoint } from '../math/mat4';
import type { GalaxyCamera } from './camera';
import {
  createGlContext,
  createProgram,
  createRenderTarget,
  destroyRenderTarget,
  resizeRenderTarget,
  type GlContextInfo,
  type RenderTarget,
} from './glContext';
import {
  BLOOM_DOWNSAMPLE_FRAG,
  BLOOM_UPSAMPLE_FRAG,
  COMPOSITE_FRAG,
  DUST_MAP_FRAG,
  FULLSCREEN_VERT,
  NEBULA_FRAG,
  NEBULA_VERT,
  SGRA_FRAG,
  SGRA_VERT,
  SKY_FRAG,
  SKY_VERT,
  STAR_FRAG,
  STAR_VERT,
} from './shaders';

const DUST_MAP_SIZE = 1024;
const BLOOM_MIP_COUNT = 5;
const MAX_CHUNKS = 10;
const BYTES_PER_FLOAT = 4;
const FLOATS_PER_VERTEX = 8;
const VERTEX_STRIDE_BYTES = FLOATS_PER_VERTEX * BYTES_PER_FLOAT;

interface GpuStarChunk {
  chunkIndex: number;
  starCount: number;
  vao: WebGLVertexArrayObject;
  vbo: WebGLBuffer;
}

function wavelengthToIndex(mode: WavelengthMode): number {
  switch (mode) {
    case 'optical':
      return 0;
    case 'infrared':
      return 1;
    case 'ultraviolet':
      return 2;
    case 'population':
      return 3;
  }
}

export class MilkyWayRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly glInfo: GlContextInfo;
  private readonly gl: WebGL2RenderingContext;

  private readonly fullscreenVao: WebGLVertexArrayObject;
  private readonly starChunks = new Map<number, GpuStarChunk>();

  private nebulaVao: WebGLVertexArrayObject | null = null;
  private nebulaVbo: WebGLBuffer | null = null;
  private nebulaCount = 0;

  private dustMapTex: WebGLTexture;

  private sceneTarget: RenderTarget;
  private bloomTargets: RenderTarget[] = [];

  private widthPx = 1;
  private heightPx = 1;
  private dpr = 1;
  private totalLoadedStars = 0;
  private lastDrawnStars = 0;
  private disposed = false;

  // Programs & cached uniform locations
  private readonly dustProgram: WebGLProgram;
  private readonly skyProgram: WebGLProgram;
  private readonly nebulaProgram: WebGLProgram;
  private readonly starProgram: WebGLProgram;
  private readonly sgrAProgram: WebGLProgram;
  private readonly bloomDownProgram: WebGLProgram;
  private readonly bloomUpProgram: WebGLProgram;
  private readonly compositeProgram: WebGLProgram;

  private readonly skyUniforms: {
    uInvViewProj: WebGLUniformLocation | null;
    uWavelength: WebGLUniformLocation | null;
  };

  private readonly nebulaUniforms: {
    uViewProj: WebGLUniformLocation | null;
    uCameraPos: WebGLUniformLocation | null;
    uCameraRight: WebGLUniformLocation | null;
    uCameraUp: WebGLUniformLocation | null;
    uTimeMyr: WebGLUniformLocation | null;
    uCameraDist: WebGLUniformLocation | null;
    uDustOpacity: WebGLUniformLocation | null;
    uNebulaIntensity: WebGLUniformLocation | null;
    uWavelength: WebGLUniformLocation | null;
    uDustMap: WebGLUniformLocation | null;
  };

  private readonly starUniforms: {
    uViewProj: WebGLUniformLocation | null;
    uCameraPos: WebGLUniformLocation | null;
    uTimeMyr: WebGLUniformLocation | null;
    uDpr: WebGLUniformLocation | null;
    uFocalLengthPx: WebGLUniformLocation | null;
    uCameraDist: WebGLUniformLocation | null;
    uMaxPointSize: WebGLUniformLocation | null;
    uDustOpacity: WebGLUniformLocation | null;
    uStarNorm: WebGLUniformLocation | null;
    uWavelength: WebGLUniformLocation | null;
    uDustMap: WebGLUniformLocation | null;
  };

  private readonly sgrAUniforms: {
    uViewProj: WebGLUniformLocation | null;
    uCameraPos: WebGLUniformLocation | null;
    uCameraRight: WebGLUniformLocation | null;
    uCameraUp: WebGLUniformLocation | null;
    uRealTimeSec: WebGLUniformLocation | null;
    uWavelength: WebGLUniformLocation | null;
  };

  private readonly bloomDownUniforms: {
    uSourceTex: WebGLUniformLocation | null;
    uTexelSize: WebGLUniformLocation | null;
    uMipLevel: WebGLUniformLocation | null;
    uThreshold: WebGLUniformLocation | null;
  };

  private readonly bloomUpUniforms: {
    uSourceTex: WebGLUniformLocation | null;
    uTexelSize: WebGLUniformLocation | null;
    uFilterRadius: WebGLUniformLocation | null;
    uSpreadWeight: WebGLUniformLocation | null;
  };

  private readonly compositeUniforms: {
    uSceneTex: WebGLUniformLocation | null;
    uBloomTex: WebGLUniformLocation | null;
    uExposure: WebGLUniformLocation | null;
    uBloomIntensity: WebGLUniformLocation | null;
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.glInfo = createGlContext(canvas);
    this.gl = this.glInfo.gl;
    const gl = this.gl;

    const vao = gl.createVertexArray();
    if (!vao) {
      throw new Error('Failed to create fullscreen VAO');
    }
    this.fullscreenVao = vao;

    this.dustProgram = createProgram(gl, FULLSCREEN_VERT, DUST_MAP_FRAG, 'dust-map');
    this.skyProgram = createProgram(gl, SKY_VERT, SKY_FRAG, 'sky');
    this.nebulaProgram = createProgram(gl, NEBULA_VERT, NEBULA_FRAG, 'nebula');
    this.starProgram = createProgram(gl, STAR_VERT, STAR_FRAG, 'star');
    this.sgrAProgram = createProgram(gl, SGRA_VERT, SGRA_FRAG, 'sgra');
    this.bloomDownProgram = createProgram(gl, FULLSCREEN_VERT, BLOOM_DOWNSAMPLE_FRAG, 'bloom-down');
    this.bloomUpProgram = createProgram(gl, FULLSCREEN_VERT, BLOOM_UPSAMPLE_FRAG, 'bloom-up');
    this.compositeProgram = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG, 'composite');

    this.skyUniforms = {
      uInvViewProj: gl.getUniformLocation(this.skyProgram, 'uInvViewProj'),
      uWavelength: gl.getUniformLocation(this.skyProgram, 'uWavelength'),
    };

    this.nebulaUniforms = {
      uViewProj: gl.getUniformLocation(this.nebulaProgram, 'uViewProj'),
      uCameraPos: gl.getUniformLocation(this.nebulaProgram, 'uCameraPos'),
      uCameraRight: gl.getUniformLocation(this.nebulaProgram, 'uCameraRight'),
      uCameraUp: gl.getUniformLocation(this.nebulaProgram, 'uCameraUp'),
      uTimeMyr: gl.getUniformLocation(this.nebulaProgram, 'uTimeMyr'),
      uCameraDist: gl.getUniformLocation(this.nebulaProgram, 'uCameraDist'),
      uDustOpacity: gl.getUniformLocation(this.nebulaProgram, 'uDustOpacity'),
      uNebulaIntensity: gl.getUniformLocation(this.nebulaProgram, 'uNebulaIntensity'),
      uWavelength: gl.getUniformLocation(this.nebulaProgram, 'uWavelength'),
      uDustMap: gl.getUniformLocation(this.nebulaProgram, 'uDustMap'),
    };

    this.starUniforms = {
      uViewProj: gl.getUniformLocation(this.starProgram, 'uViewProj'),
      uCameraPos: gl.getUniformLocation(this.starProgram, 'uCameraPos'),
      uTimeMyr: gl.getUniformLocation(this.starProgram, 'uTimeMyr'),
      uDpr: gl.getUniformLocation(this.starProgram, 'uDpr'),
      uFocalLengthPx: gl.getUniformLocation(this.starProgram, 'uFocalLengthPx'),
      uCameraDist: gl.getUniformLocation(this.starProgram, 'uCameraDist'),
      uMaxPointSize: gl.getUniformLocation(this.starProgram, 'uMaxPointSize'),
      uDustOpacity: gl.getUniformLocation(this.starProgram, 'uDustOpacity'),
      uStarNorm: gl.getUniformLocation(this.starProgram, 'uStarNorm'),
      uWavelength: gl.getUniformLocation(this.starProgram, 'uWavelength'),
      uDustMap: gl.getUniformLocation(this.starProgram, 'uDustMap'),
    };

    this.sgrAUniforms = {
      uViewProj: gl.getUniformLocation(this.sgrAProgram, 'uViewProj'),
      uCameraPos: gl.getUniformLocation(this.sgrAProgram, 'uCameraPos'),
      uCameraRight: gl.getUniformLocation(this.sgrAProgram, 'uCameraRight'),
      uCameraUp: gl.getUniformLocation(this.sgrAProgram, 'uCameraUp'),
      uRealTimeSec: gl.getUniformLocation(this.sgrAProgram, 'uRealTimeSec'),
      uWavelength: gl.getUniformLocation(this.sgrAProgram, 'uWavelength'),
    };

    this.bloomDownUniforms = {
      uSourceTex: gl.getUniformLocation(this.bloomDownProgram, 'uSourceTex'),
      uTexelSize: gl.getUniformLocation(this.bloomDownProgram, 'uTexelSize'),
      uMipLevel: gl.getUniformLocation(this.bloomDownProgram, 'uMipLevel'),
      uThreshold: gl.getUniformLocation(this.bloomDownProgram, 'uThreshold'),
    };

    this.bloomUpUniforms = {
      uSourceTex: gl.getUniformLocation(this.bloomUpProgram, 'uSourceTex'),
      uTexelSize: gl.getUniformLocation(this.bloomUpProgram, 'uTexelSize'),
      uFilterRadius: gl.getUniformLocation(this.bloomUpProgram, 'uFilterRadius'),
      uSpreadWeight: gl.getUniformLocation(this.bloomUpProgram, 'uSpreadWeight'),
    };

    this.compositeUniforms = {
      uSceneTex: gl.getUniformLocation(this.compositeProgram, 'uSceneTex'),
      uBloomTex: gl.getUniformLocation(this.compositeProgram, 'uBloomTex'),
      uExposure: gl.getUniformLocation(this.compositeProgram, 'uExposure'),
      uBloomIntensity: gl.getUniformLocation(this.compositeProgram, 'uBloomIntensity'),
    };

    // Bake 1024x1024 procedural galactic spiral dust & H-II map once on the GPU
    this.dustMapTex = this.generateDustMapTexture();

    // Initialize HDR scene & bloom mip-chain render targets
    const initW = Math.max(1, canvas.clientWidth || canvas.width || 1280);
    const initH = Math.max(1, canvas.clientHeight || canvas.height || 720);
    const initDpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    this.dpr = initDpr;
    this.widthPx = Math.max(1, Math.round(initW * initDpr));
    this.heightPx = Math.max(1, Math.round(initH * initDpr));
    canvas.width = this.widthPx;
    canvas.height = this.heightPx;

    this.sceneTarget = createRenderTarget(
      gl,
      this.widthPx,
      this.heightPx,
      this.glInfo.hdrInternalFormat,
      this.glInfo.hdrType,
      gl.LINEAR
    );

    this.bloomTargets = this.createBloomMipChain(this.widthPx, this.heightPx);
  }

  getBackendName(): string {
    return this.glInfo.backendName;
  }

  getLoadedStarCount(): number {
    return this.totalLoadedStars;
  }

  getActiveDrawnStars(): number {
    return this.lastDrawnStars;
  }

  resize(widthCss?: number, heightCss?: number, dpr?: number): { width: number; height: number; dpr: number } {
    if (this.disposed) {
      return { width: this.widthPx, height: this.heightPx, dpr: this.dpr };
    }
    const cssW = Math.max(1, widthCss ?? (this.canvas.clientWidth || 1));
    const cssH = Math.max(1, heightCss ?? (this.canvas.clientHeight || 1));
    const nextDpr = Math.min(2, Math.max(1, dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)));

    const maxDims = this.gl.getParameter(this.gl.MAX_VIEWPORT_DIMS) as Int32Array | number[] | null;
    const maxW = maxDims ? Number(maxDims[0]) : 8192;
    const maxH = maxDims ? Number(maxDims[1]) : 8192;

    const nextW = Math.min(maxW, Math.max(1, Math.round(cssW * nextDpr)));
    const nextH = Math.min(maxH, Math.max(1, Math.round(cssH * nextDpr)));

    this.dpr = nextDpr;
    if (nextW === this.widthPx && nextH === this.heightPx) {
      return { width: this.widthPx, height: this.heightPx, dpr: this.dpr };
    }

    this.widthPx = nextW;
    this.heightPx = nextH;
    this.canvas.width = nextW;
    this.canvas.height = nextH;

    resizeRenderTarget(this.gl, this.sceneTarget, nextW, nextH);
    for (let i = 0; i < BLOOM_MIP_COUNT; i++) {
      const mw = Math.max(1, nextW >> (i + 1));
      const mh = Math.max(1, nextH >> (i + 1));
      resizeRenderTarget(this.gl, this.bloomTargets[i], mw, mh);
    }

    return { width: this.widthPx, height: this.heightPx, dpr: this.dpr };
  }

  uploadStarChunk(chunk: StarChunkData): void {
    if (this.disposed) return;
    const gl = this.gl;

    const existing = this.starChunks.get(chunk.chunkIndex);
    if (existing) {
      gl.bindBuffer(gl.ARRAY_BUFFER, existing.vbo);
      gl.bufferData(gl.ARRAY_BUFFER, chunk.buffer, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      this.totalLoadedStars += chunk.starCount - existing.starCount;
      existing.starCount = chunk.starCount;
      return;
    }

    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    if (!vao || !vbo) {
      if (vao) gl.deleteVertexArray(vao);
      if (vbo) gl.deleteBuffer(vbo);
      throw new Error(`Failed to allocate GPU buffers for star chunk ${chunk.chunkIndex}`);
    }

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, chunk.buffer, gl.STATIC_DRAW);

    // location 0: vec4 aPosOmega (x0, y0, z0, omega)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, VERTEX_STRIDE_BYTES, 0);

    // location 1: vec4 aStarProps (tempK, luminosity, size, population)
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, VERTEX_STRIDE_BYTES, 4 * BYTES_PER_FLOAT);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.starChunks.set(chunk.chunkIndex, {
      chunkIndex: chunk.chunkIndex,
      starCount: chunk.starCount,
      vao,
      vbo,
    });
    this.totalLoadedStars += chunk.starCount;
  }

  uploadNebulaClouds(nebulae: NebulaCloudBuffer): void {
    if (this.disposed) return;
    const gl = this.gl;

    if (!this.nebulaVao || !this.nebulaVbo) {
      const vao = gl.createVertexArray();
      const vbo = gl.createBuffer();
      if (!vao || !vbo) {
        if (vao) gl.deleteVertexArray(vao);
        if (vbo) gl.deleteBuffer(vbo);
        throw new Error('Failed to allocate GPU buffers for nebula clouds');
      }
      this.nebulaVao = vao;
      this.nebulaVbo = vbo;
    }

    gl.bindVertexArray(this.nebulaVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nebulaVbo);
    gl.bufferData(gl.ARRAY_BUFFER, nebulae.buffer, gl.STATIC_DRAW);

    // Instanced per-cloud attributes (divisor = 1)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, VERTEX_STRIDE_BYTES, 0);
    gl.vertexAttribDivisor(0, 1);

    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, VERTEX_STRIDE_BYTES, 4 * BYTES_PER_FLOAT);
    gl.vertexAttribDivisor(1, 1);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.nebulaCount = nebulae.count;
  }

  render(
    camera: GalaxyCamera,
    settings: SimulationSettings,
    simTimeMyr: number,
    realTimeSec = performance.now() * 0.001
  ): number {
    if (this.disposed) return 0;
    const gl = this.gl;

    // Auto-sync backing buffer if CSS canvas size changed externally
    const clientW = this.canvas.clientWidth;
    const clientH = this.canvas.clientHeight;
    if (clientW > 0 && clientH > 0) {
      const targetDpr = Math.min(2, Math.max(1, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1));
      const expectedW = Math.max(1, Math.round(clientW * targetDpr));
      const expectedH = Math.max(1, Math.round(clientH * targetDpr));
      if (expectedW !== this.widthPx || expectedH !== this.heightPx || targetDpr !== this.dpr) {
        this.resize(clientW, clientH, targetDpr);
      }
      camera.setViewport(clientW, clientH);
    }

    const w = this.widthPx;
    const h = this.heightPx;
    const wavelengthIdx = wavelengthToIndex(settings.wavelength);
    const viewProj = camera.getViewProjMatrix();
    const invViewProj = camera.getInvViewProjMatrix();
    const eyePos = camera.getEyePosition();
    const camRight = camera.getRightVector();
    const camUp = camera.getUpVector();
    const camDist = camera.getState().distanceKpc;
    const focalLengthPx = camera.getFocalLengthPx();

    // Count drawable stars up to active tier limit
    let remaining = settings.starCountTier;
    let drawableStars = 0;
    for (let i = 0; i < MAX_CHUNKS && remaining > 0; i++) {
      const chunk = this.starChunks.get(i);
      if (!chunk) continue;
      const take = Math.min(chunk.starCount, remaining);
      drawableStars += take;
      remaining -= take;
    }
    this.lastDrawnStars = drawableStars;

    // Keep integrated galaxy luminosity balanced across 500K..5M star tiers
    const effectiveNormStars = Math.max(drawableStars, Math.min(settings.starCountTier, 500_000));
    const starNorm = Math.min(2.1, Math.max(0.55, Math.pow(2_000_000 / effectiveNormStars, 0.42)));

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    // 1. Render scene into HDR framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneTarget.framebuffer);
    gl.viewport(0, 0, w, h);

    // Pass 1: Deep-space extragalactic sky backdrop
    gl.disable(gl.BLEND);
    gl.useProgram(this.skyProgram);
    gl.uniformMatrix4fv(this.skyUniforms.uInvViewProj, false, invViewProj);
    gl.uniform1i(this.skyUniforms.uWavelength, wavelengthIdx);
    gl.bindVertexArray(this.fullscreenVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Bind precomputed 1024x1024 galactic spiral dust map on texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.dustMapTex);

    // Pass 2: Volumetric H-II / Reflection / Bulge haze billboards
    if (this.nebulaVao && this.nebulaCount > 0 && settings.nebulaIntensity > 0.001) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(this.nebulaProgram);
      gl.uniformMatrix4fv(this.nebulaUniforms.uViewProj, false, viewProj);
      gl.uniform3fv(this.nebulaUniforms.uCameraPos, eyePos);
      gl.uniform3fv(this.nebulaUniforms.uCameraRight, camRight);
      gl.uniform3fv(this.nebulaUniforms.uCameraUp, camUp);
      gl.uniform1f(this.nebulaUniforms.uTimeMyr, simTimeMyr);
      gl.uniform1f(this.nebulaUniforms.uCameraDist, camDist);
      gl.uniform1f(this.nebulaUniforms.uDustOpacity, settings.dustOpacity);
      gl.uniform1f(this.nebulaUniforms.uNebulaIntensity, settings.nebulaIntensity);
      gl.uniform1i(this.nebulaUniforms.uWavelength, wavelengthIdx);
      gl.uniform1i(this.nebulaUniforms.uDustMap, 0);

      gl.bindVertexArray(this.nebulaVao);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.nebulaCount);
    }

    // Pass 3: 500K-5M HDR Star Point Sprites with real-time dust extinction & reddening
    if (drawableStars > 0) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(this.starProgram);
      gl.uniformMatrix4fv(this.starUniforms.uViewProj, false, viewProj);
      gl.uniform3fv(this.starUniforms.uCameraPos, eyePos);
      gl.uniform1f(this.starUniforms.uTimeMyr, simTimeMyr);
      gl.uniform1f(this.starUniforms.uDpr, this.dpr);
      gl.uniform1f(this.starUniforms.uFocalLengthPx, focalLengthPx);
      gl.uniform1f(this.starUniforms.uCameraDist, camDist);
      gl.uniform1f(this.starUniforms.uMaxPointSize, Math.min(48.0 * this.dpr, this.glInfo.maxPointSize));
      gl.uniform1f(this.starUniforms.uDustOpacity, settings.dustOpacity);
      gl.uniform1f(this.starUniforms.uStarNorm, starNorm);
      gl.uniform1i(this.starUniforms.uWavelength, wavelengthIdx);
      gl.uniform1i(this.starUniforms.uDustMap, 0);

      let left = settings.starCountTier;
      for (let i = 0; i < MAX_CHUNKS && left > 0; i++) {
        const chunk = this.starChunks.get(i);
        if (!chunk) continue;
        const drawCount = Math.min(chunk.starCount, left);
        if (drawCount <= 0) continue;
        gl.bindVertexArray(chunk.vao);
        gl.drawArrays(gl.POINTS, 0, drawCount);
        left -= drawCount;
      }
    }

    // Pass 4: Sagittarius A* relativistic black hole shadow & accretion disk at [0, 0, 0]
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.sgrAProgram);
    gl.uniformMatrix4fv(this.sgrAUniforms.uViewProj, false, viewProj);
    gl.uniform3fv(this.sgrAUniforms.uCameraPos, eyePos);
    gl.uniform3fv(this.sgrAUniforms.uCameraRight, camRight);
    gl.uniform3fv(this.sgrAUniforms.uCameraUp, camUp);
    gl.uniform1f(this.sgrAUniforms.uRealTimeSec, realTimeSec);
    gl.uniform1i(this.sgrAUniforms.uWavelength, wavelengthIdx);
    gl.bindVertexArray(this.fullscreenVao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Pass 5: 5-level progressive HDR Kawase/tent bloom mip chain
    const useBloom = settings.bloomIntensity > 0.001;
    if (useBloom) {
      this.renderBloomChain();
    } else {
      // Clear level 0 if bloom is disabled so composite reads zero bloom cleanly
      const mip0 = this.bloomTargets[0];
      gl.bindFramebuffer(gl.FRAMEBUFFER, mip0.framebuffer);
      gl.viewport(0, 0, mip0.width, mip0.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    // Pass 6: Final ACES Filmic tone mapping & sRGB output to canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.disable(gl.BLEND);
    gl.useProgram(this.compositeProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTarget.texture);
    gl.uniform1i(this.compositeUniforms.uSceneTex, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomTargets[0].texture);
    gl.uniform1i(this.compositeUniforms.uBloomTex, 1);

    gl.uniform1f(this.compositeUniforms.uExposure, settings.exposure);
    gl.uniform1f(this.compositeUniforms.uBloomIntensity, settings.bloomIntensity);

    gl.bindVertexArray(this.fullscreenVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);

    return drawableStars;
  }

  projectLandmarks(
    landmarks: Landmark[],
    camera: GalaxyCamera,
    simTimeMyr: number,
    widthCss: number,
    heightCss: number
  ): ProjectedLandmark[] {
    const viewProj = camera.getViewProjMatrix();
    const eye = camera.getEyePosition();
    const result: ProjectedLandmark[] = new Array(landmarks.length);

    for (let i = 0; i < landmarks.length; i++) {
      const landmark = landmarks[i];
      const pos = getLandmarkPositionAtTime(landmark, simTimeMyr);
      const proj = projectPoint(pos, viewProj, widthCss, heightCss);
      const distanceKpc = Math.hypot(pos[0] - eye[0], pos[1] - eye[1], pos[2] - eye[2]);

      result[i] = {
        landmark,
        screenX: proj.x,
        screenY: proj.y,
        visible: proj.visible,
        distanceKpc,
      };
    }

    return result;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const gl = this.gl;

    for (const chunk of this.starChunks.values()) {
      gl.deleteVertexArray(chunk.vao);
      gl.deleteBuffer(chunk.vbo);
    }
    this.starChunks.clear();

    if (this.nebulaVao) gl.deleteVertexArray(this.nebulaVao);
    if (this.nebulaVbo) gl.deleteBuffer(this.nebulaVbo);
    this.nebulaVao = null;
    this.nebulaVbo = null;

    gl.deleteVertexArray(this.fullscreenVao);
    gl.deleteTexture(this.dustMapTex);

    destroyRenderTarget(gl, this.sceneTarget);
    for (const target of this.bloomTargets) {
      destroyRenderTarget(gl, target);
    }
    this.bloomTargets.length = 0;

    gl.deleteProgram(this.dustProgram);
    gl.deleteProgram(this.skyProgram);
    gl.deleteProgram(this.nebulaProgram);
    gl.deleteProgram(this.starProgram);
    gl.deleteProgram(this.sgrAProgram);
    gl.deleteProgram(this.bloomDownProgram);
    gl.deleteProgram(this.bloomUpProgram);
    gl.deleteProgram(this.compositeProgram);
  }

  private generateDustMapTexture(): WebGLTexture {
    const gl = this.gl;
    const target = createRenderTarget(
      gl,
      DUST_MAP_SIZE,
      DUST_MAP_SIZE,
      this.glInfo.hdrInternalFormat,
      this.glInfo.hdrType,
      gl.LINEAR
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, DUST_MAP_SIZE, DUST_MAP_SIZE);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.dustProgram);
    gl.bindVertexArray(this.fullscreenVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Keep only the texture and discard the one-shot FBO
    gl.deleteFramebuffer(target.framebuffer);

    // Drain any prior GL state before attempting mipmap generation for smooth dust LOD filtering
    while (gl.getError() !== gl.NO_ERROR) {
      // clear queue
    }
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.generateMipmap(gl.TEXTURE_2D);
    if (gl.getError() === gl.NO_ERROR) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);

    return target.texture;
  }

  private createBloomMipChain(baseW: number, baseH: number): RenderTarget[] {
    const gl = this.gl;
    const targets: RenderTarget[] = [];
    for (let i = 0; i < BLOOM_MIP_COUNT; i++) {
      const w = Math.max(1, baseW >> (i + 1));
      const h = Math.max(1, baseH >> (i + 1));
      targets.push(
        createRenderTarget(
          gl,
          w,
          h,
          this.glInfo.hdrInternalFormat,
          this.glInfo.hdrType,
          gl.LINEAR
        )
      );
    }
    return targets;
  }

  private renderBloomChain(): void {
    const gl = this.gl;
    gl.bindVertexArray(this.fullscreenVao);

    // Progressive 13-tap downsample
    gl.disable(gl.BLEND);
    gl.useProgram(this.bloomDownProgram);
    gl.uniform1f(this.bloomDownUniforms.uThreshold, 1.12);

    let srcTex = this.sceneTarget.texture;
    let srcW = this.sceneTarget.width;
    let srcH = this.sceneTarget.height;

    for (let i = 0; i < BLOOM_MIP_COUNT; i++) {
      const dst = this.bloomTargets[i];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.framebuffer);
      gl.viewport(0, 0, dst.width, dst.height);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, srcTex);
      gl.uniform1i(this.bloomDownUniforms.uSourceTex, 0);
      gl.uniform2f(this.bloomDownUniforms.uTexelSize, 1.0 / srcW, 1.0 / srcH);
      gl.uniform1i(this.bloomDownUniforms.uMipLevel, i);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      srcTex = dst.texture;
      srcW = dst.width;
      srcH = dst.height;
    }

    // Progressive additive 9-tap tent upsample back up to mip 0
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(this.bloomUpProgram);
    gl.uniform1f(this.bloomUpUniforms.uFilterRadius, 1.15);
    gl.uniform1f(this.bloomUpUniforms.uSpreadWeight, 0.84);

    for (let i = BLOOM_MIP_COUNT - 1; i > 0; i--) {
      const src = this.bloomTargets[i];
      const dst = this.bloomTargets[i - 1];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.framebuffer);
      gl.viewport(0, 0, dst.width, dst.height);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src.texture);
      gl.uniform1i(this.bloomUpUniforms.uSourceTex, 0);
      gl.uniform2f(this.bloomUpUniforms.uTexelSize, 1.0 / src.width, 1.0 / src.height);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }
}
