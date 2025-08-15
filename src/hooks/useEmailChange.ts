import { useState } from 'react';
import { 
  initiateEmailChange, 
  resendEmailChangeConfirmation, 
  cancelEmailChangeRequest,
  EmailChangeResult 
} from '../utils/emailChangeHandler';

export const useEmailChange = () => {
  const [isChanging, setIsChanging] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [currentEmail, setCurrentEmail] = useState<string>('');

  const handleEmailChange = async (
    newEmail: string, 
    currentPassword: string,
    userCurrentEmail: string
  ): Promise<EmailChangeResult> => {
    setIsChanging(true);
    
    try {
      const result = await initiateEmailChange(newEmail, currentPassword);
      
      if (result.success && result.requiresConfirmation) {
        setPendingEmail(newEmail);
        setCurrentEmail(userCurrentEmail);
        setShowConfirmationModal(true);
      }
      
      return result;
    } finally {
      setIsChanging(false);
    }
  };

  const handleResendEmail = async (): Promise<void> => {
    if (!pendingEmail) return;
    
    setIsResending(true);
    
    try {
      await resendEmailChangeConfirmation(pendingEmail);
      // You might want to show a success message here
    } catch (error) {
      console.error('Failed to resend email:', error);
      // You might want to show an error message here
    } finally {
      setIsResending(false);
    }
  };

  const handleCancelRequest = (): void => {
    cancelEmailChangeRequest();
    setShowConfirmationModal(false);
    setPendingEmail('');
    setCurrentEmail('');
  };

  const closeModal = (): void => {
    setShowConfirmationModal(false);
    // Don't clear pending email in case user wants to resend later
  };

  return {
    isChanging,
    isResending,
    showConfirmationModal,
    pendingEmail,
    currentEmail,
    handleEmailChange,
    handleResendEmail,
    handleCancelRequest,
    closeModal
  };
};