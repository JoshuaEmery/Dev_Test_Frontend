import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from './TaskList';

test('renders the component with initial content', () => {
  render(<TaskList />);
  expect(screen.getByText(/TaskList/i)).toBeInTheDocument();
});
