/**
 * SudobilityAppWithFirebaseAuth - App wrapper with Firebase authentication
 *
 * Extends SudobilityApp with:
 * - Firebase AuthProviderWrapper for authentication (built-in default)
 * - ApiProvider for network/token management (built-in default)
 */
import { ComponentType, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SudobilityApp, SudobilityAppProps } from './SudobilityApp';
import { AuthProvider } from '@sudobility/auth-components';
import { getFirebaseAuth, getFirebaseErrorMessage } from '@sudobility/auth_lib';
import { ApiProvider } from '../api';

export interface SudobilityAppWithFirebaseAuthProps extends Omit<
  SudobilityAppProps,
  'AppProviders'
> {
  /**
   * Custom Firebase auth provider wrapper component (optional).
   * Defaults to built-in AuthProviderWrapper that uses getFirebaseAuth().
   */
  AuthProviderWrapper?: ComponentType<{ children: ReactNode }>;

  /**
   * Auth providers to enable (optional).
   * Defaults to ["google", "email"].
   */
  authProviders?: ('google' | 'email' | 'apple')[];

  /**
   * Whether to enable anonymous auth (optional).
   * Defaults to false.
   */
  enableAnonymousAuth?: boolean;

  /**
   * Custom ApiProvider component (optional).
   * Defaults to built-in ApiProvider that manages Firebase ID token.
   * Set to false to disable the built-in ApiProvider.
   */
  ApiProvider?: ComponentType<{ children: ReactNode }> | false;

  /**
   * Additional providers to wrap around the router content.
   * These are rendered inside ApiProvider but outside BrowserRouter.
   */
  AppProviders?: ComponentType<{ children: ReactNode }>;
}

/**
 * Default auth texts - minimal fallback when translations aren't available
 */
function createDefaultAuthTexts(t: (key: string) => string) {
  return {
    signInTitle: t('auth.signInTitle') || 'Sign In',
    signInWithEmail: t('auth.signInWithEmail') || 'Sign in with email',
    createAccount: t('auth.createAccount') || 'Create Account',
    resetPassword: t('auth.resetPassword') || 'Reset Password',
    signIn: t('auth.signIn') || 'Sign In',
    signUp: t('auth.signUp') || 'Sign Up',
    logout: t('auth.logout') || 'Log Out',
    login: t('auth.login') || 'Log In',
    continueWithGoogle: t('auth.continueWithGoogle') || 'Continue with Google',
    continueWithApple: t('auth.continueWithApple') || 'Continue with Apple',
    continueWithEmail: t('auth.continueWithEmail') || 'Continue with Email',
    sendResetLink: t('auth.sendResetLink') || 'Send Reset Link',
    backToSignIn: t('auth.backToSignIn') || 'Back to Sign In',
    close: t('auth.close') || 'Close',
    email: t('auth.email') || 'Email',
    password: t('auth.password') || 'Password',
    confirmPassword: t('auth.confirmPassword') || 'Confirm Password',
    displayName: t('auth.displayName') || 'Display Name',
    emailPlaceholder: t('auth.emailPlaceholder') || 'Enter your email',
    passwordPlaceholder: t('auth.passwordPlaceholder') || 'Enter your password',
    confirmPasswordPlaceholder:
      t('auth.confirmPasswordPlaceholder') || 'Confirm your password',
    displayNamePlaceholder:
      t('auth.displayNamePlaceholder') || 'Enter your name',
    forgotPassword: t('auth.forgotPassword') || 'Forgot Password?',
    noAccount: t('auth.noAccount') || "Don't have an account?",
    haveAccount: t('auth.haveAccount') || 'Already have an account?',
    or: t('auth.or') || 'or',
    resetEmailSent: t('auth.resetEmailSent') || 'Email Sent',
    resetEmailSentDesc:
      t('auth.resetEmailSentDesc') ||
      'Check your inbox for the password reset link.',
    passwordMismatch: t('auth.passwordMismatch') || "Passwords don't match",
    passwordTooShort:
      t('auth.passwordTooShort') || 'Password must be at least 6 characters',
    loading: t('auth.loading') || 'Loading...',
  };
}

/**
 * Default auth error texts
 */
function createDefaultAuthErrorTexts() {
  return {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/invalid-credential': 'Invalid credentials',
    'auth/email-already-in-use': 'An account already exists with this email',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed':
      'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign in was cancelled',
    'auth/popup-blocked':
      'Pop-up was blocked. Please allow pop-ups and try again.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method',
    'auth/operation-not-allowed': 'This sign-in method is not enabled',
    default: 'An error occurred. Please try again.',
  };
}

/**
 * Default AuthProviderWrapper using Firebase
 */
function DefaultAuthProviderWrapper({
  children,
  providers,
  enableAnonymous,
}: {
  children: ReactNode;
  providers: ('google' | 'email' | 'apple')[];
  enableAnonymous: boolean;
}) {
  const { t } = useTranslation();

  const texts = useMemo(() => createDefaultAuthTexts(t), [t]);
  const errorTexts = useMemo(() => createDefaultAuthErrorTexts(), []);

  const auth = getFirebaseAuth();

  // If Firebase is not configured, render children without auth
  if (!auth) {
    console.warn(
      '[SudobilityAppWithFirebaseAuth] No auth instance - Firebase not configured'
    );
    return <>{children}</>;
  }

  return (
    <AuthProvider
      firebaseConfig={{ type: 'instance', auth: auth }}
      providerConfig={{
        providers,
        enableAnonymous,
      }}
      texts={texts}
      errorTexts={errorTexts}
      resolveErrorMessage={getFirebaseErrorMessage}
    >
      {children}
    </AuthProvider>
  );
}

/**
 * SudobilityAppWithFirebaseAuth - App wrapper with Firebase authentication
 *
 * @example
 * ```tsx
 * // Minimal usage - uses default auth with Google and Email
 * import { SudobilityAppWithFirebaseAuth } from '@sudobility/building_blocks';
 * import i18n from './i18n';
 *
 * function App() {
 *   return (
 *     <SudobilityAppWithFirebaseAuth i18n={i18n}>
 *       <Routes>
 *         <Route path="/" element={<HomePage />} />
 *       </Routes>
 *     </SudobilityAppWithFirebaseAuth>
 *   );
 * }
 *
 * // With custom auth providers
 * function App() {
 *   return (
 *     <SudobilityAppWithFirebaseAuth
 *       i18n={i18n}
 *       authProviders={["google", "apple", "email"]}
 *       AppProviders={ApiProvider}
 *     >
 *       <Routes>
 *         <Route path="/" element={<HomePage />} />
 *       </Routes>
 *     </SudobilityAppWithFirebaseAuth>
 *   );
 * }
 * ```
 */
export function SudobilityAppWithFirebaseAuth({
  AuthProviderWrapper: AuthProviderWrapperProp,
  authProviders = ['google', 'email'],
  enableAnonymousAuth = false,
  ApiProvider: ApiProviderProp,
  AppProviders,
  ...baseProps
}: SudobilityAppWithFirebaseAuthProps) {
  // Create a combined providers component that includes auth and api
  const CombinedProviders: ComponentType<{ children: ReactNode }> = ({
    children,
  }) => {
    let content = children;

    // Wrap with AppProviders if provided
    if (AppProviders) {
      content = <AppProviders>{content}</AppProviders>;
    }

    // Wrap with ApiProvider (custom, default, or disabled)
    if (ApiProviderProp === false) {
      // Explicitly disabled
    } else if (ApiProviderProp) {
      content = <ApiProviderProp>{content}</ApiProviderProp>;
    } else {
      // Default ApiProvider
      content = <ApiProvider>{content}</ApiProvider>;
    }

    // Wrap with AuthProviderWrapper (custom or default)
    if (AuthProviderWrapperProp) {
      return <AuthProviderWrapperProp>{content}</AuthProviderWrapperProp>;
    }

    return (
      <DefaultAuthProviderWrapper
        providers={authProviders}
        enableAnonymous={enableAnonymousAuth}
      >
        {content}
      </DefaultAuthProviderWrapper>
    );
  };

  return <SudobilityApp {...baseProps} AppProviders={CombinedProviders} />;
}

export default SudobilityAppWithFirebaseAuth;
