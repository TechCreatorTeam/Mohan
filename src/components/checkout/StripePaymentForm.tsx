import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  disabled?: boolean;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  customerInfo,
  disabled = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState(customerInfo.name);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false
  });

  // Enhanced card element options with better styling
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937', // slate-800
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#9ca3af', // slate-400
        },
        iconColor: '#6b7280', // slate-500
      },
      invalid: {
        color: '#ef4444', // red-500
        iconColor: '#ef4444',
      },
      complete: {
        color: '#059669', // emerald-600
        iconColor: '#059669',
      },
    },
    hidePostalCode: true,
  };

  // Dark mode card element options
  const darkCardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#f1f5f9', // slate-100
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSmoothing: 'antialiased',
        backgroundColor: '#0f172a', // slate-900
        '::placeholder': {
          color: '#64748b', // slate-500
        },
        iconColor: '#94a3b8', // slate-400
      },
      invalid: {
        color: '#f87171', // red-400
        iconColor: '#f87171',
      },
      complete: {
        color: '#34d399', // emerald-400
        iconColor: '#34d399',
      },
    },
    hidePostalCode: true,
  };

  // Detect dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');
  const elementOptions = isDarkMode ? darkCardElementOptions : cardElementOptions;

  useEffect(() => {
    // Update cardholder name when customer info changes
    setCardholderName(customerInfo.name);
  }, [customerInfo.name]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!cardholderName.trim()) {
      setErrors({ cardholderName: 'Cardholder name is required' });
      return;
    }

    // Check if all card fields are complete
    if (!cardComplete.cardNumber || !cardComplete.cardExpiry || !cardComplete.cardCvc) {
      onError('Please complete all card details');
      return;
    }

    setIsProcessing(true);
    setErrors({});

    const cardElement = elements.getElement(CardNumberElement);

    if (!cardElement) {
      onError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
      });

      if (paymentMethodError) {
        onError(paymentMethodError.message || 'Failed to create payment method');
        setIsProcessing(false);
        return;
      }

      // For test mode, simulate a successful payment
      // In production, you would call your backend to create a payment intent
      console.log('🧪 Test Mode: Simulating successful payment');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const mockPaymentIntent = {
        id: 'pi_test_' + Date.now(),
        status: 'succeeded',
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        payment_method: paymentMethod.id,
        created: Math.floor(Date.now() / 1000),
        metadata: {
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          test_mode: 'true'
        }
      };

      onSuccess(mockPaymentIntent);

    } catch (error) {
      onError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleElementChange = (elementType: string) => (event: any) => {
    if (event.error) {
      setErrors(prev => ({ ...prev, [elementType]: event.error.message }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[elementType];
        return newErrors;
      });
    }

    // Update completion status
    setCardComplete(prev => ({
      ...prev,
      [elementType]: event.complete
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Test Mode Notice */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
          <div className="text-sm text-green-800 dark:text-green-300">
            <p className="font-medium mb-1">🧪 Test Mode - Use Test Cards</p>
            <div className="space-y-1">
              <p><strong>Success:</strong> 4242 4242 4242 4242</p>
              <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
              <p><strong>3D Secure:</strong> 4000 0000 0000 3220</p>
              <p>Use any future expiry date and any 3-digit CVC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label htmlFor="cardholderName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Cardholder Name *
        </label>
        <input
          type="text"
          id="cardholderName"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-slate-200 ${
            errors.cardholderName ? 'border-red-300 dark:border-red-700' : 'border-slate-300 dark:border-slate-700'
          }`}
          placeholder="John Doe"
          disabled={disabled || isProcessing}
        />
        {errors.cardholderName && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.cardholderName}
          </p>
        )}
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Card Number *
        </label>
        <div className={`w-full px-3 py-3 border rounded-md focus-within:ring-2 focus-within:ring-blue-500 ${
          errors.cardNumber ? 'border-red-300 dark:border-red-700' : 'border-slate-300 dark:border-slate-700'
        } ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
          <CardNumberElement
            options={elementOptions}
            onChange={handleElementChange('cardNumber')}
          />
        </div>
        {errors.cardNumber && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.cardNumber}
          </p>
        )}
      </div>

      {/* Expiry and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Expiry Date *
          </label>
          <div className={`w-full px-3 py-3 border rounded-md focus-within:ring-2 focus-within:ring-blue-500 ${
            errors.cardExpiry ? 'border-red-300 dark:border-red-700' : 'border-slate-300 dark:border-slate-700'
          } ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <CardExpiryElement
              options={elementOptions}
              onChange={handleElementChange('cardExpiry')}
            />
          </div>
          {errors.cardExpiry && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.cardExpiry}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            CVC *
          </label>
          <div className={`w-full px-3 py-3 border rounded-md focus-within:ring-2 focus-within:ring-blue-500 ${
            errors.cardCvc ? 'border-red-300 dark:border-red-700' : 'border-slate-300 dark:border-slate-700'
          } ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <CardCvcElement
              options={elementOptions}
              onChange={handleElementChange('cardCvc')}
            />
          </div>
          {errors.cardCvc && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.cardCvc}
            </p>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Secure Test Payment</p>
            <p>This is a test environment. No real charges will be made to your card.</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || disabled || isProcessing || !cardComplete.cardNumber || !cardComplete.cardExpiry || !cardComplete.cardCvc}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
          isProcessing || disabled || !cardComplete.cardNumber || !cardComplete.cardExpiry || !cardComplete.cardCvc
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Test Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay Securely (Test Mode)
          </>
        )}
      </button>
    </form>
  );
};

export default StripePaymentForm;