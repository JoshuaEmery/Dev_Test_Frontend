import React, { useState } from 'react';
import { useTasks, type UpdateTaskInput } from '../../hooks/useTasks';
import { type Task } from '../../services/types';

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
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px 0' }}>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Task description"
          />
          <button onClick={handleSave} disabled={loading || !editTitle.trim()}>
            Save
          </button>
          <button onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <div>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggleComplete}
              disabled={loading}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.title}
            </span>
          </div>
          {task.description && (
            <div style={{ marginLeft: '20px', color: '#666' }}>
              {task.description}
            </div>
          )}
          <div style={{ fontSize: '0.8em', color: '#999', marginTop: '5px' }}>
            Created: {formatDate(task.createdAt)}
            {task.updatedAt && ` | Updated: ${formatDate(task.updatedAt)}`}
          </div>
          <div style={{ marginTop: '10px' }}>
            <button onClick={handleEdit} disabled={loading}>
              Edit
            </button>
            <button onClick={handleDelete} disabled={loading} style={{ marginLeft: '5px' }}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
