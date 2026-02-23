import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../components/pages/login-page';

const defaultProps = {
  appName: 'Test App',
  onEmailSignIn: vi.fn().mockResolvedValue(undefined),
  onEmailSignUp: vi.fn().mockResolvedValue(undefined),
  onGoogleSignIn: vi.fn().mockResolvedValue(undefined),
  onSuccess: vi.fn(),
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders app name', () => {
    render(<LoginPage {...defaultProps} />);

    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('renders sign-in form by default', () => {
    render(<LoginPage {...defaultProps} />);

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders logo when provided', () => {
    render(
      <LoginPage {...defaultProps} logo={<img src='/logo.png' alt='Logo' />} />
    );

    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  it('renders Google sign-in button when showGoogleSignIn is true and handler is provided', () => {
    render(<LoginPage {...defaultProps} />);

    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('does not render Google sign-in button when showGoogleSignIn is false', () => {
    render(<LoginPage {...defaultProps} showGoogleSignIn={false} />);

    expect(screen.queryByText('Sign in with Google')).not.toBeInTheDocument();
  });

  it('does not render Google sign-in button when onGoogleSignIn is not provided', () => {
    render(<LoginPage {...defaultProps} onGoogleSignIn={undefined} />);

    expect(screen.queryByText('Sign in with Google')).not.toBeInTheDocument();
  });

  it('toggles between sign-in and sign-up', () => {
    render(<LoginPage {...defaultProps} />);

    // Initially shows sign-in
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();

    // Click sign-up toggle
    fireEvent.click(screen.getByText('Sign up'));

    // Now shows sign-up
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('hides sign-up toggle when showSignUp is false', () => {
    render(<LoginPage {...defaultProps} showSignUp={false} />);

    expect(
      screen.queryByText("Don't have an account?")
    ).not.toBeInTheDocument();
  });

  it('calls onEmailSignIn on form submit', async () => {
    const user = userEvent.setup();
    render(<LoginPage {...defaultProps} />);

    await user.type(screen.getByLabelText('Email address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(defaultProps.onEmailSignIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });

  it('calls onEmailSignUp when in sign-up mode', async () => {
    const user = userEvent.setup();
    render(<LoginPage {...defaultProps} />);

    // Switch to sign-up mode
    await user.click(screen.getByText('Sign up'));

    await user.type(screen.getByLabelText('Email address'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'newpassword');

    // The submit button should now say "Sign up"
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(defaultProps.onEmailSignUp).toHaveBeenCalledWith(
        'new@example.com',
        'newpassword'
      );
    });
  });

  it('calls onSuccess after successful sign-in', async () => {
    const user = userEvent.setup();
    render(<LoginPage {...defaultProps} />);

    await user.type(screen.getByLabelText('Email address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('displays inline error on auth failure', async () => {
    const onEmailSignIn = vi.fn().mockRejectedValue({
      code: 'auth/invalid-email',
      message: 'Invalid email address',
    });

    const user = userEvent.setup();
    render(<LoginPage {...defaultProps} onEmailSignIn={onEmailSignIn} />);

    await user.type(screen.getByLabelText('Email address'), 'bad@test.com');
    await user.type(screen.getByLabelText('Password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Invalid email address'
      );
    });
  });

  it('calls onAuthError instead of showing inline error when provided', async () => {
    const onAuthError = vi.fn();
    const onEmailSignIn = vi.fn().mockRejectedValue({
      code: 'auth/invalid-email',
      message: 'Invalid email address',
    });

    const user = userEvent.setup();
    render(
      <LoginPage
        {...defaultProps}
        onEmailSignIn={onEmailSignIn}
        onAuthError={onAuthError}
      />
    );

    await user.type(screen.getByLabelText('Email address'), 'bad@test.com');
    await user.type(screen.getByLabelText('Password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(onAuthError).toHaveBeenCalledWith({
        code: 'auth/invalid-email',
        message: 'Invalid email address',
        isUserAction: false,
      });
    });

    // Should NOT show inline error
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not show inline error for user-action error codes', async () => {
    const onEmailSignIn = vi.fn().mockRejectedValue({
      code: 'auth/popup-closed-by-user',
      message: 'Popup closed',
    });

    const user = userEvent.setup();
    render(<LoginPage {...defaultProps} onEmailSignIn={onEmailSignIn} />);

    await user.type(screen.getByLabelText('Email address'), 'test@test.com');
    await user.type(screen.getByLabelText('Password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(onEmailSignIn).toHaveBeenCalled();
    });

    // Should NOT show inline error for user actions
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onGoogleSignIn when Google button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginPage {...defaultProps} />);

    await user.click(screen.getByText('Sign in with Google'));

    await waitFor(() => {
      expect(defaultProps.onGoogleSignIn).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <LoginPage {...defaultProps} className='custom-login' />
    );

    expect(container.firstChild).toHaveClass('custom-login');
  });

  it('uses blue color variant', () => {
    render(<LoginPage {...defaultProps} colorVariant='blue' />);

    const title = screen.getByText('Test App');
    expect(title).toHaveClass('text-blue-600');
  });

  it('uses primary color variant by default', () => {
    render(<LoginPage {...defaultProps} />);

    const title = screen.getByText('Test App');
    expect(title).toHaveClass('text-primary-600');
  });
});
