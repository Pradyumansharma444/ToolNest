import { useState, useMemo } from 'react';
import { AlertTriangle, Sparkles, Hash, Type, BarChart3 } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const POWER_WORDS = [
  'free', 'exclusive', 'limited', 'urgent', 'instant', 'amazing', 'guaranteed',
  'proven', 'secret', 'powerful', 'essential', 'unlock', 'bonus', 'save',
  'new', 'now', 'today', 'last chance', 'don\'t miss', 'alert', 'announcing',
  'breakthrough', 'complete', 'easy', 'fast', 'huge', 'join', 'offer',
];

const SPAM_WORDS = [
  'act now', 'click here', 'free money', 'no obligation', 'congratulations',
  'you\'re a winner', 'limited time', 'buy now', 'order now', 'cash',
  'earn money', 'extra income', 'financial freedom', 'guaranteed', 'million dollars',
  'risk free', 'trial', 'unlimited', 'work from home', 'winner',
];

function countEmojis(s: string): number {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  return (s.match(emojiRegex) || []).length;
}

export default function EmailSubjectTester() {
  const tool = getToolById('email-subject-tester')!;
  const [subject, setSubject] = useState('');

  const analysis = useMemo(() => {
    const s = subject;
    const len = s.length;
    const words = s.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    let score = 50;
    const tips: string[] = [];

    // Length scoring
    if (len >= 30 && len <= 60) { score += 20; tips.push('Great length: 30-60 characters is ideal.'); }
    else if (len >= 20 && len < 30) { score += 10; tips.push('Good length. Try adding more context.'); }
    else if (len > 60) { score -= 10; tips.push('Subject line is too long. Keep it under 60 characters.'); }
    else if (len < 20 && len > 0) { score -= 5; tips.push('Subject is quite short. Add more detail.'); }

    // Capitalization
    const isAllCaps = s === s.toUpperCase() && s.length > 3;
    if (isAllCaps) { score -= 15; tips.push('Avoid ALL CAPS — it looks like shouting.'); }

    // First word capitalized
    if (s.length > 0 && s[0] === s[0].toUpperCase()) { score += 5; }
    else if (s.length > 0) { tips.push('Capitalize the first word of your subject line.'); }

    // Power words
    const powerCount = POWER_WORDS.filter(w => s.toLowerCase().includes(w)).length;
    if (powerCount >= 2) { score += 15; tips.push('Good use of power words!'); }
    else if (powerCount === 1) { score += 5; tips.push('Consider adding more power words.'); }
    else if (wordCount > 0) { tips.push('Add power words like "exclusive" or "limited".'); }

    // Spam words
    const spamCount = SPAM_WORDS.filter(w => s.toLowerCase().includes(w)).length;
    if (spamCount > 0) { score -= spamCount * 10; tips.push(`Reduce spam words (found ${spamCount}).`); }

    // Emojis
    const emojiCount = countEmojis(s);
    if (emojiCount === 1) { score += 10; tips.push('One emoji can boost open rates. Nice!'); }
    else if (emojiCount > 1) { score -= 5; tips.push('Stick to 0-1 emojis for best results.'); }

    // Question format
    if (s.includes('?')) { score += 5; tips.push('Questions can increase curiosity.'); }

    // Personalization hint
    if (s.toLowerCase().includes('{{') || s.toLowerCase().includes('{name}') || s.toLowerCase().includes('[name]')) {
      score += 10; tips.push('Personalization tokens detected — great for engagement!');
    }

    score = Math.max(0, Math.min(100, score));

    const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F';
    const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';

    return {
      score,
      grade,
      color,
      tips,
      wordCount: wordCount,
      charCount: len,
      powerCount,
      spamCount,
      emojiCount,
      isAllCaps,
    };
  }, [subject]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Test Your Subject Line</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email Subject Line</Label>
              <Input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Enter your email subject line here..."
                className="text-base"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border p-3">
                <Type className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{analysis.charCount}</p>
                <p className="text-xs text-muted-foreground">Characters</p>
              </div>
              <div className="rounded-lg border p-3">
                <Hash className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{analysis.wordCount}</p>
                <p className="text-xs text-muted-foreground">Words</p>
              </div>
              <div className="rounded-lg border p-3">
                <BarChart3 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{analysis.powerCount}</p>
                <p className="text-xs text-muted-foreground">Power Words</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className={`text-6xl font-black ${analysis.color}`}>{analysis.grade}</div>
              <div className="text-3xl font-bold mt-2">{analysis.score}<span className="text-base font-normal text-muted-foreground">/100</span></div>
              {analysis.isAllCaps && (
                <div className="flex items-center justify-center gap-1 text-xs text-red-500 mt-2">
                  <AlertTriangle className="w-3 h-3" /> ALL CAPS detected
                </div>
              )}
              {analysis.spamCount > 0 && (
                <div className="flex items-center justify-center gap-1 text-xs text-amber-500 mt-1">
                  <AlertTriangle className="w-3 h-3" /> {analysis.spamCount} spam word(s) found
                </div>
              )}
              {analysis.emojiCount > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {analysis.emojiCount} emoji(s) used
                </div>
              )}
            </CardContent>
          </Card>

          {analysis.tips.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4" /> Tips to Improve</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {analysis.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
