import React, { useState } from 'react';
import { Plus, Trash2, RotateCw, ChevronLeft, ChevronRight, Check, X, Download, Upload } from 'lucide-react';
import { Button, Input } from '../../components/ui/FormElements';
import { downloadBlob } from '../../utils/file';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered?: boolean;
}

const DEFAULT_CARDS: Flashcard[] = [
  { id: '1', front: 'What is Time Complexity of Binary Search?', back: 'O(log n)' },
  { id: '2', front: 'What does ACID stand for in databases?', back: 'Atomicity, Consistency, Isolation, Durability' },
  { id: '3', front: 'Difference between TCP and UDP?', back: 'TCP is connection-oriented with guaranteed delivery; UDP is connectionless with low latency.' },
  { id: '4', front: 'What is the speed of light in vacuum?', back: 'Approximately 3 x 10^8 m/s (299,792,458 m/s)' },
];

export function FlashcardCreator() {
  const [cards, setCards] = useState<Flashcard[]>(DEFAULT_CARDS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [newFront, setNewFront] = useState<string>('');
  const [newBack, setNewBack] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'study' | 'edit'>('study');

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const addCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;
    setCards([
      ...cards,
      {
        id: Math.random().toString(36).substring(7),
        front: newFront.trim(),
        back: newBack.trim(),
      },
    ]);
    setNewFront('');
    setNewBack('');
  };

  const removeCard = (id: string) => {
    if (cards.length <= 1) return;
    setCards(cards.filter((c) => c.id !== id));
    if (currentIndex >= cards.length - 1) {
      setCurrentIndex(Math.max(0, cards.length - 2));
    }
  };

  const toggleMastered = (id: string) => {
    setCards(
      cards.map((c) => (c.id === id ? { ...c, mastered: !c.mastered } : c))
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'study' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('study')}
          >
            Study Deck ({cards.length})
          </Button>
          <Button
            variant={activeTab === 'edit' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('edit')}
          >
            Manage Cards
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadBlob(new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' }), 'deck.json')
          }
        >
          <Download className="w-4 h-4 mr-1.5" /> Export Deck
        </Button>
      </div>

      {activeTab === 'study' ? (
        <div className="space-y-6">
          {/* Card View */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 bg-white dark:bg-slate-800 rounded-3xl p-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 hover:border-emerald-500/50 select-none group"
          >
            <div className="w-full flex justify-between items-center text-xs font-semibold text-slate-400">
              <span>Card {currentIndex + 1} of {cards.length}</span>
              <span className="flex items-center gap-1 group-hover:text-emerald-500">
                <RotateCw className="w-3.5 h-3.5" /> Click to flip
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center px-4">
              <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                {isFlipped ? currentCard?.back : currentCard?.front}
              </p>
            </div>

            <div className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
              {isFlipped ? 'Answer' : 'Question / Prompt'}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <Button variant="outline" size="lg" onClick={handlePrev}>
              <ChevronLeft className="w-5 h-5 mr-1" /> Previous
            </Button>

            <Button
              variant={currentCard?.mastered ? 'primary' : 'outline'}
              size="sm"
              onClick={() => toggleMastered(currentCard.id)}
            >
              <Check className="w-4 h-4 mr-1.5" />
              {currentCard?.mastered ? 'Mastered!' : 'Mark as Mastered'}
            </Button>

            <Button variant="outline" size="lg" onClick={handleNext}>
              Next <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Add New Flashcard</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Front (Question)"
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
              />
              <Input
                placeholder="Back (Answer)"
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
              />
            </div>
            <Button variant="primary" size="sm" onClick={addCard}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Card to Deck
            </Button>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Cards in Deck ({cards.length})
            </h4>
            {cards.map((c, i) => (
              <div
                key={c.id}
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm"
              >
                <div className="truncate pr-3">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mr-2">#{i + 1}</span>
                  <span className="text-slate-600 dark:text-slate-300">{c.front}</span>
                  <span className="text-slate-400 mx-2">→</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{c.back}</span>
                </div>
                <button
                  onClick={() => removeCard(c.id)}
                  className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
