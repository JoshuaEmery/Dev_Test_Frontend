// TaskContext test file
import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';
import { TaskProvider, useTaskContext } from './TaskContext';
import {
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '../services/types';
import { getTaskService } from '../container/typediContainer';

// Mock the container and service
jest.mock('../container/typediContainer');
const mockGetTaskService = getTaskService as jest.MockedFunction<
  typeof getTaskService
>;

// Mock task service
const mockTaskService = {
  getTasks: jest.fn(),
  getTask: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
};

// Sample test data
const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Test Task 1',
    description: 'Test Description 1',
    completed: false,
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Test Task 2',
    description: 'Test Description 2',
    completed: true,
    createdAt: '2023-01-02T00:00:00.000Z',
  },
];

const mockNewTask: Task = {
  id: 3,
  title: 'New Task',
  description: 'New Description',
  completed: false,
  createdAt: '2023-01-03T00:00:00.000Z',
};

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
);

describe('TaskContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTaskService.mockReturnValue(mockTaskService);
  });

  describe('TaskProvider', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide all required methods', () => {
      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      expect(typeof result.current.getTasks).toBe('function');
      expect(typeof result.current.getTask).toBe('function');
      expect(typeof result.current.createTask).toBe('function');
      expect(typeof result.current.updateTask).toBe('function');
      expect(typeof result.current.deleteTask).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.refreshTasks).toBe('function');
    });
  });

  describe('useTaskContext hook', () => {
    it('should throw error when used outside TaskProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTaskContext());
      }).toThrow('useTaskContext must be used within a TaskProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('getTasks', () => {
    it('should fetch tasks successfully', async () => {
      mockTaskService.getTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.getTasks();
      });

      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle getTasks error', async () => {
      const errorMessage = 'Failed to fetch tasks';
      mockTaskService.getTasks.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.getTasks();
      });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: Task[]) => void;
      const promise = new Promise<Task[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockTaskService.getTasks.mockReturnValue(promise);

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.getTasks();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!(mockTasks);
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('getTask', () => {
    it('should fetch single task successfully', async () => {
      const taskId = 1;
      const expectedTask = mockTasks[0];
      mockTaskService.getTask.mockResolvedValue(expectedTask);

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      let returnedTask: Task | null = null;
      await act(async () => {
        returnedTask = await result.current.getTask(taskId);
      });

      expect(returnedTask).toEqual(expectedTask);
      expect(mockTaskService.getTask).toHaveBeenCalledWith(taskId);
    });

    it('should handle getTask error', async () => {
      const taskId = 999;
      const errorMessage = 'Task not found';
      mockTaskService.getTask.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      let returnedTask: Task | null = null;
      await act(async () => {
        returnedTask = await result.current.getTask(taskId);
      });

      expect(returnedTask).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('createTask', () => {
    it('should create task with optimistic update', async () => {
      const createInput: CreateTaskInput = {
        title: 'New Task',
        description: 'New Description',
      };
      mockTaskService.createTask.mockResolvedValue(mockNewTask);

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      let createdTask: Task;
      await act(async () => {
        createdTask = await result.current.createTask(createInput);
      });

      expect(createdTask!).toEqual(mockNewTask);
      // The optimistic task should be replaced with the real task from the server
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('New Task');
      expect(result.current.tasks[0].id).toBe(mockNewTask.id); // Should be the real task with positive ID
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle createTask error and revert optimistic update', async () => {
      const createInput: CreateTaskInput = {
        title: 'New Task',
        description: 'New Description',
      };
      const errorMessage = 'Failed to create task';
      mockTaskService.createTask.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.createTask(createInput);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('updateTask', () => {
    beforeEach(async () => {
      // Set up initial tasks
      mockTaskService.getTasks.mockResolvedValue(mockTasks);
    });

    it('should update task with optimistic update', async () => {
      const taskId = 1;
      const updateInput: UpdateTaskInput = {
        title: 'Updated Task',
        completed: true,
      };
      const updatedTask: Task = {
        ...mockTasks[0],
        ...updateInput,
        updatedAt: '2023-01-03T00:00:00.000Z',
      };
      mockTaskService.updateTask.mockResolvedValue(updatedTask);

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      // First load tasks
      await act(async () => {
        await result.current.getTasks();
      });

      let returnedTask: Task;
      await act(async () => {
        returnedTask = await result.current.updateTask(taskId, updateInput);
      });

      expect(returnedTask!).toEqual(updatedTask);
      expect(result.current.tasks.find((t) => t.id === taskId)).toEqual(
        updatedTask
      );
    });

    it('should handle updateTask error and revert optimistic update', async () => {
      const taskId = 1;
      const updateInput: UpdateTaskInput = {
        title: 'Updated Task',
      };
      const errorMessage = 'Failed to update task';
      mockTaskService.updateTask.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      // First load tasks
      await act(async () => {
        await result.current.getTasks();
      });

      await act(async () => {
        try {
          await result.current.updateTask(taskId, updateInput);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.tasks.find((t) => t.id === taskId)).toEqual(
        mockTasks[0]
      );
      expect(result.current.error).toBe(errorMessage);
    });

    it('should throw error when task not found', async () => {
      const taskId = 999;
      const updateInput: UpdateTaskInput = {
        title: 'Updated Task',
      };

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.updateTask(taskId, updateInput);
        } catch (error) {
          expect(error).toEqual(new Error('Task not found'));
        }
      });
    });
  });

  describe('deleteTask', () => {
    beforeEach(async () => {
      // Set up initial tasks
      mockTaskService.getTasks.mockResolvedValue(mockTasks);
    });

    it('should delete task with optimistic update', async () => {
      const taskId = 1;
      mockTaskService.deleteTask.mockResolvedValue(undefined);

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      // First load tasks
      await act(async () => {
        await result.current.getTasks();
      });

      await act(async () => {
        await result.current.deleteTask(taskId);
      });

      expect(result.current.tasks.find((t) => t.id === taskId)).toBeUndefined();
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId);
    });

    it('should handle deleteTask error and revert optimistic update', async () => {
      const taskId = 1;
      const errorMessage = 'Failed to delete task';
      mockTaskService.deleteTask.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      // First load tasks
      await act(async () => {
        await result.current.getTasks();
      });

      await act(async () => {
        try {
          await result.current.deleteTask(taskId);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.tasks.find((t) => t.id === taskId)).toEqual(
        mockTasks[0]
      );
      expect(result.current.error).toBe(errorMessage);
    });

    it('should throw error when task not found', async () => {
      const taskId = 999;

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.deleteTask(taskId);
        } catch (error) {
          expect(error).toEqual(new Error('Task not found'));
        }
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const errorMessage = 'Test error';
      mockTaskService.getTasks.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      // First create an error
      await act(async () => {
        await result.current.getTasks();
      });

      expect(result.current.error).toBe(errorMessage);

      // Then clear it
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('refreshTasks', () => {
    it('should refresh tasks', async () => {
      mockTaskService.getTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.refreshTasks();
      });

      expect(result.current.tasks).toEqual(mockTasks);
      expect(mockTaskService.getTasks).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      mockTaskService.getTasks.mockRejectedValue('String error');

      const { result } = renderHook(() => useTaskContext(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.getTasks();
      });

      expect(result.current.error).toBe('Failed to fetch tasks');
    });
  });
});
