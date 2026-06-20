import { Account } from '@/types/gl';

export const accounts: Account[] = [
  // 資産 (Assets)
  { code: '1000', name: '現金', type: 'asset', normalBalance: 'debit', group: '流動資産', isActive: true },
  { code: '1100', name: '普通預金', type: 'asset', normalBalance: 'debit', group: '流動資産', isActive: true },
  { code: '1110', name: '定期預金', type: 'asset', normalBalance: 'debit', group: '流動資産', isActive: true },
  { code: '1200', name: '売掛金', type: 'asset', normalBalance: 'debit', group: '流動資産', isActive: true },
  { code: '1210', name: '貸倒引当金', type: 'asset', normalBalance: 'credit', group: '流動資産', isActive: true },
  { code: '1300', name: '商品', type: 'asset', normalBalance: 'debit', group: '流動資産', isActive: true },
  { code: '1400', name: '前払費用', type: 'asset', normalBalance: 'debit', group: '流動資産', isActive: true },
  { code: '1500', name: '建物', type: 'asset', normalBalance: 'debit', group: '固定資産', isActive: true },
  { code: '1510', name: '建物減価償却累計額', type: 'asset', normalBalance: 'credit', group: '固定資産', isActive: true },
  { code: '1600', name: '備品', type: 'asset', normalBalance: 'debit', group: '固定資産', isActive: true },
  { code: '1610', name: '備品減価償却累計額', type: 'asset', normalBalance: 'credit', group: '固定資産', isActive: true },
  { code: '1700', name: 'ソフトウェア', type: 'asset', normalBalance: 'debit', group: '無形固定資産', isActive: true },

  // 負債 (Liabilities)
  { code: '2000', name: '買掛金', type: 'liability', normalBalance: 'credit', group: '流動負債', isActive: true },
  { code: '2100', name: '短期借入金', type: 'liability', normalBalance: 'credit', group: '流動負債', isActive: true },
  { code: '2200', name: '未払費用', type: 'liability', normalBalance: 'credit', group: '流動負債', isActive: true },
  { code: '2300', name: '未払消費税', type: 'liability', normalBalance: 'credit', group: '流動負債', isActive: true },
  { code: '2400', name: '前受金', type: 'liability', normalBalance: 'credit', group: '流動負債', isActive: true },
  { code: '2500', name: '長期借入金', type: 'liability', normalBalance: 'credit', group: '固定負債', isActive: true },

  // 純資産 (Equity)
  { code: '3000', name: '資本金', type: 'equity', normalBalance: 'credit', group: '株主資本', isActive: true },
  { code: '3100', name: '資本剰余金', type: 'equity', normalBalance: 'credit', group: '株主資本', isActive: true },
  { code: '3200', name: '利益剰余金', type: 'equity', normalBalance: 'credit', group: '株主資本', isActive: true },

  // 収益 (Revenue)
  { code: '4000', name: '売上高', type: 'revenue', normalBalance: 'credit', group: '売上', isActive: true },
  { code: '4100', name: '受取利息', type: 'revenue', normalBalance: 'credit', group: '営業外収益', isActive: true },
  { code: '4200', name: '受取配当金', type: 'revenue', normalBalance: 'credit', group: '営業外収益', isActive: true },
  { code: '4300', name: '雑収入', type: 'revenue', normalBalance: 'credit', group: '特別利益', isActive: true },

  // 費用 (Expenses)
  { code: '5000', name: '売上原価', type: 'expense', normalBalance: 'debit', group: '売上原価', isActive: true },
  { code: '5100', name: '給料手当', type: 'expense', normalBalance: 'debit', group: '販売費及び一般管理費', isActive: true },
  { code: '5110', name: '役員報酬', type: 'expense', normalBalance: 'debit', group: '販売費及び一般管理費', isActive: true },
  { code: '5200', name: '地代家賃', type: 'expense', normalBalance: 'debit', group: '販売費及び一般管理費', isActive: true },
  { code: '5300', name: '水道光熱費', type: 'expense', normalBalance: 'debit', group: '販売費及び一般管理費', isActive: true },
  { code: '5400', name: '通信費', type: 'expense', normalBalance: 'debit', group: '販売費及び一般管理費', isActive: true },
  { code: '5500', name: '旅費交通費', type: 'expense', normalBalance: 'debit', group: '販売費及び一般管理費', isActive: true },
  { code: '5600', name: '消耗品費', type: 'expense', normalBalance: 'debit', group: '販売費及び一般管理費', isActive: true },
  { code: '5700', name: '広告宣伝費', type: 'expense', normalBalance: 'debit', group: '販売費及び一般管理費', isActive: true },
  { code: '5800', name: '減価償却費', type: 'expense', normalBalance: 'debit', group: '販売費及び一般管理費', isActive: true },
  { code: '5900', name: '支払利息', type: 'expense', normalBalance: 'debit', group: '営業外費用', isActive: true },
  { code: '6000', name: '法人税等', type: 'expense', normalBalance: 'debit', group: '税金', isActive: true },
];

export function findAccount(code: string): Account | undefined {
  return accounts.find(a => a.code === code);
}
