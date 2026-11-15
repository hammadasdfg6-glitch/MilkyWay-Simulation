/**
 * WebGL2 context initialization, capability probing, shader compilation,
 * and HDR framebuffer management.
 */

export interface GlContextInfo {
  gl: WebGL2RenderingContext;
  isFloatHdr: boolean;
  hdrInternalFormat: number;
  hdrType: number;
  maxPointSize: number;
  backendName: string;
}

export interface RenderTarget {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
  internalFormat: number;
  type: number;
  filter: number;
}

function probeFloatFboSupport(gl: WebGL2RenderingContext): boolean {
  const extFloat = gl.getExtension('EXT_color_buffer_float');
  const extHalfFloat = gl.getExtension('EXT_color_buffer_half_float');
  if (!extFloat && !extHalfFloat) {
    return false;
  }

  // Verify actual framebuffer completeness on this GPU/driver before committing to RGBA16F.
  const tex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!tex || !fbo) {
    if (tex) gl.deleteTexture(tex);
    if (fbo) gl.deleteFramebuffer(fbo);
    return false;
  }

  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 4, 4, 0, gl.RGBA, gl.HALF_FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.deleteFramebuffer(fbo);
  gl.deleteTexture(tex);

  return status === gl.FRAMEBUFFER_COMPLETE;
}

export function createGlContext(canvas: HTMLCanvasElement): GlContextInfo {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });

  if (!gl) {
    throw new Error(
      'WebGL2 is unavailable on this browser or graphics driver. Please enable hardware acceleration or use a WebGL2-capable browser.'
    );
  }

  // Enable linear float filtering if available (RGBA16F is natively filterable in WebGL2).
  gl.getExtension('OES_texture_float_linear');

  const isFloatHdr = probeFloatFboSupport(gl);
  const hdrInternalFormat = isFloatHdr ? gl.RGBA16F : gl.RGBA8;
  const hdrType = isFloatHdr ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;

  const pointRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array | number[] | null;
  const maxPointSize = pointRange && pointRange.length >= 2 ? Math.max(1.0, Number(pointRange[1])) : 64.0;

  return {
    gl,
    isFloatHdr,
    hdrInternalFormat,
    hdrType,
    maxPointSize,
    backendName: isFloatHdr ? 'WebGL2 · RGBA16F HDR' : 'WebGL2 · RGBA8 SDR',
  };
}

export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
  label = 'shader'
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error(`Failed to allocate WebGLShader for ${label}`);
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? 'Unknown compile error';
    gl.deleteShader(shader);
    throw new Error(`WebGL2 shader compile error (${label}): ${info}`);
  }
  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
  label = 'program'
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource, `${label}:vert`);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource, `${label}:frag`);

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    throw new Error(`Failed to allocate WebGLProgram for ${label}`);
  }

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? 'Unknown link error';
    gl.deleteProgram(program);
    throw new Error(`WebGL2 program link error (${label}): ${info}`);
  }
  return program;
}

export function createRenderTarget(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  internalFormat: number,
  type: number,
  filter: number = gl.LINEAR
): RenderTarget {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));

  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) {
    if (texture) gl.deleteTexture(texture);
    if (framebuffer) gl.deleteFramebuffer(framebuffer);
    throw new Error('Failed to create WebGL2 framebuffer render target');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, type, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);

  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    gl.deleteFramebuffer(framebuffer);
    gl.deleteTexture(texture);
    throw new Error(`Render target framebuffer incomplete (status=0x${status.toString(16)})`);
  }

  return {
    framebuffer,
    texture,
    width: w,
    height: h,
    internalFormat,
    type,
    filter,
  };
}

export function resizeRenderTarget(
  gl: WebGL2RenderingContext,
  target: RenderTarget,
  width: number,
  height: number
): void {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  if (target.width === w && target.height === h) {
    return;
  }

  gl.bindTexture(gl.TEXTURE_2D, target.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, target.internalFormat, w, h, 0, gl.RGBA, target.type, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  target.width = w;
  target.height = h;
}

export function destroyRenderTarget(gl: WebGL2RenderingContext, target: RenderTarget): void {
  gl.deleteFramebuffer(target.framebuffer);
  gl.deleteTexture(target.texture);
}
