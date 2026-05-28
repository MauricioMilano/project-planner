import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../context/ProjectContext';
import { PersonCard } from './PersonCard';
import { AddPersonModal } from './AddPersonModal';
import { Plus } from 'lucide-react';

export function PeoplePanel() {
  const { t } = useTranslation();
  const { state } = useProject();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="w-72 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
            {t('peoplePanel.title')}
          </h2>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            {state.people.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {state.people.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
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
            <p className="text-sm text-gray-500 mb-1">{t('peoplePanel.noMembers')}</p>
            <p className="text-xs text-gray-400">
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

      <div className="p-3 border-t border-gray-200 bg-white">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium hover:border-gray-400 hover:text-gray-700 transition-colors"
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
