import { useState } from 'react';
import { X, Loader2, Send, IndianRupee, Clock } from 'lucide-react';
import { submitQuotation } from '../api/rfqApi';

const SubmitQuoteModal = ({ isOpen, onClose, rfq, onQuoteSubmitted }) => {
  const [formData, setFormData] = useState({
    price: '',
    deliveryDays: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !rfq) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const price = Number(formData.price);
    const deliveryDays = Number(formData.deliveryDays);

    if (price <= 0) {
      setError('Quoted price must be greater than zero');
      return;
    }
    if (deliveryDays <= 0) {
      setError('Delivery days must be at least 1 day');
      return;
    }

    setLoading(true);
    try {
      const res = await submitQuotation(rfq.id, {
        price,
        deliveryDays,
        notes: formData.notes,
      });

      if (res.success) {
        onQuoteSubmitted(res.data);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit quotation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-border-default overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-typography-900">Submit Quotation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-typography-400 hover:text-typography-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RFQ Target Summary */}
        <div className="px-6 py-3 bg-slate-50 border-b border-border-default text-xs text-typography-700">
          <span className="font-semibold text-typography-900">Target RFQ:</span>{' '}
          {rfq.productName} ({rfq.quantity} units · {rfq.deliveryLocation})
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
                Total Quoted Price (₹) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-typography-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="price"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 50000"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
                Delivery Lead Time (Days) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-typography-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="deliveryDays"
                  required
                  min="1"
                  placeholder="e.g. 10"
                  value={formData.deliveryDays}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
              Supplier Notes & Message *
            </label>
            <textarea
              name="notes"
              required
              rows={3}
              placeholder="Detail warranty terms, packaging, material specs, or doorstep delivery details..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-typography-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Sending Quote...' : 'Submit Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitQuoteModal;
