import React, { useRef, useMemo, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { GanttHeader } from './GanttHeader';
import { GanttRow } from './GanttRow';
import { TaskModal } from './TaskModal';
import { differenceInDays, addDays } from '../hooks/useGanttCalculations';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../types';

const DAY_WIDTH = 32;
const MIN_TASKS_VISIBLE = 10;

export function GanttChart() {
  const { state, updateTask, addTask } = useProject();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    const dates = state.tasks.flatMap(t => [t.startDate, addDays(t.startDate, t.duration)]);
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
    const x = e.clientX - rect.left + scrollLeft - 192; // Subtract sidebar width
    
    if (x > 0) {
      const dayOffset = Math.floor(x / DAY_WIDTH);
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

  const scrollToToday = () => {
    if (scrollRef.current) {
      const today = new Date().toISOString().split('T')[0];
      const daysUntilToday = differenceInDays(projectStartDate, today);
      const scrollPosition = Math.max(0, daysUntilToday * DAY_WIDTH - 200);
      scrollRef.current.scrollLeft = scrollPosition;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-700">Timeline</h2>
          <span className="text-xs text-gray-400">
            {state.tasks.length} task{state.tasks.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={scrollToToday}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Today
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
            Add Task
          </button>
        </div>
      </div>

      {/* Gantt content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed left column */}
        <div className="w-48 flex-shrink-0 border-r border-gray-200 flex flex-col">
          <GanttHeader
            projectStartDate={projectStartDate}
            projectEndDate={projectEndDate}
            dayWidth={DAY_WIDTH}
          />
        </div>

        {/* Scrollable timeline */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-auto"
          onClick={handleEmptyClick}
        >
          <div style={{ width: totalDays * DAY_WIDTH, minWidth: '100%' }}>
            {/* Month headers */}
            <div className="sticky top-0 z-10">
              <GanttHeader
                projectStartDate={projectStartDate}
                projectEndDate={projectEndDate}
                dayWidth={DAY_WIDTH}
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
                    <p className="text-sm text-gray-500 mb-1">No tasks yet</p>
                    <p className="text-xs text-gray-400 mb-4">
                      Click on the timeline or use the button above to add tasks
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTask();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#181d26] text-white text-sm font-medium rounded-lg hover:bg-[#0d1218] transition-colors"
                    >
                      <Plus size={14} />
                      Add First Task
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
                    dayWidth={DAY_WIDTH}
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
  );
}
