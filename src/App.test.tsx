import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Simple test to ensure the app renders without crashing
test('renders without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
