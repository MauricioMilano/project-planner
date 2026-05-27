import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { ProjectState, ProjectAction, Person, Task } from '../types';

const AVATAR_COLORS = [
  '#aa2d00', '#1b61c9', '#0a2e0e', '#d9a441', '#8b4513',
  '#2e8b57', '#4169e1', '#9932cc', '#8b0000', '#2f4f4f'
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const initialState: ProjectState = {
  people: [],
  tasks: [],
  projectStartDate: new Date().toISOString().split('T')[0],
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'ADD_PERSON':
      return { ...state, people: [...state.people, action.payload] };
    case 'UPDATE_PERSON':
      return {
        ...state,
        people: state.people.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PERSON':
      return {
        ...state,
        people: state.people.filter(p => p.id !== action.payload),
        tasks: state.tasks.map(t => 
          t.assigneeId === action.payload ? { ...t, assigneeId: null } : t
        ),
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface ProjectContextType {
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
  addPerson: (name: string, role?: string, capacity?: number) => Person;
  updatePerson: (person: Person) => void;
  deletePerson: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  getAvatarColor: (name: string) => string;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'project-planner-state';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.error('Failed to load state from localStorage', e);
      }
    }
  }, []);

  // Save to localStorage with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [state]);

  const addPerson = useCallback((name: string, role?: string, capacity: number = 100): Person => {
    const person: Person = {
      id: crypto.randomUUID(),
      name,
      role,
      capacity,
      color: getAvatarColor(name),
    };
    dispatch({ type: 'ADD_PERSON', payload: person });
    return person;
  }, []);

  const updatePerson = useCallback((person: Person) => {
    dispatch({ type: 'UPDATE_PERSON', payload: person });
  }, []);

  const deletePerson = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PERSON', payload: id });
  }, []);

  const addTask = useCallback((taskData: Omit<Task, 'id'>): Task => {
    const task: Task = {
      ...taskData,
      id: crypto.randomUUID(),
    };
    dispatch({ type: 'ADD_TASK', payload: task });
    return task;
  }, []);

  const updateTask = useCallback((task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const value: ProjectContextType = {
    state,
    dispatch,
    addPerson,
    updatePerson,
    deletePerson,
    addTask,
    updateTask,
    deleteTask,
    getAvatarColor,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
