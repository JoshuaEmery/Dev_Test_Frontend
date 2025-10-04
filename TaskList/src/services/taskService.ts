// Service that communicates with the API using axios
import axios, { type AxiosResponse } from 'axios';
import { 
  type ITaskService, 
  type Task, 
  type CreateTaskInput, 
  type UpdateTaskInput,
  type TasksResponse,
  type TaskResponse,
  type DeleteResponse
} from './types';

export class TaskService implements ITaskService {
  //private readonly baseURL = 'https://taskapi-app.calmtree-a2764f0e.eastus.azurecontainerapps.io';
  private readonly baseURL = 'http://localhost:5001';
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    const url = `${this.baseURL}/tasks`;
    console.log(`[TaskService] Fetching tasks from: ${url}`);
    
    try {
      const response: AxiosResponse<TasksResponse> = await axios.get(url);
      
      console.log(`[TaskService] Successfully fetched tasks:`, {
        status: response.status,
        statusText: response.statusText,
        success: response.data?.success,
        dataLength: response.data?.data?.length || 0,
        message: response.data?.message
      });
      
      // Handle the new standardized response format
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch tasks');
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`[TaskService] Error fetching tasks from ${url}:`, {
        error: error,
        isAxiosError: axios.isAxiosError(error),
        status: axios.isAxiosError(error) ? error.response?.status : 'N/A',
        statusText: axios.isAxiosError(error) ? error.response?.statusText : 'N/A',
        responseData: axios.isAxiosError(error) ? error.response?.data : 'N/A',
        requestConfig: axios.isAxiosError(error) ? {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        } : 'N/A'
      });
      
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch tasks');
    }
  }

  // Get task by ID
  async getTask(id: number): Promise<Task | null> {
    try {
      const response: AxiosResponse<TaskResponse> = await axios.get(`${this.baseURL}/tasks/${id}`);
      
      // Handle the new standardized response format
      if (!response.data.success) {
        throw new Error(response.data.message || `Failed to fetch task ${id}`);
      }
      
      return response.data.data;
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
      
      // Handle the new standardized response format
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create task');
      }
      
      // The API returns { success: true, data: {...}, message: "Task created successfully" }
      return response.data.data;
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
      
      // Handle the new standardized response format
      if (!response.data.success) {
        throw new Error(response.data.message || `Failed to update task ${id}`);
      }
      
      // The API returns { success: true, data: {...}, message: "Task updated successfully" }
      return response.data.data;
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
      const response: AxiosResponse<DeleteResponse> = await axios.delete(`${this.baseURL}/tasks/${id}`);
      
      // Handle the new standardized response format
      if (!response.data.success) {
        throw new Error(response.data.message || `Failed to delete task ${id}`);
      }
      
      // Verify that the deletion was successful
      if (!response.data.data.deleted) {
        throw new Error(`Task ${id} was not deleted successfully`);
      }
      
      // The API returns { success: true, data: { deleted: true }, message: "Task deleted successfully" }
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
