import React, { useState, useRef, useEffect } from 'react';
import { Task, Person } from '../types';
import { calculateTaskPosition, getEndDate, differenceInDays, addDays, formatDate, getInitials } from '../hooks/useGanttCalculations';
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface TaskBarProps {
  task: Task;
  person: Person | null;
  projectStartDate: string;
  dayWidth: number;
  onUpdate: (task: Task) => void;
  onClick: () => void;
}

export function TaskBar({ task, person, projectStartDate, dayWidth, onUpdate, onClick }: TaskBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const dragStartRef = useRef({ x: 0, startDate: '', duration: 0 });

  const position = calculateTaskPosition(task.startDate, projectStartDate, dayWidth);
  const width = task.duration * dayWidth;
  const endDate = getEndDate(task.startDate, task.duration);

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return { bg: '#aa2d00', text: '#ffffff' };
      case 'medium': return { bg: '#1b61c9', text: '#ffffff' };
      case 'low': return { bg: '#0a2e0e', text: '#ffffff' };
      default: return { bg: '#41454d', text: '#ffffff' };
    }
  };

  const getStatusStyles = (): { bg: string; pattern: string; icon: React.ReactNode; textColor: string } => {
    switch (task.status) {
      case 'done':
        return {
          bg: '#006400',
          pattern: '',
          icon: <CheckCircle size={14} className="text-white/80" />,
          textColor: '#ffffff'
        };
      case 'in-progress':
        return {
          bg: getPriorityColor().bg,
          pattern: '',
          icon: <Clock size={14} className="text-white/80" />,
          textColor: '#ffffff'
        };
      case 'todo':
        return {
          bg: '#f8fafc',
          pattern: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 8px)',
          icon: <AlertCircle size={14} className="text-gray-400" />,
          textColor: '#181d26'
        };
      default:
        return {
          bg: getPriorityColor().bg,
          pattern: '',
          icon: null,
          textColor: '#ffffff'
        };
    }
  };

  const colors = getPriorityColor();
  const statusStyles = getStatusStyles();
  const isLightBg = task.status === 'todo';

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'move') {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        startDate: task.startDate,
        duration: task.duration
      };
    } else {
      setIsResizing(type);
      dragStartRef.current = {
        x: e.clientX,
        startDate: task.startDate,
        duration: task.duration
      };
    }
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const daysDelta = Math.round(deltaX / dayWidth);

      if (isDragging) {
        const newStartDate = addDays(dragStartRef.current.startDate, daysDelta);
        onUpdate({
          ...task,
          startDate: newStartDate
        });
      } else if (isResizing === 'right') {
        const newDuration = Math.max(1, dragStartRef.current.duration + daysDelta);
        onUpdate({
          ...task,
          duration: newDuration
        });
      } else if (isResizing === 'left') {
        const newStartDate = addDays(dragStartRef.current.startDate, daysDelta);
        const newDuration = Math.max(1, dragStartRef.current.duration - daysDelta);
        if (newDuration >= 1) {
          onUpdate({
            ...task,
            startDate: newStartDate,
            duration: newDuration
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, task, dayWidth, onUpdate]);

  return (
    <div
      className="absolute h-8 rounded-md cursor-pointer group select-none"
      style={{
        left: position,
        width: Math.max(width, dayWidth),
        backgroundColor: statusStyles.bg,
        backgroundImage: statusStyles.pattern,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/10 rounded-l-md"
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      />

      {/* Main content */}
      <div
        className="h-full flex items-center px-2 gap-1.5 overflow-hidden"
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        {person && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
            style={{ backgroundColor: person.color, color: '#fff' }}
          >
            {getInitials(person.name)}
          </div>
        )}
        
        <span 
          className="text-xs font-medium truncate"
          style={{ color: statusStyles.textColor }}
        >
          {task.name}
        </span>

        {statusStyles.icon && (
          <span className="ml-auto flex-shrink-0">
            {statusStyles.icon}
          </span>
        )}
      </div>

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/10 rounded-r-md"
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      />

      {/* Tooltip - Portal to body to avoid overflow clipping */}
      {showTooltip && (
        <div
          className="fixed z-[9999] px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
          style={{
            transform: 'translateX(-50%)',
            bottom: 'calc(100% + 8px)',
            left: '50%'
          }}
        >
          <div className="font-medium">{task.name}</div>
          <div className="text-gray-300 mt-1">
            {formatDate(task.startDate)} → {formatDate(endDate)}
          </div>
          <div className="text-gray-300">
            {task.duration} day{task.duration !== 1 ? 's' : ''} • {task.priority} priority
          </div>
          {person && (
            <div className="text-gray-300">
              Assigned to {person.name}
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
