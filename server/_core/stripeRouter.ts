import { router, publicProcedure } from "./trpc";
import { handleStripeWebhook } from "./stripeWebhook";

export const stripeRouter = router({
  webhook: publicProcedure.mutation(async ({ ctx }) => {
    const body = await ctx.req.text?.() || "";
    const signature = ctx.req.headers?.["stripe-signature"] as string;

    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    try {
      await handleStripeWebhook(body, signature);
      return { received: true };
    } catch (error) {
      console.error("[Stripe] Webhook error:", error);
      throw error;
    }
  }),
});
