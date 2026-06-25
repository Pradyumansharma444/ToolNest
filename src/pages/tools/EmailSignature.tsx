import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function EmailSignature() {
  const tool = getToolById('email-signature')!;
  const { toast } = useToast();
  const [name, setName] = useState('John Doe');
  const [role, setRole] = useState('Software Engineer');
  const [company, setCompany] = useState('Acme Inc.');
  const [email, setEmail] = useState('john@example.com');
  const [phone, setPhone] = useState('+1 555-1234');
  const [copied, setCopied] = useState(false);

  const html = `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333"><tr><td style="padding-right:15px;border-right:2px solid #ddd"><img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=6366f1&color=fff" width="80" height="80" style="border-radius:8px" /></td><td style="padding-left:15px"><p style="margin:0;font-size:16px;font-weight:bold;color:#333">${name}</p><p style="margin:4px 0;color:#666">${role} at ${company}</p><p style="margin:4px 0;color:#888;font-size:13px">${email} | ${phone}</p><p style="margin:8px 0 0"><a href="https://${company.toLowerCase().replace(/\s/g,'')}.com" style="color:#6366f1;text-decoration:none;font-size:13px">${company.toLowerCase().replace(/\s/g,'')}.com</a></p></td></tr></table>`;

  const copy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast({ title: 'HTML signature copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div><label className="text-sm text-muted-foreground">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="text-sm text-muted-foreground">Role</label><Input value={role} onChange={(e) => setRole(e.target.value)} /></div>
          <div><label className="text-sm text-muted-foreground">Company</label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          <div><label className="text-sm text-muted-foreground">Email</label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="text-sm text-muted-foreground">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex justify-between mb-2"><span className="font-medium text-sm">Preview</span><Button size="sm" variant="ghost" onClick={copy}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <span className="text-sm text-muted-foreground block mb-2">HTML Code</span>
          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">{html}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
