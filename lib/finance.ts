import fs from 'fs/promises';
import path from 'path';

export type FinanceEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  concept: string;
  channel?: 'mercadopago'|'stripe'|'paypal'|'cash'|'transfer'|'other';
  kind: 'income'|'expense';
  amount: number; // positive value
  fees?: number;
  tax?: number;
  orderId?: string;
  notes?: string;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const FINANCE_FILE = path.join(DATA_DIR, 'finance.json');

async function ensure() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
  try { await fs.stat(FINANCE_FILE); } catch {
    await fs.writeFile(FINANCE_FILE, JSON.stringify({ entries: [] }, null, 2), 'utf-8');
  }
}

export async function getFinance() {
  await ensure();
  const data = JSON.parse(await fs.readFile(FINANCE_FILE, 'utf-8'));
  const entries: FinanceEntry[] = data.entries || [];
  const totals = entries.reduce((acc, e) => {
    const gross = e.kind === 'income' ? e.amount : -e.amount;
    const fees = Number(e.fees||0) * (e.kind === 'income' ? -1 : 1); // fees reduce net for income; increase net for expense
    const tax = Number(e.tax||0) * (e.kind === 'income' ? -1 : 1);   // tax reduces net for income; increases for expense (if storing paid tax)
    acc.gross += gross;
    acc.fees += fees;
    acc.tax += tax;
    acc.net = acc.gross + acc.fees + acc.tax;
    return acc;
  }, { gross: 0, fees: 0, tax: 0, net: 0 });
  return { entries, totals };
}

export async function upsertFinance(entry: FinanceEntry) {
  await ensure();
  const data = JSON.parse(await fs.readFile(FINANCE_FILE, 'utf-8'));
  data.entries = data.entries || [];
  const idx = data.entries.findIndex((e: FinanceEntry) => e.id === entry.id);
  if (idx >= 0) data.entries[idx] = { ...data.entries[idx], ...entry };
  else data.entries.push(entry);
  await fs.writeFile(FINANCE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  return entry;
}

export async function deleteFinance(id: string) {
  await ensure();
  const data = JSON.parse(await fs.readFile(FINANCE_FILE, 'utf-8'));
  data.entries = (data.entries || []).filter((e: FinanceEntry) => e.id !== id);
  await fs.writeFile(FINANCE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
