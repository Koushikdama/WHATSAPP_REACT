import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// --- Components ---

const InputField = ({ label, type, value, onChange, placeholder, disabled, id }: any) => (
  <div className="flex flex-col space-y-1.5">
    <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="px-4 py-3 bg-gray-50 dark:bg-[#2a3942] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
    />
  </div>
);

const LoginView: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'Invalid email or password.'
          : 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md p-8"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
        <p className="text-gray-600 dark:text-gray-400">Sign in to continue to WhatsApp</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          placeholder="name@example.com"
          disabled={loading}
        />
        <InputField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold rounded-lg shadow-lg shadow-[#00a884]/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button onClick={onSwitch} className="text-[#00a884] font-semibold hover:underline focus:outline-none">
            Sign Up
          </button>
        </p>
      </div>
    </motion.div>
  );
};

const SignupView: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      await signup(email, password, name);
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Please log in.'
        : err.code === 'auth/weak-password'
          ? 'Password should be at least 6 characters.'
          : err.code === 'auth/invalid-email'
            ? 'Please enter a valid email address.'
            : 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md p-8"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
        <p className="text-gray-600 dark:text-gray-400">Join the community today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="name"
          label="Full Name"
          type="text"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          placeholder="John Doe"
          disabled={loading}
        />
        <InputField
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          placeholder="name@example.com"
          disabled={loading}
        />
        <InputField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder="Create a password"
          disabled={loading}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold rounded-lg shadow-lg shadow-[#00a884]/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : 'Sign Up'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-[#00a884] font-semibold hover:underline focus:outline-none">
            Sign In
          </button>
        </p>
      </div>
    </motion.div>
  );
};

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location]);

  return (
    <div className="min-h-screen bg-[#d1d7db] dark:bg-[#111b21] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-full h-32 bg-[#00a884] z-0"></div>

      <div className="w-full max-w-5xl bg-white dark:bg-[#202c33] rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row h-[85vh] md:h-[800px] max-h-[90vh]">

        {/* Left Side - Hero / Branding */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gray-50 dark:bg-[#2a3942] p-12 text-center border-r border-gray-100 dark:border-gray-700">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-[#25d366] to-[#128c7e] rounded-full flex items-center justify-center shadow-lg mb-6 mx-auto">
              <svg viewBox="0 0 24 24" width="80" height="80" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Stay Connected</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xs mx-auto leading-relaxed">
            Experience real-time messaging, high-quality calls, and secure conversations with friends and family.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-[#202c33] relative">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <LoginView key="login" onSwitch={() => setIsLogin(false)} />
            ) : (
              <SignupView key="signup" onSwitch={() => setIsLogin(true)} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full z-0">
        <p className="text-gray-500 text-sm">© 2024 WhatsApp Clone. Secure & Encrypted.</p>
      </div>
    </div>
  );
};

export default AuthScreen;