import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from './TaskForm';

test('renders the component with initial content', () => {
  render(<TaskForm />);
  expect(screen.getByText(/TaskForm/i)).toBeInTheDocument();
});
