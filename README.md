# Frontend Dev Test: To do list app

## https://witty-sand-09db3fe0f.1.azurestaticapps.net/

- Allow time for the API to cold start when initially launching this paage. It will likely take at least one refresh to get a response from the API, just deploying as cheaply as possible while in prod.

Project is build with React, TypeScript, and Vite. Package management via pnpm, testing via Jest.


## 🚀 Quick Start

### Prerequisites

- **Node.js**
- **pnpm** package manager

If you don't have pnpm installed, install it globally:

```bash
npm install -g pnpm
```

### Installation & Running

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start development server:**

   ```bash
   pnpm run dev
   ```

3. **Run tests:**

   ```bash
   pnpm test
   ```

4. **Build for production:**

   ```bash
   pnpm run build
   ```

## 📁 Project Structure

The application follows the following structure:

This is considerably overengineered for the purpose of the test, but I wanted to apply some more advanced patterns and practices. Some of them I was pretty happy with while others seem unnecessary. I wanted to implement DI as coming from a .NET background DI has been pounded into our heads. I initially rolled my own DI container and then also implemented TypeDI. Going forward would just implement TypeDI. It is functional and will allow for easy swapping between dev and prod services. The other pattern that I wanted to explore was context wrapped with useReducer implementing optimistic updates and exposed via custom hooks. I was happy with this result and would likely use in the future. It is definitely overkill for this project but as state grows in complexity this would be a good pattern to use. As I see it the decision to use this would come down to balancing responsiveness vs risk of desynchronization of data on the server side. If a client lost connectivity for a short period of time they would not see the most recent data and they may continue to use the app not knowing that they have unsaved changes. We can manage this on the application side but it would still be a risk and present some complexity.

I personally have not done a lot of unit testing of UI components. With the help of AI I implemented some but was not super happy with the results. If we were planning to unit test our UI components I would need to invest more time into it.

I followed the following conventions:

One component per file, types in separate files, tests in seperate file.

```
src/
├── components/          # Reusable UI components
│   ├── ErrorMessage/    # Error display component
│   ├── LoadingSpinner/  # Loading state component
│   ├── TaskForm/        # Task creation form
│   ├── TaskItem/        # Individual task display & editing
│   └── TaskList/        # Task list container
├── container/           # Dependency injection setup
├── context/             # React Context for state management
├── data/               # Sample data and data files
├── hooks/              # Custom React hooks
├── services/           # Business logic and API layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and constants
```

## 🏗️ Architecture Overview

### State Management with useReducer

The application uses React's `useReducer` hook for complex state management, providing:

- **Predictable state updates** through action-based state changes
- **Optimistic updates** for immediate user feedback
- **Error handling** with automatic rollback capabilities
- **Type safety** with TypeScript action types

#### State Flow:

1. **User Action** → Component calls context method
2. **Optimistic Update** → UI updates immediately
3. **API Call** → Service layer makes actual request
4. **Success/Error** → State updated with real data or reverted

### Optimistic Updates

The application implements optimistic updates for a responsive user experience. If we do not need this level of responsiveness, this is far from necessary. Just something to consider. Essentially what happens is that the UI is updated immediately with the new data before the API call is made. If the API call is successful, the UI is updated with the real data. If the API call is unsuccessful, the UI is updated with the reverted data. If we did go forward with the feature in prod I would likely use a library such as Tanstack.

```typescript
// Example: Creating a task
const createTask = async (data: CreateTaskInput) => {
  // 1. Show task immediately (optimistic)
  dispatch({ type: 'OPTIMISTIC_ADD_TASK', payload: optimisticTask });

  try {
    // 2. Make API call
    const newTask = await service.createTask(data);
    // 3. Replace with real data
    dispatch({ type: 'UPDATE_TASK', payload: newTask });
  } catch (error) {
    // 4. Revert on error
    dispatch({ type: 'REVERT_OPTIMISTIC_ADD', payload: tempId });
  }
};
```

### Dependency Injection with TypeDI

The application uses TypeDI for dependency injection, allowing easy service swapping. Right now this only is used to switch between using a JSON file or an API for data persistence, however it could be implement for a variety of services:

- **Service Interface**: `ITaskService` defines the contract
- **Multiple Implementations**: JSON service (current) and API service (future)
- **Configuration-driven**: Switch services via config file
- **Type-safe**: Full TypeScript support with decorators

## 📂 Folder Responsibilities

### `/components`

Reusable UI components with their own:

- **Component file** (`.tsx`)
- **Type definitions** (`types.ts`)
- **Test files** (`.test.tsx`)

**Key Components:**

- `TaskForm`: Handles task creation with validation
- `TaskList`: Displays tasks with progress tracking
- `TaskItem`: Individual task with inline editing
- `LoadingSpinner`: Loading state indicator
- `ErrorMessage`: Error display with retry options

### `/context`

React Context implementation for global state, contains the reducer and access to the services:

- **TaskContext**: Main state management with useReducer
- **Types**: Context-specific TypeScript definitions
- **Tests**: Comprehensive context testing

### `/services`

Business logic and data access layer, interacts with persistant storage:

- **taskService.ts**: API service interface (placeholder)
- **taskJSONService.ts**: JSON-based service (current implementation)
- **types.ts**: Service interfaces and data types

### `/container`

Dependency injection configuration:

- **typediContainer.ts**: TypeDI setup and service registration
- **config.ts**: Service configuration (JSON vs API)
- **types.ts**: Container-specific types

### `/hooks`

Custom React hooks, these hooks provide access to the context. Context contains the reducer and has access to the services. The hooks are used to get the data and perform the actions.

- **useTasks**: Public API for task operations
- **types.ts**: Hook-specific type definitions

### `/utils`

Utility functions and constants. This is for functions that do not connect to external systems, did not end up using any of these but they are a good place to put them:

- **constants.ts**: Application constants
- **formatters.ts**: Data formatting utilities
- **validation.ts**: Input validation functions

## 🔄 Data Flow

```
User Interaction
       ↓
   Component
       ↓
   useTasks Hook
       ↓
   TaskContext
       ↓
   useReducer
       ↓
   Service Layer
       ↓
   Data Source (JSON/API)
```

### Detailed Flow:

1. **User Action**: User interacts with UI component
2. **Hook Call**: Component calls `useTasks()` hook method
3. **Context Dispatch**: Hook dispatches action to context
4. **Reducer Processing**: `taskReducer` processes action and updates state
5. **Service Call**: Context calls appropriate service method
6. **Data Update**: Service returns data, context updates state
7. **UI Re-render**: Components re-render with new state

## 🧪 Testing

```bash
# Run all tests
pnpm test

```

## 🛠️ Development Conventions

### TypeScript Conventions

- **Types in separate files**: Each module has its own `types.ts`
- **Interface naming**: Prefix interfaces with `I` (e.g., `ITaskService`) - This is an old C# habit
- **Strict typing**: No `any` types

### Component Conventions

- **One component per file**: Each component in its own directory
- **Props interfaces**: Define props in separate `types.ts` files
- **Default exports**: Use default exports for components
- **Consistent naming**: PascalCase for components, camelCase for functions
- **Consistent structure**: Same pattern across all modules

## 🚀 Deployment

The application uses Github Actions to deploy to Azure Static Web App on push to the repository.
