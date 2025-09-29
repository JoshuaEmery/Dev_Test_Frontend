import React, { useState } from 'react';
import { useTasks, type UpdateTaskInput } from '../../hooks/useTasks';
import { type Task } from '../../services/types';
import { 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Clock
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const { updateTask, deleteTask, loading } = useTasks();

  const handleToggleComplete = async () => {
    try {
      const updateData: UpdateTaskInput = {
        completed: !task.completed,
      };
      await updateTask(task.id, updateData);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    try {
      const updateData: UpdateTaskInput = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      };
      await updateTask(task.id, updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`group bg-white border border-gray-200 rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:border-gray-300 ${
      task.completed ? 'opacity-75' : ''
    }`}>
      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button 
              onClick={handleCancel} 
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading || !editTitle.trim()}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`mt-1 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
              task.completed ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
            }`}
          >
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold mb-2 transition-all duration-200 ${
                  task.completed 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-800'
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className={`text-gray-600 mb-3 leading-relaxed ${
                    task.completed ? 'line-through' : ''
                  }`}>
                    {task.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(task.createdAt)}</span>
                  </div>
                  {task.updatedAt && task.updatedAt !== task.createdAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Updated {formatDate(task.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                task.completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {task.completed ? 'Completed' : 'Pending'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleEdit}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Edit task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
