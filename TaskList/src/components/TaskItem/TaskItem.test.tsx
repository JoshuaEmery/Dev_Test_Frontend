import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskItem from './TaskItem';
import { TaskProvider } from '../../context/TaskContext';

const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

test('renders the component with initial content', () => {
  render(
    <TaskProvider>
      <TaskItem task={mockTask} />
    </TaskProvider>
  );
  expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
});
