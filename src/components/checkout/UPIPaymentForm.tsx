import React, { useState } from 'react';
import { Smartphone, QrCode, Copy, ExternalLink, AlertCircle, CheckCircle, X, Clock } from 'lucide-react';

interface UPIApp {
  id: string;
  name: string;
  packageName: string;
  icon: string;
}

interface UPIPaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  disabled?: boolean;
}

const UPIPaymentForm: React.FC<UPIPaymentFormProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  customerInfo,
  disabled = false
}) => {
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes

  // Test UPI ID for demo purposes
  const MERCHANT_UPI_ID = '918205445@ibl'; // Updated UPI ID
  const MERCHANT_NAME = 'TechCreator Test';

  const upiApps: UPIApp[] = [
    { id: 'phonepe', name: 'PhonePe', packageName: 'com.phonepe.app', icon: '📱' },
    { id: 'googlepay', name: 'Google Pay', packageName: 'com.google.android.apps.nbu.paisa.user', icon: '💳' },
    { id: 'paytm', name: 'Paytm', packageName: 'net.one97.paytm', icon: '💰' },
    { id: 'bhim', name: 'BHIM', packageName: 'in.org.npci.upiapp', icon: '🏦' },
    { id: 'amazonpay', name: 'Amazon Pay', packageName: 'in.amazon.mShop.android.shopping', icon: '🛒' }
  ];

  const generateTransactionId = () => {
    return 'TEST_UPI_' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const generateUPIUrl = (amount: number, transactionRef: string) => {
    const params = new URLSearchParams({
      pa: MERCHANT_UPI_ID,
      pn: MERCHANT_NAME,
      am: amount.toString(),
      cu: currency,
      tn: `Test Payment for TechCreator Project`,
      tr: transactionRef
    });
    return `upi://pay?${params.toString()}`;
  };

  const generateQRCodeUrl = (upiUrl: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;
  };

  const openUPIApp = (packageName: string, upiUrl: string) => {
    if (/Android/i.test(navigator.userAgent)) {
      window.location.href = `intent://pay?${upiUrl.split('?')[1]}#Intent;scheme=upi;package=${packageName};end`;
    } else {
      window.location.href = upiUrl;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!upiId && !selectedUpiApp) {
      onError('Please enter UPI ID or select a UPI app');
      return;
    }

    setIsProcessing(true);

    try {
      const txnId = generateTransactionId();
      setTransactionId(txnId);

      const upiUrl = generateUPIUrl(amount, txnId);
      setPaymentUrl(upiUrl);

      // Show QR modal
      setShowQRModal(true);
      setTimeRemaining(600); // Reset timer

      // If UPI app is selected, try to open it
      if (selectedUpiApp) {
        const app = upiApps.find(a => a.id === selectedUpiApp);
        if (app) {
          openUPIApp(app.packageName, upiUrl);
        }
      }

      // Start countdown timer
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Simulate payment verification (in real app, you'd poll your backend)
      setTimeout(() => {
        clearInterval(timer);
        // For demo purposes, randomly succeed or fail
        const success = Math.random() > 0.3; // 70% success rate

        if (success) {
          setShowQRModal(false);
          onSuccess({
            transactionId: txnId,
            paymentMethod: 'upi',
            amount,
            currency,
            status: 'succeeded',
            testMode: true
          });
        } else {
          setShowQRModal(false);
          onError('UPI payment failed. Please try again.');
          setIsProcessing(false);
        }
      }, 15000); // Simulate 15 second processing time

    } catch (error) {
      console.error('UPI payment initiation failed:', error);
      onError('Failed to initiate UPI payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setIsProcessing(false);
    setPaymentUrl('');
    setTransactionId('');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Test Mode Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium mb-1">🧪 Test Mode</p>
              <p>This is a test UPI payment. No real money will be charged. Use any UPI ID for testing.</p>
            </div>
          </div>
        </div>

        {/* UPI Apps */}
        <div>
          <h3 className="text-md font-medium text-slate-900 dark:text-slate-200 mb-4">
            Pay with your favorite UPI app:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {upiApps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => setSelectedUpiApp(selectedUpiApp === app.id ? '' : app.id)}
                disabled={disabled || isProcessing}
                className={`p-3 border rounded-lg flex items-center space-x-2 transition-colors duration-200 ${
                  selectedUpiApp === app.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
                } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-lg">{app.icon}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{app.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-slate-500 dark:text-slate-400 my-4">OR</div>

        {/* Manual UPI ID */}
        <div>
          <label htmlFor="upiId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Enter UPI ID manually (Test Mode - Use any ID)
          </label>
          <input
            type="text"
            id="upiId"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="test@paytm (or any test UPI ID)"
            disabled={disabled || isProcessing}
            className="w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={disabled || isProcessing || (!upiId && !selectedUpiApp)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
            disabled || isProcessing || (!upiId && !selectedUpiApp)
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Initiating Test Payment...
            </>
          ) : (
            <>
              <Smartphone className="h-5 w-5 mr-2" />
              Pay with UPI (Test Mode)
            </>
          )}
        </button>
      </form>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <QrCode className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">
                    Complete UPI Payment
                  </h3>
                </div>
                <button
                  onClick={closeQRModal}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Test Mode Warning */}
              <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-medium">🧪 Test Payment Mode</p>
                    <p>This will simulate a UPI payment. No real money will be charged.</p>
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-lg font-bold">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Time remaining to complete payment
                </p>
              </div>

              {/* QR Code */}
              <div className="text-center mb-6">
                <div className="bg-white p-4 rounded-lg inline-block mb-4 border">
                  <img 
                    src={generateQRCodeUrl(paymentUrl)} 
                    alt="UPI QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Scan this QR code with any UPI app to pay
                </p>
              </div>

              {/* Payment Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Transaction ID:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-slate-900 dark:text-slate-200">{transactionId}</span>
                    <button
                      onClick={() => copyToClipboard(transactionId)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Amount:</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Pay to:</span>
                  <span className="text-sm font-mono text-slate-900 dark:text-slate-200">{MERCHANT_UPI_ID}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Payment Instructions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Open your UPI app and scan the QR code</li>
                      <li>Or use the transaction details above</li>
                      <li>Complete the payment in your UPI app</li>
                      <li>This is a test - payment will be simulated automatically</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={closeQRModal}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => copyToClipboard(paymentUrl)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy UPI Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UPIPaymentForm;