declare module 'browser-image-compression' {
  interface Options {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    initialQuality?: number;
  }
  export default function imageCompression(file: File, options: Options): Promise<File>;
}

declare module 'file-saver' {
  export function saveAs(data: Blob | string, filename?: string, options?: object): void;
}

// PDF.js render parameters fix
module 'pdfjs-dist' {
  interface PageViewport {
    width: number;
    height: number;
  }
  interface CanvasAndContext {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }
}
