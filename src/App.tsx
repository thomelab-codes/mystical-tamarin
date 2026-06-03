import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { supabase } from '@/integrations/supabase/client';
import { SettingsProvider } from '@/contexts/SettingsContext';

// Lazy load components for better code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Notes = lazy(() => import("./pages/Notes"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Messaging = lazy(() => import("./pages/Messaging"));
const Calculator = lazy(() => import("./pages/Calculator"));
const TodoList = lazy(() => import("./pages/TodoList"));
const Pomodoro = lazy(() => import("./pages/Pomodoro"));
const PasswordGenerator = lazy(() => import("./pages/PasswordGenerator"));
const UnitConverter = lazy(() => import("./pages/UnitConverter"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const LanguageLearning = lazy(() => import("./pages/LanguageLearning"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient();

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/messaging" element={<Messaging />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/todo" element={<TodoList />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/password-generator" element={<PasswordGenerator />} />
              <Route path="/unit-converter" element={<UnitConverter />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/language-learning" element={<LanguageLearning />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;