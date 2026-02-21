/**
 * ข้อมูลธนาคารในไทย จาก https://github.com/casperstack/thai-banks-logo
 */
import { bankLists as bankListsFromPackage } from 'thai-banks-logo';

type BankEntry = { name: string; nameLong?: string; fullname?: string; symbol: string; icon: string; color?: string };

const bankListsRaw = bankListsFromPackage as Record<string, BankEntry>;

export interface ThaiBankInfo {
  name: string;
  fullname: string;
  symbol: string;
  icon: string;
  color?: string;
}

const bankLists = (bankListsRaw ?? {}) as Record<string, BankEntry>;

const list: ThaiBankInfo[] = Object.entries(bankLists).map(([sym, b]) => ({
  name: b.name,
  fullname: b.fullname ?? b.nameLong ?? b.name,
  symbol: b.symbol ?? sym,
  icon: b.icon,
  color: b.color,
}));

/** รายชื่อธนาคารทั้งหมด (เรียงตามชื่อไทย) */
export const thaiBanksList: ThaiBankInfo[] = [...list].sort((a, b) =>
  a.name.localeCompare(b.name, 'th')
);

/** หาธนาคารจาก symbol (เช่น KBANK, SCB) */
export function getBankBySymbol(symbol: string | null | undefined): ThaiBankInfo | null {
  if (!symbol || typeof symbol !== 'string') return null;
  const key = symbol.trim();
  const b = bankLists[key];
  if (!b) return null;
  return {
    name: b.name,
    fullname: b.fullname ?? b.nameLong ?? b.name,
    symbol: b.symbol ?? key,
    icon: b.icon,
    color: b.color,
  };
}

/** สัญลักษณ์ที่ใช้ได้ทั้งหมด */
export const bankSymbols = Object.keys(bankLists) as string[];
