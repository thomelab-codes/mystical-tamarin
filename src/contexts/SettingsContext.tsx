import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'red';

export interface DashboardWidgets {
  notes: boolean;
  todo: boolean;
  calculator: boolean;
  pomodoro: boolean;
  passwordGen: boolean;
  unitConverter: boolean;
  flashcards: boolean;
  languageLearning: boolean;
  messaging: boolean;
  gallery: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  dashboardWidgets: DashboardWidgets;
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
  showWelcomeMessage: boolean;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  toggleWidget: (widget: keyof DashboardWidgets) => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  accentColor: 'blue',
  dashboardWidgets: {
    notes: true,
    todo: true,
    calculator: true,
    pomodoro: true,
    passwordGen: true,
    unitConverter: true,
    flashcards: true,
    languageLearning: true,
    messaging: true,
    gallery: true,
  },
  fontSize: 'medium',
  sidebarCollapsed: false,
  showWelcomeMessage: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'app-settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load settings from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Handle theme mode
    let effectiveTheme = settings.theme;
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply accent color
    root.setAttribute('data-accent', settings.accentColor);

    // Apply font size
    root.setAttribute('data-font-size', settings.fontSize);
  }, [settings.theme, settings.accentColor, settings.fontSize]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const toggleWidget = (widget: keyof DashboardWidgets) => {
    setSettings((prev) => ({
      ...prev,
      dashboardWidgets: {
        ...prev.dashboardWidgets,
        [widget]: !prev.dashboardWidgets[widget],
      },
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, toggleWidget }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
