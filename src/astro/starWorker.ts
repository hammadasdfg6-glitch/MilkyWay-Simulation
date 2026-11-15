import { generateStarChunk } from './galaxyModel';

export interface StarWorkerRequest {
  chunkIndex: number;
  starCount: number;
}

export interface StarWorkerResponse {
  chunkIndex: number;
  starCount: number;
  buffer: ArrayBuffer;
}

export interface StarWorkerErrorResponse {
  chunkIndex: number;
  error: string;
}

const workerScope = self as unknown as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<StarWorkerRequest>): void => {
  const { chunkIndex, starCount } = event.data;
  try {
    const chunk = generateStarChunk(chunkIndex, starCount);
    const response: StarWorkerResponse = {
      chunkIndex: chunk.chunkIndex,
      starCount: chunk.starCount,
      buffer: chunk.buffer.buffer as ArrayBuffer,
    };
    workerScope.postMessage(response, [response.buffer]);
  } catch (err) {
    const errorResponse: StarWorkerErrorResponse = {
      chunkIndex,
      error: err instanceof Error ? err.message : String(err),
    };
    workerScope.postMessage(errorResponse);
  }
};
