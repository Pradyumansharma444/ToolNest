import { useState, useEffect } from 'react';
import { Plus, Trash2, FlipHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface Card {
  id: number;
  front: string;
  back: string;
}

const STORAGE_KEY = 'flashcard-maker-cards';

export default function FlashcardMaker() {
  const tool = getToolById('flashcard-maker')!;
  const { toast } = useToast();
  const [cards, setCards] = useState<Card[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); }, [cards]);

  const addCard = () => {
    if (!front.trim() || !back.trim()) { toast({ title: 'Please fill in both sides' }); return; }
    const newCard: Card = { id: Date.now(), front: front.trim(), back: back.trim() };
    setCards(prev => [...prev, newCard]);
    setFront('');
    setBack('');
    toast({ title: 'Card added!' });
  };

  const removeCard = (id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
    if (currentIndex >= cards.length - 1) setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) { setCurrentIndex(prev => prev + 1); setFlipped(false); }
  };

  const prevCard = () => {
    if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); setFlipped(false); }
  };

  const currentCard = cards[currentIndex];

  return (
    <ToolLayout tool={tool} resultVisible={cards.length > 0}>
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Front (Question)</label>
            <Textarea value={front} onChange={e => setFront(e.target.value)} placeholder="Enter the question..." rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Back (Answer)</label>
            <Textarea value={back} onChange={e => setBack(e.target.value)} placeholder="Enter the answer..." rows={3} />
          </div>
        </div>
        <Button onClick={addCard}><Plus className="w-4 h-4 mr-1" />Add Card</Button>

        {cards.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{cards.length} card{cards.length !== 1 ? 's' : ''}</p>
              <Button variant="destructive" size="sm" onClick={clearAll}><Trash2 className="w-4 h-4 mr-1" />Clear All</Button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentIndex + 1} / {cards.length}</Badge>
              </div>
              <div
                className="w-full max-w-md min-h-[200px] rounded-xl border-2 border-primary/20 bg-muted/50 p-8 flex items-center justify-center cursor-pointer select-none"
                onClick={() => setFlipped(prev => !prev)}
              >
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">{flipped ? 'Answer' : 'Question'}</p>
                  <p className="text-lg font-medium whitespace-pre-wrap">{flipped ? currentCard?.back : currentCard?.front}</p>
                  <p className="text-xs text-muted-foreground mt-4">Click to {flipped ? 'see question' : 'reveal answer'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevCard} disabled={currentIndex === 0}><ChevronLeft className="w-4 h-4" />Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setFlipped(prev => !prev)}><FlipHorizontal className="w-4 h-4 mr-1" />Flip</Button>
                <Button variant="outline" size="sm" onClick={nextCard} disabled={currentIndex === cards.length - 1}>Next<ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cards.map((card, i) => (
                <div key={card.id} className={`flex items-center justify-between rounded-lg border p-3 text-sm ${i === currentIndex ? 'border-primary' : ''}`}>
                  <div className="flex-1 truncate mr-2">
                    <span className="font-medium">{card.front}</span>
                    <span className="text-muted-foreground mx-2">→</span>
                    <span className="text-muted-foreground">{card.back}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCard(card.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
