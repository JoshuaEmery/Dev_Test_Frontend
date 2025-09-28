import { render, screen } from '@testing-library/react';
import JestTest from './JestTest';

test('renders the component with initial content', () => {
  render(<JestTest />);
  expect(screen.getByText(/Counter/i)).toBeInTheDocument();
});
