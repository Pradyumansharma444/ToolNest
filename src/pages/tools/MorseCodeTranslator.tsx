import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Volume2, VolumeX } from 'lucide-react';

const CHAR_TO_MORSE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.', '0': '-----', ' ': '/',
};

const MORSE_TO_CHAR: Record<string, string> = Object.entries(CHAR_TO_MORSE).reduce(
  (acc, [k, v]) => ({ ...acc, [v]: k }),
  {}
);

export default function MorseCodeTranslator() {
  const tool = getToolById('morse-code')!;

  const [text, setText] = useState('');
  const [morse, setMorse] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const playTimeoutRef = useRef<number | null>(null);

  // Translate Text -> Morse
  const translateToMorse = (inputVal: string) => {
    const chars = inputVal.toUpperCase().split('');
    const morseCode = chars
      .map((c) => CHAR_TO_MORSE[c] || '')
      .filter((m) => m !== '')
      .join(' ');
    setMorse(morseCode);
  };

  // Translate Morse -> Text
  const translateToText = (inputVal: string) => {
    const codes = inputVal.trim().split(/\s+/);
    const plainText = codes
      .map((c) => MORSE_TO_CHAR[c] || '')
      .join('');
    setText(plainText);
  };

  const handleTextChange = (val: string) => {
    setText(val);
    translateToMorse(val);
  };

  const handleMorseChange = (val: string) => {
    setMorse(val);
    translateToText(val);
  };

  // Web Audio Beep Player
  const playBeep = (duration: number) => {
    return new Promise<void>((resolve) => {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, ctx.currentTime); // frequency pitch 650Hz
        gain.gain.setValueAtTime(0.2, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        setTimeout(() => {
          osc.stop();
          resolve();
        }, duration);
      } catch {
        resolve();
      }
    });
  };

  // Play full morse string sequence
  const playMorseSequence = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (!morse.trim()) return;

    setIsPlaying(true);
    const symbols = morse.split('');

    for (const char of symbols) {
      if (!isPlaying) break; // check cancel state

      if (char === '.') {
        await playBeep(100); // dot short beep 100ms
        await new Promise((r) => setTimeout(r, 100)); // space between parts
      } else if (char === '-') {
        await playBeep(300); // dash long beep 300ms
        await new Promise((r) => setTimeout(r, 100));
      } else if (char === ' ' || char === '/') {
        await new Promise((r) => setTimeout(r, 300)); // space between words
      }
    }

    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    };
  }, []);

  return (
    <ToolLayout tool={tool} resultVisible={morse.length > 0}>
      <div className="space-y-6">
        
        {/* Translation Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Plain Text</label>
            <Textarea
              placeholder="Type alphanumeric text here..."
              className="min-h-[180px] p-4 text-base rounded-2xl resize-y"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Morse Code Symbols</label>
            <Textarea
              placeholder="Type Morse code symbols here (e.g. ... --- ...) using dot (.) and dash (-)..."
              className="min-h-[180px] p-4 text-base rounded-2xl font-mono resize-y"
              value={morse}
              onChange={(e) => handleMorseChange(e.target.value)}
            />
          </div>
        </div>

        {/* Audio controls */}
        <div className="flex gap-4">
          <Button
            onClick={playMorseSequence}
            disabled={!morse.trim()}
            variant={isPlaying ? 'destructive' : 'default'}
            className="flex-1 font-bold gap-2 py-6 rounded-xl text-base"
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-5 h-5" /> Stop Playback
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" /> Play Morse Sound Beeps
              </>
            )}
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
