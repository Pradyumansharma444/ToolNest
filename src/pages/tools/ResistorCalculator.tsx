import { useState, useMemo } from 'react';
import { Info, RefreshCw, Cpu } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Color definitions
interface BandColor {
  name: string;
  value: number;
  hex: string;
  textLight: boolean;
}

interface MultiplierColor {
  name: string;
  value: number;
  label: string;
  hex: string;
  textLight: boolean;
}

interface ToleranceColor {
  name: string;
  value: number;
  label: string;
  hex: string;
  textLight: boolean;
}

interface TempColor {
  name: string;
  value: number;
  label: string;
  hex: string;
  textLight: boolean;
}

const DIGIT_COLORS: BandColor[] = [
  { name: 'Black', value: 0, hex: '#1C1917', textLight: true },
  { name: 'Brown', value: 1, hex: '#78350F', textLight: true },
  { name: 'Red', value: 2, hex: '#DC2626', textLight: true },
  { name: 'Orange', value: 3, hex: '#EA580C', textLight: true },
  { name: 'Yellow', value: 4, hex: '#FACC15', textLight: false },
  { name: 'Green', value: 5, hex: '#16A34A', textLight: true },
  { name: 'Blue', value: 6, hex: '#2563EB', textLight: true },
  { name: 'Violet', value: 7, hex: '#9333EA', textLight: true },
  { name: 'Grey', value: 8, hex: '#57534E', textLight: true },
  { name: 'White', value: 9, hex: '#FAFAFA', textLight: false },
];

const MULTIPLIER_COLORS: MultiplierColor[] = [
  { name: 'Black', value: 1, label: 'x1 Ω', hex: '#1C1917', textLight: true },
  { name: 'Brown', value: 10, label: 'x10 Ω', hex: '#78350F', textLight: true },
  { name: 'Red', value: 100, label: 'x100 Ω', hex: '#DC2626', textLight: true },
  { name: 'Orange', value: 1000, label: 'x1 kΩ', hex: '#EA580C', textLight: true },
  { name: 'Yellow', value: 10000, label: 'x10 kΩ', hex: '#FACC15', textLight: false },
  { name: 'Green', value: 100000, label: 'x100 kΩ', hex: '#16A34A', textLight: true },
  { name: 'Blue', value: 1000000, label: 'x1 MΩ', hex: '#2563EB', textLight: true },
  { name: 'Violet', value: 10000000, label: 'x10 MΩ', hex: '#9333EA', textLight: true },
  { name: 'Gold', value: 0.1, label: 'x0.1 Ω', hex: '#D4AF37', textLight: false },
  { name: 'Silver', value: 0.01, label: 'x0.01 Ω', hex: '#C0C0C0', textLight: false },
];

const TOLERANCE_COLORS: ToleranceColor[] = [
  { name: 'Brown', value: 1, label: '±1%', hex: '#78350F', textLight: true },
  { name: 'Red', value: 2, label: '±2%', hex: '#DC2626', textLight: true },
  { name: 'Green', value: 0.5, label: '±0.5%', hex: '#16A34A', textLight: true },
  { name: 'Blue', value: 0.25, label: '±0.25%', hex: '#2563EB', textLight: true },
  { name: 'Violet', value: 0.1, label: '±0.1%', hex: '#9333EA', textLight: true },
  { name: 'Grey', value: 0.05, label: '±0.05%', hex: '#57534E', textLight: true },
  { name: 'Gold', value: 5, label: '±5%', hex: '#D4AF37', textLight: false },
  { name: 'Silver', value: 10, label: '±10%', hex: '#C0C0C0', textLight: false },
];

const TEMP_COLORS: TempColor[] = [
  { name: 'Brown', value: 100, label: '100 ppm/K', hex: '#78350F', textLight: true },
  { name: 'Red', value: 50, label: '50 ppm/K', hex: '#DC2626', textLight: true },
  { name: 'Orange', value: 15, label: '15 ppm/K', hex: '#EA580C', textLight: true },
  { name: 'Yellow', value: 25, label: '25 ppm/K', hex: '#FACC15', textLight: false },
  { name: 'Blue', value: 10, label: '10 ppm/K', hex: '#2563EB', textLight: true },
  { name: 'Violet', value: 5, label: '5 ppm/K', hex: '#9333EA', textLight: true },
];

type BandIndex = 'band1' | 'band2' | 'band3' | 'multiplier' | 'tolerance' | 'temp';

export default function ResistorCalculator() {
  const tool = getToolById('resistor-calculator')!;

  const [bandsMode, setBandsMode] = useState<4 | 5 | 6>(4);
  const [activeSelectTab, setActiveSelectTab] = useState<BandIndex>('band1');

  // Selected values
  const [band1, setBand1] = useState<BandColor>(DIGIT_COLORS[4]!); // Yellow (4)
  const [band2, setBand2] = useState<BandColor>(DIGIT_COLORS[7]!); // Violet (7)
  const [band3, setBand3] = useState<BandColor>(DIGIT_COLORS[0]!); // Black (0)
  const [multiplier, setMultiplier] = useState<MultiplierColor>(MULTIPLIER_COLORS[2]!); // Red (100)
  const [tolerance, setTolerance] = useState<ToleranceColor>(TOLERANCE_COLORS[6]!); // Gold (5%)
  const [temp, setTemp] = useState<TempColor>(TEMP_COLORS[0]!); // Brown (100 ppm)

  // Auto-switch focused tabs when mode changes
  const handleModeChange = (modeStr: string) => {
    const mode = parseInt(modeStr) as 4 | 5 | 6;
    setBandsMode(mode);
    if (mode === 4 && activeSelectTab === 'band3') {
      setActiveSelectTab('multiplier');
    }
    if (mode < 6 && activeSelectTab === 'temp') {
      setActiveSelectTab('tolerance');
    }
  };

  // Math calculation
  const calculation = useMemo(() => {
    let baseValue = 0;
    if (bandsMode === 4) {
      baseValue = (band1.value * 10 + band2.value) * multiplier.value;
    } else {
      // 5-band or 6-band uses 3 digit bands
      baseValue = (band1.value * 100 + band2.value * 10 + band3.value) * multiplier.value;
    }

    // Format display string (e.g. 47000 -> 47 kΩ)
    let formattedVal = '';
    if (baseValue >= 1000000000) {
      formattedVal = `${(baseValue / 1000000000).toFixed(baseValue % 1000000000 === 0 ? 0 : 2)} GΩ`;
    } else if (baseValue >= 1000000) {
      formattedVal = `${(baseValue / 1000000).toFixed(baseValue % 1000000 === 0 ? 0 : 2)} MΩ`;
    } else if (baseValue >= 1000) {
      formattedVal = `${(baseValue / 1000).toFixed(baseValue % 1000 === 0 ? 0 : 2)} kΩ`;
    } else {
      formattedVal = `${baseValue.toFixed(baseValue % 1 === 0 ? 0 : 2)} Ω`;
    }

    // Min/Max tolerance limits
    const diff = baseValue * (tolerance.value / 100);
    const minVal = baseValue - diff;
    const maxVal = baseValue + diff;

    const formatLimit = (val: number) => {
      if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} GΩ`;
      if (val >= 1000000) return `${(val / 1000000).toFixed(2)} MΩ`;
      if (val >= 1000) return `${(val / 1000).toFixed(2)} kΩ`;
      return `${val.toFixed(2)} Ω`;
    };

    return {
      nominal: formattedVal,
      range: `${formatLimit(minVal)} - ${formatLimit(maxVal)}`,
      toleranceText: tolerance.label,
      tempText: bandsMode === 6 ? temp.label : null,
    };
  }, [bandsMode, band1, band2, band3, multiplier, tolerance, temp]);

  const resetBands = () => {
    setBand1(DIGIT_COLORS[4]!);
    setBand2(DIGIT_COLORS[7]!);
    setBand3(DIGIT_COLORS[0]!);
    setMultiplier(MULTIPLIER_COLORS[2]!);
    setTolerance(TOLERANCE_COLORS[6]!);
    setTemp(TEMP_COLORS[0]!);
    setActiveSelectTab('band1');
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Resistor Display & Output */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-muted bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Interactive Resistor Visualizer</span>
                <button
                  onClick={resetBands}
                  className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-6 space-y-8">
              {/* SVG Vector Resistor Graphic */}
              <div className="w-full max-w-[340px] h-32 flex items-center justify-center relative select-none">
                {/* Horizontal Lead wire behind */}
                <div className="absolute w-[95%] h-2 bg-stone-300 dark:bg-stone-600 rounded-full left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 -z-10 shadow-inner" />

                {/* Resistor Body wrapper */}
                <div className="w-[75%] h-14 bg-amber-50 dark:bg-zinc-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl flex justify-between items-center px-4 relative overflow-hidden shadow-md">
                  {/* Left bulb bulbous corner */}
                  <div className="absolute left-0 w-4 h-full bg-inherit border-r-2 border-stone-200/50 dark:border-stone-700/50 rounded-l-2xl" />
                  {/* Right bulb bulbous corner */}
                  <div className="absolute right-0 w-4 h-full bg-inherit border-l-2 border-stone-200/50 dark:border-stone-700/50 rounded-r-2xl" />

                  {/* BAND 1 */}
                  <button
                    onClick={() => setActiveSelectTab('band1')}
                    className={`w-3.5 h-full absolute transition-all cursor-pointer border-x border-stone-900/10 hover:brightness-110 hover:scale-x-110 left-[12%] ${
                      activeSelectTab === 'band1' ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-800' : ''
                    }`}
                    style={{ backgroundColor: band1.hex }}
                    title={`Band 1: ${band1.name} (${band1.value})`}
                  />

                  {/* BAND 2 */}
                  <button
                    onClick={() => setActiveSelectTab('band2')}
                    className={`w-3.5 h-full absolute transition-all cursor-pointer border-x border-stone-900/10 hover:brightness-110 hover:scale-x-110 left-[26%] ${
                      activeSelectTab === 'band2' ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-800' : ''
                    }`}
                    style={{ backgroundColor: band2.hex }}
                    title={`Band 2: ${band2.name} (${band2.value})`}
                  />

                  {/* BAND 3 (Only 5 or 6 Band) */}
                  {bandsMode > 4 && (
                    <button
                      onClick={() => setActiveSelectTab('band3')}
                      className={`w-3.5 h-full absolute transition-all cursor-pointer border-x border-stone-900/10 hover:brightness-110 hover:scale-x-110 left-[40%] ${
                        activeSelectTab === 'band3' ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-800' : ''
                      }`}
                      style={{ backgroundColor: band3.hex }}
                      title={`Band 3: ${band3.name} (${band3.value})`}
                    />
                  )}

                  {/* MULTIPLIER BAND */}
                  <button
                    onClick={() => setActiveSelectTab('multiplier')}
                    className={`w-3.5 h-full absolute transition-all cursor-pointer border-x border-stone-900/10 hover:brightness-110 hover:scale-x-110 ${
                      bandsMode === 4 ? 'left-[46%]' : 'left-[54%]'
                    } ${
                      activeSelectTab === 'multiplier' ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-800' : ''
                    }`}
                    style={{ backgroundColor: multiplier.hex }}
                    title={`Multiplier: ${multiplier.name} (${multiplier.label})`}
                  />

                  {/* TOLERANCE BAND */}
                  <button
                    onClick={() => setActiveSelectTab('tolerance')}
                    className={`w-3.5 h-full absolute transition-all cursor-pointer border-x border-stone-900/10 hover:brightness-110 hover:scale-x-110 ${
                      bandsMode === 4 ? 'left-[70%]' : 'left-[68%]'
                    } ${
                      activeSelectTab === 'tolerance' ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-800' : ''
                    }`}
                    style={{ backgroundColor: tolerance.hex }}
                    title={`Tolerance: ${tolerance.name} (${tolerance.label})`}
                  />

                  {/* TEMP COEFFICIENT BAND (Only 6 Band) */}
                  {bandsMode === 6 && (
                    <button
                      onClick={() => setActiveSelectTab('temp')}
                      className={`w-3.5 h-full absolute transition-all cursor-pointer border-x border-stone-900/10 hover:brightness-110 hover:scale-x-110 left-[82%] ${
                        activeSelectTab === 'temp' ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-800' : ''
                      }`}
                      style={{ backgroundColor: temp.hex }}
                      title={`Temp Coefficient: ${temp.name} (${temp.label})`}
                    />
                  )}
                </div>
              </div>

              {/* Selection Summary label */}
              <div className="flex gap-1 items-center justify-center text-[10px] text-muted-foreground font-mono">
                <span>Selected:</span>
                <span className="font-bold text-foreground">
                  {band1.name} &bull; {band2.name} &bull; {bandsMode > 4 && `${band3.name} \u2022 `} {multiplier.name} &bull; {tolerance.name} {bandsMode === 6 && `\u2022 ${temp.name}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary Card */}
          <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm shadow-md">
            <CardHeader className="pb-3 border-b border-indigo-500/10">
              <CardTitle className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                Resistance Calculations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Calculated Resistance</span>
                <div className="text-3xl font-black tracking-tight text-foreground flex items-baseline gap-2">
                  {calculation.nominal}
                  <span className="text-sm font-semibold text-muted-foreground">
                    ({calculation.toleranceText})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Operational Range</span>
                  <div className="text-xs font-mono font-bold text-muted-foreground">
                    {calculation.range}
                  </div>
                </div>

                {calculation.tempText && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Temp. Coefficient</span>
                    <div className="text-xs font-mono font-bold text-muted-foreground">
                      {calculation.tempText}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Band Config & Color Swatches */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-500" />
                    Color Code Solver
                  </CardTitle>
                  <CardDescription>
                    Select the number of bands and assign colors to solve.
                  </CardDescription>
                </div>

                {/* Resistor Band Mode Selector */}
                <div className="flex border rounded-lg bg-muted p-0.5 self-start sm:self-center">
                  {([4, 5, 6] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleModeChange(String(mode))}
                      className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                        bandsMode === mode ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {mode} Bands
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Select Band to Edit Selector Tabs */}
              <Tabs defaultValue="band1" value={activeSelectTab} onValueChange={(val: string) => setActiveSelectTab(val as BandIndex)} className="w-full">
                <TabsList className="flex flex-wrap w-full bg-muted/60 p-1 h-auto gap-0.5">
                  <TabsTrigger value="band1" className="flex-1 text-xs py-1.5 data-[state=active]:bg-background transition-all">
                    1st Band
                  </TabsTrigger>
                  <TabsTrigger value="band2" className="flex-1 text-xs py-1.5 data-[state=active]:bg-background transition-all">
                    2nd Band
                  </TabsTrigger>
                  {bandsMode > 4 && (
                    <TabsTrigger value="band3" className="flex-1 text-xs py-1.5 data-[state=active]:bg-background transition-all">
                      3rd Band
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="multiplier" className="flex-1 text-xs py-1.5 data-[state=active]:bg-background transition-all">
                    Multiplier
                  </TabsTrigger>
                  <TabsTrigger value="tolerance" className="flex-1 text-xs py-1.5 data-[state=active]:bg-background transition-all">
                    Tolerance
                  </TabsTrigger>
                  {bandsMode === 6 && (
                    <TabsTrigger value="temp" className="flex-1 text-xs py-1.5 data-[state=active]:bg-background transition-all">
                      Temp. Coeff.
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* SWATCH GRIDS */}
                <div className="mt-6 border rounded-xl p-4 bg-background/50">
                  
                  {/* Digit swatches for Band 1, 2, 3 */}
                  {(activeSelectTab === 'band1' || activeSelectTab === 'band2' || activeSelectTab === 'band3') && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {DIGIT_COLORS.map((color) => {
                        const isSelected = 
                          (activeSelectTab === 'band1' && band1.name === color.name) ||
                          (activeSelectTab === 'band2' && band2.name === color.name) ||
                          (activeSelectTab === 'band3' && band3.name === color.name);
                        
                        const setter = 
                          activeSelectTab === 'band1' ? setBand1 : 
                          activeSelectTab === 'band2' ? setBand2 : setBand3;

                        return (
                          <button
                            key={color.name}
                            onClick={() => setter(color)}
                            style={{ backgroundColor: color.hex }}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 text-xs font-bold transition-all h-16 cursor-pointer shadow-sm ${
                              isSelected ? 'border-indigo-500 scale-102 shadow-md' : 'border-stone-200 dark:border-stone-700/50 hover:brightness-105'
                            } ${color.textLight ? 'text-white' : 'text-stone-900'}`}
                          >
                            <span>{color.name}</span>
                            <span className="text-[10px] opacity-80 mt-0.5">{color.value}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiplier swatches */}
                  {activeSelectTab === 'multiplier' && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {MULTIPLIER_COLORS.map((color) => {
                        const isSelected = multiplier.name === color.name;
                        return (
                          <button
                            key={color.name}
                            onClick={() => setMultiplier(color)}
                            style={{ backgroundColor: color.hex }}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border-2 text-xs font-bold transition-all h-16 cursor-pointer shadow-sm ${
                              isSelected ? 'border-indigo-500 scale-102 shadow-md' : 'border-stone-200 dark:border-stone-700/50 hover:brightness-105'
                            } ${color.textLight ? 'text-white' : 'text-stone-900'}`}
                          >
                            <span>{color.name}</span>
                            <span className="text-[9px] opacity-80 mt-0.5">{color.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Tolerance swatches */}
                  {activeSelectTab === 'tolerance' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {TOLERANCE_COLORS.map((color) => {
                        const isSelected = tolerance.name === color.name;
                        return (
                          <button
                            key={color.name}
                            onClick={() => setTolerance(color)}
                            style={{ backgroundColor: color.hex }}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border-2 text-xs font-bold transition-all h-16 cursor-pointer shadow-sm ${
                              isSelected ? 'border-indigo-500 scale-102 shadow-md' : 'border-stone-200 dark:border-stone-700/50 hover:brightness-105'
                            } ${color.textLight ? 'text-white' : 'text-stone-900'}`}
                          >
                            <span>{color.name}</span>
                            <span className="text-[10px] opacity-80 mt-0.5">{color.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Temp Coefficient swatches */}
                  {activeSelectTab === 'temp' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {TEMP_COLORS.map((color) => {
                        const isSelected = temp.name === color.name;
                        return (
                          <button
                            key={color.name}
                            onClick={() => setTemp(color)}
                            style={{ backgroundColor: color.hex }}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border-2 text-xs font-bold transition-all h-16 cursor-pointer shadow-sm ${
                              isSelected ? 'border-indigo-500 scale-102 shadow-md' : 'border-stone-200 dark:border-stone-700/50 hover:brightness-105'
                            } ${color.textLight ? 'text-white' : 'text-stone-900'}`}
                          >
                            <span>{color.name}</span>
                            <span className="text-[9px] opacity-80 mt-0.5">{color.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Theoretical notes */}
          <Card className="border-muted bg-card/30">
            <CardContent className="p-5 text-xs text-muted-foreground space-y-3 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Info className="w-4 h-4 text-indigo-400" />
                Resistor Band Conventions
              </div>
              <p>
                <strong>4-Band Resistors</strong> use the first 2 bands for significant digits, the 3rd for the decimal multiplier, and the 4th for tolerance limits.
              </p>
              <p>
                <strong>5-Band Resistors</strong> feature high-precision values and add a 3rd digit band. They use 3 bands for digits, the 4th for the multiplier, and the 5th for tolerance.
              </p>
              <p>
                <strong>6-Band Resistors</strong> expand on 5-band layouts by adding a 6th band showing the temperature coefficient in ppm/K (parts per million per Kelvin).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}

