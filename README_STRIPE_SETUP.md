# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for both credit cards and UPI in your TechCreator portfolio application.

## 🔧 Prerequisites

1. **Stripe Account**: Create a Stripe account at [https://stripe.com](https://stripe.com)
2. **Supabase Project**: Ensure your Supabase project is set up and running
3. **Environment Variables**: Your `.env` file should contain the Stripe keys

## 📋 Environment Variables

Make sure your `.env` file contains these Stripe-related variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🚀 Setup Steps

### 1. Install Dependencies

The required Stripe dependencies have been added to your project:
- `@stripe/stripe-js`
- `@stripe/react-stripe-js`

### 2. Stripe Dashboard Configuration

#### Enable Payment Methods:
1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** → **Payment methods**
3. Enable the following payment methods:
   - **Cards** (Visa, Mastercard, American Express, etc.)
   - **UPI** (for Indian customers)

#### Configure UPI:
1. In your Stripe Dashboard, go to **Settings** → **Payment methods**
2. Find **UPI** and click **Enable**
3. Configure UPI settings for Indian market

### 3. Webhook Configuration

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-supabase-project.supabase.co/functions/v1/stripe-webhook`
4. Select these events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.created`
5. Copy the webhook signing secret and add it to your environment variables

### 4. Supabase Edge Functions

The following edge functions have been created:

#### `create-payment-intent`
- Handles payment intent creation
- Manages customer creation/retrieval
- Processes both card and UPI payments

#### `stripe-webhook`
- Handles Stripe webhook events
- Updates order status based on payment results
- Manages payment confirmations

### 5. Deploy Edge Functions

Deploy the edge functions to your Supabase project:

```bash
# Deploy create-payment-intent function
supabase functions deploy create-payment-intent

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

### 6. Set Environment Variables in Supabase

In your Supabase dashboard:
1. Go to **Settings** → **Edge Functions**
2. Add the following secrets:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 💳 Payment Methods Supported

### Credit/Debit Cards
- Visa, Mastercard, American Express
- Secure 3D Secure authentication
- Real-time validation
- International cards supported

### UPI (Unified Payments Interface)
- PhonePe, Google Pay, Paytm, BHIM
- QR code generation for easy scanning
- Direct UPI app integration
- Real-time payment confirmation

## 🔒 Security Features

1. **PCI Compliance**: Stripe handles all sensitive card data
2. **3D Secure**: Additional authentication for card payments
3. **Webhook Verification**: All webhooks are cryptographically verified
4. **Environment Variables**: Sensitive keys are stored securely
5. **HTTPS Only**: All communications are encrypted

## 🧪 Testing

### Test Card Numbers

Use these test card numbers in development:

```
# Successful payments
4242424242424242 (Visa)
5555555555554444 (Mastercard)

# Failed payments
4000000000000002 (Card declined)
4000000000009995 (Insufficient funds)

# 3D Secure
4000000000003220 (Requires authentication)
```

### Test UPI

In test mode, UPI payments will be simulated. Use any valid UPI ID format like `test@paytm`.

## 📱 Frontend Integration

The checkout page now supports:

1. **Payment Method Selection**: Users can choose between cards and UPI
2. **Stripe Elements**: Secure card input fields
3. **UPI Integration**: QR codes and app deep links
4. **Real-time Validation**: Immediate feedback on form inputs
5. **Error Handling**: Comprehensive error messages
6. **Success Handling**: Order confirmation and email delivery

## 🔄 Payment Flow

### Card Payments:
1. Customer enters card details
2. Stripe Elements validates input
3. Payment intent is created via edge function
4. 3D Secure authentication (if required)
5. Payment confirmation
6. Order creation and email delivery

### UPI Payments:
1. Customer selects UPI app or enters UPI ID
2. QR code is generated
3. Customer scans QR or opens UPI app
4. Payment confirmation in UPI app
5. Webhook receives confirmation
6. Order creation and email delivery

## 🚨 Important Notes

1. **Test Mode**: Always test thoroughly before going live
2. **Webhook Security**: Never skip webhook signature verification
3. **Error Handling**: Implement comprehensive error handling
4. **User Experience**: Provide clear feedback during payment process
5. **Compliance**: Ensure compliance with local payment regulations

## 📞 Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For integration issues:
- Check browser console for errors
- Verify environment variables
- Test webhook endpoints
- Review Supabase function logs

## 🎯 Next Steps

1. Test the payment flow thoroughly
2. Configure webhook endpoints in production
3. Set up proper error monitoring
4. Implement payment analytics
5. Add payment method preferences
6. Set up automated reconciliation

Your Stripe integration is now ready! The checkout process supports both credit cards and UPI payments with a seamless user experience.