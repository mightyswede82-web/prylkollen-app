import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, credits, items, transactions, type Credit, type Item, type Transaction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== CREDITS ==========

export async function getOrCreateCredits(userId: number): Promise<Credit> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(credits).where(eq(credits.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }

  await db.insert(credits).values({
    userId,
    balance: 5, // Start with 5 free credits
  });

  const result = await db.select().from(credits).where(eq(credits.userId, userId)).limit(1);
  return result[0];
}

export async function getCredits(userId: number): Promise<Credit | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(credits).where(eq(credits.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function addCredits(userId: number, amount: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getCredits(userId);
  if (!existing) {
    await db.insert(credits).values({
      userId,
      balance: amount,
    });
  } else {
    await db.update(credits)
      .set({ balance: existing.balance + amount })
      .where(eq(credits.userId, userId));
  }
}

export async function deductCredit(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getCredits(userId);
  if (!existing || existing.balance <= 0) {
    return false;
  }

  await db.update(credits)
    .set({ balance: existing.balance - 1 })
    .where(eq(credits.userId, userId));

  return true;
}

// ========== ITEMS ==========

export async function createItem(userId: number, data: {
  name: string;
  description?: string;
  estimatedValue?: string;
  imageUrl?: string;
  imageKey?: string;
}): Promise<Item> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(items).values({
    userId,
    ...data,
  });

  const itemId = result[0].insertId;
  const created = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
  return created[0];
}

export async function getItems(userId: number): Promise<Item[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(items).where(eq(items.userId, userId));
}

export async function deleteItem(itemId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(items).where(
    and(eq(items.id, itemId), eq(items.userId, userId))
  );
}

// ========== TRANSACTIONS ==========

export async function createTransaction(userId: number, data: {
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amount: string;
  creditsAdded: number;
}): Promise<Transaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(transactions).values({
    userId,
    status: "pending",
    currency: "SEK",
    ...data,
  });

  const txId = result[0].insertId;
  const created = await db.select().from(transactions).where(eq(transactions.id, txId)).limit(1);
  return created[0];
}

export async function getTransaction(stripeSessionId: string): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(transactions)
    .where(eq(transactions.stripeSessionId, stripeSessionId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateTransactionStatus(stripeSessionId: string, status: "pending" | "completed" | "failed"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(transactions)
    .set({ status })
    .where(eq(transactions.stripeSessionId, stripeSessionId));
}
