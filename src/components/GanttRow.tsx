import React from 'react';
import { useTheme } from '../context/ThemeContext';
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
  showWeekends?: boolean;
}

export function GanttRow({ task, person, projectStartDate, dayWidth, onUpdate, onClick, isEven }: GanttRowProps) {
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;

  return (
    <div
      className="flex border-b transition-colors hover:opacity-90"
      style={{ 
        backgroundColor: isEven ? colors.card : colors.background,
        borderColor: colors.border
      }}
    >
      {/* Task info column */}
      <div 
        className="w-48 flex-shrink-0 px-4 py-2 bg-white"
        style={{ 
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: colors.card
        }}
      >
        <div className="flex items-center gap-2">
          <span 
            className="text-sm font-medium truncate"
            style={{ color: colors.textPrimary }}
          >
            {task.name}
          </span>
        </div>
        {task.notes && (
          <div 
            className="text-xs truncate mt-0.5"
            style={{ color: colors.textSecondary }}
          >
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
              className="flex-shrink-0 h-full"
              style={{ 
                borderLeft: `1px solid ${i % 4 === 0 ? colors.border : 'transparent'}`,
                width: dayWidth * 7
              }}
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