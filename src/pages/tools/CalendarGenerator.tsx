import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { downloadBlob, uint8ToBlob } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Download, ImageDown } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SUNDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_MONDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CalendarEvent {
  date: number;
  label: string;
  color: string;
}

const EVENT_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function CalendarGenerator() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [startDay, setStartDay] = useState<'sunday' | 'monday'>('sunday');
  const [style, setStyle] = useState<'classic' | 'minimal' | 'colorful'>('classic');
  const [showWeekNumbers, setShowWeekNumbers] = useState(false);
  const [title, setTitle] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [editingDate, setEditingDate] = useState<number | null>(null);
  const [eventInput, setEventInput] = useState('');
  const [eventColor, setEventColor] = useState(EVENT_COLORS[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = startDay === 'monday' ? (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1) : firstDayOfMonth;
  const numRows = Math.ceil((startOffset + daysInMonth) / 7);
  const daysArray = startDay === 'sunday' ? DAYS_SUNDAY : DAYS_MONDAY;

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else { setMonth(m => m - 1); } };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else { setMonth(m => m + 1); } };

  const getEventsForDate = (date: number) => events.filter(e => e.date === date);
  const addEvent = () => {
    if (editingDate === null || !eventInput.trim()) return;
    setEvents(prev => [...prev, { date: editingDate, label: eventInput.trim(), color: eventColor }]);
    setEventInput('');
    setEditingDate(null);
  };
  const removeEvent = (date: number, label: string) => {
    setEvents(prev => prev.filter(e => !(e.date === date && e.label === label)));
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const drawCalendar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 2;
    const width = 1240;
    const height = 1754;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(scale, scale);

    const margin = 60;
    const headerHeight = 120;
    const dayHeaderHeight = 50;
    const cellW = (width - 2 * margin) / 7;
    const cellH = (height - margin - headerHeight - dayHeaderHeight) / numRows;

    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.classList.contains('dark');

    if (style === 'colorful') {
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, '#6366f1');
      grad.addColorStop(1, '#ec4899');
      ctx.fillStyle = grad;
      ctx.fillRect(margin, margin, width - 2 * margin, headerHeight);
      ctx.fillStyle = '#ffffff';
    } else if (style === 'classic') {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(margin, margin, width - 2 * margin, headerHeight);
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = isDark ? '#1e1e2e' : '#f8f9fa';
      ctx.fillRect(margin, margin, width - 2 * margin, headerHeight);
      ctx.fillStyle = isDark ? '#e0e0e0' : '#1a1a1a';
    }

    ctx.font = 'bold 36px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const headerText = title || `${MONTHS[month]} ${year}`;
    ctx.fillText(headerText, width / 2, margin + headerHeight / 2);

    let y = margin + headerHeight;

    const cellBorderColor = style === 'minimal' ? (isDark ? '#333' : '#ddd') : style === 'colorful' ? '#d4d4f5' : (isDark ? '#444' : '#333');
    ctx.strokeStyle = cellBorderColor;
    ctx.lineWidth = 1;

    // Day headers
    ctx.font = 'bold 16px Helvetica, Arial, sans-serif';
    ctx.fillStyle = style === 'colorful' ? '#6366f1' : (isDark ? '#ccc' : '#555');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 7; i++) {
      const x = margin + i * cellW + cellW / 2;
      ctx.fillText(daysArray[i], x, y + dayHeaderHeight / 2);
    }
    y += dayHeaderHeight;

    // Week numbers
    const weekNumW = showWeekNumbers ? 50 : 0;

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < 7; col++) {
        const day = row * 7 + col - startOffset + 1;
        if (day < 1 || day > daysInMonth) continue;

        const x = margin + (showWeekNumbers ? weekNumW : 0) + col * cellW;
        const isWeekend = col === 0 || col === 6;

        if (style === 'colorful' && isWeekend) {
          ctx.fillStyle = isDark ? '#2a2a3e' : '#f0f0ff';
          ctx.fillRect(x, y, cellW, cellH);
        } else if (style === 'classic' && isWeekend) {
          ctx.fillStyle = isDark ? '#2a2a2a' : '#f5f5f5';
          ctx.fillRect(x, y, cellW, cellH);
        }

        ctx.fillStyle = isDark ? '#e0e0e0' : '#1a1a1a';
        ctx.font = '14px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(String(day), x + 6, y + 4);

        const dayEvents = getEventsForDate(day);
        dayEvents.forEach((ev, idx) => {
          const dotY = y + 24 + idx * 16;
          ctx.fillStyle = ev.color;
          ctx.beginPath();
          ctx.arc(x + 10, dotY + 6, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '10px Helvetica, Arial, sans-serif';
          ctx.fillStyle = isDark ? '#ccc' : '#555';
          ctx.textAlign = 'left';
          ctx.fillText(ev.label.length > 12 ? ev.label.substring(0, 12) + '...' : ev.label, x + 20, dotY + 1);
        });
      }

      if (showWeekNumbers) {
        const date = new Date(year, month, row * 7 + 1);
        ctx.font = '11px Helvetica, Arial, sans-serif';
        ctx.fillStyle = isDark ? '#888' : '#999';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`W${getWeekNumber(date)}`, margin + weekNumW / 2, y + cellH / 2);
      }

      y += cellH;
    }

    // Grid lines
    y = margin + headerHeight + dayHeaderHeight;
    ctx.strokeStyle = cellBorderColor;
    ctx.lineWidth = 0.5;
    for (let row = 0; row <= numRows; row++) {
      ctx.beginPath();
      ctx.moveTo(margin + (showWeekNumbers ? weekNumW : 0), y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();
      y += cellH;
    }
    if (showWeekNumbers) {
      ctx.beginPath();
      ctx.moveTo(margin + weekNumW, margin + headerHeight + dayHeaderHeight);
      ctx.lineTo(margin + weekNumW, y - cellH);
      ctx.stroke();
    }
    for (let col = 0; col <= 7; col++) {
      ctx.beginPath();
      ctx.moveTo(margin + (showWeekNumbers ? weekNumW : 0) + col * cellW, margin + headerHeight + dayHeaderHeight);
      ctx.lineTo(margin + (showWeekNumbers ? weekNumW : 0) + col * cellW, y - cellH);
      ctx.stroke();
    }
  }, [month, year, startDay, style, showWeekNumbers, title, events, numRows, daysArray, startOffset, daysInMonth]);

  useEffect(() => { drawCalendar(); }, [drawCalendar]);

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Calendar_${MONTHS[month]}_${year}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadPdf = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([1240, 1754]);
    const pngImage = await pdfDoc.embedPng(canvas.toDataURL('image/png'));
    page.drawImage(pngImage, { x: 0, y: 0, width: 1240, height: 1754 });
    const pdfBytes = await pdfDoc.save();
    downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), `Calendar_${MONTHS[month]}_${year}.pdf`);
  };

  const dayEvents = editingDate ? getEventsForDate(editingDate) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Printable Calendar</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Calendar Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" value={year} onChange={e => setYear(Number(e.target.value) || today.getFullYear())} className="w-20 text-center" />
                <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
              </div>

              <div><Label>Custom Title (optional)</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder={`${MONTHS[month]} ${year}`} /></div>

              <div><Label>Style</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['classic', 'minimal', 'colorful'] as const).map(s => (
                    <button key={s} onClick={() => setStyle(s)} className={`p-2 rounded-lg border text-xs capitalize ${style === s ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-muted-foreground'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div><Label>Week Starts On</Label>
                <div className="flex gap-2 mt-1">
                  <Button variant={startDay === 'sunday' ? 'default' : 'outline'} size="sm" onClick={() => setStartDay('sunday')}>Sunday</Button>
                  <Button variant={startDay === 'monday' ? 'default' : 'outline'} size="sm" onClick={() => setStartDay('monday')}>Monday</Button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showWeekNumbers} onChange={e => setShowWeekNumbers(e.target.checked)} />
                Show Week Numbers
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Events</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Click a date on the calendar to add events.</p>
              {editingDate && (
                <div className="space-y-3 p-3 border rounded-lg">
                  <p className="font-medium text-sm">Date: {MONTHS[month]} {editingDate}, {year}</p>
                  {dayEvents.map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ev.color }} />
                      <span className="flex-1">{ev.label}</span>
                      <button onClick={() => removeEvent(editingDate, ev.label)} className="text-red-500 text-xs">Remove</button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input value={eventInput} onChange={e => setEventInput(e.target.value)} placeholder="Event label" onKeyDown={e => e.key === 'Enter' && addEvent()} className="text-sm" />
                    <div className="flex gap-1">
                      {EVENT_COLORS.map(c => (
                        <button key={c} onClick={() => setEventColor(c)} className={`w-5 h-5 rounded-full ${eventColor === c ? 'ring-2 ring-offset-1 ring-foreground' : ''}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addEvent}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingDate(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleDownloadPdf} className="flex-1"><Download className="w-4 h-4 mr-1" />Download PDF</Button>
            <Button onClick={handleDownloadPng} variant="outline" className="flex-1"><ImageDown className="w-4 h-4 mr-1" />Download PNG</Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="border rounded-lg shadow-sm max-w-full"
                  style={{ width: 620, height: 877 }}
                  onClick={(e) => {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const scaleX = 620 / rect.width;
                    const mx = (e.clientX - rect.left) * scaleX;
                    const my = (e.clientY - rect.top) * scaleX;
                    const marginPx = 60 * (620 / 1240);
                    const weekNumW = (showWeekNumbers ? 50 : 0) * (620 / 1240);
                    const headerHeightPx = 120 * (620 / 1240);
                    const dayHeaderPx = 50 * (620 / 1240);
                    const cellW = (620 - 2 * marginPx) / 7;
                    const cellH = (877 - marginPx - headerHeightPx - dayHeaderPx) / numRows;
                    if (mx < marginPx + weekNumW || mx > 620 - marginPx) return;
                    if (my < marginPx + headerHeightPx + dayHeaderPx) return;
                    const col = Math.floor((mx - marginPx - weekNumW) / cellW);
                    const row = Math.floor((my - marginPx - headerHeightPx - dayHeaderPx) / cellH);
                    const day = row * 7 + col - startOffset + 1;
                    if (day >= 1 && day <= daysInMonth) setEditingDate(day);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
