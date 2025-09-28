// Configuration for dependency injection
// This allows easy switching between different service implementations

import { type ServiceType, SERVICE_TYPES, type ContainerConfig } from './types';

export const config: ContainerConfig = {
  // Change this to switch between JSON and API service implementations
  serviceType: SERVICE_TYPES.JSON,
};

// Re-export types and constants for external use
export { type ServiceType, SERVICE_TYPES, type ContainerConfig };
