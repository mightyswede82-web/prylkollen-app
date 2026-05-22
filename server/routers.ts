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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-04-22.dahlia",
});

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
                content: "Du är en expert på att identifiera och värdera föremål. Analysera bilden och ge namn, beskrivning och värderingsuppskattning i svenska kronor. Svara ENDAST i JSON-format med fälten: name (string), description (string), estimatedValue (number i SEK). Ingen annan text.",
              },
              {
                role: "user",
                content: `Analysera denna bild av en sak. Bild URL: ${imageUrl}. Ge namn, beskrivning och värdering i JSON-format.`,
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
                    description: { type: "string", description: "Beskrivning av föremålet" },
                    estimatedValue: { type: "number", description: "Värdering i SEK" },
                  },
                  required: ["name", "description", "estimatedValue"],
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

          // Create item in database
          const item = await db.createItem(ctx.user.id, {
            name: analysis.name,
            description: analysis.description,
            estimatedValue: analysis.estimatedValue.toString(),
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

    deleteItem: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteItem(ctx.user.id, input.itemId);
      }),
  }),

  payments: router({
    createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
      const creditsAmount = 5;
      const amountInCents = 4900; // 49 SEK in cents

      // Create transaction record
      const transaction = await db.createTransaction(ctx.user.id, {
        stripeSessionId: "pending",
        amount: "49",
        creditsAdded: creditsAmount,
      });

      // Create Stripe Checkout Session
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
        success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/inventory?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/buy-credits`,
        metadata: {
          userId: ctx.user.id.toString(),
          creditsAmount: creditsAmount.toString(),
          transactionId: transaction.id?.toString() || "",
        },
      });

      // Update transaction with session ID
      if (session.id) {
        await db.updateTransactionStatus(session.id, "pending");
      }

      return {
        url: session.url,
        sessionId: session.id,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
