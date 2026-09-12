import { Loader2 } from 'lucide-react';

// Reusable spinner for loading states
const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      <p className="text-sm font-medium text-typography-500">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
