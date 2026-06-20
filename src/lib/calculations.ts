import { Account, AccountBalance, JournalEntry, TrialBalanceRow } from '@/types/gl';
import { accounts, findAccount } from '@/data/accounts';

export function computeBalances(entries: JournalEntry[]): AccountBalance[] {
  const posted = entries.filter(e => e.status === 'posted');
  const map = new Map<string, { debit: number; credit: number }>();

  for (const entry of posted) {
    for (const item of entry.items) {
      const cur = map.get(item.accountCode) ?? { debit: 0, credit: 0 };
      if (item.side === 'debit') cur.debit += item.amount;
      else cur.credit += item.amount;
      map.set(item.accountCode, cur);
    }
  }

  return accounts
    .filter(a => map.has(a.code))
    .map(a => {
      const { debit, credit } = map.get(a.code)!;
      const balance = a.normalBalance === 'debit' ? debit - credit : credit - debit;
      return {
        accountCode: a.code,
        accountName: a.name,
        accountType: a.type,
        normalBalance: a.normalBalance,
        group: a.group,
        debitTotal: debit,
        creditTotal: credit,
        balance,
      };
    });
}

export function computeTrialBalance(entries: JournalEntry[]): TrialBalanceRow[] {
  const posted = entries.filter(e => e.status === 'posted');

  // Period 1 entries are opening balances for this fiscal year
  const openingEntries = posted.filter(e => e.fiscalPeriod === 1 && e.documentNumber === '0000000001');
  const periodEntries = posted.filter(e => e.documentNumber !== '0000000001');

  function sumByAccount(es: JournalEntry[]) {
    const m = new Map<string, { debit: number; credit: number }>();
    for (const e of es) {
      for (const item of e.items) {
        const cur = m.get(item.accountCode) ?? { debit: 0, credit: 0 };
        if (item.side === 'debit') cur.debit += item.amount;
        else cur.credit += item.amount;
        m.set(item.accountCode, cur);
      }
    }
    return m;
  }

  const openingMap = sumByAccount(openingEntries);
  const periodMap = sumByAccount(periodEntries);

  const allCodes = new Set([...openingMap.keys(), ...periodMap.keys()]);

  return [...allCodes]
    .map(code => {
      const account = findAccount(code);
      if (!account) return null;

      const opening = openingMap.get(code) ?? { debit: 0, credit: 0 };
      const period = periodMap.get(code) ?? { debit: 0, credit: 0 };

      const closingDebit = opening.debit + period.debit;
      const closingCredit = opening.credit + period.credit;

      return {
        accountCode: code,
        accountName: account.name,
        accountType: account.type,
        normalBalance: account.normalBalance,
        group: account.group,
        debitTotal: closingDebit,
        creditTotal: closingCredit,
        balance: account.normalBalance === 'debit' ? closingDebit - closingCredit : closingCredit - closingDebit,
        openingDebit: opening.debit,
        openingCredit: opening.credit,
        periodDebit: period.debit,
        periodCredit: period.credit,
        closingDebit,
        closingCredit,
      } as TrialBalanceRow;
    })
    .filter((r): r is TrialBalanceRow => r !== null)
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('ja-JP');
}

export function getNetIncome(balances: AccountBalance[]): number {
  const revenue = balances
    .filter(b => b.accountType === 'revenue')
    .reduce((s, b) => s + b.balance, 0);
  const expense = balances
    .filter(b => b.accountType === 'expense')
    .reduce((s, b) => s + b.balance, 0);
  return revenue - expense;
}

export function getTotalAssets(balances: AccountBalance[]): number {
  return balances
    .filter(b => b.accountType === 'asset')
    .reduce((s, b) => s + b.balance, 0);
}

export function getNextDocumentNumber(entries: JournalEntry[]): string {
  const max = entries.reduce((m, e) => {
    const n = parseInt(e.documentNumber, 10);
    return n > m ? n : m;
  }, 0);
  return String(max + 1).padStart(10, '0');
}
