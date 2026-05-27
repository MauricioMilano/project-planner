import React from 'react';
import { Task, Person } from '../types';
import { TaskBar } from './TaskBar';

interface GanttRowProps {
  task: Task;
  person: Person | null;
  projectStartDate: string;
  dayWidth: number;
  onUpdate: (task: Task) => void;
  onClick: () => void;
  isEven: boolean;
}

export function GanttRow({ task, person, projectStartDate, dayWidth, onUpdate, onClick, isEven }: GanttRowProps) {
  return (
    <div
      className={`flex border-b border-gray-100 ${
        isEven ? 'bg-white' : 'bg-gray-50/50'
      } hover:bg-blue-50/30 transition-colors`}
    >
      {/* Task info column */}
      <div className="w-48 flex-shrink-0 border-r border-gray-200 px-4 py-2 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {task.name}
          </span>
        </div>
        {task.notes && (
          <div className="text-xs text-gray-400 truncate mt-0.5">
            {task.notes.substring(0, 30)}{task.notes.length > 30 ? '...' : ''}
          </div>
        )}
      </div>

      {/* Timeline area */}
      <div className="relative flex-1 h-12">
        {/* Grid lines for weeks */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: 53 }).map((_, i) => (
            <div
              key={i}
              className={`flex-shrink-0 h-full border-l ${
                i % 4 === 0 ? 'border-gray-300' : 'border-gray-100'
              }`}
              style={{ width: dayWidth * 7 }}
            />
          ))}
        </div>

        {/* Task bar */}
        <TaskBar
          task={task}
          person={person}
          projectStartDate={projectStartDate}
          dayWidth={dayWidth}
          onUpdate={onUpdate}
          onClick={onClick}
        />
      </div>
    </div>
  );
}
