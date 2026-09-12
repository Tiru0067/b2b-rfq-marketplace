import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBuyerRfqDetails, updateRfqStatus } from '../api/rfqApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  IndianRupee,
  Clock,
  Sparkles,
  Zap,
  Building2,
  FileCheck2,
} from 'lucide-react';

const BuyerRfqDetails = () => {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchBuyerRfqDetails(id);
      if (res.success) {
        setRfq(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load RFQ quotations.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const res = await fetchBuyerRfqDetails(id);
        if (!ignore && res.success) {
          setRfq(res.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || 'Failed to load RFQ quotations.'
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
  }, [id]);

  const handleToggleStatus = async () => {
    if (!rfq) return;
    const newStatus = rfq.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await updateRfqStatus(rfq.id, newStatus);
      if (res.success) {
        setRfq((prev) => ({ ...prev, status: newStatus }));
      }
    } catch {
      alert('Failed to update RFQ status');
    }
  };

  // Find lowest price and fastest delivery to highlight them
  const quotes = rfq?.quotations || [];
  const lowestPrice =
    quotes.length > 0 ? Math.min(...quotes.map((q) => q.price)) : null;
  const fastestDays =
    quotes.length > 0 ? Math.min(...quotes.map((q) => q.deliveryDays)) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-typography-500 hover:text-typography-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My RFQs
        </Link>
      </div>

      {loading && <LoadingSpinner text="Loading quotations..." />}
      {!loading && error && <ErrorBanner message={error} onRetry={loadDetails} />}

      {!loading && !error && rfq && (
        <>
          {/* RFQ Summary Card */}
          <div className="bg-white rounded-2xl border border-border-default p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-typography-900">
                    {rfq.productName}
                  </h1>
                  <StatusBadge status={rfq.status} />
                </div>
                <p className="text-xs text-typography-400 mt-1">
                  RFQ ID: {rfq.id} · Created on{' '}
                  {new Date(rfq.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <button
                onClick={handleToggleStatus}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-default hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {rfq.status === 'OPEN' ? 'Close RFQ' : 'Reopen RFQ'}
              </button>
            </div>

            <div className="text-sm text-typography-700 bg-slate-50 p-4 rounded-xl border border-border-subtle leading-relaxed">
              <span className="font-semibold text-typography-900 block mb-1">
                Requirement Details:
              </span>
              {rfq.description}
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-typography-600 pt-1">
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-primary-600" />
                Quantity: <strong className="text-typography-900">{rfq.quantity}</strong> units
              </span>

              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-600" />
                Location: <strong className="text-typography-900">{rfq.deliveryLocation}</strong>
              </span>

              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-600" />
                Deadline:{' '}
                <strong className="text-typography-900">
                  {new Date(rfq.deadline).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
              </span>
            </div>
          </div>

          {/* Quotations Section */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-typography-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-primary-600" />
                Received Quotations ({quotes.length})
              </h2>
            </div>

            {quotes.length === 0 ? (
              <EmptyState
                icon={FileCheck2}
                title="No quotations received yet"
                description="Suppliers are browsing the marketplace. Quotations will appear here as soon as they are submitted."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {quotes.map((quote) => {
                  const isCheapest = quote.price === lowestPrice;
                  const isFastest = quote.deliveryDays === fastestDays;

                  return (
                    <div
                      key={quote.id}
                      className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 shadow-sm space-y-4"
                    >
                      {/* Top Badges & Supplier Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-typography-500" />
                            <span className="font-bold text-typography-900">
                              {quote.supplier.name}
                            </span>
                            <span className="text-xs text-typography-400">
                              ({quote.supplier.email})
                            </span>
                          </div>
                          <p className="text-[11px] text-typography-400">
                            Submitted on{' '}
                            {new Date(quote.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        {/* Smart Highlights: Lowest Bid & Fastest Lead Time */}
                        <div className="flex items-center gap-2">
                          {isCheapest && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                              <Sparkles className="w-3.5 h-3.5" />
                              Lowest Bid
                            </span>
                          )}
                          {isFastest && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                              <Zap className="w-3.5 h-3.5" />
                              Fastest Delivery
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quoted Price & Lead Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-border-subtle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <IndianRupee className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-typography-500">
                              Quoted Price
                            </span>
                            <p className="text-lg font-bold text-typography-900">
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
                              Estimated Lead Time
                            </span>
                            <p className="text-lg font-bold text-typography-900">
                              {quote.deliveryDays} Days
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Supplier Notes */}
                      <div>
                        <span className="text-xs font-semibold text-typography-700 block mb-1">
                          Supplier Message / Terms:
                        </span>
                        <p className="text-sm text-typography-600 bg-white p-3 rounded-xl border border-border-default leading-relaxed whitespace-pre-wrap">
                          {quote.notes}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerRfqDetails;
