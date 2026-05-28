import React, { useState } from 'react';
import { Person, Task } from '../types';
import { getInitials, calculateWorkloadForPerson } from '../hooks/useGanttCalculations';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { AddPersonModal } from './AddPersonModal';
import { useProject } from '../context/ProjectContext';
import { useSettings } from './SettingsModal';

interface PersonCardProps {
  person: Person;
  tasks: Task[];
}

export function PersonCard({ person, tasks }: PersonCardProps) {
  const { deletePerson } = useProject();
  const settings = useSettings();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate workload based on working days per week setting
  const assignedTasks = tasks.filter(t => t.assigneeId === person.id);
  const totalCapacity = (person.capacity / 100) * settings.workingDaysPerWeek * 4; // Monthly capacity in days
  const totalTaskDays = assignedTasks.reduce((sum, t) => sum + t.duration, 0);
  const workload = totalCapacity > 0 ? Math.min(100, (totalTaskDays / totalCapacity) * 100) : 0;

  const getWorkloadColor = (w: number) => {
    if (w > 100) return 'bg-red-500';
    if (w > 80) return 'bg-yellow-500';
    if (w > 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                <h3 className="font-medium text-gray-900 truncate">{person.name}</h3>
                {person.role && (
                  <p className="text-sm text-gray-500 truncate">{person.role}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Capacity: {person.capacity}% ({settings.workingDaysPerWeek} days/week)</span>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  {assignedTasks.length} task{assignedTasks.length !== 1 ? 's' : ''}
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getWorkloadColor(workload)}`}
                  style={{ width: `${Math.min(workload, 100)}%` }}
                />
              </div>

              {isExpanded && assignedTasks.length > 0 && (
                <div className="mt-2 space-y-1">
                  {assignedTasks.map(task => (
                    <div
                      key={task.id}
                      className="text-xs text-gray-600 truncate pl-2 border-l-2"
                      style={{ borderColor: getPriorityColor(task.priority) }}
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
  switch (priority) {
    case 'high': return '#aa2d00';
    case 'medium': return '#1b61c9';
    case 'low': return '#0a2e0e';
    default: return '#41454d';
  }
}