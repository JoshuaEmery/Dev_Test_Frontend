// Context-specific types for task management
import {
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '../services/types';

// Context state interface
export interface ITaskContextState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Action types for useReducer
export type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'REMOVE_TASK'; payload: number }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' }
  // Optimistic update actions
  | { type: 'OPTIMISTIC_ADD_TASK'; payload: Task }
  | { type: 'OPTIMISTIC_UPDATE_TASK'; payload: Task }
  | { type: 'OPTIMISTIC_REMOVE_TASK'; payload: number }
  | { type: 'REVERT_OPTIMISTIC_ADD'; payload: number }
  | { type: 'REVERT_OPTIMISTIC_UPDATE'; payload: Task }
  | { type: 'REVERT_OPTIMISTIC_REMOVE'; payload: Task };

// Context value interface
export interface ITaskContextValue {
  // State
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  getTasks: () => Promise<void>;
  getTask: (id: number) => Promise<Task | null>;
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: number, data: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  clearError: () => void;
  refreshTasks: () => Promise<void>;
}

// Provider props interface
export interface ITaskProviderProps {
  children: React.ReactNode;
}
