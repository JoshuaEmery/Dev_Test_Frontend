// Tests for TypeDI-based container
import { TypeDIContainer, getTaskService, TASK_SERVICE_TOKEN } from './typediContainer';
import { TaskJSONService } from '../services/taskJSONService';

describe('TypeDIContainer', () => {
  beforeEach(() => {
    // Reset container before each test
    TypeDIContainer.reset();
  });

  afterEach(() => {
    // Clean up after each test
    TypeDIContainer.reset();
  });

  describe('Service Resolution', () => {
    it('should resolve TaskJSONService when configured for JSON', () => {
      // Test with default JSON configuration
      TypeDIContainer.initialize();
      const service = TypeDIContainer.get(TASK_SERVICE_TOKEN);
      
      expect(service).toBeInstanceOf(TaskJSONService);
      expect(service).toHaveProperty('getTasks');
      expect(service).toHaveProperty('createTask');
    });

    it('should provide working task service', async () => {
      TypeDIContainer.initialize();
      const service = getTaskService();
      
      // Test that the service actually works
      const tasks = await service.getTasks();
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe('Convenience Functions', () => {
    it('should provide getTaskService convenience function', () => {
      TypeDIContainer.initialize();
      const service = getTaskService();
      
      expect(service).toBeDefined();
      expect(typeof service.getTasks).toBe('function');
      expect(typeof service.createTask).toBe('function');
    });
  });

  describe('Container Management', () => {
    it('should reinitialize services correctly', () => {
      TypeDIContainer.initialize();
      const service1 = getTaskService();
      
      TypeDIContainer.reinitialize();
      const service2 = getTaskService();
      
      // Should be different instances after reinitialization
      expect(service1).not.toBe(service2);
    });

    it('should reset container state', () => {
      TypeDIContainer.initialize();
      expect(() => TypeDIContainer.get(TASK_SERVICE_TOKEN)).not.toThrow();
      
      TypeDIContainer.reset();
      // After reset, should need to reinitialize
      TypeDIContainer.initialize();
      expect(() => TypeDIContainer.get(TASK_SERVICE_TOKEN)).not.toThrow();
    });
  });

  describe('Service Interface Compliance', () => {
    it('should return service that implements ITaskService interface', () => {
      TypeDIContainer.initialize();
      const service = getTaskService();
      
      // Check that service implements all required methods
      expect(typeof service.getTasks).toBe('function');
      expect(typeof service.getTask).toBe('function');
      expect(typeof service.createTask).toBe('function');
      expect(typeof service.updateTask).toBe('function');
      expect(typeof service.deleteTask).toBe('function');
    });
  });
});
