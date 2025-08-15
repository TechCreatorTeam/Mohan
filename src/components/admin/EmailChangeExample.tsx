import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import EmailChangeConfirmationModal from './EmailChangeConfirmationModal';
import { useEmailChange } from '../../hooks/useEmailChange';
import { useAuth } from '../../context/AuthContext';

const EmailChangeExample: React.FC = () => {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const {
    isChanging,
    isResending,
    showConfirmationModal,
    pendingEmail,
    currentEmail,
    handleEmailChange,
    handleResendEmail,
    handleCancelRequest,
    closeModal
  } = useEmailChange();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newEmail || !currentPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!user?.email) {
      setError('No user logged in');
      return;
    }

    const result = await handleEmailChange(newEmail, currentPassword, user.email);
    
    if (!result.success) {
      setError(result.error || 'Failed to update email');
    } else if (result.requiresConfirmation) {
      // Clear form on success
      setNewEmail('');
      setCurrentPassword('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-6">
        Change Email Address
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Current Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            New Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
              placeholder="Enter new email address"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isChanging}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isChanging ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Updating Email...
            </>
          ) : (
            'Update Email'
          )}
        </button>
      </form>

      <EmailChangeConfirmationModal
        isOpen={showConfirmationModal}
        onClose={closeModal}
        newEmail={pendingEmail}
        currentEmail={currentEmail}
        onResendEmail={handleResendEmail}
        onCancelRequest={handleCancelRequest}
        isResending={isResending}
      />
    </div>
  );
};

export default EmailChangeExample;