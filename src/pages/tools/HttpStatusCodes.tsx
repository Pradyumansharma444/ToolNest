import { useState, useMemo } from 'react';
import { Search, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const STATUS_CODES = [
  { code: 100, name: 'Continue', category: '1xx', desc: 'The server has received the request headers and the client should proceed to send the body.' },
  { code: 101, name: 'Switching Protocols', category: '1xx', desc: 'The requester has asked the server to switch protocols and the server has agreed.' },
  { code: 200, name: 'OK', category: '2xx', desc: 'The request was successful.' },
  { code: 201, name: 'Created', category: '2xx', desc: 'The request was fulfilled and a new resource was created.' },
  { code: 202, name: 'Accepted', category: '2xx', desc: 'The request has been accepted for processing, but processing is not yet complete.' },
  { code: 204, name: 'No Content', category: '2xx', desc: 'The server successfully processed the request but is not returning any content.' },
  { code: 301, name: 'Moved Permanently', category: '3xx', desc: 'The requested resource has been permanently moved to a new URL.' },
  { code: 302, name: 'Found', category: '3xx', desc: 'The requested resource has been temporarily moved to a new URL.' },
  { code: 304, name: 'Not Modified', category: '3xx', desc: 'The cached version of the resource is still valid.' },
  { code: 400, name: 'Bad Request', category: '4xx', desc: 'The server could not understand the request due to invalid syntax.' },
  { code: 401, name: 'Unauthorized', category: '4xx', desc: 'Authentication is required and has failed or not been provided.' },
  { code: 403, name: 'Forbidden', category: '4xx', desc: 'The server understood the request but refuses to authorize it.' },
  { code: 404, name: 'Not Found', category: '4xx', desc: 'The server could not find the requested resource.' },
  { code: 405, name: 'Method Not Allowed', category: '4xx', desc: 'The request method is not supported for the requested resource.' },
  { code: 408, name: 'Request Timeout', category: '4xx', desc: 'The server timed out waiting for the request.' },
  { code: 409, name: 'Conflict', category: '4xx', desc: 'The request conflicts with the current state of the server.' },
  { code: 410, name: 'Gone', category: '4xx', desc: 'The requested resource is no longer available.' },
  { code: 422, name: 'Unprocessable Entity', category: '4xx', desc: 'The request was well-formed but was unable to be followed due to semantic errors.' },
  { code: 429, name: 'Too Many Requests', category: '4xx', desc: 'The user has sent too many requests in a given amount of time.' },
  { code: 500, name: 'Internal Server Error', category: '5xx', desc: 'The server encountered an unexpected condition that prevented it from fulfilling the request.' },
  { code: 501, name: 'Not Implemented', category: '5xx', desc: 'The server does not support the functionality required to fulfill the request.' },
  { code: 502, name: 'Bad Gateway', category: '5xx', desc: 'The server received an invalid response from the upstream server.' },
  { code: 503, name: 'Service Unavailable', category: '5xx', desc: 'The server is currently unable to handle the request due to temporary overloading or maintenance.' },
  { code: 504, name: 'Gateway Timeout', category: '5xx', desc: 'The upstream server failed to send a timely response.' },
];

const CATEGORIES = [
  { key: '1xx', label: 'Informational', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { key: '2xx', label: 'Successful', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { key: '3xx', label: 'Redirection', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { key: '4xx', label: 'Client Error', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  { key: '5xx', label: 'Server Error', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
];

export default function HttpStatusCodes() {
  const tool = getToolById('http-status-codes')!;
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return STATUS_CODES;
    const q = search.toLowerCase();
    return STATUS_CODES.filter(s => s.code.toString().includes(q) || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));
  }, [search]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof STATUS_CODES> = {};
    CATEGORIES.forEach(c => map[c.key] = []);
    filtered.forEach(s => { if (map[s.category]) map[s.category].push(s); });
    return map;
  }, [filtered]);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code, name, or description..." className="pl-9" />
        </div>
        <div className="space-y-6">
          {CATEGORIES.map(cat => {
            const codes = grouped[cat.key];
            if (!codes.length) return null;
            return (
              <div key={cat.key}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`${cat.color} rounded-md px-3 py-1`}>{cat.key}</Badge>
                  <span className="text-sm font-medium text-muted-foreground">{cat.label}</span>
                  <span className="text-xs text-muted-foreground">({codes.length})</span>
                </div>
                <div className="space-y-1">
                  {codes.map(s => (
                    <div key={s.code} className="flex items-start gap-3 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors">
                      <span className="font-mono font-bold text-lg min-w-[3rem]">{s.code}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-sm text-muted-foreground">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Info className="w-8 h-8" />
            <p>No status codes match your search.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
