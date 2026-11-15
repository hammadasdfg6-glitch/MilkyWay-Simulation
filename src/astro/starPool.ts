import type { NebulaCloudBuffer, StarChunkData, StarCountTier } from '../types';
import { generateNebulaClouds, generateStarChunk } from './galaxyModel';
import type { StarWorkerErrorResponse, StarWorkerRequest, StarWorkerResponse } from './starWorker';

export const CHUNK_SIZE = 500_000;

export type ChunkCallback = (chunk: StarChunkData) => void;
export type ProgressCallback = (loadedStars: number, targetStars: number) => void;

interface WorkerSlot {
  worker: Worker;
  busy: boolean;
  currentChunkIndex: number | null;
}

/**
 * Manages a pool of module Web Workers to stream deterministic 500K-star galactic chunks
 * off the main thread with zero-copy ArrayBuffer transfers.
 */
export class StarPool {
  private readonly workers: WorkerSlot[] = [];
  private readonly cachedChunks = new Map<number, StarChunkData>();
  private readonly inFlightChunks = new Set<number>();
  private readonly queue: number[] = [];

  private nebulaCache: NebulaCloudBuffer | null = null;
  private targetCount: number = 0;
  private onChunk: ChunkCallback | null = null;
  private onProgress: ProgressCallback | null = null;
  private disposed = false;
  private initialized = false;

  private ensureWorkers(): void {
    if (this.initialized || this.disposed) return;
    this.initialized = true;

    if (typeof Worker === 'undefined') {
      return;
    }

    const hw = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
    const poolSize = Math.max(1, Math.min(hw, 6));

    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(new URL('./starWorker.ts', import.meta.url), { type: 'module' });
      const slot: WorkerSlot = {
        worker,
        busy: false,
        currentChunkIndex: null,
      };

      worker.onmessage = (event: MessageEvent<StarWorkerResponse | StarWorkerErrorResponse>) => {
        if (this.disposed) return;
        const data = event.data;

        slot.busy = false;
        const finishedIndex = slot.currentChunkIndex;
        slot.currentChunkIndex = null;
        if (finishedIndex !== null) {
          this.inFlightChunks.delete(finishedIndex);
        }

        if ('error' in data) {
          console.error(`[StarPool] Worker error generating chunk ${data.chunkIndex}: ${data.error}`);
          this.dispatchNext();
          return;
        }

        const chunk: StarChunkData = {
          chunkIndex: data.chunkIndex,
          starCount: data.starCount,
          buffer: new Float32Array(data.buffer),
        };

        this.cachedChunks.set(chunk.chunkIndex, chunk);
        this.onChunk?.(chunk);
        this.emitProgress();
        this.dispatchNext();
      };

      worker.onerror = (err) => {
        if (this.disposed) return;
        console.error('[StarPool] Worker runtime error:', err.message);
        const failedIndex = slot.currentChunkIndex;
        slot.busy = false;
        slot.currentChunkIndex = null;
        if (failedIndex !== null) {
          this.inFlightChunks.delete(failedIndex);
          // Fallback synchronously for this chunk so generation never stalls
          const starCount = this.getChunkStarCount(failedIndex);
          if (starCount > 0 && !this.cachedChunks.has(failedIndex)) {
            const chunk = generateStarChunk(failedIndex, starCount);
            this.cachedChunks.set(chunk.chunkIndex, chunk);
            this.onChunk?.(chunk);
            this.emitProgress();
          }
        }
        this.dispatchNext();
      };

      this.workers.push(slot);
    }
  }

  /**
   * Begins generating star chunks up to `targetCount`, emitting cached or newly computed
   * chunks via `onChunk` and progress updates via `onProgress`.
   */
  startGeneration(
    targetCount: StarCountTier | number,
    onChunk: ChunkCallback,
    onProgress?: ProgressCallback
  ): void {
    if (this.disposed) return;
    this.onChunk = onChunk;
    this.onProgress = onProgress ?? null;
    this.ensureWorkers();

    this.targetCount = Math.max(0, targetCount);
    const neededChunks = Math.ceil(this.targetCount / CHUNK_SIZE);

    // Emit any already-cached chunks first
    for (let i = 0; i < neededChunks; i++) {
      const cached = this.cachedChunks.get(i);
      if (cached) {
        this.onChunk(cached);
      }
    }

    this.enqueueMissingChunks(neededChunks);
    this.emitProgress();
    this.dispatchNext();
  }

  /**
   * Adjusts the active star count tier smoothly: streams any additional chunks needed
   * or prunes unstarted chunks from the queue while keeping already generated chunks cached.
   */
  ensureStars(targetCount: StarCountTier | number): void {
    if (this.disposed) return;
    this.targetCount = Math.max(0, targetCount);
    const neededChunks = Math.ceil(this.targetCount / CHUNK_SIZE);

    // Prune queued chunks beyond the newly requested tier
    for (let i = this.queue.length - 1; i >= 0; i--) {
      if (this.queue[i] >= neededChunks) {
        this.queue.splice(i, 1);
      }
    }

    this.enqueueMissingChunks(neededChunks);
    this.emitProgress();
    this.dispatchNext();
  }

  /**
   * Returns the procedural volumetric nebula & dust scattering cloud buffer (cached).
   */
  getNebulaCloudBuffer(count = 16000): NebulaCloudBuffer {
    if (!this.nebulaCache || this.nebulaCache.count !== count) {
      this.nebulaCache = generateNebulaClouds(count);
    }
    return this.nebulaCache;
  }

  /**
   * Returns how many stars within `[0, targetCount)` have been generated so far.
   */
  getLoadedStarCount(): number {
    const neededChunks = Math.ceil(this.targetCount / CHUNK_SIZE);
    let loaded = 0;
    for (let i = 0; i < neededChunks; i++) {
      const chunk = this.cachedChunks.get(i);
      if (chunk) {
        loaded += chunk.starCount;
      }
    }
    return Math.min(loaded, this.targetCount);
  }

  /**
   * Terminates all worker threads and releases cached buffers.
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.queue.length = 0;
    this.inFlightChunks.clear();
    this.cachedChunks.clear();
    this.nebulaCache = null;
    this.onChunk = null;
    this.onProgress = null;

    for (const slot of this.workers) {
      slot.worker.terminate();
    }
    this.workers.length = 0;
  }

  private getChunkStarCount(chunkIndex: number): number {
    const offset = chunkIndex * CHUNK_SIZE;
    return Math.max(0, Math.min(CHUNK_SIZE, this.targetCount - offset));
  }

  private enqueueMissingChunks(neededChunks: number): void {
    for (let i = 0; i < neededChunks; i++) {
      if (
        !this.cachedChunks.has(i) &&
        !this.inFlightChunks.has(i) &&
        !this.queue.includes(i)
      ) {
        this.queue.push(i);
      }
    }
  }

  private emitProgress(): void {
    this.onProgress?.(this.getLoadedStarCount(), this.targetCount);
  }

  private dispatchNext(): void {
    if (this.disposed || this.queue.length === 0) return;

    // Synchronous fallback when Web Workers are unavailable (e.g., SSR/Node test environment)
    if (this.workers.length === 0) {
      const chunkIndex = this.queue.shift();
      if (chunkIndex === undefined) return;
      const starCount = this.getChunkStarCount(chunkIndex);
      if (starCount > 0) {
        const chunk = generateStarChunk(chunkIndex, starCount);
        this.cachedChunks.set(chunk.chunkIndex, chunk);
        this.onChunk?.(chunk);
        this.emitProgress();
      }
      if (this.queue.length > 0) {
        queueMicrotask(() => this.dispatchNext());
      }
      return;
    }

    for (const slot of this.workers) {
      if (this.queue.length === 0) break;
      if (slot.busy) continue;

      const chunkIndex = this.queue.shift()!;
      const starCount = this.getChunkStarCount(chunkIndex);
      if (starCount <= 0) continue;

      slot.busy = true;
      slot.currentChunkIndex = chunkIndex;
      this.inFlightChunks.add(chunkIndex);

      const req: StarWorkerRequest = { chunkIndex, starCount };
      slot.worker.postMessage(req);
    }
  }
}
