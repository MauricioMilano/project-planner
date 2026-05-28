import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { ThemeId } from '../themes/types';
import { Check, Palette } from 'lucide-react';

interface ThemePreviewCardProps {
  themeId: ThemeId;
  name: string;
  colors: {
    background: string;
    primary: string;
    accent: string;
    border: string;
  };
  isActive: boolean;
  onClick: () => void;
}

function ThemePreviewCard({ name, colors, isActive, onClick }: ThemePreviewCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full p-3 rounded-lg border-2 transition-all overflow-hidden
        ${isActive 
          ? 'border-[var(--theme-accent)] shadow-md' 
          : 'border-[var(--theme-border)] hover:border-[var(--theme-accent)] hover:shadow-sm'
        }
      `}
      style={{ backgroundColor: colors.background }}
    >
      {/* Mini preview */}
      <div className="flex flex-col gap-1.5">
        {/* Header preview */}
        <div 
          className="h-3 rounded-sm" 
          style={{ backgroundColor: colors.primary }}
        />
        {/* Content bars */}
        <div className="flex gap-1">
          <div 
            className="h-2 w-8 rounded-sm" 
            style={{ backgroundColor: colors.accent }}
          />
          <div 
            className="h-2 w-4 rounded-sm" 
            style={{ backgroundColor: colors.border }}
          />
        </div>
        {/* Task bar preview */}
        <div className="flex items-center gap-1">
          <div 
            className="h-2 w-3 rounded-full" 
            style={{ backgroundColor: colors.primary }}
          />
          <div 
            className="h-2 flex-1 rounded-sm" 
            style={{ backgroundColor: colors.accent }}
          />
        </div>
      </div>
      
      {/* Theme name */}
      <div className="mt-2 text-center">
        <span 
          className="text-xs font-medium"
          style={{ color: colors.primary }}
        >
          {name}
        </span>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div 
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.accent }}
        >
          <Check size={12} className="text-white" />
        </div>
      )}
    </button>
  );
}

export function ThemeSelector() {
  const { t } = useTranslation();
  const { themes, currentThemeId, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette size={18} style={{ color: 'var(--theme-accent)' }} />
        <h3 className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
          {t('themes.title')}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => (
          <ThemePreviewCard
            key={theme.id}
            themeId={theme.id as ThemeId}
            name={theme.name}
            colors={{
              background: theme.colors.background,
              primary: theme.colors.primary,
              accent: theme.colors.accent,
              border: theme.colors.border,
            }}
            isActive={currentThemeId === theme.id}
            onClick={() => setTheme(theme.id as ThemeId)}
          />
        ))}
      </div>

      <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
        {t('themes.hint')}
      </p>
    </div>
  );
}