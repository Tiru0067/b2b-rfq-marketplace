import { useState, useEffect } from 'react';
import { fetchSupplierQuotations } from '../api/rfqApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import {
  Send,
  IndianRupee,
  Clock,
  Package,
  Building,
} from 'lucide-react';

const SupplierQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchSupplierQuotations();
      if (res.success) {
        setQuotations(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load your submitted quotations.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const res = await fetchSupplierQuotations();
        if (!ignore && res.success) {
          setQuotations(res.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || 'Failed to load your submitted quotations.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-typography-900 tracking-tight">
          My Quotation History
        </h1>
        <p className="text-sm text-typography-500 mt-1">
          Review all commercial bids and lead times you have proposed to corporate buyers.
        </p>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner text="Loading your quotation history..." />}

      {/* Error State */}
      {!loading && error && <ErrorBanner message={error} onRetry={loadQuotations} />}

      {/* Empty State */}
      {!loading && !error && quotations.length === 0 && (
        <EmptyState
          icon={Send}
          title="No quotations submitted yet"
          description="Browse the marketplace to find open buyer RFQs and submit your first quotation."
          actionLabel="Browse Available RFQs"
          onAction={() => (window.location.href = '/marketplace')}
        />
      )}

      {/* Quotations List */}
      {!loading && !error && quotations.length > 0 && (
        <div className="space-y-4">
          {quotations.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 shadow-sm hover:border-border-strong transition-all space-y-4"
            >
              {/* Top Header: Linked RFQ Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-typography-900">
                      {quote.rfq.productName}
                    </h3>
                    <StatusBadge status={quote.rfq.status} />
                  </div>
                  <p className="text-xs text-typography-400 mt-0.5 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-primary-500" />
                    Buyer: {quote.rfq.buyer?.name || 'Verified Buyer'}
                  </p>
                </div>

                <div className="text-xs text-typography-400">
                  Quote submitted on{' '}
                  <span className="font-semibold text-typography-700">
                    {new Date(quote.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Middle Section: Bid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-typography-500">
                      Your Quoted Price
                    </span>
                    <p className="text-base font-bold text-typography-900">
                      ₹{quote.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-typography-500">
                      Committed Lead Time
                    </span>
                    <p className="text-base font-bold text-typography-900">
                      {quote.deliveryDays} Days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-typography-500">
                      Volume Required
                    </span>
                    <p className="text-base font-bold text-typography-900">
                      {quote.rfq.quantity} units · {quote.rfq.deliveryLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Provided */}
              {quote.notes && (
                <div className="text-xs text-typography-600 bg-white p-3 rounded-xl border border-border-default leading-relaxed">
                  <span className="font-semibold text-typography-900 block mb-0.5">
                    Your Proposed Terms / Notes:
                  </span>
                  {quote.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierQuotations;
