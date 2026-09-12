import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  Layers,
  FileText,
  Send,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Store,
} from 'lucide-react';

const Navbar = ({ onCreateRfqClick }) => {
  const { user, isAuthenticated, isBuyer, isSupplier, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border-default shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name (Neutral Professional Brand) */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-typography-900 tracking-tight block leading-tight">
                  ProcureX
                </span>
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider block">
                  B2B Procurement
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {isAuthenticated && isBuyer && (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-typography-700 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    My RFQs
                  </Link>

                  <Link
                    to="/marketplace"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/marketplace')
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-typography-700 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Marketplace Feed
                  </Link>
                </>
              )}

              {isAuthenticated && isSupplier && (
                <>
                  <Link
                    to="/marketplace"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/marketplace')
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-typography-700 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Browse RFQs
                  </Link>

                  <Link
                    to="/my-quotes"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/my-quotes')
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-typography-700 hover:bg-slate-50'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    My Quotations
                  </Link>
                </>
              )}

              {!isAuthenticated && (
                <Link
                  to="/marketplace"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/marketplace')
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-typography-700 hover:bg-slate-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Browse RFQs
                </Link>
              )}
            </nav>
          </div>

          {/* Right Header Area (Buttons, User profile, Logout) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && isBuyer && onCreateRfqClick && (
              <button
                onClick={onCreateRfqClick}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Create RFQ
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-border-default">
                <div className="text-right">
                  <div className="text-sm font-semibold text-typography-900 leading-tight">
                    {user?.name}
                  </div>
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isBuyer
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-typography-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-typography-700 hover:text-typography-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-typography-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-default bg-white px-4 pt-3 pb-4 space-y-2 shadow-lg">
          {isAuthenticated && (
            <div className="pb-3 border-b border-border-subtle flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-typography-900">{user?.name}</p>
                <p className="text-xs text-typography-500">{user?.email}</p>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isBuyer
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {user?.role}
              </span>
            </div>
          )}

          <div className="space-y-1">
            {isAuthenticated && isBuyer && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-typography-700 hover:bg-slate-50"
                >
                  My RFQs
                </Link>
                <Link
                  to="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-typography-700 hover:bg-slate-50"
                >
                  Marketplace Feed
                </Link>
                {onCreateRfqClick && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onCreateRfqClick();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-primary-600 hover:bg-primary-50"
                  >
                    + Create New RFQ
                  </button>
                )}
              </>
            )}

            {isAuthenticated && isSupplier && (
              <>
                <Link
                  to="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-typography-700 hover:bg-slate-50"
                >
                  Browse Available RFQs
                </Link>
                <Link
                  to="/my-quotes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-typography-700 hover:bg-slate-50"
                >
                  My Submitted Quotations
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link
                  to="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-typography-700 hover:bg-slate-50"
                >
                  Browse RFQs
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-typography-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-primary-600 hover:bg-primary-50"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {isAuthenticated && (
            <div className="pt-2 border-t border-border-subtle">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
