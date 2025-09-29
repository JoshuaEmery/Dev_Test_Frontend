import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from './TaskList';
import { TaskProvider } from '../../context/TaskContext';

test('renders the component with initial content', () => {
  render(
    <TaskProvider>
      <TaskList />
    </TaskProvider>
  );
  expect(screen.getByText(/LoadingSpinner/i)).toBeInTheDocument();
});
