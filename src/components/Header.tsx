"use client";

import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ExportModal } from './ExportModal';
import { ImportModal } from './ImportModal';
import { Plus, Users, Settings, Download, Upload } from 'lucide-react';

interface HeaderProps {
  onAddTask: () => void;
  onAddPerson: () => void;
  onOpenSettings: () => void
}

export function Header({ onAddTask, onAddPerson, onOpenSettings }: HeaderProps) {
  const { state, dispatch } = useProject();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleImport = (data: { people: any[]; tasks: any[] }) => {
    if (confirm('This will replace all current data. Continue?')) {
      dispatch({
        type: 'LOAD_STATE',
        payload: {
          people: data.people,
          tasks: data.tasks,
          projectStartDate: new Date().toISOString().split('T')[0]
        }
      });
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        {/* Logo and title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#181d26] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
            <h1 className="text-lg font-semibold text-gray-900">
              Project Planner
            </h1>
          </div>
          
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 ml-6 pl-6 border-l border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{state.tasks.length}</div>
              <div className="text-xs text-gray-500">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{state.people.length}</div>
              <div className="text-xs text-gray-500">Team</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {state.tasks.filter(t => t.status === 'done').length}
              </div>
              <div className="text-xs text-gray-500">Done</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>

          <button
            onClick={onAddPerson}
            className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <Users size={16} />
            Add Person
          </button>
          
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-[#181d26] text-white rounded-lg font-medium text-sm hover:bg-[#0d1218] transition-colors"
          >
            <Plus size={16} />
            Add Task
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            Import
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export
          </button>

          <button
            onClick={() => {
              if (confirm('Clear all data? This cannot be undone.')) {
                localStorage.removeItem('project-planner-state');
                window.location.reload();
              }
            }}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Clear all data"
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

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />
    </>
  );
}