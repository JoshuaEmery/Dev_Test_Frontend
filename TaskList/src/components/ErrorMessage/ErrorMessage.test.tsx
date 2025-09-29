import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorMessage from './ErrorMessage';

test('renders the component with initial content', () => {
  render(<ErrorMessage message="Test error message" />);
  expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
});
