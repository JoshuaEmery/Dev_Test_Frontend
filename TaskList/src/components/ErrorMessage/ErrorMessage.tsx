import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface IErrorMessageProps {
  title?: string;
  message: string;
  //callback functions
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<IErrorMessageProps> = ({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
          <p className="text-red-700 mb-4 leading-relaxed">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
