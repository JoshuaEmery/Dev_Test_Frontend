# Dependency Injection Container

This directory contains a basic dependency injection container for managing services throughout the application.

## Files

- `config.ts` - Configuration for service type selection
- `container.ts` - Main DI container implementation
- `types.ts` - Type definitions for the container
- `container.test.ts` - Tests for the DI container

## Usage

### Basic Usage

```typescript
import { getTaskService } from '../container/container';

// Get the configured task service
const taskService = getTaskService();
const tasks = await taskService.getTasks();
```

### Switching Service Types

To switch between JSON and API services, modify the `config.ts` file:

```typescript
export const config = {
  serviceType: 'API' as ServiceType, // Change from 'JSON' to 'API'
} as const;
```

### Advanced Usage

```typescript
import { container, reinitializeServices } from '../container/container';

// Register a custom service
container.register('taskService', myCustomService);

// Check if a service is registered
if (container.isRegistered('taskService')) {
  const service = container.resolve('taskService');
}

// Clear all services (useful for testing)
container.clear();

// Reinitialize services after config changes
reinitializeServices();
```

## Service Types

- **JSON**: Uses `TaskJSONService` - reads from local JSON data with simulated delays
- **API**: Uses `TaskService` - placeholder for future API integration

## Testing

The container is designed to be easily testable. You can:

1. Clear the container and register mock services
2. Use `reinitializeServices()` to reset to default configuration
3. Test different service configurations by modifying the config

## Architecture Benefits

- **Loose Coupling**: Components depend on interfaces, not concrete implementations
- **Easy Testing**: Services can be easily mocked and swapped
- **Configuration-Driven**: Service selection is controlled by a simple config file
- **Type Safety**: Full TypeScript support with proper typing
