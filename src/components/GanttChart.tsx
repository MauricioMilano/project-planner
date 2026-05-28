import React, { useRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';
import { GanttHeader } from './GanttHeader';
import { GanttRow } from './GanttRow';
import { TaskModal } from './TaskModal';
import { differenceInDays, addDays } from '../hooks/useGanttCalculations';
import { Plus, ChevronLeft, ChevronRight, GripVertical, MoreHorizontal, Copy, Edit2 } from 'lucide-react';
import { Task } from '../types';
import { useSettings } from './SettingsModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const MIN_TASKS_VISIBLE = 10;

interface SortableTaskRowProps {
  task: Task;
  index: number;
  projectStartDate: string;
  dayWidth: number;
  onTaskClick: (task: Task) => void;
}

function SortableTaskRow({ task, index, onTaskClick }: SortableTaskRowProps) {
  const { addTask } = useProject();
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDuplicateTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicatedTask: Omit<Task, 'id'> = {
      name: `${task.name} (copy)`,
      startDate: task.startDate,
      duration: task.duration,
      assigneeId: task.assigneeId,
      dependencies: task.dependencies || [],
      priority: task.priority,
      status: task.status,
      notes: task.notes || '',
    };
    addTask(duplicatedTask);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`h-12 flex items-center cursor-pointer hover:opacity-80 ${isDragging ? 'z-50 shadow-lg' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="h-full flex items-center px-2 cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          e.stopPropagation();
          onTaskClick(task);
        }}
      >
        <GripVertical size={14} style={{ color: colors.textSecondary }} />
      </div>
      <div className="flex-1 px-2 min-w-0">
        <span 
          className="text-sm truncate block" 
          style={{ color: colors.textPrimary }}
          title={task.name}
        >
          {task.name}
        </span>
      </div>
      <div className="pr-2" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-md hover:bg-opacity-10 transition-colors"
              style={{ color: colors.textSecondary }}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onTaskClick(task);
            }}>
              <Edit2 className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicateTask}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Duplicate</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function GanttChart() {
  const { t } = useTranslation();
  const { state, updateTask, addTask, reorderTasks, deleteTask } = useProject();
  const { currentTheme } = useTheme();
  const settings = useSettings();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const colors = currentTheme.colors;
  const dayWidth = settings.dayWidth;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { projectStartDate, projectEndDate, totalDays } = useMemo(() => {
    if (state.tasks.length === 0) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      const startStr = start.toISOString().split('T')[0];
      const end = addDays(startStr, 90);
      return {
        projectStartDate: startStr,
        projectEndDate: end,
        totalDays: 90
      };
    }

    const dates = state.tasks.flatMap(task => [task.startDate, addDays(task.startDate, task.duration)]);
    const minDate = dates.reduce((min, d) => d < min ? d : min);
    const maxDate = dates.reduce((max, d) => d > max ? d : max);
    
    const startDate = addDays(minDate, -7);
    const endDate = addDays(maxDate, 14);
    const days = Math.max(differenceInDays(startDate, endDate) + 1, 60);

    return {
      projectStartDate: startDate,
      projectEndDate: endDate,
      totalDays: days
    };
  }, [state.tasks]);

  const getPersonById = (id: string | null) => {
    return state.people.find(p => p.id === id) || null;
  };

  const handleEmptyClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = scrollRef.current?.scrollLeft || 0;
    const x = e.clientX - rect.left + scrollLeft - 192;
    
    if (x > 0) {
      const dayOffset = Math.floor(x / dayWidth);
      const clickedDate = addDays(projectStartDate, dayOffset);
      setNewTaskDate(clickedDate);
      setSelectedTask(null);
      setIsModalOpen(true);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setNewTaskDate(null);
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setNewTaskDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'> & { id?: string }) => {
    if (taskData.id) {
      updateTask(taskData as Task);
    } else {
      addTask(taskData);
    }
    setIsModalOpen(false);
    setSelectedTask(null);
    setNewTaskDate(null);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = state.tasks.findIndex(task => task.id === active.id);
      const newIndex = state.tasks.findIndex(task => task.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderTasks(oldIndex, newIndex);
      }
    }
  };

  const scrollToToday = () => {
    if (scrollRef.current) {
      const today = new Date().toISOString().split('T')[0];
      const daysUntilToday = differenceInDays(projectStartDate, today);
      const scrollPosition = Math.max(0, daysUntilToday * dayWidth - 200);
      scrollRef.current.scrollLeft = scrollPosition;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        style={{ backgroundColor: colors.background }}
      >
        {/* Toolbar */}
        <div 
          className="flex items-center justify-between px-4 py-3"
          style={{ 
            backgroundColor: colors.card,
            borderBottom: `1px solid ${colors.border}`
          }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium" style={{ color: colors.textPrimary }}>{t('gantt.title')}</h2>
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              {state.tasks.length} {state.tasks.length !== 1 ? t('export.taskCount') : t('task.taskNameLabel').toLowerCase()}
            </span>
            <span className="text-xs ml-2" style={{ color: colors.textSecondary }}>
              {t('gantt.dragToReorder')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollToToday}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{ 
                color: colors.textSecondary,
                backgroundColor: 'transparent'
              }}
            >
              {t('gantt.today')}
            </button>
            <button
              onClick={() => scrollRef.current && (scrollRef.current.scrollLeft -= 200)}
              className="p-1.5 rounded-md transition-colors"
              style={{ 
                color: colors.textSecondary,
                backgroundColor: 'transparent'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollRef.current && (scrollRef.current.scrollLeft += 200)}
              className="p-1.5 rounded-md transition-colors"
              style={{ 
                color: colors.textSecondary,
                backgroundColor: 'transparent'
              }}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={handleAddTask}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              style={{ 
                backgroundColor: colors.buttonPrimary,
                color: colors.buttonSecondary
              }}
            >
              <Plus size={14} />
              {t('header.addTask')}
            </button>
          </div>
        </div>

        {/* Gantt content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Fixed left column */}
          <div 
            className="w-48 flex-shrink-0 flex flex-col"
            style={{ borderRight: `1px solid ${colors.border}` }}
          >
            <div 
              className="h-12 flex items-center px-3"
              style={{ 
                backgroundColor: colors.secondary,
                borderBottom: `1px solid ${colors.border}`
              }}
            >
              <GripVertical size={14} className="mr-2" style={{ color: colors.textSecondary }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>{t('gantt.task')}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {state.tasks.length === 0 ? (
                <div className="h-20 flex items-center justify-center">
                  <span className="text-xs" style={{ color: colors.textSecondary }}>{t('gantt.noTasks')}</span>
                </div>
              ) : (
                <SortableContext
                  items={state.tasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {state.tasks.map((task, index) => (
                    <SortableTaskRow
                      key={task.id}
                      task={task}
                      index={index}
                      projectStartDate={projectStartDate}
                      dayWidth={dayWidth}
                      onTaskClick={handleTaskClick}
                    />
                  ))}
                </SortableContext>
              )}
              {state.tasks.length < MIN_TASKS_VISIBLE &&
                Array.from({ length: MIN_TASKS_VISIBLE - state.tasks.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="h-12 flex items-center px-3"
                    style={{ 
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: i % 2 === 0 ? colors.card : colors.background
                    }}
                  />
                ))
              }
            </div>
          </div>

          {/* Scrollable timeline */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto overflow-y-auto"
            onClick={handleEmptyClick}
          >
            <div style={{ width: totalDays * dayWidth, minWidth: '100%' }}>
              <div className="sticky top-0 z-10">
                <GanttHeader
                  projectStartDate={projectStartDate}
                  projectEndDate={projectEndDate}
                  dayWidth={dayWidth}
                />
              </div>

              <div className="relative" style={{ minHeight: Math.max(state.tasks.length, MIN_TASKS_VISIBLE) * 48 }}>
                {state.tasks.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center py-12">
                      <div 
                        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: colors.secondary }}
                      >
                        <svg
                          className="w-8 h-8"
                          style={{ color: colors.textSecondary }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                      <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>{t('gantt.noTasks')}</p>
                      <p className="text-xs mb-4" style={{ color: colors.textSecondary, opacity: 0.7 }}>
                        {t('gantt.noTasksHint')}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTask();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                        style={{ 
                          backgroundColor: colors.buttonPrimary,
                          color: colors.buttonSecondary
                        }}
                      >
                        <Plus size={14} />
                        {t('gantt.addFirstTask')}
                      </button>
                    </div>
                  </div>
                ) : (
                  state.tasks.map((task, index) => (
                    <GanttRow
                      key={task.id}
                      task={task}
                      person={getPersonById(task.assigneeId)}
                      projectStartDate={projectStartDate}
                      dayWidth={dayWidth}
                      onUpdate={updateTask}
                      onClick={() => handleTaskClick(task)}
                      isEven={index % 2 === 0}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
            setNewTaskDate(null);
          }}
          task={selectedTask}
          defaultStartDate={newTaskDate}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          people={state.people}
          allTasks={state.tasks}
        />
      </div>
    </DndContext>
  );
}