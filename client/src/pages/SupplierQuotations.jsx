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
  Calendar,
  MapPin,
  CheckCircle2,
  FileText,
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
          Review all commercial bids, lead times, and specifications for RFQs you have quoted on.
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
          {quotations.map((quote) => {
            const isAwarded = quote.status === 'AWARDED';
            const isNotSelected = quote.status === 'NOT_SELECTED';
            const isPending = quote.status === 'PENDING';

            return (
              <div
                key={quote.id}
                className={`bg-white rounded-2xl border ${
                  isAwarded
                    ? 'border-emerald-300 ring-1 ring-emerald-200'
                    : 'border-border-default'
                } p-5 sm:p-6 shadow-sm hover:border-border-strong transition-all space-y-4`}
              >
                {/* Top Header: Linked RFQ Info & Award Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-bold text-typography-900">
                        {quote.rfq.productName}
                      </h3>
                      <StatusBadge status={quote.rfq.status} />

                      {isAwarded && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-full text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Awarded to You
                        </span>
                      )}
                      {isNotSelected && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-slate-100 text-typography-500 border border-slate-200 rounded-full text-xs font-medium">
                          Not Selected
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                          Under Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-typography-400 mt-1 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-primary-500" />
                      Buyer: <span className="font-medium text-typography-700">{quote.rfq.buyer?.name || 'Corporate Buyer'}</span>
                      {quote.rfq.buyer?.email && (
                        <span className="text-typography-400">({quote.rfq.buyer.email})</span>
                      )}
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

                {/* Subtle notification banner when awarded */}
                {isAwarded && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Contract Awarded:</strong> The buyer has accepted your commercial quote and chosen your company for this order.
                    </span>
                  </div>
                )}

                {/* RFQ Requirement Specifications */}
                <div className="bg-slate-50 p-4 rounded-xl border border-border-subtle space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-typography-700 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-primary-600" />
                    RFQ Requirement Specification
                  </div>
                  <p className="text-sm text-typography-700 leading-relaxed">
                    {quote.rfq.description || 'No detailed description provided.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-typography-600 pt-2 border-t border-border-subtle">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-primary-600" />
                      Required Quantity: <strong className="text-typography-900">{quote.rfq.quantity}</strong> units
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary-600" />
                      Delivery Location: <strong className="text-typography-900">{quote.rfq.deliveryLocation}</strong>
                    </span>
                    {quote.rfq.deadline && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary-600" />
                        Original Deadline:{' '}
                        <strong className="text-typography-900">
                          {new Date(quote.rfq.deadline).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Commercial Bid Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-border-default">
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupplierQuotations;
