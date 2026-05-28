export interface ThemeColors {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  card: string;
  cardHover: string;
  input: string;
  inputBorder: string;
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  ganttGridLine: string;
  ganttToday: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  statusTodo: string;
  statusInProgress: string;
  statusDone: string;
}

export interface Theme {
  id: string;
  name: string;
  nameLocalizedKey: string;
  colors: ThemeColors;
  isDark: boolean;
}

export interface ThemeConfig {
  currentThemeId: string;
  transitions: boolean;
}

export type ThemeId = 'classic' | 'starry-night' | 'aurora' | 'serene-nature' | 'energetic-coral' | 'glamour-pink' | 'minimalist';