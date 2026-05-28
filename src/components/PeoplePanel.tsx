import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';
import { PersonCard } from './PersonCard';
import { AddPersonModal } from './AddPersonModal';
import { Plus } from 'lucide-react';

export function PeoplePanel() {
  const { t } = useTranslation();
  const { state } = useProject();
  const { currentTheme } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const colors = currentTheme.colors;

  return (
    <div 
      className="w-72 flex-shrink-0 flex flex-col h-full"
      style={{ 
        backgroundColor: colors.background,
        borderRight: `1px solid ${colors.border}`
      }}
    >
      <div 
        className="p-4 bg-white"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center justify-between">
          <h2 
            className="text-sm font-medium uppercase tracking-wide"
            style={{ color: colors.textPrimary }}
          >
            {t('peoplePanel.title')}
          </h2>
          <span 
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: colors.secondary,
              color: colors.textSecondary
            }}
          >
            {state.people.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {state.people.length === 0 ? (
          <div className="text-center py-8">
            <div 
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.secondary }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: colors.textSecondary }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>{t('peoplePanel.noMembers')}</p>
            <p className="text-xs" style={{ color: colors.textSecondary, opacity: 0.7 }}>
              {t('peoplePanel.noMembersHint')}
            </p>
          </div>
        ) : (
          state.people.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              tasks={state.tasks}
            />
          ))
        )}
      </div>

      <div 
        className="p-3 bg-white"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors border-2 border-dashed"
          style={{ 
            borderColor: colors.border,
            color: colors.textSecondary,
            backgroundColor: 'transparent'
          }}
        >
          <Plus size={18} />
          {t('peoplePanel.addPerson')}
        </button>
      </div>

      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}