import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Shield, 
  CheckCircle, 
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { sendOrderConfirmation, generateDownloadInstructions } from '../utils/email';
import { stripePromise, checkStripeLoaded } from '../lib/stripe';
import StripePaymentForm from '../components/checkout/StripePaymentForm';
import UPIPaymentForm from '../components/checkout/UPIPaymentForm';
import { useSettings } from '../context/SettingsContext';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
}

const CheckoutPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, addOrder, getProjectDocuments } = useProjects();
  const { settings } = useSettings();
  const project = projects.find(p => p.id === id);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  
  // Payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [stripeLoading, setStripeLoading] = useState(true);

  useEffect(() => {
    if (!project) {
      navigate('/projects');
    }
  }, [project, navigate]);

  // Check Stripe loading status
  useEffect(() => {
    const checkStripe = async () => {
      try {
        await checkStripeLoaded();
        setStripeLoading(false);
      } catch (error) {
        console.error('Stripe failed to load:', error);
      }
    };
    checkStripe();
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-16 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 max-w-md mx-auto text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-4">Project Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The project you are trying to purchase doesn't exist.
          </p>
          <Link 
            to="/projects" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // Logic for payment method toggles
  let upiEnabled = !!settings?.enableUPI;
  let cardEnabled = !!settings?.enableCard;
  let paymentProcessingEnabled = !!settings?.paymentProcessingEnabled;

  // If Payment Processing is ON, both UPI and Card are enabled regardless of their own toggles
  if (paymentProcessingEnabled) {
    upiEnabled = true;
    cardEnabled = true;
  }

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: cardEnabled ? 'Credit/Debit Card' : 'Credit/Debit Card (Coming Soon)',
      icon: <CreditCard className="h-6 w-6" />,
      description: cardEnabled
        ? 'Pay securely with your card via Stripe'
        : 'Pay securely with your card',
      enabled: cardEnabled,
    },
    {
      id: 'upi',
      name: upiEnabled ? 'UPI Payment' : 'UPI Payment (Coming Soon)',
      icon: <Smartphone className="h-6 w-6" />,
      description: upiEnabled
        ? 'Pay using any UPI app like PhonePe, Google Pay, Paytm'
        : 'Pay using any UPI app like PhonePe, Google Pay, Paytm',
      enabled: upiEnabled,
    }
  ];

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(project.price);

  const handlePaymentSuccess = async (paymentData: any) => {
    setPaymentStatus('success');
    setTransactionId(paymentData.id || paymentData.transactionId);
    
    try {
      // Add order to database
      await addOrder({
        projectId: project.id,
        projectTitle: project.title,
        customerName,
        customerEmail,
        price: project.price,
        status: 'completed'
      });
      
      // Send order confirmation email
      const downloadInstructions = generateDownloadInstructions(project.title, paymentData.id || paymentData.transactionId);
      await sendOrderConfirmation(
        {
          project_title: project.title,
          customer_name: customerName,
          price: formattedPrice,
          order_id: paymentData.id || paymentData.transactionId,
          download_instructions: downloadInstructions
        },
        customerEmail
      );
    } catch (error) {
      console.error('Error processing order:', error);
      // Payment was successful but order processing failed
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('failed');
    setPaymentError(error);
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setPaymentError('');
    setTransactionId('');
  };

  const handleNewPurchase = () => {
    navigate('/projects');
  };

  // Get project documents count for display
  const projectDocuments = getProjectDocuments(project.id);
  const documentsCount = projectDocuments.length;

  const customerInfo = {
    name: customerName,
    email: customerEmail,
    phone: customerPhone
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-4">Order Summary</h2>
              
              <div className="flex items-start space-x-4 mb-4">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-slate-200">{project.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{project.category}</p>
                </div>
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Project Price</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">{formattedPrice}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Processing Fee</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">₹0</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-200">Total</span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-200">{formattedPrice}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Secure Payment</p>
                    <p>Your payment is protected by industry-standard encryption.</p>
                  </div>
                </div>
              </div>

              {/* Documents Info */}
              {documentsCount > 0 && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                    <div className="text-sm text-green-800 dark:text-green-300">
                      <p className="font-medium mb-1">Project Documents Included</p>
                      <p>{documentsCount} documents across all review stages will be delivered via email.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              {paymentStatus === 'idle' && (
                <>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-6">Checkout</h1>
                  
                  {/* Customer Information */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-4">Customer Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        required
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Project documents will be sent to this email address
                      </p>
                    </div>
                  </div>


                  {/* Payment Method Selection */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-4">Payment Method</h2>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : method.enabled
                                ? 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
                                : 'border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
                          }`}
                          onClick={() => method.enabled && setSelectedPaymentMethod(method.id)}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={method.id}
                              name="paymentMethod"
                              value={method.id}
                              checked={selectedPaymentMethod === method.id}
                              onChange={() => setSelectedPaymentMethod(method.id)}
                              disabled={!method.enabled}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3 flex items-center">
                              <div className="text-blue-600 dark:text-blue-400 mr-3">
                                {method.icon}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-200">
                                  {method.name}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {method.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Form */}
                  {customerName && customerEmail && customerPhone && (
                    <div>
                      {/* Only show payment forms if the selected method is enabled */}
                      {selectedPaymentMethod === 'stripe' && cardEnabled && (
                        <Elements 
                          stripe={stripePromise}
                          options={{
                            appearance: {
                              theme: 'stripe',
                              variables: {
                                colorPrimary: '#3b82f6',
                                colorBackground: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                                colorText: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1f2937',
                                fontFamily: 'Inter, system-ui, sans-serif',
                              }
                            }
                          }}
                        >
                          {stripeLoading ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="text-slate-600 dark:text-slate-400 mt-2">Loading payment form...</p>
                            </div>
                          ) : (
                            <StripePaymentForm
                              amount={project.price}
                              currency="INR"
                              onSuccess={handlePaymentSuccess}
                              onError={handlePaymentError}
                              customerInfo={customerInfo}
                              disabled={isProcessing}
                            />
                          )}
                        </Elements>
                      )}

                      {selectedPaymentMethod === 'upi' && upiEnabled && (
                        <UPIPaymentForm
                          amount={project.price}
                          currency="INR"
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          customerInfo={customerInfo}
                          disabled={isProcessing}
                        />
                      )}
                    </div>
                  )}

                  {(!customerName || !customerEmail || !customerPhone) && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                        <div className="text-sm text-amber-800 dark:text-amber-300">
                          <p className="font-medium mb-1">Complete Customer Information</p>
                          <p>Please fill in all customer details above to proceed with payment.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Payment Success */}
              {paymentStatus === 'success' && (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Payment Successful!</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Thank you for your purchase. You'll receive emails with order confirmation and download links shortly.
                  </p>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
                    <div className="text-sm text-green-800 dark:text-green-300">
                      <p className="font-medium mb-2">Order Details:</p>
                      <p>Transaction ID: {transactionId}</p>
                      <p>Project: {project.title}</p>
                      <p>Amount: {formattedPrice}</p>
                      <p>Payment Method: {selectedPaymentMethod === 'stripe' ? 'Credit/Debit Card' : 'UPI'}</p>
                      {documentsCount > 0 && (
                        <p className="mt-2 flex items-center justify-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {documentsCount} project documents will be delivered via email
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleNewPurchase}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Browse More Projects
                    </button>
                    <Link
                      to="/contact"
                      className="block w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 text-center"
                    >
                      Need Help?
                    </Link>
                  </div>
                </div>
              )}

              {/* Payment Failed */}
              {paymentStatus === 'failed' && (
                <div className="text-center">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Payment Failed</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {paymentError || 'There was an issue processing your payment. Please try again.'}
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleRetry}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Try Again
                    </button>
                    <Link
                      to="/contact"
                      className="block w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 text-center"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;