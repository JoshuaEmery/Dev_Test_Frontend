import React, { useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import TaskItem from '../TaskItem/TaskItem';

const TaskList: React.FC = () => {
  const { tasks, loading, error, getTasks, clearError, refreshTasks } = useTasks();

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  if (loading && tasks.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={clearError}>Clear Error</button>
        <button onClick={refreshTasks} style={{ marginLeft: '10px' }}>
          Retry
        </button>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Tasks ({tasks.length})</h2>
        <button onClick={refreshTasks} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {tasks.length === 0 ? (
        <p>No tasks found. Create your first task above!</p>
      ) : (
        <div>
          {pendingTasks.length > 0 && (
            <div>
              <h3>Pending Tasks ({pendingTasks.length})</h3>
              {pendingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
          
          {completedTasks.length > 0 && (
            <div>
              <h3>Completed Tasks ({completedTasks.length})</h3>
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
