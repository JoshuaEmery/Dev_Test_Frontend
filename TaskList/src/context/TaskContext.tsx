// Task context provider for state management
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
} from 'react';
import {
  type ITaskContextState,
  type TaskAction,
  type ITaskContextValue,
  type ITaskProviderProps,
} from './types';
import {
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '../services/types';
import { getTaskService } from '../container/typediContainer';

// Initial state for the context
const initialState: ITaskContextState = {
  tasks: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

//This is a function that takes in the current state and an action to be performs.
//It returns a new state based on the action. This is provided to the useReducer hook.
function taskReducer(
  state: ITaskContextState,
  action: TaskAction
): ITaskContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        // Clear error when starting a new operation
        error: action.payload ? null : state.error,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      };

    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESET_STATE':
      return initialState;

    //These are the optimistic update cases
    //These cases will show the user the task immediately. They are called first
    //before the actual API call is made.
    case 'OPTIMISTIC_ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        lastUpdated: Date.now(),
      };

    case 'OPTIMISTIC_UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
        lastUpdated: Date.now(),
      };

    case 'OPTIMISTIC_REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        lastUpdated: Date.now(),
      };

    // These are the revert optimistic update cases
    // These are called if the API call fails.
    case 'REVERT_OPTIMISTIC_ADD':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        lastUpdated: Date.now(),
      };

    case 'REVERT_OPTIMISTIC_UPDATE':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
        lastUpdated: Date.now(),
      };

    case 'REVERT_OPTIMISTIC_REMOVE':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        lastUpdated: Date.now(),
      };

    // Replace optimistic task with real task from server
    case 'REPLACE_OPTIMISTIC_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.tempId ? action.payload.realTask : task
        ),
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      };

    default:
      return state;
  }
}

// Create the context (private - not exported)
const TaskContext = createContext<ITaskContextValue | undefined>(undefined);

// Custom hook to use the task context (private - not exported)
function useTaskContext(): ITaskContextValue {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}

// TaskProvider component - This will expose the context to the UI
// We will wrap children components in this provider.
export function TaskProvider({
  children,
}: ITaskProviderProps): React.ReactElement {
  //useReducer with intial state and the reducer function
  const [state, dispatch] = useReducer(taskReducer, initialState);
  //create a service using ref. This is used to avoid re-creating the service on every render.
  const serviceRef = useRef(getTaskService());

  // useCallback is used to prevent re-rendering the component unless the dependencies change.
  //Empty dependency array means it will only be called once.
  const getTasks = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const tasks = await serviceRef.current.getTasks();
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch tasks';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  const getTask = useCallback(async (id: number): Promise<Task | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const task = await serviceRef.current.getTask(id);
      dispatch({ type: 'SET_LOADING', payload: false });
      return task;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    }
  }, []);

  const createTask = useCallback(
    async (data: CreateTaskInput): Promise<Task> => {
      // Generate temporary ID for optimistic update
      const tempId = Date.now() * -1; // Negative ID to avoid conflicts
      const optimisticTask: Task = {
        id: tempId,
        title: data.title,
        description: data.description || null,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      try {
        // Optimistic update - show task immediately
        dispatch({ type: 'OPTIMISTIC_ADD_TASK', payload: optimisticTask });

        // Make actual API call
        const newTask = await serviceRef.current.createTask(data);

        // Replace optimistic task with real task using tempId
        dispatch({
          type: 'REPLACE_OPTIMISTIC_TASK',
          payload: { tempId, realTask: newTask },
        });
        return newTask;
      } catch (error) {
        // Revert optimistic update on error
        dispatch({ type: 'REVERT_OPTIMISTIC_ADD', payload: tempId });
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create task';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error; // Re-throw to allow component to handle
      }
    },
    []
  );

  const updateTask = useCallback(
    async (id: number, data: UpdateTaskInput): Promise<Task> => {
      // Find the current task for optimistic update
      const currentTask = state.tasks.find((task) => task.id === id);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      // Create optimistic update
      const optimisticTask: Task = {
        ...currentTask,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      try {
        // Optimistic update - show changes immediately
        dispatch({ type: 'OPTIMISTIC_UPDATE_TASK', payload: optimisticTask });

        // Make actual API call
        const updatedTask = await serviceRef.current.updateTask(id, data);

        // Replace optimistic task with real task
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
        return updatedTask;
      } catch (error) {
        // Revert optimistic update on error
        dispatch({ type: 'REVERT_OPTIMISTIC_UPDATE', payload: currentTask });
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update task';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error; // Re-throw to allow component to handle
      }
    },
    [state.tasks]
  );

  const deleteTask = useCallback(
    async (id: number): Promise<void> => {
      // Find the current task for optimistic update
      const currentTask = state.tasks.find((task) => task.id === id);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      try {
        // Optimistic update - remove task immediately
        dispatch({ type: 'OPTIMISTIC_REMOVE_TASK', payload: id });

        // Make actual API call
        await serviceRef.current.deleteTask(id);

        // Confirm removal (no additional action needed)
      } catch (error) {
        // Revert optimistic update on error
        dispatch({ type: 'REVERT_OPTIMISTIC_REMOVE', payload: currentTask });
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete task';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error; // Re-throw to allow component to handle
      }
    },
    [state.tasks]
  );

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const refreshTasks = useCallback(async (): Promise<void> => {
    await getTasks();
  }, [getTasks]);

  // Context value object
  const contextValue: ITaskContextValue = {
    // State
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,

    // Actions
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    clearError,
    refreshTasks,
  };

  return (
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
}

// Export the private hook for internal use (not for public consumption)
export { useTaskContext };
