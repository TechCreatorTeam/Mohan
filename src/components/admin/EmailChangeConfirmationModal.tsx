import React from 'react';
import { Mail, Clock, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';

interface EmailChangeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEmail: string;
  currentEmail: string;
  onResendEmail: () => void;
  onCancelRequest: () => void;
  isResending?: boolean;
}

const EmailChangeConfirmationModal: React.FC<EmailChangeConfirmationModalProps> = ({
  isOpen,
  onClose,
  newEmail,
  currentEmail,
  onResendEmail,
  onCancelRequest,
  isResending = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">
                Confirm Your Email Change
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-blue-800 dark:text-blue-300 font-medium mb-2">
                    We've sent a verification link to:
                  </p>
                  <p className="text-blue-900 dark:text-blue-200 font-semibold bg-blue-100 dark:bg-blue-800 px-3 py-2 rounded-md">
                    {newEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-3">Important:</h4>
              <ol className="text-sm text-amber-700 dark:text-amber-400 space-y-2 list-decimal list-inside">
                <li>
                  Check your inbox (and spam folder) for a verification email
                </li>
                <li>Click "Confirm your new email" in that email to complete the change.</li>
                <li>After clicking the verification link, you'll be automatically signed out from all devices and browsers for security.</li>
                <li>Return to the login page and use your new email address to sign in.</li>
                <li>If the verification link doesn't work, try logging in with your new email directly.</li>
              </ol>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-400">
                  <p className="font-medium mb-1">🔒 Security Notice:</p>
                  <p>
                    After clicking the verification link in your email, you will be automatically signed out from all devices 
                    and browsers for security. This ensures no old sessions can access your account with the new email.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-3">Until you verify:</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-start">
                  <span className="text-slate-400 mr-2">•</span>
                  <span>
                    Your login email remains{' '}
                    <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-xs">
                      {currentEmail}
                    </code>
                  </span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                  <span>The verification link expires in <strong>10 minutes</strong>. Click it to complete the email change and trigger the security logout.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={onResendEmail}
              disabled={isResending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Email
                </>
              )}
            </button>
            <button
              onClick={onCancelRequest}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel Request
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Having trouble? Check your spam folder or contact support if the email doesn't arrive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailChangeConfirmationModal;