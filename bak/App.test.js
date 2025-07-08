import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders LiveSheet header', () => {
  render(<App />);
  const headerElement = screen.getByText(/LiveSheet/i);
  expect(headerElement).toBeInTheDocument();
});
