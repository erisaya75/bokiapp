export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type NormalBalance = 'debit' | 'credit';
export type JournalStatus = 'posted' | 'parked' | 'reversed';
export type DocumentType = 'SA' | 'KR' | 'DR' | 'AA' | 'ZP';
export type Side = 'debit' | 'credit';

export interface Account {
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  group: string;
  isActive: boolean;
}

export interface JournalLineItem {
  lineNo: number;
  accountCode: string;
  side: Side;
  amount: number;
  text: string;
}

export interface JournalEntry {
  id: string;
  documentNumber: string;
  postingDate: string;
  documentDate: string;
  type: DocumentType;
  companyCode: string;
  fiscalYear: number;
  fiscalPeriod: number;
  description: string;
  reference: string;
  items: JournalLineItem[];
  status: JournalStatus;
  createdBy: string;
  createdAt: string;
}

export interface AccountBalance {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: NormalBalance;
  group: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

export interface TrialBalanceRow extends AccountBalance {
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  SA: '一般伝票',
  KR: '仕入先請求書',
  DR: '得意先請求書',
  AA: '資産伝票',
  ZP: '支払伝票',
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: '資産',
  liability: '負債',
  equity: '純資産',
  revenue: '収益',
  expense: '費用',
};
