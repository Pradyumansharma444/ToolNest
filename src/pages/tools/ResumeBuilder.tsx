import { useState, useEffect, useCallback, useMemo } from 'react';
import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { downloadBlob, uint8ToBlob } from '@/lib/utils';
import { Plus, Trash2, FileDown, Save, History, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const ACCENT_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#db2777', '#0891b2', '#4f46e5'];

interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    summary: string;
  };
  experience: { id: string; company: string; role: string; startDate: string; endDate: string; current: boolean; bullets: string[] }[];
  education: { id: string; institution: string; degree: string; field: string; startYear: string; endYear: string; gpa: string }[];
  skills: string[];
  projects: { id: string; name: string; description: string; link: string }[];
  certifications: { id: string; name: string; issuer: string; year: string }[];
}

interface ResumeSession {
  id: string;
  name: string;
  data: ResumeData;
  template: Template;
  accentColor: string;
  updatedAt: number;
}

const defaultData: ResumeData = {
  personal: { fullName: '', email: '', phone: '', location: '', website: '', linkedin: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

type Template = 'classic' | 'modern' | 'minimal' | 'creative';

function generateId() { return Math.random().toString(36).substring(2, 9); }

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const test = currentLine ? currentLine + ' ' + word : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export default function ResumeBuilder() {
  const tool = getToolById('resume-builder')!;

  // Restore states from localStorage on init with fallback for legacy key
  const [data, setData] = useState<ResumeData>(() => {
    try {
      const activeState = localStorage.getItem('resume_builder_active_state');
      if (activeState) return JSON.parse(activeState).data ?? defaultData;
      
      const legacy = localStorage.getItem('resume-builder-data');
      if (legacy) return { ...defaultData, ...JSON.parse(legacy) };
    } catch { /* ignore parse errors */ }
    return defaultData;
  });

  const [template, setTemplate] = useState<Template>(() => {
    try {
      const activeState = localStorage.getItem('resume_builder_active_state');
      if (activeState) return JSON.parse(activeState).template ?? 'classic';
    } catch { /* ignore parse errors */ }
    return 'classic';
  });

  const [accentColor, setAccentColor] = useState<string>(() => {
    try {
      const activeState = localStorage.getItem('resume_builder_active_state');
      if (activeState) return JSON.parse(activeState).accentColor ?? '#2563eb';
    } catch { /* ignore parse errors */ }
    return '#2563eb';
  });

  const [skillInput, setSkillInput] = useState('');

  const [sessions, setSessions] = useState<ResumeSession[]>(() => {
    try {
      const saved = localStorage.getItem('resume_builder_saved_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('resume_builder_active_session_id') || null;
    } catch { return null; }
  });

  // Auto-save active workspace state
  useEffect(() => {
    const state = { data, template, accentColor };
    localStorage.setItem('resume_builder_active_state', JSON.stringify(state));
  }, [data, template, accentColor]);

  // Sync saved sessions to localStorage
  useEffect(() => {
    localStorage.setItem('resume_builder_saved_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Sync active session ID to localStorage
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('resume_builder_active_session_id', activeSessionId);
    } else {
      localStorage.removeItem('resume_builder_active_session_id');
    }
  }, [activeSessionId]);

  const updatePersonal = (field: keyof ResumeData['personal'], value: string) => {
    setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { id: generateId(), company: '', role: '', startDate: '', endDate: '', current: false, bullets: [''] }] }));
  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setData(prev => ({ ...prev, experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e) }));
  };
  const removeExperience = (id: string) => setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  const addBullet = (expId: string) => {
    setData(prev => ({ ...prev, experience: prev.experience.map(e => e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e) }));
  };
  const updateBullet = (expId: string, idx: number, val: string) => {
    setData(prev => ({ ...prev, experience: prev.experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => i === idx ? val : b) } : e) }));
  };
  const removeBullet = (expId: string, idx: number) => {
    setData(prev => ({ ...prev, experience: prev.experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e) }));
  };

  const addEducation = () => setData(prev => ({ ...prev, education: [...prev.education, { id: generateId(), institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' }] }));
  const updateEducation = (id: string, field: string, value: string) => {
    setData(prev => ({ ...prev, education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e) }));
  };
  const removeEducation = (id: string) => setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));

  const addSkill = useCallback(() => {
    const s = skillInput.trim(); if (!s) return; setData(prev => ({ ...prev, skills: [...prev.skills, s] })); setSkillInput('');
  }, [skillInput]);
  const removeSkill = (idx: number) => setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));

  const addProject = () => setData(prev => ({ ...prev, projects: [...prev.projects, { id: generateId(), name: '', description: '', link: '' }] }));
  const updateProject = (id: string, field: string, value: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p) }));
  };
  const removeProject = (id: string) => setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));

  const addCert = () => setData(prev => ({ ...prev, certifications: [...prev.certifications, { id: generateId(), name: '', issuer: '', year: '' }] }));
  const updateCert = (id: string, field: string, value: string) => {
    setData(prev => ({ ...prev, certifications: prev.certifications.map(c => c.id === id ? { ...c, [field]: value } : c) }));
  };
  const removeCert = (id: string) => setData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }));

  const getTemplateStyle = () => {
    const base = { containerStyle: { fontFamily: 'sans-serif', color: '#1a1a1a', lineHeight: '1.5' }, headerStyle: {} };
    switch (template) {
      case 'classic': return {
        containerStyle: { ...base.containerStyle, fontFamily: 'Georgia, serif' },
        headerStyle: { borderBottom: `2px solid ${accentColor}`, paddingBottom: 4 }
      };
      case 'modern': return {
        containerStyle: { ...base.containerStyle, fontFamily: 'Inter, sans-serif' },
        headerStyle: { backgroundColor: accentColor, color: 'white', padding: '8px 12px', borderRadius: 4 }
      };
      case 'minimal': return {
        containerStyle: { ...base.containerStyle, fontFamily: 'Helvetica, sans-serif' },
        headerStyle: { borderBottom: `1px solid #ccc`, paddingBottom: 4, color: '#555' }
      };
      case 'creative': return {
        containerStyle: { ...base.containerStyle, fontFamily: 'system-ui, sans-serif' },
        headerStyle: { background: `linear-gradient(90deg, ${accentColor}, #f472b6)`, color: 'white', padding: '10px 14px', borderRadius: 6 }
      };
      default: return base;
    }
  };

  const { containerStyle, headerStyle } = getTemplateStyle();

  const handleDownloadPdf = async () => {
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    const margin = 50;
    let y = height - margin;

    const drawText = (text: string, size: number, bold = false, color = rgb(0, 0, 0)) => {
      const font = bold ? helveticaBold : helvetica;
      const lines = wrapText(text, font, size, width - 2 * margin);
      for (const line of lines) {
        if (y - size < margin) { page = pdfDoc.addPage([612, 792]); y = height - margin; }
        page.drawText(line, { x: margin, y: y - size, size, font, color });
        y -= size + 4;
      }
      return y;
    };

    const drawLine = () => {
      if (y < margin + 10) { page = pdfDoc.addPage([612, 792]); y = height - margin; }
      page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
      y -= 10;
    };

    if (data.personal.fullName) {
      y = drawText(data.personal.fullName, 24, true);
    }
    const contactParts = [data.personal.email, data.personal.phone, data.personal.location, data.personal.website].filter(Boolean);
    if (contactParts.length) {
      y = drawText(contactParts.join(' | '), 10, false, rgb(0.3, 0.3, 0.3));
    }
    y -= 8;
    drawLine();

    if (data.personal.summary) {
      drawText('Professional Summary', 14, true, rgb(0.2, 0.2, 0.2));
      y = drawText(data.personal.summary, 10);
      drawLine();
    }

    if (data.experience.length) {
      drawText('Experience', 14, true, rgb(0.2, 0.2, 0.2));
      for (const exp of data.experience) {
        if (!exp.company && !exp.role) continue;
        y = drawText(`${exp.role} at ${exp.company}`, 11, true);
        const dateStr = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
        y = drawText(dateStr, 9, false, rgb(0.4, 0.4, 0.4));
        for (const bullet of exp.bullets) {
          if (bullet.trim()) { y = drawText(`- ${bullet}`, 10); }
        }
        y -= 4;
      }
      drawLine();
    }

    if (data.education.length) {
      drawText('Education', 14, true, rgb(0.2, 0.2, 0.2));
      for (const edu of data.education) {
        if (!edu.institution) continue;
        y = drawText(`${edu.degree} in ${edu.field}`, 11, true);
        y = drawText(`${edu.institution}, ${edu.startYear} - ${edu.endYear}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`, 9, false, rgb(0.4, 0.4, 0.4));
        y -= 4;
      }
      drawLine();
    }

    if (data.skills.length) {
      drawText('Skills', 14, true, rgb(0.2, 0.2, 0.2));
      y = drawText(data.skills.join(', '), 10);
      drawLine();
    }

    if (data.projects.length) {
      drawText('Projects', 14, true, rgb(0.2, 0.2, 0.2));
      for (const proj of data.projects) {
        if (!proj.name) continue;
        y = drawText(proj.name, 11, true);
        if (proj.description) y = drawText(proj.description, 10);
        if (proj.link) y = drawText(proj.link, 9, false, rgb(0.3, 0.3, 0.7));
        y -= 4;
      }
      drawLine();
    }

    if (data.certifications.length) {
      drawText('Certifications', 14, true, rgb(0.2, 0.2, 0.2));
      for (const cert of data.certifications) {
        if (!cert.name) continue;
        y = drawText(`${cert.name} - ${cert.issuer} (${cert.year})`, 10);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const name = data.personal.fullName.trim() || 'Resume';
    downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), `Resume_${name.replace(/\s+/g, '_')}.pdf`);
  };

  const saveNewSession = () => {
    const defaultName = data.personal.fullName.trim() || `Resume ${new Date().toLocaleDateString()}`;
    const name = prompt('Enter a name for this resume session:', defaultName);
    if (name === null) return;

    const id = generateId();
    const newSession: ResumeSession = {
      id,
      name: name.trim() || defaultName,
      data,
      template,
      accentColor,
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
              name: data.personal.fullName.trim() || s.name,
              data,
              template,
              accentColor,
              updatedAt: Date.now(),
            }
          : s
      )
    );
  };

  const loadSession = (session: ResumeSession) => {
    setData(session.data);
    setTemplate(session.template);
    setAccentColor(session.accentColor);
    setActiveSessionId(session.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this saved resume session?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    }
  };

  const clearAllSessions = () => {
    if (confirm('Are you sure you want to delete all saved resume sessions?')) {
      setSessions([]);
      setActiveSessionId(null);
    }
  };

  const resetWorkspace = () => {
    if (confirm('Reset workspace? This will clear current changes.')) {
      setData(defaultData);
      setTemplate('classic');
      setAccentColor('#2563eb');
      setActiveSessionId(null);
    }
  };

  const activeSessionName = useMemo(() => {
    if (!activeSessionId) return null;
    return sessions.find(s => s.id === activeSessionId)?.name || null;
  }, [activeSessionId, sessions]);

  return (
    <ToolLayout tool={tool} className="max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Setup Forms */}
        <div className="lg:col-span-7 space-y-4">
          <Tabs defaultValue="personal">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="personal" className="text-xs sm:text-sm">Personal</TabsTrigger>
              <TabsTrigger value="experience" className="text-xs sm:text-sm">Experience</TabsTrigger>
              <TabsTrigger value="education" className="text-xs sm:text-sm">Education</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs sm:text-sm">Skills</TabsTrigger>
              <TabsTrigger value="projects" className="text-xs sm:text-sm">Projects</TabsTrigger>
              <TabsTrigger value="certifications" className="text-xs sm:text-sm">Certifications</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <Card className="border border-border/80 shadow-md">
                <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Full Name</Label><Input value={data.personal.fullName} onChange={e => updatePersonal('fullName', e.target.value)} placeholder="John Doe" className="mt-1" /></div>
                    <div><Label>Email</Label><Input value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} placeholder="john@example.com" className="mt-1" /></div>
                    <div><Label>Phone</Label><Input value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} placeholder="+1 555-1234" className="mt-1" /></div>
                    <div><Label>Location</Label><Input value={data.personal.location} onChange={e => updatePersonal('location', e.target.value)} placeholder="New York, NY" className="mt-1" /></div>
                    <div><Label>Website</Label><Input value={data.personal.website} onChange={e => updatePersonal('website', e.target.value)} placeholder="https://johndoe.com" className="mt-1" /></div>
                    <div><Label>LinkedIn</Label><Input value={data.personal.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" className="mt-1" /></div>
                  </div>
                  <div><Label>Professional Summary</Label><Textarea value={data.personal.summary} onChange={e => updatePersonal('summary', e.target.value)} placeholder="Brief professional summary..." rows={4} className="mt-1" /></div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4 mt-4">
              {data.experience.map(exp => (
                <Card key={exp.id} className="border border-border/80 shadow-md">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Experience Entry</span>
                      <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><Label>Company</Label><Input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="mt-1" /></div>
                      <div><Label>Role</Label><Input value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} className="mt-1" /></div>
                      <div><Label>Start Date</Label><Input value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Jan 2020" className="mt-1" /></div>
                      <div><Label>End Date</Label><Input value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" disabled={exp.current} className="mt-1" /></div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                      <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} className="rounded border-border/80 text-primary focus:ring-primary/20" />
                      Currently working here
                    </label>
                    <div className="space-y-2"><Label>Bullet Points</Label>
                      {exp.bullets.map((b, idx) => (
                        <div key={idx} className="flex gap-2 mt-1 items-center">
                          <Input value={b} onChange={e => updateBullet(exp.id, idx, e.target.value)} placeholder="Describe your achievement" className="text-xs flex-1" />
                          {exp.bullets.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeBullet(exp.id, idx)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></Button>}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addBullet(exp.id)} className="mt-2 text-xs border-dashed hover:border-solid"><Plus className="w-3 h-3 mr-1" />Add Bullet</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addExperience} size="sm" className="shadow-sm"><Plus className="w-4 h-4 mr-1" />Add Experience</Button>
            </TabsContent>

            <TabsContent value="education" className="space-y-4 mt-4">
              {data.education.map(edu => (
                <Card key={edu.id} className="border border-border/80 shadow-md">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Education Entry</span>
                      <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><Label>Institution</Label><Input value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} className="mt-1" /></div>
                      <div><Label>Degree</Label><Input value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Science" className="mt-1" /></div>
                      <div><Label>Field of Study</Label><Input value={edu.field} onChange={e => updateEducation(edu.id, 'field', e.target.value)} className="mt-1" /></div>
                      <div><Label>GPA</Label><Input value={edu.gpa} onChange={e => updateEducation(edu.id, 'gpa', e.target.value)} className="mt-1" /></div>
                      <div><Label>Start Year</Label><Input value={edu.startYear} onChange={e => updateEducation(edu.id, 'startYear', e.target.value)} className="mt-1" /></div>
                      <div><Label>End Year</Label><Input value={edu.endYear} onChange={e => updateEducation(edu.id, 'endYear', e.target.value)} className="mt-1" /></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addEducation} size="sm" className="shadow-sm"><Plus className="w-4 h-4 mr-1" />Add Education</Button>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4 mt-4">
              <Card className="border border-border/80 shadow-md">
                <CardContent className="pt-4">
                  <div className="flex gap-2 mb-4">
                    <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Type a skill and press enter or click +" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                    <Button onClick={addSkill} size="icon"><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs border">
                        {s}
                        <button onClick={() => removeSkill(idx)} className="text-muted-foreground hover:text-destructive transition-colors">&times;</button>
                      </span>
                    ))}
                    {data.skills.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center w-full py-4">No skills added yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4 mt-4">
              {data.projects.map(proj => (
                <Card key={proj.id} className="border border-border/80 shadow-md">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Project Entry</span>
                      <Button variant="ghost" size="sm" onClick={() => removeProject(proj.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><Label>Name</Label><Input value={proj.name} onChange={e => updateProject(proj.id, 'name', e.target.value)} className="mt-1" /></div>
                      <div><Label>Link</Label><Input value={proj.link} onChange={e => updateProject(proj.id, 'link', e.target.value)} placeholder="https://github.com/..." className="mt-1" /></div>
                    </div>
                    <div><Label>Description</Label><Textarea value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} rows={2} className="mt-1" /></div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addProject} size="sm" className="shadow-sm"><Plus className="w-4 h-4 mr-1" />Add Project</Button>
            </TabsContent>

            <TabsContent value="certifications" className="space-y-4 mt-4">
              {data.certifications.map(cert => (
                <Card key={cert.id} className="border border-border/80 shadow-md">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Certification Entry</span>
                      <Button variant="ghost" size="sm" onClick={() => removeCert(cert.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1"><Label>Name</Label><Input value={cert.name} onChange={e => updateCert(cert.id, 'name', e.target.value)} className="mt-1" /></div>
                      <div className="sm:col-span-1"><Label>Issuer</Label><Input value={cert.issuer} onChange={e => updateCert(cert.id, 'issuer', e.target.value)} className="mt-1" /></div>
                      <div className="sm:col-span-1"><Label>Year</Label><Input value={cert.year} onChange={e => updateCert(cert.id, 'year', e.target.value)} className="mt-1" /></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={addCert} size="sm" className="shadow-sm"><Plus className="w-4 h-4 mr-1" />Add Certification</Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: Session Log, Style settings & Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Workspace / Reset Header & Download */}
          <div className="flex gap-2 justify-between items-center bg-card p-4 rounded-xl border border-border/80 shadow-md">
            <Button onClick={handleDownloadPdf} className="flex-1 gap-2 shadow-sm font-semibold h-10">
              <FileDown className="w-4 h-4" /> Download PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={resetWorkspace} className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          </div>

          {/* Session Log Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-primary" />
                Resume Session Log
              </CardTitle>
              {sessions.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllSessions} className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Save actions */}
              <div className="space-y-2">
                {activeSessionId && activeSessionName ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-2">
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
                    <Save className="w-4 h-4" /> Save Current Resume
                  </Button>
                )}
              </div>

              {/* Saved Sessions list */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {sessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                    No resumes saved yet. Save current resume to switch between multiple files.
                  </p>
                ) : (
                  sessions.map(s => {
                    const isActive = s.id === activeSessionId;
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
                            {s.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <span className="capitalize">{s.template}</span>
                            <span>•</span>
                            <span>{new Date(s.updatedAt).toLocaleDateString()}</span>
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

          {/* Template & Style Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Template & Style</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Select Template</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {(['classic', 'modern', 'minimal', 'creative'] as Template[]).map(t => (
                    <button key={t} onClick={() => setTemplate(t)} className={`p-2 rounded-lg border text-xs capitalize transition-all ${template === t ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-semibold text-primary' : 'hover:border-muted-foreground'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Accent Color</Label>
                <div className="flex gap-2 mt-1.5 flex-wrap items-center">
                  {ACCENT_COLORS.map(c => (
                    <button key={c} onClick={() => setAccentColor(c)} className={`w-6 h-6 rounded-full border-2 ${accentColor === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                  <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-20 h-7 text-[10px] px-2 ml-1" placeholder="#hex" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Live Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-lg p-5 bg-white text-black shadow-inner max-h-[600px] overflow-y-auto" style={containerStyle}>
                {data.personal.fullName && <h2 className="text-xl font-bold mb-1" style={headerStyle}>{data.personal.fullName}</h2>}
                <div className="text-[10px] text-gray-500 mb-2">
                  {[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(' | ')}
                </div>
                {data.personal.website && <div className="text-[10px] text-blue-600 mb-2">{data.personal.website}</div>}
                {data.personal.summary && <p className="text-xs mb-3">{data.personal.summary}</p>}

                {data.experience.length > 0 && (
                  <div className="mb-3">
                    <h3 className="font-bold text-xs border-b mb-2" style={{ borderColor: accentColor }}>Experience</h3>
                    {data.experience.map(exp => (
                      <div key={exp.id} className="mb-2">
                        <div className="font-semibold text-xs">{exp.role} at {exp.company}</div>
                        <div className="text-[10px] text-gray-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                        {exp.bullets.map((b, i) => b.trim() && <li key={i} className="text-xs ml-4">{b}</li>)}
                      </div>
                    ))}
                  </div>
                )}

                {data.education.length > 0 && (
                  <div className="mb-3">
                    <h3 className="font-bold text-xs border-b mb-2" style={{ borderColor: accentColor }}>Education</h3>
                    {data.education.map(edu => (
                      <div key={edu.id} className="mb-1">
                        <div className="font-semibold text-xs">{edu.degree} in {edu.field}</div>
                        <div className="text-[10px] text-gray-500">{edu.institution}, {edu.startYear} - {edu.endYear}{edu.gpa && ` | GPA: ${edu.gpa}`}</div>
                      </div>
                    ))}
                  </div>
                )}

                {data.skills.length > 0 && (
                  <div className="mb-3">
                    <h3 className="font-bold text-xs border-b mb-2" style={{ borderColor: accentColor }}>Skills</h3>
                    <div className="text-xs">{data.skills.join(', ')}</div>
                  </div>
                )}

                {data.projects.length > 0 && (
                  <div className="mb-3">
                    <h3 className="font-bold text-xs border-b mb-2" style={{ borderColor: accentColor }}>Projects</h3>
                    {data.projects.map(proj => (
                      <div key={proj.id} className="mb-1">
                        <div className="font-semibold text-xs">{proj.name}</div>
                        <div className="text-xs">{proj.description}</div>
                        {proj.link && <div className="text-xs text-blue-600">{proj.link}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {data.certifications.length > 0 && (
                  <div className="mb-3">
                    <h3 className="font-bold text-xs border-b mb-2" style={{ borderColor: accentColor }}>Certifications</h3>
                    {data.certifications.map(cert => (
                      <div key={cert.id} className="text-xs">{cert.name} - {cert.issuer} ({cert.year})</div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}
