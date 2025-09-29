import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from './TaskForm';
import { TaskProvider } from '../../context/TaskContext';

test('renders the component with initial content', () => {
  render(
    <TaskProvider>
      <TaskForm />
    </TaskProvider>
  );
  expect(screen.getByText(/Add New Task/i)).toBeInTheDocument();
});
