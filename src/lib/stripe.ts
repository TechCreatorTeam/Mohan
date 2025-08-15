import { loadStripe } from '@stripe/stripe-js';

// Use test publishable key for development
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51ROUTePBTeX4TeMEySv3092ntShUUhw0S2xJRS1mnAM6fvszh8fT00jkMXpw6GM4Aps2cC3oJzQ3lWQvbLmCEbvG00wwKwyzFc';

if (!stripePublishableKey) {
  console.warn('Stripe publishable key is missing. Please check your environment variables.');
}

// Initialize Stripe with enhanced options
export const stripePromise = loadStripe(stripePublishableKey, {
  // Ensure Stripe loads properly
  locale: 'en',
});

// Test card numbers for development
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  REQUIRES_3D_SECURE: '4000000000003220',
  EXPIRED: '4000000000000069',
  INCORRECT_CVC: '4000000000000127',
};

// Test UPI IDs for development
export const TEST_UPI_IDS = {
  SUCCESS: 'success@paytm',
  FAILURE: 'failure@paytm',
  PENDING: 'pending@paytm',
};

export const isTestMode = () => {
  return stripePublishableKey?.startsWith('pk_test_') || false;
};

// Helper function to check if Stripe is loaded
export const checkStripeLoaded = async () => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }
    return stripe;
  } catch (error) {
    console.error('Stripe loading error:', error);
    throw error;
  }
};