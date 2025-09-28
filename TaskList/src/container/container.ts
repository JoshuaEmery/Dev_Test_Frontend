// Basic Dependency Injection Container
// Simple implementation for service registration and resolution

import { type ITaskService } from '../services/types';
import { TaskJSONService } from '../services/taskJSONService';
import { TaskService } from '../services/taskService';
import { config } from './config';
import { type ServiceRegistry } from './types';

// Container class for dependency injection
class DIContainer {
  private services: Partial<ServiceRegistry> = {};

  // Register a service instance
  register<K extends keyof ServiceRegistry>(key: K, instance: ServiceRegistry[K]): void {
    this.services[key] = instance;
  }

  // Resolve a service instance
  resolve<K extends keyof ServiceRegistry>(key: K): ServiceRegistry[K] {
    const service = this.services[key];
    if (!service) {
      throw new Error(`Service '${key}' not registered in container`);
    }
    return service;
  }

  // Check if a service is registered
  isRegistered<K extends keyof ServiceRegistry>(key: K): boolean {
    return key in this.services;
  }

  // Clear all registered services (useful for testing)
  clear(): void {
    this.services = {};
  }
}

// Create and configure the global container instance
const container = new DIContainer();

// Initialize services based on configuration
const initializeServices = (): void => {
  // Register the appropriate task service based on config
  if (config.serviceType === 'JSON') {
    container.register('taskService', new TaskJSONService());
  } else if (config.serviceType === 'API') {
    container.register('taskService', new TaskService());
  } else {
    throw new Error(`Unknown service type: ${config.serviceType}`);
  }
};

// Initialize services immediately
initializeServices();

// Export the container instance and utility functions
export { container, DIContainer };

// Convenience function to get the task service
export const getTaskService = (): ITaskService => {
  return container.resolve('taskService');
};

// Function to reinitialize services (useful for testing or config changes)
export const reinitializeServices = (): void => {
  container.clear();
  initializeServices();
};