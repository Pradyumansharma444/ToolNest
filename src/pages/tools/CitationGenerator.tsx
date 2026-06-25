import { useState, useMemo, useEffect } from 'react';
import { BookOpen, Globe, FileText, Plus, Trash2, Copy, Check, Download, BookmarkPlus } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Author {
  firstName: string;
  middleInitial: string;
  lastName: string;
  isOrg: boolean;
  orgName: string;
}

interface SavedCitation {
  id: string;
  formattedText: string;
  inText: string;
  sourceType: string;
  style: string;
}

export default function CitationGenerator() {
  const tool = getToolById('citation-generator')!;

  // Citation Style & Source Type
  const [style, setStyle] = useState<'apa' | 'mla' | 'chicago'>('apa');
  const [sourceType, setSourceType] = useState<'book' | 'website' | 'journal'>('book');

  // Authors State
  const [authors, setAuthors] = useState<Author[]>([
    { firstName: '', middleInitial: '', lastName: '', isOrg: false, orgName: '' },
  ]);

  // Source-Specific States
  // Book
  const [bookTitle, setBookTitle] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookYear, setBookYear] = useState('');
  const [bookVolume, setBookVolume] = useState('');

  // Website
  const [webPageTitle, setWebPageTitle] = useState('');
  const [webSiteName, setWebSiteName] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [webPubDay, setWebPubDay] = useState('');
  const [webPubMonth, setWebPubMonth] = useState('');
  const [webPubYear, setWebPubYear] = useState('');
  const [webAccessDate, setWebAccessDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Journal
  const [journalTitle, setJournalTitle] = useState('');
  const [journalName, setJournalName] = useState('');
  const [journalVol, setJournalVol] = useState('');
  const [journalIssue, setJournalIssue] = useState('');
  const [journalPages, setJournalPages] = useState('');
  const [journalYear, setJournalYear] = useState('');
  const [journalDoi, setJournalDoi] = useState('');

  // List of saved citations (persisted in localStorage)
  const [savedCitations, setSavedCitations] = useState<SavedCitation[]>([]);

  // Clipboard feedbacks
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedInText, setCopiedInText] = useState(false);
  const [copiedBib, setCopiedBib] = useState(false);

  // Load saved citations
  useEffect(() => {
    const stored = localStorage.getItem('saved-citations');
    if (stored) {
      try {
        setSavedCitations(JSON.parse(stored)); // eslint-disable-line react-hooks/set-state-in-effect
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save citations
  const saveCitationsToStorage = (list: SavedCitation[]) => {
    setSavedCitations(list);
    localStorage.setItem('saved-citations', JSON.stringify(list));
  };

  // Author Management
  const addAuthor = () => {
    setAuthors([...authors, { firstName: '', middleInitial: '', lastName: '', isOrg: false, orgName: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, idx) => idx !== index));
    } else {
      setAuthors([{ firstName: '', middleInitial: '', lastName: '', isOrg: false, orgName: '' }]);
    }
  };

  const updateAuthor = (index: number, field: keyof Author, value: string | boolean) => {
    const next = [...authors];
    next[index] = { ...next[index], [field]: value };
    setAuthors(next);
  };

  // Helper to format authors list
  const formatAuthors = (styleName: 'apa' | 'mla' | 'chicago') => {
    const validAuthors = authors.filter(a => a.isOrg ? a.orgName.trim() !== '' : a.lastName.trim() !== '');
    if (validAuthors.length === 0) return '';

    const getAuthorString = (a: Author, index: number, isFirst: boolean) => {
      if (a.isOrg) return a.orgName.trim();
      
      const last = a.lastName.trim();
      const first = a.firstName.trim();
      const middle = a.middleInitial.trim() ? ` ${a.middleInitial.trim()}.` : '';

      if (styleName === 'apa') {
        // APA format: Lastname, F. M.
        const firstInit = first ? `${first.charAt(0)}.` : '';
        return `${last}, ${firstInit}${middle}`.trim();
      } else if (styleName === 'mla') {
        // MLA format: First author is Lastname, Firstname. Subsequent are Firstname Lastname.
        if (isFirst) {
          return `${last}, ${first}${middle ? ' ' + middle : ''}`.trim();
        } else {
          return `${first} ${last}`.trim();
        }
      } else {
        // Chicago format: First author is Lastname, Firstname. Subsequent are Firstname Lastname.
        if (isFirst) {
          return `${last}, ${first}${middle ? ' ' + middle : ''}`.trim();
        } else {
          return `${first} ${last}`.trim();
        }
      }
    };

    if (validAuthors.length === 1) {
      return getAuthorString(validAuthors[0]!, 0, true);
    }

    if (styleName === 'apa') {
      if (validAuthors.length <= 7) {
        const parts = validAuthors.map((a, i) => getAuthorString(a, i, i === 0));
        const lastPart = parts.pop();
        return `${parts.join(', ')}, & ${lastPart}`;
      } else {
        const parts = validAuthors.slice(0, 6).map((a, i) => getAuthorString(a, i, i === 0));
        const lastPart = getAuthorString(validAuthors[validAuthors.length - 1]!, validAuthors.length - 1, false);
        return `${parts.join(', ')}, ... ${lastPart}`;
      }
    } else if (styleName === 'mla') {
      if (validAuthors.length === 2) {
        return `${getAuthorString(validAuthors[0]!, 0, true)}, and ${getAuthorString(validAuthors[1]!, 1, false)}`;
      } else {
        return `${getAuthorString(validAuthors[0]!, 0, true)}, et al.`;
      }
    } else {
      // Chicago
      if (validAuthors.length === 2) {
        return `${getAuthorString(validAuthors[0]!, 0, true)} and ${getAuthorString(validAuthors[1]!, 1, false)}`;
      } else if (validAuthors.length === 3) {
        return `${getAuthorString(validAuthors[0]!, 0, true)}, ${getAuthorString(validAuthors[1]!, 1, false)}, and ${getAuthorString(validAuthors[2]!, 2, false)}`;
      } else {
        return `${getAuthorString(validAuthors[0]!, 0, true)} et al.`;
      }
    }
  };

  // Primary formatting engine
  const citationResult = useMemo(() => {
    const authorText = formatAuthors(style);
    const hasAuthor = authorText.length > 0;
    
    // In-text calculation
    let inTextVal = '';
    const validAuthors = authors.filter(a => a.isOrg ? a.orgName.trim() !== '' : a.lastName.trim() !== '');
    let shortName = 'Unknown';
    if (validAuthors.length > 0) {
      if (validAuthors[0]!.isOrg) {
        shortName = validAuthors[0]!.orgName;
      } else {
        shortName = validAuthors[0]!.lastName;
      }
      if (validAuthors.length === 2) {
        const nextName = validAuthors[1]!.isOrg ? validAuthors[1]!.orgName : validAuthors[1]!.lastName;
        shortName += style === 'apa' ? ` & ${nextName}` : ` and ${nextName}`;
      } else if (validAuthors.length > 2) {
        shortName += ' et al.';
      }
    }

    if (sourceType === 'book') {
      const title = bookTitle.trim() || 'Untitled Book';
      const pub = bookPublisher.trim() || 'Publisher';
      const yr = bookYear.trim() || 'n.d.';
      const vol = bookVolume.trim() ? `, Vol. ${bookVolume.trim()}` : '';

      if (style === 'apa') {
        // Lastname, F. (Year). Title of book. Publisher.
        inTextVal = `(${shortName}, ${yr})`;
        return {
          formatted: `${hasAuthor ? authorText + ' ' : ''}(${yr}). *${title}*${vol}. ${pub}.`,
          inText: inTextVal,
        };
      } else if (style === 'mla') {
        // Lastname, Firstname. Title of Book. Publisher, Year.
        inTextVal = `(${shortName})`;
        return {
          formatted: `${hasAuthor ? authorText + '. ' : ''}*${title}*${vol}. ${pub}, ${yr}.`,
          inText: inTextVal,
        };
      } else {
        // Chicago: Lastname, Firstname. Year. Title of Book. Publisher.
        inTextVal = `(${shortName} ${yr})`;
        return {
          formatted: `${hasAuthor ? authorText + '. ' : ''}${yr}. *${title}*${vol}. ${pub}.`,
          inText: inTextVal,
        };
      }
    } else if (sourceType === 'website') {
      const pageTitle = webPageTitle.trim() || 'Page Title';
      const siteName = webSiteName.trim() || 'Website Name';
      const url = webUrl.trim() || 'http://example.com';
      
      const day = webPubDay.trim();
      const month = webPubMonth.trim();
      const yr = webPubYear.trim() || 'n.d.';
      
      // Formatting date parts
      const fullDateAPA = yr !== 'n.d.' ? `${yr}${month ? ', ' + month : ''}${day ? ' ' + day : ''}` : 'n.d.';
      const fullDateMLA = `${day ? day + ' ' : ''}${month ? month + ' ' : ''}${yr !== 'n.d.' ? yr : ''}`.trim() || 'n.d.';
      
      if (style === 'apa') {
        // Lastname, F. (Year, Month Day). Page title. Website Name. URL
        inTextVal = `(${shortName}, ${yr})`;
        return {
          formatted: `${hasAuthor ? authorText + ' ' : ''}(${fullDateAPA}). *${pageTitle}*. ${siteName}. ${url}`,
          inText: inTextVal,
        };
      } else if (style === 'mla') {
        // Author. "Page Title." Website Name, Day Month Year, URL. Accessed Day Month Year.
        inTextVal = `(${shortName})`;
        
        let formattedAccess = '';
        if (webAccessDate) {
          const accDate = new Date(webAccessDate);
          const formattedAcc = accDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
          formattedAccess = ` Accessed ${formattedAcc}.`;
        }

        return {
          formatted: `${hasAuthor ? authorText + '. ' : ''}"${pageTitle}." *${siteName}*, ${fullDateMLA || 'n.d.'}, ${url}.${formattedAccess}`,
          inText: inTextVal,
        };
      } else {
        // Chicago: Author. Year. "Page Title." Website Name. Month Day, Year. URL.
        inTextVal = `(${shortName} ${yr})`;
        return {
          formatted: `${hasAuthor ? authorText + '. ' : ''}${yr}. "${pageTitle}." *${siteName}*. ${url}`,
          inText: inTextVal,
        };
      }
    } else {
      // Journal
      const artTitle = journalTitle.trim() || 'Article Title';
      const jName = journalName.trim() || 'Journal Name';
      const vol = journalVol.trim();
      const issue = journalIssue.trim();
      const pages = journalPages.trim();
      const yr = journalYear.trim() || 'n.d.';
      const doi = journalDoi.trim();

      if (style === 'apa') {
        // Lastname, F. M. (Year). Title of article. Title of Journal, Volume(Issue), pages. DOI/URL
        let volIssue = '';
        if (vol) {
          volIssue = ` *${vol}*`;
          if (issue) volIssue += `(${issue})`;
        }
        const pgString = pages ? `, ${pages}` : '';
        const doiString = doi ? `. ${doi}` : '';
        inTextVal = `(${shortName}, ${yr})`;

        return {
          formatted: `${hasAuthor ? authorText + ' ' : ''}(${yr}). ${artTitle}. *${jName}*${volIssue}${pgString}${doiString}`,
          inText: inTextVal,
        };
      } else if (style === 'mla') {
        // Lastname, Firstname. "Title of Article." Title of Journal, vol. Volume, no. Issue, Year, pp. Pages. URL/DOI.
        const volStr = vol ? `, vol. ${vol}` : '';
        const issStr = issue ? `, no. ${issue}` : '';
        const pgStr = pages ? `, pp. ${pages}` : '';
        const doiStr = doi ? `, ${doi}` : '';
        inTextVal = `(${shortName})`;

        return {
          formatted: `${hasAuthor ? authorText + '. ' : ''}"${artTitle}." *${jName}*${volStr}${issStr}, ${yr}${pgStr}${doiStr}`,
          inText: inTextVal,
        };
      } else {
        // Chicago: Lastname, Firstname. Year. "Title of Article." Journal Name Volume (Issue): Pages. DOI/URL.
        const volIssuePages = `${vol ? ' ' + vol : ''}${issue ? ' (' + issue + ')' : ''}${pages ? ': ' + pages : ''}`;
        const doiStr = doi ? `. ${doi}` : '';
        inTextVal = `(${shortName} ${yr})`;

        return {
          formatted: `${hasAuthor ? authorText + '. ' : ''}${yr}. "${artTitle}." *${jName}*${volIssuePages}${doiStr}`,
          inText: inTextVal,
        };
      }
    }
  }, [style, sourceType, authors, bookTitle, bookPublisher, bookYear, bookVolume, webPageTitle, webSiteName, webUrl, webPubDay, webPubMonth, webPubYear, webAccessDate, journalTitle, journalName, journalVol, journalIssue, journalPages, journalYear, journalDoi]);

  // Clean format for rendering styling (removing markdown asterisks for screen rendering, but keeping for copy option)
  const renderFormatted = (markdownText: string) => {
    // Regex replace markdown italic syntax with html italics
    const parts = markdownText.split('*');
    return parts.map((part, index) => {
      // Odd indices are text between asterisks
      return index % 2 === 1 ? <em key={index} className="italic font-medium">{part}</em> : part;
    });
  };

  const copyToClipboard = (text: string, type: 'citation' | 'intext' | 'bib') => {
    // Remove markdown bold/italics for plain copy
    const cleanText = text.replace(/\*/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
      if (type === 'citation') {
        setCopiedCitation(true);
        setTimeout(() => setCopiedCitation(false), 2000);
      } else if (type === 'intext') {
        setCopiedInText(true);
        setTimeout(() => setCopiedInText(false), 2000);
      } else {
        setCopiedBib(true);
        setTimeout(() => setCopiedBib(false), 2000);
      }
    });
  };

  // Add citation to the list
  const addCitationToList = () => {
    const newItem: SavedCitation = {
      id: Math.random().toString(36).substring(2, 9),
      formattedText: citationResult.formatted,
      inText: citationResult.inText,
      sourceType: sourceType.toUpperCase(),
      style: style.toUpperCase(),
    };
    saveCitationsToStorage([newItem, ...savedCitations]);
  };

  const deleteCitation = (id: string) => {
    saveCitationsToStorage(savedCitations.filter(c => c.id !== id));
  };

  const clearBibliography = () => {
    saveCitationsToStorage([]);
  };

  // Copy entire bibliography
  const copyAllBibliography = () => {
    const text = savedCitations.map(c => c.formattedText.replace(/\*/g, '')).join('\n\n');
    copyToClipboard(text, 'bib');
  };

  // Download entire bibliography as TXT
  const downloadBibliography = () => {
    const text = savedCitations.map(c => c.formattedText.replace(/\*/g, '')).join('\n\r\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bibliography_${style.toUpperCase()}_nest.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Style Selection & Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    Source Citation Details
                  </CardTitle>
                  <CardDescription>
                    Choose your formatting guidelines and source attributes.
                  </CardDescription>
                </div>
                
                {/* Style Toggle */}
                <div className="flex border rounded-lg bg-muted p-0.5 self-start sm:self-center">
                  {(['apa', 'mla', 'chicago'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      className={`px-3 py-1 text-xs font-semibold rounded uppercase transition-colors ${
                        style === s ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Source Type Selection */}
              <Tabs defaultValue="book" value={sourceType} onValueChange={(val) => setSourceType(val as 'book' | 'website' | 'journal')} className="w-full">
                <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1">
                  <TabsTrigger value="book" className="text-xs data-[state=active]:bg-background transition-all">
                    <BookOpen className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                    Book
                  </TabsTrigger>
                  <TabsTrigger value="website" className="text-xs data-[state=active]:bg-background transition-all">
                    <Globe className="w-3.5 h-3.5 mr-2 text-amber-500" />
                    Website
                  </TabsTrigger>
                  <TabsTrigger value="journal" className="text-xs data-[state=active]:bg-background transition-all">
                    <FileText className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                    Journal Article
                  </TabsTrigger>
                </TabsList>

                {/* Author Section */}
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-foreground">Authors / Contributors</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAuthor}
                      className="h-7 px-2.5 text-xs text-indigo-500 border-indigo-200/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Author
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {authors.map((author, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-muted/20 relative space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground">Author #{index + 1}</span>
                          {authors.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAuthor(index)}
                              className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={author.isOrg}
                              onChange={(e) => updateAuthor(index, 'isOrg', e.target.checked)}
                              className="rounded border-muted text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                            />
                            Corporate / Organization Author
                          </label>
                        </div>

                        {author.isOrg ? (
                          <div>
                            <Input
                              placeholder="e.g., World Health Organization or Google"
                              value={author.orgName}
                              onChange={(e) => updateAuthor(index, 'orgName', e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-5">
                              <Input
                                placeholder="First Name"
                                value={author.firstName}
                                onChange={(e) => updateAuthor(index, 'firstName', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                placeholder="M.I."
                                maxLength={1}
                                value={author.middleInitial}
                                onChange={(e) => updateAuthor(index, 'middleInitial', e.target.value)}
                              />
                            </div>
                            <div className="col-span-5">
                              <Input
                                placeholder="Last Name"
                                value={author.lastName}
                                onChange={(e) => updateAuthor(index, 'lastName', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Fields: Book */}
                <TabsContent value="book" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="book-title">Book Title</Label>
                    <Input
                      id="book-title"
                      placeholder="e.g., To Kill a Mockingbird"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="book-publisher">Publisher</Label>
                      <Input
                        id="book-publisher"
                        placeholder="e.g., HarperCollins"
                        value={bookPublisher}
                        onChange={(e) => setBookPublisher(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="book-year">Publication Year</Label>
                      <Input
                        id="book-year"
                        placeholder="e.g., 1960"
                        value={bookYear}
                        onChange={(e) => setBookYear(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="book-vol">Volume (optional)</Label>
                    <Input
                      id="book-vol"
                      placeholder="e.g., 2nd edition"
                      value={bookVolume}
                      onChange={(e) => setBookVolume(e.target.value)}
                    />
                  </div>
                </TabsContent>

                {/* Form Fields: Website */}
                <TabsContent value="website" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="web-page-title">Page / Document Title</Label>
                    <Input
                      id="web-page-title"
                      placeholder="e.g., Quantum Computing Explained"
                      value={webPageTitle}
                      onChange={(e) => setWebPageTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="web-site-name">Website Name</Label>
                    <Input
                      id="web-site-name"
                      placeholder="e.g., NASA Science"
                      value={webSiteName}
                      onChange={(e) => setWebSiteName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="web-url">URL</Label>
                    <Input
                      id="web-url"
                      placeholder="e.g., https://science.nasa.gov/quantum-computing"
                      value={webUrl}
                      onChange={(e) => setWebUrl(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="web-day" className="text-xs">Pub Day</Label>
                      <Input
                        id="web-day"
                        placeholder="e.g., 12"
                        value={webPubDay}
                        onChange={(e) => setWebPubDay(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="web-month" className="text-xs">Pub Month</Label>
                      <Input
                        id="web-month"
                        placeholder="e.g., Oct"
                        value={webPubMonth}
                        onChange={(e) => setWebPubMonth(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="web-year" className="text-xs">Pub Year</Label>
                      <Input
                        id="web-year"
                        placeholder="e.g., 2023"
                        value={webPubYear}
                        onChange={(e) => setWebPubYear(e.target.value)}
                      />
                    </div>
                  </div>
                  {style === 'mla' && (
                    <div className="space-y-2">
                      <Label htmlFor="web-access">Access Date</Label>
                      <Input
                        id="web-access"
                        type="date"
                        value={webAccessDate}
                        onChange={(e) => setWebAccessDate(e.target.value)}
                      />
                    </div>
                  )}
                </TabsContent>

                {/* Form Fields: Journal */}
                <TabsContent value="journal" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="journal-art-title">Article Title</Label>
                    <Input
                      id="journal-art-title"
                      placeholder="e.g., A study on neural pathways"
                      value={journalTitle}
                      onChange={(e) => setJournalTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="journal-name">Journal Name</Label>
                    <Input
                      id="journal-name"
                      placeholder="e.g., Nature Neuroscience"
                      value={journalName}
                      onChange={(e) => setJournalName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="journal-vol" className="text-xs">Volume</Label>
                      <Input
                        id="journal-vol"
                        placeholder="e.g., 42"
                        value={journalVol}
                        onChange={(e) => setJournalVol(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="journal-issue" className="text-xs">Issue</Label>
                      <Input
                        id="journal-issue"
                        placeholder="e.g., 3"
                        value={journalIssue}
                        onChange={(e) => setJournalIssue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="journal-pages" className="text-xs">Pages</Label>
                      <Input
                        id="journal-pages"
                        placeholder="e.g., 142-156"
                        value={journalPages}
                        onChange={(e) => setJournalPages(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="journal-year">Publication Year</Label>
                      <Input
                        id="journal-year"
                        placeholder="e.g., 2021"
                        value={journalYear}
                        onChange={(e) => setJournalYear(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="journal-doi">DOI / URL</Label>
                      <Input
                        id="journal-doi"
                        placeholder="e.g., https://doi.org/10.1038/s4"
                        value={journalDoi}
                        onChange={(e) => setJournalDoi(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Live Previews & Saved Bibliography */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Card */}
          <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm shadow-md">
            <CardHeader className="pb-3 border-b border-indigo-500/10">
              <CardTitle className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                Live Preview ({style.toUpperCase()})
                <Button
                  onClick={addCitationToList}
                  size="sm"
                  className="h-7 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded shadow"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 mr-1" /> Save Citation
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Full Bibliography Citation */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Bibliography Entry</span>
                <div className="p-3 bg-background border border-muted rounded-lg text-xs leading-relaxed break-words relative group">
                  <div className="pr-10">{renderFormatted(citationResult.formatted)}</div>
                  <Button
                    onClick={() => copyToClipboard(citationResult.formatted, 'citation')}
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 h-7 w-7 rounded border bg-muted/30 opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Copy to Clipboard"
                  >
                    {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              {/* In-Text Citation */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">In-Text Citation</span>
                <div className="p-3 bg-background border border-muted rounded-lg text-xs leading-relaxed break-words relative group">
                  <div className="pr-10 font-mono text-foreground">{citationResult.inText}</div>
                  <Button
                    onClick={() => copyToClipboard(citationResult.inText, 'intext')}
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 h-7 w-7 rounded border bg-muted/30 opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Copy to Clipboard"
                  >
                    {copiedInText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved bibliography list */}
          <Card className="border-muted bg-card/40">
            <CardHeader className="pb-3 border-b flex-row justify-between items-center space-y-0">
              <div>
                <CardTitle className="text-sm font-bold">Saved Bibliography</CardTitle>
                <CardDescription className="text-[11px]">
                  {savedCitations.length === 0 ? 'No references saved' : `${savedCitations.length} references saved`}
                </CardDescription>
              </div>

              {savedCitations.length > 0 && (
                <div className="flex gap-1.5">
                  <Button
                    onClick={copyAllBibliography}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-muted text-foreground"
                    title="Copy all bibliography entries"
                  >
                    {copiedBib ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    Copy All
                  </Button>
                  <Button
                    onClick={downloadBibliography}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-muted text-foreground"
                    title="Download bibliography file"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Export
                  </Button>
                  <Button
                    onClick={clearBibliography}
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Clear saved citations"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {savedCitations.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                  <BookmarkPlus className="w-8 h-8 text-muted-foreground/30 mx-auto mb-1" />
                  <p className="font-semibold text-muted-foreground/80">List is Empty</p>
                  <p className="max-w-xs mx-auto">Create and save citations above to compile your complete works cited list.</p>
                </div>
              ) : (
                <div className="divide-y max-h-[350px] overflow-y-auto">
                  {savedCitations.map((item) => (
                    <div key={item.id} className="p-3 text-xs flex justify-between items-start gap-4 hover:bg-muted/10 transition-colors">
                      <div className="space-y-1.5 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                            {item.style}
                          </span>
                          <span className="text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                            {item.sourceType}
                          </span>
                        </div>
                        <div className="leading-relaxed text-muted-foreground">{renderFormatted(item.formattedText)}</div>
                        <div className="text-[10px] font-mono text-muted-foreground/60">In-text: {item.inText}</div>
                      </div>
                      <Button
                        onClick={() => deleteCitation(item.id)}
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}

