import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from './LoadingSpinner';

test('renders the component with initial content', () => {
  render(<LoadingSpinner />);
  expect(screen.getByText(/Loading Tasks/i)).toBeInTheDocument();
});
