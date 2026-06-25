import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;
let mutex: Promise<void> = Promise.resolve();

export type FFmpegProgress = { progress: number; time: number };

export async function getFFmpeg(
  onStatus?: (msg: string) => void
): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      onStatus?.('Loading ffmpeg engine...');
      const ffmpeg = new FFmpeg();
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.9/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      });
      ffmpegInstance = ffmpeg;
      onStatus?.('Engine ready');
      return ffmpeg;
    } catch (err) {
      loadingPromise = null;
      throw err;
    }
  })();

  return loadingPromise;
}

export function readFileAsUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function runFFmpeg(
  files: { name: string; data: Uint8Array }[],
  args: string[],
  outputName: string,
  onProgress?: (p: FFmpegProgress) => void
): Promise<Blob> {
  const prev = mutex;
  let release: () => void;
  mutex = new Promise<void>(r => { release = r; });
  await prev;

  try {
    const ffmpeg = await getFFmpeg();

    let removeHandler: (() => void) | undefined;
    if (onProgress) {
      const handler = (e: FFmpegProgress) => onProgress(e);
      ffmpeg.on('progress', handler);
      removeHandler = () => { ffmpeg.off('progress', handler); };
    }

    try {
      for (const f of files) {
        await ffmpeg.writeFile(f.name, f.data);
      }
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputName);
      for (const f of files) {
        try { await ffmpeg.deleteFile(f.name); } catch { /* ignore cleanup error */ }
      }
      try { await ffmpeg.deleteFile(outputName); } catch { /* ignore cleanup error */ }
      return new Blob([data as unknown as BlobPart], { type: getMimeType(outputName) });
    } finally {
      removeHandler?.();
    }
  } finally {
    release!();
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    mp4: 'video/mp4', webm: 'video/webm', avi: 'video/x-msvideo',
    mov: 'video/quicktime', gif: 'image/gif', mp3: 'audio/mpeg',
    wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
    srt: 'text/plain', png: 'image/png',
  };
  return map[ext || ''] || 'application/octet-stream';
}
