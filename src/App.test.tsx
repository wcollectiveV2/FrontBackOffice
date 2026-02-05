import { render, screen } from '@testing-library/react';
import App from './App';
import { vi } from 'vitest';

// Mock fetch for connected components
global.fetch = vi.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve('User Service OK'),
  } as Response)
);

describe('Admin Dashboard', () => {
  it('renders the sidebar title', () => {
    render(<App />);
    expect(screen.getByText('wcollective Admin')).toBeInTheDocument();
  });

  it('renders the dashboard overview by default', () => {
    render(<App />);
    expect(screen.getByText('Platform Overview')).toBeInTheDocument();
  });
});
