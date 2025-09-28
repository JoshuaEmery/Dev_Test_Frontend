// Hook-specific types for task management
// These types are specific to the hook layer and provide additional functionality

import { type Task } from '../services/types';

// Hook return type for useTasks
export interface UseTasksReturn {
  // State
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  getTasks: () => Promise<void>;
  getTask: (id: number) => Promise<Task | null>;
  createTask: (data: import('../services/types').CreateTaskInput) => Promise<Task>;
  updateTask: (id: number, data: import('../services/types').UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  clearError: () => void;
  refreshTasks: () => Promise<void>;
}

// Hook options for future extensibility
export interface UseTasksOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
  onError?: (error: string) => void;
  onSuccess?: (action: string) => void;
}
