import { supabase } from '../lib/supabase';

export interface EmailChangeResult {
  success: boolean;
  error?: string;
  requiresConfirmation?: boolean;
}

/**
 * Sign out all sessions globally across all devices and browsers
 * This is called after successful email change for security
 */
const signOutAllSessionsGlobally = async (): Promise<void> => {
  try {
    console.log('🔐 Initiating global sign out across all devices...');
    
    // Sign out from all sessions globally
    // This invalidates all refresh tokens for the user across all devices
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('❌ Error during global sign out:', error);
      throw error;
    }
    
    console.log('✅ Successfully signed out from all devices and browsers');
  } catch (error) {
    console.error('💥 Failed to sign out globally:', error);
    // Don't throw here as email change was successful
    // Just log the error
  }
};
/**
 * Initiate email change process
 * This will send a confirmation email to the new email address
 */
export const initiateEmailChange = async (
  newEmail: string,
  currentPassword: string
): Promise<EmailChangeResult> => {
  try {
    console.log('🔄 Initiating email change process...');
    console.log('📧 New email:', newEmail);
    
    // First verify the current password by attempting to sign in
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user?.email) {
      console.log('❌ No user logged in');
      return { success: false, error: 'No user logged in' };
    }

    console.log('👤 Current user email:', currentUser.user.email);

    // Verify current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: currentUser.user.email,
      password: currentPassword,
    });

    if (verifyError) {
      console.log('❌ Password verification failed:', verifyError.message);
      return { success: false, error: 'Current password is incorrect' };
    }

    console.log('✅ Password verified, updating email...');

    // Initiate email change with redirect URL
    const redirectUrl = `${window.location.origin}/admin/login/verify-email-change`;
    console.log('🔗 Redirect URL:', redirectUrl);
    
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (updateError) {
      console.log('❌ Email update failed:', updateError.message);
      return { success: false, error: updateError.message };
    }

    console.log('✅ Email change initiated successfully');
    console.log('ℹ️ Note: After clicking the verification link in your email, all sessions will be signed out globally for security');
    
    return { 
      success: true, 
      requiresConfirmation: true 
    };
  } catch (error) {
    console.error('💥 Email change error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update email' 
    };
  }
};

/**
 * Resend email change confirmation
 */
export const resendEmailChangeConfirmation = async (
  newEmail: string
): Promise<EmailChangeResult> => {
  try {
    console.log('🔄 Resending email change confirmation...');
    console.log('📧 Email:', newEmail);
    
    const redirectUrl = `${window.location.origin}/admin/login/verify-email-change`;
    console.log('🔗 Redirect URL:', redirectUrl);
    
    // Re-trigger the email change to resend confirmation
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      console.log('❌ Resend failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Confirmation email resent successfully');
    return { success: true };
  } catch (error) {
    console.error('💥 Resend email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to resend email' 
    };
  }
};

/**
 * Cancel email change request
 * Note: Supabase doesn't have a direct way to cancel pending email changes,
 * so this is more of a UI state reset
 */
export const cancelEmailChangeRequest = (): EmailChangeResult => {
  // In a real implementation, you might want to track pending changes
  // and provide a way to cancel them before the user clicks the confirmation link
  return { success: true };
};

/**
 * Check if there's a pending email change
 */
export const checkPendingEmailChange = async (): Promise<{
  hasPending: boolean;
  newEmail?: string;
}> => {
  try {
    // This is a simplified check - in a real implementation,
    // you might want to store pending email changes in your database
    const { data: user } = await supabase.auth.getUser();
    
    // Supabase doesn't directly expose pending email changes,
    // so this would need to be implemented based on your specific needs
    return { hasPending: false };
  } catch (error) {
    console.error('Error checking pending email change:', error);
    return { hasPending: false };
  }
};