import React, { useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import TaskItem from '../TaskItem/TaskItem';
import { RefreshCw, AlertCircle, CheckCircle2, Clock, Plus } from 'lucide-react';

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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tasks</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex gap-3">
                <button 
                  onClick={clearError}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Clear Error
                </button>
                <button 
                  onClick={refreshTasks}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const progressPercentage = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Task Manager</h2>
            <p className="text-gray-500 text-sm">{tasks.length} total tasks</p>
          </div>
        </div>
        <button 
          onClick={refreshTasks} 
          disabled={loading}
          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-semibold text-blue-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Plus className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks yet</h3>
          <p className="text-gray-500 mb-6">Create your first task using the form above to get started!</p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Your tasks will appear here</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {pendingTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Pending Tasks</h3>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {pendingTasks.length}
                </span>
              </div>
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
          
          {completedTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Completed Tasks</h3>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {completedTasks.length}
                </span>
              </div>
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
