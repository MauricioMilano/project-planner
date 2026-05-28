import React, { useRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../context/ProjectContext';
import { GanttHeader } from './GanttHeader';
import { GanttRow } from './GanttRow';
import { TaskModal } from './TaskModal';
import { differenceInDays, addDays } from '../hooks/useGanttCalculations';
import { Plus, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { Task } from '../types';
import { useSettings } from './SettingsModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MIN_TASKS_VISIBLE = 10;

interface SortableTaskRowProps {
  task: Task;
  index: number;
  projectStartDate: string;
  dayWidth: number;
  onTaskClick: (task: Task) => void;
  onUpdate: (task: Task) => void;
}

function SortableTaskRow({ task, index, projectStartDate, dayWidth, onTaskClick, onUpdate }: SortableTaskRowProps) {
  const { state, getPersonById } = useProject();
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

  const person = getPersonById(task.assigneeId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`h-12 flex items-center border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
      } ${isDragging ? 'z-50 shadow-lg' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="h-full flex items-center px-2 cursor-grab active:cursor-grabbing hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          onTaskClick(task);
        }}
      >
        <GripVertical size={14} className="text-gray-400" />
      </div>
      <div className="flex-1 px-2 min-w-0">
        <span className="text-sm text-gray-800 truncate block" title={task.name}>
          {task.name}
        </span>
      </div>
    </div>
  );
}

export function GanttChart() {
  const { t } = useTranslation();
  const { state, updateTask, addTask, reorderTasks } = useProject();
  const settings = useSettings();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Calculate project timeline
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
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-gray-700">{t('gantt.title')}</h2>
            <span className="text-xs text-gray-400">
              {state.tasks.length} {state.tasks.length !== 1 ? t('export.taskCount') : t('task.taskNameLabel').toLowerCase()}
            </span>
            <span className="text-xs text-gray-400 ml-2">
              {t('gantt.dragToReorder')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollToToday}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {t('gantt.today')}
            </button>
            <button
              onClick={() => scrollRef.current && (scrollRef.current.scrollLeft -= 200)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollRef.current && (scrollRef.current.scrollLeft += 200)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={handleAddTask}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181d26] text-white text-sm font-medium rounded-lg hover:bg-[#0d1218] transition-colors"
            >
              <Plus size={14} />
              {t('header.addTask')}
            </button>
          </div>
        </div>

        {/* Gantt content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Fixed left column */}
          <div className="w-48 flex-shrink-0 border-r border-gray-200 flex flex-col">
            {/* Task name column header */}
            <div className="h-12 flex items-center px-3 border-b border-gray-200 bg-gray-50">
              <GripVertical size={14} className="text-gray-400 mr-2" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t('gantt.task')}</span>
            </div>
            {/* Task rows */}
            <div className="flex-1 overflow-y-auto">
              {state.tasks.length === 0 ? (
                <div className="h-20 flex items-center justify-center">
                  <span className="text-xs text-gray-400">{t('gantt.noTasks')}</span>
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
                      onUpdate={updateTask}
                    />
                  ))}
                </SortableContext>
              )}
              {/* Empty rows to maintain alignment with timeline */}
              {state.tasks.length < MIN_TASKS_VISIBLE &&
                Array.from({ length: MIN_TASKS_VISIBLE - state.tasks.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className={`h-12 flex items-center px-3 border-b border-gray-100 ${
                      (state.tasks.length + i) % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
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
              {/* Month headers */}
              <div className="sticky top-0 z-10">
                <GanttHeader
                  projectStartDate={projectStartDate}
                  projectEndDate={projectEndDate}
                  dayWidth={dayWidth}
                />
              </div>

              {/* Task rows */}
              <div className="relative" style={{ minHeight: Math.max(state.tasks.length, MIN_TASKS_VISIBLE) * 48 }}>
                {state.tasks.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
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
                      <p className="text-sm text-gray-500 mb-1">{t('gantt.noTasks')}</p>
                      <p className="text-xs text-gray-400 mb-4">
                        {t('gantt.noTasksHint')}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTask();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#181d26] text-white text-sm font-medium rounded-lg hover:bg-[#0d1218] transition-colors"
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
          people={state.people}
          allTasks={state.tasks}
        />
      </div>
    </DndContext>
  );
}
