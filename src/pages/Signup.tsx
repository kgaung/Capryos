import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthError, MissingIdentityError, oauthLogin, signup } from '@netlify/identity';
import { Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordScore = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const strengthLabel = passwordScore <= 2 ? 'Weak' : passwordScore <= 4 ? 'Good' : 'Strong';
  const strengthColor = passwordScore <= 2 ? 'bg-red-500' : passwordScore <= 4 ? 'bg-yellow-500' : 'bg-green-500';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await signup(email.trim(), password, { full_name: name.trim() });
      if (user.confirmedAt) {
        toast.success('Account created. You are signed in.');
      } else {
        toast.success('Account created. Check your email to confirm your account.');
      }
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      if (error instanceof MissingIdentityError) {
        toast.error('Signup is not enabled for this site yet.');
      } else if (error instanceof AuthError) {
        const message = error.status === 403
          ? 'Signups are currently closed.'
          : error.status === 422
            ? 'Check your email and use a stronger password.'
            : error.message;
        toast.error(message);
      } else {
        toast.error('Unable to create your account right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    oauthLogin('google');
  };

  return (
    <>
      <SEOHead
        title="Sign Up - Capryos"
        description="Create a Capryos account to receive updates and access member features."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-blue-600">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Create your account</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Sign up with your email to join Capryos.
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">G</span>
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              Email signup
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>

            <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 pl-10 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    placeholder="you@example.com"
                  />
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-600 dark:text-gray-300">Password strength</span>
                      <span className="text-gray-500 dark:text-gray-400">{strengthLabel}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                      <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${Math.max(passwordScore, 1) * 20}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 pl-10 pr-10 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus className="h-5 w-5" />
                {isSubmitting ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
            </form>

            <p className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
              By signing up, you agree to the{' '}
              <Link to="/terms" className="text-blue-600 hover:underline dark:text-blue-400">Terms of Service</Link>
              {' '}and acknowledge the{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline dark:text-blue-400">Privacy Policy</Link>.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            Admin access stays separate.{' '}
            <Link to="/admin/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Admin sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
