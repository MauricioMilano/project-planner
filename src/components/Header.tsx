"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';
import { Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { t } = useTranslation();
  const { state } = useProject();
  const { currentTheme } = useTheme();
  
  const colors = currentTheme.colors;

  const handleClearData = () => {
    if (confirm(t('alerts.clearDataConfirm'))) {
      localStorage.removeItem('project-planner-state');
      window.location.reload();
    }
  };

  return (
    <header 
      className="px-6 py-3 flex items-center justify-between sticky top-0 z-20"
      style={{ 
        backgroundColor: colors.card,
        borderBottom: `1px solid ${colors.border}`
      }}
    >
      {/* Logo and title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: colors.background }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          </div>
          <h1 
            className="text-lg font-semibold"
            style={{ color: colors.textPrimary }}
          >
            {t('header.title')}
          </h1>
        </div>
        
        {/* Stats */}
        <div 
          className="hidden md:flex items-center gap-4 ml-6 pl-6"
          style={{ borderLeft: `1px solid ${colors.border}` }}
        >
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: colors.textPrimary }}>{state.tasks.length}</div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>{t('header.tasks')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: colors.textPrimary }}>{state.people.length}</div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>{t('header.team')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold" style={{ color: colors.success }}>
              {state.tasks.filter(t => t.status === 'done').length}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>{t('header.done')}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--theme-card-hover)]"
          style={{ color: colors.textSecondary }}
          title={t('header.settings')}
        >
          <Settings size={18} />
        </button>

        <button
          onClick={handleClearData}
          className="p-2 rounded-lg transition-colors"
          style={{ color: colors.textSecondary }}
          title={t('header.clearData')}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}