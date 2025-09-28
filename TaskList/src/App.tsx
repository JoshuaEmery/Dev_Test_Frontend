import JestTest from './components/JestTest/JestTest'
import { useTasks } from './hooks/useTasks'
import { useEffect } from 'react'

// Example component showing how to use the context
function TaskListExample() {
  const { tasks, loading, error, getTasks, clearError } = useTasks();

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={clearError}>Clear Error</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Tasks ({tasks.length})</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} - {task.completed ? '✅' : '⏳'}
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <>
      <JestTest />
      <TaskListExample />
    </>
  )
}

export default App
