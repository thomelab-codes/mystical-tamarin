import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES, LanguageData, VocabularyItem } from '@/data/languages';
import { BookOpen, CheckCircle2, XCircle, Volume2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type PracticeMode = 'flashcards' | 'quiz' | 'typing' | 'phrases';

export default function LanguageLearning() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageData | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [practiceItems, setPracticeItems] = useState<VocabularyItem[]>([]);

  useEffect(() => {
    if (selectedLanguage && selectedCategory) {
      let items = selectedCategory === 'all'
        ? selectedLanguage.vocabulary
        : selectedLanguage.vocabulary.filter(v => v.category === selectedCategory);

      // Shuffle items
      items = [...items].sort(() => Math.random() - 0.5);
      setPracticeItems(items);
      setCurrentIndex(0);
      setScore(0);
      setAttempts(0);
    }
  }, [selectedLanguage, selectedCategory]);

  const categories = selectedLanguage
    ? ['all', ...new Set(selectedLanguage.vocabulary.map(v => v.category))]
    : [];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage?.code || 'en';
      speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported in your browser');
    }
  };

  const nextItem = () => {
    if (currentIndex < practiceItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setUserAnswer('');
      setShowResult(false);
      setIsCorrect(false);
    } else {
      toast.success(`Practice complete! Score: ${score}/${attempts}`);
      setPracticeMode(null);
    }
  };

  const checkAnswer = () => {
    const currentItem = practiceItems[currentIndex];
    const correct = userAnswer.toLowerCase().trim() === currentItem.translation.toLowerCase().trim() ||
                   userAnswer.toLowerCase().trim() === currentItem.word.toLowerCase().trim();

    setIsCorrect(correct);
    setShowResult(true);
    setAttempts(attempts + 1);
    if (correct) {
      setScore(score + 1);
      toast.success('Correct!');
    } else {
      toast.error('Not quite right');
    }
  };

  const resetPractice = () => {
    const items = [...practiceItems].sort(() => Math.random() - 0.5);
    setPracticeItems(items);
    setCurrentIndex(0);
    setScore(0);
    setAttempts(0);
    setIsFlipped(false);
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
  };

  if (!selectedLanguage) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-6xl">
          <h1 className="text-4xl font-bold mb-6">Language Learning</h1>
          <p className="text-muted-foreground mb-8">
            Choose a language to start learning
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {LANGUAGES.map((language) => (
              <Card
                key={language.code}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedLanguage(language)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-4xl">{language.flag}</span>
                    {language.name}
                  </CardTitle>
                  <CardDescription>
                    {language.vocabulary.length} vocabulary words
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!practiceMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{selectedLanguage.flag}</span>
              <div>
                <h1 className="text-4xl font-bold">{selectedLanguage.name}</h1>
                <p className="text-muted-foreground">
                  {selectedLanguage.vocabulary.length} words • {selectedLanguage.phrases.length} phrases
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setSelectedLanguage(null)}>
              Change Language
            </Button>
          </div>

          <Tabs defaultValue="vocabulary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
              <TabsTrigger value="phrases">Common Phrases</TabsTrigger>
            </TabsList>

            <TabsContent value="vocabulary" className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setPracticeMode('flashcards')}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Flashcards</CardTitle>
                    <CardDescription>
                      Review vocabulary with interactive flashcards
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setPracticeMode('quiz')}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Multiple Choice</CardTitle>
                    <CardDescription>
                      Test your knowledge with quizzes
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setPracticeMode('typing')}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Type Answer</CardTitle>
                    <CardDescription>
                      Practice by typing translations
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setPracticeMode('phrases')}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Common Phrases</CardTitle>
                    <CardDescription>
                      Learn useful everyday phrases
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Vocabulary List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 max-h-96 overflow-y-auto">
                    {practiceItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{item.word}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => speak(item.word)}
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.translation}</p>
                          {item.pronunciation && (
                            <p className="text-xs text-muted-foreground italic">{item.pronunciation}</p>
                          )}
                        </div>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="phrases">
              <Card>
                <CardHeader>
                  <CardTitle>Common Phrases</CardTitle>
                  <CardDescription>
                    Learn useful everyday expressions in {selectedLanguage.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {selectedLanguage.phrases.map((phrase, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-lg">{phrase.phrase}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => speak(phrase.phrase)}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground">{phrase.translation}</p>
                        {phrase.pronunciation && (
                          <p className="text-sm text-muted-foreground italic mt-1">
                            {phrase.pronunciation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Practice modes
  const currentItem = practiceItems[currentIndex];
  const progress = ((currentIndex + 1) / practiceItems.length) * 100;

  if (practiceMode === 'flashcards') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedLanguage.flag} Flashcards</h2>
              <p className="text-muted-foreground">
                Card {currentIndex + 1} of {practiceItems.length}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={resetPractice}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setPracticeMode(null)}>
                Exit
              </Button>
            </div>
          </div>

          <Progress value={progress} className="mb-6" />

          <Card
            className="min-h-[400px] flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-4 text-sm text-muted-foreground">
                {isFlipped ? 'Translation' : selectedLanguage.name} - Click to flip
              </div>
              <p className="text-4xl font-bold mb-4">
                {isFlipped ? currentItem.translation : currentItem.word}
              </p>
              {!isFlipped && currentItem.pronunciation && (
                <p className="text-xl text-muted-foreground italic">{currentItem.pronunciation}</p>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(currentItem.word);
                }}
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                  setIsFlipped(false);
                }
              }}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button onClick={nextItem}>
              {currentIndex === practiceItems.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (practiceMode === 'typing') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedLanguage.flag} Type Answer</h2>
              <p className="text-muted-foreground">
                Question {currentIndex + 1} of {practiceItems.length} • Score: {score}/{attempts}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={resetPractice}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setPracticeMode(null)}>
                Exit
              </Button>
            </div>
          </div>

          <Progress value={progress} className="mb-6" />

          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground mb-2">Translate this word:</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-4xl font-bold">{currentItem.word}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => speak(currentItem.word)}
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </div>
                {currentItem.pronunciation && (
                  <p className="text-lg text-muted-foreground italic">{currentItem.pronunciation}</p>
                )}
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Type your answer..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !showResult) {
                      checkAnswer();
                    } else if (e.key === 'Enter' && showResult) {
                      nextItem();
                    }
                  }}
                  disabled={showResult}
                  className="text-lg text-center"
                />

                {showResult && (
                  <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <p className="text-center text-muted-foreground">
                        Correct answer: <span className="font-semibold">{currentItem.translation}</span>
                      </p>
                    )}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={showResult ? nextItem : checkAnswer}
                  disabled={!showResult && !userAnswer.trim()}
                >
                  {showResult ? (currentIndex === practiceItems.length - 1 ? 'Finish' : 'Next') : 'Check Answer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
