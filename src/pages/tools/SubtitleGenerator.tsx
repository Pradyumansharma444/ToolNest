import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { downloadBlob } from '@/lib/utils';
import { Play, Square, Download, Trash2, AlertTriangle } from 'lucide-react';

interface SubtitleEntry {
  id: string;
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'it-IT', label: 'Italian' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'ko-KR', label: 'Korean' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
];

function generateId() { return Math.random().toString(36).substring(2, 9); }

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function formatTimeVtt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function parseTimeInput(input: string): number {
  const parts = input.split(':');
  if (parts.length === 3) {
    const [h, m, s] = parts.map(p => parseFloat(p.replace(',', '.')) || 0);
    return h * 3600 + m * 60 + s;
  }
  return 0;
}

const supportsSpeechRecognition = typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

export default function SubtitleGenerator() {
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const transcriptIntervalRef = useRef<number | null>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setSubtitles([]);
    setCurrentTime(0);
  };

  const startTranscription = useCallback(() => {
    if (!videoRef.current || !videoSrc) return;
    if (!supportsSpeechRecognition) return;

    setIsTranscribing(true);
    videoRef.current.play();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SpeechRecognitionAPI() as any;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    let currentText = '';
    let currentStart = videoRef.current.currentTime;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }

      if (transcript.trim()) {
        currentText += ' ' + transcript.trim();
        currentText = currentText.trim();

        if (isFinal && currentText.split(' ').length >= 3) {
          const endTime = videoRef.current?.currentTime || currentStart + 3;
          setSubtitles(prev => [...prev, {
            id: generateId(),
            index: prev.length + 1,
            startTime: currentStart,
            endTime: endTime,
            text: currentText,
          }]);
          currentText = '';
          currentStart = endTime;
        }
      }
    };

    recognition.onerror = () => {
      setIsTranscribing(false);
    };

    recognition.onend = () => {
      if (isTranscribing) {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    transcriptIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && currentText.split(' ').length >= 8) {
        const endTime = videoRef.current.currentTime;
        setSubtitles(prev => [...prev, {
          id: generateId(),
          index: prev.length + 1,
          startTime: currentStart,
          endTime,
          text: currentText,
        }]);
        currentText = '';
        currentStart = endTime;
      }
    }, 5000);
  }, [videoSrc, language, isTranscribing]);

  const stopTranscription = () => {
    setIsTranscribing(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (transcriptIntervalRef.current) {
      clearInterval(transcriptIntervalRef.current);
      transcriptIntervalRef.current = null;
    }
    if (videoRef.current) videoRef.current.pause();
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch { /* ignore */ }
      if (transcriptIntervalRef.current) clearInterval(transcriptIntervalRef.current);
    };
  }, []);

  const updateSubtitle = (id: string, field: keyof SubtitleEntry, value: string | number) => {
    setSubtitles(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSubtitle = (id: string) => {
    setSubtitles(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, index: i + 1 })));
  };

  const shiftAll = (seconds: number) => {
    setSubtitles(prev => prev.map(s => ({
      ...s,
      startTime: Math.max(0, s.startTime + seconds),
      endTime: Math.max(0, s.endTime + seconds),
    })));
  };

  const downloadSrt = () => {
    const sorted = [...subtitles].sort((a, b) => a.startTime - b.startTime);
    let content = '';
    for (const s of sorted) {
      content += `${s.index}\n`;
      content += `${formatTime(s.startTime)} --> ${formatTime(s.endTime)}\n`;
      content += `${s.text}\n\n`;
    }
    downloadBlob(new Blob([content], { type: 'text/plain;charset=utf-8' }), 'subtitles.srt');
  };

  const downloadVtt = () => {
    const sorted = [...subtitles].sort((a, b) => a.startTime - b.startTime);
    let content = 'WEBVTT\n\n';
    for (const s of sorted) {
      content += `${formatTimeVtt(s.startTime)} --> ${formatTimeVtt(s.endTime)}\n`;
      content += `${s.text}\n\n`;
    }
    downloadBlob(new Blob([content], { type: 'text/vtt;charset=utf-8' }), 'subtitles.vtt');
  };

  const currentSubtitle = showPreview
    ? subtitles.find(s => currentTime >= s.startTime && currentTime <= s.endTime)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Subtitle Generator</h1>

      {!supportsSpeechRecognition && (
        <div className="flex items-start gap-3 p-4 mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">Browser Compatibility Notice</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">Speech recognition is not available in your browser. Please use Chrome or Edge for the best experience with this tool.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Video Upload</CardTitle></CardHeader>
            <CardContent>
              <Input type="file" accept="video/*" onChange={handleVideoUpload} />
              {videoSrc && (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  controls
                  className="w-full mt-4 rounded-lg max-h-64"
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                >
                  Your browser does not support video playback.
                </video>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Transcription Controls</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                {!isTranscribing ? (
                  <Button onClick={startTranscription} disabled={!videoSrc || !supportsSpeechRecognition}>
                    <Play className="w-4 h-4 mr-1" />Start Transcription
                  </Button>
                ) : (
                  <Button onClick={stopTranscription} variant="destructive">
                    <Square className="w-4 h-4 mr-1" />Stop Transcription
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => shiftAll(-0.5)} disabled={!subtitles.length}>Shift All -0.5s</Button>
                <Button variant="outline" size="sm" onClick={() => shiftAll(0.5)} disabled={!subtitles.length}>Shift All +0.5s</Button>
              </div>

              {subtitles.length > 0 && (
                <div className="flex gap-2">
                  <Button onClick={downloadSrt} size="sm"><Download className="w-4 h-4 mr-1" />Download .SRT</Button>
                  <Button onClick={downloadVtt} size="sm"><Download className="w-4 h-4 mr-1" />Download .VTT</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Subtitle Entries ({subtitles.length})</span>
                <label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                  <input type="checkbox" checked={showPreview} onChange={e => setShowPreview(e.target.checked)} />
                  Preview on video
                </label>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto space-y-3">
              {subtitles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No subtitles yet. Upload a video and start transcription.
                </p>
              )}
              {[...subtitles].sort((a, b) => a.startTime - b.startTime).map((sub) => (
                <div key={sub.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">#{sub.index}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteSubtitle(sub.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Start</Label>
                      <Input
                        value={formatTime(sub.startTime)}
                        onChange={e => updateSubtitle(sub.id, 'startTime', parseTimeInput(e.target.value))}
                        className="text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End</Label>
                      <Input
                        value={formatTime(sub.endTime)}
                        onChange={e => updateSubtitle(sub.id, 'endTime', parseTimeInput(e.target.value))}
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>
                  <Textarea
                    value={sub.text}
                    onChange={e => updateSubtitle(sub.id, 'text', e.target.value)}
                    className="text-sm min-h-[60px]"
                    rows={2}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
            <CardContent>
              {videoSrc && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    className="w-full rounded-lg"
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  >
                    Your browser does not support video playback.
                  </video>
                  {showPreview && currentSubtitle && (
                    <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none">
                      <div className="bg-black/70 text-white text-center px-4 py-2 rounded-lg text-lg max-w-[80%]">
                        {currentSubtitle.text}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!videoSrc && (
                <p className="text-sm text-muted-foreground text-center py-8">Upload a video to see preview</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="relative h-24 bg-muted rounded-lg overflow-hidden">
                {subtitles.length > 0 && (() => {
                  const maxTime = Math.max(...subtitles.map(s => s.endTime), 10);
                  return subtitles.map(sub => {
                    const left = (sub.startTime / maxTime) * 100;
                    const width = ((sub.endTime - sub.startTime) / maxTime) * 100;
                    return (
                      <div
                        key={sub.id}
                        className="absolute top-1 h-5 rounded bg-primary/30 text-[10px] leading-5 px-1 overflow-hidden whitespace-nowrap"
                        style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                        title={sub.text}
                      >
                        {sub.text}
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
