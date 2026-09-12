import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { fetchAvailableRfqs } from '../api/rfqApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import SubmitQuoteModal from '../components/SubmitQuoteModal';
import {
  Search,
  MapPin,
  Package,
  Clock,
  Send,
  Building,
  Filter,
  CheckCircle,
  Eye,
  X,
} from 'lucide-react';

const SupplierMarketplace = () => {
  const { isSupplier } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  // Modals & Feedback
  const [selectedRfqForQuote, setSelectedRfqForQuote] = useState(null);
  const [selectedRfqDetails, setSelectedRfqDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (location.trim()) params.location = location.trim();

        const res = await fetchAvailableRfqs(params);
        if (!ignore && res.success) {
          setRfqs(res.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Failed to load available RFQs.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(delayDebounce);
    };
  }, [search, location]);

  const handleQuoteSubmitted = () => {
    setToastMessage('Your quotation was submitted successfully!');
    setTimeout(() => setToastMessage(''), 4000);
    // Refresh RFQ list
    fetchAvailableRfqs().then((res) => {
      if (res.success) setRfqs(res.data);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-2xl shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-typography-900 tracking-tight">
          Available B2B Opportunities
        </h1>
        <p className="text-sm text-typography-500">
          Discover verified RFQs from corporate buyers and submit your best commercial bids.
        </p>
      </div>

      {/* Search & Location Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3 rounded-2xl border border-border-default shadow-sm">
        <div className="sm:col-span-7 relative">
          <Search className="w-4 h-4 text-typography-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products (e.g. Chairs, Bags, Helmets)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
          />
        </div>

        <div className="sm:col-span-4 relative">
          <MapPin className="w-4 h-4 text-typography-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter location (e.g. Bangalore, Hyderabad)..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-border-default rounded-xl text-sm text-typography-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
          />
        </div>

        <div className="sm:col-span-1 flex items-center justify-center">
          {(search || location) && (
            <button
              onClick={() => {
                setSearch('');
                setLocation('');
              }}
              className="w-full h-full py-2 px-3 text-xs font-semibold text-typography-500 hover:text-typography-900 hover:bg-slate-100 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner text="Searching marketplace RFQs..." />}

      {/* Error State */}
      {!loading && error && (
        <ErrorBanner
          message={error}
          onRetry={() => {
            fetchAvailableRfqs().then((res) => {
              if (res.success) setRfqs(res.data);
            });
          }}
        />
      )}

      {/* Empty State */}
      {!loading && !error && rfqs.length === 0 && (
        <EmptyState
          icon={Filter}
          title="No open RFQs match your filters"
          description="Try clearing your search query or location filter to see other active opportunities."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setLocation('');
          }}
        />
      )}

      {/* RFQs Grid */}
      {!loading && !error && rfqs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rfqs.map((rfq) => {
            const isDeadlinePassed = new Date(rfq.deadline) < new Date();
            const quoteCount = rfq._count?.quotations || 0;

            return (
              <div
                key={rfq.id}
                className="bg-white rounded-2xl border border-border-default p-6 shadow-sm hover:border-primary-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={rfq.status} />
                    <span className="text-[11px] font-bold text-typography-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {quoteCount} {quoteCount === 1 ? 'quote' : 'quotes'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-typography-900 line-clamp-1">
                      {rfq.productName}
                    </h3>
                    <p className="text-xs text-typography-400 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-primary-500" />
                      Posted by {rfq.buyer?.name || 'Verified Buyer'}
                    </p>
                  </div>

                  <p className="text-sm text-typography-600 line-clamp-2 leading-relaxed">
                    {rfq.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-border-subtle text-xs text-typography-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-primary-600" />
                        Quantity:
                      </span>
                      <strong className="text-typography-900">{rfq.quantity} units</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-600" />
                        Location:
                      </span>
                      <strong className="text-typography-900">{rfq.deliveryLocation}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary-600" />
                        Deadline:
                      </span>
                      <strong className={isDeadlinePassed ? 'text-red-600' : 'text-typography-900'}>
                        {new Date(rfq.deadline).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedRfqDetails(rfq)}
                    className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-typography-700 text-xs font-semibold rounded-xl border border-border-default transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </button>

                  {isSupplier && (
                    <button
                      onClick={() => setSelectedRfqForQuote(rfq)}
                      disabled={rfq.status === 'CLOSED' || isDeadlinePassed}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isDeadlinePassed ? 'Expired' : 'Quote'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RFQ Detail Modal */}
      {selectedRfqDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border-default space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-typography-900">
                  {selectedRfqDetails.productName}
                </h3>
                <p className="text-xs text-typography-400 mt-0.5">
                  Posted by {selectedRfqDetails.buyer?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedRfqDetails(null)}
                className="p-1 text-typography-400 hover:text-typography-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-sm text-typography-700 leading-relaxed border border-border-subtle">
              <span className="font-semibold block mb-1 text-typography-900">
                Full Requirement Specifications:
              </span>
              {selectedRfqDetails.description}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-typography-600 bg-white p-3 rounded-xl border border-border-default">
              <div>
                <span className="text-typography-400 block">Quantity:</span>
                <strong className="text-sm text-typography-900">
                  {selectedRfqDetails.quantity} units
                </strong>
              </div>
              <div>
                <span className="text-typography-400 block">Delivery To:</span>
                <strong className="text-sm text-typography-900">
                  {selectedRfqDetails.deliveryLocation}
                </strong>
              </div>
              <div>
                <span className="text-typography-400 block">Deadline:</span>
                <strong className="text-sm text-typography-900">
                  {new Date(selectedRfqDetails.deadline).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
              </div>
              <div>
                <span className="text-typography-400 block">Status:</span>
                <StatusBadge status={selectedRfqDetails.status} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRfqDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-typography-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>

              {isSupplier && (
                <button
                  onClick={() => {
                    setSelectedRfqForQuote(selectedRfqDetails);
                    setSelectedRfqDetails(null);
                  }}
                  disabled={selectedRfqDetails.status === 'CLOSED'}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Submit Quote
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quotation Submission Modal */}
      <SubmitQuoteModal
        isOpen={!!selectedRfqForQuote}
        rfq={selectedRfqForQuote}
        onClose={() => setSelectedRfqForQuote(null)}
        onQuoteSubmitted={handleQuoteSubmitted}
      />
    </div>
  );
};

export default SupplierMarketplace;
