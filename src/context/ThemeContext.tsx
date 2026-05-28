import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Theme, ThemeId } from '../themes/types';
import { themes, DEFAULT_THEME_ID, getThemeById } from '../themes/definitions';

const THEME_STORAGE_KEY = 'gantt-planner-theme';
const TRANSITIONS_STORAGE_KEY = 'gantt-planner-transitions';

interface ThemeContextType {
  currentTheme: Theme;
  currentThemeId: ThemeId;
  themes: Theme[];
  setTheme: (themeId: ThemeId) => void;
  transitionsEnabled: boolean;
  setTransitionsEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(DEFAULT_THEME_ID as ThemeId);
  const [transitionsEnabled, setTransitionsEnabledState] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme && themes.some(t => t.id === storedTheme)) {
      setCurrentThemeId(storedTheme as ThemeId);
    }

    const storedTransitions = localStorage.getItem(TRANSITIONS_STORAGE_KEY);
    if (storedTransitions !== null) {
      setTransitionsEnabledState(storedTransitions === 'true');
    }

    setIsLoaded(true);
  }, []);

  // Apply theme to document root
  useEffect(() => {
    if (!isLoaded) return;

    const theme = getThemeById(currentThemeId);
    const root = document.documentElement;
    
    // Set CSS custom properties
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-success', theme.colors.success);
    root.style.setProperty('--theme-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--theme-border', theme.colors.border);
    root.style.setProperty('--theme-card', theme.colors.card);
    root.style.setProperty('--theme-card-hover', theme.colors.cardHover);
    root.style.setProperty('--theme-input', theme.colors.input);
    root.style.setProperty('--theme-input-border', theme.colors.inputBorder);
    root.style.setProperty('--theme-button-primary', theme.colors.buttonPrimary);
    root.style.setProperty('--theme-button-primary-hover', theme.colors.buttonPrimaryHover);
    root.style.setProperty('--theme-button-secondary', theme.colors.buttonSecondary);
    root.style.setProperty('--theme-button-secondary-hover', theme.colors.buttonSecondaryHover);
    root.style.setProperty('--theme-gantt-grid-line', theme.colors.ganttGridLine);
    root.style.setProperty('--theme-gantt-today', theme.colors.ganttToday);
    root.style.setProperty('--theme-priority-high', theme.colors.priorityHigh);
    root.style.setProperty('--theme-priority-medium', theme.colors.priorityMedium);
    root.style.setProperty('--theme-priority-low', theme.colors.priorityLow);
    root.style.setProperty('--theme-status-todo', theme.colors.statusTodo);
    root.style.setProperty('--theme-status-in-progress', theme.colors.statusInProgress);
    root.style.setProperty('--theme-status-done', theme.colors.statusDone);
    
    // Set data attribute for theme-specific styles
    root.setAttribute('data-theme', currentThemeId);
    
    // Handle dark mode class
    if (theme.isDark) {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }, [currentThemeId, isLoaded]);

  const setTheme = useCallback((themeId: ThemeId) => {
    setCurrentThemeId(themeId);
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, []);

  const setTransitionsEnabled = useCallback((enabled: boolean) => {
    setTransitionsEnabledState(enabled);
    localStorage.setItem(TRANSITIONS_STORAGE_KEY, String(enabled));
    
    if (enabled) {
      document.documentElement.classList.add('theme-transitions');
    } else {
      document.documentElement.classList.remove('theme-transitions');
    }
  }, []);

  const currentTheme = getThemeById(currentThemeId);

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      currentThemeId,
      themes,
      setTheme,
      transitionsEnabled,
      setTransitionsEnabled,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}