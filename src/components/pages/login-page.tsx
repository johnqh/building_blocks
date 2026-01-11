import React, { useState, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from 'firebase/auth';

/**
 * Props for the LoginPage component
 */
export interface LoginPageProps {
  /** Application name displayed as the main title */
  appName: string;
  /** Optional logo element to display above the title */
  logo?: ReactNode;
  /** Firebase Auth instance */
  auth: Auth;
  /** Callback fired on successful authentication */
  onSuccess: () => void;
  /** Whether to show Google sign-in option (default: true) */
  showGoogleSignIn?: boolean;
  /** Whether to show sign-up option (default: true) */
  showSignUp?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom primary color class (default: 'primary') */
  primaryColorClass?: string;
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

/**
 * A reusable login page component with email/password and Google sign-in support.
 *
 * @example
 * ```tsx
 * import { LoginPage } from '@sudobility/building_blocks';
 * import { getFirebaseAuth } from '@sudobility/auth_lib';
 *
 * function MyLoginPage() {
 *   const navigate = useNavigate();
 *   const auth = getFirebaseAuth();
 *
 *   return (
 *     <LoginPage
 *       appName="My App"
 *       auth={auth}
 *       onSuccess={() => navigate('/')}
 *     />
 *   );
 * }
 * ```
 */
export function LoginPage({
  appName,
  logo,
  auth,
  onSuccess,
  showGoogleSignIn = true,
  showSignUp = true,
  className = '',
  primaryColorClass = 'primary',
}: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!auth) throw new Error('Firebase not configured');
      if (isSignUp && showSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!auth) throw new Error('Firebase not configured');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const text = defaultText;

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className='max-w-md w-full space-y-8'>
        <div>
          {logo && <div className='flex justify-center mb-4'>{logo}</div>}
          <h1
            className={`text-center text-3xl font-bold text-${primaryColorClass}-600`}
          >
            {appName}
          </h1>
          <h2 className='mt-6 text-center text-2xl font-semibold text-gray-900'>
            {isSignUp && showSignUp ? text.createAccount : text.signInToAccount}
          </h2>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm'>
              {error}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                {text.emailLabel}
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={text.emailPlaceholder}
                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-${primaryColorClass}-500 focus:border-${primaryColorClass}-500 sm:text-sm`}
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                {text.passwordLabel}
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={text.passwordPlaceholder}
                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-${primaryColorClass}-500 focus:border-${primaryColorClass}-500 sm:text-sm`}
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className={`w-full inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-${primaryColorClass}-600 text-white hover:bg-${primaryColorClass}-700 focus:ring-${primaryColorClass}-500 disabled:bg-${primaryColorClass}-300 px-4 py-2 text-sm`}
            >
              {isLoading && (
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
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

          {showGoogleSignIn && (
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
                  className={`w-full inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-${primaryColorClass}-500 disabled:bg-gray-100 px-4 py-2 text-sm`}
                >
                  {isLoading && (
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
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
              className={`font-medium text-${primaryColorClass}-600 hover:text-${primaryColorClass}-500`}
            >
              {isSignUp ? text.signIn : text.signUp}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
