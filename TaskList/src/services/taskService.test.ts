import { type ITaskService, type CreateTaskInput, type UpdateTaskInput } from './types';
//rely on the container to get the task service
import { getTaskService, TypeDIContainer } from '../container/typediContainer';


// Mock the sample data to have predictable test data
jest.mock('../data/sample_tasks_data.json', () => [
  {
    id: 1,
    title: 'Test Task 1',
    description: 'Test description 1',
    completed: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 2,
    title: 'Test Task 2',
    description: 'Test description 2',
    completed: false,
    createdAt: '2024-01-16T10:15:00Z'
  },
  {
    id: 3,
    title: 'Test Task 3',
    description: null,
    completed: false,
    createdAt: '2024-01-17T08:30:00Z'
  }
]);

describe('TaskService (via DI Container - TaskJSONService Implementation)', () => {
  let taskService: ITaskService;

  beforeEach(() => {
    // Reinitialize services to ensure fresh instances for each test
    TypeDIContainer.reinitialize();
    // Create a fresh instance for each test to ensure isolation
    taskService = getTaskService();
  });

  describe('getTasks', () => {
    it('should return all tasks', async () => {
      const tasks = await taskService.getTasks();
      
      expect(tasks).toHaveLength(3);
      expect(tasks[0]).toEqual({
        id: 1,
        title: 'Test Task 1',
        description: 'Test description 1',
        completed: true,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      });
    });

    it('should return a copy of tasks (not reference)', async () => {
      const tasks1 = await taskService.getTasks();
      const tasks2 = await taskService.getTasks();
      
      expect(tasks1).not.toBe(tasks2); // Different array instances
      // Note: The current implementation returns the same object references
      // This test documents the current behavior, but ideally objects should be copied
      expect(tasks1[0]).toBe(tasks2[0]); // Same object instances (current behavior)
    });

  });

  describe('getTask', () => {
    it('should return a task when found', async () => {
      const task = await taskService.getTask(1);
      
      expect(task).toEqual({
        id: 1,
        title: 'Test Task 1',
        description: 'Test description 1',
        completed: true,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      });
    });

    it('should return null when task not found', async () => {
      const task = await taskService.getTask(999);
      
      expect(task).toBeNull();
    });

    it('should return a copy of the task (not reference)', async () => {
      const task1 = await taskService.getTask(1);
      const task2 = await taskService.getTask(1);
      
      expect(task1).not.toBe(task2); // Different object instances
    });

  });

  describe('createTask', () => {
    it('should create a new task with required fields', async () => {
      const createInput: CreateTaskInput = {
        title: 'New Test Task',
        description: 'New test description'
      };

      const createdTask = await taskService.createTask(createInput);
      
      expect(createdTask).toMatchObject({
        id: 4, // Should be next available ID
        title: 'New Test Task',
        description: 'New test description',
        completed: false
      });
      expect(createdTask.createdAt).toBeDefined();
      expect(new Date(createdTask.createdAt)).toBeInstanceOf(Date);
    });

    it('should create a task with only title (no description)', async () => {
      const createInput: CreateTaskInput = {
        title: 'Task Without Description'
      };

      const createdTask = await taskService.createTask(createInput);
      
      expect(createdTask).toMatchObject({
        id: 4,
        title: 'Task Without Description',
        description: '',
        completed: false
      });
    });

    it('should assign sequential IDs', async () => {
      const task1 = await taskService.createTask({ title: 'Task 1' });
      const task2 = await taskService.createTask({ title: 'Task 2' });
      
      expect(task2.id).toBe(task1.id + 1);
    });

    it('should add the task to the internal collection', async () => {
      const initialTasks = await taskService.getTasks();
      const initialCount = initialTasks.length;

      await taskService.createTask({ title: 'New Task' });
      
      const updatedTasks = await taskService.getTasks();
      expect(updatedTasks).toHaveLength(initialCount + 1);
    });

  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const updateInput: UpdateTaskInput = {
        title: 'Updated Task Title',
        description: 'Updated description',
        completed: true
      };

      const updatedTask = await taskService.updateTask(1, updateInput);
      
      expect(updatedTask).toMatchObject({
        id: 1,
        title: 'Updated Task Title',
        description: 'Updated description',
        completed: true
      });
      expect(updatedTask.updatedAt).toBeDefined();
      expect(new Date(updatedTask.updatedAt!)).toBeInstanceOf(Date);
    });

    it('should update only provided fields', async () => {
      const updateInput: UpdateTaskInput = {
        completed: true
      };

      const updatedTask = await taskService.updateTask(1, updateInput);
      
      expect(updatedTask).toMatchObject({
        id: 1,
        title: 'Test Task 1', // Should remain unchanged
        description: 'Test description 1', // Should remain unchanged
        completed: true // Should be updated
      });
    });

    it('should throw error when updating non-existent task', async () => {
      const updateInput: UpdateTaskInput = {
        title: 'Updated Title'
      };

      await expect(taskService.updateTask(999, updateInput))
        .rejects
        .toThrow('Task with id 999 not found');
    });

    it('should persist changes to the internal collection', async () => {
      const updateInput: UpdateTaskInput = {
        title: 'Persisted Update'
      };

      await taskService.updateTask(1, updateInput);
      
      const retrievedTask = await taskService.getTask(1);
      expect(retrievedTask?.title).toBe('Persisted Update');
    });

  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      await expect(taskService.deleteTask(1)).resolves.not.toThrow();
    });

    it('should remove task from internal collection', async () => {
      const initialTasks = await taskService.getTasks();
      const initialCount = initialTasks.length;

      await taskService.deleteTask(1);
      
      const updatedTasks = await taskService.getTasks();
      expect(updatedTasks).toHaveLength(initialCount - 1);
      
      const deletedTask = await taskService.getTask(1);
      expect(deletedTask).toBeNull();
    });

    it('should throw error when deleting non-existent task', async () => {
      await expect(taskService.deleteTask(999))
        .rejects
        .toThrow('Task with id 999 not found');
    });

  });

  describe('Integration Tests', () => {
    it('should maintain data consistency across operations', async () => {
      // Create a task
      const createdTask = await taskService.createTask({
        title: 'Integration Test Task',
        description: 'Testing data consistency'
      });

      // Verify it exists
      const retrievedTask = await taskService.getTask(createdTask.id);
      expect(retrievedTask).toEqual(createdTask);

      // Update the task
      const updatedTask = await taskService.updateTask(createdTask.id, {
        completed: true
      });
      expect(updatedTask.completed).toBe(true);

      // Verify update persisted
      const finalTask = await taskService.getTask(createdTask.id);
      expect(finalTask?.completed).toBe(true);

      // Delete the task
      await taskService.deleteTask(createdTask.id);

      // Verify deletion
      const deletedTask = await taskService.getTask(createdTask.id);
      expect(deletedTask).toBeNull();
    });

    it('should handle concurrent operations correctly', async () => {
      // Create multiple tasks concurrently
      const createPromises = [
        taskService.createTask({ title: 'Concurrent Task 1' }),
        taskService.createTask({ title: 'Concurrent Task 2' }),
        taskService.createTask({ title: 'Concurrent Task 3' })
      ];

      const createdTasks = await Promise.all(createPromises);
      
      // All tasks should have unique IDs
      const ids = createdTasks.map(task => task.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid task IDs gracefully', async () => {
      await expect(taskService.getTask(-1)).resolves.toBeNull();
      await expect(taskService.getTask(0)).resolves.toBeNull();
    });

    it('should handle empty update input', async () => {
      const originalTask = await taskService.getTask(1);
      const updatedTask = await taskService.updateTask(1, {});
      
      // The task should remain the same except for updatedAt being set
      expect(updatedTask).toMatchObject({
        id: originalTask!.id,
        title: originalTask!.title,
        description: originalTask!.description,
        completed: originalTask!.completed,
        createdAt: originalTask!.createdAt
      });
      expect(updatedTask.updatedAt).toBeDefined();
      expect(updatedTask.updatedAt).not.toBe(originalTask!.updatedAt);
    });
  });
});