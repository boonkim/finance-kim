import type { IAccount } from '@/models/Account';

export interface CreditCardOption {
  account: IAccount;
  /** จำนวนวันจนถึงวันตัดรอบครั้งถัดไป (ใช้บัตรวันนี้จะเข้า cycle นี้) */
  daysUntilNextClosing: number;
  /** วันตัดรอบครั้งถัดไป (ประมาณ) */
  nextClosingDate: Date;
  /** ชำระภายในประมาณกี่วันจากวันนี้ */
  daysUntilPaymentDue: number;
}

/**
 * คำนวณวันตัดรอบครั้งถัดไปจากวันในเดือน (1-31)
 */
function getNextClosingDate(dayOfMonth: number, fromDate: Date): Date {
  const year = fromDate.getFullYear();
  const month = fromDate.getMonth();
  const date = fromDate.getDate();
  if (date < dayOfMonth) {
    return new Date(year, month, Math.min(dayOfMonth, new Date(year, month + 1, 0).getDate()));
  }
  const nextMonth = new Date(year, month + 1, 1);
  return new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth(),
    Math.min(dayOfMonth, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate())
  );
}

/**
 * เลือกบัตรเครดิตที่คุ้มค่าที่สุดในวันนี้
 * พิจารณาจากวันตัดรอบ: บัตรที่ "วันตัดรอบครั้งถัดไป" ห่างจากวันนี้มากที่สุด = ได้ระยะเวลาชำระเงินนานที่สุด
 */
export function getBestCreditCard(
  creditCardAccounts: IAccount[],
  atDate: Date = new Date()
): CreditCardOption | null {
  const valid = creditCardAccounts.filter(
    (a) =>
      a.type === 'credit_card' &&
      a.statementClosingDay != null &&
      a.statementClosingDay >= 1 &&
      a.statementClosingDay <= 31
  );
  if (valid.length === 0) return null;

  const options: CreditCardOption[] = valid.map((account) => {
    const closingDay = account.statementClosingDay ?? 1;
    const nextClosing = getNextClosingDate(closingDay, atDate);
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysUntilNextClosing = Math.round((nextClosing.getTime() - atDate.getTime()) / msPerDay);
    const offsetDays = account.paymentDueOffsetDays ?? 10;
    const paymentDueDate = new Date(nextClosing);
    paymentDueDate.setDate(paymentDueDate.getDate() + offsetDays);
    const daysUntilPaymentDue = Math.round(
      (paymentDueDate.getTime() - atDate.getTime()) / msPerDay
    );

    return {
      account,
      daysUntilNextClosing,
      nextClosingDate: nextClosing,
      daysUntilPaymentDue,
    };
  });

  // บัตรที่ควรใช้ = ชำระเงินได้นานที่สุด (daysUntilPaymentDue สูงสุด)
  options.sort((a, b) => b.daysUntilPaymentDue - a.daysUntilPaymentDue);
  return options[0] ?? null;
}
