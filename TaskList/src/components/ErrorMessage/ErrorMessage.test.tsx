import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorMessage from './ErrorMessage';

test('renders the component with initial content', () => {
  render(<ErrorMessage />);
  expect(screen.getByText(/ErrorMessage/i)).toBeInTheDocument();
});
