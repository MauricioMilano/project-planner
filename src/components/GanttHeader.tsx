import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { getMonthsBetween, differenceInDays, formatDateToISO } from '../hooks/useGanttCalculations';

interface GanttHeaderProps {
  projectStartDate: string;
  projectEndDate: string;
  dayWidth: number;
}

export function GanttHeader({ projectStartDate, projectEndDate, dayWidth }: GanttHeaderProps) {
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;
  
  const months = getMonthsBetween(projectStartDate, projectEndDate);
  
  // Calculate month widths in the project timeline
  const monthElements = months.map((month, idx) => {
    // Find the actual position of this month in the timeline
    const monthStart = formatDateToISO(new Date(month.year, months.indexOf(month) < months.findIndex((m, i) => 
      m.month === month.month && m.year === month.year && i !== months.findIndex(mm => mm.month === month.month && mm.year === month.year)
    ) ? month.year : month.year, month.month === 'Jan' ? 0 : 
      ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month.month) || 0, 1));
    
    // Calculate actual display properties
    let startOffset = 0;
    let displayDays = month.daysInMonth;
    
    if (idx === 0) {
      const projStart = new Date(projectStartDate);
      const monthStartDate = new Date(month.year, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month.month), 1);
      if (projStart.getMonth() === monthStartDate.getMonth() && projStart.getFullYear() === monthStartDate.getFullYear()) {
        startOffset = projStart.getDate() - 1;
        displayDays = month.daysInMonth - startOffset;
      }
    }
    
    if (idx === months.length - 1) {
      const projEnd = new Date(projectEndDate);
      const monthEndDate = new Date(month.year, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month.month) + 1, 0);
      if (projEnd.getMonth() === monthEndDate.getMonth() && projEnd.getFullYear() === monthEndDate.getFullYear()) {
        displayDays = projEnd.getDate() - (idx === 0 ? startOffset : 0);
      }
    }

    return (
      <div
        key={`${month.month}-${month.year}`}
        className="flex-shrink-0 px-3 py-2"
        style={{ 
          width: displayDays * dayWidth,
          minWidth: displayDays * dayWidth,
          borderLeft: `1px solid ${colors.border}`,
          backgroundColor: colors.card
        }}
      >
        <div 
          className="text-sm font-medium whitespace-nowrap"
          style={{ color: colors.textPrimary }}
        >
          {month.month} {month.year}
        </div>
        <div className="text-xs" style={{ color: colors.textSecondary }}>
          {displayDays} days
        </div>
      </div>
    );
  });

  return (
    <div 
      className="flex border-b"
      style={{ 
        backgroundColor: colors.card,
        borderColor: colors.border
      }}
    >
      {/* Row label column */}
      <div 
        className="w-48 flex-shrink-0 px-4 py-2 bg-white"
        style={{ 
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: colors.card
        }}
      >
        <span 
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: colors.textSecondary }}
        >
          Task
        </span>
      </div>
      
      {/* Timeline months */}
      <div className="flex flex-1 overflow-hidden">
        {monthElements}
      </div>
    </div>
  );
}