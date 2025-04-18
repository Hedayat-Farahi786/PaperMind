// client/src/pages/Auth.tsx
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

const Auth = () => {
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    // Use email instead of username for authentication
    email: '',
    password: '',
    name: '', // Keep name for registration
    // Remove username from formData
    // username: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Use email for login with Supabase Auth
        await login(formData.email, formData.password);
      } else {
        // Use email for registration, pass name and potentially email itself as data
        // Note: Supabase signUp already requires email, passing it in data is for user_metadata
        await register(formData.email, formData.password, {
            name: formData.name,
            // You might also choose to store email in user_metadata here if needed,
            // but Supabase stores it by default at the top level.
            // email: formData.email, // Optional: depends on how you use user_metadata
        });
      }
      // If successful, AuthContext onAuthStateChange listener updates state
      // and components using useAuth will react.
      // Redirection should ideally happen in a parent component or effect
      // that watches isAuthenticated state change from the context,
      // but keeping it here for now as per original code flow.
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err.message || (isLogin ? 'Invalid email or password' : 'Registration failed'));
    } finally {
      // The loading state should ideally be managed by the AuthContext's isLoading,
      // reflecting the state of the Supabase auth operation.
      // For now, keeping component-level isLoading for the form submission itself.
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="m-auto w-full max-w-md">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            {isLogin ? 'Welcome to PaperMind' : 'Create an Account'}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {isLogin
              ? 'Sign in to manage your documents and reminders'
              : 'Sign up to start organizing your documents'}
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Use email input instead of username */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Email
              </label>
              <input
                type="email" // Set type to email
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={isLoading}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isLoading}
                  />
                </div>

                {/* Email is now the main auth field, not optional for registration */}
                {/* <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isLoading}
                    required // Email is required for signup
                  />
                </div> */}
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isLogin ? 'Signing in...' : 'Signing up...'}
                </span>
              ) : isLogin ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </>
              )}
          </Button>
          </form>

          <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {isLogin ? 'Don’t have an account?' : 'Already have an account?'}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
              disabled={isLoading}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;