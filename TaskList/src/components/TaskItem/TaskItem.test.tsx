import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskItem from './TaskItem';

test('renders the component with initial content', () => {
  render(<TaskItem />);
  expect(screen.getByText(/TaskItem/i)).toBeInTheDocument();
});
