import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { stripeRouter } from "./_core/stripeRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeKey) {
  stripe = new Stripe(stripeKey, {
    apiVersion: "2026-04-22.dahlia",
  });
} else {
  console.warn("[Stripe] STRIPE_SECRET_KEY is not configured - payments will not work");
}

export const appRouter = router({
  system: systemRouter,
  stripe: stripeRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  credits: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const credits = await db.getOrCreateCredits(ctx.user.id);
      return { balance: credits.balance };
    }),
  }),

  items: router({
    analyzeItem: protectedProcedure
      .input(z.object({ imageBase64: z.string(), fileName: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Deduct one credit first
        const deducted = await db.deductCredit(ctx.user.id);
        if (!deducted) {
          throw new Error("Inte tillräckligt med krediter");
        }

        try {
          // Convert base64 to buffer
          const buffer = Buffer.from(input.imageBase64.split(",")[1] || input.imageBase64, "base64");

          // Upload image to storage
          const { url: imageUrl, key: imageKey } = await storagePut(
            `${ctx.user.id}/items/${Date.now()}-${input.fileName}`,
            buffer,
            "image/jpeg"
          );

          // Call Gemini AI for analysis
          const analysisResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "Du är en expert på att identifiera och värdera föremål. Analysera bilden och ge namn, beskrivning, kategori, skick och värderingsuppskattning i svenska kronor. Svara ENDAST i JSON-format med fälten: name (string), description (string), category (string - t.ex. Elektronik, Möbler, Konst, Smycken, Kläder, Sport, Verktyg, Övrigt), condition (string - t.ex. Nyskick, Mycket bra, Bra, Acceptabelt, Dåligt), estimatedValue (number i SEK), marketInsight (string - kort marknadsinformation om föremålet). Ingen annan text.",
              },
              {
                role: "user",
                content: `Analysera denna bild av en sak. Bild URL: ${imageUrl}. Ge namn, beskrivning, kategori, skick och värdering i JSON-format.`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "item_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Namn på föremålet" },
                    description: { type: "string", description: "Detaljerad beskrivning av föremålet" },
                    category: { type: "string", description: "Kategori (Elektronik, Möbler, Konst, Smycken, Kläder, Sport, Verktyg, Övrigt)" },
                    condition: { type: "string", description: "Skick (Nyskick, Mycket bra, Bra, Acceptabelt, Dåligt)" },
                    estimatedValue: { type: "number", description: "Värdering i SEK" },
                    marketInsight: { type: "string", description: "Kort marknadsinformation och tips" },
                  },
                  required: ["name", "description", "category", "condition", "estimatedValue", "marketInsight"],
                  additionalProperties: false,
                },
              },
            },
          });

          const analysisText = analysisResponse.choices[0]?.message?.content;
          if (!analysisText || typeof analysisText !== "string") {
            throw new Error("Ingen analys från AI");
          }

          const analysis = JSON.parse(analysisText);

          // Create item in database with extended fields
          const item = await db.createItem(ctx.user.id, {
            name: analysis.name,
            description: analysis.description,
            estimatedValue: analysis.estimatedValue.toString(),
            category: analysis.category || "Övrigt",
            condition: analysis.condition || "Bra",
            marketInsight: analysis.marketInsight || "",
            imageUrl,
            imageKey,
          });

          return item;
        } catch (error) {
          // Refund the credit if analysis fails
          await db.addCredits(ctx.user.id, 1);
          throw error;
        }
      }),

    getItems: protectedProcedure.query(async ({ ctx }) => {
      return db.getItems(ctx.user.id);
    }),

    getItem: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .query(async ({ ctx, input }) => {
        const item = await db.getItem(ctx.user.id, input.itemId);
        if (!item) {
          throw new Error("Föremålet hittades inte");
        }
        return item;
      }),

    deleteItem: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteItem(ctx.user.id, input.itemId);
      }),
  }),

  payments: router({
    createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
      if (!stripe) {
        throw new Error("Stripe är inte konfigurerat. Kontakta support.");
      }
      const creditsAmount = 5;
      const amountInCents = 4900; // 49 SEK in öre

      // Determine the frontend URL from the request origin
      const origin = ctx.req.headers.origin || ctx.req.headers.referer?.replace(/\/[^/]*$/, '') || process.env.FRONTEND_URL || "https://prylkollen.manus.space";

      // Create Stripe Checkout Session first to get the session ID
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "sek" as const,
              product_data: {
                name: "PrylKollen Pro - 5 analyser",
                description: "5 AI-analyser av dina ägodelar",
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/buy-credits?payment=cancelled`,
        metadata: {
          userId: ctx.user.id.toString(),
          creditsAmount: creditsAmount.toString(),
        },
      });

      // Create transaction record with the actual Stripe session ID
      await db.createTransaction(ctx.user.id, {
        stripeSessionId: session.id,
        amount: "49",
        creditsAdded: creditsAmount,
      });

      return {
        url: session.url,
        sessionId: session.id,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
