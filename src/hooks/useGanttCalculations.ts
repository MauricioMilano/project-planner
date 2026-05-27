// Date utilities for Gantt chart calculations

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToISO(date);
}

export function differenceInDays(startDate: string, endDate: string): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getEndDate(startDate: string, duration: number): string {
  return addDays(startDate, duration);
}

export function getMonthsBetween(startDate: string, endDate: string): { month: string; year: number; startDay: number; daysInMonth: number }[] {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const months: { month: string; year: number; startDay: number; daysInMonth: number }[] = [];
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDayOfMonth = current.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate the start day relative to project start
    const startDay = current < start 
      ? 1 - differenceInDays(formatDateToISO(current), startDate)
      : 1;
    
    months.push({
      month: monthNames[month],
      year,
      startDay,
      daysInMonth: Math.min(daysInMonth, differenceInDays(startDate, formatDateToISO(new Date(year, month + 1, 0))) + 1)
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

export function formatMonthYear(month: string, year: number): string {
  return `${month} ${year}`;
}

export function formatDate(dateStr: string): string {
  try {
    const date = parseDate(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function calculateTaskPosition(
  taskStartDate: string,
  projectStartDate: string,
  dayWidth: number
): number {
  const daysDiff = differenceInDays(projectStartDate, taskStartDate);
  return Math.max(0, daysDiff * dayWidth);
}

export function calculateWorkloadForPerson(
  personId: string,
  tasks: { assigneeId: string | null; duration: number }[],
  totalCapacity: number
): number {
  const assignedTasks = tasks.filter(t => t.assigneeId === personId);
  const totalDays = assignedTasks.reduce((sum, t) => sum + t.duration, 0);
  if (totalCapacity === 0) return 0;
  return Math.min(100, (totalDays / totalCapacity) * 100);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = parseDate(dateStr);
  return !isNaN(date.getTime());
}
