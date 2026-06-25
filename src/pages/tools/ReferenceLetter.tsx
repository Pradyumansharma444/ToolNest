import { useState, useMemo } from 'react';
import { FileDown } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SKILL_OPTIONS = [
  'Leadership', 'Communication', 'Problem Solving', 'Teamwork',
  'Time Management', 'Project Management', 'Technical Expertise',
  'Creativity', 'Adaptability', 'Attention to Detail', 'Customer Service',
  'Strategic Thinking', 'Analytical Skills', 'Mentoring',
];

export default function ReferenceLetter() {
  const tool = getToolById('reference-letter')!;
  const [employeeName, setEmployeeName] = useState('');
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [relationshipLength, setRelationshipLength] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const preview = useMemo(() => {
    return `[Date: ${new Date().toLocaleDateString()}]

RE: Reference Letter for ${employeeName || '[Employee Name]'}

To Whom It May Concern,

I am writing to enthusiastically recommend ${employeeName || '[Employee Name]'}, who has worked with us as a ${position || '[Position]'} at ${company || '[Company]'} for ${relationshipLength || '[X years/months]'}.

During their time with us, ${employeeName || 'they'} has demonstrated exceptional skills in the following areas:

${selectedSkills.length > 0 ? selectedSkills.map(s => `- ${s}`).join('\n') : '- [List relevant skills]'}

${additionalNotes ? `\n${additionalNotes}\n` : ''}

${employeeName || '[Employee Name]'} would be a valuable asset to any organization. I give them my highest recommendation.

Sincerely,

[Your Name]
[Your Title]
${company || '[Company]'}
[Contact Information]`;
  }, [employeeName, position, company, relationshipLength, selectedSkills, additionalNotes]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Reference Letter Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Employee Name</Label>
              <Input value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div>
              <Label>Position / Role</Label>
              <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="Senior Developer" />
            </div>
            <div>
              <Label>Company Name</Label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc." />
            </div>
            <div>
              <Label>Length of Relationship</Label>
              <Input value={relationshipLength} onChange={e => setRelationshipLength(e.target.value)} placeholder="3 years" />
            </div>
            <div>
              <Label>Skills & Qualities</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SKILL_OPTIONS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card hover:border-muted-foreground'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Additional Notes</Label>
              <Textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} placeholder="Specific achievements or qualities..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Letter Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white text-xs whitespace-pre-wrap leading-relaxed">
              {preview}
            </div>
            <Button className="mt-4" disabled>
              <FileDown className="w-4 h-4 mr-2" />Download PDF (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
