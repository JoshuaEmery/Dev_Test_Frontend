# TaskContext - How It Works

The `TaskContext` is the internal state management engine for task operations. It uses React Context API with useReducer to provide predictable state updates and implements optimistic updates for a smooth user experience.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │───▶│   useTasks()     │───▶│  TaskContext    │
│                 │    │   (Public API)   │    │  (Internal)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │   useReducer    │
                                               │   (State Mgmt)  │
                                               └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │  TaskService    │
                                               │  (TypeDI)       │
                                               └─────────────────┘
```

## How Optimistic Updates Work

### Creating a Task - Step by Step

```typescript
// 1. User fills out form and clicks submit
const handleSubmit = () => {
  createTask({ title: "Buy groceries" });
};

// 2. createTask function runs:
//    - Creates temporary task with negative ID (-1234567890)
//    - Dispatches OPTIMISTIC_ADD_TASK
//    - User sees task appear instantly!

// 3. Reducer handles OPTIMISTIC_ADD_TASK:
//    - Adds temp task to state.tasks array
//    - Updates lastUpdated timestamp
//    - Component re-renders with new task visible

// 4. API call happens in background:
//    - If successful: dispatches UPDATE_TASK with real task (ID: 42)
//    - If failed: dispatches REVERT_OPTIMISTIC_ADD to remove temp task

// 5. Reducer handles the result:
//    - Success: replaces temp task with real one (same position in array)
//    - Failure: removes temp task and shows error message
```

### Updating a Task - Step by Step

```typescript
// 1. User toggles checkbox
const toggleComplete = () => {
  updateTask(taskId, { completed: !task.completed });
};

// 2. updateTask function runs:
//    - Finds current task in state.tasks
//    - Creates optimistic task with new completed value
//    - Dispatches OPTIMISTIC_UPDATE_TASK
//    - User sees checkbox change instantly!

// 3. Reducer handles OPTIMISTIC_UPDATE_TASK:
//    - Maps over tasks array, replaces matching task
//    - Updates lastUpdated timestamp
//    - Component re-renders with updated task

// 4. API call happens in background:
//    - If successful: dispatches UPDATE_TASK with server response
//    - If failed: dispatches REVERT_OPTIMISTIC_UPDATE with original task

// 5. Reducer handles the result:
//    - Success: confirms the optimistic update (usually no visual change)
//    - Failure: reverts to original task state and shows error
```

### Deleting a Task - Step by Step

```typescript
// 1. User clicks delete button
const handleDelete = () => {
  deleteTask(taskId);
};

// 2. deleteTask function runs:
//    - Finds current task in state.tasks
//    - Dispatches OPTIMISTIC_REMOVE_TASK
//    - User sees task disappear instantly! ✨

// 3. Reducer handles OPTIMISTIC_REMOVE_TASK:
//    - Filters out task from state.tasks array
//    - Updates lastUpdated timestamp
//    - Component re-renders without the task

// 4. API call happens in background:
//    - If successful: no additional action needed
//    - If failed: dispatches REVERT_OPTIMISTIC_REMOVE with original task

// 5. Reducer handles the result:
//    - Success: task stays removed (no visual change)
//    - Failure: adds task back to array and shows error
```

## State Management with useReducer

The context uses a reducer pattern for predictable state updates:

```typescript
// State shape
interface TaskContextState {
  tasks: Task[];           // Array of all tasks
  loading: boolean;        // Whether async operation is in progress
  error: string | null;    // Current error message
  lastUpdated: number | null; // Timestamp of last state change
}

// Action types
type TaskAction = 
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
  // Revert actions
  | { type: 'REVERT_OPTIMISTIC_ADD'; payload: number }
  | { type: 'REVERT_OPTIMISTIC_UPDATE'; payload: Task }
  | { type: 'REVERT_OPTIMISTIC_REMOVE'; payload: Task };
```

## Error Handling Flow

```typescript
// When an operation fails:

// 1. Service throws error
try {
  await serviceRef.current.createTask(data);
} catch (error) {
  // 2. Context catches error and reverts optimistic update
  dispatch({ type: 'REVERT_OPTIMISTIC_ADD', payload: tempId });
  
  // 3. Sets error message
  const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
  dispatch({ type: 'SET_ERROR', payload: errorMessage });
  
  // 4. Stops loading state
  // (handled automatically by SET_ERROR action)
  
  // 5. Re-throws error for component to handle
  throw error;
}
```

## Dependency Injection Integration

The context integrates with TypeDI for service abstraction:

```typescript
// Service is injected via TypeDI container
const serviceRef = useRef(getTaskService());

// This allows:
// - Easy testing (mock the service)
// - Service swapping (JSON vs API)
// - Loose coupling between context and service implementation
```

## Performance Optimizations

### useCallback for Action Creators

```typescript
// All action creators are wrapped in useCallback to prevent unnecessary re-renders
const createTask = useCallback(async (data: CreateTaskInput): Promise<Task> => {
  // ... implementation
}, []); // Empty dependency array since service is stable

const updateTask = useCallback(async (id: number, data: UpdateTaskInput): Promise<Task> => {
  // ... implementation
}, [state.tasks]); // Depends on tasks for optimistic updates
```

### Memoized Context Value

```typescript
// Context value is recreated only when state or actions change
const contextValue: TaskContextValue = {
  // State
  tasks: state.tasks,
  loading: state.loading,
  error: state.error,
  
  // Actions (memoized with useCallback)
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  clearError,
  refreshTasks,
};
```

## Temporary ID Strategy

For optimistic updates, temporary IDs are generated using negative timestamps:

```typescript
// Generate temporary ID for optimistic update
const tempId = Date.now() * -1; // e.g., -1703123456789

// This ensures:
// - No conflicts with real IDs (which are positive)
// - Easy identification of temporary tasks
// - Automatic cleanup when replaced with real task
```

## State Transitions

### Loading States

```typescript
// Loading is managed automatically:
// - SET_LOADING(true) when operation starts
// - SET_LOADING(false) when operation completes (success or error)
// - SET_ERROR also sets loading to false
```

### Error States

```typescript
// Error handling:
// - SET_ERROR sets error message and stops loading
// - CLEAR_ERROR removes error message
// - SET_LOADING(true) clears error when starting new operation
```

## Integration Points

### With Components
- Components use `useTasks()` hook (public API)
- `useTasks()` internally calls `useTaskContext()` (private)
- Context provides state and actions to components

### With Services
- Context uses TypeDI container to get service instance
- Service interface is abstracted via `ITaskService`
- Easy to swap between JSON and API implementations

### With Testing
- Context can be wrapped in `TaskProvider` for testing
- Service can be mocked via TypeDI container
- State can be inspected and manipulated in tests

