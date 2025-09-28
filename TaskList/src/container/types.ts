// Container types for dependency injection
// This file consolidates all types related to the DI container

import { type ITaskService } from '../services/types';

// Service registry type - defines all available services in the container
export type ServiceRegistry = {
  taskService: ITaskService;
};

// Service type configuration
export type ServiceType = 'JSON' | 'API';

// Service type constants for better type safety
export const SERVICE_TYPES = {
  JSON: 'JSON' as const,
  API: 'API' as const,
} as const;

// Configuration interface for the container
export interface ContainerConfig {
  serviceType: ServiceType;
}
