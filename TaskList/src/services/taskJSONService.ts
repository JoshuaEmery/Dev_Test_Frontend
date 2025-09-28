//Service that reads the test data, fetch delays are simulated.
import { type ITaskService, type Task, type CreateTaskInput, type UpdateTaskInput } from "./types";
import tasksData from "../data/sample_tasks_data.json";

export class TaskJSONService implements ITaskService {
    private tasks: Task[] = [...tasksData];
    //get all tasks
    async getTasks(): Promise<Task[]> {
      // Simulate API delay
      await this.delay(300);
      return [...this.tasks];
    }
    //get task by id
    async getTask(id: number): Promise<Task | null> {
      await this.delay(100);
      const task = this.tasks.find(t => t.id === id);
      return task ? { ...task } : null;
    }
    //create task
    async createTask(data: CreateTaskInput): Promise<Task> {
      await this.delay(200);
      
      const newTask: Task = {
        //simulate primary key
        id: this.tasks.length + 1,
        title: data.title,
        description: data.description || '',
        completed: false,
        createdAt: new Date().toISOString(),
      };
  
      this.tasks.push(newTask);
      return { ...newTask };
    }
    //update a tast
    async updateTask(id: number, data: UpdateTaskInput): Promise<Task> {
      await this.delay(200);
      
      const taskIndex = this.tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        throw new Error(`Task with id ${id} not found`);
      }
  
      const updatedTask: Task = {
        ...this.tasks[taskIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
  
      this.tasks[taskIndex] = updatedTask;
      return { ...updatedTask };
    }
    //delete task
    async deleteTask(id: number): Promise<void> {
      await this.delay(150);
      
      const taskIndex = this.tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        throw new Error(`Task with id ${id} not found`);
      }
  
      this.tasks.splice(taskIndex, 1);
    }
  
    private delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }