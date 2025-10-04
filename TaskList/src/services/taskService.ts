// Service that communicates with the API using axios
import axios, { type AxiosResponse } from 'axios';
import { type ITaskService, type Task, type CreateTaskInput, type UpdateTaskInput } from './types';

// API response types based on the actual endpoint responses
interface ApiResponse {
  message?: string;
  error?: string;
}

interface TasksResponse extends ApiResponse {
  tasks: Task[];
}

interface TaskResponse extends ApiResponse {
  task: Task;
}

export class TaskService implements ITaskService {
  private readonly baseURL = 'http://taskapi-devtest.eastus.azurecontainer.io:5001/';

  // Get all tasks
  async getTasks(): Promise<Task[]> {
    try {
      const response: AxiosResponse<TasksResponse> = await axios.get(`${this.baseURL}/tasks`);
      return response.data.tasks;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  // Get task by ID
  async getTask(id: number): Promise<Task | null> {
    try {
      const response: AxiosResponse<TaskResponse> = await axios.get(`${this.baseURL}/tasks/${id}`);
      return response.data.task;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404 || error.response?.data?.error === 'Task not found') {
          return null;
        }
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
      }
      console.error(`Error fetching task ${id}:`, error);
      throw new Error(`Failed to fetch task ${id}`);
    }
  }

  // Create new task
  async createTask(data: CreateTaskInput): Promise<Task> {
    try {
      const response: AxiosResponse<TaskResponse> = await axios.post(`${this.baseURL}/tasks`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // The API returns { message: "Task created successfully", task: {...} }
      return response.data.task;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  // Update task
  async updateTask(id: number, data: UpdateTaskInput): Promise<Task> {
    try {
      const response: AxiosResponse<TaskResponse> = await axios.put(`${this.baseURL}/tasks/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // The API returns { message: "Task updated successfully", task: {...} }
      return response.data.task;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404 || error.response?.data?.error === 'Task not found') {
          throw new Error(`Task with id ${id} not found`);
        }
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
      }
      console.error(`Error updating task ${id}:`, error);
      throw new Error(`Failed to update task ${id}`);
    }
  }

  // Delete task
  async deleteTask(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/tasks/${id}`);
      
      // The API returns { message: "Task deleted successfully" }
      // No need to return anything for delete operations
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404 || error.response?.data?.error === 'Task not found') {
          throw new Error(`Task with id ${id} not found`);
        }
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
      }
      console.error(`Error deleting task ${id}:`, error);
      throw new Error(`Failed to delete task ${id}`);
    }
  }
}
