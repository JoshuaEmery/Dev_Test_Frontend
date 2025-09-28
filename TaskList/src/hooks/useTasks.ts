// Public hook API for task management
// This is the main public interface for components to interact with task data
import { useTaskContext } from '../context/TaskContext';

/**
 * Public hook for task management
 * 
 * This hook provides a clean, consistent API for components to:
 * - Access task state (tasks, loading, error)
 * - Perform CRUD operations on tasks
 * - Handle errors and loading states
 * 
 * Benefits:
 * - Single import point for task functionality
 * - Consistent API across all components
 * - Type-safe operations
 * - Automatic error handling
 * - Optimized re-renders with useCallback
 * 
 * Usage:
 * ```tsx
 * const { tasks, loading, error, createTask, updateTask } = useTasks();
 * ```
 */
export function useTasks() {
  const context = useTaskContext();
  
  return {
    // State
    tasks: context.tasks,
    loading: context.loading,
    error: context.error,
    
    // Actions
    getTasks: context.getTasks,
    getTask: context.getTask,
    createTask: context.createTask,
    updateTask: context.updateTask,
    deleteTask: context.deleteTask,
    clearError: context.clearError,
    refreshTasks: context.refreshTasks,
  };
}

// Re-export types for convenience
export type { CreateTaskInput, UpdateTaskInput } from '../services/types';
