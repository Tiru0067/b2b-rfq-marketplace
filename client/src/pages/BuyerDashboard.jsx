import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchBuyerRfqs,
  updateRfqStatus,
} from '../api/rfqApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import CreateRfqModal from '../components/CreateRfqModal';
import EditRfqModal from '../components/EditRfqModal';
import {
  Plus,
  FileText,
  Clock,
  MapPin,
  Package,
  Layers,
  Edit2,
  ChevronRight,
  Search,
  CheckCircle2,
} from 'lucide-react';

const BuyerDashboard = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRfq, setEditingRfq] = useState(null);

  // Load the buyer's RFQs from the backend
  const loadRfqs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchBuyerRfqs();
      if (res.success) {
        setRfqs(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your RFQs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const res = await fetchBuyerRfqs();
        if (!ignore && res.success) {
          setRfqs(res.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Failed to load your RFQs.');
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

  // Handle toggle status (Open <-> Closed)
  const handleToggleStatus = async (rfqId, currentStatus) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await updateRfqStatus(rfqId, newStatus);
      if (res.success) {
        setRfqs((prev) =>
          prev.map((item) => (item.id === rfqId ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update RFQ status');
    }
  };

  // Helper to format remaining time or mark expired
  const getDeadlineText = (deadlineDate) => {
    const diff = new Date(deadlineDate) - new Date();
    if (diff <= 0) return { text: 'Expired', isExpired: true };
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return { text: `${days} day${days > 1 ? 's' : ''} left`, isExpired: false };
  };

  // Filter RFQs based on search bar and status tab
  const filteredRfqs = rfqs.filter((rfq) => {
    const matchesSearch =
      rfq.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.deliveryLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ? true : rfq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalRfqs = rfqs.length;
  const openRfqs = rfqs.filter((r) => r.status === 'OPEN').length;
  const totalQuotes = rfqs.reduce(
    (sum, r) => sum + (r._count?.quotations || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-typography-900 tracking-tight">
            My RFQ Dashboard
          </h1>
          <p className="text-sm text-typography-500 mt-1">
            Manage your procurement requests and evaluate received supplier quotations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New RFQ
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-typography-500">
              Total RFQs
            </p>
            <p className="text-2xl font-bold text-typography-900 mt-0.5">{totalRfqs}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-typography-500">
              Active / Open
            </p>
            <p className="text-2xl font-bold text-typography-900 mt-0.5">{openRfqs}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-typography-500">
              Quotations Received
            </p>
            <p className="text-2xl font-bold text-typography-900 mt-0.5">{totalQuotes}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-typography-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-border-default rounded-xl text-sm text-typography-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-border-default text-xs font-semibold">
          {['ALL', 'OPEN', 'CLOSED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-typography-900 shadow-sm'
                  : 'text-typography-500 hover:text-typography-900'
              }`}
            >
              {tab === 'ALL' ? 'All RFQs' : tab === 'OPEN' ? 'Open' : 'Closed'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner text="Loading your RFQs..." />}

      {/* Error State */}
      {!loading && error && <ErrorBanner message={error} onRetry={loadRfqs} />}

      {/* Empty State */}
      {!loading && !error && filteredRfqs.length === 0 && (
        <EmptyState
          icon={FileText}
          title={searchQuery ? 'No matching RFQs found' : 'You have not posted any RFQs yet'}
          description={
            searchQuery
              ? 'Try adjusting your search terms or filter criteria.'
              : 'Post your first requirement to start receiving competitive quotations from verified suppliers.'
          }
          actionLabel={searchQuery ? null : 'Create Your First RFQ'}
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* RFQ List Cards */}
      {!loading && !error && filteredRfqs.length > 0 && (
        <div className="space-y-4">
          {filteredRfqs.map((rfq) => {
            const { text: deadlineText, isExpired } = getDeadlineText(rfq.deadline);
            const quoteCount = rfq._count?.quotations || 0;

            return (
              <div
                key={rfq.id}
                className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 shadow-sm hover:border-border-strong transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                {/* Left: Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-bold text-typography-900">
                      {rfq.productName}
                    </h3>
                    <StatusBadge status={rfq.status} />
                    {isExpired && (
                      <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Deadline Passed
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-typography-600 line-clamp-2 leading-relaxed">
                    {rfq.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-typography-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-primary-600" />
                      <strong className="text-typography-700">{rfq.quantity}</strong> units
                    </span>

                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary-600" />
                      {rfq.deliveryLocation}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary-600" />
                      Deadline:{' '}
                      <span className={isExpired ? 'text-red-600 font-semibold' : ''}>
                        {new Date(rfq.deadline).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        ({deadlineText})
                      </span>
                    </span>
                  </div>
                </div>

                {/* Right: Quotation Counter & Buttons */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                  <div className="text-left sm:text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        quoteCount > 0
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {quoteCount} {quoteCount === 1 ? 'Quotation' : 'Quotations'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingRfq(rfq)}
                      title="Edit RFQ"
                      className="p-2 text-typography-500 hover:text-typography-900 hover:bg-slate-100 rounded-xl border border-border-default transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(rfq.id, rfq.status)}
                      className="px-3 py-1.5 text-xs font-semibold text-typography-700 hover:bg-slate-100 rounded-xl border border-border-default transition-colors cursor-pointer"
                    >
                      {rfq.status === 'OPEN' ? 'Close RFQ' : 'Reopen'}
                    </button>

                    <Link
                      to={`/buyer/rfqs/${rfq.id}`}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                    >
                      View Quotes
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create RFQ Modal */}
      <CreateRfqModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRfqCreated={(newRfq) => {
          setRfqs((prev) => [newRfq, ...prev]);
        }}
      />

      {/* Edit RFQ Modal */}
      {editingRfq && (
        <EditRfqModal
          key={editingRfq.id}
          isOpen={true}
          rfq={editingRfq}
          onClose={() => setEditingRfq(null)}
          onRfqUpdated={(updatedRfq) => {
            setRfqs((prev) =>
              prev.map((item) => (item.id === updatedRfq.id ? { ...item, ...updatedRfq } : item))
            );
          }}
        />
      )}
    </div>
  );
};

export default BuyerDashboard;
