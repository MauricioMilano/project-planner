import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
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
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [name, setName] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(5);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showDetailed, setShowDetailed] = useState(false);
  
  const colors = currentTheme.colors;

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

  const statusOptions = [
    { value: 'todo', label: t('task.todo'), icon: AlertCircle, color: colors.statusTodo },
    { value: 'in-progress', label: t('task.inProgress'), icon: Clock, color: colors.statusInProgress },
    { value: 'done', label: t('task.done'), icon: CheckCircle, color: colors.statusDone }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        className="rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.card }}
      >
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            {task ? t('task.editTitle') : t('task.addTitle')}
          </h2>
          <div className="flex items-center gap-2">
            {task && (
              <button
                onClick={() => {
                  if (confirm(t('task.deleteConfirm'))) {
                    onClose();
                  }
                }}
                className="p-2 rounded transition-colors"
                style={{ color: colors.textSecondary }}
                title={t('common.delete')}
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded transition-colors"
              style={{ color: colors.textSecondary }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                {t('task.taskNameLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('task.taskNamePlaceholder')}
                className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: colors.input,
                  border: `1px solid ${colors.inputBorder}`,
                  color: colors.textPrimary
                }}
                required
              />
            </div>

            {!task && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailed(false)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${!showDetailed ? 'font-medium' : ''}`}
                  style={{ 
                    backgroundColor: !showDetailed ? colors.buttonPrimary : 'transparent',
                    color: !showDetailed ? colors.buttonSecondary : colors.textSecondary
                  }}
                >
                  {t('task.quickAdd')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailed(true)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${showDetailed ? 'font-medium' : ''}`}
                  style={{ 
                    backgroundColor: showDetailed ? colors.buttonPrimary : 'transparent',
                    color: showDetailed ? colors.buttonSecondary : colors.textSecondary
                  }}
                >
                  {t('task.detailed')}
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                {t('task.assigneeLabel')}
              </label>
              <select
                value={assigneeId || ''}
                onChange={(e) => setAssigneeId(e.target.value || null)}
                className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  backgroundColor: colors.input,
                  border: `1px solid ${colors.inputBorder}`,
                  color: colors.textPrimary
                }}
              >
                <option value="">{t('task.unassigned')}</option>
                {people.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name} {person.role && `(${person.role})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  {t('task.startDate')}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{ 
                    backgroundColor: colors.input,
                    border: `1px solid ${colors.inputBorder}`,
                    color: colors.textPrimary
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  {t('task.duration')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{ 
                    backgroundColor: colors.input,
                    border: `1px solid ${colors.inputBorder}`,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>

            {isValidDate(startDate) && duration > 0 && (
              <div className="text-sm flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
                <Calendar size={14} />
                {t('task.endsOn')} {formatDate(getEndDate(startDate, duration))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                {t('task.priority')}
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(p => {
                  const priorityColor = p === 'high' ? colors.priorityHigh : p === 'medium' ? colors.priorityMedium : colors.priorityLow;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                      style={{ 
                        backgroundColor: priority === p ? priorityColor : colors.card,
                        color: priority === p ? '#ffffff' : colors.textPrimary,
                        border: `1px solid ${priority === p ? 'transparent' : colors.border}`
                      }}
                    >
                      {t(`task.${p}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                {t('task.status')}
              </label>
              <div className="flex gap-2">
                {statusOptions.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(value as any)}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                    style={{ 
                      backgroundColor: status === value ? color : colors.card,
                      color: status === value ? '#ffffff' : colors.textPrimary,
                      border: `1px solid ${status === value ? 'transparent' : colors.border}`
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {showDetailed && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    <span className="flex items-center gap-1.5">
                      <Link2 size={14} />
                      {t('task.dependencies')}
                    </span>
                  </label>
                  {availableTasks.length === 0 ? (
                    <p className="text-sm italic" style={{ color: colors.textSecondary }}>
                      {t('task.noOtherTasks')}
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableTasks.map(task => (
                        <label
                          key={task.id}
                          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors"
                          style={{ 
                            backgroundColor: dependencies.includes(task.id) ? colors.cardHover : 'transparent'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={dependencies.includes(task.id)}
                            onChange={() => toggleDependency(task.id)}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: colors.accent }}
                          />
                          <span className="text-sm" style={{ color: colors.textPrimary }}>{task.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                    {t('task.notesLabel')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('task.notesPlaceholder')}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
                    style={{ 
                      backgroundColor: colors.input,
                      border: `1px solid ${colors.inputBorder}`,
                      color: colors.textPrimary
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div 
            className="px-6 py-4 flex gap-3"
            style={{ 
              borderTop: `1px solid ${colors.border}`,
              backgroundColor: colors.secondary
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-medium transition-colors"
              style={{ 
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary,
                backgroundColor: colors.card
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !isValidDate(startDate)}
              className="flex-1 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: colors.buttonPrimary,
                color: colors.buttonSecondary
              }}
            >
              {task ? t('task.saveChanges') : t('task.addTask')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}