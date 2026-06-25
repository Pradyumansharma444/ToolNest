import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, AlertCircle, Info, RefreshCw, Music } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SoundTrack {
  id: string;
  name: string;
  description: string;
  volume: number; // 0 to 1
  color: string;
}

export default function AmbientSoundMixer() {
  const tool = getToolById('ambient-sound-mixer')!;

  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [tracks, setTracks] = useState<SoundTrack[]>([
    { id: 'rain', name: 'Cozy Rain', description: 'Bandpass filtered rain storm', volume: 0.5, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'campfire', name: 'Campfire', description: 'Low crackling campfire logs', volume: 0.0, color: 'text-orange-500 bg-orange-500/10' },
    { id: 'waves', name: 'Ocean Waves', description: 'LFO-modulated deep ocean roll', volume: 0.0, color: 'text-cyan-500 bg-cyan-500/10' },
    { id: 'wind', name: 'Whistling Wind', description: 'Slow sweep bandpass gusts', volume: 0.0, color: 'text-teal-500 bg-teal-500/10' },
    { id: 'brownian', name: 'Deep Focus', description: 'Soothing brownian noise rumble', volume: 0.0, color: 'text-indigo-500 bg-indigo-500/10' },
    { id: 'binaural', name: 'Binaural Focus', description: 'Theta waves (200Hz / 206Hz)', volume: 0.0, color: 'text-purple-500 bg-purple-500/10' },
  ]);

  // Audio nodes and context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Track-specific node refs
  const sourcesRef = useRef<Record<string, AudioNode[]>>({});
  const trackGainsRef = useRef<Record<string, GainNode>>({});
  
  // Campfire crackle timer ref
  const campfireIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Audio Context on demand
  const initAudio = () => {
    if (audioCtxRef.current) return;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    setupTracks(ctx, masterGain);
  };

  // Noise Buffer creation helpers
  const createWhiteNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // eslint-disable-next-line react-hooks/purity
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const createBrownNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // eslint-disable-next-line react-hooks/purity
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
    return buffer;
  };

  const setupTracks = (ctx: AudioContext, masterDest: AudioNode) => {
    const rainBuffer = createWhiteNoiseBuffer(ctx);
    const brownBuffer = createBrownNoiseBuffer(ctx);

    tracks.forEach(track => {
      const trackGain = ctx.createGain();
      trackGain.gain.setValueAtTime(track.volume, ctx.currentTime);
      trackGainsRef.current[track.id] = trackGain;

      const activeNodes: AudioNode[] = [];

      if (track.id === 'rain') {
        const source = ctx.createBufferSource();
        source.buffer = rainBuffer;
        source.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(380, ctx.currentTime);
        bandpass.Q.setValueAtTime(0.8, ctx.currentTime);

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(700, ctx.currentTime);

        source.connect(bandpass);
        bandpass.connect(lowpass);
        lowpass.connect(trackGain);
        trackGain.connect(masterDest);

        source.start();
        activeNodes.push(source, bandpass, lowpass);
      }

      else if (track.id === 'brownian') {
        const source = ctx.createBufferSource();
        source.buffer = brownBuffer;
        source.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(300, ctx.currentTime);

        source.connect(lowpass);
        lowpass.connect(trackGain);
        trackGain.connect(masterDest);

        source.start();
        activeNodes.push(source, lowpass);
      }

      else if (track.id === 'waves') {
        const source = ctx.createBufferSource();
        source.buffer = brownBuffer;
        source.loop = true;

        // Wave rolling LFO
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 second wave loop

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.35, ctx.currentTime);

        // Modulate volume
        lfo.connect(lfoGain);
        lfoGain.connect(trackGain.gain);

        source.connect(trackGain);
        trackGain.connect(masterDest);

        source.start();
        lfo.start();
        activeNodes.push(source, lfo, lfoGain);
      }

      else if (track.id === 'wind') {
        const source = ctx.createBufferSource();
        source.buffer = rainBuffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);

        // Gust LFO
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // very slow whistling sweep

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(220, ctx.currentTime); // modulate up/down 220Hz

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        source.connect(filter);
        filter.connect(trackGain);
        trackGain.connect(masterDest);

        source.start();
        lfo.start();
        activeNodes.push(source, filter, lfo, lfoGain);
      }

      else if (track.id === 'campfire') {
        // Hum oscillator
        const hum = ctx.createOscillator();
        hum.type = 'sine';
        hum.frequency.setValueAtTime(65, ctx.currentTime); // low hum

        const humLowpass = ctx.createBiquadFilter();
        humLowpass.type = 'lowpass';
        humLowpass.frequency.setValueAtTime(120, ctx.currentTime);

        const humGain = ctx.createGain();
        humGain.gain.setValueAtTime(0.2, ctx.currentTime);

        hum.connect(humLowpass);
        humLowpass.connect(humGain);
        humGain.connect(trackGain);
        trackGain.connect(masterDest);

        hum.start();
        activeNodes.push(hum, humLowpass, humGain);

        // Start clicking interval trigger
        triggerCampfireCrackle(ctx, trackGain);
      }

      else if (track.id === 'binaural') {
        // Binaural beats need stereo split
        const leftOsc = ctx.createOscillator();
        leftOsc.frequency.setValueAtTime(200, ctx.currentTime); // Left ear 200Hz

        const rightOsc = ctx.createOscillator();
        rightOsc.frequency.setValueAtTime(206, ctx.currentTime); // Right ear 206Hz (6Hz Theta diff)

        const merger = ctx.createChannelMerger(2);

        leftOsc.connect(merger, 0, 0);
        rightOsc.connect(merger, 0, 1);

        merger.connect(trackGain);
        trackGain.connect(masterDest);

        leftOsc.start();
        rightOsc.start();
        activeNodes.push(leftOsc, rightOsc, merger);
      }

      sourcesRef.current[track.id] = activeNodes;
    });
  };

  // Randomized wood crackling sounds
  const triggerCampfireCrackle = (ctx: AudioContext, dest: AudioNode) => {
    const clickBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = clickBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // eslint-disable-next-line react-hooks/purity
      data[i] = Math.random() * 2 - 1;
    }

    const crackleLoop = () => {
      // Check if bonfire volume is audible and audio is running
      const isAudible = (trackGainsRef.current['campfire']?.gain.value || 0) > 0.01;
      if (audioCtxRef.current && isAudible && audioCtxRef.current.state === 'running') {
        const source = ctx.createBufferSource();
        source.buffer = clickBuffer;

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(1400 + Math.random() * 800, ctx.currentTime);

        const decay = ctx.createGain();
        decay.gain.setValueAtTime(0.09 * Math.random(), ctx.currentTime);
        decay.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03 * Math.random());

        source.connect(hp);
        hp.connect(decay);
        decay.connect(dest);
        source.start();
      }

      // Queue next randomized crackle
      campfireIntervalRef.current = setTimeout(crackleLoop, 80 + Math.random() * 220);
    };

    campfireIntervalRef.current = setTimeout(crackleLoop, 100);
  };

  // Play / Pause handling
  const handlePlayPause = () => {
    initAudio();
    
    if (audioCtxRef.current) {
      if (isPlaying) {
        audioCtxRef.current.suspend();
        setIsPlaying(false);
      } else {
        audioCtxRef.current.resume();
        setIsPlaying(true);
      }
    }
  };

  // Handle master volume adjustments
  const handleMasterVolumeChange = (value: number) => {
    setMasterVolume(value);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(value, audioCtxRef.current.currentTime);
    }
  };

  // Handle track individual volume adjustments
  const handleTrackVolumeChange = (trackId: string, value: number) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, volume: value } : t));
    
    const gainNode = trackGainsRef.current[trackId];
    if (gainNode && audioCtxRef.current) {
      gainNode.gain.setValueAtTime(value, audioCtxRef.current.currentTime);
    }
  };

  // Load preset volume levels
  const applyPreset = (preset: Record<string, number>) => {
    initAudio();
    
    // Auto-resume context if paused
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    setIsPlaying(true);

    const nextTracks = tracks.map(track => {
      const targetVol = preset[track.id] !== undefined ? preset[track.id]! : 0.0;
      const gainNode = trackGainsRef.current[track.id];
      if (gainNode && audioCtxRef.current) {
        gainNode.gain.setValueAtTime(targetVol, audioCtxRef.current.currentTime);
      }
      return { ...track, volume: targetVol };
    });

    setTracks(nextTracks);
  };

  const presets = {
    sleep: { rain: 0.6, campfire: 0.1, waves: 0.4, wind: 0.0, brownian: 0.0, binaural: 0.0 },
    study: { rain: 0.2, campfire: 0.0, waves: 0.0, wind: 0.1, brownian: 0.3, binaural: 0.4 },
    campfire: { rain: 0.1, campfire: 0.7, waves: 0.0, wind: 0.2, brownian: 0.0, binaural: 0.0 },
    ocean: { rain: 0.0, campfire: 0.0, waves: 0.75, wind: 0.1, brownian: 0.0, binaural: 0.2 },
    reset: { rain: 0.0, campfire: 0.0, waves: 0.0, wind: 0.0, brownian: 0.0, binaural: 0.0 },
  };

  // Clean up Web Audio node connections on component unmount
  useEffect(() => {
    return () => {
      if (campfireIntervalRef.current) {
        clearTimeout(campfireIntervalRef.current);
      }
      
      // Stop all playing nodes
      Object.keys(sourcesRef.current).forEach(key => {
        const nodes = sourcesRef.current[key];
        if (nodes) {
          nodes.forEach(node => {
            if ('stop' in node) {
              try {
                (node as AudioScheduledSourceNode).stop();
              } catch { /* empty */ }
            }
          });
        }
      });

      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Master Control Board */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-muted bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-500" />
                Mixer Console
              </CardTitle>
              <CardDescription>
                Start, pause, and configure the sound synthesis engine.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Play Button */}
              <div className="flex flex-col items-center justify-center p-4 bg-muted/20 border rounded-xl space-y-4">
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                </Button>
                
                <div className="text-center">
                  <h4 className="font-bold text-sm">{isPlaying ? 'Sound Machine Active' : 'Sound Machine Idle'}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isPlaying ? 'Synthesizing frequencies live' : 'Tap play to initialize AudioContext'}
                  </p>
                </div>
              </div>

              {/* Master Volume */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-4 h-4 text-indigo-500" />
                    Master Volume
                  </span>
                  <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">
                    {Math.round(masterVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[masterVolume]}
                  onValueChange={(val) => handleMasterVolumeChange(val[0]!)}
                  min={0}
                  max={1}
                  step={0.05}
                  disabled={!isPlaying}
                  className="py-2"
                />
              </div>

              <div className="h-px bg-muted" />

              {/* Audio Presets */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Soundscapes presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => applyPreset(presets.sleep)}
                    className="text-xs font-semibold py-4"
                  >
                    🌙 Deep Sleep
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyPreset(presets.study)}
                    className="text-xs font-semibold py-4"
                  >
                    📖 Deep Study
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyPreset(presets.campfire)}
                    className="text-xs font-semibold py-4"
                  >
                    🔥 Cozy Campfire
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyPreset(presets.ocean)}
                    className="text-xs font-semibold py-4"
                  >
                    🌊 Shore Waves
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => applyPreset(presets.reset)}
                  className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 mt-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset All Track Sliders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Faders Board */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-muted bg-card/40">
            <CardHeader className="pb-3 border-b flex-row justify-between items-center space-y-0">
              <div>
                <CardTitle className="text-sm font-bold">Sound Board Faders</CardTitle>
                <CardDescription className="text-xs">
                  Mix channels to create your custom ambient environment.
                </CardDescription>
              </div>

              {/* Simple visual wave nodes */}
              {isPlaying && (
                <div className="flex gap-0.5 h-5 items-end">
                  <span className="w-1 bg-indigo-500 rounded-t animate-[pulse_1.2s_infinite] h-4" />
                  <span className="w-1 bg-indigo-500 rounded-t animate-[pulse_0.7s_infinite] h-2.5" />
                  <span className="w-1 bg-indigo-500 rounded-t animate-[pulse_1s_infinite] h-5" />
                  <span className="w-1 bg-indigo-500 rounded-t animate-[pulse_0.8s_infinite] h-3" />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!isPlaying && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex gap-2.5 leading-relaxed">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-0.5">Interaction Required</p>
                    <p>Browser security settings require you to tap the primary <strong>Mixer Play</strong> button before sound channels can begin synthesizing.</p>
                  </div>
                </div>
              )}

              {/* Fader Channels */}
              <div className="space-y-5">
                {tracks.map((track) => (
                  <div key={track.id} className="p-3 border rounded-xl bg-background/50 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{track.name}</h4>
                        <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{track.description}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${track.volume > 0 ? track.color : 'bg-muted text-muted-foreground'}`}>
                        {Math.round(track.volume * 100)}%
                      </span>
                    </div>

                    <Slider
                      value={[track.volume]}
                      onValueChange={(val) => handleTrackVolumeChange(track.id, val[0]!)}
                      min={0}
                      max={1}
                      step={0.05}
                      disabled={!isPlaying}
                      className="py-1"
                    />
                  </div>
                ))}
              </div>

              {/* Technical Tip */}
              <div className="flex gap-2.5 bg-muted/40 rounded-xl p-4 text-xs text-muted-foreground leading-relaxed border">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-0.5">100% Procedural Synthesis</p>
                  <p>
                    Unlike standard sites that play loops of heavy MP3 audio files, this tool synthesizes pure frequencies in real-time. Campfire pops, wind swings, and ocean ripples are completely algorithmic, infinite, and consume almost zero cellular bandwidth.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}

