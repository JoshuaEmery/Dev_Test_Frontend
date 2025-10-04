//Interface for the TaskService. This will allow for easy mocking of the service for testing.
//Additionally this will allow us to use Dependency Injection and easily swap out the service with different implementations.
export interface ITaskService {
    getTasks(): Promise<Task[]>;
    getTask(id: number): Promise<Task | null>;
    createTask(data: CreateTaskInput): Promise<Task>;
    updateTask(id: number, data: UpdateTaskInput): Promise<Task>;
    deleteTask(id: number): Promise<void>;
  }
  
  export interface CreateTaskInput {
    title: string;
    description?: string;
  }
  
  export interface UpdateTaskInput {
    title?: string;
    description?: string;
    completed?: boolean;
  }
  
  export interface Task {
    id: number;
    title: string;
    description?: string | null;
    completed: boolean;
    createdAt: string;
    updatedAt?: string;
  }

  // API response types based on the standardized endpoint responses
  export interface ApiResponse {
    success: boolean;
    message: string;
    error?: string;
  }

  export interface TasksResponse extends ApiResponse {
    data: Task[];
  }

  export interface TaskResponse extends ApiResponse {
    data: Task;
  }

  export interface DeleteResponse extends ApiResponse {
    data: {
      deleted: boolean;
    };
  }