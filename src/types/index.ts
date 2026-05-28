export interface Person {
  id: string;
  name: string;
  role?: string;
  color: string; // auto-generated avatar color
}

export interface Task {
  id: string;
  name: string;
  assigneeId: string | null;
  startDate: string; // ISO date string
  duration: number; // in days
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dependencies: string[]; // array of task IDs
  notes: string;
}

export interface ProjectState {
  people: Person[];
  tasks: Task[];
  projectStartDate: string; // ISO date
}

export type ProjectAction =
  | { type: 'ADD_PERSON'; payload: Person }
  | { type: 'UPDATE_PERSON'; payload: Person }
  | { type: 'DELETE_PERSON'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'LOAD_STATE'; payload: ProjectState };