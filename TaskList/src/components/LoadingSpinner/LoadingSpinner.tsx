import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Tasks</h3>
          <p className="text-gray-500 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
