import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { amount, currency, payment_method_id, customer_info } = await req.json()

    // Validate required fields
    if (!amount || !currency || !payment_method_id || !customer_info) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create or retrieve customer
    let customer
    try {
      // Try to find existing customer by email
      const customers = await stripe.customers.list({
        email: customer_info.email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customer = customers.data[0]
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customer_info.email,
          name: customer_info.name,
          phone: customer_info.phone,
        })
      }
    } catch (error) {
      console.error('Error handling customer:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to process customer information' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount should already be in cents
        currency: currency.toLowerCase(),
        customer: customer.id,
        payment_method: payment_method_id,
        confirmation_method: 'manual',
        confirm: true,
        return_url: `${req.headers.get('origin')}/checkout/success`,
        metadata: {
          customer_name: customer_info.name,
          customer_email: customer_info.email,
          customer_phone: customer_info.phone,
        },
      })

      // Handle different payment intent statuses
      if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
        return new Response(
          JSON.stringify({
            requires_action: true,
            payment_intent: {
              id: paymentIntent.id,
              client_secret: paymentIntent.client_secret,
            },
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else if (paymentIntent.status === 'succeeded') {
        // Payment succeeded
        console.log('Payment succeeded:', paymentIntent.id)
        
        return new Response(
          JSON.stringify({
            success: true,
            payment_intent: paymentIntent,
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        return new Response(
          JSON.stringify({
            error: 'Payment failed',
            payment_intent: paymentIntent,
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } catch (error) {
      console.error('Stripe payment error:', error)
      
      return new Response(
        JSON.stringify({ 
          error: error.message || 'Payment processing failed',
          type: error.type,
          code: error.code,
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})