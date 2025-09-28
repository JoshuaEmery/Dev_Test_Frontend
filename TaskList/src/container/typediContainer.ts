// TypeDI-based Dependency Injection Container
// This implementation uses TypeDI decorators for automatic dependency injection

import 'reflect-metadata';
import { Container, Service, Token } from 'typedi';
import { type ITaskService } from '../services/types';
import { TaskJSONService } from '../services/taskJSONService';
import { TaskService } from '../services/taskService';
import { config } from './config';

// Define service tokens for type-safe injection
export const TASK_SERVICE_TOKEN = new Token<ITaskService>('TaskService');

// Service decorators for automatic registration
@Service()
export class TaskJSONServiceDI extends TaskJSONService {}

@Service()
export class TaskServiceDI extends TaskService {}

// Container configuration and initialization
export class TypeDIContainer {
  private static initialized = false;

  // Initialize services based on configuration
  static initialize(): void {
    if (this.initialized) {
      return;
    }

    // Register the appropriate task service based on config
    if (config.serviceType === 'JSON') {
      Container.set(TASK_SERVICE_TOKEN, Container.get(TaskJSONServiceDI));
    } else if (config.serviceType === 'API') {
      Container.set(TASK_SERVICE_TOKEN, Container.get(TaskServiceDI));
    } else {
      throw new Error(`Unknown service type: ${config.serviceType}`);
    }

    this.initialized = true;
  }

  // Get a service instance
  static get<T>(token: Token<T>): T {
    if (!this.initialized) {
      this.initialize();
    }
    return Container.get(token);
  }

  // Reset container (useful for testing)
  static reset(): void {
    Container.reset();
    this.initialized = false;
  }

  // Reinitialize services (useful for config changes)
  static reinitialize(): void {
    this.reset();
    this.initialize();
  }
}

// Initialize services immediately
TypeDIContainer.initialize();

// Export convenience functions
export const getTaskService = (): ITaskService => {
  return TypeDIContainer.get(TASK_SERVICE_TOKEN);
};
