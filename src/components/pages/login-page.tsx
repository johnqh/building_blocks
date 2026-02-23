import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../utils';

/**
 * Google logo SVG component
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' aria-hidden='true'>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
    </svg>
  );
}

/**
 * Auth error info passed to onAuthError callback
 */
export interface AuthErrorInfo {
  /** Firebase error code (e.g., 'auth/popup-closed-by-user') */
  code: string;
  /** Error message */
  message: string;
  /** Whether this is a user-initiated action (like closing popup) vs actual error */
  isUserAction: boolean;
}

/**
 * Color variant for the LoginPage.
 * Each variant maps to a set of static, JIT-safe Tailwind classes.
 */
export type LoginPageColorVariant =
  | 'primary'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'orange'
  | 'emerald'
  | 'rose';

/**
 * Props for the LoginPage component
 *
 * LoginPage is a presentational component that accepts auth handler callbacks.
 * The consumer must provide the actual auth logic (e.g., Firebase signIn).
 */
export interface LoginPageProps {
  /** Application name displayed as the main title */
  appName: string;
  /** Optional logo element to display above the title */
  logo?: ReactNode;
  /**
   * Handler for email/password sign-in.
   * Called with email and password; should throw on error.
   * The error object should have `code` and `message` properties for proper error display.
   */
  onEmailSignIn: (email: string, password: string) => Promise<void>;
  /**
   * Handler for email/password sign-up (account creation).
   * Called with email and password; should throw on error.
   * Only used when `showSignUp` is true.
   */
  onEmailSignUp?: (email: string, password: string) => Promise<void>;
  /**
   * Handler for Google sign-in.
   * Should perform the Google OAuth flow; should throw on error.
   * Only used when `showGoogleSignIn` is true.
   */
  onGoogleSignIn?: () => Promise<void>;
  /** Callback fired on successful authentication */
  onSuccess: () => void;
  /** Callback fired on auth errors - if provided, errors won't be shown inline */
  onAuthError?: (error: AuthErrorInfo) => void;
  /** Whether to show Google sign-in option (default: true) */
  showGoogleSignIn?: boolean;
  /** Whether to show sign-up option (default: true) */
  showSignUp?: boolean;
  /** Custom className for the container */
  className?: string;
  /**
   * Color variant for themed elements (default: 'primary').
   * Uses static Tailwind classes to ensure JIT compatibility.
   */
  colorVariant?: LoginPageColorVariant;
}

/**
 * Text content for the LoginPage
 */
export interface LoginPageText {
  signIn: string;
  signUp: string;
  createAccount: string;
  signInToAccount: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  orContinueWith: string;
  signInWithGoogle: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
}

const defaultText: LoginPageText = {
  signIn: 'Sign in',
  signUp: 'Sign up',
  createAccount: 'Create your account',
  signInToAccount: 'Sign in to your account',
  emailLabel: 'Email address',
  emailPlaceholder: '',
  passwordLabel: 'Password',
  passwordPlaceholder: '',
  orContinueWith: 'Or continue with',
  signInWithGoogle: 'Sign in with Google',
  alreadyHaveAccount: 'Already have an account?',
  dontHaveAccount: "Don't have an account?",
};

// Error codes that represent user actions rather than actual errors
const USER_ACTION_ERROR_CODES = [
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
];

/**
 * Static Tailwind class mappings for each color variant.
 * Using complete class strings ensures Tailwind JIT can detect them at build time.
 */
const colorVariantClasses: Record<
  LoginPageColorVariant,
  {
    title: string;
    inputFocus: string;
    submitButton: string;
    googleButtonFocusRing: string;
    toggleLink: string;
  }
> = {
  primary: {
    title: 'text-primary-600',
    inputFocus: 'focus:ring-primary-500 focus:border-primary-500',
    submitButton:
      'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
    googleButtonFocusRing: 'focus:ring-primary-500',
    toggleLink: 'text-primary-600 hover:text-primary-500',
  },
  blue: {
    title: 'text-blue-600',
    inputFocus: 'focus:ring-blue-500 focus:border-blue-500',
    submitButton:
      'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    googleButtonFocusRing: 'focus:ring-blue-500',
    toggleLink: 'text-blue-600 hover:text-blue-500',
  },
  indigo: {
    title: 'text-indigo-600',
    inputFocus: 'focus:ring-indigo-500 focus:border-indigo-500',
    submitButton:
      'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300',
    googleButtonFocusRing: 'focus:ring-indigo-500',
    toggleLink: 'text-indigo-600 hover:text-indigo-500',
  },
  violet: {
    title: 'text-violet-600',
    inputFocus: 'focus:ring-violet-500 focus:border-violet-500',
    submitButton:
      'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500 disabled:bg-violet-300',
    googleButtonFocusRing: 'focus:ring-violet-500',
    toggleLink: 'text-violet-600 hover:text-violet-500',
  },
  orange: {
    title: 'text-orange-600',
    inputFocus: 'focus:ring-orange-500 focus:border-orange-500',
    submitButton:
      'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 disabled:bg-orange-300',
    googleButtonFocusRing: 'focus:ring-orange-500',
    toggleLink: 'text-orange-600 hover:text-orange-500',
  },
  emerald: {
    title: 'text-emerald-600',
    inputFocus: 'focus:ring-emerald-500 focus:border-emerald-500',
    submitButton:
      'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-300',
    googleButtonFocusRing: 'focus:ring-emerald-500',
    toggleLink: 'text-emerald-600 hover:text-emerald-500',
  },
  rose: {
    title: 'text-rose-600',
    inputFocus: 'focus:ring-rose-500 focus:border-rose-500',
    submitButton:
      'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 disabled:bg-rose-300',
    googleButtonFocusRing: 'focus:ring-rose-500',
    toggleLink: 'text-rose-600 hover:text-rose-500',
  },
};

/**
 * A reusable login page component with email/password and Google sign-in support.
 *
 * This component is fully decoupled from any auth provider. The consumer provides
 * auth handler callbacks (`onEmailSignIn`, `onEmailSignUp`, `onGoogleSignIn`).
 *
 * @example
 * ```tsx
 * import { LoginPage } from '@sudobility/building_blocks';
 * import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
 * import { getFirebaseAuth } from '@sudobility/auth_lib';
 *
 * function MyLoginPage() {
 *   const navigate = useNavigate();
 *   const auth = getFirebaseAuth();
 *
 *   return (
 *     <LoginPage
 *       appName="My App"
 *       onEmailSignIn={async (email, password) => {
 *         await signInWithEmailAndPassword(auth, email, password);
 *       }}
 *       onEmailSignUp={async (email, password) => {
 *         await createUserWithEmailAndPassword(auth, email, password);
 *       }}
 *       onGoogleSignIn={async () => {
 *         await signInWithPopup(auth, new GoogleAuthProvider());
 *       }}
 *       onSuccess={() => navigate('/')}
 *     />
 *   );
 * }
 * ```
 */
export function LoginPage({
  appName,
  logo,
  onEmailSignIn,
  onEmailSignUp,
  onGoogleSignIn,
  onSuccess,
  onAuthError,
  showGoogleSignIn = true,
  showSignUp = true,
  className = '',
  colorVariant = 'primary',
}: LoginPageProps) {
  // Development-only warnings for common misconfigurations
  if (process.env.NODE_ENV !== 'production') {
    if (showSignUp && !onEmailSignUp) {
      console.warn(
        '[LoginPage] showSignUp is true but onEmailSignUp handler is not provided. ' +
          'Sign-up will fall back to onEmailSignIn. Provide onEmailSignUp for proper account creation.'
      );
    }
    if (showGoogleSignIn && !onGoogleSignIn) {
      console.warn(
        '[LoginPage] showGoogleSignIn is true but onGoogleSignIn handler is not provided. ' +
          'Google sign-in button will not be rendered. Provide onGoogleSignIn or set showGoogleSignIn to false.'
      );
    }
  }
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleSignInPending, setIsGoogleSignInPending] = useState(false);
  const googleSignInStartTime = useRef<number | null>(null);

  const colors = colorVariantClasses[colorVariant];

  // Reset Google sign-in state when window regains focus
  // This handles the case where browser opens a new tab instead of popup
  useEffect(() => {
    const handleFocus = () => {
      if (isGoogleSignInPending && googleSignInStartTime.current) {
        // If more than 2 seconds have passed since sign-in started,
        // and we're back in focus, the user likely closed the tab/popup
        const elapsed = Date.now() - googleSignInStartTime.current;
        if (elapsed > 2000) {
          setIsLoading(false);
          setIsGoogleSignInPending(false);
          googleSignInStartTime.current = null;
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isGoogleSignInPending]);

  const handleAuthError = (err: unknown) => {
    const firebaseError = err as { code?: string; message?: string };
    const code = firebaseError.code || 'unknown';
    const message = firebaseError.message || 'Authentication failed';
    const isUserAction = USER_ACTION_ERROR_CODES.includes(code);

    if (onAuthError) {
      onAuthError({ code, message, isUserAction });
    } else if (!isUserAction) {
      // Only show inline error for actual errors, not user actions
      setError(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp && showSignUp && onEmailSignUp) {
        await onEmailSignUp(email, password);
      } else {
        await onEmailSignIn(email, password);
      }
      onSuccess();
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!onGoogleSignIn) return;

    setError(null);
    setIsLoading(true);
    setIsGoogleSignInPending(true);
    googleSignInStartTime.current = Date.now();

    try {
      await onGoogleSignIn();
      onSuccess();
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
      setIsGoogleSignInPending(false);
      googleSignInStartTime.current = null;
    }
  };

  const text = defaultText;

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      <div className='max-w-md w-full space-y-8'>
        <div>
          {logo && <div className='flex justify-center mb-4'>{logo}</div>}
          <h1 className={cn('text-center text-3xl font-bold', colors.title)}>
            {appName}
          </h1>
          <h2 className='mt-6 text-center text-2xl font-semibold text-gray-900'>
            {isSignUp && showSignUp ? text.createAccount : text.signInToAccount}
          </h2>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div
              className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm'
              role='alert'
            >
              {error}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label
                htmlFor='login-email'
                className='block text-sm font-medium text-gray-700'
              >
                {text.emailLabel}
              </label>
              <input
                id='login-email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={text.emailPlaceholder}
                className={cn(
                  'mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm',
                  colors.inputFocus
                )}
              />
            </div>

            <div>
              <label
                htmlFor='login-password'
                className='block text-sm font-medium text-gray-700'
              >
                {text.passwordLabel}
              </label>
              <input
                id='login-password'
                name='password'
                type='password'
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={text.passwordPlaceholder}
                className={cn(
                  'mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm',
                  colors.inputFocus
                )}
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className={cn(
                'w-full inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white px-4 py-2 text-sm',
                colors.submitButton
              )}
            >
              {isLoading && (
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
              )}
              {isSignUp && showSignUp ? text.signUp : text.signIn}
            </button>
          </div>

          {showGoogleSignIn && onGoogleSignIn && (
            <>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-gray-50 text-gray-500'>
                    {text.orContinueWith}
                  </span>
                </div>
              </div>

              <div>
                <button
                  type='button'
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className={cn(
                    'w-full inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 px-4 py-2 text-sm',
                    colors.googleButtonFocusRing
                  )}
                >
                  {isLoading ? (
                    <svg
                      className='animate-spin -ml-1 mr-2 h-5 w-5'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      aria-hidden='true'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                  ) : (
                    <GoogleIcon className='h-5 w-5 mr-2' />
                  )}
                  {text.signInWithGoogle}
                </button>
              </div>
            </>
          )}
        </form>

        {showSignUp && (
          <p className='text-center text-sm text-gray-600'>
            {isSignUp ? text.alreadyHaveAccount : text.dontHaveAccount}{' '}
            <button
              type='button'
              onClick={() => setIsSignUp(!isSignUp)}
              className={cn('font-medium', colors.toggleLink)}
            >
              {isSignUp ? text.signIn : text.signUp}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
