import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Person, Task } from '../types';
import { getInitials } from '../hooks/useGanttCalculations';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { AddPersonModal } from './AddPersonModal';
import { useProject } from '../context/ProjectContext';

interface PersonCardProps {
  person: Person;
  tasks: Task[];
}

export function PersonCard({ person, tasks }: PersonCardProps) {
  const { deletePerson } = useProject();
  const { currentTheme } = useTheme();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const colors = currentTheme.colors;
  const assignedTasks = tasks.filter(t => t.assigneeId === person.id);
  const totalDays = assignedTasks.reduce((sum, t) => sum + t.duration, 0);

  return (
    <>
      <div 
        className="rounded-lg p-4 transition-shadow hover:shadow-md"
        style={{ 
          backgroundColor: colors.card,
          border: `1px solid ${colors.border}`
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0"
            style={{ backgroundColor: person.color }}
          >
            {getInitials(person.name)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium truncate" style={{ color: colors.textPrimary }}>{person.name}</h3>
                {person.role && (
                  <p className="text-sm truncate" style={{ color: colors.textSecondary }}>{person.role}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="p-1 rounded transition-colors"
                  style={{ color: colors.textSecondary }}
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${person.name} from the team?`)) {
                      deletePerson(person.id);
                    }
                  }}
                  className="p-1 rounded transition-colors"
                  style={{ color: colors.textSecondary }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: colors.textSecondary }}
              >
                {assignedTasks.length} task{assignedTasks.length !== 1 ? 's' : ''}
                {assignedTasks.length > 0 && ` • ${totalDays} day${totalDays !== 1 ? 's' : ''} total`}
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {isExpanded && assignedTasks.length > 0 && (
                <div className="mt-2 space-y-1">
                  {assignedTasks.map(task => (
                    <div
                      key={task.id}
                      className="text-xs truncate pl-2"
                      style={{ 
                        color: colors.textSecondary,
                        borderLeft: `2px solid ${getPriorityColor(task.priority)}`
                      }}
                    >
                      {task.name} ({task.duration}d)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddPersonModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editPerson={person}
      />
    </>
  );
}

function getPriorityColor(priority: string): string {
  // Use a fallback since we don't have access to theme context in this function
  switch (priority) {
    case 'high': return '#aa2d00';
    case 'medium': return '#1b61c9';
    case 'low': return '#0a2e0e';
    default: return '#41454d';
  }
}