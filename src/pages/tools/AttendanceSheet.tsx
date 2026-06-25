import { useState, useMemo, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, Download, Save, History, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function genId() { return Math.random().toString(36).substring(2, 9); }

interface Student {
  id: string;
  name: string;
}

interface AttendanceRecord {
  [studentId: string]: {
    [dateStr: string]: boolean;
  };
}

interface AttendanceSession {
  id: string;
  className: string;
  startDate: string;
  numDays: string;
  students: Student[];
  attendance: AttendanceRecord;
  updatedAt: number;
}

export default function AttendanceSheet() {
  const tool = getToolById('attendance-sheet')!;

  // Restore states from localStorage on init
  const [className, setClassName] = useState(() => {
    try {
      const saved = localStorage.getItem('attendance_active_state');
      if (saved) return JSON.parse(saved).className ?? '';
    } catch { /* empty */ }
    return '';
  });

  const [startDate, setStartDate] = useState(() => {
    try {
      const saved = localStorage.getItem('attendance_active_state');
      if (saved) return JSON.parse(saved).startDate ?? new Date().toISOString().slice(0, 10);
    } catch { /* empty */ }
    return new Date().toISOString().slice(0, 10);
  });

  const [numDays, setNumDays] = useState(() => {
    try {
      const saved = localStorage.getItem('attendance_active_state');
      if (saved) return JSON.parse(saved).numDays ?? '5';
    } catch { /* empty */ }
    return '5';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('attendance_active_state');
      if (saved) return JSON.parse(saved).students ?? [
        { id: genId(), name: '' },
        { id: genId(), name: '' },
      ];
    } catch { /* empty */ }
    return [
      { id: genId(), name: '' },
      { id: genId(), name: '' },
    ];
  });

  const [attendance, setAttendance] = useState<AttendanceRecord>(() => {
    try {
      const saved = localStorage.getItem('attendance_active_state');
      if (saved) return JSON.parse(saved).attendance ?? {};
    } catch { /* empty */ }
    return {};
  });

  const [sessions, setSessions] = useState<AttendanceSession[]>(() => {
    try {
      const saved = localStorage.getItem('attendance_saved_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('attendance_active_session_id') || null;
    } catch { return null; }
  });

  // Auto-save active workspace state
  useEffect(() => {
    const state = { className, startDate, numDays, students, attendance };
    localStorage.setItem('attendance_active_state', JSON.stringify(state));
  }, [className, startDate, numDays, students, attendance]);

  // Sync saved sessions to localStorage
  useEffect(() => {
    localStorage.setItem('attendance_saved_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Sync active session ID to localStorage
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('attendance_active_session_id', activeSessionId);
    } else {
      localStorage.removeItem('attendance_active_session_id');
    }
  }, [activeSessionId]);

  const addStudent = () => {
    const id = genId();
    setStudents(prev => [...prev, { id, name: '' }]);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setAttendance(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateStudentName = (id: string, name: string) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, name } : s)));
  };

  const dateRange = useMemo(() => {
    const days = parseInt(numDays) || 5;
    const start = new Date(startDate);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [startDate, numDays]);

  const toggleAttendance = (studentId: string, dateStr: string) => {
    setAttendance(prev => {
      const current = prev[studentId]?.[dateStr] ?? false;
      return {
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [dateStr]: !current,
        },
      };
    });
  };

  const getAttendanceCount = (studentId: string) => {
    let present = 0;
    for (const dateStr of dateRange) {
      if (attendance[studentId]?.[dateStr]) present++;
    }
    return present;
  };

  const saveNewSession = () => {
    const defaultName = className.trim() || `Class ${new Date().toLocaleDateString()}`;
    const name = prompt('Enter a name for this session:', defaultName);
    if (name === null) return;
    
    const id = genId();
    const newSession: AttendanceSession = {
      id,
      className: name.trim() || defaultName,
      startDate,
      numDays,
      students,
      attendance,
      updatedAt: Date.now(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);
  };

  const updateActiveSession = () => {
    if (!activeSessionId) return;
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              className: className.trim() || s.className,
              startDate,
              numDays,
              students,
              attendance,
              updatedAt: Date.now(),
            }
          : s
      )
    );
  };

  const loadSession = (session: AttendanceSession) => {
    setClassName(session.className);
    setStartDate(session.startDate);
    setNumDays(session.numDays);
    setStudents(session.students);
    setAttendance(session.attendance);
    setActiveSessionId(session.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this saved session?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    }
  };

  const clearAllSessions = () => {
    if (confirm('Are you sure you want to delete all saved sessions?')) {
      setSessions([]);
      setActiveSessionId(null);
    }
  };

  const resetWorkspace = () => {
    if (confirm('Reset workspace? This will clear current changes.')) {
      setClassName('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setNumDays('5');
      setStudents([
        { id: genId(), name: '' },
        { id: genId(), name: '' },
      ]);
      setAttendance({});
      setActiveSessionId(null);
    }
  };

  const activeSessionName = useMemo(() => {
    if (!activeSessionId) return null;
    return sessions.find(s => s.id === activeSessionId)?.className || null;
  }, [activeSessionId, sessions]);

  const exportCSV = () => {
    const header = ['Student Name', ...dateRange, 'Present Days', 'Total Days'];
    const rows = students.filter(s => s.name.trim()).map(s => {
      const presentCount = getAttendanceCount(s.id);
      return [
        s.name,
        ...dateRange.map(d => (attendance[s.id]?.[d] ? 'P' : 'A')),
        presentCount.toString(),
        dateRange.length.toString(),
      ];
    });
    const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${className || 'Attendance'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Setup & Session Log */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-bold">Attendance Setup</CardTitle>
              {(className || students.some(s => s.name.trim())) && (
                <Button variant="ghost" size="sm" onClick={resetWorkspace} className="h-8 text-xs text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="class-name">Class / Team Name</Label>
                  <Input
                    id="class-name"
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    placeholder="Math 101"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="mt-1 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="num-days">Number of Days</Label>
                    <Input
                      id="num-days"
                      type="number"
                      min={1}
                      max={31}
                      value={numDays}
                      onChange={e => setNumDays(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Label className="mb-2 block">Student / Member Names</Label>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 mb-2">
                  {students.map((s, index) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <Input
                        value={s.name}
                        onChange={e => updateStudentName(s.id, e.target.value)}
                        placeholder={`Student ${index + 1}`}
                        className="flex-1"
                      />
                      {students.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeStudent(s.id)} className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addStudent} className="w-full mt-1 border-dashed hover:border-solid">
                  <Plus className="w-4 h-4 mr-1" /> Add Student
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Log Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Session Log
              </CardTitle>
              {sessions.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllSessions} className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Active Session Status & Save actions */}
              <div className="space-y-2">
                {activeSessionId && activeSessionName ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs mb-3 space-y-2">
                    <p className="text-muted-foreground">
                      Active: <span className="font-semibold text-foreground">{activeSessionName}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={updateActiveSession} size="sm" className="flex-1 text-xs h-8 gap-1">
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </Button>
                      <Button onClick={saveNewSession} variant="outline" size="sm" className="flex-1 text-xs h-8 gap-1">
                        <Plus className="w-3.5 h-3.5" /> Save As New
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={saveNewSession} className="w-full text-xs h-9 gap-1.5 shadow-sm">
                    <Save className="w-4 h-4" /> Save Current Sheet
                  </Button>
                )}
              </div>

              {/* Saved Sessions list */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {sessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                    No sessions saved yet. Save your current setup for future use.
                  </p>
                ) : (
                  sessions.map(s => {
                    const isActive = s.id === activeSessionId;
                    const validStudentCount = s.students.filter(st => st.name.trim()).length;
                    return (
                      <div
                        key={s.id}
                        onClick={() => loadSession(s)}
                        className={`group flex items-center justify-between border rounded-lg p-2.5 text-left cursor-pointer transition-all hover:shadow-sm ${
                          isActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border/60 hover:border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <p className="font-semibold text-xs leading-none truncate text-foreground group-hover:text-primary transition-colors">
                            {s.className}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <span>{validStudentCount} {validStudentCount === 1 ? 'student' : 'students'}</span>
                            <span>•</span>
                            <span>{s.numDays} days</span>
                          </p>
                          <p className="text-[9px] text-muted-foreground/85">
                            {new Date(s.updatedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => deleteSession(s.id, e)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-70 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Attendance Grid */}
        <div className="lg:col-span-2 space-y-6">
          {students.some(s => s.name.trim()) ? (
            <Card className="border border-border/80 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-bold">Attendance Grid</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportCSV} className="h-8 text-xs gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto border rounded-lg max-h-[500px]">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="text-left p-3 border-b font-semibold sticky left-0 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 min-w-[120px]">
                          Student Name
                        </th>
                        {dateRange.map(d => (
                          <th key={d} className="p-3 border-b border-l text-center font-semibold min-w-[70px] whitespace-nowrap">
                            {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </th>
                        ))}
                        <th className="p-3 border-b border-l text-center font-semibold bg-muted/20 min-w-[70px]">
                          Present
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.name.trim()).map(s => (
                        <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 border-b font-medium sticky left-0 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 truncate max-w-[150px]">
                            {s.name}
                          </td>
                          {dateRange.map(d => {
                            const isPresent = attendance[s.id]?.[d] ?? false;
                            return (
                              <td key={d} className="p-3 border-b border-l text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleAttendance(s.id, d)}
                                  className={`w-7 h-7 rounded-md text-xs font-bold transition-all duration-200 border flex items-center justify-center mx-auto focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                    isPresent
                                      ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm hover:bg-emerald-600'
                                      : 'bg-background border-border/80 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                  }`}
                                >
                                  {isPresent ? 'P' : 'A'}
                                </button>
                              </td>
                            );
                          })}
                          <td className="p-3 border-b border-l text-center font-bold bg-muted/10">
                            <span className="text-foreground">{getAttendanceCount(s.id)}</span>
                            <span className="text-muted-foreground/60 font-normal">/{dateRange.length}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 px-1">
                  <span>Click on P/A button to toggle status.</span>
                  {activeSessionName && (
                    <span className="italic">Editing saved session: {activeSessionName}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-dashed p-12 text-center flex flex-col items-center justify-center shadow-sm min-h-[300px]">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-base font-bold mb-2">No Attendance Grid Generated</CardTitle>
              <p className="text-xs text-muted-foreground max-w-sm mb-4">
                To build your attendance tracker, enter a class/team name and fill in at least one student name in the setup card.
              </p>
            </Card>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
