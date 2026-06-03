import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, BookOpen, Edit2, RotateCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  category: string;
}

export default function Flashcards() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckCategory, setNewDeckCategory] = useState('general');
  const [editingDeck, setEditingDeck] = useState<string | null>(null);
  const [studyingDeck, setStudyingDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [createDeckOpen, setCreateDeckOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);

  // Load decks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flashcard-decks');
    if (saved) {
      setDecks(JSON.parse(saved));
    }
  }, []);

  // Save decks to localStorage
  const saveDecks = (updatedDecks: Deck[]) => {
    setDecks(updatedDecks);
    localStorage.setItem('flashcard-decks', JSON.stringify(updatedDecks));
  };

  const createDeck = () => {
    if (!newDeckName.trim()) {
      toast.error('Please enter a deck name');
      return;
    }

    const newDeck: Deck = {
      id: Date.now().toString(),
      name: newDeckName,
      description: newDeckDescription,
      cards: [],
      category: newDeckCategory,
    };

    saveDecks([...decks, newDeck]);
    setNewDeckName('');
    setNewDeckDescription('');
    setNewDeckCategory('general');
    setCreateDeckOpen(false);
    toast.success('Deck created!');
  };

  const deleteDeck = (deckId: string) => {
    saveDecks(decks.filter(d => d.id !== deckId));
    toast.success('Deck deleted');
  };

  const addCard = () => {
    if (!editingDeck || !newCardFront.trim() || !newCardBack.trim()) {
      toast.error('Please fill in both sides of the card');
      return;
    }

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newCardFront,
      back: newCardBack,
    };

    const updatedDecks = decks.map(deck => {
      if (deck.id === editingDeck) {
        return { ...deck, cards: [...deck.cards, newCard] };
      }
      return deck;
    });

    saveDecks(updatedDecks);
    setNewCardFront('');
    setNewCardBack('');
    setAddCardOpen(false);
    toast.success('Card added!');
  };

  const deleteCard = (deckId: string, cardId: string) => {
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return { ...deck, cards: deck.cards.filter(c => c.id !== cardId) };
      }
      return deck;
    });
    saveDecks(updatedDecks);
    toast.success('Card deleted');
  };

  const startStudying = (deck: Deck) => {
    if (deck.cards.length === 0) {
      toast.error('This deck has no cards yet');
      return;
    }
    setStudyingDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (studyingDeck && currentCardIndex < studyingDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      toast.success('You completed this deck!');
      setStudyingDeck(null);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const shuffleDeck = () => {
    if (studyingDeck) {
      const shuffled = { ...studyingDeck, cards: [...studyingDeck.cards].sort(() => Math.random() - 0.5) };
      setStudyingDeck(shuffled);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      toast.success('Deck shuffled!');
    }
  };

  if (studyingDeck) {
    const currentCard = studyingDeck.cards[currentCardIndex];
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{studyingDeck.name}</h1>
              <p className="text-muted-foreground">
                Card {currentCardIndex + 1} of {studyingDeck.cards.length}
              </p>
            </div>
            <Button variant="outline" onClick={() => setStudyingDeck(null)}>
              Exit Study Mode
            </Button>
          </div>

          <div className="space-y-6">
            <Card
              className="min-h-[400px] flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-4 text-sm text-muted-foreground">
                  {isFlipped ? 'Back' : 'Front'} - Click to flip
                </div>
                <p className="text-3xl font-semibold">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                variant="outline"
              >
                Previous
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={shuffleDeck}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={nextCard}
              >
                {currentCardIndex === studyingDeck.cards.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>

            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentCardIndex + 1) / studyingDeck.cards.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Flashcards</h1>
          <Dialog open={createDeckOpen} onOpenChange={setCreateDeckOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Deck
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Deck</DialogTitle>
                <DialogDescription>
                  Create a new flashcard deck to organize your study materials
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deck-name">Deck Name</Label>
                  <Input
                    id="deck-name"
                    placeholder="e.g., Spanish Vocabulary"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deck-description">Description (optional)</Label>
                  <Textarea
                    id="deck-description"
                    placeholder="What's this deck about?"
                    value={newDeckDescription}
                    onChange={(e) => setNewDeckDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deck-category">Category</Label>
                  <Select value={newDeckCategory} onValueChange={setNewDeckCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createDeck} className="w-full">Create Deck</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {decks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Decks Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first flashcard deck to start studying
              </p>
              <Button onClick={() => setCreateDeckOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Card key={deck.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{deck.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteDeck(deck.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>{deck.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cards:</span>
                    <span className="font-semibold">{deck.cards.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-semibold capitalize">{deck.category}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingDeck(deck.id);
                        setAddCardOpen(true);
                      }}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Add Cards
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => startStudying(deck)}
                      disabled={deck.cards.length === 0}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Study
                    </Button>
                  </div>

                  {deck.cards.length > 0 && editingDeck === deck.id && (
                    <div className="border-t pt-4 mt-4 space-y-2 max-h-40 overflow-y-auto">
                      <p className="text-sm font-semibold mb-2">Cards in deck:</p>
                      {deck.cards.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                        >
                          <span className="truncate">{card.front}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => deleteCard(deck.id, card.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
              <DialogDescription>
                Create a new flashcard for this deck
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-front">Front (Question/Prompt)</Label>
                <Textarea
                  id="card-front"
                  placeholder="e.g., What is 'hello' in Spanish?"
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-back">Back (Answer)</Label>
                <Textarea
                  id="card-back"
                  placeholder="e.g., Hola"
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                />
              </div>
              <Button onClick={addCard} className="w-full">Add Card</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
