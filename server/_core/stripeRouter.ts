import { router, publicProcedure } from "./trpc";
import { handleStripeWebhook } from "./stripeWebhook";

export const stripeRouter = router({
  webhook: publicProcedure.mutation(async ({ ctx }) => {
    // Get raw body from request
    let body = "";
    if (ctx.req instanceof Request) {
      body = await ctx.req.text();
    } else {
      // Express request
      body = (ctx.req as any).rawBody || "";
    }
    const signature = (ctx.req as any).headers?.["stripe-signature"] as string;

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
