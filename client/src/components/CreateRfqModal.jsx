import { useState } from 'react';
import { X, Loader2, PlusCircle } from 'lucide-react';
import { createRfq } from '../api/rfqApi';

const CreateRfqModal = ({ isOpen, onClose, onRfqCreated }) => {
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    quantity: '',
    deliveryLocation: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Minimum date allowed is right now
  const minDateTime = new Date().toISOString().slice(0, 16);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Quick client-side check
    if (Number(formData.quantity) <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        deadline: new Date(formData.deadline).toISOString(),
      };

      const res = await createRfq(payload);
      if (res.success) {
        onRfqCreated(res.data);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create RFQ. Please check all fields.'
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
            <PlusCircle className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-typography-900">Create New RFQ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-typography-400 hover:text-typography-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
              Product / Service Name *
            </label>
            <input
              type="text"
              name="productName"
              required
              placeholder="e.g. Ergonomic Office Chairs"
              value={formData.productName}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
              Requirement Description *
            </label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Describe specifications, quality standards, or warranty requirements..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
                Quantity Needed *
              </label>
              <input
                type="number"
                name="quantity"
                required
                min="1"
                placeholder="e.g. 100"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
                Delivery Location *
              </label>
              <input
                type="text"
                name="deliveryLocation"
                required
                placeholder="e.g. Hyderabad, Telangana"
                value={formData.deliveryLocation}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-typography-700 uppercase tracking-wider mb-1">
              Bidding Deadline *
            </label>
            <input
              type="datetime-local"
              name="deadline"
              required
              min={minDateTime}
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
            />
            <p className="text-[11px] text-typography-400 mt-1">
              Suppliers cannot submit quotes after this date.
            </p>
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
              className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating RFQ...' : 'Publish RFQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRfqModal;
