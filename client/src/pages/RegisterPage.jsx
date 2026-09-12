import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { UserPlus, Loader2, Building, Store } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData);
      if (user.role === 'BUYER') {
        navigate('/dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your information.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-border-default shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-typography-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-sm text-typography-500 mt-1">
            Join as a Buyer to post RFQs or a Supplier to submit quotes
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-2 text-center">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'BUYER' }))}
              className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                formData.role === 'BUYER'
                  ? 'border-primary-600 bg-primary-50/50 text-primary-900'
                  : 'border-border-default bg-white text-typography-600 hover:border-border-strong'
              }`}
            >
              <Building className={`w-5 h-5 mb-1 ${formData.role === 'BUYER' ? 'text-primary-600' : 'text-typography-400'}`} />
              <span className="text-sm font-bold">Buyer</span>
              <span className="text-[11px] text-typography-500 text-center">
                I want to post RFQs
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'SUPPLIER' }))}
              className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                formData.role === 'SUPPLIER'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900'
                  : 'border-border-default bg-white text-typography-600 hover:border-border-strong'
              }`}
            >
              <Store className={`w-5 h-5 mb-1 ${formData.role === 'SUPPLIER' ? 'text-emerald-600' : 'text-typography-400'}`} />
              <span className="text-sm font-bold">Supplier</span>
              <span className="text-[11px] text-typography-500 text-center">
                I want to submit quotes
              </span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
              Full Name or Company Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Acme Corp or Jane Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
              Work Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
              Password (Min 6 characters) *
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating Account...' : `Register as ${formData.role === 'BUYER' ? 'Buyer' : 'Supplier'}`}
          </button>
        </form>

        {/* Link to Login */}
        <p className="text-center text-sm text-typography-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
