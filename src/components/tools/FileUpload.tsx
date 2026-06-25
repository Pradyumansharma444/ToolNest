import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onFilesSelected: (files: File[]) => void;
  onFileRemoved?: () => void;
  selectedFile?: File | null;
  multiple?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export function FileUpload({
  accept = {},
  maxFiles = 1,
  maxSize = 100 * 1024 * 1024, // 100MB
  onFilesSelected,
  onFileRemoved,
  selectedFile,
  multiple = false,
  label = 'Upload File',
  description = 'Drag & drop or click to browse',
  className,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const firstReject = (rejectedFiles as any[])[0];
        if (firstReject?.errors?.[0]?.code === 'file-too-large') {
          setError(`File too large. Max size: ${formatBytes(maxSize)}`);
        } else {
          setError('Invalid file type or size.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFilesSelected(multiple ? acceptedFiles : [acceptedFiles[0]]);
      }
    },
    [onFilesSelected, multiple, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
  });

  const removeFile = () => {
    onFileRemoved?.();
    setError(null);
  };

  if (selectedFile) {
    return (
      <div className={cn('rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50',
          error && 'border-destructive bg-destructive/5'
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn(
          'w-10 h-10 mx-auto mb-3 transition-colors',
          isDragActive ? 'text-primary' : 'text-muted-foreground'
        )} />
        <p className="font-medium text-sm mb-1">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        {maxSize < 100 * 1024 * 1024 && (
          <p className="text-xs text-muted-foreground mt-1">Max size: {formatBytes(maxSize)}</p>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
