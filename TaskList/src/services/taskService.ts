// API service layer for task management
import { type ITaskService, type Task, type CreateTaskInput, type UpdateTaskInput } from "./types";

// Placeholder implementation for API-based task service
// This will be implemented later when the actual API is available
export class TaskService implements ITaskService {
  async getTasks(): Promise<Task[]> {
    // TODO: Implement API call to fetch tasks
    throw new Error('TaskService not yet implemented - API integration pending');
  }

  async getTask(_id: number): Promise<Task | null> {
    // TODO: Implement API call to fetch single task
    throw new Error('TaskService not yet implemented - API integration pending');
  }

  async createTask(_data: CreateTaskInput): Promise<Task> {
    // TODO: Implement API call to create task
    throw new Error('TaskService not yet implemented - API integration pending');
  }

  async updateTask(_id: number, _data: UpdateTaskInput): Promise<Task> {
    // TODO: Implement API call to update task
    throw new Error('TaskService not yet implemented - API integration pending');
  }

  async deleteTask(_id: number): Promise<void> {
    // TODO: Implement API call to delete task
    throw new Error('TaskService not yet implemented - API integration pending');
  }
}
