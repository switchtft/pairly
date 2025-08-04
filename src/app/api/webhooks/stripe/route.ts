import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId, game, gameMode, numberOfMatches, teammatesNeeded } = paymentIntent.metadata;

    // Update payment status
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: 'completed' }
    });

    // Update queue entry payment status
    await prisma.queueEntry.updateMany({
      where: { 
        payments: {
          some: {
            stripePaymentIntentId: paymentIntent.id
          }
        }
      },
      data: { paymentStatus: 'paid' }
    });

    console.log(`Payment succeeded for user ${userId}, queue entry updated`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: 'failed' }
    });

    // Remove queue entry if payment failed
    await prisma.queueEntry.deleteMany({
      where: { 
        payments: {
          some: {
            stripePaymentIntentId: paymentIntent.id
          }
        }
      }
    });

    console.log(`Payment failed for payment intent ${paymentIntent.id}, queue entry removed`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
} 