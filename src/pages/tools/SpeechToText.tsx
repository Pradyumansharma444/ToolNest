import { useState, useRef } from 'react';
import { Mic, Square, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
  }
  interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
  }
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function SpeechToText() {
  const tool = getToolById('speech-to-text')!;
  const { toast } = useToast();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast({ title: 'Speech recognition not supported in this browser', variant: 'destructive' }); return; }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (event) => {
      let final = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript + ' ';
        else interimText += result[0].transcript;
      }
      if (final) setTranscript(prev => prev + final);
      setInterim(interimText);
    };
    rec.onerror = () => { toast({ title: 'Speech error', variant: 'destructive' }); setListening(false); };
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
    toast({ title: 'Listening...' });
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setInterim('');
    toast({ title: 'Stopped' });
  };

  const copyText = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={transcript.length > 0}>
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4 p-8 rounded-xl border bg-card">
          {!listening ? (
            <Button size="lg" onClick={startListening} className="w-20 h-20 rounded-full">
              <Mic className="w-8 h-8" />
            </Button>
          ) : (
            <Button size="lg" variant="destructive" onClick={stopListening} className="w-20 h-20 rounded-full animate-pulse">
              <Square className="w-8 h-8" />
            </Button>
          )}
          <p className="text-sm text-muted-foreground">{listening ? 'Listening... click to stop' : 'Click to start dictation'}</p>
          {interim && <p className="text-sm text-muted-foreground italic">{interim}</p>}
        </div>
        <Textarea placeholder="Transcribed text will appear here..." value={transcript} onChange={(e) => setTranscript(e.target.value)} className="min-h-[150px] resize-y" />
        {transcript && (
          <Button variant="outline" onClick={copyText}>{copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}Copy Text</Button>
        )}
      </div>
    </ToolLayout>
  );
}
