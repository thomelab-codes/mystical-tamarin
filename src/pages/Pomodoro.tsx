import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { toast } from "sonner";

export default function Pomodoro() {
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [currentMode, setCurrentMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio for timer completion
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjmM0O+3aiUGI3fI8N2QQBAWX7Tp7KZVEwlEnt/xwW4iBjuS0vC9cyUIKYDO9NyLOAgZZ7rs6KFMEAxPpuHwuGccBjuS0vC9ciUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4iBjuS0vC9cyUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4iBjuS0vC9cyUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4iBjuS0vC9cyUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4iBjuS0vC9cyUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4iBjuS0vC9cyUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4iBjuS0vC9cyUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4iBjuS0vC9cyUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4iBjuS0vC9cyUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4iBjuS0vC9cyUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4iBjuS0vC9cyUIKH7I8N2QQBAWX7Pp7KhWEwlFn9/xwW4i');

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    audioRef.current?.play().catch(() => {
      // Audio play failed (browser policy)
    });

    if (currentMode === 'work') {
      const newCount = pomodorosCompleted + 1;
      setPomodorosCompleted(newCount);

      if (newCount % 4 === 0) {
        toast.success('Time for a long break!');
        setCurrentMode('longBreak');
        setTimeLeft(longBreakDuration * 60);
      } else {
        toast.success('Time for a short break!');
        setCurrentMode('shortBreak');
        setTimeLeft(shortBreakDuration * 60);
      }
    } else {
      toast.success('Break over! Time to work!');
      setCurrentMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    switch (currentMode) {
      case 'work':
        setTimeLeft(workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(longBreakDuration * 60);
        break;
    }
  };

  const switchMode = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setCurrentMode(mode);
    switch (mode) {
      case 'work':
        setTimeLeft(workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(longBreakDuration * 60);
        break;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    let total = 0;
    switch (currentMode) {
      case 'work':
        total = workDuration * 60;
        break;
      case 'shortBreak':
        total = shortBreakDuration * 60;
        break;
      case 'longBreak':
        total = longBreakDuration * 60;
        break;
    }
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Pomodoro Timer</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Timer</CardTitle>
              <CardDescription>
                {currentMode === 'work' ? 'Focus Time' : currentMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-2">
                <Button
                  variant={currentMode === 'work' ? 'default' : 'outline'}
                  onClick={() => switchMode('work')}
                >
                  Work
                </Button>
                <Button
                  variant={currentMode === 'shortBreak' ? 'default' : 'outline'}
                  onClick={() => switchMode('shortBreak')}
                >
                  Short Break
                </Button>
                <Button
                  variant={currentMode === 'longBreak' ? 'default' : 'outline'}
                  onClick={() => switchMode('longBreak')}
                >
                  Long Break
                </Button>
              </div>

              <div className="relative">
                <div className="text-center mb-4">
                  <div className="text-8xl font-bold font-mono">{formatTime(timeLeft)}</div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button size="lg" onClick={toggleTimer}>
                  {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button size="lg" variant="outline" onClick={resetTimer}>
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Reset
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Pomodoros Completed Today: <span className="font-bold text-lg">{pomodorosCompleted}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>
                Customize your Pomodoro durations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                  <Input
                    id="work-duration"
                    type="number"
                    min="1"
                    max="60"
                    value={workDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 25;
                      setWorkDuration(val);
                      if (currentMode === 'work' && !isRunning) {
                        setTimeLeft(val * 60);
                      }
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="short-break">Short Break (minutes)</Label>
                  <Input
                    id="short-break"
                    type="number"
                    min="1"
                    max="30"
                    value={shortBreakDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 5;
                      setShortBreakDuration(val);
                      if (currentMode === 'shortBreak' && !isRunning) {
                        setTimeLeft(val * 60);
                      }
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="long-break">Long Break (minutes)</Label>
                  <Input
                    id="long-break"
                    type="number"
                    min="1"
                    max="60"
                    value={longBreakDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 15;
                      setLongBreakDuration(val);
                      if (currentMode === 'longBreak' && !isRunning) {
                        setTimeLeft(val * 60);
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
