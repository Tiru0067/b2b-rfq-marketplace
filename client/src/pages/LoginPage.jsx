import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { LogIn, Loader2, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'BUYER') {
        navigate('/dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 1-Click quick login helper for demo accounts
  const handleQuickDemoLogin = async (demoEmail) => {
    setError('');
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);

    try {
      const user = await login(demoEmail, 'password123');
      if (user.role === 'BUYER') {
        navigate('/dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch {
      setError('Demo login failed. Make sure the database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-border-default shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary-600">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-typography-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-typography-500 mt-1">
            Sign in to manage your RFQs and quotations
          </p>
        </div>

        {/* Demo Login Shortcuts for Recruiters */}
        <div className="mb-6 p-4 bg-slate-50 border border-border-default rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-typography-700 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            1-Click Demo Accounts
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('buyer1@techcorp.com')}
              className="px-3 py-2 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-xl shadow-sm transition-colors text-center cursor-pointer"
            >
              Demo Buyer
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('supplier1@acme.com')}
              className="px-3 py-2 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl shadow-sm transition-colors text-center cursor-pointer"
            >
              Demo Supplier
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Link to Register */}
        <p className="text-center text-sm text-typography-500 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
