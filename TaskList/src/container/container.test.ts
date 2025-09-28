// Test file for the DI container
import { container, getTaskService, reinitializeServices } from './container';
import { type ITaskService } from '../services/types';

describe('DIContainer', () => {
  beforeEach(() => {
    // Clear the container before each test
    container.clear();
  });

  afterEach(() => {
    // Reinitialize services after each test
    reinitializeServices();
  });

  describe('Service Registration and Resolution', () => {
    it('should register and resolve task service', () => {
      const mockTaskService: ITaskService = {
        getTasks: jest.fn(),
        getTask: jest.fn(),
        createTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
      };

      container.register('taskService', mockTaskService);
      
      const resolvedService = container.resolve('taskService');
      expect(resolvedService).toBe(mockTaskService);
    });

    it('should throw error when resolving unregistered service', () => {
      expect(() => {
        container.resolve('taskService');
      }).toThrow("Service 'taskService' not registered in container");
    });

    it('should check if service is registered', () => {
      expect(container.isRegistered('taskService')).toBe(false);
      
      const mockTaskService: ITaskService = {
        getTasks: jest.fn(),
        getTask: jest.fn(),
        createTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
      };
      
      container.register('taskService', mockTaskService);
      expect(container.isRegistered('taskService')).toBe(true);
    });
  });

  describe('Service Initialization', () => {
    it('should initialize JSON service when config is set to JSON', () => {
      // Reinitialize services to ensure they're available
      reinitializeServices();
      const taskService = getTaskService();
      expect(taskService).toBeDefined();
      expect(typeof taskService.getTasks).toBe('function');
    });

    it('should clear all services', () => {
      container.clear();
      expect(container.isRegistered('taskService')).toBe(false);
    });
  });

  describe('getTaskService convenience function', () => {
    it('should return the registered task service', () => {
      // Reinitialize services to ensure they're available
      reinitializeServices();
      const taskService = getTaskService();
      expect(taskService).toBeDefined();
      expect(typeof taskService.getTasks).toBe('function');
    });
  });
});
