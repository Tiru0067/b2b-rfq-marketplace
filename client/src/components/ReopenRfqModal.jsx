import { useState } from 'react';
import { X, Loader2, Calendar, RefreshCw } from 'lucide-react';

const ReopenRfqModal = ({ isOpen, onClose, rfq, onConfirm }) => {
  // Default deadline: 7 days from now
  const getDefaultDeadline = () => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  const [deadline, setDeadline] = useState(getDefaultDeadline);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !rfq) return null;

  const minDateTime = new Date().toISOString().slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!deadline) {
      setError('Please select a valid future deadline');
      return;
    }

    if (new Date(deadline) <= new Date()) {
      setError('Deadline must be in the future');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(new Date(deadline).toISOString());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reopen RFQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-border-default overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-typography-900">
              Reopen RFQ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-typography-400 hover:text-typography-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-typography-600 leading-relaxed">
            The previous deadline for <strong className="text-typography-900">{rfq.productName}</strong> has ended. Set a new submission deadline so suppliers can view and bid on it again.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
              New Submission Deadline
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                min={minDateTime}
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
              />
              <Calendar className="w-4 h-4 text-typography-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-typography-400 mt-1">
              Suppliers will be able to submit bids until this date.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-typography-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Reopening...' : 'Confirm & Reopen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReopenRfqModal;
