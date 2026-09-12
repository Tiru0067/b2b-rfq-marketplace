// Small pill badge showing whether an RFQ is OPEN or CLOSED
const StatusBadge = ({ status }) => {
  const isOpen = status === 'OPEN';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isOpen
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-slate-100 text-slate-600 border border-slate-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isOpen ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />
      {isOpen ? 'Open for Quotes' : 'Closed'}
    </span>
  );
};

export default StatusBadge;
