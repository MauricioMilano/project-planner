import React from 'react';
import { getMonthsBetween, differenceInDays, parseDate, formatDateToISO } from '../hooks/useGanttCalculations';

interface GanttHeaderProps {
  projectStartDate: string;
  projectEndDate: string;
  dayWidth: number;
}

export function GanttHeader({ projectStartDate, projectEndDate, dayWidth }: GanttHeaderProps) {
  const months = getMonthsBetween(projectStartDate, projectEndDate);
  const totalDays = differenceInDays(projectStartDate, projectEndDate) + 1;
  
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
      const projStart = parseDate(projectStartDate);
      const monthStartDate = new Date(month.year, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month.month), 1);
      if (projStart.getMonth() === monthStartDate.getMonth() && projStart.getFullYear() === monthStartDate.getFullYear()) {
        startOffset = projStart.getDate() - 1;
        displayDays = month.daysInMonth - startOffset;
      }
    }
    
    if (idx === months.length - 1) {
      const projEnd = parseDate(projectEndDate);
      const monthEndDate = new Date(month.year, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month.month) + 1, 0);
      if (projEnd.getMonth() === monthEndDate.getMonth() && projEnd.getFullYear() === monthEndDate.getFullYear()) {
        displayDays = projEnd.getDate() - (idx === 0 ? startOffset : 0);
      }
    }

    return (
      <div
        key={`${month.month}-${month.year}`}
        className="flex-shrink-0 border-l border-gray-200 px-3 py-2 bg-white"
        style={{ 
          width: displayDays * dayWidth,
          minWidth: displayDays * dayWidth
        }}
      >
        <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {month.month} {month.year}
        </div>
        <div className="text-xs text-gray-400">
          {displayDays} days
        </div>
      </div>
    );
  });

  return (
    <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
      {/* Row label column */}
      <div className="w-48 flex-shrink-0 border-r border-gray-200 px-4 py-2 bg-white">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
