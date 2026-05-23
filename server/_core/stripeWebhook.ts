import Stripe from "stripe";
import * as db from "../db";
import { notifyOwner } from "./notification";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
if (!stripeKey) {
  console.error("[Stripe] STRIPE_SECRET_KEY is not configured in webhook!");
}
const stripe = new Stripe(stripeKey, {
  apiVersion: "2026-04-22.dahlia",
});

export async function handleStripeWebhook(body: string, signature: string): Promise<void> {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error) {
    console.error("[Stripe] Webhook signature verification failed:", error);
    throw new Error("Invalid webhook signature");
  }

  console.log(`[Stripe] Received event: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutSessionCompleted(session);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = parseInt(session.metadata?.userId || "0");
  const creditsAmount = parseInt(session.metadata?.creditsAmount || "0");

  if (!userId || !creditsAmount) {
    console.error("[Stripe] Missing userId or creditsAmount in session metadata");
    return;
  }

  try {
    // Get transaction record
    const transaction = await db.getTransaction(session.id);
    if (!transaction) {
      console.error("[Stripe] Transaction not found for session:", session.id);
      return;
    }

    // Check if already processed
    if (transaction.status === "completed") {
      console.log("[Stripe] Transaction already processed:", session.id);
      return;
    }

    // Add credits to user
    await db.addCredits(userId, creditsAmount);

    // Update transaction status
    await db.updateTransactionStatus(session.id, "completed");

    // Get user info for notification
    const user = await db.getUserByOpenId("");
    
    // Send owner notification
    await notifyOwner({
      title: "🎉 Ny försäljning!",
      content: `En användare köpte ${creditsAmount} analyser för 49 kr. Pengarna är på väg till ditt konto!`,
    });

    console.log(`[Stripe] Successfully processed payment for user ${userId}, added ${creditsAmount} credits`);
  } catch (error) {
    console.error("[Stripe] Error processing webhook:", error);
    throw error;
  }
}
