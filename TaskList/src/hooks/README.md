# useTasks Hook - Usage Guide

The `useTasks` hook is the public API for interacting with task data in your React components. It provides a clean, consistent interface for all task operations with built-in error handling and loading states.

## Quick Start

### 1. Wrap Your App with TaskProvider

```tsx
// App.tsx
import React from 'react';
import { TaskProvider } from './context/TaskContext';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';

function App() {
  return (
    <TaskProvider>
      <div className="app">
        <h1>My Task Manager</h1>
        <TaskForm />
        <TaskList />
      </div>
    </TaskProvider>
  );
}

export default App;
```

### 2. Use the Hook in Components

```tsx
// TaskList.tsx
import React, { useEffect } from 'react';
import { useTasks } from './hooks/useTasks';

function TaskList() {
  const { tasks, loading, error, getTasks, deleteTask } = useTasks();

  useEffect(() => {
    getTasks(); // Load tasks when component mounts
  }, [getTasks]);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Tasks ({tasks.length})</h2>
      {tasks.map(task => (
        <div key={task.id} className="task-item">
          <h3>{task.title}</h3>
          {task.description && <p>{task.description}</p>}
          <span>Status: {task.completed ? 'Completed' : 'Pending'}</span>
          <button onClick={() => deleteTask(task.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default TaskList;
```

## API Reference

### Hook Return Value

```typescript
const {
  // State
  tasks,        // Task[] - Array of all tasks
  loading,      // boolean - Whether an async operation is in progress
  error,        // string | null - Current error message, if any
  
  // Actions
  getTasks,     // () => Promise<void> - Fetch all tasks
  getTask,      // (id: number) => Promise<Task | null> - Fetch specific task
  createTask,   // (data: CreateTaskInput) => Promise<Task> - Create new task
  updateTask,   // (id: number, data: UpdateTaskInput) => Promise<Task> - Update task
  deleteTask,   // (id: number) => Promise<void> - Delete task
  clearError,   // () => void - Clear current error
  refreshTasks, // () => Promise<void> - Refresh task list
} = useTasks();
```

### Data Types

```typescript
interface Task {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface CreateTaskInput {
  title: string;
  description?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
}
```

## Usage Examples

### Creating a Task

```tsx
import React, { useState } from 'react';
import { useTasks } from './hooks/useTasks';

function TaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { createTask, loading, error } = useTasks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({ title, description });
      setTitle('');
      setDescription('');
    } catch (err) {
      // Error is automatically handled by the context
      console.error('Failed to create task:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task description"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Task'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### Updating a Task

```tsx
import React from 'react';
import { useTasks } from './hooks/useTasks';

function TaskItem({ task }: { task: Task }) {
  const { updateTask, loading } = useTasks();

  const toggleComplete = async () => {
    try {
      await updateTask(task.id, { completed: !task.completed });
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const updateTitle = async (newTitle: string) => {
    try {
      await updateTask(task.id, { title: newTitle });
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  return (
    <div className={`task ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={toggleComplete}
        disabled={loading}
      />
      <input
        type="text"
        value={task.title}
        onChange={(e) => updateTitle(e.target.value)}
        disabled={loading}
      />
      {task.description && <p>{task.description}</p>}
    </div>
  );
}
```

### Deleting a Task

```tsx
import React from 'react';
import { useTasks } from './hooks/useTasks';

function TaskItem({ task }: { task: Task }) {
  const { deleteTask, loading } = useTasks();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  return (
    <div className="task-item">
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}
```

### Error Handling

```tsx
import React from 'react';
import { useTasks } from './hooks/useTasks';

function ErrorDisplay() {
  const { error, clearError } = useTasks();

  if (!error) return null;

  return (
    <div className="error-banner">
      <span>{error}</span>
      <button onClick={clearError}>Dismiss</button>
    </div>
  );
}
```

### Loading States

```tsx
import React from 'react';
import { useTasks } from './hooks/useTasks';

function TaskManager() {
  const { tasks, loading, getTasks } = useTasks();

  return (
    <div>
      <button onClick={getTasks} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Tasks'}
      </button>
      
      {loading && <div className="loading-spinner">Loading tasks...</div>}
      
      <div className="task-count">
        {tasks.length} task{tasks.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
```

### Fetching a Single Task

```tsx
import React, { useEffect, useState } from 'react';
import { useTasks } from './hooks/useTasks';

function TaskDetail({ taskId }: { taskId: number }) {
  const { getTask, loading, error } = useTasks();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      const fetchedTask = await getTask(taskId);
      setTask(fetchedTask);
    };
    
    fetchTask();
  }, [taskId, getTask]);

  if (loading) return <div>Loading task...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="task-detail">
      <h1>{task.title}</h1>
      {task.description && <p>{task.description}</p>}
      <p>Status: {task.completed ? 'Completed' : 'Pending'}</p>
      <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
```

## Best Practices

### 1. Always Handle Errors

```tsx
const handleCreateTask = async (data: CreateTaskInput) => {
  try {
    await createTask(data);
    // Success - optimistic update already applied
    showSuccessMessage('Task created successfully!');
  } catch (error) {
    // Error already handled by context, but you can add additional logic
    showNotification('Failed to create task');
  }
};
```

### 2. Use Loading States

```tsx
<button onClick={handleSubmit} disabled={loading}>
  {loading ? 'Creating...' : 'Create Task'}
</button>
```

### 3. Clear Errors When Appropriate

```tsx
useEffect(() => {
  clearError(); // Clear errors when component mounts
}, [clearError]);
```

### 4. Don't Call useTasks Outside Provider

```tsx
// ❌ This will throw an error
function ComponentOutsideProvider() {
  const { tasks } = useTasks(); // Error!
}

// ✅ This works
function App() {
  return (
    <TaskProvider>
      <ComponentInsideProvider /> {/* This works */}
    </TaskProvider>
  );
}
```

### 5. Use Optimistic Updates to Your Advantage

```tsx
// The hook automatically provides optimistic updates
// Users see immediate feedback while API calls happen in background

const handleToggleComplete = async () => {
  // Task appears to toggle immediately (optimistic update)
  // If API call fails, it automatically reverts
  await updateTask(taskId, { completed: !task.completed });
};
```

## Testing

The hook is designed to be easily testable:

```tsx
// In your test setup
import { render } from '@testing-library/react';
import { TaskProvider } from '../context/TaskContext';

const renderWithTaskContext = (component: React.ReactElement) => {
  return render(
    <TaskProvider>
      {component}
    </TaskProvider>
  );
};

// In your test
test('should display tasks', () => {
  renderWithTaskContext(<TaskList />);
  // Your test assertions here
});
```

## Common Patterns

### Form with Validation

```tsx
function TaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { createTask, loading, error } = useTasks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      await createTask({ 
        title: title.trim(), 
        description: description.trim() || undefined 
      });
      setTitle('');
      setDescription('');
    } catch (err) {
      // Error handling is automatic
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task description"
      />
      <button type="submit" disabled={loading || !title.trim()}>
        {loading ? 'Creating...' : 'Create Task'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### Bulk Operations

```tsx
function TaskBulkActions() {
  const { tasks, updateTask, deleteTask, loading } = useTasks();
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const markAllComplete = async () => {
    const incompleteTasks = tasks.filter(task => !task.completed);
    
    for (const task of incompleteTasks) {
      try {
        await updateTask(task.id, { completed: true });
      } catch (err) {
        console.error(`Failed to update task ${task.id}:`, err);
      }
    }
  };

  const deleteSelected = async () => {
    for (const taskId of selectedTasks) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error(`Failed to delete task ${taskId}:`, err);
      }
    }
    setSelectedTasks([]);
  };

  return (
    <div className="bulk-actions">
      <button onClick={markAllComplete} disabled={loading}>
        Mark All Complete
      </button>
      <button 
        onClick={deleteSelected} 
        disabled={loading || selectedTasks.length === 0}
      >
        Delete Selected ({selectedTasks.length})
      </button>
    </div>
  );
}
```

This hook provides a powerful, easy-to-use interface for all your task management needs with built-in optimistic updates, error handling, and loading states.
