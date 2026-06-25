import { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Square } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function TextToSpeech() {
  const tool = getToolById('text-to-speech')!;
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voice, setVoice] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        if (!voice) {
          const defaultVoice = available.find(v => v.lang.startsWith('en')) || available[0];
          if (defaultVoice) setVoice(defaultVoice.name);
        }
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [voice]);

  const speak = () => {
    if (!text.trim()) {
      toast({ title: 'No text', description: 'Please enter some text to speak.', variant: 'destructive' });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(v => v.name === voice);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => { setSpeaking(true); setPaused(false); };
    utterance.onend = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resumeSpeaking = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-300">
          <Volume2 className="w-4 h-4 inline mr-1" />
          Uses your browser's built-in text-to-speech engine. No audio is sent to any server.
        </div>

        <Textarea
          placeholder="Enter text to speak..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px] resize-y"
        />

        {/* Controls */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          {/* Voice */}
          <div>
            <label className="text-sm font-medium mb-1 block">Voice</label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map(v => (
                  <SelectItem key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speed */}
          <div>
            <div className="flex justify-between text-sm">
              <span>Speed</span>
              <span>{rate}x</span>
            </div>
            <Slider value={[rate * 100]} onValueChange={(v) => setRate(v[0] / 100)} min={50} max={200} step={10} />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Pitch */}
          <div>
            <div className="flex justify-between text-sm">
              <span>Pitch</span>
              <span>{pitch}</span>
            </div>
            <Slider value={[pitch * 100]} onValueChange={(v) => setPitch(v[0] / 100)} min={50} max={200} step={10} />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex gap-2 justify-center">
            {!speaking ? (
              <Button onClick={speak} size="lg" className="min-w-[120px]">
                <Play className="w-5 h-5 mr-2" /> Speak
              </Button>
            ) : paused ? (
              <Button onClick={resumeSpeaking} size="lg" className="min-w-[120px]">
                <Play className="w-5 h-5 mr-2" /> Resume
              </Button>
            ) : (
              <Button onClick={pauseSpeaking} size="lg" variant="outline" className="min-w-[120px]">
                <Pause className="w-5 h-5 mr-2" /> Pause
              </Button>
            )}

            {speaking && (
              <Button onClick={stopSpeaking} size="lg" variant="destructive">
                <Square className="w-5 h-5 mr-2" /> Stop
              </Button>
            )}
          </div>
        </div>

        {/* Character count */}
        {text && (
          <div className="text-center text-sm text-muted-foreground">
            {text.length} characters | {text.trim().split(/\s+/).filter(Boolean).length} words
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
