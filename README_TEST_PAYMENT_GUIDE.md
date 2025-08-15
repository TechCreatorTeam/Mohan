# 🧪 Test Payment Guide

This guide explains how to test both Stripe card payments and UPI payments in the checkout process.

## 🎯 **Test Mode Features**

### **✅ What's Enabled:**
- Test Stripe API keys are configured
- No real money will be charged
- Simulated payment processing
- Test card numbers provided
- Mock UPI payment flow

### **🔒 Security:**
- All payments are simulated
- No real financial transactions
- Safe for development and testing

## 💳 **Testing Credit Card Payments**

### **Test Card Numbers:**

#### **✅ Successful Payments:**
- **4242 4242 4242 4242** - Visa (most common for testing)
- **5555 5555 5555 4444** - Mastercard
- **3782 822463 10005** - American Express

#### **❌ Failed Payments:**
- **4000 0000 0000 0002** - Card declined
- **4000 0000 0000 9995** - Insufficient funds
- **4000 0000 0000 0069** - Expired card
- **4000 0000 0000 0127** - Incorrect CVC

#### **🔐 3D Secure Testing:**
- **4000 0000 0000 3220** - Requires authentication

### **Card Details for Testing:**
- **Expiry Date:** Use any future date (e.g., 12/25, 01/26)
- **CVC:** Use any 3-digit number (e.g., 123, 456)
- **Name:** Use any name

## 📱 **Testing UPI Payments**

### **Test UPI IDs:**
- **test@paytm** - Will simulate successful payment
- **success@upi** - Will simulate successful payment
- **failure@upi** - Will simulate failed payment
- **Any UPI ID format** - All will work in test mode

### **UPI Test Flow:**
1. Select a UPI app or enter a test UPI ID
2. Click "Pay with UPI (Test Mode)"
3. QR code modal will appear
4. Payment will be simulated automatically after 15 seconds
5. 70% chance of success, 30% chance of failure (for realistic testing)

## 🎮 **How to Test**

### **Step 1: Go to Checkout**
1. Browse projects and click "View details"
2. Click "Purchase Project"
3. Fill in customer information

### **Step 2: Choose Payment Method**
- **For Card Testing:** Select "Credit/Debit Card"
- **For UPI Testing:** Select "UPI Payment"

### **Step 3: Test Card Payments**
1. Enter test card number: `4242 4242 4242 4242`
2. Enter future expiry: `12/25`
3. Enter any CVC: `123`
4. Enter cardholder name
5. Click "Pay Securely (Test Mode)"
6. Payment will be simulated and succeed

### **Step 4: Test UPI Payments**
1. Enter test UPI ID: `test@paytm`
2. Click "Pay with UPI (Test Mode)"
3. QR code modal will appear
4. Wait 15 seconds for automatic simulation
5. Payment will complete (70% success rate)

## 🔍 **What Happens During Testing**

### **Card Payments:**
- Stripe Elements validate the card format
- Payment method is created with Stripe
- Payment is simulated (no real charge)
- Success/failure is determined by test card used
- Order is created in database
- Confirmation email is sent

### **UPI Payments:**
- QR code is generated with test merchant details
- Payment URL is created for UPI apps
- Timer counts down from 10 minutes
- Payment is simulated after 15 seconds
- Random success/failure for realistic testing
- Order is created on success

## 🚨 **Important Notes**

### **Test Mode Indicators:**
- Yellow warning boxes show "Test Mode"
- Test card numbers are displayed
- UPI shows "Test Payment Mode"
- No real money is charged

### **Order Creation:**
- Orders are still created in the database
- Emails are still sent (to test email flow)
- Documents are still delivered
- Everything works except real payment processing

### **Switching to Production:**
1. Replace test API keys with live keys
2. Remove test mode indicators
3. Enable real payment processing
4. Test with small amounts first

## 🎯 **Testing Scenarios**

### **Successful Flow:**
1. Use `4242 4242 4242 4242` for cards
2. Use `test@paytm` for UPI
3. Complete customer information
4. Verify order creation
5. Check email delivery

### **Failed Payment Flow:**
1. Use `4000 0000 0000 0002` for declined card
2. Use `failure@upi` for failed UPI
3. Verify error handling
4. Check retry functionality

### **3D Secure Flow:**
1. Use `4000 0000 0000 3220`
2. Verify additional authentication prompt
3. Complete authentication
4. Verify successful payment

## 📧 **Email Testing**

All emails will be sent during testing:
- Order confirmation emails
- Document delivery emails
- Admin notification emails

This allows you to test the complete customer journey from payment to document delivery.

## 🔧 **Troubleshooting**

### **Common Issues:**
- **Stripe not loading:** Check internet connection and API keys
- **UPI QR not showing:** Check if modal is blocked by popup blocker
- **Payment stuck:** Refresh page and try again
- **Emails not sending:** Check Brevo configuration

### **Debug Tips:**
- Open browser console to see detailed logs
- Check network tab for API calls
- Verify environment variables are loaded
- Test with different browsers

---

**Ready to test!** 🚀 The payment system is fully configured for safe testing with no real charges.