import React from 'react';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { BlogProvider } from './contexts/BlogContext';
import { InMemoryAdapter } from './adapters/inMemoryAdapter';

jest.mock('./components/admin/RichTextEditor', () => {
  return function MockRichTextEditor() {
    return <div data-testid="rich-text-editor" />;
  };
});

beforeAll(() => {
  window.scrollTo = jest.fn();
});

import App from './App';

function renderApp() {
  const adapter = new InMemoryAdapter();
  return render(
    <HelmetProvider>
      <AuthProvider>
        <BlogProvider adapter={adapter}>
          <App />
        </BlogProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

test('renders the home page with L\'Maaza branding', async () => {
  renderApp();
  const headings = await screen.findAllByText(/L'Maaza/i);
  expect(headings.length).toBeGreaterThan(0);
});
