/**
 * Unit tests for AuthContext.
 * Requirements: 1.6, 7.8, 7.9
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * A simple component that reads the AuthContext and renders key values so we
 * can assert on them via the DOM.
 */
function AuthConsumer() {
  const { user, isLoggedIn, isAdmin, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="isLoggedIn">{String(isLoggedIn)}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <span data-testid="role">{user ? user.role : 'none'}</span>
      <span data-testid="name">{user ? user.name : 'none'}</span>
      <button data-testid="loginAdmin" onClick={() => login('admin')} />
      <button data-testid="loginUser" onClick={() => login('user')} />
      <button
        data-testid="loginObj"
        onClick={() =>
          login({ id: 'u-42', name: 'Alice', role: 'admin' })
        }
      />
      <button data-testid="logout" onClick={logout} />
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

// ─── localStorage mock ────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthContext — initial state', () => {
  it('should start unauthenticated when localStorage is empty', () => {
    renderWithProvider();
    expect(screen.getByTestId('isLoggedIn').textContent).toBe('false');
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
    expect(screen.getByTestId('role').textContent).toBe('none');
  });

  it('should restore an admin session from localStorage', () => {
    const storedUser = { id: 'admin-1', name: 'Administrateur', role: 'admin' };
    localStorage.setItem('lmaaza_auth_user', JSON.stringify(storedUser));

    renderWithProvider();

    expect(screen.getByTestId('isLoggedIn').textContent).toBe('true');
    expect(screen.getByTestId('isAdmin').textContent).toBe('true');
    expect(screen.getByTestId('role').textContent).toBe('admin');
  });

  it('should restore a user session from localStorage', () => {
    const storedUser = { id: 'user-1', name: 'Alice', role: 'user' };
    localStorage.setItem('lmaaza_auth_user', JSON.stringify(storedUser));

    renderWithProvider();

    expect(screen.getByTestId('isLoggedIn').textContent).toBe('true');
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
    expect(screen.getByTestId('role').textContent).toBe('user');
  });

  it('should ignore malformed localStorage data', () => {
    localStorage.setItem('lmaaza_auth_user', '{bad json}');
    renderWithProvider();
    expect(screen.getByTestId('isLoggedIn').textContent).toBe('false');
  });

  it('should ignore localStorage data missing required fields', () => {
    localStorage.setItem('lmaaza_auth_user', JSON.stringify({ id: 'x' }));
    renderWithProvider();
    expect(screen.getByTestId('isLoggedIn').textContent).toBe('false');
  });
});

describe('AuthContext — login()', () => {
  it('should authenticate as admin when login("admin") is called', () => {
    renderWithProvider();

    act(() => {
      screen.getByTestId('loginAdmin').click();
    });

    expect(screen.getByTestId('isLoggedIn').textContent).toBe('true');
    expect(screen.getByTestId('isAdmin').textContent).toBe('true');
    expect(screen.getByTestId('role').textContent).toBe('admin');
  });

  it('should authenticate as a regular user when login("user") is called', () => {
    renderWithProvider();

    act(() => {
      screen.getByTestId('loginUser').click();
    });

    expect(screen.getByTestId('isLoggedIn').textContent).toBe('true');
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
    expect(screen.getByTestId('role').textContent).toBe('user');
  });

  it('should accept a full credentials object', () => {
    renderWithProvider();

    act(() => {
      screen.getByTestId('loginObj').click();
    });

    expect(screen.getByTestId('isLoggedIn').textContent).toBe('true');
    expect(screen.getByTestId('isAdmin').textContent).toBe('true');
    expect(screen.getByTestId('name').textContent).toBe('Alice');
  });

  it('should persist session to localStorage after login', () => {
    renderWithProvider();

    act(() => {
      screen.getByTestId('loginAdmin').click();
    });

    const stored = JSON.parse(localStorage.getItem('lmaaza_auth_user'));
    expect(stored).not.toBeNull();
    expect(stored.role).toBe('admin');
  });
});

describe('AuthContext — logout()', () => {
  it('should clear user state after logout', () => {
    renderWithProvider();

    act(() => {
      screen.getByTestId('loginAdmin').click();
    });
    act(() => {
      screen.getByTestId('logout').click();
    });

    expect(screen.getByTestId('isLoggedIn').textContent).toBe('false');
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
    expect(screen.getByTestId('role').textContent).toBe('none');
  });

  it('should remove the session from localStorage after logout', () => {
    renderWithProvider();

    act(() => {
      screen.getByTestId('loginAdmin').click();
    });
    act(() => {
      screen.getByTestId('logout').click();
    });

    expect(localStorage.getItem('lmaaza_auth_user')).toBeNull();
  });
});

describe('AuthContext — isAdmin computed boolean', () => {
  it('should be false for unauthenticated users', () => {
    renderWithProvider();
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
  });

  it('should be false for authenticated non-admin users', () => {
    renderWithProvider();

    act(() => {
      screen.getByTestId('loginUser').click();
    });

    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
  });

  it('should be true only for admin role', () => {
    renderWithProvider();

    act(() => {
      screen.getByTestId('loginAdmin').click();
    });

    expect(screen.getByTestId('isAdmin').textContent).toBe('true');
  });
});

describe('useAuth — outside provider', () => {
  it('should throw when used outside AuthProvider', () => {
    // Suppress the React error boundary console output during this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<AuthConsumer />)).toThrow(
      'useAuth doit être utilisé dans un AuthProvider'
    );

    spy.mockRestore();
  });
});
