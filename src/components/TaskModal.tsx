import React, { useState, useEffect } from 'react';
import { Task, Person } from '../types';
import { X, Trash2, Link2, AlertCircle, Clock, CheckCircle, Calendar } from 'lucide-react';
import { formatDate, getEndDate, isValidDate } from '../hooks/useGanttCalculations';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  defaultStartDate: string | null;
  onSave: (task: Omit<Task, 'id'> & { id?: string }) => void;
  people: Person[];
  allTasks: Task[];
}

export function TaskModal({
  isOpen,
  onClose,
  task,
  defaultStartDate,
  onSave,
  people,
  allTasks
}: TaskModalProps) {
  const [name, setName] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(5);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showDetailed, setShowDetailed] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setAssigneeId(task.assigneeId);
      setStartDate(task.startDate);
      setDuration(task.duration);
      setPriority(task.priority);
      setStatus(task.status);
      setDependencies(task.dependencies);
      setNotes(task.notes);
      setShowDetailed(true);
    } else {
      setName('');
      setAssigneeId(null);
      setStartDate(defaultStartDate || new Date().toISOString().split('T')[0]);
      setDuration(5);
      setPriority('medium');
      setStatus('todo');
      setDependencies([]);
      setNotes('');
      setShowDetailed(false);
    }
  }, [task, isOpen, defaultStartDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !isValidDate(startDate)) return;

    onSave({
      id: task?.id,
      name: name.trim(),
      assigneeId,
      startDate,
      duration: Math.max(1, duration),
      priority,
      status,
      dependencies,
      notes: notes.trim()
    });
  };

  const toggleDependency = (taskId: string) => {
    setDependencies(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const availableTasks = allTasks.filter(t => t.id !== task?.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Add Task'}
          </h2>
          <div className="flex items-center gap-2">
            {task && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    onSave({ ...task, id: task.id } as any);
                    onClose();
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete task"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Task name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Design new landing page"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Quick mode toggle (only for new tasks) */}
            {!task && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailed(false)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    !showDetailed
                      ? 'bg-[#181d26] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Quick Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailed(true)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    showDetailed
                      ? 'bg-[#181d26] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Detailed
                </button>
              </div>
            )}

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={assigneeId || ''}
                onChange={(e) => setAssigneeId(e.target.value || null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Unassigned</option>
                {people.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name} {person.role && `(${person.role})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* End date display */}
            {isValidDate(startDate) && duration > 0 && (
              <div className="text-sm text-gray-500 flex items-center gap-1.5">
                <Calendar size={14} />
                Ends on {formatDate(getEndDate(startDate, duration))}
              </div>
            )}

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border-2 ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-[#aa2d00] text-white border-[#aa2d00]'
                          : p === 'medium'
                          ? 'bg-[#1b61c9] text-white border-[#1b61c9]'
                          : 'bg-[#0a2e0e] text-white border-[#0a2e0e]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {([
                  { value: 'todo', label: 'To Do', icon: AlertCircle },
                  { value: 'in-progress', label: 'In Progress', icon: Clock },
                  { value: 'done', label: 'Done', icon: CheckCircle }
                ] as const).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border-2 flex items-center justify-center gap-1.5 ${
                      status === value
                        ? value === 'done'
                          ? 'bg-green-600 text-white border-green-600'
                          : value === 'in-progress'
                          ? 'bg-[#1b61c9] text-white border-[#1b61c9]'
                          : 'bg-gray-500 text-white border-gray-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed section */}
            {showDetailed && (
              <>
                {/* Dependencies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Link2 size={14} />
                      Dependencies
                    </span>
                  </label>
                  {availableTasks.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">
                      No other tasks to depend on
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableTasks.map(t => (
                        <label
                          key={t.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={dependencies.includes(t.id)}
                            onChange={() => toggleDependency(t.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{t.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional details, requirements, or context..."
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !isValidDate(startDate)}
              className="flex-1 py-2.5 bg-[#181d26] text-white rounded-lg font-medium hover:bg-[#0d1218] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}