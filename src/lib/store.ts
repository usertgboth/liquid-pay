/**
 * Server-side in-memory store for user balances and transactions.
 * In production, replace with a real database (PostgreSQL, Redis, etc.).
 * This store persists for the lifetime of the server process.
 */

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "send" | "receive";
  amount: number;
  status: "pending" | "completed" | "failed" | "expired";
  createdAt: number;
  completedAt?: number;
  memo?: string;
  paymentRef?: string;
}

export interface UserAccount {
  id: string;
  balance: number;
  createdAt: number;
  transactions: Transaction[];
}

export interface DepositInvoice {
  id: string;
  userId: string;
  amount: number;
  status: "pending" | "completed" | "expired";
  createdAt: number;
  expiresAt: number;
  paymentAddress: string;
  paymentRef: string;
}

const users = new Map<string, UserAccount>();
const invoices = new Map<string, DepositInvoice>();

function generateId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function generatePaymentAddress(): string {
  const prefix = "LP";
  const chars = "0123456789abcdef";
  let addr = prefix;
  for (let i = 0; i < 32; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

export function getOrCreateUser(userId: string): UserAccount {
  let user = users.get(userId);
  if (!user) {
    user = {
      id: userId,
      balance: 0,
      createdAt: Date.now(),
      transactions: [],
    };
    users.set(userId, user);
  }
  return user;
}

export function getUserBalance(userId: string): number {
  const user = users.get(userId);
  return user?.balance ?? 0;
}

export function getUserTransactions(userId: string): Transaction[] {
  const user = users.get(userId);
  return user?.transactions ?? [];
}

export function createInvoice(userId: string, amount: number): DepositInvoice {
  getOrCreateUser(userId);

  const invoice: DepositInvoice = {
    id: `INV-${generateId()}`,
    userId,
    amount,
    status: "pending",
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000,
    paymentAddress: generatePaymentAddress(),
    paymentRef: `REF-${generateId()}`,
  };

  invoices.set(invoice.id, invoice);
  return invoice;
}

export function confirmInvoice(invoiceId: string): {
  success: boolean;
  error?: string;
  invoice?: DepositInvoice;
} {
  const invoice = invoices.get(invoiceId);
  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }
  if (invoice.status === "completed") {
    return { success: false, error: "Invoice already completed" };
  }
  if (invoice.status === "expired" || Date.now() > invoice.expiresAt) {
    invoice.status = "expired";
    return { success: false, error: "Invoice expired" };
  }

  const user = getOrCreateUser(invoice.userId);
  user.balance += invoice.amount;
  invoice.status = "completed";

  const tx: Transaction = {
    id: `TX-${generateId()}`,
    userId: invoice.userId,
    type: "deposit",
    amount: invoice.amount,
    status: "completed",
    createdAt: invoice.createdAt,
    completedAt: Date.now(),
    memo: `Deposit via LiquidPay`,
    paymentRef: invoice.paymentRef,
  };
  user.transactions.unshift(tx);

  return { success: true, invoice };
}

export function getInvoice(invoiceId: string): DepositInvoice | undefined {
  return invoices.get(invoiceId);
}

export function getUserCount(): number {
  return users.size;
}
